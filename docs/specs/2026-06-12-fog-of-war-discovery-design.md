# Fog-of-War Discovery — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration
**Relates to:** `docs/plans/IMPLEMENTATION-PLAN.md`

## Summary

A "next-level" experience enhancement to the TrailQuest prototype: checkpoints are
**discovered through exploration** rather than shown up front. Each checkpoint begins as a
faint `?` pin at its true location; moving the simulated user within a **discovery radius**
(wider than the check-in geofence) resolves it into a named checkpoint — marker, geofence
ring, and checkpoint-panel row all unlock together with a reveal flourish and a toast.

This turns the core loop from **approach → check in** into
**explore → discover → approach → check in**, making the geospatial reasoning *felt* (the
thing the take-home judges reward) without changing the decided movement model or adding real
scope risk.

## Why this direction

- Of the candidate "feel" enhancements, fog-of-war is the most genuinely *geospatial* — the
  mechanic is driven entirely by where the user has been (proximity over time), not by cosmetic
  animation.
- It layers on **step 3** of the existing core loop (the per-move recompute of distance + zone),
  which the plan already performs but currently uses only to enable/disable a button.
- It stays **frontend-only**, uses only `distanceMeters()` comparisons, and remains fully
  unit-testable.

## Scope decisions (resolved in brainstorm)

| Decision | Choice |
| --- | --- |
| Fog flavor | **Marker-level reveal** (not a full map fog overlay) |
| Telegraphing | **Faint `?` pin at the checkpoint's true location** (reviewer can see roughly where to head) |
| Reveal trigger | Entering a per-checkpoint `discoveryRadius` (wider than the check-in geofence) |
| Persistence | One-way latch — once discovered, always discovered |
| Scoring tie-in | Add a **"Pathfinder"** badge when all checkpoints are discovered; discovery itself grants no points |

## What this explicitly does NOT change

- **Movement** — still click-to-move + draggable "you" marker (locked decision in the plan).
- **Access gating** — restricted blocks / caution warns / public clean, unchanged.
- **Check-in** — still requires entering the tighter `radius` geofence.
- **Basemap** — keyless Esri World Imagery satellite, unchanged.
- **Disclaimers** — still "fictional demo data." Fog is a game mechanic, not a visibility claim.
- **Timebox shape** — one feature on top of the existing build sequence.

## Geospatial model

Each checkpoint gains a second radius. The only new concept is that **discovery and check-in
are independent distance thresholds**:

```text
discoveryRadius  (~150m)  -> resolves the '?' into a named checkpoint
radius           (~50m)   -> enables check-in   (existing geofence, unchanged)
```

`discoveryRadius > radius`, so a checkpoint is always discovered before it can be checked in.
Both are plain `distanceMeters(user, checkpoint)` comparisons.

## State

Add discovery tracking to the reducer (`state/questReducer.ts`):

- A per-checkpoint `discovered: boolean` (or a `discovered: Set<checkpointId>` on quest state).
- On every `moveUser`, geo logic returns which **undiscovered** checkpoints are now within
  their `discoveryRadius`; the reducer latches those to `discovered = true`.
- Discovery is **one-way** — never un-discovered by moving away.
- Discovery does **not** auto-check-in. Check-in remains an explicit user action gated by the
  geofence.

## Pure geo additions (`lib/geo.ts`)

- Extend (or add) a function that, given the user position and the quest, returns per-checkpoint
  `{ distance, withinDiscovery, withinGeofence }`.
- Keep it pure and side-effect-free so the two independent thresholds are obvious and testable.

## UI consistency across surfaces

The fog only holds if **every surface** hides undiscovered checkpoints consistently:

- **MapView**
  - Undiscovered: dim `?` marker, **no** geofence circle, **no** distance label.
  - Discovered: full named marker + geofence ring + live distance, entering with a brief
    scale/fade-in reveal.
- **CheckpointPanel**
  - Undiscovered rows render locked: `??? — undiscovered`, no distance, no check-in button.
  - Rows unlock in place the moment the checkpoint is discovered.
- **Toast** (sonner, already in the stack)
  - `Discovered: <Checkpoint Name>` fires on reveal.

## Scoring / badges

- Add one badge: **"Pathfinder"** — awarded when **all 5 scored checkpoints** are discovered. (The 6th
  unscored "forbidden" waypoint from D-013 is shown from the start as a "restricted — do not enter" marker,
  not a discovery target, so it does not gate Pathfinder.)
- Canonical badge set after this addition = 8 (D-013): Trailhead, Access Aware, Shutterbug, Cache Hunter,
  Clean Run, **Pathfinder**, Left Your Mark, Quest Complete.
- Discovery grants **no points** — points stay tied to actual check-ins, keeping scoring honest.

## Testing

- `lib/geo.test.ts` — add cases for the discovery threshold, including the key invariant that
  `withinDiscovery` and `withinGeofence` are independent (a point inside discovery but outside
  the geofence; a point inside both).
- Reducer test — a `moveUser` that crosses a `discoveryRadius` latches `discovered = true` and
  does **not** auto-check-in.
- App smoke test — unchanged (app mounts, briefing visible).

## Build-sequence impact

Slots into the existing timeboxed sequence with minimal additions:

- **Step 2 (Data + types):** add `discoveryRadius` to the checkpoint type + quest fixture; add
  `discovered` to the relevant types.
- **Step 3 (geo + tests):** add discovery-threshold function + tests.
- **Step 4 (MapView):** render `?` vs. discovered states; reveal flourish.
- **Step 5 (Scoring + state + cards):** discovery latch in reducer; Pathfinder badge; locked
  panel rows; discovery toast.

No new dependencies. No backend. No change to the movement or access models.
