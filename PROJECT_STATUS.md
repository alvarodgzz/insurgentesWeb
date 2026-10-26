# Project status — October 23, 2026

## Confirmed direction

- Preserve and polish the established Los Insurgentes identity.
- Maratón is still upcoming; the next single is planned for November 2026. No title or release day was supplied.
- Give the band a simple way to update photos and content.
- Use a personal Google Drive folder, organized by site section, for band collaboration. The owner supplied `insurgentes.mx@gmail.com` as the initial collaboration account; this is not authorization to use it as the public booking address.
- Include an on-page Spotify catalog and investigate lyric providers.
- Use GitHub account `alvarodgzz`, existing repository `insurgentesWeb`, GitHub Pages and domain `losinsurgentes.mx`.
- Do not launch publicly yet: the owner requested a temporary branded password gate. Keep the supplied password out of tracked files and logs.
- The owner explicitly requested subagents for parallel work.

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

## Temporary protected preview

The Pages packaging now prepares a branded password gate and an encrypted, self-contained copy of the complete site. It uses PBKDF2-SHA-256 (600 000 iterations) and AES-GCM-256. Public output omits the editor, raw photos, JSON content and templates. A missing compilation password produces only the holding gate, without the full site. The local root `index.html` remains the complete site for editing.

The local ignored `.env.preview-password` supplies local builds; the publishing script synchronizes it to the Actions secret `PREVIEW_PASSWORD` when present. Actions uses that secret during packaging. Decryption needs JavaScript and HTTPS, or localhost. The explicit packaging option `--public` is for a future launch, which the owner has not yet authorized.

The repository is already public, including prior source/content history. Encrypting the new Pages artifact does not remove that exposure or provide server authentication. Do not claim that all band material is private. The password gate is a local implementation until the owner publishes it and verifies the live site.

## How to review

Run `node scripts/preview.mjs --open` or double-click `start.command`. The editor opens at `http://127.0.0.1:8000/admin/`; the complete local site is at `/`. To review only the protected Pages package, use `node scripts/preview.mjs --protected --open`; this mode does not serve the editor or raw content.

## Validation

Content/rendering/ZIP/packaging tests and simulated navigation/gallery/access interaction tests pass. New coverage verifies authenticated encryption, wrong passwords, tampering, retries, missing passwords, removal of raw content and local asset bundling. Generated HTML, assets, fragment targets, accessibility names, editor references and JavaScript syntax have been checked. The publish script passes Bash syntax validation.

The in-app browser backend was unavailable, and the sandbox blocked a local preview server. Desktop/mobile browser layout and actual Spotify playback remain unverified. The interaction tests use a small simulated DOM, not a browser.

## Remaining external steps

- October 23 publication attempt: all 36 tests, content/site checks and protected packaging passed. The publisher stopped at the GitHub account check because this environment could not connect to `api.github.com`, before Git changes, secret synchronization or deployment. Public-domain checks were also unavailable; no current TLS or deployment status was verified.
- The owner completed GitHub CLI login as `alvarodgzz`. This session cannot reach `api.github.com` or write Git metadata. A token-invalid message while the API is unreachable is inconclusive; do not request another login on that evidence alone.
- The owner's terminal created the public repository, configured `origin` and `main`, and ultimately pushed successfully after an initial HTTP 400. Local tracking recorded `3c68a92` on both `main` and `origin/main`; screenshots confirm an earlier Pages deployment. Do not recreate the repository or add the remote again.
- Run `bash scripts/publish-github.sh` from the owner's normal terminal to publish the protected preview. The script validates, synchronizes the local password file to the repository Actions secret when present, pushes, verifies the remote SHA, preserves existing domain settings and requests deployment. This update is not yet published; wait for the new Actions run and verify the gate, rejected wrong password and correct access on the real domain.
- The owner configured `losinsurgentes.mx` in GitHub Pages. Their terminal confirmed all four GitHub Pages A records and `www` CNAME to `alvarodgzz.github.io`, with no apex AAAA record. The latest screenshot showed successful DNS checks and TLS provisioning, not a completed certificate. Once issuance finishes, enable Enforce HTTPS and verify both apex and www. Do not restore Squarespace Defaults.
- Google Drive is the chosen shared workspace. The created folder is [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1); it uses numbered site sections and stable photo filenames. The owner account remains owner, and the band account supplied in chat has verified editor access. See `docs/GOOGLE_DRIVE.md`. No automatic cloud-to-GitHub synchronization or direct editor-to-Drive save is connected. A designated person reviews, imports, saves and publishes.
- Browser QA and live verification of the password gate remain required. Do not describe a future public launch as complete.

## Additional content

Final lyrics, booking email, future show details and direct YouTube links for featured singles can be added in the editor. The incomplete historical Auditorio Río 70 date remains saved as a disabled draft until its year is confirmed.
