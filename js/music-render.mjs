// Shared by the editor's preview and the optional static publishing script.
const ARTIST_URL = 'https://open.spotify.com/artist/3ukFu8umbFWty86yaubSR6';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

export function spotifyAlbumId(value) {
  try {
    const url = new URL(value);
    if (url.origin !== 'https://open.spotify.com' || url.username || url.password || url.port) return null;
    return url.pathname.match(/^\/album\/([A-Za-z0-9]{22})\/?$/)?.[1] || null;
  } catch {
    return null;
  }
}

function artworkUrl(value) {
  if (!value) return null;
  // Only known artwork hosts or local assets can appear in published HTML.
  if (/^assets\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) && !value.includes('..')) return value;
  try {
    const url = new URL(value);
    return url.origin === 'https://i.scdn.co' && /^\/image\/[a-zA-Z0-9]+$/.test(url.pathname) ? url.href : null;
  } catch {
    return null;
  }
}

export function renderMusic(releases = []) {
  const cards = releases.filter((release) => release && release.title && spotifyAlbumId(release.spotifyUrl)).map((release) => {
    const title = escapeHtml(release.title);
    const artwork = artworkUrl(release.artwork);
    const meta = [release.type, release.year].filter(Boolean).map(escapeHtml).join(' · ');
    return `        <li>
          <a class="music-release" href="${escapeHtml(release.spotifyUrl)}" target="_blank" rel="noopener noreferrer" data-spotify-release="${spotifyAlbumId(release.spotifyUrl)}" data-release-title="${title}" aria-label="Escuchar ${title}">
            ${artwork ? `<img class="music-release-art" src="${escapeHtml(artwork)}" alt="" width="640" height="640" loading="lazy">` : '<div class="music-release-art music-release-fallback" aria-hidden="true"><img src="assets/logos/skull-stamp-orange.png" alt="" width="1600" height="1600" loading="lazy"></div>'}
            <span class="music-release-meta">${meta}</span>
            <span class="music-release-title">${title}</span>
            <span class="music-release-action">Escuchar <span aria-hidden="true">↗</span></span>
          </a>
        </li>`;
  }).join('\n');

  return `<section id="music" class="music-section" aria-labelledby="musicTitle">
    <div class="container">
      <div class="label-row">
        <span class="section-label">Discografía</span>
        <img src="assets/logos/skull-stamp-orange.png" alt="" class="label-stamp" aria-hidden="true" loading="lazy" width="1600" height="1600">
      </div>
      <div class="music-heading">
        <h2 class="section-title reveal" id="musicTitle">Sube el volumen.</h2>
        <p class="section-intro">De La Marcha a los nuevos sencillos. Encuentra tu canción.</p>
      </div>

      <div class="music-player" id="musicPlayer" tabindex="-1" aria-label="Reproductor de Spotify">
        <div class="music-player-heading">
          <p class="music-player-label" id="spotifySelection">Los Insurgentes en Spotify</p>
          <a id="spotifyOpen" href="${ARTIST_URL}" target="_blank" rel="noopener noreferrer">Abrir en Spotify <span aria-hidden="true">↗</span></a>
        </div>
        <iframe id="spotifyPlayer" title="Escucha a Los Insurgentes en Spotify" src="https://open.spotify.com/embed/artist/3ukFu8umbFWty86yaubSR6?utm_source=generator&amp;theme=0" width="100%" height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        <p class="music-player-note">La reproducción y disponibilidad dependen de Spotify y de tu cuenta.</p>
        <p class="music-announcement" id="spotifyStatus" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>

      <div class="music-catalog-heading">
        <h3>Lanzamientos</h3>
        <p class="music-js-hint" hidden>Selecciona un lanzamiento para escucharlo aquí.</p>
        <noscript><p>Abre cualquier lanzamiento para escucharlo en Spotify.</p></noscript>
      </div>
      <ul class="music-catalog" aria-label="Lanzamientos de Los Insurgentes">
${cards}
      </ul>

      <div class="music-platforms" aria-label="Más plataformas">
        <span>También en</span>
        <a href="https://music.apple.com/us/artist/los-insurgentes/1231291746" target="_blank" rel="noopener noreferrer">Apple Music <span aria-hidden="true">↗</span></a>
        <a href="https://www.youtube.com/@LosInsurgentes" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>`;
}
