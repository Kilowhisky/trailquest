import { useEffect, useMemo, useState } from 'react'
import { MapView } from './components/MapView'
import { quest, scoredCheckpoints } from './data/quest'
import { accessZones } from './data/accessZones'
import { checkpointProximity, classifyAccess, formatLatLon, routeTotals, toUTM } from './lib/geo'
import type { LngLat, ZoneClass } from './types/quest'

// Start just outside the first checkpoint's discovery radius so the fog-of-war reads.
const START: LngLat = [-109.7325, 38.7805]

const TIER_LABEL: Record<ZoneClass, string> = {
  public: 'PUBLIC',
  caution: 'CAUTION',
  restricted: 'RESTRICTED',
}
const TIER_TEXT: Record<ZoneClass, string> = {
  public: 'text-tier-public',
  caution: 'text-tier-caution',
  restricted: 'text-tier-restricted',
}

export default function App() {
  const [userPosition, setUserPosition] = useState<LngLat>(START)
  const [discovered, setDiscovered] = useState<ReadonlySet<string>>(new Set())
  const [showHillshade, setShowHillshade] = useState(false)

  // Fog-of-war: latch any scored checkpoint whose discovery radius the user has entered.
  useEffect(() => {
    setDiscovered((prev) => {
      let next: Set<string> | null = null
      for (const c of scoredCheckpoints) {
        if (!prev.has(c.id) && checkpointProximity(userPosition, c).withinDiscovery) {
          next ??= new Set(prev)
          next.add(c.id)
        }
      }
      return next ?? prev
    })
  }, [userPosition])

  const zone = useMemo(() => classifyAccess(userPosition, accessZones), [userPosition])
  const utm = useMemo(() => toUTM(userPosition), [userPosition])
  const totals = useMemo(() => routeTotals(quest.route), [])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView
        userPosition={userPosition}
        discoveredIds={discovered}
        onMoveUser={setUserPosition}
        showHillshade={showHillshade}
      />

      {/* Title */}
      <header className="pointer-events-none absolute left-4 top-4 z-[1000]">
        <div className="pointer-events-auto rounded-xl border border-border bg-card/90 px-4 py-3 shadow-lg backdrop-blur">
          <h1 className="text-lg font-bold tracking-tight text-card-foreground">
            Trail<span className="text-accent">Quest</span>
          </h1>
          <p className="text-xs text-muted-foreground">{quest.subtitle}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totals.miles} mi on-trail · +{totals.gainFt} ft · {discovered.size}/{scoredCheckpoints.length} discovered
          </p>
        </div>
      </header>

      {/* Access tier (the full banner arrives in step 6) */}
      <div className="pointer-events-none absolute right-4 top-4 z-[1000]">
        <div className="pointer-events-auto rounded-xl border border-border bg-card/90 px-4 py-3 text-right shadow-lg backdrop-blur">
          <div className={`text-sm font-bold tracking-wide ${TIER_TEXT[zone.tier]}`}>{TIER_LABEL[zone.tier]}</div>
          {zone.ownerLabel && <div className="text-[11px] text-muted-foreground">{zone.ownerLabel}</div>}
        </div>
      </div>

      {/* Hillshade toggle + move hint */}
      <div className="absolute right-4 bottom-4 z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setShowHillshade((v) => !v)}
          className={`rounded-lg border border-border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur transition-colors ${
            showHillshade ? 'bg-accent text-accent-foreground' : 'bg-card/90 text-card-foreground hover:bg-card'
          }`}
        >
          Hillshade {showHillshade ? 'on' : 'off'}
        </button>
        <div className="rounded-lg border border-border bg-card/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur">
          {formatLatLon(userPosition)} · {utm.zone} {Math.round(utm.easting / 1000)}k {Math.round(utm.northing / 1000)}k
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-sm">
        <p className="pointer-events-auto rounded-lg border border-border bg-card/80 px-3 py-2 text-[11px] leading-snug text-muted-foreground backdrop-blur">
          Trail and land geometry are real and sourced (OSM / UGRC / BLM / USGS); the quest, scoring, and
          access tiers are a fictional game — not legal, navigational, or land-access guidance. Drag the blue
          marker or click the map to move.
        </p>
      </div>
    </div>
  )
}
