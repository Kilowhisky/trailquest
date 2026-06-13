# TrailQuest

**An AI-generated, access-aware outdoor scavenger hunt over real Moab, Utah trail data.**

> 🗺️ **Live demo: <https://kilowhisky.github.io/trailquest/>**

TrailQuest is a geospatial product prototype built for an onX Maps AI take-home. Maps already help
outdoor users answer *where am I?* and *where can I go?* — TrailQuest explores a third question:
**what should I go do outside today?** It turns map primitives (waypoints, geofences, routes, land-access
layers, trail metadata, elevation) into a scored outdoor quest.

The demo runs over the **real Klondike Bluffs / Bar M trail system north of Moab**, where BLM
mountain-bike singletrack runs right up against the **Arches National Park** boundary — an authentic
public-land → restricted-park edge that drives the access mechanic. Open the
[live demo](https://kilowhisky.github.io/trailquest/) to play it.

## How to play the demo

Open the [live demo](https://kilowhisky.github.io/trailquest/) — no install, no sign-in, no GPS.

**Controls.** Your location is *simulated* so you can play from a desk: **drag the blue "you" marker**, or
**click anywhere on the map** to jump there. Everything recomputes live as you move.

**The screen.**

- *Top-left* — the **briefing** (an AI-written quest intro; click the header to collapse it) and, below it,
  the **score** card (current / 1000, the breakdown line, the route's elevation sparkline, and your badge chips).
- *Top-right* — the **access banner** (your current land tier + the real owner) and the **checkpoint panel**
  (the five scored checkpoints + the forbidden waypoint).
- *Bottom-right* — a **hillshade** toggle and a live **coordinate readout** (lat/lng + UTM).

**Walk the quest — each step, and what it means:**

1. **Explore to discover (fog-of-war).** The five checkpoints start as faint `?` pins. Move toward one; when
   you cross its (wider) **discovery radius** it resolves into a numbered checkpoint and unlocks its panel
   row. *Why it matters: discovery is driven purely by where you've been — proximity over time — the most
   genuinely geospatial mechanic in the app.*
2. **Check in (+100).** Move inside a checkpoint's **geofence** (the small ring) and the panel's **Check in**
   button enables. *A geofence is a radius around a point; check-in is gated on a point-in-circle test
   (`distance ≤ radius`).* Earns **Trailhead** (first check-in), **Pathfinder** (all five discovered), and
   **Quest Complete** (all five checked in).
3. **Grab the photo bonus (+50).** Three scenic checkpoints show an "I got the shot" button (a mock
   self-attest) with a prompt referencing a real nearby feature. Earns **Shutterbug**.
4. **Stay access-aware.** As you move, the banner color tracks the **real land owner** beneath you — green
   **BLM (public)**, yellow **SITLA (caution)**, red **NPS (restricted)** — computed by point-in-polygon over
   real ownership boundaries, most-restrictive wins. *This is onX's land-access ethos turned into a live signal.*
5. **Respect the boundary.** Move to **Tower Arch** (the red ⛔ marker just inside the red Arches zone) and
   press **Try check-in** → it's **blocked** with a "do not enter" message, earning **Access Aware**. *The
   game refuses to send you into a national park.*
6. **Find the hidden geocache (+250).** A fuzzy purple **search circle** hides a small exact cache off-route;
   wander inside until you trip it. Earns **Cache Hunter**.
7. **Finish clean & sign off.** Check in at all five → **Quest Complete**. Finish with **no caution-zone
   check-in** for the **Clean Run +100**. The completion **posterboard** opens (seeded with fictional
   prior-quester notes); add your own (session-only, *"demo — not saved"*) to earn **Left Your Mark**.

A flawless run scores **1000 / 1000** and lights all **8 badges**.

### Scoring & badges

| Source | Points | Badges earned |
| --- | --- | --- |
| Checkpoint check-ins | +100 × 5 = **500** | Trailhead · Pathfinder · Quest Complete |
| Photo bonuses | +50 × 3 = **150** | Shutterbug |
| Hidden geocache | **+250** | Cache Hunter |
| Clean Run (no caution check-in) | **+100** | Clean Run · Access Aware |
| Posterboard (no points) | — | Left Your Mark |
| **Perfect run** | **1000** | **all 8** |

## Real vs. mocked

The geography is **real and sourced**; only the *game layer* is invented.

| Real (sourced, committed static) | Mocked (the game) |
| --- | --- |
| Trail geometry + names (OSM) | Quest storyline & briefing copy |
| Land-ownership polygons → access tiers (UGRC / BLM / NPS) | Point values, badges, photo prompts |
| Per-checkpoint elevation + on-trail route profile (USGS 3DEP) | The geocache objective + posterboard |
| Difficulty / surface / mileage attributes (OSM / BLM) | The public/caution/restricted **tier mapping** |
| Satellite + hillshade imagery (Esri) | |

> **Disclaimer (shown in-app):** geometry, ownership & elevation are real (OSM / UGRC / BLM / USGS);
> the quest, scoring & access tiers are a fictional game — *not legal, navigational, or land-access guidance.*

Full provenance + licenses: [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md).

## Tech stack

- **Vite 6 + React 18 + TypeScript** (frontend-only; no backend, no auth, no runtime API calls)
- **Leaflet** via `react-leaflet@4`; keyless **Esri World Imagery** + **World Hillshade** tiles
- **Turf.js** for distance, point-in-polygon, and authoring-time route-network shortest-path
- **Tailwind CSS v4** + **sonner** toasts; dark, rugged, orange-accent theme
- **Vitest + Testing Library** — 61 tests (pure geo + scoring + reducer integration + smoke)

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
npm run test:run     # run the 61 tests once  (npm test = watch mode)
npm run build        # production build (deployed to GitHub Pages)
```

The real Moab data was fetched once at authoring time and committed under `src/data/sources/`. To
re-fetch: `node scripts/fetch-moab-data.mjs` (resilient, cached, no keys required).

## How this app was built (with Claude)

TrailQuest was planned, built, reviewed, and shipped with **Claude (Claude Code)** under human direction.
Because the take-home is judged on *a clear AI-assisted engineering process*, that process is itself part of
the deliverable:

- **Brainstorm → spec → plan, before any code.** Every feature was talked through, written up as a spec, and
  folded into one authoritative plan (`docs/specs/`, `docs/plans/`, `docs/DECISIONS.md` — decisions D-001…D-014).
- **Built autonomously through a serial PR train.** Claude implemented the **seven build steps one pull
  request at a time**, each in its own **git worktree** off an updated `main`, gated by **GitHub Actions CI**
  (typecheck · lint · test · build), reviewed by **GitHub Copilot** (every comment triaged and answered),
  then squash-merged — which **auto-deploys** the live demo to GitHub Pages.
- **Adversarial multi-agent verification.** For the high-risk pure logic — the real-data fetch, `lib/geo.ts`,
  and the scoring/reducer — Claude spun up fan-out workflows of independent agents that re-derived results and
  tried to *refute* the work. They caught real bugs the happy-path tests missed: a BLM `MultiLineString`
  mis-attribution, an elevation-gain corruption on a dropped USGS sample, UTM band/zone edge cases, and a
  completion/delta coupling — all fixed before merge.
- **TDD + browser QA.** The pure geospatial and scoring layers were written **test-first** (the 61 tests
  double as documentation of the reasoning); every UI step was verified live in **Chrome DevTools**, through
  to a perfect 1000 with all 8 badges and a clean console.
- **Human in the loop.** Chris set product direction and scope and approved each gate — and caught a real
  diagnostic miss (a `curl`/Windows-TLS quirk that falsely reported a data host as down), which recovered the
  BLM attribute layer.

The full story, including the AI copy-generation prompts and the honest *"where AI was wrong"* moments:
**[`docs/AI_USAGE.md`](docs/AI_USAGE.md)**. The delivery pipeline: [`docs/CICD.md`](docs/CICD.md). The code
architecture (with a Mermaid loop diagram): [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The PR-by-PR log:
[`docs/WORKLOG.md`](docs/WORKLOG.md).

## Project layout

```text
src/
  lib/geo.ts            # pure spatial primitives (distance, geofence, classifyAccess, UTM, gain…)
  lib/scoring.ts        # pure scoring (checkin/photo/geocache/cleanrun, derived badges + totals)
  state/questReducer.ts # geo + scoring integration seam (the reducer)
  data/                 # typed quest fixtures + committed real GeoJSON sources
  components/           # MapView + floating overlay cards
  types/quest.ts        # the domain model
scripts/fetch-moab-data.mjs   # authoring-time real-data fetch + route snapping + elevation
docs/                   # specs, decisions, data sources, AI usage, architecture, CI/CD
.github/workflows/      # ci.yml (gate) · deploy.yml (Pages)
```

## onX relevance

onX Offroad centers on outdoor confidence, navigation, access, trails, and user-created map data.
TrailQuest is a feature hypothesis, not a clone: *if users already plan, navigate, mark, and track
outdoor experiences, a quest layer could give them structured reasons to explore* — with land-access
awareness as a first-class, onX-native mechanic.

## Non-goals (out of scope by design)

Production backend · user accounts · real onX integration · authoritative/real-time land-access status
(geometry is real; the access **tiers** are an illustrative game) · multiplayer · production photo
verification · paid map providers.

## License

[MIT](LICENSE).
