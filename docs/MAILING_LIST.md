# Lista de correo de Maratón

El propietario pidió proteger temporalmente también la landing y el formulario con la contraseña existente mientras resolvemos los correos en spam. `/` y `404.html` muestran la portada de acceso a `maraton-preview.json` cifrado; `/banda/` conserva su sitio completo cifrado. No se publica el formulario ni sus estilos/scripts por separado. Esta modificación local aún necesita publicación y revisión.

El formulario está activado en `content/newsletter.json` y cotejado con Simple HTML. El propietario mostró JSON `success: true` y reportó una bienvenida en spam. El 28 de octubre mostró dominio y remitente autenticados y confirmó el cambio de sender en Brevo. Falta una nueva prueba de entrega, además de revisar lista, diseño y nuevo flujo en navegador. El formulario alojado por Brevo sigue existiendo fuera del gate del sitio.

## Cómo funciona

En la vista cifrada, el empaquetador conserva la ejecución diferida de los scripts: los inicializa después del HTML del formulario y en su orden original. La corrección del 28 de octubre evita que el script se ejecute prematuramente en el head y deje activo solo el POST nativo que abre JSON. La regresión se verifica con el template empaquetado y simulación de lectura progresiva del documento; falta probar esta nueva versión en navegador publicado.

El formulario hace un POST directo al destino `/serve/` de Simple HTML. Su token es distinto al enlace alojado anterior: `submitUrl` guarda el destino exacto y `formUrl` se conserva solo para mantenimiento y compatibilidad. Ambos se validan por separado. Envía exactamente `EMAIL`, antispam vacío `email_address_check`, `locale=es` y `html_type=simple`. A petición del propietario no se muestra enlace de proveedor ni botón de formulario alternativo.

Sin iframe ni SDK remoto, `js/maraton.js` mejora el envío con `URLSearchParams(FormData)`: muestra progreso y resultado dentro de la landing, impide envíos repetidos mientras espera y tras completar, y solo muestra éxito tras HTTP correcto y JSON `success === true`. No interpreta HTML ni muestra mensajes remotos sin controlar. Los errores explícitos conservan el correo; fallos de red, CORS, timeout o respuesta ilegible se muestran como resultado incierto, porque Brevo podría haber recibido el registro. No hay reintento ni segundo POST automático.

Abrir la vista cifrada requiere JavaScript y HTTPS o localhost. Dentro del documento se conserva el contrato de envío nativo como alternativa a la mejora de respuesta; puede abrir JSON del proveedor. Las páginas alojadas y mensajes del paso 5 que requieren JavaScript no forman parte de Simple HTML. Nuestros estados no simulan éxito: dependen de la respuesta real. La petición no lleva cookies ni referente; no se guardan correos en Git, Drive, almacenamiento del navegador o Umami. El paquete protegido no inyecta medición en portadas ni en Maratón descifrado.

El texto visible explica que el registro es para novedades de Maratón y Los Insurgentes, con posibilidad de baja. Esto no demuestra que Brevo almacene un registro de consentimiento: no se añadieron campos de consentimiento sin correspondencia en el HTML recibido.

## Qué falta en Brevo

La cuenta pertenece al propietario; el agente no la editó. Se eligió **Simple confirmation email**: registro directo y una bienvenida. El 28 de octubre Brevo mostró `losinsurgentes.mx` Authenticated/Branded y **Los Insurgentes <laresistencia@losinsurgentes.mx>** Verified con DKIM y DMARC verdes. El propietario confirmó seleccionar ese remitente y `insurgentes.mx@gmail.com` para respuestas en la plantilla. Es configuración del proveedor: **no requiere modificar el formulario del repo ni publicar el sitio**. Falta probar de nuevo la entrega y revisar lista **Maratón**, consentimiento e identidad del diseño. Ninguna dirección se designó como booking público.

Para bienvenida y campañas están preparados [los textos e importación](BREVO_TEXTOS.md) y [el plan de correo](EMAIL_PLAN.md); no se ha identificado qué diseño llegó en la prueba. El borrador DOI queda sin uso. No hace falta compartir contraseñas o claves API ni contratar un plan para diseñarlos.

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

Después de publicar, abre `/` en móvil y escritorio: debe pedir contraseña antes de mostrar el formulario; sin contraseña de compilación no debe existir ninguno de los dos paquetes cifrados. Comprueba también que `404.html` no expone el registro. Dentro de la vista, una prueba autorizada debe comprobar resultado en la página, incorporación a **Maratón**, una sola bienvenida y baja funcional. La llegada a spam no acredita los demás pasos. CORS y el nuevo flujo en navegador siguen sin verificar; si no puede leerse la respuesta, no tratarlo como éxito ni reenviar automáticamente.

Mantén los contactos en Brevo. Las campañas requieren una instrucción posterior del propietario; esta integración no las envía automáticamente. El sitio completo de la banda sigue cifrado tras `/banda/` y el acceso Admin / Banda conserva su contraseña.
