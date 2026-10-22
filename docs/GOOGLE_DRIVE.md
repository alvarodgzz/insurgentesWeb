# Actualizar el sitio desde Google Drive

La carpeta de trabajo de la banda es [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1). Está en un Drive personal; compartirla con la banda permite colaborar sin dar acceso al código ni a la cuenta de GitHub.

La carpeta ya está compartida con la cuenta de la banda como **Editor**. Para sumar a los demás integrantes, invítalos desde **Compartir** y conserva el acceso general en **Restringido**. No hace falta hacer pública la carpeta.

## Qué hay en cada sección

| Carpeta | Contenido |
| --- | --- |
| `00 - Guia y ajustes` | Instrucciones, mapa de fotos y configuración base |
| `01 - Inicio` | `01-inicio.jpg` y textos de la primera pantalla en `inicio.json` |
| `02 - La banda` | `02-banda.jpg`, biografía e integrantes en `banda.json` |
| `03 - Sencillos` | Contenido destacado en `sencillos.json` |
| `04 - Musica` | Catálogo de Spotify en `releases.json` |
| `05 - Galeria` | Fotos `01.jpg` a `18.jpg` y descripciones en `galeria.json` |
| `06 - Letras` | Letras y enlaces autorizados en `lyrics.json` |
| `07 - Fechas` | Conciertos confirmados en `shows.json` |
| `08 - Contacto` | Redes y contacto en `contacto.json` |

## Cambiar una foto

1. Abre la sección en Drive y localiza el archivo por su nombre y miniatura. El mapa de fotos está en `00 - Guia y ajustes`; el editor también muestra las veinte fotos por separado.
2. En Drive, selecciona la foto y busca **Administrar versiones → Subir nueva versión** en el menú de más opciones (puede estar dentro de **Información del archivo**). Sube un JPG con la nueva imagen. Así conservas un único archivo con el mismo nombre. Consulta [la ayuda de Google sobre versiones](https://support.google.com/drive/answer/2409045?hl=es).
3. Conserva el nombre y la extensión: por ejemplo, `01-inicio.jpg`, `02-banda.jpg` o `07.jpg` dentro de Galería. Evita copias con nombres como `07 (1).jpg`.

Usa fotos reales y aprobadas de la banda. Para las dos fotos principales, elige imágenes horizontales con espacio para recortar. Si tienes PNG o WebP, cámbialos desde el editor: los convierte a JPG; cambiar solamente la extensión del archivo no sirve.

## Cambiar textos, enlaces o descripciones

Los archivos `.json` guardan el contenido; no se editan como un Google Doc. Usa el editor visual del sitio:

1. Descarga la carpeta de contenido desde Drive y descomprime el ZIP. Trabaja sobre una descarga reciente para conservar las aportaciones de los demás.
2. Abre el editor en `/admin/`. En el proyecto local: ejecuta `node scripts/preview.mjs --open` y abre <http://127.0.0.1:8000/admin/>.
3. Pulsa **Importar carpeta** y selecciona la carpeta descargada que contiene las secciones. Revisa los avisos de importación.
4. Cambia los textos o fotos y usa **Vista previa** para revisar el resultado.
5. Pulsa **Descargar para Drive** y descomprime el ZIP. Sube los archivos a sus mismas carpetas en Drive, reemplazando los anteriores. Para fotos, utiliza **Administrar versiones**. No subas el ZIP sin descomprimir ni crees otra carpeta completa duplicada.

Conviene que una sola persona suba cambios de textos a la vez. Avísense antes de trabajar en una misma sección para evitar que una versión anterior reemplace el trabajo de otro integrante.

## Revisar y publicar

**Subir a Drive no cambia la página pública.** Drive es la carpeta compartida de trabajo. Una persona designada descarga el contenido actualizado, lo importa en el editor y revisa la vista previa. Después usa **Guardar en carpeta** sobre el proyecto, o combina el ZIP de **Descargar para GitHub** con el proyecto. Finalmente sube los cambios a GitHub para que GitHub Pages genere y publique el sitio.

La conexión automática de Drive a GitHub no está configurada. La primera publicación en GitHub Pages también está pendiente de confirmación. Consulta [la guía de GitHub Pages](GITHUB_PAGES.md) para ese paso.

No guardes contraseñas ni documentos personales en esta carpeta. El correo invitado se usa como cuenta de colaboración; no se agrega como correo público de contacto sin confirmación del dueño.
