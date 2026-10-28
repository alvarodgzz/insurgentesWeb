# Estadísticas del sitio

El propietario eligió **Umami Cloud, plan Hobby**, y ya vinculó su cuenta de GitHub. Ya proporcionó el **Website ID** de este sitio: la integración quedó configurada y activada localmente en `content/analytics.json`. Falta publicar la actualización y comprobar que llegan visitas a Umami. No reconstruye visitas anteriores.

El plan Hobby incluye un sitio, hasta 100 000 eventos al mes y seis meses de retención, según los [precios oficiales consultados el 26 de octubre de 2026](https://umami.is/pricing). No se contrató un plan de pago ni se requiere acceso a la API.

## Conectar el sitio

La configuración inicial ya se completó localmente; estos pasos sirven para revisarla o conectar otro sitio en el futuro. Para aplicar la configuración actual, ejecuta `bash scripts/publish-github.sh`.

1. Entra a [Umami Cloud](https://cloud.umami.is) con la cuenta del propietario. En **Websites**, crea el sitio **Los Insurgentes** con dominio `losinsurgentes.mx`. Consulta la [guía para agregar un sitio](https://docs.umami.is/docs/add-a-website).
2. En la configuración del sitio abre **Tracking code**. Copia únicamente el valor de `data-website-id`: es un UUID. No hace falta compartir la contraseña de Umami/GitHub, un token o una clave API. La [guía de instalación del tracker](https://docs.umami.is/docs/collect-data) muestra dónde encontrarlo.
3. Desde la carpeta del proyecto, sustituye `WEBSITE_ID` por ese UUID y ejecuta:

```sh
node scripts/configure-analytics.mjs WEBSITE_ID
bash scripts/publish-github.sh
```

El primer comando activa `content/analytics.json` localmente. El segundo valida y solicita la publicación. La recogida de datos empieza cuando el flujo de Pages termina correctamente y un navegador admitido visita el dominio. Cambiar el archivo local no cambia el sitio desplegado.

Para apagar las estadísticas:

```sh
node scripts/configure-analytics.mjs --disable
bash scripts/publish-github.sh
```

Esto evita nuevas mediciones desde la actualización publicada; no borra registros existentes de Umami. El archivo de configuración solo acepta `version`, `enabled` y `websiteId`. El Website ID identifica el sitio y aparece en el navegador; no es una credencial que permita consultar el panel.

## Consultar el panel

Abre `https://losinsurgentes.mx/admin/estadisticas/` después de publicar esta actualización y pulsa **Iniciar sesión en el panel**. Esa ruta contiene una página pública de acceso que enlaza a Umami; las estadísticas se consultan allí con la cuenta autorizada.

La autenticación y los permisos pertenecen a Umami. El proyecto no implementa cuentas, sesiones ni un rol de administrador propio, y no coloca datos del panel en HTML público. No se ha habilitado un **Share URL**, un informe público ni una clave API. Tener la contraseña de la vista previa de la banda no da acceso a la cuenta de estadísticas.

Como el acceso está vinculado a GitHub, protege esa cuenta con 2FA en **Settings → Password and authentication**, y conserva los códigos de recuperación fuera del repositorio. Sigue la [guía oficial de GitHub](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication). Si tu cuenta de Umami ofrece **Settings → Security**, puedes revisar también su opción de [autenticación de dos factores](https://docs.umami.is/docs/two-factor-authentication); la configuración de infraestructura de esa guía corresponde al proveedor cuando usas Cloud.

## Qué se mide

La integración registra una visita a la landing pública de Maratón en HTTPS de `losinsurgentes.mx` o `www.losinsurgentes.mx`, con ruta `/` normalizada, idioma, tamaño de pantalla y origen del sitio de referencia. Umami deriva métricas de visitas, horarios, dispositivos, navegador y ubicación aproximada. El proveedor procesa la IP para identificación y geolocalización; nuestro proyecto no guarda direcciones IP en sus archivos. Umami distingue ese procesamiento de sus registros operativos: no significa que la IP nunca llegue al proveedor. Consulta sus [definiciones de métricas](https://docs.umami.is/docs/metric-definitions).

El código del proyecto desactiva la captura automática y envía únicamente la visita preparada. No envía parámetros de consulta, fragmentos, rutas del referente, formularios, correos ni contraseñas. Tampoco registra intentos de contraseña, reproducciones, clics, envíos de formulario ni contenido escrito por el visitante. La configuración oficial del tracker permite controlar [seguimiento automático y dominios](https://docs.umami.is/docs/tracker-configuration).

Se excluyen `/banda/`, servidores locales, GitHub Pages bajo `github.io`, rutas administrativas, iframes y la vista previa descifrada. También se respetan **Do Not Track** y **Global Privacy Control** cuando están activos. Abrir el contenido protegido no añade una segunda visita a la misma carga de la portada.

Al publicarla, esta versión mide exclusivamente la landing pública de Maratón en la raíz, con fase `site`. La contraseña y el sitio completo quedan en `/banda/`, fuera de la medición. El formulario de registro ya está integrado en el diseño de la landing con el HTML suministrado por el propietario. Hace un POST directo a Brevo, sin captura de correos o envíos en Umami; la respuesta y la confirmación pertenecen al proveedor. La publicación y una inscripción real siguen sin verificar. El editor de la banda sigue fuera del paquete de Pages; `/admin/estadisticas/` solo publica el acceso al panel externo.

## Comprobar y leer los resultados

Tras una publicación correcta, visita el dominio con un navegador sin DNT/GPC y comprueba que aparece actividad en Umami. En las herramientas del navegador puedes comprobar que el script de Cloud carga y que la petición enviada lleva `/`, sin datos de formulario ni parámetros privados. Revisa también que `/banda/`, el contenido descifrado, el editor local y `/admin/estadisticas/` no envíen mediciones.

Los bloqueadores pueden impedir el tracker, y la geolocalización puede variar con VPN, redes móviles o proxies. Los visitantes únicos son estimaciones técnicas, no una lista de personas identificadas. No esperes cifras anteriores a la activación ni equivalencia con contadores de Spotify. Si el proveedor falla, la web y la entrada con contraseña siguen funcionando.
