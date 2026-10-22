/** Used by the optional local editor; the public page contains the rendered HTML. */
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

/** Only accept lyric pages and individual videos, never arbitrary external URLs. */
export function lyricSource(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (['genius.com', 'www.genius.com'].includes(host) && /^\/[a-z0-9-]+-lyrics\/?$/i.test(url.pathname)) {
      return { url: `https://genius.com${url.pathname}`, label: 'Leer en Genius', provider: 'genius' };
    }
    if (['musixmatch.com', 'www.musixmatch.com'].includes(host) && /^\/(?:[a-z]{2}\/)?lyrics\/[^/]+\/[^/]+\/?$/i.test(url.pathname)) {
      return { url: `https://www.musixmatch.com${url.pathname}`, label: 'Leer en Musixmatch', provider: 'musixmatch' };
    }
    const videoId = ['youtube.com', 'www.youtube.com'].includes(host) && url.pathname === '/watch'
      ? url.searchParams.get('v')
      : host === 'youtu.be' ? url.pathname.slice(1) : null;
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return { url: `https://www.youtube.com/watch?v=${videoId}`, label: 'Ver lyric video', provider: 'youtube' };
    }
  } catch { /* An incomplete editor URL stays hidden until corrected. */ }
  return null;
}

export function renderLyrics(lyrics) {
  const entries = (Array.isArray(lyrics) ? lyrics : []).flatMap((entry) => {
    if (!entry || typeof entry.title !== 'string' || !entry.title.trim()) return [];
    const title = escapeHTML(entry.title.trim());
    const text = typeof entry.text === 'string' ? entry.text.trim() : '';
    const source = lyricSource(entry.sourceUrl);
    if (!text && !source) return [];
    const link = source ? `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${source.label} <span aria-hidden="true">↗</span></a>` : '';
    if (!text) {
      return [`        <a class="lyric-item lyric-source-link" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">
          <span class="lyric-source-title">${title}</span>
          <span class="lyric-source-action">${source.label} <span aria-hidden="true">↗</span></span>
        </a>`];
    }
    return [`        <details class="lyric-item">
          <summary>${title}</summary>
          <div class="lyric-body">${escapeHTML(text)}</div>${source ? `\n          <p class="lyric-attribution">${link}</p>` : ''}
        </details>`];
  });
  return `  <section id="lyrics">
    <div class="container">
      <div class="label-row">
        <span class="section-label">Letras</span>
        <img src="assets/logos/skull-stamp-orange.png" alt="" class="label-stamp" aria-hidden="true" loading="lazy" width="1600" height="1600">
      </div>
      <h2 class="section-title reveal">Letras</h2>
      <p class="section-intro">${entries.length ? 'Las palabras detrás de nuestras canciones.' : 'Las letras de nuestras canciones estarán disponibles próximamente.'}</p>${entries.length ? `
      <div class="lyrics-list">
${entries.join('\n')}
      </div>` : ''}
    </div>
  </section>`;
}
