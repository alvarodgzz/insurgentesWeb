# Lista de correo de Maratón

El propietario proporcionó la URL real, el HTML completo y la exportación **Simple HTML de Brevo** el 27 de octubre. La landing usa un formulario integrado con diseño negro y naranja, textos españoles y correo accesible, activado localmente en `content/newsletter.json`. Después mostró una respuesta real del proveedor con `success: true`. Eso no confirma la lista de destino, entrega de bienvenida ni la versión publicada; el nuevo flujo en la página sigue pendiente de probar en navegador.

## Cómo funciona

El formulario hace un POST directo al destino `/serve/` de Simple HTML. Su token es distinto al enlace alojado anterior: `submitUrl` guarda el destino exacto y `formUrl` se conserva solo para mantenimiento y compatibilidad. Ambos se validan por separado. Envía exactamente `EMAIL`, antispam vacío `email_address_check`, `locale=es` y `html_type=simple`. A petición del propietario no se muestra enlace de proveedor ni botón de formulario alternativo.

Sin iframe ni SDK remoto, `js/maraton.js` mejora el envío con `URLSearchParams(FormData)`: muestra progreso y resultado dentro de la landing, impide envíos repetidos mientras espera y tras completar, y solo muestra éxito tras HTTP correcto y JSON `success === true`. No interpreta HTML ni muestra mensajes remotos sin controlar. Los errores explícitos conservan el correo; fallos de red, CORS, timeout o respuesta ilegible se muestran como resultado incierto, porque Brevo podría haber recibido el registro. No hay reintento ni segundo POST automático.

Sin JavaScript o las funciones necesarias, permanece el envío nativo en la misma pestaña, que puede abrir JSON del proveedor; el aviso noscript lo explica. Las páginas alojadas y mensajes del paso 5 que requieren JavaScript no forman parte de este modo. Nuestros estados locales no simulan éxito: dependen de la respuesta real. La petición no lleva cookies ni referente; no se guardan correos en Git, Drive, almacenamiento del navegador o Umami, ni se crean eventos de estadísticas con el formulario.

El texto visible explica que el registro es para novedades de Maratón y Los Insurgentes, con posibilidad de baja. Esto no demuestra que Brevo almacene un registro de consentimiento: no se añadieron campos de consentimiento sin correspondencia en el HTML recibido.

## Qué falta en Brevo

La cuenta y el formulario pertenecen al propietario; el agente no editó la cuenta. El propietario eligió **Simple confirmation email**, visible en la captura del portal: registro directo y una bienvenida, sin clic de validación. Falta comprobar guardado final, lista de destino **Maratón**, consentimiento registrado, selección y entrega del diseño de bienvenida, remitente y respuestas. El Gmail mostrado tiene el aviso de remitente no autenticado y Brevo indica que sustituye su dominio; no se ha configurado un remitente propio. La cuenta de la banda no es una dirección pública de booking.

El diseño de la web está implementado. Para bienvenida y campañas están preparados [los textos y pasos de importación](BREVO_TEXTOS.md) y [el plan de correo](EMAIL_PLAN.md); la instalación y entrega del diseño en Brevo no se han verificado. El borrador DOI queda sin uso. No hace falta compartir contraseñas o claves API ni contratar un plan para diseñarlos.

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

Después de publicar, abre `/` en móvil y escritorio y realiza una inscripción con una dirección de prueba que controles. Comprueba que el resultado se muestra en la página, incorporación directa a **Maratón**, una sola bienvenida y baja funcional. El éxito JSON mostrado por el propietario no prueba por sí solo esos pasos. Las pruebas locales simulan respuestas: CORS y el nuevo flujo en navegador siguen sin verificar porque la conexión disponible y el DNS no permitieron hacerlo. Si no puede leerse la respuesta, no tratarlo como éxito ni reenviar automáticamente.

Mantén los contactos en Brevo. Las campañas requieren una instrucción posterior del propietario; esta integración no las envía automáticamente. El sitio completo de la banda sigue cifrado tras `/banda/` y el acceso Admin / Banda conserva su contraseña.
