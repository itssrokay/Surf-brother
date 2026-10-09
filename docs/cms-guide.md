# SurfBrothers owner editor — Pages CMS

Dashboard: https://app.pagescms.org/itssrokay/surf-brother/main

The GitHub App is already connected. The repository-root `.pages.yml` defines six editors. No database, API key or customer-data backend is added to the public website.

## Editing

1. Open the dashboard and select `main`.
2. Open **Business & contact**, **Package prices**, **Inclusions & booking terms**, **Stay & photo gallery**, **Frequently asked questions**, or **Life & getting here**.
3. Change the fields and select **Save**. Each save creates a GitHub commit.
4. With Vercel connected to this GitHub repository, wait for its deployment to finish, then refresh the website. A CMS save is not proof of a successful deployment; check Vercel if the website has not updated.

The editors share `site/src/content.json`. `settings.content.merge: true` is essential: saving one editor must preserve the other sections, source records, seasonal guide and animation chapters. Do not disable it. Course days, session counts, nights and internal meal IDs are protected. Stay & Surf price/discount calculation assumptions remain unconfirmed and require developer changes after owner confirmation.

Pages CMS omits empty/null properties when saving. Missing price/discount bases still mean “unconfirmed”; they never enable a calculated Stay & Surf total. Its merge replaces submitted arrays, so every managed array's identity/metadata fields are included in the schema, including the hidden meal price basis.

## Prices and text

Enter prices as numbers in rupees, without `₹` or commas. Leave “No meal add-on” at 0. Rates automatically update the package selector, comparison tables and WhatsApp summary.

Some FAQ/offer/course text contains price markers. Keep these markers where already used; the site fills them from the package settings:

| Marker | Filled from |
| --- | --- |
| `{{surfOneDayRate}}` | One-day Surf Only price |
| `{{vegMealRate}}` / `{{nonVegMealRate}}` | Daily meal prices |
| `{{offerAmount}}` | Weekday discount amount |
| `{{surfOnlyPayment}}` / `{{staySurfPayment}}` | Payment/refund terms |
| `{{offerLabel}}` / `{{offerTerms}}` | Offer description/terms |

Ordinary text is treated as text rather than HTML. Contact numbers have three fields: display format, `+` and country code for calls, and country code without `+` for WhatsApp. Call/WhatsApp digits must match. The first contact receives enquiries. Current directions and Instagram fields require HTTPS links.

## Photos

In **Stay & photo gallery**, edit a photograph or add an item. Give each new item a unique lowercase ID (e.g. `garden-morning`), caption, screen-reader description and Rooms/Camping/Shared spaces category. Select or upload the main photograph, then save the gallery. Uploading a file by itself does not add it to the page.

New uploads go to `site/uploads/photos` and are referenced as `/media/uploads/...`. JPEG, PNG and WebP are supported. Use photos under 15 MB and 40 megapixels; convert HEIC before upload. Use only photos approved for the website. Keep the existing IDs when editing existing images.

At build time Sharp generates WebP exports capped at 1440px and 640px, strips metadata, and writes content-hashed URLs. The generated thumbnail replaces the old thumbnail automatically when an existing gallery photo is replaced. Raw uploads are outside `public`, so visitors receive the optimized versions. Unused uploads are not included in the deployment. Animation packs and Blender sources are outside the CMS media folder. Video replacement remains a developer task.

## Connect Vercel

The configured Git project is **surf-brothers-mulki**: https://surf-brothers-mulki.vercel.app/. The original https://surfbrothers-mulki.vercel.app/ was a separate Drop upload. Use the Git-connected project for CMS edits. During setup its initial repository-root/Other settings returned 404 despite a Ready deployment. They were corrected to the settings below; `site/vercel.json` now records the build commands as well as caching headers.

In the Vercel project, verify **Settings → Git** points to `itssrokay/Surf-brother`. A standalone Vercel Drop upload will not update from CMS saves until Git is connected.

For this repository use:

```text
Root Directory: site
Framework: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Production Branch: main
```

`site/vercel.json` supplies caching rules for Git builds. `site/public/vercel.json` supplies the same headers in the Drop archive. Keep their headers synchronized. The build validates contact numbers, course structures, rates, gallery IDs and local photo files before deployment. An invalid edit fails the new build; correct it in the CMS and save again. The production site remains on its previous successful deployment.

## Give the owner access

After the owner agrees to the handover, open Pages CMS **Collaborators** and invite their email. They can edit content/media without a GitHub account. GitHub users manage CMS configuration and collaborators. No invitation has been sent by this setup.

For full handover, also arrange ownership of the GitHub repository, Vercel project and domain with the owner. An editor invitation alone does not transfer those accounts.

## Developer maintenance

Run `npm test` and `npm run build` from `site/`. The package tests use a fixed original owner-rate fixture so legitimate CMS price edits do not require editing unit tests. CMS tests cover edited prices/FAQ consistency, invalid content, legacy/new image paths and actual image compression. The original rates remain in `site/src/fixtures/owner-packages.json` as a test fixture, not the live content source.

Before editing locally, `git pull --ff-only` to bring in CMS commits. All public content remains in `site/src/content.json`; `content.js` resolves the supported copy markers. `cms-plugin.js` validates content and prepares uploaded photos during Vite builds/development. Generated media is ignored by Git.

References checked October 10, 2026: [Pages CMS quick start](https://pagescms.org/docs/quick-start/), [merge settings](https://pagescms.org/docs/configuration/settings/), [collaborators](https://pagescms.org/docs/configuration/collaborators/), [Vercel Git deployments](https://vercel.com/docs/git).

## Setup verification — October 10, 2026

- The authenticated dashboard loads all six editors and displays existing photos from the correct GitHub media paths.
- Actual text and price saves were tested on an isolated `cms-setup-verification` branch. The saved price retained the complete package fields, meal bases, gallery, animation chapters, seasonal content and FAQs. Its text-save snapshot passed all 22 tests and a production build using only tracked source. No test value was merged into `main`; the temporary remote branch was removed.
- Local production gallery thumbnails and full-size modal loaded successfully; no console warnings/errors or unresolved FAQ markers were found.
- Vercel production commit `5a1e0b8` reached Ready with the corrected `site` root / Vite / `npm ci` / `npm run build` / `dist` settings. The public URL rendered correctly, all eight generated gallery thumbnails loaded, the default package rate remained ₹9,000, and the browser console was clear. The original Drop deployment and the separate `surf-brother` project were not changed.
- New-image tests exercised real JPEG-to-WebP resizing, metadata stripping and content-hashed URL changes.
- Owner invitation remains pending the owner's agreed email; no invitation or school message was sent.
