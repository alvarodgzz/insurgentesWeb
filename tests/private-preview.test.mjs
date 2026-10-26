import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFile, writeFile, mkdir, mkdtemp, rm, cp, readdir, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { encryptPreview, makeSelfContained, preparePrivatePages, GATE_FILES } from '../scripts/private-preview.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const syntheticPassword = 'Synthetic preview password 7!';
const fixtureHtml = `<!doctype html><html lang="es"><head>
<link rel="stylesheet" href="css/fixture.css"><link rel="icon" href="images/fixture.png">
</head><body><h1>Contenido privado de prueba</h1>
<img src="content/photos/fixture.jpg" srcset="content/photos/fixture.jpg 400w, content/photos/large.jpg 800w" alt="Banda">
<div style="background-image:url('content/photos/fixture.jpg')"></div>
<a href="https://open.spotify.com/artist/example">Spotify</a>
<script src="js/fixture.js" defer></script></body></html>`;

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-private-preview-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const path of [...GATE_FILES, 'templates/access.html']) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await cp(join(projectRoot, path), join(root, path));
  }
  const files = {
    'index.html': fixtureHtml,
    'css/fixture.css': `@font-face{font-family:Fixture;src:url("../assets/fonts/fixture.woff2")}body{background-image:url("../content/photos/fixture.jpg")}.noise{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E")}`,
    'assets/fonts/fixture.woff2': Buffer.from('fixture font bytes'),
    'content/photos/fixture.jpg': Buffer.from('fixture image bytes'),
    'content/photos/large.jpg': Buffer.from('larger fixture image bytes'),
    'images/fixture.png': Buffer.from('fixture icon bytes'),
    'js/fixture.js': 'window.fixtureLoaded = true;',
    'content/site.json': '{"private":"band content"}',
    'admin/index.html': '<h1>Private editor</h1>',
    'templates/page.html': '<h1>Private page template</h1>',
    '.env.fixture': 'DO_NOT_PUBLISH_THIS_FILE',
    '_site/stale-private-file.txt': 'old deployment content',
  };
  for (const [path, bytes] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), bytes);
  }
  return root;
}

async function decrypt(envelope, password) {
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: Buffer.from(envelope.salt, 'base64'), iterations: envelope.iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const bytes = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(envelope.iv, 'base64') }, key, Buffer.from(envelope.ciphertext, 'base64'));
  return new TextDecoder().decode(bytes);
}

async function outputFiles(root, path = '') {
  const found = [];
  for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
    const relative = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...await outputFiles(root, relative));
    else found.push(relative);
  }
  return found.sort();
}

test('private preview encryption authenticates the password and payload with fresh randomness', async () => {
  const html = '<!doctype html><h1>Private fixture</h1>';
  const first = await encryptPreview(html, syntheticPassword);
  const second = await encryptPreview(html, syntheticPassword);
  assert.equal(first.version, 1);
  assert.equal(first.iterations, 600000);
  assert.equal(Buffer.from(first.iv, 'base64').length, 12);
  assert.ok(Buffer.from(first.salt, 'base64').length >= 16);
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.iv, second.iv);
  assert.notEqual(first.ciphertext, second.ciphertext);
  assert.equal(await decrypt(first, syntheticPassword), html);
  assert.doesNotMatch(JSON.stringify(first), /Private fixture|Synthetic preview password/);
  await assert.rejects(decrypt(first, 'Incorrect synthetic password'));
  const modified = Buffer.from(first.ciphertext, 'base64');
  modified[0] ^= 1;
  await assert.rejects(decrypt({ ...first, ciphertext: modified.toString('base64') }, syntheticPassword));
});

test('private preview bundles photos, fonts, styles, icons and classic scripts without public resource URLs', async (t) => {
  const root = await fixture(t);
  const html = await makeSelfContained(root);
  assert.match(html, /Contenido privado de prueba/);
  assert.match(html, /data:image\/jpeg;base64,/);
  assert.match(html, /data:image\/png;base64,/);
  assert.match(html, /data:font\/woff2;base64,/);
  assert.match(html, /data:image\/svg\+xml,%3Csvg xmlns=%27http:\/\/www\.w3\.org\/2000\/svg%27%3E%3C\/svg%3E/);
  assert.doesNotMatch(html, /\bsrcset\s*=/);
  assert.match(html, /window\.fixtureLoaded = true/);
  assert.match(html, /https:\/\/open\.spotify\.com\/artist\/example/);
  assert.doesNotMatch(html, /(?:src|srcset|href)=["'](?:css|js|content|images|assets)\//);
  assert.doesNotMatch(html, /url\(["']?(?:\.\.\/|content\/)/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel=["']stylesheet/);
});

test('private Pages output exposes only the access screen and encrypted preview, removing stale files', async (t) => {
  const root = await fixture(t);
  const expectedHtml = await makeSelfContained(root);
  const destination = await preparePrivatePages(root, { password: syntheticPassword });
  assert.equal(destination, join(root, '_site'));
  const paths = await outputFiles(destination);
  assert.deepEqual(paths, [...GATE_FILES, 'index.html', '404.html', 'robots.txt', '.nojekyll', 'preview.json'].sort());
  const envelope = JSON.parse(await readFile(join(destination, 'preview.json'), 'utf8'));
  assert.equal(await decrypt(envelope, syntheticPassword), expectedHtml);
  for (const path of paths) {
    const bytes = await readFile(join(destination, path));
    assert.equal(bytes.includes(Buffer.from(syntheticPassword)), false, path);
    assert.equal(bytes.includes(Buffer.from('Contenido privado de prueba')), false, path);
    assert.equal(bytes.includes(Buffer.from('DO_NOT_PUBLISH_THIS_FILE')), false, path);
  }
  const robots = await readFile(join(destination, 'robots.txt'), 'utf8');
  assert.match(robots, /User-agent:\s*\*/);
  assert.match(robots, /Disallow:\s*\//);
  assert.match(await readFile(join(destination, 'index.html'), 'utf8'), /noindex/);
  assert.equal(await readFile(join(destination, '404.html'), 'utf8'), await readFile(join(destination, 'index.html'), 'utf8'));
});

test('missing preview password publishes a closed holding page without encrypted or raw band content', async (t) => {
  const root = await fixture(t);
  await preparePrivatePages(root, { password: syntheticPassword });
  await preparePrivatePages(root, {});
  const paths = await outputFiles(join(root, '_site'));
  assert.deepEqual(paths, [...GATE_FILES, 'index.html', '404.html', 'robots.txt', '.nojekyll'].sort());
});

test('private preview rejects file and directory symlinks and paths outside the source root', async (t) => {
  const root = await fixture(t);
  await symlink(join(root, 'content/photos/fixture.jpg'), join(root, 'content/photos/linked.jpg'));
  await writeFile(join(root, 'index.html'), '<img src="content/photos/linked.jpg" alt="Banda">');
  await assert.rejects(makeSelfContained(root));
  await symlink(join(root, 'content/photos'), join(root, 'linked-photos'));
  await writeFile(join(root, 'index.html'), '<img src="linked-photos/fixture.jpg" alt="Banda">');
  await assert.rejects(makeSelfContained(root));
  await writeFile(join(root, 'index.html'), '<img src="../outside.jpg" alt="Banda">');
  await assert.rejects(makeSelfContained(root));
  await writeFile(join(root, 'index.html'), '<img src="%2e%2e/outside.jpg" alt="Banda">');
  await assert.rejects(makeSelfContained(root));
});

test('private Pages output refuses symbolic links among public gate resources', async (t) => {
  const root = await fixture(t);
  const logo = 'assets/logos/logo-full-white.png';
  await rm(join(root, logo));
  await symlink(join(root, 'content/photos/fixture.jpg'), join(root, logo));
  await assert.rejects(preparePrivatePages(root, {}));
});

test('access screen handles unavailable and incorrect passwords, then decrypts the preview without sending the password', async () => {
  const elements = new Map();
  for (const id of ['access-form', 'access-password', 'access-reveal', 'access-submit', 'access-submit-label', 'access-status']) {
    const attributes = new Map();
    elements.set(id, {
      value: '', type: id === 'access-password' ? 'password' : '', disabled: true,
      textContent: '', listeners: new Map(),
      addEventListener(event, listener) { this.listeners.set(event, listener); },
      setAttribute(name, value) { attributes.set(name, value); },
      removeAttribute(name) { attributes.delete(name); },
      getAttribute(name) { return attributes.get(name); },
      reportValidity() { return true; },
      focus() { this.focused = true; },
    });
  }
  const html = '<!doctype html><h1>Decrypted band preview</h1>';
  const envelope = await encryptPreview(html, syntheticPassword);
  let available = false;
  let written = '';
  let requests = 0;
  const document = {
    baseURI: 'https://preview.example.test/',
    getElementById: id => elements.get(id),
    open() { written = ''; }, write(value) { written += value; }, close() {},
  };
  await runInNewContext(await readFile(join(projectRoot, 'js/access.js'), 'utf8'), {
    document, window: { isSecureContext: true, crypto: webcrypto }, crypto: webcrypto,
    URL, TextEncoder, TextDecoder, Uint8Array, atob,
    fetch: async (url, options) => {
      requests += 1;
      assert.equal(String(url), 'https://preview.example.test/preview.json');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.body, undefined);
      assert.doesNotMatch(String(url), /password/i);
      return available ? new Response(JSON.stringify(envelope)) : new Response('', { status: 404 });
    },
  });
  const form = elements.get('access-form');
  const input = elements.get('access-password');
  const submit = elements.get('access-submit');
  const status = elements.get('access-status');
  const enter = async password => {
    input.value = password;
    await form.listeners.get('submit')({ preventDefault() {} });
    assert.equal(input.value, '');
    assert.equal(input.readOnly, false);
    assert.equal(submit.disabled, false);
    assert.equal(form.getAttribute('aria-busy'), undefined);
  };
  assert.equal(input.disabled, false);
  await enter(syntheticPassword);
  assert.match(status.textContent, /disponible pronto/);
  assert.equal(written, '');
  available = true;
  await enter('Wrong synthetic password');
  assert.match(status.textContent, /contraseña no es correcta/);
  assert.equal(input.getAttribute('aria-invalid'), 'true');
  assert.equal(input.focused, true);
  input.listeners.get('input')();
  assert.equal(input.getAttribute('aria-invalid'), undefined);
  const reveal = elements.get('access-reveal');
  reveal.listeners.get('click')();
  assert.equal(input.type, 'text');
  assert.equal(reveal.getAttribute('aria-pressed'), 'true');
  reveal.listeners.get('click')();
  assert.equal(input.type, 'password');
  await enter(syntheticPassword);
  assert.equal(written, html);
  assert.equal(requests, 2, 'a validated encrypted payload can be reused when correcting the password');
});

test('access screen blocks password entry and fetches when the connection cannot support secure decryption', async () => {
  const elements = new Map();
  for (const id of ['access-form', 'access-password', 'access-reveal', 'access-submit', 'access-submit-label', 'access-status']) {
    elements.set(id, {
      disabled: true, listeners: new Map(), textContent: '',
      addEventListener(event, listener) { this.listeners.set(event, listener); },
      reportValidity() { assert.fail('Insecure form must not attempt password validation'); },
    });
  }
  await runInNewContext(await readFile(join(projectRoot, 'js/access.js'), 'utf8'), {
    document: { getElementById: id => elements.get(id) },
    window: { isSecureContext: false, crypto: webcrypto },
    fetch() { assert.fail('Insecure form must not fetch the encrypted payload'); },
  });
  assert.equal(elements.get('access-password').disabled, true);
  assert.equal(elements.get('access-submit').disabled, true);
  assert.match(elements.get('access-status').textContent, /HTTPS/);
  await elements.get('access-form').listeners.get('submit')({ preventDefault() {} });
});
