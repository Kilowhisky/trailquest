# Domain Context: onX and TrailQuest

## Purpose of this document

This document explains why TrailQuest is a reasonable product idea for an onX Maps take-home project. It is not intended to be a comprehensive competitive analysis. It is a lightweight domain brief for an AI coding agent and a human reviewer.

## onX context

onX is an outdoor mapping company focused on helping people explore with confidence. Public onX materials describe a product family that includes onX Hunt, onX Offroad, onX Backcountry, and onX Fish.

The onX About page states that the company mission is:

> awaken the adventurer inside everyone

It also describes onX as building navigation apps for adventurers and emphasizes discovery, contextual mapping data, knowing where you stand, getting home safely, and preserving access to outdoor recreation.

Source: https://www.onxmaps.com/about

## Relevant onX themes

TrailQuest is intentionally aligned with these onX themes:

### 1. Outdoor confidence

onX Offroad's public feature page frames the product as providing tools that increase confidence before hitting the trails.

TrailQuest builds on that idea by making a trip feel structured and purposeful. A quest briefing can help a user know what they are attempting before they leave.

Source: https://www.onxmaps.com/offroad/app/features

### 2. Offline and off-grid usage

onX Offroad's offline maps page emphasizes saving maps before leaving coverage, navigating with the phone's internal GPS, and accessing trail/map data outside cell coverage.

TrailQuest should be designed so that a future version could score checkpoints offline using local GPS, local quest data, and cached map/access layers.

Source: https://www.onxmaps.com/offroad/app/features/offline-maps

### 3. Waypoints and user-created map data

onX Offroad publicly describes custom Waypoints, route/trip tracking, and syncing customizations across devices.

TrailQuest uses waypoints as challenge objectives. It reframes a waypoint from passive marker into an active objective.

Source: https://www.onxmaps.com/offroad/app/features/offline-maps

### 4. Trails, difficulty, and recreation points

onX Offroad materials reference off-road trail maps, route building, trail difficulty ratings, trail photos, recreation points, campgrounds, trailheads, fuel, campsites, and trail discovery.

TrailQuest could use the same kinds of primitives to generate quests:

- visit an overlook
- reach a trailhead
- pass a bailout point
- complete a loop
- identify a trail marker
- avoid restricted zones
- finish before sunset

Source: https://www.onxmaps.com/offroad/app/features

### 5. Access awareness

onX is strongly associated with public/private land awareness, land boundaries, and access initiatives. The onX About page says public access is part of onX's DNA and describes investment in land access initiatives.

TrailQuest should therefore not be just a scavenger hunt. It should be **access-aware**.

In the prototype, this means using **real land-ownership polygons** (BLM / UGRC / NPS) reclassified into
game tiers:

- BLM-open → allowed/public area
- State / SITLA / WSA → caution area
- NPS (Arches) / private → restricted/private area

Point-in-polygon runs on the real boundaries; the **tier mapping** is the illustrative game. The app should
avoid making real legal/access claims (see D-011/D-013 and the reframed disclaimer).

Sources:

- https://www.onxmaps.com/about
- https://www.onxmaps.com/offroad/app/features

### 6. Social/group possibility

onX Offroad's public feature page references location sharing and collaborative folders. Those features suggest that group-based planning and shared outdoor context matter in the product domain.

TrailQuest could eventually support group quests, shared progress, or ride-day challenges. That is explicitly out of scope for the first prototype.

Source: https://www.onxmaps.com/offroad/app/features

## Original idea space

Several ideas were considered for the take-home:

1. Achievement badge system for accomplishing trails.
2. Skill-builder challenge system that recommends progressively harder trails.
3. Social meetup trails where users coordinate same-day trail rides.
4. Off-grid communication using Bluetooth/internet and geospatial context.
5. Geocaching / geo-hunting scavenger hunt with coordinates and photo scoring.

TrailQuest combines the strongest parts of these:

- achievement badges
- skill-building challenges
- geocaching mechanics
- optional social/group expansion
- offline/off-grid plausibility
- access-aware trail exploration

## Why TrailQuest is not just geocaching

Generic geocaching is usually about finding hidden containers or coordinates.

TrailQuest should be framed as:

> AI-generated, access-aware outdoor challenge routes.

The difference is that a TrailQuest can be generated from map context and can include:

- route constraints
- public/private/caution areas
- difficulty targets
- time budgets
- activity type
- photo/observation prompts
- safety notes
- route completion
- skill progression
- badges

## Potential product modes

### Family mode

A short, kid-friendly quest:

- find a bridge
- reach the creek
- take a photo of a trail sign
- return to the trailhead

### Offroad mode

A vehicle-oriented quest:

- reach the staging area
- complete a loop
- visit an overlook
- identify the bailout road
- avoid restricted land

### Hunt/scouting mode

A non-harvest, terrain-awareness quest:

- mark a glassing point
- identify water access
- reach a legal boundary checkpoint
- photograph terrain features

### Stewardship mode

A public-good quest:

- report trail damage
- photograph trash location
- confirm gate status
- mark a washout

## Prototype stance

> **Updated 2026-06-12 (D-011 / D-013):** the original stance was "fictional data only." That was reversed.
> The prototype now uses **real geography with a fictional game layer** — trail lines, land-ownership
> boundaries, trailheads, and named features are real and sourced (OSM / BLM / UGRC / USGS); the quest,
> scoring, badges, and access **tiers** are the illustrative game.

The geometry (and the verbatim owner labels surfaced from it) is real and sourced. Even so, the prototype
must not imply:

- real access *rights* or permission to enter
- real trail conditions
- real route safety
- real closure status

Use language like:

- real geometry, sourced (OSM / BLM / UGRC / USGS)
- illustrative access tiers (a reclassification of real ownership — not authoritative)
- fictional game layer / demo data
- conceptual prototype
- not legal, navigational, or land-access guidance

## What would make this compelling to onX

The strongest version of the prototype shows that TrailQuest could become a new engagement layer on top of existing mapping primitives.

It would help users:

- choose what to do
- learn an area
- practice navigation
- respect access constraints
- invite friends later
- collect accomplishments
- leave useful trail context behind

The prototype should communicate that the idea is small enough to demo, but rich enough to imagine as a real feature.
