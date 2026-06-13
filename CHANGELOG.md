# Changelog

All notable changes to TrailQuest will be documented in this file.

This project uses a lightweight changelog format because the take-home emphasizes process clarity over release ceremony.

## 0.1.0 - 2026-06-13

First working implementation — the full geospatial quest loop, built through a 7-PR train (one PR per
build step, CI-gated + Copilot-reviewed; see `docs/CICD.md`). **Live demo:**
<https://kilowhisky.github.io/trailquest/>

### Added

- **App** (Vite 6 + React 18 + TypeScript, frontend-only): a Leaflet map over real Klondike Bluffs / Arches
  data with floating overlay cards (briefing, score, checkpoints, access banner, posterboard).
- **Real data** (`scripts/fetch-moab-data.mjs` + `src/data/sources/`): OSM trails + named features, UGRC
  land ownership → access tiers, BLM MTB attributes, USGS 3DEP elevation, and an on-trail route snapped to
  the trail network. Committed static; no runtime calls. Provenance in `docs/DATA-SOURCES.md`.
- **Pure logic** (TDD): `lib/geo.ts` (distance, inclusive geofence, point-in-polygon access classification,
  fog-of-war proximity, elevation gain, UTM) and `lib/scoring.ts` (perfect run = 1000, idempotent bonuses,
  derived badges/totals); `state/questReducer.ts` ties them together.
- **Mechanics:** fog-of-war discovery, geofenced check-ins, a blocked forbidden waypoint (Tower Arch inside
  Arches NP) that grants *Access Aware*, a hidden geocache, a Clean Run bonus, 8 badges, and a session-only
  completion posterboard.
- **Tests:** 61 (pure geo + scoring + reducer integration + data + App smoke).
- **Docs:** `README` (rewritten for the shipped app), `docs/AI_USAGE.md`, `docs/ARCHITECTURE.md` (with a
  Mermaid loop diagram), `docs/CICD.md`, `docs/WORKLOG.md`, and an MIT `LICENSE`.

### Process

- CI/CD: GitHub Actions gate (typecheck · lint · test · build) + GitHub Pages auto-deploy; Copilot review on
  every PR; adversarial multi-agent verification of the data fetch, geo, and scoring/reducer logic (caught a
  BLM MultiLineString mis-attribution, an elevation-gain corruption, and UTM edge-case bugs before merge).

### Resolved

- **Open question (D-014): LICENSE** → added **MIT** (covers TrailQuest's source; committed data keeps its
  upstream licenses per `docs/DATA-SOURCES.md`).

## 0.0.2 - 2026-06-12

Planning-phase expansion and consolidation. Still no application code — these are docs/decisions only.

### Added

- `docs/plans/IMPLEMENTATION-PLAN.md` — authoritative full-corpus implementation plan.
- `docs/specs/scoring-design.md` (D-010) and `docs/specs/testing-plan.md` (D-011).
- `docs/specs/2026-06-12-fog-of-war-discovery-design.md` — explore→discover→approach→check-in mechanic.
- `docs/specs/2026-06-12-real-attribute-surfacing-design.md`,
  `…-elevation-and-on-trail-distance-design.md`, `…-terrain-and-named-feature-polish-design.md`
  (D-012, three authenticity tiers).
- `docs/research/moab-data-sources.md` — verified keyless Moab data sources (OSM / BLM / UGRC / USGS / Esri).
- `docs/specs/2026-06-12-cicd-pipeline-design.md` — autonomous PR-train delivery process + GitHub Pages live demo.
- `docs/ATTRIBUTION.md` (AI commit-message convention) and `docs/README.md` (docs index).

### Decided

- **D-010** — objective-based scoring (perfect run = 1000; hidden geocache +250; Clean Run +100; mock,
  session-only posterboard).
- **D-011** — reversed "fictional data only": real Moab trail/land geometry, mock only the game layer;
  pinned spatial/scoring testing semantics.
- **D-012** — real-attribute surfacing + real elevation/on-trail route + terrain/named-feature polish.
- **D-013** — consolidation: amended D-002/D-004 to record the reversal, resolved the stale open questions,
  fixed the restricted-checkpoint vs. 1000-point contradiction (no scored checkpoint in restricted + a 6th
  unscored "forbidden" waypoint for the block demo), pinned the Access Aware semantics and the canonical
  8-badge set, and reconciled the base context docs (README, CONTEXT, DOMAIN-CONTEXT, MEMORY).
- **D-014** — recorded the CI/CD delivery process (one PR per build step, GitHub Actions CI as the merge
  gate, advisory Copilot review, squash-merge to `main`, and a GitHub Pages live demo that reverses the
  earlier "deployment out of scope" stance). Outward-facing setup (public repo, push, autonomous loop)
  is gated on explicit go-ahead.

### Not yet implemented

- No application scaffold, map UI, geospatial logic, `scripts/fetch-moab-data.mjs`, or tests yet.

## 0.0.1 - 2026-06-12

### Added

- Added `docs/MEMORY.md` as persistent agent memory for Claude Code / future AI sessions.
- Added `docs/CHAT-LOG.md` as a chronological log for meaningful AI-agent sessions.
- Updated `README.md` with the agent handoff protocol.
- Updated `docs/DECISIONS.md` with the decision to keep agent memory and chat logs in `docs/`.

## 0.0.0 - 2026-06-12

### Added

- Initialized the repository as a Claude Code / Claude Max handoff package.
- Added root `README.md` with project thesis, scope, and recommended implementation direction.
- Added `docs/CONTEXT.md` for product and implementation context.
- Added `docs/DOMAIN-CONTEXT.md` for onX/domain relevance.
- Added `docs/GENESIS.md` capturing the project backstory and brainstorming history.
- Added `docs/DECISIONS.md` as the initial decision log.

### Not yet implemented

- No application scaffold yet.
- No map UI yet.
- No geospatial calculations yet.
- No quest fixture data yet.
- No tests yet.

## Next

- Turn `docs/plans/IMPLEMENTATION-PLAN.md` into an executable task breakdown, then scaffold the
  Vite + React + TypeScript app per its build sequence.
- Run `scripts/fetch-moab-data.mjs` (authoring-time) to fetch + commit real Moab GeoJSON, validated
  against the satellite imagery.
- Implement the pure geo/scoring layers (with tests), the reducer, the map, and the overlay cards.
- Add `docs/AI_USAGE.md`, `docs/WORKLOG.md`, `docs/DATA-SOURCES.md`, and `docs/ARCHITECTURE.md` during
  implementation.
