# FRAC-35 — Apply Events page audit findings

**Task:** `task_01KTJQF2F11F49M5XXNWJQ5RX4`
**Branch:** `frac-35-apply-events` (off `frac-34-audit-events`, not master — the FRAC-34 audit doc is upstream of this work and isn't on master yet; PR #191 is open but not merged)
**Audit doc (spec, frozen):** `.lattice/notes/audits/events-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### House palette values`, `### Text foregrounds`, `### Surface foreground pairing`, `### Semantic type scale`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)
**Audit author/date:** FRAC-34 / 2026-06-09
**Template precedent:** FRAC-25 (`.lattice/plans/task_01KTJQF0JQJHHCDYKEY6WJ7H8D.md`) — paired-from-day-one + frac-24-audit-campus base-branch pattern. FRAC-29 (Education) follows the same shape if it lands first; at HEAD only FRAC-21 (Publications) and FRAC-25 (Campus) tokens are declared in `src/index.css`.

---

## Preamble — what makes Events different from Campus/Lab

Three Events-specific decisions shape this plan:

1. **Paired-from-day-one (mirrors FRAC-25).** All four `house-events-*` siblings get declared together — `light`, `deep`, `light-foreground`, `deep-foreground`. The FRAC-21+25 comment block in `src/index.css` is extended to credit FRAC-35.
2. **Editorial charcoal-on-coral preserved (audit JUSTIFY).** Events deliberately uses canonical `text-foreground` (charcoal `#171717`) on the `house-events-light` (`#D4857A` coral) page bg — distinct from Campus/Lab's cream-on-saturated pattern. The audit classifies this as JUSTIFY: canonical token, deliberate editorial choice. **FRAC-35 does NOT swap to `text-house-events-light-foreground`.** This is flagged for Jules in the PR body as an editorial confirmation question.
3. **Orphan `Events.tsx` migrated per the audit's per-file rows.** The component is not imported in the live tree at HEAD, but the audit explicitly enumerates MIGRATE rows for it (FRAC-42 pairing additions on `<section>` and the link wrapper, plus EXACT no-op confirmations). Following the audit's spec. Surfaced in the PR body as a deletion-candidate follow-up for Jules to scope separately.

---

## Scope

**FRAC-35 changes only `src/`.** Specifically the page-level `<main>` in `src/pages/EventsPage.tsx`, the orphan `src/components/sections/Events.tsx` per audit rows, plus a single declarative addition to `src/index.css` to register four `house-events-*` Tailwind theme tokens (light, deep, light-foreground, deep-foreground) under the FRAC-42 paired-from-day-one convention.

### In scope

- `src/index.css` — add the four `--color-house-events-*` declarations inside `@theme inline`, extending the existing FRAC-21+25 Publications+Campus comment block to credit FRAC-35.
- `src/pages/EventsPage.tsx` — the page entry (79 lines). Migrate:
  - `<main>` line 11: raw-hex `style={{ backgroundColor: "#D4857A" }}` → `bg-house-events-light` className. **Keep `text-foreground` per audit JUSTIFY (editorial charcoal-on-coral preserved).** Drop the `style` prop entirely.
  - `<SectorHeader>` line 17: raw-hex `color="#C13B2A"` → `color="var(--color-house-events-deep)"`.
  - Luma link label line 40: `className="inline-block mb-12 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity duration-300"` → migrate the chrome class soup to `.text-meta` per audit NEAR row. Preserve `inline-block`, `mb-12`, `opacity-70`, `hover:opacity-100`, `transition-opacity`, `duration-300`.
- `src/components/sections/Events.tsx` — orphan component (35 lines). Per the audit's per-file plan:
  - Line 5 `<section>`: add `text-foreground` for FRAC-42 pairing (token already canonical `bg-background`).
  - Line 9 `<h2>` `text-eyebrow text-muted-foreground`: EXACT no-op (typography NEAR per audit; accidental italic is a sitewide forward observation, NOT migrated here).
  - Line 10 `<p>` `text-3xl md:text-5xl font-serif max-w-2xl leading-tight normal-case`: migrate to `.text-title` per audit EXACT typography row. Preserve `max-w-2xl leading-tight`. The inner `<span className="italic normal-case">` is left verbatim (one-letter optional trim per audit — leave alone to minimize change surface).
  - Line 17 `<a>` wrapper `bg-muted`: add `text-muted-foreground` for FRAC-42 pairing.

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/events-audit.md`) — frozen as spec.
- `.lattice/notes/audit-gaps.md` — no GAPs to add per audit.
- `DESIGN.md` and `.lattice/notes/audit-prompt.md` — owned by earlier FRAC tasks.
- `FractalPattern.tsx` and the `<FractalPattern color="#C13B2A" />` call site at `EventsPage.tsx:12` — explicitly EXCLUDED per audit row (mirrors FRAC-20 / FRAC-24 precedent).
- `Navbar.tsx`, `Footer.tsx`, `FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome.
- `SectorHeader.tsx` internals — audited separately.
- `Button` component (`button.tsx`) internals — typography locked via `buttonVariants`. EventsPage uses `<Button asChild>` with only sizing/alignment classes; no typography or color overrides exist to audit.
- The Luma embed wrapper's `bg-foreground/[0.03]` + `border-foreground/20` at `EventsPage.tsx:28` — already canonical translucent-foreground tint; EXACT no-op per audit (exempt composite under the translucent-foreground-as-surface-tint precedent from Campus PrimaryButton).
- Selection chrome on `<main>`: `selection:bg-foreground selection:text-background` — already canonical paired-inverse, FRAC-42-exempt.
- The inner `<span className="italic normal-case">` at `Events.tsx:11` — left verbatim (optional one-letter trim called out in audit but not required).
- No `pnpm install`, no `package.json` changes, no new tests.
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, other tasks' `.lattice/` files (e.g. FRAC-40 at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`).
- Deletion of orphan `Events.tsx` — out of scope; flag as deletion-candidate follow-up in PR body.

---

## House token declaration decision

**Decided: declare all four `--color-house-events-*` siblings together in `src/index.css` `@theme inline` — mirroring FRAC-25 (Campus) paired-from-day-one convention.**

### Why all four at once

FRAC-25 established the paired-from-day-one pattern for new house tokens. FRAC-35 (Events) follows that pattern exactly: four siblings declared together, no FRAC-42 retrofit needed later. DESIGN.md → `### Surface foreground pairing` is the binding rule: "Every surface token has a paired foreground token."

The four token names:
- `--color-house-events-light` (= `#D4857A`)
- `--color-house-events-deep` (= `#C13B2A`)
- `--color-house-events-light-foreground` (= `var(--color-background)`, resolves to cream `#f8f6f0`)
- `--color-house-events-deep-foreground` (= `var(--color-background)`)

This makes the following Tailwind utilities available throughout `src/`:
- `bg-house-events-{light,deep}`, `text-house-events-{light,deep}` (display/highlight use only — DESIGN.md "House colors for display and highlight" rule)
- `text-house-events-{light,deep}-foreground`, `bg-house-events-{light,deep}-foreground`, `border-house-events-{light,deep}-foreground`, `decoration-house-events-{light,deep}-foreground`
- All with the standard `/<NN>` alpha modifier.

**FRAC-35 only consumes** `bg-house-events-light` and `var(--color-house-events-deep)`. The other tokens are declared for future use (cross-referenced in DESIGN.md's house mapping table at line 145) and to satisfy the paired-from-day-one convention. The `light-foreground` token in particular is the editorial-flip target for the JUSTIFY row — if Jules elects to align Events with the cream-on-saturated convention later, a one-line className change is all that's needed.

### Exact edit to `src/index.css`

The current block at lines 38–61 ends with `--color-house-campus-deep-foreground: var(--color-background);` (line 61). Extend by appending the Events block and updating the comment to credit FRAC-35:

```css
  /* House palette tokens (FRAC-21, FRAC-25, FRAC-35) + paired foregrounds (FRAC-42).
     Static brand hexes — declared directly without the hsl(var(...))
     indirection used by surface tokens above, because house colors do
     not theme-swap (no dark mode per FRAC-30) and the indirection
     would add no value. See DESIGN.md → House palette values for the
     full set; FRAC-21 lands the Publications pair, FRAC-25 lands the
     Campus pair, FRAC-35 lands the Events pair (the remaining 3 pairs
     land in their respective per-house Apply tasks).

     Each house surface ships an explicit *-foreground sibling per the
     shadcn/Material-3 pairing convention (FRAC-42). Today every
     declared foreground sibling resolves to cream; see DESIGN.md
     → Surface foreground pairing for the rule and the four canonical
     pairs. FRAC-25 was the first Apply task to declare both surface
     and paired-foreground siblings together from day one; FRAC-35
     mirrors that pattern. NOTE: Events deliberately preserves
     charcoal-on-coral (`text-foreground` on `bg-house-events-light`)
     as its editorial page-default voice — the declared
     `*-light-foreground` cream sibling is the editorial-flip target
     if Jules elects to align Events with the cream-on-saturated
     convention later (see FRAC-34 audit doc Forward observations
     and FRAC-35 PR body). */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
  --color-house-publications-light-foreground: var(--color-background);
  --color-house-publications-deep-foreground: var(--color-background);

  --color-house-campus-light: #2E6B4A;
  --color-house-campus-deep: #1A3A2E;
  --color-house-campus-light-foreground: var(--color-background);
  --color-house-campus-deep-foreground: var(--color-background);

  --color-house-events-light: #D4857A;
  --color-house-events-deep: #C13B2A;
  --color-house-events-light-foreground: var(--color-background);
  --color-house-events-deep-foreground: var(--color-background);
```

Four new declarations inserted immediately after `--color-house-campus-deep-foreground:` line. Comment block updated to credit FRAC-35 + record the editorial-charcoal-on-coral JUSTIFY note for the next agent's context.

---

## Per-file migration plan

### 1. `src/index.css` (declaration only)

Single block insertion described above. No other changes.

### 2. `src/pages/EventsPage.tsx` — page-level surface migration

#### 2a. `<main>` line 11 — page bg migration (JUSTIFY for text-foreground preserved)

**Before (line 11):**
```jsx
<main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4857A" }}>
```

**After (line 11):**
```jsx
<main className="relative min-h-screen bg-house-events-light text-foreground selection:bg-foreground selection:text-background">
```

Changes:
- Drop the `style={{ backgroundColor: "#D4857A" }}` prop entirely.
- Add `bg-house-events-light` to className (token-driven equivalent of the raw hex).
- **Preserve `text-foreground`** — audit JUSTIFY row: editorial charcoal-on-coral is the deliberate Events voice. Do NOT migrate to `text-house-events-light-foreground` (cream). Flag for Jules in PR body.
- Selection chrome unchanged (canonical paired-inverse, FRAC-42-exempt).

#### 2b. `<FractalPattern>` line 12 — EXCLUDED (no edit)

`<FractalPattern color="#C13B2A" />` — out of scope per audit EXCLUDED row. Mirrors FRAC-20 / FRAC-24 precedent. Documented for traceability only; no edit.

#### 2c. `<SectorHeader>` line 17 — color prop migration

**Before (line 17):**
```jsx
<SectorHeader letter="E" name="Events" color="#C13B2A" />
```

**After (line 17):**
```jsx
<SectorHeader letter="E" name="Events" color="var(--color-house-events-deep)" />
```

Mirrors FRAC-25's CampusPage SectorHeader pattern (`color="var(--color-house-campus-deep)"`) and FRAC-21's LabPage pattern (`color="var(--color-house-publications-deep)"`).

#### 2d. Luma embed wrapper line 28 — EXACT no-op (no edit)

`<div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">` — both `bg-foreground/[0.03]` and `border-foreground/20` are already canonical foreground tokens at alpha. Translucent-foreground-as-surface-tint composite (per Campus PrimaryButton precedent) handles the pairing. No edit.

#### 2e. Luma link label line 40 — typography NEAR migration

**Before (line 40):**
```jsx
<a
  href="https://luma.com/nyc-tech"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block mb-12 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity duration-300"
>
  Open calendar in new tab →
</a>
```

**After (line 40):**
```jsx
<a
  href="https://luma.com/nyc-tech"
  target="_blank"
  rel="noopener noreferrer"
  className="text-meta inline-block mb-12 opacity-70 hover:opacity-100 transition-opacity duration-300"
>
  Open calendar in new tab →
</a>
```

Changes per audit NEAR row:
- Drop: `text-xs tracking-widest uppercase` (subsumed by `.text-meta` which pins `font-mono text-sm uppercase tracking-0.1em weight-500`).
- Add: `text-meta`.
- Preserve: `inline-block`, `mb-12`, `opacity-70`, `hover:opacity-100`, `transition-opacity`, `duration-300`.

**Visible rendering change at 375px:** family Inter → JetBrains Mono; weight 400 → 500; size `text-xs` (12px) → `text-sm` (14px); tracking `0.1em` preserved. The link label reads as canonical chrome-tier (mono, slightly larger, slightly heavier). No layout regression expected — `inline-block` with `mb-12` keeps the spacing rhythm intact. Document in commit body for reviewer eyes-on at 375px.

No text color row needed — the audit notes the link inherits `text-foreground` from the page cascade; preserved by leaving `text-foreground` on `<main>`.

#### 2f. Three `<p className="text-display">` sites (lines 20, 51, 60) — EXACT no-op (no edit)

Per audit: all three section-opener `<p>` tags already use `.text-display`. Collapsed to one row by audit (file + utility grouping). No edit.

### 3. `src/components/sections/Events.tsx` — orphan component, per-audit-row migration

The audit explicitly enumerates MIGRATE rows for this file. Per user instructions: "If the audit's per-file plan explicitly migrates rows in it, follow the audit." Following the audit.

#### 3a. `<section>` line 5 — FRAC-42 pairing addition

**Before (line 5):**
```jsx
<section className="py-24 md:py-40 bg-background" id="events">
```

**After (line 5):**
```jsx
<section className="py-24 md:py-40 bg-background text-foreground" id="events">
```

Per audit: `bg-background` is canonical; adding `text-foreground` re-asserts FRAC-42 pairing at the same node. The page-level body cascade already renders descendants as `text-foreground` (charcoal), so current rendering is unchanged. The addition is compositional safety (a future nested surface that swaps the cascade won't break descendant text color).

#### 3b. `<h2>` line 9 — EXACT no-op for color (typography flagged in audit)

`<h2 className="text-eyebrow text-muted-foreground mb-4">Events</h2>` — `text-muted-foreground` is canonical. `text-eyebrow` is canonical. The accidental-italic via the global h1–h6 rule is a sitewide forward observation per audit; not migrated here. **No edit.**

#### 3c. `<p>` line 10 — typography EXACT MIGRATE

**Before (line 10):**
```jsx
<p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight normal-case">
  Come <span className="italic normal-case">hang out</span> with us.
</p>
```

**After (line 10):**
```jsx
<p className="text-title max-w-2xl leading-tight">
  Come <span className="italic normal-case">hang out</span> with us.
</p>
```

Per audit EXACT row: `.text-title` is `font-serif text-3xl md:text-5xl italic font-weight-350 normal-case tracking-0.04em`. The current class soup matches exactly on size, family, italic style, and transform.

Changes:
- Drop: `text-3xl md:text-5xl font-serif normal-case` (subsumed by `.text-title`).
- Add: `text-title`.
- Preserve: `max-w-2xl leading-tight` (positional/sizing modifiers — leading-tight is a per-site override; spec sets no explicit leading).
- Inner `<span className="italic normal-case">` — left verbatim per audit's "optional one-letter trim" guidance; minimizing change surface.

**Visible rendering change at 375px:** Drift documented in audit: weight 400 → 350 (slightly lighter), tracking pinned to 0.04em (was Fraunces default). Size unchanged. Style unchanged. Family unchanged. Subtle weight delta; visually imperceptible for most readers. Document in commit body.

#### 3d. `<a>` wrapper line 17 — FRAC-42 pairing addition

**Before (line 17):**
```jsx
<a
  href="https://luma.com/nyc-tech"
  target="_blank"
  rel="noopener noreferrer"
  className="block overflow-hidden bg-muted relative group"
>
```

**After (line 17):**
```jsx
<a
  href="https://luma.com/nyc-tech"
  target="_blank"
  rel="noopener noreferrer"
  className="block overflow-hidden bg-muted text-muted-foreground relative group"
>
```

Per audit: `bg-muted` is canonical; adding `text-muted-foreground` re-asserts the muted/muted-foreground pairing. The link currently only wraps an `<img>` so the addition has zero visible rendering impact, but the FRAC-42 pairing principle (extended to muted/muted-foreground via DESIGN.md's declared `muted-foreground` token) calls for compositional safety.

#### 3e. Forward observation: orphan deletion candidate

Per audit and user instructions: surface in PR body as a deletion-candidate follow-up for Jules. NOT deleted in this PR.

---

## Commit strategy

1. **Commit 1 — lattice state catchup.** Absorb the pre-existing dirty `.lattice/events/task_01KTJQF2F11F49M5XXNWJQ5RX4.jsonl` and `.lattice/tasks/task_01KTJQF2F11F49M5XXNWJQ5RX4.json` plus the new plan file. Stage explicitly by filename. Subject: `FRAC-35: lattice state catchup — planner + planned + in_progress lifecycle`.
2. **Commit 2 — declare house-events tokens.** `src/index.css` only. Subject: `FRAC-35: declare house-events-{light,deep} + paired foregrounds in @theme`. Body cites FRAC-42 paired-from-day-one convention, FRAC-25 mechanism precedent, and the editorial charcoal-on-coral JUSTIFY note baked into the comment block.
3. **Commit 3 — migrate EventsPage surface + SectorHeader + Luma meta link.** `src/pages/EventsPage.tsx`. Subject: `FRAC-35: migrate EventsPage to canonical tokens + .text-meta`. Body notes: text-foreground preserved per audit JUSTIFY (editorial charcoal-on-coral), three migration rows (main bg, SectorHeader color prop, Luma link label typography).
4. **Commit 4 — migrate orphan Events.tsx per audit rows.** `src/components/sections/Events.tsx`. Subject: `FRAC-35: migrate orphan Events.tsx per audit FRAC-42 pairing + .text-title rows`. Body notes the orphan status and the deletion-candidate forward observation surfaced for Jules.

**Acceptable alternative:** merge Commits 3 + 4 into a single page-migration commit. **Not acceptable:** one mega-commit covering everything; or merging the token declaration into the page migration.

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

### Mobile 375px verification (mandatory per PRD + CLAUDE.md)

After the final visible-rendering commit, verify at 375px viewport:

- [ ] Page bg is still the same coral (`#D4857A`) — `bg-house-events-light` renders identically to the prior inline hex.
- [ ] Page-default text remains charcoal (`#171717`) — `text-foreground` preserved per JUSTIFY. NOT cream.
- [ ] SectorHeader monogram "E" + "Events" eyebrow render in deep crimson (`#C13B2A`) — confirm `color="var(--color-house-events-deep)"` prop resolves at runtime.
- [ ] FractalPattern decorative fill unchanged (`#C13B2A` raw hex preserved per EXCLUDED).
- [ ] Three `.text-display` section openers render unchanged (EXACT no-op).
- [ ] Luma calendar embed wrapper: translucent charcoal tint (3%) + charcoal border (20%) preserved.
- [ ] Luma "Open calendar in new tab →" link renders as `.text-meta` — JetBrains Mono uppercase, `text-sm` (slightly larger than prior `text-xs`), weight 500 (slightly heavier than prior 400), tracking 0.1em (matches prior `tracking-widest`). Opacity 70% / 100% hover preserved. No layout regression.
- [ ] Two `<Button>` CTAs ("Email Merlin's Place", "Join Discord") render unchanged.
- [ ] Selection: `selection:bg-foreground selection:text-background` highlights as charcoal-on-cream.
- [ ] No layout regressions on long button labels at 375px.
- [ ] Orphan `Events.tsx` not rendered anywhere (verified by repo-wide import grep returning zero hits).

### After the final commit

Re-run `pnpm typecheck && pnpm test` fresh. Confirm baseline-only failures remain. Move task to `review`.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/events-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op / EXCLUDED / JUSTIFY-preserved).
- [ ] `src/index.css` carries all four `--color-house-events-{light,deep,light-foreground,deep-foreground}` declarations in `@theme inline` immediately after the Campus block; the FRAC-21+25 comment block is extended to credit FRAC-35 and to record the editorial charcoal-on-coral JUSTIFY note.
- [ ] `src/pages/EventsPage.tsx:11` uses `bg-house-events-light text-foreground` in className; the `style={{ backgroundColor: "#D4857A" }}` prop is removed entirely; selection chrome preserved; `text-foreground` PRESERVED (NOT swapped to cream foreground).
- [ ] `src/pages/EventsPage.tsx:17` SectorHeader prop is `color="var(--color-house-events-deep)"`.
- [ ] `src/pages/EventsPage.tsx:40` Luma link label uses `.text-meta` with `inline-block mb-12 opacity-70 hover:opacity-100 transition-opacity duration-300` preserved; `text-xs tracking-widest uppercase` dropped.
- [ ] `src/pages/EventsPage.tsx:12` FractalPattern prop unchanged (`color="#C13B2A"`) per EXCLUDED.
- [ ] `src/pages/EventsPage.tsx:28` Luma embed wrapper unchanged (`bg-foreground/[0.03] border-foreground/20`) per EXACT no-op.
- [ ] `src/components/sections/Events.tsx:5` `<section>` adds `text-foreground` for FRAC-42 pairing.
- [ ] `src/components/sections/Events.tsx:10` `<p>` migrates to `.text-title` with `max-w-2xl leading-tight` preserved; `text-3xl md:text-5xl font-serif normal-case` dropped.
- [ ] `src/components/sections/Events.tsx:17` `<a>` adds `text-muted-foreground` for FRAC-42 pairing.
- [ ] `src/components/sections/Events.tsx:9` `<h2>` unchanged (accidental italic is a sitewide forward observation).
- [ ] Orphan `Events.tsx` NOT deleted (surface as deletion-candidate follow-up in PR body).
- [ ] No raw `#D4857A` in EventsPage.tsx after migration. Grep verification:
  ```
  grep -nE '#D4857A|"#C13B2A"' src/pages/EventsPage.tsx
  ```
  Only the FractalPattern excluded site (line 12) should remain.
- [ ] No `DESIGN.md`, `.lattice/notes/audits/events-audit.md`, or `.lattice/notes/audit-prompt.md`, or `.lattice/notes/audit-gaps.md` changes.
- [ ] No files modified outside the scope list: `src/index.css`, `src/pages/EventsPage.tsx`, `src/components/sections/Events.tsx`, and the standard `.lattice/events/*` + `.lattice/tasks/*` + `.lattice/plans/task_01KTJQF2F11F49M5XXNWJQ5RX4.md` lifecycle bookkeeping.
- [ ] `pnpm typecheck` passes clean.
- [ ] `pnpm test` shows the 4 documented baseline failures only.
- [ ] Mobile 375px verification documented in the implementer's review-handoff comment.
- [ ] Commit history is 3–4 logical commits.
- [ ] PR target is `frac-34-audit-events`, NOT master.
- [ ] PR body flags: (a) editorial charcoal-on-coral preserved per JUSTIFY — confirm with Jules; (b) orphan `Events.tsx` deletion-candidate follow-up.

---

## Review gate

A fresh-context review sub-agent verifies:

1. Plan file matches what was built (this file).
2. Audit doc rows all accounted for (no missed migrations; JUSTIFY/EXCLUDED/NO-OP correctly preserved).
3. Token declarations: four `house-events-*` siblings present in `@theme inline`; comment block extended.
4. Charcoal-on-coral editorial choice preserved on `<main>` (text-foreground NOT swapped).
5. FractalPattern prop untouched.
6. Orphan `Events.tsx` migrated per audit rows but NOT deleted.
7. No out-of-scope edits (grep diff against scope list).
8. PRD re-read; mobile-first 375px honored.
9. Tests pass with baseline-only failures.
10. PR opens against `frac-34-audit-events`.

---

## Open questions (low-severity)

1. **Editorial charcoal-on-coral confirmation.** Audit JUSTIFY: deliberate. PR body flags for Jules. Default: preserve. If Jules later elects cream-on-coral, a follow-up one-line change (`text-foreground` → `text-house-events-light-foreground`) suffices.
2. **Orphan `Events.tsx` migrated, not deleted.** Audit per-file rows include it; deletion is a separate decision. Default: migrate per audit, surface for follow-up.
3. **`.text-meta` size-up at the Luma link (`text-xs` → `text-sm`).** Most visible rendering change in the PR. Audit's `MIGRATE` action accepts it; commit body documents.

---

## Implementation order

1. Read this plan; re-read FRAC-22 PRD per CLAUDE.md mandatory check; re-read `events-audit.md` once more.
2. Verify `git status` matches expected dirty state (lattice FRAC-35 files + plan).
3. Commit 1 — lattice catchup (stage explicit FRAC-35 files only).
4. Commit 2 — `src/index.css` token declarations.
5. Commit 3 — `src/pages/EventsPage.tsx` migrations (main bg + SectorHeader + Luma meta link).
6. Commit 4 — `src/components/sections/Events.tsx` migrations (section pairing + .text-title + link wrapper pairing).
7. Final test gate: `pnpm typecheck && pnpm test`.
8. `lattice status review` + `lattice comment` with verification summary.
9. Open PR targeting `frac-34-audit-events` (NOT master).
