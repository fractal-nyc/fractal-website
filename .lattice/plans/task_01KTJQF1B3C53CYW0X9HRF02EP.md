# FRAC-29 — Apply New Liberal Arts page audit findings

**Task:** `task_01KTJQF1B3C53CYW0X9HRF02EP`
**Branch:** `frac-29-apply-new-liberal-arts` (off `frac-28-audit-new-liberal-arts`, not master — the FRAC-28 audit doc + audit-gaps context are upstream of this work and aren't on master yet, PR #190 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/new-liberal-arts-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### House palette values`, `### The forum/school page-bg inversion`, `### Text foregrounds`, `### Surface foreground pairing`, `### Semantic type scale`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)
**Audit author/date:** FRAC-28 / 2026-06-09

---

## Preamble

### Audit spec is frozen

The audit doc at `.lattice/notes/audits/new-liberal-arts-audit.md` is the spec for this Apply task. Do NOT edit it. Every typography and color row below maps 1:1 to an audit row.

### Branch ordering — off the audit branch, not master

The FRAC-28 audit branch (`frac-28-audit-new-liberal-arts`) has the audit doc but is not yet merged to master (PR #190 open). This branch is cut directly off `origin/frac-28-audit-new-liberal-arts` to keep the spec in the diff context. The PR for FRAC-29 targets `frac-28-audit-new-liberal-arts` (NOT master), mirroring FRAC-25's pattern.

### Inversion + paired-from-day-one

New Liberal Arts IS a house page. Internal id `school`, displayName "Education", canonical token slug prefix `house-education-{light,deep}`. Per DESIGN.md → "The forum/school page-bg inversion":

- **`house-education-deep` (`#5C1010`) IS the page background** — INVERTED arrangement.
- **`house-education-light` (`#B52828`) is the canonical accent** (SectorHeader letter, "Education" eyebrow, FractalPattern decorative fill).
- **Body voice on the `{deep}` page bg is cream via `text-house-education-deep-foreground`** — the paired-foreground sibling — NOT the saturated `{light}` accent.

**CRITICAL INVERSION RULE (carried verbatim from the audit):** A row migrating `text-white` → `text-house-education-light` would be **wrong**. The correct migration target is `text-house-education-deep-foreground` (paired foreground of the `{deep}` page surface). Every color row below honors this rule explicitly.

This is the second Apply task to land paired-from-day-one tokens (FRAC-25 was first for Campus); FRAC-29 declares all four `house-education-*` siblings together in a single `@theme inline` block, mirroring FRAC-25's `house-campus-*` block.

---

## Scope

**FRAC-29 changes only `src/`.** Specifically the page-level `<main>` in `src/pages/LiberalArtsPage.tsx`, the section body `src/components/sections/LiberalArts.tsx`, plus a single declarative addition to `src/index.css` to register four `house-education-*` Tailwind theme tokens (light, deep, light-foreground, deep-foreground) under the FRAC-42 paired-from-day-one convention.

### In scope

- `src/index.css` — add the four `--color-house-education-*` declarations inside `@theme inline`, extending the existing FRAC-21 + FRAC-25 + FRAC-42 comment block to include the FRAC-29 Education addition.
- `src/pages/LiberalArtsPage.tsx` — the page entry (17 lines). Migrate the `<main>` inline `style={{ backgroundColor: "#5C1010" }}`, the `text-white` className (body voice), and the inverted selection chrome (`selection:bg-white selection:text-[#5C1010]`) → token utilities; remove the `style` prop entirely.
- `src/components/sections/LiberalArts.tsx` — the section body (~74 lines). Bulk migration: section root inline `style={{ color: "#fff" }}`, four `text-white/90` sites on PretextParagraph children, and the SectorHeader prop's raw `#C41E20` (NEAR migration to `house-education-light` — value drift documented).

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/new-liberal-arts-audit.md`) — frozen as spec.
- `DESIGN.md`, `.lattice/notes/audit-prompt.md`, `.lattice/notes/audit-gaps.md` — FRAC-19 / FRAC-20 / FRAC-42 / FRAC-24 / FRAC-47 owned those edits. No new audit-gaps entry: the Pretext JBM cluster on LiberalArts is covered by the existing Lab entry at `audit-gaps.md:27-32` per the audit's sitewide-dedup rule.
- `FractalPattern.tsx` and the `<FractalPattern color="#B52828" />` call site at `LiberalArtsPage.tsx:9` — explicitly excluded per FRAC-20 (Lab) precedent carried by FRAC-24 (Campus) and re-confirmed by the FRAC-28 audit's EXCLUDED row.
- `Navbar.tsx`, `Footer.tsx`, `FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome.
- `SectorHeader.tsx` internals — audited separately. Only the call-site `color` prop at `LiberalArts.tsx:11` is in scope.
- `Button` component (`button.tsx`) internals — typography locked via `buttonVariants`. The two `<Button asChild>` call sites at `LiberalArts.tsx:37,46` only carry layout classes (`max-w-xs w-full text-center`); no inline color/typography overrides exist. No migration row.
- `PretextParagraph.tsx` internals — shared component; its typography rendering pattern is the sitewide Lab GAP already logged. Only the `className` color values at each call site migrate; sizes and family are preserved verbatim.
- No `pnpm install`, no `package.json` changes, no new tests.
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, sibling task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*` and `task_01KTNAJ1BTKEDV16FGWKYAYXJY.md`.

---

## House token declaration decision

**Decided: declare all four `--color-house-education-*` siblings together in `src/index.css` `@theme inline` — second Apply task to land the FRAC-42 paired-from-day-one pattern (after FRAC-25 Campus).**

### Why all four at once

FRAC-25 Campus established the paired-from-day-one precedent. FRAC-29 Education mirrors it: a new house gets its `light`, `deep`, `light-foreground`, and `deep-foreground` tokens declared together in a single block. DESIGN.md → `### Surface foreground pairing` is the binding rule: "Every surface token has a paired foreground token."

The four token names:
- `--color-house-education-light` (= `#B52828`)
- `--color-house-education-deep` (= `#5C1010`)
- `--color-house-education-light-foreground` (= `var(--color-background)`, resolves to cream `#f8f6f0`)
- `--color-house-education-deep-foreground` (= `var(--color-background)`)

This makes the following Tailwind utilities available throughout `src/`:
- `bg-house-education-{light,deep}`, `text-house-education-{light,deep}` (display/highlight use only — DESIGN.md "House colors for display and highlight" rule)
- `text-house-education-{light,deep}-foreground`, `bg-house-education-{light,deep}-foreground`, `border-house-education-{light,deep}-foreground`, `decoration-house-education-{light,deep}-foreground`
- All with the standard `/<NN>` alpha modifier (e.g. `text-house-education-deep-foreground/90`).

### Exact edit to `src/index.css`

The current Campus block at lines 58–61 ends with `--color-house-campus-deep-foreground: var(--color-background);` (line 61). Append a new four-line block immediately after, and extend the FRAC-21+25+42 comment block to credit FRAC-29. Final structure:

```css
  /* House palette tokens (FRAC-21, FRAC-25, FRAC-29) + paired foregrounds (FRAC-42).
     Static brand hexes — declared directly without the hsl(var(...))
     indirection used by surface tokens above, because house colors do
     not theme-swap (no dark mode per FRAC-30) and the indirection
     would add no value. See DESIGN.md → House palette values for the
     full set; FRAC-21 lands the Publications pair, FRAC-25 lands the
     Campus pair, FRAC-29 lands the Education pair (the remaining 3
     pairs land in their respective per-house Apply tasks).

     Each house surface ships an explicit *-foreground sibling per the
     shadcn/Material-3 pairing convention (FRAC-42). Today every
     declared foreground sibling resolves to cream; see DESIGN.md
     → Surface foreground pairing for the rule and the four canonical
     pairs. FRAC-25 was the first Apply task to declare both surface
     and paired-foreground siblings together from day one; FRAC-29
     continues that convention for Education. */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
  --color-house-publications-light-foreground: var(--color-background);
  --color-house-publications-deep-foreground: var(--color-background);

  --color-house-campus-light: #2E6B4A;
  --color-house-campus-deep: #1A3A2E;
  --color-house-campus-light-foreground: var(--color-background);
  --color-house-campus-deep-foreground: var(--color-background);

  --color-house-education-light: #B52828;
  --color-house-education-deep: #5C1010;
  --color-house-education-light-foreground: var(--color-background);
  --color-house-education-deep-foreground: var(--color-background);
```

Four new lines inserted immediately after the existing `--color-house-campus-deep-foreground: var(--color-background);`, with the comment block extended to credit FRAC-29. No other `index.css` edits.

---

## Per-file migration plan

### 1. `src/index.css` (declaration only)

Single block insertion described above. No other changes.

### 2. `src/pages/LiberalArtsPage.tsx` — page-level surface migration

The only edit in this file:

**Before (line 8):**
```jsx
<main className="relative min-h-screen text-white selection:bg-white selection:text-[#5C1010]" style={{ backgroundColor: "#5C1010" }}>
```

**After (line 8):**
```jsx
<main className="relative min-h-screen bg-house-education-deep text-house-education-deep-foreground selection:bg-house-education-deep-foreground selection:text-house-education-deep">
```

Drops the entire `style` prop. The `bg-house-education-deep` utility renders the `#5C1010` page bg (INVERTED `{deep}` not `{light}`); `text-house-education-deep-foreground` renders cream (`#f8f6f0`) which is the imperceptible-delta migration from `#ffffff`. Inverted selection chrome migrates to the token-driven editorial inversion (cream selection on deep-red page).

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| LiberalArtsPage.tsx:8 (bg) | 8 | `style={{ backgroundColor: "#5C1010" }}` | `bg-house-education-deep` in className | Inline → token utility. EXACT match (#5C1010 → house-education-deep). |
| LiberalArtsPage.tsx:8 (text) | 8 | `text-white` in className | `text-house-education-deep-foreground` in className | Per DESIGN.md → Text foregrounds + FRAC-42 surface-foreground pairing. Cascade resolves all descendants that don't override. NEAR (#ffffff vs #f8f6f0 imperceptible). |
| LiberalArtsPage.tsx:8 (style prop) | 8 | `style={{ backgroundColor:… }}` | Remove the `style={}` prop entirely | After the inline bg migrates, the `style` prop is empty and should be deleted. |
| LiberalArtsPage.tsx:8 (selection bg) | 8 | `selection:bg-white` | `selection:bg-house-education-deep-foreground` | Inverted editorial selection chrome preserved via paired-foreground token. NEAR. |
| LiberalArtsPage.tsx:8 (selection text) | 8 | `selection:text-[#5C1010]` | `selection:text-house-education-deep` | Raw-hex arbitrary value → token utility. EXACT. |
| LiberalArtsPage.tsx:9 (FractalPattern color) | 9 | `<FractalPattern color="#B52828" />` | unchanged — out of scope | EXCLUDED per audit row. |

### 3. `src/components/sections/LiberalArts.tsx` — section migrations

#### 3a. Section root inline color (LiberalArts.tsx:9)

**Before:**
```jsx
<section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden" style={{ color: "#fff" }}>
```

**After:**
```jsx
<section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden text-house-education-deep-foreground">
```

Choose the explicit className path (per FRAC-23 / FRAC-25 precedent) rather than dropping color entirely — the explicit re-assertion is immune to future restructure of the `<main>` cascade. Drop the `style` prop entirely after migration.

#### 3b. SectorHeader prop migration (LiberalArts.tsx:11)

**Before:**
```jsx
<SectorHeader letter="E" name="Education" color="#C41E20" />
```

**After:**
```jsx
<SectorHeader letter="E" name="Education" color="var(--color-house-education-light)" />
```

**Value drift note (the only NEAR-with-perceptible-delta on this page):** the source hex `#C41E20` does NOT match either canonical Education palette value. It is closest to `house-education-light` (`#B52828`) in hue and luminance but slightly more saturated. Migrating to the token absorbs a small chroma shift — the SectorHeader letter "E" and the "Education" eyebrow will render slightly less saturated red. Audit reviewer correction: house-light as a display/highlight color on the house's own inverted page is permitted under DESIGN.md → Text foregrounds. **This is the standout finding flagged for human review at PR time.** Mirrors the FRAC-25 CampusPage:190 token-via-CSS-var pattern (`color="var(--color-house-campus-deep)"`) and the FRAC-21 LabPage:24 precedent.

#### 3c. PretextParagraph text-white/90 cluster migration (LiberalArts.tsx:20, 31, 59, 65)

**Before (four sites; each PretextParagraph child carries `text-white/90` as its color className):**
```jsx
<PretextParagraph size={TEXT_SIZES.lg} className="text-white/90 mb-8">  // line 18-23
<PretextParagraph size={TEXT_SIZES.lg} className="text-white/90 mb-8">  // line 29-34
<PretextParagraph size={TEXT_SIZES.lg} className="text-white/90 mb-6">  // line 57-62
<PretextParagraph size={TEXT_SIZES.lg} className="text-white/90">       // line 63-68
```

**After (four sites; replace `text-white/90` with `text-house-education-deep-foreground/90`; preserve all other className tokens verbatim):**
```jsx
<PretextParagraph size={TEXT_SIZES.lg} className="text-house-education-deep-foreground/90 mb-8">
<PretextParagraph size={TEXT_SIZES.lg} className="text-house-education-deep-foreground/90 mb-8">
<PretextParagraph size={TEXT_SIZES.lg} className="text-house-education-deep-foreground/90 mb-6">
<PretextParagraph size={TEXT_SIZES.lg} className="text-house-education-deep-foreground/90">
```

Per audit color row: `text-white/90` is not a canonical token. Migration target is `text-house-education-deep-foreground/90` (paired foreground of the inverted `{deep}` page surface). NEAR (#ffffff vs #f8f6f0 imperceptible). **Critical inversion check:** the target is `house-education-DEEP-foreground`, NOT `house-education-light` (the saturated red accent would render dark-red-on-deep-red — illegible). Sitewide JBM mono cluster typography GAP is covered by the Lab entry at `audit-gaps.md:27-32`; no new gap log needed.

#### 3d. Typography rows (EXACT — no-op verifications)

| Audit row | Line | className | Action |
|---|---|---|---|
| `.text-display` row | 13 | `text-display mb-4 md:mb-6 text-center` | unchanged (EXACT no-op — already canonical) |
| `.text-subtitle` row | 28 | `text-subtitle mb-6 normal-case` (h3) | unchanged (EXACT no-op — already canonical; h3 italic+uppercase is overridden by the utility's `font-style:normal` and the inline `normal-case`) |
| PretextParagraph cluster typography | 18, 29, 57, 63 | (size={TEXT_SIZES.lg}, default body font) | unchanged — sitewide Lab GAP covers the JBM-mono body pattern |

#### 3e. Color rows summary

| Site | Before | After | Match quality |
|---|---|---|---|
| LiberalArtsPage.tsx:8 main bg | `style={{ backgroundColor: "#5C1010" }}` | `bg-house-education-deep` | EXACT |
| LiberalArtsPage.tsx:8 main text | `text-white` | `text-house-education-deep-foreground` | NEAR (imperceptible) |
| LiberalArtsPage.tsx:8 selection bg | `selection:bg-white` | `selection:bg-house-education-deep-foreground` | NEAR (imperceptible) |
| LiberalArtsPage.tsx:8 selection text | `selection:text-[#5C1010]` | `selection:text-house-education-deep` | EXACT |
| LiberalArts.tsx:9 section root | `style={{ color: "#fff" }}` | `text-house-education-deep-foreground` (className) | NEAR (imperceptible) |
| LiberalArts.tsx:11 SectorHeader | `color="#C41E20"` | `color="var(--color-house-education-light)"` | NEAR (small chroma shift — perceptible) |
| LiberalArts.tsx:20,31,59,65 Pretext | `text-white/90` (×4) | `text-house-education-deep-foreground/90` (×4) | NEAR (imperceptible) |
| LiberalArtsPage.tsx:9 FractalPattern | `color="#B52828"` | unchanged | EXCLUDED |

**Concrete diff guidance for the implementer:** small enough to migrate by hand. Post-edit grep:
```
grep -nE 'text-white|decoration-white|border-white|bg-white|bg-black|#fff|#5C1010|#C41E20|#B52828' src/pages/LiberalArtsPage.tsx src/components/sections/LiberalArts.tsx
```
After FRAC-29 this should return only the `#B52828` match at `LiberalArtsPage.tsx:9` (FractalPattern EXCLUDED). All other hits should be zero.

---

## Commit strategy

1. **Commit 1 — lattice state catchup.** Absorb the new plan file + lifecycle event/task bookkeeping (planner + planned + in_progress transitions). Stage explicitly by filename. Subject: `FRAC-29: lattice state catchup — planner + planned + in_progress lifecycle`.
2. **Commit 2 — declare house-education tokens.** `src/index.css` only. Subject: `FRAC-29: declare house-education-{light,deep} + paired foregrounds in @theme`. Body cites FRAC-42 paired-from-day-one convention and FRAC-25 Campus precedent.
3. **Commit 3 — migrate LiberalArtsPage surface.** `src/pages/LiberalArtsPage.tsx` only. Subject: `FRAC-29: migrate LiberalArtsPage main surface to canonical tokens`. Removes the inline `style` prop entirely; preserves the editorial inverted selection chrome via token utilities.
4. **Commit 4 — migrate LiberalArts.tsx text-white sites.** Section root inline color, four PretextParagraph text-white/90 className migrations. Subject: `FRAC-29: migrate LiberalArts.tsx text-white sites to text-house-education-deep-foreground`.
5. **Commit 5 — migrate LiberalArts.tsx SectorHeader prop.** SectorHeader `color="#C41E20"` → CSS var. Subject: `FRAC-29: migrate LiberalArts.tsx SectorHeader prop to var(--color-house-education-light)`. Body flags the small chroma shift for reviewer attention.

**Acceptable alternative:** merge Commits 4 + 5 into a single LiberalArts.tsx commit if the implementer judges the line count tractable. **Not acceptable:** one mega-commit covering everything.

---

## Test plan

### At every commit gate

```
pnpm typecheck   # MUST pass — clean exit
pnpm test        # MUST show baseline failures only (4 documented; see below)
```

### Documented baseline test failures (NOT regressions)

1. Footer FRAC-88 italic test
2. Footer Jacquard test
3. Navigation mobile labels test
4. Neighborhood min-h-screen test

Any failure OUTSIDE this list is a regression — halt and `lattice comment` the task with the stack trace.

### Mobile 375px browser verification (mandatory per PRD + CLAUDE.md)

After each visible-rendering commit (Commits 3–5), open the dev server at 375px viewport width and visually verify:

- [ ] Page bg is still the same deep red (`#5C1010`) — `bg-house-education-deep` renders identically.
- [ ] All body and chrome text reads cream (`#f8f6f0`) — imperceptible delta from prior `#ffffff`.
- [ ] SectorHeader monogram "E" + "Education" eyebrow render in `house-education-light` (`#B52828`) — slightly less saturated than the prior `#C41E20`. **This is the documented chroma shift; reviewer should eyes-on at 375px and confirm acceptability.**
- [ ] The four PretextParagraph passages (launch-date lede + three Fractal U body paragraphs) read cream/90 against the deep-red page bg.
- [ ] The two Button asChild "Learn More" and "Apply as Instructor" CTAs render unchanged (buttonVariants-locked typography; layout classes preserved).
- [ ] Selection: highlighting body text shows cream selection bg on deep-red page (editorial inversion preserved via paired-foreground token), with deep-red selection text.
- [ ] No layout regressions on the section at 375px (single-column).

### After the final commit

Re-run `pnpm typecheck && pnpm test` fresh. Confirm baseline-only failures remain. Move task to `review`.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/new-liberal-arts-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op / GAP-deferred / EXCLUDED).
- [ ] `src/index.css` carries all four `--color-house-education-{light,deep,light-foreground,deep-foreground}` declarations in `@theme inline` immediately after the Campus block; the FRAC-21+25+42 comment block is extended to credit FRAC-29.
- [ ] `src/pages/LiberalArtsPage.tsx:8` uses `bg-house-education-deep text-house-education-deep-foreground` in className; the `style` prop is removed entirely; inverted selection chrome migrated to `selection:bg-house-education-deep-foreground selection:text-house-education-deep`.
- [ ] `src/components/sections/LiberalArts.tsx:9` uses `className=".... text-house-education-deep-foreground"`; the `style={{ color: "#fff" }}` is removed.
- [ ] `LiberalArts.tsx:11` SectorHeader prop is `color="var(--color-house-education-light)"`.
- [ ] `LiberalArts.tsx:18-23, 29-34, 57-62, 63-68` four PretextParagraph children use `text-house-education-deep-foreground/90` (alpha preserved).
- [ ] No `text-white`, `text-white/<n>`, `selection:bg-white`, `color: "#fff"`, `color: "#5C1010"`, `color: "#C41E20"`, `selection:text-[#5C1010]`, or `style={{ backgroundColor: "#5C1010" }}` remains in LiberalArts.tsx or LiberalArtsPage.tsx. Grep verification returns only the FractalPattern `color="#B52828"` (EXCLUDED).
- [ ] `text-display` at LiberalArts.tsx:13 unchanged (EXACT no-op).
- [ ] `text-subtitle normal-case` at LiberalArts.tsx:28 unchanged (EXACT no-op).
- [ ] Four PretextParagraph children's `size={TEXT_SIZES.lg}` and family unchanged (sitewide Lab GAP covers the JBM-mono body pattern).
- [ ] No `DESIGN.md`, `.lattice/notes/audits/new-liberal-arts-audit.md`, `.lattice/notes/audit-prompt.md`, or `.lattice/notes/audit-gaps.md` changes.
- [ ] No files modified outside the scope list: `src/index.css`, `src/pages/LiberalArtsPage.tsx`, `src/components/sections/LiberalArts.tsx`, and the standard `.lattice/events/*` + `.lattice/tasks/*` + `.lattice/plans/task_01KTJQF1B3C53CYW0X9HRF02EP.md` lifecycle bookkeeping.
- [ ] `pnpm typecheck` passes clean.
- [ ] `pnpm test` shows the 4 documented baseline failures only.
- [ ] Mobile 375px browser verification documented in the implementer's review-handoff comment (or noted as deferred if dev server unavailable).
- [ ] Commit history is 3–5 logical commits.
- [ ] PR target is `frac-28-audit-new-liberal-arts`, NOT master.
- [ ] PR body flags the SectorHeader `#C41E20 → #B52828` chroma shift for reviewer attention.

---

## Review gate

Spawn a fresh-context reviewer to:
1. Read this plan and the audit doc cold.
2. Diff against `pnpm typecheck` + `pnpm test` (baseline-only failures).
3. Verify every audit row has a corresponding edit.
4. Verify inversion rule honored (no `text-house-education-light` as body voice).
5. Verify the four `house-education-*` tokens declared in `index.css`.
6. Record findings via `lattice comment FRAC-29 ... --role review`.
7. Move to `done` (or send back per the rework loop in CLAUDE.md).

---

## Open questions (low-severity)

1. **SectorHeader chroma shift (`#C41E20` → `#B52828`) — confirm acceptance.** Most visible rendering change in the PR; the only NEAR-with-perceptible-delta. Audit's `MIGRATE` action accepts the shift; PR body flags it for reviewer attention. Default: accept; the human-eyes-on call goes to the reviewer at 375px. Alternative: keep `#C41E20` as a one-off and propose a `house-education-accent` palette tweak follow-up — out of scope for FRAC-29.
2. **Inverted selection chrome via paired-foreground token vs FRAC-42 canonical.** Two options:
   - **Chosen:** `selection:bg-house-education-deep-foreground selection:text-house-education-deep` (preserves editorial inversion via tokens).
   - **Alternative:** switch to the FRAC-42 canonical `selection:bg-foreground selection:text-background` (charcoal selection on cream — breaks the editorial inversion).
   Default: preserve the editorial inversion per audit recommendation.
3. **`text-house-education-light` and `text-house-education-deep` standalone utilities — used anywhere?** No — the migrations consume only the `*-deep-foreground` sibling and `var(--color-house-education-light)` (passed to SectorHeader as a CSS-var string). The `light` and `deep` color utilities are declared for future use.

---

## Implementation order

1. Read this plan; re-read FRAC-22 PRD per CLAUDE.md mandatory check; re-read `new-liberal-arts-audit.md` once more.
2. Verify `git status` matches expected dirty state (lattice FRAC-29 files + plan).
3. Commit 1 — lattice catchup (stage explicit FRAC-29 files only).
4. Commit 2 — `src/index.css` token declarations.
5. Commit 3 — `src/pages/LiberalArtsPage.tsx` surface migration.
6. Commit 4 — `src/components/sections/LiberalArts.tsx` text-white migrations (section root + four PretextParagraph children).
7. Commit 5 — `src/components/sections/LiberalArts.tsx` SectorHeader prop migration.
8. Final test gate: `pnpm typecheck && pnpm test`. 375px browser verification.
9. `lattice status review` + `lattice comment` with verification summary.
10. Open PR targeting `frac-28-audit-new-liberal-arts` (NOT master).
