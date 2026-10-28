# Lista de correo de Maratón

El propietario proporcionó la URL real, el HTML completo y después la exportación **Simple HTML de Brevo** el 27 de octubre. La landing de Maratón usa un formulario integrado con el diseño de Los Insurgentes: fondo oscuro, naranja, textos en español y campo de correo accesible. Está activado localmente en `content/newsletter.json`. La publicación y una inscripción real siguen sin verificar.

## Cómo funciona

El formulario hace un POST directo al destino `/serve/` de la exportación Simple HTML. Su token es distinto al enlace alojado anterior: `submitUrl` guarda ese destino exacto y `formUrl` conserva el enlace original para la alternativa. Ambos se validan por separado. Envía `EMAIL`, el antispam vacío `email_address_check`, `locale=es` y el campo suministrado `html_type=simple`. La respuesta se abre en la misma pestaña; la web no inventa un éxito ni da el registro por completado antes de recibirlo del proveedor.

El diseño se controla desde este proyecto sin iframe ni estilos, fuentes o SDK remotos de Brevo. Los campos y destino ya se cotejaron con Simple HTML; la respuesta real todavía requiere prueba. Como advierte el portal, las páginas de confirmación alojadas por Brevo y los mensajes del paso 5 que requieren JavaScript no funcionan en este modo. No se promete mostrarlos dentro de nuestra landing. Se conserva un enlace al formulario alojado original como alternativa. La página no envía referente al salir. Los correos van directamente a Brevo, fuera de Git, Google Drive y Umami; las estadísticas no capturan el formulario.

El texto visible explica que el registro es para novedades de Maratón y Los Insurgentes, con posibilidad de baja. Esto no demuestra que Brevo almacene un registro de consentimiento: no se añadieron campos de consentimiento sin correspondencia en el HTML recibido.

## Qué falta en Brevo

La cuenta y el formulario pertenecen al propietario; el agente no editó la cuenta. El propietario eligió **Simple confirmation email**, visible en la captura del portal: registro directo y una bienvenida, sin clic de validación. Falta comprobar guardado final, lista de destino **Maratón**, consentimiento registrado, selección y entrega del diseño de bienvenida, remitente y respuestas. El Gmail mostrado tiene el aviso de remitente no autenticado y Brevo indica que sustituye su dominio; no se ha configurado un remitente propio. La cuenta de la banda no es una dirección pública de booking.

El diseño de la web está implementado. Para confirmación, bienvenida y campañas están preparados [los textos y pasos de importación](BREVO_TEXTOS.md) y [el plan de correo con sus tres HTML](EMAIL_PLAN.md). Esos archivos todavía no están instalados ni seleccionados en Brevo. No hace falta compartir contraseñas o claves API ni contratar un plan para diseñarlos.

Brevo Free permite 300 envíos diarios, sin acumular los no usados, según sus [planes consultados el 26 de octubre de 2026](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). No se ha comprado un plan ni enviado una campaña. La [guía oficial del formulario](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo) explica cómo seleccionar la lista y configurar la confirmación.

Si se añaden CAPTCHA u otros campos obligatorios en Brevo, hay que actualizar la integración con su HTML nuevo para conservar los campos y validaciones necesarios. No basta cambiar colores o agregar campos sin su correspondencia en el proveedor.

## Configuración y publicación

La URL real ya está configurada. Para cambiarla en el futuro:

```sh
node scripts/configure-newsletter.mjs 'PUBLIC_BREVO_FORM_URL'
bash scripts/publish-github.sh
```

Solo se admiten URL HTTPS de los hosts de formularios `sibforms.com`, bajo `/serve/` o `/v2/serve/`, con el relleno final `=` o `==` que incluya el token, y sin credenciales, puerto, parámetros ni fragmento. `formUrl` es el enlace alternativo y `submitUrl` opcional es el destino de la exportación Simple HTML; no intercambiar sus tokens. El comando de configuración reemplaza la configuración y no conserva un submitUrl anterior: al cambiar el formulario, cotejar de nuevo su action y campos exportados. Sin submitUrl, el envío se deriva de formUrl normalizado a `/serve/` para compatibilidad anterior.

Para retirar el registro de la landing:

```sh
node scripts/configure-newsletter.mjs --disable
bash scripts/publish-github.sh
```

Al publicarse, esto restaura el aviso de registro próximo y controles deshabilitados, que también son el estado predeterminado sin configuración. No borra contactos ni desactiva la URL independiente de Brevo.

## Verificación pendiente

Después de publicar, abre `/` en móvil y escritorio y realiza una inscripción con una dirección de prueba que controles. Comprueba la respuesta real, incorporación directa a **Maratón**, una sola bienvenida con el diseño elegido y la baja funcional. Un envío del formulario por sí solo no prueba incorporación a la lista ni entrega del correo.

Mantén los contactos en Brevo. Las campañas requieren una instrucción posterior del propietario; esta integración no las envía automáticamente. El sitio completo de la banda sigue cifrado tras `/banda/` y el acceso Admin / Banda conserva su contraseña.
