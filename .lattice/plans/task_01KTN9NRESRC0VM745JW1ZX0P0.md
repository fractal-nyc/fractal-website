# FRAC-47 — Add `.text-aside` utility; apply quote/aside rule to Campus

**Task:** task_01KTN9NRESRC0VM745JW1ZX0P0 (displayed locally as FRAC-45 due to branch-behind-master lattice ID drift)
**Branch:** frac-25-apply-campus (bundled into PR #188)
**Origin:** FRAC-25 review — user established the two-rule system: **quotes → `.text-subtitle`** (visual contrast via display font); **asides/bylines/role labels/footer notes → `.text-aside`** (italic Inter editorial voice). No new `.text-pull-quote` utility — just use `.text-subtitle` directly on quoted content.

## Plan

### 1. Add `.text-aside` to `src/index.css`

```css
/* Aside tier — italic Inter weight 400 normal-case text-base leading-relaxed.
   The canonical home for editorial italic voice: bylines, attributions,
   role labels, parenthetical asides, P.S. footer notes. Distinguished from
   .text-body by italic. FRAC-47. */
.text-aside {
  @apply font-sans text-base leading-relaxed;
  font-style: italic;
  font-weight: 400;
  text-transform: none;
}
```

Insert in `@layer utilities` next to the other body tier utilities (after `.text-body-lead`).

### 2. Add `.text-aside` row to DESIGN.md typography section

Under "Body tier" (or as its own small section). Document the rule: editorial italic voice for bylines, attributions, role labels, asides, P.S. notes.

### 3. Migrate quote passages to `.text-subtitle`

| Site | Line | Before | After |
|---|---|---|---|
| Andrew Rose anecdote wrapper | 354 | `space-y-6 text-body text-house-campus-light-foreground/90 leading-relaxed max-w-3xl` | `space-y-6 text-subtitle text-house-campus-light-foreground/90 leading-relaxed max-w-3xl` |
| Jake Zegil anecdote wrapper | 403 | `space-y-6 text-body text-house-campus-light-foreground/90 leading-relaxed max-w-3xl` | `space-y-6 text-subtitle text-house-campus-light-foreground/90 leading-relaxed max-w-3xl` |
| Nietzsche pull quote text | 500 | `text-subtitle italic text-house-campus-light-foreground/90 leading-relaxed normal-case` | `text-subtitle text-house-campus-light-foreground/90 leading-relaxed normal-case` (drop dead `italic` modifier — was overridden by `.text-subtitle`'s `font-style: normal` anyway) |

### 4. Migrate italic asides/bylines/role labels/footer to `.text-aside`

| Site | Line | Before | After |
|---|---|---|---|
| "Want a reduced rate?" | 218 | `text-xs md:text-sm text-house-campus-light-foreground/70 italic text-center` | `text-aside text-xs md:text-sm text-house-campus-light-foreground/70 text-center` |
| Andrew Rose byline | 367 | `text-house-campus-light-foreground/70 italic` | `text-aside text-house-campus-light-foreground/70` |
| Jake Zegil byline | 419 | `text-house-campus-light-foreground/70 italic` | `text-aside text-house-campus-light-foreground/70` |
| Event host CTA | 453 | `mt-4 text-sm md:text-base text-house-campus-light-foreground/70 italic font-light leading-relaxed max-w-3xl` | `mt-4 text-aside text-house-campus-light-foreground/70 max-w-3xl` (drop redundant `text-sm md:text-base`, `font-light`, `leading-relaxed` — all subsumed by `.text-aside`) |
| Nietzsche byline (Friedrich Nietzsche) | 503 | `mt-3 text-body text-house-campus-light-foreground/70` | `mt-3 text-aside text-house-campus-light-foreground/70` |
| PamPam map line | 507 | `text-body text-house-campus-light-foreground/90 leading-relaxed max-w-3xl` | `text-aside text-house-campus-light-foreground/90 max-w-3xl` |
| Bio role labels | 532 | `text-sm text-house-campus-light-foreground/70 italic` | `text-aside text-sm text-house-campus-light-foreground/70` |
| P.S. footer | 570 | `text-body text-house-campus-light-foreground/70 font-light leading-relaxed max-w-3xl` | `text-aside text-house-campus-light-foreground/70 max-w-3xl` |

## Acceptance

- `.text-aside` defined in `src/index.css` and documented in `DESIGN.md`.
- All 8 aside sites use `.text-aside`.
- Andrew Rose + Jake Zegil quote text wrappers use `.text-subtitle`.
- Nietzsche pull quote no longer carries the dead `italic` modifier.
- All bylines render italic at text-base (consistent: Nietzsche, Andrew, Jake).
- P.S. and PamPam render italic at text-base (editorial closing voice).
- Bio role labels and "Want a reduced rate?" render italic at smaller sizes via overrides.
- Quote passages (Andrew Rose anecdote, Jake Zegil anecdote, Nietzsche) render at subtitle size (text-xl md:text-2xl, upright Fraunces) — large visible delta vs current body rendering.
- typecheck + tests baseline-only.

## Test plan

After each commit, refresh /campus at 375px:
- Andrew Rose 3 paragraphs render large Fraunces upright (was small Inter)
- Jake Zegil paragraphs render large Fraunces upright
- Nietzsche pull quote text renders large Fraunces upright (no visible change vs current — italic was already overridden)
- All bylines render italic Inter at body size
- P.S. renders italic Inter at body size
- PamPam line renders italic Inter at body size
- Bio role labels render italic Inter at text-sm
- "Want a reduced rate?" renders italic Inter at text-xs/text-sm
- No layout regression on the bio grid (larger byline shouldn't break the 3-column layout at md+)
