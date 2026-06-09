# FRAC-46 — Drop global h1-h6 uppercase rule; codify case on `.text-title` and `.text-subtitle`

**Task:** task_01KTN8RBKBW8SWEP2BS6BQM6K4 (displayed locally as FRAC-44 due to branch-behind-master lattice ID drift; true FRAC index assigned at merge)
**Branch:** frac-25-apply-campus (bundled into PR #188)
**Origin:** FRAC-25 local review — user found 3 `<h2 className="text-title">` sites in Campus.tsx rendering UPPERCASE (Meet the Space L383, Events L435, Build with us. L518) while the other 9 sites have explicit `normal-case` modifiers. Root cause: `.text-title` doesn't pin text-transform, so the global `h1, h2, h3, h4, h5, h6 { text-transform: uppercase }` rule wins by cascade.

## Problem statement

The current typography system relies on call sites adding `normal-case` to every `.text-title` or `.text-subtitle` element on an h-tag, because the global h1-h6 rule sets uppercase. This is wrong: the utility doesn't behave like its DESIGN.md spec ("mixed-case") and forces per-site modifier discipline that 3 sites in Campus.tsx (and likely others sitewide) fail at silently.

## Decision

**Surgical fix:** keep the h-tag global rule for its useful properties (Fraunces, italic, tracking — sensible defaults for bare h-tags) but drop the uppercase aspect. Then add `text-transform: none` to `.text-title` and `.text-subtitle` as belt-and-suspenders + self-documenting.

## Plan

1. **`src/index.css`** — remove `text-transform: uppercase;` from the global `h1, h2, h3, h4, h5, h6 { ... }` block. Keep the rest (font-serif, italic, tracking).
2. **`src/index.css`** — add `text-transform: none;` to both `.text-title` and `.text-subtitle` utility rules.
3. **`DESIGN.md`** — minor wording update under "Semantic type scale" to confirm `.text-title` and `.text-subtitle` render mixed-case by default; cite FRAC-46.
4. Do NOT clean up redundant `normal-case` modifiers from call sites in this PR — too much surface area (would touch Lab, Home, Campus, Story, etc.). Track as follow-up. Existing `normal-case` becomes harmless redundancy.

## Acceptance

- Global h1-h6 rule retains font-serif, italic, tracking; loses uppercase.
- `.text-title` and `.text-subtitle` set `text-transform: none` explicitly.
- 3 outlier Campus.tsx sites (Meet the Space, Events, Build with us.) render mixed-case automatically.
- Existing `.text-display`, `.text-eyebrow`, `.text-label`, `.text-meta`, `.text-control`, `.text-body-display` continue to render uppercase (they set it explicitly).
- Bare `<h2>` (without typography utility) still renders italic Fraunces, just not uppercase.
- typecheck + tests baseline-only.
- DESIGN.md updated.
