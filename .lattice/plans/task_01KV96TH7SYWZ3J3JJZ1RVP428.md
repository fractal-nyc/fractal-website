# FRAC-209: Typography system cleanup

Decisions finalized with the user. Make the type system explicit and consolidate the
JetBrains-Mono "chrome" tier, then make DESIGN.md match.

## The target model (3 tiers)
| Tier | Family | Utilities |
|---|---|---|
| **Display** | Fraunces | `text-display`, `text-title`, `text-subtitle` (UNCHANGED) |
| **Body** | Inter | `text-body`, `text-body-lead`, `text-aside` (UNCHANGED) |
| **Chrome** | JetBrains Mono | `text-label` (collapsed), `text-input` (renamed), `text-mono-display` (renamed) |

**Chrome definition (use ~verbatim in DESIGN.md):** the non-content UI furniture — all the
buttons, bars, labels, metadata, inputs, and frames that let users *control* the software
(the address bar, tabs, nav buttons, status bars analogy).

## Code changes (`src/index.css` + call sites)

### 1. Headings: kill the global magic
- Remove the global rule `h1,h2,h3,h4,h5,h6 { @apply font-serif font-normal italic; letter-spacing: 0.04em; }`.
- Replace with a **family-only safety-net default** so bare headings are on-brand Fraunces with
  NO forced italic/case/weight. GOTCHA: `.font-serif` (the @layer base rule) itself applies
  `text-transform: uppercase; font-style: italic`, so do NOT `@apply font-serif` here — set the
  family directly, e.g. `h1,h2,h3,h4,h5,h6 { font-family: var(--font-serif); }` (plain Fraunces).
- Heading LEVEL stays decoupled from visual TIER (level = document outline/a11y; tier = the
  explicit `text-*` utility). Every heading already carries a utility, so visuals are unchanged.

### 2. Delete unused `.display-roman`
- 0 call sites (only its own def + a comment). Remove the `.display-roman` block and any prose
  comment referencing it as the escape hatch.

### 3. Collapse the 3 identical chrome aliases → `.text-label`
- CSS: `.text-eyebrow, .text-label, .text-meta { ... }` → just `.text-label { ... }` (same rules:
  `font-mono text-sm; font-weight:500; text-transform:uppercase; letter-spacing:0.1em`).
- Call sites: replace `text-eyebrow` → `text-label` and `text-meta` → `text-label` across `src/`
  (~21 total: eyebrow 9, label 5, meta 7). Leave existing `text-label` as-is. Watch for an element
  that had two of these on one className (collapse to a single `text-label`, no duplicates).

### 4. Rename `.text-control` → `.text-input`
- Now collision-free (`--color-input` was removed in FRAC-201). CSS: rename the `.text-control`
  block to `.text-input`. Call sites (~4): `src/components/sections/Hero.tsx` (search input +
  sizing mirror), `src/components/lab/ArchiveSearch.tsx` (input + width mirror).
- **Remove the obsolete naming comment** in index.css that explains `.text-control` was chosen to
  avoid the `--color-input` / `text-input` collision (that constraint no longer exists). Reword
  the remaining comment to just describe the input tier (16px = iOS no-zoom; normal tracking).

### 5. Rename `.text-body-display` → `.text-mono-display`
- CSS rename + call sites (~2). It's the thin (weight 100) mono uppercase manifesto/protocol
  "display moment."

## DESIGN.md rewrite (Typography section)
Rewrite around the 3-tier model. Specifically:
- **Four families intro:** keep Fraunces (display: headings/titles/highlights), Jacquard 24
  (display script). FIX the family roles: **Inter = body/content** (body, lead, asides,
  bylines/sign-offs); **JetBrains Mono = chrome** (the control-furniture definition above) — the
  current text wrongly says "Inter … for label use" and "JetBrains Mono — the body family."
- **Headings:** replace the "global h1–h6 italic+uppercase rule + `.display-roman` opts upright"
  prose with: headings default to plain Fraunces; the visual tier is set explicitly via
  `text-display`/`text-title`/`text-subtitle`; level is decoupled from tier. Drop `.display-roman`.
- **Semantic type scale tables:** update the Chrome tier table — three rows (`text-eyebrow`/
  `text-label`/`text-meta`) collapse to one `.text-label`; rename `.text-control` → `.text-input`
  and `.text-body-display` → `.text-mono-display`; keep the renderings accurate to the CSS.
- Remove the misplaced `.display-roman`/`.text-display` line under the Button table.
- Do NOT change the Button section's actual type facts (mono/uppercase/tracking-widest); leave
  house/color/layout content alone.

## Tests
Grep `src/__tests__` for any assertion on the old class names (`text-eyebrow`, `text-meta`,
`text-control`, `text-body-display`, `display-roman`) or the global heading italic rule; update
them to the new names/behavior. Do not weaken assertions — adapt faithfully and note what changed.

## Acceptance criteria
- No `text-eyebrow`, `text-meta`, `text-control`, `text-body-display`, or `display-roman` remain
  anywhere in `src/` (CSS, call sites, or tests). New names (`text-label`, `text-input`,
  `text-mono-display`) used.
- Global `h1–h6` italic/uppercase rule gone; bare headings default to plain Fraunces family only.
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; `pnpm test` green except the
  pre-existing FRAC-199 failures (7) — report any test you had to update for the renames and
  confirm no NEW failures.
- Rendered output unchanged (every heading already has a tier utility; chrome renames are 1:1).
- DESIGN.md Typography section reflects the 3-tier model with corrected family roles + the chrome
  definition; `.display-roman` and the old utility names removed.

## Out of scope
- Buttons (size variants, etc.), house/color tokens, layout, the inline-`fontSize` sprawl in
  Navbar/pretext (a possible later task).
