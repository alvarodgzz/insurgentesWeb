# Los Insurgentes website

## Project

Official Spanish-language website for Los Insurgentes, a rock band from Monterrey, Nuevo León. Work in this checkout; the site uses plain HTML, CSS, and JavaScript with a dependency-free Node content generator.

- `index.html`: generated complete page for local editing; edit content/template sources and rebuild. The Pages artifact currently uses a separate password gate.
- `content/site.json`, `releases.json`, `lyrics.json`: editable band content.
- `content/photos/`: numbered, replaceable photo slots.
- `templates/page.html`, `js/*-render.mjs`: static rendering shared with the editor.
- `admin/`: browser-based band editor; saves local files or downloads an update, never writes remotely. `admin/estadisticas/` is a separate public entry page linking to the authenticated Umami Cloud dashboard.
- `content/analytics.json`, `js/analytics.js`, `js/analytics-render.mjs`: opt-in Umami configuration and restricted page-view tracking; see `docs/ANALYTICS.md`.
- `js/drive-layout.mjs`: maps the shared Drive section folders to canonical site content; the editor supports import/export for both layouts.
- `docs/GOOGLE_DRIVE.md`: verified Drive folder link and instructions for the band.
- `css/style.css`: responsive layouts and brand styling.
- `js/main.js`: navigation, scroll reveals, and gallery lightbox.
- `assets/`: official logos, licensed/local fonts, and real band photography.
- `README.md`: editing and historical hosting instructions.
- `PROJECT_STATUS.md`: current state, outstanding content, and verification limits.

## Brand requirements

- Preserve the official artwork. Always render the Los Insurgentes wordmark from the supplied logo images; never recreate it with text or CSS.
- Brand colors: black `#000000`, carbon `#2A2A2C`, orange `#F86927`, beige `#DCD9D0`.
- Display type: Voska Round. Body: Pragmatica Light. Oswald is the existing temporary substitute for JAF Bernina Sans Compressed; do not purchase fonts without instruction.
- Use the band's real photos. Session photography is not album artwork.
- Preserve Spanish site copy unless the owner requests a language change.

## Development

- Keep this lightweight static site unless a specific requirement needs a different stack. Node 22+ is used only for build/checks, with no npm dependencies.
- The user chose GitHub Pages and GitHub account `alvarodgzz`. Do not migrate to another hosting provider.
- Current phase: temporary password preview; the owner has not authorized public launch. `node scripts/prepare-pages.mjs` must default to the branded gate and encrypted content, with no raw site/content/photo/editor routes in `_site/`. The explicit `/admin/estadisticas/` exception may publish its entry page and styling, but never the band editor, reports, account credentials or analytics data. Missing password must publish only the holding gate. `--public` is reserved for a future explicitly authorized launch.
- Keep the password out of tracked files, logs and docs. Local `.env.preview-password` is ignored; Actions uses repository secret `PREVIEW_PASSWORD`. The public repository already contains content in its history; encrypted Pages packaging does not make that repository private. Do not claim server authentication or complete confidentiality.
- The user chose a new folder in their personal Google Drive, organized by page section and shared with the band. The folder is created and editor sharing with the band account supplied in chat is verified; see the Drive guide. Preserve private Drive access. The band collaboration email was not designated as the site's public contact.
- Drive currently uses a review-and-publish flow: download the shared folder, import into the editor, review, save/export the canonical files, and publish through GitHub. Neither direct editor-to-Drive saving nor automatic Drive-to-GitHub sync is configured.
- Confirmed October 21, 2026: Maratón is upcoming; next single is November 2026. Polish the existing design and prepare launch. Do not invent the single's title or release day.
- User explicitly authorized subagents for independent tasks.
- The owner chose Umami Cloud Hobby and linked GitHub. The owner supplied the real Website ID and analytics is enabled locally in content/analytics.json; deployment and incoming traffic are still unverified. Missing configuration must continue to default to disabled. Do not invent IDs, request account passwords/API keys, enable public reports/Share URLs or upgrade plans. `/admin/estadisticas/` links to the provider login; it does not implement local admin authorization.
- Track only the published HTTPS root on losinsurgentes.mx/www.losinsurgentes.mx, with normalized URL and referrer origin. Exclude local/admin/iframe/decrypted previews, respect DNT/GPC, and send no query/hash/form/email/password data. Never double-count unlocking the gate or claim exact people/location or historical traffic. Keep provider IP processing distinct from this repository storing raw IPs.
- A separate Maratón landing/mailing-list thread is in progress. Do not claim it is integrated or move the gate to /banda/ until that integration is actually completed and authorized.
- Preview with `python3 -m http.server 8000 --bind 127.0.0.1` when the environment allows local servers.
- Run `node --test tests/*.test.mjs`, `node scripts/build.mjs`, `node scripts/check.mjs`, and `node scripts/prepare-pages.mjs`; inspect desktop/mobile layouts in a browser when available.
- The complete site navigation and content must remain usable without JavaScript. The temporary encrypted preview necessarily requires JavaScript and HTTPS (or localhost); provide a clear access-screen explanation. Respect reduced-motion preferences and keyboard navigation.
- Leave unavailable links out of visitor-facing controls. Keep unpublished lyrics hidden until real text or a verified lyric-provider link is provided. Genius search metadata is not a license to scrape lyrics.
- Do not invent release status, concert dates, booking addresses, lyrics, or streaming URLs. Confirm time-sensitive band content with the owner.
- The owner showed a successful earlier Pages deployment and correct custom-domain DNS on October 21, 2026. The last screenshot still showed TLS provisioning. The protected gate is committed in 330a42d; its live state has not been verified. The analytics update is not deployed. Do not report a local edit or commit as a published update.
- Claude conversation history is not present. Use the checked-in notes and the owner's answers as context.
