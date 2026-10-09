# Seasonal experience and simpler booking path — 10 October 2026

## Result and page order

The page keeps one clear visitor path: **hero → surf introduction → packages → cinematic surf story → stay → daily life → people → month/weather planning → arrival → FAQs → closing**. Packages moved ahead of the long scroll scene and gallery. The hero's Catch the feeling link still jumps straight to the animated story; Book now jumps straight to the package chooser. No additional pages or booking steps were introduced.

Header navigation is The surf / Packages / The stay / Plan your trip. Both Inquire and Book now remain visible on desktop and mobile. Book now starts the existing reviewed WhatsApp enquiry flow, with availability and payment still confirmed by the team. Inquire opens the generic WhatsApp conversation. No enquiry was sent during QA.

Three-versus-five-day advice moved from a large standalone block to an optional comparison beside the chooser. The all-rates tables now start collapsed at all screen sizes. Selected rate, inclusions, exclusions and payment terms remain visible. The floating mobile CTA was removed from view because the persistent header already provides Book now; month and form controls are no longer covered.

## Research and design judgement

- [NN/G homepage usability guidance](https://www.nngroup.com/articles/113-design-guidelines-homepage-usability/) supports prioritising a small number of customer tasks and keeping navigation labels clear. Moving packages earlier is our design judgement for this surf-trip proposal; it is not a measured conversion result.
- [NN/G progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) supports keeping the common choices visible and placing detailed comparisons behind clear controls. Its hotel-reservation example also supports keeping interdependent course, accommodation and price choices together instead of splitting them across a wizard.
- [NN/G form cognitive-load guidance](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) informed the short instruction explaining what happens after choosing a trip, plus keeping related choices grouped.
- [Walk on Water's Mulki guide](https://walkonwater.in/surfing-in-mulki/) supports the existing broad seasonal guide. The twelve original palettes and illustrations suggest seasonal atmosphere rather than predicting specific days, conditions or SurfBrothers availability.

## Motion and artwork

The mode dropdown is replaced by a single native button. It alternates Sun / Surf, announces the next action and current pressed state, and saves the choice locally. A 1.05-second wave sweeps across the view; colours change while the crest covers it. Rapid clicks are bounded while a transition is running. Reduced motion changes the mode immediately and removes the wave effect. No system appearance setting is changed.

The month guide includes an original SVG coast with sandbars, a striped surfboard, palms, sun, clouds, water reflections, birds and rain. Each month changes its palette, sun position/intensity, cloud cover, rain and palm sway. Subtle movement runs only while the scene is visible; the reduced-motion version keeps it still. Mobile has a palm composition adapted to its narrower frame. The live weather card is separate from these illustrative moods.

Source files: `display-mode.js`, `season-scene.js`, `experience.css`, `planning.js`, `planning.css`, plus page order in `main.js` / `motion.js` and comparison placement in `sections.js`. No extra imagery requests, animation framework or WebGL dependency were added.

## Checks performed

- All **17 automated tests passed**, covering owner rates and terms, frame-pack delivery and weather validation. Final production build passed: CSS 66.75 KB (14.89 KB gzip), main JS 80.64 KB (28.77 KB gzip).
- Browser reviewed at **1440×1000** and **390×844**, with additional header/overflow checks at **360 px** and **320 px**. No horizontal document overflow at these widths; brand and header actions do not overlap. Phone theme, enquiry, booking and menu controls are 44 px high.
- Direct pointer click on the theme control started the visible wave without changing page scroll position. Both modes completed, the next-action label updated, and the saved choice survived reload.
- Every month was clicked: exactly one selected button, matching scene caption and month enquiry, distinct seasonal palette and the expected illustrative rain setting. Corrected a inherited selector that had made every seasonal marker adopt the selected month's colour in Surf mode.
- Mobile navigation opens/closes and routes to planning; Book now routes to packages. Both the course comparison and rate tables remain usable native disclosures.
- Booking flow: selected **5 days / 4 nights, Non-AC Hostel, 2 guests, 10–14 November 2026**. The review modal correctly displayed **₹13,500 as the listed rate**, kept its price basis unresolved, and preserved payment/offer/meal terms. WhatsApp target inspected, never opened/sent. Test form values were cleared by reload afterward.
- After reordering, the original animation rendered Shore at frame 2 and Ride at frame 86, with the canvas ready and the adult surfer visibly riding. Chapter controls and Explore the stay route remain usable. No new FPS benchmark claimed.
- Reduced-motion QA query: keyboard Enter switches mode immediately; wave hidden/inactive; rain animation computed as `none`; month selection still changes the scene. The original surf scene shows its still-artwork fallback.
- Browser warning/error log was empty in the normal QA session.
- Temporary reduced-motion tab closed and viewport override reset. Existing user tabs retained. Local production preview continues at http://127.0.0.1:4173/.

## Screenshots and handover

- `screenshots/seasonal-desktop-winter.png`
- `screenshots/seasonal-desktop-monsoon.png`
- `screenshots/seasonal-mobile-monsoon.png`

The updated Vercel Drop archive is `deliverables/surfbrothers-vercel-drop.zip`. It has not been uploaded or deployed.
