# Maratón: diseños de formulario y correo

El formulario de la landing está diseñado y cotejado con Simple HTML: action actualizado y html_type=simple, sin iframe ni SDK remoto. El propietario mostró una respuesta JSON real de éxito; ahora hay estados locales de progreso y resultado, sin control alternativo de registro. El nuevo flujo en navegador y la entrega de bienvenida siguen sin verificar. Los tres correos son diseños locales cuya instalación no se ha comprobado. El agente no ha editado la cuenta ni enviado correos. El [plan completo](EMAIL_PLAN.md) reúne los límites y pruebas pendientes.

## Elección actual: confirmación simple

El propietario eligió **Simple confirmation** el 27 de octubre. Abrir **Default Template Simple confirmation**, aplicar [email-bienvenida-maraton.html](email-bienvenida-maraton.html), usar asunto **Gracias por sumarte a Maratón** y seleccionarla en **Forms → Settings → Simple confirmation email**. El fan queda registrado sin clic adicional y recibe una sola bienvenida. No usar Double opt-in ni Final Confirmation Email para este flujo. La configuración real permanece pendiente de verificar.

## Borrador DOI conservado, sin uso actual

Solo si el propietario cambia de decisión en el futuro, existe [email-confirmacion-maraton.html](email-confirmacion-maraton.html). No debe seleccionarse en el flujo actual.

- **Nombre interno:** Maratón — Confirmar registro.
- **Asunto:** Confirma tu registro a Maratón.
- **Texto de vista previa:** Confirma tu correo para recibir las novedades de Maratón.
- **Nombre del remitente:** Los Insurgentes.
- **Remitente:** dirección del dominio de la banda por definir y autenticar; el Gmail puede servir para respuestas. Brevo puede sustituir remitentes gratuitos o no autenticados; consulta el plan enlazado.

Ese borrador conserva `{{ doubleoptin }}` para el enlace individual y pertenece únicamente a Double confirmation, sin uso actual. [Guía oficial DOI](https://help.brevo.com/hc/en-us/articles/360019540880-Create-a-custom-double-opt-in-DOI-email-template-for-a-sign-up-form-created-in-Brevo) y [variables](https://help.brevo.com/hc/en-us/articles/4402386448530--Manual-Personalize-your-messages-with-dynamic-content-Brevo-Template-Language).

El logo depende de los recursos públicos de la web. Falta una prueba de envío y visualización en un cliente de correo.

## Bienvenida y futuras campañas

Usa [email-bienvenida-maraton.html](email-bienvenida-maraton.html) como **Simple confirmation email**, al registrar al fan: asunto **Gracias por sumarte a Maratón**. No actives otra bienvenida que la duplique. Revisa si otros formularios comparten la plantilla antes de editarla.

Para los anuncios queda [email-campana-maraton.html](email-campana-maraton.html). Es una base reutilizable, con marcadores que se deben completar y un aviso de borrador que hay que retirar. Mantén los enlaces de baja y vista en navegador. Cada noticia se prepara como campaña y se revisan su lista, contenido y destino antes de enviar; guardar una plantilla no envía una campaña.

## Formulario ya diseñado

La landing muestra **Entérate primero de Maratón**, correo obligatorio y **Quiero enterarme**, con los colores de la banda. Solo hay un envío, sin enlace alternativo. Se envían `EMAIL`, antispam, `locale=es` y `html_type=simple`. Con JavaScript, el resultado aparece en la página y el éxito requiere HTTP correcto y JSON `success === true`; sin JavaScript se abre la respuesta nativa del proveedor. No se almacena el correo ni se manda a estadísticas.

No se agregó una casilla de consentimiento sin correspondencia en el HTML recibido. El texto visible no prueba que Brevo almacene el consentimiento. Ese registro, la lista **Maratón**, remitente, respuestas y la configuración de confirmación simple siguen pendientes de revisar en la cuenta.

El aviso de Brevo excluye sus páginas alojadas y mensajes del paso 5 que necesitan JavaScript en Simple HTML. Nuestra mejora presenta mensajes locales basados en la respuesta: progreso, éxito comprobable, rechazo y resultado incierto por problemas de lectura/conexión. No afirma que llegó la bienvenida ni reenvía automáticamente si la respuesta no puede comprobarse.

Los ajustes de lista y correo pertenecen a Brevo; si se añaden CAPTCHA u otros campos obligatorios, hay que renovar la integración desde el export. La captura del propietario acredita un éxito del proveedor; publicación exacta, CORS del nuevo envío, lista y bienvenida permanecen pendientes de comprobar.
