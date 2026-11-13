# Revisar responsive antes de publicar

El registro conserva su diseño original. Los cambios de HTML, CSS, logos o navegación deben pasar las pruebas de navegador y una revisión de capturas antes del push.

## Ejecutar

Primera ejecución, o si se limpió la carpeta temporal de herramientas:

```sh
node scripts/qa-browser.mjs --install
```

Ejecuciones posteriores:

```sh
node scripts/qa-browser.mjs
```

El instalador prepara Playwright 1.65.0, Chromium y WebKit en una carpeta temporal fuera del repositorio. En macOS la ejecución local usa Chromium; el WebKit disponible en este equipo se bloqueó al arrancar y no se declara aprobado. El CI de Linux exige ambos navegadores. No añade dependencias de ejecución a la web ni cambia su stack. Las pruebas de Node, el build y el empaquetado siguen siendo independientes de npm. El comando de publicación ejecuta además esta revisión de navegador antes de crear el commit y hacer push.

## Qué comprueba

- Registro a 320, 360, 390, 430, 768 y 1440 px, en Chromium y WebKit, con emulación móvil en los tamaños pequeños.
- Logo completo dentro de la pantalla y de los ancestros que puedan recortarlo. Comprobar solo el ancho del documento no detecta una imagen gigante oculta con overflow.
- Campo de correo, botón y acceso de la banda visibles, con límites y tamaños utilizables.
- Contraseña incorrecta, reintento correcto, banner privado y entrada al sitio existente. Banner y logo del sitio se revisan a 320, 390, 768 y 1440 px, con foco de teclado en el contenido al entrar.
- Registro nativo sin JavaScript y estados de envío pendiente/éxito con una respuesta simulada, sin navegar a JSON ni duplicar peticiones.
- Una prueba deliberadamente agranda el logo y exige que el detector falle. Después verifica que un logo con atributos antiguos también cabe en el contenedor.

Son navegadores reales con tamaños/dispositivos emulados, no una prueba en un iPhone físico. Las respuestas del proveedor se simulan: no prueban CORS de Brevo, inclusión en la lista ni llegada de correos.

## Capturas y storyboard

El reporte local queda en `_qa/index.html`, con capturas enlazadas del registro, banner, sitio y estados del formulario. Ábrelo después de las pruebas y revisa la composición, no solo el resultado automático. No hace falta añadir Storybook ni un framework a este sitio estático.

`_qa/` está ignorado por Git y fuera de la lista de publicación. Las capturas del sitio protegido y el branding son material exclusivo de este proyecto: no subirlas como artifacts públicos ni reutilizarlas fuera del proyecto.

## Aislamiento y CI

El runner prepara una copia temporal con contraseña, dirección de formulario y respuesta de proveedor sintéticas. Bloquea todo el tráfico externo y nunca envía un registro real. Comprueba que el paquete de publicación y la configuración reales no hayan cambiado. La carpeta original de branding, ZIP, Git y `.env` no se copian a esa prueba.

GitHub Actions instala las herramientas en su carpeta temporal y ejecuta la misma prueba **antes de subir el artifact y desplegar Pages**. Si falla, no hay deploy. El runner de build se fija a Ubuntu 24.04 para hacer reproducibles los navegadores. No se publican reportes ni capturas; los archivos temporales del CI se eliminan al terminar.
