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

## Scope

Use this convention for:

- commit messages
- PR titles and descriptions
- generated implementation notes
- agent-authored planning summaries
- major documentation updates

Do not overdo it inside normal application copy, UI labels, or every small code comment.
