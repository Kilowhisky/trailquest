import { describe, it, expect } from 'vitest'
import { quest, scoredCheckpoints, MAX_SCORE } from './quest'
import { accessZones } from './accessZones'
import { questRoute } from './route'
import { seededMessages } from './posterboard'
import { BADGES, BADGE_ORDER } from './badges'

describe('quest fixture', () => {
  it('has 5 scored checkpoints + 1 forbidden waypoint', () => {
    expect(quest.checkpoints).toHaveLength(6)
    expect(scoredCheckpoints).toHaveLength(5)
    const forbidden = quest.checkpoints.filter((c) => c.forbidden)
    expect(forbidden).toHaveLength(1)
    expect(forbidden[0].id).toBe('wp-tower-arch')
  })

  it('keeps every scored checkpoint in a public zone (so a perfect 1000 run is reachable — D-013)', () => {
    for (const c of scoredCheckpoints) expect(c.tier).toBe('public')
  })

  it('puts the forbidden waypoint in a restricted (NPS) zone, shown from the start (no fog)', () => {
    const tower = quest.checkpoints.find((c) => c.id === 'wp-tower-arch')
    expect(tower).toBeDefined()
    if (!tower) return
    expect(tower.tier).toBe('restricted')
    expect(tower.ownerLabel).toBe('NPS')
    expect(tower.discoveryRadius).toBeUndefined()
    expect(tower.scored).toBe(false)
  })

  it('gives every scored checkpoint a fog-of-war discovery radius wider than its geofence', () => {
    for (const c of scoredCheckpoints) {
      expect(c.discoveryRadius).toBeGreaterThan(c.radius)
    }
  })

  it('has real elevation on every checkpoint and 3 scenic photo prompts', () => {
    for (const c of quest.checkpoints) expect(c.elevationFt).toBeGreaterThan(3900)
    const withPhoto = quest.checkpoints.filter((c) => c.photoPrompt)
    expect(withPhoto).toHaveLength(3)
  })

  it('carries a valid on-trail route with an elevation profile', () => {
    expect(questRoute.geometry.type).toBe('LineString')
    expect(questRoute.geometry.coordinates.length).toBeGreaterThan(10)
    expect(questRoute.totalMiles).toBeGreaterThan(0)
    expect(questRoute.totalGainFt).toBeGreaterThan(0)
    expect(questRoute.elevationProfile.length).toBeGreaterThan(0)
    expect(questRoute.onTrailFlags.every((f) => f === true)).toBe(true)
  })

  it('derives real access zones spanning all three tiers', () => {
    expect(accessZones.length).toBeGreaterThan(5)
    const tiers = new Set(accessZones.map((z) => z.class))
    expect(tiers.has('public')).toBe(true)
    expect(tiers.has('caution')).toBe(true)
    expect(tiers.has('restricted')).toBe(true)
  })

  it('has a hidden geocache and seeded posterboard', () => {
    expect(quest.geocache.cachePoint).toHaveLength(2)
    expect(quest.geocache.cacheRadiusM).toBeLessThan(quest.geocache.searchRadiusM)
    expect(seededMessages.length).toBeGreaterThanOrEqual(3)
    expect(seededMessages.every((m) => m.seeded)).toBe(true)
  })

  it('exposes the full 8-badge catalog', () => {
    expect(Object.keys(BADGES)).toHaveLength(8)
    expect(BADGE_ORDER).toHaveLength(8)
    expect(MAX_SCORE).toBe(1000)
  })
})
