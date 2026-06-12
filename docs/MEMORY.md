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

As of 2026-06-12 (post-consolidation, D-013):

- The **planning corpus is complete and consolidated** — decisions D-001 … D-014, an authoritative
  implementation plan ([plans/IMPLEMENTATION-PLAN.md](plans/IMPLEMENTATION-PLAN.md)), and seven specs
  (scoring, testing, fog-of-war, three D-012 authenticity specs, + the CI/CD pipeline) are internally
  consistent.
- **Build scope is locked to the full corpus:** D-010 scoring + D-011 real Moab data + D-012 (all three
  authenticity tiers) + fog-of-war discovery.
- **No application code exists yet.** No app scaffold, map UI, geospatial logic, data-fetch script, or
  tests. Scaffolding is the next step.

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

Planning and consolidation are done. The next agent should:

1. Turn [plans/IMPLEMENTATION-PLAN.md](plans/IMPLEMENTATION-PLAN.md) into an executable task breakdown
   (writing-plans skill), then scaffold the app per its build sequence. Execution runs through the
   [CI/CD pipeline spec](specs/2026-06-12-cicd-pipeline-design.md) (D-014): one PR per build step, CI gate,
   advisory Copilot review, GitHub Pages live demo. **Outward-facing setup (make repo public, push,
   autonomous loop) needs explicit user go-ahead — do not perform it unprompted.**
2. The riskiest early step is the **authoring-time data fetch** (`scripts/fetch-moab-data.mjs`): OSM
   Overpass + BLM/UGRC ArcGIS + USGS 3DEP have **no CORS headers**, so they are fetched once and committed
   as static GeoJSON. Every checkpoint/zone/route must be sanity-checked against the Esri satellite imagery
   (never contradict what a local knows or the imagery shows — D-011).
3. Remember the **6th unscored "forbidden" waypoint** in the restricted zone (D-013): it demonstrates the
   blocked-check-in path while the 5 scored checkpoints stay reachable (perfect run = 1000).
4. Create the implementation-phase docs the plan promises: `docs/AI_USAGE.md`, `docs/WORKLOG.md`,
   `docs/DATA-SOURCES.md`, `docs/ARCHITECTURE.md`.
5. Update this file, append to `docs/CHAT-LOG.md`, and update `CHANGELOG.md` after meaningful work.

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
