# Small interactions and animation repair — 9 October 2026

## Animation regression

The user reported that the scroll scene had become the static “Find your flow” view. Inspection found the new pack loader stored `fetch` as `this.fetcher` and called it as an object method. Native browser fetch implementations requiring a Window receiver can throw synchronously with an illegal-invocation error. That exception enters the scene's manifest preparation catch and activates its static fallback. The preceding Node tests injected arrow fetch functions and therefore missed this browser-specific receiver behavior.

A new regression test models a browser fetch that requires the global receiver. It **failed on the preceding implementation**, reproducing the synchronous illegal invocation, and **passes after repair**. The default transport now calls `globalThis.fetch(...)` through an arrow wrapper, preserving its browser receiver. A second regression check confirms synchronous network exceptions terminate cleanly instead of stranding pending packs.

The static scene now states whether it is showing reduced motion or a loading fallback. An explicit “Animate on scroll” choice opts into motion for that page visit; a failed sequence offers “Retry animated story.” The default still respects the system preference. Retry clears prior failures, reinitialises the pack loader and restores keyboard focus to Shore. QA metrics include the fallback reason and explicit motion choice. No system setting is changed or preference persisted.

## New details

- Pointer clicks/taps on the hero photo, journey artwork/background and board study create twelve falling water droplets and two expanding ripple rings. Links, buttons and form controls are excluded, so ordinary controls retain their behaviour.
- Effects last under one second, are limited to three concurrent splashes and are clipped to a fixed viewport layer to prevent page overflow. They run only after user interaction and are suppressed for reduced motion. No continuous particle loop or sound was added.
- The small shell next to “The ocean is calling” reveals three rotating ocean messages. It is a normal labelled keyboard-accessible button with a 44 px target. The message uses a brief polite status announcement and never steals focus.
- Typing `SURF` outside interactive controls finds another ocean message and briefly turns the hero sun. Inputs, textareas, editable content, links, buttons and modifier-key shortcuts are excluded. Escape dismisses the message.
- The hero stamp tilts on hover; open FAQ plus signs turn into crosses. Existing gallery and scroll motion remain intact.
- All transient nodes, timers and listeners are cleaned up on page exit, with fresh detail listeners after back/forward-cache restoration.

## Verification

**14 tests pass**: the eight existing package/enquiry rules plus six loader tests, including the two new browser-receiver/network regressions. The production build and refreshed static upload ZIP pass. Delivery packs retain the same original Blender frames and hashes. Existing price/terms content was not modified.

The local production server returns HTTP 200 and serves the newly hashed JS/CSS. The local browser access policy from the previous turn remains a verification limitation; no alternative browser control was used to circumvent it. A fresh visual/playback check was requested from the user after reloading the preview. The unit evidence confirms the identified compatibility fix, but does not constitute a measured browser playback or FPS result. The prior screenshots are of preceding versions.

Review: http://127.0.0.1:4173/ . Upload package: `deliverables/surfbrothers-vercel-drop.zip`. No public deployment or enquiry was sent.

## User playback confirmation

On 9 October 2026, the user answered **“Yes, the scene animates”** after being asked to refresh the local preview and open “Catch the feeling.” This confirms restored playback in their current browser. Device/viewport dimensions, the click effects and hosted playback were not separately confirmed by this reply. Automated local visual inspection remains limited by the browser access policy.
