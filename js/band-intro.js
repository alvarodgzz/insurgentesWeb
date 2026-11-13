(() => {
  'use strict';
  const intro = document.getElementById('band-intro');
  const site = document.getElementById('band-site');
  const enter = document.getElementById('band-intro-enter');
  if (!intro || !site || !enter) return;

  enter.addEventListener('click', event => {
    event.preventDefault();
    intro.hidden = true;
    site.hidden = false;
    site.removeAttribute('inert');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('main')?.focus({ preventScroll: true });
  });
})();
