import type { Checkpoint, LngLat } from '../types/quest'
import { quest, scoredCheckpoints } from '../data/quest'
import { checkpointProximity } from '../lib/geo'
import type { ReducerState } from '../state/questReducer'

const scoredOrder = new Map(scoredCheckpoints.map((c, i) => [c.id, i + 1]))

function Chip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {children}
    </span>
  )
}

function metres(d: number): string {
  return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`
}

interface Props {
  state: ReducerState
  onCheckIn: (id: string) => void
  onPhoto: (id: string) => void
}

export function CheckpointPanel({ state, onCheckIn, onPhoto }: Props) {
  return (
    <div className="pointer-events-auto flex max-h-[70vh] w-72 flex-col rounded-xl border border-border bg-card/90 shadow-lg backdrop-blur">
      <div className="border-b border-border/70 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-card-foreground">Checkpoints</h2>
        <p className="text-[11px] text-muted-foreground">
          {state.checkedIn.size}/{scoredCheckpoints.length} checked in · {state.discovered.size}/
          {scoredCheckpoints.length} discovered
        </p>
      </div>
      <ul className="flex-1 divide-y divide-border/50 overflow-y-auto">
        {quest.checkpoints.map((cp) => (
          <Row
            key={cp.id}
            cp={cp}
            state={state}
            userPosition={state.userPosition}
            onCheckIn={onCheckIn}
            onPhoto={onPhoto}
          />
        ))}
      </ul>
    </div>
  )
}

function Row({
  cp,
  state,
  userPosition,
  onCheckIn,
  onPhoto,
}: {
  cp: Checkpoint
  state: ReducerState
  userPosition: LngLat
  onCheckIn: (id: string) => void
  onPhoto: (id: string) => void
}) {
  const prox = checkpointProximity(userPosition, cp)

  // Forbidden waypoint — always visible, always blocks.
  if (cp.forbidden) {
    return (
      <li className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-tier-restricted">⛔</span>
          <span className="text-sm font-medium text-tier-restricted">{cp.name}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">{metres(prox.distance)}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Restricted — Arches NP (NPS). Do not enter.</p>
        <button
          type="button"
          disabled={!prox.withinGeofence}
          onClick={() => onCheckIn(cp.id)}
          className="mt-1.5 rounded-md border border-tier-restricted/50 px-2 py-1 text-[11px] text-tier-restricted disabled:opacity-40"
        >
          {state.restrictedBlocked ? 'Blocked ✓ (Access Aware)' : 'Try check-in'}
        </button>
      </li>
    )
  }

  // Undiscovered scored — locked row (fog-of-war).
  if (!state.discovered.has(cp.id)) {
    return (
      <li className="px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground/70">
          <span className="grid h-5 w-5 place-items-center rounded-full border border-dashed border-muted-foreground/50 text-[11px]">
            ?
          </span>
          <span className="text-sm italic">??? — undiscovered</span>
        </div>
      </li>
    )
  }

  const n = scoredOrder.get(cp.id)
  const checkedIn = state.checkedIn.has(cp.id)
  const photographed = state.photos.has(cp.id)

  return (
    <li className="px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
          {n}
        </span>
        <span className="text-sm font-medium text-card-foreground">{cp.name}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{checkedIn ? '✓ in' : metres(prox.distance)}</span>
      </div>

      <div className="mt-1 flex flex-wrap gap-1">
        {cp.elevationFt != null && <Chip>{cp.elevationFt.toLocaleString()} ft</Chip>}
        {cp.difficulty && <Chip title={`source: ${cp.difficultySource}`}>{cp.difficulty}</Chip>}
        {cp.surface && <Chip>{cp.surface}</Chip>}
        {cp.lengthMi != null && <Chip title={`${cp.blmRouteName ?? ''} (source: BLM)`}>{cp.lengthMi} mi</Chip>}
      </div>

      {cp.hint && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{cp.hint}</p>}

      <div className="mt-1.5 flex gap-1.5">
        {!checkedIn && (
          <button
            type="button"
            disabled={!prox.withinGeofence}
            onClick={() => onCheckIn(cp.id)}
            className="rounded-md bg-accent px-2 py-1 text-[11px] font-medium text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {prox.withinGeofence ? 'Check in (+100)' : 'Get closer to check in'}
          </button>
        )}
        {checkedIn && cp.photoPrompt && !photographed && (
          <button
            type="button"
            onClick={() => onPhoto(cp.id)}
            className="rounded-md border border-accent/60 px-2 py-1 text-[11px] font-medium text-accent"
          >
            📷 I got the shot (+50)
          </button>
        )}
        {photographed && <span className="self-center text-[11px] text-muted-foreground">📷 photo ✓</span>}
      </div>

      {checkedIn && cp.photoPrompt && (
        <p className="mt-1 text-[11px] italic leading-snug text-muted-foreground/80">“{cp.photoPrompt}”</p>
      )}
    </li>
  )
}
