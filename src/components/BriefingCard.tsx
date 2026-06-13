import { useState } from 'react'
import { quest } from '../data/quest'

export function BriefingCard() {
  const [open, setOpen] = useState(true)

  return (
    <div className="pointer-events-auto w-80 max-w-[85vw] rounded-xl border border-border bg-card/90 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-card-foreground">
            Trail<span className="text-accent">Quest</span>
          </h1>
          <p className="text-xs text-muted-foreground">{quest.subtitle}</p>
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{open ? '▲ brief' : '▼ brief'}</span>
      </button>

      {open && (
        <div className="max-h-[42vh] space-y-2 overflow-y-auto border-t border-border/70 px-4 py-3">
          {quest.briefing.map((p, i) => (
            <p key={i} className="text-[12px] leading-relaxed text-card-foreground/90">
              {p}
            </p>
          ))}
          <p className="rounded-md bg-muted/50 px-2 py-1.5 text-[11px] italic leading-snug text-muted-foreground">
            🧭 {quest.geocacheHint}
          </p>
        </div>
      )}
    </div>
  )
}
