# AI Usage

The onX take-home is judged on *a clear AI-assisted engineering process*. This document records how
AI (Claude / Claude Code) was used to plan, build, and verify TrailQuest — and where human judgment
held the wheel.

## Roles

- **Human (Chris):** product direction, scope control, decision approval, and the go/no-go on
  outward-facing actions (making the repo public, running the autonomous build). Caught a real
  diagnostic miss (see "Honest moments").
- **Claude Code:** brainstorming partner, implementer, test-author, reviewer-of-its-own-work, and
  release engineer driving the PR pipeline.

## Process shape

### 1. Brainstorm → spec → plan (before any code)

Every feature was talked through, written up as a spec, and folded into a single plan *before*
implementation. The artifacts are committed and reviewable:

- `docs/DECISIONS.md` — D-001…D-014, the decision log (map library, simulated location, real-data
  reversal, scoring model, fog-of-war, the restricted-reachability resolution, the CI/CD process).
- `docs/specs/` — scoring, testing, fog-of-war, the three real-data authenticity tiers, and the CI/CD
  pipeline design.
- `docs/plans/IMPLEMENTATION-PLAN.md` — the authoritative 7-step build plan.
- `docs/research/moab-data-sources.md` — keyless data sources, live-verified over the Moab bbox.

### 2. A visible, mostly-autonomous delivery pipeline

Implementation ran as a **serial PR train** — one pull request per build step (7 total), each:

1. built in its own **git worktree** off an updated `main`,
2. gated by **GitHub Actions CI** (`tsc --noEmit` · `eslint` · `vitest run` · `vite build`),
3. reviewed by **GitHub Copilot** (advisory; comments triaged and addressed, replies recorded on each),
4. **squash-merged**, which **auto-deploys** the live demo to GitHub Pages.

See `docs/CICD.md` for the runbook. The PR/CI/review/merge trail is itself part of the deliverable.

### 3. Adversarial multi-agent verification of high-risk logic

For the parts where bugs are silent and costly, Claude ran **fan-out verification workflows** — several
independent agents that re-derived results and tried to *refute* the work, then a second pass that
verified each finding before anything was changed. These caught real defects that the happy-path tests
missed:

- **Real data fetch:** a `nearestBlm` matcher silently skipped `MultiLineString` features, mis-attributing
  trail mileage to the wrong nearby trail (and Copilot independently flagged the same bug).
- **`lib/geo.ts`:** `computeGain` coerced a `null` elevation sample (a real USGS-3DEP-failure outcome) to
  `0`, corrupting total climb; `toUTM` returned an undefined band for latitudes 80–84° and zone 61 at the
  +180° meridian.
- **scoring/reducer:** quest completion was coupled to the per-action points delta, so a *duplicate* 5th
  check-in wouldn't re-trigger completion (latent; unreachable without state persistence, fixed anyway).

### 4. TDD + browser QA

- The pure layers (`lib/geo.ts`, `lib/scoring.ts`, `state/questReducer.ts`) were written **test-first**:
  the failing test, then the implementation. The tests double as documentation of the spatial/scoring
  reasoning (inclusive geofences, most-restrictive zone precedence, idempotent bonuses, perfect-run = 1000).
- Each UI step was **verified live in Chrome** (DevTools MCP): the map layers, click-to-move, the
  fog-of-war reveal, the live PUBLIC→RESTRICTED access banner, and the full game loop to a perfect 1000
  with all 8 badges — confirming a clean console at each step.

## AI-generated game copy

The *game layer* is mocked, and its prose was AI-generated, but every **place name is real** (pulled from
the OSM/BLM data — Klondike Bluffs, Baby Steps, EKG, Jurassic, Tower Arch). The copy lives in
`src/data/briefing.ts` and `src/data/posterboard.ts`.

Representative generation intent (paraphrased prompts):

- **Quest briefing:** *"Write a short ranger-style quest briefing for a fictional scavenger hunt over the
  real Klondike Bluffs BLM trails north of Moab. It must use the real trail names, set up the fog-of-war
  exploration, and make clear that Tower Arch is inside Arches NP and off-limits. Keep it grounded — never
  invent a landmark."*
- **Photo prompts:** *"For each scenic checkpoint, write a one-line photo prompt that references the nearest
  real named feature (e.g. Tower Arch, the Klondike Bluffs fins) — the prompt is the game, the feature is
  real."*
- **Posterboard:** *"Seed 4 short, believable prior-quester messages that reference the real trails and the
  access ethic (respecting the park boundary), clearly fictional and session-only."*

Guard rail (decision D-011): the AI was never allowed to assert a fact it couldn't cite to a source —
trail names, owners, elevations, and difficulty all come from the committed real data; only the storyline,
points, and badges are invented.

## Honest moments (where AI was wrong, and the human or a second agent corrected it)

- A `curl` probe reported the BLM and main Overpass endpoints as unreachable; **Chris pointed out they
  loaded fine in his browser.** Root cause: a Windows-`schannel` TLS-renegotiation quirk in curl — the
  Node fetch the script actually uses reached every host. That recovered the BLM MTB attribute layer.
- The data-verification workflow caught the `MultiLineString` attribute bug; the geo workflow caught the
  elevation-gain corruption and the UTM edge cases; the scoring workflow caught the completion/delta
  coupling. None of these were in the original "looks done" state.

## Tools used

Claude Code (Opus 4.8), GitHub Actions, GitHub Copilot code review, Chrome DevTools MCP for browser QA,
and a multi-agent workflow engine for the adversarial verification passes.
