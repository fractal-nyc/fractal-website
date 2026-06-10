# FRAC-176: New Liberal Arts heading — ENTREPRENEURSHIP clips at 375px

## Problem

On `/new-liberal-arts` mobile, the display heading is `Tech, Entrepreneurship, Rhetoric, Civics`. Post-FRAC-62, `.text-display` on mobile is `text-4xl` (36px) with `letter-spacing: 0.04em`, uppercase italic Fraunces. The word ENTREPRENEURSHIP is 16 characters — at 36px Fraunces uppercase with 0.04em tracking it renders ~338px wide, exceeding the 327px usable area inside `px-6` gutters at 375px viewport. It wraps onto its own line and clips off the right edge by ~11px.

## Why page-specific override, not global tier change

The FRAC-62 plan explicitly chose `text-4xl` (36px) over `text-3xl` (30px) to preserve the display→title hierarchy step at mobile (36→30, mirroring desktop 72→48). Dropping the global display tier further collapses that step.

ENTREPRENEURSHIP is uniquely long for a display heading on this site — no other display heading approaches that length. A targeted override on just this element fixes the clipping without touching the global tier.

## Fix

`src/components/sections/LiberalArts.tsx` line 11, change the heading className:

- Before: `text-display mb-4 md:mb-6 text-center`
- After:  `text-display max-md:text-3xl mb-4 md:mb-6 text-center`

`max-md:text-3xl` overrides the display utility's mobile step (text-4xl = 36px) down to text-3xl (30px) only below the `md` breakpoint. Desktop stays untouched at text-7xl. At 30px ENTREPRENEURSHIP is ~282px wide — fits comfortably in the 327px usable area.

## Acceptance

- At **375px**: ENTREPRENEURSHIP fits on its line, no clipping at the right edge.
- At **320px**: still fits (282 < 272+gutters — close, but Fraunces italic uppercase at 30px should still fit; verify in browser).
- At **≥768px (md and up)**: heading renders at `text-7xl` (72px) — unchanged from current.
- No regressions to other display headings on other pages (the override is scoped to this element only).

## Key files

- `src/components/sections/LiberalArts.tsx` only.

## Out of scope

- Global `.text-display` tier sizing — preserved as FRAC-62 set it.
- Other display headings on other pages.
- Copy changes to the heading.

## Branch / PR

- Branch: `frac-176-liberal-arts-heading-mobile-fit`
- PR title: "FRAC-176: shrink Liberal Arts mobile display heading to fit ENTREPRENEURSHIP"

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Review Cycle 2 Findings (specificity issue — max-md:text-3xl doesn't win)

User confirmed on deploy preview: ENTREPRENEURSHIP still clips at 375px even with `max-md:text-3xl` added. DevTools shows the heading's container is 327×158px (matches the px-6 math) and the text overflows the right edge.

**Root cause:** `.text-display` is defined in `src/index.css` with `@apply font-serif text-4xl md:text-7xl` — the text-4xl utility (`font-size: 2.25rem`) gets baked into the `.text-display` rule. Both `.text-display` and `.max-md:text-3xl` are equal-specificity single-class selectors. CSS source order decides. Tailwind generates custom utilities (`.text-display`) AFTER built-in responsive utilities (`.max-md:text-3xl`), so `.text-display` wins. ClassName order in HTML doesn't affect CSS specificity. Same pattern as FRAC-174 cycle 3.

**Fix:** drop `text-display` on this one element and inline its style rules with raw utilities — no `.text-display` to fight with. The full set of styles `.text-display` provides:

```css
.text-display {
    @apply font-serif text-4xl md:text-7xl;
    font-style: normal;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.1;
}
```

Replicate with raw utilities at the smaller mobile size:
- `font-serif` (family)
- `not-italic` (font-style: normal — Fraunces project default is italic, this overrides)
- `font-light` (weight 300)
- `text-3xl md:text-7xl` (30px mobile, 72px desktop — the smaller mobile is the actual fix)
- `tracking-[0.04em]` (letter-spacing)
- `uppercase` (text-transform)
- `leading-[1.1]` (line-height)

Concrete change in `src/components/sections/LiberalArts.tsx` line 11 (after cycle 1):
- Before: `text-display max-md:text-3xl mb-4 md:mb-6 text-center`
- After:  `font-serif not-italic font-light text-3xl md:text-7xl tracking-[0.04em] uppercase leading-[1.1] mb-4 md:mb-6 text-center`

At 30px Fraunces upright weight 300 with 0.04em tracking, ENTREPRENEURSHIP is ~258px wide — fits in 327px with margin.
