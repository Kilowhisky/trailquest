# TrailQuest Scoring — Design Spec

**Date:** 2026-06-12
**Status:** Consolidated 2026-06-12 (D-013); pending implementation
**Related:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) (D-004, D-005, D-010, **D-013**) · [fog-of-war spec](2026-06-12-fog-of-war-discovery-design.md)

## Purpose

Define how TrailQuest scores a quest run: what earns points, how access-awareness
factors in, the two new mechanics (hidden geocache sidequest + completion posterboard),
and how the score is displayed. Keeps the scoring math pure, visible, and unit-testable
so a reviewer can see the geospatial/product reasoning rather than have it hidden behind
prose.

## Design principles

- **Objective-based.** Score is driven by completing objectives, not by speed.
- **No time bonus.** The demo uses click-to-move / draggable simulated location
  ([D-003](../DECISIONS.md)), so a reviewer can teleport between checkpoints. A
  speed-based timer would be both meaningless and a visible tell. An elapsed-session
  timer MAY be shown as a neutral flavor stat, but it does **not** affect score.
- **Access-awareness scores.** Responsible access is onX's core differentiator
  ([D-004](../DECISIONS.md)), so it earns points directly (Clean Run bonus), not just a badge.
- **Optional objectives carry real weight.** The cache + photos + clean run make up
  half the perfect score, so exploring and behaving responsibly clearly matters.

## Point model

Perfect run = **1000 points**.

| Source | Value | Subtotal | Notes |
|---|---|---|---|
| Checkpoint check-in | 100 each | 500 | 5 scored checkpoints (discovered via fog-of-war; all in public/caution so all reachable — D-013) |
| Photo bonus | 50 each | 150 | 3 scenic checkpoints with a photo prompt; "I got the shot" self-attest |
| Hidden geocache (sidequest) | 250 | 250 | One-time discovery bonus |
| Clean Run bonus | 100 | 100 | Awarded at completion if no check-in ever occurred inside a caution zone |
| Posterboard message | 0 | 0 | Completion reward only (badge, no points) |
| **Max** | | **1000** | |

## Mechanics

### Check-in (unchanged from plan)

Enabled only when the user is inside a checkpoint geofence:

- **Restricted zone** → check-in **blocked** (do-not-enter message). No points.
- **Caution zone** → check-in **allowed but flagged**; counts for points but
  **forfeits the Clean Run bonus**.
- **Public** → normal check-in.

**Restricted reachability (D-013).** None of the **5 scored** checkpoints sit in a restricted zone, so a
perfect run = 1000 and the Quest Complete badge are achievable. The restricted-block path is demonstrated
live by a **6th, unscored "forbidden" waypoint** just inside the restricted (NPS / Arches) line: its
check-in is always blocked, it grants the **Access Aware** badge, awards **no points**, and does **not**
count toward Quest Complete.

### Hidden geocache (sidequest)

- A **fuzzy ~150 m search circle** is drawn off the main route (no exact marker).
- The user explores inside the circle until a small **exact cache geofence** fires.
- On trigger: **+250** and the **Cache Hunter** badge.
- Live distance (Turf) is computed while searching but the cache pin is not revealed.

### Clean Run bonus

- Evaluated at quest completion.
- **+100** if no check-in was ever performed inside a caution zone.
- Tracked as a boolean on quest state, flipped false on the first caution-zone check-in.

### Posterboard (mock completion reward)

- On quest completion, show a mock guestbook seeded with 3–4 fictional prior-quester
  messages (e.g. "Made it! The slot canyon view is unreal —Dana").
- The user can append a message; it persists in **session state only**, clearly labeled
  **"demo — not saved."**
- Posting grants the **Left Your Mark** badge. No points.
- This is a deliberately mocked, frontend-only stand-in for a future persistent/social
  feature (see D-010 re: D-005).

## Badges

| Badge | Trigger |
|---|---|
| Trailhead | First successful check-in |
| Access Aware | First time the app surfaces an access warning the user acknowledges — a blocked **restricted** check-in attempt **or** a **caution**-zone check-in (D-013) |
| Shutterbug | First photo bonus |
| Cache Hunter | Found the hidden geocache |
| Clean Run | Completed quest with no caution-zone check-ins |
| Pathfinder | All 5 scored checkpoints discovered (fog-of-war); no points |
| Left Your Mark | Posted to the posterboard |
| Quest Complete | All 5 scored checkpoints checked in (all reachable — D-013) |

## Display — ScoreCard overlay

- **Big total:** `450 / 1000` (current / max-possible — the headroom nudges toward the cache).
- **Breakdown line:** `Checkpoints 3/5 · Photos 2 · Cache ✗ · Clean ✓`
- **Badge chips:** earned badges as a row.
- **Per-check-in feedback:** toast (e.g. `+100 Rim Overlook`) with the total animating up.
- **Optional:** neutral elapsed-session time stat (not scored).

## Implementation surface

All scoring is pure and side-effect-free in `src/lib/scoring.ts`, unit-tested with Vitest:

- `applyCheckIn(state, checkpoint, zoneClass)` → new state + points delta
- `applyPhotoBonus(state, checkpoint)` → new state + points delta
- `applyGeocacheFind(state)` → new state + points delta
- `evaluateCleanRun(state)` → bonus at completion
- `awardBadges(state)` → derived badge set
- `computeTotals(state)` → `{ current, max, breakdown }`

State (checkpoint statuses, found-cache flag, caution-check-in flag, score, badges,
posterboard messages) lives in `src/state/questReducer.ts`.

## Out of scope

- Real persistence / backend for the posterboard (roadmap).
- Time-based scoring.
- Leaderboards or cross-user comparison.
