# FRAC-215 — Rename `--btn-accent` → `--accent`; implement & document 3-tier border system

**Branch:** `frac-215-border-system`
**Complexity:** medium (most involved task in the batch; has VISUAL changes — preview gate required)

## Scope & Why

Two coupled changes, both rooted in the FRAC-215 decision comment (decisions finalized in the design.md review):

1. **Rename `--btn-accent` → `--accent`.** The CSS custom property is set on every page's `<main>` (the page's accent color: house `-deep`/`-light` or a section color) and read by `button.tsx`. With the new border system, borders will also read it — so it is no longer button-specific. Rename it everywhere to `--accent`. The hover-only vars `--btn-fill` / `--btn-text` STAY (they really are button-specific).
2. **3-tier border system.** Today borders are scattered across `border-foreground-faint`, `border-foreground/{10,20,40}`, solid `border-foreground`, and house colors. Standardize to three named tiers, migrate the strays, and document the tiers in `DESIGN.md`.

There is no pre-existing `--accent` anywhere in `src/` or `DESIGN.md` (verified) — the rename is collision-free. Conformance currently passes (35 grandfathered values, baseline green); none of the planned edits introduce raw hex in arbitrary classes, so conformance stays green.

---

## Part 1 — Rename `--btn-accent` → `--accent`

Mechanical, project-wide. Replace the literal token `--btn-accent` with `--accent` at every site below. Do NOT touch `--btn-fill` or `--btn-text`.

### Set-sites (8 page `<main>` style props) — `current → target`

| File | Line | Current | Target |
|---|---|---|---|
| `src/pages/PoliticalClubPage.tsx` | 13 | `"--btn-accent": "var(--color-house-political-club-light)"` | `"--accent": …` |
| `src/pages/EventsPage.tsx` | 18 | `"--btn-accent": "var(--color-house-events-deep)"` | `"--accent": …` |
| `src/pages/NeighborhoodPage.tsx` | 15 | `"--btn-accent": "var(--color-house-visit-deep)"` | `"--accent": …` |
| `src/pages/LabPage.tsx` | 18 | `"--btn-accent": "var(--color-house-publications-deep)"` | `"--accent": …` |
| `src/pages/PeoplePage.tsx` | 13 | `"--btn-accent": "var(--color-section-people-deep)"` | `"--accent": …` |
| `src/pages/StoryPage.tsx` | 204 | `"--btn-accent": "var(--color-section-story)"` | `"--accent": …` |
| `src/pages/CampusPage.tsx` | 12 | `"--btn-accent": "var(--color-house-campus-deep)"` | `"--accent": …` |
| `src/pages/LiberalArtsPage.tsx` | 12 | `"--btn-accent": "var(--color-house-education-light)"` | `"--accent": …` |

### Read-sites — `src/components/ui/button.tsx`

| Line | Current fragment | Target |
|---|---|---|
| 45 | comment `// house accent via \`--btn-accent\` …` | update comment → `--accent` |
| 52 | `bg-[var(--btn-accent,currentColor)]` | `bg-[var(--accent,currentColor)]` |
| 55 | `[border-color:var(--btn-accent,currentColor)]` | `[border-color:var(--accent,currentColor)]` |
| 59 | `hover:text-[var(--btn-text,var(--btn-accent,currentColor))]` | `hover:text-[var(--btn-text,var(--accent,currentColor))]` |

(3 live `var()` reads: `bg` (52), `border-color` (55), and a nested read inside `hover:text` (59). Line 45 is prose.)

### Test-site (must update or tests break) — `src/__tests__/buttons.test.tsx`

| Line | Current | Target |
|---|---|---|
| 133 | comment `tinted glass + accent border via --btn-accent…` | update prose → `--accent` |
| 136 | `expect(...).toContain("[border-color:var(--btn-accent,currentColor)]")` | `…var(--accent,currentColor)]` |
| 139 | `it("should propagate --btn-accent from a parent <main> …")` | `…--accent…` |
| 140 | comment `pages set \`--btn-accent\` on <main>…` | update prose → `--accent` |
| 145 | `<main style={{ "--btn-accent": "#FF0000" } …}>` | `"--accent": "#FF0000"` |
| 152 | comment `page-level <main style="--btn-accent: …">` | update prose → `--accent` |
| 153 | `expect(...).toContain("[border-color:var(--btn-accent,currentColor)]")` | `…var(--accent,currentColor)]` |

> ⚠ The two `expect(...).toContain(...)` assertions (lines 136, 153) and the style prop on line 145 are **functional** — they MUST be updated or the buttons test fails. The rest are comments/test-name prose; rename for consistency.

### Prose-only mentions (rename for consistency, non-functional)

| File | Line | Note |
|---|---|---|
| `src/index.css` | 266 | comment: `Apply this class … (alongside \`--btn-accent\`)` → `--accent` |
| `src/components/sections/Campus.tsx` | 183 | comment: `accent border via \`--btn-accent\` set on CampusPage's <main>` → `--accent` |

### Rename verification (acceptance step)

After editing: `grep -rn "btn-accent" src/` MUST return **zero** results. DESIGN.md handled in Part 3.

---

## Part 2 — 3-tier border system

### The three tiers

| Tier | Class / value | Role |
|---|---|---|
| **STRUCTURAL** | `border-foreground-faint` | Default frames, dividers, hairlines. The faint solid charcoal. Already the global default (`* { @apply border-foreground-faint }` in `index.css:78`). Keep all existing uses. |
| **DEFINITION** (low-emphasis) | `border-foreground/20` | Definition without emphasis, on cream surfaces — a defining container edge that shouldn't shout. |
| **EMPHASIS** (themed) | `[border-color:var(--accent,currentColor)]` (with a leading `border`) | House/section accent-colored border, exactly like the button. Inherits the page's `--accent` (set on `<main>`); falls back to `currentColor`. |

### Full border-site inventory & mapping

Every `border-foreground*` / `border-house*` / `border-[…]` site found via `grep -rn "border-foreground\|border-house\|border-\[" src/`:

| # | File:line | Current border | Role | → Tier | Action |
|---|---|---|---|---|---|
| 1 | `src/index.css:78` | `border-foreground-faint` (global `*` default) | sitewide default | STRUCTURAL | **unchanged** |
| 2 | `src/index.css:119` | `.border-grid { @apply border-foreground-faint }` | grid utility | STRUCTURAL | **unchanged** |
| 3 | `src/components/sections/Hero.tsx:137` | `border border-foreground` (solid) — sr-only keyboard-nav popover `<ul>` | defining container edge on cream | **DEFINITION** | **change → `border border-foreground/20`** (judgment, below) |
| 4 | `src/components/sections/Hero.tsx:198` | `border-foreground/20` + `focus:border-foreground/40` — search input | resting=definition, focus=state | DEFINITION (rest) + state | **unchanged** (`/40` is a focus STATE, explicitly stays) |
| 5 | `src/components/sections/Hero.tsx:242` | `border border-foreground/20` — search results dropdown | defining container edge on cream popover | DEFINITION | **unchanged** (already correct tier) |
| 6 | `src/components/layout/Footer.tsx:25` | `border-t border-foreground-faint` | top divider on dark footer | STRUCTURAL | **unchanged** |
| 7 | `src/components/layout/Navbar.tsx:397` | `border-b border-foreground/10` — mobile menu row divider | resting structural divider between rows | **STRUCTURAL** | **change → `border-b border-foreground-faint`** (judgment, below) |
| 8 | `src/components/lab/TagFilter.tsx:55` | `hover:border-[#C44878]/40` — pill hover | themed hover state (grandfathered hex) | (out of scope) | **unchanged** — flag only |
| 9 | `src/components/lab/DocumentBadge.tsx:58` | `border border-foreground-faint` — card resting border | card frame | STRUCTURAL | **unchanged** |
| 10 | `src/components/lab/DocumentBadge.tsx:60` | `hover:border-house-publications-deep/40` — card hover | themed house hover state | (emphasis-adjacent) | **unchanged** — flag at preview |
| 11 | `src/components/lab/ArchiveSearch.tsx:76` | `border border-foreground-faint` — search box | input frame | STRUCTURAL | **unchanged** |
| 12 | `src/components/lab/ArchiveSearch.tsx:79` | `focus:ring-…/40 focus:border-house-publications-deep/60` | focus STATE | state | **unchanged** (focus state, not resting) |
| 13 | `src/pages/NeighborhoodPage.tsx:61` | `border border-foreground/20` — Visit "Note" container | container that should carry EMPHASIS | **EMPHASIS** | **change → `border [border-color:var(--accent,currentColor)]`** |
| 14 | `src/pages/LabPage.tsx:63` | `border-b border-foreground-faint` — section divider | divider | STRUCTURAL | **unchanged** |
| 15 | `src/pages/StoryPage.tsx:131` | `border border-foreground-faint` — TalkCard | card frame | STRUCTURAL | **unchanged** |
| 16 | `src/pages/EventsPage.tsx:47` | `border border-foreground/20` — Luma embed panel | container that should carry EMPHASIS | **EMPHASIS** | **change → `border [border-color:var(--accent,currentColor)]`** |

> `src/components/ui/button.tsx:55` is the canonical EMPHASIS example (handled by Part 1's rename; no extra change).

### Exact edits (Part 2)

**A. `NeighborhoodPage.tsx:61`** (Visit "Note" container → EMPHASIS)
Replace `border border-foreground/20` with `border [border-color:var(--accent,currentColor)]`. Resulting class string:
`border [border-color:var(--accent,currentColor)] rounded-md p-9 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-foreground text-left max-w-xl mx-auto`
(Visit's `--accent` = `var(--color-house-visit-deep)`, set on `<main>` line 15 → matches the button.)

**B. `EventsPage.tsx:47`** (Luma embed panel → EMPHASIS)
Replace `border border-foreground/20` with `border [border-color:var(--accent,currentColor)]`. Resulting class string:
`relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border [border-color:var(--accent,currentColor)] bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6`
(Events' `--accent` = `var(--color-house-events-deep)`.)

**C. `Hero.tsx:137`** (sr-only keyboard-nav `<ul>` → DEFINITION)
Replace `border border-foreground` with `border border-foreground/20`.

**D. `Navbar.tsx:397`** (mobile menu row divider → STRUCTURAL faint)
Replace `border-b border-foreground/10` with `border-b border-foreground-faint`. (Keep the inline `borderLeft: 3px solid ${link.color}` accent stripe untouched.)

> Use the EXACT pattern `[border-color:var(--accent,currentColor)]` (matching button.tsx) and KEEP the leading `border` utility so a 1px border renders, with the arbitrary property overriding only the color.

### Judgment calls (justified)

- **#7 Navbar `/10` → `border-foreground-faint` (STRUCTURAL).** Resting row divider between mobile menu items — a structural hairline, the exact role of `border-foreground-faint`. `/10` is a one-off opacity even fainter than the faint token; snapping it to the named tier consolidates. Visual delta is small (preview to confirm on mobile). Each row keeps its colored left stripe.
- **#3 Hero combobox `border-foreground` (solid) → `border-foreground/20` (DEFINITION).** The sr-only keyboard skip-nav popover `<ul>` framing a floating popover on cream, visible only to keyboard users when focused. A full-strength solid charcoal border is heavier than any other resting container. `/20` matches the Hero dropdown (#5) and input (#4). It frames a popover, not a structural divider → DEFINITION, not faint.
- **#8 TagFilter `hover:border-[#C44878]/40` — leave & flag.** Hover STATE using a grandfathered raw hex. Outside the three resting tiers and a state, not a resting border. Out of scope; flag a future cleanup (route through `--accent` / publications token), but changing now risks an unintended lab-filter shift + conformance churn.
- **#10 DocumentBadge `hover:border-house-publications-deep/40` — leave & flag at preview.** Conceptually EMPHASIS (themed house border), BUT: (1) it's a hover STATE; (2) Tailwind opacity modifiers (`/40`) do NOT apply to arbitrary `[border-color:var(...)]` values, so mapping it to the `--accent` var would force dropping the `/40` softening or hand-rolling rgba. On LabPage `--accent` already equals `house-publications-deep`, so it's effectively the same color. Leave unchanged; flag for the human as a possible follow-up with its own opacity decision.

---

## Part 3 — DESIGN.md (`/Users/fractalos/Dev/fractal-nyc/DESIGN.md`)

### Edit 1 — add a `### Borders` subsection under **## Shapes** (after the `Rounded scale` table at line 296, before `### Mandelbrot corners` at line 298)

Insert (tighten to house style on write):

```
### Borders

Borders resolve to one of three semantic tiers — pick by intent, not by eye:

| Tier | Value | Role | Example sites |
|---|---|---|---|
| **Structural** | `border-foreground-faint` | Default frames, dividers, hairlines. The sitewide default (`* { border-foreground-faint }`). | footer divider, lab cards (`DocumentBadge`, `ArchiveSearch`, Story TalkCard), Navbar menu-row dividers, LabPage section rule |
| **Definition** | `border-foreground/20` | A defining container edge on cream, without emphasis. | Hero search input + results dropdown, Hero keyboard-nav popover |
| **Emphasis** | `[border-color:var(--accent,currentColor)]` | Themed house/section accent border — the same accent the button uses. For containers that want to carry the house color. Inherits `--accent` (set per page on `<main>`); falls back to `currentColor`. | `button-default`, Visit "Note" card (`NeighborhoodPage`), Events Luma embed (`EventsPage`) |

The `--accent` custom property (renamed from `--btn-accent` in FRAC-215) is set on each page's `<main>` to that page's house/section color and read by both the button and the Emphasis-tier borders. Focus/hover states (e.g. the Hero input's `focus:border-foreground/40`, the lab `focus:border-house-publications-deep/60`) sit deliberately outside this resting-tier vocabulary — they are transient states, not resting borders.
```

### Edit 2 — replace `--btn-accent` mentions throughout DESIGN.md with `--accent`

| Line | Context |
|---|---|
| 54 | YAML `backgroundColor: "var(--btn-accent, currentColor)"` → `var(--accent, currentColor)` |
| 57 | YAML `border: "var(--btn-accent, currentColor)"` → `var(--accent, currentColor)` |
| 62 | YAML `hoverTextColor: "var(--btn-text, var(--btn-accent, currentColor))"` → `var(--btn-text, var(--accent, currentColor))` |
| 163 | Story prose: "the `--btn-accent`, and the TalkCard accents" → `--accent` |
| 321 | `button-default` prose: `bg-[var(--btn-accent,currentColor)]`, `[border-color:var(--btn-accent,currentColor)]`, and "The accent (`--btn-accent`) is set per house page" → all `--accent` |

> After Part 1 + Part 3, `grep -rn "btn-accent" src/ DESIGN.md` must be zero.

### Edit 3 — Rounded scale table (line 292) & pill note (line 294)

No edit. Line 292's `rounded-md` examples ("`NeighborhoodPage` note", "Hero combobox") refer to RADIUS, which is unchanged — we only change border COLOR. The `rounded-full` pill note (line 294) does not contradict the new tiers. Verify on write that no border prose contradicts the new Borders subsection (it does not).

---

## PREVIEW GATE (visual — required before merge)

Run `npm run dev`, eyeball at **375px mobile baseline first**, then desktop:

1. **Visit page (`/visit`, NeighborhoodPage)** — the "Note" card (#13) now has a Visit-accent (`house-visit-deep`, olive) border instead of faint `/20`. Confirm it reads as intentional emphasis and matches the "Visitor Form" button above it.
2. **Events page (`/events`, EventsPage)** — the Luma embed panel (#16) now has an Events-accent (`house-events-deep`, red) border. Confirm against the page accent.
3. **Hero (`/`)** — focus the search input + open the dropdown (#5, unchanged `/20`); tab to reveal the sr-only keyboard-nav popover (#3, now `/20` instead of solid) and confirm it reads lighter/consistent.
4. **Navbar mobile menu** — open the hamburger; confirm row dividers (#7, now faint) still separate cleanly and each row keeps its colored left stripe.
5. **Sanity:** every house page button still renders its accent border (Part 1 rename didn't break the cascade) — spot-check Campus, Liberal Arts (dark bg), Publications.
6. **Flag at preview:** DocumentBadge hover (#10) and TagFilter pill hover (#8) intentionally left as themed-but-not-`--accent`; mention to the human in case they want them unified.

---

## Acceptance criteria

- [ ] `grep -rn "btn-accent" src/` returns **zero**; `grep -rn "btn-accent" DESIGN.md` returns **zero**.
- [ ] All 8 page set-sites use `--accent`; `button.tsx` reads `var(--accent,…)`; `buttons.test.tsx` assertions updated to `var(--accent,currentColor)`.
- [ ] Border sites #3, #7, #13, #16 changed per the mapping table; all others unchanged. `/40` (#4) and `/60` (#12) focus states untouched.
- [ ] DESIGN.md has a `### Borders` subsection documenting the 3 tiers (structural=faint, definition=/20, emphasis=`var(--accent)`) with roles + example sites; all `--btn-accent` prose/YAML renamed.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm run conformance` passes (still green — `var(--accent)` is not a raw hex).
- [ ] `npm run test` — at the FRAC-199 baseline (**7** pre-existing failures), **no new failures**. The buttons test must still pass after the assertion renames.
- [ ] Visual preview gate completed; the two emphasis-border changes (Visit note, Events embed) approved by the human.

## Risks / notes for implementer

- `buttons.test.tsx:136,153` assert the literal class string `[border-color:var(--btn-accent,currentColor)]` — **load-bearing**; rename in lockstep with `button.tsx` or the test breaks (looks like a regression, isn't).
- Tailwind opacity modifiers do NOT apply to arbitrary `[border-color:var(...)]` values — this is why the EMPHASIS tier uses a flat accent border (no `/N`), and why DocumentBadge's `/40` hover can't be trivially mapped to the var.
- Do not touch `--btn-fill` / `--btn-text` (button hover vars) or `.btn-on-dark` (which sets `--btn-fill`). Those are correctly button-specific.
- Shared worktree: `.claude/worktrees/*/DESIGN.md` copies belong to other agents — IGNORE them; edit only the repo-root `/Users/fractalos/Dev/fractal-nyc/DESIGN.md`.
