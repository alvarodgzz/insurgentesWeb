# Maratón: formulario, correos y operación

Investigación del 27 de octubre de 2026. Los diseños están preparados en este proyecto; la configuración de la cuenta, la entrega y la publicación siguen sin verificar.

## Lo que recibe el fan

| Momento | Correo | Diseño preparado |
| --- | --- | --- |
| Envía el formulario y Brevo acepta el registro | «Gracias por sumarte a Maratón», bienvenida y enlace a Spotify | [Bienvenida](email-bienvenida-maraton.html) |
| La banda anuncia algo | Una campaña con noticia, arte autorizado y un botón al destino correspondiente | [Base de campaña](email-campana-maraton.html) |

El propietario eligió **Simple confirmation** el 27 de octubre, sustituyendo la recomendación anterior de doble confirmación. El registro es directo y se envía una sola bienvenida, sin clic de validación ni correo final adicional. No añadir otro flujo de bienvenida que duplique el correo. Los anuncios se preparan como campañas independientes. La [guía de formularios de Brevo](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo) documenta esta opción. El [borrador DOI](email-confirmacion-maraton.html) queda como alternativa sin uso.

## Qué necesita el formulario web

El diseño local ya existe: correo obligatorio, textos españoles y botón naranja. La última exportación Simple HTML proporcionada por el propietario permitió cotejar el POST: `EMAIL`, antispam vacío `email_address_check`, `locale=es` y `html_type=simple`. `submitUrl` guarda el action nuevo, cuyo token difiere del enlace alojado `formUrl`; se conserva ese enlace como alternativa. Los contactos se envían a Brevo, no a Git, Drive o Umami. No se inventó una casilla con un atributo desconocido; el texto visible no demuestra que el proveedor registre consentimiento.

**Falta verificar su funcionamiento real.** La versión local hace un POST nativo sin SDK, cotejado con el Simple HTML recibido. El portal advierte que este modo no soporta las páginas de confirmación y los mensajes del paso 5 que requieren JavaScript. No se promete reproducirlos en la landing. Los tests locales no prueban respuesta, registro ni entrega de bienvenida. [Modos oficiales de integración](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo).

Si se añaden campos obligatorios o CAPTCHA en el portal, se debe actualizar la integración desde el nuevo código exportado.

## Cómo diseño yo los correos

Puedo crear el diseño completo, textos, asunto, vista previa, imágenes y enlaces. Brevo recibe ese HTML y lo utiliza para enviar el mensaje; el fan lo abre en Gmail u otro cliente sin visitar la web para leerlo.

Los tres borradores comparten el logo oficial, negro, naranja y beige. Usan tablas de hasta 600 px, CSS en línea y Arial/Helvetica como sustitutos compatibles. Las fuentes locales de la web no son una garantía en Gmail. No contienen JavaScript, iframes ni formularios: el botón lleva al destino correspondiente. Esto sigue las [recomendaciones de HTML para correo de Brevo](https://help.brevo.com/hc/en-us/articles/6632412983186-Limitations-when-using-HTML-for-your-email-campaigns).

Para importarlos: crear o abrir la plantilla → **Start designing / Add content → Start from scratch → HTML custom code**, pegar el archivo completo y guardar. Es el editor del correo completo, no un bloque HTML dentro de otra plantilla. Luego se reutiliza en las campañas. [Importación oficial](https://help.brevo.com/hc/en-us/articles/4672127581074-Upload-an-HTML-file-to-design-your-emails-HTML-custom-code-editor).

La confirmación conserva `{{ doubleoptin }}`. Bienvenida y campaña incluyen `{{ unsubscribe }}` y `{{ mirror }}`. La campaña tiene marcadores visibles para completar y retirar antes de enviarla. No inventa fecha, título del single ni portada. Los diseños dependen de que el logo HTTPS esté disponible públicamente; falta comprobarlo.

## Ajustes de Brevo, una vez

1. Revisar lista de destino Maratón y qué evidencia de consentimiento guarda el formulario.
2. En **Marketing → Templates → Email**, abrir **Default Template Simple confirmation** y aplicar el HTML de bienvenida, con asunto **Gracias por sumarte a Maratón**. Revisar antes si otros formularios comparten la plantilla.
3. En **Marketing → Forms**, abrir el formulario, seleccionar **Simple confirmation email** y elegir la plantilla de bienvenida. No usar Double opt-in ni Final Confirmation Email en este flujo.
4. Configurar nombre de remitente Los Insurgentes, dirección de envío y dirección de respuestas.
5. Guardar y validar una suscripción completa antes de publicar el registro como verificado.

El requisito `{{ doubleoptin }}` pertenece exclusivamente al borrador DOI sin uso; la bienvenida no necesita ese enlace. Los ajustes del formulario se describen en la guía enlazada arriba; no se han aplicado a la cuenta desde esta sesión.

## Remitente: Gmail frente al dominio

La cuenta de Gmail de la banda puede seguir administrando la lista y recibiendo respuestas. Para el remitente visible recomiendo una dirección del dominio `losinsurgentes.mx`, por definir y verificar. Brevo puede sustituir remitentes gratuitos o no autenticados por direcciones de sus dominios; no debemos prometer que el fan verá exactamente el Gmail original. [Política de remitentes de Brevo](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders).

Autenticar el dominio requiere los registros que genere la cuenta de Brevo en Squarespace. No se han solicitado ni cambiado; no implica mover el alojamiento de GitHub Pages. La dirección de respuestas puede ser distinta del remitente. [Reply-To en Brevo](https://help.brevo.com/hc/en-us/articles/209429225-FAQs-Where-are-reply-emails-sent-to-Reply-to-email-address).

## Cómo reducir el trabajo manual

Brevo documenta un **plugin para ChatGPT** que permite consultar la cuenta y guardar plantillas y campañas como borradores. No permite enviar ni programar campañas; sí contempla envíos de prueba de plantillas. [Capacidades oficiales](https://help.brevo.com/hc/en-us/articles/38787797249554-Brevo-plugin-for-ChatGPT-Use-your-Brevo-data-and-campaigns-in-ChatGPT).

La búsqueda de plugins de esta sesión no lo devolvió y no tenemos una conexión Brevo operativa. Se puede revisar el [directorio de plugins](https://chatgpt.com/plugins); la disponibilidad y conexión se gestionan según la [documentación de ChatGPT](https://learn.chatgpt.com/docs/plugins). Hasta contar con acceso, importar nuestros HTML es la alternativa concreta. No hace falta entregarme contraseñas o claves para diseñarlos.

También investigué el [SDK oficial de Brevo en GitHub](https://github.com/getbrevo/brevo-node) y [MJML](https://documentation.mjml.io/), que genera HTML para correo. Para estos tres diseños recomiendo conservar HTML sencillo: evita dependencias y un servicio adicional. Una integración API futura requeriría credenciales del lado servidor; nunca dentro de GitHub Pages.

## Límites y verificación pendiente

Brevo Free ofrece 300 envíos diarios, sin acumularlos, y mantiene su marca en los correos. La bienvenida y las campañas comparten ese límite. No hace falta contratar otro plan para preparar estos borradores. [Límites oficiales](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan).

Las 51 pruebas anteriores verificaron lógica local, renderizado y empaquetado; no entrega de correo ni Gmail. Estos HTML recibieron revisión estática. Falta importar, revisar variables y destinatarios, hacer un envío de prueba autorizado y comprobar Gmail en escritorio/móvil y modo oscuro. La prueba completa debe verificar formulario, incorporación directa a la lista, una sola bienvenida y baja funcional. No se han enviado correos, activado automatizaciones ni editado la cuenta durante esta investigación.
