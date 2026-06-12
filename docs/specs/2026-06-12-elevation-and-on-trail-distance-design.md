# Elevation & On-Trail Distance — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration
**Relates to:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) (D-011 grounding, D-012) · [moab-data-sources.md](../research/moab-data-sources.md)

## Summary

Add the one real data dimension the prototype is currently missing — **the third dimension** — plus
honest **on-trail distance**:

1. **Real elevation** for every checkpoint and sampled along the route, fetched at authoring time
   from USGS 3DEP and committed as static values. Shown as per-checkpoint elevation, a route
   **elevation profile** sparkline, and a **total climb** figure.
2. **On-trail route geometry** — instead of straight lines between checkpoints, the quest route is
   snapped to the actual OSM hero-trail polylines at authoring time, so the drawn path follows real
   singletrack on the imagery and reported **route mileage is on-trail**, matching signage / MTB
   Project rather than crow-flies.

This makes the geospatial reasoning visibly richer than a flat distance check, and every number is
verifiable against the terrain and the trail signs.

## Why this direction

- Elevation is the most substantive **new** real-data layer not already in the plan; gain/profile is
  what an outdoor user actually plans around.
- An on-trail route can't contradict the imagery (D-011): the line literally traces Captain Ahab /
  HyMasa, and the mileage equals what a local expects.
- Both are computed **at authoring time** and committed static — no runtime calls, consistent with
  the frontend-only / no-CORS architecture.

## Verified sources

- **Elevation — USGS 3DEP EPQS** (keyless, JSON, point query), live-verified over Moab
  `(-109.55, 38.62) → 4,472.97 ft`:
  `https://epqs.nationalmap.gov/v1/json?x={lon}&y={lat}&units=Feet&wkid=4326`
  License: **public domain** (USGS). Credit: `Elevation: USGS 3DEP`.
- **Trail geometry for snapping — OSM** (already fetched for `moab_trails.geojson`, ODbL). No new
  source; the snap reuses the committed hero-trail LineStrings.

## Two distances, kept honest (load-bearing)

The app shows two different distances and must never conflate them:

| Distance | How | Where shown |
| --- | --- | --- |
| **To target** (live) | great-circle `distanceMeters(user, checkpoint)` — the existing Turf calc | per-checkpoint "X m to checkpoint" |
| **Route length** (static) | along-line length of the on-trail route, precomputed at authoring time | "Route: Y mi on-trail" + per-segment |

The live straight-line distance to a target is honest (it *is* the bearing-line gap under simulated
movement); the **route** figure is the on-trail mileage. Labels make the distinction explicit so a
reviewer is never misled.

## Authoring-time computation (`scripts/fetch-moab-data.mjs`)

1. **Elevation:** for each checkpoint `[lng,lat]` and for points sampled every ~100 m along the
   route, GET the EPQS endpoint; write `elevationFt` onto checkpoints and an `elevationProfile`
   array onto the route. (Sequential, throttled; one-time authoring cost.)
2. **Route snapping:** for each consecutive checkpoint pair, `turf.nearestPointOnLine` onto the
   relevant hero-trail LineString, then `turf.lineSlice` to extract the on-trail segment; concatenate
   into one route LineString. Record `turf.length` per segment and total.
3. Commit `data/sources/route.geojson` (the on-trail LineString + `elevationProfile` +
   `segmentMiles[]` + `totalMiles` + `totalGainFt` in properties). Simplify with `@turf/simplify`
   to keep the file small.

If a checkpoint pair has no clean trail path in the data, that segment falls back to a straight line
and is flagged `onTrail: false` in its properties (honest, not hidden).

## Types (`types/quest.ts`)

- `Checkpoint` gains `elevationFt?: number`.
- New `QuestRoute` type: `{ geometry: LineString; segmentMiles: number[]; totalMiles: number;
  totalGainFt: number; elevationProfile: number[] }`.

## Pure additions (`lib/geo.ts`)

The heavy geometry is precomputed at authoring time, so runtime stays trivial and testable:

- `routeTotals(route): { miles: number; gainFt: number }` — pure sums/formatting over committed data.
- `computeGain(profile: number[]): number` — sum of positive deltas (cumulative ascent). Pure,
  unit-tested.

No elevation or routing happens at runtime; the committed numbers are read as-is.

## UI

- **MapView** — draw the committed `route.geojson` LineString as the quest path (follows real
  singletrack), replacing straight connector lines.
- **CheckpointPanel** — per-checkpoint `4,472 ft` chip; "X m to checkpoint" stays the live
  great-circle value.
- **BriefingCard / ScoreCard** — route summary `6.2 mi · +840 ft` and a small inline
  **elevation-profile sparkline** (lightweight SVG, no charting dep).

## Scoring / badges

No change to the point model (still 1000). Elevation and route length are **informational** — adding
a climb-based bonus would reintroduce a movement-model tell under teleport simulation, which the
scoring spec explicitly rejects.

## Testing

- `lib/geo.test.ts` — `computeGain` (positive-delta-only over a known profile, including a flat and a
  descending case) and `routeTotals` formatting.
- Static fixtures (committed elevation/route) need no runtime test; the authoring script is run once.

## Build-sequence impact

- **Step 1/2 (authoring):** add the EPQS elevation fetch + Turf route-snapping to
  `fetch-moab-data.mjs`; commit `route.geojson` with profile + mileage. *(authoring time, off the
  demo clock)*
- **Step 3 (geo + tests):** `computeGain` / `routeTotals` + tests.
- **Step 4 (MapView):** draw the on-trail route LineString.
- **Step 5 (cards):** elevation chips, route summary, profile sparkline.

New dep: none beyond `@turf/*` (already in stack) for the authoring snap. The sparkline is hand-rolled
SVG. This is the most substantive of the three enhancements; if the timebox is tight, **elevation
chips + on-trail route line** are the core, and the profile sparkline is the trim-first item.

## Out of scope

- Runtime elevation lookups or live routing (authoring-time + committed static only).
- 3D / terrain-mesh rendering (Leaflet stays 2D).
- Climb-based scoring.
