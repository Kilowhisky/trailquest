import type { Badge, BadgeId } from '../types/quest'

/** The canonical 8-badge set (D-013). Earned-state is derived in lib/scoring. */
export const BADGES: Record<BadgeId, Badge> = {
  trailhead: {
    id: 'trailhead',
    label: 'Trailhead',
    description: 'Logged your first checkpoint check-in.',
  },
  'access-aware': {
    id: 'access-aware',
    label: 'Access Aware',
    description: 'Heeded an access warning — a blocked restricted check-in or a caution-zone check-in.',
  },
  shutterbug: {
    id: 'shutterbug',
    label: 'Shutterbug',
    description: 'Grabbed your first scenic photo bonus.',
  },
  'cache-hunter': {
    id: 'cache-hunter',
    label: 'Cache Hunter',
    description: 'Found the hidden geocache off-route.',
  },
  'clean-run': {
    id: 'clean-run',
    label: 'Clean Run',
    description: 'Completed the quest without ever checking in inside a caution zone.',
  },
  pathfinder: {
    id: 'pathfinder',
    label: 'Pathfinder',
    description: 'Discovered all five scored checkpoints through exploration.',
  },
  'left-your-mark': {
    id: 'left-your-mark',
    label: 'Left Your Mark',
    description: 'Signed the completion posterboard.',
  },
  'quest-complete': {
    id: 'quest-complete',
    label: 'Quest Complete',
    description: 'Checked in at all five scored checkpoints.',
  },
}

export const BADGE_ORDER: BadgeId[] = [
  'trailhead',
  'pathfinder',
  'shutterbug',
  'cache-hunter',
  'access-aware',
  'clean-run',
  'quest-complete',
  'left-your-mark',
]
