// Spotify's own embedded player handles playback, account access and licensing.
// Release links continue to open Spotify if this enhancement cannot initialize.
(() => {
  'use strict';

  const section = document.getElementById('music');
  const player = document.getElementById('spotifyPlayer');
  const playerRegion = document.getElementById('musicPlayer');
  const selection = document.getElementById('spotifySelection');
  const openLink = document.getElementById('spotifyOpen');
  const status = document.getElementById('spotifyStatus');
  if (!section || !player || !playerRegion || !selection || !openLink || !status) return;

  const hint = section.querySelector('.music-js-hint');
  if (hint) hint.hidden = false;

  section.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[data-spotify-release]');
    if (!link || !section.contains(link) || event.defaultPrevented) return;
    // Preserve the browser's normal open-in-new-tab/window actions.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const albumId = link.dataset.spotifyRelease;
    if (!/^[A-Za-z0-9]{22}$/.test(albumId || '')) return;
    let destination;
    try { destination = new URL(link.href); } catch { return; }
    if (destination.origin !== 'https://open.spotify.com' || destination.pathname !== `/album/${albumId}`) return;
    event.preventDefault();

    const title = link.dataset.releaseTitle || 'Los Insurgentes';
    // Only one iframe exists, so switching release stops the previous player.
    if (player.dataset.album !== albumId) {
      player.src = `https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`;
      player.dataset.album = albumId;
    }
    player.title = `Escucha ${title} de Los Insurgentes en Spotify`;
    selection.textContent = title;
    openLink.href = link.href;
    section.querySelectorAll('[data-spotify-release][aria-current]').forEach((item) => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    status.textContent = `${title} seleccionado. Pulsa reproducir en el reproductor de Spotify.`;
    playerRegion.focus({ preventScroll: true });
    playerRegion.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
})();
