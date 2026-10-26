import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { DEFAULT_ANALYTICS, renderAnalytics, validateAnalytics } from '../js/analytics-render.mjs';

const websiteId = 'e09631f9-3445-4c9e-b00b-3ef9afc3e172';
const enabled = { version: 1, enabled: true, websiteId };
const browserSource = await readFile(new URL('../js/analytics.js', import.meta.url), 'utf8');

function browserFixture({ config, location, navigator: navigatorOverrides, privatePreview = false, framed = false, referrer = '' } = {}) {
  const scripts = [];
  const calls = [];
  const configuration = config === undefined ? { enabled: true, websiteId, phase: 'gate', domains: ['losinsurgentes.mx', 'www.losinsurgentes.mx'] } : config;
  const window = {
    location: { protocol: 'https:', port: '', hostname: 'losinsurgentes.mx', pathname: '/', ...location },
    screen: { width: 1440, height: 900 },
    umami: { track(payload) { calls.push(JSON.parse(JSON.stringify(payload))); } },
  };
  window.self = window;
  window.top = framed ? {} : window;
  const navigator = { language: 'es-MX', doNotTrack: null, globalPrivacyControl: false, ...navigatorOverrides };
  const document = {
    referrer,
    documentElement: { dataset: { privatePreview: String(privatePreview) } },
    getElementById(id) {
      assert.equal(id, 'analytics-config', 'analytics must never inspect a password or another form field');
      return configuration === null ? null : { type: 'application/json', textContent: typeof configuration === 'string' ? configuration : JSON.stringify(configuration) };
    },
    createElement(tag) {
      assert.equal(tag, 'script');
      return { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
    },
    head: { appendChild(script) { scripts.push(script); } },
    querySelector() { assert.fail('Analytics must not inspect forms or page content'); },
  };
  Object.defineProperty(document, 'title', { get() { assert.fail('Analytics must use a fixed title instead of reading page content'); } });
  for (const property of ['search', 'hash', 'href']) Object.defineProperty(window.location, property, { get() { assert.fail(`Analytics must not read location.${property}`); } });
  const run = () => runInNewContext(browserSource, { window, document, navigator, URL });
  return { window, document, navigator, scripts, calls, run };
}

test('analytics defaults to no tracking and renders only a local bootstrap when explicitly configured', () => {
  assert.deepEqual(DEFAULT_ANALYTICS, { version: 1, enabled: false, websiteId: '' });
  assert.deepEqual(validateAnalytics(DEFAULT_ANALYTICS), DEFAULT_ANALYTICS);
  assert.equal(renderAnalytics(DEFAULT_ANALYTICS), '');
  assert.equal(renderAnalytics({ ...enabled, enabled: false }), '');
  assert.deepEqual(validateAnalytics(enabled), enabled);
  for (const phase of ['site', 'gate']) {
    const html = renderAnalytics(enabled, phase);
    const config = JSON.parse(/<script\b[^>]*\bid=["']analytics-config["'][^>]*>([\s\S]*?)<\/script>/i.exec(html)[1]);
    assert.equal(config.enabled, true);
    assert.equal(config.websiteId, websiteId);
    assert.equal(config.phase, phase);
    assert.deepEqual(config.domains, ['losinsurgentes.mx', 'www.losinsurgentes.mx']);
    assert.match(html, /<script\b[^>]*\bsrc=["'][^"']*js\/analytics\.js["']/);
    assert.doesNotMatch(html, /<script\b[^>]*\bsrc=["']https?:/i);
  }
});

test('analytics configuration refuses malformed identifiers and unknown fields that might expose secrets', () => {
  for (const config of [
    null, [], 'enabled',
    { ...enabled, version: 2 },
    { ...enabled, version: '1' },
    { ...enabled, enabled: 'true' },
    { ...enabled, websiteId: '' },
    { ...enabled, websiteId: 'https://provider.example/secret' },
    { ...enabled, websiteId: `${websiteId}\"><script>alert(1)</script>` },
    { ...enabled, websiteId: null },
    { ...enabled, apiKey: 'synthetic-server-secret' },
    { ...enabled, password: 'synthetic-private-password' },
    { ...enabled, domains: ['unexpected.example'] },
    { ...enabled, endpoint: 'https://unexpected.example/collect' },
  ]) assert.throws(() => validateAnalytics(config), undefined, JSON.stringify(config));
  assert.throws(() => renderAnalytics(enabled, '<script>untrusted phase</script>'));
});

test('analytics stays inactive on local, admin, private, framed and privacy-opt-out visits', () => {
  const cases = [
    { config: null },
    { config: '{invalid JSON' },
    { config: { ...enabled, enabled: false, phase: 'gate', domains: ['losinsurgentes.mx'] } },
    { config: { ...enabled, websiteId: 'invalid-id', phase: 'gate', domains: ['losinsurgentes.mx'] } },
    { config: { ...enabled, phase: 'admin', domains: ['losinsurgentes.mx'] } },
    { config: { ...enabled, phase: 'gate', domains: ['unexpected.example'] } },
    { location: { protocol: 'http:' } },
    { location: { protocol: 'file:' } },
    { location: { hostname: 'localhost', port: '8000' } },
    { location: { hostname: '127.0.0.1' } },
    { location: { hostname: 'alvarodgzz.github.io', pathname: '/insurgentesWeb/' } },
    { location: { hostname: 'losinsurgentes.mx.evil.example' } },
    { location: { port: '8443' } },
    { location: { pathname: '/admin/' } },
    { location: { pathname: '/admin/estadisticas/' } },
    { location: { pathname: '/content/photos/01-inicio.jpg' } },
    { location: { pathname: '/nested/index.html' } },
    { privatePreview: true },
    { framed: true },
    { navigator: { doNotTrack: '1' } },
    { navigator: { doNotTrack: 1 } },
    { navigator: { globalPrivacyControl: true } },
  ];
  for (const options of cases) {
    const fixture = browserFixture(options);
    fixture.run();
    assert.equal(fixture.scripts.length, 0, JSON.stringify(options));
    assert.equal(fixture.calls.length, 0, JSON.stringify(options));
    assert.equal(fixture.window.__insurgentesAnalyticsStarted, undefined, JSON.stringify(options));
  }
});

test('analytics sends one sanitized root page view through the fixed provider and survives document replacement', () => {
  const fixture = browserFixture({ referrer: 'https://referrer.example/private-route?password=synthetic-secret#sensitive' });
  fixture.run();
  fixture.run();
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.calls.length, 0, 'No page view is sent before the provider loads');
  const script = fixture.scripts[0];
  assert.equal(script.src, 'https://cloud.umami.is/script.js');
  assert.equal(script.async, true);
  assert.equal(script.referrerPolicy, 'no-referrer');
  assert.deepEqual(script.attributes, { 'data-website-id': websiteId, 'data-auto-track': 'false', 'data-domains': 'losinsurgentes.mx,www.losinsurgentes.mx' });
  script.onload();
  assert.deepEqual(fixture.calls, [{
    website: websiteId, hostname: 'losinsurgentes.mx', url: '/',
    title: 'Los Insurgentes — Próximamente', language: 'es-MX', screen: '1440x900', referrer: 'https://referrer.example',
  }]);
  assert.doesNotMatch(JSON.stringify(fixture.calls), /synthetic-secret|password|sensitive|private-route/);
  fixture.document.documentElement.dataset.privatePreview = 'true';
  fixture.run();
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.calls.length, 1);
});

test('analytics removes internal, credentialed and non-web referrers and uses a fixed site title', () => {
  for (const referrer of [
    '', 'not a URL', 'https://losinsurgentes.mx/admin/?token=synthetic',
    'https://www.losinsurgentes.mx/?private=synthetic',
    'https://user:synthetic@external.example/private',
    'file:///private/synthetic', 'javascript:synthetic',
  ]) {
    const fixture = browserFixture({ referrer, config: { ...enabled, phase: 'site', domains: ['losinsurgentes.mx', 'www.losinsurgentes.mx'] } });
    fixture.window.location.hostname = 'www.losinsurgentes.mx';
    fixture.window.location.pathname = '/index.html';
    fixture.run();
    fixture.scripts[0].onload();
    assert.equal(fixture.calls[0].referrer, '', referrer);
    assert.equal(fixture.calls[0].url, '/');
    assert.equal(fixture.calls[0].title, 'Los Insurgentes');
  }
});

test('blocked or failing analytics cannot interrupt the page or leak a second page view', async () => {
  const fixture = browserFixture();
  fixture.run();
  assert.doesNotThrow(() => fixture.scripts[0].onerror(new Error('Provider blocked')));
  fixture.run();
  assert.equal(fixture.scripts.length, 1);
  fixture.window.umami.track = () => { throw new Error('Provider unavailable'); };
  assert.doesNotThrow(() => fixture.scripts[0].onload());
  fixture.window.umami.track = () => Promise.reject(new Error('Provider request rejected'));
  assert.doesNotThrow(() => fixture.scripts[0].onload());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fixture.calls.length, 0);
});
