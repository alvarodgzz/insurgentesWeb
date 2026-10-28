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

October 27: the owner supplied the real Brevo URL, full HTML and then Simple HTML export. `content/newsletter.json` is enabled locally. The branded landing submits a same-tab native POST to the new Simple HTML action saved as separately validated submitUrl. Its token differs from the original hosted formUrl, which remains the fallback. Older configurations without submitUrl still derive /serve/ from formUrl. No actual token is repeated here.

The form includes required type=email EMAIL with Spanish label/autocomplete, the supplied enabled empty email_address_check honeypot hidden from interaction, hidden locale=es and the exported html_type=simple. The current field contract and POST target have been compared with the supplied Simple HTML. The implementation submits natively without remote Brevo CSS, Roboto or SDK; real server behavior remains unverified. The provider warning excludes hosted confirmation pages and step-5 messages requiring JavaScript in this mode; do not promise those on the landing. There is no fake local success. Visible Spanish purpose/consent copy does not establish a provider-side consent record, and no unmapped consent field was added. The landing keeps no-referrer protection; Umami does not capture form/email data.

The local design is implemented. The agent did not edit the account. The owner's screenshot shows Simple confirmation email selected, and the owner supplied its Simple HTML export. Final saving, Maratón list selection, consent recording, welcome template selection/delivery, sender and replies setup remain unverified. The screenshot shows Gmail as sender with Brevo's domain-substitution warning; no own-domain sender setup is confirmed. docs/BREVO_TEXTOS.md and the welcome HTML are prepared imports, not verified installed configuration. If the provider form gains CAPTCHA or other required fields, refresh this integration from its new export.

Remote registration and deployment are not verified. Connectivity/DNS restrictions blocked remote checks, the in-app browser backend was unavailable and plugin search returned no Brevo connection here. Brevo does document an official ChatGPT plugin supporting saved drafts; availability in this session is not established. No provider account edits, account creation, purchase or campaigns were performed. The disabled/missing-configuration fallback remains a clear registration-soon state; --disable removes the form after republishing without deleting provider contacts. See docs/MAILING_LIST.md.

October 27 email research: docs/EMAIL_PLAN.md documents HTML import, sender/domain setup, plan limits and integration choices with primary sources. After reviewing options, the owner explicitly chose Simple confirmation: direct subscription and one welcome email, without a validation click or final-confirmation follow-up. Use docs/email-bienvenida-maraton.html for Default Template Simple confirmation; its copy now describes registration without claiming a verification click. The DOI draft remains an unused alternative. Drafts are statically checked, not installed, sent or rendered in Gmail. Provider configuration is unverified.

## How to review

Run `node scripts/preview.mjs --open` or double-click `start.command`. The editor opens at `http://127.0.0.1:8000/admin/`; the complete local site is at `/`. To review only the protected Pages package, use `node scripts/preview.mjs --protected --open`; this mode serves the Maratón landing at / and password gate at /banda/, without the editor or raw full-site content.

## Validation

Latest Simple HTML validation: all 53 tests pass, along with build, site checks and protected packaging. The generated Maratón page was checked for the exact newly supplied POST destination, unchanged original hosted fallback, exactly EMAIL/honeypot/locale/html_type fields, Spanish locale, html_type=simple, no-referrer and preserved /banda/ separation. Unsafe explicit submitUrl destinations are covered, and no raw full-site content or editor is packaged. No remote signup, welcome delivery or live deployment was verified.

The earlier October 27 iframe integration passed 50 tests, build, site checks and protected packaging. It was replaced by the native-form integration, whose 51-test local validation is recorded above. Email drafts preserve provider variables and contain no JavaScript or forms. No remote form submission, Brevo list/consent/double-opt-in configuration or live deployment has been verified.

Content/rendering/ZIP/packaging tests and simulated navigation/gallery/access interaction tests pass. New coverage verifies authenticated encryption, wrong passwords, tampering, retries, missing passwords, removal of raw content and local asset bundling. Generated HTML, assets, fragment targets, accessibility names, editor references and JavaScript syntax have been checked. The publish script passes Bash syntax validation.

The in-app browser backend was unavailable, and the sandbox blocked a local preview server. Desktop/mobile browser layout and actual Spotify playback remain unverified. The interaction tests use a small simulated DOM, not a browser.

## Remaining external steps

- October 23 publication attempt: all 36 tests, content/site checks and protected packaging passed. The publisher stopped at the GitHub account check because this environment could not connect to `api.github.com`, before Git changes, secret synchronization or deployment. Public-domain checks were also unavailable; no current TLS or deployment status was verified.
- The owner completed GitHub CLI login as `alvarodgzz`. This session cannot reach `api.github.com` or write Git metadata. A token-invalid message while the API is unreachable is inconclusive; do not request another login on that evidence alone.
- The owner's terminal created the public repository, configured `origin` and `main`, and ultimately pushed successfully after an initial HTTP 400. Local tracking recorded `3c68a92` on both `main` and `origin/main`; screenshots confirm an earlier Pages deployment. Do not recreate the repository or add the remote again.
- Commit `330a42d` contains the earlier protected preview; current live deployment remains unverified. The analytics and Maratón landing updates are local and not verified as deployed. Umami has the real Website ID and is enabled locally; Brevo now has the real hosted form URL and is enabled locally; its provider configuration and real registrations remain unverified. Run `bash scripts/publish-github.sh` from the owner's normal terminal to publish the reviewed changes. The script validates, synchronizes the local password file to the repository Actions secret when present, pushes, verifies the remote SHA, preserves existing domain settings and requests deployment. Wait for the new Actions run and verify the Maratón landing, /banda/ gate, rejected wrong password, correct private access and incoming Umami traffic on the real domain. Review the Brevo form/list settings and test the confirmation flow; do not infer double opt-in or successful registration from the HTML integration alone.
- The owner configured `losinsurgentes.mx` in GitHub Pages. Their terminal confirmed all four GitHub Pages A records and `www` CNAME to `alvarodgzz.github.io`, with no apex AAAA record. The latest screenshot showed successful DNS checks and TLS provisioning, not a completed certificate. Once issuance finishes, enable Enforce HTTPS and verify both apex and www. Do not restore Squarespace Defaults.
- Google Drive is the chosen shared workspace. The created folder is [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1); it uses numbered site sections and stable photo filenames. The owner account remains owner, and the band account supplied in chat has verified editor access. See `docs/GOOGLE_DRIVE.md`. No automatic cloud-to-GitHub synchronization or direct editor-to-Drive save is connected. A designated person reviews, imports, saves and publishes.
- Browser QA and live verification of the password gate remain required. Do not describe a future public launch as complete.

## Additional content

Final lyrics, booking email, future show details and direct YouTube links for featured singles can be added in the editor. The incomplete historical Auditorio Río 70 date remains saved as a disabled draft until its year is confirmed.
