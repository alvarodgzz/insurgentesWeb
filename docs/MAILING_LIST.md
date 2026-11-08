# Lista de correo de Maratón

El 7 de noviembre de 2026 el propietario autorizó publicar la landing y el formulario de Maratón en `/`. El enlace **Acceso de la banda** lleva al sitio completo protegido en `/banda/`; el editor continúa disponible solo en local. `404.html` conserva la marca y un enlace de regreso a `/`, sin formulario ni estadísticas. Esta actualización local aún necesita publicación y revisión.

El formulario está activado en `content/newsletter.json` y cotejado con Simple HTML. El propietario mostró JSON `success: true` y reportó inicialmente una bienvenida en spam. El 28 de octubre mostró dominio y remitente autenticados, confirmó el cambio de sender en Brevo y reportó una bienvenida posterior en Actualizaciones de Gmail. El 7 de noviembre reportó actualizar la plantilla de bienvenida. Falta verificar la entrega de esta nueva versión, la lista de destino y el flujo real en navegador. El formulario alojado por Brevo sigue existiendo de forma independiente.

## Cómo funciona

La landing carga `css/maraton.css` y `js/maraton.js` como recursos públicos; el script conserva `defer` para inicializarse después del HTML del formulario. El sitio completo, sus fotos y contenido permanecen en `preview.json` cifrado, sin publicar el editor. El paquete predeterminado no incluye `maraton-preview.json`.

Como antecedente, la corrección del 28 de octubre hizo que el empaquetado cifrado conservara la ejecución diferida y el orden de los scripts. Evitó inicializar el formulario antes de que existiera y dejar activo únicamente el POST nativo que abre JSON. Esa regresión está cubierta por una simulación de lectura progresiva y sigue siendo relevante para `--gated`, el modo de reversión con ambas vistas protegidas.

El formulario hace un POST directo al destino `/serve/` de Simple HTML. Su token es distinto al enlace alojado anterior: `submitUrl` guarda el destino exacto y `formUrl` se conserva solo para mantenimiento y compatibilidad. Ambos se validan por separado. Envía exactamente `EMAIL`, antispam vacío `email_address_check`, `locale=es` y `html_type=simple`. A petición del propietario no se muestra enlace de proveedor ni botón de formulario alternativo.

Sin iframe ni SDK remoto, `js/maraton.js` mejora el envío con `URLSearchParams(FormData)`: muestra progreso y resultado dentro de la landing, impide envíos repetidos mientras espera y tras completar, y solo muestra éxito tras HTTP correcto y JSON `success === true`. No interpreta HTML ni muestra mensajes remotos sin controlar. Los errores explícitos conservan el correo; fallos de red, CORS, timeout o respuesta ilegible se muestran como resultado incierto, porque Brevo podría haber recibido el registro. No hay reintento ni segundo POST automático.

La landing pública y el formulario funcionan sin JavaScript mediante el envío nativo, que puede abrir JSON del proveedor. El acceso al sitio completo cifrado sí requiere JavaScript y HTTPS o localhost. Las páginas alojadas y mensajes del paso 5 que requieren JavaScript no forman parte de Simple HTML. Nuestros estados no simulan éxito: dependen de la respuesta real. La petición de la mejora en JavaScript no lleva cookies ni referente; se conserva la protección de referente en la raíz y no se guardan correos en Git, Drive, almacenamiento del navegador o Umami.

La medición optativa de Umami se limita a la visita a la landing pública en la raíz HTTPS del dominio, con las protecciones actuales de DNT/GPC y exclusión de parámetros y datos del formulario. No mide envíos de registro ni carga en `404.html`, la portada de la banda o el sitio descifrado. Consulta [el alcance](ANALYTICS.md).

El texto visible explica que el registro es para novedades de Maratón y Los Insurgentes, con posibilidad de baja. Esto no demuestra que Brevo almacene un registro de consentimiento: no se añadieron campos de consentimiento sin correspondencia en el HTML recibido.

## Qué falta en Brevo

La cuenta pertenece al propietario; el agente no la editó. Se eligió **Simple confirmation email**: registro directo y una bienvenida. El 28 de octubre Brevo mostró `losinsurgentes.mx` Authenticated/Branded y **Los Insurgentes <laresistencia@losinsurgentes.mx>** Verified con DKIM y DMARC verdes. El propietario confirmó seleccionar ese remitente y `insurgentes.mx@gmail.com` para respuestas en la plantilla. Es configuración del proveedor: **no requiere modificar el formulario del repo ni publicar el sitio**. Falta probar de nuevo la entrega y revisar lista **Maratón** y consentimiento. Ninguna dirección se designó como booking público.

Para bienvenida y campañas están preparados [los textos e importación](BREVO_TEXTOS.md) y [el plan de correo](EMAIL_PLAN.md). Los correos y guías de voz se subieron en `841b7bd`; el propietario reportó actualizar la bienvenida en Brevo el 7 de noviembre. Ese reporte no verifica su entrega ni el registro de contactos. Los cambios web para abrir la landing están todavía en local. El borrador DOI queda sin uso. No hace falta compartir contraseñas o claves API ni contratar un plan para diseñarlos.

Brevo Free permite 300 envíos diarios, sin acumular los no usados, según sus [planes consultados el 26 de octubre de 2026](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). No se ha comprado un plan ni enviado una campaña. La [guía oficial del formulario](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo) explica cómo seleccionar la lista y configurar la confirmación.

Si se añaden CAPTCHA u otros campos obligatorios en Brevo, hay que actualizar la integración con su HTML nuevo para conservar los campos y validaciones necesarios. No basta cambiar colores o agregar campos sin su correspondencia en el proveedor.

## Configuración y publicación

La URL real ya está configurada. Para cambiarla en el futuro:

```sh
node scripts/configure-newsletter.mjs 'PUBLIC_BREVO_FORM_URL'
bash scripts/publish-github.sh
```

Solo se admiten URL HTTPS de los hosts de formularios `sibforms.com`, bajo `/serve/` o `/v2/serve/`, con el relleno final `=` o `==` que incluya el token, y sin credenciales, puerto, parámetros ni fragmento. `formUrl` conserva el enlace alojado para mantenimiento, sin mostrarlo al visitante; `submitUrl` opcional es el destino de Simple HTML. No intercambiar sus tokens. El comando de configuración reemplaza la configuración y no conserva un submitUrl anterior: al cambiar el formulario, cotejar action y campos exportados. Sin submitUrl, el envío se deriva de formUrl normalizado a `/serve/` por compatibilidad.

Para retirar el registro de la landing:

```sh
node scripts/configure-newsletter.mjs --disable
bash scripts/publish-github.sh
```

Al publicarse, esto restaura el aviso de registro próximo y controles deshabilitados, que también son el estado predeterminado sin configuración. No borra contactos ni desactiva la URL independiente de Brevo.

## Verificación pendiente

Después de publicar, abre `/` en móvil y escritorio: debe mostrar Maratón y el formulario sin contraseña. **Acceso de la banda** debe llevar a `/banda/` y pedir la contraseña existente. Sin contraseña de compilación, el formulario sigue público y no debe existir `preview.json`; `maraton-preview.json` se omite siempre en el modo predeterminado. Comprueba también que `404.html` solo ofrece el regreso a la landing, sin formulario ni medición, y que no se publican fotos, contenido ni editor del sitio completo.

Una prueba autorizada debe comprobar resultado en la página, incorporación a **Maratón**, una sola bienvenida y baja funcional. El reporte de actualización de la plantilla no acredita esos pasos. CORS y el flujo en navegador siguen sin verificar; si no puede leerse la respuesta, no tratarlo como éxito ni reenviar automáticamente. Comprueba que las peticiones de estadísticas no incluyen datos del formulario y que no se generan en la vista de la banda.

Mantén los contactos en Brevo. Las campañas requieren una instrucción posterior del propietario; esta integración no las envía automáticamente. El sitio completo de la banda sigue cifrado tras `/banda/` y **Acceso de la banda** conserva su contraseña. El modo `--gated` permite preparar la configuración anterior con ambos accesos protegidos; no es el modo de publicación predeterminado autorizado el 7 de noviembre.
