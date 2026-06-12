# CI/CD Pipeline — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration; updated 2026-06-12 to fold in repo-analysis recommendations (GitHub Pages live demo, repo metadata, security hygiene)
**Related:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) · [README.md](../../README.md)

## Summary

A continuous-integration / continuous-delivery process for building TrailQuest. Each of the
seven timeboxed build steps in the [implementation plan](../plans/IMPLEMENTATION-PLAN.md) is
implemented on its **own branch in its own git worktree**, opened as a **pull request**, gated
by a **GitHub Actions CI check** (typecheck · lint · test · build), reviewed by **GitHub
Copilot**, and **squash-merged to `main`** — driven as a **fully autonomous loop** that pauses
only on a real blocker. Every merge to `main` then **auto-deploys a live demo to GitHub Pages**,
so reviewers click a link and see the map instead of cloning.

The process is deliberately visible because the onX take-home is judged on "a clear AI-assisted
engineering process" ([README](../../README.md)), so the PR/review/merge trail — plus a working
live demo — is part of the deliverable, not just overhead.

## Why this shape

The original instinct was "run each subagent in its own worktree branch in parallel, PR,
Copilot-review, merge." Two corrections make it fit reality:

1. **The build steps are a dependent pipeline, not parallel work.** The plan's sequence —
   scaffold → data → `types/quest.ts` → `lib/geo.ts` → `MapView` → scoring/state/cards →
   polish — has heavy shared state; each step imports the previous step's code. Running them
   concurrently would mean merge conflicts and agents building against stale `main`. So the
   PRs form a **serial train**, each branch cut from an **updated `main`**. Worktrees still
   earn their keep (clean per-step isolation that never clobbers the primary checkout), but
   the work is serial, not a parallel fan-out.

2. **Copilot review is advisory, not a gate.** Copilot leaves comments; it does not block a
   merge. The real merge gate is **CI** (typecheck/lint/test/build). Copilot rides alongside
   as a second opinion whose suggestions are **triaged**, not blindly applied.

## Decisions (resolved via brainstorm + repo analysis)

| Question | Decision |
| --- | --- |
| PR granularity | **One PR per build step** (~7) — maximal, visible engineering trail |
| Control model | **Fully autonomous loop** — I drive worktree → PR → Copilot → merge end-to-end, pausing only on a real blocker |
| Repo visibility | **Public** — unlocks free branch protection, Copilot review, **and free GitHub Pages**; matches "deliverable is a public GitHub repo" |
| Merge gate | **CI status check** (required); Copilot review requested + waited-on but **not** a required approval |
| Human approvals | **Not required** on `main` — a required-approval rule would deadlock self-authored autonomous merges |
| Merge style | **Squash + delete branch** |
| Live demo | **GitHub Pages**, auto-deployed on every push to `main` — highest reviewer-value-per-minute for a keyless frontend |
| Reviewer polish | **Repo description + topics**, **secret scanning + push protection** — cheap, one-call signals of engineering hygiene |
| LICENSE | **Open question** — 1-min MIT add if wanted, else skip (see Open questions) |

## Repo-analysis reconciliation

A separate repo analysis surfaced reviewer-facing additions; folded in as follows:

- **Accepted, promoted to Tier 1:** GitHub Pages live demo (`deploy.yml`). This reverses the
  earlier "deployment out of scope" call — a clickable, running map is the single biggest win
  for a frontend take-home and costs little once the repo is public.
- **Accepted, Tier 2:** repo description + topics (`geospatial`, `leaflet`, `react`,
  `typescript`, `onx`); secret scanning + push protection (low real risk on a keyless app, but
  a free one-click hygiene signal); `.gitignore` for `node_modules/`+`dist/` (ships with the
  scaffold — CI and Pages depend on it).
- **Converged, not changed:** the analysis recommended "skip branch protection, or at most
  require CI to pass." That **is** this spec's posture (require CI, no required human reviews).
  Its "no second reviewer" premise is also softened here: **Copilot is the second reviewer**
  (the user's explicit ask). Copilot is non-blocking, so required *reviews* still can't gate an
  autonomous merge — hence light "require CI" protection is kept, and Copilot review on top.
- **Skipped (agreed):** Dependabot, CodeQL — overkill for a throwaway prototype.

## One-time setup (before / around the scaffold)

Ordered, because the CI/deploy workflows reference npm scripts and a `base` path that do not
exist until the scaffold step creates them.

1. **`gh auth login`** — done (account `Kilowhisky`, token scopes include `repo` + `workflow`,
   `viewerPermission: ADMIN`). Hard prerequisite for everything else.
2. **Make the repo public** — `gh repo edit Kilowhisky/trailquest --visibility public`.
3. **Repo metadata** — `gh repo edit` to set description + topics
   (`geospatial`, `leaflet`, `react`, `typescript`, `onx`).
4. **Security hygiene** — enable secret scanning + push protection via the API
   (`PATCH /repos/{owner}/{repo}` `security_and_analysis`).
5. **Bootstrap CI + deploy inside the scaffold PR (step 1), not before.** The workflows
   reference `npm run lint/test/build`, and Pages needs Vite `base: '/trailquest/'`, all of
   which require the scaffold. So step 1's PR introduces, together:
   `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, ESLint config, `.gitignore`,
   and `vite.config.ts` with `base: '/trailquest/'`. This is the one PR where CI is *introduced*
   rather than gating; every PR after it is fully gated.
6. **After step 1 merges:**
   - Set the **Pages source to "GitHub Actions"** (`POST /repos/{owner}/{repo}/pages` with
     `build_type: workflow`).
   - Enable **branch protection** requiring the now-existing CI check.
   - Enable **Copilot automatic review**.

### Copilot automatic review — mechanism + fallback

Preferred: a **repository ruleset** (or the repo "Code review by Copilot" setting) that requests
Copilot on every PR to `main`. Fallback if that path isn't available on the account: **request
the Copilot reviewer per-PR via `gh api`**
(`POST /repos/{owner}/{repo}/pulls/{n}/requested_reviewers`). Which mechanism is available is
verified during setup; the loop uses whichever works.

## The CI gate — `.github/workflows/ci.yml`

Runs on `pull_request` targeting `main` **and** on `push` to `main`. **This is the real merge
gate.**

- `tsc --noEmit` — typecheck
- `eslint .` — lint (ships with the Vite React-TS scaffold; near-free)
- `vitest run` — the geo + scoring + smoke tests the plan already specifies
- `vite build` — proves it actually builds

Node 20, `npm ci`, dependency cache. Target < 2 min so the autonomous loop isn't bottlenecked
on round-trips.

## The live demo — `.github/workflows/deploy.yml`

Runs on **push to `main`** (i.e. after each merge), so the live demo tracks `main`.

- `npm ci` → `vite build` (emits `dist/` with asset paths under the `/trailquest/` base) →
  upload `dist/` as a Pages artifact → `actions/deploy-pages`.
- Requires (from the scaffold): Vite `base: '/trailquest/'` so assets resolve under the
  project-pages subpath; `.gitignore` excluding `dist/`.
- Requires (one-time, post-step-1): Pages source set to "GitHub Actions"; repo public.
- Result: a live map at **`https://kilowhisky.github.io/trailquest/`** the reviewer can open
  directly. First deploy lands when the scaffold PR merges; every later merge refreshes it.

## Branch protection posture

Deliberately tuned for an autonomous **solo** loop, and consistent with the repo analysis's
"at most require CI to pass":

- ✅ Require the **CI status check** to pass before merge.
- ❌ **Do not require human approvals.** GitHub forbids an author approving their own PR, so a
  required-approval rule would deadlock autonomous merges.
- Copilot review is **requested and waited-on**, but is **not** a required (blocking) approval —
  it comments rather than approves.

Net guarantee: everything on `main` passed CI — visible and enforced — without stalling the loop.

## The autonomous per-step loop

For each of the 7 steps, end-to-end with no pause:

1. **Worktree + branch** off the latest `main` (superpowers `using-git-worktrees`).
2. **Implement** the step against the plan (superpowers `subagent-driven-development`).
3. **Local pre-flight:** run typecheck/lint/test/build locally first — cheap, avoids wasting a
   PR round-trip on a trivial error.
4. **Push + open PR** via `gh`; request Copilot review.
5. **Wait for CI green AND Copilot's review to post** (poll). Load-bearing: without the wait,
   the merge would land before Copilot finishes and the review would be pointless.
6. **Triage Copilot feedback** (superpowers `receiving-code-review`): verify each suggestion,
   address the real ones with a follow-up commit (which re-triggers CI), dismiss noise with a
   stated reason.
7. **Merge** once CI is green and feedback is resolved — `gh pr merge --squash --delete-branch`.
   The merge's push to `main` triggers `deploy.yml`, refreshing the live demo.
8. **Advance:** remove the worktree, pull `main`, start the next step.

## Stop conditions (autonomous yields to the user)

The loop pauses and asks only when:

- CI still fails after **2 fix attempts** on the same step (signals a real design issue, not a
  typo).
- Copilot raises something **genuinely ambiguous** or a judgment call that changes scope.
- A **merge conflict** that can't be cleanly resolved.
- Copilot review doesn't post within a **~5 min timeout** — note it and proceed, since Copilot
  is advisory (never hang on a non-blocking signal).

## Deliverables of the setup phase

- **Rails:** `gh` authenticated; repo public + pushed; description + topics set; secret scanning
  with push protection on; `.github/workflows/ci.yml`; `.github/workflows/deploy.yml`; ESLint
  config; `.gitignore`; Vite `base`; Pages source = GitHub Actions; branch protection on `main`;
  Copilot automatic review; and a short **`docs/CICD.md`** runbook documenting this loop (which
  doubles as evidence of the AI-assisted process for reviewers).
- **Live demo URL** at `https://kilowhisky.github.io/trailquest/`, refreshed on every merge.
- Then the **7-step autonomous PR train** runs the actual TrailQuest implementation through it.

## Honest caveats

- **Step 1 is special.** The lint/build configs, both workflows, `.gitignore`, and the Vite
  `base` are *created* in the scaffold PR, so that first PR introduces the gate + deploy rather
  than passing through them. Unavoidable chicken-and-egg; called out so it isn't mistaken for a
  gap.
- **Process cost is real.** A 7-PR autonomous train on a 1–2 hr prototype spends meaningful
  wall-clock on review round-trips. The payoff is precisely the visible engineering trail —
  plus a live demo — that onX said it evaluates. Accepted on purpose, not overlooked.
- **Pages base path is load-bearing.** If Vite `base` isn't `'/trailquest/'`, the deployed app
  loads a blank page (assets 404 under the project subpath). It must land in the scaffold.

## Open questions

- **LICENSE file?** A public take-home repo reads slightly more finished with one (MIT is a
  1-min add). Skipped by default unless you want it.

## Out of scope

- **Parallel multi-agent execution.** Excluded by the dependent-pipeline nature of the steps.
- **Required human review gates / multi-reviewer flows.** Excluded by the autonomous solo model.
- **Dependabot / CodeQL / advanced supply-chain scanning.** Overkill for a throwaway prototype.
- **Custom domain / production hosting / backend deploy.** The live demo is static GitHub Pages
  off `main`; the app stays frontend-only and keyless per the implementation plan.
