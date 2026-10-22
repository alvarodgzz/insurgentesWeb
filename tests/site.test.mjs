import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, access, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { renderLyrics, lyricSource } from '../js/lyrics-render.mjs';
import { renderMusic, spotifyAlbumId } from '../js/music-render.mjs';
import { renderSite, validateSite, validateContent, photoSlots } from '../js/site-render.mjs';
import { createZip, safeUpdatePath } from '../js/update-bundle.mjs';
import { preparePages, publicDirectories } from '../scripts/prepare-pages.mjs';

const fixture = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
const site = await fixture('content/site.json');
const releases = await fixture('content/releases.json');
const lyrics = await fixture('content/lyrics.json');
const template = await readFile(new URL('../templates/page.html', import.meta.url), 'utf8');
const copy = (value) => structuredClone(value);

test('lyrics omit unpublished entries and retain a useful empty state', () => {
  assert.doesNotMatch(renderLyrics([{ title: 'Inédita', text: '', sourceUrl: '' }]), /<details|lyrics-list|Inédita/);
  assert.match(renderLyrics([]), /disponibles próximamente/);
  const html = renderLyrics(lyrics);
  assert.match(html, /9MR5Nc9naFg/);
  assert.doesNotMatch(html, /<details/);
});

test('lyrics preserve newlines and escape titles and original text', () => {
  const html = renderLyrics([{ title: '<script>título</script>', text: '<img src=x onerror=alert(1)>\nOtro verso', sourceUrl: 'javascript:alert(1)' }]);
  assert.match(html, /&lt;script&gt;título/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;\nOtro verso/);
  assert.doesNotMatch(html, /<script|<img src=x|javascript:/);
  assert.match(html, /<details/);
});

test('lyrics accept individual trusted pages and remove tracking parameters', () => {
  for (const url of ['https://genius.com/Los-insurgentes-flores-lyrics', 'https://www.musixmatch.com/lyrics/Los-Insurgentes/Flores', 'https://youtu.be/9MR5Nc9naFg']) assert.ok(lyricSource(url));
  const source = lyricSource('https://www.youtube.com/watch?v=9MR5Nc9naFg&tracking=value');
  assert.equal(source.url, 'https://www.youtube.com/watch?v=9MR5Nc9naFg');
  for (const url of ['javascript:alert(1)', 'http://genius.com/song-lyrics', 'https://genius.com.evil.com/song-lyrics', 'https://user:pass@genius.com/song-lyrics', 'https://genius.com:8443/song-lyrics', 'https://youtube.com/channel/9MR5Nc9naFg', 'https://youtube.com/watch?v=bad', 'https://youtu.be/9MR5Nc9naFg/extra']) assert.equal(lyricSource(url), null, url);
});

test('Spotify renders every verified release with a usable no-JavaScript link', () => {
  const html = renderMusic(releases);
  assert.equal((html.match(/class="music-release"/g) || []).length, releases.length);
  assert.match(html, /<noscript>/);
  assert.match(html, /title="Escucha a Los Insurgentes en Spotify"/);
  assert.equal(new Set(releases.map((release) => spotifyAlbumId(release.spotifyUrl))).size, releases.length);
  assert.ok(releases.every((release) => spotifyAlbumId(release.spotifyUrl)));
});

test('Spotify rejects impostor hosts and escapes release metadata', () => {
  const id = '7z2MtC88layaORkxYPIvk5';
  for (const url of [`https://open.spotify.com.evil.com/album/${id}`, `http://open.spotify.com/album/${id}`, `https://user:pass@open.spotify.com/album/${id}`, `https://open.spotify.com:8443/album/${id}`, 'javascript:alert(1)', 'https://open.spotify.com/artist/3ukFu8umbFWty86yaubSR6']) assert.equal(spotifyAlbumId(url), null);
  const html = renderMusic([{ title: '<script>x</script>', type: '<b>Tipo</b>', spotifyUrl: `https://open.spotify.com/album/${id}`, artwork: 'javascript:alert(1)' }]);
  assert.match(html, /&lt;script&gt;x/);
  assert.doesNotMatch(html, /<script|<b>Tipo|javascript:/);
});

test('site data validates and every photo slot has a distinct, existing path', async () => {
  assert.deepEqual(validateSite(site), []);
  const slots = photoSlots(site);
  assert.equal(slots.length, site.gallery.length + 2);
  assert.equal(new Set(slots.map((slot) => slot.path)).size, slots.length);
  for (const slot of slots) {
    assert.ok(slot.label && slot.path && slot.group, JSON.stringify(slot));
    assert.ok(safeUpdatePath(slot.path), slot.path);
    assert.ok((await readFile(new URL(`../${slot.path}`, import.meta.url))).length > 0, slot.path);
  }
});

test('site validation rejects unsafe links and photo traversal', () => {
  const unsafeLink = copy(site);
  unsafeLink.socials[0].url = 'javascript:alert(1)';
  assert.ok(validateSite(unsafeLink).length > 0);
  const unsafePhoto = copy(site);
  unsafePhoto.hero.image = '../secret.jpg';
  assert.ok(validateSite(unsafePhoto).length > 0);
  const duplicatePhoto = copy(site);
  duplicatePhoto.gallery[0].image = duplicatePhoto.hero.image;
  assert.ok(validateSite(duplicatePhoto).length > 0);
  for (const value of [null, [], {}, { ...site, gallery: [null] }]) assert.ok(validateSite(value).length > 0);
  assert.ok(validateContent(site, [{ title: 123 }], lyrics).length > 0);
  const impossibleDate = copy(site);
  impossibleDate.shows.upcoming = [{ date: '2026-02-30', venue: 'Foro', city: 'Monterrey', enabled: true }];
  assert.ok(validateSite(impossibleDate).length > 0);
});

test('site rendering honors a GitHub Pages subpath in metadata', () => {
  const html = renderSite(template, site, releases, lyrics, { siteUrl: 'https://example.github.io/insurgentesWeb/' });
  assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/example\.github\.io\/insurgentesWeb\/"/);
  assert.match(html, /https:\/\/example\.github\.io\/insurgentesWeb\/assets\/og-image\.jpg/);
  assert.doesNotMatch(html, /https:\/\/losinsurgentes\.mx/);
  assert.match(html, /Noviembre 2026/);
  assert.match(html, /El nuevo álbum — Próximamente/);
});

test('site rendering escapes band content and omits disabled gallery entries', () => {
  const changed = copy(site);
  changed.hero.title = '<script>maratón</script>';
  changed.about.paragraphs[0] = '<img src=x onerror=alert(1)>';
  changed.gallery[0].enabled = false;
  const html = renderSite(template, changed, releases, lyrics);
  assert.match(html, /&lt;script&gt;maratón/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script>maratón|<img src=x/);
  assert.doesNotMatch(html, new RegExp(`src="${changed.gallery[0].image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

test('update bundle rejects absolute, remote, encoded and traversal paths', () => {
  for (const path of ['index.html', 'content/site.json', 'content/lyrics.json', 'content/photos/01-inicio.jpg']) assert.equal(safeUpdatePath(path), true, path);
  for (const path of ['../index.html', '/index.html', 'content/../../secret', 'content\\site.json', 'https://evil.com/file', '//evil.com/file', 'content/%2e%2e/secret', '.git/config', 'content/site.json\u0000']) assert.equal(safeUpdatePath(path), false, path);
});

const crc32 = (bytes) => {
  let crc = 0xFFFFFFFF;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

test('ZIP preserves text, image bytes, filenames and checksums', async () => {
  const entries = [{ name: 'content/site.json', data: '{"title":"Maratón"}' }, { name: 'content/photos/01-inicio.jpg', data: new Uint8Array([0xFF, 0xD8, 0x00, 0xEF]) }, { name: 'content/lyrics.json', data: new Blob(['["canción"]']) }];
  const archive = await createZip(entries);
  assert.ok(archive instanceof Blob);
  const bytes = new Uint8Array(await archive.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  for (const entry of entries) {
    assert.equal(view.getUint32(offset, true), 0x04034B50);
    assert.equal(view.getUint16(offset + 8, true), 0, 'archive uses uncompressed entries');
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    assert.equal(name, entry.name);
    const dataOffset = offset + 30 + nameLength + extraLength;
    const payload = bytes.subarray(dataOffset, dataOffset + size);
    const expected = typeof entry.data === 'string' ? new TextEncoder().encode(entry.data) : entry.data instanceof Blob ? new Uint8Array(await entry.data.arrayBuffer()) : entry.data;
    assert.deepEqual(payload, expected);
    assert.equal(view.getUint32(offset + 14, true), crc32(payload));
    offset = dataOffset + size;
  }
  assert.equal(view.getUint32(offset, true), 0x02014B50, 'central directory follows payloads');
  assert.equal(view.getUint32(bytes.length - 22, true), 0x06054B50);
  assert.equal(view.getUint16(bytes.length - 12, true), entries.length);
});

test('ZIP refuses unsafe entries before generating an archive', async () => {
  await assert.rejects(createZip([{ name: '../secret.txt', data: 'secret' }]));
  await assert.rejects(createZip([{ name: 'index.html', data: 'a' }, { name: 'index.html', data: 'b' }]));
  await assert.rejects(createZip([{ name: 'index.html', data: {} }]));
  await assert.rejects(createZip([]));
});

test('Pages packaging publishes the allowlist, removes stale output and refuses symlinks', async (t) => {
  const source = await mkdtemp(join(tmpdir(), 'insurgentes-pages-'));
  t.after(() => rm(source, { recursive: true, force: true }));
  await writeFile(join(source, 'index.html'), '<!doctype html><title>Los Insurgentes</title>');
  for (const directory of publicDirectories) {
    await mkdir(join(source, directory), { recursive: true });
    await writeFile(join(source, directory, 'public.txt'), directory);
  }
  await writeFile(join(source, 'private-secret.txt'), 'private');
  await writeFile(join(source, 'assets', '.hidden-secret'), 'private');
  const output = await preparePages(source);
  assert.equal(await readFile(join(output, 'index.html'), 'utf8'), '<!doctype html><title>Los Insurgentes</title>');
  for (const directory of publicDirectories) assert.equal(await readFile(join(output, directory, 'public.txt'), 'utf8'), directory);
  await access(join(output, '.nojekyll'));
  await assert.rejects(access(join(output, 'private-secret.txt')));
  await assert.rejects(access(join(output, 'assets', '.hidden-secret')));
  await writeFile(join(output, 'stale.txt'), 'stale');
  await preparePages(source);
  await assert.rejects(access(join(output, 'stale.txt')));
  await symlink(join(source, 'private-secret.txt'), join(source, 'assets', 'leaked.txt'));
  await assert.rejects(preparePages(source), /symbolic links/);
});
