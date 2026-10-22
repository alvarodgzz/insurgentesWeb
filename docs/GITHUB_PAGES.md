# Publicar Los Insurgentes con GitHub Pages

La configuración está preparada para el repositorio `alvarodgzz/insurgentesWeb`, con la rama principal `main`. La dirección prevista es [alvarodgzz.github.io/insurgentesWeb](https://alvarodgzz.github.io/insurgentesWeb/). Esa dirección solo estará disponible después de crear el repositorio, subir los archivos y completar la primera publicación. La presencia de estos archivos locales no confirma que el sitio esté publicado.

## Primera publicación

Con Git y GitHub CLI instalados, inicia sesión como `alvarodgzz` con `gh auth login --hostname github.com`. Después ejecuta desde este proyecto:

```sh
bash scripts/publish-github.sh
```

El script comprueba el sitio, prepara un commit, crea `alvarodgzz/insurgentesWeb` como **repositorio público** si aún no existe y sube `main`. Después activa Pages con GitHub Actions e inicia una publicación. Este orden permite configurar Pages cuando el repositorio ya tiene contenido; si el primer flujo disparado por el push falla por falta de configuración, revisa el flujo posterior iniciado por el script. Conserva la visibilidad de un repositorio existente y no reemplaza remotos, cambia de rama ni fuerza el historial. Solo completa la identidad local de Git si falta. La activación de Pages utiliza los [endpoints oficiales de GitHub](https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site). Este script se entrega para ejecutarlo en tu terminal; su presencia no significa que se haya ejecutado ni que el sitio esté publicado.

También puedes hacer la publicación manualmente:

1. En la cuenta `alvarodgzz`, crea el repositorio `insurgentesWeb` y sube este proyecto a la rama `main`. GitHub Pages está disponible para repositorios públicos con GitHub Free; los repositorios privados requieren un plan compatible. Consulta la [disponibilidad de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
2. En el repositorio, abre **Settings → Pages** y selecciona **GitHub Actions** como origen de publicación.
3. En **Actions → Validate and publish GitHub Pages**, selecciona **Run workflow**, usando la rama `main`. Los siguientes cambios que lleguen a `main` publicarán automáticamente.
4. Espera a que los trabajos `build` y `deploy` terminen correctamente. Abre la dirección del entorno **github-pages** mostrada por GitHub y comprueba la página desde computadora y teléfono.

El flujo sigue la [documentación oficial de publicación con GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Usa Node.js 22, sin instalación de paquetes ni servidores externos. Los permisos de publicación se limitan al trabajo `deploy` y no hace falta guardar una contraseña o un token personal. Al generar la página, `SITE_URL` toma la dirección real que proporciona GitHub Pages para los metadatos y las imágenes sociales; en un pull request usa la dirección prevista del proyecto.

## Contenido y futuras actualizaciones

Si el primer envío falla con `RPC failed; HTTP 400`, vuelve a ejecutar `bash scripts/publish-github.sh`. El script conserva el repositorio y el remoto existentes y reintenta ese error una vez con HTTP/1.1 y un búfer de 64 MiB, solo para ese comando. Es un ajuste de compatibilidad para transferencias HTTP, descrito en la [configuración de Git](https://git-scm.com/docs/git-config#Documentation/git-config.txt-httppostBuffer); no cambia tu configuración global. Antes de activar Pages, el script comprueba que el commit local coincide con `main` en GitHub. Si el reintento falla, conserva el trabajo y se detiene.

Las fotos y los archivos JSON de `content/` son la fuente del sitio. El editor en `admin/` permite preparar cambios y exportarlos o guardarlos en una carpeta elegida por el usuario. No inicia sesión en GitHub ni publica por sí solo. Para publicar, sube los archivos modificados al repositorio y confirma el cambio en `main`, o abre un pull request para revisión.

El flujo ejecuta, en este orden:

```sh
node --test tests/*.test.mjs
node scripts/build.mjs
node scripts/check.mjs
node scripts/prepare-pages.mjs
```

Si alguna comprobación falla, la publicación se detiene. Los pull requests ejecutan las mismas comprobaciones sin publicar. La página pública ya contiene el texto generado: la navegación, la biografía y el catálogo no necesitan JavaScript para mostrar el contenido.

Para revisar localmente el mismo resultado que se subirá a Pages, ejecuta los comandos anteriores y después:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Abre `http://127.0.0.1:8000/`. El editor estará en `http://127.0.0.1:8000/admin/`. Si tu entorno restringe los servidores locales, la vista previa deberá hacerse desde otro entorno permitido.

## Archivos publicados

`scripts/prepare-pages.mjs` recrea `_site/` copiando únicamente `index.html` y los directorios `assets/`, `css/`, `js/`, `images/`, `content/`, `admin/` y `templates/`. Excluye archivos ocultos dentro de ellos y rechaza enlaces simbólicos. Añade `.nojekyll` al resultado. GitHub recibe únicamente `_site/`, sin el historial Git, las instrucciones de agentes, los scripts, la documentación ni las carpetas de herramientas locales.

Todo el contenido copiado, incluidos JSON, fotos y plantillas, será público. Guarda aquí solo material que la banda quiera publicar; las letras completas que se agreguen a los JSON también serán accesibles como archivos públicos. Los borradores privados deben conservarse fuera de estos directorios.

## Dominio propio

Esta configuración usa inicialmente el subdirectorio de GitHub Pages. No añade `CNAME` ni modifica DNS. Cuando se confirme el dominio definitivo, habrá que configurar ese dominio en GitHub Pages y actualizar las direcciones de metadatos del sitio. Las rutas de fotos, estilos y scripts deben mantenerse relativas para funcionar tanto en el subdirectorio como en el dominio futuro.

## Verificación de lanzamiento

Después de la primera publicación, comprueba en el sitio real: navegación en móvil, enlaces de Spotify, reproductores, galería y teclado; confirma también que los textos de Maratón y del próximo sencillo siguen vigentes. Revisa que el último flujo publicado corresponde al cambio más reciente en `main`. Una comprobación local correcta no sustituye esta revisión del dominio publicado.
