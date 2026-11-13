# Maratón: identidad del lanzamiento

Aplicación del material oficial entregado por el propietario el 12 de noviembre de 2026.

## Uso autorizado

El propietario identifica estos materiales como registrados y autoriza su uso exclusivamente en este proyecto de Los Insurgentes. No reutilizarlos en otros proyectos o sesiones, entrenamiento, datasets, plantillas genéricas ni bibliotecas compartidas. No enviarlos a servicios de generación de imágenes.

La carpeta original `MARATON BRANDING/` y su ZIP permanecen locales, sin cambios y excluidos de Git. Solo las exportaciones seleccionadas en `assets/maraton/` forman parte del sitio. Esta restricción del proyecto no modifica los ajustes de uso de datos de la plataforma.

## La mezcla aprobada tras la corrección

El propietario pidió conservar el look and feel y la experiencia originales del registro. La landing vuelve al fondo negro, composición, calavera, tipografías, formulario oscuro y espaciado anteriores. El cambio visual se limita al wordmark oficial de Maratón en su encabezado. No volver a convertir el registro en un cartel de papel ni añadir sellos y bloques decorativos.

La composición de campaña a pantalla completa se reserva a una pantalla independiente, después de la contraseña de la banda. El propietario rechazó su fondo de papel y el tamaño excesivo del logo de Maratón. Su referencia de Geese inspira ahora una composición negra: logo original de Los Insurgentes como protagonista, Maratón a menor escala y cuatro objetos oficiales como accesos. La calavera naranja lleva a **Entrar al sitio**, con un botón naranja visible; los demás accesos abren Música, Galería y En vivo. En móvil se ordenan en dos columnas. Al entrar se muestra el sitio existente, cuyo encabezado centrado de Maratón ya fue aprobado. No se modifica su diseño ni se convierte la fotografía de la sesión en portada del álbum.

La secuencia actual es **registro público → Acceso de la banda → contraseña → banner de Maratón → sitio completo**. El banner forma parte del mismo `preview.json` cifrado. Sus HTML, CSS y JavaScript no se copian como rutas públicas ni incorporan analytics, almacenamiento, descarga de un segundo paquete ni envío de contraseña al entrar.

## Exportaciones para web

| Archivo preparado | Fuente oficial | Tamaño |
| --- | --- | --- |
| `maraton-full-rust.png` | `MARATON LOGOS/MARATON LOGO FULL/MARATON_LOGOFULL_ROJO.png` | 2400 × 657 |
| `maraton-wordmark-paper.png` | `MARATON LOGOS/MARATON LOGO/MARATON_OFFWHITE.png` | 2000 × 403 |
| `insurgentes-oval-ink.png` | `MARATON STAMP/LOS INSURGENTES OVALO STAMP/OVALOSTAMP_NEGRO.png` | 720 × 331 |
| `maraton-stamp-rust.png` | `MARATON STAMP/MARATON STAMP/MARATON_STAMP_ROJO.png` | 960 × 263 |
| `door-skull-orange.png` | `assets/logos/skull-icon-orange.png` | 382 × 420 |
| `door-skull-white.png` | `assets/logos/skull-icon-white.png` | 382 × 420 |
| `door-stamp-orange.png` | `assets/logos/skull-stamp-orange.png` | 420 × 420 |
| `door-stamp-paper.png` | `MARATON STAMP/LOS INSURGENTES CIRCULO STAMP/CIRCULOSTAMP_OFFWHITE.png` | 420 × 415 |

Se prepararon copias con `sips`: reducción proporcional de tamaño y eliminación exclusiva del margen transparente. No se modificaron colores, trazos ni archivos originales. Los cuatro archivos `door-*` se incluyen solo dentro del documento cifrado, sin rutas públicas. El build usa las exportaciones guardadas y no requiere herramientas de imagen ni el paquete original en Actions.

## Aplicación y publicación

- La landing pública mantiene el diseño negro original y solo actualiza el título con el wordmark oficial de Maratón.
- Tras la contraseña aparece primero el banner a pantalla completa, con un enlace para abrir el sitio. El encabezado del sitio completo usa el wordmark oficial de Maratón cuando ese es el título del anuncio. Los demás títulos editables conservan su representación de texto normal.
- Las tres plantillas HTML de correo conservan logo blanco y calavera naranja, y añaden una franja clara con el sello del álbum. La bienvenida activa sigue siendo Simple confirmation; el DOI sigue sin uso y la campaña conserva sus marcadores de borrador.
- El empaquetado publica solo las exportaciones elegidas. El sitio completo continúa cifrado en `/banda/`; el editor, fotos y contenido de la banda no se publican como rutas separadas.

Actualizar los HTML del repositorio no cambia las plantillas instaladas en Brevo. Para aplicar esa nueva franja en la bienvenida, el propietario debe copiar el HTML actualizado en el editor del proveedor. No se ha enviado ningún correo ni modificado la cuenta de Brevo.
