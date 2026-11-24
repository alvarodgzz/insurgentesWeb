# Los Insurgentes

Sitio oficial de la banda: rock desde Monterrey. Mantiene la identidad naranja/negro, los logotipos y tipografías oficiales, y las fotografías reales del proyecto original.

**Maratón sigue próximo a salir. El siguiente sencillo está previsto para noviembre de 2026.** No hay título ni día de lanzamiento anunciados en estos archivos.

## Abrir el sitio y el editor

Haz doble clic en `start.command`, o ejecuta:

```bash
cd /Users/alvarodgzz/insurgentesWeb
node scripts/preview.mjs --open
```

- Sitio: <http://127.0.0.1:8000/>
- Editor de la banda: <http://127.0.0.1:8000/admin/>
- Detener: `Ctrl+C` en Terminal.

Necesitas Node.js 22 o posterior. No hay paquetes que instalar ni una suscripción a un CMS.

## Actualizar fotos y contenido sin editar código

En el editor puedes cambiar el anuncio principal, biografía, integrantes, sencillos, lanzamientos de Spotify, shows, letras, redes y contacto. **Vista previa** muestra el resultado antes de guardarlo.

Las fotos tienen espacios identificables:

| Archivo | Uso |
| --- | --- |
| `content/photos/01-inicio.jpg` | Fondo de la primera pantalla |
| `content/photos/02-banda.jpg` | Foto de la banda |
| `content/photos/galeria/01.jpg` … `18.jpg` | Galería, en orden |

En **Fotos**, cada espacio muestra una miniatura, su función y su nombre de archivo. Reemplaza la imagen desde ahí; también puedes reemplazar un JPG directamente en la carpeta conservando el nombre. El editor acepta JPG, PNG y WebP; las imágenes nuevas se convierten a JPG para conservar nombres sencillos.

La carpeta también contiene [00-guia.html](content/photos/00-guia.html): un mapa visual de las veinte fotos, que puedes abrir para identificar qué archivo reemplazar.

- **Guardar en carpeta**, si tu navegador lo permite: selecciona esta carpeta del proyecto. El editor guarda los textos, fotos cambiadas y página generada. Chrome y Edge de escritorio ofrecen esta opción.
- **Descargar para GitHub**: descarga un ZIP con los archivos cambiados. Descomprímelo y combina su contenido con la carpeta del proyecto, conservando la estructura de carpetas. El ZIP es una actualización, no una copia completa del sitio.
- **Descargar para Drive**: prepara los textos y fotos por secciones, con los nombres de la carpeta compartida. Descomprime el ZIP y actualiza esos archivos en Drive.
- **Importar carpeta**: carga el contenido compartido para editarlo y revisarlo. Selecciona la carpeta descargada de Drive que contiene las secciones, o una carpeta `content` del proyecto.

La banda eligió Google Drive. La carpeta [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1) organiza fotos y textos por secciones. Los integrantes pueden reemplazar las fotos conservando sus nombres y preparar textos con el editor. Consulta [la guía para la banda](docs/GOOGLE_DRIVE.md).

**Guardar archivos o subirlos a Drive no publica el sitio.** Una persona designada revisa e importa el contenido en el proyecto y sube los cambios al repositorio de GitHub. El flujo de GitHub Pages genera la página y la publica. La sincronización automática de Drive a GitHub no está configurada.

El editor no tiene acceso de escritura al servidor. El editor `/admin/` solo está disponible en tu servidor local; el paquete de Pages no lo publica. La ruta `/admin/estadisticas/` es una página pública independiente que enlaza al panel privado de Umami.

## Spotify y letras

La página incluye un reproductor oficial de Spotify y 14 lanzamientos verificados. Selecciona un lanzamiento para cargarlo en el reproductor. La reproducción completa y disponibilidad dependen de Spotify, la región y la sesión del visitante.

Las letras pueden ser texto proporcionado por la banda o enlaces verificados a Genius, Musixmatch o videos oficiales. **Flores** ya enlaza al lyric video del canal de la banda. Los títulos sin texto/enlace quedan fuera de la página pública. Consulta [las opciones de letras](docs/LYRICS.md).

## Banner de Maratón, sitio y registro opcional

El 23 de noviembre de 2026 el propietario autorizó abrir el sitio completo al público y eligió **banner → sitio, con registro opcional desde ambos**. La implementación de este recorrido debe comprobarse en Actions y en el dominio antes de anunciarla como publicada.

- `/`: banner de Maratón con una sola calavera naranja para **Entrar al sitio** y el enlace **Recibir comunicados**.
- `/sitio/`: página completa pública, sin contraseña ni registro obligatorio.
- `/registro/`: formulario de Maratón con el diseño negro original; se puede volver al sitio sin enviar un correo.
- `/banda/`: enlace compatible que redirige a `/sitio/`.
- `404.html`: página de marca sin formulario ni estadísticas.
- `/admin/estadisticas/`: entrada pública al panel externo de Umami; los datos requieren la cuenta autorizada.

El slogan es **Esa calavera que ya viene por ti...**. El logo del menú se amplía para ser legible en móvil y escritorio. La galería conserva las fotos y controles, sin descripciones visibles; las imágenes mantienen su texto alternativo para accesibilidad.

El paquete publica las páginas, fotografías y recursos que usa el sitio. Excluye el editor, las plantillas, los JSON de contenido/configuración, los originales de branding, archivos `.env` y paquetes de vista previa cifrada. El `index.html` del proyecto sigue siendo la página completa para edición local; las rutas públicas se generan en `_site/`.

Para publicar los cambios revisados:

```bash
bash scripts/publish-github.sh
```

Cada push a `main` activa automáticamente las pruebas y el deploy de Pages. No hace falta otro comando de deploy después de un push correcto. Revisa los trabajos `build` y `deploy` y comprueba las rutas reales; un commit o un build local no demuestran publicación. El último despliegue confirmado antes de este lanzamiento es `fe2a446`, Actions `45317446487`, con las cuatro fotos importadas desde Drive y el modo protegido anterior.

Para revisar el recorrido público localmente: `node scripts/preview.mjs --public --open`. La publicación predeterminada con `node scripts/prepare-pages.mjs` y su alias `--public` no necesita contraseña. `--signup-only` conserva deliberadamente el registro en raíz y la banda protegida; `--gated` conserva ambas vistas protegidas. La contraseña ignorada `.env.preview-password` y el secreto existente `PREVIEW_PASSWORD` son para esos modos de reversión. Consulta [publicación y reversión](docs/GITHUB_PAGES.md).

El registro de Brevo está activado en la configuración local. El propietario eligió **Simple confirmation** y reportó actualizar la bienvenida en Brevo el 7 de noviembre. El dominio y remitente ya se mostraban autenticados en las capturas del 28 de octubre; la entrega de esa nueva bienvenida, la lista de destino y el flujo real en navegador siguen pendientes de verificar. No hay enlace alternativo. El resultado dentro del registro exige HTTP correcto y `success: true`; los errores conservan el correo y no hay reenvío automático. Consulta [la guía](docs/MAILING_LIST.md) y [el diseño de bienvenida](docs/BREVO_TEXTOS.md).

La navegación pública y el formulario nativo son utilizables sin JavaScript. Solo los modos de reversión cifrados requieren JavaScript y HTTPS o `localhost` para abrir su contenido. El repositorio actual es público; el cifrado histórico no vuelve privados sus archivos ni crea autenticación de servidor.

Los registros DNS suministrados por el propietario apuntan a GitHub Pages. El 7 de noviembre se verificó HTTPS en `losinsurgentes.mx` y `www.losinsurgentes.mx`. No se modificó ni comprobó desde aquí **Enforce HTTPS** en **Settings → Pages**. No restaures **Squarespace Defaults**, porque volvería a apuntar al alojamiento anterior.

## Estadísticas

El propietario eligió Umami Cloud Hobby y proporcionó el **Website ID**. La configuración optativa de `content/analytics.json` se aplica únicamente al banner en la raíz HTTPS del dominio. Se mantienen las exclusiones de datos de formulario, consultas, fragmentos y visitas con DNT/GPC. No se inyecta medición en `/sitio/`, `/registro/`, el redirect de `/banda/`, `404.html` ni los modos protegidos de reversión. La llegada de datos después de publicar aún debe verificarse.

La página `/admin/estadisticas/` sigue enlazando al panel de Umami y requiere su cuenta autorizada. Consulta [la configuración y los límites](docs/ANALYTICS.md).

## Desarrollo

Antes de pushear cambios visuales o de navegación, ejecuta `node scripts/qa-browser.mjs` y revisa el storyboard en `_qa/index.html`. La primera ejecución usa `node scripts/qa-browser.mjs --install`. Estas pruebas Playwright también bloquean el despliegue si fallan en Actions; consulta [la guía](docs/BROWSER_QA.md).

```bash
node --test tests/*.test.mjs
node scripts/build.mjs
node scripts/check.mjs
node scripts/prepare-pages.mjs
```

- `content/`: contenido que mantiene la banda, fotos numeradas y configuración `analytics.json` / `newsletter.json`.
- `admin/`: editor visual sin dependencias ni servidor de escritura; `admin/estadisticas/` enlaza al panel externo.
- `templates/page.html`: estructura del sitio completo; `templates/maraton.html`: registro opcional de Maratón.
- `js/site-render.mjs`, `music-render.mjs`, `lyrics-render.mjs`: contenido estático, también usado en la vista previa.
- `index.html`: página generada; no editar directamente.
- `css/`, `js/main.js`, `js/spotify.js`: diseño e interacciones.
- `assets/`: identidad original y archivo fotográfico. Nunca imitar el logotipo con texto/CSS.
- `_site/`: banner, sitio, registro opcional, redirect compatible y recursos permitidos; se genera y se excluye de Git.
- `scripts/prepare-pages.mjs`: publicación pública; `scripts/private-preview.mjs`: modos de reversión protegidos.
- `.env.preview-password`: contraseña local ignorada por Git; nunca se publica.

`index.html` sigue siendo la página completa para edición local; `prepare-pages` genera el recorrido público autorizado en `_site/`. Los modos protegidos quedan disponibles para una reversión deliberada y no son el deploy predeterminado. No incluyas claves API, configuraciones de Claude/Codex ni archivos privados al publicar.
