# FRAC-198 — Repo docs for public editing

## Goal

Make the repo editable by anyone: a simplified DESIGN.md, plus new AGENTS.md, README.md, and EDITING.md modeled on the equivalents in `~/Dev/renoverse-ai-website` and the original `google-labs-code/design.md` template.

## Scope

1. **DESIGN.md (rewrite prose body, keep YAML frontmatter unchanged).** Follow the original template's canonical section order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's. Strip all FRAC-history references, drift/cream-math notes, the Linting Notes section, and "don't" framing — describe only what exists and the policies/utilities in force. Keep: surface + house token tables, the house id↔displayName↔slug mapping, the four canonical surface/text pairings, the forum/school page-bg inversion, the semantic type scale tables, layout rhythm, Mandelbrot/pennant motifs with the safe-padding table, component descriptions.
2. **AGENTS.md (new).** Modeled on renoverse AGENTS.md: read order (DESIGN.md = design source of truth, CLAUDE.md = Lattice workflow), sync discipline, house rules (tokens only, mobile-first 375px, reduced motion, semantic type utilities, house color scoping), DESIGN.md conformance + propagation rule (DESIGN.md YAML ↔ `src/index.css`), validation commands, design lint command with accepted-warnings note.
3. **README.md (new).** Modeled on renoverse README: what the site is, pages, "where to start" doc pointers, run locally (pnpm), structure tree, brand-system pointer.
4. **EDITING.md (new).** Modeled on renoverse EDITING.md: general workflow, quick-start prompt, full sitemap (page → section → file, from the Explore agent's copy map), example patterns (copy edit, houses.ts data edit, add a Lab publication, asset swap incl. banner-preload sync), troubleshooting. Preview via `pnpm dev`.

## Acceptance criteria

- DESIGN.md YAML frontmatter byte-identical to before; body follows template section order; no "don't"-framed guidance; no task-history references.
- All four docs cross-reference each other correctly and reference only files that exist.
- File paths in EDITING.md verified against `src/`.
- No fluff; each doc readable standalone by a non-expert.

## Execution note

Plan + implementation done in the orchestrator context (user provided fully-specified instructions + reference docs); independent review via fresh review sub-agent at the review gate.
