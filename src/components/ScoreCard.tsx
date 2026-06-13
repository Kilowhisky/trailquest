import { BADGES, BADGE_ORDER } from '../data/badges'
import { quest } from '../data/quest'
import { awardBadges, computeTotals, type QuestState } from '../lib/scoring'
import { routeTotals } from '../lib/geo'

const ROUTE = routeTotals(quest.route)

function Sparkline({ profile, width = 184, height = 34 }: { profile: number[]; width?: number; height?: number }) {
  const pts = profile.filter((n) => Number.isFinite(n))
  if (pts.length < 2) return null
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const step = width / (pts.length - 1)
  const path = pts
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(' ')
  const area = `0,${height} ${path} ${width},${height}`
  return (
    <svg width={width} height={height} className="block" aria-label="route elevation profile">
      <polygon points={area} fill="oklch(0.72 0.17 55 / 0.18)" />
      <polyline points={path} fill="none" stroke="oklch(0.72 0.17 55)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function ScoreCard({ state }: { state: QuestState }) {
  const totals = computeTotals(state, quest)
  const earned = awardBadges(state, quest)

  return (
    <div className="pointer-events-auto w-64 rounded-xl border border-border bg-card/90 p-4 shadow-lg backdrop-blur">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tabular-nums text-accent">{totals.current}</span>
        <span className="text-base text-muted-foreground">/ {totals.max}</span>
        <span className="ml-auto text-[11px] uppercase tracking-wider text-muted-foreground">score</span>
      </div>
      <div className="mt-1 text-[11px] text-card-foreground">{totals.breakdown}</div>

      <div className="mt-3 border-t border-border/70 pt-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Route</span>
          <span className="font-medium text-card-foreground">
            {ROUTE.miles} mi · +{ROUTE.gainFt} ft
          </span>
        </div>
        <div className="mt-1">
          <Sparkline profile={quest.route.elevationProfile} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {BADGE_ORDER.map((id) => {
          const got = earned.has(id)
          return (
            <span
              key={id}
              title={BADGES[id].description}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                got
                  ? 'bg-accent/90 text-accent-foreground'
                  : 'border border-border bg-transparent text-muted-foreground/60'
              }`}
            >
              {BADGES[id].label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
