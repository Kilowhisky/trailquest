// @ts-nocheck
/**
 * TrailQuest — authoring-time real-data fetch (run once; output is committed static).
 *
 * Pulls REAL Moab geospatial data and grounds the demo in it (decision D-011/D-012):
 *   - OSM hero trails + named features (Overpass, ODbL)
 *   - UGRC land ownership -> reclassified into access tiers (CC BY 4.0)
 *   - BLM MTB layer for real difficulty/mileage attributes (public domain)
 *   - trailheads (UGRC / OSM)
 *   - USGS 3DEP elevation per checkpoint + along the route (public domain)
 *   - on-trail quest route snapped to OSM geometry with Turf
 *
 * The app makes NO runtime calls to these hosts (no CORS); everything is fetched
 * here and committed to src/data/sources/*. Run: `node scripts/fetch-moab-data.mjs`.
 *
 * NOTE: uses Node's global fetch (Node 18+) over OpenSSL, which — unlike Windows
 * curl/schannel — handles the Cloudflare TLS renegotiation on gis.blm.gov fine.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import * as turf from '@turf/turf'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../src/data/sources')
const CACHE_DIR = resolve(__dirname, '../.cache')

// Disk cache so re-runs (iterating on processing) don't re-hit rate-limited APIs.
async function cached(key, producer) {
  mkdirSync(CACHE_DIR, { recursive: true })
  const f = resolve(CACHE_DIR, createHash('sha1').update(key).digest('hex') + '.json')
  if (existsSync(f)) return JSON.parse(readFileSync(f, 'utf8'))
  const data = await producer()
  writeFileSync(f, JSON.stringify(data))
  return data
}

/** Simplify line/polygon geometry to shrink committed files while keeping shape. */
function simplifyFeatures(features, tolerance) {
  return features.map((f) => {
    try {
      return turf.simplify(f, { tolerance, highQuality: false, mutate: false })
    } catch {
      return f
    }
  })
}

// ---------------------------------------------------------------------------
// Config — Klondike Bluffs / Bar M area, abutting the Arches NP (NPS) boundary.
// bbox in [W, S, E, N] (lon/lat, EPSG:4326).
// ---------------------------------------------------------------------------
const BBOX = { w: -109.78, s: 38.7, e: -109.58, n: 38.84 }
const BBOX_ARR = [BBOX.w, BBOX.s, BBOX.e, BBOX.n]

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]
const UGRC_OWNERSHIP =
  'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0'
const UGRC_TRAILHEADS =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahTrailheads/FeatureServer/0'
const UGRC_TRAILS =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/TrailsAndPathways/FeatureServer/0'
const BLM_MTB =
  'https://gis.blm.gov/arcgis/rest/services/recreation/BLM_Natl_MTB/MapServer/1'
const EPQS = 'https://epqs.nationalmap.gov/v1/json'

// ---------------------------------------------------------------------------
// Chosen quest waypoints (anchored to REAL public on-trail points found via the
// candidate analysis; ordered as a route toward the Arches boundary). The game
// layer (radii, photo prompts, points) is added in step 3; here we only fetch
// each point's real elevation/zone/attributes and snap the on-trail route.
// ---------------------------------------------------------------------------
const CHECKPOINTS = [
  { id: 'cp-jurassic', name: 'Jurassic Junction', lngLat: [-109.72836, 38.78209], scored: true, photo: false },
  { id: 'cp-babysteps', name: 'Baby Steps Overlook', lngLat: [-109.72266, 38.79481], scored: true, photo: false },
  { id: 'cp-ekg', name: 'EKG Saddle', lngLat: [-109.7318, 38.81022], scored: true, photo: true },
  { id: 'cp-rim', name: 'Klondike Bluffs Rim', lngLat: [-109.69736, 38.80387], scored: true, photo: true },
  { id: 'cp-tower-approach', name: 'Tower Arch Approach', lngLat: [-109.70701, 38.78574], scored: true, photo: true },
  // 6th, UNSCORED forbidden waypoint — a real Arches NP feature just inside the NPS line (D-013).
  { id: 'wp-tower-arch', name: 'Tower Arch', lngLat: [-109.6872, 38.78889], scored: false, forbidden: true, photo: false },
]
// Hidden geocache — fuzzy search circle off-route at a real off-trail BLM spot.
const GEOCACHE = { searchCenter: [-109.7165, 38.79875], searchRadiusM: 150, cachePoint: [-109.71732, 38.79948] }

// ---------------------------------------------------------------------------
// Small fetch helpers (retry + timeout + throttle).
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const DEFAULT_HEADERS = {
  // Non-personal UA (no PII): identify the tool + repo for polite API etiquette.
  'User-Agent': 'TrailQuest-authoring/1.0 (+https://github.com/Kilowhisky/trailquest)',
  Accept: '*/*',
}

async function fetchWithRetry(url, opts = {}, { tries = 5, timeoutMs = 90000 } = {}) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const r = await fetch(url, { ...opts, headers: { ...DEFAULT_HEADERS, ...opts.headers }, signal: ctrl.signal })
      clearTimeout(timer)
      if (r.status === 429 || r.status === 503 || r.status === 504) {
        const retryAfter = Number(r.headers.get('retry-after'))
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 5000 * (i + 1)
        console.warn(`    ${r.status} rate-limited; waiting ${(wait / 1000).toFixed(0)}s`)
        await sleep(wait)
        continue
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r
    } catch (e) {
      clearTimeout(timer)
      lastErr = e
      await sleep(1200 * (i + 1))
    }
  }
  throw lastErr
}

async function overpass(query) {
  return cached('overpass:' + query, async () => {
    let lastErr
    for (const ep of OVERPASS_ENDPOINTS) {
      try {
        const r = await fetchWithRetry(
          ep,
          { method: 'POST', body: new URLSearchParams({ data: query }) },
          { tries: 4, timeoutMs: 120000 },
        )
        return await r.json()
      } catch (e) {
        lastErr = e
        console.warn(`  overpass ${ep} failed (${e.message}); trying next mirror`)
      }
    }
    throw lastErr
  })
}

/** Page an ArcGIS FeatureServer/MapServer layer query to GeoJSON, all features. */
async function arcgisQuery(layerUrl, { where = '1=1', outFields = '*' } = {}) {
  return cached(`arcgis:${layerUrl}:${where}:${outFields}:${BBOX_ARR.join(',')}`, async () => {
    const features = []
    let offset = 0
    for (let page = 0; page < 50; page++) {
      const params = new URLSearchParams({
        where,
        geometry: BBOX_ARR.join(','),
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        outSR: '4326',
        outFields,
        f: 'geojson',
        resultOffset: String(offset),
        resultRecordCount: '1000',
      })
      const r = await fetchWithRetry(`${layerUrl}/query?${params}`, {}, { tries: 4 })
      const json = await r.json()
      const got = json.features ?? []
      features.push(...got)
      if (got.length < 1000) break
      offset += got.length
    }
    return features
  })
}

function writeGeoJSON(name, features, extra = {}) {
  const fc = { type: 'FeatureCollection', ...extra, features }
  writeFileSync(resolve(OUT_DIR, name), JSON.stringify(fc))
  const bytes = JSON.stringify(fc).length
  console.log(`  wrote ${name}: ${features.length} features, ${(bytes / 1024).toFixed(0)} KB`)
  return fc
}

function writeJSON(name, obj) {
  writeFileSync(resolve(OUT_DIR, name), JSON.stringify(obj, null, 2))
  console.log(`  wrote ${name}: ${(JSON.stringify(obj).length / 1024).toFixed(1)} KB`)
}

/** USGS 3DEP point elevation in feet (public domain; throttled + cached). */
async function elevationFt(lng, lat) {
  return cached(`epqs:${lng.toFixed(5)},${lat.toFixed(5)}`, async () => {
    try {
      const r = await fetchWithRetry(
        `${EPQS}?x=${lng}&y=${lat}&units=Feet&wkid=4326&includeDate=false`,
        {},
        { tries: 5, timeoutMs: 30000 },
      )
      const j = await r.json()
      const v = Number(j.value ?? j?.location?.elevation ?? NaN)
      await sleep(120)
      return Number.isFinite(v) && v > -100 && v < 30000 ? Math.round(v) : null
    } catch {
      return null
    }
  })
}

/** Sum of positive elevation deltas — cumulative ascent (pure; mirrored in lib/geo). */
function computeGain(profile) {
  let gain = 0
  for (let i = 1; i < profile.length; i++) {
    const d = (profile[i] ?? 0) - (profile[i - 1] ?? 0)
    if (d > 0) gain += d
  }
  return Math.round(gain)
}

/**
 * Build an undirected graph from all trail polylines. Vertices are keyed on a
 * ~11 m grid (4 decimals) so coincident OSM junction nodes from different ways
 * merge into one graph node — giving a connected trail network to route along.
 */
function buildTrailGraph(trails) {
  const key = (c) => `${c[0].toFixed(4)},${c[1].toFixed(4)}`
  const nodes = new Map()
  const node = (c) => {
    const k = key(c)
    if (!nodes.has(k)) nodes.set(k, { coord: c, edges: new Map() })
    return k
  }
  for (const t of trails) {
    if (t.geometry?.type !== 'LineString') continue
    const cs = t.geometry.coordinates
    for (let i = 0; i < cs.length - 1; i++) {
      const a = node(cs[i])
      const b = node(cs[i + 1])
      if (a === b) continue
      const d = turf.distance(turf.point(cs[i]), turf.point(cs[i + 1]), { units: 'meters' })
      const ea = nodes.get(a).edges
      const eb = nodes.get(b).edges
      ea.set(b, Math.min(ea.get(b) ?? Infinity, d))
      eb.set(a, Math.min(eb.get(a) ?? Infinity, d))
    }
  }
  return nodes
}

function nearestGraphNode(nodes, lngLat) {
  const pt = turf.point(lngLat)
  let best = null
  for (const [k, n] of nodes) {
    const d = turf.distance(pt, turf.point(n.coord), { units: 'meters' })
    if (!best || d < best.d) best = { k, d }
  }
  return best
}

/** Dijkstra shortest path between two graph nodes; returns coord path or null. */
function shortestPath(nodes, startK, goalK) {
  if (startK === goalK) return [nodes.get(startK).coord]
  const dist = new Map([[startK, 0]])
  const prev = new Map()
  const done = new Set()
  // binary min-heap of [dist, key]
  const heap = [[0, startK]]
  const push = (d, k) => {
    heap.push([d, k])
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p][0] <= heap[i][0]) break
      ;[heap[p], heap[i]] = [heap[i], heap[p]]
      i = p
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        let s = i
        const l = 2 * i + 1
        const r = 2 * i + 2
        if (l < heap.length && heap[l][0] < heap[s][0]) s = l
        if (r < heap.length && heap[r][0] < heap[s][0]) s = r
        if (s === i) break
        ;[heap[s], heap[i]] = [heap[i], heap[s]]
        i = s
      }
    }
    return top
  }
  while (heap.length) {
    const [d, u] = pop()
    if (done.has(u)) continue
    done.add(u)
    if (u === goalK) break
    for (const [v, w] of nodes.get(u).edges) {
      if (done.has(v)) continue
      const nd = d + w
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd)
        prev.set(v, u)
        push(nd, v)
      }
    }
  }
  if (!prev.has(goalK)) return null
  const path = []
  let c = goalK
  while (c) {
    path.unshift(nodes.get(c).coord)
    if (c === startK) break
    c = prev.get(c)
  }
  return path
}

/**
 * Route connecting consecutive scored checkpoints along the real trail network.
 * Each pair is snapped to nearest graph nodes and shortest-path'd along trails;
 * if no network path exists (disconnected fragment), the segment falls back to a
 * straight line flagged onTrail:false (honest, per the elevation spec).
 */
function snapRoute(scored, trails) {
  const graph = buildTrailGraph(trails)
  const segments = []
  for (let i = 0; i < scored.length - 1; i++) {
    const an = nearestGraphNode(graph, scored[i].lngLat)
    const bn = nearestGraphNode(graph, scored[i + 1].lngLat)
    let coords
    let onTrail
    const path = an && bn ? shortestPath(graph, an.k, bn.k) : null
    if (path && path.length > 1 && an.d < 120 && bn.d < 120) {
      coords = [scored[i].lngLat, ...path, scored[i + 1].lngLat]
      onTrail = true
    } else {
      coords = [scored[i].lngLat, scored[i + 1].lngLat]
      onTrail = false
    }
    segments.push({ coords, onTrail })
  }
  const all = []
  for (const s of segments)
    for (const c of s.coords) {
      const last = all[all.length - 1]
      if (!last || last[0] !== c[0] || last[1] !== c[1]) all.push(c)
    }
  return { line: turf.lineString(all), segments }
}

// ---------------------------------------------------------------------------
// OSM -> GeoJSON (manual; avoids an osmtogeojson dependency).
// Overpass `out geom;` gives ways an inline `geometry:[{lat,lon}]` array.
// ---------------------------------------------------------------------------
function osmWaysToLineStrings(elements) {
  return elements
    .filter((el) => el.type === 'way' && Array.isArray(el.geometry) && el.geometry.length > 1)
    .map((el) => ({
      type: 'Feature',
      properties: {
        name: el.tags?.name ?? null,
        surface: el.tags?.surface ?? null,
        difficulty: el.tags?.['mtb:scale'] != null ? `MTB ${el.tags['mtb:scale']}` : (el.tags?.sac_scale ?? null),
        highway: el.tags?.highway ?? null,
        system: null,
        owner: null,
        source: 'OSM',
      },
      geometry: {
        type: 'LineString',
        coordinates: el.geometry.map((g) => [g.lon, g.lat]),
      },
    }))
}

/** Normalize UGRC TrailsAndPathways GeoJSON (LineString/MultiLineString) to the same shape. */
function normalizeUgrcTrails(features) {
  const out = []
  for (const f of features) {
    const p = f.properties ?? {}
    const props = {
      name: p.PrimaryName ?? null,
      surface: p.SurfaceType ?? null,
      difficulty: p.BikeDifficulty ?? p.HikeDifficulty ?? null,
      highway: p.Class ?? null,
      system: p.SystemName ?? p.RecreationArea ?? null,
      owner: p.OwnerSteward ?? null,
      source: 'UGRC',
    }
    const g = f.geometry
    if (!g) continue
    if (g.type === 'LineString') out.push({ type: 'Feature', properties: props, geometry: g })
    else if (g.type === 'MultiLineString')
      for (const line of g.coordinates)
        out.push({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: line } })
  }
  return out
}

function osmNodesToPoints(elements, kinds) {
  return elements
    .filter((el) => el.type === 'node' && el.tags?.name && kinds(el.tags))
    .map((el) => ({
      type: 'Feature',
      properties: {
        osmId: el.id,
        name: el.tags.name,
        featureType:
          el.tags.natural === 'peak'
            ? 'peak'
            : el.tags.natural === 'arch'
              ? 'arch'
              : el.tags.tourism === 'viewpoint'
                ? 'viewpoint'
                : el.tags.natural === 'saddle'
                  ? 'saddle'
                  : (el.tags.natural ?? el.tags.tourism ?? 'feature'),
        ele: el.tags.ele ? Number(el.tags.ele) : null,
      },
      geometry: { type: 'Point', coordinates: [el.lon, el.lat] },
    }))
}

// ---------------------------------------------------------------------------
// Ownership reclassification (the access differentiator).
// Most-restrictive wins downstream; here we tag each polygon's tier + label.
// ---------------------------------------------------------------------------
function classifyOwnership(props) {
  const owner = String(props.owner ?? props.OWNER ?? '').trim()
  const admin = String(props.admin ?? props.ADMIN ?? '').trim()
  const hay = `${owner} ${admin}`.toLowerCase()

  let tier = 'public'
  if (/(national park|nps|private|tribal|military|department of defense)/.test(hay)) {
    tier = 'restricted'
  } else if (
    /(state|sitla|trust lands|wilderness study|wsa|forest service|usfs|state parks)/.test(hay)
  ) {
    tier = 'caution'
  } else if (/(blm|bureau of land management)/.test(hay)) {
    tier = 'public'
  }

  // Verbatim, human-readable owner label for the access banner (D-012).
  const ownerLabel = admin && admin !== owner ? `${admin}` : owner || 'Unclassified'
  return { tier, ownerLabel, owner, admin }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log('TrailQuest data fetch — bbox', BBOX_ARR.join(','))

  // --- A. Trails (OSM primary, UGRC fallback) -----------------------------
  console.log('\n[A] Trails — OSM Overpass (UGRC fallback)…')
  let trails = []
  try {
    const trailQ = `[out:json][timeout:90];
(
  way["highway"~"^(path|track|footway|cycleway|bridleway)$"]["name"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
);
out geom;`
    const trailJson = await overpass(trailQ)
    trails = osmWaysToLineStrings(trailJson.elements ?? [])
    if (trails.length === 0) throw new Error('OSM returned 0 trails')
    console.log(`  source=OSM  ${trails.length} named trail ways`)
  } catch (e) {
    console.warn(`  OSM trails unavailable (${e.message}); falling back to UGRC TrailsAndPathways`)
    const ugrc = await arcgisQuery(UGRC_TRAILS, { where: "PrimaryName <> ''", outFields: '*' })
    trails = normalizeUgrcTrails(ugrc)
    console.log(`  source=UGRC  ${trails.length} trail segments`)
  }
  const trailNames = [...new Set(trails.map((t) => t.properties.name).filter(Boolean))].sort()
  console.log(`  ${trailNames.length} distinct names. sample:`, trailNames.slice(0, 28).join(' · '))
  writeGeoJSON('moab_trails.geojson', simplifyFeatures(trails, 0.00003))

  // --- B. OSM named features (graceful: generic prompts if unavailable) ----
  console.log('\n[B] OSM named features (peaks/arches/viewpoints)…')
  let feats = []
  try {
    const featQ = `[out:json][timeout:60];
(
  node["natural"="peak"]["name"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
  node["natural"="arch"]["name"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
  node["natural"="saddle"]["name"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
  node["tourism"="viewpoint"]["name"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
);
out geom;`
    const featJson = await overpass(featQ)
    feats = osmNodesToPoints(
      featJson.elements ?? [],
      (t) => t.natural === 'peak' || t.natural === 'arch' || t.natural === 'saddle' || t.tourism === 'viewpoint',
    )
  } catch (e) {
    console.warn(`  OSM features unavailable (${e.message}); committing empty set (prompts stay generic)`)
  }
  console.log(`  ${feats.length} named features:`, feats.map((f) => f.properties.name).slice(0, 20).join(' · '))
  writeGeoJSON('named_features.geojson', feats)

  // --- C. UGRC land ownership -> tiers ------------------------------------
  console.log('\n[C] UGRC land ownership…')
  const ownRaw = await arcgisQuery(UGRC_OWNERSHIP, { outFields: 'owner,admin,state_lgd' })
  const distinct = {}
  const zones = ownRaw.map((f) => {
    const c = classifyOwnership(f.properties ?? {})
    distinct[`${c.owner} | ${c.admin}`] = (distinct[`${c.owner} | ${c.admin}`] ?? 0) + 1
    return { ...f, properties: { ...f.properties, ...c } }
  })
  console.log(`  ${zones.length} ownership polygons. distinct owner|admin:`)
  for (const [k, v] of Object.entries(distinct).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${v.toString().padStart(4)}  ${k}`)
  }
  const tierCounts = zones.reduce((a, z) => ((a[z.properties.tier] = (a[z.properties.tier] ?? 0) + 1), a), {})
  console.log('  tier counts:', JSON.stringify(tierCounts))
  writeGeoJSON('land_ownership.geojson', simplifyFeatures(zones, 0.0001))

  // --- D. Trailheads -------------------------------------------------------
  console.log('\n[D] UGRC trailheads…')
  let trailheads = []
  try {
    trailheads = await arcgisQuery(UGRC_TRAILHEADS, { outFields: '*' })
  } catch (e) {
    console.warn('  trailheads fetch failed:', e.message)
  }
  console.log(`  ${trailheads.length} trailheads`)
  writeGeoJSON('trailheads.geojson', trailheads)

  // --- E. BLM MTB (difficulty / miles attributes) -------------------------
  console.log('\n[E] BLM MTB layer (difficulty/miles)…')
  let blmMtb = []
  try {
    blmMtb = await arcgisQuery(BLM_MTB, { outFields: '*' })
  } catch (e) {
    console.warn('  BLM MTB fetch failed:', e.message)
  }
  console.log(`  ${blmMtb.length} BLM MTB features`)
  if (blmMtb[0]) console.log('  sample props:', JSON.stringify(blmMtb[0].properties).slice(0, 300))
  writeGeoJSON('blm_mtb.geojson', simplifyFeatures(blmMtb, 0.0001))

  // --- F. Candidate analysis (zone-classify trailheads; find anchors) -----
  console.log('\n[F] Checkpoint candidate analysis…')
  const TIER_RANK = { public: 0, caution: 1, restricted: 2 }
  const classifyPoint = (lng, lat) => {
    const pt = turf.point([lng, lat])
    let best = null
    for (const z of zones) {
      try {
        if (turf.booleanPointInPolygon(pt, z)) {
          if (!best || TIER_RANK[z.properties.tier] > TIER_RANK[best.properties.tier]) best = z
        }
      } catch {
        /* skip bad geometry */
      }
    }
    return best
      ? { tier: best.properties.tier, ownerLabel: best.properties.ownerLabel }
      : { tier: 'public', ownerLabel: null }
  }
  const nearestNamed = (lng, lat) => {
    if (feats.length === 0) return null
    const pt = turf.point([lng, lat])
    let best = null
    for (const f of feats) {
      const d = turf.distance(pt, f, { units: 'meters' })
      if (!best || d < best.d) best = { name: f.properties.name, type: f.properties.featureType, d: Math.round(d) }
    }
    return best
  }

  console.log('  Trailheads (zone-classified):')
  for (const th of trailheads) {
    const [lng, lat] = th.geometry.coordinates
    const z = classifyPoint(lng, lat)
    const nf = nearestNamed(lng, lat)
    const name = th.properties.NAME ?? th.properties.PrimaryName ?? th.properties.TrailheadName ?? th.properties.Name ?? '(unnamed)'
    console.log(
      `    ${z.tier.padEnd(10)} [${lng.toFixed(5)},${lat.toFixed(5)}] ${name}  owner=${z.ownerLabel ?? '-'}  nearFeat=${nf ? `${nf.name}(${nf.d}m)` : '-'}`,
    )
  }

  // NPS (restricted) polygons — anchor the forbidden waypoint just inside one.
  console.log('  NPS / restricted polygons (for forbidden waypoint):')
  for (const z of zones.filter((z) => z.properties.tier === 'restricted')) {
    const c = turf.centroid(z).geometry.coordinates
    console.log(`    ${z.properties.ownerLabel}  centroid=[${c[0].toFixed(5)},${c[1].toFixed(5)}]`)
  }
  // Named features that fall inside restricted (great forbidden-waypoint targets).
  console.log('  Named features inside restricted zones:')
  for (const f of feats) {
    const [lng, lat] = f.geometry.coordinates
    if (classifyPoint(lng, lat).tier === 'restricted')
      console.log(`    ${f.properties.name} [${lng.toFixed(5)},${lat.toFixed(5)}] (${f.properties.featureType})`)
  }

  // --- G. Authoring: per-checkpoint elevation/zone/attrs + on-trail route --
  console.log('\n[G] Authoring derived data (elevation, zone, attributes, route)…')
  const trailLines = trails.filter((t) => t.geometry?.type === 'LineString')
  const nearestTrail = (lng, lat) => {
    const pt = turf.point([lng, lat])
    let best = null
    for (const t of trailLines) {
      const d = turf.pointToLineDistance(pt, t, { units: 'meters' })
      if (!best || d < best.d) best = { d: Math.round(d), ...t.properties }
    }
    return best
  }
  const nearestBlm = (lng, lat) => {
    const pt = turf.point([lng, lat])
    let best = null
    for (const f of blmMtb) {
      const g = f.geometry
      if (!g) continue
      // BLM MTB layer mixes LineString and MultiLineString — handle both, else the
      // named loops (Baby Steps Loop, EKG) are silently skipped and attributes
      // get matched to the wrong nearby trail.
      const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []
      for (const line of lines) {
        if (!Array.isArray(line) || line.length < 2) continue
        const d = turf.pointToLineDistance(pt, turf.lineString(line), { units: 'meters' })
        if (!best || d < best.d) best = { d: Math.round(d), p: f.properties }
      }
    }
    return best
  }

  const enriched = []
  for (const cp of CHECKPOINTS) {
    const [lng, lat] = cp.lngLat
    const z = classifyPoint(lng, lat)
    const nt = nearestTrail(lng, lat)
    const blm = nearestBlm(lng, lat)
    const nf = nearestNamed(lng, lat)
    const ele = await elevationFt(lng, lat)
    // Honest per-attribute provenance: difficulty/surface come from OSM (the BLM MTB
    // layer carries no difficulty field); length/route-name/URL come from BLM when a
    // route is within ~250 m, else null.
    const blmNear = blm && blm.d < 250 ? blm.p : null
    const out = {
      ...cp,
      elevationFt: ele,
      tier: z.tier,
      ownerLabel: z.ownerLabel,
      trailName: nt?.name ?? null,
      surface: nt?.surface ?? null,
      difficulty: nt?.difficulty ?? null,
      difficultySource: nt?.difficulty ? nt?.source ?? 'OSM' : null,
      lengthMi: blmNear ? round2(blmNear.GIS_MILES) : null,
      blmRouteName: blmNear ? blmNear.ROUTE_PRMRY_NM ?? null : null,
      mtbProjectUrl: blmNear ? blmNear.WEB_LINK ?? null : null,
      lengthSource: blmNear ? 'BLM' : null,
      nearestFeature: nf ? { name: nf.name, type: nf.type, distM: nf.d } : null,
    }
    enriched.push(out)
    console.log(
      `    ${cp.scored ? 'SCORED  ' : 'FORBID  '}${cp.name.padEnd(22)} ${out.tier.padEnd(10)} ${ele ?? '?'}ft  trail=${out.trailName ?? '-'}  feat=${nf ? `${nf.name}(${nf.d}m)` : '-'}`,
    )
  }

  // Geocache search point elevation + zone (for the fixture).
  const gcZone = classifyPoint(...GEOCACHE.cachePoint)
  console.log(`    GEOCACHE cache point tier=${gcZone.tier} (search r=${GEOCACHE.searchRadiusM}m)`) // should be public

  // Build the on-trail route from the 5 scored checkpoints.
  const scored = enriched.filter((c) => c.scored)
  const { line, segments } = snapRoute(scored, trails)
  const totalKm = turf.length(line, { units: 'kilometers' })
  const stepKm = 0.15
  const profile = []
  for (let d = 0; d <= totalKm + 1e-9; d += stepKm) {
    const [plng, plat] = turf.along(line, d, { units: 'kilometers' }).geometry.coordinates
    profile.push(await elevationFt(plng, plat))
  }
  const segmentMiles = segments.map((s) => round2(turf.length(turf.lineString(s.coords), { units: 'miles' })))
  const totalMiles = round2(turf.length(line, { units: 'miles' }))
  const totalGainFt = computeGain(profile.filter((p) => p != null))
  const onTrailFlags = segments.map((s) => s.onTrail)
  console.log(
    `    route: ${totalMiles} mi · +${totalGainFt} ft · ${profile.length} elev samples · segments onTrail=${JSON.stringify(onTrailFlags)}`,
  )

  writeGeoJSON('route.geojson', [
    {
      type: 'Feature',
      properties: { segmentMiles, totalMiles, totalGainFt, elevationProfile: profile, onTrailFlags },
      geometry: line.geometry,
    },
  ])
  writeJSON('checkpoints.authored.json', {
    note: 'Authored checkpoint anchors (real coords/elevation/zone/attrs). Step 3 wraps these in the typed quest fixture with the game layer (radii, prompts, points).',
    bbox: BBOX_ARR,
    checkpoints: enriched,
    geocache: { ...GEOCACHE, cacheTier: gcZone.tier },
    route: { totalMiles, totalGainFt, segmentMiles, onTrailFlags },
  })

  console.log('\nDONE — sources + derived data authored to src/data/sources/.')
}

const round2 = (n) => (n == null || Number.isNaN(Number(n)) ? null : Math.round(Number(n) * 100) / 100)

main().catch((e) => {
  console.error('FETCH FAILED:', e)
  process.exit(1)
})
