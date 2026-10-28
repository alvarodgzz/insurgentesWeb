// The native form posts directly to Brevo; its result page handles the response.
// This enhancement only helps keyboard users reach the registration control.
// It never reads, stores or sends an email address or a form value.
(() => {
  'use strict';
  const start = document.querySelector('[data-signup-start]');
  if (!start) return;
  start.addEventListener('click', () => {
    const control = document.querySelector('#registro input[type="email"]:not([disabled]), #registro a[data-newsletter-link]');
    if (control) requestAnimationFrame(() => control.focus({ preventScroll: true }));
  });
})();
