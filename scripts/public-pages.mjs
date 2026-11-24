import { lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix, resolve } from 'node:path';
import { renderNewsletter } from '../js/newsletter-render.mjs';
import { renderAnalytics } from '../js/analytics-render.mjs';
import { readNewsletter } from './newsletter-config.mjs';
import { readAnalytics } from './analytics-config.mjs';

const publicScripts = new Set(['js/main.js', 'js/spotify.js', 'js/maraton.js', 'js/analytics.js']);
const publicStyles = new Set(['css/style.css', 'css/spotify.css', 'css/maraton.css', 'css/landing.css', 'css/stats.css']);
const remote = value => /^(?:https?:|data:|#|\/\/)/i.test(value);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function allowedAsset(path) {
  return publicScripts.has(path) || publicStyles.has(path)
    || /^(?:assets|images)\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|svg|ico|otf|ttf|woff2?)$/i.test(path)
    || /^content\/photos\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp)$/i.test(path);
}

async function safeRead(root, path) {
  if (!path || path.startsWith('/') || /[\\%\0]/.test(path) || path.split('/').some(part => !part || part === '.' || part === '..' || part.startsWith('.'))) throw new Error('Unsafe public file path');
  let target = root;
  for (const part of path.split('/')) {
    target = join(target, part);
    if ((await lstat(target)).isSymbolicLink()) throw new Error('Public files must not contain symbolic links');
  }
  if (!(await lstat(target)).isFile()) throw new Error('A referenced public resource must be a file');
  return readFile(target);
}

function withoutAnalytics(html) {
  return html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (tag, attributes) => {
    const src = /\bsrc=["']([^"']+)["']/i.exec(attributes)?.[1];
    return /\bid=["']analytics-config["']/i.test(attributes) || (src && /(?:^|\/)js\/analytics\.js(?:[?#]|$)/i.test(src)) ? '' : tag;
  });
}

function pageMetadata(html, canonical, image) {
  html = withoutAnalytics(html).replace(/<base\b[^>]*>/gi, '').replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '');
  html = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*(?:property|name)=["'](?:og:url|og:image|twitter:image)["'][^>]*>/gi, '');
  return html.replace(/<\/head>/i, `<link rel="canonical" href="${escape(canonical)}">\n<meta property="og:url" content="${escape(canonical)}">\n<meta property="og:image" content="${escape(image)}">\n<meta name="twitter:image" content="${escape(image)}">\n</head>`);
}

/** Public launch: campaign/signup landing, complete site and signup permalink.
 * Copy only resources referenced by those pages (and their CSS), never trees.
 */
export async function preparePublicPages(sourceRoot, { siteUrl = 'https://losinsurgentes.mx/' } = {}) {
  const root = resolve(sourceRoot);
  const location = new URL(siteUrl);
  if (location.protocol !== 'https:' || location.username || location.password || location.port) throw new Error('Invalid public site URL');
  location.search = ''; location.hash = '';
  location.pathname = location.pathname.replace(/\/?$/, '/');
  const base = location.pathname;
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(base)) throw new Error('Invalid public site base path');
  const output = join(root, '_site');
  const sitePath = `${base}sitio/`, registrationPath = `${base}registro/`;
  const siteCanonical = new URL('sitio/', location).href;
  const registrationCanonical = new URL('registro/', location).href;
  const image = new URL('assets/og-image.jpg', location).href;
  const assets = new Set(['assets/og-image.jpg']);

  function assetReference(value, from) {
    if (remote(value)) return null;
    const clean = value.split(/[?#]/)[0];
    if (!clean || /[%\\\0]/.test(clean)) throw new Error('Unsafe public resource URL');
    let path;
    if (clean.startsWith('/')) {
      if (!clean.startsWith(base)) throw new Error('Public resource outside the site base');
      path = clean.slice(base.length);
    } else path = posix.normalize(posix.join(posix.dirname(from), clean));
    if (!allowedAsset(path)) throw new Error('Referenced resource is outside the public allowlist');
    assets.add(path);
    return `${base}${path}${value.slice(clean.length)}`;
  }

  function rewrite(html, from = 'index.html') {
    html = html.replace(/<(?:script|link|img|source|video)\b[^>]*>/gi, tag => tag.replace(/\b(src|href|poster)=(["'])(.*?)\2/gi, (attribute, name, quote, value) => {
      if (remote(value)) return attribute;
      return `${name}=${quote}${assetReference(value, from)}${quote}`;
    }));
    html = html.replace(/\bsrcset=(["'])(.*?)\1/gi, (attribute, quote, value) => {
      if (/^data:/i.test(value)) return attribute;
      return `srcset=${quote}${value.split(',').map(candidate => {
        const [url, ...size] = candidate.trim().split(/\s+/);
        return [remote(url) ? url : assetReference(url, from), ...size].join(' ');
      }).join(', ')}${quote}`;
    });
    html = html.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\)]*))\s*\)/gi, (match, a, b, c) => {
      const value = (a ?? b ?? c).trim();
      return remote(value) ? match : `url('${assetReference(value, from)}')`;
    });
    return html.replace(/\bhref=(["'])(\.\/|\.\.\/\.\.\/|banda\/)\1/gi, (_, quote, value) => `href=${quote}${value === 'banda/' ? sitePath : base}${quote}`);
  }

  const [sourceSite, landingTemplate, signupTemplate, notFoundTemplate, statsTemplate] = await Promise.all([
    'index.html', 'templates/landing.html', 'templates/maraton.html', 'templates/404.html', 'admin/estadisticas/index.html',
  ].map(async path => (await safeRead(root, path)).toString('utf8')));
  const newsletter = renderNewsletter(await readNewsletter(root));
  const landing = pageMetadata(landingTemplate.replaceAll('{{BASE}}', base).replaceAll('{{SITE_URL}}', sitePath)
    .replaceAll('{{NEWSLETTER}}', newsletter).replaceAll('{{TELEMETRY}}', ''), location.href, image)
    .replace('</head>', `${renderAnalytics(await readAnalytics(root))}\n</head>`);

  const registrationLink = `<a class="nav-newsletter" href="${registrationPath}">Recibir comunicados</a>`;
  let site = pageMetadata(sourceSite, siteCanonical, image)
    .replace(/(<ul\b[^>]*\bid=["']navLinks["'][^>]*>)([\s\S]*?)(<\/ul>)/i, (_, opening, links, closing) => `${opening}${links}<li>${registrationLink}</li>${closing}`)
    .replace(/(<footer\b[^>]*\bclass=["'][^"']*\bsite-footer\b[^"']*["'][^>]*>)([\s\S]*?)(<\/footer>)/i, (_, opening, content, closing) => `${opening}${content}${registrationLink}${closing}`);
  const signup = pageMetadata(signupTemplate.replaceAll('{{BASE}}', base).replaceAll('{{TELEMETRY}}', '')
    .replaceAll('{{NEWSLETTER}}', newsletter).replaceAll('Acceso de la banda', 'Ir al sitio'), registrationCanonical, image);
  const notFound = withoutAnalytics(notFoundTemplate.replaceAll('{{BASE}}', base)).replace(/<base\b[^>]*>/gi, '')
    .replaceAll('Acceso de la banda', 'Ir al sitio').replaceAll('Vuelve al registro de Maratón.', 'Vuelve al inicio de Los Insurgentes.').replaceAll('Volver al registro', 'Volver al inicio');
  const redirect = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="referrer" content="no-referrer"><meta http-equiv="refresh" content="0;url=${sitePath}"><link rel="canonical" href="${escape(siteCanonical)}"><title>Los Insurgentes · Entrar al sitio</title></head><body><a href="${sitePath}">Entrar al sitio</a></body></html>`;
  const pages = new Map([
    ['index.html', rewrite(landing)], ['sitio/index.html', rewrite(site)], ['registro/index.html', rewrite(signup)],
    ['banda/index.html', redirect], ['404.html', rewrite(notFound)],
    ['admin/estadisticas/index.html', rewrite(withoutAnalytics(statsTemplate), 'admin/estadisticas/index.html')],
  ]);
  if ([...pages.values()].some(html => /\{\{[^}]+\}\}/.test(html))) throw new Error('Unresolved public page placeholder');

  // Validate/read all selected files before replacing the previous build.
  const files = new Map();
  for (const path of assets) {
    const bytes = await safeRead(root, path);
    files.set(path, bytes);
    if (path.endsWith('.css')) {
      for (const match of bytes.toString('utf8').matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\)]*))\s*\)/gi)) {
        const value = (match[1] ?? match[2] ?? match[3]).trim();
        if (!remote(value)) assetReference(value, path);
      }
    }
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const [path, value] of [...pages, ...files]) {
    await mkdir(dirname(join(output, path)), { recursive: true });
    await writeFile(join(output, path), value);
  }
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: ${base}admin/\n`);
  return output;
}
