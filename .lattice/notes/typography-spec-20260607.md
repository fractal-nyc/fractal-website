# Typography Semantic Scale — Locked Spec (2026-06-07)

This is the source-of-truth spec for the typography overhaul tasks. Each related Lattice task references this doc. Planning sub-agents in fresh worktrees should read this in full before touching code.

## Decisions

1. **Body family = Inter.** Per FRAC-44 (already shipped on master). DESIGN.md gets the explicit "body is Inter" callout.
2. **Body case = `normal-case` by default.** Flip the global `body { text-transform: uppercase }` rule in `src/index.css`. Uppercase becomes opt-in on eyebrow / label / meta / button. Removes ~37 redundant `normal-case` opt-outs across the codebase.
3. **Subtitle = lighter sibling of title.** Same Fraunces italic uppercase family, smaller size, lighter weight. Not a different font.
4. **Size scale = Tailwind-aligned.** Each semantic gets one Tailwind size (`text-sm`, `text-base`, etc.). No arbitrary `text-[…]` sizes for semantic categories. Display tier may use `text-7xl` etc. or `clamp()` for fluid hero sizing — that's a per-utility decision.
5. **Button = two sizes.** `default` + `sm`. Both Mono uppercase tracking-widest, different padding + text size.
6. **Eyebrow / label / meta = three names, identical rendering today.** Distinct semantic vocabulary, single visual treatment. Diverge later if needed.
7. **Delivery = Tailwind utility classes.** No React component wrappers. Use `.text-display`, `.text-eyebrow` etc. The existing `.display-roman` utility in DESIGN.md is the precedent.

## The 8 utilities

### Display tier (Fraunces)

| Utility | Family | Style | Size | Notes |
|---|---|---|---|---|
| `.text-display` | Fraunces | upright (`font-style: normal`), `font-weight: 300`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `line-height: 1.1` | `text-5xl md:text-7xl` | Hero text. Replaces ~15 inline-style sites. Encodes the "display-roman" pattern. |
| `.text-title` | Fraunces | italic, uppercase, `letter-spacing: 0.04em` (inherited from global h-rule) | `text-3xl md:text-5xl` | Section title. The `h1`/`h2` voice. Picks one canonical size. |
| `.text-subtitle` | Fraunces | italic, uppercase, `font-weight: 300`, `letter-spacing: 0.04em` | `text-xl md:text-2xl` | Smaller, lighter sibling of title. The `h3` voice. |

### Body tier (Inter, normal-case)

| Utility | Family | Style | Size |
|---|---|---|---|
| `.text-body` | Inter | `font-weight: 400`, `text-transform: none` | `text-base` |
| `.text-body-lead` | Inter | `font-weight: 300`, `text-transform: none`, `line-height: 1.7` (relaxed) | `text-lg` |

### Chrome tier (Mono, single size for now)

| Utility | Family | Style | Size |
|---|---|---|---|
| `.text-eyebrow` | JetBrains Mono | `text-transform: uppercase`, `font-weight: 500`, `letter-spacing: 0.1em` (widest) | `text-sm` |
| `.text-label` | JetBrains Mono | identical to eyebrow | `text-sm` |
| `.text-meta` | JetBrains Mono | identical to eyebrow | `text-sm` |

Semantic distinction:
- **`text-eyebrow`** — small uppercase mono label sitting above a title ("ISSUE 02 / CAMPUS").
- **`text-label`** — form labels, input labels, UI labels.
- **`text-meta`** — metadata, timestamps, attribution, footer credits, dates, tags.

All three render identically. The naming reserves the option to diverge later.

## Button (component, not utility)

Two sizes on the existing `Button` component in `src/components/ui/button.tsx`:

| Variant | Padding | Text |
|---|---|---|
| `default` | `px-8 py-5` | `text-sm tracking-widest uppercase font-medium` |
| `sm` | `px-4 py-2.5` | `text-xs tracking-widest uppercase font-medium` |

All buttons across the site should go through `<Button>`. The 7+ "fake button" `<a>` patterns (`border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10` + `CornerDecorations`) get migrated.

### Text containment (must verify during FRAC-53)

Button text must never extend past the button container. Observed in the wild on at least 2 sites (specifics TBD by the FRAC-53 planning agent — sweep every CTA at 375px mobile baseline + common desktop widths).

Fix path depends on cause:
- **Long label, narrow container** — `min-width` on Button so it grows with content, or shrink the label, or allow wrap with `whitespace-normal` + adjusted line-height. Don't truncate with ellipsis — the labels are short and ellipsis is the wrong voice for editorial chrome.
- **Container `max-w-xs` too tight** — widen the container, not the button.
- **`px-8` swallowing the text** — reduce horizontal padding on `sm` variant if labels routinely overflow.

Mobile 375px is the primary check viewport per project mobile-first convention.

## Special (unchanged)

- **Wordmark** — Jacquard 24 inline-styled (Navbar). Per-surface `clamp()` sizing. Stays inline.
- **Monogram** — Jacquard 24 inline-styled (HouseBanner). Per-surface sized. Stays inline.

## Global CSS changes

In `src/index.css`:

1. **Flip body case.** `body { text-transform: uppercase }` → remove or change to `body { text-transform: none }`. (Confirm exact line; per audit, line ~84.)
2. **Add utilities** in a new `@layer components` block (or wherever `.display-roman` lives).
3. **Update `.display-roman`** — may be supplanted by `.text-display`. Decide whether to keep both, alias, or deprecate `.display-roman` in favor of `.text-display`. Recommendation: keep `.display-roman` as a low-level escape hatch (opt out of italic only) and add `.text-display` as the semantic preset (sets family + size + weight + case).

## DESIGN.md updates

The typography section currently documents only `font-sans` and `font-mono` as tokens. Add:

- A "Semantic type scale" subsection enumerating the 8 utilities + 2 button variants.
- Update the "Why no `headline-lg` / `body-md` tokens?" subsection — that justification no longer applies; replace with the scale.
- Note that the global `body { text-transform: uppercase }` is removed.
- Refresh the `typography:` YAML key — likely no change (the family-family tokens still suffice; the size scale isn't modelable in `@google/design.md` schema), but document that explicitly.

## Migration order (PRs)

1. **Foundation** (this spec → code) — adds utilities, flips body case, updates DESIGN.md, adds Button `sm` variant. Blocks everything below.
2. **Hero display migration** — 15+ inline-style hero overrides → `.text-display`.
3. **Button consolidation** — 7+ fake-button `<a>` sites → `<Button>` component.
4. **Eyebrow normalization** — collapse `text-xs`/`text-sm` and `font-semibold`/`font-thin`/unlabeled drift into canonical `.text-eyebrow` / `.text-label` / `.text-meta`.
5. **Heading normalization** — reassign every `<h1>`–`<h6>` to `.text-title` or `.text-subtitle`. Per-site judgment.
6. **Body cleanup** — remove the 37 now-redundant `normal-case` opt-outs; adopt `.text-body` / `.text-body-lead` where appropriate.

Tasks 2–6 each `depends_on` task 1. Within 2–6 there are no inter-dependencies; they can land in any order or in parallel after foundation lands.

## Audit reference

Full pre-migration audit: see `afeda428b3f2ab717` task output (orchestrator's session 2026-06-07). Key numbers:

- 124 `text-sm`, 34 `text-xs`, 31 `text-base` instances in `src/`.
- 47 `font-serif`, 18 inline Jacquard 24, 15 inline Fraunces overrides.
- 17 `tracking-widest` sites for the eyebrow/button pattern.
- 37 explicit `normal-case` opt-outs.
- 0 uses of `.display-roman` despite being documented.
- 7+ pages duplicate the "fake button" pattern.
