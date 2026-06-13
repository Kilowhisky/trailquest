import { describe, it, expect } from 'vitest'
import type { AccessZone, Checkpoint, LngLat, QuestRoute, ZoneClass } from '../types/quest'
import {
  distanceMeters,
  isInsideGeofence,
  classifyAccess,
  checkpointProximity,
  computeGain,
  routeTotals,
  formatLatLon,
  toUTM,
} from './geo'

// --- test helpers ---------------------------------------------------------
function squareZone(
  id: string,
  cls: ZoneClass,
  ownerLabel: string,
  [minLng, minLat, maxLng, maxLat]: [number, number, number, number],
): AccessZone {
  return {
    id,
    class: cls,
    ownerLabel,
    owner: ownerLabel,
    admin: ownerLabel,
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat],
        ],
      ],
    },
  }
}

function checkpoint(position: LngLat, radius: number, discoveryRadius?: number): Checkpoint {
  return {
    id: 't',
    name: 'Test',
    position,
    radius,
    discoveryRadius,
    scored: true,
    elevationFt: null,
    tier: 'public',
    ownerLabel: null,
    trailName: null,
    difficulty: null,
    difficultySource: null,
    surface: null,
    lengthMi: null,
    blmRouteName: null,
    mtbProjectUrl: null,
    lengthSource: null,
    nearestFeature: null,
  }
}

const MOAB_A: LngLat = [-109.7, 38.78]
const MOAB_B: LngLat = [-109.7, 38.79] // exactly 0.01° due north of A

// --- distanceMeters -------------------------------------------------------
describe('distanceMeters', () => {
  it('matches a hand-checked Moab distance within 1 m', () => {
    // pure-meridian 0.01° = R·Δφ = 6371008.8 · 0.01·π/180 ≈ 1111.95 m
    expect(Math.abs(distanceMeters(MOAB_A, MOAB_B) - 1111.95)).toBeLessThan(1)
  })
  it('returns 0 for the same point', () => {
    expect(distanceMeters(MOAB_A, MOAB_A)).toBe(0)
  })
  it('is symmetric', () => {
    expect(distanceMeters(MOAB_A, MOAB_B)).toBeCloseTo(distanceMeters(MOAB_B, MOAB_A), 6)
  })
})

// --- isInsideGeofence (inclusive boundary, D-011) -------------------------
describe('isInsideGeofence', () => {
  it('is true clearly inside and false clearly outside', () => {
    expect(isInsideGeofence(MOAB_A, MOAB_A, 50)).toBe(true)
    expect(isInsideGeofence(MOAB_B, MOAB_A, 50)).toBe(false) // ~1112 m away
  })
  it('is inclusive: a point exactly at the radius is inside', () => {
    const exact = distanceMeters(MOAB_A, MOAB_B)
    expect(isInsideGeofence(MOAB_B, MOAB_A, exact)).toBe(true)
    // and just under the radius is outside
    expect(isInsideGeofence(MOAB_B, MOAB_A, exact - 0.5)).toBe(false)
  })
})

// --- classifyAccess (most-restrictive precedence, public default) ---------
describe('classifyAccess', () => {
  const pub = squareZone('p', 'public', 'BLM', [-110, 38, -109, 39])
  const caution = squareZone('c', 'caution', 'SITLA', [-109.8, 38.7, -109.6, 38.9])
  const restricted = squareZone('r', 'restricted', 'NPS', [-109.7, 38.75, -109.5, 38.95])

  it('classifies a public-only point as public with its owner label', () => {
    expect(classifyAccess([-109.9, 38.1], [pub, caution, restricted])).toEqual({
      tier: 'public',
      ownerLabel: 'BLM',
    })
  })
  it('classifies a caution point as caution', () => {
    expect(classifyAccess([-109.75, 38.72], [pub, caution]).tier).toBe('caution')
  })
  it('classifies a restricted point as restricted', () => {
    expect(classifyAccess([-109.6, 38.8], [pub, restricted]).tier).toBe('restricted')
  })
  it('uses most-restrictive precedence on overlap (restricted > caution > public)', () => {
    // a point inside all three returns restricted + the restricted owner label
    const r = classifyAccess([-109.65, 38.8], [pub, caution, restricted])
    expect(r.tier).toBe('restricted')
    expect(r.ownerLabel).toBe('NPS')
  })
  it('defaults a point outside all polygons to public with no owner label', () => {
    expect(classifyAccess([0, 0], [pub, caution, restricted])).toEqual({
      tier: 'public',
      ownerLabel: null,
    })
  })
  it('treats a point on a polygon edge as inside (Turf boundary convention)', () => {
    // the shared edge lng=-109.7 belongs to the restricted square; expect restricted
    expect(classifyAccess([-109.7, 38.8], [pub, restricted]).tier).toBe('restricted')
  })
})

// --- checkpointProximity (independent discovery vs geofence thresholds) ----
describe('checkpointProximity', () => {
  const cp = checkpoint(MOAB_A, 50, 150)
  it('reports a point inside discovery but outside the geofence', () => {
    // ~100 m north-ish: between 50 (geofence) and 150 (discovery)
    const user: LngLat = [-109.7, 38.7809] // ~100 m from A
    const p = checkpointProximity(user, cp)
    expect(p.withinDiscovery).toBe(true)
    expect(p.withinGeofence).toBe(false)
    expect(p.distance).toBeGreaterThan(50)
    expect(p.distance).toBeLessThan(150)
  })
  it('reports a point inside both thresholds', () => {
    const user: LngLat = [-109.7, 38.7802] // ~22 m from A
    const p = checkpointProximity(user, cp)
    expect(p.withinDiscovery).toBe(true)
    expect(p.withinGeofence).toBe(true)
  })
  it('reports a point outside both thresholds', () => {
    const p = checkpointProximity(MOAB_B, cp) // ~1112 m
    expect(p.withinDiscovery).toBe(false)
    expect(p.withinGeofence).toBe(false)
  })
  it('treats a checkpoint with no discoveryRadius as never-within-discovery', () => {
    const forbidden = checkpoint(MOAB_A, 50)
    const p = checkpointProximity([-109.7, 38.7805], forbidden) // ~55 m
    expect(p.withinDiscovery).toBe(false)
  })
})

// --- computeGain ----------------------------------------------------------
describe('computeGain', () => {
  it('sums only the positive elevation deltas (cumulative ascent)', () => {
    expect(computeGain([100, 110, 105, 120])).toBe(25) // +10, +15
  })
  it('returns 0 for a flat profile', () => {
    expect(computeGain([100, 100, 100])).toBe(0)
  })
  it('returns 0 for a strictly descending profile', () => {
    expect(computeGain([120, 110, 100])).toBe(0)
  })
})

// --- routeTotals ----------------------------------------------------------
describe('routeTotals', () => {
  it('reads the committed mileage and recomputes gain from the profile', () => {
    const route: QuestRoute = {
      geometry: { type: 'LineString', coordinates: [[-109.7, 38.78], [-109.7, 38.79]] },
      segmentMiles: [0.69],
      totalMiles: 0.69,
      totalGainFt: 999, // stale value should be ignored in favor of profile recompute
      elevationProfile: [4000, 4050, 4040, 4090],
      onTrailFlags: [true],
    }
    expect(routeTotals(route)).toEqual({ miles: 0.69, gainFt: 100 })
  })
})

// --- formatLatLon ---------------------------------------------------------
describe('formatLatLon', () => {
  it('formats with 4 decimals and hemisphere suffixes (N/W for Moab)', () => {
    expect(formatLatLon([-109.5498, 38.5731])).toBe('38.5731°N, 109.5498°W')
  })
  it('uses S/E suffixes for the southern/eastern hemispheres', () => {
    expect(formatLatLon([12.34, -5.6789])).toBe('5.6789°S, 12.3400°E')
  })
})

// --- toUTM (WGS84 -> UTM zone 12S over Moab) ------------------------------
describe('toUTM', () => {
  it('converts a Moab point to UTM zone 12S (spec value: 626k 4270k)', () => {
    const u = toUTM([-109.5498, 38.5731])
    expect(u.zone).toBe('12S')
    // independent reference from the terrain spec: "12S 626k 4270k"
    expect(u.easting).toBeGreaterThan(625000)
    expect(u.easting).toBeLessThan(627000)
    expect(u.northing).toBeGreaterThan(4269000)
    expect(u.northing).toBeLessThan(4271000)
  })
})
