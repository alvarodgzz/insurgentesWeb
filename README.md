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

El editor no tiene acceso de escritura al servidor. Durante la vista previa protegida, `/admin/` solo está disponible en tu servidor local; el paquete de Pages no lo publica.

## Spotify y letras

La página incluye un reproductor oficial de Spotify y 14 lanzamientos verificados. Selecciona un lanzamiento para cargarlo en el reproductor. La reproducción completa y disponibilidad dependen de Spotify, la región y la sesión del visitante.

Las letras pueden ser texto proporcionado por la banda o enlaces verificados a Genius, Musixmatch o videos oficiales. **Flores** ya enlaza al lyric video del canal de la banda. Los títulos sin texto/enlace quedan fuera de la página pública. Consulta [las opciones de letras](docs/LYRICS.md).

## Vista previa con contraseña y GitHub Pages

El repositorio es [alvarodgzz/insurgentesWeb](https://github.com/alvarodgzz/insurgentesWeb). El propietario ya mostró una publicación correcta en GitHub Pages y configuró `losinsurgentes.mx`. **La nueva portada de acceso todavía debe publicarse.**

Por petición del propietario, el empaquetado ahora prepara una portada con la calaca, el logo y una contraseña. El sitio completo se cifra antes de subirlo a Pages; las fotos, los textos y el editor no se publican como archivos sueltos. Sin contraseña de compilación se publica únicamente la portada, sin el contenido cifrado. La navegación dentro de la vista previa requiere JavaScript y HTTPS; `localhost` también permite probarla.

La contraseña local se guarda en `.env.preview-password`, un archivo ignorado por Git. No la agregues al repositorio. Ejecuta desde tu terminal:

```bash
bash scripts/publish-github.sh
```

El script valida el sitio y, si encuentra ese archivo, configura el secreto de Actions `PREVIEW_PASSWORD`. Después sube los cambios e inicia Pages. Para revisar la portada localmente: `node scripts/preview.mjs --protected --open`. Consulta [los pasos y límites de la protección](docs/GITHUB_PAGES.md).

**El repositorio actual es público y ya contiene el código, los textos y las fotos en su historial.** El cifrado protege el nuevo paquete de Pages, pero no vuelve privados esos archivos de GitHub ni los retira del historial. Esta vista previa no equivale a autenticación en un servidor. Para confidencialidad del material también se debe resolver la visibilidad del repositorio y sus copias existentes.

Los registros DNS suministrados por el propietario apuntan a GitHub Pages. En la última captura, GitHub todavía estaba emitiendo el certificado TLS. Cuando termine, activa **Enforce HTTPS** en **Settings → Pages**. No restaures el preset **Squarespace Defaults**, porque volvería a apuntar al alojamiento anterior.

## Desarrollo

```bash
node --test tests/*.test.mjs
node scripts/build.mjs
node scripts/check.mjs
node scripts/prepare-pages.mjs
```

- `content/`: contenido que mantiene la banda y fotos numeradas.
- `admin/`: editor visual sin dependencias ni servidor de escritura.
- `templates/page.html`: estructura de la página.
- `js/site-render.mjs`, `music-render.mjs`, `lyrics-render.mjs`: contenido estático, también usado en la vista previa.
- `index.html`: página generada; no editar directamente.
- `css/`, `js/main.js`, `js/spotify.js`: diseño e interacciones.
- `assets/`: identidad original y archivo fotográfico. Nunca imitar el logotipo con texto/CSS.
- `_site/`: portada y paquete cifrado preparados para GitHub Pages; se genera y se excluye de Git.
- `scripts/private-preview.mjs`: empaquetado de la vista previa protegida.
- `.env.preview-password`: contraseña local ignorada por Git; nunca se publica.

`index.html` sigue siendo la página completa para revisión y edición local; el comando `prepare-pages` genera por separado la portada de `_site/`. La opción `--public` de ese comando es exclusiva del lanzamiento futuro: no la uses mientras la vista previa deba permanecer protegida. No incluyas claves API, configuraciones de Claude/Codex ni archivos privados al publicar.
