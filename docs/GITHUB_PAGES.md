# Publicar el sitio de Los Insurgentes

El repositorio es [alvarodgzz/insurgentesWeb](https://github.com/alvarodgzz/insurgentesWeb), rama `main`. GitHub Pages usa GitHub Actions y `losinsurgentes.mx`. El 23 de noviembre de 2026 el propietario autorizó abrir el sitio completo y eligió **banner → sitio, con registro opcional desde ambos**. El lanzamiento nuevo está pendiente de confirmar con su Actions run y las rutas del dominio; guardar archivos localmente no lo publica.

## Recorrido público autorizado

| Ruta | Contenido |
| --- | --- |
| `/` | Banner de Maratón: una calavera para **Entrar al sitio** y enlace **Recibir comunicados** |
| `/sitio/` | Sitio completo público, sin contraseña ni registro obligatorio |
| `/registro/` | Registro opcional de Maratón, con su diseño y formulario nativo existentes |
| `/banda/` | Redirect compatible hacia `/sitio/` |
| `404.html` | Página de marca sin formulario ni estadísticas |
| `/admin/estadisticas/` | Entrada al panel externo de Umami; no publica reportes ni credenciales |

`node scripts/prepare-pages.mjs` genera este paquete en `_site/`. `--public` es un alias explícito del mismo modo. Se publican las páginas, fotos y recursos usados, no el editor, plantillas, JSON de contenido/configuración, `.env`, originales de branding o paquetes cifrados. El `index.html` del checkout sigue siendo el sitio completo generado para edición local.

La navegación pública conserva enlaces y contenido utilizables sin JavaScript. El registro no bloquea la entrada ni exige enviar un correo para volver al sitio. Los reproductores de Spotify dependen de su servicio externo. El slogan correcto es **Esa calavera que ya viene por ti...**.

## Publicar cambios revisados

Desde el proyecto, con GitHub CLI autenticado como `alvarodgzz`:

```sh
bash scripts/publish-github.sh
```

El script valida el proyecto, conserva el remoto, la visibilidad del repositorio, el dominio y los ajustes HTTPS existentes, y sube los cambios. Cada push correcto a `main` inicia automáticamente las pruebas y el deploy; no hace falta un comando adicional después de un push. Revisa [Actions](https://github.com/alvarodgzz/insurgentesWeb/actions), espera a que `build` y `deploy` terminen correctamente y verifica `/`, `/sitio/`, `/registro/` y el redirect `/banda/` en el dominio. No describas un commit local como publicado.

Si un envío falla con `RPC failed; HTTP 400`, el script reintenta una vez con HTTP/1.1 y un búfer de 64 MiB, solo para ese comando. No modifica la configuración global ni fuerza el historial. Comprueba que `main` local coincida con el remoto antes de pedir la publicación. Conserva el trabajo y se detiene si el envío o su verificación fallan.

La publicación pública no requiere contraseña. El archivo ignorado `.env.preview-password` y el secreto existente `PREVIEW_PASSWORD` se conservan para los modos de reversión; nunca pegues la contraseña en commits, documentación, logs o argumentos de comandos.

## Formulario y estadísticas

El formulario se configura en `content/newsletter.json`, que no se copia al artifact. Su destino de envío sí es público dentro del HTML, como exige el formulario nativo. Conserva campos, validación y envío progresivo; no añadas enlaces alternativos ni envíes registros reales para las pruebas automáticas. Consulta [la guía de la lista](MAILING_LIST.md).

La configuración optativa existente de Umami se incorpora solo al banner de la raíz HTTPS de `losinsurgentes.mx`/`www.losinsurgentes.mx`. No se añade medición a `/sitio/`, `/registro/`, el redirect, `404.html` ni los documentos protegidos de reversión. Se conservan normalización de URL/referrer y exclusiones de consultas, fragmentos, formularios, correo, contraseña y DNT/GPC. No hay nueva autorización para medir más páginas. `/admin/estadisticas/` conserva únicamente la entrada al panel externo autenticado.

## Revisar localmente

Sitio completo para editar y editor local:

```sh
node scripts/preview.mjs --open
```

Recorrido público de publicación:

```sh
node scripts/preview.mjs --public --open
```

Abre <http://127.0.0.1:8000/> y comprueba banner, entrada al sitio, registro opcional, menú móvil y galería. Ejecuta `node scripts/qa-browser.mjs` y revisa el storyboard de `_qa/index.html` antes del push; [la guía de navegador](BROWSER_QA.md) explica el alcance y los límites. Las capturas y reportes no se publican. Detén el servidor con `Ctrl+C` antes de abrir otro en el mismo puerto.

## Modos protegidos de reversión

Estos modos conservan el comportamiento histórico para una reversión deliberada; Actions no los usa en el lanzamiento público:

- `node scripts/prepare-pages.mjs --signup-only`: registro público en raíz y sitio de la banda protegido en `/banda/`. Con contraseña se genera `preview.json`; sin ella el registro sigue público y el paquete cifrado se omite.
- `node scripts/prepare-pages.mjs --gated`: modo histórico de dos gates. La raíz abre `maraton-preview.json` y `/banda/` abre `preview.json`. Sin contraseña solo se publican las portadas; no hay formulario ni analytics.

Para revisar los modos anteriores: `node scripts/preview.mjs --protected --open` o `node scripts/preview.mjs --gated --open`. Prepararlos localmente no cambia lo que publica el workflow.

`scripts/private-preview.mjs` conserva PBKDF2-SHA-256 (600 000 iteraciones), AES-GCM-256, salt e IV propios, recursos embebidos y orden de scripts diferidos. Las vistas cifradas requieren JavaScript y HTTPS o `localhost`. Ese cifrado no crea autenticación de servidor ni vuelve privado el repositorio público o sus copias históricas. No migres de proveedor ni de plan sin decisión del propietario.

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

## Verificación pendiente del lanzamiento

El último deploy confirmado antes de esta apertura completa es `fe2a446`, Actions `45317446487`: incorporó las cuatro fotos de Drive y mantuvo el modo protegido anterior. El lanzamiento nuevo debe registrar su propio SHA/run y comprobar el recorrido público, los recursos necesarios y las exclusiones del artifact.

Confirma navegación móvil, galería (X, fondo, Escape y foco de teclado), entrada sin registrarse y navegación sin JavaScript. Las pruebas del formulario usan respuestas simuladas; no establecen CORS real de Brevo, inclusión en la lista ni entrega de la bienvenida. Confirma con el propietario cualquier cambio del estado de Maratón o del próximo sencillo; no inventes una fecha o título.
