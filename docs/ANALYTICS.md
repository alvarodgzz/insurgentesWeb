# Estadísticas del sitio

El propietario eligió **Umami Cloud, plan Hobby**, vinculó GitHub y proporcionó el **Website ID**. El 7 de noviembre de 2026 autorizó publicar la landing y el registro de Maratón en `/`, conservando el sitio completo con contraseña en `/banda/`. El paquete predeterminado incorpora la configuración optativa existente de Umami únicamente en la landing pública. **Las portadas de acceso, `404.html` y las vistas descifradas no incorporan medición.** La publicación y la llegada de datos aún necesitan verificarse.

El plan Hobby incluye un sitio, hasta 100 000 eventos al mes y seis meses de retención, según los [precios oficiales consultados el 26 de octubre de 2026](https://umami.is/pricing). No se contrató un plan de pago ni se requiere acceso a la API.

## Conectar el sitio

La configuración inicial está guardada; no hace falta crear otro sitio ni inventar un ID. Los pasos siguientes son referencia para cambiar esa configuración cuando sea necesario. El empaquetado predeterminado aplica `analytics.json` a la landing pública autorizada el 7 de noviembre; la configuración deshabilitada, ausente o inválida continúa sin activar medición.

1. Entra a [Umami Cloud](https://cloud.umami.is) con la cuenta del propietario. En **Websites**, crea el sitio **Los Insurgentes** con dominio `losinsurgentes.mx`. Consulta la [guía para agregar un sitio](https://docs.umami.is/docs/add-a-website).
2. En la configuración del sitio abre **Tracking code**. Copia únicamente el valor de `data-website-id`: es un UUID. No hace falta compartir la contraseña de Umami/GitHub, un token o una clave API. La [guía de instalación del tracker](https://docs.umami.is/docs/collect-data) muestra dónde encontrarlo.
3. Desde la carpeta del proyecto, sustituye `WEBSITE_ID` por ese UUID y ejecuta:

```sh
node scripts/configure-analytics.mjs WEBSITE_ID
bash scripts/publish-github.sh
```

El primer comando activa `content/analytics.json` localmente y el segundo valida y sube los cambios. Cada push a `main` activa automáticamente el flujo de GitHub Pages. La recogida solo puede empezar después de publicar y comprobar la landing en el dominio admitido. Cambiar el archivo local no cambia el sitio desplegado.

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

## Alcance de la landing pública

El alcance de medición es HTTPS en `losinsurgentes.mx` o `www.losinsurgentes.mx`, ruta `/` normalizada, idioma, tamaño de pantalla y origen del referente. Umami deriva métricas de visitas, horarios, dispositivos, navegador y ubicación aproximada. El proveedor procesa la IP para identificación y geolocalización; el proyecto no guarda IP en sus archivos. Eso no significa que la IP nunca llegue al proveedor. Consulta sus [definiciones de métricas](https://docs.umami.is/docs/metric-definitions).

El código del proyecto desactiva la captura automática y envía únicamente la visita preparada. No envía parámetros de consulta, fragmentos, rutas del referente, formularios, correos ni contraseñas. Tampoco registra intentos de contraseña, reproducciones, clics, envíos de formulario ni contenido escrito por el visitante. La configuración oficial del tracker permite controlar [seguimiento automático y dominios](https://docs.umami.is/docs/tracker-configuration).

Se excluyen `/banda/`, `404.html`, servidores locales, GitHub Pages bajo `github.io`, rutas administrativas, iframes y la vista previa descifrada. También se respetan **Do Not Track** y **Global Privacy Control** cuando están activos. Abrir la portada de la banda o su contenido protegido no añade visitas.

El paquete predeterminado publica Maratón y su formulario en `/`, con los recursos permitidos y la medición optativa restringida. El sitio completo permanece en `preview.json` detrás de `/banda/`; no se genera `maraton-preview.json`. `404.html` muestra la marca y enlaza a la landing, sin formulario ni tracker. El formulario envía solo a Brevo y no genera eventos de Umami. El propietario reportó actualizar la bienvenida el 7 de noviembre; la entrega de esa versión, la lista y el flujo real en navegador siguen pendientes. El editor sigue fuera de Pages y `/admin/estadisticas/` publica solo el enlace al panel externo.

La configuración del 28 de octubre, con Maratón también cifrado para revisar la bienvenida en spam, se conserva mediante `--gated` para una reversión deliberada. Ese modo omite por completo la medición de ambas portadas y documentos cifrados, aunque `analytics.json` esté activado. No es el modo predeterminado autorizado el 7 de noviembre.

## Comprobar y leer los resultados

Después de publicar el paquete autorizado, comprueba la actividad de la raíz pública en Umami con un navegador admitido y la configuración activada. En las peticiones, la URL debe estar normalizada y el referente debe limitarse a su origen, sin datos de formulario, consultas ni fragmentos. Repite la revisión con DNT/GPC para comprobar que no se registra la visita.

Comprueba también que `/banda/`, `404.html`, el sitio descifrado y `/admin/estadisticas/` no envían mediciones. En `--gated` tampoco debe medirse la raíz ni Maratón descifrado. Los cambios web del 7 de noviembre todavía son locales; no se ha verificado su despliegue ni la recepción de tráfico.

Los bloqueadores pueden impedir el tracker, y la geolocalización puede variar con VPN, redes móviles o proxies. Los visitantes únicos son estimaciones técnicas, no una lista de personas identificadas. No esperes cifras anteriores a la activación ni equivalencia con contadores de Spotify. Si el proveedor falla, la web y la entrada con contraseña siguen funcionando.
