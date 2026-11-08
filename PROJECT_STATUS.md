# Project status — November 7, 2026

## Current direction

- The owner explicitly authorized the public Maratón signup landing at `/` on November 7. The general public can register without a password. **Acceso de la banda** leads to `/banda/`, where the complete site remains behind the existing password while work continues.
- Maratón is upcoming; the next single was confirmed for November 2026 on October 21. No title or release day was provided. Do not invent or advance those facts.
- Preserve the official artwork, real photography, Spanish language, black/orange/beige identity and existing static HTML/CSS/JS stack. GitHub Pages and `losinsurgentes.mx` remain the chosen hosting/domain.
- The owner supplied the Spotify description as the editorial reference: a collective, defiant band speaking from a resistance, drawing on La Resistencia. `docs/VOZ_DE_LA_BANDA.md` records the direction for future content. Keep functional and accessible instructions clear.

## Publication and package

The last confirmed push before this landing revision is `841b7bd`, containing the three email HTML templates and their guides. GitHub Actions run `42446398167` completed successfully for that SHA. The previous `af0b928` corrected the drummer's display name to **Viko IV GUERRA**.

The default `node scripts/prepare-pages.mjs` now uses `prepareLandingPages`:

- `/`: public Maratón landing with the native Brevo registration form, branding, fonts, `css/maraton.css` and deferred `js/maraton.js`.
- `/banda/`: password entry opening only the encrypted `preview.json`, which includes the complete site and its assets.
- `404.html`: branded not-found page linking to the registration landing; no form or analytics.
- `/admin/estadisticas/`: public entry linking to the authenticated Umami provider dashboard, never reports or credentials.
- No raw full-site page, editor, content JSON, band photos, templates or environment files. Default output does not contain `maraton-preview.json`.

Missing compilation password keeps signup public and omits `preview.json`; the band entry cannot reveal the site. The ignored `.env.preview-password` supplies local packaging. Actions uses the existing `PREVIEW_PASSWORD` repository secret. Never put the password in tracked files, output or command arguments.

`--gated` retains the October 28 rollback with two gates and two encrypted documents; it is no longer the default. `--public` publishes the full site and is reserved for a later, separate full-site launch authorization. The current authorization does not include that mode.

Encryption remains PBKDF2-SHA-256 (600 000 iterations), AES-GCM-256 and fresh salt/IV. The repository is public and already contains historical content. The Pages gate does not make GitHub private or provide server authentication. Decryption requires JavaScript and HTTPS or localhost.

A push to `main` automatically starts the Pages workflow. `bash scripts/publish-github.sh` additionally validates, synchronizes the ignored local password to Actions when present, pushes and dispatches a run. No manual deploy command is needed after a successful automatic run. Confirm the new SHA's build/deploy result in Actions and inspect the domain; a commit alone is not evidence of publication. This status checkpoint was written before pushing the public-landing revision.

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

The owner selected Umami Cloud Hobby, linked GitHub and supplied the real Website ID. The existing opt-in configuration is now incorporated only into the authorized public landing. Missing/disabled configuration remains disabled. No tracker is included in the band gate, 404, decrypted site or `--gated` documents.

Measurement remains restricted to the public HTTPS root of losinsurgentes.mx/www.losinsurgentes.mx, normalized URL/referrer origin, and DNT/GPC protection. Never send query/hash/form/email/password values or claim exact people/location or historical traffic. Umami's provider-side IP processing is distinct from this repository, which stores no raw IPs. Incoming dashboard activity remains unverified; do not enable public Share URLs or upgrade plans. `/admin/estadisticas/` links to provider login and implements no local account authorization.

## Collaboration and local review

Google Drive remains the chosen private band workspace: [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1). Owner ownership and editor sharing with the band account were verified earlier. Download/import/review/save/push remains the flow; no direct editor-to-Drive write or automatic Drive-to-GitHub sync exists. See `docs/GOOGLE_DRIVE.md`.

- `node scripts/preview.mjs --open`: complete local site/editor.
- `node scripts/preview.mjs --protected --open`: public signup and password-protected band package.
- `node scripts/preview.mjs --gated --open`: deliberate review of the former two-gate mode.

## Validation and remaining checks

All **69 tests**, static build, site checks, default Pages packaging and publisher Bash syntax validation passed for the public-landing revision. Tests cover the default CLI versus `--gated`, public native form fields, return links and subpaths, wrong password, missing password/configuration, stale artifact removal, output allowlist/symlink rejection and analytics exclusion from all protected/error content. Email HTML is balanced and preserves original destinations and Brevo variables. The tests use VM/provider simulations, not live browser/CORS or mail delivery.

The in-app browser backend was unavailable for desktop/mobile visual review. Published routing/content and HTTPS can be checked independently after the deployment; actual browser signup, list inclusion, email appearance/delivery and Spotify playback remain pending.

October 28 bundling regression: immediate inlining of a head-deferred script initialized Maratón before its form existed and left native POST navigation active. Bundling now reserves deferred-script slots before concurrent reads and executes them after body markup in source order. Parser-order and actual-bundled-form VM tests cover the correction.

Final lyrics, public booking email, future show details and direct YouTube links for featured singles may be added when supplied. The incomplete historical Auditorio Río 70 show stays disabled until its year is confirmed. Claude conversation history is unavailable; use the checked-in notes and owner responses.
