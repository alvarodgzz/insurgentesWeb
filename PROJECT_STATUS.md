# Project status — November 24, 2026

## Combined Maratón landing and optional signup

The homepage offers two actions in the first viewport. “Quiero enterarme más” focuses the email field at `/#registro`. The large animated official skull opens `/sitio/`. The site links to the same native form at `/registro/`. Both routes support native navigation and submission without JavaScript. The slogan is **Esa calavera que ya viene por ti...**.

The initial public launch at `79e4484` was deployed by successful Pages run `45321777839`. Live checks covered mobile and desktop entry, gallery dismissal and excluded private paths. For the combined homepage, 78 Node tests and local Chromium QA passed, including both actions at 320 × 568, keyboard focus, reduced motion and simulated registration. Automated QA sends no real signup or email.

## November 23 banner, navigation and gallery corrections prepared before public launch

The owner requested one orange entry skull in the private banner, a legible header logo and a working gallery close control with no visible photo descriptions. The banner now has one centered entry; other destinations are deferred. The supplied navigation wordmark is enlarged to 58 px image height on desktop and 52 px on mobile. Gallery image alt text and navigation controls remain; visible captions are removed.

The closing bug was reproduced in the actual generated protected document at desktop/mobile sizes: `#band-site` contained the lightbox and became inert when opening it, blocking click/tap on the X while document-level arrow keys still worked. The dialog is now moved to body before initialization. Each open captures current background siblings, including the preview lock button injected after deferred scripts, and restores their previous inert states on close. The private lock button is also hidden while the gallery is open.

All 71 Node tests, build, checks, default packaging and local Chromium QA passed. The revised browser suite tests the decrypted gallery at 320/390/768/820/1024/1440 px with actual tap/click on X, backdrop, Escape, focus trapping/return and background/scroll restoration. Desktop/mobile captures were reviewed. Removed three obsolete shortcut tests and added a wrapped-modal regression; Linux CI still requires Chromium and WebKit before deployment. Registration is unchanged; no real registration/email was sent. Publication of this correction must be confirmed from its Actions run.

The preceding four-photo update and HTTPS archive fix were deployed as `fe2a446` by successful Pages run `45317446487`. Live checks verified all four current image bytes inside the encrypted document, raw photo URLs returning 404 and unchanged public registration.

## November 23 Drive photo import

The owner replaced four photographs in the existing private Drive section folders: Inicio, La banda, and gallery slots 11 and 12. Those uploads did not update GitHub or Pages because automatic Drive sync is not configured. The four verified JPEGs were downloaded through the Drive connector and prepared as proportional JPEG web copies with a 2000 px maximum edge, leaving the Drive originals unchanged. Uppercase `.JPG` source filenames were mapped to the existing lowercase canonical paths; unrelated content and photographs were retained. Dimensions and accessible descriptions now match the new photographs. No layout, registration, banner, sharing or provider settings were changed.

All 73 Node tests, build, checks and default Pages preparation passed locally. Local Chromium passed the existing isolated responsive/gate/signup suite; additional photo checks verified La banda and the two replacement gallery images/lightboxes at 320, 390, 768 and 1440 px, including dimensions, captions and Escape. Desktop/mobile captures were visually reviewed and remain in the ignored local storyboard. Publication must be confirmed from the corresponding Actions run and the deployed encrypted payload. Future updates still require import/review/push; rerunning a deploy alone cannot pick up Drive changes. See `docs/GOOGLE_DRIVE.md`.

The preceding private banner revision `645c677` was published by successful Pages run `43371519761`, with live encrypted-banner and unchanged-registration checks recorded in the conversation.

Photo import commit `f9324a3` reached GitHub. The first two attempts of run `45315875793` were manually stopped during slow regional Ubuntu dependency downloads, before either browser test began or any artifact was uploaded. The workflow now uses the official Ubuntu HTTPS archive in its temporary runner mirror list and bounds browser installation/QA to ten minutes; all existing checks and both browsers remain required. See `docs/BROWSER_QA.md`. This is a CI download correction, not a website hosting change.

## Historical November 12 private banner revision

Registration is approved and remains unchanged. The owner rejected the private banner's paper background, oversized Maratón and small entry control, supplying a Geese screenshot as a composition reference. The private banner now uses black, the prominent original white band logo, a smaller album wordmark and four official skull/stamp objects. The orange **Entrar al sitio** control opens the existing site; Música, Galería and En vivo open and focus their corresponding sections. Mobile uses two columns. The four cropped/downscaled object exports preserve the original artwork and are bundled only inside the encrypted document, never exposed as raw Pages files. No source artwork was sent to image-generation services.

All 73 Node tests pass locally. Local Chromium checks cover whole logos/objects, touch labels and main entry visibility at 320 × 568, 320 × 844, 390 × 844, 768 × 1000 and 1440 × 900; all three shortcuts pass keyboard/focus/scroll checks. Desktop/mobile captures were visually reviewed. Public signup retains its existing six-width, simulated submission and no-JavaScript checks. WebKit remains required in Linux CI before deployment; local macOS WebKit is not claimed as verified. No real registration or email was sent.

## Historical November 12 responsive checks

The owner reported a giant clipped initial on mobile and requested browser tests before visual changes are pushed. Fresh published Chromium checks at 320/390/430/768 px showed the complete wordmark; the report was not reproduced in that clean load. The heading now also constrains oversized images and older markup, and its CSS URL is versioned to request the current styles.

`scripts/qa-browser.mjs` provides isolated Playwright layout/navigation/form checks and a local `_qa/index.html` storyboard. It catches a deliberate giant-image regression even when document overflow is hidden. Chromium passed locally across 320, 360, 390, 430, 768 and 1440 px, including private password/banner/site and simulated signup. Local WebKit hung at startup on this macOS and is not claimed as passed; Linux CI requires both Chromium and WebKit before upload/deployment. External traffic is blocked and no real signup/email is sent. Runtime configs and production ciphertext are fingerprinted to ensure QA does not replace them with synthetic fixtures. The source package, private screenshots and reports are never published. See `docs/BROWSER_QA.md`.

## Historical November 12 branding revision

The owner supplied the registered Maratón branding and authorized a creative blend with the original band identity, exclusively for this project. Original folder/ZIP remain local and ignored. Four proportional web exports preserve the supplied artwork; their provenance and usage restrictions are in `docs/MARATON_BRANDING.md`.

The first poster-style signup revision was rejected by the owner. The correction restores the original black landing and dark form, updating only its album wordmark. After the band password, an independent full-screen album banner now precedes the complete site, with an Enter link. The banner is included inside preview.json and has no separate public HTML/CSS/JS route. Signup keeps the same native form, fields, script, privacy behavior and public route. The protected site uses the official album wordmark, and all three email HTML templates add an album-stamp strip while retaining their original masthead. No Brevo template was installed or email sent by the agent.

All 70 tests passed for this correction. Local Chrome additionally verified the actual password gate → banner → unchanged site flow, including focus transfer and no horizontal overflow. No signup or email was sent. Desktop, tablet and mobile local Chrome checks confirmed asset loading and no horizontal page overflow at 1440, 768, 390 and 320 px. These are local layout checks, not a provider submission/CORS or email-client delivery test. Publication of this revision must be verified from its Actions run after pushing; the earlier confirmed public launch remains recorded below.

## Current direction

- The owner explicitly authorized the full public launch on November 23: banner at `/`, complete website at `/sitio/`, optional registration at `/registro/`, and `/banda/` redirecting to the public site. The November 7 signup-only/protected-band authorization is historical; its package remains a deliberate rollback mode.
- The owner confirmed “Viejo Lobo de Mar” as the next Maratón single, due Thursday, November 26, 2026. The official pre-save is https://ffm.to/viejolobo.
- Preserve the official artwork, real photography, Spanish language, black/orange/beige identity and existing static HTML/CSS/JS stack. GitHub Pages and `losinsurgentes.mx` remain the chosen hosting/domain.
- The owner supplied the Spotify description as the editorial reference: a collective, defiant band speaking from a resistance, drawing on La Resistencia. `docs/VOZ_DE_LA_BANDA.md` records the direction for future content. Keep functional and accessible instructions clear.

## Publication and package

Historical November 7 publication: the signup-only implementation was committed and pushed in **`456f7b2`**, with successful Pages run **`42446937743`**. Live HTTPS checks confirmed public signup on apex/www, `/banda/` password gate, published assets, private-file 404s and local decryption of the deployed band payload with the existing password; an incorrect password was rejected. No registration or email was sent.

The preceding `841b7bd` contains the three email HTML templates and their guides. GitHub Actions run `42446398167` completed successfully for that SHA. The previous `af0b928` corrected the drummer's display name to **Viko IV GUERRA**.

The authorized default `node scripts/prepare-pages.mjs` now prepares the public banner/site/optional-signup flow. `--public` is an alias:

- `/`: Maratón banner with direct skull entry and **Quiero enterarme más** linking to its inline signup.
- `/sitio/`: complete public website; no password, forced registration or hidden preview wrapper.
- `/registro/`: optional native Brevo signup with the existing visual design and clear entry back to the website.
- `/banda/`: compatibility redirect to `/sitio/`.
- `404.html`: branded not-found page with no form or analytics.
- `/admin/estadisticas/`: public entry linking to the authenticated Umami provider dashboard, never reports or credentials.
- Used website resources and photographs are public; editor, content/config JSON, templates, original branding material, environment files and encrypted preview JSON are omitted.

The public default does not need a compilation password. The ignored `.env.preview-password` and repository secret `PREVIEW_PASSWORD` remain only for deliberate protected rollback modes. Never put their value in tracked files, output or command arguments.

`--signup-only` restores the former public-signup root and protected `/banda/` package. Missing password in that mode keeps signup public and omits `preview.json`. `--gated` retains the historical two-gate package and omits both encrypted documents when a password is missing. Encryption remains PBKDF2-SHA-256 (600 000 iterations), AES-GCM-256 and fresh salt/IV; these modes require JavaScript and HTTPS or localhost. The repository is public and its historical content is not made private by encryption.

A push to `main` automatically starts the Pages workflow. `bash scripts/publish-github.sh` validates, pushes and dispatches a run; no manual deploy command is needed after a successful automatic run. Confirm the new SHA's build/deploy result and the domain routes. Neither a local edit nor a commit proves that the new launch is published.

## Implemented site

- Responsive identity and layouts, official single artwork, November announcement and real band photography. Contact uses the band's existing Instagram; no public booking address was invented.
- Keyboard/mobile navigation, reduced-motion support, progressive reveals, header anchor spacing and accessible gallery navigation/focus handling.
- Fourteen verified Spotify releases with official artwork, one on-page player and direct links. Actual playback depends on account/region.
- Lyrics supplied by the band or validated provider links. Flores links to the verified lyric video. Missing lyrics stay hidden; no scraped lyric text was imported.
- Editable canonical content in `content/site.json`, `content/releases.json` and `content/lyrics.json`; twenty numbered photo slots and a visual map.
- Local browser editor: labeled photo preparation, content editing, preview, shared-folder import, local drafts, ZIP export and optional desktop folder save. The editor is not published in Pages.
- The November 7 editorial revision applies the approved resistance voice to landing, gate, biography and section copy. Names, roles, release facts, links, form fields and accessibility instructions retain their meaning.

## Mailing list and email

The enabled `content/newsletter.json` uses the owner's Simple HTML export. `submitUrl` is the separately validated POST action; `formUrl` remains maintenance/legacy configuration and is never rendered as an alternative signup link. Do not repeat real tokens in docs/logs. Allowed destinations are known HTTPS sibforms.com hosts with `/serve/` or `/v2/serve/` tokens and optional trailing padding, without credentials, ports, query or hash.

The native same-tab POST sends required email `EMAIL`, empty hidden `email_address_check`, `locale=es` and `html_type=simple`. It works without JavaScript, though the provider may display JSON. The progressive script sends URLSearchParams(FormData) without cookies/referrer and displays pending, success, rejection or uncertain outcomes inline. Success requires HTTP ok and JSON `success === true`. Duplicate pending/completed sends are blocked; no automatic retry or storage/logging/analytics of form values occurs. Visible consent text does not prove a provider consent record.

The owner chose **Simple confirmation**: direct subscription and one welcome, with no confirmation click or final follow-up. Use `docs/email-bienvenida-maraton.html`. The DOI draft is unused; campaign HTML is a base with visible placeholders, not an authorized send.

All three email templates use the official white wordmark and orange skull in a comunicado header. The skull scales to 144 px. Welcome subject: **Tu señal llegó — Los Insurgentes**. The owner supplied the exact closing **Esa calavera que ya viene por ti…** and reported installing the updated welcome in Brevo on November 7. Appearance and delivery of this revision remain unverified. Both public image URLs returned HTTPS 200 and image/png on November 7. The agent edited no provider settings and sent no email.

October 28 screenshots confirmed the domain Authenticated/Branded and **Los Insurgentes <laresistencia@losinsurgentes.mx>** Verified with DKIM/DMARC. The owner reported selecting that sender and `insurgentes.mx@gmail.com` Reply-To, then receiving the next welcome in Gmail Updates rather than spam. That one test does not establish universal delivery. These provider changes need no website deploy and neither address was designated public booking.

Actual CORS/browser signup, Maratón list inclusion, consent recording and new email rendering/delivery still require a real end-to-end test. Refresh the integration if Brevo adds CAPTCHA or required fields. Keep contacts in Brevo; no list data, API keys, campaign sends, purchases or account creation without explicit authorization. See `docs/MAILING_LIST.md` and `docs/BREVO_TEXTOS.md`.

## Analytics

The owner selected Umami Cloud Hobby, linked GitHub and supplied the real Website ID. The existing opt-in configuration applies only to the authorized public HTTPS root banner. Missing/disabled configuration remains disabled. No tracker is included on `/sitio/`, `/registro/`, the compatibility redirect, 404, rollback gates or decrypted rollback documents.

Measurement remains restricted to the public HTTPS root of losinsurgentes.mx/www.losinsurgentes.mx, normalized URL/referrer origin, and DNT/GPC protection. Never send query/hash/form/email/password values or claim exact people/location or historical traffic. Umami's provider-side IP processing is distinct from this repository, which stores no raw IPs. Incoming dashboard activity remains unverified; do not enable public Share URLs or upgrade plans. `/admin/estadisticas/` links to provider login and implements no local account authorization.

## Collaboration and local review

Google Drive remains the chosen private band workspace: [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1). Owner ownership and editor sharing with the band account were verified earlier. Download/import/review/save/push remains the flow; no direct editor-to-Drive write or automatic Drive-to-GitHub sync exists. See `docs/GOOGLE_DRIVE.md`.

- `node scripts/preview.mjs --open`: complete local site/editor.
- `node scripts/preview.mjs --public --open`: public banner, site and optional signup package.
- `node scripts/preview.mjs --protected --open`: former signup-at-root/protected-band package for deliberate rollback.
- `node scripts/preview.mjs --gated --open`: deliberate review of the former two-gate mode.

## Validation and remaining checks

Historical public-signup revision: all **69 tests**, static build, site checks, its default Pages packaging and publisher Bash syntax validation passed. Tests cover the default CLI versus `--gated`, public native form fields, return links and subpaths, wrong password, missing password/configuration, stale artifact removal, output allowlist/symlink rejection and analytics exclusion from all protected/error content. Email HTML is balanced and preserves original destinations and Brevo variables. The tests use VM/provider simulations, not live browser/CORS or mail delivery.

The in-app browser backend was unavailable for desktop/mobile visual review; standalone Chromium was subsequently used for the local checks recorded above. Published routing/content, HTTPS and decryption of the historical protected payload were verified after its deployment. Actual browser signup, list inclusion, email appearance/delivery and Spotify playback remain pending.

October 28 bundling regression: immediate inlining of a head-deferred script initialized Maratón before its form existed and left native POST navigation active. Bundling now reserves deferred-script slots before concurrent reads and executes them after body markup in source order. Parser-order and actual-bundled-form VM tests cover the correction.

Final lyrics, public booking email, future show details and direct YouTube links for featured singles may be added when supplied. The incomplete historical Auditorio Río 70 show stays disabled until its year is confirmed. Claude conversation history is unavailable; use the checked-in notes and owner responses.
