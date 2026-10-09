# Motion enhancement — 9 October 2026

**Historical browser checks:** this report describes the original individual-frame loader and preceding design. The subsequent design/pack-delivery update and its current verification limits are documented in `design-performance-update.md`.

Completed a scroll-controlled, original Blender scene with three chapters: **Shore → Paddle → Ride**. A striped board travels off a sandy crescent, an articulated adult surfer paddles and stands up, the wave rises, and the camera moves. The illustration is a conceptual scene, not the actual school beach or a guaranteed learning outcome.

The page also has photo parallax, restrained pointer response, section/article entrances, a scroll-linked ticker, a moving tide divider, gallery hover movement and a reading-progress line. Wheel and touch scrolling remain native. Chapter buttons and a skip link offer direct navigation.

## Render and delivery

- Blender 5.2.2 LTS actually rendered all **96 frames** using Cycles, 16 samples and denoising. The final render log confirms completion.
- Editable source: `assets/blender/journey/surf-journey.blend`; generator: `create_journey.py` beside it. Full-resolution PNG originals are preserved in `frames/`.
- Both responsive sequences were decoded and verified: **96 × 600 px** mobile files and **96 × 960 px** desktop files. All 193 WebP files, including the static poster, returned HTTP 200 from the production preview.
- Complete encoded sequence sizes: **1,423,714 bytes mobile**, **2,555,730 bytes desktop**. The page fetches only the selected variant and loads nearby frames in batches of at most three requests.
- The decoded cache is limited to **12 mobile frames / 20 desktop frames**. These are application cache limits, not measurements of total browser memory.
- The scene uses **Canvas 2D**, with no WebGL dependency. Missing sequence/renderer support falls back to the static artwork. Reduced motion skips fetching animation frames and removes the long pinned section.

## Browser results

Tested in the Codex in-app browser at approximately **1440 × 1000**, **1265 × 720**, and **390 × 844**. These are desktop browser viewport checks, not tests on physical phones.

| Check | Result |
| --- | --- |
| Shore | Initial frame 1 displays the board on the shore. |
| Paddle chapter | Chapter button settled at progress 0.460, frame 45, with the surfer paddling. |
| Ride chapter | Enter on the chapter button settled at progress 0.900, frame 87, with the surfer standing on the board. |
| Reverse scrolling | Native upward scrolling moved from frame 87 back to frame 50 and restored the Paddle copy. |
| Mobile rewind | Enter on Shore returned from frame 87 to frame 1, progress 0. |
| Skip link | Skips directly to lessons below the header; mobile lesson heading reached approximately y=86 px. |
| Pin/focus behavior | Fixed an internal-scrolling issue by using `overflow: clip` on the stage. Chapter changes now preserve stage scrollTop=0 and the scene’s layout. |
| Mobile layout | Scene pins below the 74 px header. Document width 375 px within the 390 px viewport, with no page-level horizontal overflow. Keyboard focus remains visible on chapter controls. |
| Cache and loading | Observed limits of 20 desktop and 12 mobile cached frames. Desired and displayed frames match after settling; failed frame requests: none. |
| Reduced motion | Static artwork with normal document flow; displayed frames=0, cached frames=0, pending requests=0. Tested with the local `reduce-motion=1` presentation override; system CSS/media-query support is also implemented. |
| Existing enquiry | Five-day/four-night AC, two guests, 10–14 November and optional veg meals produced the correct ₹15,000 listed rate and reviewable message. Unknown totals remain uncalculated. No WhatsApp message was sent. |
| Existing gallery | Room filter and photo modal opened correctly after the motion layer was added. |
| Console | No warnings or errors in the final checked views. |

Raw settled animation states are in `motion-browser-checks.json`; file-response and bundle-size checks are in `motion-build-checks.json`. The production build passes, and the existing eight package/business-logic tests pass. Main production JavaScript is approximately **18.7 KB gzip**, with CSS approximately **9.6 KB gzip**; exact values are in the build-check JSON.

No FPS or Lighthouse score is claimed. The checks are local, unthrottled browser observations. The earlier `qa-report.md` and `performance-*.json` are the original static-site baseline, before this motion enhancement.

## Final screenshots

- `screenshots/motion-desktop-shore.jpg`
- `screenshots/motion-desktop-paddle.jpg`
- `screenshots/motion-desktop-ride.jpg`
- `screenshots/motion-mobile-ride.jpg`
- `screenshots/motion-mobile-reduced.jpg`

The README now includes recreation and editing instructions. The owner pitch and asset manifest include the new original artwork. No public deployment, school contact, purchase or existing-site modification was made.
