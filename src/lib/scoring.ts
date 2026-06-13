import type { BadgeId, Checkpoint, PosterMessage, Quest, ZoneClass } from '../types/quest'

/**
 * Pure, side-effect-free scoring (perfect run = 1000, D-010). Each `apply*` function
 * is immutable and idempotent — it returns a new state and the points delta (for the
 * "+100" toast). Badges and totals are DERIVED from state, never stored, so they can't
 * drift. Restricted-zone gating lives in the reducer, not here (D-011 #5): these
 * functions assume the action is allowed.
 */
export interface QuestState {
  /** Discovered checkpoint ids (one-way fog-of-war latch). */
  discovered: ReadonlySet<string>
  /** Scored checkpoint ids that have been checked in. */
  checkedIn: ReadonlySet<string>
  /** Checkpoint ids that earned a photo bonus. */
  photos: ReadonlySet<string>
  foundCache: boolean
  /** A check-in ever occurred inside a caution zone (forfeits Clean Run). */
  cautionCheckedIn: boolean
  /** The forbidden restricted check-in was attempted and blocked (a heeded warning). */
  restrictedBlocked: boolean
  /** The Clean Run bonus has been awarded (evaluated at completion). */
  cleanRunBonus: boolean
  posterMessages: PosterMessage[]
  /** The user posted to the completion posterboard. */
  posted: boolean
}

export const POINTS = { checkpoint: 100, photo: 50, geocache: 250, cleanRun: 100 } as const
export const MAX_SCORE = 1000

export function freshState(): QuestState {
  return {
    discovered: new Set(),
    checkedIn: new Set(),
    photos: new Set(),
    foundCache: false,
    cautionCheckedIn: false,
    restrictedBlocked: false,
    cleanRunBonus: false,
    posterMessages: [],
    posted: false,
  }
}

type Applied = { state: QuestState; delta: number }

/** Check in at an allowed checkpoint: +100, recorded; a caution-zone check-in is flagged. */
export function applyCheckIn(state: QuestState, checkpoint: Checkpoint, zoneClass: ZoneClass): Applied {
  if (state.checkedIn.has(checkpoint.id)) return { state, delta: 0 }
  const checkedIn = new Set(state.checkedIn)
  checkedIn.add(checkpoint.id)
  return {
    state: { ...state, checkedIn, cautionCheckedIn: state.cautionCheckedIn || zoneClass === 'caution' },
    delta: POINTS.checkpoint,
  }
}

/** Photo bonus: +50, only on a checkpoint that carries a photo prompt, once each. */
export function applyPhotoBonus(state: QuestState, checkpoint: Checkpoint): Applied {
  if (!checkpoint.photoPrompt || state.photos.has(checkpoint.id)) return { state, delta: 0 }
  const photos = new Set(state.photos)
  photos.add(checkpoint.id)
  return { state: { ...state, photos }, delta: POINTS.photo }
}

/** Hidden geocache: +250, once. */
export function applyGeocacheFind(state: QuestState): Applied {
  if (state.foundCache) return { state, delta: 0 }
  return { state: { ...state, foundCache: true }, delta: POINTS.geocache }
}

/** Clean Run bonus at completion: +100 if no caution-zone check-in ever happened. */
export function evaluateCleanRun(state: QuestState): Applied {
  if (state.cleanRunBonus || state.cautionCheckedIn) return { state, delta: 0 }
  return { state: { ...state, cleanRunBonus: true }, delta: POINTS.cleanRun }
}

const scoredIds = (quest: Quest): string[] => quest.checkpoints.filter((c) => c.scored).map((c) => c.id)

/** Derive the earned badge set from state (no stored badge flags). */
export function awardBadges(state: QuestState, quest: Quest): Set<BadgeId> {
  const ids = scoredIds(quest)
  const badges = new Set<BadgeId>()
  if (state.checkedIn.size >= 1) badges.add('trailhead')
  if (state.cautionCheckedIn || state.restrictedBlocked) badges.add('access-aware')
  if (state.photos.size >= 1) badges.add('shutterbug')
  if (state.foundCache) badges.add('cache-hunter')
  if (state.cleanRunBonus) badges.add('clean-run')
  if (ids.every((id) => state.discovered.has(id))) badges.add('pathfinder')
  if (ids.every((id) => state.checkedIn.has(id))) badges.add('quest-complete')
  if (state.posted) badges.add('left-your-mark')
  return badges
}

/** Current/max score + a human breakdown line. `max` is always 1000 (D-010). */
export function computeTotals(
  state: QuestState,
  quest: Quest,
): { current: number; max: number; breakdown: string } {
  const total = scoredIds(quest).length
  const current =
    state.checkedIn.size * POINTS.checkpoint +
    state.photos.size * POINTS.photo +
    (state.foundCache ? POINTS.geocache : 0) +
    (state.cleanRunBonus ? POINTS.cleanRun : 0)
  const breakdown =
    `Checkpoints ${state.checkedIn.size}/${total} · ` +
    `Photos ${state.photos.size} · ` +
    `Cache ${state.foundCache ? '✓' : '✗'} · ` +
    `Clean ${state.cautionCheckedIn ? '✗' : '✓'}`
  return { current, max: MAX_SCORE, breakdown }
}
