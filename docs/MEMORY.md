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

> Turn outdoor map primitives into scored quests using checkpoints, geofences, simulated location, mock access layers, scoring, badges, and AI-generated quest briefings.

## Current implementation state

As of repository initialization:

- Documentation scaffold exists.
- No application scaffold exists yet.
- No map UI exists yet.
- No geospatial logic exists yet.
- No tests exist yet.

## Important constraints

- Keep the first implementation frontend-only.
- Prefer Vite + React + TypeScript.
- Prefer Leaflet or MapLibre for map rendering.
- Prefer Turf.js for geospatial helpers.
- Use static fixture data first.
- Use simulated location first.
- Use fictional/mock access polygons only.
- Do not make real legal land-access claims.
- Do not integrate real onX data.
- Do not add auth, backend, or social features in the first pass.

## Next best action

Propose a minimal 1–2 hour implementation plan, then scaffold the smallest demoable version of the app:

1. Map with quest checkpoints.
2. Static quest fixture.
3. Mock access-zone fixture.
4. Simulated user location.
5. Geofence check-in logic.
6. Scoring and badges.
7. Quest briefing panel.
8. Updated docs and changelog.

## Running notes

Append durable notes below as work progresses.

### 2026-06-12 — Initial memory created

The repository was initialized as a documentation-first handoff package for Claude Code / Claude Max. The next agent should use this memory file as the persistent session state and update it after implementation begins.
