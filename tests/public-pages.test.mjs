import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { preparePages } from '../scripts/prepare-pages.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const run = promisify(execFile);
const websiteId = '11111111-2222-4333-8444-555555555555';
const submitUrl = 'https://band.sibforms.com/serve/public_signup_fixture==';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-public-pages-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const files = {
    'index.html': `<!doctype html><html lang="es"><head><title>Los Insurgentes</title><meta name="description" content="La banda"><meta name="robots" content="noindex"><link rel="canonical" href="https://old.example/"><meta property="og:url" content="https://old.example/"><meta property="og:image" content="https://old.example/assets/og-image.jpg"><link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="css/spotify.css"><script id="analytics-config" type="application/json">{"enabled":true}</script><script src="js/analytics.js" defer></script></head><body><nav><ul id="navLinks"><li><a href="#gallery">Galería</a></li></ul></nav><main id="main"><section id="top" style="background-image:url('content/photos/01-inicio.jpg')"></section><section id="gallery"><img src="content/photos/galeria/01.jpg" srcset="content/photos/galeria/01.jpg 600w, content/photos/galeria/large.jpg 1200w" alt="Los Insurgentes"></section><a href="https://open.spotify.com/artist/example">Spotify</a></main><footer class="site-footer">Los Insurgentes</footer><script src="js/main.js" defer></script><script src="js/spotify.js" defer></script></body></html>`,
    'css/style.css': '@font-face{font-family:Fixture;src:url("../assets/fonts/fixture.woff2")}body{background:url("../assets/logos/skull-pattern.png")}.noise{background:url("data:image/svg+xml,%3Csvg%3E")}',
    'css/band-intro.css': '.band-intro{background:url("../assets/logos/skull-icon-orange.png")}',
    'css/maraton.css': 'body{font-family:Arial}',
    'css/spotify.css': '.music{display:block}',
    'css/stats.css': 'body{font-family:Arial}',
    'js/main.js': 'window.fixtureSite = true;',
    'js/spotify.js': 'window.fixtureSpotify = true;',
    'js/maraton.js': 'window.fixtureSignup = true;',
    'js/analytics.js': 'window.fixtureAnalytics = true;',
    'images/favicon-32.png': 'fixture favicon',
    'assets/fonts/fixture.woff2': 'fixture font',
    'assets/logos/logo-full-white.png': 'fixture white logo',
    'assets/logos/skull-icon-orange.png': 'fixture orange skull',
    'assets/logos/skull-pattern.png': 'fixture pattern',
    'assets/maraton/maraton-wordmark-paper.png': 'fixture album wordmark',
    'assets/maraton/door-skull-orange.png': 'fixture entry skull',
    'assets/og-image.jpg': 'fixture sharing image',
    'content/photos/01-inicio.jpg': 'fixture main photo',
    'content/photos/galeria/01.jpg': 'fixture gallery photo',
    'content/photos/galeria/large.jpg': 'fixture full-size photo',
    'content/newsletter.json': JSON.stringify({ version: 1, enabled: true, provider: 'brevo', formUrl: 'https://band.sibforms.com/v2/serve/public_hosted_fixture==', submitUrl }),
    'content/analytics.json': JSON.stringify({ version: 1, enabled: true, websiteId }),
    'content/site.json': '{"notPublic":"band config"}',
    'content/releases.json': '["not public raw config"]',
    'content/photos/unused.jpg': 'unreferenced photo',
    'content/photos/00-guia.html': '<h1>Private editing guide</h1>',
    'admin/index.html': '<h1>Editor must stay out</h1>',
    'admin/estadisticas/report.json': '{"private":"statistics"}',
    'templates/private.html': '<h1>Private template</h1>',
    'js/update-bundle.mjs': 'private build code',
    'js/unused.js': 'unused code',
    'css/unused.css': 'unused CSS',
    'assets/unused.png': 'unused logo',
    'assets/.secret.png': 'hidden asset',
    'MARATON BRANDING/original.png': 'registered source remains local',
    '.env.preview-password': 'Synthetic password must not be published',
    'preview.json': '{"notPublic":"obsolete ciphertext"}',
    'maraton-preview.json': '{"notPublic":"obsolete ciphertext"}',
    '_site/stale.txt': 'old output',
  };
  for (const [path, value] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), value);
  }
  for (const path of ['templates/band-intro.html', 'templates/maraton.html', 'templates/404.html', 'admin/estadisticas/index.html']) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await cp(join(projectRoot, path), join(root, path));
  }
  return root;
}

async function outputFiles(root, prefix = '') {
  const files = [];
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await outputFiles(root, path));
    else files.push(path);
  }
  return files.sort();
}

test('public launch publishes banner, complete site, optional signup and the compatible band redirect', async t => {
  const root = await fixture(t);
  const output = await preparePages(root);
  const banner = await readFile(join(output, 'index.html'), 'utf8');
  const site = await readFile(join(output, 'sitio/index.html'), 'utf8');
  const signup = await readFile(join(output, 'registro/index.html'), 'utf8');
  const redirect = await readFile(join(output, 'banda/index.html'), 'utf8');
  assert.match(banner, /id="band-intro"/);
  assert.match(banner, /<main id="contenido">/);
  assert.match(banner, /href="\/sitio\/"/);
  assert.match(banner, /href="\/registro\/"/);
  assert.match(banner, /Recibir comunicados/);
  assert.doesNotMatch(banner, /data-newsletter-form|band-site|access-password|band-intro\.js/);
  assert.match(site, /<main id="main">/);
  assert.match(site, /href="#gallery"/);
  assert.equal((site.match(/class="nav-newsletter"/g) || []).length, 2);
  assert.match(site, /href="\/registro\/">Recibir comunicados/);
  assert.doesNotMatch(site, /band-site|hidden inert|access-password|preview\.json|noindex|<base\b/);
  assert.match(signup, /data-newsletter-form/);
  assert.match(signup, /<form[^>]+method="post"/);
  assert.match(signup, /<form[^>]+action="https:\/\/band\.sibforms\.com\/serve\/public_signup_fixture=="/);
  assert.equal((signup.match(/name="EMAIL"/g) || []).length, 1);
  for (const field of ['email_address_check', 'locale', 'html_type']) assert.match(signup, new RegExp(`name="${field}"`));
  assert.match(signup, /href="#registro"/);
  assert.match(signup, /href="\/sitio\/">Ir al sitio/);
  assert.doesNotMatch(signup, /Acceso de la banda|access-password|<base\b|noindex/);
  assert.match(redirect, /http-equiv="refresh" content="0;url=\/sitio\/"/);
  assert.match(redirect, /<a href="\/sitio\/">Entrar al sitio/);
  assert.doesNotMatch(redirect, /<script|access-password|preview\.json/);
});

test('public URLs, fragments and canonical metadata resolve under a GitHub Pages subpath', async t => {
  const root = await fixture(t);
  const output = await preparePages(root, { siteUrl: 'https://example.github.io/insurgentesWeb/' });
  for (const [path, route] of [['index.html', ''], ['sitio/index.html', 'sitio/'], ['registro/index.html', 'registro/']]) {
    const html = await readFile(join(output, path), 'utf8');
    assert.match(html, new RegExp(`<link rel="canonical" href="https://example\\.github\\.io/insurgentesWeb/${route}"`));
    assert.match(html, /content="https:\/\/example\.github\.io\/insurgentesWeb\/assets\/og-image\.jpg"/);
    assert.doesNotMatch(html, /old\.example|<base\b|\{\{[^}]+\}\}/);
    for (const match of html.matchAll(/\b(?:src|href)="(\/(?:assets|css|js|images|content)\/[^"#?]*)/g)) assert.fail(`Resource lost its subpath: ${match[1]}`);
  }
  const site = await readFile(join(output, 'sitio/index.html'), 'utf8');
  const signup = await readFile(join(output, 'registro/index.html'), 'utf8');
  assert.match(site, /src="\/insurgentesWeb\/content\/photos\/galeria\/01\.jpg"/);
  assert.match(site, /srcset="\/insurgentesWeb\/content\/photos\/galeria\/01\.jpg 600w, \/insurgentesWeb\/content\/photos\/galeria\/large\.jpg 1200w"/);
  assert.match(site, /url\('\/insurgentesWeb\/content\/photos\/01-inicio\.jpg'\)/);
  assert.equal(new URL('#gallery', 'https://example.github.io/insurgentesWeb/sitio/').pathname, '/insurgentesWeb/sitio/');
  assert.match(signup, /href="#contenido"/);
  assert.equal(new URL('#registro', 'https://example.github.io/insurgentesWeb/registro/').pathname, '/insurgentesWeb/registro/');
  const stats = await readFile(join(output, 'admin/estadisticas/index.html'), 'utf8');
  assert.match(stats, /href="\/insurgentesWeb\/css\/stats\.css"/);
  assert.match(stats, /src="\/insurgentesWeb\/assets\/logos\/logo-full-white\.png"/);
});

test('public package follows referenced resources and CSS dependencies without leaking source trees', async t => {
  const root = await fixture(t);
  const output = await preparePages(root);
  const paths = await outputFiles(output);
  for (const path of ['index.html', 'sitio/index.html', 'registro/index.html', 'banda/index.html', '404.html', 'admin/estadisticas/index.html', 'robots.txt', '.nojekyll', 'assets/fonts/fixture.woff2', 'assets/logos/skull-pattern.png', 'assets/maraton/door-skull-orange.png', 'content/photos/01-inicio.jpg', 'content/photos/galeria/01.jpg', 'content/photos/galeria/large.jpg']) assert.ok(paths.includes(path), path);
  for (const path of paths) {
    assert.ok(!path.endsWith('.json'), 'Raw JSON is not a public resource');
    assert.ok(!/^(?:templates\/|scripts\/|MARATON BRANDING\/|admin\/(?!estadisticas\/index\.html$))/.test(path), path);
    assert.ok(!/unused|secret|stale|00-guia|\.mjs$|preview/.test(path), path);
  }
  assert.equal(await readFile(join(output, 'content/photos/galeria/01.jpg'), 'utf8'), 'fixture gallery photo');
  await writeFile(join(output, 'stale-from-first-build.html'), 'stale');
  await preparePages(root);
  assert.ok(!(await outputFiles(output)).includes('stale-from-first-build.html'));
});

test('opt-in analytics appears only on the banner; 404 has no signup or tracker', async t => {
  const root = await fixture(t);
  const output = await preparePages(root);
  const banner = await readFile(join(output, 'index.html'), 'utf8');
  assert.match(banner, /id="analytics-config"/);
  assert.match(banner, /src="\/js\/analytics\.js"/);
  for (const path of ['sitio/index.html', 'registro/index.html', 'banda/index.html', '404.html', 'admin/estadisticas/index.html']) {
    const html = await readFile(join(output, path), 'utf8');
    assert.doesNotMatch(html, /analytics-config|js\/analytics\.js|cloud\.umami\.is\/script\.js/);
    if (path === '404.html') {
      assert.doesNotMatch(html, /<form|data-newsletter-form|Acceso de la banda/);
      assert.match(html, /Página no encontrada/);
    }
  }
  await rm(join(root, 'content/analytics.json'));
  await preparePages(root);
  assert.doesNotMatch(await readFile(join(output, 'index.html'), 'utf8'), /analytics-config|js\/analytics\.js/);
  assert.ok(!(await outputFiles(output)).includes('js/analytics.js'));
});

test('missing newsletter configuration keeps the optional registration coming-soon state', async t => {
  const root = await fixture(t);
  await rm(join(root, 'content/newsletter.json'));
  const output = await preparePages(root);
  const signup = await readFile(join(output, 'registro/index.html'), 'utf8');
  assert.doesNotMatch(signup, /<form|data-newsletter-form/);
  assert.match(signup, /pronto|Próximamente|próximamente/);
  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /href="\/sitio\/"/);
});

test('public packaging rejects referenced symlinks and unsafe resources while preserving the previous build', async t => {
  for (const path of ['content/photos/01-inicio.jpg', 'assets/fonts/fixture.woff2', 'templates/band-intro.html']) {
    const root = await fixture(t);
    await rm(join(root, path));
    await symlink(join(root, '.env.preview-password'), join(root, path));
    await assert.rejects(preparePages(root), /symbolic links/);
    assert.equal(await readFile(join(root, '_site/stale.txt'), 'utf8'), 'old output');
  }
  const root = await fixture(t);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  for (const url of ['../.env.preview-password', 'content/site.json', 'js/update-bundle.mjs', 'assets/%2e%2e/secret.png']) {
    await writeFile(join(root, 'index.html'), html.replace('js/main.js', url));
    await assert.rejects(preparePages(root), /Unsafe|allowlist/);
  }
});

test('public packaging validates canonical origins and base paths', async t => {
  const root = await fixture(t);
  for (const siteUrl of ['http://example.com/', 'https://user:password@example.com/', 'https://example.com:8443/', 'https://example.com/space%20path/']) await assert.rejects(preparePages(root, { siteUrl }), /Invalid public/);
});

test('Pages CLI defaults to the public launch without a password, and --public is an alias', async t => {
  const root = await fixture(t);
  for (const path of ['scripts/prepare-pages.mjs', 'scripts/public-pages.mjs', 'scripts/private-preview.mjs', 'scripts/analytics-config.mjs', 'scripts/newsletter-config.mjs', 'js/analytics-render.mjs', 'js/newsletter-render.mjs']) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await cp(join(projectRoot, path), join(root, path));
  }
  const options = { env: { ...process.env, CI: 'true', PREVIEW_PASSWORD: '', SITE_URL: 'https://example.github.io/insurgentesWeb/' } };
  const cli = await realpath(join(root, 'scripts/prepare-pages.mjs'));
  for (const flags of [[], ['--public']]) {
    const { stdout } = await run(process.execPath, [cli, ...flags], options);
    assert.match(stdout, /Public Maratón banner, band site and optional signup/);
    assert.match(await readFile(join(root, '_site/index.html'), 'utf8'), /href="\/insurgentesWeb\/sitio\/"/);
    assert.doesNotMatch(await readFile(join(root, '_site/sitio/index.html'), 'utf8'), /access-password|band-site/);
    assert.ok(!(await outputFiles(join(root, '_site'))).some(path => path.endsWith('.json')));
  }
  await assert.rejects(run(process.execPath, [cli, '--public', '--signup-only'], options), /Choose only one Pages mode/);
});
