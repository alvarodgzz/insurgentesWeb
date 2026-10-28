(() => {
  'use strict';

  const form = document.getElementById('access-form');
  const input = document.getElementById('access-password');
  const reveal = document.getElementById('access-reveal');
  const submit = document.getElementById('access-submit');
  const submitLabel = document.getElementById('access-submit-label');
  const status = document.getElementById('access-status');
  const previewPath = form.dataset?.previewSrc || 'preview.json';
  const maxPayloadBytes = 80 * 1024 * 1024;
  let envelope;
  let busy = false;

  reveal.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    reveal.textContent = visible ? 'Ocultar' : 'Mostrar';
    reveal.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    reveal.setAttribute('aria-pressed', String(visible));
  });

  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    if (!busy) status.textContent = '';
  });

  function decodeBase64(value) {
    if (typeof value !== 'string' || value.length > maxPayloadBytes || value.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(value)) {
      throw new Error('Invalid preview');
    }
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let offset = 0; offset < binary.length; offset += 1) bytes[offset] = binary.charCodeAt(offset);
    return bytes;
  }

  async function readPreview() {
    if (envelope) return envelope;
    if (!['preview.json', 'maraton-preview.json'].includes(previewPath)) throw new Error('Invalid preview destination');
    const response = await fetch(new URL(previewPath, document.baseURI), { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (response.status === 404) {
      const error = new Error('Unavailable');
      error.unavailable = true;
      throw error;
    }
    if (!response.ok || Number(response.headers.get('content-length') || 0) > maxPayloadBytes) throw new Error('Invalid preview');

    let text;
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks = [];
      let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > maxPayloadBytes) {
            await reader.cancel();
            throw new Error('Preview too large');
          }
          chunks.push(decoder.decode(value, { stream: true }));
        }
        chunks.push(decoder.decode());
        text = chunks.join('');
      } finally {
        reader.releaseLock();
      }
    } else {
      text = await response.text();
      if (new TextEncoder().encode(text).byteLength > maxPayloadBytes) throw new Error('Preview too large');
    }

    const data = JSON.parse(text);
    if (data.version !== 1 || data.iterations !== 600000) throw new Error('Invalid preview');
    const salt = decodeBase64(data.salt);
    const iv = decodeBase64(data.iv);
    const ciphertext = decodeBase64(data.ciphertext);
    if (salt.byteLength !== 16 || iv.byteLength !== 12 || ciphertext.byteLength < 17) throw new Error('Invalid preview');
    envelope = { salt, iv, ciphertext, iterations: data.iterations };
    return envelope;
  }

  const supported = window.isSecureContext && Boolean(window.crypto?.subtle);
  if (!supported) {
    submit.disabled = true;
    status.textContent = 'Para entrar, abre esta página con HTTPS cuando el certificado esté listo.';
  } else {
    input.disabled = false;
    submit.disabled = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supported || busy || !form.reportValidity()) return;
    busy = true;
    submit.disabled = true;
    input.readOnly = true;
    form.setAttribute('aria-busy', 'true');
    input.removeAttribute('aria-invalid');
    submitLabel.textContent = 'Abriendo…';
    status.textContent = 'Preparando la vista previa…';

    try {
      const data = await readPreview();
      const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.value), 'PBKDF2', false, ['deriveKey']);
      input.value = '';
      const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: data.salt, iterations: data.iterations, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      let cleartext;
      try {
        cleartext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.iv }, key, data.ciphertext);
      } catch (error) {
        if (error.name === 'OperationError') {
          const invalid = new Error('Invalid password');
          invalid.invalidPassword = true;
          throw invalid;
        }
        throw error;
      }
      const html = new TextDecoder('utf-8', { fatal: true }).decode(cleartext);
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      input.value = '';
      if (error.unavailable) status.textContent = 'El acceso estará disponible pronto.';
      else if (error.invalidPassword) {
        input.setAttribute('aria-invalid', 'true');
        status.textContent = 'La contraseña no es correcta. Inténtalo de nuevo.';
      } else status.textContent = 'No pudimos abrir el sitio. Revisa tu conexión e inténtalo de nuevo.';
      input.focus();
    } finally {
      busy = false;
      submit.disabled = false;
      input.readOnly = false;
      form.removeAttribute('aria-busy');
      submitLabel.textContent = 'Entrar al sitio';
    }
  });
})();
