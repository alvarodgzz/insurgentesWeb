# Voz de Los Insurgentes

Dirección del propietario, 7 de noviembre de 2026. Aplica a los textos editoriales del sitio, correos, anuncios y futuras comunicaciones de la banda.

## Referencia

La descripción de Spotify aportada por el propietario habla de una banda disconforme, de rock mexicano de vieja escuela y underground: «Polifonía estridente», «de liras y tambores». Su atribución a «Tía Nancy, mamá de Viko» introduce humor propio, sin volver ligera toda la voz.

El propietario pide imaginar los correos redactados por quien encabeza una resistencia, siguiendo la temática de La Resistencia. Es una voz artística y colectiva de la banda, no una organización militar ni una postura política nueva que debamos inventar.

## Cómo escribir

- Hablar desde el nosotros. Convocar a quien escucha y reconocer que está del otro lado.
- Usar imágenes musicales concretas: liras, tambores, estruendo, escenario, palabras. La disconformidad atraviesa la voz; no hace falta nombrarla en cada línea.
- Dar a cada bloque una imagen fuerte y espacio para respirar. La densidad de la descripción de Spotify no obliga a hacer difícil de leer un correo.
- Usar el lenguaje de un comunicado: señal, siguiente movimiento, comunicación abierta. Evitar números de comunicado, fechas o noticias inventadas.
- Mantener una energía firme, subterránea y cercana. El humor debe tener intención y venir de la identidad de la banda.
- Dejar los datos confirmados a la vista: qué se anuncia, cuándo, dónde y cómo escucharlo. Una metáfora no reemplaza la información.

## Qué evitar

- El propietario descartó el borrador con «chido», comentarios sobre el algoritmo y tono de marca simpática. No reutilizarlo.
- Frases de marketing intercambiables, emojis de rock automáticos, promesas de exclusivas o urgencia sin respaldo.
- Acumular consignas, hablar a los fans como soldados o forzar metáforas de combate en cada botón.
- Inventar letras, citas de canciones, fechas, lanzamientos, alineación o afirmaciones sobre la entrega de correo.

## Ejemplo de bienvenida

**Asunto:** Tu señal llegó — Los Insurgentes

**Vista previa:** Maratón es el siguiente movimiento. Mantengamos abierta la comunicación.

> Desde Monterrey seguimos abriendo paso entre liras, tambores y palabras que no se resignan. Gracias por estar del otro lado.
>
> Maratón es el siguiente movimiento. Por este correo llegarán los próximos lanzamientos, las fechas y las noticias de Los Insurgentes. Mantengamos abierta la comunicación.
>
> Esa calavera que ya viene por ti…
>
> Desde la resistencia,
> Los Insurgentes

## Identidad de los correos

Las tres plantillas usan las imágenes oficiales `logo-full-white.png` y `skull-icon-orange.png` juntas en un encabezado de comunicado. A petición del propietario, la calavera tiene un ancho de hasta 144 px y su columna ocupa el 40 % del encabezado; se reduce proporcionalmente en pantallas pequeñas. Negro, naranja y beige; tablas y estilos en línea para correo. No reconstruir las marcas con tipografía ni CSS. Las imágenes usan URL HTTPS absolutas y necesitan estar disponibles públicamente; algunos clientes no muestran imágenes hasta que el destinatario las permite.

La bienvenida activa es [email-bienvenida-maraton.html](email-bienvenida-maraton.html), para Simple confirmation. [email-campana-maraton.html](email-campana-maraton.html) sigue siendo una base de anuncios con marcadores pendientes. [email-confirmacion-maraton.html](email-confirmacion-maraton.html) conserva el borrador DOI sin uso. Compartir identidad visual no activa ni duplica ningún envío.

## Claridad funcional

Correo electrónico, contraseña, navegación, textos alternativos, consentimiento, errores, estados de envío y baja se escriben de forma directa. No sustituir «Dejar de recibir estos correos» por una consigna. Conservar las variables de Brevo, las acciones de los enlaces y los campos del formulario.

Editar los archivos del repositorio no instala una plantilla en Brevo ni envía correos. La bienvenida se copia completa en su editor HTML; asunto y vista previa se configuran con los textos indicados. Para este cambio de correo no se necesita desplegar la web.

El 7 de noviembre el propietario confirmó que actualizó la bienvenida en Brevo. La visualización y entrega de esta revisión siguen sin comprobar mediante un envío de prueba.
