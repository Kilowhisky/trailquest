import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Klondike Bluffs / Bar M (Moab Brands) — real BLM singletrack running up against
 * the Arches National Park boundary. Final center/bbox and checkpoints are chosen
 * from fetched GeoJSON in step 2; this is the demo viewport.
 */
const MOAB_CENTER: [number, number] = [38.715, -109.708]
const DEFAULT_ZOOM = 13

// Keyless Esri World Imagery (satellite) — attribution required.
const ESRI_WORLD_IMAGERY =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'

export function MapView() {
  return (
    <MapContainer
      center={MOAB_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        url={ESRI_WORLD_IMAGERY}
        attribution={ESRI_ATTRIBUTION}
        maxZoom={19}
      />
    </MapContainer>
  )
}
