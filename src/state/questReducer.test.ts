import { describe, it, expect } from 'vitest'
import { initialQuestState, questReducer } from './questReducer'
import { quest, scoredCheckpoints } from '../data/quest'
import { awardBadges, computeTotals } from '../lib/scoring'

const tower = quest.checkpoints.find((c) => c.forbidden)!

describe('questReducer', () => {
  it('MOVE_USER updates position and recomputes the current access zone', () => {
    const s = questReducer(initialQuestState, { type: 'MOVE_USER', position: tower.position })
    expect(s.userPosition).toEqual(tower.position)
    expect(s.currentZone.tier).toBe('restricted')
    expect(s.currentZone.ownerLabel).toBe('NPS')
  })

  it('MOVE_USER latches fog-of-war discovery when entering a discovery radius', () => {
    const cp = scoredCheckpoints[0]
    const s = questReducer(initialQuestState, { type: 'MOVE_USER', position: cp.position })
    expect(s.discovered.has(cp.id)).toBe(true)
  })

  it('CHECK_IN at a discovered public checkpoint scores +100 and earns Trailhead', () => {
    const cp = scoredCheckpoints[0]
    let s = questReducer(initialQuestState, { type: 'MOVE_USER', position: cp.position })
    s = questReducer(s, { type: 'CHECK_IN', checkpointId: cp.id })
    expect(s.checkedIn.has(cp.id)).toBe(true)
    expect(computeTotals(s, quest).current).toBe(100)
    expect(awardBadges(s, quest).has('trailhead')).toBe(true)
  })

  it('blocks the forbidden restricted check-in: no points, not counted, but Access Aware granted', () => {
    let s = questReducer(initialQuestState, { type: 'MOVE_USER', position: tower.position })
    s = questReducer(s, { type: 'CHECK_IN', checkpointId: tower.id })
    expect(s.checkedIn.has(tower.id)).toBe(false)
    expect(s.restrictedBlocked).toBe(true)
    expect(computeTotals(s, quest).current).toBe(0)
    const badges = awardBadges(s, quest)
    expect(badges.has('access-aware')).toBe(true)
    expect(badges.has('quest-complete')).toBe(false)
  })

  it('rejects a CHECK_IN while outside any geofence (no-op)', () => {
    let s = questReducer(initialQuestState, { type: 'MOVE_USER', position: [-109.6, 38.7] })
    s = questReducer(s, { type: 'CHECK_IN', checkpointId: scoredCheckpoints[0].id })
    expect(s.checkedIn.size).toBe(0)
  })

  it('finds the geocache only inside the exact cache geofence, not the fuzzy search circle', () => {
    let s = questReducer(initialQuestState, { type: 'MOVE_USER', position: quest.geocache.searchCenter })
    expect(s.foundCache).toBe(false) // inside the fuzzy circle, but not the exact cache
    s = questReducer(s, { type: 'MOVE_USER', position: quest.geocache.cachePoint })
    expect(s.foundCache).toBe(true)
    expect(awardBadges(s, quest).has('cache-hunter')).toBe(true)
  })

  it('preserves a caution-check-in flag through to completion (Clean Run forfeited)', () => {
    // A caution check-in is not reachable in this all-public-scored quest (D-013), but the
    // sequencing guard must still hold: cautionCheckedIn set earlier must survive to the
    // completion evaluation. Construct that mid-run state and complete it.
    const fifth = scoredCheckpoints[4]
    const start = {
      ...initialQuestState,
      discovered: new Set(scoredCheckpoints.map((c) => c.id)),
      checkedIn: new Set(scoredCheckpoints.slice(0, 4).map((c) => c.id)),
      cautionCheckedIn: true,
      userPosition: fifth.position,
      currentZone: { tier: 'public' as const, ownerLabel: 'BLM' },
    }
    const s = questReducer(start, { type: 'CHECK_IN', checkpointId: fifth.id })
    expect(s.completed).toBe(true)
    expect(s.cleanRunBonus).toBe(false)
    const badges = awardBadges(s, quest)
    expect(badges.has('quest-complete')).toBe(true)
    expect(badges.has('clean-run')).toBe(false)
  })

  it('runs the full happy path to exactly 1000 with Quest Complete + Clean Run', () => {
    let s = initialQuestState
    for (const c of scoredCheckpoints) {
      s = questReducer(s, { type: 'MOVE_USER', position: c.position })
      s = questReducer(s, { type: 'CHECK_IN', checkpointId: c.id })
    }
    for (const c of scoredCheckpoints.filter((c) => c.photoPrompt)) {
      s = questReducer(s, { type: 'PHOTO_BONUS', checkpointId: c.id })
    }
    s = questReducer(s, { type: 'MOVE_USER', position: quest.geocache.cachePoint })

    expect(computeTotals(s, quest).current).toBe(1000)
    const badges = awardBadges(s, quest)
    expect(badges.has('quest-complete')).toBe(true)
    expect(badges.has('clean-run')).toBe(true)
    expect(s.completed).toBe(true)
  })

  it('records a posterboard message and earns Left Your Mark', () => {
    const s = questReducer(initialQuestState, { type: 'POST_MESSAGE', author: 'Tester', text: 'Made it!' })
    expect(s.posted).toBe(true)
    expect(s.posterMessages.some((m) => m.text === 'Made it!' && !m.seeded)).toBe(true)
    expect(awardBadges(s, quest).has('left-your-mark')).toBe(true)
  })
})
