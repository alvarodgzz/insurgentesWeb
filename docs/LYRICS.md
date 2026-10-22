# Letras: edición y proveedores

La sección funciona sin JavaScript y sin consultar servicios externos al abrir la página. El archivo `content/lyrics.json` guarda los títulos, la letra proporcionada por la banda y, opcionalmente, un enlace oficial. El editor local y el generador de contenido usan `js/lyrics-render.mjs` para producir el HTML público.

## Publicar una letra

En el editor local, pega el texto autorizado por la banda en la canción correspondiente. También puedes editar `content/lyrics.json` y volver a generar el sitio con las instrucciones del README. Los saltos de línea se conservan y el texto se muestra literalmente: no se interpreta HTML. No pegues etiquetas como `<br>`.

```json
{
  "title": "Flores",
  "text": "",
  "sourceUrl": "https://www.youtube.com/watch?v=9MR5Nc9naFg",
  "provider": "youtube"
}
```

- `title`: título visible.
- `text`: letra que la banda proporciona y autoriza para su web. Vacío si todavía no se publica.
- `sourceUrl`: página verificada de la canción en Genius o Musixmatch, o un lyric video oficial en YouTube. Opcional. Se aceptan únicamente enlaces HTTPS a esos servicios; no se muestran URLs inválidas.
- `provider`: `band`, `genius`, `musixmatch` o `youtube`. Es una referencia editorial; el servicio del enlace visible se determina por la URL.

Una canción sin texto ni enlace válido permanece oculta. Un enlace sin texto aparece como acceso directo; una letra aparece en un desplegable. Antes de agregar un enlace, comprueba canción, banda y canal: coincidir en el título no basta. Los cambios de JSON requieren generar otra vez el HTML; el sitio público no depende del editor.

## Investigación realizada

Verificación: 21 de octubre de 2026. No se confirmó una ficha de Los Insurgentes en Genius ni en Musixmatch. Las búsquedas negativas no prueban que el catálogo no exista; no se inventaron identificadores ni páginas.

Sí se verificó [Flores — lyric video del canal oficial de Los Insurgentes](https://www.youtube.com/watch?v=9MR5Nc9naFg). La descripción identifica a Álvaro Rodríguez en el bajo y a los demás integrantes, lo que permite distinguir a esta banda. Ese enlace ya está cargado y ofrece una vía inmediata para leer la letra dentro de su video oficial. No se transcribió texto de terceros.

**Genius:** su API autenticada sirve para buscar metadatos, artistas y anotaciones. La documentación del propio proyecto LyricsGenius explica que el texto de las letras se obtiene mediante scraping de la página, fuera de la API, y señala las restricciones de uso de ese método. Por eso el sitio permite enlazar fichas verificadas, sin copiar letras desde Genius. [Fuente: cómo funciona LyricsGenius](https://lyricsgenius.readthedocs.io/en/latest/how_it_works.html). La documentación oficial `docs.genius.com` no fue accesible durante la verificación; no se afirma haber validado sus condiciones actuales.

**Musixmatch:** el SDK oficial documenta búsqueda y acceso a letras con licencia mediante una clave API; indica que la clave es secreta y remite a sus condiciones. Es la alternativa de proveedor para una integración contratada, una vez confirmados catálogo, cuenta y permisos de exhibición. [Fuente: SDK oficial de Musixmatch](https://github.com/musixmatch/musixmatch-sdk). No hay una clave configurada ni se verificó qué plan permite publicar el catálogo completo. Integrar esa cuenta requeriría una función de servidor o un proceso privado que respete las condiciones, atribución y restricciones que indique el proveedor; nunca una clave en `index.html`, JSON o JavaScript público.

**LRCLIB:** ofrece una API gratuita de letras sincronizadas, según [su repositorio oficial](https://github.com/tranxuanthang/lrclib). No se confirmó disponibilidad de las canciones de Los Insurgentes ni permisos de republicación para este sitio. No se conectó como fallback automático.

La opción práctica para el lanzamiento es el texto original que proporciona la banda, con enlaces a lyric videos oficiales mientras se carga. La infraestructura está lista, pero no hay letras completas descargadas de un proveedor.

## Buscar fichas de Genius sin importar letras

`scripts/lookup-lyrics.mjs` consulta solamente la búsqueda autenticada de metadatos. Usa Node.js 18 o superior, sin dependencias. Define `GENIUS_ACCESS_TOKEN` en el entorno local mediante tu gestor de secretos y ejecuta:

```sh
node scripts/lookup-lyrics.mjs > /tmp/insurgentes-lyrics-candidates.json
```

El informe contiene únicamente candidatos con título y artista exactos, ignorando acentos y puntuación. Aun así, cada candidato exige verificar que sea la banda correcta antes de copiar `sourceUrl` al editor. El comando no modifica el sitio, no descarga letras y no expone la clave en el informe. No se pudo ejecutar una consulta autenticada durante este trabajo porque no hay token proporcionado.
