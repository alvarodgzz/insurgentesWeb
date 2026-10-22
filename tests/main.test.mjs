import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../js/main.js', import.meta.url), 'utf8');

// A small DOM double for interaction regressions. This does not simulate layout,
// native event bubbling, image loading or assistive technology in a real browser.
function environment(reduced = false) {
  let document;
  class Element {
    constructor(tagName = 'DIV') {
      Object.assign(this, { tagName, attrs: {}, style: {}, events: new Map(), children: [], inert: false, offsetParent: {}, textContent: '' });
      const classes = new Set();
      this.classList = {
        add: (...items) => items.forEach(item => classes.add(item)),
        remove: (...items) => items.forEach(item => classes.delete(item)),
        contains: item => classes.has(item),
        toggle: (item, enabled = !classes.has(item)) => { enabled ? classes.add(item) : classes.delete(item); return enabled; }
      };
    }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    addEventListener(type, callback) {
      if (!this.events.has(type)) this.events.set(type, new Set());
      this.events.get(type).add(callback);
    }
    removeEventListener(type, callback) { this.events.get(type)?.delete(callback); }
    fire(type, detail = {}) {
      const event = { target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...detail };
      [...(this.events.get(type) || [])].forEach(callback => callback(event));
      return event;
    }
    focus() { document.activeElement = this; }
    contains(element) { return element === this || this.children.some(child => child.contains(element)); }
    appendChild(element) { this.children.push(element); }
    querySelector(selector) { return this.selectors?.[selector] || null; }
    querySelectorAll(selector) { return this.lists?.[selector] || []; }
    closest() { return nav; }
    scrollIntoView() {}
  }
  const ids = Object.fromEntries(['year', 'navLinks', 'gallery', 'lightbox', 'lightboxBackdrop', 'lightboxClose', 'lightboxPrev', 'lightboxNext', 'lightboxImg', 'lightboxCaption', 'lightboxCounter', 'lightboxFilmstrip'].map(id => [id, new Element()]));
  const toggle = new Element('BUTTON'), nav = new Element('NAV'), header = new Element('HEADER'), main = new Element('MAIN'), footer = new Element('FOOTER');
  const links = [new Element('A'), new Element('A')];
  ids.navLinks.children = links;
  ids.navLinks.lists = { a: links };
  nav.children = [toggle, ids.navLinks];
  header.children = [nav];
  const stage = new Element();
  const triggers = [0, 1, 2].map(index => {
    const button = new Element('BUTTON'), image = new Element('IMG');
    image.attrs = { src: `photo${index}.jpg`, sizes: '33vw', alt: `Photo ${index}` };
    // Shared-folder replacements have no generated responsive derivatives.
    if (index !== 1) image.attrs.srcset = `photo${index}-800.jpg 800w, photo${index}-1400.jpg 1400w`;
    button.selectors = { img: image };
    return button;
  });
  ids.gallery.lists = { '.gallery-trigger': triggers };
  ids.gallery.children = triggers;
  main.children = [ids.gallery];
  ids.lightbox.selectors = { '.lightbox-stage': stage };
  const buttons = [ids.lightboxClose, ids.lightboxPrev, ids.lightboxNext];
  ids.lightbox.lists = { button: buttons };
  const append = ids.lightboxFilmstrip.appendChild.bind(ids.lightboxFilmstrip);
  ids.lightboxFilmstrip.appendChild = element => { append(element); buttons.push(element); };
  document = new Element();
  document.body = new Element('BODY');
  document.documentElement = new Element('HTML');
  document.body.children = [header, main, footer, ids.lightbox, new Element('SCRIPT')];
  document.getElementById = id => ids[id];
  document.querySelector = selector => selector === '.nav-toggle' ? toggle : null;
  document.createElement = tag => new Element(tag.toUpperCase());
  const media = new Element();
  media.matches = true;
  const timers = new Map();
  let timerId = 0;
  const window = {
    matchMedia: query => query.includes('max-width') ? media : { matches: reduced },
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: id => timers.delete(id),
    getComputedStyle: () => ({ getPropertyValue: () => '-2deg' })
  };
  runInNewContext(source, { document, window, Date, Map, Array });
  return {
    ids, toggle, links, document, media, header, main, footer, triggers, timers, stage,
    flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); }
  };
}

test('mobile menu restores focus and stays operable across resize and dismissal', () => {
  const e = environment();
  assert.equal(e.ids.navLinks.inert, true);
  e.toggle.fire('click');
  assert.equal(e.ids.navLinks.inert, false);
  assert.equal(e.toggle.getAttribute('aria-label'), 'Cerrar menú');
  e.document.fire('keydown', { key: 'Escape' });
  assert.equal(e.ids.navLinks.inert, true);
  assert.equal(e.document.activeElement, e.toggle);
  e.toggle.fire('click');
  e.document.fire('click', { target: e.main });
  assert.equal(e.toggle.getAttribute('aria-expanded'), 'false');
  e.media.matches = false;
  e.media.fire('change');
  assert.equal(e.ids.navLinks.inert, false, 'desktop links remain operable');
  e.links[0].focus();
  e.media.matches = true;
  e.media.fire('change');
  assert.equal(e.document.activeElement, e.toggle, 'resize cannot strand focus in a collapsed menu');
  e.toggle.fire('click');
  e.links[0].fire('click');
  assert.equal(e.ids.navLinks.inert, true);
  assert.equal(e.document.activeElement, e.toggle);
});

test('filmstrip thumbnails support original shared photos and responsive photos', () => {
  const e = environment();
  const thumbs = e.ids.lightboxFilmstrip.children;
  assert.equal(thumbs.length, 3);
  assert.equal(thumbs[0].children[0].src, 'photo0-800.jpg');
  assert.equal(thumbs[1].children[0].src, 'photo1.jpg', 'missing srcset falls back to the original image');
  assert.equal(thumbs[2].children[0].src, 'photo2-800.jpg');
  e.triggers[0].fire('click');
  thumbs[1].fire('click');
  e.flush();
  assert.equal(e.ids.lightboxImg.src, 'photo1.jpg');
  assert.equal(e.ids.lightboxImg.srcset, '');
});

test('gallery handles rapid navigation, wraparound, close/reopen and inert restoration', () => {
  const e = environment();
  e.footer.inert = true;
  e.triggers[0].fire('click');
  assert.equal(e.ids.lightboxCounter.textContent, '1 / 3');
  assert.equal(e.main.inert, true);
  assert.equal(e.document.activeElement, e.ids.lightboxClose);
  e.ids.lightboxNext.fire('click');
  e.ids.lightboxNext.fire('click');
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '3 / 3');
  e.ids.lightboxNext.fire('click');
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '1 / 3');
  e.ids.lightboxPrev.fire('click');
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '3 / 3');
  e.ids.lightboxNext.fire('click');
  e.ids.lightboxPrev.fire('click');
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '3 / 3', 'opposite rapid clicks cancel correctly');
  assert.equal(e.ids.lightboxFilmstrip.children[2].getAttribute('aria-current'), 'true');
  e.ids.lightboxNext.fire('click');
  e.ids.lightboxClose.fire('click');
  assert.equal(e.timers.size, 0, 'closing cancels queued navigation');
  assert.equal(e.main.inert, false);
  assert.equal(e.footer.inert, true, 'pre-existing inert state survives closing');
  assert.equal(e.document.activeElement, e.triggers[0]);
  e.triggers[1].fire('click');
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '2 / 3', 'reopening has no stale transition');
  e.document.fire('keydown', { key: 'ArrowRight' });
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '3 / 3');
  e.document.fire('keydown', { key: 'Escape' });
  assert.equal(e.ids.lightbox.getAttribute('aria-hidden'), 'true');
  assert.equal(e.document.activeElement, e.triggers[1]);
});

test('gallery traps focus among visible buttons and supports swipes and backdrop dismissal', () => {
  const e = environment();
  e.triggers[0].fire('click');
  const thumbs = e.ids.lightboxFilmstrip.children;
  thumbs.at(-1).focus();
  assert.equal(e.document.fire('keydown', { key: 'Tab' }).defaultPrevented, true);
  assert.equal(e.document.activeElement, e.ids.lightboxClose);
  thumbs.forEach(thumb => { thumb.offsetParent = null; });
  assert.equal(e.document.fire('keydown', { key: 'Tab', shiftKey: true }).defaultPrevented, true);
  assert.equal(e.document.activeElement, e.ids.lightboxNext, 'hidden mobile thumbnails are excluded');
  e.stage.fire('touchstart', { changedTouches: [{ clientX: 100 }] });
  e.stage.fire('touchend', { changedTouches: [{ clientX: 20 }] });
  e.flush();
  assert.equal(e.ids.lightboxCounter.textContent, '2 / 3');
  e.ids.lightboxBackdrop.fire('click');
  assert.equal(e.ids.lightbox.getAttribute('aria-hidden'), 'true');
  assert.equal(e.document.activeElement, e.triggers[0]);
});

test('reduced-motion gallery advances immediately without animation timers', () => {
  const e = environment(true);
  e.triggers[0].fire('click');
  assert.equal(e.ids.lightboxImg.style.transform, 'none');
  e.ids.lightboxNext.fire('click');
  assert.equal(e.ids.lightboxCounter.textContent, '2 / 3');
  assert.equal(e.timers.size, 0);
});
