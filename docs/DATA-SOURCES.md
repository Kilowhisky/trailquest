# Data Sources & Attribution

TrailQuest grounds its map in **real Moab, Utah geospatial data** (decision
[D-011](DECISIONS.md) / [D-012](DECISIONS.md)). Geometry, land ownership, elevation, and
named features are real and sourced; **only the game layer** (quest storyline, point values,
badges, photo prompts, the geocache objective, and the access *tier reclassification*) is
invented. See the in-app disclaimer:

> *Trail and land geometry are real and sourced (OSM / UGRC / BLM / USGS); the quest, scoring,
> and access tiers are a fictional game — not legal, navigational, or land-access guidance.*

All data is fetched **once at authoring time** by [`scripts/fetch-moab-data.mjs`](../scripts/fetch-moab-data.mjs)
and committed as static GeoJSON under [`src/data/sources/`](../src/data/sources/). **The app makes
no runtime calls** to any of these hosts (they send no CORS headers), keeping it frontend-only.

## Demo area

**Klondike Bluffs / Bar M, north of Moab** — real BLM mountain-bike singletrack that runs up
against the **Arches National Park** boundary, giving an authentic public-BLM → state-SITLA →
restricted-NPS edge for the access mechanic. bbox `[-109.78, 38.70, -109.58, 38.84]` (WSEN).

## Datasets

| Layer | File | Source | License / credit |
| --- | --- | --- | --- |
| Hero trails (geometry, names, surface, difficulty) | `moab_trails.geojson` | **OpenStreetMap** via Overpass (`overpass.kumi.systems`); UGRC TrailsAndPathways fallback | ODbL 1.0 — © OpenStreetMap contributors |
| Land ownership → access tiers | `land_ownership.geojson` | **Utah UGRC** Land Ownership (`gis.trustlands.utah.gov`) — fields `owner`, `admin` | CC BY 4.0 — UGRC |
| Trailheads | `trailheads.geojson` | **Utah UGRC** UtahTrailheads | CC BY 4.0 — UGRC |
| MTB difficulty / mileage attributes | `blm_mtb.geojson` | **BLM** National Mountain Bike layer (`gis.blm.gov`) | Public domain — Bureau of Land Management |
| Named features (arches / peaks / viewpoints) | `named_features.geojson` | **OpenStreetMap** via Overpass | ODbL 1.0 — © OpenStreetMap contributors |
| Per-checkpoint elevation + route elevation profile | `route.geojson`, `checkpoints.authored.json` | **USGS 3DEP** EPQS (`epqs.nationalmap.gov`) | Public domain — USGS 3DEP |
| On-trail quest route (snapped to OSM trail network) | `route.geojson` | Derived from OSM trail geometry via Turf network routing | ODbL 1.0 (geometry) |
| Satellite basemap | *(runtime tiles)* | **Esri World Imagery** | Esri ToU — © Esri, Maxar, Earthstar Geographics |
| Hillshade overlay (optional) | *(runtime tiles)* | **Esri World Hillshade** | Esri ToU — © Esri |

> Note: per-checkpoint **difficulty/surface** come from OSM (`mtb:scale`/`surface`); the BLM MTB
> layer supplies **route name + mileage + MTB Project link** (no difficulty field). UGRC
> UtahTrailheads records an upstream per-feature `DataSource` (e.g. *OrbitalView*) — the UGRC
> CC BY 4.0 credit covers redistribution; the field is not a separate uncredited source.

## Access-tier reclassification (the game layer over real ownership)

Real land-ownership polygons are reclassified into three game tiers. The **tier mapping is the
game; the owner string is the truth** — the app shows both, and point-in-polygon runs on the real
boundaries:

| Real owner (UGRC `owner`/`admin`) | Game tier |
| --- | --- |
| BLM (Bureau of Land Management) | **public** |
| State / SITLA / FFSL / Utah State Parks (USP) / WSA / USFS | **caution** |
| NPS (Arches National Park) / Private | **restricted** |

> The mapping covers WSA/USFS for generality; the owners actually present in this bbox are
> **BLM, NPS, Private, SITLA, FFSL, and Utah State Parks (USP)** (verified against
> `land_ownership.geojson`).

In this quest all **5 scored checkpoints** sit on **BLM public** land (so a clean perfect run is
reachable); the **6th, unscored "Tower Arch" waypoint** sits just inside the **NPS (restricted)**
Arches boundary — its check-in is always blocked, demonstrating the access lesson with a real,
locally-recognizable feature.

## Combined attribution string (shown in-app)

> Trail data © OpenStreetMap contributors (ODbL) · Land ownership © UGRC (CC BY 4.0) ·
> MTB attributes © BLM (public domain) · Elevation © USGS 3DEP (public domain) ·
> Imagery © Esri, Maxar, Earthstar Geographics

## Reproducing the fetch

```bash
node scripts/fetch-moab-data.mjs
```

Responses are cached under `.cache/` (git-ignored) so re-runs don't re-hit rate-limited APIs.
The script is resilient: OSM falls back to UGRC TrailsAndPathways if Overpass is unavailable, and
named features degrade to generic photo prompts. Geometry is simplified with Turf to keep the
committed files small; the on-trail route is built by shortest-path over the real trail network.
