# Design and delivery update — 9 October 2026

The original Blender sequence is retained. The new design adds a 1.15-second wave reveal within the hero, staggered headline lines, inset documentary-photo frames, a native SVG surfboard cursor over artwork on fine-pointer desktops, coastal contour lines behind the illustrated scene, a shaped evening photograph and subtle gallery/ticket details. The opening does not intercept input, does not wait for animation assets and is skipped for reduced motion or arrivals directly at a section. Existing rates, payment terms and enquiry logic are unchanged.

## Hosted bottleneck observed

Inspected the user-supplied https://surfbrothers-mulki.vercel.app/?qa=1 in the in-app browser. This was the previous implementation, not a deployment of the new files.

- Several 14–15 KB mobile frame requests took 270–317 ms. Others took 31–50 ms. This is one unthrottled session, not a universal latency measurement.
- During a fast chapter jump, QA reported progress 0.598, desired frame 58, displayed frame 12, with three frame requests pending. The scene eventually caught up to frame 86. This directly demonstrates network-dependent lag during movement despite a correct final state.
- Revisited frames produced 300-byte resource transfers consistent with revalidation. A direct GET of desktop frame 045 returned `Cache-Control: public, max-age=0, must-revalidate`, `X-Vercel-Cache: HIT`, 26,866 bytes and about 106 ms total on this Mac. The CDN had the asset; the old browser loader still depended on a network round trip for frames evicted from its decoded cache.
- Raw settled observations are in `hosted-before.json`. `screenshots/hosted-before.jpg` is a baseline capture of the old hosted version.

## New delivery

| Item | Previous | Updated |
| --- | --- | --- |
| Full sequence network requests, selected variant | Up to 96 individual WebP requests, plus revisits | 8 content-addressed packs |
| Encoded mobile sequence | 1,423,714 bytes | 1,427,911 bytes including pack indexes |
| Encoded desktop sequence | 2,555,730 bytes | 2,559,952 bytes including pack indexes |
| Reverse scrolling | May revalidate evicted images | Reads retained compressed frame blobs |
| Concurrent network work | 3 frame downloads | 2 pack downloads |
| Decoding | Frame image decoding | Up to 3 concurrent bitmap/image decodes |
| Decoded cache | 12 mobile / 20 desktop | Same bounded limits; evicted bitmaps explicitly closed |
| Mobile canvas backing dimensions | 960 × 960 | 600 × 600 |
| Missing current frame | Hold old frame until exact image arrives | Paint the closest ready frame toward the target |

Downloads warm while the scene is near the viewport after page load. Reported data-saving or 2G connections fetch nearby packs only. Scrolling away pauses queued downloads. Required-pack failure switches to a compact static composition; reduced motion skips the animation network work entirely. A separate Shore still matches the opening scene while its first pack arrives. No WebGL, continuously running animation or extra dependency was introduced.

Hashed pack names and hashed JS/CSS receive long-lived immutable caching through `vercel.json`. The sequence manifest continues to revalidate so new deployments can point to new hashed packs. See [Vercel cache headers](https://vercel.com/docs/caching/cache-control-headers) and [configuration headers](https://vercel.com/docs/project-configuration/vercel-json#headers).

## Verification and limits

The production build and **12 tests pass**. Tests check all 192 packaged frame payloads byte-for-byte against originals, fast-jump priority, no duplicate or reverse-scroll downloads, failed-network termination and corrupt/truncated pack handling, alongside the eight business/enquiry tests. **24 production HTTP responses** passed, covering the HTML, JS, CSS, posters, cursor, configuration, manifest and all 16 responsive packs. Exact bundle and response data is in `enhancement-build-checks.json`. ZIP integrity and all advertised pack paths were verified.

**The browser tool rejected binding the local preview URL under its browser URL policy.** No alternate browser mechanism or policy workaround was attempted. Consequently the new opening/cursor/layout have not received a fresh visual browser check in this turn. Prior desktop/mobile screenshots and `motion-qa.md` cover the preceding design only. Hosting playback smoothness must be rechecked after the new package is uploaded; no FPS, Lighthouse score or measured speedup is claimed.

## Reviewable upload

`deliverables/surfbrothers-vercel-drop.zip` contains the static production files with `index.html` and `vercel.json` at its root. It omits editable Blender/owner originals, `node_modules` and unused individual frame exports. The new pack transport works even on hosts that ignore Vercel headers, because compressed frames are retained during the page visit.

To regenerate from the project root:

```sh
cd site
npm test
npm run build
python3 ../scripts/package_drop.py
```

Upload the ZIP yourself when ready. [Vercel Drop](https://vercel.com/changelog/vercel-drop) creates a new project for each drop; it does not automatically replace the existing URL. Updating that existing project needs its normal deployment workflow. No publishing, school contact or enquiry sending was performed during this enhancement.
