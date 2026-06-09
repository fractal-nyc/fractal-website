# FRAC-45 — Add `.text-body-display` tier; migrate Home.tsx:35

**Task:** task_01KTN7XER7FSF0SAEHW1N0KCWE
**Branch:** frac-23-apply-home (bundled into PR #186 alongside FRAC-44)
**Origin:** FRAC-22 audit GAP at `Home.tsx:35` (Golden Age Protocol) + FRAC-23 local review (user likes the rendering and asked which utility applies).

## Plan

1. **`src/index.css`** — add `.text-body-display` to the `@layer components` typography block:
   ```css
   .text-body-display {
     @apply font-mono text-sm md:text-base uppercase font-thin leading-relaxed;
   }
   ```
   Comment explains: body-tier rendered as display chrome — used for editorial / manifesto / protocol prose where body-length passages carry the chrome tier's mono-uppercase identity but read as paragraphs (relaxed leading, responsive sizing). Distinguished from `.text-control` by weight (100 vs 400) and responsiveness.

2. **`DESIGN.md`** — add `.text-body-display` to the Semantic type scale section under a new "Body display tier" heading. Document rationale: editorial mono-uppercase prose pattern (Home Golden Age Protocol) was a FRAC-22 audit GAP because no canonical fit existed; FRAC-45 codifies it.

3. **`src/pages/Home.tsx:35`** — migrate the wrapper className:
   - Before: `font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin`
   - After: `text-body-display text-foreground/80 space-y-6`
   - Drop: font-mono, text-sm md:text-base, leading-relaxed, uppercase, font-thin (subsumed by `.text-body-display`)
   - Keep: text-foreground/80 (color), space-y-6 (layout)
   - Keep the inline `style={{ fontStyle: "normal" }}` defensive override (preserves current rendering exactly).

4. **`.lattice/notes/audit-gaps.md`** — append a resolution note to the Home protocol entry, citing FRAC-45 as the resolution. (audit-gaps.md is upstream on this branch via FRAC-22 PR #185.)

## Commit strategy

One commit on frac-23-apply-home: `FRAC-45: add .text-body-display tier + migrate Home.tsx:35 Golden Age Protocol`.

## Acceptance

- `.text-body-display` defined in `src/index.css` and documented in `DESIGN.md`.
- `Home.tsx:35` wrapper className uses `.text-body-display`.
- Visual rendering of Home Golden Age Protocol block is **pixel-identical** to pre-migration (the new utility encodes the exact same Tailwind primitives).
- `audit-gaps.md` Home entry marked resolved by FRAC-45.
- `pnpm typecheck && pnpm test` clean (baseline-only).
