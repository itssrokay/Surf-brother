# Local production QA — 8 October 2026

The proposal was built and inspected in the Codex in-app browser on this Mac, using the actual production preview at **http://127.0.0.1:4173/**. No public deployment or school enquiry was made.

## Build and business logic

`npm run build` passed. Vite produced a static HTML/CSS/JavaScript build; no backend is required. All **8 Node tests** passed, covering the exact owner rate matrices, sessions and nights, unknown calculation bases, private training, enquiry validation, date arithmetic and invalid package combinations. The production HTML and 21 referenced assets returned HTTP 200; failures: none.

## Browser verification

| Area | Result |
| --- | --- |
| Responsive layout | Inspected at 1440 × 1000 and 390 × 844. Hero, learning comparison, real stay gallery, package form, sample day, guest stories, arrival details, FAQs and footer reviewed. No page-level horizontal scrolling. |
| Navigation | Mobile menu opens, navigates to the package section and closes. Section links and the persistent enquiry CTA work. The persistent CTA hides while the hero, package section or footer CTA is visible. |
| Validation | Missing start date shows feedback and focuses the date field. Zero guests is rejected. Invalid enquiry attempts do not open the message dialog. |
| Stay & Surf enquiry | Five days / four nights, AC, two guests, tentative 12–16 October, veg meals: listed ₹15,000 rate, exact nights and selections included. No inferred group/meal/discount total; total and availability explicitly need confirmation. Advance and weather terms retained. |
| Surf Only enquiry | Switching to five-day Surf Only produces five sessions, ₹10,000 per person and ₹20,000 tuition for two guests. Optional stay meals and weekday offer are excluded. Full-payment/non-refundable terms retained. |
| Private training | ₹3,000 per person per session shown; duration/equipment clarification included. |
| Message review | Read-only preview, copy confirmation and properly encoded WhatsApp link for +91 97393 19902 verified. The link was not opened and no message was sent. Escape closes the dialog and restores focus to its trigger. |
| Gallery | Rooms filter, modal opening, next-photo control and ArrowLeft navigation checked. Escape closes and returns focus. Eight actual owner photos have descriptive captions and alt text. Mobile filtered galleries use a single column. |
| Video | Owner evening video opens only on request; native controls play the H.264 file. Closing pauses playback; no media error observed. Video has no audio track and does not autoplay. |
| FAQs | Native disclosure opens/closes, including the optional-meals answer. Rate comparison disclosure works from the keyboard. |
| External links | Current business site, Instagram, owner/bio map pins and guest sources were reviewed during research. On-site phone, directions, Instagram, review-source and enquiry URLs were inspected. No booking or message submission performed. |
| Keyboard/focus | Form controls, message preview/copy/WhatsApp controls, native details and dialog Escape behavior checked. Visible solid focus outlines observed. |
| Reduced motion | `?qa=1&reduce-motion=1` exercises the same reduced-motion presentation: measured board animation is `none`. CSS also supports the system `prefers-reduced-motion` preference. This was a presentation override, not OS preference emulation. |
| No WebGL | The original Blender work is delivered as a 37 KB WebP render. No canvas or WebGL renderer is created; the complete experience works without WebGL. |
| Media/console | All selected images loaded after scrolling; no missing images or console errors/warnings observed in the final preview. Heavy photos load lazily and the video loads on request. |
| Optional WebMCP | Page-scoped package configuration accepted a valid five-day AC selection and returned ₹15,000 / four nights with total `null`. An invalid one-day Stay & Surf selection was rejected without changing the state. |

Main text palette contrast ratios were calculated: ink/cream **10.52:1**, cream/ocean **10.45:1**, deep teal/orange **5.85:1**, deep teal/ticket **8.05:1**, muted/cream **5.12:1**, muted/stay background **4.71:1**. Photo overlays were inspected visually. These values are checks of the selected palette, not a blanket accessibility certification.

## Measurements

Measurements are **unthrottled localhost lab observations**, not Lighthouse scores or real mobile-network results. The mobile run reused the browser cache; its transfer figure should not be interpreted as a first-visit download size. Resource transfer figures include headers and exclude the document itself.

| Observation | Desktop 1440 × 1000 | Mobile 390 × 844 |
| --- | ---: | ---: |
| Largest Contentful Paint | 160 ms | 180 ms |
| Cumulative Layout Shift | 0.000088 | 0 |
| DOMContentLoaded | 78.7 ms | 85.4 ms |
| Resource transfer bytes | 1,331,758 | 5,400 (cached responses) |
| Canvas elements | 0 | 0 |

Raw data is saved in `performance-desktop.json` and `performance-mobile.json`, before gallery scrolling or form interaction. The mobile diagnostic lists the wide rate-table descendants and decorative closing sun; both are contained by their own scrolling/clipping layouts and do not create page-level overflow. The measured document width stays within the viewport.

Five loopback HTML requests took **1.08–5.18 ms**, median **1.44 ms**. Exact compressed main bundle sizes and response checks are in `performance-server.json`. Eighteen shipped media exports total **5,545,309 bytes**, including the **3,292,341-byte** on-demand video. Media originals, provenance and each export size are recorded in `asset-manifest.json`.

## Visual refinement and final captures

Refinements included tighter mobile headline wrapping, a non-obscuring persistent CTA, a rate immediately below mobile accommodation choices, single-column filtered galleries, legible local fonts, and clear separation between listed package rates and unconfirmed totals. The lower sections and footer were reviewed alongside the first screen. Full-page screenshots were captured after scrolling to load the lazy media.

- `screenshots/desktop-hero.jpg`, `desktop-packages.jpg`, `desktop-full.jpg`
- `screenshots/mobile-hero.jpg`, `mobile-enquiry.jpg`, `mobile-gallery.jpg`, `mobile-full.jpg`
- `screenshots/desktop-review-sheet.jpg`, `mobile-review-sheet.jpg`: contact sheets used for whole-page review.

## Remaining limits

Physical phones, throttled mobile networks, screen readers and OS text zoom were not tested. Public media/guest-quote reuse rights, actual bathrooms, instructor roster, surf beach/transfers and unresolved package units require owner confirmation. These are recorded in `owner-confirmations.md` and represented honestly in the site. The private prototype remains noindex with a blocking robots file, and the sharing-image URL remains local.
