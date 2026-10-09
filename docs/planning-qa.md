# Header, display modes and coastal planning — 9 October 2026

This records the initial planning pass. The direct mode switch, seasonal illustration and revised page order supersede the dropdown design; see [experience-qa.md](experience-qa.md) for the latest implementation and verification.

## Implemented

- Persistent desktop/mobile Inquire button opens a prefilled WhatsApp conversation with the verified owner number, +91 97393 19902. Link targets and encoded text were inspected without opening WhatsApp or sending a message.
- Auto follows the device colour preference; Sun uses warm cream surfaces; Surf uses deep ocean surfaces with separately tuned text, controls and borders. The preference persists locally and is applied before first paint. Original photos retain their colour.
- Twelve-month planner with selected state, month-specific enquiry, and season context. October–February is a general starting suggestion; March–May is the wider season; June–September requires checking with the school. This is not SurfBrothers' availability calendar.
- Lazy-loaded MET Norway card shows near-hour air temperature, wind, humidity, forecast time and model update time in India time. No visitor geolocation or API key. It caches responses, uses a request timeout and retry backoff, rejects stale/missing temperature, clears expired readings and links attribution/licence.
- Theme choices and secondary seasonal sources use native disclosure controls. Month changes are announced through a polite live region. Header touch controls are at least 44 px high.

## Research applied

- [Nielsen Norman Group: Dark Mode](https://www.nngroup.com/articles/dark-mode-users-issues/) informed following the device preference while providing an explicit override and adapting full surfaces instead of merely inverting images.
- [Nielsen Norman Group: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) informed compact theme choices, a focused selected-month panel, and optional source detail.
- [Walk on Water's Mulki guide](https://walkonwater.in/surfing-in-mulki/) supports the October–May beginner season and October–February starting window, with monsoon caveats. [Mantra Surf Club's seasonal guide](https://surfingindia.net/random-stuff/waves-less-surfed-tips-unforgettable-indian-surfari/) adds historical coastal context. These are local-school guidance, not SurfBrothers operating policy. No other schools' prices, swimming requirements, guarantees or inclusions were adopted.
- [MET Norway terms](https://api.met.no/doc/TermsOfService), [licence](https://api.met.no/doc/License), and [Locationforecast documentation](https://api.met.no/weatherapi/locationforecast/2.0/documentation) informed the simple CORS request, rounded fixed coordinates, caching, attribution and honest near-hour forecast label. This direct browser approach is for the current low-volume site; a higher-traffic deployment should use an identifying caching proxy in accordance with provider guidance.

## Verification

- All 17 automated tests passed: existing business rules and frame-pack loader regressions, plus forecast hour selection, unit conversion, real zero values, invalid/stale data and missing optional readings.
- Production build passed. Final CSS is 59.72 KB (13.55 KB gzip); main JS is 73.20 KB (25.93 KB gzip). Existing responsive animation packs remain in place.
- Fresh production browser checks succeeded at 1440×1000 desktop, 390×844 phone, and the existing 652 px preview. No horizontal document overflow at measured widths. The header Inquire, theme and Menu controls fit at 390 px.
- Tested Sun and Surf changes, persisted Surf on reload/new tab, Auto selection, Escape dismissal and focus return, compact navigation, and January/June selection with matching WhatsApp text. Restored Auto after QA.
- Actual browser weather request succeeded: 27°C, 12 km/h and 92% humidity for 9 October, 11:30 pm IST; model updated 10:51 pm IST. This is historical test evidence, not a fixed displayed value. The page will fetch/use its current forecast when visited.
- Browser warning/error log was empty in the temporary QA tab.
- Fixed the mobile floating button's Surf-mode contrast after visual inspection; restored its orange background. Theme-menu focus return avoids programmatic scrolling. Weather icons reset correctly when a later reading is clear.
- Existing animation was confirmed working by the user earlier in the same conversation. This pass verified planning/theme changes, not new FPS measurements or hosted performance.
- Temporary viewport override was reset and the temporary QA tab closed. The user's original local and Maps tabs remain.

## Visual evidence

- `screenshots/planning-surf-desktop.png`
- `screenshots/planning-sun-mobile.png`
- `screenshots/planning-weather-mobile.png`

Updated local production preview: http://127.0.0.1:4173/

Updated static upload: `deliverables/surfbrothers-vercel-drop.zip`. No deployment was performed; the existing Vercel URL still has the previously uploaded version.
