import type { LineString, MultiPolygon, Polygon } from 'geojson'

/** [lng, lat] — GeoJSON coordinate order, used everywhere positions are stored. */
export type LngLat = [number, number]

/** Game access tier, derived from real land ownership (D-011). */
export type ZoneClass = 'public' | 'caution' | 'restricted'

/** Provenance tag for a surfaced real attribute (D-012). */
export type AttrSource = 'OSM' | 'BLM' | 'UGRC' | 'USGS'

/**
 * A quest checkpoint. Geometry/elevation/attributes are REAL (sourced at authoring
 * time); the game layer (radii, photo prompt, hint, point value) is mocked.
 */
export interface Checkpoint {
  id: string
  name: string
  position: LngLat
  /** check-in geofence radius, meters (inclusive boundary — D-011). */
  radius: number
  /**
   * Fog-of-war discovery radius, meters (> radius). Crossing it reveals the
   * checkpoint. Omitted for the always-visible forbidden waypoint.
   */
  discoveryRadius?: number
  /** One of the 5 scored checkpoints (vs. the unscored forbidden waypoint). */
  scored: boolean
  /** The unscored "do not enter" waypoint just inside restricted land (D-013). */
  forbidden?: boolean

  // --- Real, sourced attributes (D-012) ---
  /** USGS 3DEP elevation in feet (null if the lookup failed). */
  elevationFt: number | null
  /** Access tier at this point, precomputed; the app also recomputes it live. */
  tier: ZoneClass
  /** Verbatim land-owner label from the source polygon (e.g. "BLM", "NPS"). */
  ownerLabel: string | null
  /** Real OSM trail this checkpoint sits on. */
  trailName: string | null
  /** OSM difficulty (mtb:scale / sac_scale). */
  difficulty: string | null
  difficultySource: AttrSource | null
  /** OSM surface tag. */
  surface: string | null
  /** BLM route mileage. */
  lengthMi: number | null
  /** BLM route name (e.g. "Klondike Bluffs - Baby Steps Loop"). */
  blmRouteName: string | null
  /** BLM MTB Project link. */
  mtbProjectUrl: string | null
  lengthSource: AttrSource | null
  /** Nearest real named OSM feature (for photo-prompt anchoring). */
  nearestFeature: { name: string; type: string; distM: number } | null

  // --- Mocked game copy ---
  /** Photo-prompt text on scenic checkpoints (anchored to a real feature). */
  photoPrompt?: string
  /** Short briefing hint shown in the checkpoint panel. */
  hint?: string
}

/** A real land-ownership polygon reclassified into a game access tier. */
export interface AccessZone {
  id: string
  class: ZoneClass
  /** Verbatim owner label shown alongside the game tier (D-012). */
  ownerLabel: string
  owner: string
  admin: string
  geometry: Polygon | MultiPolygon
}

/** On-trail quest route, snapped to real trail geometry at authoring time. */
export interface QuestRoute {
  geometry: LineString
  /** On-trail miles per checkpoint-to-checkpoint segment. */
  segmentMiles: number[]
  totalMiles: number
  totalGainFt: number
  /** Elevation (ft) sampled ~every 150 m along the route. */
  elevationProfile: number[]
  /** Whether each segment followed the trail network (vs. a straight fallback). */
  onTrailFlags: boolean[]
}

/** Hidden geocache: a fuzzy search circle with a small exact cache geofence inside. */
export interface Geocache {
  searchCenter: LngLat
  searchRadiusM: number
  cachePoint: LngLat
  cacheRadiusM: number
}

/** A posterboard message (mocked, session-only social reward — D-010). */
export interface PosterMessage {
  author: string
  text: string
  date: string
  /** True for pre-seeded fictional messages (vs. ones the user adds this session). */
  seeded?: boolean
}

export type BadgeId =
  | 'trailhead'
  | 'access-aware'
  | 'shutterbug'
  | 'cache-hunter'
  | 'clean-run'
  | 'pathfinder'
  | 'left-your-mark'
  | 'quest-complete'

export interface Badge {
  id: BadgeId
  label: string
  description: string
}

/** The single rich quest (D-013): one storyline over real Klondike Bluffs geography. */
export interface Quest {
  id: string
  title: string
  subtitle: string
  /** AI-pre-generated briefing paragraphs (mocked copy over real place names). */
  briefing: string[]
  /** Hint nudging the player toward the hidden geocache. */
  geocacheHint: string
  /** Initial map center [lng, lat] and zoom. */
  center: LngLat
  zoom: number
  checkpoints: Checkpoint[]
  route: QuestRoute
  geocache: Geocache
  /** Combined data attribution shown in-app. */
  attribution: string
}
