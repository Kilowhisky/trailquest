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
| Layout | Floating overlay cards over a full-screen map |
| UI kit | Tailwind v4 + a few shadcn/ui primitives (Card, Button, Badge, Dialog/Toast) |
| Theme | Dark, rugged outdoor; warm orange/amber accent; high contrast |
| Basemap | Keyless **Esri World Imagery** (satellite); access zones as bold semi-transparent overlays |

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
Bailout Junction → Loop Finish. Three mock access polygons: a broad **public** zone, one **caution**
zone (e.g. a wash), and one **restricted** parcel overlapping near one checkpoint to demonstrate
blocked check-in. Everything labeled "fictional demo data — not legal/access guidance" in the UI.

## File plan

```text
package.json · vite.config.ts · tsconfig.json · index.html · .gitignore
components.json             // shadcn/ui config (style, aliases)
src/
  main.tsx · App.tsx
  index.css                 // Tailwind v4 entry + dark/orange theme tokens (CSS vars)
  lib/utils.ts              // cn() helper (clsx + tailwind-merge) for shadcn
  components/ui/            // shadcn primitives: card, button, badge, dialog (or sonner toaster)
  types/quest.ts            // Quest, Checkpoint, AccessZone, ZoneClass, Badge types
  data/quest.ts             // the one hardcoded quest (checkpoints w/ [lng,lat] + radius)
  data/accessZones.ts       // 3 typed polygons w/ GeoJSON Polygon coords
  data/briefing.ts          // Claude-pre-generated briefing + checkpoint prompt copy
  lib/geo.ts                // PURE: distanceMeters, isInsideGeofence, classifyAccess (point-in-polygon)
  lib/scoring.ts            // PURE: applyCheckIn, awardBadges, totals
  state/questReducer.ts     // useReducer: checkpoint statuses, score, badges, currentZone
  components/
    MapView.tsx             // Esri satellite tiles, zone polygons, checkpoint markers+geofence circles,
                            //   draggable user marker, map-click → moveUser
    BriefingCard.tsx        // floating card: AI briefing + "fictional data" disclaimer
    ScoreCard.tsx           // floating card: score + earned badges
    CheckpointPanel.tsx     // floating card/drawer: checkpoint list, distance, check-in/photo buttons
    AccessBanner.tsx        // current zone status (public/caution/restricted)
  lib/geo.test.ts           // ~6–10 cases: distance, inside/outside geofence, zone classification
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
   - inside **caution** → check-in allowed but flagged with a warning;
   - **public** → normal.
5. `lib/scoring.ts` awards points (checkpoint base + optional photo bonus), updates badges
   ("Trailhead", "Access Aware", "Shutterbug", "Quest Complete"), and detects quest completion.
6. Photo prompt: at a checkpoint with a prompt, a mock **"I got the shot"** button grants a bonus.

Keep `lib/geo.ts` and `lib/scoring.ts` **pure and side-effect-free** so the geospatial reasoning is
unit-testable and obvious to a reviewer (the docs explicitly want the spatial logic visible, not hidden
behind prose).

## Build sequence (timeboxed)

1. **Scaffold + UI kit**: Vite+React+TS, add Tailwind v4 (`@tailwindcss/vite`) + shadcn init, install
   leaflet/react-leaflet/turf; render an Esri-satellite Leaflet map at Moab; set dark/orange theme tokens. *(~20 min)*
2. **Data + types**: quest fixture, access zones, briefing copy. *(~15 min)*
3. **`lib/geo.ts` + tests**: distance, geofence, point-in-polygon classification; Vitest green. *(~20 min)*
4. **MapView**: zones (bold semi-transparent overlays over satellite), checkpoints+geofences,
   draggable/click user marker, live distance. *(~25 min)*
5. **Scoring + state + cards**: reducer, check-in (with access gating + blocked-check-in toast/dialog),
   score/badges, photo bonus, floating overlay cards via `frontend-design`. *(~25 min)*
6. **Polish + docs**: disclaimers, write `docs/AI_USAGE.md` + `docs/WORKLOG.md`
   + `docs/ARCHITECTURE.md`, smoke test, update `CHANGELOG.md` + resolve `DECISIONS.md` open questions. *(~15 min)*

## Verification

- `npm install && npm run dev` → open localhost; confirm map, 5 checkpoints, geofence circles, 3 zones,
  briefing/score/checkpoint cards all render.
- **Manual loop**: drag/click into a checkpoint geofence → distance hits 0, check-in enables → check in →
  score + badge update. Move into the **restricted** zone's checkpoint → check-in blocked. Move into the
  **caution** zone → check-in flagged. Tap photo bonus → score increases, "Shutterbug" earned. Visit all
  reachable checkpoints → "Quest Complete".
- `npm test` (Vitest) → geo unit tests + App smoke test pass.
- Skim `docs/AI_USAGE.md` to confirm the AI authoring story is documented honestly.

## Out of scope (per non-goals)

Backend, auth, real GPS, real land/access data, legal claims, multiplayer, real photo verification,
multiple quests, persistence. All listed as roadmap items, not built in this pass.
