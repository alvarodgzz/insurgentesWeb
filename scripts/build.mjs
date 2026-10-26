import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { renderSite, photoSlots, escapeHtml } from '../js/site-render.mjs';
import { readAnalytics } from './analytics-config.mjs';

export async function build(root = resolve(fileURLToPath(new URL('..', import.meta.url))), siteUrl = process.env.SITE_URL) {
  const read = path => readFile(resolve(root,path),'utf8');
  const [template,siteText,releasesText,lyricsText] = await Promise.all(['templates/page.html','content/site.json','content/releases.json','content/lyrics.json'].map(read));
  const site = JSON.parse(siteText);
  const html = renderSite(template,site,JSON.parse(releasesText),JSON.parse(lyricsText),{siteUrl, analytics: await readAnalytics(root)});
  const requiredPhotos = photoSlots(site).filter(photo => photo.group !== 'gallery' || site.gallery[photo.index].enabled !== false);
  await Promise.all(requiredPhotos.map(photo => access(resolve(root,photo.path))));
  await writeFile(resolve(root,'index.html'),html);
  const mapCards = photoSlots(site).map(photo => {
    const active = photo.group !== 'gallery' || site.gallery[photo.index].enabled !== false;
    const relativePhoto = photo.path.replace(/^content\/photos\//,'');
    return `<article>${active ? `<img src="${escapeHtml(relativePhoto)}" alt="${escapeHtml(photo.alt)}" loading="lazy">` : '<div class="reserved">Espacio reservado</div>'}<h2>${escapeHtml(photo.label)}</h2><code>${escapeHtml(relativePhoto)}</code><p>${escapeHtml(photo.alt)}</p></article>`;
  }).join('\n');
  const photoMap = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guía de fotos · Los Insurgentes</title><style>body{background:#141415;color:#dcd9d0;font:16px/1.6 system-ui,sans-serif;margin:0;padding:clamp(20px,5vw,64px)}h1{font-size:clamp(32px,5vw,64px);line-height:1.1;margin-bottom:20px}h2{font-size:18px;margin-bottom:8px}a{color:#f86927}header{max-width:780px;margin-bottom:40px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:24px}article{background:#242426;padding:16px;border:1px solid #444}img,.reserved{display:block;width:100%;height:230px;object-fit:cover}.reserved{display:grid;place-items:center;background:#333}code{color:#f86927}p{color:#bbb}article p{font-size:13px}</style><header><p>LOS INSURGENTES · CARPETA COMPARTIDA</p><h1>Cada foto tiene su lugar.</h1><p>Reemplaza la imagen conservando exactamente su nombre. Esta guía muestra dónde aparece cada foto. El editor también permite cambiar fotos y descripciones.</p><p><a href="../../admin/">Abrir editor del sitio ↗</a></p><p>Los cambios aparecerán en la web después de publicarlos en GitHub.</p></header><div class="grid">${mapCards}</div></html>`;
  await writeFile(resolve(root,'content/photos/00-guia.html'),photoMap);
  console.log('Website generated from band content.');
  return html;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => { console.error(error.message); process.exitCode = 1; });
}
