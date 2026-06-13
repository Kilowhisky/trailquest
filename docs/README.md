# TrailQuest Docs Index

This folder contains the project context and agent handoff material for TrailQuest.

## Context & decisions

The product context and the decisions behind TrailQuest (the app is **built** — see the *Implementation
docs* section below):

1. `CONTEXT.md` — what is being built and the MVP scope.
2. `DOMAIN-CONTEXT.md` — why this is relevant to onX and outdoor mapping.
3. `GENESIS.md` — backstory, brainstorming history, and project origin.
4. `DECISIONS.md` — product and architecture decision log.
5. `MEMORY.md` — persistent working memory for AI agents.
6. `CHAT-LOG.md` — chronological summaries of AI-agent sessions.
7. `ATTRIBUTION.md` — convention for AI-authored commit messages and repo notes.

## Plan, specs & research

The authoritative build plan and the feature specs it references:

- `plans/IMPLEMENTATION-PLAN.md` — authoritative full-corpus implementation plan (start here for the build).
- `specs/scoring-design.md` — point model, badges, geocache, posterboard (D-010).
- `specs/testing-plan.md` — test inventory + pinned spatial/scoring semantics (D-011, D-013).
- `specs/2026-06-12-fog-of-war-discovery-design.md` — discovery mechanic + Pathfinder badge.
- `specs/2026-06-12-real-attribute-surfacing-design.md` — verbatim source attributes (D-012 tier 1).
- `specs/2026-06-12-elevation-and-on-trail-distance-design.md` — elevation + on-trail route (D-012 tier 2).
- `specs/2026-06-12-terrain-and-named-feature-polish-design.md` — hillshade / named features / HUD (D-012 tier 3).
- `specs/2026-06-12-cicd-pipeline-design.md` — autonomous PR-train delivery + GitHub Pages live demo (D-014).
- `research/moab-data-sources.md` — verified keyless data sources (OSM / BLM / UGRC / USGS / Esri).

> Note: `ATTRIBUTION.md` (AI commit-message convention) is distinct from the implementation-time
> `DATA-SOURCES.md` (per-dataset data attribution).

## Implementation docs (the app is built)

The app shipped on 2026-06-13 — live demo: <https://kilowhisky.github.io/trailquest/>. These document the
built result:

- `AI_USAGE.md` — how the app was built with AI end-to-end (process, copy-generation prompts, honest misses).
- `ARCHITECTURE.md` — module layers, a Mermaid core-loop diagram, and the test-enforced invariants.
- `CICD.md` — the delivery runbook (per-step PR train, CI gate, Copilot, GitHub Pages deploy).
- `DATA-SOURCES.md` — per-dataset provenance + licenses for the committed real geospatial data.
- `WORKLOG.md` — the PR-by-PR implementation log.

The root `README.md` is the front door (how to play the demo + how it was built); `CHANGELOG.md` records the
`0.1.0` implementation release.

## Important agent rule

When authoring commits, PR text, implementation notes, or repo messages, follow `ATTRIBUTION.md`.

Preferred pattern:

```text
<Agent/tool> with Chris input: <short imperative summary>
```

Examples:

```text
ChatGPT with Chris input: Initialize TrailQuest context docs
Claude Code with Chris input: Scaffold geospatial quest prototype
```

The purpose is to make the AI-assisted development process visible while acknowledging that the work is directed by Chris.
