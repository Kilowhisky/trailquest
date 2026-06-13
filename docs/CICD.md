# CI/CD Runbook

How TrailQuest is built and shipped. The design rationale lives in
[`docs/specs/2026-06-12-cicd-pipeline-design.md`](specs/2026-06-12-cicd-pipeline-design.md) (decision
D-014); this is the operational summary.

## The pipeline

Implementation runs as a **serial PR train** — one pull request per build step, each in its own git
worktree branched off an updated `main`:

```text
worktree off main → implement → local pre-flight → push → open PR
   → request Copilot review → CI gate (required) → triage + fix → squash-merge
   → deploy to GitHub Pages → advance to next step
```

The steps are a dependent pipeline (each imports the previous), so the train is **serial, not parallel**.

## CI gate — `.github/workflows/ci.yml`

Runs on every pull request to `main` and on pushes to `main`. **This is the required merge gate.**

```text
npm ci → npm run typecheck → npm run lint → npm run test:run → npm run build
```

Node 20, npm cache, ~25 s. Branch protection on `main` requires this check; there are no required human
approvals (a self-authored autonomous loop can't satisfy one), and `enforce_admins` is off so the loop
can merge once CI is green.

## Live demo — `.github/workflows/deploy.yml`

Runs on push to `main` (i.e. after each merge):

```text
npm ci → typecheck/lint/test → vite build → upload dist/ → actions/deploy-pages
```

Pages source = "GitHub Actions". Vite `base: '/trailquest/'` (build only) so assets resolve at the
project subpath.

→ **<https://kilowhisky.github.io/trailquest/>**

The deploy re-runs the full verify before building, so `main` can never publish a build that wouldn't
pass CI — even independent of branch protection.

## Code review

GitHub **Copilot** is requested on every PR (`gh api … /requested_reviewers`) and waited on; its comments
are **advisory** — each is triaged, real ones fixed with a follow-up commit (which re-triggers CI), and a
reply is recorded on the comment. It does not block the merge. For the highest-risk pure logic, Claude
additionally ran adversarial multi-agent verification workflows before opening the PR (see `docs/AI_USAGE.md`).

## One-time setup (already done)

- `gh auth login` (account `Kilowhisky`, `repo` + `workflow` scopes, admin).
- Repo made **public** (unlocks free branch protection, Copilot review, and Pages); description + topics;
  secret scanning + push protection.
- Pages enabled in "GitHub Actions" mode; branch protection requiring the CI check.

## Local commands

```bash
npm run dev          # Vite dev server (base '/')
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm test             # vitest (watch)  ·  npm run test:run (once)
npm run build        # vite build (base '/trailquest/')
```

## Known caveats

- **Step 1 is special:** the workflows, ESLint config, `.gitignore`, and the Vite `base` are *created* in
  the scaffold PR, so that first PR introduces the gate rather than passing through it.
- **`npm audit`** reports a dev-only `esbuild` advisory pulled in by vite/vitest; it never ships to the
  browser and the only fix is a breaking vite-8 bump. Accepted; CI does not run `audit`.
