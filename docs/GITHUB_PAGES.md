# Publicar Maratón y la vista previa de la banda

El repositorio existente es [alvarodgzz/insurgentesWeb](https://github.com/alvarodgzz/insurgentesWeb), rama `main`. GitHub Pages usa GitHub Actions y `losinsurgentes.mx`. El 7 de noviembre de 2026 el propietario autorizó publicar la landing y el formulario de Maratón en `/`, con **Acceso de la banda** hacia el sitio completo protegido en `/banda/`. Consulta el resultado de cada publicación en Actions y verifica las rutas en el dominio; guardar archivos localmente no publica el cambio.

## Publicar la landing y conservar la contraseña de la banda

La contraseña de compilación se guarda localmente en `.env.preview-password`, excluido por `.gitignore`. Su contenido es únicamente la contraseña, nunca código ni una asignación de variable. No la pegues en un commit, documentación o comando que quede en el historial de la terminal.

Desde la carpeta del proyecto, con GitHub CLI autenticado como `alvarodgzz`, ejecuta:

```sh
bash scripts/publish-github.sh
```

El script valida el proyecto. Si existe el archivo local, envía su contenido al secreto de Actions **PREVIEW_PASSWORD**, sin incluirlo en el commit, y después sube `main`. El push activa automáticamente el flujo de publicación de Pages. Conserva el remoto, la visibilidad del repositorio, el dominio y la configuración HTTPS existentes. Si el archivo no existe, se puede configurar el mismo secreto desde **Settings → Secrets and variables → Actions → New repository secret**.

Revisa [Actions](https://github.com/alvarodgzz/insurgentesWeb/actions) y espera a que los trabajos `build` y `deploy` terminen correctamente. Los cambios posteriores en `main` vuelven a publicar. Un cambio del secreto por sí solo requiere ejecutar de nuevo **Actions → Validate and publish GitHub Pages → Run workflow**.

**Sin contraseña de compilación, la landing y el formulario siguen públicos; `/banda/` publica solo su portada, sin `preview.json`.** No existe un acceso alterno al sitio completo. El cambio no reemplaza la página desplegada hasta que Pages termine correctamente.

Si un envío falla con `RPC failed; HTTP 400`, el script reintenta una vez con HTTP/1.1 y un búfer de 64 MiB, solo para ese comando. No modifica la configuración global ni fuerza el historial. Comprueba que `main` local coincida con el remoto antes de pedir la publicación. Conserva el trabajo y se detiene si el envío o su verificación fallan.

## Qué protege la portada

El modo predeterminado de `scripts/prepare-pages.mjs` usa `prepareLandingPages`: publica Maratón en `/` y una portada con contraseña en `/banda/`, que abre `preview.json` con el sitio completo. `404.html` es una página de marca con enlace de regreso a `/`, sin formulario ni medición. El paquete predeterminado no genera `maraton-preview.json`.

`scripts/private-preview.mjs` reúne el sitio completo con sus recursos, deriva claves con PBKDF2-SHA-256 y 600 000 iteraciones y lo cifra con AES-GCM de 256 bits, salt e IV propios. Usa la contraseña existente, que no se incluye en los archivos publicados. `access.js` continúa aceptando solo `preview.json` y `maraton-preview.json` para mantener el modo de reversión.

`_site/` publica la landing y su formulario, `css/maraton.css`, `js/maraton.js`, la selección permitida de logotipos y fuentes, la portada de la banda, `404.html`, la entrada a estadísticas y `preview.json` cuando existe contraseña. No publica el editor, JSON de contenido, plantillas ni fotos del sitio completo como rutas separadas. El `index.html` del proyecto sigue siendo la página completa para edición local. El formulario se configura en `content/newsletter.json`; su destino de envío es público como parte del formulario. La dirección independiente alojada por Brevo sigue existiendo. Consulta [la guía de la lista](MAILING_LIST.md).

La configuración optativa de Umami solo se incorpora a la landing pública, con medición restringida a la raíz HTTPS del dominio y exclusiones de datos privados y DNT/GPC. No se inyectan estadísticas en la portada de la banda, `404.html` ni el sitio descifrado. `/admin/estadisticas/` conserva únicamente la entrada al panel externo, que requiere la cuenta de Umami.

Se necesita JavaScript y un contexto seguro para descifrar el sitio completo: HTTPS en el dominio o `localhost` al revisar. La portada explica este requisito cuando no está disponible. La landing y su formulario conservan el envío nativo sin JavaScript. Los reproductores de Spotify siguen dependiendo de sus servicios externos.

**Límite esencial:** GitHub Pages sirve archivos estáticos y esta solución no crea una sesión de autenticación en un servidor. El repositorio actual es público y ya expuso código, fotos y contenido en su historial; el nuevo cifrado no retira esas copias ni hace privado GitHub. La [publicación privada nativa de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site) exige una organización con GitHub Enterprise Cloud. No cambies de proveedor ni de plan sin decisión del propietario.

## Revisar localmente

El sitio completo y el editor siguen disponibles con:

```sh
node scripts/preview.mjs --open
```

Para revisar el paquete de publicación, con landing pública y sitio completo protegido, ejecuta:

```sh
node scripts/preview.mjs --protected --open
```

Abre `http://127.0.0.1:8000/` para Maratón y `http://127.0.0.1:8000/banda/` para la contraseña del sitio completo. El editor no está incluido en `_site/`; `/admin/estadisticas/` es solo el acceso al panel externo. Detén el servidor con `Ctrl+C` antes de abrir otro en el mismo puerto. Si el entorno bloquea servidores locales, realiza la revisión en tu terminal habitual.

## Reversión a ambas vistas protegidas

El 28 de octubre se protegieron temporalmente la landing y el sitio completo mientras se revisaba la bienvenida en spam. Esa configuración se conserva mediante `node scripts/prepare-pages.mjs --gated`: `/` y `404.html` muestran la portada de Maratón y abren `maraton-preview.json`; `/banda/` abre `preview.json`. Sin contraseña, ese modo publica solo portadas y omite ambos paquetes. No publica el formulario ni sus estilos/scripts por separado y no incorpora estadísticas. No es el modo predeterminado autorizado el 7 de noviembre.

Para revisar esa reversión localmente: `node scripts/preview.mjs --protected --gated --open`. Actions utiliza el modo predeterminado; preparar `--gated` solo en local no cambia lo que publica el flujo de GitHub.

## Dominio y HTTPS

El propietario configuró `losinsurgentes.mx` en **Settings → Pages** y confirmó estos registros de Squarespace:

| Tipo | Nombre | Destino |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `alvarodgzz.github.io` |

La captura de octubre mostraba **DNS check successful** y el certificado TLS en emisión. El 7 de noviembre se verificó HTTPS correcto en `https://losinsurgentes.mx` y `https://www.losinsurgentes.mx`, con el registro público desplegado por el commit `456f7b2` (Actions `42446937743`, terminado correctamente). Se comprobó también el gate de `/banda/`, el descifrado local del paquete publicado con la contraseña existente y el rechazo de una contraseña incorrecta. No se envió ningún registro. El ajuste **Enforce HTTPS** de la interfaz de GitHub no se modificó ni comprobó; no omitas una advertencia de certificado del navegador. El aviso de Squarespace que pide restaurar **Squarespace Defaults** corresponde a su alojamiento anterior; restaurarlo cambiaría estos destinos.

## Lanzamiento futuro del sitio completo

El empaquetador admite `node scripts/prepare-pages.mjs --public` para el lanzamiento deliberado, pero Actions no lo utiliza. Esa opción copia el sitio completo y sus recursos, incluido editor y contenido, como archivos públicos. No usarla hasta autorización explícita del propietario para ese lanzamiento. La autorización del 7 de noviembre se limita a Maratón y conserva el sitio completo protegido y el editor fuera de Pages.

Antes de anunciarlo, revisa navegación móvil, galería, teclado, enlaces y reproducción de Spotify en el dominio real. Confirma que Maratón y el próximo sencillo mantienen su estado correcto. Las comprobaciones locales no sustituyen esa revisión.
