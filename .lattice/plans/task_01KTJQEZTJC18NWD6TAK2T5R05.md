# FRAC-21: Apply Publications (Lab) page audit findings

**Task:** task_01KTJQEZTJC18NWD6TAK2T5R05
**Branch:** frac-21-apply-lab (branched off `frac-20-audit-lab`, not `master` — FRAC-20's DESIGN.md `### Text foregrounds` section + audit doc are upstream of this work and aren't on `master` yet, PR #181 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/lab-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### Text foregrounds` and `### House palette values`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)

---

## Scope

**FRAC-21 changes only `src/`.** Specifically, the Lab page (`src/pages/LabPage.tsx`) and the 4 Lab components in its render graph (`DocumentGrid.tsx`, `DocumentBadge.tsx`, `ArchiveToolbar.tsx`, `ArchiveSearch.tsx`), plus a single declarative addition to `src/index.css` to register the two `house-publications-{light,deep}` Tailwind theme tokens.

**Out of scope** (do NOT touch):
- The audit doc itself (`.lattice/notes/audits/lab-audit.md`) — frozen as the spec.
- `DESIGN.md` and `.lattice/notes/audit-prompt.md` — FRAC-20 owned those edits.
- The Pretext component itself (`src/components/pretext/PretextParagraph.tsx`) — FRAC-40 tracks sitewide deletion after all per-page callsites migrate. FRAC-21 only refactors *Lab's one callsite* away from PretextParagraph.
- `TagFilter.tsx`, `SectorHeader.tsx` internals, `FractalPattern.tsx`, Navbar / Footer / MandelbrotIcon / MandelbrotCorners / FadeIn, `src/lib/pretext.ts`, `src/hooks/use-archive-filter.ts`, `src/data/houses.ts` (no schema or data changes — runtime `HOUSES.find(...).palette.deep` reads inside `DocumentBadge.tsx` are migrated to the new token; `houses.ts` itself stays untouched).
- Other house pages — even though they share the same `style={{ backgroundColor: "#XXX" }}` raw-hex pattern, each house gets its own Apply task. FRAC-21 only fixes Lab.
- No new `.text-body-mono` utility tier (per directive 1 from FRAC-20 orchestrator). Lab's GAP at `LabPage:58` is resolved by the structural PretextParagraph→`<p class="text-body-lead">` callsite refactor, NOT by adding a new utility.

**No `pnpm install`, no package.json changes, no test scaffolding new files.** Pure migration.

---

## House token declaration mechanism (DECISION)

**Decided: Option A — declare `--color-house-publications-light` and `--color-house-publications-deep` in `src/index.css` `@theme inline`.**

### Why this and not the alternatives

The audit identifies four canonical token names that need to land somewhere:
- `house-publications-light` (= `#E870A0`)
- `house-publications-deep` (= `#C44878`)

There are three plausible mechanisms (called out by FRAC-20 orchestrator directive 4):

| Mechanism | Tailwind utility (`bg-X`, `ring-X/40`)? | Inline style? | Comment |
|---|---|---|---|
| **A. `@theme inline` (Tailwind v4 theme tokens)** | yes | yes (via `var(--color-house-publications-light)`) | Unlocks alpha-modifier syntax `ring-house-publications-deep/40`; harmonizes with how `bg-background`, `border-border`, `ring-ring` are declared today. |
| **B. CSS variables in `:root` only (no `@theme`)** | no | yes | Breaks the focus-ring migrations — `focus:ring-[#C44878]/40` would have to stay as an arbitrary value `focus:ring-[var(--color-house-publications-deep)]/40`, which is uglier and inconsistent with the existing `ring-ring` pattern. |
| **C. Runtime `HOUSES[lab].palette.{light,deep}` import** | no | yes | Already used for `LAB_DEEP` in `DocumentBadge.tsx:34`. Forces every focus-ring site into inline `style={}`, defeats the audit's goal of token-driven Tailwind utilities. |

Option A is the only mechanism that lets us replace the 5 arbitrary-value Tailwind classes (`focus:ring-[#C44878]/40`, `focus:border-[#C44878]/60`, `hover:border-[#C44878]/40`) with clean token-driven utilities. Tailwind v4.1 (confirmed in `package.json`: `tailwindcss@^4.1.14`) supports alpha modifiers on `@theme` color tokens natively, so `bg-house-publications-light`, `ring-house-publications-deep/40`, `border-house-publications-deep/60`, `hover:border-house-publications-deep/40` all work without any extra config.

### How existing tokens are declared (model to follow)

`src/index.css:5-42` is the `@theme inline` block. Surface tokens use a two-step indirection:

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  /* ... */
}

:root {
  --background: 40 25% 96%;
  --foreground: 0 0% 9%;
  --border: 40 10% 85%;
  /* ... */
}
```

The HSL indirection exists historically to support a `.dark` token block (since deleted in FRAC-30 per DESIGN.md). For static brand colors like the house palette, the indirection adds no value — house colors don't theme-swap, they don't dark-mode, they don't recompute. **Declare them directly as hex inside `@theme inline`** to keep the source-of-truth flat and avoid pretending the indirection is meaningful:

```css
@theme inline {
  /* ... existing tokens ... */

  /* House palette tokens (FRAC-21).
     Static brand hexes — declared directly without the HSL var indirection
     used by surface tokens, because house colors do not theme-swap and the
     `.dark` block does not exist (FRAC-30). See DESIGN.md → House palette
     values for the full set; FRAC-21 lands only the Publications pair. */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
}
```

### Exact edit to `src/index.css`

Insert the two new lines at the bottom of the `@theme inline` block (after `--color-ring: hsl(var(--ring));` on line 36 and before the `--radius-*` lines on lines 38-41). A brief comment block explains the no-indirection choice so the next agent doesn't "fix" it.

Concrete insertion (between current line 36 and current line 38):

```css
  --color-ring: hsl(var(--ring));

  /* House palette tokens (FRAC-21). Static brand hexes — declared
     directly without the hsl(var(...)) indirection used by surface
     tokens above, because house colors do not theme-swap (no dark mode
     per FRAC-30) and the indirection would add no value. See
     DESIGN.md → House palette values for the full set; FRAC-21 lands
     only the Publications pair (the remaining 5 pairs land in their
     respective per-house Apply tasks). */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;

  --radius-sm: 0.25rem;
```

This makes the following Tailwind utilities available throughout `src/`:
- `bg-house-publications-light`, `bg-house-publications-deep`
- `text-house-publications-light`, `text-house-publications-deep`
- `border-house-publications-light`, `border-house-publications-deep`
- `ring-house-publications-light`, `ring-house-publications-deep`
- All with the standard alpha modifier `/NN` suffix (e.g. `ring-house-publications-deep/40`).

### Open question for sign-off (LOW SEVERITY)

There is no other house Apply task in flight yet. FRAC-21 establishes the precedent. If the human/orchestrator prefers, the index.css block could land all 12 house tokens up-front instead of one pair at a time. **Default plan:** land only the Publications pair (matches the audit's scope; keeps this PR mechanically minimal). Implementer should NOT expand to all 12 without sign-off — flag as `needs_human` if tempted.

---

## Per-file migration plan

### 1. `src/index.css` (declaration, single addition)

Insert the two-line `@theme inline` block per the mechanism section above. No other changes. Trivial.

### 2. `src/pages/LabPage.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| LabPage.tsx:16 (bg) | 16 | `<main className="…" style={{ backgroundColor: "#E870A0" }}>` | `<main className="… bg-house-publications-light" style={{}}>` — remove the `style` prop entirely, move bg to className | Clean token utility; harmonizes with the focus-ring migrations. |
| LabPage.tsx:16 (text) | 16 | `text-foreground selection:bg-foreground selection:text-background` | `text-background selection:bg-foreground selection:text-background` | Per DESIGN.md → Text foregrounds. Cream cascade kicks in for descendants that don't override (LabPage:49 eyebrow, LabPage:58 lede). Selection chrome unchanged (already canonical). |
| LabPage.tsx:24 (SectorHeader prop) | 24 | `color="#C44878"` | `color="var(--color-house-publications-deep)"` | SectorHeader's prop is a raw string consumed inline by an SVG fill / inline color — keep it as a string but reference the CSS var. Token mechanism is identical, drift (raw hex literal) is fixed. **Do NOT change SectorHeader.tsx internals** — out of scope per audit. |
| LabPage.tsx:48 (border-b) | 48 | `border-b border-border pb-8` | (unchanged — EXACT no-op per audit row LabPage.tsx:48) | Already canonical. |
| LabPage.tsx:49 + LabPage.tsx:58 (text-white) | 49, 58 | `text-white` on the eyebrow h2 and the Pretext lede | Remove `text-white` from both. The `text-background` cascade from `<main>` at line 16 handles them automatically. | Two sites; the cascade simplifies both at once. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| LabPage.tsx:27 | 27 | `text-display mb-6 text-center` | (unchanged — EXACT no-op per audit row LabPage.tsx:27) | Already canonical. |
| LabPage.tsx:49 (h2 eyebrow italic drift) | 49 | `<h2 className="text-eyebrow flex items-center gap-2 text-white mb-3">` | `<h2 className="text-eyebrow not-italic flex items-center gap-2 mb-3">` | Add `not-italic` to override the global `h1–h6` italic rule (`src/index.css:90-94`). Keep `<h2>` semantic — don't demote to `<span>` (the audit row offered either option; preserving the h-tag is better for outline semantics). `text-white` removed per color row above. |
| LabPage.tsx:53 (The Records — text-3xl md:text-4xl font-serif) | 53 | `<p className="text-3xl md:text-4xl font-serif leading-tight normal-case">` | `<p className="text-title leading-tight normal-case">` | Replace ad-hoc `text-3xl md:text-4xl font-serif` with the canonical `.text-title` utility. `leading-tight` and `normal-case` overrides preserved (the audit row notes the title is mixed-case at this call site, and `.text-title` does not pin leading — both overrides are documented acceptable drift). |
| LabPage.tsx:58 (PretextParagraph — GAP-LOG-AND-MIGRATE) | 56-61 | `<PretextParagraph size={TEXT_SIZES.base} className="text-white mt-3 font-light max-w-xl">{"Essays, publications, and podcasts from the minds behind Fractal Labs."}</PretextParagraph>` | `<p className="text-body-lead text-background mt-3 font-light max-w-xl">Essays, publications, and podcasts from the minds behind Fractal Labs.</p>` | **STRUCTURAL EDIT — component swap.** See dedicated section below. |

#### Imports to remove (LabPage.tsx)

After the PretextParagraph callsite is replaced:
- Remove `import { PretextParagraph } from "@/components/pretext/PretextParagraph";` (line 9)
- Remove `import { TEXT_SIZES } from "@/lib/pretext";` (line 10)

The implementer should verify no other usages in the file before removing, then remove both imports. **DO NOT** delete the component files themselves — FRAC-40 owns that after every page migrates.

---

### 3. `src/components/lab/DocumentBadge.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| DocumentBadge.tsx:34 (LAB_DEEP constant) | 34 | `const LAB_DEEP = HOUSES.find((h) => h.id === "lab")!.palette.deep;` | (unchanged — keep the runtime read) | Audit row LabPage:34 explicitly says "Apply task may CSS-var-ify or leave the runtime lookup as-is." The runtime read is the canonical pattern for `style={}` consumers; keeping it minimizes churn. Inline-style sites at lines 71/76/111 stay on this constant. |
| DocumentBadge.tsx:71 (icon bg with alpha — inline style) | 71 | `style={{ backgroundColor: `${LAB_DEEP}20` }}` | (unchanged) | Hex-with-alpha string concatenation needs JS, not a Tailwind class. Token value flows through the LAB_DEEP runtime read. EXACT — already canonical at the value level. |
| DocumentBadge.tsx:76 (icon stroke — inline style) | 76 | `style={{ color: LAB_DEEP }}` | (unchanged) | Inline `color: LAB_DEEP` is the canonical pattern for an inline-styled icon. EXACT. |
| DocumentBadge.tsx:81 (eyebrow color — inline style) | 81 | `style={{ color: LAB_DEEP }}` | (unchanged) | EXACT. Color audit row already covers all 5 sites in one batch. |
| DocumentBadge.tsx:111 (accent bar bg — inline style) | 111 | `style={{ backgroundColor: LAB_DEEP }}` | (unchanged) | EXACT. |
| DocumentBadge.tsx:58 (card chrome) | 58 | `border border-border bg-background` | (unchanged — EXACT no-op per audit row DocumentBadge.tsx:58) | Already canonical. |
| DocumentBadge.tsx:60 (hover border — raw hex with alpha) | 60 | `hover:border-[#C44878]/40` | `hover:border-house-publications-deep/40` | Replace arbitrary value with token-driven utility. Tailwind v4 alpha modifier syntax works on `@theme` tokens. |
| DocumentBadge.tsx:61 (focus ring — ring-ring holdout) | 61 | `focus-visible:ring-2 focus-visible:ring-ring` | `focus-visible:ring-2 focus-visible:ring-house-publications-deep/40` | Per directive 3 from the FRAC-20 orchestrator: normalize all 5 Lab focus sites on `house-publications-deep` with `/40` alpha. The audit row says `NEAR` (different from the others which are EXACT) precisely because this site was the holdout on `ring-ring`. After the migration, every focusable in the Lab graph reads the same focus chrome. |
| DocumentBadge.tsx:89,99,103 (text-muted-foreground) | 89, 99, 103 | `text-muted-foreground` on the ArrowUpRight icon, author paragraph, description paragraph | (unchanged — EXACT no-op per audit row) | Already canonical. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| DocumentBadge.tsx:80 (eyebrow — Publication label) | 80 | `<span className="text-eyebrow" style={{ color: LAB_DEEP }}>` | (unchanged — EXACT no-op per audit row) | Already on `.text-eyebrow`. |
| DocumentBadge.tsx:94 (h3 title with subtitle utility) | 94 | `<h3 className="text-subtitle leading-snug normal-case">` | (unchanged — NEAR, but `.text-subtitle` and `normal-case` already override the h-tag italic + uppercase. `leading-snug` is documented acceptable drift in the audit row) | No-op. |
| DocumentBadge.tsx:99 (author byline — text-sm to text-meta) | 99 | `<p className="text-sm text-muted-foreground mt-1">` | `<p className="text-meta text-muted-foreground mt-1">` | Migrate to `.text-meta` per audit row. `.text-meta` already sets `text-sm` so the size is preserved; family flips Inter→JBM, weight 400→500, adds uppercase + 0.1em tracking. Semantic role (inline author metadata) matches the chrome tier. |
| DocumentBadge.tsx:103 (description — text-sm to text-body) | 103 | `<p className="text-sm text-muted-foreground mt-3 leading-relaxed">` | `<p className="text-body text-muted-foreground mt-3 leading-relaxed">` | Migrate to `.text-body`. **Note size delta:** `.text-body` is `text-base` (16px); the current call site is `text-sm` (14px). Per audit row, "Apply task should size up to text-base or document the smaller-body decision." Plan choice: size up to `text-base`. The forward observation at audit doc lines 337-345 flags this as a possible future container-scoped utility need, but today the canonical resolution is `.text-body`. `leading-relaxed` preserved as documented acceptable drift. |

---

### 4. `src/components/lab/DocumentGrid.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| DocumentGrid.tsx:26,29 (text-muted-foreground) | 26, 29 | `text-muted-foreground` | (unchanged — EXACT no-op per audit row) | Already canonical. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| DocumentGrid.tsx:26 (empty-state lede) | 26 | `<p className="text-lg font-light text-muted-foreground">` | `<p className="text-body-lead text-muted-foreground">` | Migrate to `.text-body-lead`. `font-light` (weight 300) and `text-lg` are both subsumed by `.text-body-lead`. EXACT match per audit row — drop the redundant utilities. |
| DocumentGrid.tsx:29 (empty-state secondary line — text-sm to text-body) | 29 | `<p className="text-sm text-muted-foreground mt-2">` | `<p className="text-body text-muted-foreground mt-2">` | Same pattern as DocumentBadge.tsx:103 — size up to text-base per audit row's documented Apply-task choice. |

---

### 5. `src/components/lab/ArchiveToolbar.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| ArchiveToolbar.tsx:47,60,61 (text-muted-foreground + hover:text-foreground) | 47, 60, 61 | `text-muted-foreground`, `hover:text-foreground` | (unchanged — EXACT no-op) | Already canonical. |
| ArchiveToolbar.tsx:49,53 (text-foreground numerals) | 49, 53 | `text-foreground` | (unchanged — EXACT no-op) | Already canonical. |
| ArchiveToolbar.tsx:64 (Clear filters focus ring — raw hex with alpha) | 64 | `focus:ring-[#C44878]/40` | `focus:ring-house-publications-deep/40` | Replace arbitrary value with token-driven utility. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| ArchiveToolbar.tsx:46 (text-sm parent wrapper) | 46 | `<div className="flex items-center justify-between text-sm">` | (unchanged — wrapper sets text-sm context for children; not a row in the audit on its own) | Keep. The child paragraphs at lines 47/49/53 inherit `text-sm`; .text-meta also lands at text-sm so the inheritance still works after the migration. |
| ArchiveToolbar.tsx:47 (result-count paragraph) | 47 | `<p className="text-muted-foreground font-light">` | `<p className="text-meta text-muted-foreground font-light">` | Migrate to `.text-meta` per audit row. Note: `.text-meta` sets font-weight 500, but `font-light` (300) is also on the className. The audit doc's row 124 explicitly bumps the inline numeric children to 500 with `font-medium` (a deliberate visual emphasis on the count). To preserve the visual hierarchy where the static "Showing/of" prose reads lighter than the numerals, **keep `font-light` on the parent `<p>`** — `.text-meta`'s `font-weight: 500` will be overridden by the later `font-light`. Result: parent prose is 300 weight (matches existing rendering), numerals stay at 500 via `font-medium`. The audit row Rationale explicitly accepts NEAR drift on weight; we're choosing the side that preserves the current visual emphasis. |
| ArchiveToolbar.tsx:49,53 (font-medium numerals) | 49, 53 | `<span className="font-medium text-foreground">` | (unchanged — covered by parent's `.text-meta` cascade; the `font-medium` here aligns with `.text-meta`'s native weight 500) | The audit row collapses 49+53 to a single row. After the parent migration, these spans inherit `.text-meta` family/case/tracking and `font-medium` keeps them at weight 500. No standalone edit needed. |
| ArchiveToolbar.tsx:56 (Clear filters button) | 56-65 | `<button … className="text-sm font-medium text-muted-foreground hover:text-foreground underline …">` | `<button … className="text-label text-muted-foreground hover:text-foreground underline …">` | Migrate to `.text-label` per audit row. `.text-label` is identical rendering to `.text-eyebrow` / `.text-meta` (JBM, weight 500, uppercase, tracking 0.1em, text-sm). Drop `text-sm` and `font-medium` (now subsumed). Underline + offset preserved. Color row above handles the focus ring at line 64. **Visual side-effect to verify:** the button text "Clear filters" now renders uppercase as "CLEAR FILTERS" — this is the intended Chrome-tier rendering, but should be sanity-checked in the browser at 375px. |

---

### 6. `src/components/lab/ArchiveSearch.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| ArchiveSearch.tsx:27 (Search icon stroke) | 27 | `text-muted-foreground` | (unchanged — EXACT no-op) | Already canonical. |
| ArchiveSearch.tsx:42,43 (input chrome bundle) | 42, 43 | `bg-background border border-border text-foreground placeholder:text-muted-foreground` | (unchanged — EXACT no-op per audit row covering all 4 tokens) | Already canonical. |
| ArchiveSearch.tsx:45 (input focus ring + border) | 45 | `focus:ring-2 focus:ring-[#C44878]/40 focus:border-[#C44878]/60` | `focus:ring-2 focus:ring-house-publications-deep/40 focus:border-house-publications-deep/60` | Replace arbitrary values with token-driven utilities. |
| ArchiveSearch.tsx:58 (clear button text — muted-foreground + hover:text-foreground) | 58 | `text-muted-foreground hover:text-foreground` | (unchanged — EXACT no-op) | Already canonical. |
| ArchiveSearch.tsx:60 (clear button focus ring) | 60 | `focus:ring-2 focus:ring-[#C44878]/40` | `focus:ring-2 focus:ring-house-publications-deep/40` | Replace arbitrary value with token-driven utility. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| ArchiveSearch.tsx:32 (input — text-base font-light) | 32 | `text-base font-light` | **DEFERRED to FRAC-41 — leave unchanged.** | **Scope adjustment from human dialogue (2026-06-08, with Julianna).** The human chose to add a new canonical mono input typography tier to DESIGN.md rather than migrate to `.text-body-lead` (audit's NEAR fit) or keep audit-divergent. Existing canonical mono utilities (`.text-eyebrow`/`.text-label`/`.text-meta`) are all uppercase + text-sm — they break input UX (forces typed text uppercase + iOS zoom-on-focus). Adding a DESIGN.md utility is out of FRAC-21 scope (handoff directive 5: "No DESIGN.md or audit-prompt changes from FRAC-21"). FRAC-41 tracks: (a) add the new mono input utility to DESIGN.md + `src/index.css`, and (b) migrate `ArchiveSearch.tsx:32` to it. **For FRAC-21: do nothing to this row.** Leave `text-base font-light text-foreground placeholder:text-muted-foreground` as-is. The reviewer should see the deferral comment on FRAC-21 (and the FRAC-41 task) and confirm this row is intentionally untouched. |

---

## PretextParagraph callsite refactor (LabPage:58) — STRUCTURAL

Called out separately because this is a component-to-tag swap, not a class rename. Per FRAC-20 orchestrator directive 1 and per FRAC-40's tracking of sitewide Pretext deletion.

### Before (LabPage.tsx lines 56-61)

```tsx
<PretextParagraph
  size={TEXT_SIZES.base}
  className="text-white mt-3 font-light max-w-xl"
>
  {"Essays, publications, and podcasts from the minds behind Fractal Labs."}
</PretextParagraph>
```

### After

```tsx
<p className="text-body-lead text-background mt-3 font-light max-w-xl">
  Essays, publications, and podcasts from the minds behind Fractal Labs.
</p>
```

### What changes and why

| Aspect | Before | After | Why |
|---|---|---|---|
| Element type | `<PretextParagraph>` (React component) | `<p>` (HTML tag) | Pretext callsite migration per FRAC-40. |
| Size | `size={TEXT_SIZES.base}` (13px inline) | `text-body-lead` (text-lg = 18px) | Resolves the audit's GAP. Body-lede role at canonical 18px Inter weight 300. |
| Color | `text-white` | `text-background` | Per DESIGN.md → Text foregrounds. Cascade from `<main className="…text-background…">` actually means the `text-background` here is technically redundant — but keep it explicit so future agents reading the line don't have to trace cascade. |
| Children | `{"Essays, publications…"}` (string in braces) | `Essays, publications…` (raw JSX text) | The brace-wrap was only there because PretextParagraph required `children` as a string for its tokenization. A plain `<p>` takes raw text. |
| `font-light` | Kept on PretextParagraph as className | Kept on `<p>` as className | Redundant with `.text-body-lead` (which is already weight 300) but harmless. Implementer choice whether to drop it; default plan: drop it for cleanliness. |
| `mt-3 max-w-xl` | Layout utilities | Layout utilities (unchanged) | Pure layout, preserved. |

### Cleaned-up final form (recommended)

```tsx
<p className="text-body-lead mt-3 max-w-xl">
  Essays, publications, and podcasts from the minds behind Fractal Labs.
</p>
```

(Drops the now-redundant `text-background` because the page-level cascade handles it, and drops `font-light` because `.text-body-lead` already pins weight 300. Both drops are safe; if the implementer prefers explicitness, keep them.)

### Side-effect: imports removed from LabPage.tsx

```tsx
- import { PretextParagraph } from "@/components/pretext/PretextParagraph";
- import { TEXT_SIZES } from "@/lib/pretext";
```

Verify before removing: `grep -n "PretextParagraph\|TEXT_SIZES" src/pages/LabPage.tsx` should return 0 matches after the callsite edit. If it returns anything other than zero, the implementer missed a site — investigate before removing the imports.

---

## Commit strategy

Suggested commit boundaries — logical, reviewable units, mobile-first verification gates between them:

1. **Commit 1: `chore(theme): declare house-publications-{light,deep} tokens in @theme`**
   - File: `src/index.css` only.
   - Adds the two `--color-house-publications-*` declarations + comment block.
   - Smoke test: `pnpm typecheck` (must pass), `pnpm test` (must hit baseline only).
   - Why isolated: gives the next commits a token to reference.

2. **Commit 2: `refactor(lab): migrate LabPage to canonical tokens and typography utilities`**
   - File: `src/pages/LabPage.tsx` only.
   - Includes the PretextParagraph→`<p>` swap, the text-display no-op confirmation, the eyebrow + title migrations, the SectorHeader prop color, the `bg-house-publications-light` + `text-background` cascade, the import cleanups.
   - Verify: typecheck, test, mobile 375px browser check.

3. **Commit 3: `refactor(lab): migrate DocumentBadge color + typography to canonical tokens`**
   - File: `src/components/lab/DocumentBadge.tsx` only.
   - Focus ring normalization, hover border token, author/description typography migrations.
   - Verify: typecheck, test, mobile 375px browser check.

4. **Commit 4: `refactor(lab): migrate DocumentGrid empty-state typography`**
   - File: `src/components/lab/DocumentGrid.tsx` only.
   - Two typography rows.
   - Verify: typecheck, test.

5. **Commit 5: `refactor(lab): migrate ArchiveToolbar typography + focus ring`**
   - File: `src/components/lab/ArchiveToolbar.tsx` only.
   - Three typography rows + one focus ring.
   - Verify: typecheck, test, mobile 375px browser check.

6. **Commit 6: `refactor(lab): migrate ArchiveSearch focus chrome to canonical tokens`**
   - File: `src/components/lab/ArchiveSearch.tsx` only.
   - Three focus-ring/border sites. Typography input row (`:32`) deliberately **untouched — deferred to FRAC-41** (new DESIGN.md mono input utility).
   - Verify: typecheck, test, mobile 375px browser check.

**Why six commits and not one mega-commit:** the orchestrator handoff lists "commit history clean (logical commits, not one mega-commit)" as an acceptance criterion. Splitting by file makes review tractable, lets the reviewer bisect any visual regression, and matches the audit doc's natural per-file structure.

**Acceptable alternative:** group commits 4+5+6 into one "migrate Lab search/grid/toolbar" commit if the implementer finds per-file commits too fine. Not acceptable: one giant commit covering everything.

---

## Test plan

### At every commit gate

```
pnpm typecheck   # MUST pass — clean exit
pnpm test        # MUST show baseline failures only (4 documented; see below)
pnpm lint        # MUST pass — no new lint errors
```

### Documented baseline test failures (NOT regressions)

Per FRAC-20 orchestrator directive 6, the following pre-existing failures live on this branch and are NOT introduced by FRAC-21:

1. Footer FRAC-88 italic test
2. Footer Jacquard test
3. Navigation mobile labels test
4. Neighborhood min-h-screen test

Any test failure OUTSIDE this list is a regression and must be investigated before the next commit. If the implementer can't immediately explain a new failure, halt and `lattice comment` the task with the failure stack trace.

### Mobile 375px browser verification (mandatory per PRD + CLAUDE.md)

After each visible-rendering commit (commits 2, 3, 5, 6 above), open the dev server at 375px viewport width and visually verify:

- [ ] Page bg is the same pink (#E870A0) as before — the `bg-house-publications-light` utility should render identically to the previous inline style.
- [ ] Page-level text is cream (#f8f6f0) by cascade — the "Research + Writing" eyebrow, the "Essays, publications…" lede, and any unstyled body text on the page renders cream-on-pink.
- [ ] "Research + Writing" eyebrow is **upright** (not italic) — the `not-italic` override fixed the h2 global-rule drift.
- [ ] "The Records" section title renders at the canonical `.text-title` size (`text-3xl mobile, text-5xl md+`) — slightly larger than before at desktop widths.
- [ ] DocumentBadge cards on cream `bg-background` over the pink page:
  - Hover: border lights to `house-publications-deep/40` (deeper pink).
  - Focus (Tab to a card): ring renders as 2px `house-publications-deep/40` (deeper pink with alpha), same chrome as the search input. No charcoal `ring-ring`.
  - Author byline (`.text-meta`) reads as uppercase JBM tracked metadata, not the previous Inter prose.
  - Description (`.text-body`) reads slightly larger than before (text-sm → text-base, 14px → 16px).
- [ ] DocumentGrid empty state (trigger via search like `xkcd nonsense`): lede + secondary line render at `.text-body-lead` and `.text-body` respectively.
- [ ] ArchiveToolbar result count (visible while filtering): prose at `.text-meta` (JBM uppercase tracked), numerals at weight 500. "Clear filters" button now renders uppercase `CLEAR FILTERS` per `.text-label`.
- [ ] ArchiveSearch input: focus ring and focus border are `house-publications-deep` with alpha; clear-button focus ring same; placeholder text is muted-foreground; input typography is **untouched — `text-base font-light` remains verbatim** (deferred to FRAC-41). Confirm no iOS zoom regression.
- [ ] No selection-color regression — `selection:bg-foreground selection:text-background` should still highlight selected text as charcoal-on-cream when selected.

### After the final commit

Re-run all three commands fresh:

```
pnpm typecheck && pnpm test && pnpm lint
```

Confirm baseline-only failures remain, then proceed to the review handoff.

---

## Acceptance criteria

The review sub-agent reads cold, with only the audit doc + this plan as context. The implementation is accepted when:

- [ ] Every audit row in `.lattice/notes/audits/lab-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op in this plan and in the commit messages).
- [ ] `src/index.css` carries the two `--color-house-publications-{light,deep}` declarations in `@theme inline`, with the explanatory comment block; no other `index.css` changes.
- [ ] LabPage.tsx renders cream-on-pink by cascade; no `text-white` remains in the file; no raw `#E870A0` inline style; SectorHeader prop is `var(--color-house-publications-deep)`.
- [ ] PretextParagraph is no longer imported or rendered in LabPage.tsx; the lede renders as a plain `<p className="text-body-lead …">`.
- [ ] DocumentBadge.tsx focus ring is `ring-house-publications-deep/40`; hover border is `house-publications-deep/40`; author uses `.text-meta`; description uses `.text-body`.
- [ ] DocumentGrid.tsx empty-state lede uses `.text-body-lead`; secondary line uses `.text-body`.
- [ ] ArchiveToolbar.tsx result-count prose uses `.text-meta`, Clear filters button uses `.text-label`, focus ring is `ring-house-publications-deep/40`.
- [ ] ArchiveSearch.tsx three focus sites all use `house-publications-deep/40` (ring) or `/60` (border); input typography (`:32`) is **deferred to FRAC-41 and left untouched** (verbatim `text-base font-light text-foreground placeholder:text-muted-foreground …`). This is documented in the FRAC-21 plan and Lattice comment from 2026-06-08; not a missed migration.
- [ ] No `.text-body-mono` utility was introduced.
- [ ] No DESIGN.md changes. No `.lattice/notes/audit-prompt.md` changes. No audit-doc changes. No `houses.ts` changes. No `PretextParagraph.tsx` or `pretext.ts` deletions.
- [ ] No files modified outside the scope list: `src/index.css`, `src/pages/LabPage.tsx`, `src/components/lab/{DocumentGrid,DocumentBadge,ArchiveToolbar,ArchiveSearch}.tsx`.
- [ ] `pnpm typecheck` passes clean on the final commit.
- [ ] `pnpm test` shows the 4 documented baseline failures and nothing else.
- [ ] `pnpm lint` passes clean.
- [ ] Mobile 375px browser verification documented in the implementer's review-handoff `lattice comment` — screenshot or explicit per-bullet check.
- [ ] Commit history is the 4-6 logical commits suggested above (or a reasoned-out alternative); not one mega-commit, not amended-into-oblivion.
- [ ] No work in `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, or `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md` (other agents' shared-worktree territory).

---

## Open questions — resolved by human-in-loop dialogue (2026-06-08, with Julianna)

All four planner open questions were answered before implementation kicked off. The resolutions are baked into the plan above; restated here for the implementer's clarity.

1. **Scope of token declaration in commit 1 — RESOLVED: only the Publications pair.** Default stands. Do NOT expand scope autonomously.

2. **ArchiveSearch input typography — RESOLVED: defer to FRAC-41.** Human chose to add a new canonical mono input utility to DESIGN.md rather than migrate to `.text-body-lead` (audit's NEAR fit) or keep audit-divergent. Adding a DESIGN.md utility is out of FRAC-21 scope (handoff directive 5). FRAC-41 owns both the DESIGN.md addition AND the ArchiveSearch:32 migration. **For FRAC-21: leave `ArchiveSearch.tsx:32` input typography (`text-base font-light text-foreground placeholder:text-muted-foreground …`) untouched.** Don't substitute a different utility. The reviewer should see this deferral comment on FRAC-21 (and FRAC-41) and confirm the row is intentionally untouched.

3. **ArchiveToolbar result-count weight cascade — RESOLVED: defer to implementer judgment.** Human had no strong preference. Plan default stands (keep `font-light` on prose, `font-medium` on numerals). If you have a strong reason to unify, comment in the PR description.

4. **Visual size delta `text-sm → text-base` in DocumentBadge description + DocumentGrid empty-state — RESOLVED: accept the size-up.** Plan default stands. Verify the visual at 375px before committing.

---

## Methodology summary (concise)

1. Land token declarations first (`src/index.css`).
2. Migrate one file per commit, top-to-bottom in import order: LabPage → DocumentBadge → DocumentGrid → ArchiveToolbar → ArchiveSearch.
3. After every file's commit: typecheck + test + lint + 375px browser check.
4. After all commits: final full test run, then comment on the task with the verification summary, then move task to `review`.
5. Open the PR. The orchestrator handles the review sub-agent spawn.
