import { booleanPointInPolygon, distance, point } from '@turf/turf'
import type { AccessZone, Checkpoint, LngLat, QuestRoute, ZoneClass } from '../types/quest'

/**
 * Pure, side-effect-free spatial primitives. All the geospatial reasoning lives here
 * so it is obvious and unit-testable (the take-home explicitly wants the spatial logic
 * visible, not hidden behind prose). No I/O, no Leaflet, no runtime data fetching.
 *
 * Precondition: positions are finite `[lng, lat]` (degrees). All inputs in this app
 * come from real map coordinates or the draggable user marker, so this always holds;
 * non-finite coordinates are out of contract (Turf throws on NaN).
 */

/** Great-circle distance between two [lng, lat] points, in meters. */
export function distanceMeters(a: LngLat, b: LngLat): number {
  return distance(point(a), point(b), { units: 'meters' })
}

/**
 * Whether `p` is within `radiusMeters` of `center`. The boundary is INCLUSIVE — a
 * point exactly at the radius is inside (`distance <= radius`, decision D-011).
 */
export function isInsideGeofence(p: LngLat, center: LngLat, radiusMeters: number): boolean {
  return distanceMeters(p, center) <= radiusMeters
}

const TIER_RANK: Record<ZoneClass, number> = { public: 0, caution: 1, restricted: 2 }

/**
 * Classify a point against real land-ownership zones. Returns the game `tier` using
 * MOST-RESTRICTIVE precedence (`restricted > caution > public`, D-011) and the verbatim
 * `ownerLabel` of the highest-precedence containing polygon (D-012). A point outside all
 * polygons defaults to `public` with a null label (permissive fallback, D-011).
 */
export function classifyAccess(
  p: LngLat,
  zones: AccessZone[],
): { tier: ZoneClass; ownerLabel: string | null } {
  const pt = point(p)
  let winner: AccessZone | null = null
  for (const zone of zones) {
    if (booleanPointInPolygon(pt, zone.geometry)) {
      if (!winner || TIER_RANK[zone.class] > TIER_RANK[winner.class]) winner = zone
    }
  }
  return winner ? { tier: winner.class, ownerLabel: winner.ownerLabel } : { tier: 'public', ownerLabel: null }
}

/**
 * Per-checkpoint proximity for the fog-of-war loop. `withinDiscovery` (reveal) and
 * `withinGeofence` (check-in) are INDEPENDENT thresholds; a checkpoint with no
 * `discoveryRadius` (the always-visible forbidden waypoint) is never "within discovery".
 */
export function checkpointProximity(
  user: LngLat,
  checkpoint: Checkpoint,
): { distance: number; withinDiscovery: boolean; withinGeofence: boolean } {
  const d = distanceMeters(user, checkpoint.position)
  return {
    distance: d,
    withinDiscovery: checkpoint.discoveryRadius != null && d <= checkpoint.discoveryRadius,
    withinGeofence: d <= checkpoint.radius,
  }
}

/**
 * Cumulative ascent: sum of positive deltas between consecutive FINITE samples.
 * Non-finite samples (a `null`/`NaN` from a failed USGS 3DEP lookup) are skipped, so
 * one dropped reading can't be coerced to 0 and inflate the climb. This keeps the
 * runtime figure in agreement with the authoring script, which null-filters before
 * committing `totalGainFt`.
 */
export function computeGain(profile: ReadonlyArray<number | null | undefined>): number {
  let gain = 0
  let prev: number | null = null
  for (const v of profile) {
    if (typeof v !== 'number' || !Number.isFinite(v)) continue
    if (prev !== null) {
      const delta = v - prev
      if (delta > 0) gain += delta
    }
    prev = v
  }
  return Math.round(gain)
}

/** Route summary for display: committed on-trail mileage + ascent recomputed from the profile. */
export function routeTotals(route: QuestRoute): { miles: number; gainFt: number } {
  return { miles: route.totalMiles, gainFt: computeGain(route.elevationProfile) }
}

/** Human-readable lat/lng: 4 decimals, hemisphere-suffixed (e.g. "38.5731°N, 109.5498°W"). */
export function formatLatLon([lng, lat]: LngLat): string {
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`
  return `${latStr}, ${lngStr}`
}

// --- UTM (WGS84 -> UTM) ----------------------------------------------------
const UTM_A = 6378137 // WGS84 semi-major axis (m)
const UTM_F = 1 / 298.257223563 // flattening
const UTM_K0 = 0.9996 // UTM scale factor
const BANDS = 'CDEFGHJKLMNPQRSTUVWX' // MGRS latitude bands (8° each from 80°S)

function utmBand(lat: number): string {
  if (lat < -80 || lat >= 84) return lat < 0 ? 'A' : 'Z' // polar (UPS) — out of UTM range
  if (lat >= 72) return 'X' // X band spans 72°–84° (12° tall — the MGRS exception to the 8° rule)
  return BANDS[Math.floor((lat + 80) / 8)]
}

/**
 * WGS84 `[lng, lat]` (degrees) -> UTM (Snyder/USGS transverse-Mercator series). Returns
 * the MGRS zone+band (e.g. "12S") and easting/northing in meters. Accurate to ~1 m,
 * ample for a coordinate readout.
 */
export function toUTM([lng, lat]: LngLat): { zone: string; easting: number; northing: number } {
  const e2 = UTM_F * (2 - UTM_F)
  const ep2 = e2 / (1 - e2)
  // zones are 1–60; the +180° boundary would otherwise compute 61, so clamp it.
  const zoneNum = Math.min(60, Math.floor((lng + 180) / 6) + 1)
  const lon0 = (((zoneNum - 1) * 6 - 180 + 3) * Math.PI) / 180
  const phi = (lat * Math.PI) / 180
  const lam = (lng * Math.PI) / 180

  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const tanPhi = Math.tan(phi)

  const N = UTM_A / Math.sqrt(1 - e2 * sinPhi * sinPhi)
  const T = tanPhi * tanPhi
  const C = ep2 * cosPhi * cosPhi
  const A = (lam - lon0) * cosPhi

  const M =
    UTM_A *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi))

  const easting =
    UTM_K0 *
      N *
      (A + ((1 - T + C) * A * A * A) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120) +
    500000

  let northing =
    UTM_K0 *
    (M +
      N *
        tanPhi *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720))
  if (lat < 0) northing += 10000000 // southern hemisphere false northing

  return {
    zone: `${zoneNum}${utmBand(lat)}`,
    easting: Math.round(easting),
    northing: Math.round(northing),
  }
}
