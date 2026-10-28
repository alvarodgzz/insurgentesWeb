# Estadísticas del sitio

El propietario eligió **Umami Cloud, plan Hobby**, vinculó GitHub y proporcionó el **Website ID**. Se conserva la configuración local, pero el propietario pidió volver a proteger Maratón mientras resolvemos los correos en spam: **el paquete actual no inyecta ni mide visitas en las portadas o las vistas descifradas**. Publicar esta versión no activa medición de esos accesos.

El plan Hobby incluye un sitio, hasta 100 000 eventos al mes y seis meses de retención, según los [precios oficiales consultados el 26 de octubre de 2026](https://umami.is/pricing). No se contrató un plan de pago ni se requiere acceso a la API.

## Conectar el sitio

La configuración inicial está guardada. Los pasos siguientes son referencia para una futura landing pública autorizada; cambiar `analytics.json` no incorpora el tracker al empaquetado protegido actual.

1. Entra a [Umami Cloud](https://cloud.umami.is) con la cuenta del propietario. En **Websites**, crea el sitio **Los Insurgentes** con dominio `losinsurgentes.mx`. Consulta la [guía para agregar un sitio](https://docs.umami.is/docs/add-a-website).
2. En la configuración del sitio abre **Tracking code**. Copia únicamente el valor de `data-website-id`: es un UUID. No hace falta compartir la contraseña de Umami/GitHub, un token o una clave API. La [guía de instalación del tracker](https://docs.umami.is/docs/collect-data) muestra dónde encontrarlo.
3. Desde la carpeta del proyecto, sustituye `WEBSITE_ID` por ese UUID y ejecuta:

```sh
node scripts/configure-analytics.mjs WEBSITE_ID
bash scripts/publish-github.sh
```

El primer comando activa `content/analytics.json` localmente y el segundo valida y solicita publicación. La recogida solo puede empezar después de autorizar/restaurar una landing pública, incorporar de nuevo la medición y comprobarla en el dominio. Cambiar el archivo local no cambia el sitio desplegado.

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

## Alcance de una futura landing pública

El alcance preparado para una futura landing pública es HTTPS en `losinsurgentes.mx` o `www.losinsurgentes.mx`, ruta `/` normalizada, idioma, tamaño de pantalla y origen del referente. Umami deriva métricas de visitas, horarios, dispositivos, navegador y ubicación aproximada. El proveedor procesa la IP para identificación y geolocalización; el proyecto no guarda IP en sus archivos. Eso no significa que la IP nunca llegue al proveedor. Consulta sus [definiciones de métricas](https://docs.umami.is/docs/metric-definitions).

El código del proyecto desactiva la captura automática y envía únicamente la visita preparada. No envía parámetros de consulta, fragmentos, rutas del referente, formularios, correos ni contraseñas. Tampoco registra intentos de contraseña, reproducciones, clics, envíos de formulario ni contenido escrito por el visitante. La configuración oficial del tracker permite controlar [seguimiento automático y dominios](https://docs.umami.is/docs/tracker-configuration).

Se excluyen `/banda/`, servidores locales, GitHub Pages bajo `github.io`, rutas administrativas, iframes y la vista previa descifrada. También se respetan **Do Not Track** y **Global Privacy Control** cuando están activos. Abrir el contenido protegido no añade una segunda visita a la misma carga de la portada.

La versión actual publica gates en `/`, `404.html` y `/banda/`, sin configuración ni carga del tracker. Maratón y su formulario quedan dentro de `maraton-preview.json`, también sin medición; el sitio completo permanece en `preview.json`. El formulario envía solo a Brevo y no genera eventos de Umami. El propietario reportó que la bienvenida llegó a spam; autenticación del remitente y nuevo flujo en navegador siguen pendientes. El editor sigue fuera de Pages y `/admin/estadisticas/` publica solo el enlace al panel externo.

## Comprobar y leer los resultados

Para el paquete protegido actual, comprueba que las portadas, ambas vistas descifradas y `/admin/estadisticas/` no envían mediciones. Solo después de autorizar una landing pública, restaurar su integración y publicar, se debe comprobar actividad en Umami con un navegador admitido, sin datos de formulario ni parámetros privados en las peticiones.

Los bloqueadores pueden impedir el tracker, y la geolocalización puede variar con VPN, redes móviles o proxies. Los visitantes únicos son estimaciones técnicas, no una lista de personas identificadas. No esperes cifras anteriores a la activación ni equivalencia con contadores de Spotify. Si el proveedor falla, la web y la entrada con contraseña siguen funcionando.
