# Genesis: How TrailQuest Started

## Purpose of this document

This document captures the origin story, brainstorming history, and early product reasoning behind TrailQuest.

It is intended to help Claude Code / Claude Max continue the project with the full backstory instead of treating the repository as a blank scaffold.

## Original take-home prompt

The project began with an onX Maps interview take-home prompt:

```text
AI Take-Home Project
• You'll receive $100 for tokens (enough to cover about a month of Claude Code MAX, but feel free to spend it on any service you prefer). Instructions on payment coming soon. Will keep you posted by tomorrow.
• Build out, assisted by AI, any application that would be considered "geospatial" — no other prescription. Anything dealing with geospatial data: displaying, manipulating, or understanding it. Bonus points if it loosely resembles something you wish onX would do.
• We're evaluating your work and thinking process with AI, not a polished or fully working result. Plan for 1–2 hours max.
• The only deliverable is a GitHub repository, including any artifacts you feel help document what you've done.
```

The key constraints:

- geospatial application
- AI-assisted development
- 1–2 hour scope
- GitHub repository as deliverable
- process matters more than polish
- bonus if it resembles a wished-for onX feature

## Initial ideas

The first brainstorm produced four ideas:

1. **Achievement badge system for accomplishing trails**
   - Reward users for completing trails or outdoor milestones.
   - Strong engagement mechanic, but weaker as a standalone geospatial demo unless the badges are tied to real spatial metrics.

2. **Skill-builder challenge system**
   - User enters trails they have completed.
   - App recommends progressively harder trails.
   - Strong product idea with clear geospatial ranking/scoring.

3. **Social meetup trails**
   - Users declare when they plan to go out.
   - App matches them with others planning the same trail/day.
   - Compelling, but risks turning into social/auth/moderation scope.

4. **Off-grid communications**
   - Bluetooth/internet-assisted geospatial communications.
   - Very interesting but too technically risky for a 1–2 hour take-home.

## Second idea: geocaching / geo-hunting

A later idea emerged:

> Geocaching / geo hunting. A scavenger hunt where users have to get to particular coordinates and/or take photos to score points.

This idea felt especially promising because it is:

- immediately geospatial
- easy to demo
- fun
- compatible with badges
- compatible with skill progression
- compatible with group rides
- compatible with offline/off-grid mode
- plausibly relevant to onX

The concept evolved from generic geocaching into a more product-native idea:

> AI-generated, access-aware outdoor scavenger hunts.

## Claude Max question

A key process question came up:

> Why do I need a Claude Max account? What can I do with it that I couldn't do here?

The answer was not that Claude has uniquely better product ideas. The key distinction was workflow:

- ChatGPT is useful for brainstorming, strategy, product framing, architecture, documentation, and code review.
- Claude Code / Claude Max is useful as a repo-local coding agent that can inspect files, edit multiple files, run commands, fix build errors, and iterate inside the repository.

The intended workflow became:

- use ChatGPT to bootstrap the idea, context, specs, and docs
- use Claude Code to implement and iterate inside the repo
- preserve AI usage and decision-making in documentation

## Desired repo style

The project owner prefers repositories with strong written context and engineering artifacts:

- docs folders
- decision logs
- context docs
- changelogs
- Mermaid diagrams
- feature specs
- architecture notes
- implementation notes

This repository should therefore be more than source code. It should be a reviewable product/engineering artifact.

## Chosen direction

The chosen direction is:

# TrailQuest

**AI-generated, access-aware outdoor scavenger hunts.**

The product idea:

- user chooses an outdoor area or quest
- app displays checkpoints on a map
- each checkpoint has coordinates and a geofence radius
- user reaches checkpoints and checks in
- app awards points and badges
- optional photo prompts add bonus points
- mock access layers indicate allowed/caution/restricted zones
- AI-generated briefing explains the quest, skills, and safety/access notes

## Why this became the preferred idea

TrailQuest combines the best parts of the earlier brainstorm:

- badges from the achievement idea
- progression from the skill-builder idea
- same-day/group extensibility from the social meetup idea
- offline plausibility from the off-grid communications idea
- coordinates/photo scoring from the geocaching idea
- access awareness to make it onX-relevant

It is also highly timebox-friendly. A minimal implementation can be done with static data and a frontend-only app.

## Product framing

Avoid framing:

> This is a geocaching clone.

Prefer framing:

> This is a quest layer for outdoor maps. It turns waypoints, route context, and access constraints into scored outdoor objectives.

Better still:

> TrailQuest turns maps into missions.

## Handoff goal

The purpose of the initial repository state is not to implement the app yet. It is to give Claude Max enough context to start productively.

The handoff should tell Claude:

- what is being built
- why it is being built
- what onX context matters
- what decisions have already been made
- what should not be overbuilt
- how to scope the first implementation

## Implementation north star

> **Superseded note (D-011 / D-013):** the original north star below said "static mock access polygons /
> no real land data." That was later reversed — the prototype now uses **real** Moab geometry
> (OSM / BLM / UGRC / USGS) and mocks only the game layer. The block is preserved as part of the origin story.

The first implementation should be a small, reliable demo:

```text
Vite + React + TypeScript
Leaflet or MapLibre
Turf.js
Static quest fixture
Static mock access polygons
Simulated user location
Geofence check-ins
Scoring and badges
Quest briefing panel
No backend
No auth
No real land data
```

## The important product insight

The valuable product move is **access-aware questing**.

A simple scavenger hunt with coordinates is fun. But a scavenger hunt that understands trail context, access boundaries, safety notes, and route constraints is much more relevant to onX.

## The important engineering insight

The app should make the geospatial logic visible and reviewable:

- distance to checkpoint
- inside/outside geofence
- point-in-polygon access validation
- mock access overlays
- checkpoint status
- score calculation

The prototype should not hide everything behind AI-generated prose.

## Suggested next prompt to Claude

```text
Read README.md and every file in docs/. Then propose a small implementation plan for a 1–2 hour take-home. Do not overbuild. After the plan, scaffold a Vite + React + TypeScript app and implement the smallest demoable TrailQuest prototype with map, static quest data, simulated location, geofence check-ins, access-aware validation, scoring, and badges.
```
