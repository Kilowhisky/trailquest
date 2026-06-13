import { useState } from 'react'
import type { PosterMessage } from '../types/quest'
import { computeTotals, type QuestState } from '../lib/scoring'
import { quest } from '../data/quest'

interface Props {
  open: boolean
  state: QuestState
  messages: PosterMessage[]
  posted: boolean
  onPost: (author: string, text: string) => void
  onClose: () => void
}

export function PosterboardDialog({ open, state, messages, posted, onPost, onClose }: Props) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  if (!open) return null

  const totals = computeTotals(state, quest)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onPost(author, text)
    setText('')
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-[2000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-card-foreground">Quest Complete 🎉</h2>
            <button type="button" onClick={onClose} className="ml-auto text-sm text-muted-foreground hover:text-card-foreground">
              ✕
            </button>
          </div>
          <p className="text-sm text-accent">
            {totals.current} / {totals.max} points · {totals.breakdown}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Sign the trail posterboard for the next quester. <span className="italic">(demo — not saved)</span>
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-3">
          {messages.map((m, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <p className="text-[13px] leading-snug text-card-foreground">{m.text}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                — {m.author} · {m.date}
                {!m.seeded && <span className="ml-1 text-accent">· you</span>}
              </p>
            </div>
          ))}
        </div>

        {!posted ? (
          <form onSubmit={submit} className="space-y-2 border-t border-border px-5 py-3">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Leave a message…"
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-accent py-2 text-sm font-semibold text-accent-foreground disabled:opacity-40"
              disabled={!text.trim()}
            >
              Post & earn “Left Your Mark”
            </button>
          </form>
        ) : (
          <div className="border-t border-border px-5 py-3 text-center text-[12px] text-muted-foreground">
            Thanks for signing — “Left Your Mark” earned. <span className="italic">(demo — not saved)</span>
          </div>
        )}
      </div>
    </div>
  )
}
