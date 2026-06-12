# Terrain & Named-Feature Polish — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration
**Relates to:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) (D-004, D-011 grounding, D-012) · [moab-data-sources.md](../research/moab-data-sources.md)

## Summary

Four cheap polish items that deepen the sense of real ground truth without new scope risk:

1. **Hillshade toggle** — a keyless Esri World Hillshade overlay the reviewer can fade in over the
   satellite imagery for topographic depth.
2. **Photo prompts anchored to real named features** — the (mocked) photo-prompt copy references the
   nearest real OSM feature (named arch, peak, viewpoint) instead of a generic "scenic spot."
3. **Named WSA caution zone** — when a caution polygon is a real Wilderness Study Area, the access
   banner names it (e.g. *Behind the Rocks WSA*) using the polygon's own attributes.
4. **Live coordinate readout** — a small HUD showing the simulated user's real lat/lng (and UTM 12S),
   reinforcing that positions are real-world coordinates.

These are the "trim-first" tier: each is independently optional and individually small.

## Why this direction

- Each item makes a **mocked** layer (photo prompts) or a **derived** layer (caution tiers) point at
  verifiable real ground truth, tightening the D-011 grounding promise.
- Hillshade and the coordinate readout are pure presentation — no data model change.
- All sources are already-verified hosts or keyless tiles; nothing new to authenticate.

## 1. Hillshade toggle

- **Source (verified keyless, 200/JPEG over Moab):**
  `https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}`
  Attribution: `Hillshade © Esri` (same Esri ToU family as the World Imagery basemap).
- **Implementation:** a second Leaflet `TileLayer` at reduced opacity, toggled via a small control
  (or Leaflet `LayersControl`). Off by default so the red-rock imagery leads.
- **Public-domain alternative:** USGS 3DEP hillshade
  (`basemap.nationalmap.gov/.../USGSHillshade/...`) if an all-public-domain stack is preferred.

## 2. Photo prompts anchored to real features

- **Source:** OSM via the **already-verified Overpass host** (`overpass-api.de`), filtered for
  `natural=peak|arch`, `tourism=viewpoint`, and named `natural=rock` near each scenic checkpoint —
  fetched at authoring time, committed as `data/sources/named_features.geojson` (ODbL).
- **Use:** for each of the 3 scenic checkpoints, pick the nearest named feature and weave its real
  name into the photo-prompt copy:
  *"Frame the La Sal Mountains from the overlook"* / *"Get the shot looking toward Tukuhnikivatz."*
- **Honesty:** the prompt text is the game (mocked), the **feature name is real**. No feature is
  invented; if no named feature is nearby, the prompt stays generic.

## 3. Named WSA caution zone

- **No new endpoint.** The WSA designation already rides on the land-ownership / BLM SMA layer the
  research doc verified (caution tier = `State/SITLA/WSA`). This spec keeps the real WSA **name** from
  the polygon attributes instead of discarding it.
- **Use:** when the highest-precedence caution polygon is a WSA, `AccessBanner` shows
  `CAUTION — Behind the Rocks WSA` (real name from `ownerLabel`, surfaced by the
  [attribute-surfacing spec](2026-06-12-real-attribute-surfacing-design.md)).
- This makes the caution tier concrete and locally recognizable rather than a generic band.

## 4. Live coordinate readout

- A small map-corner HUD showing the draggable user marker's position:
  `38.5731°N, 109.5498°W · 12S 626k 4270k`.
- **Pure helpers (`lib/geo.ts`), unit-tested:**
  - `formatLatLon(point): string` — fixed-precision, hemisphere-suffixed.
  - `toUTM(point): { zone: string; easting: number; northing: number }` — WGS84 → UTM 12S.
- Updates on every `moveUser`; purely presentational, no scoring or state impact.

## What this explicitly does NOT change

- **Movement** — click-to-move + draggable marker, unchanged.
- **Access model / scoring** — tiers, gating, and the 1000-pt model are untouched (the WSA item only
  changes the *label*, not the tier).
- **Basemap default** — Esri World Imagery still leads; hillshade is an opt-in overlay.
- **Disclaimers** — unchanged; named features and hillshade are real, the quest stays a game.

## Scoring / badges

No points, no badges. Pure authenticity polish.

## Testing

- `lib/geo.test.ts` — `formatLatLon` (precision + hemisphere) and `toUTM` (a known
  lat/lng → expected zone/easting/northing within tolerance).
- No reducer/scoring tests (no state or score impact).

## Build-sequence impact

- **Step 2 (Data):** authoring fetch of `named_features.geojson`; thread nearest-feature names into
  the photo-prompt copy and keep WSA names on caution polygons.
- **Step 3 (geo + tests):** `formatLatLon` + `toUTM` + tests.
- **Step 4 (MapView):** hillshade `TileLayer` + toggle; coordinate HUD.
- **Step 5 (banner):** WSA-named caution label (reuses attribute-surfacing's `ownerLabel`).

Each of the four is independently shippable and independently cuttable if the timebox runs short.

## Out of scope

- Contour-line or DEM-mesh rendering.
- Reverse-geocoding at runtime (named features are committed at authoring time).
- Any feature name not present in OSM (no invented landmarks).
