import { renderMusic, spotifyAlbumId } from './music-render.mjs';
import { renderLyrics, lyricSource } from './lyrics-render.mjs';
import { renderAnalytics } from './analytics-render.mjs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const e = escapeHtml;

export function secureUrl(value, allowedHosts) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return '';
    if (allowedHosts && !allowedHosts.includes(url.hostname)) return '';
    return url.href;
  } catch { return ''; }
}

export function photoPath(value) {
  return typeof value === 'string' && /^content\/photos\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i.test(value) ? value : '';
}

export function photoSlots(site) {
  return [
    { label: '01 · Fondo de inicio', path: site?.hero?.image, alt: 'Foto principal de la página', group: 'hero' },
    { label: '02 · La banda', path: site?.about?.image, alt: site?.about?.imageAlt || '', group: 'about' },
    ...(Array.isArray(site?.gallery) ? site.gallery : []).map((photo, index) => ({ label: `Galería · ${String(index + 1).padStart(2, '0')}`, path: photo?.image, alt: photo?.alt || '', group: 'gallery', index }))
  ];
}

export function validateSite(site) {
  const errors = [];
  if (!site || typeof site !== 'object' || Array.isArray(site)) return ['El contenido del sitio debe ser un objeto.'];
  if (site.version !== 1) errors.push('Versión de contenido no compatible.');
  for (const [value, label] of [[site.site?.title, 'Título del sitio'], [site.site?.description, 'Descripción del sitio'], [site.hero?.title, 'Título principal'], [site.hero?.tagline, 'Subtítulo principal']]) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`${label}: escribe un texto.`);
  }
  if (!secureUrl(site.site?.url)) errors.push('La dirección del sitio debe usar HTTPS.');
  if (!Array.isArray(site.about?.paragraphs) || !site.about.paragraphs.every(p => typeof p === 'string')) errors.push('La biografía debe contener párrafos de texto.');
  if (!Array.isArray(site.about?.members) || !site.about.members.every(m => m && typeof m.name === 'string' && typeof m.role === 'string')) errors.push('Revisa los nombres y roles de la banda.');
  if (!Array.isArray(site.gallery)) errors.push('La galería debe ser una lista.');
  if (!Array.isArray(site.singles)) errors.push('Los sencillos deben ser una lista.');
  if (!Array.isArray(site.socials)) errors.push('Las redes sociales deben ser una lista.');
  if (!Array.isArray(site.shows?.upcoming) || !Array.isArray(site.shows?.past)) errors.push('Las fechas deben ser listas.');
  if (errors.length) return errors;
  const seen = new Set();
  for (const slot of photoSlots(site)) {
    if (!photoPath(slot.path)) errors.push(`${slot.label}: usa una imagen dentro de content/photos/.`);
    else if (seen.has(slot.path)) errors.push(`${slot.label}: el archivo de foto ya está asignado a otro espacio.`);
    seen.add(slot.path);
  }
  site.gallery.forEach((photo, i) => {
    if (!photo || typeof photo !== 'object') { errors.push(`Foto ${i + 1}: contenido no válido.`); return; }
    if (photo.enabled !== false && (typeof photo.alt !== 'string' || !photo.alt.trim())) errors.push(`Foto ${i + 1}: agrega una descripción.`);
  });
  site.singles.forEach((single, i) => {
    if (!single || typeof single.title !== 'string' || !single.title.trim()) errors.push(`Sencillo ${i + 1}: falta el título.`);
    if (!spotifyAlbumId(single?.spotifyUrl)) errors.push(`Sencillo ${i + 1}: agrega un enlace de álbum de Spotify válido.`);
    if (single?.appleMusicUrl && !secureUrl(single.appleMusicUrl, ['music.apple.com'])) errors.push(`Sencillo ${i + 1}: revisa el enlace de Apple Music.`);
    if (single?.youtubeUrl && !secureUrl(single.youtubeUrl, ['www.youtube.com','youtube.com','youtu.be'])) errors.push(`Sencillo ${i + 1}: revisa el enlace de YouTube.`);
  });
  [...site.shows.upcoming, ...site.shows.past].forEach((show, i) => {
    if (!show || typeof show.venue !== 'string' || typeof show.city !== 'string') { errors.push(`Fecha ${i + 1}: revisa el foro y la ciudad.`); return; }
    const validDate = typeof show.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(show.date) && !Number.isNaN(Date.parse(show.date)) && new Date(show.date).toISOString().slice(0,10) === show.date;
    if (show.enabled !== false && !validDate) errors.push(`Fecha ${i + 1}: indica una fecha completa antes de publicarla.`);
    if (show.ticketUrl && !secureUrl(show.ticketUrl)) errors.push(`Fecha ${i + 1}: el enlace de boletos debe usar HTTPS.`);
  });
  site.socials.forEach((social, i) => {
    if (!social || typeof social.label !== 'string' || !secureUrl(social.url)) errors.push(`Red social ${i + 1}: revisa nombre y enlace HTTPS.`);
  });
  if (!secureUrl(site.contact?.instagramUrl, ['instagram.com','www.instagram.com'])) errors.push('Contacto: revisa el enlace de Instagram.');
  if (site.contact?.email && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(site.contact.email)) errors.push('Contacto: revisa el correo electrónico.');
  if (site.hero.position && !/^(?:left|center|right|\d{1,3}%)\s+(?:top|center|bottom|\d{1,3}%)$/.test(site.hero.position)) errors.push('Revisa la posición de la foto principal.');
  return errors;
}

export function validateContent(site, releases, lyrics) {
  const errors = validateSite(site);
  if (!Array.isArray(releases)) errors.push('Los lanzamientos deben ser una lista.');
  else releases.forEach((release, i) => {
    if (!release || typeof release.title !== 'string' || !release.title.trim() || !spotifyAlbumId(release.spotifyUrl)) errors.push(`Lanzamiento ${i + 1}: revisa el título y el enlace de Spotify.`);
  });
  if (!Array.isArray(lyrics)) errors.push('Las letras deben ser una lista.');
  else lyrics.forEach((lyric, i) => {
    if (!lyric || typeof lyric.title !== 'string' || typeof lyric.text !== 'string') errors.push(`Letra ${i + 1}: revisa el título y el texto.`);
    if (lyric?.sourceUrl && !lyricSource(lyric.sourceUrl)) errors.push(`Letra ${i + 1}: usa un enlace de Genius, Musixmatch o un lyric video de YouTube.`);
  });
  return errors;
}

const stamp = '<img src="assets/logos/skull-stamp-orange.png" alt="" class="label-stamp" aria-hidden="true" loading="lazy" width="1600" height="1600">';
const external = (url, label, cls = '') => `<a href="${e(url)}" target="_blank" rel="noopener noreferrer"${cls ? ` class="${e(cls)}"` : ''}>${label}</a>`;
const photoImage = (path, alt, cls = '', width = 1400, height = 933) => `<img src="${e(photoPath(path))}" alt="${e(alt)}"${cls ? ` class="${cls}"` : ''} width="${Number(width) || 1400}" height="${Number(height) || 933}" loading="lazy" decoding="async">`;

function renderHero(site) {
  return `<section class="hero" id="top" style="--hero-photo:url('${e(site.hero.image)}');background-position:${e(site.hero.position || 'center 35%')}">
    <div class="hero-inner">
      <img src="assets/logos/logo-full-white.png" alt="Los Insurgentes" class="hero-mark" width="1600" height="561" fetchpriority="high">
      <h1>${e(site.hero.title)}</h1>
      <p class="hero-tagline">${e(site.hero.tagline)}</p>
      ${site.hero.announcement ? `<p class="hero-announcement">${e(site.hero.announcement)}</p>` : ''}
      <div class="hero-ctas"><a href="#sencillos" class="btn btn-solid">Escuchar sencillos <span aria-hidden="true">↗</span></a><a href="#shows" class="btn btn-outline">Ver fechas</a></div>
    </div>
  </section>`;
}
function renderTicker(site) {
  const sequence = [site.hero.title, 'Rock desde Monterrey', site.hero.announcement || site.hero.tagline].map(text => `<span class="ticker-item">${e(text)}</span>`).join('');
  return `<div class="ticker-section" aria-hidden="true"><div class="ticker-band"><div class="ticker-track"><div class="ticker-seq">${sequence}${sequence}</div><div class="ticker-seq">${sequence}${sequence}</div></div></div></div>`;
}
function renderSingles(site, releases) {
  const cards = site.singles.map(single => {
    const release = releases.find(item => spotifyAlbumId(item.spotifyUrl) === spotifyAlbumId(single.spotifyUrl));
    const artwork = release?.artwork && /^https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+$/.test(release.artwork) ? release.artwork : '';
    return `<article class="single-card reveal">${artwork ? `<img class="single-artwork" src="${e(artwork)}" alt="Portada de ${e(single.title)}" width="640" height="640" loading="lazy" decoding="async">` : ''}<div class="single-copy"><span class="single-year">${e(single.year || '')} · Sencillo</span><h3 class="single-title">${e(single.title)}</h3><div class="single-links">${external(single.spotifyUrl, 'Escuchar en Spotify', 'single-link-spotify')}${single.appleMusicUrl ? external(single.appleMusicUrl, 'Apple Music', 'single-link-secondary') : ''}${single.youtubeUrl ? external(single.youtubeUrl, 'YouTube', 'single-link-secondary') : ''}</div></div></article>`;
  }).join('\n');
  return `<section class="singles" id="sencillos"><div class="container"><div class="label-row"><span class="section-label">${e(site.hero.title)}</span>${stamp}</div><h2 class="section-title reveal">Sencillos</h2><p class="section-intro">Los primeros adelantos del nuevo álbum, ya disponibles.</p><div class="singles-grid">${cards}</div></div></section>`;
}
function renderAbout(site) {
  return `<section class="about" id="about"><div class="container"><div class="about-title-big" aria-hidden="true">Nosotros</div><div class="about-grid"><div><span class="section-label">Desde Monterrey, N.L.</span><h2 class="section-title reveal">La banda</h2><div class="about-body">${site.about.paragraphs.filter(Boolean).map(p => `<p>${e(p)}</p>`).join('')}</div></div><div class="members">${site.about.members.map(member => `<div class="member-card reveal"><div class="member-name">${e(member.name)}</div><div class="member-role">${e(member.role)}</div></div>`).join('')}</div></div>${photoImage(site.about.image, site.about.imageAlt, 'about-photo',site.about.width,site.about.height)}</div></section>`;
}
function renderGallery(site) {
  const cards = site.gallery.filter(p => p.enabled !== false).map((photo, index, all) => `<div class="gallery-item${photo.tall ? ' tall' : ''} reveal"><button type="button" class="gallery-trigger" aria-label="Abrir foto ${index + 1}: ${e(photo.alt)}">${photoImage(photo.image, photo.alt, '',photo.width,photo.height)}</button>${index === all.length - 1 ? '<img src="assets/logos/skull-stamp-orange.png" alt="" class="gallery-stamp" aria-hidden="true" width="1600" height="1600" loading="lazy">' : ''}</div>`).join('\n');
  return `<section id="gallery" class="gallery-section"><div class="gallery-pattern" aria-hidden="true"></div><div class="container"><span class="section-label">Galería</span><h2 class="section-title reveal">Dentro y fuera<br>del escenario.</h2><p class="section-intro">Shows, carretera y todo lo que pasa entre canciones.</p><div class="gallery-grid">${cards}</div></div></section>`;
}
function renderShows(site) {
  const renderShow = show => {
    const date = new Date(`${show.date}T12:00:00Z`);
    const dateLabel = show.label || new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date).toUpperCase();
    return `<div class="show-row"><time class="show-date" datetime="${e(show.date)}">${e(dateLabel)}</time><div class="show-details"><div class="show-venue">${e(show.venue)}</div><div class="show-city">${e(show.city)}</div>${show.note ? `<div class="show-note">${e(show.note)}</div>` : ''}</div>${show.ticketUrl ? external(show.ticketUrl,'Boletos','btn btn-outline') : ''}</div>`;
  };
  const upcoming = site.shows.upcoming.filter(show => show.enabled !== false).sort((a,b) => a.date.localeCompare(b.date));
  const past = site.shows.past.filter(show => show.enabled !== false).sort((a,b) => b.date.localeCompare(a.date));
  return `<section id="shows" class="shows-section"><div class="shows-pattern" aria-hidden="true"></div><img src="assets/logos/skull-icon-white.png" alt="" class="shows-skull" aria-hidden="true" loading="lazy" width="1600" height="1400"><div class="container"><span class="section-label">En vivo</span><h2 class="section-title reveal">Nos vemos ahí.</h2><div class="shows-group"><h3>Próximas fechas</h3>${upcoming.length ? upcoming.map(renderShow).join('') : `<div class="empty-state">Estamos preparando el próximo encuentro.<br>Síguenos en ${external(site.contact.instagramUrl,'Instagram')} para conocer las nuevas fechas.</div>`}</div>${past.length ? `<div class="shows-group"><h3>Shows anteriores</h3>${past.map(renderShow).join('')}</div>` : ''}</div></section>`;
}
function renderContact(site) {
  const email = site.contact.email;
  const cta = email ? `<a class="btn btn-solid" href="mailto:${e(email)}">${e(email)}</a>` : external(site.contact.instagramUrl,'Escríbenos en Instagram <span aria-hidden="true">↗</span>','btn btn-solid');
  return `<section class="contact-section" id="contact"><div class="container contact-grid"><div><span class="section-label">Contacto</span><h2 class="section-title">Hagamos ruido.</h2><p>Shows, prensa y colaboraciones. Hablemos.</p></div>${cta}</div></section>`;
}
function renderMeta(site, options) {
  const canonical = new URL(secureUrl(options.siteUrl || site.site.url));
  if (!canonical.pathname.endsWith('/')) canonical.pathname += '/';
  canonical.search = ''; canonical.hash = '';
  const image = new URL('assets/og-image.jpg',canonical).href;
  const title = e(site.site.title), description = e(site.site.description);
  return `<title>${title}</title>\n<meta name="description" content="${description}">\n<link rel="canonical" href="${e(canonical.href)}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:image" content="${e(image)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="Los Insurgentes — rock desde Monterrey">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="es_MX">\n<meta property="og:site_name" content="Los Insurgentes">\n<meta property="og:url" content="${e(canonical.href)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${description}">\n<meta name="twitter:image" content="${e(image)}">\n<meta name="twitter:image:alt" content="Los Insurgentes — rock desde Monterrey">`;
}

export function renderSite(template, site, releases, lyrics, options = {}) {
  const errors = validateContent(site,releases,lyrics);
  if (options.siteUrl && !secureUrl(options.siteUrl)) errors.push('SITE_URL debe usar HTTPS.');
  if (errors.length) throw new Error(errors.join('\n'));
  const blocks = {
    TELEMETRY: renderAnalytics(options.analytics),
    META: renderMeta(site,options), HERO: renderHero(site), TICKER: renderTicker(site), SINGLES: renderSingles(site,releases), ABOUT: renderAbout(site), MUSIC: renderMusic(releases), GALLERY: renderGallery(site), LYRICS: renderLyrics(lyrics), SHOWS: renderShows(site), CONTACT: renderContact(site),
    FOOTER: `<footer class="site-footer"><img src="assets/logos/logo-full-white.png" alt="Los Insurgentes" class="footer-mark" width="1600" height="561"><div class="social-row">${site.socials.map(s => external(s.url,e(s.label))).join('')}</div><p class="footer-fine">&copy; <span id="year">${new Date().getUTCFullYear()}</span> Los Insurgentes · Monterrey, N.L.</p></footer>`
  };
  return template.replace(/\{\{([A-Z]+)\}\}/g, (match,key) => {
    if (!(key in blocks)) throw new Error(`Bloque de plantilla desconocido: ${key}`);
    return blocks[key];
  });
}
