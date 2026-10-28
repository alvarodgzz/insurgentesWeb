# Project status — October 27, 2026

## Confirmed direction

- Preserve and polish the established Los Insurgentes identity.
- Maratón is still upcoming; the next single is planned for November 2026. No title or release day was supplied.
- Give the band a simple way to update photos and content.
- Use a personal Google Drive folder, organized by site section, for band collaboration. The owner supplied `insurgentes.mx@gmail.com` as the initial collaboration account; this is not authorization to use it as the public booking address.
- Include an on-page Spotify catalog and investigate lyric providers.
- Use GitHub account `alvarodgzz`, existing repository `insurgentesWeb`, GitHub Pages and domain `losinsurgentes.mx`.
- The owner authorized a public Maratón signup landing at / and moved the complete site's password gate to /banda/. Do not launch the complete site publicly. Keep the supplied password out of tracked files and logs.
- The owner explicitly requested subagents for parallel work.
- The owner chose Umami Cloud Hobby for analytics and linked GitHub. The owner supplied the real Website ID and local configuration is enabled. Deployment and incoming statistics remain unverified; do not request account passwords/API keys.

## Implemented locally

- Responsive design refinements, official single artwork, November announcement, band photo and contact via the existing Instagram account. No booking email was invented.
- Keyboard/mobile navigation, progressive scroll reveals, fixed-header anchor spacing and stable image dimensions.
- Accessible gallery navigation, pending animation cancellation, thumbnail fallback for photos without responsive variants, focus restoration and inert background during viewing.
- Fourteen verified Spotify releases with official artwork, a single on-page player and usable direct links. Actual playback depends on Spotify account/region.
- Lyrics rendering for band-provided text and validated Genius/Musixmatch/YouTube links. Flores links to the band's verified lyric video. Unpublished lyrics stay off the public page. Provider research and optional Genius metadata lookup are documented in `docs/LYRICS.md`; no scraped lyric text was imported.
- `content/site.json`, `releases.json` and `lyrics.json` separate content from layout.
- Twenty numbered photo files in `content/photos/`, plus `00-guia.html` identifying their roles visually. Original assets remain in `assets/`.
- Browser editor at `/admin/`: labeled photo slots, JPEG preparation, editable band/release/show/lyric/contact content, preview, shared-folder import, local text drafts, update ZIP download and optional desktop folder save.
- Static HTML generation shared between the editor and Node build. Public text does not depend on client-side JSON fetching.
- GitHub Pages workflow, public-file packaging allowlist, `.gitignore`, validation scripts, regression tests and a user-runnable first-publication script.

## Maratón landing and protected band preview

The default Pages package now publishes a public Maratón landing at / and the existing branded password gate at /banda/, reached through the corner Admin / Banda link. 404.html uses the public landing. The complete site stays in the encrypted root preview.json, with a self-contained copy of its assets. It uses PBKDF2-SHA-256 (600 000 iterations) and AES-GCM-256. Public output omits the band editor, raw photos, JSON content and templates. A deliberate exception is `/admin/estadisticas/`, a public entry page linking to the authenticated external Umami dashboard. A missing compilation password preserves the public landing and band gate but omits the encrypted full site. The local root `index.html` remains the complete site for editing.

The local ignored `.env.preview-password` supplies local builds; the publishing script synchronizes it to the Actions secret `PREVIEW_PASSWORD` when present. Actions uses that secret during packaging. Decryption needs JavaScript and HTTPS, or localhost. The explicit packaging option `--public` remains reserved for a future full-site launch, which the owner has not authorized. The public Maratón landing does not require that option.

The repository is already public, including prior source/content history. Encrypting the new Pages artifact does not remove that exposure or provide server authentication. Do not claim that all band material is private. The protected-preview implementation is committed in `330a42d`. Its current live deployment has not been verified from this environment; do not infer publication from the commit.

## Analytics

The project now supports the owner's chosen Umami Cloud Hobby account. `content/analytics.json` is now configured with the owner-supplied Website ID and `enabled: true`. It remains a local change pending deployment and verification of incoming traffic. Future reconfiguration uses `node scripts/configure-analytics.mjs WEBSITE_ID`; `--disable` stops new measurements after republishing. No account password, API key, paid subscription or public report is required.

The public `/admin/estadisticas/` entry page links to the private account dashboard at `https://cloud.umami.is`; it is not an embedded dashboard or a locally implemented admin role. The provider authorizes account access. No share URL is enabled. See `docs/ANALYTICS.md` for setup, 2FA guidance and the free plan's verified limits.

The loader measures only the public Maratón landing at the published HTTPS root on the apex/www band domain, sends a normalized root URL and referrer origin, and excludes query/hash/form/email/password data, /banda/ and admin/local/iframe/decrypted previews and DNT/GPC requests. Unlocking the encrypted preview does not count another view. Umami derives approximate location and device/browser metrics, with IP processing at the provider; this repository does not store raw visitor IPs. Metrics begin after activation and deployment, with no historical backfill; blockers, VPNs and anonymous visitor estimates limit accuracy.

## Mailing list

October 27: the owner supplied the real Brevo URL, full HTML and then Simple HTML export. `content/newsletter.json` is enabled locally. The new Simple HTML action is separately validated submitUrl; its token differs from formUrl, retained only for maintenance/legacy configuration. The owner explicitly requested removing the alternative signup control, and no provider/fallback link is now rendered. Older configurations without submitUrl still derive /serve/ from formUrl. No actual token is repeated here.

The form includes required type=email EMAIL with Spanish label/autocomplete, the supplied enabled empty email_address_check honeypot hidden from interaction, hidden locale=es and html_type=simple. Fields and action match the supplied export. Native same-tab POST remains the no-JavaScript fallback without Brevo CSS, Roboto or SDK; noscript explains it may open provider JSON. At the owner's request, js/maraton.js progressively sends URLSearchParams(FormData) to the same action with no cookies/referrer and renders pending, success, error or uncertain outcomes inline. Success requires HTTP ok and JSON success === true; duplicate pending/completed sends are blocked, failure preserves input, and no automatic retry occurs. No form values go to storage, logs or analytics. Provider step-5 messages and hosted pages are not promised. Visible consent copy does not establish a provider consent record.

The local design is implemented. The agent did not edit the account. The owner's screenshot shows Simple confirmation email selected, and the owner supplied its Simple HTML export. Final saving, Maratón list selection, consent recording, welcome template selection/delivery, sender and replies setup remain unverified. The screenshot shows Gmail as sender with Brevo's domain-substitution warning; no own-domain sender setup is confirmed. docs/BREVO_TEXTOS.md and the welcome HTML are prepared imports, not verified installed configuration. If the provider form gains CAPTCHA or other required fields, refresh this integration from its new export.

The owner showed an actual provider JSON response with success:true from their test. This does not verify list inclusion, welcome delivery, deployed URL/SHA or the new inline flow. Actual CORS and inline browser UX remain unverified: DNS restrictions blocked remote checks and the in-app browser was unavailable. Plugin search returned no Brevo connection here; Brevo documents an official ChatGPT plugin for drafts, but no account access is established. The agent made no provider edits, purchases or sends. Disabled/missing configuration still renders registration-soon; --disable removes the form after republishing without deleting contacts. See docs/MAILING_LIST.md.

October 27 email research: docs/EMAIL_PLAN.md documents HTML import, sender/domain setup, plan limits and integration choices with primary sources. The owner chose Simple confirmation: direct subscription and one welcome email, without a validation click or final-confirmation follow-up. Use docs/email-bienvenida-maraton.html for Default Template Simple confirmation; its copy describes registration without claiming a verification click. The DOI draft remains unused. Drafts received static checks, but installation, delivery and Gmail rendering are unverified. The agent did not send them or edit provider configuration.

## How to review

Run `node scripts/preview.mjs --open` or double-click `start.command`. The editor opens at `http://127.0.0.1:8000/admin/`; the complete local site is at `/`. To review only the protected Pages package, use `node scripts/preview.mjs --protected --open`; this mode serves the Maratón landing at / and password gate at /banda/, without the editor or raw full-site content.

## Validation

Latest inline UX validation: all 60 tests pass, together with build, site checks and protected packaging. The seven new VM tests cover real-response success semantics, failures, uncertain outcomes, duplicate prevention and request privacy; these simulate the provider rather than using a browser or real POST. The four-field contract, trusted submitUrl, no-referrer and /banda/ separation remain requirements. Browser access was unavailable and a read-only OPTIONS check could not resolve the provider host. The owner's native success screenshot is separate evidence; actual inline CORS, welcome delivery and deployed SHA remain unverified.

Earlier iframe and native-form revisions passed their local checks. Email drafts preserve provider variables and contain no JavaScript or forms. The owner chose Simple confirmation; list/consent settings, installed welcome design, delivery and exact deployment remain unverified despite the supplied provider success response.

Content/rendering/ZIP/packaging tests and simulated navigation/gallery/access interaction tests pass. New coverage verifies authenticated encryption, wrong passwords, tampering, retries, missing passwords, removal of raw content and local asset bundling. Generated HTML, assets, fragment targets, accessibility names, editor references and JavaScript syntax have been checked. The publish script passes Bash syntax validation.

The in-app browser backend was unavailable, and the sandbox blocked a local preview server. Desktop/mobile browser layout and actual Spotify playback remain unverified. The interaction tests use a small simulated DOM, not a browser.

## Remaining external steps

- October 23 publication attempt: all 36 tests, content/site checks and protected packaging passed. The publisher stopped at the GitHub account check because this environment could not connect to `api.github.com`, before Git changes, secret synchronization or deployment. Public-domain checks were also unavailable; no current TLS or deployment status was verified.
- The owner completed GitHub CLI login as `alvarodgzz`. This session cannot reach `api.github.com` or write Git metadata. A token-invalid message while the API is unreachable is inconclusive; do not request another login on that evidence alone.
- The owner's terminal created the public repository, configured `origin` and `main`, and ultimately pushed successfully after an initial HTTP 400. Local tracking recorded `3c68a92` on both `main` and `origin/main`; screenshots confirm an earlier Pages deployment. Do not recreate the repository or add the remote again.
- Commit `330a42d` contains the earlier protected preview; the current deployed URL/SHA is unverified. The owner showed the signup design and a provider JSON success, but the new inline response UX is local and not browser verified. Umami and Brevo have real identifiers configured locally; incoming statistics, list inclusion and welcome delivery remain unverified. Run `bash scripts/publish-github.sh` from the owner's normal terminal for reviewed changes. It validates, synchronizes the local password file to Actions when present, pushes, verifies the remote SHA, preserves domain settings and requests deployment. Verify the new landing, inline response, /banda/ gate and Umami on the real domain. Test Simple confirmation for direct list inclusion and exactly one welcome; do not infer these from the provider JSON alone.
- The owner configured `losinsurgentes.mx` in GitHub Pages. Their terminal confirmed all four GitHub Pages A records and `www` CNAME to `alvarodgzz.github.io`, with no apex AAAA record. The latest screenshot showed successful DNS checks and TLS provisioning, not a completed certificate. Once issuance finishes, enable Enforce HTTPS and verify both apex and www. Do not restore Squarespace Defaults.
- Google Drive is the chosen shared workspace. The created folder is [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1); it uses numbered site sections and stable photo filenames. The owner account remains owner, and the band account supplied in chat has verified editor access. See `docs/GOOGLE_DRIVE.md`. No automatic cloud-to-GitHub synchronization or direct editor-to-Drive save is connected. A designated person reviews, imports, saves and publishes.
- Browser QA and live verification of the password gate remain required. Do not describe a future public launch as complete.

## Additional content

Final lyrics, booking email, future show details and direct YouTube links for featured singles can be added in the editor. The incomplete historical Auditorio Río 70 date remains saved as a disabled draft until its year is confirmed.
