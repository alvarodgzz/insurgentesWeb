# Project status — October 28, 2026

## Confirmed direction

- Preserve and polish the established Los Insurgentes identity.
- Maratón is still upcoming; the next single is planned for November 2026. No title or release day was supplied.
- Give the band a simple way to update photos and content.
- Use a personal Google Drive folder, organized by site section, for band collaboration. The owner supplied `insurgentes.mx@gmail.com` as the initial collaboration account; this is not authorization to use it as the public booking address.
- Include an on-page Spotify catalog and investigate lyric providers.
- Use GitHub account `alvarodgzz`, existing repository `insurgentesWeb`, GitHub Pages and domain `losinsurgentes.mx`.
- The owner temporarily restored the password gate for Maratón/signup while resolving welcome emails arriving in spam. `/` and `404.html` gate Maratón; `/banda/` continues gating the complete site. Use the existing password and keep it out of tracked files/logs. Neither view is authorized for public launch now.
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

The default Pages package now publishes the branded gate at `/` and `404.html`, opening encrypted `maraton-preview.json`; `/banda/` opens the complete site in `preview.json`. Both self-contained documents use the existing password with fresh salt/IV, PBKDF2-SHA-256 (600 000 iterations) and AES-GCM-256. `access.js` accepts only those two payload names. Public output omits the raw form/Brevo URL, Maratón CSS/JS, band editor, raw photos, JSON content and templates. `/admin/estadisticas/` remains an entry shell linking to authenticated Umami. Missing compilation password publishes gates only and omits both payloads. Local root `index.html` remains the complete site for editing.

The ignored `.env.preview-password` supplies local builds; the publisher synchronizes it to Actions secret `PREVIEW_PASSWORD` when present. Decryption needs JavaScript and HTTPS, or localhost. `--public` remains reserved for an explicitly authorized full-site launch. Restoring public Maratón also requires a later owner decision. This gate does not disable or protect the independent provider-hosted Brevo form.

The repository is already public, including prior source/content history. Encrypting the new Pages artifact does not remove that exposure or provide server authentication. Do not claim that all band material is private. The protected-preview implementation is committed in `330a42d`. Its current live deployment has not been verified from this environment; do not infer publication from the commit.

## Analytics

The owner's Umami Cloud Hobby Website ID and configuration are retained, but the current protected package injects no analytics into the gates or encrypted Maratón document and measures no gated/decrypted views. The public landing's future restoration and tracking require explicit authorization and verification. No account password, API key, paid subscription or public report is required.

The public `/admin/estadisticas/` entry page links to the private account dashboard at `https://cloud.umami.is`; it is not an embedded dashboard or a locally implemented admin role. The provider authorizes account access. No share URL is enabled. See `docs/ANALYTICS.md` for setup, 2FA guidance and the free plan's verified limits.

The retained loader is designed only for a future public HTTPS root, with normalized URL/referrer origin and exclusion of form/email/password/query/hash data, private views and DNT/GPC requests. It is not injected into the current gate/signup package. Unlocking either preview sends no view. Any future metrics remain approximate, without historical backfill; the repository stores no raw visitor IPs.

## Mailing list

October 27: the owner supplied the real Brevo URL, full HTML and then Simple HTML export. `content/newsletter.json` is enabled locally. The new Simple HTML action is separately validated submitUrl; its token differs from formUrl, retained only for maintenance/legacy configuration. The owner explicitly requested removing the alternative signup control, and no provider/fallback link is now rendered. Older configurations without submitUrl still derive /serve/ from formUrl. No actual token is repeated here.

The form includes required type=email EMAIL with Spanish label/autocomplete, the supplied enabled empty email_address_check honeypot hidden from interaction, hidden locale=es and html_type=simple. Fields and action match the supplied export. Native same-tab POST remains the no-JavaScript fallback without Brevo CSS, Roboto or SDK; noscript explains it may open provider JSON. At the owner's request, js/maraton.js progressively sends URLSearchParams(FormData) to the same action with no cookies/referrer and renders pending, success, error or uncertain outcomes inline. Success requires HTTP ok and JSON success === true; duplicate pending/completed sends are blocked, failure preserves input, and no automatic retry occurs. No form values go to storage, logs or analytics. Provider step-5 messages and hosted pages are not promised. Visible consent copy does not establish a provider consent record.

The local design is implemented and bundled behind the gate. The agent did not edit Brevo. The owner selected Simple confirmation, supplied its export and reported the welcome arrived in spam. On October 28 the owner added Brevo TXT, both DKIM CNAMEs, DMARC and three branding CNAMEs in Squarespace. Brevo screenshots confirm losinsurgentes.mx Authenticated/Branded (subdomain mail), and Los Insurgentes <laresistencia@losinsurgentes.mx> Verified with green DKIM/DMARC. The owner then reported selecting that sender and insurgentes.mx@gmail.com Reply-To in the Simple confirmation template. No site code change or deploy is needed for these provider settings. A fresh delivery test, exact design, Maratón list inclusion and consent recording remain unverified. If CAPTCHA or required fields change, refresh from its new export.

The owner showed provider JSON success:true and later reported welcome delivery to spam. This does not verify list inclusion, deployed URL/SHA or the new inline flow. Actual CORS/browser UX remain unverified: DNS restrictions and unavailable browser blocked checks. No Brevo account connection is established. The agent made no provider edits, purchases or sends. Disabled/missing configuration renders registration-soon inside the encrypted landing; --disable does not delete contacts. See docs/MAILING_LIST.md.

October 28 delivery follow-up: after changing the sender, the owner reports the new welcome arrived in Gmail Updates. This is inbox-category placement for that test, not spam; it does not establish delivery for all recipients or independently verify message-header authentication. Gmail categories are recipient-controlled; moving/filtering to Primary affects that mailbox, not all fans. Keep the signup gate until the owner explicitly authorizes reopening.

October 27 email research: docs/EMAIL_PLAN.md documents import, sender/domain setup, limits and integration choices. The owner chose Simple confirmation: direct subscription and one welcome, with docs/email-bienvenida-maraton.html prepared for that role. DOI remains unused. Drafts received static checks; the owner reports a welcome in spam, but its exact design is not identified. The agent did not send or configure it.

## How to review

Run `node scripts/preview.mjs --open` or double-click `start.command` for the local complete site/editor. To review Pages, use `node scripts/preview.mjs --protected --open`: `/` asks for the Maratón password and `/banda/` for the complete-site password, with no raw content/editor.

## Validation

Latest bundled-signup revision: all 63 tests, build, site checks and protected packaging pass. Runtime inspection of the actual encrypted landing confirms signup initialization occurs after the form markup while the root gate and absence of raw form assets are preserved. The gate revision also verified both payloads unlock with the ignored local password, root/404/banda expose no form/Brevo configuration, and no raw signup CSS/JS/content is published. Tests cover missing-password omission and analytics exclusion; signup tests simulate provider responses. Actual browser CORS, deployment and list inclusion remain unverified. Domain/sender authentication is confirmed by October 28 screenshots, template sender/Reply-To selection is owner-reported, and the owner reports the subsequent welcome reached Gmail Updates.

October 28 repeated JSON navigation diagnosis: makeSelfContained replaced the head-deferred maraton.js tag with immediate inline JS before the form markup. Initialization returned without installing the submit listener. CORS alone cannot cause that navigation because the actual handler prevents default before fetching. The bundler now queues deferred classic scripts at body end in source order, reserving slots before concurrent reads; normal synchronous scripts stay in place. New parser-order/VM tests reproduced zero listeners with the old HEAD baseline and verify the bundled template installs its handler, prevents native navigation and renders real-response success. This corrects a gap in earlier tests that evaluated scripts with an already-built fake DOM. Live browser reproduction/deployment remain pending; browser backend and public-domain fetch were unavailable.

Earlier iframe/native/inline revisions passed their local checks. Email drafts preserve provider variables and contain no JavaScript or forms. List/consent settings, installed welcome design and exact deployment remain unverified despite the provider success and reported spam delivery.

Content/rendering/ZIP/packaging tests and simulated navigation/gallery/access interaction tests pass. New coverage verifies authenticated encryption, wrong passwords, tampering, retries, missing passwords, removal of raw content and local asset bundling. Generated HTML, assets, fragment targets, accessibility names, editor references and JavaScript syntax have been checked. The publish script passes Bash syntax validation.

The in-app browser backend was unavailable, and the sandbox blocked a local preview server. Desktop/mobile browser layout and actual Spotify playback remain unverified. The interaction tests use a small simulated DOM, not a browser.

## Remaining external steps

- October 23 publication attempt: all 36 tests, content/site checks and protected packaging passed. The publisher stopped at the GitHub account check because this environment could not connect to `api.github.com`, before Git changes, secret synchronization or deployment. Public-domain checks were also unavailable; no current TLS or deployment status was verified.
- The owner completed GitHub CLI login as `alvarodgzz`. This session cannot reach `api.github.com` or write Git metadata. A token-invalid message while the API is unreachable is inconclusive; do not request another login on that evidence alone.
- The owner's terminal created the public repository, configured `origin` and `main`, and ultimately pushed successfully after an initial HTTP 400. Local tracking recorded `3c68a92` on both `main` and `origin/main`; screenshots confirm an earlier Pages deployment. Do not recreate the repository or add the remote again.
- Current deployed URL/SHA is unverified. The owner requests gated Maratón while fixing welcome spam. For actual site changes, publish reviewed files with `bash scripts/publish-github.sh` from the normal terminal and verify both gates, passwords, no raw form/assets and no analytics. The sender change itself needs no deployment: domain/branding and laresistencia@losinsurgentes.mx are verified in Brevo, and the owner reports selecting sender/Reply-To. A new delivery test and protected signup/list checks remain pending. Do not treat an earlier commit as proof of current deployment; keep the gate until the owner authorizes reopening.
- The owner configured `losinsurgentes.mx` in GitHub Pages. Their terminal confirmed all four GitHub Pages A records and `www` CNAME to `alvarodgzz.github.io`, with no apex AAAA record. The latest screenshot showed successful DNS checks and TLS provisioning, not a completed certificate. Once issuance finishes, enable Enforce HTTPS and verify both apex and www. Do not restore Squarespace Defaults.
- Google Drive is the chosen shared workspace. The created folder is [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1); it uses numbered site sections and stable photo filenames. The owner account remains owner, and the band account supplied in chat has verified editor access. See `docs/GOOGLE_DRIVE.md`. No automatic cloud-to-GitHub synchronization or direct editor-to-Drive save is connected. A designated person reviews, imports, saves and publishes.
- Browser QA and live verification of the password gate remain required. Do not describe a future public launch as complete.

## Additional content

Final lyrics, booking email, future show details and direct YouTube links for featured singles can be added in the editor. The incomplete historical Auditorio Río 70 date remains saved as a disabled draft until its year is confirmed.
