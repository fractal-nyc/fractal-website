# fractal-nyc — Claude Code entry point

The rules for this repo are **tool-agnostic** and live in **[`AGENTS.md`](./AGENTS.md)** — the universal rulebook (repo structure, tech stack, commands, house rules, mobile-first, `DESIGN.md` conformance, safety rules, and the **Lattice** work-tracking protocol every change must follow).

Claude Code does not auto-load `AGENTS.md`, so it is imported here:

@AGENTS.md

Read on demand (not auto-loaded — open the section you need):

- **`DESIGN.md`** — the canonical design system. Read before any styling work.
- **`EDITING.md`** — copy → file map, for content edits.

## Claude-specific notes

Nothing Claude-only yet. Keep this section for genuinely Claude-specific gotchas (e.g. `@import` wiring, MCP/tool integration, permission preferences). Everything tool-agnostic belongs in `AGENTS.md` so Cursor, Copilot, Codex, and Gemini get it too.

> Note: `lattice setup-claude` would re-inject a Lattice block into this file. The Lattice protocol intentionally lives in `AGENTS.md` (it's agent-agnostic) — if you re-run that command, move the block back to `AGENTS.md` and keep this file as a thin pointer.
