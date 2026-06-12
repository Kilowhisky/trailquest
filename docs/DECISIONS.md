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

**Amended 2026-06-12 (D-011, D-013):** the *static / committed-at-authoring-time* premise holds, but
*fictional geometry* is reversed. Trail and land **geometry is now real** (OSM / BLM / UGRC), fetched
once at authoring time and committed static — the app still makes no runtime calls. Only the **game
layer** (quest storyline, point values, badges, access **tiers**) is mocked.

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

**Amended 2026-06-12 (D-011, D-013):** access *polygons* are no longer fictional — they are **real
land-ownership boundaries** (BLM / UGRC / NPS) reclassified into `public` / `caution` / `restricted`
tiers. Point-in-polygon now runs on real boundaries; the **tier mapping** is the game. Legal /
authoritative access assertions and real-time closures remain out of scope, surfaced with a clear
"not legal, navigational, or land-access guidance" disclaimer.

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

## D-012: Deepen real-data authenticity — surface attributes, add elevation + on-trail distance, terrain/feature polish

**Date:** 2026-06-12

### Decision

Extend the real-data grounding (D-011) with three tiers of enhancement, each frontend-only,
authoring-time-sourced, and committed static — never any new runtime call. Detail lives in three specs:

1. **Real attribute surfacing**
   ([spec](specs/2026-06-12-real-attribute-surfacing-design.md)) — render the **verbatim** land-owner
   string on the access banner, plus checkpoint difficulty/surface/mileage and trailhead amenities, all
   from fields already fetched (`outFields=*`). `classifyAccess` returns `{ tier, ownerLabel }`.
2. **Elevation & on-trail distance**
   ([spec](specs/2026-06-12-elevation-and-on-trail-distance-design.md)) — real per-checkpoint elevation
   and route profile/total climb from **USGS 3DEP** (public domain, keyless), and a quest route **snapped
   to OSM trail geometry** so the drawn path follows real singletrack and route mileage is on-trail.
   Live "distance to target" stays honest great-circle; the two distances are labeled distinctly.
3. **Terrain & named-feature polish**
   ([spec](specs/2026-06-12-terrain-and-named-feature-polish-design.md)) — keyless **Esri World
   Hillshade** toggle, photo prompts anchored to real OSM features, a **named WSA** caution label, and a
   live lat/lng + UTM coordinate readout.

### Context

After committing to real geometry (D-011), the question was how much further authenticity could go
without breaking the frontend-only / no-CORS / timeboxed shape. The fetched layers carried rich
attribute tables the plan was discarding, the prototype had no third (elevation) dimension, and routes
were straight hops rather than real trail. Two new endpoints were **live-verified over Moab**: USGS
3DEP EPQS elevation and Esri World Hillshade tiles; named features reuse the already-verified OSM
Overpass host.

### Rationale

- Authenticity-per-minute: Tier 1 is nearly free (already-fetched fields → UI), Tier 2 is the
  substantive new data dimension, Tier 3 is independent, cuttable polish.
- It tightens D-011's promise — a verbatim owner string and a route tracing real singletrack can't drift
  from what a local knows or the imagery shows.
- All three keep the spatial logic pure and testable (`computeGain`, `routeTotals`, `formatLatLon`,
  `toUTM`, extended `classifyAccess`) and add no scoring (no movement-model tell under teleport sim).

### Consequences

- Authoring (`scripts/fetch-moab-data.mjs`) gains an elevation fetch, route-snapping, and a named-feature
  fetch; commits `route.geojson` + `named_features.geojson`. Attribution adds USGS 3DEP (public domain)
  and Esri hillshade.
- `lib/geo.ts`, `types/quest.ts`, `MapView`, `AccessBanner`, `CheckpointPanel`, and `ScoreCard` gain the
  presentation surfaces above. No backend, no dependencies beyond the existing `@turf/*`, no runtime calls.
- Tiering is explicit so the timebox stays controllable; Tier 3 is the trim-first group.

---

## D-013: Consolidation — record the real-data reversal, resolve the scoring/restricted contradiction, pin remaining semantics

**Date:** 2026-06-12

### Decision

A consolidation pass (full repo review) to make the corpus internally consistent before implementation,
with the build scope confirmed as the **full corpus** (D-010 + D-011 + D-012 all three tiers + fog-of-war):

1. **Record the real-data reversal on its source decisions.**
   [D-002](#d-002-use-static-fixture-data-first) and
   [D-004](#d-004-include-access-awareness-as-a-first-class-concept) are amended in place to point at D-011:
   geometry is **real** and committed static; only the game layer is mocked.

2. **Resolve the perfect-run contradiction — no *scored* checkpoint in a restricted zone.** All **5 scored
   checkpoints** sit only in `public` / `caution` zones, so a perfect run = **1000** and the **Quest
   Complete** badge (all 5 checked in) are both achievable. The restricted-block mechanic is demonstrated
   by a **6th, unscored "forbidden" waypoint** placed just inside the restricted (NPS / Arches) line — a
   tempting scenic overlook whose check-in is **always blocked** (do-not-enter message). It awards the
   **Access Aware** badge, **no points**, and does **not** count toward Quest Complete. This keeps a live
   blocked-check-in UX while preserving `max = 1000`.

3. **Pin "Access Aware" semantics.** It fires the first time the app surfaces an access warning the user
   acknowledges: a **blocked restricted** check-in attempt **or** a **caution-zone** check-in. This
   supersedes the looser "heeded" wording in [scoring-design.md](specs/scoring-design.md).

4. **Canonical badge set = 8:** Trailhead, Access Aware, Shutterbug, Cache Hunter, Clean Run, **Pathfinder**
   (fog-of-war), Left Your Mark, Quest Complete. **Pathfinder = all 5 *scored* checkpoints discovered**; the
   forbidden waypoint is shown from the start as a "restricted — do not enter" marker, not a discovery
   target. The scoring spec's 7-badge table is updated to add Pathfinder.

5. **Resolve the stale "Open questions."** Questions 1, 2, 3, 5, 6 are answered by the implementation plan
   and struck through below; the doc index, `CHANGELOG.md`, `docs/CHAT-LOG.md`, and `docs/MEMORY.md` are
   synced to the current corpus.

6. **Doc-naming note.** `docs/DATA-SOURCES.md` (per-dataset **data** attribution, created at implementation)
   is distinct from `docs/ATTRIBUTION.md` (AI **commit-message** convention). Both are kept and
   cross-referenced so the similar names don't confuse a reviewer.

### Context

Three decision waves — D-010 (scoring), D-011 (real-data reversal), D-012 (authenticity) — were layered onto
an original "fictional data only" framing. The base context docs (README, CONTEXT, DOMAIN-CONTEXT, MEMORY)
still described the superseded mock-only world; the open-questions list was stale (5 of 6 answered); and the
scoring spec and implementation plan disagreed on whether a checkpoint sits in a restricted zone — which made
the headline "perfect run = 1000" and the "Quest Complete" badge unreachable. A full review surfaced these.

### Rationale

- A future agent reads `MEMORY.md` / `README.md` first; leaving them on the old premise is the highest-risk
  drift in the repo.
- "No scored checkpoint in restricted" is the only resolution that keeps **both** the 1000-point headline and
  a **live** restricted-block demo; the unscored forbidden waypoint turns the access lesson into a concrete,
  onX-flavored moment without touching the point model.
- Pinning Access Aware and the badge set removes the remaining contradictions between the scoring spec, the
  testing plan, and the fog-of-war spec.

### Consequences

- `types/quest.ts` gains an unscored/forbidden waypoint flag; the quest fixture adds the 6th waypoint;
  `MapView` / `CheckpointPanel` render it distinctly; the reducer's restricted-block path (already in the
  testing plan) gains a live trigger. The point model and `max = 1000` are unchanged.
- [scoring-design.md](specs/scoring-design.md) and [testing-plan.md](specs/testing-plan.md) are updated for
  the Pathfinder badge, the Access Aware wording, and the restricted-reachability resolution.
- This is the last planning decision before the executable implementation plan; no app code is written in
  the consolidation pass itself.

---

## Open questions

Resolved during consolidation (D-013). Kept here as a record of how each was answered:

1. ~~Should the first map use Leaflet or MapLibre?~~ **Resolved:** Leaflet via `react-leaflet@4`
   (implementation plan).
2. ~~Should the quest fixture be TypeScript objects or GeoJSON?~~ **Resolved:** typed TS objects whose
   geometry is GeoJSON-compatible (`[lng,lat]`); real source layers are committed GeoJSON.
3. ~~Should the UI be a single-page app with one quest or support multiple quests?~~ **Resolved:** one rich
   single quest, ~5 checkpoints.
4. ~~Should tests be included immediately or after the first demo loop works?~~ **Resolved by
   [D-011](#d-011-pin-testing-strategy-and-the-spatialscoring-semantics-it-depends-on): written
   alongside each module.**
5. ~~Should the app include a generated briefing as static text or a mock AI generation panel?~~ **Resolved:**
   Claude-pre-generated copy committed as static fixtures, rendered in `BriefingCard`; AI authoring is
   documented in `docs/AI_USAGE.md`.
6. ~~Should Mermaid diagrams live in a future `ARCHITECTURE.md` file or be added during implementation?~~
   **Resolved:** a short `docs/ARCHITECTURE.md` with one Mermaid loop diagram, added during implementation.

## Current next decision

Consolidation is complete (D-013). The next step is to turn the authoritative implementation plan into an
executable task breakdown (via the writing-plans skill), then scaffold the app.
