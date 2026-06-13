import type { LngLat, PosterMessage, ZoneClass } from '../types/quest'
import { quest, scoredCheckpoints } from '../data/quest'
import { accessZones } from '../data/accessZones'
import { seededMessages } from '../data/posterboard'
import { checkpointProximity, classifyAccess, isInsideGeofence } from '../lib/geo'
import {
  applyCheckIn,
  applyGeocacheFind,
  applyPhotoBonus,
  evaluateCleanRun,
  freshState,
  type QuestState,
} from '../lib/scoring'

/** Simulated-user start, just outside the first checkpoint's discovery radius (fog reads on arrival). */
export const START: LngLat = [-109.7325, 38.7805]

export type NoticeKind = 'discover' | 'checkin' | 'photo' | 'cache' | 'blocked' | 'complete' | 'posted'
export interface Notice {
  /** Monotonic id so the UI fires each toast exactly once. */
  id: number
  kind: NoticeKind
  message: string
  delta?: number
}

/** Full app state: scoring facts + live position/zone + UI flags. */
export interface ReducerState extends QuestState {
  userPosition: LngLat
  currentZone: { tier: ZoneClass; ownerLabel: string | null }
  completed: boolean
  posterboardOpen: boolean
  notice: Notice | null
  noticeSeq: number
}

export type Action =
  | { type: 'MOVE_USER'; position: LngLat }
  | { type: 'CHECK_IN'; checkpointId: string }
  | { type: 'PHOTO_BONUS'; checkpointId: string }
  | { type: 'POST_MESSAGE'; author: string; text: string }
  | { type: 'OPEN_POSTERBOARD' }
  | { type: 'CLOSE_POSTERBOARD' }

export const initialQuestState: ReducerState = {
  ...freshState(),
  posterMessages: [...seededMessages],
  userPosition: START,
  currentZone: classifyAccess(START, accessZones),
  completed: false,
  posterboardOpen: false,
  notice: null,
  noticeSeq: 0,
}

const todayISO = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const allScoredCheckedIn = (s: QuestState): boolean => scoredCheckpoints.every((c) => s.checkedIn.has(c.id))

export function questReducer(state: ReducerState, action: Action): ReducerState {
  switch (action.type) {
    case 'MOVE_USER': {
      const { position } = action
      const currentZone = classifyAccess(position, accessZones)

      // Fog-of-war: latch any newly-entered scored checkpoint(s).
      let discovered = state.discovered
      const revealed: string[] = []
      for (const c of scoredCheckpoints) {
        if (!discovered.has(c.id) && checkpointProximity(position, c).withinDiscovery) {
          if (discovered === state.discovered) discovered = new Set(state.discovered)
          ;(discovered as Set<string>).add(c.id)
          revealed.push(c.name)
        }
      }

      // Geocache: auto-found on entering the exact cache geofence (not the fuzzy circle).
      let scored: QuestState = { ...state, discovered }
      let cacheDelta = 0
      if (!scored.foundCache && isInsideGeofence(position, quest.geocache.cachePoint, quest.geocache.cacheRadiusM)) {
        const found = applyGeocacheFind(scored)
        scored = found.state
        cacheDelta = found.delta
      }

      let notice = state.notice
      let noticeSeq = state.noticeSeq
      if (cacheDelta > 0) {
        noticeSeq += 1
        notice = { id: noticeSeq, kind: 'cache', message: 'Cache Hunter — you found the hidden geocache!', delta: cacheDelta }
      } else if (revealed.length > 0) {
        noticeSeq += 1
        notice = { id: noticeSeq, kind: 'discover', message: `Discovered: ${revealed.join(', ')}` }
      }

      return { ...state, ...scored, userPosition: position, currentZone, notice, noticeSeq }
    }

    case 'CHECK_IN': {
      const cp = quest.checkpoints.find((c) => c.id === action.checkpointId)
      if (!cp) return state
      const prox = checkpointProximity(state.userPosition, cp)

      // Forbidden waypoint: always-blocked check-in (heeded warning -> Access Aware).
      if (cp.forbidden) {
        if (!prox.withinGeofence || state.restrictedBlocked) return state
        const noticeSeq = state.noticeSeq + 1
        return {
          ...state,
          restrictedBlocked: true,
          notice: {
            id: noticeSeq,
            kind: 'blocked',
            message: `${cp.name} is inside Arches National Park (NPS) — check-in blocked. Access Aware earned.`,
          },
          noticeSeq,
        }
      }

      // Scored checkpoint: must be discovered and inside the geofence.
      if (!state.discovered.has(cp.id) || !prox.withinGeofence) return state
      const { state: afterCheckIn, delta } = applyCheckIn(state, cp, state.currentZone.tier)
      if (delta === 0) return state // already checked in

      let next: ReducerState = { ...state, ...afterCheckIn }
      let noticeSeq = state.noticeSeq + 1
      let notice: Notice = { id: noticeSeq, kind: 'checkin', message: `+${delta} ${cp.name}`, delta }

      // Completion: evaluate Clean Run and open the posterboard.
      if (!next.completed && allScoredCheckedIn(next)) {
        const { state: afterClean, delta: cleanDelta } = evaluateCleanRun(next)
        next = { ...next, ...afterClean, completed: true, posterboardOpen: true }
        noticeSeq += 1
        notice = {
          id: noticeSeq,
          kind: 'complete',
          message: cleanDelta > 0 ? `Quest Complete! Clean Run +${cleanDelta}` : 'Quest Complete!',
          delta: cleanDelta || undefined,
        }
      }
      return { ...next, notice, noticeSeq }
    }

    case 'PHOTO_BONUS': {
      const cp = quest.checkpoints.find((c) => c.id === action.checkpointId)
      if (!cp || !state.checkedIn.has(cp.id)) return state
      const { state: afterPhoto, delta } = applyPhotoBonus(state, cp)
      if (delta === 0) return state
      const noticeSeq = state.noticeSeq + 1
      return {
        ...state,
        ...afterPhoto,
        notice: { id: noticeSeq, kind: 'photo', message: `+${delta} photo — ${cp.name}`, delta },
        noticeSeq,
      }
    }

    case 'POST_MESSAGE': {
      const text = action.text.trim()
      if (!text) return state
      const msg: PosterMessage = { author: action.author.trim() || 'Anonymous', text, date: todayISO(), seeded: false }
      const noticeSeq = state.noticeSeq + 1
      return {
        ...state,
        posterMessages: [...state.posterMessages, msg],
        posted: true,
        notice: { id: noticeSeq, kind: 'posted', message: 'Left Your Mark — message posted (demo, not saved).' },
        noticeSeq,
      }
    }

    case 'OPEN_POSTERBOARD':
      return { ...state, posterboardOpen: true }
    case 'CLOSE_POSTERBOARD':
      return { ...state, posterboardOpen: false }

    default:
      return state
  }
}
