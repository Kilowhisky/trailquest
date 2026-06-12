# Research: Real Moab Geospatial Data Sources

Captured 2026-06-12 from three parallel research passes. **All endpoints below were live-verified
against the Moab bbox** `-109.7,38.4,-109.4,38.7` (lon/lat, EPSG:4326) and returned real features.
Purpose: decide whether/how to replace TrailQuest's invented fixtures with authentic trail + land data.

> **Important framing / decision reversal:** the original docs (`DECISIONS.md` D-002/D-004) chose
> *fictional* quest and access polygons specifically to avoid real legal/access claims. Using real
> land-ownership and trail geometry **reverses that** and requires a reframed disclaimer:
> *the geography is real and authoritative, but the quest, scoring, and any access-tier simplification
> are illustrative — not legal, navigational, or land-access guidance.*

All three source families are **no auth / no API key**, GeoJSON-native, and bbox-filterable.

## A. OpenStreetMap — best singletrack geometry + authentic names

- **Endpoint:** `POST https://overpass-api.de/api/interpreter` (form-encode the query as `data=`; raw body → HTTP 406).
- **Verified query** (Overpass bbox order is S,W,N,E): returns ~423 named trail ways + 20 route relations, 207 distinct named trails.

```overpassql
[out:json][timeout:90];
(
  way["highway"~"^(path|track|footway|cycleway|bridleway)$"]["name"](38.4,-109.7,38.7,-109.4);
  relation["route"~"^(mtb|bicycle|hiking|foot)$"](38.4,-109.7,38.7,-109.4);
);
out geom;
```

- **Convert:** pipe through `osmtogeojson` (handles `out geom;` + relations) → `moab_trails.geojson`.
- **Real Moab trails confirmed present:** Slickrock, Captain Ahab (Upper/Lower), HyMasa, Amasa Back,
  Porcupine Rim (singletrack + 4x4), Poison Spider, Whole Enchilada, Moab Rim, Sovereign, Metal Masher,
  Killer B, Rusty Nail. (Klondike Bluffs sits just NW — extend bbox north to ~38.75 to capture it.)
- **License:** ODbL 1.0. Attribution: `© OpenStreetMap contributors` + reachable link to
  https://www.openstreetmap.org/copyright.

## B. BLM national ArcGIS REST (`gis.blm.gov`) — public domain, app-ready attributes

Pattern: `<layer>/query?where=1=1&geometry=-109.7,38.4,-109.4,38.7&geometryType=esriGeometryEnvelope&inSR=4326&outSR=4326&outFields=*&f=geojson`
(`maxRecordCount=2000`; pass `outSR=4326`; some layers are 3857/4269 natively).

- **MTB singletrack** (21 Moab features; names, miles, photo + MTB-Project links):
  `https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_MTB/MapServer/1`
- **Ground Transportation Linear Features (GTLF)** — OHV/route network w/ travel-management designations
  (`PLAN_OHV_ROUTE_DSGNTN` = Open/Closed/Limited; 836 motorized-road features in bbox):
  `https://gis.blm.gov/arcgis/rest/services/transportation/BLM_Natl_GTLF_Public_Display/MapServer`
  (layer 0 public-motorized roads … layer 7 all-designated-trails)
- **Recreation sites / trailheads** (47 pts; layer 7 = trailheads):
  `https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_Recreation_Sites_Facilities/MapServer`
- **Surface Management Agency (land ownership polygons)** — query layer 1:
  `https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_LimitedScale/MapServer/1`
- **License:** US federal → public domain. Credit: `Source: Bureau of Land Management (BLM)`.
- **CORS:** no permissive headers — authoring-time fetch only, commit static (matches our architecture).

## C. Utah UGRC / SGID — authoritative state data, CC BY 4.0

Host `https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/<svc>/FeatureServer/0`; no auth; `f=geojson`; bbox-filterable; page past 2000 via `resultOffset`.

- **Trails and Pathways** (richest single trail layer; `MotorizedAllowed`, `SurfaceType`, `Class`,
  `DesignatedUses`, `OwnerSteward`): `…/TrailsAndPathways/FeatureServer/0`
- **Land Ownership** (SITLA/BLM — authoritative surface management: BLM/NPS/SITLA/USFS/Private):
  `https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0`
  (fields `owner`, `admin`, `state_lgd`)
- **Utah Roads** (4WD/dirt: `DOT_SRFTYP IN ('Dirt','Native')`, `ACCESSCODE LIKE '%4WD%'`): `…/UtahRoads/FeatureServer/0`
- **Trailheads:** `…/UtahTrailheads/FeatureServer/0`
- **NPS Public Trails** (Arches/Canyonlands; public domain):
  `https://mapservices.nps.gov/arcgis/rest/services/NationalDatasets/NPS_Public_Trails/FeatureServer/0`
- **License:** CC BY 4.0 — credit `UGRC`. (NPS = public domain.)

## Basemaps (keyless, for Leaflet) — confirmed 200/JPEG over Moab

- **Esri World Imagery** (default red-rock satellite):
  `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
  — attribution `Tiles © Esri — Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community`.
  Esri ToU (not public domain); fine for a demo.
- **USGS Imagery Only** (fully public-domain alternative):
  `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}`
  — `Imagery: USDA, USGS The National Map (public domain)`.

## Recommendation for TrailQuest

Strongest authenticity-per-minute, keeping the frontend-only / commit-static architecture:

1. **Trail lines:** OSM Overpass → 4–6 hero trails (Slickrock, Captain Ahab, Porcupine Rim, Amasa Back…),
   simplified, committed as `moab_trails.geojson`.
2. **Access zones (the differentiator):** real **land-ownership polygons** (Utah Land Ownership *or*
   BLM SMA), reclassified into our tiers — e.g. BLM/open OHV → **public**, State/SITLA or WSA → **caution**,
   NPS / Private → **restricted**. This makes point-in-polygon access checks use *real* boundaries.
3. **Checkpoints:** anchor to real trailheads/waypoints (BLM or UGRC trailhead points) along the hero trails.
4. **Imagery:** Esri World Imagery (already chosen); USGS ImageryOnly as a public-domain fallback.

**Combined attribution (UI + `docs/DATA-SOURCES.md`):**
`Trail data © OpenStreetMap contributors (ODbL) · Land data © UGRC (CC BY 4.0) / BLM (public domain) · Imagery © Esri, Vantor, Earthstar Geographics & the GIS User Community`

**Authoring step (to add to build sequence):** fetch via the URLs above → clip to a tight Moab bbox →
simplify (Turf/mapshaper) to keep files small → commit GeoJSON + attribution. No runtime calls to these hosts.

## Decision (2026-06-12): full grounding, real geometry + mock game only

Approved direction: **make the geography as real as possible; mock only the invented game layer.**

Governing principle — **never contradict what a local would know or what the satellite imagery shows:**
- Trail lines, land boundaries, trailheads, and checkpoint placements come from the verified sources
  above and must line up with the Esri imagery (no checkpoint on bare slickrock described as a creek;
  no labeling the public Slickrock Trail as private).
- **Access tiers are derived from real land ownership** so they can't misrepresent reality:
  BLM-open → public · State/SITLA/WSA → caution · NPS / private → restricted.
- **Mock only:** quest storyline, point values, badges, photo prompts, and the specific challenge
  objectives — all clearly illustrative.
- **Disclaimer reframe:** "trail and land geometry are real and sourced; the quest and scoring are a
  fictional game — not legal, navigational, or land-access guidance."

Follow-up (when consolidating, to avoid clobbering parallel edits): amend `DECISIONS.md` D-002/D-004
to record this reversal, and add `docs/DATA-SOURCES.md` with the attribution block during implementation.
