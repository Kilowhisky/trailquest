# Decision Log

This document records early product and engineering decisions for TrailQuest.

The format is intentionally lightweight. If the project grows, individual decisions can be promoted into separate ADR files under `docs/decisions/` or `docs/DECISIONS/`.

## D-001: Choose TrailQuest as the project direction

**Date:** 2026-06-12

### Decision

Build **TrailQuest**, an AI-generated, access-aware outdoor scavenger hunt prototype.

### Context

The onX take-home asks for any geospatial application, assisted by AI, with a 1–2 hour expected scope. Several ideas were considered, including trail badges, skill progression, trail meetups, off-grid communications, and geocaching/geo-hunting.

### Rationale

TrailQuest combines the strongest aspects of the brainstorm:

- geospatial by default
- easy to demo
- fun and product-like
- can use waypoints, geofences, and maps
- can include badges and skill progression later
- can be made onX-relevant through access-awareness
- can be implemented with static data in a short timebox

### Consequences

The project will prioritize a small, coherent product prototype over a deep technical system.

---

## D-002: Use static fixture data first

**Date:** 2026-06-12

### Decision

Use static quest and access-zone fixtures for the first implementation.

### Context

The prototype needs to be reviewable and demoable quickly. Real trail data, real land ownership data, and real route generation would add risk and time.

### Rationale

Static data allows the project to demonstrate the product concept and geospatial primitives without external dependencies.

### Consequences

The first version will not prove data ingestion or production integration. It will clearly label all data as fictional/demo data.

---

## D-003: Use simulated location instead of browser GPS

**Date:** 2026-06-12

### Decision

The first version should include simulated user-location controls rather than depending on browser geolocation.

### Context

The app must be easy for a reviewer to run locally. Browser GPS permissions, desktop testing, and physical movement would make the demo unreliable.

### Rationale

Simulated location lets the reviewer test geofence entry, check-ins, scoring, and access warnings from a desk.

### Consequences

The demo is not a true field app yet. Future work can add real GPS/mobile support.

---

## D-004: Include access-awareness as a first-class concept

**Date:** 2026-06-12

### Decision

Include mock access polygons and checkpoint access validation in the MVP.

### Context

A generic coordinate scavenger hunt is geospatial but not uniquely compelling for onX. onX's product identity includes land access, boundaries, trails, and confidence in outdoor navigation.

### Rationale

Access-awareness makes the idea feel more native to onX and demonstrates point-in-polygon spatial reasoning.

### Consequences

All access data must be fictional. The UI and docs must explicitly avoid legal/access claims.

---

## D-005: Avoid backend/auth/social features in the first pass

**Date:** 2026-06-12

### Decision

Do not build a backend, authentication, real-time social features, or persistent user accounts in the MVP.

### Context

The social meetup idea is interesting, and group quests are a plausible future extension. However, social features introduce privacy, safety, moderation, and implementation complexity.

### Rationale

The take-home rewards process, judgment, and geospatial thinking. Backend/social scope would distract from the core demo.

### Consequences

Group quests, shared progress, and ride-day matchmaking remain roadmap items.

---

## D-006: Optimize docs for AI handoff and human review

**Date:** 2026-06-12

### Decision

Initialize the repository with rich docs before implementation.

### Context

The project owner wants a state that can be handed to Claude Max / Claude Code for implementation brainstorming and scaffolding. The take-home also evaluates AI-assisted process, not only code.

### Rationale

Good context documents help the agent stay aligned and help the reviewer see the thinking process.

### Consequences

The initial repository state is mostly documentation. Application code will follow after Claude has project context.

---

## D-007: Prefer a frontend-only implementation

**Date:** 2026-06-12

### Decision

Use a frontend-only application for the initial prototype, likely Vite + React + TypeScript with Leaflet or MapLibre and Turf.js.

### Context

The application needs map rendering, state management, geospatial calculations, and a simple UI. It does not need persistence or server-side processing.

### Rationale

A frontend-only stack minimizes setup and makes the demo easy to run.

### Consequences

The first implementation will not demonstrate server architecture. That is acceptable for the scope.

---

## D-008: Make AI usage explicit

**Date:** 2026-06-12

### Decision

The repo should document how AI was used throughout the project.

### Context

The assignment specifically asks for AI-assisted work and evaluates process.

### Rationale

An explicit AI usage record shows that AI was used as an accelerator and critique partner, while the human retained product judgment and scope control.

### Consequences

Future implementation should add or expand an `AI_USAGE.md` or similar doc after Claude Code starts making changes.

---

## Open questions

These are intentionally unresolved for the implementation agent to consider:

1. Should the first map use Leaflet or MapLibre?
2. Should the quest fixture be TypeScript objects or GeoJSON?
3. Should the UI be a single-page app with one quest or support multiple quests?
4. Should tests be included immediately or after the first demo loop works?
5. Should the app include a generated briefing as static text or a mock AI generation panel?
6. Should Mermaid diagrams live in a future `ARCHITECTURE.md` file or be added during implementation?

## Current next decision

The next agent should decide the implementation scaffold and create a minimal demoable app.
