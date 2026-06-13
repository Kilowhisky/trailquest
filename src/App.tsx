import { useEffect, useReducer, useRef, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { MapView } from './components/MapView'
import { AccessBanner } from './components/AccessBanner'
import { BriefingCard } from './components/BriefingCard'
import { ScoreCard } from './components/ScoreCard'
import { CheckpointPanel } from './components/CheckpointPanel'
import { PosterboardDialog } from './components/PosterboardDialog'
import { initialQuestState, questReducer } from './state/questReducer'
import { formatLatLon, toUTM } from './lib/geo'

export default function App() {
  const [state, dispatch] = useReducer(questReducer, initialQuestState)
  const [showHillshade, setShowHillshade] = useState(false)
  const lastNotice = useRef(0)

  // Fire a toast for each new reducer notice, exactly once.
  useEffect(() => {
    const n = state.notice
    if (!n || n.id === lastNotice.current) return
    lastNotice.current = n.id
    if (n.kind === 'blocked') toast.warning(n.message)
    else if (n.kind === 'discover') toast(n.message, { icon: '📍' })
    else if (n.kind === 'complete') toast.success(n.message, { duration: 6000 })
    else toast.success(n.message)
  }, [state.notice])

  const utm = toUTM(state.userPosition)

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView
        userPosition={state.userPosition}
        discoveredIds={state.discovered}
        onMoveUser={(p) => dispatch({ type: 'MOVE_USER', position: p })}
        showHillshade={showHillshade}
      />

      {/* Left column: briefing + score */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex flex-col gap-3">
        <BriefingCard />
        <ScoreCard state={state} />
        {state.completed && !state.posterboardOpen && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'OPEN_POSTERBOARD' })}
            className="pointer-events-auto self-start rounded-lg border border-border bg-card/90 px-3 py-1.5 text-xs font-medium text-card-foreground shadow-lg backdrop-blur hover:bg-card"
          >
            Open posterboard
          </button>
        )}
      </div>

      {/* Right column: access banner + checkpoint panel */}
      <div className="pointer-events-none absolute right-4 top-4 z-[1000] flex flex-col items-end gap-3">
        <AccessBanner tier={state.currentZone.tier} ownerLabel={state.currentZone.ownerLabel} />
        <CheckpointPanel
          state={state}
          onCheckIn={(id) => dispatch({ type: 'CHECK_IN', checkpointId: id })}
          onPhoto={(id) => dispatch({ type: 'PHOTO_BONUS', checkpointId: id })}
        />
      </div>

      {/* Bottom-right: hillshade toggle + coordinate HUD */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
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
          {formatLatLon(state.userPosition)} · {utm.zone} {Math.round(utm.easting / 1000)}k{' '}
          {Math.round(utm.northing / 1000)}k
        </div>
      </div>

      {/* Bottom-left disclaimer */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-xs">
        <p className="pointer-events-auto rounded-lg border border-border bg-card/80 px-3 py-2 text-[10px] leading-snug text-muted-foreground backdrop-blur">
          Geometry, ownership &amp; elevation are real (OSM / UGRC / BLM / USGS); the quest, scoring &amp;
          access tiers are a fictional game — not legal, navigational, or land-access guidance. Drag the blue
          marker or click the map to move.
        </p>
      </div>

      <PosterboardDialog
        open={state.posterboardOpen}
        state={state}
        messages={state.posterMessages}
        posted={state.posted}
        onPost={(author, text) => dispatch({ type: 'POST_MESSAGE', author, text })}
        onClose={() => dispatch({ type: 'CLOSE_POSTERBOARD' })}
      />

      <Toaster theme="dark" position="top-center" richColors closeButton />
    </div>
  )
}
