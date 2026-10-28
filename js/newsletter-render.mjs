export const DEFAULT_NEWSLETTER = Object.freeze({ version: 1, enabled: false, provider: 'brevo', formUrl: '' });
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function validateFormUrl(value) {
  if (typeof value !== 'string' || !value || value.length > 8192 || /[\u0000-\u0020\u007F]/.test(value)) throw new Error('Revisa el enlace público del formulario de Brevo.');
  let url;
  try { url = new URL(value); } catch { throw new Error('El formulario debe usar una dirección HTTPS de Brevo.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)?sibforms\.com$/i.test(url.hostname) || !/^\/(?:v2\/)?serve\/[A-Za-z0-9_-]{1,4096}={0,2}$/.test(url.pathname)) {
    throw new Error('Usa la URL pública del formulario de Brevo: https://…sibforms.com/serve/…');
  }
  return url.href;
}

export function validateNewsletter(value = DEFAULT_NEWSLETTER) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('La configuración de la lista debe ser un objeto.');
  if (Object.keys(value).some(key => !['version', 'enabled', 'provider', 'formUrl', 'submitUrl'].includes(key))) throw new Error('La lista solo admite version, enabled, provider, formUrl y submitUrl; no agregues claves ni contraseñas.');
  if (value.version !== 1 || typeof value.enabled !== 'boolean' || value.provider !== 'brevo' || typeof value.formUrl !== 'string') throw new Error('Configuración de la lista de correos no válida.');
  const formUrl = value.formUrl ? validateFormUrl(value.formUrl) : '';
  const submitUrl = Object.hasOwn(value, 'submitUrl') ? validateFormUrl(value.submitUrl) : undefined;
  if (value.enabled && !formUrl) throw new Error('Conecta el formulario de Brevo antes de activar el registro.');
  return { version: 1, enabled: value.enabled, provider: 'brevo', formUrl, ...(submitUrl === undefined ? {} : { submitUrl }) };
}

export function renderNewsletter(value = DEFAULT_NEWSLETTER) {
  const config = validateNewsletter(value);
  if (!config.enabled) {
    return `<div class="newsletter-pending"><label class="newsletter-label" for="newsletter-email">Correo electrónico</label><input class="newsletter-email" id="newsletter-email" type="email" placeholder="tu@correo.com" autocomplete="email" disabled aria-describedby="newsletter-status"><button class="newsletter-button" type="button" disabled>Avísenme de Maratón <span aria-hidden="true">↗</span></button><p class="newsletter-status" id="newsletter-status" role="status">El registro abrirá pronto.</p><p class="newsletter-note">Pronto podrás apuntarte para recibir las novedades de Maratón.</p></div>`;
  }
  const url = escape(config.formUrl);
  // Simple HTML can have its own POST token. Keep the original hosted link
  // for fallback, and preserve the supplied submit token when one is present.
  const destination = new URL(config.submitUrl ?? config.formUrl);
  destination.pathname = destination.pathname.replace(/^\/v2\/serve\//, '/serve/');
  const action = escape(destination.href);
  return `<form class="newsletter-form" id="sib-form" method="post" action="${action}" accept-charset="UTF-8" aria-labelledby="newsletter-title">
    <h3 id="newsletter-title">Entérate primero de Maratón.</h3>
    <p class="newsletter-intro">Música nueva y noticias de Los Insurgentes, directo a tu correo.</p>
    <label class="newsletter-label" for="EMAIL">Correo electrónico</label>
    <input class="newsletter-email" type="email" id="EMAIL" name="EMAIL" autocomplete="email" inputmode="email" placeholder="tu@correo.com" required aria-describedby="newsletter-consent">
    <p class="newsletter-note newsletter-consent-text" id="newsletter-consent">Al registrarte, aceptas recibir novedades de Maratón y Los Insurgentes. Puedes darte de baja cuando quieras.</p>
    <div class="newsletter-trap" aria-hidden="true"><label for="email-address-check">Deja este campo vacío</label><input type="text" id="email-address-check" name="email_address_check" value="" tabindex="-1" autocomplete="off"></div>
    <input type="hidden" name="locale" value="es">
    <input type="hidden" name="html_type" value="simple">
    <button class="newsletter-button" type="submit">Quiero enterarme <span aria-hidden="true">↗</span></button>
  </form>
  <p class="newsletter-note newsletter-provider-note">Brevo procesa tu registro. <a href="${url}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-newsletter-link>Abrir el formulario alternativo</a>.</p>`;
}
