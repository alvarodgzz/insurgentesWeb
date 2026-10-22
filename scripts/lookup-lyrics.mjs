#!/usr/bin/env node
/** Metadata only: this command never scrapes pages, downloads lyrics, or changes the site. */
import { readFile } from 'node:fs/promises';
import { lyricSource } from '../js/lyrics-render.mjs';

const token = process.env.GENIUS_ACCESS_TOKEN;
if (!token) {
  console.error('Falta GENIUS_ACCESS_TOKEN. Configúralo solamente en el entorno local; nunca en archivos públicos.');
  process.exitCode = 1;
} else {
  const songs = JSON.parse(await readFile(new URL('../content/lyrics.json', import.meta.url), 'utf8'));
  const normalize = (value) => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const report = [];
  let failed = false;
  for (const song of songs) {
    const url = new URL('https://api.genius.com/search');
    url.searchParams.set('q', `Los Insurgentes ${song.title}`);
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`Genius respondió HTTP ${response.status}`);
      const data = await response.json();
      const matches = (data.response?.hits || []).map((hit) => hit.result).filter((result) =>
        normalize(result?.primary_artist?.name) === normalize('Los Insurgentes') &&
        normalize(result?.title) === normalize(song.title) && lyricSource(result?.url)?.provider === 'genius'
      ).map((result) => ({
        title: result.title,
        artist: result.primary_artist.name,
        artistUrl: result.primary_artist.url,
        sourceUrl: lyricSource(result.url).url,
        provider: 'genius',
        needsBandVerification: true
      }));
      report.push({ title: song.title, candidates: matches });
    } catch (error) {
      failed = true;
      // Keep credentials and response bodies out of output, including error reports.
      report.push({ title: song.title, candidates: [], error: error.name === 'TimeoutError' ? 'Tiempo de espera agotado' : 'No se pudo consultar Genius' });
      if (error.message?.includes('HTTP 401') || error.message?.includes('HTTP 403') || error.message?.includes('HTTP 429')) break;
    }
  }
  console.log(JSON.stringify({ artist: 'Los Insurgentes', checkedAt: new Date().toISOString(), metadataOnly: true, songs: report }, null, 2));
  if (failed) process.exitCode = 1;
}
