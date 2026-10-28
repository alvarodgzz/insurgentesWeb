# Publicar Maratón y la vista previa de la banda

El repositorio existente es [alvarodgzz/insurgentesWeb](https://github.com/alvarodgzz/insurgentesWeb), rama `main`. GitHub Pages usa GitHub Actions y el dominio `losinsurgentes.mx`. El propietario mostró una publicación correcta del sitio anterior; esta actualización integra localmente la landing de Maratón y mueve el acceso con contraseña a `/banda/`; su despliegue aún no se ha verificado.

## Publicar con contraseña

La contraseña de compilación se guarda localmente en `.env.preview-password`, excluido por `.gitignore`. Su contenido es únicamente la contraseña, nunca código ni una asignación de variable. No la pegues en un commit, documentación o comando que quede en el historial de la terminal.

Desde la carpeta del proyecto, con GitHub CLI autenticado como `alvarodgzz`, ejecuta:

```sh
bash scripts/publish-github.sh
```

El script valida el proyecto. Si existe el archivo local, envía su contenido al secreto de Actions **PREVIEW_PASSWORD**, sin incluirlo en el commit, y después sube `main` e inicia la publicación. Conserva el remoto, la visibilidad del repositorio, el dominio y la configuración HTTPS existentes. Si el archivo no existe, se puede configurar el mismo secreto desde **Settings → Secrets and variables → Actions → New repository secret**.

Revisa [Actions](https://github.com/alvarodgzz/insurgentesWeb/actions) y espera a que los trabajos `build` y `deploy` terminen correctamente. Los cambios posteriores en `main` vuelven a publicar. Un cambio del secreto por sí solo requiere ejecutar de nuevo **Actions → Validate and publish GitHub Pages → Run workflow**.

**Sin contraseña de compilación, el paquete mantiene la landing pública y el acceso de `/banda/`, pero omite el contenido cifrado:** no existe un acceso alterno al sitio completo. El cambio no reemplaza la página desplegada hasta que el flujo de Pages termine correctamente.

Si un envío falla con `RPC failed; HTTP 400`, el script reintenta una vez con HTTP/1.1 y un búfer de 64 MiB, solo para ese comando. No modifica la configuración global ni fuerza el historial. Comprueba que `main` local coincida con el remoto antes de pedir la publicación. Conserva el trabajo y se detiene si el envío o su verificación fallan.

## Qué protege la portada

`scripts/prepare-pages.mjs` prepara por defecto la landing pública de Maratón en `/` y la portada con contraseña en `/banda/`. El acceso **Admin / Banda** de la landing lleva a esa portada. Esto no autoriza publicar el sitio completo. `scripts/private-preview.mjs` reúne el HTML, fotos, estilos, fuentes y scripts necesarios en un documento, deriva una clave con PBKDF2-SHA-256 y 600 000 iteraciones y lo cifra con AES-GCM de 256 bits. El navegador descarga el paquete cifrado y lo abre con la contraseña introducida. La contraseña no se incluye en los archivos publicados.

`_site/` contiene la landing, la portada de `/banda/`, sus recursos de marca y acceso, el acceso a estadísticas y `preview.json` en la raíz cuando existe contraseña. `404.html` muestra la landing pública. El editor, los JSON de contenido, las plantillas y las fotos del sitio completo no tienen rutas públicas separadas en este paquete. El `index.html` de la raíz del proyecto sigue siendo la página completa para el editor y la revisión local; el `index.html` publicado se genera desde `templates/maraton.html`. La lista se configura por separado en `content/newsletter.json`; sin una URL real de Brevo permanece desactivada y no guarda correos. Consulta [la guía de la lista](MAILING_LIST.md).

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

Abre `http://127.0.0.1:8000/` para Maratón y `http://127.0.0.1:8000/banda/` para la contraseña. El editor no está incluido en `_site/`; `/admin/estadisticas/` es solo el acceso al panel externo. Detén el servidor con `Ctrl+C` antes de abrir otro en el mismo puerto. Si el entorno bloquea servidores locales, realiza la revisión en tu terminal habitual.

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

El empaquetador admite `node scripts/prepare-pages.mjs --public` para el lanzamiento deliberado, pero la configuración actual de Actions no lo utiliza. Esa opción copia el sitio completo y sus recursos, incluido el editor y el contenido, como archivos públicos. No cambies el flujo a `--public` hasta que el propietario autorice el lanzamiento del sitio completo. La landing pública de Maratón ya forma parte del modo protegido y no necesita esa opción.

Antes de anunciarlo, revisa navegación móvil, galería, teclado, enlaces y reproducción de Spotify en el dominio real. Confirma que Maratón y el próximo sencillo mantienen su estado correcto. Las comprobaciones locales no sustituyen esa revisión.
