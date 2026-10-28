import { webcrypto } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, posix, resolve } from 'node:path';
import { renderAnalytics } from '../js/analytics-render.mjs';
import { readAnalytics } from './analytics-config.mjs';
import { renderNewsletter } from '../js/newsletter-render.mjs';
import { readNewsletter } from './newsletter-config.mjs';

export const GATE_FILES = Object.freeze([
  'css/access.css', 'js/access.js',
  'assets/logos/logo-full-white.png', 'assets/logos/skull-icon-orange.png',
  'assets/fonts/Pragmatica-Light.ttf', 'assets/fonts/VoskaRound.otf',
  'images/favicon-32.png',
  'js/analytics.js', 'css/stats.css', 'admin/estadisticas/index.html',
  'css/maraton.css', 'js/maraton.js',
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
export async function makeSelfContained(root) {
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
  let html = (await safeRead(root, 'index.html')).toString('utf8');
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
  html = await replaceAsync(html, /<script\b([^>]*\bsrc=["']([^"']+)["'][^>]*)>\s*<\/script>/gi, async (_, attrs, src) => {
    if (/\btype=["']module["']/i.test(attrs) || external(src)) throw new Error('Only bundled classic scripts are supported in preview');
    const script = (await safeRead(root, assetPath(src))).toString('utf8');
    return `<script>${script.replace(/<\/script/gi, '<\\/script')}</script>`;
  });
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

export async function preparePrivatePages(sourceRoot, { password, siteUrl = 'https://losinsurgentes.mx/' } = {}) {
  const root = resolve(sourceRoot);
  const output = join(root, '_site');
  // Clear all former public assets, including obsolete photos and admin files.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const base = new URL(siteUrl).pathname.replace(/\/?$/, '/');
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(base)) throw new Error('Invalid preview base path');
  const gate = (await safeRead(root, 'templates/access.html')).toString('utf8')
    .replaceAll('{{BASE}}', base)
    .replaceAll('{{TELEMETRY}}', '');
  const landing = (await safeRead(root, 'templates/maraton.html')).toString('utf8')
    .replaceAll('{{BASE}}', base)
    .replaceAll('{{TELEMETRY}}', renderAnalytics(await readAnalytics(root), 'site'))
    .replaceAll('{{NEWSLETTER}}', renderNewsletter(await readNewsletter(root)));
  for (const path of GATE_FILES) {
    // Read first to refuse symlinks and nested traversal before copying.
    await safeRead(root, path);
    const target = join(output, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(root, path), target);
  }
  await mkdir(join(output, 'banda'), { recursive: true });
  await writeFile(join(output, 'banda/index.html'), gate);
  await writeFile(join(output, 'index.html'), landing);
  await writeFile(join(output, '404.html'), landing);
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  if (password) {
    const envelope = await encryptPreview(await makeSelfContained(root), password);
    const payload = JSON.stringify(envelope);
    if (Buffer.byteLength(payload) > 80 * 1024 * 1024) throw new Error('Encrypted preview exceeds 80 MiB');
    await writeFile(join(output, 'preview.json'), payload);
  }
  return output;
}
