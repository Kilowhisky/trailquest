# AI Attribution Convention

This project is intentionally AI-assisted. Commit messages, PR descriptions, implementation notes, and agent-authored repo messages should make that visible.

## Rule

When an AI agent authors or substantially drafts a repo message, it should identify the AI/tool and acknowledge Chris's input or direction.

## Preferred commit message pattern

```text
<Agent/tool> with Chris input: <short imperative summary>
```

## Examples

```text
ChatGPT with Chris input: Initialize TrailQuest context docs
Claude Code with Chris input: Scaffold geospatial quest prototype
Claude Code with Chris input: Add simulated check-in scoring
```

## Why

This keeps the AI-assisted process transparent while making clear that the agent is operating under human direction.

## Relationship to the tooling footer

This human-readable prefix is the **preferred** convention, not a hard gate — some commits in the history
are plain imperative summaries, and that is fine. It also coexists with any machine-readable trailer the
coding harness appends (e.g. a `Co-Authored-By:` line); the two are complementary — the prefix states the
human direction, the trailer records the tool. Neither replaces the other.

> Not to be confused with `docs/DATA-SOURCES.md` (created at implementation), which attributes the **data**
> sources (OSM / BLM / UGRC / USGS / Esri). This file is only about **commit-message / repo-note** authorship.

## Scope

Use this convention for:

- commit messages
- PR titles and descriptions
- generated implementation notes
- agent-authored planning summaries
- major documentation updates

Do not overdo it inside normal application copy, UI labels, or every small code comment.
