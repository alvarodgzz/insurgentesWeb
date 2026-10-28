import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { configureAnalytics } from '../scripts/configure-analytics.mjs';
import { readAnalytics } from '../scripts/analytics-config.mjs';
import { DEFAULT_ANALYTICS, renderAnalytics } from '../js/analytics-render.mjs';
import { GATE_FILES, MARATON_FILES, preparePrivatePages } from '../scripts/private-preview.mjs';

const websiteId = 'e09631f9-3445-4c9e-b00b-3ef9afc3e172';

test('analytics setup enables only a valid public identifier and can disable collection again', async t => {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-analytics-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'content'));
  assert.deepEqual(await readAnalytics(root), DEFAULT_ANALYTICS);
  await configureAnalytics(websiteId, root);
  assert.deepEqual(await readAnalytics(root), { version: 1, enabled: true, websiteId });
  await assert.rejects(configureAnalytics('not-a-website-id', root));
  assert.equal((await readAnalytics(root)).websiteId, websiteId, 'invalid setup must preserve the valid configuration');
  await configureAnalytics('--disable', root);
  assert.deepEqual(await readAnalytics(root), DEFAULT_ANALYTICS);
});

test('gated Maratón and band pages never publish or run analytics, even when configuration is enabled', async t => {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-analytics-pages-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const path of [...GATE_FILES, ...MARATON_FILES, 'templates/access.html', 'templates/maraton.html']) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await cp(new URL(`../${path}`, import.meta.url), join(root, path));
  }
  await mkdir(join(root, 'content'));
  await configureAnalytics(websiteId, root);
  const config = await readAnalytics(root);
  await writeFile(join(root, 'index.html'), `<!doctype html><html lang="es"><head>${renderAnalytics(config)}</head><body>Sitio reservado</body></html>`);
  const password = 'Synthetic test preview password';
  const output = await preparePrivatePages(root, { password });
  for (const path of ['index.html', '404.html']) {
    const gate = await readFile(join(output, path), 'utf8');
    assert.match(gate, /id="access-password"/);
    assert.doesNotMatch(gate, /analytics-config|src="js\/analytics.js"|cloud\.umami\.is|Sitio reservado|data-newsletter-form/);
  }
  const envelope = JSON.parse(await readFile(join(output, 'maraton-preview.json'), 'utf8'));
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: Buffer.from(envelope.salt, 'base64'), iterations: envelope.iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const bytes = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: Buffer.from(envelope.iv, 'base64') }, key, Buffer.from(envelope.ciphertext, 'base64'));
  const landing = new TextDecoder().decode(bytes);
  assert.match(landing, /data-private-preview="true"/);
  assert.match(landing, /id="signup-title"/);
  assert.doesNotMatch(landing, /analytics-config|cloud\.umami\.is|function track|Sitio reservado/);
  const bandGate = await readFile(join(output, 'banda/index.html'), 'utf8');
  assert.match(bandGate, /id="access-password"/);
  assert.doesNotMatch(bandGate, /analytics-config|src="js\/analytics.js"/);
  const entry = await readFile(join(output, 'admin/estadisticas/index.html'), 'utf8');
  assert.match(entry, /href="https:\/\/cloud\.umami\.is"/);
  assert.match(entry, /cuenta autorizada/);
  assert.doesNotMatch(entry, /<iframe|<script|\/share\/|api[_-]?key|type="password"/i);
  await assert.rejects(readFile(join(output, 'admin/index.html')));
  await assert.rejects(readFile(join(output, 'content/analytics.json')));
  await configureAnalytics('--disable', root);
  await preparePrivatePages(root);
  assert.doesNotMatch(await readFile(join(output, 'index.html'), 'utf8'), /analytics-config|src="js\/analytics.js"/);
  await assert.rejects(readFile(join(output, 'preview.json')));
  await assert.rejects(readFile(join(output, 'maraton-preview.json')));
});
