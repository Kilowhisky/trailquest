# TrailQuest Testing — Plan & Spec

**Date:** 2026-06-12
**Status:** Approved (pre-implementation), refined from the implementation plan's testing line
**Related:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [scoring-design.md](scoring-design.md) · [DECISIONS.md](../DECISIONS.md) (D-010, D-011)

## Purpose

Define exactly **what** to test, **why**, and **what to skip** so the test suite proves the
geospatial and scoring reasoning rather than padding coverage. For a take-home judged on thinking
process over polish, the tests double as **documentation of the spatial reasoning** — a reviewer
reading `geo.test.ts` and `scoring.test.ts` should see how geofence boundaries, zone precedence,
and the point model were reasoned about.

## Strategy

- **Test the pure layer hard.** `lib/geo.ts` and `lib/scoring.ts` are pure and side-effect-free by
  design; that's where the real reasoning lives and where bugs are silent. Most value, lowest cost.
- **Test the integration seam.** `state/questReducer.ts` wires geo + scoring + state together — the
  layer where "badge awarded twice" / "check-in counted in a blocked zone" bugs actually appear.
  This is the one addition over the original plan (which only had pure tests + a smoke test).
- **Smoke-test the shell, nothing more.** One mounting test for `App` with `react-leaflet` mocked.
- **Skip** E2E/Playwright, map-render assertions, and tile loading. The manual verification
  checklist in the implementation plan covers the visual loop in a timebox.

Tooling: **Vitest + @testing-library/react** (per the plan). Pure-function and reducer tests need no
DOM; the smoke test mocks `react-leaflet`.

## Test inventory

### `src/lib/geo.test.ts` — spatial primitives

| Case | Asserts |
|---|---|
| `distanceMeters` known pair | Matches a hand-checked Moab distance within ±1 m |
| `distanceMeters` same point | Returns `0` |
| `distanceMeters` symmetry | `d(a,b) === d(b,a)` |
| `isInsideGeofence` clearly inside / outside | True / false respectively |
| `isInsideGeofence` exactly at radius | **Inside** (inclusive `<=` boundary — D-011) |
| `classifyAccess` public-only point | `'public'` |
| `classifyAccess` caution point | `'caution'` |
| `classifyAccess` restricted point | `'restricted'` |
| `classifyAccess` restricted ∩ public overlap | `'restricted'` (most-restrictive precedence — D-011) |
| `classifyAccess` outside all polygons | `'public'` (permissive default — D-011) |
| `classifyAccess` on polygon edge | Documents the point-in-polygon edge convention (Turf default) |

### `src/lib/scoring.test.ts` — point model (perfect run = 1000)

| Case | Asserts |
|---|---|
| `applyCheckIn` public checkpoint | `+100`, status set, `Trailhead` badge on first check-in only |
| `applyCheckIn` caution checkpoint | `+100` **and** `cautionCheckedIn → true`, `Access Aware` badge |
| `applyCheckIn` same checkpoint twice | Idempotent — no double points, no status churn (D-011) |
| `applyPhotoBonus` | `+50`, `Shutterbug` first only, only when `photoPrompt` exists, not twice |
| `applyGeocacheFind` | `+250`, `Cache Hunter`, once only |
| `evaluateCleanRun` clean | `+100` and `Clean Run` badge |
| `evaluateCleanRun` after a caution check-in | `0`, no badge |
| `awardBadges` | Derived badge set matches state |
| `Quest Complete` badge | Fires only when all 5 known checkpoints are checked in |
| `computeTotals` max invariant | **`max === 1000` always**, independent of current state |
| `computeTotals` breakdown | Breakdown string is correct, e.g. `Checkpoints 3/5 · Photos 2 · Cache ✗ · Clean ✓` |

### `src/state/questReducer.test.ts` — integration seam (NEW)

| Case | Asserts |
|---|---|
| `MOVE_USER` | Position updates; current access zone recomputed |
| `CHECK_IN` inside a public geofence | Delegates to scoring; state advances; badge set updates |
| `CHECK_IN` inside a **restricted** zone | Blocked: no points, no status change, but `Access Aware` granted (D-011 #5) |
| `CHECK_IN` while outside any geofence | Rejected — no-op |
| Caution check-in → completion | `cautionCheckedIn` survives to `evaluateCleanRun` (sequencing guard) |
| Geocache: enter search circle, then exact geofence | No reveal inside the fuzzy circle; `+250` fires only inside the exact geofence |
| Full happy-path dispatch sequence | Terminal state totals exactly **1000** |

### `src/components/App.test.tsx` — smoke

| Case | Asserts |
|---|---|
| App mounts (mock `react-leaflet`) | Renders without crashing; briefing card is visible |

## What we deliberately do NOT test

- **Leaflet / map rendering / tile loading** — third-party; low value in a timebox.
- **E2E browser flows (Playwright)** — covered by the manual verification checklist in the plan.
- **Styling / theme tokens** — visual, not logic.
- **AI briefing content** — pre-generated static fixtures (D-010 / AI_USAGE.md), not runtime logic.

## Resolved semantics (see D-011)

These behaviors were ambiguous in the design and are pinned here because each one is a test:

1. **Geofence boundary is inclusive** — a point exactly at `radius` is inside (`distance <= radius`).
2. **Zone precedence on overlap: `restricted > caution > public`** — most-restrictive wins.
3. **Outside all polygons → `'public'`** — permissive fallback so check-in still works; the broad
   public zone is expected to cover the play area anyway.
4. **All bonuses are idempotent** — check-in, photo, and geocache each award exactly once.
5. **Restricted check-in is gated in the reducer, not `applyCheckIn`** — the reducer blocks it
   (no points, no status) but still grants `Access Aware`, since the badge fires on a *heeded*
   warning. `applyCheckIn` stays pure and assumes the check-in is allowed.

## Approximate size

~10 geo cases · ~11 scoring cases · ~7 reducer cases · 1 smoke = **~29 tests**. Small, fast, and
each one earns its place by guarding a real behavior or documenting a real decision.
