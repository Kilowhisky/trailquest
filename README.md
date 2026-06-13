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

## The quest loop

1. **Explore.** Five checkpoints start hidden as faint `?` pins (fog-of-war). Drag the blue marker or
   click the map to move; crossing a checkpoint's **discovery radius** reveals it.
2. **Check in.** Inside a checkpoint's geofence, check in for **+100**. Three scenic checkpoints offer a
   self-attested **photo bonus (+50)**.
3. **Stay access-aware.** The access banner reflects the **real land owner** under your feet (BLM / SITLA /
   NPS). The 6th waypoint — the real **Tower Arch** — sits just inside Arches NP; its check-in is **blocked**
   (earning the *Access Aware* badge) because the park is off-limits to this game.
4. **Find the cache.** A fuzzy ~150 m search circle hides a geocache (**+250**) off-route.
5. **Finish clean.** Complete all five checkpoints with no caution-zone check-ins for the **Clean Run +100**,
   then sign the completion **posterboard**. A perfect run = **1000** with all **8 badges**.

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
npm run dev        # http://localhost:5173
npm test           # 61 tests
npm run build      # production build (deployed to GitHub Pages)
```

The real Moab data was fetched once at authoring time and committed under `src/data/sources/`. To
re-fetch: `node scripts/fetch-moab-data.mjs` (resilient, cached, no keys required).

## How this was built (the AI-assisted process)

The take-home is judged on *a clear AI-assisted engineering process*, so the process is part of the
deliverable:

- **Brainstorm → spec → plan** for every feature before code (see `docs/specs/`, `docs/DECISIONS.md`).
- **A serial PR train** — one PR per build step (7), each in its own git worktree, gated by **GitHub
  Actions CI** (typecheck · lint · test · build), reviewed by **GitHub Copilot**, and squash-merged.
- **Adversarial multi-agent verification** of the high-risk pure logic — the real-data fetch, `lib/geo.ts`,
  and the scoring/reducer — caught real bugs before merge (e.g. a BLM MultiLineString mis-attribution and an
  elevation-gain corruption on a dropped sample).
- **TDD** on the pure geospatial + scoring layers; **browser QA** (Chrome DevTools) on every UI step.
- Every merge **auto-deploys** the live demo to GitHub Pages.

The full story, including the AI copy-generation prompts: [`docs/AI_USAGE.md`](docs/AI_USAGE.md). The
delivery pipeline: [`docs/CICD.md`](docs/CICD.md). The code architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

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
