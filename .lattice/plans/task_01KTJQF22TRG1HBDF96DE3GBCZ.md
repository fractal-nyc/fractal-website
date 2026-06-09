# FRAC-33: Apply Visit page audit findings

**Task:** `task_01KTJQF22TRG1HBDF96DE3GBCZ`
**Branch:** `frac-33-apply-visit` (off `frac-32-audit-visit`, not master — the FRAC-32 audit doc + audit-gaps Visit Pretext entry are upstream of this work and aren't on master yet, PR #192 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/visit-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### House mapping`, `### House palette values`, `### Text foregrounds`, `### Surface foreground pairing`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)
**Audit author/date:** FRAC-32 / 2026-06-09

---

## Preamble

The audit doc at `.lattice/notes/audits/visit-audit.md` is the frozen spec for this Apply task. Every migration decision below traces back to a specific audit row; the audit's `Action:` and `Match quality:` fields are binding.

**The load-bearing finding:** Visit's page-level `<main>` declares `text-foreground` (charcoal) on a `bg-house-visit-light` (olive-green `#889460`) surface — a FRAC-42 mispairing. Per DESIGN.md → Surface foreground pairing, `bg-house-visit-light` pairs with `text-house-visit-light-foreground` (cream), NOT `text-foreground` (charcoal). This Apply task fixes the mispairing as part of the page-level surface migration. **Visual delta IS noticeable** — the rendering changes from "charcoal text would have inherited on the green surface" to "cream text inherits on the green surface." In practice today every text-bearing descendant explicitly declares `text-white`, so no rendered text actually inherits the broken default — but the cascade is now correct and any future descendant will inherit cream-on-green as the system intends. Reviewer eyes-on at 375px should still verify nothing renders charcoal on green after this migration lands.

**Paired-from-day-one:** Per FRAC-42, every house surface ships with its paired-foreground sibling declared in `@theme inline`. FRAC-25 (Campus) was the first Apply task to land both pairs in one commit. FRAC-33 (Visit) follows the same pattern: declare all four `--color-house-visit-*` tokens together, before any consumer references them.

**House identity binding rule:** The internal data-model `id` for this house is `neighborhood`. The displayName is `Visit`. **Per DESIGN.md → House mapping, token slugs use the displayName slug — `house-visit-{light,deep}`, NOT `house-neighborhood-*`.** Every migration in this plan writes `house-visit-*`. Crossing the wires is the most common-anticipated implementer mistake; the grep check in the acceptance criteria below guards against it.

---

## Scope

**FRAC-33 changes only `src/`.** Specifically the page-level `<main>` and inner nodes in `src/pages/NeighborhoodPage.tsx`, plus a single declarative addition to `src/index.css` to register four `house-visit-*` Tailwind theme tokens (light, deep, light-foreground, deep-foreground) under the FRAC-42 paired-from-day-one convention.

### In scope

- `src/index.css` — add the four `--color-house-visit-*` declarations inside `@theme inline`, extending the existing FRAC-21+25+42 comment block to credit FRAC-33.
- `src/pages/NeighborhoodPage.tsx` — the page entry (~78 lines). Migrations:
  - L13 `<main>` inline `style={{ backgroundColor: "#889460" }}` → `bg-house-visit-light` className; remove `style` prop.
  - L13 `<main>` `text-foreground` → `text-house-visit-light-foreground` (**the load-bearing cascade fix**).
  - L13 selection chrome unchanged (canonical EXACT).
  - L20 SectorHeader prop `color="#4A5A30"` → `color="var(--color-house-visit-deep)"`.
  - L29 MandelbrotCorners `bg-foreground/[0.03] border-foreground/20` — EXACT no-op for the foreground tokens themselves; add `text-house-visit-light-foreground` to the card's className per FRAC-42 pairing addition (NEAR).
  - L30, L33, L37, L56 `text-white` → `text-house-visit-light-foreground` (4 sites; cream visual delta from `#ffffff` to `#f8f6f0` is imperceptible).
  - L33, L37 typography NEAR migration: `text-xs leading-relaxed` → `text-body leading-relaxed` (size-up from 12px to 16px per audit decision; verify 375px does not regress the compact "Note" card layout).
  - L54 PretextParagraph: GAP. Migrate only the className `text-white` → `text-house-visit-light-foreground`; leave `size={TEXT_SIZES.sm}` and the Pretext rendering itself untouched (canonical body utility does not exist for Pretext mono px-sized text — folded into the sitewide Pretext gap already logged for LabPage:58 + this site at NeighborhoodPage:54).
  - L23 `.text-display` — already canonical, no change.
  - L30 `.text-eyebrow` — already canonical typography, no change (only color migrates as above).
  - L60 Button wrapper — `max-w-xs w-full text-center` only (layout/text-align); no color override; no migration.

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/visit-audit.md`) — frozen as spec.
- `DESIGN.md` and `.lattice/notes/audit-prompt.md` — FRAC-19 / FRAC-42 / FRAC-32 owned those edits.
- `.lattice/notes/audit-gaps.md` — FRAC-32 already logged the Visit Pretext gap entry; do not modify it.
- `FractalPattern.tsx` and the `<FractalPattern color="#4A5A30" />` call site at `NeighborhoodPage.tsx:14` — explicitly excluded per FRAC-20 (Lab) precedent and the audit's EXCLUDED row.
- `Navbar.tsx`, `Footer.tsx`, `FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` internals — shared chrome (only the inline className overrides on the `<MandelbrotCorners …>` call site at L29 are in scope).
- `SectorHeader.tsx` internals — audited separately.
- `Button` component (`button.tsx`) internals — typography locked via `buttonVariants`. The `<Button asChild>` at L60 carries no color override.
- `PretextParagraph.tsx` and `src/lib/pretext.ts` internals — Pretext rendering layer out of scope as a system. Only the `className="text-white"` override on the L54 call site is in scope (color only — typography is the GAP).
- No `pnpm install`, no `package.json` changes, no new tests.
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, other tasks' `.lattice/` files.

---

## House token declaration decision

**Decided: declare all four `--color-house-visit-*` siblings together in `src/index.css` `@theme inline` — the second Apply task to land the FRAC-42 paired-from-day-one pattern for a new house (after FRAC-25 Campus).**

### The four token names

- `--color-house-visit-light` (= `#889460`)
- `--color-house-visit-deep` (= `#4A5A30`)
- `--color-house-visit-light-foreground` (= `var(--color-background)`, resolves to cream `#f8f6f0`)
- `--color-house-visit-deep-foreground` (= `var(--color-background)`)

This makes the following Tailwind utilities available throughout `src/`:
- `bg-house-visit-{light,deep}`, `text-house-visit-{light,deep}` (display/highlight use only — DESIGN.md "House colors for display and highlight" rule)
- `text-house-visit-{light,deep}-foreground`, `bg-house-visit-{light,deep}-foreground`, `border-house-visit-{light,deep}-foreground`, `decoration-house-visit-{light,deep}-foreground`
- All with the standard `/<NN>` alpha modifier.

### Exact edit to `src/index.css`

The current block ends with the Campus pair at line 61 (`--color-house-campus-deep-foreground: var(--color-background);`). Append the four Visit declarations after the Campus block, with the comment block's parenthetical credit updated to include FRAC-33:

```css
  /* House palette tokens (FRAC-21, FRAC-25, FRAC-33) + paired foregrounds (FRAC-42).
     Static brand hexes — declared directly without the hsl(var(...))
     indirection used by surface tokens above, because house colors do
     not theme-swap (no dark mode per FRAC-30) and the indirection
     would add no value. See DESIGN.md → House palette values for the
     full set; FRAC-21 lands the Publications pair, FRAC-25 lands the
     Campus pair, FRAC-33 lands the Visit pair (the remaining 3 pairs
     land in their respective per-house Apply tasks).

     Each house surface ships an explicit *-foreground sibling per the
     shadcn/Material-3 pairing convention (FRAC-42). Today every
     declared foreground sibling resolves to cream; see DESIGN.md
     → Surface foreground pairing for the rule and the four canonical
     pairs. FRAC-25 was the first Apply task to declare both surface
     and paired-foreground siblings together from day one; FRAC-33
     follows the same paired-from-day-one pattern for Visit. */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
  --color-house-publications-light-foreground: var(--color-background);
  --color-house-publications-deep-foreground: var(--color-background);

  --color-house-campus-light: #2E6B4A;
  --color-house-campus-deep: #1A3A2E;
  --color-house-campus-light-foreground: var(--color-background);
  --color-house-campus-deep-foreground: var(--color-background);

  --color-house-visit-light: #889460;
  --color-house-visit-deep: #4A5A30;
  --color-house-visit-light-foreground: var(--color-background);
  --color-house-visit-deep-foreground: var(--color-background);
```

Four new lines inserted immediately after the existing `--color-house-campus-deep-foreground: var(--color-background);`, with the comment block extended to credit FRAC-33. No other `index.css` edits.

---

## Per-file migration plan

### 1. `src/index.css` (declaration only)

Single block insertion described above. No other changes.

### 2. `src/pages/NeighborhoodPage.tsx` — every migration

This is the only consumer file in scope. All migrations listed below land here.

#### 2a. `<main>` surface migration (L13) — the load-bearing cascade fix

**Before (line 13):**
```jsx
<main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#889460" }}>
```

**After (line 13):**
```jsx
<main className="relative min-h-screen bg-house-visit-light text-house-visit-light-foreground selection:bg-foreground selection:text-background">
```

Three migrations on a single node:

| Audit row | Old | New | Notes |
|---|---|---|---|
| L13 (bg) | `style={{ backgroundColor: "#889460" }}` | `bg-house-visit-light` in className | Inline → token utility. Mirrors LabPage:16 + CampusPage:8 precedents. EXACT value match. |
| L13 (text — **load-bearing**) | `text-foreground` | `text-house-visit-light-foreground` | FRAC-42 surface-foreground pairing. Cascade now resolves to cream for any descendant that doesn't override; today every descendant explicitly declares its own text color, so no visible delta — but the latent bug is removed. Reviewer should verify at 375px nothing renders charcoal-on-green. |
| L13 (style prop) | `style={{ backgroundColor: "#889460" }}` | Remove the `style={}` prop entirely | After the inline bg migrates, the `style` prop is empty and should be deleted. |
| L13 (selection chrome) | `selection:bg-foreground selection:text-background` | unchanged — already canonical | Paired-inverse state; FRAC-42-exempt. |
| L14 (FractalPattern color) | `<FractalPattern color="#4A5A30" />` | unchanged — out of scope | EXCLUDED per audit row. |

#### 2b. SectorHeader prop migration (L20)

**Before:**
```jsx
<SectorHeader letter="V" name="Visit" color="#4A5A30" />
```

**After:**
```jsx
<SectorHeader letter="V" name="Visit" color="var(--color-house-visit-deep)" />
```

Mirrors LabPage:24 (`#C44878` → `var(--color-house-publications-deep)`) and CampusPage:190 (`#1A3A2E` → `var(--color-house-campus-deep)`) precedents. Drift is mechanism (raw hex literal), not value.

#### 2c. MandelbrotCorners card (L29) — pairing addition

**Before:**
```jsx
<MandelbrotCorners size="sm" opacity={0.15} className="border border-foreground/20 rounded-md px-6 py-5 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-left max-w-xl mx-auto">
```

**After:**
```jsx
<MandelbrotCorners size="sm" opacity={0.15} className="border border-foreground/20 rounded-md px-6 py-5 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-house-visit-light-foreground text-left max-w-xl mx-auto">
```

Per audit row L29: `bg-foreground/[0.03]` and `border-foreground/20` are EXACT canonical foreground tokens — no migration. The change is the **FRAC-42 pairing addition** — the card declares a `bg-foreground/[0.03]` surface but no own `text-*` paired foreground. Adding `text-house-visit-light-foreground` re-asserts pairing for compositional safety. The children at L30/33/37 also declare their own color (and migrate below); the card-level paired-foreground is the cascade safety net. The arbitrary alpha `/[0.03]` syntax is left verbatim per the audit's forward observation (mechanism-only consideration; both `/[0.03]` and `/[3%]` render identically).

#### 2d. text-white migrations + body typography NEAR (L30, L33, L37)

The "Note" MandelbrotCorners card holds three text-bearing children. Per audit's master text-white row, all `text-white` sites migrate to `text-house-visit-light-foreground`. Per audit row L33,37 typography NEAR, the body text sites also size up to `.text-body`.

**Before (L30 — eyebrow "Note"):**
```jsx
<p className="text-eyebrow text-white mb-2 md:mb-3">
  Note
</p>
```

**After (L30):**
```jsx
<p className="text-eyebrow text-house-visit-light-foreground mb-2 md:mb-3">
  Note
</p>
```

Color only — typography (`.text-eyebrow`) already canonical EXACT.

**Before (L33 — disclaimer body):**
```jsx
<p className="text-xs leading-relaxed text-white">
  Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:
</p>
```

**After (L33):**
```jsx
<p className="text-body leading-relaxed text-house-visit-light-foreground">
  Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:
</p>
```

Drop `text-xs` (12px) for `.text-body` (`text-base` 16px Inter weight 400 normal-case). Preserve `leading-relaxed`. Per audit's NEAR + MIGRATE decision: size up from 12px → 16px. Document mobile size delta in commit body.

**Before (L37 — ordered list):**
```jsx
<ol className="list-decimal list-inside space-y-1 md:space-y-2 text-xs leading-relaxed text-white text-left">
```

**After (L37):**
```jsx
<ol className="list-decimal list-inside space-y-1 md:space-y-2 text-body leading-relaxed text-house-visit-light-foreground text-left">
```

Same `text-xs` → `.text-body` size-up; same color migration. `<li>` children inherit typography from the `<ol>` via cascade — no per-`<li>` migration needed.

**Forward observation acknowledged:** the compact "Note" card density is a legitimate editorial choice; the audit's NEAR → MIGRATE decision is to size up. If the size-up causes a 375px layout overflow (line-wrap regression on the ordered list items, card edge clipping), the implementer falls back to keeping `text-xs leading-relaxed text-house-visit-light-foreground` verbatim (color-only migration) and documents the override in the commit body. **Default: size up to `.text-body`; verify at 375px; only fall back if a real layout regression is observed.**

#### 2e. PretextParagraph migration (L54) — GAP, color only

**Before:**
```jsx
<PretextParagraph
  size={TEXT_SIZES.sm}
  className="text-white mb-3 md:mb-4"
>
  {"Want to visit? Fill out this form."}
</PretextParagraph>
```

**After:**
```jsx
<PretextParagraph
  size={TEXT_SIZES.sm}
  className="text-house-visit-light-foreground mb-3 md:mb-4"
>
  {"Want to visit? Fill out this form."}
</PretextParagraph>
```

Color-only migration per the audit's gap-appendix decision: no canonical body utility fits the Pretext mono 12px rendering, so the `size={TEXT_SIZES.sm}` prop and Pretext rendering itself are left untouched. The className `text-white` → `text-house-visit-light-foreground` cream migration is the only delta. Folds into the sitewide Pretext gap already logged for LabPage:58 + NeighborhoodPage:54 in `audit-gaps.md`.

#### 2f. Button wrapper (L60) — no migration

**Verbatim, unchanged:**
```jsx
<Button asChild className="max-w-xs w-full text-center">
  <a href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd" target="_blank" rel="noopener noreferrer">
    Visitor Form
  </a>
</Button>
```

Audit row JUSTIFY: layout/text-align only (`max-w-xs w-full text-center`); no color or typography override; Button component owns its own typography via `buttonVariants`. Confirm no color override is being added in the implementer pass.

---

## Commit strategy

1. **Commit 1 — lattice state catchup.** Absorb the pre-existing dirty `.lattice/events/task_01KTJQF22TRG1HBDF96DE3GBCZ.jsonl` (if any) and `.lattice/tasks/task_01KTJQF22TRG1HBDF96DE3GBCZ.json` plus the new plan file. Subject: `FRAC-33: lattice state catchup — planner + planned + in_progress lifecycle`.
2. **Commit 2 — declare house-visit tokens.** `src/index.css` only. Subject: `FRAC-33: declare house-visit-{light,deep} + paired foregrounds in @theme`. Body cites FRAC-42 paired-from-day-one convention and FRAC-21/25 mechanism precedent.
3. **Commit 3 — migrate NeighborhoodPage main surface.** `src/pages/NeighborhoodPage.tsx` L13 only: page-level surface (bg + the load-bearing text-foreground → text-house-visit-light-foreground cascade fix + drop the style prop). Subject: `FRAC-33: migrate NeighborhoodPage main surface to canonical tokens`. Body highlights the cascade fix as a load-bearing visual-correctness change.
4. **Commit 4 — migrate NeighborhoodPage text-white sites + SectorHeader + card pairing.** `src/pages/NeighborhoodPage.tsx` L20 (SectorHeader prop), L29 (card pairing addition + arbitrary-alpha kept verbatim), L30 (eyebrow color), L33 + L37 (text-white + body typography NEAR), L54 (Pretext className color only). Subject: `FRAC-33: migrate NeighborhoodPage.tsx text-white sites to text-house-visit-light-foreground`. Body documents the L33/L37 size-up (`text-xs` 12px → `.text-body` 16px) with 375px verification.

**Acceptable alternative:** merge Commits 3 + 4 into a single NeighborhoodPage.tsx commit if the implementer judges the line count tractable. **Not acceptable:** one mega-commit covering everything.

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

The 4th baseline failure is the one to watch — this PR touches `NeighborhoodPage.tsx`. If the failure mode changes (e.g., now also fails on a different assertion), inspect carefully. The pre-PR baseline failure is on the `min-h-screen` assertion as documented; a different failure mode would be a regression. Any failure OUTSIDE this list of 4 is a regression — halt and `lattice comment` the task with the stack trace.

### Mobile 375px browser verification (mandatory per PRD + CLAUDE.md)

After Commits 3 + 4 land (the visible-rendering commits), open the dev server at 375px viewport width and visually verify:

- [ ] Page bg is still olive-green (`#889460`) — `bg-house-visit-light` renders identically.
- [ ] All text on the page reads cream (`#f8f6f0`) — imperceptible delta from prior `#ffffff`. Specifically: SectorHeader monogram "V" + "Visit" eyebrow, `.text-display` "Live Near 100 Friends & Peers" heading, MandelbrotCorners "Note" eyebrow, disclaimer body, ordered list items, PretextParagraph "Want to visit? Fill out this form."
- [ ] **No charcoal-on-green text anywhere.** The L13 cascade fix should make any text that lacks its own explicit color render cream — but today no descendant relies on inherited color, so visually the page is identical except for the white→cream delta.
- [ ] MandelbrotCorners "Note" card body + ordered list at 375px — body is **slightly LARGER** than before (`text-xs` 12px → `.text-body` 16px). Verify no card edge clipping, no awkward line-wrap on long ordered-list items. If a real overflow is observed, fall back to color-only migration per the plan's L33/L37 fallback.
- [ ] SectorHeader monogram "V" + "Visit" eyebrow still render in deep olive-green (`#4A5A30`) — confirm `color="var(--color-house-visit-deep)"` resolves at runtime.
- [ ] MandelbrotCorners card: translucent-charcoal tint (`bg-foreground/[0.03]`), charcoal border at 20% (`border-foreground/20`), cream text cascading from the new `text-house-visit-light-foreground` declaration.
- [ ] FractalPattern decorative SVG fill still renders in deep olive-green (`#4A5A30`) — unchanged; documents the EXCLUDED row visually.
- [ ] Button "Visitor Form": typography locked by `buttonVariants`; no color override; renders as per the Button component's defaults.
- [ ] Selection: `selection:bg-foreground selection:text-background` highlights as charcoal-on-cream.
- [ ] No layout regressions on long PretextParagraph or button text at 375px.

### After the final commit

Re-run `pnpm typecheck && pnpm test` fresh. Confirm baseline-only failures remain. Move task to `review`.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/visit-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op / GAP-deferred-color-only / EXCLUDED).
- [ ] `src/index.css` carries all four `--color-house-visit-{light,deep,light-foreground,deep-foreground}` declarations in `@theme inline` immediately after the Campus block; the FRAC-21+25+42 comment block is extended to credit FRAC-33 with the paired-from-day-one continuation note.
- [ ] `src/pages/NeighborhoodPage.tsx:13` `<main>` uses `bg-house-visit-light text-house-visit-light-foreground` in className; the `style` prop is removed entirely; selection chrome (`selection:bg-foreground selection:text-background`) preserved verbatim; the `text-foreground → text-house-visit-light-foreground` cascade fix is committed and explicitly documented in the commit body.
- [ ] `NeighborhoodPage.tsx:20` SectorHeader prop is `color="var(--color-house-visit-deep)"`.
- [ ] `NeighborhoodPage.tsx:29` MandelbrotCorners className adds `text-house-visit-light-foreground` while preserving `border border-foreground/20`, `bg-foreground/[0.03]`, and all layout classes verbatim (arbitrary alpha `/[0.03]` kept).
- [ ] `NeighborhoodPage.tsx:30` `text-eyebrow text-white` → `text-eyebrow text-house-visit-light-foreground` (typography unchanged EXACT).
- [ ] `NeighborhoodPage.tsx:33` `text-xs leading-relaxed text-white` → `text-body leading-relaxed text-house-visit-light-foreground` (size-up + color migrate; unless 375px overflow observed, then color-only fallback).
- [ ] `NeighborhoodPage.tsx:37` `<ol …> text-xs leading-relaxed text-white text-left` → `text-body leading-relaxed text-house-visit-light-foreground text-left` (same as L33).
- [ ] `NeighborhoodPage.tsx:54` PretextParagraph `className="text-white …"` → `className="text-house-visit-light-foreground …"` (color only; `size={TEXT_SIZES.sm}` and Pretext rendering unchanged).
- [ ] `NeighborhoodPage.tsx:60` Button wrapper unchanged (no color override added).
- [ ] No `text-white`, `text-white/<n>`, `text-foreground` (on the page-level main), `color: "#fff"`, `color: "#889460"`, `color: "#4A5A30"` (on SectorHeader prop), `style={{ backgroundColor: "#889460" }}` (on main), `style={{ color: "#fff" }}` remains in NeighborhoodPage.tsx. Grep verification returns zero matches except: the FractalPattern `color="#4A5A30"` at L14 (EXCLUDED row, must remain).
- [ ] **House-slug binding check:** zero occurrences of `house-neighborhood-*` anywhere in `src/`. Token slug is `house-visit-*`. Grep verification.
- [ ] No `DESIGN.md`, `.lattice/notes/audits/visit-audit.md`, `.lattice/notes/audit-gaps.md`, or `.lattice/notes/audit-prompt.md` changes.
- [ ] No files modified outside the scope list: `src/index.css`, `src/pages/NeighborhoodPage.tsx`, and the standard `.lattice/events/*` + `.lattice/tasks/*` + plan file lifecycle bookkeeping.
- [ ] `pnpm typecheck` passes clean.
- [ ] `pnpm test` shows the 4 documented baseline failures only.
- [ ] Mobile 375px browser verification documented in the implementer's review-handoff comment.
- [ ] Commit history is 3–4 logical commits.
- [ ] PR target is `frac-32-audit-visit`, NOT master.

---

## Open questions (low-severity)

1. **L33/L37 body cluster size-up (`text-xs` 12px → `.text-body` 16px) — confirm no 375px layout regression.** The most visible rendering change in the PR. Audit's `MIGRATE` action accepts the size-up; forward observation flags the compact "Note" card density as a potential reason to defer. Default: accept; fall back to color-only if a real overflow is observed at 375px.
2. **`text-house-visit-light` and `text-house-visit-deep` standalone utilities — used anywhere?** No — the migrations consume only the `*-foreground` siblings and `var(--color-house-visit-deep)` (passed to SectorHeader as a CSS-var string). Tokens declared for future use.
3. **MandelbrotCorners arbitrary alpha `bg-foreground/[0.03]` — normalize?** Forward observation discusses normalizing to `/[3%]` or rounding to `/5`. Default: keep verbatim. Both forms render identically; mechanism-only consideration deferred.

---

## Review gate

The review sub-agent must:

1. Read this plan cold (no implementer context).
2. Read the audit doc to verify every row was honored.
3. Read the diff from `git diff origin/frac-32-audit-visit...HEAD` (or equivalent base) and verify:
   - All four `--color-house-visit-*` declarations land together in `src/index.css`, in the right comment block, in the right order (after Campus).
   - `<main>` uses `bg-house-visit-light text-house-visit-light-foreground` and the `style` prop is gone.
   - The **load-bearing cascade fix** (`text-foreground` → `text-house-visit-light-foreground`) is visible in the diff and called out in the commit message.
   - Every `text-white` on NeighborhoodPage migrated; SectorHeader prop uses CSS-var; MandelbrotCorners has the pairing addition.
   - No `house-neighborhood-*` slugs (the displayName/internal-id wires not crossed).
   - PretextParagraph kept Pretext rendering verbatim; only className color migrated.
   - No out-of-scope files modified; no audit/PRD/DESIGN docs touched.
4. Re-read FRAC-22 PRD per CLAUDE.md mandatory PRD check; verify mobile-first 375px is respected.
5. Run `pnpm typecheck && pnpm test`; verify baseline-only failures.
6. Record findings via `lattice comment FRAC-33 --role review` with explicit pass/fail and rework-level (implementation vs. plan) if fail. Then move to `done` (or back to `in_progress`/`in_planning` per the rework decision).

---

## Implementation order

1. Read this plan; re-read FRAC-22 PRD per CLAUDE.md mandatory check; re-read `visit-audit.md` once more.
2. Verify `git status` matches expected dirty state (lattice FRAC-33 files + plan).
3. Commit 1 — lattice catchup (stage explicit FRAC-33 files only).
4. Commit 2 — `src/index.css` token declarations.
5. Commit 3 — `src/pages/NeighborhoodPage.tsx` main surface migration (load-bearing cascade fix).
6. Commit 4 — `src/pages/NeighborhoodPage.tsx` text-white sites + SectorHeader + card pairing + PretextParagraph.
7. Final test gate: `pnpm typecheck && pnpm test`. 375px browser verification.
8. `lattice status review` + `lattice comment` with verification summary.
9. Open PR targeting `frac-32-audit-visit` (NOT master).
