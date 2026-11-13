import { webcrypto } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, posix, resolve } from 'node:path';
import { renderNewsletter } from '../js/newsletter-render.mjs';
import { readNewsletter } from './newsletter-config.mjs';
import { renderAnalytics } from '../js/analytics-render.mjs';
import { readAnalytics } from './analytics-config.mjs';

export const GATE_FILES = Object.freeze([
  'css/access.css', 'js/access.js',
  'assets/logos/logo-full-white.png', 'assets/logos/skull-icon-orange.png',
  'assets/fonts/Pragmatica-Light.ttf', 'assets/fonts/VoskaRound.otf',
  'images/favicon-32.png',
  'js/analytics.js', 'css/stats.css', 'admin/estadisticas/index.html',
]);
// Public signup assets; bundled instead when explicitly preparing both gates.
export const MARATON_FILES = Object.freeze([
  'css/maraton.css', 'js/maraton.js',
  'assets/maraton/maraton-full-rust.png',
  'assets/maraton/maraton-wordmark-paper.png',
  'assets/maraton/insurgentes-oval-ink.png',
  'assets/maraton/maraton-stamp-rust.png',
]);
// These files are bundled only inside the protected band document.
export const BAND_PREVIEW_FILES = Object.freeze([
  'templates/band-intro.html', 'css/band-intro.css', 'js/band-intro.js',
  'assets/maraton/door-skull-orange.png', 'assets/maraton/door-skull-white.png',
  'assets/maraton/door-stamp-orange.png', 'assets/maraton/door-stamp-paper.png',
]);
const iterations = 600000;
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const external = value => /^(?:https:|data:|#)/i.test(value);

async function safeRead(root, path) {
  if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) {
    throw new Error('Unsafe preview asset path');
  }
  let target = resolve(root);
  for (const part of path.split('/')) {
    target = join(target, part);
    if ((await lstat(target)).isSymbolicLink()) throw new Error('Preview assets must not contain symbolic links');
  }
  return readFile(target);
}

async function replaceAsync(text, pattern, transform) {
  const replacements = await Promise.all([...text.matchAll(pattern)].map(match => transform(...match)));
  let index = 0;
  return text.replace(pattern, () => replacements[index++]);
}

// The preview has no plaintext asset URLs: everything needed for the page is
// inside the authenticated ciphertext, including full-size gallery images.
export async function makeSelfContained(root, sourceHtml) {
  const cache = new Map();
  const assetPath = (value, from = 'index.html') => {
    if (/^[a-z][\w+.-]*:|^\/\/|[%\\\0]/i.test(value)) throw new Error('Unsafe preview asset URL');
    const path = posix.normalize(posix.join(posix.dirname(from), value.split(/[?#]/)[0]));
    if (!/^(?:assets|images|css|js|content\/photos)\//.test(path)) throw new Error('Preview asset outside allowed directories');
    return path;
  };
  const dataURL = async (value, from) => {
    if (external(value)) return value;
    const path = assetPath(value, from);
    if (!types[extname(path)]) throw new Error('Unsupported preview asset type');
    if (!cache.has(path)) cache.set(path, safeRead(root, path).then(bytes => `data:${types[extname(path)]};base64,${bytes.toString('base64')}`));
    return cache.get(path);
  };
  const inlineURLs = (css, from) => replaceAsync(css, /url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\)]*))\s*\)/g, async (_, a, b, c) => {
    const value = (await dataURL((a ?? b ?? c).trim(), from)).replace(/'/g, '%27').replace(/"/g, '%22');
    return `url('${value}')`;
  });
  let html = sourceHtml === undefined ? (await safeRead(root, 'index.html')).toString('utf8') : sourceHtml;
  if (typeof html !== 'string') throw new Error('Preview content must be HTML text');
  // Protected documents never include a tracker, even when the public landing
  // has opted into analytics. Remove the bootstrap before bundling its script.
  html = html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (tag, attrs) =>
    /\bid=["']analytics-config["']/i.test(attrs) || /\bsrc=["'](?:\.\/)?js\/analytics\.js["']/i.test(attrs) ? '' : tag);
  html = await replaceAsync(html, /<link\b[^>]*>/gi, async tag => {
    const href = /\bhref=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || external(href)) return tag;
    if (/\brel=["']stylesheet["']/i.test(tag)) {
      const path = assetPath(href);
      const css = await inlineURLs((await safeRead(root, path)).toString('utf8'), path);
      return `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
    }
    if (/\brel=["'](?:icon|apple-touch-icon)["']/i.test(tag)) return tag.replace(href, await dataURL(href));
    throw new Error('Unbundled local link in preview');
  });
  // Full-size sources remain available; avoid comma-separated data URLs being
  // interpreted as multiple srcset candidates by the gallery thumbnail parser.
  html = html.replace(/\s+srcset=(?:"[^"]*"|'[^']*')/gi, '');
  html = await replaceAsync(html, /<(?:img|source|video)\b[^>]*>/gi, async tag => replaceAsync(tag, /\b(src|poster)=(["'])(.*?)\2/gi, async (_, attr, quote, value) => `${attr}=${quote}${await dataURL(value)}${quote}`));
  html = await inlineURLs(html, 'index.html');
  const deferredScripts = [];
  html = await replaceAsync(html, /<script\b([^>]*\bsrc=["']([^"']+)["'][^>]*)>\s*<\/script>/gi, async (_, attrs, src) => {
    if (/\btype=["']module["']/i.test(attrs) || external(src)) throw new Error('Only bundled classic scripts are supported in preview');
    // Inline scripts do not honor defer. Reserve their position before reading
    // files concurrently, then run them after the body in original source order.
    const deferred = /\sdefer(?:\s|=|$)/i.test(attrs);
    const slot = deferred ? deferredScripts.push('') - 1 : -1;
    const script = (await safeRead(root, assetPath(src))).toString('utf8');
    const inline = `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>`;
    if (deferred) {
      deferredScripts[slot] = inline;
      return '';
    }
    return inline;
  });
  if (deferredScripts.length) {
    const scripts = deferredScripts.join('\n');
    html = /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, closing => `${scripts}\n${closing}`) : `${html}\n${scripts}`;
  }
  html = html.replace(/<html\b/i, '<html data-private-preview="true"')
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '')
    .replace('</head>', '<meta name="robots" content="noindex,nofollow,noarchive"></head>')
    .replace('</body>', '<button type="button" id="previewLock" style="position:fixed;bottom:16px;right:16px;z-index:99999;padding:10px 16px;border:1px solid #f86927;border-radius:4px;background:#111;color:#dcd9d0;font:14px system-ui;cursor:pointer">Cerrar vista previa</button><script>document.getElementById("previewLock").addEventListener("click",()=>location.reload());addEventListener("pageshow",event=>{if(event.persisted)location.reload()});</script></body>');
  return html;
}

export async function encryptPreview(html, password) {
  if (typeof password !== 'string' || !password.length) throw new Error('A preview password is required');
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html));
  const base64 = value => Buffer.from(value).toString('base64');
  return { version: 1, iterations, salt: base64(salt), iv: base64(iv), ciphertext: base64(ciphertext) };
}

export async function makeBandPreview(root, { base = '/' } = {}) {
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(base)) throw new Error('Invalid band preview base path');
  const source = (await safeRead(root, 'index.html')).toString('utf8');
  const intro = (await safeRead(root, 'templates/band-intro.html')).toString('utf8')
    .replaceAll('{{REGISTRATION_URL}}', base);
  const document = source
    .replace('</head>', '<link rel="stylesheet" href="css/band-intro.css">\n</head>')
    .replace(/<body\b[^>]*>/i, opening => `${opening}\n${intro}\n<div id="band-site" hidden inert>`)
    .replace('</body>', '</div>\n<script src="js/band-intro.js" defer></script>\n</body>');
  return makeSelfContained(root, document);
}

async function preparePreviewPages(sourceRoot, { password, siteUrl = 'https://losinsurgentes.mx/', publicLanding = false } = {}) {
  const root = resolve(sourceRoot);
  const output = join(root, '_site');
  // Clear all former public assets, including obsolete photos and admin files.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const canonical = new URL(siteUrl);
  if (canonical.protocol !== 'https:' || canonical.username || canonical.password || canonical.port) throw new Error('Invalid public site URL');
  canonical.search = ''; canonical.hash = '';
  const base = canonical.pathname.replace(/\/?$/, '/');
  canonical.pathname = base;
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(base)) throw new Error('Invalid preview base path');
  const gateTemplate = (await safeRead(root, 'templates/access.html')).toString('utf8');
  const gate = (payload, title, backUrl, backLabel) => gateTemplate
    .replaceAll('{{BASE}}', base).replaceAll('{{TELEMETRY}}', '')
    .replaceAll('{{PREVIEW}}', payload).replaceAll('{{ACCESS_TITLE}}', title)
    .replaceAll('{{BACK_URL}}', backUrl).replaceAll('{{BACK_LABEL}}', backLabel);
  const signupGate = gate('maraton-preview.json', 'Acceso a Maratón', 'banda/', 'Acceso de la banda ↗');
  const bandGate = gate('preview.json', 'Acceso de la banda', './', 'Volver al registro ↗');
  for (const path of [...GATE_FILES, ...(publicLanding ? MARATON_FILES : [])]) {
    // Read first to refuse symlinks and nested traversal before copying.
    await safeRead(root, path);
    const target = join(output, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(root, path), target);
  }
  await mkdir(join(output, 'banda'), { recursive: true });
  await writeFile(join(output, 'banda/index.html'), bandGate);
  await writeFile(join(output, '.nojekyll'), '');
  let landing;
  if (publicLanding || password) {
    landing = (await safeRead(root, 'templates/maraton.html')).toString('utf8')
      .replaceAll('{{BASE}}', base)
      .replaceAll('{{TELEMETRY}}', publicLanding ? renderAnalytics(await readAnalytics(root)) : '')
      .replaceAll('{{NEWSLETTER}}', renderNewsletter(await readNewsletter(root)));
  }
  if (publicLanding) {
    const publicHtml = landing.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '')
      .replace('</head>', `<link rel="canonical" href="${canonical.href}">\n</head>`);
    const notFound = (await safeRead(root, 'templates/404.html')).toString('utf8').replaceAll('{{BASE}}', base);
    await writeFile(join(output, 'index.html'), publicHtml);
    await writeFile(join(output, '404.html'), notFound);
    await writeFile(join(output, 'robots.txt'), `User-agent: *\nDisallow: ${base}banda/\nDisallow: ${base}admin/\nDisallow: ${base}preview.json\n`);
  } else {
    await writeFile(join(output, 'index.html'), signupGate);
    await writeFile(join(output, '404.html'), signupGate);
    await writeFile(join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  }
  if (password) {
    const documents = [['preview.json', await makeBandPreview(root, { base })]];
    if (!publicLanding) documents.push(['maraton-preview.json', await makeSelfContained(root, landing)]);
    for (const [name, html] of documents) {
      const payload = JSON.stringify(await encryptPreview(html, password));
      if (Buffer.byteLength(payload) > 80 * 1024 * 1024) throw new Error('Encrypted preview exceeds 80 MiB');
      await writeFile(join(output, name), payload);
    }
  }
  return output;
}

// Explicit rollback: both Maratón and the complete band site require a password.
export function preparePrivatePages(sourceRoot, options = {}) {
  return preparePreviewPages(sourceRoot, { ...options, publicLanding: false });
}

// Default publication: signup is public; only the complete band site is gated.
export function prepareLandingPages(sourceRoot, options = {}) {
  return preparePreviewPages(sourceRoot, { ...options, publicLanding: true });
}
