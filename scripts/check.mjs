#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateContent } from '../js/site-render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const read = (path) => readFile(resolve(root, path), 'utf8');
const decode = (value = '') => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(?:x([a-f\d]+)|(\d+));?/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)));
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((match) => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4])]));
const cssURLs = (css) => [...css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^'"\)]*))\s*\)/g)].map((match) => match[1] ?? match[2] ?? match[3]);

async function localReference(value, file) {
  if (!value || value.startsWith('#') || /^(?:https:|mailto:|tel:|data:)/i.test(value)) return;
  if (/^[\w+.-]+:|^\/\//.test(value)) {
    errors.push(`${file}: unsafe URL ${value}`);
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(value.split(/[?#]/)[0]); }
  catch { errors.push(`${file}: malformed URL ${value}`); return; }
  if (!pathname) return;
  const target = pathname.startsWith('/') ? resolve(root, `.${pathname}`) : resolve(root, dirname(file), pathname);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    errors.push(`${file}: asset outside project ${value}`);
    return;
  }
  try { await stat(target); }
  catch { errors.push(`${file}: missing local target ${value}`); }
}

async function inspectHTML(file) {
  const html = (await read(file)).replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...html.matchAll(/<([a-z][\w-]*)\b[^>]*>/gi)].map((match) => ({ name: match[1].toLowerCase(), attrs: attributes(match[0]), tag: match[0] }));
  const ids = new Set();
  for (const { attrs } of tags) {
    if (!attrs.id) continue;
    if (ids.has(attrs.id)) errors.push(`${file}: duplicate id ${attrs.id}`);
    ids.add(attrs.id);
  }
  for (const { name, attrs, tag } of tags) {
    for (const attribute of ['href', 'src', 'poster']) {
      const value = attrs[attribute];
      if (value === undefined) continue;
      if (/[\u0000-\u001F\u007F]/.test(value) || /^(?:javascript:|vbscript:|file:|http:|\/\/)/i.test(value)) errors.push(`${file}: unsafe ${attribute} URL`);
      if (name !== 'img' && /^data:/i.test(value)) errors.push(`${file}: unexpected data URL`);
      if (value.startsWith('#') && value.length > 1 && !ids.has(decodeURIComponent(value.slice(1)))) errors.push(`${file}: missing fragment ${value}`);
      if (value === '#') errors.push(`${file}: placeholder link`);
      await localReference(value, file);
    }
    if (attrs.srcset) for (const candidate of attrs.srcset.split(',')) await localReference(candidate.trim().split(/\s+/)[0], file);
    if (attrs.style) for (const value of cssURLs(attrs.style)) await localReference(value, file);
    if (name === 'img') {
      if (attrs.alt === undefined) errors.push(`${file}: image without alt text`);
      if (attrs.id !== 'lightboxImg') {
        if (!attrs.src) errors.push(`${file}: image without src`);
        if (!(Number(attrs.width) > 0 && Number(attrs.height) > 0)) errors.push(`${file}: image without dimensions ${attrs.src || ''}`);
      }
    }
    if (name === 'iframe' && !attrs.title?.trim()) errors.push(`${file}: iframe without title`);
    for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      if (attrs[attribute]) for (const id of attrs[attribute].split(/\s+/)) if (!ids.has(id)) errors.push(`${file}: missing ${attribute} target ${id}`);
    }
    if (name === 'a' && attrs.target === '_blank' && !/\bnoopener\b/.test(attrs.rel || '')) errors.push(`${file}: external link without noopener`);
    if (name === 'input' && !/type\s*=\s*["']?hidden/i.test(tag) && !attrs['aria-label'] && !attrs['aria-labelledby'] && !(attrs.id && new RegExp(`<label\\b[^>]*for=["']${attrs.id}["']`).test(html))) errors.push(`${file}: input without a label`);
  }
  for (const match of html.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const attrs = attributes(match[2]);
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    const imageLabel = /<img\b[^>]*alt=["'][^"']+/.test(match[3]);
    if (!text && !imageLabel && !attrs['aria-label'] && !attrs['aria-labelledby']) errors.push(`${file}: ${match[1]} without an accessible name`);
  }
  return tags.length;
}

try {
  const site = JSON.parse(await read('content/site.json'));
  const releases = JSON.parse(await read('content/releases.json'));
  const lyrics = JSON.parse(await read('content/lyrics.json'));
  errors.push(...validateContent(site, releases, lyrics).map((error) => `Content: ${error}`));
  const tagCount = await inspectHTML('index.html');
  // Admin navigation and form labels are generated at runtime; check its static
  // asset references without treating those future targets as missing elements.
  const adminHTML = (await read('admin/index.html')).replace(/<!--[\s\S]*?-->/g, '');
  for (const tag of adminHTML.matchAll(/<[a-z][\w-]*\b[^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    for (const attribute of ['href', 'src']) if (attrs[attribute]) await localReference(attrs[attribute], 'admin/index.html');
  }
  for (const file of ['css/style.css', 'css/spotify.css', 'css/access.css', 'admin/editor.css']) {
    const css = (await read(file)).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const value of cssURLs(css)) await localReference(value, file);
  }
  for (const file of ['js/main.js', 'js/spotify.js', 'js/access.js', 'js/site-render.mjs', 'js/lyrics-render.mjs', 'js/music-render.mjs', 'js/update-bundle.mjs', 'admin/editor.mjs', 'scripts/build.mjs', 'scripts/preview.mjs', 'scripts/prepare-pages.mjs', 'scripts/private-preview.mjs', 'scripts/lookup-lyrics.mjs']) {
    const result = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
    if (result.status !== 0) errors.push(`${file}: syntax check failed\n${result.stderr}`);
  }
  if (!errors.length) console.log(`Site checks passed: content schema, ${tagCount} HTML elements, local assets, fragments, accessible names, URLs and JavaScript syntax.`);
} catch (error) {
  errors.push(error.message);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
