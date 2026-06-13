import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { AccessZone, ZoneClass } from '../types/quest'
// Vite `?raw` import keeps the committed GeoJSON out of the type graph but inlined
// in the bundle (no runtime fetch). Parsed once at module load.
import zonesRaw from './sources/land_ownership.geojson?raw'

interface ZoneProps {
  tier?: string
  ownerLabel?: string
  owner?: string
  admin?: string
}

const fc = JSON.parse(zonesRaw) as FeatureCollection<Polygon | MultiPolygon, ZoneProps>

/**
 * Real Moab land-ownership polygons (UGRC), each reclassified into a game access
 * tier at authoring time. Point-in-polygon (lib/geo) runs over these real
 * boundaries; the tier is the game, the owner label is the truth (D-012).
 */
export const accessZones: AccessZone[] = fc.features.map((f, i) => ({
  id: `zone-${i}`,
  class: (f.properties?.tier ?? 'public') as ZoneClass,
  ownerLabel: f.properties?.ownerLabel ?? 'Unclassified',
  owner: f.properties?.owner ?? '',
  admin: f.properties?.admin ?? '',
  geometry: f.geometry,
}))

/** Raw FeatureCollection (with `tier` properties) for rendering the zone overlays. */
export const accessZonesFC = fc
