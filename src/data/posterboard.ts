import type { PosterMessage } from '../types/quest'

/**
 * Pre-seeded fictional posterboard messages (mocked, session-only — D-010 / D-005).
 * Shown on quest completion; the user can append a message that persists in session
 * state only, clearly labeled "demo — not saved". These are invented quester voices,
 * but they reference the real trails (Baby Steps, EKG, Tower Arch).
 */
export const seededMessages: PosterMessage[] = [
  {
    author: 'Dana R.',
    text: 'EKG saddle at golden hour is unreal. Turned back at the park line — Tower Arch will have to wait for a permit day.',
    date: '2026-05-30',
    seeded: true,
  },
  {
    author: 'mtb_marcus',
    text: 'Found the cache on my second loop past Baby Steps! Look low. 🧭',
    date: '2026-06-02',
    seeded: true,
  },
  {
    author: 'SlickrockSam',
    text: 'Clean run, no caution check-ins. Respect the boundaries out here, folks.',
    date: '2026-06-07',
    seeded: true,
  },
  {
    author: 'Priya & Joel',
    text: 'First quest as a team — Klondike Bluffs did not disappoint. Those fins!',
    date: '2026-06-10',
    seeded: true,
  },
]
