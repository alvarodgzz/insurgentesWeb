const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const roots = {};
const photos = new Map();
const photoURLs = new Map();
const photoDimensions = new WeakMap();
const knownPhotos = new Set();
const draftKey = 'los-insurgentes-editor-v1';
let template, renderSite, validateSite, validateContent, photoSlots, createZip, createDriveZip, safeUpdatePath;
let drivePathForUpdate, relativeDrivePath, buildDriveEntries, assembleDriveContent;
let ready = false;
let busy = false;

function status(message) { $('status').textContent = message; }
function errorList(messages) {
  $('errors').hidden = !messages.length;
  $('errors').innerHTML = messages.length ? `<strong>Revisa estos campos:</strong><ul>${messages.map((message) => `<li>${escapeHTML(message)}</li>`).join('')}</ul>` : '';
  if (messages.length) $('errors').focus();
}
function get(root, path) { return path.split('.').reduce((value, key) => value?.[key], roots[root]); }
function set(root, path, value) {
  const keys = path.split('.');
  const key = keys.pop();
  keys.reduce((object, part) => object[part], roots[root])[key] = value;
}
function field(root, path, label, options = {}) {
  const value = options.value ?? get(root, path) ?? '';
  const attrs = `data-root="${root}" data-path="${escapeHTML(path)}"${options.paragraphs ? ' data-paragraphs="true"' : ''}`;
  const type = options.type || 'text';
  let control;
  if (type === 'textarea') control = `<textarea ${attrs} rows="${options.rows || 4}">${escapeHTML(value)}</textarea>`;
  else if (type === 'checkbox') control = `<input ${attrs} type="checkbox"${value ? ' checked' : ''}>`;
  else if (options.choices) control = `<select ${attrs}>${options.choices.map(([key, name]) => `<option value="${escapeHTML(key)}"${key === value ? ' selected' : ''}>${escapeHTML(name)}</option>`).join('')}</select>`;
  else control = `<input ${attrs} type="${type}" value="${escapeHTML(value)}"${type === 'number' ? ' min="1900" max="2200" step="1"' : ''}>`;
  return `<label class="field${options.wide ? ' wide' : ''}${type === 'checkbox' ? ' checkbox' : ''}">${type === 'checkbox' ? control : ''}<span>${escapeHTML(label)}</span>${type !== 'checkbox' ? control : ''}</label>`;
}
function button(action, root, path, text) { return `<button type="button" class="text-button danger" data-action="${action}" data-root="${root}" data-path="${path}">${text}</button>`; }
function entries(root, path, render) {
  const list = path ? get(root, path) : roots[root];
  return list.map((entry, index) => `<details class="entry"><summary>${escapeHTML(entry.title || entry.name || entry.venue || entry.label || `Nuevo elemento ${index + 1}`)}</summary><div class="fields">${render(path ? `${path}.${index}` : String(index))}</div>${button('remove', root, path ? `${path}.${index}` : String(index), 'Eliminar elemento')}</details>`).join('');
}
function addButton(root, path, text, kind) { return `<button type="button" class="button secondary add-row" data-action="add" data-root="${root}" data-path="${path}" data-kind="${kind}">${text}</button>`; }
function photoCard(slot) {
  const path = slot.path;
  const prefix = slot.group === 'gallery' ? `gallery.${slot.index}` : slot.group;
  const src = photoURLs.get(path) || (knownPhotos.has(path) ? new URL(`../${path}`, location.href).href : '');
  const drivePath = drivePathForUpdate(path, roots.site);
  return `<div class="photo-slot">${src ? `<img src="${escapeHTML(src)}" alt="${escapeHTML(slot.alt || slot.label)}" loading="lazy">` : '<div class="photo-empty">Espacio reservado<br>Selecciona una foto</div>'}<h3>${escapeHTML(slot.label)}</h3><code>${escapeHTML(path)}</code>${drivePath ? `<p>En Drive: <code>${escapeHTML(drivePath)}</code></p>` : ''}
    <label class="button secondary file-button">Cambiar foto<input type="file" accept="image/jpeg,image/png,image/webp" data-photo="${escapeHTML(path)}" aria-label="Cambiar ${escapeHTML(slot.label)}"></label>
    ${slot.group === 'hero' ? field('site', 'hero.position', 'Posición (ejemplo: center 35%)') : field('site', `${prefix}.${slot.group === 'about' ? 'imageAlt' : 'alt'}`, 'Descripción de la foto', { type: 'textarea', rows: 3 })}
    ${slot.group === 'gallery' ? field('site', `${prefix}.enabled`, 'Mostrar en la galería', { type: 'checkbox' }) + field('site', `${prefix}.tall`, 'Formato vertical', { type: 'checkbox' }) + button('remove', 'site', prefix, 'Quitar de la galería') : ''}
  </div>`;
}
function renderForms() {
  const site = roots.site;
  const slots = photoSlots(site);
  const showFields = (path) => field('site', `${path}.date`, 'Fecha completa · obligatoria para mostrar el show', { type: 'date' }) + field('site', `${path}.label`, 'Fecha visible (ejemplo: 6 MAY 2027)') + field('site', `${path}.venue`, 'Lugar') + field('site', `${path}.city`, 'Ciudad') + field('site', `${path}.note`, 'Nota') + field('site', `${path}.ticketUrl`, 'Enlace de boletos', { type: 'url' }) + field('site', `${path}.enabled`, 'Mostrar en el sitio', { type: 'checkbox' });
  $('sections').innerHTML = `
    <section class="panel" id="portada"><p class="eyebrow">01 · PORTADA</p><h2>Lo que viene</h2><div class="fields">${field('site', 'hero.title', 'Título principal')}${field('site', 'hero.tagline', 'Subtítulo')}${field('site', 'hero.announcement', 'Anuncio del próximo lanzamiento', { wide: true })}</div></section>
    <section class="panel" id="fotos"><p class="eyebrow">02 · FOTOS</p><h2>Cada foto tiene su lugar</h2><p>Reemplaza las imágenes aquí o en la carpeta compartida usando estos mismos nombres. Aceptamos JPG, PNG y WebP; las nuevas fotos se preparan como JPG de hasta 2000 px.</p><div class="photo-grid">${slots.map(photoCard).join('')}</div><button type="button" class="button secondary add-row" data-action="addPhoto">Añadir foto a la galería</button></section>
    <section class="panel" id="banda"><p class="eyebrow">03 · LA BANDA</p><h2>Nuestra historia</h2><div class="fields">${field('site', 'about.paragraphs', 'Biografía · separa los párrafos con una línea en blanco', { type: 'textarea', value: site.about.paragraphs.join('\n\n'), paragraphs: true, wide: true, rows: 8 })}</div><h3 class="group-heading">Integrantes</h3>${entries('site', 'about.members', (path) => field('site', `${path}.name`, 'Nombre') + field('site', `${path}.role`, 'Instrumento / rol'))}${addButton('site', 'about.members', 'Añadir integrante', 'member')}</section>
    <section class="panel" id="musica"><p class="eyebrow">04 · MÚSICA</p><h2>Sencillos y discografía</h2><p>Usa enlaces oficiales de Spotify del tipo <code>https://open.spotify.com/album/…</code>. El catálogo no se actualiza automáticamente.</p><h3>Sencillos destacados</h3>${entries('site', 'singles', (path) => field('site', `${path}.title`, 'Título') + field('site', `${path}.year`, 'Año', { type: 'number' }) + field('site', `${path}.spotifyUrl`, 'Spotify', { type: 'url' }) + field('site', `${path}.appleMusicUrl`, 'Apple Music (opcional)', { type: 'url' }) + field('site', `${path}.youtubeUrl`, 'YouTube (opcional)', { type: 'url' }))}${addButton('site', 'singles', 'Añadir sencillo', 'single')}<h3 class="group-heading">Catálogo de Spotify</h3>${entries('releases', '', (path) => field('releases', `${path}.title`, 'Título') + field('releases', `${path}.year`, 'Año (opcional)', { type: 'number' }) + field('releases', `${path}.type`, 'Tipo', { choices: [['Sencillo', 'Sencillo'], ['EP', 'EP'], ['Álbum', 'Álbum']] }) + field('releases', `${path}.spotifyUrl`, 'Enlace del lanzamiento en Spotify', { type: 'url' }) + field('releases', `${path}.artwork`, 'Portada oficial: URL de i.scdn.co o archivo en assets/', { type: 'text', wide: true }))}${addButton('releases', '', 'Añadir lanzamiento', 'release')}</section>
    <section class="panel" id="fechas"><p class="eyebrow">05 · FECHAS</p><h2>Nos vemos en vivo</h2><p>Activa «Mostrar en el sitio» solo cuando la fecha esté confirmada. Los enlaces vacíos se omiten.</p><h3>Próximos shows</h3>${entries('site', 'shows.upcoming', showFields)}${addButton('site', 'shows.upcoming', 'Añadir próxima fecha', 'show')}<h3 class="group-heading">Shows pasados</h3>${entries('site', 'shows.past', showFields)}${addButton('site', 'shows.past', 'Añadir show pasado', 'show')}</section>
    <section class="panel" id="letras"><p class="eyebrow">06 · LETRAS</p><h2>Las palabras detrás de las canciones</h2><p>Pega la letra que la banda autorice o enlaza su página en Genius, Musixmatch o un lyric video oficial. Las entradas sin letra ni enlace permanecen ocultas.</p>${entries('lyrics', '', (path) => field('lyrics', `${path}.title`, 'Canción') + field('lyrics', `${path}.provider`, 'Fuente', { choices: [['band', 'La banda'], ['genius', 'Genius'], ['musixmatch', 'Musixmatch'], ['youtube', 'Lyric video en YouTube']] }) + field('lyrics', `${path}.sourceUrl`, 'Enlace a la letra o video (opcional)', { type: 'url', wide: true }) + field('lyrics', `${path}.text`, 'Letra autorizada (opcional)', { type: 'textarea', wide: true, rows: 8 }))}${addButton('lyrics', '', 'Añadir canción', 'lyric')}</section>
    <section class="panel" id="contacto"><p class="eyebrow">07 · CONTACTO</p><h2>Que nos encuentren</h2><div class="fields">${field('site', 'contact.email', 'Correo de contacto (opcional)', { type: 'email' })}${field('site', 'contact.instagramUrl', 'Instagram de contacto', { type: 'url' })}${field('site', 'site.title', 'Título del sitio', { wide: true })}${field('site', 'site.description', 'Descripción para buscadores y redes', { type: 'textarea', wide: true })}${field('site', 'site.url', 'Dirección pública del sitio', { type: 'url', wide: true })}</div><h3 class="group-heading">Redes y plataformas</h3>${entries('site', 'socials', (path) => field('site', `${path}.label`, 'Nombre') + field('site', `${path}.url`, 'Enlace', { type: 'url' }))}${addButton('site', 'socials', 'Añadir enlace', 'social')}</section>`;
}

function validate(data = roots, availablePhotos = new Set([...knownPhotos, ...photos.keys()])) {
  const errors = validateContent(data.site, data.releases, data.lyrics);
  if (Array.isArray(data.site?.gallery)) data.site.gallery.forEach((photo, index) => {
    if (photo && photo.enabled !== false && !availablePhotos.has(photo.image)) errors.push(`Foto ${index + 1}: selecciona la imagen del nuevo espacio antes de mostrarla.`);
  });
  if (!Array.isArray(data.releases) || !Array.isArray(data.lyrics)) return errors;
  data.releases.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    if (entry.year != null && (!Number.isInteger(entry.year) || entry.year < 1900 || entry.year > 2200)) errors.push(`Lanzamiento ${index + 1}: revisa el año.`);
    if (!['EP', 'Álbum', 'Sencillo'].includes(entry.type)) errors.push(`Lanzamiento ${index + 1}: selecciona Sencillo, EP o Álbum.`);
    if (entry.artwork && !(typeof entry.artwork === 'string' && (/^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(entry.artwork) || /^assets\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)$/i.test(entry.artwork) && !entry.artwork.includes('..')))) errors.push(`Lanzamiento ${index + 1}: usa una portada oficial de i.scdn.co o un archivo de assets/.`);
  });
  return errors;
}
function rendered() {
  const errors = validate();
  if (errors.length) { errorList(errors); return null; }
  errorList([]);
  return renderSite(template, roots.site, roots.releases, roots.lyrics);
}
async function preview() {
  let html = rendered();
  if (!html) return;
  for (const [path, url] of photoURLs) html = html.split(path).join(url);
  const base = new URL('../', location.href).href;
  html = html.replace(/<head(?:\s[^>]*)?>/i, (tag) => `${tag}<base href="${escapeHTML(base)}">`);
  $('preview').srcdoc = html;
  $('preview').hidden = false;
  $('previewEmpty').hidden = true;
  status('Vista previa actualizada. Revisa las fotos, los enlaces y los textos antes de descargar.');
  $('previewTitle').scrollIntoView({ behavior: 'auto', block: 'start' });
}
function updateEntries() {
  const html = rendered();
  if (!html) return null;
  return [
    { name: 'index.html', data: html },
    ...[['site', roots.site], ['releases', roots.releases], ['lyrics', roots.lyrics]].map(([name, value]) => ({ name: `content/${name}.json`, data: JSON.stringify(value, null, 2) + '\n' })),
    ...[...photos].map(([name, data]) => ({ name, data }))
  ];
}
function downloadBlob(zip, filename) {
  const url = URL.createObjectURL(zip);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function download() {
  const entries = updateEntries();
  if (!entries) return;
  downloadBlob(await createZip(entries), 'los-insurgentes-actualizacion.zip');
  status(`Actualización descargada: textos y ${photos.size} foto(s). Extrae el ZIP en el proyecto y sube los cambios a GitHub para publicarlos.`);
}
async function downloadDrive() {
  if (!rendered()) return;
  downloadBlob(await createDriveZip(buildDriveEntries(roots, photos)), 'los-insurgentes-para-drive.zip');
  status(`Archivos para Drive descargados: textos y ${photos.size} foto(s). Extrae el ZIP y reemplaza los archivos dentro de las mismas secciones de la carpeta compartida. Los cambios no se publican hasta subirlos a GitHub.`);
}
async function saveFolder() {
  const entries = updateEntries();
  if (!entries) return;
  const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
  try {
    await directory.getFileHandle('index.html');
    const content = await directory.getDirectoryHandle('content');
    await content.getFileHandle('site.json');
  } catch { throw new Error('Selecciona la carpeta del proyecto que contiene index.html y content/site.json. No se guardó ningún cambio.'); }
  // Check every destination before the first write.
  for (const entry of entries) if (!safeUpdatePath(entry.name)) throw new Error('La actualización contiene una ruta no permitida.');
  try {
    for (const entry of entries) {
      const parts = entry.name.split('/');
      const name = parts.pop();
      let folder = directory;
      for (const part of parts) folder = await folder.getDirectoryHandle(part, { create: true });
      const file = await folder.getFileHandle(name, { create: true });
      const writer = await file.createWritable();
      try { await writer.write(entry.data); await writer.close(); }
      catch (error) { try { await writer.abort(); } catch {} throw error; }
    }
  } catch { throw new Error('No se completó el guardado. Puede haber archivos ya actualizados en la carpeta. Descarga el ZIP y aplica su contenido completo antes de publicar.'); }
  status('Actualización guardada en la carpeta del proyecto. Los cambios se publican al subirlos a GitHub.');
}

function stagePhoto(path, blob) {
  if (!safeUpdatePath(path) || !path.startsWith('content/photos/')) throw new Error('El destino de la foto no es válido.');
  if (photoURLs.has(path)) URL.revokeObjectURL(photoURLs.get(path));
  photos.set(path, blob); photoURLs.set(path, URL.createObjectURL(blob));
  const dimensions = photoDimensions.get(blob);
  if (dimensions) {
    const slot = photoSlots(roots.site).find((item) => item.path === path);
    const target = slot?.group === 'about' ? roots.site.about : slot?.group === 'gallery' ? roots.site.gallery[slot.index] : null;
    if (target) Object.assign(target, dimensions);
  }
}
async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Selecciona una foto JPG, PNG o WebP.');
  if (file.size > 30 * 1024 * 1024) throw new Error('La foto debe pesar menos de 30 MB.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#000'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (!blob) throw new Error('No fue posible preparar esta imagen.');
    photoDimensions.set(blob, { width: canvas.width, height: canvas.height });
    return blob;
  } finally { bitmap.close(); }
}
function clearPhotos() { for (const url of photoURLs.values()) URL.revokeObjectURL(url); photos.clear(); photoURLs.clear(); }
async function importFolder(files) {
  const mapped = new Map();
  let imported;
  const fromDrive = files.some((file) => relativeDrivePath(file.webkitRelativePath || file.name));
  if (fromDrive) {
    const assembled = await assembleDriveContent(files);
    imported = { site: assembled.site, releases: assembled.releases, lyrics: assembled.lyrics };
    for (const [path, file] of assembled.photos) mapped.set(path, file);
  } else {
    for (const file of files) {
      let path = (file.webkitRelativePath || file.name).split('/').slice(1).join('/');
      if (!path.startsWith('content/')) path = `content/${path}`;
      if (safeUpdatePath(path) && path !== 'index.html') mapped.set(path, file);
    }
    if (!mapped.has('content/site.json')) throw new Error('Selecciona la carpeta completa de Drive o la carpeta content del proyecto con site.json, releases.json y lyrics.json.');
    imported = {};
    for (const key of ['site', 'releases', 'lyrics']) {
      const file = mapped.get(`content/${key}.json`);
      if (!file) throw new Error(`Falta ${key}.json en la carpeta seleccionada.`);
      if (file.size > 2 * 1024 * 1024) throw new Error(`${key}.json es demasiado grande.`);
      imported[key] = JSON.parse(await file.text());
    }
  }
  if (!Array.isArray(imported.releases) || !Array.isArray(imported.lyrics)) throw new Error('Los archivos de música y letras no tienen el formato esperado.');
  const errors = validate(imported, new Set([...knownPhotos, ...mapped.keys()]));
  if (errors.length) throw new Error(errors.join(' '));
  const imageFiles = [...mapped].filter(([path]) => path.startsWith('content/photos/'));
  for (const [path, file] of imageFiles) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 30 * 1024 * 1024) throw new Error(`Foto no válida: ${path}. Usa JPG, PNG o WebP de menos de 30 MB.`);
    let bitmap;
    try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); photoDimensions.set(file, { width: bitmap.width, height: bitmap.height }); }
    catch { throw new Error(`No fue posible abrir la foto ${path}. Reemplázala por una imagen JPG, PNG o WebP válida.`); }
    finally { bitmap?.close(); }
  }
  clearPhotos(); Object.assign(roots, imported);
  for (const [path, file] of imageFiles) stagePhoto(path, file);
  renderForms(); errorList([]);
  status(`Carpeta ${fromDrive ? 'de Drive ' : ''}importada: textos y ${imageFiles.length} foto(s). Revisa la vista previa y descarga la actualización para GitHub cuando esté lista.`);
}
function add(kind, root, path) {
  const defaults = {
    member: { name: '', role: '' }, single: { title: '', year: new Date().getFullYear(), spotifyUrl: '', appleMusicUrl: '', youtubeUrl: '' },
    release: { title: '', year: null, type: 'Sencillo', spotifyUrl: '', artwork: '' },
    show: { date: '', label: '', venue: '', city: '', note: '', ticketUrl: '', enabled: false },
    lyric: { title: '', text: '', sourceUrl: '', provider: 'band' }, social: { label: '', url: '' }
  };
  const list = path ? get(root, path) : roots[root];
  list.push(defaults[kind]); renderForms();
  const targetPath = `${path ? `${path}.` : ''}${list.length - 1}.${kind === 'member' ? 'name' : kind === 'show' ? 'date' : kind === 'social' ? 'label' : 'title'}`;
  const input = $('sections').querySelector(`[data-root="${root}"][data-path="${targetPath}"]`);
  if (input) { input.closest('details').open = true; input.focus(); }
}

async function run(task) {
  if (!ready || busy) return;
  busy = true; document.body.setAttribute('aria-busy', 'true');
  const controls = [...document.querySelectorAll('input,textarea,select,button')];
  controls.forEach((control) => { control.disabled = true; });
  try { await task(); } catch (error) { if (error.name !== 'AbortError') errorList([error.message || 'No fue posible completar la acción.']); }
  finally { busy = false; document.body.removeAttribute('aria-busy'); controls.forEach((control) => { control.disabled = false; }); }
}
function validDraftShape(draft) {
  const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
  const strings = (value, keys) => object(value) && keys.every((key) => typeof value[key] === 'string');
  const rows = (value, keys) => Array.isArray(value) && value.every((entry) => strings(entry, keys));
  const site = draft?.site;
  return object(site) && site.version === 1
    && strings(site.site, ['title', 'description', 'url']) && strings(site.hero, ['title', 'tagline', 'image'])
    && strings(site.about, ['image', 'imageAlt']) && Array.isArray(site.about.paragraphs) && site.about.paragraphs.every((paragraph) => typeof paragraph === 'string')
    && rows(site.about.members, ['name', 'role']) && rows(site.gallery, ['image', 'alt'])
    && rows(site.singles, ['title', 'spotifyUrl']) && rows(site.socials, ['label', 'url'])
    && rows(site.shows?.upcoming, ['date', 'label', 'venue', 'city', 'note', 'ticketUrl']) && rows(site.shows?.past, ['date', 'label', 'venue', 'city', 'note', 'ticketUrl'])
    && strings(site.contact, ['email', 'instagramUrl']) && rows(draft?.releases, ['title', 'type', 'spotifyUrl']) && rows(draft?.lyrics, ['title', 'text', 'sourceUrl', 'provider']);
}
$('contentForm').addEventListener('submit', (event) => event.preventDefault());
$('contentForm').addEventListener('input', (event) => {
  const input = event.target;
  if (!input.dataset.path || !input.dataset.root) return;
  let value = input.type === 'checkbox' ? input.checked : input.type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value;
  if (input.dataset.paragraphs) value = input.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  set(input.dataset.root, input.dataset.path, value);
  status('Cambios locales pendientes. Revisa la vista previa y descarga la actualización.');
});
$('contentForm').addEventListener('change', (event) => {
  const path = event.target.dataset.photo;
  const file = event.target.files?.[0];
  if (path && file) run(async () => { status('Preparando foto…'); stagePhoto(path, await preparePhoto(file)); renderForms(); status(`Foto lista para actualizar: ${path}. Descarga o guarda la actualización para conservarla.`); });
});
$('sections').addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const { root, path, kind } = action.dataset;
  if (action.dataset.action === 'add') add(kind, root, path);
  if (action.dataset.action === 'remove') {
    const keys = path.split('.'); const index = Number(keys.pop());
    const list = keys.length ? get(root, keys.join('.')) : roots[root];
    const removed = list.splice(index, 1)[0];
    if (removed?.image && photos.has(removed.image)) { URL.revokeObjectURL(photoURLs.get(removed.image)); photos.delete(removed.image); photoURLs.delete(removed.image); }
    renderForms(); status('Elemento quitado del borrador. Descarga la actualización para conservar el cambio.');
  }
  if (action.dataset.action === 'addPhoto') {
    let number = 1;
    const used = new Set(photoSlots(roots.site).map((slot) => slot.path));
    while (used.has(`content/photos/galeria/${String(number).padStart(2, '0')}.jpg`)) number++;
    roots.site.gallery.push({ image: `content/photos/galeria/${String(number).padStart(2, '0')}.jpg`, alt: '', tall: false, enabled: false });
    renderForms(); const last = $('fotos').querySelectorAll('input[type="file"]'); last[last.length - 1]?.focus();
    status('Nuevo espacio de foto creado. Selecciona una imagen, describe la foto y activa «Mostrar en la galería».');
  }
});
$('importFolder').addEventListener('change', (event) => run(() => importFolder([...event.target.files])));
$('previewButton').addEventListener('click', () => run(preview));
$('download').addEventListener('click', () => run(download));
$('downloadDrive').addEventListener('click', () => run(downloadDrive));
$('saveFolder').addEventListener('click', () => run(saveFolder));
$('saveDraft').addEventListener('click', () => run(() => {
  localStorage.setItem(draftKey, JSON.stringify(roots)); $('restoreDraft').hidden = false;
  status('Borrador de textos guardado en este navegador. Las fotos requieren descargar o guardar la actualización.');
}));
$('restoreDraft').addEventListener('click', () => run(() => {
  const draft = JSON.parse(localStorage.getItem(draftKey));
  if (!validDraftShape(draft)) throw new Error('El borrador no tiene el formato esperado.');
  Object.assign(roots, { site: draft.site, releases: draft.releases, lyrics: draft.lyrics }); clearPhotos(); renderForms(); errorList([]);
  status('Borrador de textos restaurado. Vuelve a seleccionar las fotos que quieras reemplazar.');
}));
async function discoverPhotos(site) {
  await Promise.all(photoSlots(site).map(async (slot) => {
    if (!slot.path || !safeUpdatePath(slot.path)) return;
    try {
      const response = await fetch(new URL(`../${slot.path}`, location.href), { method: 'HEAD', cache: 'no-store' });
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) knownPhotos.add(slot.path);
    } catch { /* Missing reserved slots remain editable placeholders. */ }
  }));
}
async function init() {
  try {
    const [renderer, bundle, drive, ...data] = await Promise.all([
      import('../js/site-render.mjs'), import('../js/update-bundle.mjs'), import('../js/drive-layout.mjs'),
      ...['../content/site.json', '../content/releases.json', '../content/lyrics.json', '../templates/page.html'].map(async (url) => { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error(`No se pudo cargar ${url}.`); return url.endsWith('.json') ? response.json() : response.text(); })
    ]);
    ({ renderSite, validateSite, validateContent, photoSlots } = renderer); ({ createZip, createDriveZip, safeUpdatePath } = bundle);
    ({ drivePathForUpdate, relativeDrivePath, buildDriveEntries, assembleDriveContent } = drive);
    [roots.site, roots.releases, roots.lyrics, template] = data;
    await discoverPhotos(roots.site);
    const errors = validate(); if (errors.length) throw new Error(errors.join(' '));
    renderForms(); ready = true;
    ['previewButton', 'download', 'downloadDrive', 'saveFolder', 'saveDraft'].forEach((id) => { $(id).disabled = false; });
    $('saveFolder').hidden = !('showDirectoryPicker' in window);
    try { $('restoreDraft').hidden = !localStorage.getItem(draftKey); } catch {}
    status('Contenido listo. Los cambios quedan en esta pestaña hasta que los descargues o guardes.');
  } catch (error) { errorList([`${error.message} Abre el editor desde el servidor local o el sitio publicado; no directamente como archivo.`]); status('No se pudo abrir el contenido del editor.'); }
}
init();
