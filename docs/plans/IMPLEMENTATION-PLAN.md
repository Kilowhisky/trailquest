# TrailQuest — Minimal 1–2 Hour Implementation Plan

## Context

The repo is currently a **handoff package**: rich docs (`README.md`, `docs/*`) describing
TrailQuest — an AI-generated, access-aware outdoor scavenger hunt — but **no application code**.
The onX take-home asks for an AI-assisted *geospatial* app, judged on thinking process over
polish, scoped to 1–2 hours. The goal of this change is to scaffold a frontend-only prototype
that demonstrates the core geospatial quest loop end-to-end and makes the spatial reasoning
visible and reviewable.

All structural decisions were resolved with the user via `/grill-me` (see table below).
This plan reflects only the chosen approach.

| Branch | Decision |
| --- | --- |
| Map | Leaflet via `react-leaflet` (no API key) |
| AI briefing | Pre-generated with Claude, committed as fixtures + documented in `docs/AI_USAGE.md` |
| Quest scope | One rich quest, ~5 checkpoints, hardcoded |
| Data format | Typed TS objects whose geometry is GeoJSON-compatible (`[lng,lat]`) |
| Access logic | Restricted **blocks** check-in · caution **warns** (still counts) · public clean |
| Location control | Click-to-move + draggable "you" marker |
| Testing | Vitest on pure geo functions + one component smoke test |
| Photo prompts | Self-attest "I got the shot" bonus button (mock, clearly labeled) |
| Scoring | Objective-based, **perfect run = 1000 pts**; **no time bonus** (teleport-friendly sim location) |
| Sidequest | Hidden **geocache** found via a fuzzy ~150 m search circle off-route (+250, "Cache Hunter") |
| Access scoring | **Clean Run** bonus (+100) for finishing with no caution-zone check-ins |
| Posterboard | Mock, **session-only** completion guestbook; grants a badge, no points (extends D-005) |
| Layout | Floating overlay cards over a full-screen map |
| UI kit | Tailwind v4 + a few shadcn/ui primitives (Card, Button, Badge, Dialog/Toast) |
| Theme | Dark, rugged outdoor; warm orange/amber accent; high contrast |
| Basemap | Keyless **Esri World Imagery** (satellite); access zones as bold semi-transparent overlays |

Full scoring detail lives in [`docs/specs/scoring-design.md`](../specs/scoring-design.md) (decision **D-010**).

## Repo docs convention

Plans, specs, implementation notes, decision/changelog updates, and a running work log live under
`docs/` **in the repo** — the source of truth, not just the harness plan file.

- `docs/plans/IMPLEMENTATION-PLAN.md` — this plan, committed into the repo.
- `docs/specs/` — any feature/spec detail that emerges.
- `docs/AI_USAGE.md` — how Claude was used + the briefing/copy generation prompts.
- `docs/WORKLOG.md` — running chat/work log of what was done and why.
- Update existing `CHANGELOG.md` and `docs/DECISIONS.md` (resolve the D-00x open questions).

## Stack

- **Vite + React 18 + TypeScript** (pin React 18 + `react-leaflet@4` to avoid bleeding-edge breakage)
- **Leaflet** via `react-leaflet`; basemap = keyless **Esri World Imagery** `TileLayer`
  (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
  with required Esri attribution). Markers, geofence circles, and access polygons drawn on top.
- **Turf.js** (`@turf/turf`) for distance + point-in-polygon
- **Tailwind CSS v4** (via `@tailwindcss/vite`) + a small set of **shadcn/ui** primitives
  (Card, Button, Badge, Dialog/Toast) — deps: `class-variance-authority`, `clsx`, `tailwind-merge`,
  `lucide-react` (icons), `sonner` (toast for blocked check-in). Dark, rugged theme with an
  orange/amber accent set via Tailwind theme tokens / CSS vars.
- Use the **`frontend-design` skill** during implementation to compose the floating overlay cards
  (briefing / score / checkpoint / access banner) so they read polished, not generic.
- **Vitest + @testing-library/react** for the test suite.

## Demo setting (all fictional / demo data)

A fictional offroad loop near **Moab, UT** (onX Offroad heartland), center ≈ `[-109.55, 38.57]`.
Five checkpoints within a small clickable area: Staging Area → Rim Overlook → Slot Canyon View →
Bailout Junction → Loop Finish. **Photo prompts** on the 3 scenic ones (Rim Overlook, Slot Canyon
View, Loop Finish). Three mock access polygons: a broad **public** zone, one **caution** zone
(e.g. a wash), and one **restricted** parcel overlapping near one checkpoint to demonstrate blocked
check-in. One **hidden geocache**: a fuzzy ~150 m **search circle** off the main route with a small
exact cache geofence inside it (no marker — found by exploring). A **posterboard** appears on quest
completion, pre-seeded with 3–4 fictional prior-quester messages. Everything labeled "fictional demo
data — not legal/access guidance" in the UI.

## File plan

```text
package.json · vite.config.ts · tsconfig.json · index.html · .gitignore
components.json             // shadcn/ui config (style, aliases)
src/
  main.tsx · App.tsx
  index.css                 // Tailwind v4 entry + dark/orange theme tokens (CSS vars)
  lib/utils.ts              // cn() helper (clsx + tailwind-merge) for shadcn
  components/ui/            // shadcn primitives: card, button, badge, dialog (or sonner toaster)
  types/quest.ts            // Quest, Checkpoint (w/ optional photoPrompt), AccessZone, ZoneClass,
                            //   Geocache (searchArea + exact geofence), PosterMessage, BadgeId types
  data/quest.ts             // the one hardcoded quest (checkpoints w/ [lng,lat] + radius + photo prompts;
                            //   geocache search circle + exact cache geofence)
  data/accessZones.ts       // 3 typed polygons w/ GeoJSON Polygon coords
  data/briefing.ts          // Claude-pre-generated briefing + checkpoint prompt copy
  data/posterboard.ts       // 3–4 pre-seeded fictional prior-quester messages
  lib/geo.ts                // PURE: distanceMeters, isInsideGeofence, classifyAccess (point-in-polygon)
  lib/scoring.ts            // PURE: applyCheckIn, applyPhotoBonus, applyGeocacheFind,
                            //   evaluateCleanRun, awardBadges, computeTotals → {current, max, breakdown}
  state/questReducer.ts     // useReducer: checkpoint statuses, foundCache, cautionCheckedIn flag,
                            //   score, badges, currentZone, posterMessages
  components/
    MapView.tsx             // Esri satellite tiles, zone polygons, checkpoint markers+geofence circles,
                            //   geocache search circle (no cache marker), draggable user marker,
                            //   map-click → moveUser
    BriefingCard.tsx        // floating card: AI briefing (incl. geocache hint) + "fictional data" disclaimer
    ScoreCard.tsx           // floating card: total `current/max`, breakdown line, earned badge chips
    CheckpointPanel.tsx     // floating card/drawer: checkpoint list, distance, check-in/photo buttons
    AccessBanner.tsx        // current zone status (public/caution/restricted)
    PosterboardDialog.tsx   // completion guestbook: seeded messages + add-yours (session-only, "demo — not saved")
  lib/geo.test.ts           // ~6–10 cases: distance, inside/outside geofence, zone classification
  lib/scoring.test.ts       // ~8–12 cases: check-in points, photo bonus, geocache find, clean-run
                            //   eval (caution forfeits it), badge awarding, computeTotals max=1000
  components/App.test.tsx   // smoke render (mock react-leaflet) — app mounts, briefing visible
docs/
  plans/IMPLEMENTATION-PLAN.md  // this plan, committed to the repo
  AI_USAGE.md                   // NEW: briefing/copy generation prompts + how AI was used
  WORKLOG.md                    // NEW: running work/chat log
  ARCHITECTURE.md               // NEW (nice-to-have): short overview + one Mermaid loop diagram
  (update CHANGELOG.md + DECISIONS.md — resolve D-00x open questions)
```

## Core loop & logic

1. App loads the single quest; `MapView` renders zones, checkpoints (marker + geofence circle), and a
   draggable "you" marker.
2. Reviewer **clicks the map or drags** the marker → reducer updates user position.
3. On every move, `lib/geo.ts` recomputes **distance to each checkpoint**, **inside/outside geofence**,
   and the **current access zone** (point-in-polygon). `AccessBanner` reflects the zone.
4. **Check-in** is enabled only when inside a checkpoint geofence:
   - inside **restricted** → check-in **blocked** with a "do not enter" message;
   - inside **caution** → check-in allowed but flagged with a warning, and the run's
     `cautionCheckedIn` flag flips true (forfeits the Clean Run bonus);
   - **public** → normal.
5. `lib/scoring.ts` awards points and updates badges. Point values (perfect run = **1000**):
   **checkpoint** +100 (×5 = 500) · **photo bonus** +50 (×3 scenic = 150) · **geocache** +250 ·
   **Clean Run** +100 (evaluated at completion if `cautionCheckedIn` is false). Badges:
   "Trailhead", "Access Aware", "Shutterbug", "Cache Hunter", "Clean Run", "Left Your Mark",
   "Quest Complete". `computeTotals` returns `{current, max, breakdown}` for the ScoreCard.
6. Photo prompt: at a checkpoint with a prompt, a mock **"I got the shot"** button grants +50.
7. **Geocache sidequest:** while inside the fuzzy search circle, live distance is computed but the
   cache pin stays hidden; entering the small exact cache geofence fires **+250** + "Cache Hunter".
8. **Posterboard:** on quest completion, `PosterboardDialog` shows the seeded messages; adding one
   appends to session state (labeled "demo — not saved") and grants "Left Your Mark". No points.

Keep `lib/geo.ts` and `lib/scoring.ts` **pure and side-effect-free** so the geospatial reasoning is
unit-testable and obvious to a reviewer (the docs explicitly want the spatial logic visible, not hidden
behind prose).

## Build sequence (timeboxed)

1. **Scaffold + UI kit**: Vite+React+TS, add Tailwind v4 (`@tailwindcss/vite`) + shadcn init, install
   leaflet/react-leaflet/turf; render an Esri-satellite Leaflet map at Moab; set dark/orange theme tokens. *(~20 min)*
2. **Data + types**: quest fixture (checkpoints + photo prompts + geocache search/exact geofences),
   access zones, briefing copy (incl. geocache hint), posterboard seed messages. *(~15 min)*
3. **`lib/geo.ts` + tests**: distance, geofence, point-in-polygon classification; Vitest green. *(~20 min)*
4. **MapView**: zones (bold semi-transparent overlays over satellite), checkpoints+geofences,
   geocache search circle (no cache marker), draggable/click user marker, live distance. *(~25 min)*
5. **Scoring + state + cards**: `lib/scoring.ts` + `scoring.test.ts` (check-in/photo/geocache/clean-run/
   badges/totals); reducer; check-in with access gating + blocked-check-in toast/dialog; geocache find;
   ScoreCard (`current/max` + breakdown), photo bonus, PosterboardDialog on completion; floating overlay
   cards via `frontend-design`. *(~30 min)*
6. **Polish + docs**: disclaimers, write `docs/AI_USAGE.md` + `docs/WORKLOG.md`
   + `docs/ARCHITECTURE.md`, smoke test, update `CHANGELOG.md` + resolve `DECISIONS.md` open questions. *(~15 min)*

## Verification

- `npm install && npm run dev` → open localhost; confirm map, 5 checkpoints, geofence circles, 3 zones,
  briefing/score/checkpoint cards all render.
- **Manual loop**: drag/click into a checkpoint geofence → distance hits 0, check-in enables → check in →
  score (+100) + badge update. Move into the **restricted** zone's checkpoint → check-in blocked. Move into
  the **caution** zone → check-in flagged (Clean Run forfeited). Tap photo bonus → +50, "Shutterbug" earned.
  Explore inside the **geocache search circle** → +250, "Cache Hunter". Visit all reachable checkpoints →
  "Quest Complete" → **posterboard** opens → add a message → "Left Your Mark". Confirm ScoreCard shows
  `current/max` (max 1000) and a clean run awards +100.
- `npm test` (Vitest) → geo unit tests + **scoring unit tests** + App smoke test pass.
- Skim `docs/AI_USAGE.md` to confirm the AI authoring story is documented honestly.

## Out of scope (per non-goals)

Backend, auth, real GPS, real land/access data, legal claims, multiplayer, real photo verification,
multiple quests, persistence. All listed as roadmap items, not built in this pass.
