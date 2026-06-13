import type { ZoneClass } from '../types/quest'

const TIER: Record<ZoneClass, { label: string; text: string; ring: string; blurb: string }> = {
  public: {
    label: 'PUBLIC',
    text: 'text-tier-public',
    ring: 'ring-tier-public/40',
    blurb: 'Open access — check in freely.',
  },
  caution: {
    label: 'CAUTION',
    text: 'text-tier-caution',
    ring: 'ring-tier-caution/40',
    blurb: 'Sensitive land — check-in counts but forfeits a Clean Run.',
  },
  restricted: {
    label: 'RESTRICTED',
    text: 'text-tier-restricted',
    ring: 'ring-tier-restricted/50',
    blurb: 'Do not enter — check-in is blocked here.',
  },
}

export function AccessBanner({ tier, ownerLabel }: { tier: ZoneClass; ownerLabel: string | null }) {
  const t = TIER[tier]
  return (
    <div
      className={`pointer-events-auto rounded-xl border border-border bg-card/90 px-4 py-3 text-right shadow-lg ring-1 backdrop-blur ${t.ring}`}
    >
      <div className={`text-sm font-bold tracking-widest ${t.text}`}>{t.label}</div>
      {ownerLabel && (
        <div className="text-xs text-card-foreground">
          {ownerLabel}
          <span className="ml-1 text-[10px] text-muted-foreground">· source: UGRC</span>
        </div>
      )}
      <div className="mt-0.5 max-w-[15rem] text-[11px] leading-snug text-muted-foreground">{t.blurb}</div>
    </div>
  )
}
