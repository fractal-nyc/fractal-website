# Fractal NYC — Agent Protocol

You are working on the Fractal NYC community site. Read the following docs in this order at the start of every session:

1. **`DESIGN.md`** — the canonical design system. Tokens (YAML frontmatter), color and type rules, layout rhythm, shape motifs, component specs, do's. All styling decisions trace back here.
2. **`CLAUDE.md`** — the work-tracking protocol. This repo uses Lattice (`.lattice/`); every piece of work that produces commits gets a tracked task, a branch, and a PR per the lifecycle described there.

For content edits (copy, data, assets), `EDITING.md` maps every piece of visible copy to the file that holds it.

---

## Sync discipline

- **Start of session:** `git fetch && git status` to confirm local `master` is in sync with `origin/master`. If behind, `git pull` before doing anything else.
- **After a PR merges:** `git checkout master && git pull` so the next change starts from the merged state. Don't continue working on the merged feature branch.
- **Shared worktree:** multiple agents may work in this repo concurrently. If you encounter changes you didn't make, investigate (`git log`, `lattice list`) before touching them — never revert work you can't attribute.

## House rules

- **Mobile-first, 375px baseline.** Every component is designed at phone width first; wider viewports are progressive enhancement. Tests include mobile viewport assertions.
- **Tokens and semantic utilities only.** Reach for the surface tokens, house tokens, and semantic type utilities defined in `DESIGN.md` rather than raw hex / font / size values. Flag any raw value you have to introduce.
- **House colors stay in their house.** Each house's `{light, deep}` pair themes that house's own pages, banner, and avatar — per the scoping rules in `DESIGN.md` § Colors.
- **Pair surfaces and text explicitly.** Every surface sets its text color on the same node, per the four canonical pairings in `DESIGN.md` § Colors.
- **Reduced motion.** Every animation is gated by `usePrefersReducedMotion()` or `@media (prefers-reduced-motion: reduce)`.
- **Copy and data live in their source-of-truth files.** House names, taglines, descriptions, palettes, and people: `src/data/houses.ts`. Publications archive: `src/data/publications-documents.ts`. Story gallery: `src/data/storyPhotos.ts`.

## DESIGN.md conformance

`DESIGN.md` is the source of truth for the design system. The runtime mirrors are `src/index.css` (CSS token variables, global type rules, semantic utilities) and `src/data/houses.ts` (house palettes).

- **Default: conform the change.** If a value in a code change drifts from `DESIGN.md`, fix the change to match.
- Updating `DESIGN.md` *instead of* the change requires **explicit operator approval**. Surface it clearly: *"This change diverges from `DESIGN.md`. I recommend updating [section] to reflect [X] — approve?"* Never silently update `DESIGN.md`.
- **Token edits propagate in the same session.** When a token value changes in `DESIGN.md` YAML, update the matching declaration in `src/index.css` (and `src/data/houses.ts` for house palettes) and commit them together.
- Lint the spec with `npx @google/design.md@0.2.0 lint DESIGN.md` (version pinned deliberately). The remaining warnings are accepted: the spec can't model translucent fills or house tokens swapped at runtime, so those report as contrast / orphaned-token warnings.

## Validation

Before opening a PR:

```sh
pnpm typecheck
pnpm test
pnpm build
```

## Task closeout

Work tracking, branching, review gates, and PR conventions are defined in `CLAUDE.md` (Lattice). Follow-ups discovered during a session become Lattice tasks, not TODO comments.
