# FRAC-51 Implementation Plan: Typography Foundation

## Summary

Add 8 semantic typography utility classes to `src/index.css` under `@layer utilities` (alongside the existing `.display-roman`), flip the global `body { text-transform: uppercase }` to remove the implicit uppercase default so uppercase becomes opt-in, confirm/tighten the Button `default` and `sm` size variants (both need `font-medium`; `sm` needs `py-2` → `py-2.5`), and replace the "Why no `headline-lg` / `body-md` tokens?" subsection in `DESIGN.md` with a new "Semantic type scale" subsection enumerating the 8 utilities + 2 button variants. Body family (Inter) is already shipped per FRAC-44; no font-import or `@theme` changes needed.

## PRD alignment check

The PRD's `Look & Feel` (line 84) names the *original* brief's font stack ("Space Grotesk (body), Space Mono (labels/nav), Instrument Serif (logo)") — historical, superseded by the shipped Inter / JetBrains Mono / Fraunces / Jacquard stack (codified in `DESIGN.md` Typography section and FRAC-44). The PRD does not specify case rules, a size scale, or button variants, so it imposes no constraint that contradicts the locked FRAC-51 spec. Mobile-first respected: every utility uses a `text-base` / `text-sm` / `text-xs` mobile size and adds a `md:` enhancement only where the spec calls for one. No PRD discrepancy to flag.

## Verified assumptions

- `src/index.css` has both `@layer base` (lines 77–106) and `@layer utilities` (lines 109–172). The 8 new utilities go in `@layer utilities`, grouped next to `.display-roman` (line 143).
- The global body uppercase rule is at `src/index.css:84` exactly as the spec predicted.
- Button **already has a `sm` size variant** at `src/components/ui/button.tsx:59`: `sm: "px-4 py-2 text-xs"`. Locked spec wants `px-4 py-2.5 text-xs tracking-widest uppercase font-medium`. `tracking-widest uppercase` is already inherited from the shared base string (line 36). `font-medium` and `py-2.5` are the two deltas.
- The `default` Button size also lacks `font-medium`.
- Fonts (Inter / Fraunces / JetBrains Mono) are imported at `src/index.css:1` and aliased to `--font-sans` / `--font-serif` / `--font-mono` at lines 6–8. No font work needed.
- `.display-roman` is currently `font-weight: 300; text-transform: uppercase; font-style: normal;` (lines 143–147). Per the spec, **keep** it as the low-level primitive; `.text-display` becomes the semantic preset that includes letter-spacing, line-height, and `font-serif` family.

## File changes

### 1. `src/index.css`

**Edit 1 — line 84:** Remove the line `text-transform: uppercase;` from the `body` rule. The surrounding `@apply` and background-image stay intact.

**Edit 2 — within `@layer utilities`, immediately after `.display-roman` (around line 148):** Add the 8 semantic utilities verbatim:

```css
/* ───────────────────────────────────────────────────────────────────────
   FRAC-51: Semantic typography scale.
   8 utilities + Button (default | sm) form the locked type system.
   .display-roman (above) is preserved as the low-level escape hatch:
   it sets only font-style/weight/transform. .text-display is the
   semantic preset that bundles family, size, tracking, and leading.
   See DESIGN.md → "Semantic type scale".
   ─────────────────────────────────────────────────────────────────── */

/* Display tier (Fraunces) */
.text-display {
  @apply font-serif text-5xl md:text-7xl;
  font-style: normal;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
}

.text-title {
  @apply font-serif text-3xl md:text-5xl;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.text-subtitle {
  @apply font-serif text-xl md:text-2xl;
  font-style: italic;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Body tier (Inter, normal-case) */
.text-body {
  @apply font-sans text-base;
  font-weight: 400;
  text-transform: none;
}

.text-body-lead {
  @apply font-sans text-lg;
  font-weight: 300;
  text-transform: none;
  line-height: 1.7;
}

/* Chrome tier (JetBrains Mono, uppercase, widest tracking) */
.text-eyebrow,
.text-label,
.text-meta {
  @apply font-mono text-sm;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

Implementation notes:
- `.text-eyebrow / .text-label / .text-meta` share a single selector list rather than three duplicated blocks. The spec calls them "identical rendering today"; deduplicating now keeps them locked in step.
- `.text-display` overrides the global `.font-serif` italic rule by explicitly setting `font-style: normal` (same escape-hatch trick `.display-roman` uses).
- `text-transform: none` on body utilities is redundant after the body flip but kept explicit for defense against future ancestor rules.

### 2. `src/components/ui/button.tsx`

Two minimal edits to the size class strings:

- **Line 58:** `default: "px-8 py-5 text-sm"` → `default: "px-8 py-5 text-sm font-medium"`
- **Line 59:** `sm: "px-4 py-2 text-xs"` → `sm: "px-4 py-2.5 text-xs font-medium"`

(`tracking-widest` and `uppercase` are inherited from the shared base on line 36 for both sizes — no change needed there.)

No other Button changes. The corner-skip logic at line 109 already excludes `sm`.

### 3. `DESIGN.md`

#### Change A — Replace the body-uppercase paragraph in `### Global type rules` (around line 201)

Replace:
> `body` has `text-transform: uppercase` applied globally (`src/index.css:84`). All body copy renders uppercase by default. Use `normal-case` to opt out for headlines, taglines, and any content where case carries meaning.

With:
> `body` renders **normal-case** by default. The pre-FRAC-51 global `text-transform: uppercase` on `body` was removed; uppercase is now opt-in via `.font-serif`, the `h1–h6` rule, or one of the chrome utilities (`.text-eyebrow`, `.text-label`, `.text-meta`).

#### Change B — Replace the `### Why no headline-lg / body-md tokens?` subsection (lines 206–208) with the new section

```markdown
### Semantic type scale

FRAC-51 introduces a Tailwind-aligned semantic scale delivered as utility classes (precedent: the existing `.display-roman` utility). Each utility maps to **one** Tailwind size — no arbitrary `text-[…]` values. Body family is Inter (FRAC-44). Body case is **normal-case**; uppercase is opt-in.

**Display tier (Fraunces)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-display` | upright, weight 300, uppercase, tracking 0.04em, leading 1.1 | `text-5xl md:text-7xl` |
| `.text-title` | italic, uppercase, tracking 0.04em | `text-3xl md:text-5xl` |
| `.text-subtitle` | italic, weight 300, uppercase, tracking 0.04em | `text-xl md:text-2xl` |

**Body tier (Inter, normal-case)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-body` | weight 400, normal-case | `text-base` |
| `.text-body-lead` | weight 300, normal-case, leading 1.7 | `text-lg` |

**Chrome tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-eyebrow` | uppercase, weight 500, tracking 0.1em | `text-sm` |
| `.text-label` | identical to `.text-eyebrow` | `text-sm` |
| `.text-meta` | identical to `.text-eyebrow` | `text-sm` |

`.text-eyebrow`, `.text-label`, and `.text-meta` are deliberately three names for the same rendering — the *meaning* differs at the call site (overline label vs. form label vs. inline metadata), and keeping three names lets future authors signal intent without forcing a rendering decision today.

**Button (2 variants in `src/components/ui/button.tsx`)**

| Size | Padding | Type |
|---|---|---|
| `default` | `px-8 py-5` | `text-sm tracking-widest uppercase font-medium` |
| `sm` | `px-4 py-2.5` | `text-xs tracking-widest uppercase font-medium` |

Both Button sizes share the same JetBrains Mono / uppercase / `tracking-widest` base from the `buttonVariants` cva string.

**`.display-roman` is preserved** as the low-level escape hatch (font-style/weight/transform only, no size or tracking). `.text-display` is the full semantic preset and should be the default reach. Authors who only need to opt a heading out of italic without taking on the full display rendering can keep using `.display-roman`.

**On the `typography:` YAML key:** No change. The existing `font-sans` / `font-mono` family declarations remain; the semantic size scale is not modeled in YAML because design.md's typography schema has no slots for size, letter-spacing, line-height, or text-transform. The scale above is the canonical reference and lives in prose.
```

## Open questions (all resolved)

1. **`@apply font-serif` vs raw `font-family`?** Resolved → `@apply font-serif` so the utility participates in the `@theme inline` token. Future swap propagates.
2. **`@layer utilities` vs `@layer components`?** Resolved → `@layer utilities`, where `.display-roman` already lives.
3. **Three eyebrow selectors or one?** Resolved → one. Spec says "identical rendering today"; deduplication locks them in step.
4. **Does flipping body uppercase regress shipped pages?** Hero passages that use `font-serif` are unaffected because `.font-serif` carries its own `text-transform: uppercase` at `src/index.css:97–100`. Non-`font-serif` body copy that explicitly carries `uppercase` is unaffected. Any incidental site that *implicitly* relied on the global flip is in the migration scope of FRAC-52..56 — flag in PR description; do not pre-migrate consumers in this PR.

## Acceptance criteria

1. All 8 utility classes defined in `src/index.css` under `@layer utilities` and resolve at runtime with the exact properties named in the spec.
2. The `body` selector in `src/index.css` no longer contains `text-transform: uppercase`.
3. `.display-roman` is still defined and unchanged.
4. Button `default` size class string is `"px-8 py-5 text-sm font-medium"` and `sm` is `"px-4 py-2.5 text-xs font-medium"`.
5. `DESIGN.md` no longer contains `### Why no headline-lg / body-md tokens?`; new `### Semantic type scale` subsection present with three-tier table, button table, and `.display-roman` preservation note.
6. `### Global type rules` reflects the body case flip.
7. `npx @google/design.md@0.2.0 lint DESIGN.md` reports 0 errors (warning count may shift; no new errors).
8. Manual dev-server pass: home hero, EventsPage, StoryPage render without obvious regressions. `font-serif` body uppercase still works.
9. No new TypeScript or ESLint errors.

## Branch & PR plan

- **Branch:** `frac-51-typography-foundation` off `master`.
- **PR title:** `FRAC-51: Typography foundation — 8 semantic utilities + body case flip`
- **PR body:** Link to `.lattice/notes/typography-spec-20260607.md` and this plan. Call out body-uppercase flip as the load-bearing behavioral change; note that downstream consumers (FRAC-52..56) will migrate any sites that implicitly relied on it.
