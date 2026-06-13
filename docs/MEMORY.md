# Agent Memory

This file is the persistent working memory for AI agents contributing to TrailQuest.

## Purpose

Use this file to preserve project state between agent sessions so each new session can quickly understand:

- what has already been decided
- what has already been implemented
- what is currently broken or incomplete
- what assumptions are in force
- what the next best action is

This file should be updated by any AI agent that makes meaningful changes to the repository.

## Agent operating rules

1. Read this file before making implementation changes.
2. Read `README.md` and all files in `docs/` before major planning.
3. Update this file after meaningful work.
4. Keep entries concise and factual.
5. Do not use this as a scratchpad for every thought.
6. Record durable context only.
7. Keep `docs/CHAT-LOG.md` for chronological chat/session notes.
8. Keep `docs/DECISIONS.md` for product or architecture decisions.
9. Keep `CHANGELOG.md` for user-visible repository changes.

## Current product direction

TrailQuest is an AI-generated, access-aware outdoor scavenger hunt prototype for an onX Maps AI take-home project.

Core idea:

> Turn outdoor map primitives into scored quests using checkpoints, geofences, simulated location, real-ownership-derived access tiers, scoring, badges, and AI-generated quest briefings.

## Current implementation state

**As of 2026-06-13: the app is COMPLETE and shipped.** Live demo:
<https://kilowhisky.github.io/trailquest/>.

- The **full app is built** and merged to `main` through the 7-PR train (PRs #1–#7): scaffold + CI/CD,
  real-data fetch, typed fixtures, pure `lib/geo.ts` + `lib/scoring.ts`, `state/questReducer.ts`, `MapView`,
  the five overlay cards, and docs. **61 tests** green; verified in production to a perfect 1000 / all 8 badges.
- The full corpus shipped: D-010 scoring + D-011 real Moab data + D-012 (all three authenticity tiers) +
  fog-of-war discovery + the D-014 CI/CD process.
- Implementation-phase docs exist: `docs/AI_USAGE.md`, `docs/ARCHITECTURE.md`, `docs/CICD.md`,
  `docs/WORKLOG.md`, `docs/DATA-SOURCES.md`, and a rewritten `README.md` + MIT `LICENSE`.

## Important constraints

- Keep the first implementation frontend-only.
- Vite + React 18 + TypeScript (decided).
- Leaflet via `react-leaflet@4`; keyless Esri World Imagery basemap (decided).
- Turf.js (`@turf/*`) for geospatial helpers.
- **Real Moab geometry** (OSM / BLM / UGRC / USGS), fetched once at authoring time and committed static —
  the app makes **no runtime calls** to those hosts (D-011). Mock **only** the game layer (quest, scoring,
  badges, access tiers).
- Use simulated location (click-to-move + draggable marker); no browser GPS.
- Do not make real legal/authoritative land-access claims; surface the reframed disclaimer (D-011/D-013).
- Do not integrate real onX data.
- Do not add auth, backend, or social features in the first pass (the posterboard is a session-only mock).

## Next best action

The initial build is **done**. Any future work is **enhancement, not initial implementation** — e.g. a
second quest, code-splitting the inlined GeoJSON out of the main bundle, elevation-profile interactions, or
broadening the data area. Re-run the authoring fetch with `node scripts/fetch-moab-data.mjs` (cached) if the
committed data needs refreshing. Continue to ship through the per-step PR train (CI gate + Copilot review +
Pages deploy; see `docs/CICD.md`), and keep this file, `docs/CHAT-LOG.md`, and `CHANGELOG.md` updated.

## Running notes

Append durable notes below as work progresses.

### 2026-06-12 — Initial memory created

The repository was initialized as a documentation-first handoff package for Claude Code / Claude Max. The next agent should use this memory file as the persistent session state and update it after implementation begins.

### 2026-06-12 — Full repo review + consolidation (D-013)

Claude Code did a full review of the planning corpus and consolidated it. Reconciled the base docs
(README, CONTEXT, DOMAIN-CONTEXT, this file) that still described the superseded "fictional data only"
world; amended D-002/D-004 to record the D-011 real-data reversal; resolved the stale open questions;
fixed a substantive contradiction where a restricted-zone checkpoint made "perfect run = 1000" unreachable
(D-013: no scored checkpoint in restricted, plus a 6th unscored forbidden waypoint for the block demo);
and pinned the Access Aware semantics + the canonical 8-badge set (added Pathfinder to the scoring spec).
Build scope confirmed as the full corpus. No application code written. Next: writing-plans → scaffold.

### 2026-06-13 — Full implementation shipped (steps 1–7) + docs closeout

Claude Code built the entire app through the autonomous 7-PR train (scaffold + CI/CD → real Moab data →
types → pure geo → MapView → scoring/reducer/cards → polish/docs), each PR CI-gated, Copilot-reviewed, and
squash-merged with an auto-deploy to GitHub Pages. Adversarial multi-agent verification workflows reviewed
the data fetch, geo, and scoring/reducer and caught real bugs before merge; the full loop was browser-verified
to a perfect 1000. The app is **live** at <https://kilowhisky.github.io/trailquest/>; 61 tests pass in CI.
Implementation details: `docs/WORKLOG.md`, `docs/AI_USAGE.md`, `docs/ARCHITECTURE.md`, `docs/CICD.md`.
