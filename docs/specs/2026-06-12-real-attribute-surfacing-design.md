# Real Attribute Surfacing — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration
**Relates to:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) (D-004, D-011 grounding, D-012) · [moab-data-sources.md](../research/moab-data-sources.md)

## Summary

The authoring-time fetch already pulls rich layers (OSM trails, BLM/UGRC land ownership,
trailheads) but the plan only consumes their **geometry**. This spec surfaces the **attribute
tables** that come free with that geometry, so the UI reads as data-driven rather than invented:

1. **Real land-owner string on the access banner** — the verbatim `owner`/`admin` value from the
   land-ownership polygon the user is standing in, shown next to the game's access tier.
2. **Real checkpoint metadata chips** — difficulty, surface, and mileage pulled from OSM tags /
   the BLM MTB layer, rendered on each checkpoint.
3. **Real trailhead amenities** — parking / restroom facts from the BLM Recreation Sites or UGRC
   trailhead points, for checkpoints anchored to a trailhead.

This is the highest authenticity-per-minute enhancement: the data is already being fetched, so the
cost is mostly threading existing fields through to the overlay cards.

## Why this direction

- It makes the **access mechanic** — onX's differentiator ([D-004](../DECISIONS.md)) — read as a
  real boundary lookup ("Entering Arches National Park — NPS"), not a hand-drawn polygon.
- It directly honors the grounding principle (D-011): *never contradict what a local knows or what
  the imagery shows*. A verbatim owner string and a real difficulty rating can't drift from reality.
- Near-zero scope risk: no new endpoints, no new runtime calls — only `outFields=*` (already used)
  and a few extra committed properties.

## Honesty framing (load-bearing)

The **tier mapping is the game; the source string is the truth.** The banner shows both, visually
distinct:

```text
┌─────────────────────────────────────────┐
│  RESTRICTED  (game tier)                 │
│  Arches National Park — NPS  (source)    │
└─────────────────────────────────────────┘
```

The disclaimer is unchanged: geometry + owner labels are real and sourced; the tier reclassification
and the quest are an illustrative game — not legal/access guidance.

## Data captured at authoring time

The `scripts/fetch-moab-data.mjs` step keeps `outFields=*` and preserves these properties onto the
committed GeoJSON (no extra requests):

| Surface | Source layer | Fields kept |
| --- | --- | --- |
| Owner label | UGRC Land Ownership (`owner`, `admin`, `state_lgd`) or BLM SMA | `owner` / `admin` → `ownerLabel` |
| Checkpoint difficulty/surface/length | OSM (`mtb:scale`, `sac_scale`, `surface`) + BLM `BLM_Natl_MTB` (difficulty, miles) | `difficulty`, `surface`, `lengthMi`, `attrSource` |
| Trailhead amenities | BLM Recreation Sites / UGRC Trailheads | `amenities[]` (e.g. `parking`, `vault toilet`) |

Each surfaced field carries an `attrSource` tag (`OSM` / `BLM` / `UGRC`) so the UI can footnote
provenance and the demo never implies a fact it can't cite.

## Pure geo addition (`lib/geo.ts`)

`classifyAccess(point, zones)` is extended to return the owning feature's real label, not just the
tier — staying pure and side-effect-free:

```ts
classifyAccess(point, zones): { tier: ZoneClass; ownerLabel: string | null }
```

`tier` still follows the most-restrictive precedence rule (`restricted > caution > public`, D-011);
`ownerLabel` is the `ownerLabel` property of the highest-precedence polygon containing the point, or
`null` when the point is outside all polygons (the permissive `public` fallback — no owner to show).

## Types (`types/quest.ts`)

- `Checkpoint` gains optional `difficulty?`, `surface?`, `lengthMi?`, `amenities?: string[]`,
  `attrSource?`.
- `AccessZone` gains `ownerLabel: string` (verbatim source value) alongside its game `class`.

## UI

- **AccessBanner** — render the game tier as the headline and `ownerLabel` as a sourced subline
  (with a tiny provenance footnote, e.g. `source: UGRC`). Hide the subline when `ownerLabel` is null.
- **CheckpointPanel** — per-checkpoint chips: `Black Diamond · 3.2 mi · slickrock` with an `attrSource`
  tooltip; render only the chips that have data.
- **CheckpointPanel (trailhead rows)** — small amenities line: `parking · vault toilet (BLM)`.

## Scoring / badges

No change. This spec is presentation of real attributes only; it adds no points and no badges.

## Testing

- `lib/geo.test.ts` — `classifyAccess` returns the correct `ownerLabel` for a point inside a known
  polygon, and `null` for a point in the public fallback. Tier precedence behavior is unchanged and
  its existing cases still pass.
- No new reducer or scoring tests (no state/score impact).

## Build-sequence impact

- **Step 2 (Data + types):** keep `outFields=*`; map `owner`/`admin` → `ownerLabel`; carry
  difficulty/surface/length/amenities onto the checkpoint fixtures from the fetched attributes.
- **Step 3 (geo + tests):** extend `classifyAccess` return shape + one test.
- **Step 4/5 (MapView/cards):** banner subline, checkpoint chips, amenities line.

No new dependencies, endpoints, or runtime calls. Fits inside the existing timebox.

## Out of scope

- Inventing or "enriching" attributes the source doesn't provide — only verbatim fields are shown.
- Per-attribute citations beyond the coarse `attrSource` tag.
