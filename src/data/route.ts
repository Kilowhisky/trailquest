import type { FeatureCollection, LineString } from 'geojson'
import type { QuestRoute } from '../types/quest'
import routeRaw from './sources/route.geojson?raw'

interface RouteProps {
  segmentMiles: number[]
  totalMiles: number
  totalGainFt: number
  elevationProfile: number[]
  onTrailFlags: boolean[]
}

const fc = JSON.parse(routeRaw) as FeatureCollection<LineString, RouteProps>
const feature = fc.features[0]

/** The on-trail quest route (snapped to real OSM trail geometry — D-012). */
export const questRoute: QuestRoute = {
  geometry: feature.geometry,
  segmentMiles: feature.properties.segmentMiles,
  totalMiles: feature.properties.totalMiles,
  totalGainFt: feature.properties.totalGainFt,
  elevationProfile: feature.properties.elevationProfile,
  onTrailFlags: feature.properties.onTrailFlags,
}
