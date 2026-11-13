import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

test('entering from the private album banner reveals the existing site and moves keyboard focus without another request', async () => {
  const intro = { hidden: false };
  const site = { hidden: true, inert: true, removeAttribute(name) { assert.equal(name, 'inert'); this.inert = false; } };
  const main = { focus(options) { assert.equal(options.preventScroll, true); this.focused = true; } };
  const listeners = new Map();
  const enter = { addEventListener(name, callback) { listeners.set(name, callback); } };
  const elements = new Map([['band-intro', intro], ['band-site', site], ['band-intro-enter', enter], ['main', main]]);
  const scrolls = [];
  runInNewContext(await readFile(new URL('../js/band-intro.js', import.meta.url), 'utf8'), {
    document: { getElementById(id) { return elements.get(id); } },
    window: { scrollTo(options) { scrolls.push(options); } },
    fetch() { assert.fail('Entering the site must not send a request or password'); },
  });
  assert.equal(intro.hidden, false);
  assert.equal(site.hidden, true);
  assert.equal(site.inert, true);
  let prevented = false;
  listeners.get('click')({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(intro.hidden, true);
  assert.equal(site.hidden, false);
  assert.equal(site.inert, false);
  assert.equal(main.focused, true);
  assert.equal(scrolls.length, 1);
  assert.equal(scrolls[0].top, 0);
});
