# Maratón: diseños de formulario y correo

El formulario de la landing ya está diseñado en el proyecto y cotejado con la exportación Simple HTML que proporcionó el propietario. Usa el action actualizado y html_type=simple, sin iframe ni SDK remoto; falta verificar la respuesta real. Los tres correos están preparados localmente; su instalación y entrega en Brevo no se han verificado. El agente no ha editado la cuenta ni enviado correos. El [plan completo](EMAIL_PLAN.md) reúne investigación, límites y pruebas pendientes.

## Elección actual: confirmación simple

El propietario eligió **Simple confirmation** el 27 de octubre. Abrir **Default Template Simple confirmation**, aplicar [email-bienvenida-maraton.html](email-bienvenida-maraton.html), usar asunto **Gracias por sumarte a Maratón** y seleccionarla en **Forms → Settings → Simple confirmation email**. El fan queda registrado sin clic adicional y recibe una sola bienvenida. No usar Double opt-in ni Final Confirmation Email para este flujo. La configuración real permanece pendiente de verificar.

## Borrador DOI conservado, sin uso actual

Usa el diseño completo de [email-confirmacion-maraton.html](email-confirmacion-maraton.html).

- **Nombre interno:** Maratón — Confirmar registro.
- **Asunto:** Confirma tu registro a Maratón.
- **Texto de vista previa:** Confirma tu correo para recibir las novedades de Maratón.
- **Nombre del remitente:** Los Insurgentes.
- **Remitente:** dirección del dominio de la banda por definir y autenticar; el Gmail puede servir para respuestas. Brevo puede sustituir remitentes gratuitos o no autenticados; consulta el plan enlazado.

En **Marketing → Templates**, crea una plantilla e importa o pega el HTML. Conserva `{{ doubleoptin }}`: Brevo lo sustituye por el enlace de confirmación individual. Guarda y selecciona esta plantilla en el formulario, en **Settings → Double confirmation email**. La etiqueta `optin` es opcional; [la guía oficial](https://help.brevo.com/hc/en-us/articles/360019540880-Create-a-custom-double-opt-in-DOI-email-template-for-a-sign-up-form-created-in-Brevo) explica la selección. La [referencia de variables](https://help.brevo.com/hc/en-us/articles/4402386448530--Manual-Personalize-your-messages-with-dynamic-content-Brevo-Template-Language) documenta el enlace.

El logo depende de los recursos públicos de la web. Falta una prueba de envío y visualización en un cliente de correo.

## Bienvenida y futuras campañas

Usa [email-bienvenida-maraton.html](email-bienvenida-maraton.html) como **Simple confirmation email**, al registrar al fan: asunto **Gracias por sumarte a Maratón**. No actives otra bienvenida que la duplique. Revisa si otros formularios comparten la plantilla antes de editarla.

Para los anuncios queda [email-campana-maraton.html](email-campana-maraton.html). Es una base reutilizable, con marcadores que se deben completar y un aviso de borrador que hay que retirar. Mantén los enlaces de baja y vista en navegador. Cada noticia se prepara como campaña y se revisan su lista, contenido y destino antes de enviar; guardar una plantilla no envía una campaña.

## Formulario ya diseñado

La landing muestra el título **Entérate primero de Maratón**, correo obligatorio con ejemplo `tu@correo.com` y el botón **Quiero enterarme**, usando los colores de la banda. El texto visible explica la finalidad y la posibilidad de baja. El formulario envía `EMAIL`, el campo antispam suministrado y el idioma español al destino de Brevo; la respuesta la sirve el proveedor, sin un éxito simulado en la landing.

No se agregó una casilla de consentimiento sin correspondencia en el HTML recibido. El texto visible no prueba que Brevo almacene el consentimiento. Ese registro, la lista **Maratón**, remitente, respuestas y la configuración de confirmación simple siguen pendientes de revisar en la cuenta.

Al configurar la confirmación simple en Brevo, selecciona la bienvenida y comprueba una inscripción de prueba. El texto sugerido **Ya estás en la lista. Gracias por sumarte a Maratón.** corresponde a los mensajes del proveedor; su propio aviso indica que los del paso 5 y las páginas de confirmación alojadas que requieren JavaScript no funcionan en Simple HTML. No se promete mostrarlos en nuestra landing ni se simula éxito local.

El diseño local ya está implementado. Los ajustes de lista y correo pertenecen a Brevo; si añades CAPTCHA u otros campos obligatorios allí, habrá que actualizar la integración con su HTML completo nuevo. La publicación y una inscripción real siguen sin verificar.
