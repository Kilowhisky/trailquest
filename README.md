# TrailQuest

**AI-generated, access-aware outdoor scavenger hunts for exploration, off-roading, and trail discovery.**

TrailQuest is an early geospatial product prototype created for an onX Maps AI take-home project. The project starts from a simple idea: maps already help outdoor users answer **where am I?** and **where can I go?** TrailQuest explores a third question:

> What should I go do outside today?

The concept turns map primitives — waypoints, coordinates, geofences, routes, access layers, and trail metadata — into scored outdoor quests. A user can complete checkpoints, earn points, optionally satisfy photo prompts, and finish a safe/legal challenge route.

This repository is intentionally initialized as a **handoff package for Claude Code / Claude Max**. The first commit establishes project context, product direction, decisions, and domain notes before implementation begins.

## Take-home prompt

The original assignment:

> Build out, assisted by AI, any application that would be considered "geospatial" — no other prescription. Anything dealing with geospatial data: displaying, manipulating, or understanding it. Bonus points if it loosely resembles something you wish onX would do.
>
> We're evaluating your work and thinking process with AI, not a polished or fully working result. Plan for 1–2 hours max.
>
> The only deliverable is a GitHub repository, including any artifacts you feel help document what you've done.

## Product thesis

TrailQuest is a gamified exploration layer that could plausibly sit on top of an outdoor mapping product like onX.

The prototype should demonstrate:

- geospatial reasoning, not just UI polish
- coordinates, waypoints, and geofenced check-ins
- access-aware validation using **real** land-ownership polygons (BLM/UGRC/NPS) reclassified into illustrative public/caution/restricted tiers
- scoring and badges tied to outdoor accomplishments
- AI-generated quest briefings or challenge copy
- a clear AI-assisted engineering process

## Why this is geospatial

TrailQuest should use geospatial data directly:

- map rendering
- waypoint markers
- latitude/longitude coordinates
- distance calculations
- geofence radius checks
- point-in-polygon access validation
- route/checkpoint sequencing
- simulated current location
- real land-ownership layers reclassified into public/caution/restricted access tiers

## Why this is onX-relevant

onX products already center around outdoor confidence, navigation, access, trails, offline use, and user-created map data. The public onX Offroad feature set includes offline maps, route building, trail reports, location sharing, custom waypoints, private land boundaries, off-road trail maps, trail difficulty ratings, recreation points, and turn-by-turn/off-grid navigation.

TrailQuest is not intended to copy onX. It is a feature hypothesis:

> If users already plan, navigate, mark, share, and track outdoor experiences, a quest layer could give them structured reasons to explore.

## Current repository state

This repo currently contains planning artifacts only (no application code yet):

```text
README.md
CHANGELOG.md
docs/
  README.md              # docs index
  CONTEXT.md
  DOMAIN-CONTEXT.md
  GENESIS.md
  DECISIONS.md           # D-001 … D-013
  MEMORY.md
  CHAT-LOG.md
  ATTRIBUTION.md         # AI commit-message convention
  plans/
    IMPLEMENTATION-PLAN.md
  specs/
    scoring-design.md
    testing-plan.md
    2026-06-12-fog-of-war-discovery-design.md
    2026-06-12-real-attribute-surfacing-design.md
    2026-06-12-elevation-and-on-trail-distance-design.md
    2026-06-12-terrain-and-named-feature-polish-design.md
  research/
    moab-data-sources.md
```

Implementation (scaffolding the app) is the next step.

## Agent handoff protocol

AI agents working in this repo should keep durable working state in `docs/`:

- `docs/MEMORY.md` — persistent agent memory, current state, constraints, and next best action.
- `docs/CHAT-LOG.md` — chronological summaries of meaningful AI-agent sessions.
- `docs/DECISIONS.md` — product and architecture decisions.
- `CHANGELOG.md` — repository-level changes.

Before making significant implementation changes, an agent should read `README.md` and all files in `docs/`. After meaningful work, the agent should update `docs/MEMORY.md`, append a session note to `docs/CHAT-LOG.md`, and update `CHANGELOG.md` / `docs/DECISIONS.md` when appropriate.

## Recommended implementation direction

Use a simple frontend-only prototype:

```text
Vite + React + TypeScript
Leaflet (react-leaflet) for maps; keyless Esri World Imagery basemap
Turf.js for geospatial calculations
Real Moab geometry (OSM/BLM/UGRC), fetched at authoring time and committed static
Mock only the game layer (quest, scoring, badges, access tiers)
No backend
No auth
No real GPS dependency
No legal/authoritative land-access claims
```

## MVP scope

A reviewer should be able to:

1. Open the app locally.
2. See a map with a quest and 4–6 checkpoints.
3. Read an AI-styled quest briefing.
4. Move a simulated user location.
5. See distance-to-checkpoint and inside/outside geofence state.
6. Check in when inside a geofence.
7. Earn points and badges.
8. See real-ownership-derived access tiers and checkpoint access status.
9. Understand the product and engineering tradeoffs from the docs.

## Non-goals

Do not build these in the first pass:

- production backend
- user accounts
- real onX integration
- authoritative or real-time land-access status (geometry is real; the access **tiers** are an illustrative game)
- legal access assertions
- multiplayer/social network
- production photo verification
- mobile app shell
- paid map provider dependency

## Suggested next command for Claude Code

```text
Read README.md and all files in docs/. Pay special attention to docs/MEMORY.md and docs/CHAT-LOG.md. Then propose a minimal 1–2 hour implementation plan for TrailQuest. After the plan, scaffold the app and implement the smallest demoable version of the geospatial quest loop. When finished, update docs/MEMORY.md, append a session summary to docs/CHAT-LOG.md, and update CHANGELOG.md.
```

## Source notes

The domain context references public onX pages, including:

- https://www.onxmaps.com/about
- https://www.onxmaps.com/offroad/app/features
- https://www.onxmaps.com/offroad/app/features/offline-maps
