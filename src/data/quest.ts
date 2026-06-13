import type { Checkpoint, LngLat, Quest, ZoneClass, AttrSource } from '../types/quest'
import { questRoute } from './route'
import { briefingParagraphs, checkpointCopy, geocacheHint } from './briefing'
import authored from './sources/checkpoints.authored.json'

/**
 * Game-layer config per checkpoint id: the check-in geofence `radius` and the wider
 * fog-of-war `discoveryRadius` (D-013 fog-of-war). The forbidden waypoint is shown
 * from the start (no discovery) and only needs a check-in radius to trigger the block.
 */
const GAME: Record<string, { radius: number; discoveryRadius?: number }> = {
  'cp-jurassic': { radius: 60, discoveryRadius: 180 },
  'cp-babysteps': { radius: 60, discoveryRadius: 180 },
  'cp-ekg': { radius: 60, discoveryRadius: 180 },
  'cp-rim': { radius: 60, discoveryRadius: 200 },
  'cp-tower-approach': { radius: 60, discoveryRadius: 200 },
  'wp-tower-arch': { radius: 70 },
}

const checkpoints: Checkpoint[] = authored.checkpoints.map((c) => {
  const game = GAME[c.id] ?? { radius: 60, discoveryRadius: 180 }
  const copy = checkpointCopy[c.id] ?? {}
  return {
    id: c.id,
    name: c.name,
    position: c.lngLat as LngLat,
    radius: game.radius,
    discoveryRadius: game.discoveryRadius,
    scored: c.scored,
    forbidden: 'forbidden' in c ? (c.forbidden as boolean) : undefined,
    elevationFt: c.elevationFt,
    tier: c.tier as ZoneClass,
    ownerLabel: c.ownerLabel,
    trailName: c.trailName,
    difficulty: c.difficulty,
    difficultySource: c.difficultySource as AttrSource | null,
    surface: c.surface,
    lengthMi: c.lengthMi,
    blmRouteName: c.blmRouteName,
    mtbProjectUrl: c.mtbProjectUrl,
    lengthSource: c.lengthSource as AttrSource | null,
    nearestFeature: c.nearestFeature,
    photoPrompt: copy.photoPrompt,
    hint: copy.hint,
  }
})

export const quest: Quest = {
  id: 'klondike-tower-arch',
  title: 'Klondike Bluffs: Tower Arch Run',
  subtitle: 'Moab, Utah — BLM singletrack to the Arches boundary',
  briefing: briefingParagraphs,
  geocacheHint,
  center: [-109.71, 38.796],
  zoom: 14,
  checkpoints,
  route: questRoute,
  geocache: {
    searchCenter: authored.geocache.searchCenter as LngLat,
    searchRadiusM: authored.geocache.searchRadiusM,
    cachePoint: authored.geocache.cachePoint as LngLat,
    cacheRadiusM: 25,
  },
  attribution:
    'Trails © OpenStreetMap (ODbL) · Land © UGRC (CC BY 4.0) / BLM · Elevation © USGS 3DEP · Imagery © Esri',
}

/** The 5 scored checkpoints (excludes the unscored forbidden waypoint). */
export const scoredCheckpoints = checkpoints.filter((c) => c.scored)
/** Total points available from a perfect run (kept here for display; scoring lives in lib/scoring). */
export const MAX_SCORE = 1000
