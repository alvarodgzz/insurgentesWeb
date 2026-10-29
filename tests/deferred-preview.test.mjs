import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { makeSelfContained } from '../scripts/private-preview.mjs';
import { renderNewsletter } from '../js/newsletter-render.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// A parser-order simulation, not a browser: expose markup only as each inline
// script is encountered. A head script cannot see a form still in the body.
function executeAsParsed(html, globals, observeMarkup) {
  const context = createContext(globals);
  let offset = 0;
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    observeMarkup(html.slice(offset, match.index));
    runInContext(match[1], context);
    offset = match.index + match[0].length;
  }
  observeMarkup(html.slice(offset));
}

test('bundled deferred scripts wait for body markup and retain source order after synchronous scripts', async t => {
  const root = await mkdtemp(join(tmpdir(), 'insurgentes-deferred-preview-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'js'));
  await writeFile(join(root, 'js/head.js'), "order.push(['head-sync', Boolean(document.getElementById('ready'))]);");
  await writeFile(join(root, 'js/first.js'), `/*${' '.repeat(256 * 1024)}*/\norder.push(['first-deferred', Boolean(document.getElementById('ready'))]); literals.push('$&');`);
  await writeFile(join(root, 'js/second.js'), "order.push(['second-deferred', Boolean(document.getElementById('ready'))]);");
  const source = `<!doctype html><html><head>
    <script src="js/head.js"></script>
    <script src="js/first.js" defer></script>
    <script defer src="js/second.js"></script>
    </head><body><div id="ready"></div>
    <script>order.push(['body-sync', Boolean(document.getElementById('ready'))]);</script>
    </body></html>`;
  const html = await makeSelfContained(root, source);
  let parsed = '';
  const order = [];
  const literals = [];
  executeAsParsed(html, {
    order, literals,
    document: { getElementById(id) {
      if (id === 'ready') return parsed.includes('id="ready"') ? {} : null;
      if (id === 'previewLock') return { addEventListener() {} };
      return null;
    } },
    addEventListener() {}, location: { reload() {} },
  }, markup => { parsed += markup; });
  assert.deepEqual(order.map(row => Array.from(row)), [
    ['head-sync', false], ['body-sync', true], ['first-deferred', true], ['second-deferred', true],
  ]);
  assert.deepEqual(literals, ['$&'], 'moving script content must preserve replacement-like string literals');
  assert.doesNotMatch(html, /<script[^>]+src=/);
});

test('bundled Maratón initializes signup after its form exists and prevents native navigation on submit', async () => {
  const destination = 'https://band.sibforms.com/serve/synthetic_signup_fixture==';
  const source = (await readFile(join(projectRoot, 'templates/maraton.html'), 'utf8'))
    .replaceAll('{{BASE}}', '/')
    .replaceAll('{{TELEMETRY}}', '')
    .replaceAll('{{NEWSLETTER}}', renderNewsletter({ version: 1, enabled: true, provider: 'brevo', formUrl: destination }));
  const html = await makeSelfContained(projectRoot, source);
  let parsed = '';
  const events = new Map();
  const requests = [];
  const attributes = new Map();
  const timers = new Map();
  const email = { value: 'fan@example.invalid', readOnly: false };
  const button = { textContent: 'Quiero enterarme', disabled: false };
  const status = { textContent: '', hidden: true, dataset: {}, focus() { this.focused = true; } };
  const form = {
    action: destination,
    addEventListener(type, callback) { events.set(type, callback); },
    querySelector(selector) {
      if (selector === 'button[type="submit"]') return button;
      if (selector === 'input[name="EMAIL"]') return email;
      return null;
    },
    reportValidity: () => true,
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
  };
  const formParsed = () => /data-newsletter-form[\s\S]*?<\/form>/.test(parsed);
  const context = {
    document: {
      querySelector(selector) {
        if (selector === '[data-signup-start]') return parsed.includes('data-signup-start') ? { addEventListener() {} } : null;
        if (selector === '[data-newsletter-form]') return formParsed() ? form : null;
        if (selector === '[data-newsletter-status]') return formParsed() ? status : null;
        return null;
      },
      getElementById(id) { return id === 'previewLock' ? { addEventListener() {} } : null; },
    },
    FormData: class {
      constructor(target) { assert.equal(target, form); }
      *[Symbol.iterator]() {
        yield ['EMAIL', email.value]; yield ['email_address_check', ''];
        yield ['locale', 'es']; yield ['html_type', 'simple'];
      }
    },
    URLSearchParams, AbortController,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ success: true }) };
    },
    setTimeout(callback) { timers.set(1, callback); return 1; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { callback(); },
    addEventListener() {}, location: { reload() {} },
  };
  context.window = context;
  executeAsParsed(html, context, markup => { parsed += markup; });
  assert.ok(events.has('submit'), 'the actual bundled signup must install its submit listener after parsing the form');
  const event = { prevented: false, preventDefault() { this.prevented = true; } };
  const pending = events.get('submit')(event);
  assert.equal(event.prevented, true, 'submission must stay in the landing before any asynchronous work');
  await pending;
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, destination);
  assert.deepEqual([...requests[0].options.body], [
    ['EMAIL', 'fan@example.invalid'], ['email_address_check', ''], ['locale', 'es'], ['html_type', 'simple'],
  ]);
  assert.equal(requests[0].options.credentials, 'omit');
  assert.equal(requests[0].options.referrerPolicy, 'no-referrer');
  assert.equal(status.dataset.state, 'success');
  assert.match(status.textContent, /gracias por sumarte/i);
  assert.equal(status.hidden, false);
  assert.equal(email.value, '');
  assert.equal(button.disabled, true);
  assert.equal(timers.size, 0);
  assert.equal(attributes.has('aria-busy'), false);
});
