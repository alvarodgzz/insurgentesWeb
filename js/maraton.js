// Enhance the native form with an inline result from Brevo's real response.
// Form values go only to its configured action, never to analytics or storage.
(() => {
  'use strict';
  const start = document.querySelector('[data-signup-start]');
  if (start) start.addEventListener('click', () => {
    const control = document.querySelector('#registro input[type="email"]:not([disabled])');
    if (control) requestAnimationFrame(() => control.focus({ preventScroll: true }));
  });

  const form = document.querySelector('[data-newsletter-form]');
  const status = document.querySelector('[data-newsletter-status]');
  if (!form || !status || typeof window.fetch !== 'function' || typeof FormData !== 'function' || typeof URLSearchParams !== 'function' || typeof AbortController !== 'function') return;
  const button = form.querySelector('button[type="submit"]');
  const email = form.querySelector('input[name="EMAIL"]');
  if (!button || !email) return;
  const buttonLabel = button.textContent;
  let pending = false;
  let complete = false;
  const showStatus = (state, message, focus = false) => {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = message;
    if (focus) status.focus({ preventScroll: true });
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || complete) return;
    if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
    pending = true;
    button.disabled = true;
    email.readOnly = true;
    button.textContent = 'Enviando…';
    form.setAttribute('aria-busy', 'true');
    showStatus('pending', 'Estamos guardando tu registro…');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const body = new URLSearchParams(new FormData(form));
      const response = await window.fetch(form.action, {
        method: 'POST', body, credentials: 'omit', referrerPolicy: 'no-referrer',
        cache: 'no-store', signal: controller.signal,
      });
      const result = await response.json();
      if (response.ok && result && result.success === true) {
        complete = true;
        email.value = '';
        button.textContent = 'Ya estás en la lista';
        showStatus('success', '¡Gracias por sumarte a Maratón! Ya estás en la lista para recibir nuestras novedades.', true);
      } else if (result && result.success === false) {
        showStatus('error', 'No pudimos guardar tu registro. Revisa tu correo e inténtalo de nuevo.', true);
      } else {
        throw new Error('Unconfirmed response');
      }
    } catch {
      // A blocked response or timeout can happen after Brevo accepted the POST.
      // Do not claim failure/success or automatically send the address again.
      showStatus('error', 'No pudimos confirmar el registro. Revisa si recibiste la bienvenida antes de intentarlo de nuevo.', true);
    } finally {
      window.clearTimeout(timer);
      pending = false;
      form.removeAttribute('aria-busy');
      email.readOnly = complete;
      button.disabled = complete;
      if (!complete) button.textContent = buttonLabel;
    }
  });
})();
