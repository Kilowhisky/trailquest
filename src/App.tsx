import { MapView } from './components/MapView'

export default function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView />

      <header className="pointer-events-none absolute left-4 top-4 z-[1000]">
        <div className="pointer-events-auto rounded-xl border border-border bg-card/90 px-4 py-3 shadow-lg backdrop-blur">
          <h1 className="text-lg font-bold tracking-tight text-card-foreground">
            Trail<span className="text-accent">Quest</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Moab, Utah · access-aware quest demo
          </p>
        </div>
      </header>

      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-sm">
        <p className="pointer-events-auto rounded-lg border border-border bg-card/80 px-3 py-2 text-[11px] leading-snug text-muted-foreground backdrop-blur">
          Trail and land geometry are real and sourced (OSM / BLM / UGRC); the
          quest, scoring, and access tiers are a fictional game — not legal,
          navigational, or land-access guidance.
        </p>
      </div>
    </div>
  )
}
