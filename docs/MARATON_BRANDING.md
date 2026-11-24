# Maratón: identidad del lanzamiento

Aplicación del material oficial entregado por el propietario el 12 de noviembre de 2026.

## Uso autorizado

El propietario identifica estos materiales como registrados y autoriza su uso exclusivamente en este proyecto de Los Insurgentes. No reutilizarlos en otros proyectos o sesiones, entrenamiento, datasets, plantillas genéricas ni bibliotecas compartidas. No enviarlos a servicios de generación de imágenes.

La carpeta original `MARATON BRANDING/` y su ZIP permanecen locales, sin cambios y excluidos de Git. Solo las exportaciones seleccionadas en `assets/maraton/` forman parte del sitio. Esta restricción del proyecto no modifica los ajustes de uso de datos de la plataforma.

## La mezcla aprobada tras la corrección

El propietario pidió conservar el look and feel y la experiencia originales del registro. La landing vuelve al fondo negro, composición, calavera, tipografías, formulario oscuro y espaciado anteriores. El cambio visual se limita al wordmark oficial de Maratón en su encabezado. No volver a convertir el registro en un cartel de papel ni añadir sellos y bloques decorativos.

La composición de campaña a pantalla completa es la entrada pública en `/`, según la autorización del 23 de noviembre. Su ubicación tras la contraseña correspondía al modo protegido anterior. El propietario rechazó su fondo de papel y el tamaño excesivo del logo de Maratón. Su referencia de Geese inspira ahora una composición negra: logo original de Los Insurgentes como protagonista y Maratón a menor escala. El 23 de noviembre el propietario pidió conservar solo la primera calavera naranja para **Entrar al sitio**, centrada sobre un botón naranja visible. Se retiran los accesos adicionales; podrán añadirse cuando existan nuevos destinos, como la tienda. Al entrar se muestra el sitio existente, cuyo encabezado centrado de Maratón ya fue aprobado. El logo de su menú se amplía para mejorar su lectura; se conserva el resto de la composición. La fotografía de la sesión no se convierte en portada del álbum.

La secuencia elegida es **banner → sitio**, con dos acciones visibles en la portada. **Quiero enterarme más** lleva al formulario en la misma página y la calavera grande **Entrar al sitio** abre la web. La raíz contiene ambos elementos, `/sitio/` el sitio completo y `/registro/` el formulario original. `/banda/` redirige a `/sitio/` por compatibilidad. No se exige contraseña ni registro para entrar. El slogan exacto es **Esa calavera que ya viene por ti...**. Solo el banner en la raíz HTTPS puede incorporar el analytics optativo existente; el resto del recorrido no añade medición. La publicación de esta apertura debe verificarse con su Actions run y el dominio.

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

Se prepararon copias con `sips`: reducción proporcional de tamaño y eliminación exclusiva del margen transparente. No se modificaron colores, trazos ni archivos originales. La portada pública usa el original `assets/logos/skull-icon-orange.png`. El CSS recorta el margen transparente y anima la calavera. La animación se pausa al apuntar o enfocar el enlace y se desactiva con movimiento reducido. El modo protegido de reversión puede seguir embebiendo la calavera usada en su documento cifrado. El build usa las exportaciones guardadas y no requiere herramientas de imagen ni el paquete original en Actions.

## Aplicación y publicación

- El registro opcional de `/registro/` mantiene el diseño negro original, el wordmark oficial de Maratón y el formulario existente.
- La raíz muestra primero el banner a pantalla completa, con una calavera para abrir el sitio y el botón de registro encima del formulario. El encabezado del sitio completo usa el wordmark oficial de Maratón cuando ese es el título del anuncio. Los demás títulos editables conservan su representación de texto normal.
- Las tres plantillas HTML de correo conservan logo blanco y calavera naranja, y añaden una franja clara con el sello del álbum. La bienvenida activa sigue siendo Simple confirmation; el DOI sigue sin uso y la campaña conserva sus marcadores de borrador.
- El empaquetado público incluye solo exportaciones y recursos usados, junto con las fotos necesarias del sitio. Excluye editor, plantillas, JSON de contenido/configuración, originales de branding, `.env` y paquetes de vista previa cifrada. Las variantes protegidas quedan como modos de reversión deliberada.

Actualizar los HTML del repositorio no cambia las plantillas instaladas en Brevo. Para aplicar esa nueva franja en la bienvenida, el propietario debe copiar el HTML actualizado en el editor del proveedor. No se ha enviado ningún correo ni modificado la cuenta de Brevo.
