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

## D-009: Keep agent memory and chat logs in docs

**Date:** 2026-06-12

### Decision

Keep persistent agent memory and chronological AI-agent chat/session logs inside the `docs/` folder.

Specifically:

- `docs/MEMORY.md` holds durable agent state, current implementation status, constraints, and next best actions.
- `docs/CHAT-LOG.md` holds chronological summaries of meaningful AI-agent sessions.

### Context

The project will likely be handed from ChatGPT/bootstrap work to Claude Code / Claude Max implementation work. Without explicit memory and session logs, future agents may lose context, repeat decisions, or overbuild.

### Rationale

Putting agent state inside `docs/` makes the AI process visible, versioned, reviewable, and easy for future sessions to discover.

### Consequences

Future agents should read these files before major work and update them after meaningful sessions. These files are part of the take-home artifact and should remain concise and factual.

---

## D-010: Define objective-based scoring; add geocache sidequest and mock posterboard

**Date:** 2026-06-12

### Decision

Adopt an **objective-based scoring model** (perfect run = 1000 pts): checkpoint check-ins
(100×5), photo bonuses (50×3), a hidden **geocache sidequest** (+250), and an access-aware
**Clean Run bonus** (+100). **No time-based scoring.** Add a completion **posterboard** as a
mocked, session-only social reward (no points; grants a badge). Full detail in
[docs/specs/scoring-design.md](specs/scoring-design.md).

### Context

Scoring was sketched in the implementation plan but lacked concrete values and rules. Two new
mechanics emerged during brainstorming: a hidden geocache (a discovery-style bonus objective)
and an end-of-quest posterboard where users leave a message for the next quester.

### Rationale

- Objective-based scoring fits the click-to-move simulated location ([D-003](#d-003-use-simulated-location-instead-of-browser-gps));
  a speed/time bonus would be meaningless and a visible tell under teleport-style movement.
- The geocache showcases the geofence primitive in "search" mode and is the most
  geocaching-native mechanic in the app.
- A **Clean Run bonus** puts onX's core access-awareness value ([D-004](#d-004-include-access-awareness-as-a-first-class-concept))
  directly into the score, not just a badge.

### Consequences

- The posterboard is **deliberately mocked** and session-only, extending — not violating —
  [D-005](#d-005-avoid-backendauthsocial-features-in-the-first-pass): no backend/persistence is
  added; messages are pre-seeded fixtures plus local state, labeled "demo — not saved." A real
  persistent/social posterboard becomes a roadmap item.
- `lib/scoring.ts` gains geocache, photo, and clean-run logic (all pure, unit-tested).

---

## D-011: Pin testing strategy and the spatial/scoring semantics it depends on

**Date:** 2026-06-12

### Decision

Adopt the testing plan in [docs/specs/testing-plan.md](specs/testing-plan.md): **Vitest** unit tests
on the pure `lib/geo.ts` and `lib/scoring.ts`, plus **reducer tests** on `state/questReducer.ts`
(the geo + scoring integration seam), plus **one `App` smoke test** with `react-leaflet` mocked.
Skip E2E/Playwright and map-render testing. Tests are written **alongside** each module as it is
built (resolving open question #4 below), not deferred to after the demo loop.

In the course of pinning the tests, lock down five previously-ambiguous behaviors:

1. **Geofence boundary is inclusive** — a point exactly at `radius` meters is *inside*
   (`distance <= radius`).
2. **Zone precedence on overlap: `restricted > caution > public`** — most-restrictive wins. This
   puts onX's access-aware ethos ([D-004](#d-004-include-access-awareness-as-a-first-class-concept))
   into the spatial logic, not just the copy.
3. **A point outside all access polygons classifies as `'public'`** — a permissive fallback so
   check-in still works; the broad public zone is expected to cover the play area regardless.
4. **All scoring bonuses are idempotent** — check-in, photo bonus, and geocache find each award
   exactly once; re-dispatch is a no-op.
5. **Restricted check-ins are gated in the reducer, not in `applyCheckIn`** — the reducer blocks the
   check-in (no points, no status change) but still grants the `Access Aware` badge, since that
   badge fires on a *heeded* warning. `applyCheckIn` stays pure and assumes an allowed check-in.

### Context

The implementation plan committed to "Vitest on pure geo functions + one component smoke test" but
did not enumerate cases, and the scoring spec left several boundary behaviors implicit (overlap
precedence, geofence edge, idempotency, where restricted-zone gating lives). Writing a concrete test
inventory forced each of these into the open.

### Rationale

- The pure geo/scoring layer is where the spatial reasoning lives and where bugs are silent, so it
  earns the most tests; for a process-judged take-home the tests also **document** that reasoning.
- A reducer test layer was added because the original plan tested the pure ends but not the seam
  that wires them together — the realistic home for integration bugs.
- The five semantics are decisions, not test trivia: each changes observable behavior, so each is
  recorded here and asserted by exactly one test.

### Consequences

- `lib/geo.ts` must implement inclusive geofences and most-restrictive zone precedence with a
  `'public'` default; `lib/scoring.ts` must enforce once-only bonuses; the reducer owns
  restricted-zone gating and the `Access Aware`-on-block rule.
- Suite is ~29 small, fast tests (no DOM except the single smoke test). E2E and map rendering remain
  out of scope, covered by the plan's manual verification checklist.

---

## Open questions

These are intentionally unresolved for the implementation agent to consider:

1. Should the first map use Leaflet or MapLibre?
2. Should the quest fixture be TypeScript objects or GeoJSON?
3. Should the UI be a single-page app with one quest or support multiple quests?
4. ~~Should tests be included immediately or after the first demo loop works?~~ **Resolved by
   [D-011](#d-011-pin-testing-strategy-and-the-spatialscoring-semantics-it-depends-on): written
   alongside each module.**
5. Should the app include a generated briefing as static text or a mock AI generation panel?
6. Should Mermaid diagrams live in a future `ARCHITECTURE.md` file or be added during implementation?

## Current next decision

The next agent should decide the implementation scaffold and create a minimal demoable app.
