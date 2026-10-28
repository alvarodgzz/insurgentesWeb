import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../js/maraton.js', import.meta.url), 'utf8');
const action = 'https://band.sibforms.com/serve/simple_fixture==';
const address = 'fan@example.invalid';
const settled = () => new Promise(resolve => setImmediate(resolve));

function fixture({ reply = async () => ({ ok: true, json: async () => ({ success: true }) }), missing } = {}) {
  const events = new Map();
  const requests = [];
  const timers = new Map();
  let nextTimer = 0;
  function element(properties = {}) {
    const classes = new Set();
    return {
      dataset: {}, attributes: {}, hidden: false, disabled: false, textContent: '',
      classList: { add: (...values) => values.forEach(value => classes.add(value)), remove: (...values) => values.forEach(value => classes.delete(value)), toggle(value, force) { if (force ?? !classes.has(value)) classes.add(value); else classes.delete(value); } },
      setAttribute(name, value) { this.attributes[name] = String(value); },
      removeAttribute(name) { delete this.attributes[name]; },
      getAttribute(name) { return this.attributes[name] ?? null; },
      focus() { this.focused = true; },
      ...properties,
    };
  }
  const email = element({ value: address, name: 'EMAIL', type: 'email', readOnly: false });
  const button = element({ textContent: 'Quiero enterarme', innerHTML: 'Quiero enterarme <span>↗</span>' });
  const status = element({ hidden: true });
  const form = element({
    action, method: 'post',
    querySelector(selector) {
      if (selector === 'button[type="submit"]') return button;
      if (selector === 'input[name="EMAIL"]') return email;
      if (selector === '[data-newsletter-status]') return status;
      return null;
    },
    addEventListener(type, listener) { events.set(type, listener); },
    checkValidity: () => true,
    reportValidity: () => true,
    reset() { email.value = ''; },
  });
  const document = {
    querySelector(selector) {
      if (selector === '[data-newsletter-form]') return form;
      if (selector === '[data-newsletter-status]') return status;
      if (selector.includes('input[type="email"]')) return email;
      return null;
    },
  };
  class FormData {
    constructor(target) {
      assert.equal(target, form);
      this.values = new Map([['EMAIL', email.value], ['email_address_check', ''], ['locale', 'es'], ['html_type', 'simple']]);
    }
    entries() { return this.values.entries(); }
    [Symbol.iterator]() { return this.entries(); }
  }
  const context = {
    document, URL, URLSearchParams, FormData, AbortController,
    requestAnimationFrame: callback => callback(),
    fetch: async (url, options) => {
      requests.push({ url, options });
      return reply(url, options);
    },
    setTimeout(callback) { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
    localStorage: { setItem() { assert.fail('signup must not store addresses'); } },
    sessionStorage: { setItem() { assert.fail('signup must not store addresses'); } },
    navigator: { sendBeacon() { assert.fail('signup must not send analytics'); } },
    umami: { track() { assert.fail('signup must not send analytics'); } },
  };
  if (missing) delete context[missing];
  context.window = context;
  runInNewContext(source, context);
  async function submit() {
    const event = { prevented: false, preventDefault() { this.prevented = true; } };
    const completion = events.get('submit')?.(event);
    await completion;
    await settled();
    return event;
  }
  return { form, email, button, status, events, requests, timers, submit };
}

test('signup confirms inline only after a successful Brevo response and sends only the expected fields', async () => {
  const view = fixture();
  const event = await view.submit();
  assert.equal(event.prevented, true);
  assert.equal(view.requests.length, 1);
  const { url, options } = view.requests[0];
  assert.equal(url, action);
  assert.equal(options.method.toUpperCase(), 'POST');
  assert.deepEqual([...new URLSearchParams(options.body)], [
    ['EMAIL', address], ['email_address_check', ''], ['locale', 'es'], ['html_type', 'simple'],
  ]);
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.headers, undefined, 'let the browser encode this simple form request');
  assert.ok(options.signal);
  assert.match(view.status.textContent, /lista|gracias|registr/i);
  assert.equal(view.status.hidden, false);
  assert.equal(view.status.focused, true, 'the confirmed result must be reachable immediately by keyboard');
  assert.equal(view.email.value, '');
  assert.equal(view.email.readOnly, true);
  assert.equal(view.button.disabled, true, 'a successful form must not immediately submit a duplicate');
  assert.equal(view.form.getAttribute('aria-busy'), null);
  assert.equal(view.timers.size, 0);
});

test('signup blocks duplicate requests while pending and does not show success before the response', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const view = fixture({ reply: () => pending });
  const first = view.submit();
  assert.equal(view.requests.length, 1);
  assert.equal(view.button.disabled, true);
  assert.equal(view.email.readOnly, true);
  assert.equal(view.form.getAttribute('aria-busy'), 'true');
  assert.match(`${view.button.textContent} ${view.status.textContent}`, /enviando/i);
  assert.equal(view.email.value, address);
  await view.submit();
  assert.equal(view.requests.length, 1);
  resolve({ ok: true, json: async () => ({ success: true }) });
  await first;
  await view.submit();
  assert.equal(view.requests.length, 1, 'repeat activation after success must not send again');
});

test('signup preserves the address and restores retry after a provider rejection without inserting its markup', async () => {
  const malicious = '<img src=x onerror="alert(1)">';
  const view = fixture({ reply: async () => ({ ok: true, json: async () => ({ success: false, message: malicious }) }) });
  await view.submit();
  assert.equal(view.email.value, address);
  assert.equal(view.button.disabled, false);
  assert.equal(view.email.readOnly, false);
  assert.equal(view.status.hidden, false);
  assert.equal(view.status.focused, true);
  assert.equal(view.form.getAttribute('aria-busy'), null);
  assert.ok(view.status.textContent.length > 0);
  assert.ok(!view.status.textContent.includes(malicious));
  assert.doesNotMatch(view.status.textContent, /ya estás en la lista|gracias por sumarte/i);
  assert.equal(view.timers.size, 0);
});

test('signup requires a literal success true and a successful HTTP response', async () => {
  for (const response of [
    { ok: true, json: async () => ({ success: 'true' }) },
    { ok: true, json: async () => ({ message: 'success' }) },
    { ok: false, json: async () => ({ success: true }) },
  ]) {
    const view = fixture({ reply: async () => response });
    await view.submit();
    assert.equal(view.email.value, address);
    assert.equal(view.button.disabled, false);
    assert.doesNotMatch(view.status.textContent, /ya estás en la lista|gracias por sumarte/i);
    assert.equal(view.timers.size, 0);
  }
});

test('signup handles network and malformed response failures without losing the address or blindly retrying', async () => {
  for (const reply of [
    async () => { throw new TypeError('CORS or offline'); },
    async () => ({ ok: true, json: async () => { throw new SyntaxError('not JSON'); } }),
  ]) {
    const view = fixture({ reply });
    await view.submit();
    assert.equal(view.email.value, address);
    assert.equal(view.button.disabled, false);
    assert.equal(view.requests.length, 1);
    assert.match(view.status.textContent, /confirmar|comprobar|verificar|revisa/i);
    assert.doesNotMatch(view.status.textContent, /ya estás en la lista|gracias por sumarte/i);
    assert.equal(view.timers.size, 0);
  }
});

test('signup times out to an uncertain result instead of reporting acceptance or automatically resending', async () => {
  const view = fixture({ reply: (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Request aborted', 'AbortError')), { once: true });
  }) });
  const pending = view.submit();
  assert.equal(view.requests.length, 1);
  assert.ok(view.timers.size > 0);
  for (const timer of [...view.timers.values()]) timer();
  await pending;
  assert.equal(view.email.value, address);
  assert.equal(view.button.disabled, false);
  assert.equal(view.requests.length, 1);
  assert.match(view.status.textContent, /confirmar|comprobar|verificar|revisa/i);
  assert.equal(view.timers.size, 0);
});

test('signup keeps native submission when browser enhancement APIs are unavailable', async () => {
  for (const missing of ['fetch', 'FormData', 'URLSearchParams', 'AbortController']) {
    const view = fixture({ missing });
    const event = await view.submit();
    assert.equal(event.prevented, false, `${missing}: native POST must remain available`);
    assert.equal(view.requests.length, 0);
    assert.equal(view.button.disabled, false);
  }
});
