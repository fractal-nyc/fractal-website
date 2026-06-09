# FRAC-25 — Apply Campus page audit findings

**Task:** `task_01KTJQF0JQJHHCDYKEY6WJ7H8D`
**Branch:** `frac-25-apply-campus` (off `frac-24-audit-campus`, not master — the FRAC-24 audit doc + audit-gaps Campus italic-aside entry are upstream of this work and aren't on master yet, PR #187 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/campus-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### House palette values`, `### Text foregrounds`, `### Surface foreground pairing`, `### Semantic type scale`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)
**Audit author/date:** FRAC-24 / 2026-06-08

---

## Scope

**FRAC-25 changes only `src/`.** Specifically the page-level `<main>` in `src/pages/CampusPage.tsx` and the bulk-of-the-page section body `src/components/sections/Campus.tsx`, plus a single declarative addition to `src/index.css` to register four `house-campus-*` Tailwind theme tokens (light, deep, light-foreground, deep-foreground) under the FRAC-42 paired-from-day-one convention.

### In scope

- `src/index.css` — add the four `--color-house-campus-*` declarations inside `@theme inline`, extending the existing FRAC-21 + FRAC-42 Publications comment block to include the FRAC-25 Campus addition.
- `src/pages/CampusPage.tsx` — the page entry (17 lines). Migrate the `<main>` inline `style={{ backgroundColor: "#2E6B4A", color: "#fff" }}` → className tokens; remove the `style` prop entirely.
- `src/components/sections/Campus.tsx` — the section body (~610 lines). Bulk migration: 40+ `text-white[/<alpha>]` sites, the `inlineLinkClass` constant's `decoration-white/<alpha>` modifiers, `PhotoPlaceholder`'s `bg-white/5 border-white/10`, `PrimaryButton`'s `bg-black/<alpha>`, the McCarren blockquote's `border-white/30`, the SectorHeader prop's raw `#1A3A2E`, the section root's inline `style={{ color: "#fff" }}`, plus the typography NEAR migrations called out in the audit (body, title, subtitle).

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/campus-audit.md`) — frozen as spec.
- `DESIGN.md` and `.lattice/notes/audit-prompt.md` — FRAC-20 / FRAC-42 / FRAC-24 owned those edits.
- `FractalPattern.tsx` and the `<FractalPattern color="#1A3A2E" />` call site at `CampusPage.tsx:9` — explicitly excluded per FRAC-20 (Lab) precedent and the audit's EXCLUDED row.
- `Navbar.tsx`, `Footer.tsx`, `FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome.
- `SectorHeader.tsx` internals — audited separately.
- `Button` component (`button.tsx`) internals — typography locked via `buttonVariants`. Only the inline `bg-black/<alpha>` override at `Campus.tsx:161` is in scope.
- No `pnpm install`, no `package.json` changes, no new tests.
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`.

---

## House token declaration decision

**Decided: declare all four `--color-house-campus-*` siblings together in `src/index.css` `@theme inline` — the first Apply task to land the FRAC-42 paired-from-day-one pattern for a new house.**

### Why all four at once (vs. FRAC-21's two-then-FRAC-42-adds-two)

Lab/Publications was the first house declared (FRAC-21) and landed only `light` + `deep`. FRAC-42 came later and retrofitted the paired `*-foreground` siblings. **FRAC-25 is the first new house declared after FRAC-42 codified the convention** — so Campus gets it right in one PR. DESIGN.md → `### Surface foreground pairing` is the binding rule: "Every surface token has a paired foreground token."

The four token names:
- `--color-house-campus-light` (= `#2E6B4A`)
- `--color-house-campus-deep` (= `#1A3A2E`)
- `--color-house-campus-light-foreground` (= `var(--color-background)`, resolves to cream `#f8f6f0`)
- `--color-house-campus-deep-foreground` (= `var(--color-background)`)

This makes the following Tailwind utilities available throughout `src/`:
- `bg-house-campus-{light,deep}`, `text-house-campus-{light,deep}` (display/highlight use only — DESIGN.md "House colors for display and highlight" rule)
- `text-house-campus-{light,deep}-foreground`, `bg-house-campus-{light,deep}-foreground`, `border-house-campus-{light,deep}-foreground`, `decoration-house-campus-{light,deep}-foreground`
- All with the standard `/<NN>` alpha modifier (e.g. `text-house-campus-light-foreground/70`).

### Exact edit to `src/index.css`

The current Publications block at lines 38–54 ends with `--color-house-publications-deep-foreground: var(--color-background);` (line 54). Replace the block with:

```css
  /* House palette tokens (FRAC-21, FRAC-25) + paired foregrounds (FRAC-42).
     Static brand hexes — declared directly without the hsl(var(...))
     indirection used by surface tokens above, because house colors do
     not theme-swap (no dark mode per FRAC-30) and the indirection
     would add no value. See DESIGN.md → House palette values for the
     full set; FRAC-21 lands the Publications pair, FRAC-25 lands the
     Campus pair (the remaining 4 pairs land in their respective
     per-house Apply tasks).

     Each house surface ships an explicit *-foreground sibling per the
     shadcn/Material-3 pairing convention (FRAC-42). Today every
     declared foreground sibling resolves to cream; see DESIGN.md
     → Surface foreground pairing for the rule and the four canonical
     pairs. FRAC-25 is the first Apply task to declare both surface
     and paired-foreground siblings together from day one. */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
  --color-house-publications-light-foreground: var(--color-background);
  --color-house-publications-deep-foreground: var(--color-background);

  --color-house-campus-light: #2E6B4A;
  --color-house-campus-deep: #1A3A2E;
  --color-house-campus-light-foreground: var(--color-background);
  --color-house-campus-deep-foreground: var(--color-background);
```

Four new lines inserted immediately after the existing `--color-house-publications-deep-foreground: var(--color-background);`, with the comment block extended to credit FRAC-25 and to call out the paired-from-day-one milestone. No other `index.css` edits.

---

## Per-file migration plan

### 1. `src/index.css` (declaration only)

Single block insertion described above. No other changes.

### 2. `src/pages/CampusPage.tsx` — page-level surface migration

The only edit in this file:

**Before (line 8):**
```jsx
<main className="relative min-h-screen selection:bg-foreground selection:text-background" style={{ backgroundColor: "#2E6B4A", color: "#fff" }}>
```

**After (line 8):**
```jsx
<main className="relative min-h-screen bg-house-campus-light text-house-campus-light-foreground selection:bg-foreground selection:text-background">
```

Drops the entire `style` prop. The `bg-house-campus-light` utility renders the `#2E6B4A` page bg, `text-house-campus-light-foreground` renders cream (`#f8f6f0`) which is the imperceptible-delta migration from `#ffffff`. Selection chrome unchanged (FRAC-42-exempt paired-inverse).

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| CampusPage.tsx:8 (bg) | 8 | `style={{ backgroundColor: "#2E6B4A" }}` | `bg-house-campus-light` in className | Inline → token utility. |
| CampusPage.tsx:8 (text) | 8 | `style={{ color: "#fff" }}` | `text-house-campus-light-foreground` in className | Per DESIGN.md → Text foregrounds + FRAC-42 surface-foreground pairing. Cascade resolves all descendants that don't override. |
| CampusPage.tsx:8 (style prop) | 8 | `style={{ backgroundColor:…, color:… }}` | Remove the `style={}` prop entirely | After both inline values migrate, the `style` prop is empty and should be deleted. |
| CampusPage.tsx:8 (selection chrome) | 8 | `selection:bg-foreground selection:text-background` | unchanged — already canonical | Paired-inverse state; FRAC-42-exempt. |
| CampusPage.tsx:9 (FractalPattern color) | 9 | `<FractalPattern color="#1A3A2E" />` | unchanged — out of scope | EXCLUDED per audit row. |

### 3. `src/components/sections/Campus.tsx` — bulk migration

#### 3a. Section root inline color (Campus.tsx:185)

**Before:**
```jsx
<section id="campus" style={{ color: "#fff" }}>
```

**After:**
```jsx
<section id="campus" className="text-house-campus-light-foreground">
```

Choose the explicit className path (per FRAC-23 precedent) rather than dropping color entirely — the explicit re-assertion is immune to future restructure of the `<main>` cascade. Drop the `style` prop entirely after migration.

#### 3b. InlineLink constant migration (Campus.tsx:24-25)

**Before:**
```js
const inlineLinkClass =
  "underline decoration-white/40 hover:decoration-white transition-colors";
```

**After:**
```js
const inlineLinkClass =
  "underline decoration-house-campus-light-foreground/40 hover:decoration-house-campus-light-foreground transition-colors";
```

Propagates to every `<InlineLink>` consumer plus the **duplicate-of-the-constant** inline `<a>` at Campus.tsx:273 (Fractal U raw `<a>` outside `<InlineLink>`). Migrate Campus.tsx:273's `className="underline decoration-white/40 hover:decoration-white transition-colors"` to use the same migrated strings (keep the duplication; do not refactor to InlineLink — the audit didn't ask for it).

#### 3c. SectorHeader prop migration (Campus.tsx:190)

**Before:**
```jsx
<SectorHeader letter="C" name="Campus" color="#1A3A2E" />
```

**After:**
```jsx
<SectorHeader letter="C" name="Campus" color="var(--color-house-campus-deep)" />
```

Mirrors the FRAC-21 LabPage:24 pattern (`color="#C44878"` → `color="var(--color-house-publications-deep)"`).

#### 3d. PhotoPlaceholder migrations (Campus.tsx:173)

**Before (line 173):**
```jsx
<div className="aspect-[4/5] md:aspect-square w-full bg-white/5 border border-white/10 flex items-center justify-center">
```

**After (line 173):**
```jsx
<div className="aspect-[4/5] md:aspect-square w-full bg-house-campus-light-foreground/5 border border-house-campus-light-foreground/10 text-house-campus-light-foreground flex items-center justify-center">
```

Three migrations on one node: `bg-white/5` → `bg-house-campus-light-foreground/5`; `border-white/10` → `border-house-campus-light-foreground/10`; add `text-house-campus-light-foreground` to re-assert pairing per FRAC-42.

#### 3e. PrimaryButton override (Campus.tsx:161)

**Before:**
```jsx
className={cn(widthClass, "bg-black/20 hover:bg-black/30 text-center", wrapClass)}
```

**After:**
```jsx
className={cn(widthClass, "bg-foreground/20 hover:bg-foreground/30 text-center", wrapClass)}
```

Raw black → canonical `foreground` (charcoal `#171717`) at the same alpha. The translucent-charcoal-on-green composite with cream text cascading is an exempt composite — no additional `text-*` pairing addition needed here.

#### 3f. Blockquote (Campus.tsx:499)

**Before:**
```jsx
<blockquote className="border-l-2 border-white/30 pl-6 my-6 max-w-3xl">
```

**After:**
```jsx
<blockquote className="border-l-2 border-house-campus-light-foreground/30 pl-6 my-6 max-w-3xl">
```

#### 3g. Master text-white migration — every site, exhaustively

Per the audit's collapsed color row, every `text-white[/<alpha>]` Tailwind utility in Campus.tsx migrates to `text-house-campus-light-foreground[/<alpha>]`. **The implementer must hit every line.** Full per-site migration table:

| Line | Before (relevant fragment) | After (relevant fragment) |
|---|---|---|
| 174 | `text-label text-white/40` | `text-label text-house-campus-light-foreground/40` |
| 196 | `text-display text-white mb-4 text-center` | `text-display text-house-campus-light-foreground mb-4 text-center` |
| 200 | `font-serif text-lg md:text-xl text-white/80 mb-8 normal-case` | (typography NEAR migration in 3h supersedes; color migrates to `text-house-campus-light-foreground/80`) |
| 218 | `text-xs md:text-sm text-white/70 italic text-center` | `text-xs md:text-sm text-house-campus-light-foreground/70 italic text-center` (GAP-deferred typography; color migrates) |
| 233 | `text-sm md:text-base text-white/90 font-light leading-relaxed` | (typography NEAR migration supersedes; color migrates to `text-house-campus-light-foreground/90`) |
| 241 | `text-sm md:text-base text-white/90 font-light` | (typography NEAR; color migrates to `text-house-campus-light-foreground/90`) |
| 244 | `text-white/50` (em-dash bullet) | `text-house-campus-light-foreground/50` |
| 259 | `text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl` | (typography NEAR; color migrates) |
| 261 | `font-semibold text-white` | `font-semibold text-house-campus-light-foreground` |
| 268 | `font-semibold text-white` | `font-semibold text-house-campus-light-foreground` |
| 273 | `underline decoration-white/40 hover:decoration-white transition-colors` (raw `<a>` outside InlineLink) | `underline decoration-house-campus-light-foreground/40 hover:decoration-house-campus-light-foreground transition-colors` |
| 282 | `font-semibold text-white` (Members) | `font-semibold text-house-campus-light-foreground` |
| 286 | `font-semibold text-white` (Guests) | `font-semibold text-house-campus-light-foreground` |
| 302 | body paragraph | (typography NEAR; color migrates) |
| 324 | body paragraph | (typography NEAR; color migrates) |
| 354 | body paragraph | (typography NEAR; color migrates) |
| 367 | `text-white/70 italic` | `text-house-campus-light-foreground/70 italic` (GAP-deferred typography; color migrates) |
| 384 | body paragraph | (typography NEAR; color migrates) |
| 403 | body paragraph | (typography NEAR; color migrates) |
| 419 | `text-white/70 italic` | `text-house-campus-light-foreground/70 italic` (GAP-deferred) |
| 436 | body paragraph | (typography NEAR; color migrates) |
| 439 | body paragraph | (typography NEAR; color migrates) |
| 442 | `font-semibold text-white` | `font-semibold text-house-campus-light-foreground` |
| 447 | body paragraph | (typography NEAR; color migrates) |
| 453 | `text-sm md:text-base text-white/70 italic font-light leading-relaxed max-w-3xl` | `text-sm md:text-base text-house-campus-light-foreground/70 italic font-light leading-relaxed max-w-3xl` (GAP-deferred typography; color migrates) |
| 468 | body paragraph | (typography NEAR; color migrates) |
| 485 | body paragraph | (typography NEAR; color migrates) |
| 500 | `text-lg md:text-xl font-serif italic text-white/90 leading-relaxed normal-case` | (typography NEAR — McCarren pull-quote → `.text-subtitle italic`; color migrates to `text-house-campus-light-foreground/90`) |
| 503 | `text-sm text-white/70` (Nietzsche byline footer — upright per audit reviewer correction) | (typography NEAR → `.text-body`; color migrates to `text-house-campus-light-foreground/70`) |
| 507 | body paragraph | (typography NEAR; color migrates) |
| 519 | body paragraph | (typography NEAR; color migrates) |
| 529 | `text-lg md:text-xl font-serif text-white normal-case` (bio name) | (typography NEAR → `.text-subtitle`; color migrates) |
| 532 | `text-sm text-white/70 italic` (bio role) | `text-sm text-house-campus-light-foreground/70 italic` (GAP-deferred) |
| 534 | `text-sm text-white/80 font-light` (bio link row) | (typography NEAR → `.text-body`; color migrates to `text-house-campus-light-foreground/80`) |
| 537 | `text-white/30` (interpunct) | `text-house-campus-light-foreground/30` |
| 542 | body paragraph | (typography NEAR; color migrates) |
| 543 | `text-white/60` (Previously: label) | `text-house-campus-light-foreground/60` |
| 550 | body paragraph | (typography NEAR; color migrates) |
| 570 | `text-sm md:text-base text-white/70 font-light leading-relaxed max-w-3xl` (P.S. — upright per audit reviewer correction) | (typography NEAR → `.text-body`; color migrates to `text-house-campus-light-foreground/70`) |
| 583 | body paragraph | (typography NEAR; color migrates) |
| 585 | `font-semibold text-white` (Fractal callout) | `font-semibold text-house-campus-light-foreground` |

**Concrete diff guidance for the implementer:** a sed pass over `Campus.tsx` of the form `text-white\b` → `text-house-campus-light-foreground` and `text-white/(\d+)` → `text-house-campus-light-foreground/\1` (plus matching `decoration-white` and `border-white` rules) will hit every color site mechanically. **Do not rely on sed without manual verification** — eyeball the diff against the table above to confirm every line listed got hit and no line was missed. Use post-edit grep:
```
grep -nE 'text-white|decoration-white|border-white|bg-white|bg-black|#fff|#2E6B4A|#1A3A2E' src/pages/CampusPage.tsx src/components/sections/Campus.tsx
```
This should return zero matches after FRAC-25.

#### 3h. Typography NEAR migrations

| Audit row | Lines | Old className fragment | New className fragment | Visible rendering change at 375px? |
|---|---|---|---|---|
| Body paragraph cluster | 233, 241, 259, 302, 324, 354, 384, 403, 436, 439, 447, 468, 485, 507, 519, 542, 550, 583 | `text-sm md:text-base text-white/90 font-light leading-relaxed` | `text-body text-house-campus-light-foreground/90 leading-relaxed` (drop `text-sm md:text-base font-light` — `.text-body` pins `text-base` weight 400) | **YES — bigger body at mobile.** `text-sm` (14px) → `text-base` (16px). Weight 300 → 400. Document. |
| Title (section overview) | 230 | `text-2xl md:text-3xl font-serif leading-tight mb-8 normal-case` | `text-title leading-tight mb-8 normal-case` (drop `text-2xl md:text-3xl font-serif`) | **YES — larger title.** `text-3xl md:text-5xl` vs prior `text-2xl md:text-3xl`. |
| Subtitle — address | 200 | `font-serif text-lg md:text-xl text-white/80 mb-8 normal-case` | `text-subtitle text-house-campus-light-foreground/80 mb-8 normal-case` (drop `font-serif text-lg md:text-xl`) | **YES — slightly larger, upright (was italic).** Size up to text-xl md:text-2xl. |
| Subtitle — McCarren pull-quote | 500 | `text-lg md:text-xl font-serif italic text-white/90 leading-relaxed normal-case` | `text-subtitle italic text-house-campus-light-foreground/90 leading-relaxed normal-case` (keep `italic` as per-site override) | **YES — slightly larger.** Italic preserved. |
| Subtitle — bio name | 529 | `text-lg md:text-xl font-serif text-white normal-case` | `text-subtitle text-house-campus-light-foreground normal-case` | **YES — slightly larger, upright.** |
| PhotoPlaceholder caption | 176 | `text-xs md:text-sm text-white/70 font-light leading-relaxed` | `text-body text-house-campus-light-foreground/70 leading-relaxed` | **YES — bigger.** |
| Bio role label | 532 | `text-sm text-white/70 italic` | (GAP-deferred — color only) | No typography change (GAP cluster). |
| Bio link row | 534 | `text-sm text-white/80 font-light` | `text-body text-house-campus-light-foreground/80` | **YES — slightly bigger.** |
| McCarren byline footer (upright per reviewer) | 503 | `text-sm text-white/70` | `text-body text-house-campus-light-foreground/70` | **YES — slightly bigger.** |
| P.S. prose (upright per reviewer) | 570 | `text-sm md:text-base text-white/70 font-light leading-relaxed max-w-3xl` | `text-body text-house-campus-light-foreground/70 leading-relaxed max-w-3xl` | **YES at mobile only.** |
| Reduced-rate aside | 218 | `text-xs md:text-sm text-white/70 italic text-center` | (GAP-deferred — color only) | No typography change. |
| Italic-aside cluster siblings | 367, 419, 453, 532 | various `text-white/70 italic` patterns | (GAP-deferred — color only) | No typography change. |
| PhotoPlaceholder "Photo" label | 174 | `text-label text-white/40` | unchanged (text-label already canonical) | EXACT no-op. |
| Display "Fractal Campus" | 196 | `text-display text-white mb-4 text-center` | unchanged (text-display already canonical) | EXACT no-op. |
| `.text-title` cluster | 256, 299, 321, 351, 383, 400, 435, 465, 482, 496, 518, 580 | already on `.text-title` | unchanged | EXACT no-op. |
| Inline `<strong>` emphasis | 261, 268, 282, 286, 442, 585 | `font-semibold text-white` | `font-semibold text-house-campus-light-foreground` | Color migrates; `font-semibold` preserved as intentional per-site weight override. |

**Critical implementer note for the body cluster:** when migrating to `.text-body`, drop both `text-sm md:text-base` AND `font-light` (subsumed by `.text-body`). Preserve `leading-relaxed`, `max-w-3xl`, `mb-*`, and any other layout classes verbatim.

### 3i. GAP handling — italic-aside cluster (DEFERRED)

Per FRAC-21 / FRAC-23 precedent, the italic-aside cluster (Campus.tsx:218, 367, 419, 453, 532) **defers the typography migration**. Color migrates at every site; the italic + size className fragments stay verbatim. The audit's gap appendix records the proposed system change (a future `.text-body-aside` italic tier); FRAC-25 forwards the observation; no new utility is added in this PR.

**Lines 503 and 570 are NOT members of the italic cluster** (per audit reviewer correction) — they migrate to `.text-body` like the rest of the body cluster.

---

## Commit strategy

1. **Commit 1 — lattice state catchup.** Absorb the pre-existing dirty `.lattice/events/task_01KTJQF0JQJHHCDYKEY6WJ7H8D.jsonl` and `.lattice/tasks/task_01KTJQF0JQJHHCDYKEY6WJ7H8D.json` plus the new plan file. Stage explicitly by filename. Subject: `FRAC-25: lattice state catchup — planner + planned + in_progress lifecycle`.
2. **Commit 2 — declare house-campus tokens.** `src/index.css` only. Subject: `FRAC-25: declare house-campus-{light,deep} + paired foregrounds in @theme`. Body cites FRAC-42 paired-from-day-one convention and FRAC-21 mechanism precedent.
3. **Commit 3 — migrate CampusPage surface.** `src/pages/CampusPage.tsx` only. Subject: `FRAC-25: migrate CampusPage main surface to canonical tokens`. Removes the inline `style` prop entirely.
4. **Commit 4 — migrate Campus.tsx text-white sites.** Bulk migration (40+ sites + InlineLink constant + L273 raw `<a>` + L185 inline color). Subject: `FRAC-25: migrate Campus.tsx text-white/decoration/border sites to text-house-campus-light-foreground`.
5. **Commit 5 — migrate Campus.tsx surface/SectorHeader sites.** PhotoPlaceholder (bg/border/text), PrimaryButton (bg-black → bg-foreground), blockquote (border-white), SectorHeader prop (raw hex → CSS var). Subject: `FRAC-25: migrate Campus.tsx surface/SectorHeader/border sites to canonical tokens`.
6. **Commit 6 — typography NEAR migrations.** Body (18 sites), title (1 site), subtitle (3 sites), PhotoPlaceholder caption (1 site), bio link row (1 site), byline footers (lines 503, 570). Subject: `FRAC-25: migrate Campus.tsx typography NEAR sites to canonical utilities`. Body documents the mobile body size-up (`text-sm` → `text-base`) and verification at 375px.

**Acceptable alternative:** merge Commits 4 + 5 + 6 into a single Campus.tsx commit if the implementer judges the line count tractable. **Not acceptable:** one mega-commit covering everything.

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

After each visible-rendering commit (Commits 3–6), open the dev server at 375px viewport width and visually verify:

- [ ] Page bg is still the same forest green (`#2E6B4A`) — `bg-house-campus-light` renders identically.
- [ ] All body and chrome text reads cream (`#f8f6f0`) — imperceptible delta from prior `#ffffff`.
- [ ] **Body paragraphs at 375px are slightly LARGER** than before — `text-sm` (14px) → `text-base` (16px). Confirm no overflow; no line-wrap regressions on long event-type strings or amenities list.
- [ ] Body text is **slightly heavier** — `font-light` (300) → `.text-body` weight 400. Hierarchical contrast against `.text-title` still reads.
- [ ] Section title "A campus in the heart of Williamsburg" renders at `.text-title` (text-3xl mobile — was text-2xl).
- [ ] Subtitle sites (address, bio names, McCarren pull-quote): slightly larger. Address line + bio names render **upright** (no longer italic); McCarren pull-quote remains italic via the per-site override.
- [ ] SectorHeader monogram "C" + "Campus" eyebrow still render in deep forest (`#1A3A2E`) — confirm the `color="var(--color-house-campus-deep)"` prop resolves at runtime.
- [ ] PhotoPlaceholder cards: translucent cream tint (5%); cream border (10%); "Photo" label cream at 40%; caption at `.text-body` size.
- [ ] PrimaryButton: dark translucent face (charcoal at 20%, pixel-equivalent to prior raw black); cream text cascades; hover bumps to 30%.
- [ ] McCarren blockquote left border: translucent cream (30%).
- [ ] Inline links: underline decoration translucent cream (40%) default, opaque cream on hover.
- [ ] Italic asides (Campus.tsx:218, 367, 419, 453, 532): visual rendering unchanged except for color (cream vs. white) — typography deliberately deferred.
- [ ] Selection: `selection:bg-foreground selection:text-background` highlights as charcoal-on-cream.
- [ ] No layout regressions on the 7-card PhotoPlaceholder grid at 375px (single-column).
- [ ] No layout regressions on long PrimaryButton labels at 375px (FRAC-53 `whitespace-normal leading-snug` still in effect).

### After the final commit

Re-run `pnpm typecheck && pnpm test` fresh. Confirm baseline-only failures remain. Move task to `review`.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/campus-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op / GAP-deferred / EXCLUDED).
- [ ] `src/index.css` carries all four `--color-house-campus-{light,deep,light-foreground,deep-foreground}` declarations in `@theme inline` immediately after the Publications block; the FRAC-21+42 comment block is extended to credit FRAC-25.
- [ ] `src/pages/CampusPage.tsx:8` uses `bg-house-campus-light text-house-campus-light-foreground` in className; the `style` prop is removed entirely; selection chrome preserved.
- [ ] `src/components/sections/Campus.tsx:185` uses `className="text-house-campus-light-foreground"`; the `style={{ color: "#fff" }}` is removed.
- [ ] `Campus.tsx:25` `inlineLinkClass` constant uses `decoration-house-campus-light-foreground/40 hover:decoration-house-campus-light-foreground`.
- [ ] `Campus.tsx:190` SectorHeader prop is `color="var(--color-house-campus-deep)"`.
- [ ] `Campus.tsx:173` PhotoPlaceholder uses `bg-house-campus-light-foreground/5 border-house-campus-light-foreground/10 text-house-campus-light-foreground`.
- [ ] `Campus.tsx:161` PrimaryButton uses `bg-foreground/20 hover:bg-foreground/30`.
- [ ] `Campus.tsx:499` blockquote uses `border-house-campus-light-foreground/30`.
- [ ] No `text-white`, `text-white/<n>`, `decoration-white`, `decoration-white/<n>`, `border-white`, `border-white/<n>`, `bg-white`, `bg-white/<n>`, `bg-black`, `bg-black/<n>`, `color: "#fff"`, `color: "#2E6B4A"`, or `color: "#1A3A2E"` remains in Campus.tsx or CampusPage.tsx. Grep verification returns zero matches.
- [ ] Body paragraph cluster (18 sites) uses `.text-body`; size delta documented in commit body.
- [ ] Title cluster: Campus.tsx:230 migrated to `.text-title`; the 12 already-canonical `.text-title` call sites (256, 299, 321, 351, 383, 400, 435, 465, 482, 496, 518, 580) are untouched.
- [ ] Subtitle cluster: Campus.tsx:200, 500, 529 migrated to `.text-subtitle`; the McCarren pull-quote at L500 preserves explicit `italic`.
- [ ] PhotoPlaceholder caption (Campus.tsx:176) uses `.text-body`.
- [ ] Bio link row (Campus.tsx:534) and byline footers (Campus.tsx:503, 570) use `.text-body`.
- [ ] Italic-aside cluster (Campus.tsx:218, 367, 419, 453, 532): color migrated, typography classes left verbatim per GAP-deferred decision.
- [ ] No `DESIGN.md`, `.lattice/notes/audits/campus-audit.md`, or `.lattice/notes/audit-prompt.md` changes.
- [ ] No files modified outside the scope list: `src/index.css`, `src/pages/CampusPage.tsx`, `src/components/sections/Campus.tsx`, and the standard `.lattice/events/*` + `.lattice/tasks/*` lifecycle bookkeeping.
- [ ] `pnpm typecheck` passes clean.
- [ ] `pnpm test` shows the 4 documented baseline failures only.
- [ ] Mobile 375px browser verification documented in the implementer's review-handoff comment.
- [ ] Commit history is 4–6 logical commits.
- [ ] PR target is `frac-24-audit-campus`, NOT master.

---

## Open questions (low-severity)

1. **Body cluster size-up (`text-sm` → `text-base` at mobile) — confirm acceptance.** Most visible rendering change in the PR. Audit's `MIGRATE` action accepts the size-up; FRAC-21 and FRAC-23 made the same call without escalation. Default: accept; flag in commit body for reviewer eyes-on at 375px.
2. **`text-house-campus-light` and `text-house-campus-deep` standalone utilities — used anywhere?** No — the migrations consume only the `*-foreground` siblings and `var(--color-house-campus-deep)` (passed to SectorHeader as a CSS-var string). Tokens declared for future use.
3. **`<span className="italic">` at Campus.tsx:231 inside the migrated `.text-title` — leave or remove?** `.text-title` already pins italic; the inline `<span className="italic">campus</span>` is a no-op. Default: leave verbatim — harmless.

---

## Implementation order

1. Read this plan; re-read FRAC-22 PRD per CLAUDE.md mandatory check; re-read `campus-audit.md` once more.
2. Verify `git status` matches expected dirty state (lattice FRAC-25 files + plan).
3. Commit 1 — lattice catchup (stage explicit FRAC-25 files only).
4. Commit 2 — `src/index.css` token declarations.
5. Commit 3 — `src/pages/CampusPage.tsx` surface migration.
6. Commit 4 — `src/components/sections/Campus.tsx` text-white migrations (40+ sites + InlineLink constant + L273 + L185 inline color).
7. Commit 5 — `src/components/sections/Campus.tsx` surface/border/SectorHeader migrations.
8. Commit 6 — `src/components/sections/Campus.tsx` typography NEAR migrations.
9. Final test gate: `pnpm typecheck && pnpm test`. 375px browser verification.
10. `lattice status review` + `lattice comment` with verification summary.
11. Open PR targeting `frac-24-audit-campus` (NOT master).
