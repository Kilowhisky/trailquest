# TrailQuest Context

## One-line concept

TrailQuest is an AI-generated, access-aware outdoor scavenger hunt system built from geospatial primitives: waypoints, geofences, routes, access polygons, scoring, and map-based progress.

## Why this exists

This project is being created for an onX Maps AI take-home assignment. The prompt asks for any AI-assisted geospatial application and explicitly says the evaluation is about work and thinking process, not a polished production result.

The goal is to create a small but thoughtful repository that demonstrates how an engineer can:

- interpret an ambiguous product prompt
- identify a product opportunity relevant to onX
- scope a demoable geospatial prototype
- use AI as an implementation partner
- document decisions and tradeoffs
- produce a GitHub artifact that can be reviewed quickly

## Product hypothesis

Outdoor maps are often optimized around questions like:

- Where am I?
- Where can I go?
- What land/trail am I near?
- How do I get back?

TrailQuest explores a different question:

> What should I go do outside today?

The hypothesis is that map data can become structured outdoor missions. A quest gives a user a reason to explore a place by combining:

- a starting area or route
- checkpoints
- geofenced objectives
- access/safety constraints
- photo or observation prompts
- score and badge mechanics
- a human-readable briefing

## Target users

Potential users include:

- off-roaders looking for a short adventure loop
- families looking for kid-friendly outdoor challenges
- overlanders exploring a new area
- hikers who want a structured objective
- hunters or backcountry users scouting terrain features
- groups coordinating a shared trail activity
- stewardship-minded users documenting trail conditions

## Core user story

As an outdoor user, I want a map-based challenge that gives me interesting waypoints to visit, keeps me aware of access constraints, and rewards me for completing the route so that I have a structured reason to explore a new area.

## MVP experience

A minimal prototype should let a reviewer:

1. View a quest on a map.
2. See checkpoints and checkpoint geofence radii.
3. Move a simulated location.
4. Detect whether the simulated location is inside a checkpoint radius.
5. Check in to earn points.
6. Complete the quest.
7. Earn badges.
8. See mock access-layer status.
9. Read a quest briefing that feels AI-generated.

## Recommended project name

Primary name: **TrailQuest**

Possible future alternatives:

- FieldQuest
- Waypoint Hunt
- ScoutQuest
- GeoQuest
- Ridge Runner
- QuestLayer

TrailQuest is preferred because it is clear, outdoor-oriented, and easy to explain.

## Product positioning

TrailQuest should not be framed as generic geocaching.

Better framing:

> TrailQuest turns outdoor map data into structured, access-aware missions.

The differentiator is not merely finding coordinates. The differentiator is using mapping context to generate safe, legal, useful, and motivating outdoor objectives.

## Geospatial primitives to demonstrate

The implementation should make the geospatial work obvious:

- coordinates
- waypoints
- distance calculations
- radius/geofence checks
- map visualization
- point-in-polygon validation
- access-zone overlays
- route/checkpoint order
- simulated user location

## AI primitives to demonstrate

The implementation can use AI or AI-generated artifacts for:

- product brainstorming
- scope selection
- quest briefing copy
- checkpoint prompt generation
- code scaffolding
- test generation
- documentation
- critique and hardening

The repository should be honest about what AI generated, what was reviewed, and what was intentionally constrained.

## Suggested stack

Use the simplest stack that can demonstrate the idea:

```text
Vite
React
TypeScript
Leaflet or MapLibre
Turf.js
Static fixtures
Simple CSS
Optional Vitest tests
```

## Important constraints

The first implementation should avoid complexity:

- no backend
- no auth
- no real onX data
- no real private land data
- no legal access claims
- no production photo verification
- no real-time multiplayer
- no required GPS permissions
- no paid API key requirement

## Definition of success

The take-home succeeds if a reviewer can understand the following in a few minutes:

- what the product idea is
- why it is geospatial
- why it is relevant to onX
- what was implemented
- what was intentionally mocked
- how AI was used
- what would come next

The prototype does not need to be production-ready. It needs to be coherent, reviewable, and demoable.
