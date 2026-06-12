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
| Discovery (fog-of-war) | Checkpoints start as faint `?` pins at their true spot; entering a wider **discoveryRadius** resolves them (marker + geofence + panel row unlock, one-way latch). Awards **Pathfinder** badge when all are found; **grants no points** (perfect run stays 1000). See [`docs/specs/2026-06-12-fog-of-war-discovery-design.md`](../specs/2026-06-12-fog-of-war-discovery-design.md). |
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
| Data grounding | **Real** Moab geometry — OSM trails + BLM/UGRC land ownership & trailheads; **only the game layer is mocked**, never contradict local knowledge/imagery (**D-011**) |

Full scoring detail lives in [`docs/specs/scoring-design.md`](../specs/scoring-design.md) (decision **D-010**).
Verified data sources + endpoints live in [`docs/research/moab-data-sources.md`](../research/moab-data-sources.md) (decision **D-011**, which amends D-002/D-004).

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
- **Authoring-time data tooling (one-time, NOT runtime deps):** OSM via Overpass API, BLM/UGRC ArcGIS
  REST (`f=geojson`); `osmtogeojson` to convert OSM, `mapshaper` or `@turf/simplify` to clip-to-bbox +
  simplify. Output is **committed static GeoJSON** — the app makes **no runtime calls** to these hosts
  (they send no CORS headers). Full endpoint list in `docs/research/moab-data-sources.md`.

## Demo setting (real geography, fictional game)

A quest over a **real** Moab, UT trail system (onX Offroad heartland). Recommended area:
**Klondike Bluffs / Bar M (Moab Brands)** — real BLM singletrack that runs right up against the
**Arches National Park** boundary, which gives an authentic public-BLM-vs-restricted-NPS edge for the
access mechanic (locals know it; it reads true on the imagery). Final center/bbox + exact checkpoints
are chosen from the fetched GeoJSON at authoring time.

**Real, sourced (must match imagery + local knowledge):**

- **Trail lines** — OSM hero trails for the chosen system (real names, real geometry).
- **Access zones** — real **land-ownership** polygons reclassified into tiers: BLM-open → **public**,
  State/SITLA/WSA → **caution**, **NPS (Arches) / private → restricted**. Point-in-polygon runs on
  these real boundaries.
- **Checkpoints** — 5, anchored to real trailheads / trail junctions along the loop; 3 scenic ones
  carry **photo prompts**. Real names assigned from the data (no invented places).
- **Geocache** — a fuzzy ~150 m **search circle** placed off the route at a real off-trail spot, with a
  small exact cache geofence inside it (no marker — found by exploring).

**Mocked (the game layer, clearly labeled):** quest storyline/briefing, point values, badges, photo
prompts, the geocache objective, and the completion **posterboard** (pre-seeded with 3–4 fictional
prior-quester messages, session-only).

**Disclaimer shown in-app:** *"Trail and land geometry are real and sourced (OSM / BLM / UGRC); the
quest, scoring, and access tiers are a fictional game — not legal, navigational, or land-access
guidance."* Attribution string per `docs/DATA-SOURCES.md`.

## File plan

```text
package.json · vite.config.ts · tsconfig.json · index.html · .gitignore
components.json             // shadcn/ui config (style, aliases)
src/
  main.tsx · App.tsx
  index.css                 // Tailwind v4 entry + dark/orange theme tokens (CSS vars)
  lib/utils.ts              // cn() helper (clsx + tailwind-merge) for shadcn
  components/ui/            // shadcn primitives: card, button, badge, dialog (or sonner toaster)
  types/quest.ts            // Quest, Checkpoint (w/ optional photoPrompt + discoveryRadius), AccessZone,
                            //   ZoneClass, Geocache (searchArea + exact geofence), PosterMessage, BadgeId types
  data/sources/             // committed REAL GeoJSON (clipped+simplified at authoring time):
                            //   moab_trails.geojson (OSM), land_ownership.geojson (BLM/UGRC),
                            //   trailheads.geojson — + SOURCES.txt with attribution per file
  data/quest.ts             // the one quest: checkpoints anchored to real trailheads/junctions
                            //   (w/ [lng,lat] + radius + discoveryRadius + photo prompts); geocache
                            //   search circle + exact cache geofence at a real off-route spot
  data/accessZones.ts       // access polygons DERIVED from land_ownership.geojson, reclassified
                            //   into public/caution/restricted (BLM→public, State/WSA→caution, NPS/private→restricted)
  data/briefing.ts          // Claude-pre-generated briefing + checkpoint prompt copy (uses real trail names)
  data/posterboard.ts       // 3–4 pre-seeded fictional prior-quester messages
  lib/geo.ts                // PURE: distanceMeters, isInsideGeofence, classifyAccess (point-in-polygon),
                            //   checkpointProximity → per-cp {distance, withinDiscovery, withinGeofence}
  lib/scoring.ts            // PURE: applyCheckIn, applyPhotoBonus, applyGeocacheFind,
                            //   evaluateCleanRun, awardBadges, computeTotals → {current, max, breakdown}
  state/questReducer.ts     // useReducer: checkpoint statuses, discovered (one-way latch), foundCache,
                            //   cautionCheckedIn flag, score, badges, currentZone, posterMessages
  components/
    MapView.tsx             // Esri satellite tiles, zone polygons, checkpoint markers+geofence circles
                            //   (undiscovered = faint `?` pin, no circle/distance → reveal flourish on
                            //   discovery), geocache search circle (no cache marker), draggable user
                            //   marker, map-click → moveUser
    BriefingCard.tsx        // floating card: AI briefing (incl. geocache hint) + "fictional data" disclaimer
    ScoreCard.tsx           // floating card: total `current/max`, breakdown line, earned badge chips
    CheckpointPanel.tsx     // floating card/drawer: checkpoint list, distance, check-in/photo buttons;
                            //   undiscovered rows render locked ("??? — undiscovered", no distance/buttons)
    AccessBanner.tsx        // current zone status (public/caution/restricted)
    PosterboardDialog.tsx   // completion guestbook: seeded messages + add-yours (session-only, "demo — not saved")
  lib/geo.test.ts           // ~8–12 cases: distance, inside/outside geofence, zone classification,
                            //   discovery threshold (withinDiscovery vs withinGeofence are independent)
  lib/scoring.test.ts       // ~8–12 cases: check-in points, photo bonus, geocache find, clean-run
                            //   eval (caution forfeits it), badge awarding, computeTotals max=1000
  components/App.test.tsx   // smoke render (mock react-leaflet) — app mounts, briefing visible
scripts/
  fetch-moab-data.mjs       // authoring-time: pull OSM/BLM/UGRC → clip to bbox → simplify → write src/data/sources/*
docs/
  plans/IMPLEMENTATION-PLAN.md  // this plan, committed to the repo
  AI_USAGE.md                   // NEW: briefing/copy generation prompts + how AI was used
  WORKLOG.md                    // NEW: running work/chat log
  DATA-SOURCES.md               // NEW: per-dataset attribution (OSM ODbL · UGRC CC BY 4.0 · BLM public domain · Esri)
  ARCHITECTURE.md               // NEW (nice-to-have): short overview + one Mermaid loop diagram
  research/moab-data-sources.md // EXISTS: verified endpoints + D-011 grounding decision
  (update CHANGELOG.md + DECISIONS.md — resolve D-00x open questions; add D-011 amending D-002/D-004)
```

## Core loop & logic

1. App loads the single quest; `MapView` renders zones, checkpoints (marker + geofence circle), and a
   draggable "you" marker.
2. Reviewer **clicks the map or drags** the marker → reducer updates user position.
3. On every move, `lib/geo.ts` recomputes per checkpoint **distance**, **withinDiscovery**, and
   **withinGeofence**, plus the **current access zone** (point-in-polygon). `AccessBanner` reflects the
   zone. Any undiscovered checkpoint now `withinDiscovery` is **latched discovered** by the reducer —
   its `?` pin resolves into the named marker + geofence (reveal flourish + `Discovered: <name>` toast),
   and its `CheckpointPanel` row unlocks. Discovery never reverses and never auto-checks-in.
4. **Check-in** is enabled only when **discovered and** inside a checkpoint geofence:
   - inside **restricted** → check-in **blocked** with a "do not enter" message;
   - inside **caution** → check-in allowed but flagged with a warning, and the run's
     `cautionCheckedIn` flag flips true (forfeits the Clean Run bonus);
   - **public** → normal.
5. `lib/scoring.ts` awards points and updates badges. Point values (perfect run = **1000**):
   **checkpoint** +100 (×5 = 500) · **photo bonus** +50 (×3 scenic = 150) · **geocache** +250 ·
   **Clean Run** +100 (evaluated at completion if `cautionCheckedIn` is false). Badges:
   "Trailhead", "Access Aware", "Shutterbug", "Cache Hunter", "Clean Run", "Pathfinder"
   (all checkpoints discovered — **no points**), "Left Your Mark", "Quest Complete".
   `computeTotals` returns `{current, max, breakdown}` for the ScoreCard.
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
2. **Source + ground real data** (`scripts/fetch-moab-data.mjs`): pull OSM hero trails + BLM/UGRC land
   ownership + trailheads, clip to the Moab bbox, simplify, reclassify ownership → access tiers; commit
   `data/sources/*.geojson` + `docs/DATA-SOURCES.md`. Pick final checkpoints from the real geometry,
   sanity-checking each against the satellite imagery. *(~20 min)*
3. **Data + types**: quest fixture (checkpoints from real trailheads with `discoveryRadius`, photo
   prompts, plus the geocache search/exact geofences), `accessZones` from the reclassified ownership,
   briefing copy (real names + geocache hint), posterboard seed messages. *(~15 min)*
4. **`lib/geo.ts` + tests**: distance, geofence, point-in-polygon classification, `checkpointProximity`
   (independent discovery vs geofence thresholds); Vitest green. *(~20 min)*
5. **MapView**: zones (bold semi-transparent overlays over satellite), real trail lines, checkpoints+geofences
   with **undiscovered `?` pin → reveal flourish** on discovery, geocache search circle (no cache marker),
   draggable/click user marker, live distance, attribution control. *(~25 min)*
6. **Scoring + state + cards**: `lib/scoring.ts` + `scoring.test.ts` (check-in/photo/geocache/clean-run/
   badges/totals); reducer (incl. **discovery latch** + Pathfinder); check-in gated by discovered+geofence
   with access gating + blocked-check-in toast/dialog; **discovery toast + locked CheckpointPanel rows**;
   geocache find; ScoreCard (`current/max` + breakdown), photo bonus, PosterboardDialog on completion;
   floating overlay cards via `frontend-design`. *(~30 min)*
7. **Polish + docs**: disclaimers, write `docs/AI_USAGE.md` + `docs/WORKLOG.md`
   + `docs/ARCHITECTURE.md`, smoke test, update `CHANGELOG.md` + resolve `DECISIONS.md` open questions. *(~15 min)*

> Real-data sourcing adds ~20 min (total ~145 min). Trim by using fewer hero trails / a tighter bbox if
> the timebox is tight; the authoring fetch is the only added work — runtime stays static + frontend-only.

## Verification

- `npm install && npm run dev` → open localhost; confirm map, 5 checkpoints, geofence circles, 3 zones,
  briefing/score/checkpoint cards all render.
- **Real-data sanity:** trail lines + access polygons visibly line up with the Esri satellite imagery
  (trails follow visible tracks; the restricted zone sits on the real Arches/NPS or private boundary);
  attribution control shows OSM/BLM/UGRC/Esri credits; no checkpoint contradicts the imagery.
- **Manual loop**: checkpoints start as faint `?` pins / locked panel rows. Drag/click toward one → on
  crossing its **discoveryRadius** it resolves (flourish + `Discovered:` toast, row unlocks) — check-in
  stays disabled until you also enter the tighter geofence. Continue into the geofence → distance hits 0,
  check-in enables → check in → score (+100) + badge update. Move into the **restricted** zone's checkpoint
  → check-in blocked. Move into the **caution** zone → check-in flagged (Clean Run forfeited). Tap photo
  bonus → +50, "Shutterbug" earned. Explore inside the **geocache search circle** → +250, "Cache Hunter".
  Discover all checkpoints → "Pathfinder" (no points). Visit all reachable checkpoints → "Quest Complete" →
  **posterboard** opens → add a message → "Left Your Mark". Confirm ScoreCard shows `current/max` (max 1000,
  unchanged by Pathfinder) and a clean run awards +100.
- `npm test` (Vitest) → geo unit tests + **scoring unit tests** + App smoke test pass.
- Skim `docs/AI_USAGE.md` to confirm the AI authoring story is documented honestly.

## Out of scope (per non-goals)

Backend, auth, real GPS, multiplayer, real photo verification, multiple quests, persistence. All
listed as roadmap items, not built in this pass.

**Note (D-011):** real trail/land *geometry* is now in scope and sourced — but **legal/authoritative
access assertions, real-time closures, and routing are still out of scope.** The access tiers are an
illustrative reclassification of real ownership, surfaced with a clear "not legal/navigational guidance"
disclaimer; we never assert real-world permission to enter.
