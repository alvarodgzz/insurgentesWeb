# Los Insurgentes website

## Project

Official Spanish-language website for Los Insurgentes, a rock band from Monterrey, Nuevo León. Work in this checkout; the site uses plain HTML, CSS, and JavaScript with a dependency-free Node content generator.

- `index.html`: generated complete page for local editing; edit content/template sources and rebuild. The default Pages artifact temporarily gates both the Maratón landing at / and the complete site at /banda/.
- `content/site.json`, `releases.json`, `lyrics.json`: editable band content.
- `content/photos/`: numbered, replaceable photo slots.
- `templates/page.html`, `js/*-render.mjs`: static rendering shared with the editor.
- `admin/`: browser-based band editor; saves local files or downloads an update, never writes remotely. `admin/estadisticas/` is a separate public entry page linking to the authenticated Umami Cloud dashboard.
- `templates/maraton.html`, `css/maraton.css`: Maratón signup landing, currently bundled into its encrypted preview.
- `content/newsletter.json`, `js/newsletter-render.mjs`: Brevo native signup form configuration/rendering; see `docs/MAILING_LIST.md`.
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
- Current phase: the owner temporarily restored password access to the Maratón landing/signup while resolving welcome emails reaching spam. Default Pages / and 404.html show the branded gate to maraton-preview.json; /banda/ gates the full site in preview.json. Both self-contained payloads use the existing local/Actions password, and access.js accepts only those two payload names. Do not publish raw landing/form/Brevo URLs, maraton CSS/JS, full-site content/photos or editor routes in `_site/`. Missing password must publish gates only and omit both payloads. The /admin/estadisticas/ exception remains only its public entry page and styling, never reports, credentials or analytics data. `--public` remains reserved for an explicitly authorized full-site launch. The provider-hosted Brevo form is external to this gate and is not disabled by it.
- Keep the password out of tracked files, logs and docs. Local `.env.preview-password` is ignored; Actions uses repository secret `PREVIEW_PASSWORD`. The public repository already contains content in its history; encrypted Pages packaging does not make that repository private. Do not claim server authentication or complete confidentiality.
- The user chose a new folder in their personal Google Drive, organized by page section and shared with the band. The folder is created and editor sharing with the band account supplied in chat is verified; see the Drive guide. Preserve private Drive access. The band collaboration email was not designated as the site's public contact.
- Drive currently uses a review-and-publish flow: download the shared folder, import into the editor, review, save/export the canonical files, and publish through GitHub. Neither direct editor-to-Drive saving nor automatic Drive-to-GitHub sync is configured.
- Confirmed October 21, 2026: Maratón is upcoming; next single is November 2026. Polish the existing design and prepare launch. Do not invent the single's title or release day.
- User explicitly authorized subagents for independent tasks.
- The owner chose Umami Cloud Hobby and linked GitHub. The owner supplied the real Website ID and analytics is enabled locally in content/analytics.json; deployment and incoming traffic are still unverified. Missing configuration must continue to default to disabled. Do not invent IDs, request account passwords/API keys, enable public reports/Share URLs or upgrade plans. `/admin/estadisticas/` links to the provider login; it does not implement local admin authorization.
- While both previews are gated, inject no analytics into the gates or encrypted Maratón preview and track neither gate nor decrypted views. Retain analytics configuration for a later explicitly authorized public landing. Any future measurement remains limited to the public HTTPS root on losinsurgentes.mx/www.losinsurgentes.mx, normalized URL/referrer origin and DNT/GPC protection; never send query/hash/form/email/password data or claim exact people/location or historical traffic. Keep provider IP processing distinct from this repository storing raw IPs.
- October 27: the owner supplied the real Brevo URL, full HTML and then Simple HTML export. content/newsletter.json is enabled locally. Keep a native form with same-tab POST to separately validated submitUrl from the latest Simple HTML action (its token differs from the hosted URL), EMAIL required type=email with Spanish label/autocomplete, empty enabled email_address_check honeypot hidden from interaction, hidden locale=es and html_type=simple. The owner explicitly removed the alternative signup control: retain formUrl for maintenance/legacy configuration only, never render its provider/fallback link. If submitUrl is absent, legacy configurations normalize formUrl to /serve/. Accept only known HTTPS sibforms.com hosts with /serve/ or /v2/serve/ tokens and optional trailing = padding; reject credentials, ports, query/hash for both URLs. Do not repeat real tokens in docs/logs. Missing/disabled config still renders the clear coming-soon state.
- Native submission remains the no-JavaScript fallback without Brevo SDK/CSS/Roboto; it may open provider JSON, explained by noscript copy. At the owner's request, js/maraton.js progressively submits URLSearchParams(FormData) in place with no cookies/referrer, storage or analytics. Show success only after HTTP ok and JSON success === true; handle pending, errors and uncertain network/CORS/timeout outcomes, block duplicate pending/completed sends and never automatically retry. The owner's screenshot demonstrates a provider success:true response from their test, not list inclusion, welcome delivery, the new inline flow or a verified deploy SHA. Actual browser CORS and inline UX remain unverified. Never add unmapped consent fields or claim visible consent text proves a provider consent record. Keep root no-referrer protection. If CAPTCHA or new required provider fields are added, refresh the integration from its new export.
- The owner explicitly chose Simple confirmation on October 27: direct subscription with one welcome email, without a confirmation click or final-confirmation follow-up. Use docs/email-bienvenida-maraton.html for Simple confirmation email. The DOI draft is an unused alternative. The owner reports that the welcome arrived in spam; sender/domain authentication is pending. That does not verify the installed template identity, Maratón list membership, recorded consent or exact deployment. The agent changed local files, not the Brevo account. docs/BREVO_TEXTOS.md provides prepared imports, not verified provider configuration. The band account is for administration/replies, not public booking. Never embed API keys, add list data to Git/Drive, buy a plan, create accounts or send campaigns without explicit authorization.
- Preview with `python3 -m http.server 8000 --bind 127.0.0.1` when the environment allows local servers.
- Run `node --test tests/*.test.mjs`, `node scripts/build.mjs`, `node scripts/check.mjs`, and `node scripts/prepare-pages.mjs`; inspect desktop/mobile layouts in a browser when available.
- The complete site navigation and content must remain usable without JavaScript. The temporary encrypted preview necessarily requires JavaScript and HTTPS (or localhost); provide a clear access-screen explanation. Respect reduced-motion preferences and keyboard navigation.
- Leave unavailable links out of visitor-facing controls. Keep unpublished lyrics hidden until real text or a verified lyric-provider link is provided. Genius search metadata is not a license to scrape lyrics.
- Do not invent release status, concert dates, booking addresses, lyrics, or streaming URLs. Confirm time-sensitive band content with the owner.
- The owner showed a successful earlier Pages deployment and correct custom-domain DNS on October 21, 2026. The last screenshot still showed TLS provisioning. The protected gate is committed in 330a42d; its live state has not been verified. The analytics update is not deployed. Do not report a local edit or commit as a published update.
- Claude conversation history is not present. Use the checked-in notes and the owner's answers as context.
