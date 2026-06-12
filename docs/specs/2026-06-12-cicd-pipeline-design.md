# CI/CD Pipeline — Design Spec

**Date:** 2026-06-12
**Status:** Approved (brainstorm) — pending implementation-plan integration
**Related:** [IMPLEMENTATION-PLAN.md](../plans/IMPLEMENTATION-PLAN.md) · [DECISIONS.md](../DECISIONS.md) · [README.md](../../README.md)

## Summary

A continuous-integration / delivery process for building TrailQuest. Each of the seven
timeboxed build steps in the [implementation plan](../plans/IMPLEMENTATION-PLAN.md) is
implemented on its **own branch in its own git worktree**, opened as a **pull request**,
gated by a **GitHub Actions CI check** (typecheck · lint · test · build), reviewed by
**GitHub Copilot**, and **squash-merged to `main`** — driven as a **fully autonomous loop**
that pauses only on a real blocker.

The process is deliberately visible because the onX take-home is judged on "a clear
AI-assisted engineering process" ([README](../../README.md)), so the PR/review/merge trail
is part of the deliverable, not just overhead.

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

## Decisions (resolved via brainstorm)

| Question | Decision |
| --- | --- |
| PR granularity | **One PR per build step** (~7) — maximal, visible engineering trail |
| Control model | **Fully autonomous loop** — I drive worktree → PR → Copilot → merge end-to-end, pausing only on a real blocker |
| Repo visibility | **Public** — unlocks free branch protection + Copilot review; matches "deliverable is a public GitHub repo" |
| Merge gate | **CI status check** (required); Copilot review requested + waited-on but **not** a required approval |
| Human approvals | **Not required** on `main` — a required-approval rule would deadlock self-authored autonomous merges |
| Merge style | **Squash + delete branch** |

## One-time setup (before any implementation)

Ordered, because the CI workflow references npm scripts that do not exist until the scaffold
step creates them.

1. **`gh auth login`** — interactive; the user completes the browser/device flow. Hard
   prerequisite for everything else.
2. **Make the repo public** — `gh repo edit Kilowhisky/trailquest --visibility public`.
3. **Push current `main`** — the local commits (through `57affde`) are not yet on the remote.
4. **Bootstrap CI inside the scaffold PR (step 1), not before.** `ci.yml` references
   `npm run lint/test/build`, which require `package.json`. So step 1's PR introduces
   `.github/workflows/ci.yml` + ESLint config **alongside** `package.json`. This is the one
   PR where CI is being *introduced* rather than gating; every PR after it is fully gated.
5. **After step 1 merges**, enable **branch protection** requiring the now-existing CI check,
   and enable **Copilot automatic review**.

### Copilot automatic review — mechanism + fallback

Preferred: a **repository ruleset** (or the repo "Code review by Copilot" setting) that
requests Copilot on every PR to `main`. Fallback if that path isn't available on the account:
**request the Copilot reviewer per-PR via `gh api`** (`POST /repos/{owner}/{repo}/pulls/{n}/requested_reviewers`).
Which mechanism is available is verified immediately after `gh auth` during setup; the loop
uses whichever works.

## The CI gate — `.github/workflows/ci.yml`

Runs on every `pull_request` targeting `main`. **This is the real merge gate.**

- `tsc --noEmit` — typecheck
- `eslint .` — lint
- `vitest run` — the geo + scoring + smoke tests the plan already specifies
- `vite build` — proves it actually builds

Node 20, `npm ci`, dependency cache. Target < 2 min so the autonomous loop isn't
bottlenecked on round-trips.

## Branch protection posture

Deliberately tuned for an autonomous **solo** loop:

- ✅ Require the **CI status check** to pass before merge.
- ✅ Require the branch to be **up to date** with `main` before merge.
- ❌ **Do not require human approvals.** GitHub forbids an author approving their own PR, so a
  required-approval rule would deadlock autonomous merges.
- Copilot review is **requested and waited-on**, but is **not** a required (blocking) approval —
  it comments rather than approves.

Net guarantee: everything on `main` passed CI, and that guarantee is visible and enforced —
without stalling the loop.

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

- **Rails:** `gh` authenticated; repo public + pushed; `.github/workflows/ci.yml`; ESLint
  config; branch protection on `main`; Copilot automatic review; and a short **`docs/CICD.md`**
  runbook documenting this loop (which doubles as evidence of the AI-assisted process for
  reviewers).
- Then the **7-step autonomous PR train** runs the actual TrailQuest implementation through it.

## Honest caveats

- **Step 1 is special.** The lint/build configs and CI workflow are *created* in the scaffold
  PR, so that first PR introduces the gate rather than passing through it. Unavoidable
  chicken-and-egg; called out so it isn't mistaken for a gap.
- **Process cost is real.** A 7-PR autonomous train on a 1–2 hr prototype spends meaningful
  wall-clock on review round-trips. The payoff is precisely the visible engineering trail onX
  said it evaluates — accepted on purpose, not overlooked.

## Out of scope

- **Deployment / hosting.** This is "CD" only in the sense of continuous delivery to `main`;
  the prototype is frontend-only and run locally (`npm run dev`) per the implementation plan.
  No GitHub Pages / Vercel / Netlify pipeline in this pass (can be a later add).
- **Parallel multi-agent execution.** Excluded by the dependent-pipeline nature of the steps.
- **Required human review gates / multi-reviewer flows.** Excluded by the autonomous solo model.
