import { describe, it, expect } from 'vitest'
import {
  applyCheckIn,
  applyGeocacheFind,
  applyPhotoBonus,
  awardBadges,
  computeTotals,
  evaluateCleanRun,
  freshState,
  MAX_SCORE,
} from './scoring'
import { quest, scoredCheckpoints } from '../data/quest'

const cpPublic = scoredCheckpoints[0] // cp-jurassic, no photo prompt
const cpScenic = scoredCheckpoints.find((c) => c.photoPrompt)! // has a photo prompt

describe('applyCheckIn', () => {
  it('awards +100, records the check-in, and earns Trailhead on the first check-in', () => {
    const { state, delta } = applyCheckIn(freshState(), cpPublic, 'public')
    expect(delta).toBe(100)
    expect(state.checkedIn.has(cpPublic.id)).toBe(true)
    expect(awardBadges(state, quest).has('trailhead')).toBe(true)
  })

  it('flags a caution-zone check-in and earns Access Aware (still +100)', () => {
    const { state, delta } = applyCheckIn(freshState(), cpPublic, 'caution')
    expect(delta).toBe(100)
    expect(state.cautionCheckedIn).toBe(true)
    expect(awardBadges(state, quest).has('access-aware')).toBe(true)
  })

  it('is idempotent — re-checking-in the same checkpoint adds no points', () => {
    const first = applyCheckIn(freshState(), cpPublic, 'public')
    const second = applyCheckIn(first.state, cpPublic, 'public')
    expect(second.delta).toBe(0)
    expect(second.state.checkedIn.size).toBe(1)
  })
})

describe('applyPhotoBonus', () => {
  it('awards +50 on a scenic checkpoint and earns Shutterbug, once only', () => {
    const first = applyPhotoBonus(freshState(), cpScenic)
    expect(first.delta).toBe(50)
    expect(awardBadges(first.state, quest).has('shutterbug')).toBe(true)
    const second = applyPhotoBonus(first.state, cpScenic)
    expect(second.delta).toBe(0)
  })

  it('is a no-op on a checkpoint with no photo prompt', () => {
    const { delta, state } = applyPhotoBonus(freshState(), cpPublic)
    expect(delta).toBe(0)
    expect(state.photos.size).toBe(0)
  })
})

describe('applyGeocacheFind', () => {
  it('awards +250 and Cache Hunter, once only', () => {
    const first = applyGeocacheFind(freshState())
    expect(first.delta).toBe(250)
    expect(first.state.foundCache).toBe(true)
    expect(awardBadges(first.state, quest).has('cache-hunter')).toBe(true)
    expect(applyGeocacheFind(first.state).delta).toBe(0)
  })
})

describe('evaluateCleanRun', () => {
  it('awards +100 and Clean Run when no caution check-in ever occurred', () => {
    const { state, delta } = evaluateCleanRun(freshState())
    expect(delta).toBe(100)
    expect(awardBadges(state, quest).has('clean-run')).toBe(true)
  })

  it('awards nothing after a caution check-in', () => {
    const caution = applyCheckIn(freshState(), cpPublic, 'caution').state
    const { state, delta } = evaluateCleanRun(caution)
    expect(delta).toBe(0)
    expect(awardBadges(state, quest).has('clean-run')).toBe(false)
  })
})

describe('awardBadges', () => {
  it('derives Pathfinder only when all 5 scored checkpoints are discovered', () => {
    const partial = { ...freshState(), discovered: new Set(scoredCheckpoints.slice(0, 4).map((c) => c.id)) }
    expect(awardBadges(partial, quest).has('pathfinder')).toBe(false)
    const all = { ...freshState(), discovered: new Set(scoredCheckpoints.map((c) => c.id)) }
    expect(awardBadges(all, quest).has('pathfinder')).toBe(true)
  })

  it('derives Quest Complete only when all 5 scored checkpoints are checked in', () => {
    const four = { ...freshState(), checkedIn: new Set(scoredCheckpoints.slice(0, 4).map((c) => c.id)) }
    expect(awardBadges(four, quest).has('quest-complete')).toBe(false)
    const five = { ...freshState(), checkedIn: new Set(scoredCheckpoints.map((c) => c.id)) }
    expect(awardBadges(five, quest).has('quest-complete')).toBe(true)
  })

  it('derives Left Your Mark only after posting to the posterboard', () => {
    expect(awardBadges(freshState(), quest).has('left-your-mark')).toBe(false)
    expect(awardBadges({ ...freshState(), posted: true }, quest).has('left-your-mark')).toBe(true)
  })
})

describe('computeTotals', () => {
  it('always reports max = 1000 regardless of state', () => {
    expect(computeTotals(freshState(), quest).max).toBe(1000)
    expect(MAX_SCORE).toBe(1000)
  })

  it('sums a perfect run to exactly 1000', () => {
    let s = freshState()
    for (const c of scoredCheckpoints) s = applyCheckIn(s, c, 'public').state
    for (const c of scoredCheckpoints.filter((c) => c.photoPrompt)) s = applyPhotoBonus(s, c).state
    s = applyGeocacheFind(s).state
    s = evaluateCleanRun(s).state
    expect(computeTotals(s, quest).current).toBe(1000)
  })

  it('renders the breakdown line', () => {
    let s = applyCheckIn(freshState(), scoredCheckpoints[0], 'public').state
    s = applyCheckIn(s, scoredCheckpoints[1], 'public').state
    s = applyCheckIn(s, scoredCheckpoints[2], 'public').state
    s = applyPhotoBonus(s, cpScenic).state
    s = evaluateCleanRun(s).state
    expect(computeTotals(s, quest).breakdown).toBe('Checkpoints 3/5 · Photos 1 · Cache ✗ · Clean ✓')
  })
})
