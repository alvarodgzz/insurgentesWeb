import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { configureAnalytics } from '../scripts/configure-analytics.mjs';
import { readAnalytics } from '../scripts/analytics-config.mjs';
import { DEFAULT_ANALYTICS, renderAnalytics } from '../js/analytics-render.mjs';
import { GATE_FILES, preparePrivatePages } from '../scripts/private-preview.mjs';

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

test('private Pages exposes the stats login entry and gate tracker while keeping the editor and full-site tracking private', async t => {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-analytics-pages-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const path of [...GATE_FILES, 'templates/access.html']) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await cp(new URL(`../${path}`, import.meta.url), join(root, path));
  }
  await mkdir(join(root, 'content'));
  await configureAnalytics(websiteId, root);
  const config = await readAnalytics(root);
  await writeFile(join(root, 'index.html'), `<!doctype html><html lang="es"><head>${renderAnalytics(config)}</head><body>Sitio reservado</body></html>`);
  const output = await preparePrivatePages(root, { password: 'Synthetic test preview password' });
  const gate = await readFile(join(output, 'index.html'), 'utf8');
  const gateConfig = JSON.parse(/id="analytics-config"[^>]*>(.*?)<\/script>/.exec(gate)[1]);
  assert.equal(gateConfig.phase, 'gate');
  assert.equal(gateConfig.websiteId, websiteId);
  assert.doesNotMatch(gate, /\{\{TELEMETRY\}\}|Sitio reservado/);
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
});
