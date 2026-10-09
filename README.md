# SurfBrothers Mulki — private website proposal

A complete responsive commercial pitch prototype built with **Vite + plain JavaScript, CSS and semantic HTML**. Original owner photographs, a silent evening video and an original Blender surfboard study are integrated into the visitor experience. No backend, payment processing, customer-data storage or live reservation claims.

The enhanced version includes a scroll-controlled **shore → paddle → ride** scene rendered in Blender, with 96 frames, an articulated adult surfer, a rising wave and a moving camera. Open **Catch the feeling** on the hero to jump to it. Scrolling forward/backward controls the scene; the three chapter buttons and **Skip to the lessons** provide direct navigation.

Motion across the page includes a brief wave opening, staggered headline reveal, photo parallax, heading/article entrances, a scroll-linked ticker and tide divider, subtle pointer response and a reading-progress line. A native surfboard cursor appears over the hero photograph, illustrated journey and board study on desktop; links and controls keep their ordinary pointer. Coastal contour lines, inset photo frames and ticket details carry the style into the lower page. Native page scrolling is preserved. System reduced motion (or the QA query below) switches to a compact static artwork with normal document flow. No WebGL or animation framework is required.

## Preview and run

The updated production preview is served locally at **http://127.0.0.1:4173/**. The server is bound to this Mac's loopback interface. The user separately deployed an earlier Drop copy at https://surfbrothers-mulki.vercel.app/. The Git-connected project at https://surf-brothers-mulki.vercel.app/ now serves the CMS-enabled version; saving CMS content triggers a new Vercel build. Its `site/` root and Vite build settings were corrected and the live site verified during the October 10 CMS setup.

From this project folder:

```sh
cd site
npm ci
npm run dev       # http://127.0.0.1:5173 — editable development preview
npm test         # package rates, exact nights, validation and enquiry rules
npm run build    # production output in site/dist
npm run preview  # http://127.0.0.1:4173 — production preview
```

Node 20.19+ or 22.12+ is required by the installed Vite version; this build used Node 23.11.0. `npm ci` respects the included lockfile. Preview commands stay running until stopped with Ctrl+C. A static web server can also serve `site/dist` after a build; no application server is needed.

## Static upload package

After building, run `python3 ../scripts/package_drop.py` from `site/` (or `python3 scripts/package_drop.py` from the project root). The ready-to-upload archive is `deliverables/surfbrothers-vercel-drop.zip`, with `index.html` and caching configuration at the archive root. It excludes editable originals, dependency folders and the unused individual-frame exports. Upload this ZIP yourself when ready. Vercel Drop creates a new project for each drop; updating the existing project URL requires its normal deployment workflow. The previous hosted slowdown, transport changes and current verification limits are recorded in `docs/design-performance-update.md`.

## Editing the business content

The **Pages CMS owner dashboard** is configured in the repository-root `.pages.yml`. Open https://app.pagescms.org/itssrokay/surf-brother/main for six editors covering contacts, prices, terms, stay/photos, FAQs and trip information. See `docs/cms-guide.md` for Vercel connection settings, owner invitations and image uploads. CMS saves create GitHub commits; a connected Vercel project rebuilds from them. New gallery photos are resized/compressed during the build. The public design and animation remain code-managed.

The header includes **Inquire** (a prefilled WhatsApp link), **Book now** (the package chooser), and a direct **Sun / Surf** switch with a brief wave transition. Initial appearance follows the device until a visitor chooses a mode; that choice is saved locally. Reduced motion skips the transition. The header supplies the persistent booking action without a floating button covering mobile controls.

The page now progresses through introduction → packages → cinematic surf story → stay → daily life → people → seasonal planning → arrival → FAQs. Three-versus-five-day advice lives beside the package chooser in an optional comparison. All-rate tables start collapsed, while the selected rate, inclusions and payment terms remain visible. Header navigation names the main visitor tasks.

**Plan your trip** offers a twelve-month guide with original illustrated coastal atmospheres: sun position, clouds, rain, palm movement, water and palette change by month. These are seasonal illustrations, not actual-weather promises. The adjacent near-hour Mulki weather card remains separately labelled. Seasonal guidance and sources live in `content.json` under `planning`; interface logic is in `planning.js` / `planning.css`. Edit original artwork and mood palettes in `season-scene.js`, mode behaviour in `display-mode.js`, and presentation overrides in `experience.css`. Forecast validation is in `weather.js`. Weather is fetched on approach to the card from MET Norway, cached locally, and attributed under CC BY 4.0. It uses fixed public Mulki coordinates, not a visitor's location. Missing or stale readings show an unavailable state. See `docs/experience-qa.md` for the latest research and checks; `docs/planning-qa.md` records the earlier implementation.

**`site/src/content.json` is the single editable business-content source.** It contains contacts, rates, accommodation choices, inclusions/exclusions, optional meals, offer terms, payment terms, FAQs, coach confirmation text, gallery entries, guest stories, location and unresolved calculation assumptions.

- Edit `packages.surfOnly.courses` for tuition-only rates. The CMS protects course lengths and session counts.
- Edit `packages.staySurf.courses` for the twelve camping/Non-AC/AC rates and exact nights.
- Leave `packages.staySurf.priceBasis` and `packages.offer.basis` as `null` until the owners establish them. **The current enquiry flow deliberately does not calculate a Stay & Surf group total or a guaranteed discounted total.** A future confirmed price basis needs a corresponding update in `packages.js` and its tests; filling a JSON field alone must not silently change the calculation rules.
- Update meal/offer/payment entries and related FAQ text together when owners change policies. Prices in the selector and summary come from the structured rates; policy prose is also in this same file.
- `learning.instructors.names` is empty because the current roster is unconfirmed. Add verified bios/photo permissions before creating named instructor cards.
- Gallery entries record the original filenames. Confirm which rooms match which package categories before relabelling any room photograph.
- Contact numbers are owner-provided and cross-verified against the current school website and Instagram. If `contacts.verified` becomes false, the WhatsApp launch link is hidden and only a labelled demo message is shown.
- Editorial layouts live in `sections.js`, enquiry state and UI behavior in `main.js`, and pure date/rate/message logic in `packages.js`.
- `style.css` holds the palette, typography, responsive layouts and reduced-motion rules. All fonts are local with their SIL Open Font Licenses.

After local edits, run `npm test` and `npm run build`, then reload the production preview. Package logic tests use the original owner rates as a fixed test fixture, while CMS validation permits owner price updates and protects course structure. Live prices always come from `content.json`. Supported markers in FAQ, offer and course copy keep those references synchronized with price/term changes.

## Media and Blender

The owner's original source folder is recorded in `docs/asset-manifest.json`. All 22 source files are retained under `assets/originals/Surfbrothers_Stay`; the source Drive folder was not changed. Contact sheets show what was inspected. Eight photographs and one video are selected; other files remain available for later review.

Git tracks the website's optimized media, animation packs, Blender projects and generation scripts. Raw owner originals, contact sheets, unused exports, full-resolution rendered frames and generated upload ZIPs are ignored to keep GitHub uploads small. They remain on this Mac; a fresh clone can run, test and build the site without them. Re-render the animation from the tracked Blender generator, or obtain the owner originals separately when preparing new photographic/video exports. Regenerate the upload ZIP using the command above.

The original Blender project is **`assets/blender/surfbrothers-longboard.blend`**, with editable mesh/material/text objects, softbox lights and camera. Its script is `assets/blender/create_surfboard.py`; `render.log` records the actual Blender render. This is conceptual brand artwork, not a claim about the school's real equipment.

The animated scene is **`assets/blender/journey/surf-journey.blend`**. `create_journey.py` in that folder builds the complete original scene, rig poses, board path, wave, camera and lighting. Its `frames/` directory holds the 96 full-resolution PNG originals. To rebuild it:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/blender/journey/create_journey.py
/Users/shraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/export_journey.py
python3 scripts/pack_journey.py
```

Add `-- --preview` to the Blender command to render three key poses only. The WebP exports live in `site/public/media/journey`, in 600 px mobile and 960 px desktop variants. Run `pack_journey.py` after exporting: it groups the unchanged WebP images into eight content-addressed packs per variant, twelve frames per pack. `docs/journey-manifest.json` records provenance and sizes. The browser keeps compressed frames (about 1.43 MB mobile / 2.56 MB desktop) for fast reverse scrolling, with at most 12 decoded mobile frames or 20 desktop frames and three concurrent decodes. Only two pack downloads run at once; fast jumps get the next network slot. All packs warm while the scene is nearby after page load, except on a reported data-saving/2G connection, which gets neighbouring packs only. Mobile canvas resolution is 600 px. It uses Canvas 2D, with a static image fallback if a required pack or renderer is unavailable. Reduced motion fetches no animation packs. Rebuild the production site after changing exports. The build strips individual frame files from generated `dist`; the editable originals remain intact.

Edit the three story chapters in `content.json` under `journey`; adjust layout and scroll behavior in `motion.css` and `motion.js`. Geometry and camera changes belong in the Blender generator. The illustrated beach is conceptual artwork, not the actual surf location or a promise of learning outcomes.

Small interactions live in `details.js` / `details.css`: click splashes over artwork, the shell beside “The ocean is calling,” a `SURF` keyboard secret outside interactive controls, and brief message toasts. These effects are bounded and suppressed for reduced motion. The static journey offers an explicit animation opt-in or retry when appropriate; it never changes the system preference. See `docs/details-qa.md` for the loader regression and repair.

To recreate the Blender render from the project root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python assets/blender/create_surfboard.py
```

Image preparation uses Pillow, macOS `sips` (HEIC) and FFmpeg. On this Mac the bundled Python with Pillow is:

```sh
/Users/shraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/prepare_media.py
/Users/shraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/inspect_video.py
/Users/shraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/export_assets.py
/Users/shraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/finish_media.py
```

On another machine use Python with Pillow, FFmpeg and an available HEIC decoder in place of `sips`. `finish_media.py` moves unused web derivatives into `assets/unused-exports` and rebuilds the manifest; it never touches the originals. Web exports strip EXIF metadata. The video is silent, H.264, user-played and loaded on demand. The 37 KB board still works without WebGL. No stock accommodation images or downloaded third-party social videos are included.

## Review and handover files

- `docs/research-ledger.md`: dated sources, conflicts and confidence.
- `docs/asset-manifest.json`: provenance, selected filenames, licences, original checksums and export sizes.
- `docs/owner-confirmations.md`: open questions, including price units, meals, bathrooms, instructors, surf beach and transfers.
- `docs/owner-pitch.md`: separate owner-facing handover and website-for-surf-and-stay exchange proposal.
- `docs/qa-report.md` and `docs/performance-*.json`: test evidence and measured local performance, with limitations.
- `docs/motion-qa.md`: verification of the enhanced motion experience and its responsive/static fallbacks. The earlier QA report is the baseline before the scroll scene was added.
- `docs/design-performance-update.md`: hosted bottleneck evidence, new delivery strategy and current verification limits.
- `docs/details-qa.md`: click interactions, easter eggs and the browser fetch compatibility repair.
- `screenshots/`: final desktop/mobile captures and review contact sheet.

The QA-only query `?qa=1` exposes metrics in a hidden local output for browser testing. `?qa=1&reduce-motion=1` exercises the reduced-motion presentation even on a machine without the system preference enabled. Regular visitors receive no diagnostic UI or analytics. Nothing is transmitted to a metrics service.

## Before any public launch

Get the owner approvals in `docs/owner-confirmations.md`. Confirm public image/guest/review reuse rights, business policies and final price units. The prototype currently has `noindex,nofollow,noarchive` and a blocking `robots.txt`; preserve these for private review. The social image's URL is deliberately local—replace it with an approved absolute origin only during an authorised launch. No domain or hosting account has been bought, no current business site has been modified, and no school enquiry has been sent.
