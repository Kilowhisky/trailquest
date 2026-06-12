# TrailQuest Docs Index

This folder contains the project context and agent handoff material for TrailQuest.

## Start here

Read these files before implementation work:

1. `CONTEXT.md` — what is being built and the MVP scope.
2. `DOMAIN-CONTEXT.md` — why this is relevant to onX and outdoor mapping.
3. `GENESIS.md` — backstory, brainstorming history, and project origin.
4. `DECISIONS.md` — product and architecture decision log.
5. `MEMORY.md` — persistent working memory for AI agents.
6. `CHAT-LOG.md` — chronological summaries of AI-agent sessions.
7. `ATTRIBUTION.md` — convention for AI-authored commit messages and repo notes.

## Important agent rule

When authoring commits, PR text, implementation notes, or repo messages, follow `ATTRIBUTION.md`.

Preferred pattern:

```text
<Agent/tool> with Chris input: <short imperative summary>
```

Examples:

```text
ChatGPT with Chris input: Initialize TrailQuest context docs
Claude Code with Chris input: Scaffold geospatial quest prototype
```

The purpose is to make the AI-assisted development process visible while acknowledging that the work is directed by Chris.
