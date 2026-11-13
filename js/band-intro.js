(() => {
  'use strict';
  const intro = document.getElementById('band-intro');
  const site = document.getElementById('band-site');
  const enter = document.getElementById('band-intro-enter');
  if (!intro || !site || !enter) return;

  const destinations = [['band-intro-enter', 'main'], ['band-intro-music', 'music'], ['band-intro-gallery', 'gallery'], ['band-intro-shows', 'shows']];
  for (const [id, targetId] of destinations) {
    const link = document.getElementById(id);
    if (!link) continue;
    link.addEventListener('click', event => {
      event.preventDefault();
      intro.hidden = true;
      site.hidden = false;
      site.removeAttribute('inert');
      const target = document.getElementById(targetId);
      if (targetId === 'main') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      else if (target) {
        target.setAttribute('tabindex', '-1');
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      target?.focus({ preventScroll: true });
    });
  }
})();
