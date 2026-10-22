# Project status — October 21, 2026

## Confirmed direction

- Preserve and polish the established Los Insurgentes identity.
- Maratón is still upcoming; the next single is planned for November 2026. No title or release day was supplied.
- Give the band a simple way to update photos and content.
- Use a personal Google Drive folder, organized by site section, for band collaboration. The owner supplied `insurgentes.mx@gmail.com` as the initial collaboration account; this is not authorization to use it as the public booking address.
- Include an on-page Spotify catalog and investigate lyric providers.
- Use GitHub account `alvarodgzz` and GitHub Pages. Proposed repository: `insurgentesWeb`.
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

## How to review

Run `node scripts/preview.mjs --open` or double-click `start.command`. The editor opens at `http://127.0.0.1:8000/admin/`; the public site is at `/`.

## Validation

Content/rendering/ZIP/packaging tests and simulated navigation/gallery interaction tests pass. Generated HTML, assets, fragment targets, accessibility names, editor references and JavaScript syntax have been checked. The publish script passes Bash syntax validation.

The in-app browser backend was unavailable, and the sandbox blocked a local preview server. Desktop/mobile browser layout and actual Spotify playback remain unverified. The interaction tests use a small simulated DOM, not a browser.

## Remaining external steps

- GitHub CLI is now installed at `/usr/local/bin/gh`, and the owner reports completing login as `alvarodgzz`. This session's `gh api user` fails to connect to `api.github.com`, so authentication could not be verified from this restricted terminal. The `gh auth status` token-invalid message is inconclusive while the API is unreachable; do not ask the owner to repeat login solely on that evidence.
- The owner's normal terminal created the local Git repository, initial commit `9910443`, and the public repository `alvarodgzz/insurgentesWeb`; `origin` and branch `main` are configured. The first push failed with `RPC failed; HTTP 400` while uploading a 33.22 MiB pack. Remote branch contents and Pages deployment remain unverified. Do not recreate the repository or add `origin` again.
- After GitHub login in an unrestricted terminal, `bash scripts/publish-github.sh` validates the project, creates/reuses `alvarodgzz/insurgentesWeb`, pushes, enables Pages and triggers deployment. Do not claim a live URL until GitHub confirms the deployment.
- The site passed 24 tests, site checks and Pages packaging before the first publication attempt. The owner needs to run the publication script from their normal terminal because this session cannot reach the GitHub API or write Git metadata. The script now retries an observed HTTP 400 upload once using command-scoped HTTP/1.1 and a 64 MiB buffer, then verifies the remote main SHA before enabling Pages. Four isolated publishing-flow tests pass; the retry still needs execution against GitHub.
- Google Drive is the chosen shared workspace. The created folder is [Los Insurgentes — Sitio web](https://drive.google.com/drive/folders/1mtafaa-JIJ9N9zaEBIQihOqGPx8qOzt1); it uses numbered site sections and stable photo filenames. The owner account remains owner, and the band account supplied in chat has verified editor access. See `docs/GOOGLE_DRIVE.md` for band instructions. No cloud-to-GitHub synchronization or direct editor-to-Drive save is connected. A designated person still reviews, imports, saves and publishes through GitHub.
- Custom-domain DNS has not changed. The intended domain in previous notes is `losinsurgentes.mx`; initial deployment can use the GitHub Pages URL.
- Browser QA and a confirmed first deployment remain required before calling the launch complete.

## Additional content

Final lyrics, booking email, future show details and direct YouTube links for featured singles can be added in the editor. The incomplete historical Auditorio Río 70 date remains saved as a disabled draft until its year is confirmed.
