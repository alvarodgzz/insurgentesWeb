import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { access, cp, mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prepareLandingPages } from './private-preview.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolsRoot = resolve(process.env.BROWSER_TOOLS_DIR || join(process.env.RUNNER_TEMP || (process.platform === 'darwin' ? '/private/tmp' : tmpdir()), 'insurgentes-browser-tools'));
const modulePath = join(toolsRoot, 'node_modules/playwright/index.mjs');
const version = '1.65.0';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(toolsRoot, 'browsers');

async function command(executable, args) {
  await new Promise((accept, reject) => {
    const child = spawn(executable, args, { stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? accept() : reject(new Error(`Browser tooling command failed (${code})`)));
  });
}
if (process.argv.includes('--install')) {
  await command('npm', ['install', '--prefix', toolsRoot, '--no-save', '--no-package-lock', '--no-audit', '--no-fund', `playwright@${version}`]);
  await command(process.execPath, [join(toolsRoot, 'node_modules/playwright/cli.js'), 'install', ...(process.env.CI ? ['--with-deps'] : []), 'chromium', 'webkit']);
}
try { await access(modulePath); }
catch { throw new Error('Run node scripts/qa-browser.mjs --install to install isolated browser-testing tools.'); }
const { chromium, webkit, devices } = await import(pathToFileURL(modulePath).href);
const workspace = await realpath(await mkdtemp(join(tmpdir(), 'insurgentes-browser-qa-')));
const source = join(workspace, 'source');
const output = process.env.CI ? join(workspace, 'report') : join(root, '_qa');
const password = 'Synthetic browser QA password, never used for deployment';
const formAction = 'https://band.sibforms.com/serve/browser_qa_submit==';
const screenshots = [];
const chromiumOnly = process.argv.includes('--chromium-only') || (!process.env.CI && process.platform === 'darwin');
if (chromiumOnly) console.log('Local run: Chromium. WebKit remains required by Linux CI before deployment.');
let server;

async function fingerprint(path) {
  try { return createHash('sha256').update(await readFile(path)).digest('hex'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
const deploymentFingerprint = await fingerprint(join(root, '_site/preview.json'));
const configFingerprint = await fingerprint(join(root, 'content/newsletter.json'));

async function layout(page, selector, label) {
  const result = await page.locator(selector).evaluate(image => {
    const box = image.getBoundingClientRect();
    let left = box.left, right = box.right;
    for (let parent = image.parentElement; parent; parent = parent.parentElement) {
      if (['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) {
        const clip = parent.getBoundingClientRect();
        left = Math.max(left, clip.left); right = Math.min(right, clip.right);
      }
    }
    return { viewport: innerWidth, page: document.documentElement.scrollWidth, left: box.left, right: box.right,
      width: box.width, visible: Math.max(0, right - left), loaded: image.complete && image.naturalWidth > 0 };
  });
  assert.ok(result.loaded, `${label}: logo must load`);
  assert.ok(result.width > 0, `${label}: logo must be visible`);
  assert.ok(result.page <= result.viewport + 1, `${label}: page must not overflow horizontally`);
  assert.ok(result.left >= -1 && result.right <= result.viewport + 1, `${label}: whole wordmark must fit the viewport`);
  assert.ok(result.visible >= result.width - 1, `${label}: ancestors must not clip the wordmark`);
}
async function controls(page, label) {
  for (const selector of ['#EMAIL', '.newsletter-button', '.maraton-band-access']) {
    const bounds = await page.locator(selector).boundingBox();
    assert.ok(bounds && bounds.width > 0 && bounds.height >= 40, `${label}: usable control ${selector}`);
    const width = page.viewportSize().width;
    assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1, `${label}: control fits ${selector}`);
  }
}
async function screenshot(page, label, fullPage = true) {
  const name = `${label}.png`;
  await page.screenshot({ path: join(output, name), fullPage, animations: 'disabled' });
  screenshots.push({ name, label });
}
async function contextFor(browser, engine, viewport, javaScriptEnabled = true) {
  const mobile = viewport.width < 700;
  const context = await browser.newContext({
    ...(mobile ? devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'] : {}),
    viewport, deviceScaleFactor: 1, javaScriptEnabled, reducedMotion: 'reduce', locale: 'es-MX',
  });
  // All external traffic is blocked. Signup responses below are local fixtures.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  return context;
}
let origin;
try {
  await mkdir(source, { recursive: true });
  for (const directory of ['assets', 'css', 'js', 'images', 'content', 'templates']) {
    await cp(join(root, directory), join(source, directory), { recursive: true });
  }
  await cp(join(root, 'index.html'), join(source, 'index.html'));
  await mkdir(join(source, 'admin/estadisticas'), { recursive: true });
  await cp(join(root, 'admin/estadisticas/index.html'), join(source, 'admin/estadisticas/index.html'));
  await writeFile(join(source, 'content/newsletter.json'), JSON.stringify({ version: 1, enabled: true, provider: 'brevo', formUrl: 'https://band.sibforms.com/v2/serve/browser_qa_hosted==', submitUrl: formAction }));
  await writeFile(join(source, 'content/analytics.json'), JSON.stringify({ version: 1, enabled: false, websiteId: '' }));
  const site = await prepareLandingPages(source, { password });
  await mkdir(output, { recursive: true });
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.otf': 'font/otf' };
  server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) throw new Error('Method not allowed');
      let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
      if (!path || path.endsWith('/')) path += 'index.html';
      const target = await realpath(resolve(site, path));
      const local = relative(site, target);
      if (local.startsWith(`..${sep}`) || local === '..' || local.split(sep).some(part => part.startsWith('.'))) throw new Error('Outside fixture');
      if (!(await stat(target)).isFile()) throw new Error('Not a file');
      response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(target));
    } catch { response.writeHead(404); response.end('Not found'); }
  });
  await new Promise(accept => server.listen(0, '127.0.0.1', accept));
  origin = `http://127.0.0.1:${server.address().port}`;
  for (const [engine, type] of (chromiumOnly ? [['chromium', chromium]] : [['chromium', chromium], ['webkit', webkit]])) {
    console.log(`Checking ${engine}…`);
    const browser = await type.launch({ headless: true });
    try {
      for (const width of [320, 360, 390, 430, 768, 1440]) {
        const context = await contextFor(browser, engine, { width, height: width < 700 ? 844 : 1000 });
        try {
          const page = await context.newPage();
          assert.equal((await page.goto(origin)).status(), 200, 'QA registration fixture must load');
          await page.evaluate(() => document.fonts.ready);
          await layout(page, '.maraton-title-logo', `${engine}/${width}/registration`);
          await controls(page, `${engine}/${width}`);
          await screenshot(page, `${engine}-${width}-registration`);
          console.log(`PASS ${engine} ${width}px: complete logo, no clipping, usable form`);
          if (width === 390) {
            // Prove the test catches the reported giant-letter failure, even
            // when overflow:hidden hides it from document.scrollWidth.
            const brokenStyle = await page.addStyleTag({ content: '.maraton-title-logo{width:2400px!important;max-width:none!important}' });
            await assert.rejects(layout(page, '.maraton-title-logo', 'giant-letter regression sentinel'));
            await brokenStyle.evaluate(style => style.remove());
            await page.locator('.maraton-title-logo').evaluate(image => { image.className = 'qa-cached-wordmark'; image.width = 2400; });
            await layout(page, '.qa-cached-wordmark', `${engine}/cached markup`);
            console.log(`PASS ${engine}: giant-letter regression is detected`);
          }
        } finally { await context.close(); }
      }
      const context = await contextFor(browser, engine, { width: 390, height: 844 });
      try {
        const page = await context.newPage();
        await page.goto(`${origin}/banda/`);
        await page.locator('#access-password').fill('Deliberately incorrect QA password');
        await page.locator('#access-submit').click();
        await page.getByText('La contraseña no es correcta. Inténtalo de nuevo.').waitFor();
        await page.locator('#access-password').fill(password);
        await page.locator('#access-submit').click();
        await page.locator('#band-intro').waitFor({ state: 'visible', timeout: 30000 });
        assert.equal(await page.locator('#band-site').isVisible(), false);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
          await layout(page, '#band-intro-title img', `${engine}/${width}/banner`);
          const box = await page.locator('#band-intro-enter').boundingBox();
          assert.ok(box && box.y >= 0 && box.y + box.height <= page.viewportSize().height + 1, 'Banner enter button must fit the screen');
          await screenshot(page, `${engine}-${width}-banner`);
        }
        await page.locator('#band-intro-enter').click();
        await page.locator('#band-site').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#band-intro').isVisible(), false);
        assert.equal(await page.locator('#main').evaluate(main => main === document.activeElement), true);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
          await layout(page, '.hero-title-mark', `${engine}/${width}/site`);
          await screenshot(page, `${engine}-${width}-site`, false);
        }
        console.log(`PASS ${engine}: password → responsive banner → existing site, keyboard focus preserved`);
      } finally { await context.close(); }

      const signupContext = await contextFor(browser, engine, { width: 390, height: 844 });
      try {
        const page = await signupContext.newPage();
        let accept, received = 0;
        const pending = new Promise(resolve => { accept = resolve; });
        await signupContext.route(formAction, async route => {
          received++;
          const request = route.request();
          assert.equal(request.method(), 'POST');
          assert.equal(request.headers().referer, undefined);
          assert.equal(request.headers().cookie, undefined);
          const fields = new URLSearchParams(request.postData());
          assert.deepEqual([...fields.keys()].sort(), ['EMAIL', 'email_address_check', 'html_type', 'locale']);
          await pending;
          await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"success":true}' });
        });
        await page.goto(origin);
        await page.locator('#EMAIL').fill('browser-qa@example.invalid');
        await page.locator('.newsletter-button').click();
        await page.locator('form[aria-busy="true"]').waitFor();
        await page.locator('form').dispatchEvent('submit');
        await screenshot(page, `${engine}-signup-pending`);
        accept();
        await page.locator('[data-newsletter-status][data-state="success"]').waitFor();
        assert.equal(received, 1, 'No duplicate signup request');
        assert.equal(new URL(page.url()).pathname, '/');
        await screenshot(page, `${engine}-signup-success`);
        console.log(`PASS ${engine}: pending/success inline, duplicate blocked, provider response simulated`);
      } finally { await signupContext.close(); }

      const noJs = await contextFor(browser, engine, { width: 390, height: 844 }, false);
      try {
        const page = await noJs.newPage();
        await page.goto(origin);
        assert.equal(await page.locator('form[data-newsletter-form]').getAttribute('method'), 'post');
        assert.equal(await page.locator('#EMAIL').isVisible(), true);
        await layout(page, '.maraton-title-logo', `${engine}/no-js`);
        console.log(`PASS ${engine}: native signup remains usable without JavaScript`);
      } finally { await noJs.close(); }
    } finally { await browser.close(); }
  }
  assert.equal(await fingerprint(join(root, '_site/preview.json')), deploymentFingerprint, 'QA must not modify the real deployment payload');
  assert.equal(await fingerprint(join(root, 'content/newsletter.json')), configFingerprint, 'QA must not modify the real provider configuration');
  const cards = screenshots.map(({ name, label }) => `<article><a href="${name}"><img src="${name}" alt="${label}" loading="lazy"><p>${label}</p></a></article>`).join('');
  await writeFile(join(output, 'index.html'), `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisión responsive — Los Insurgentes</title><style>body{margin:0;padding:32px;background:#111;color:#dcd9d0;font:16px/1.5 system-ui}h1{font-size:32px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}article{background:#222;padding:14px}img{width:100%;height:300px;object-fit:cover;object-position:top}a{color:inherit;text-decoration:none}p{overflow-wrap:anywhere}</style><h1>Revisión responsive</h1><p>${chromiumOnly ? "Chromium local; WebKit pendiente del CI de Linux" : "Chromium y WebKit"}. Registro, banner, sitio y estados simulados del formulario. Material exclusivo de este proyecto; no publicar este reporte.</p><div class="grid">${cards}</div></html>`);
  console.log(process.env.CI ? 'Browser QA passed; private screenshots remain temporary and are not uploaded.' : `Browser QA passed. Local storyboard: ${join(output, 'index.html')}`);
} finally {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await rm(workspace, { recursive: true, force: true });
}
