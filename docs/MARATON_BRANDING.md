# Maratón: identidad del lanzamiento

Aplicación del material oficial entregado por el propietario el 12 de noviembre de 2026.

## Uso autorizado

El propietario identifica estos materiales como registrados y autoriza su uso exclusivamente en este proyecto de Los Insurgentes. No reutilizarlos en otros proyectos o sesiones, entrenamiento, datasets, plantillas genéricas ni bibliotecas compartidas. No enviarlos a servicios de generación de imágenes.

La carpeta original `MARATON BRANDING/` y su ZIP permanecen locales, sin cambios y excluidos de Git. Solo las cuatro exportaciones seleccionadas en `assets/maraton/` forman parte del sitio. Esta restricción del proyecto no modifica los ajustes de uso de datos de la plataforma.

## La mezcla

Maratón encabeza la portada con su lettering oficial, volumen negro, tinta quemada y papel claro. El logotipo original de Los Insurgentes, la calavera naranja, el negro, Voska y Pragmatica mantienen la continuidad de la banda.

El cartel reúne el logo del álbum, la frase elegida por el propietario, la calavera original sobre negro y el sello ovalado. El registro toma la forma de una hoja de comunicado sobre el fondo negro. Los sellos conservan su desgaste original; no se simula ni se redibuja el lettering con CSS.

Colores del material de campaña: papel `#EBE4DC` y tinta quemada `#B54C05`, tomada de la variante oficial nombrada ROJO. El naranja original `#F86927` sigue en la calavera y el botón de registro. No reemplazar la paleta original de la banda por todas las variantes del paquete a la vez.

## Exportaciones para web

| Archivo preparado | Fuente oficial | Tamaño |
| --- | --- | --- |
| `maraton-full-rust.png` | `MARATON LOGOS/MARATON LOGO FULL/MARATON_LOGOFULL_ROJO.png` | 2400 × 657 |
| `maraton-wordmark-paper.png` | `MARATON LOGOS/MARATON LOGO/MARATON_OFFWHITE.png` | 2000 × 403 |
| `insurgentes-oval-ink.png` | `MARATON STAMP/LOS INSURGENTES OVALO STAMP/OVALOSTAMP_NEGRO.png` | 720 × 331 |
| `maraton-stamp-rust.png` | `MARATON STAMP/MARATON STAMP/MARATON_STAMP_ROJO.png` | 960 × 263 |

Se prepararon copias con `sips`: reducción proporcional de tamaño y, en los sellos, eliminación exclusiva del margen transparente. No se modificaron colores, trazos ni archivos originales. El build usa las exportaciones guardadas y no requiere herramientas de imagen ni el paquete original en Actions.

## Aplicación y publicación

- La landing pública usa el logo con volumen, el sello ovalado y el sello de Maratón, junto con la identidad original.
- El encabezado del sitio completo usa el wordmark oficial de Maratón cuando ese es el título del anuncio. Los demás títulos editables conservan su representación de texto normal.
- Las tres plantillas HTML de correo conservan logo blanco y calavera naranja, y añaden una franja clara con el sello del álbum. La bienvenida activa sigue siendo Simple confirmation; el DOI sigue sin uso y la campaña conserva sus marcadores de borrador.
- El empaquetado publica solo las exportaciones elegidas. El sitio completo continúa cifrado en `/banda/`; el editor, fotos y contenido de la banda no se publican como rutas separadas.

Actualizar los HTML del repositorio no cambia las plantillas instaladas en Brevo. Para aplicar esa nueva franja en la bienvenida, el propietario debe copiar el HTML actualizado en el editor del proveedor. No se ha enviado ningún correo ni modificado la cuenta de Brevo.
