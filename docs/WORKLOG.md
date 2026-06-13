# Work Log

A running log of the implementation session (2026-06-12 / 06-13). Planning-phase history lives in
`docs/CHAT-LOG.md`; this log covers the build, which ran through the per-step PR train (see `docs/CICD.md`).

## Setup

- Stood up the CI/CD pipeline: repo made public, GitHub Actions CI gate (`ci.yml`) + Pages deploy
  (`deploy.yml`), branch protection requiring CI, Copilot review on every PR, GitHub Pages live demo.

## Build steps (one PR each, off an updated `main`)

| PR | Step | Notes |
| --- | --- | --- |
| #1 | Scaffold + CI/CD rails | Vite 6 + React 18 + TS, Tailwind v4, Leaflet/Turf, Esri map; `ci.yml` + `deploy.yml`; first Pages deploy. Copilot: gate dev `base` on build, verify-before-deploy. |
| #2 | Source + ground real Moab data | `fetch-moab-data.mjs` (OSM/UGRC/BLM/USGS), reclassified ownership → tiers, on-trail route via Turf network shortest-path, elevation profile. Adversarial data-verification workflow caught a BLM `MultiLineString` mis-attribution (Copilot flagged it too) + PII in the User-Agent. |
| #3 | Types + typed fixtures | `types/quest.ts`, typed quest/zones/route/briefing/posterboard/badges; GeoJSON via Vite `?raw`. Copilot: empty-FC guard + test assertion. |
| #4 | `lib/geo.ts` + tests (TDD) | distance/geofence/classifyAccess/proximity/gain/routeTotals/formatLatLon/toUTM. Geo review workflow + Copilot caught `computeGain` null-corruption and `toUTM` band/zone edge bugs. |
| #5 | MapView | All Leaflet layers, fog-of-war markers, geocache circle, forbidden marker, draggable/click user, hillshade, coordinate HUD. Browser-verified. Copilot: type `trailsFC`, hoist route coords, add interactivity tests. |
| #6 | Scoring + reducer + cards | Pure scoring + reducer (TDD), 5 overlay cards, sonner toasts. Browser-verified the full loop to a perfect **1000** with all 8 badges. Scoring review workflow + Copilot caught a completion/delta coupling + dialog a11y. |
| #7 | Polish + docs | README (live demo), `AI_USAGE.md`, `ARCHITECTURE.md` (Mermaid), `CICD.md`, `LICENSE` (MIT), CHANGELOG, this log. |

## Verification highlights

- **61 tests** (pure geo + scoring + reducer integration + data + App smoke), all green in CI.
- Full game loop verified live in Chrome at each UI step; clean console.
- Three adversarial multi-agent verification workflows (data, geo, scoring/reducer) found real bugs the
  happy-path tests missed.

## Honest note

A `curl` reachability probe falsely reported BLM/Overpass as blocked; the human corrected it (it was a
Windows-`schannel` TLS quirk), recovering the BLM attribute layer for Node fetch. Details in `docs/AI_USAGE.md`.
