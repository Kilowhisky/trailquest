import { Fragment } from 'react'
import { Circle, GeoJSON, MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'
import L, { type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LngLat } from '../types/quest'
import { quest, scoredCheckpoints } from '../data/quest'
import { accessZonesFC } from '../data/accessZones'
import trailsRaw from '../data/sources/moab_trails.geojson?raw'
import { checkpointIcon, forbiddenIcon, toLatLng, undiscoveredIcon, userIcon } from '../lib/mapIcons'

const trailsFC = JSON.parse(trailsRaw) as FeatureCollection<Geometry>

// Derived once from the static quest route — hoisted so it isn't remapped on every render.
const ROUTE_LATLNGS = quest.route.geometry.coordinates.map((c) => toLatLng(c as LngLat))

// Keyless Esri tiles (attribution required). Imagery leads; hillshade is an opt-in overlay.
const ESRI_IMAGERY =
  'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_HILLSHADE =
  'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION =
  'Trails &copy; OpenStreetMap (ODbL) &middot; Land &copy; UGRC / BLM &middot; Elevation &copy; USGS 3DEP &middot; Imagery &copy; Esri, Maxar, Earthstar Geographics'

const TIER_COLOR: Record<string, string> = {
  public: '#22c55e',
  caution: '#eab308',
  restricted: '#ef4444',
}

function zoneStyle(feature?: Feature<Geometry, GeoJsonProperties>): PathOptions {
  const tier = String(feature?.properties?.tier ?? 'public')
  const color = TIER_COLOR[tier] ?? '#22c55e'
  return { color, weight: 1, fillColor: color, fillOpacity: tier === 'restricted' ? 0.22 : 0.14 }
}

const TRAIL_STYLE: PathOptions = { color: '#fde68a', weight: 1.2, opacity: 0.5 }
const ROUTE_STYLE: PathOptions = { color: '#f97316', weight: 4, opacity: 0.95, dashArray: '1 9', lineCap: 'round' }
const GEOFENCE_STYLE: PathOptions = { color: '#f97316', weight: 1.5, fillColor: '#f97316', fillOpacity: 0.1 }
const FORBIDDEN_FENCE: PathOptions = { color: '#ef4444', weight: 1, dashArray: '3 4', fillColor: '#ef4444', fillOpacity: 0.06 }
const GEOCACHE_STYLE: PathOptions = { color: '#c084fc', weight: 1.5, dashArray: '4 6', fillColor: '#a855f7', fillOpacity: 0.08 }

const scoredOrder = new Map(scoredCheckpoints.map((c, i) => [c.id, i + 1]))

function ClickToMove({ onMoveUser }: { onMoveUser: (p: LngLat) => void }) {
  useMapEvents({
    click(e) {
      onMoveUser([e.latlng.lng, e.latlng.lat])
    },
  })
  return null
}

export interface MapViewProps {
  userPosition: LngLat
  discoveredIds: ReadonlySet<string>
  onMoveUser: (p: LngLat) => void
  showHillshade?: boolean
}

export function MapView({ userPosition, discoveredIds, onMoveUser, showHillshade }: MapViewProps) {
  return (
    <MapContainer center={toLatLng(quest.center)} zoom={quest.zoom} className="h-full w-full" zoomControl={false}>
      <TileLayer url={ESRI_IMAGERY} attribution={ESRI_ATTRIBUTION} maxZoom={19} />
      {showHillshade && <TileLayer url={ESRI_HILLSHADE} opacity={0.45} maxZoom={19} />}

      {/* Real land-ownership polygons, colored by game access tier (point-in-polygon runs on these). */}
      <GeoJSON data={accessZonesFC} style={zoneStyle} interactive={false} />
      {/* Real OSM trail network. */}
      <GeoJSON data={trailsFC} style={() => TRAIL_STYLE} interactive={false} />
      {/* On-trail quest route. */}
      <Polyline positions={ROUTE_LATLNGS} pathOptions={ROUTE_STYLE} />

      {/* Hidden geocache — fuzzy search circle only (no cache marker). */}
      <Circle center={toLatLng(quest.geocache.searchCenter)} radius={quest.geocache.searchRadiusM} pathOptions={GEOCACHE_STYLE} />

      {quest.checkpoints.map((c) => {
        if (c.forbidden) {
          return (
            <Fragment key={c.id}>
              <Circle center={toLatLng(c.position)} radius={c.radius} pathOptions={FORBIDDEN_FENCE} />
              {/* non-interactive so clicking a marker still moves the user (click-to-walk) */}
              <Marker
                position={toLatLng(c.position)}
                icon={forbiddenIcon()}
                title={`${c.name} — restricted (NPS)`}
                interactive={false}
              />
            </Fragment>
          )
        }
        if (!discoveredIds.has(c.id)) {
          return (
            <Marker
              key={c.id}
              position={toLatLng(c.position)}
              icon={undiscoveredIcon()}
              title="Undiscovered"
              interactive={false}
            />
          )
        }
        return (
          <Fragment key={c.id}>
            <Circle center={toLatLng(c.position)} radius={c.radius} pathOptions={GEOFENCE_STYLE} />
            <Marker
              position={toLatLng(c.position)}
              icon={checkpointIcon(scoredOrder.get(c.id) ?? 0, c.photoPrompt != null)}
              title={c.name}
              interactive={false}
            />
          </Fragment>
        )
      })}

      <Marker
        position={toLatLng(userPosition)}
        icon={userIcon()}
        draggable
        eventHandlers={{
          dragend(e) {
            const ll = (e.target as L.Marker).getLatLng()
            onMoveUser([ll.lng, ll.lat])
          },
        }}
      />
      <ClickToMove onMoveUser={onMoveUser} />
    </MapContainer>
  )
}
