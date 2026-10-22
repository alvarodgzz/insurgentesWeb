import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DRIVE_PATHS, isDrivePath, relativeDrivePath, drivePathForUpdate, buildDriveEntries, assembleDriveContent } from '../js/drive-layout.mjs';
import { createZip, createDriveZip } from '../js/update-bundle.mjs';

const read = async (name) => JSON.parse(await readFile(new URL(`../content/${name}.json`, import.meta.url), 'utf8'));
const roots = { site: await read('site'), releases: await read('releases'), lyrics: await read('lyrics') };
const importFiles = (entries, prefix = '') => entries.map(({ name, data }) => ({ path: prefix + name, data }));

test('Drive ZIP supports the section layout while keeping GitHub and Drive destination allowlists separate', async () => {
  const zip = await createDriveZip(buildDriveEntries(roots));
  assert.equal(zip.type, 'application/zip');
  const bytes = new Uint8Array(await zip.arrayBuffer());
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  assert.ok(new TextDecoder().decode(bytes).includes(DRIVE_PATHS.baseline));
  await assert.rejects(createZip(buildDriveEntries(roots)), /Ruta.*no válida/);
  await assert.rejects(createDriveZip([{name: 'content/site.json', data: '{}'}]), /Ruta.*no válida/);
  await assert.rejects(createDriveZip([{name: '05 - Galeria/../../evil.js', data: ''}]), /Ruta.*no válida/);
});

test('Drive folder round-trips all content and selected photos under an arbitrary root name', async () => {
  const image = new Blob(['photo fixture'], { type: 'image/jpeg' });
  const photos = new Map([[roots.site.hero.image, image], [roots.site.about.image, image], [roots.site.gallery[0].image, image]]);
  const entries = buildDriveEntries(roots, photos);
  assert.equal(entries.length, Object.keys(DRIVE_PATHS).length + photos.size);
  assert.ok(entries.every((entry) => isDrivePath(entry.name)));
  assert.ok(!entries.some((entry) => entry.name.endsWith('index.html')));
  const imported = await assembleDriveContent(importFiles(entries, 'Los Insurgentes - Sitio/'));
  assert.deepEqual(imported.site, roots.site);
  assert.deepEqual(imported.releases, roots.releases);
  assert.deepEqual(imported.lyrics, roots.lyrics);
  assert.deepEqual([...imported.photos], [...photos]);
});

test('Drive section files replace their baseline section without losing global settings', async () => {
  const entries = buildDriveEntries(roots);
  const hero = { ...roots.site.hero, announcement: 'Próximo anuncio autorizado por la banda' };
  entries.find((entry) => entry.name === DRIVE_PATHS.hero).data = JSON.stringify(hero);
  entries.splice(entries.findIndex((entry) => entry.name === DRIVE_PATHS.about), 1);
  const imported = await assembleDriveContent(importFiles(entries));
  assert.deepEqual(imported.site.hero, hero);
  assert.deepEqual(imported.site.about, roots.site.about);
  assert.deepEqual(imported.site.site, roots.site.site);
  assert.deepEqual(imported.site.socials, roots.site.socials);
});

test('Drive import refuses missing source files, duplicate names, malformed and oversized JSON', async () => {
  for (const key of ['baseline', 'releases', 'lyrics']) {
    await assert.rejects(assembleDriveContent(importFiles(buildDriveEntries(roots).filter((entry) => entry.name !== DRIVE_PATHS[key]))), /Falta .*Selecciona la carpeta completa/);
  }
  const files = importFiles(buildDriveEntries(roots));
  await assert.rejects(assembleDriveContent([...files, files[0]]), /mismo nombre/);
  await assert.rejects(assembleDriveContent(files.map((file) => file.path === DRIVE_PATHS.hero ? { ...file, data: '{bad' } : file)), /formato JSON.*inicio.json/);
  await assert.rejects(assembleDriveContent(files.map((file) => file.path === DRIVE_PATHS.hero ? { ...file, data: ' '.repeat(2 * 1024 * 1024 + 1) } : file)), /demasiado grande/);
});

test('Drive paths only accept known section files and reject traversal, executable files and credentials', async () => {
  for (const path of ['../01 - Inicio/01-inicio.jpg', 'site/../01 - Inicio/01-inicio.jpg', '/01 - Inicio/01-inicio.jpg', '01 - Inicio\\01-inicio.jpg', '01 - Inicio/evil.js', '00 - Guia y ajustes/token.json', '05 - Galeria/../../.git/config', '05 - Galeria/photo.jpg', '__proto__']) {
    assert.equal(isDrivePath(path), false, path);
    assert.equal(relativeDrivePath(path), null, path);
    assert.equal(drivePathForUpdate(path, roots.site), null, path);
  }
  const imported = await assembleDriveContent([
    ...importFiles(buildDriveEntries(roots)),
    { path: '00 - Guia y ajustes/LEEME.txt', data: 'La guía se ignora al importar.' },
    { path: '05 - Galeria/script.js', data: 'alert(1)' }
  ]);
  assert.deepEqual(imported.site, roots.site);
});

test('Drive photo mapping preserves numbered filenames when gallery order changes and refuses unmapped photos', async () => {
  const changed = structuredClone(roots);
  changed.site.gallery.reverse();
  const canonical = roots.site.gallery[0].image;
  assert.equal(drivePathForUpdate(canonical, changed.site), '05 - Galeria/01.jpg');
  const data = new Blob(['fixture'], { type: 'image/jpeg' });
  const imported = await assembleDriveContent(importFiles(buildDriveEntries(changed, new Map([[canonical, data]]))));
  assert.equal(imported.photos.get(canonical), data);
  assert.throws(() => buildDriveEntries(roots, new Map([['content/photos/extra.jpg', data]])), /espacio compatible/);
  changed.site.gallery[0].image = '../private.jpg';
  await assert.rejects(assembleDriveContent(importFiles(buildDriveEntries(changed))), /espacios numerados/);
});
