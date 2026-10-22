/** The shared Drive folder contains content only. No login or public sharing is needed. */
export const DRIVE_PATHS = Object.freeze({
  baseline: '00 - Guia y ajustes/site.json',
  hero: '01 - Inicio/inicio.json',
  about: '02 - La banda/banda.json',
  singles: '03 - Sencillos/sencillos.json',
  releases: '04 - Musica/releases.json',
  gallery: '05 - Galeria/galeria.json',
  lyrics: '06 - Letras/lyrics.json',
  shows: '07 - Fechas/shows.json',
  contact: '08 - Contacto/contacto.json'
});
const configs = new Set(Object.values(DRIVE_PATHS));
const canonicalPhoto = (path) => typeof path === 'string' && /^content\/photos\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(path);

export function isDrivePath(path) {
  return typeof path === 'string' && (configs.has(path)
    || path === '01 - Inicio/01-inicio.jpg' || path === '02 - La banda/02-banda.jpg'
    || /^05 - Galeria\/\d{2,}\.jpg$/.test(path));
}

/** Accept a direct path or the extra folder prefix supplied by a directory picker. */
export function relativeDrivePath(value) {
  if (typeof value !== 'string' || value.includes('\\')) return null;
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return null;
  for (let offset = 0; offset < parts.length - 1; offset++) {
    const path = parts.slice(offset).join('/');
    if (isDrivePath(path)) return path;
  }
  return null;
}

export function drivePathForUpdate(path, site) {
  const json = { 'content/site.json': DRIVE_PATHS.baseline, 'content/releases.json': DRIVE_PATHS.releases, 'content/lyrics.json': DRIVE_PATHS.lyrics };
  if (Object.hasOwn(json, path)) return json[path];
  if (!canonicalPhoto(path)) return null;
  if (path === site?.hero?.image) return '01 - Inicio/01-inicio.jpg';
  if (path === site?.about?.image) return '02 - La banda/02-banda.jpg';
  if (Array.isArray(site?.gallery) && site.gallery.some((photo) => photo?.image === path)) {
    const match = /^content\/photos\/galeria\/(\d{2,}\.jpg)$/.exec(path);
    if (match) return `05 - Galeria/${match[1]}`;
  }
  return null;
}

/** Download an update, not a snapshot: unchanged photographs are left in Drive. */
export function buildDriveEntries(roots, photos = new Map()) {
  const values = { baseline: roots.site, releases: roots.releases, lyrics: roots.lyrics };
  for (const key of ['hero', 'about', 'singles', 'gallery', 'shows', 'contact']) values[key] = roots.site[key];
  const entries = Object.entries(values).map(([key, value]) => ({ name: DRIVE_PATHS[key], data: JSON.stringify(value, null, 2) + '\n' }));
  for (const [path, data] of photos) {
    const name = drivePathForUpdate(path, roots.site);
    if (!name) throw new Error(`Esta foto no tiene un espacio compatible en Drive: ${path}. Usa los nombres numerados del editor.`);
    entries.push({ name, data });
  }
  return entries;
}

async function readJSON(file, path) {
  const data = file.data ?? file;
  const size = typeof data === 'string' ? new TextEncoder().encode(data).length : data.size ?? data.byteLength;
  if (size > 2 * 1024 * 1024) throw new Error(`${path} es demasiado grande.`);
  let text;
  if (typeof data === 'string') text = data;
  else if (typeof data.text === 'function') text = await data.text();
  else if (data instanceof Uint8Array) text = new TextDecoder().decode(data);
  else throw new Error(`No fue posible leer ${path}.`);
  try { return JSON.parse(text); }
  catch { throw new Error(`Revisa el formato JSON de ${path}.`); }
}

/** Build canonical content from a privately downloaded Drive folder. */
export async function assembleDriveContent(files) {
  const mapped = new Map();
  for (const file of files) {
    const path = relativeDrivePath(file.path ?? file.webkitRelativePath ?? file.name);
    if (!path) continue;
    if (mapped.has(path)) throw new Error(`Hay dos archivos con el mismo nombre: ${path}. Elimina el duplicado en Drive.`);
    mapped.set(path, file);
  }
  for (const key of ['baseline', 'releases', 'lyrics']) {
    if (!mapped.has(DRIVE_PATHS[key])) throw new Error(`Falta ${DRIVE_PATHS[key]}. Selecciona la carpeta completa descargada de Drive.`);
  }
  const site = await readJSON(mapped.get(DRIVE_PATHS.baseline), DRIVE_PATHS.baseline);
  if (!site || typeof site !== 'object' || Array.isArray(site)) throw new Error('site.json debe contener la configuración del sitio.');
  for (const key of ['hero', 'about', 'singles', 'gallery', 'shows', 'contact']) {
    const path = DRIVE_PATHS[key];
    if (mapped.has(path)) site[key] = await readJSON(mapped.get(path), path);
  }
  const releases = await readJSON(mapped.get(DRIVE_PATHS.releases), DRIVE_PATHS.releases);
  const lyrics = await readJSON(mapped.get(DRIVE_PATHS.lyrics), DRIVE_PATHS.lyrics);
  const photos = new Map(), destinations = new Map();
  const paths = [site.hero?.image, site.about?.image, ...(Array.isArray(site.gallery) ? site.gallery.map((photo) => photo?.image) : [])];
  for (const path of paths) {
    const drive = drivePathForUpdate(path, site);
    if (!drive) throw new Error('Las fotos de Drive deben usar los espacios numerados del editor.');
    if (destinations.has(drive)) throw new Error(`La foto ${drive} está asignada a más de un espacio.`);
    destinations.set(drive, path);
    if (mapped.has(drive)) {
      const file = mapped.get(drive);
      photos.set(path, file.data ?? file);
    }
  }
  return { site, releases, lyrics, photos };
}
