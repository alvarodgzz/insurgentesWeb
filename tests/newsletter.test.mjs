import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DEFAULT_NEWSLETTER, renderNewsletter, validateNewsletter } from '../js/newsletter-render.mjs';
import { readNewsletter } from '../scripts/newsletter-config.mjs';
import { configureNewsletter } from '../scripts/configure-newsletter.mjs';

const formUrl = 'https://band.sibforms.com/serve/MUIFA_fixture-123';
const configured = { version: 1, enabled: true, provider: 'brevo', formUrl };
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(([, name, value]) => [name, value]));

test('newsletter stays visibly pending without pretending to collect or save addresses', () => {
  assert.deepEqual(DEFAULT_NEWSLETTER, { version: 1, enabled: false, provider: 'brevo', formUrl: '' });
  assert.deepEqual(validateNewsletter(DEFAULT_NEWSLETTER), DEFAULT_NEWSLETTER);
  const html = renderNewsletter();
  assert.match(html, /registro abrirá pronto/i);
  assert.match(html, /<label\b[^>]*for="[^"]+"/);
  assert.match(html, /<input\b[^>]*type="email"[^>]*disabled|<input\b[^>]*disabled[^>]*type="email"/);
  assert.match(html, /<button\b[^>]*disabled/);
  assert.doesNotMatch(html, /<iframe|\baction=|localStorage|sessionStorage|fetch\(|sendBeacon\(|gracias por registrarte|suscripción confirmada/i);
  assert.doesNotMatch(renderNewsletter({ ...configured, enabled: false }), /<iframe|src="https:/);
});

test('configured newsletter submits only the expected native fields to Brevo without client-side collection', () => {
  assert.deepEqual(validateNewsletter(configured), configured);
  const html = renderNewsletter(configured);
  const formTag = /<form\b[^>]*>/.exec(html)?.[0];
  assert.ok(formTag, 'a native form must work without JavaScript');
  const form = attributes(formTag);
  assert.equal(form.id, 'sib-form');
  assert.ok(form.class.split(/\s+/).includes('newsletter-form'));
  assert.equal(form.method.toLowerCase(), 'post');
  assert.equal(form.action, formUrl);
  assert.equal(form['accept-charset'].toLowerCase(), 'utf-8');
  assert.ok(!form.target || form.target === '_self', 'the provider response stays in the same tab');
  assert.doesNotMatch(formTag, /\bnovalidate\b/i);
  const controls = [...html.matchAll(/<(?:input|button|select|textarea)\b[^>]*>/g)].map(match => ({ tag: match[0], attrs: attributes(match[0]) }));
  const named = controls.filter(control => control.attrs.name);
  assert.deepEqual(named.map(control => control.attrs.name).sort(), ['EMAIL', 'email_address_check', 'locale', 'html_type'].sort());
  const email = named.find(control => control.attrs.name === 'EMAIL');
  assert.equal(email.attrs.id, 'EMAIL');
  assert.equal(email.attrs.type, 'email');
  assert.equal(email.attrs.autocomplete, 'email');
  assert.match(email.tag, /\brequired\b/);
  assert.doesNotMatch(email.tag, /\bdisabled\b/);
  assert.match(html, /<label\b[^>]*for="EMAIL"/);
  const honeypot = named.find(control => control.attrs.name === 'email_address_check');
  assert.equal(honeypot.attrs.type, 'text');
  assert.equal(honeypot.attrs.tabindex, '-1');
  assert.equal(honeypot.attrs.autocomplete, 'off');
  assert.doesNotMatch(honeypot.tag, /\bdisabled\b/);
  assert.match(html, /aria-hidden="true"/);
  const locale = named.find(control => control.attrs.name === 'locale');
  assert.equal(locale.attrs.type, 'hidden');
  assert.equal(locale.attrs.value, 'es');
  const htmlType = named.find(control => control.attrs.name === 'html_type');
  assert.equal(htmlType.attrs.type, 'hidden');
  assert.equal(htmlType.attrs.value, 'simple');
  assert.match(html, /<button\b[^>]*type="submit"[^>]*>[\s\S]*?Quiero enterarme/);
  assert.match(html, /recibir[\s\S]*?Maratón/i);
  assert.match(html, new RegExp(`<a\\b[^>]*href="${formUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.doesNotMatch(html, /<iframe|<script|<link|api[_-]?key|password|localStorage|sessionStorage|fetch\(|sendBeacon\(|gracias por registrarte|suscripción confirmada|formnovalidate/i);
});

test('newsletter accepts Brevo versioned form URLs with base64 padding without changing their token', () => {
  for (const path of ['/serve/MUIFA_fixture-123=', '/v2/serve/MUIFA_fixture-123==', '/v2/serve/MUIFA_fixture-123']) {
    const url = `https://5302b1a3.sibforms.com${path}`;
    const config = validateNewsletter({ ...configured, formUrl: url });
    assert.equal(config.formUrl, url);
    const html = renderNewsletter(config);
    const action = attributes(/<form\b[^>]*>/.exec(html)[0]).action;
    assert.equal(action, url.replace('/v2/serve/', '/serve/'));
    assert.match(html, new RegExp(`<a\\b[^>]*href="${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.equal(new URL(action).pathname.split('/').at(-1), path.split('/').at(-1), 'normalization must preserve the padded token');
  }
  for (const path of ['/v3/serve/token', '/v2/serve/token===', '/v2/serve/to=ken', '/v2/serve/token/extra']) {
    assert.throws(() => validateNewsletter({ ...configured, formUrl: `https://band.sibforms.com${path}` }));
  }
});

test('native form normalization cannot turn a query or impostor host into a trusted POST target', () => {
  for (const url of [
    'https://band.sibforms.com/v2/serve/token==?next=https://evil.example',
    'https://band.sibforms.com.evil.example/v2/serve/token==',
    'https://evil.example/v2/serve/token==',
    'https://band.sibforms.com/v2/serve/token==#private',
  ]) assert.throws(() => renderNewsletter({ ...configured, formUrl: url }));
});

test('Simple HTML uses its supplied POST token while preserving the original hosted fallback', () => {
  const hosted = 'https://band.sibforms.com/v2/serve/hosted_fixture==';
  const submitUrl = 'https://band.sibforms.com/serve/simple_fixture==';
  const config = { ...configured, formUrl: hosted, submitUrl };
  assert.deepEqual(validateNewsletter(config), config);
  const html = renderNewsletter(config);
  assert.equal(attributes(/<form\b[^>]*>/.exec(html)[0]).action, submitUrl);
  assert.ok(html.includes(`href="${hosted}"`));
  assert.ok(!html.includes(`action="${hosted}"`));
  assert.match(html, /name="html_type" value="simple"/);
  assert.doesNotMatch(html, /<script|<iframe|fetch\(/);
});

test('an explicit POST destination cannot bypass the Brevo URL restrictions', () => {
  for (const submitUrl of ['', null, 1, 'http://band.sibforms.com/serve/token',
    'https://evil.example/serve/token', 'https://band.sibforms.com.evil.example/serve/token',
    'https://user:synthetic-password@band.sibforms.com/serve/token',
    'https://band.sibforms.com:8443/serve/token', 'https://band.sibforms.com/serve/token?email=private',
    'https://band.sibforms.com/serve/token#private', 'https://band.sibforms.com/serve/token/extra']) {
    assert.throws(() => renderNewsletter({ ...configured, submitUrl }));
  }
});

test('newsletter configuration rejects untrusted form destinations, injected markup and secret fields', () => {
  const destinations = [
    '', 'javascript:alert(1)', 'http://band.sibforms.com/serve/form',
    'https://sibforms.com.evil.example/serve/form', 'https://evil.example/serve/form',
    'https://user:synthetic-password@band.sibforms.com/serve/form',
    'https://band.sibforms.com:8443/serve/form',
    'https://band.sibforms.com/serve/form?email=private',
    'https://band.sibforms.com/serve/form#private',
    'https://band.sibforms.com/other/form', 'https://band.sibforms.com/serve/',
    'https://band.sibforms.com/serve/%2e%2e', 'https://band.sibforms.com/serve/form/extra',
    'https://band.sibforms.com/serve/"><script>alert(1)</script>',
    `https://band.sibforms.com/serve/${'a'.repeat(4097)}`,
  ];
  for (const value of destinations) assert.throws(() => validateNewsletter({ ...configured, formUrl: value }), undefined, value);
  for (const value of [
    null, [], '', { ...configured, version: 2 }, { ...configured, enabled: 'true' },
    { ...configured, provider: 'untrusted' }, { ...configured, formUrl: null },
    { ...configured, apiKey: 'synthetic-secret' }, { ...configured, password: 'synthetic-secret' },
    { ...configured, email: 'private@example.invalid' },
  ]) assert.throws(() => validateNewsletter(value));
});

test('newsletter setup stores only a public form configuration, rejects invalid updates and can disable it', async t => {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-newsletter-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'content'));
  assert.deepEqual(await readNewsletter(root), DEFAULT_NEWSLETTER);
  await configureNewsletter(formUrl, root);
  assert.deepEqual(await readNewsletter(root), configured);
  await assert.rejects(configureNewsletter('https://untrusted.example/signup', root));
  assert.deepEqual(await readNewsletter(root), configured, 'invalid setup must preserve the previous valid form');
  const stored = JSON.parse(await readFile(join(root, 'content/newsletter.json'), 'utf8'));
  assert.deepEqual(Object.keys(stored).sort(), ['version', 'enabled', 'provider', 'formUrl'].sort());
  await configureNewsletter('--disable', root);
  assert.deepEqual(await readNewsletter(root), DEFAULT_NEWSLETTER);
});
