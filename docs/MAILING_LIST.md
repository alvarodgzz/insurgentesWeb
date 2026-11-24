# Lista de correo de Maratón

El 23 de noviembre de 2026 el propietario autorizó abrir el sitio completo y eligió **banner → sitio, con registro opcional desde ambos**. El banner está en `/`, el sitio público en `/sitio/` y este formulario en `/registro/`; entrar al sitio no requiere contraseña ni registro. `/banda/` redirige a `/sitio/` por compatibilidad. El editor continúa solo en local y `404.html` no incluye formulario ni estadísticas. El lanzamiento de este nuevo recorrido aún necesita confirmarse con su Actions run y el dominio.

El formulario está activado en `content/newsletter.json` y cotejado con Simple HTML. El propietario mostró JSON `success: true` y reportó inicialmente una bienvenida en spam. El 28 de octubre mostró dominio y remitente autenticados, confirmó el cambio de sender en Brevo y reportó una bienvenida posterior en Actualizaciones de Gmail. El 7 de noviembre reportó actualizar la plantilla de bienvenida. Falta verificar la entrega de esta nueva versión, la lista de destino y el flujo real en navegador. El formulario alojado por Brevo sigue existiendo de forma independiente.

## Cómo funciona

La página opcional `/registro/` conserva el diseño original y carga `css/maraton.css` y `js/maraton.js` como recursos públicos; el script conserva `defer` para inicializarse después del HTML del formulario. El sitio completo y sus fotos usadas se publican en el recorrido de `/sitio/`, sin publicar editor, plantillas ni JSON de contenido/configuración. El paquete público predeterminado no incluye documentos de vista previa cifrada.

Como antecedente, la corrección del 28 de octubre hizo que el empaquetado cifrado conservara la ejecución diferida y el orden de los scripts. Evitó inicializar el formulario antes de que existiera y dejar activo únicamente el POST nativo que abre JSON. Esa regresión está cubierta por una simulación de lectura progresiva y sigue siendo relevante para `--gated`, el modo de reversión con ambas vistas protegidas.

El formulario hace un POST directo al destino `/serve/` de Simple HTML. Su token es distinto al enlace alojado anterior: `submitUrl` guarda el destino exacto y `formUrl` se conserva solo para mantenimiento y compatibilidad. Ambos se validan por separado. Envía exactamente `EMAIL`, antispam vacío `email_address_check`, `locale=es` y `html_type=simple`. A petición del propietario no se muestra enlace de proveedor ni botón de formulario alternativo.

Sin iframe ni SDK remoto, `js/maraton.js` mejora el envío con `URLSearchParams(FormData)`: muestra progreso y resultado dentro de la página de registro, impide envíos repetidos mientras espera y tras completar, y solo muestra éxito tras HTTP correcto y JSON `success === true`. No interpreta HTML ni muestra mensajes remotos sin controlar. Los errores explícitos conservan el correo; fallos de red, CORS, timeout o respuesta ilegible se muestran como resultado incierto, porque Brevo podría haber recibido el registro. No hay reintento ni segundo POST automático.

El recorrido público y el formulario son utilizables sin JavaScript; el envío nativo puede abrir JSON del proveedor. Solo los modos protegidos de reversión requieren JavaScript y HTTPS o localhost para descifrar el sitio. Las páginas alojadas y mensajes del paso 5 que requieren JavaScript no forman parte de Simple HTML. Nuestros estados no simulan éxito: dependen de la respuesta real. La petición de la mejora en JavaScript no lleva cookies ni referente; se conserva la protección de referente en la raíz y en el registro y no se guardan correos en Git, Drive, almacenamiento del navegador o Umami.

La medición optativa de Umami se limita al banner público en la raíz HTTPS del dominio, con las protecciones actuales de DNT/GPC y exclusión de parámetros y datos del formulario. No mide envíos de registro ni carga en `/registro/`, `/sitio/`, el redirect de `/banda/`, `404.html` o los modos protegidos de reversión. Consulta [el alcance](ANALYTICS.md).

El texto visible explica que el registro es para novedades de Maratón y Los Insurgentes, con posibilidad de baja. Esto no demuestra que Brevo almacene un registro de consentimiento: no se añadieron campos de consentimiento sin correspondencia en el HTML recibido.

## Qué falta en Brevo

La cuenta pertenece al propietario; el agente no la editó. Se eligió **Simple confirmation email**: registro directo y una bienvenida. El 28 de octubre Brevo mostró `losinsurgentes.mx` Authenticated/Branded y **Los Insurgentes <laresistencia@losinsurgentes.mx>** Verified con DKIM y DMARC verdes. El propietario confirmó seleccionar ese remitente y `insurgentes.mx@gmail.com` para respuestas en la plantilla. Es configuración del proveedor: **no requiere modificar el formulario del repo ni publicar el sitio**. Falta probar de nuevo la entrega y revisar lista **Maratón** y consentimiento. Ninguna dirección se designó como booking público.

Para bienvenida y campañas están preparados [los textos e importación](BREVO_TEXTOS.md) y [el plan de correo](EMAIL_PLAN.md). Los correos y guías de voz se subieron en `841b7bd`; el propietario reportó actualizar la bienvenida en Brevo el 7 de noviembre. Ese reporte no verifica su entrega ni el registro de contactos. El nuevo recorrido público autorizado el 23 de noviembre todavía debe confirmarse con su publicación y revisión. El borrador DOI queda sin uso. No hace falta compartir contraseñas o claves API ni contratar un plan para diseñarlos.

Brevo Free permite 300 envíos diarios, sin acumular los no usados, según sus [planes consultados el 26 de octubre de 2026](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). No se ha comprado un plan ni enviado una campaña. La [guía oficial del formulario](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo) explica cómo seleccionar la lista y configurar la confirmación.

Si se añaden CAPTCHA u otros campos obligatorios en Brevo, hay que actualizar la integración con su HTML nuevo para conservar los campos y validaciones necesarios. No basta cambiar colores o agregar campos sin su correspondencia en el proveedor.

## Configuración y publicación

La URL real ya está configurada. Para cambiarla en el futuro:

```sh
node scripts/configure-newsletter.mjs 'PUBLIC_BREVO_FORM_URL'
bash scripts/publish-github.sh
```

Solo se admiten URL HTTPS de los hosts de formularios `sibforms.com`, bajo `/serve/` o `/v2/serve/`, con el relleno final `=` o `==` que incluya el token, y sin credenciales, puerto, parámetros ni fragmento. `formUrl` conserva el enlace alojado para mantenimiento, sin mostrarlo al visitante; `submitUrl` opcional es el destino de Simple HTML. No intercambiar sus tokens. El comando de configuración reemplaza la configuración y no conserva un submitUrl anterior: al cambiar el formulario, cotejar action y campos exportados. Sin submitUrl, el envío se deriva de formUrl normalizado a `/serve/` por compatibilidad.

Para deshabilitar el registro opcional:

```sh
node scripts/configure-newsletter.mjs --disable
bash scripts/publish-github.sh
```

Al publicarse, esto restaura el aviso de registro próximo y controles deshabilitados, que también son el estado predeterminado sin configuración. No borra contactos ni desactiva la URL independiente de Brevo.

## Verificación pendiente

Después de publicar, abre `/` en móvil y escritorio: debe mostrar el banner de Maratón con entrada directa a `/sitio/` y registro opcional. Comprueba que **Recibir comunicados** desde el banner y el sitio abre `/registro/`, que el formulario conserva sus campos y que se puede volver al sitio sin enviarlo. `/banda/` debe redirigir a `/sitio/`, sin contraseña. El paquete predeterminado no debe contener `preview.json` ni `maraton-preview.json`. `404.html` debe conservar el regreso al recorrido público, sin formulario ni medición. Solo se publican los recursos y fotos usados; el editor, las plantillas y los JSON de contenido/configuración quedan fuera.

Una prueba autorizada debe comprobar resultado en la página, incorporación a **Maratón**, una sola bienvenida y baja funcional. El reporte de actualización de la plantilla no acredita esos pasos. CORS y el flujo en navegador siguen sin verificar; si no puede leerse la respuesta, no tratarlo como éxito ni reenviar automáticamente. Comprueba que las peticiones de estadísticas no incluyen datos del formulario y que no se generan en `/registro/`, `/sitio/` ni el redirect de `/banda/`.

Mantén los contactos en Brevo. Las campañas requieren una instrucción posterior del propietario; esta integración no las envía automáticamente. El sitio completo es público en el recorrido autorizado el 23 de noviembre. `--signup-only` permite preparar deliberadamente el registro en raíz y la banda protegida; `--gated` conserva la configuración histórica con ambos accesos protegidos. Ninguno es el modo público predeterminado.
