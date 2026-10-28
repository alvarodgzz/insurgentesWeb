# Publicar Maratón y la vista previa de la banda

El repositorio existente es [alvarodgzz/insurgentesWeb](https://github.com/alvarodgzz/insurgentesWeb), rama `main`. GitHub Pages usa GitHub Actions y `losinsurgentes.mx`. El propietario pidió volver a proteger también la landing y el formulario de Maratón mientras resolvemos los correos en spam. Esta actualización local usa la contraseña existente para `/` y `/banda/`; su despliegue aún no se ha verificado.

## Publicar con contraseña

La contraseña de compilación se guarda localmente en `.env.preview-password`, excluido por `.gitignore`. Su contenido es únicamente la contraseña, nunca código ni una asignación de variable. No la pegues en un commit, documentación o comando que quede en el historial de la terminal.

Desde la carpeta del proyecto, con GitHub CLI autenticado como `alvarodgzz`, ejecuta:

```sh
bash scripts/publish-github.sh
```

El script valida el proyecto. Si existe el archivo local, envía su contenido al secreto de Actions **PREVIEW_PASSWORD**, sin incluirlo en el commit, y después sube `main` e inicia la publicación. Conserva el remoto, la visibilidad del repositorio, el dominio y la configuración HTTPS existentes. Si el archivo no existe, se puede configurar el mismo secreto desde **Settings → Secrets and variables → Actions → New repository secret**.

Revisa [Actions](https://github.com/alvarodgzz/insurgentesWeb/actions) y espera a que los trabajos `build` y `deploy` terminen correctamente. Los cambios posteriores en `main` vuelven a publicar. Un cambio del secreto por sí solo requiere ejecutar de nuevo **Actions → Validate and publish GitHub Pages → Run workflow**.

**Sin contraseña de compilación se publican solo las portadas, sin ninguno de los dos contenidos cifrados:** no se publica el formulario ni un acceso alterno al sitio completo. El cambio no reemplaza la página desplegada hasta que Pages termine correctamente.

Si un envío falla con `RPC failed; HTTP 400`, el script reintenta una vez con HTTP/1.1 y un búfer de 64 MiB, solo para ese comando. No modifica la configuración global ni fuerza el historial. Comprueba que `main` local coincida con el remoto antes de pedir la publicación. Conserva el trabajo y se detiene si el envío o su verificación fallan.

## Qué protege la portada

`scripts/prepare-pages.mjs` prepara portadas con contraseña en `/` y `/banda/`; `404.html` usa la portada de Maratón. La primera abre `maraton-preview.json`, con landing y formulario; la segunda abre `preview.json`, con el sitio completo. `scripts/private-preview.mjs` reúne cada HTML con sus recursos, deriva claves con PBKDF2-SHA-256 y 600 000 iteraciones y cifra cada documento con AES-GCM de 256 bits. Ambos usan la contraseña existente; cada paquete tiene salt e IV propios. `access.js` acepta solo esos dos nombres de paquete. La contraseña no se incluye en los archivos publicados.

`_site/` contiene las portadas, sus recursos de marca y acceso, la entrada a estadísticas y los dos paquetes cifrados cuando existe contraseña. No publica el formulario/Brevo URL, `css/maraton.css`, `js/maraton.js`, editor, JSON de contenido, plantillas ni fotos del sitio completo como rutas separadas. El `index.html` del proyecto sigue siendo la página completa para edición local. La lista se configura en `content/newsletter.json` y vive dentro de Maratón cifrado. La dirección independiente del formulario en Brevo sigue existiendo fuera de esta portada; no se desactiva ni se protege en el proveedor. Consulta [la guía de la lista](MAILING_LIST.md).

No se inyectan estadísticas en las portadas ni en Maratón cifrado. `/admin/estadisticas/` conserva únicamente la entrada al panel externo, que requiere la cuenta de Umami.

Se necesita JavaScript y un contexto seguro para descifrar: HTTPS en el dominio o `localhost` al revisar. La portada explica este requisito cuando no está disponible. Los reproductores de Spotify siguen dependiendo de sus servicios externos.

**Límite esencial:** GitHub Pages sirve archivos estáticos y esta solución no crea una sesión de autenticación en un servidor. El repositorio actual es público y ya expuso código, fotos y contenido en su historial; el nuevo cifrado no retira esas copias ni hace privado GitHub. La [publicación privada nativa de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site) exige una organización con GitHub Enterprise Cloud. No cambies de proveedor ni de plan sin decisión del propietario.

## Revisar localmente

El sitio completo y el editor siguen disponibles con:

```sh
node scripts/preview.mjs --open
```

Para revisar exactamente el paquete protegido, ejecuta:

```sh
node scripts/preview.mjs --protected --open
```

Abre `http://127.0.0.1:8000/` para la contraseña de Maratón y `http://127.0.0.1:8000/banda/` para la del sitio completo. El editor no está incluido en `_site/`; `/admin/estadisticas/` es solo el acceso al panel externo. Detén el servidor con `Ctrl+C` antes de abrir otro en el mismo puerto. Si el entorno bloquea servidores locales, realiza la revisión en tu terminal habitual.

## Dominio y HTTPS

El propietario configuró `losinsurgentes.mx` en **Settings → Pages** y confirmó estos registros de Squarespace:

| Tipo | Nombre | Destino |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `alvarodgzz.github.io` |

La captura más reciente de GitHub muestra **DNS check successful** y el certificado TLS todavía en emisión. Cuando esté disponible, activa **Enforce HTTPS** y comprueba tanto `https://losinsurgentes.mx` como `https://www.losinsurgentes.mx`. No omitas una advertencia de certificado del navegador. El aviso de Squarespace que pide restaurar **Squarespace Defaults** corresponde a su alojamiento anterior; restaurarlo cambiaría estos destinos.

## Lanzamiento futuro del sitio completo

El empaquetador admite `node scripts/prepare-pages.mjs --public` para el lanzamiento deliberado, pero Actions no lo utiliza. Esa opción copia el sitio completo y sus recursos, incluido editor y contenido, como archivos públicos. No usarla hasta autorización explícita del propietario. Volver a publicar solo Maratón será otra decisión explícita: el modo actual lo mantiene cifrado.

Antes de anunciarlo, revisa navegación móvil, galería, teclado, enlaces y reproducción de Spotify en el dominio real. Confirma que Maratón y el próximo sencillo mantienen su estado correcto. Las comprobaciones locales no sustituyen esa revisión.
