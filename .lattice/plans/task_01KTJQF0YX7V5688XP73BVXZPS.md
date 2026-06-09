# FRAC-27 — Apply Story page audit findings

**Task:** `task_01KTJQF0YX7V5688XP73BVXZPS`
**Branch:** `frac-27-apply-story` (off `frac-26-audit-story`, NOT master — the FRAC-26 audit doc + audit-gaps Story palette entry are upstream of this work and aren't on master yet, PR #189 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/story-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### Text foregrounds`, `### Surface foreground pairing`, `### Semantic type scale`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)
**Audit author/date:** FRAC-26 / 2026-06-09

---

## Scope

**FRAC-27 changes only `src/`.** Specifically `src/pages/StoryPage.tsx`, `src/components/sections/OriginStory.tsx`, and `src/components/sections/NeighborhoodCampusDiagram.tsx`. The two gallery files (`PhotoGallery.tsx`, `GalleryImage.tsx`) are EXACT no-ops on canonical tokens — the audit lists them for traceability, no migration needed. **No new tokens declared.** The Story palette cluster (#D4BA58 / #8A7A20) is preserved as raw hex per the audit's deferred decision (see "Token declaration decision" below).

### In scope

- `src/pages/StoryPage.tsx` — the page entry (~251 lines). Migrate:
  - Line 174 byline `text-sm text-foreground` → `.text-meta` (typography NEAR).
  - Line 122 TalkCard wrapper `<a>` — add `text-foreground` className per FRAC-42 surface-foreground pairing (paired with `bg-background`).
- `src/components/sections/OriginStory.tsx` — the origin narrative (~27 lines). Migrate:
  - Line 9 wrapper `space-y-4 text-sm md:text-base font-light` → drop `text-sm md:text-base font-light` and add `.text-body` (typography NEAR).
- `src/components/sections/NeighborhoodCampusDiagram.tsx` — the campus diagram (~216 lines). Migrate:
  - Line 81 stats `<ul>` — drop `text-xs md:text-sm` and add `.text-body`, preserve `space-y-1`, `leading-snug`, `text-foreground/90` (typography NEAR; color EXACT preserved).
  - Line 109 center node title — drop `font-serif text-lg md:text-xl tracking-tight` and add `.text-subtitle`; preserve `leading-tight normal-case`. Preserve italic via inline `italic` className (per audit's instruction to "preserve the italic if it's editorially intentional"; this center-node logotype italic is editorial).
  - Line 112 center node subtitle — drop standalone size classes; add `.text-meta` and keep `text-[10px] md:text-xs` as per-site size override per audit's "migrate to .text-meta with the size override side-by-side"; preserve `mt-2 opacity-80 leading-snug`.

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/story-audit.md`) — frozen as spec.
- `DESIGN.md`, `.lattice/notes/audit-prompt.md`, `.lattice/notes/audit-gaps.md` — FRAC-20 / FRAC-42 / FRAC-26 owned those edits.
- `src/index.css` — NO new tokens. Story is not a house; the palette cluster is a deferred system decision (see Token decision below).
- `src/components/gallery/GalleryImage.tsx` — `bg-muted` is canonical (EXACT no-op per audit); no migration. No `text-muted-foreground` pairing addition because the `<motion.div>` has no direct text children (audit §pairing N/A).
- `src/components/gallery/PhotoGallery.tsx` — pure layout (audit JUSTIFY).
- `src/data/storyPhotos.ts` — pure data (audit out of scope).
- `src/components/pretext/PretextParagraph.tsx`, `src/lib/pretext.ts`, `src/hooks/use-pretext.ts` — Pretext mechanics out of scope; the two call sites at StoryPage.tsx:179 and 224 are GAP-deferred per the existing Lab Pretext gap entry (audit-gaps.md, Date 2026-06-08, Page lab) — NO new audit-gaps.md entry needed and NO migration in this PR.
- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#8A7A20" />` call site at `StoryPage.tsx:202` — explicitly EXCLUDED per FRAC-20 (Lab) / FRAC-24 (Campus) precedent.
- `src/components/layout/Navbar.tsx`, `Footer.tsx`, `FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`, `SectorHeader.tsx` internals — shared chrome; out of scope per audit. The SectorHeader CALL SITE at StoryPage.tsx:209 IS in audit scope (its `color="#8A7A20"` prop), but per the Token decision below, the prop value is preserved as-is (deferred).
- `src/components/ui/button.tsx` — Story does not use `Button` at all.
- No `pnpm install`, no `package.json` changes, no new tests.
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, root-level `task_*.md`, other tasks' `.lattice/` files (per CLAUDE.md → Shared Worktree Discipline).

---

## Token declaration decision (the key call)

**Decided: NO new tokens. Preserve all Story palette raw hex sites verbatim. Story Apply executes only the canonical-utility migrations and the FRAC-42 pairing addition.**

### Why no tokens

The audit doc enumerates three options for the Story palette cluster (`#D4BA58` STORY_COLOR + `#8A7A20` RING_COLOR + alpha variants) and **explicitly does NOT pick one** ("Apply task choices (the audit doesn't decide)" — story-audit.md line 271). The three options:

  (a) Declare `--color-story-light` / `--color-story-deep` in `@theme inline` — **new tokens, new design-system surface area, requires Protocol-page coordination per the audit's Forward observation.**
  (b) Leave raw hex with a DESIGN.md "non-system accents permitted on non-house pages" carve-out — **policy change, requires DESIGN.md edit.**
  (c) Reuse a house pair — **loses the Story-specific golden voice; not recommended by the audit.**

Per the FRAC-27 orchestrator brief: *"If a needed migration would require a system change not specified in the audit, escalate via `lattice status FRAC-27 needs_human` with a one-line comment — do NOT invent tokens."* Option (a) is the most expansive system change (new tokens + DESIGN.md tokens-block edit + cross-page coordination); option (b) requires a DESIGN.md policy carve-out; option (c) is editorially harmful per the audit.

**The Apply task therefore executes the de-facto option (b) WITHOUT amending DESIGN.md:** every raw hex site stays exactly as it is. The audit-gaps.md Story entry (Date 2026-06-09) is the durable record of the deferred decision; a future task can adopt (a), (b)-formally, or (c). Per the audit doc's Forward observation #4 ("Non-house pages with their own accent pair pattern"), the human decision should be made jointly with Protocol-page audit — out of scope for FRAC-27.

**Consequence:** every audit row tagged `GAP / GAP-LOG-AND-MIGRATE` for the Story palette cluster is preserved verbatim in this PR. The "MIGRATE" half of that action label is the audit-gaps.md entry FRAC-26 already landed; the "LOG" half is satisfied by the existing entry. Nothing further to do here.

**This mirrors FRAC-21 (Lab) precedent for the LabPage Pretext GAP** — Lab Apply did NOT migrate the Pretext call sites because the gap entry deferred the system change; Lab Apply just recorded the entry and moved on. FRAC-27 takes the same posture for the Story palette.

### What this does NOT block

The audit's typography rows and color rows that DO have named canonical-utility / canonical-token targets still execute. The list is small but real (5 typography migrations + 1 FRAC-42 pairing addition) — enumerated below. None of these touch the Story palette hex values.

---

## Per-file migration plan

### 1. `src/pages/StoryPage.tsx`

#### 1a. TalkCard wrapper — FRAC-42 surface-foreground pairing (line 122)

Audit row: "src/pages/StoryPage.tsx:122 — <a className=… bg-background …>" — **NEAR (missing paired text-foreground on the same node per FRAC-42)**.

**Before (line 122–132):**
```jsx
<a
  href={talk.url}
  target="_blank"
  rel="noopener noreferrer"
  className={`
    group block rounded-lg border border-border bg-background
    transition-all duration-200 ease-out
    hover:scale-[1.02] hover:shadow-lg
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    p-5 md:p-6
  `}
```

**After:**
```jsx
<a
  href={talk.url}
  target="_blank"
  rel="noopener noreferrer"
  className={`
    group block rounded-lg border border-border bg-background text-foreground
    transition-all duration-200 ease-out
    hover:scale-[1.02] hover:shadow-lg
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    p-5 md:p-6
  `}
```

Single edit: insert `text-foreground` after `bg-background`. Per FRAC-42, the surface node carrying a `bg-*` token must declare the paired foreground. This makes the TalkCard explicit and immune to future restructure of the `<main>` cascade. Visual rendering identical (text-foreground already cascades from `<main>`).

#### 1b. Byline typography migration (line 174)

Audit row: "StoryPage.tsx:174 — `<p className="text-sm text-foreground mt-1">{talk.author}, {talk.year}</p>`" — **NEAR**. Nearest canonical utility: `.text-meta`.

**Before:**
```jsx
<p className="text-sm text-foreground mt-1">
  {talk.author}, {talk.year}
</p>
```

**After:**
```jsx
<p className="text-meta text-foreground mt-1">
  {talk.author}, {talk.year}
</p>
```

Drop standalone `text-sm` (now bundled into `.text-meta` which is `font-mono text-sm font-weight-500 uppercase tracking-0.1em`). Preserve `text-foreground` (canonical token, paired with `bg-background` per FRAC-42 — already correct). Preserve `mt-1` layout.

**Visible delta at 375px:** family Inter → JBM; weight 400 → 500; transform none → uppercase; tracking default → 0.1em. Same as Lab's DocumentBadge:99 author byline migration (FRAC-21).

#### 1c. Other StoryPage.tsx rows — no code changes

- Line 211 `.text-display` — EXACT no-op (already canonical).
- Line 169 `.text-subtitle leading-snug normal-case` — already canonical; audit says NEAR but the utility is already in use, drift is per-call-site `leading-snug` override which is acceptable.
- Line 155 `.text-eyebrow` — EXACT no-op.
- Line 179 PretextParagraph — GAP-DEFERRED (covered by Lab Pretext gap entry; no migration this PR).
- Line 224 PretextParagraph — GAP-DEFERRED (same).
- Line 201 `<main>` — text-foreground + selection chrome already canonical; the `style={{ backgroundColor: "#D4BA58" }}` stays per Token decision.
- Line 202 FractalPattern — EXCLUDED.
- Line 209 SectorHeader prop `color="#8A7A20"` — GAP-DEFERRED (Story palette cluster).
- Lines 137, 146, 151, 156, 189, 18 — STORY_COLOR uses — GAP-DEFERRED.
- Line 164 ArrowUpRight `text-muted-foreground` — EXACT no-op.

### 2. `src/components/sections/OriginStory.tsx`

#### 2a. Origin narrative wrapper typography (line 9)

Audit row: "OriginStory.tsx:9 — `<div className="space-y-4 text-sm md:text-base font-light"> rendering 3 <p> children`" — **NEAR**. Nearest canonical utility: `.text-body`.

**Before:**
```jsx
<div className="space-y-4 text-sm md:text-base font-light">
```

**After:**
```jsx
<div className="space-y-4 text-body">
```

Drop both `text-sm md:text-base` AND `font-light` (subsumed by `.text-body` which pins `text-base` weight 400). Preserve `space-y-4` (layout). The wrapper's typography cascades to the 3 `<p>` children at lines 10, 13, 16 — single edit covers all 4 elements per audit's `(file + utility)` grouping.

**Visible delta at 375px:** mobile size text-sm (14px) → text-base (16px) — BIGGER body at mobile. Weight 300 → 400 — slightly heavier. Same pattern Campus FRAC-25 absorbed across 18 body sites; same pattern Lab FRAC-21 absorbed on DocumentBadge:103. Document in commit body and verify no overflow at 375px.

### 3. `src/components/sections/NeighborhoodCampusDiagram.tsx`

#### 3a. Pillar stats list typography (line 81)

Audit row: "NCD:81 — `<ul className="space-y-1 text-xs md:text-sm leading-snug text-foreground/90">`" — **NEAR**. Nearest canonical utility: `.text-body`.

**Before:**
```jsx
<ul className="space-y-1 text-xs md:text-sm leading-snug text-foreground/90">
```

**After:**
```jsx
<ul className="space-y-1 text-body leading-snug text-foreground/90">
```

Drop `text-xs md:text-sm` (subsumed by `.text-body`). Preserve `space-y-1` (layout), `leading-snug` (per-call-site override; audit acceptable), `text-foreground/90` (canonical alpha-modified color, EXACT). Cascades to inner `<li>` at 83 and `<span>` at 87 per audit's (file + utility) grouping; no per-site edits to those nested elements.

**Visible delta at 375px:** mobile text-xs (12px) → text-base (16px). **Largest single visible change in the PR.** May affect 5-pillar grid layout in the circular diagram at 375px — verify the PillarCards still fit at `w-[45%]` mobile, and that the stat lists do not overflow their cards.

#### 3b. Center node title (line 109)

Audit row: "NCD:109 — `<div className="font-serif text-lg md:text-xl leading-tight tracking-tight normal-case">Fractal NYC</div>`" — **NEAR**. Nearest canonical utility: `.text-subtitle`. **Apply task should preserve the italic** per audit's instruction ("italic Fraunces in a circle reads as a logotype").

**Before:**
```jsx
<div className="font-serif text-lg md:text-xl leading-tight tracking-tight normal-case">
  Fractal NYC
</div>
```

**After:**
```jsx
<div className="text-subtitle italic leading-tight normal-case">
  Fractal NYC
</div>
```

Drop `font-serif text-lg md:text-xl tracking-tight` (subsumed by `.text-subtitle` which is `font-serif text-xl md:text-2xl tracking-0.04em`). Add explicit `italic` className to preserve the editorial logotype italic (the `.font-serif` global rule that pulls in italic is being subsumed by `.text-subtitle` which sets `font-style: normal`; the explicit `italic` className re-asserts it for this site). Preserve `leading-tight` (per-site override) and `normal-case`.

**Visible delta at 375px:** mobile size text-lg (18px) → text-xl (20px); md size text-xl (20px) → text-2xl (24px); weight 400 → 300; tracking-tight → 0.04em. Italic preserved. Slightly larger and slightly lighter logotype.

#### 3c. Center node subtitle (line 112)

Audit row: "NCD:112 — `<div className="text-[10px] md:text-xs mt-2 opacity-80 leading-snug">A neighborhood campus<br />founded in 2021</div>`" — **NEAR**. Nearest canonical utility: `.text-meta` with the size override side-by-side.

**Before:**
```jsx
<div className="text-[10px] md:text-xs mt-2 opacity-80 leading-snug">
  A neighborhood campus
  <br />
  founded in 2021
</div>
```

**After:**
```jsx
<div className="text-meta text-[10px] md:text-xs mt-2 opacity-80 leading-snug">
  A neighborhood campus
  <br />
  founded in 2021
</div>
```

Add `.text-meta` (pulls in JBM weight 500 uppercase tracking-0.1em). Keep `text-[10px] md:text-xs` as per-site size override (audit explicitly says "migrate to .text-meta with the size override side-by-side"). Preserve `mt-2 opacity-80 leading-snug`.

**Visible delta at 375px:** family Inter → JBM; weight 400 → 500; transform none → uppercase ("A NEIGHBORHOOD CAMPUS / FOUNDED IN 2021"); tracking default → 0.1em. Size unchanged (override pinned). Same density-override pattern as Home's Hero.tsx:289 (per audit row rationale).

#### 3d. Other NCD rows — no code changes

- Line 77 `.text-subtitle leading-tight normal-case` — already canonical; NEAR but utility in use, drift is per-site `leading-tight` override, acceptable.
- Line 74 emoji `<span>` — JUSTIFY (no change).
- Lines 83-89 inner spans — JUSTIFY (folded into line 81 row).
- Line 57 `RING_COLOR = "#8A7A20"` / Line 58 `RING_SOFT = "#8A7A2033"` — GAP-DEFERRED (palette cluster).
- Lines 66, 101 `backgroundColor: "transparent"` — JUSTIFY transparent; borders use RING_*  which is GAP-DEFERRED.
- Line 165 SVG `stroke={RING_COLOR}` — GAP-DEFERRED.
- Line 168 SVG opacity — presentation, not a token.

### 4. `src/components/gallery/PhotoGallery.tsx` and `GalleryImage.tsx`

**No changes.** Both files are EXACT no-ops per audit (PhotoGallery pure layout / JUSTIFY; GalleryImage `bg-muted` already canonical with no text-bearing children so FRAC-42 pairing N/A).

---

## Commit strategy

1. **Commit 1 — lattice state catchup.** Absorb the pre-existing dirty `.lattice/events/task_01KTJQF0YX7V5688XP73BVXZPS.jsonl` and `.lattice/tasks/task_01KTJQF0YX7V5688XP73BVXZPS.json` plus the new plan file. Stage explicitly by filename. Subject: `FRAC-27: lattice state catchup — planner + planned + in_progress lifecycle`.
2. **Commit 2 — StoryPage.tsx migrations.** TalkCard FRAC-42 `text-foreground` pairing addition (line 122) + byline `text-sm` → `.text-meta` (line 174). Subject: `FRAC-27: migrate StoryPage TalkCard pairing + byline meta utility`. Body cites FRAC-42 and the .text-meta NEAR migration.
3. **Commit 3 — OriginStory.tsx body migration.** Wrapper `text-sm md:text-base font-light` → `.text-body` (line 9). Subject: `FRAC-27: migrate OriginStory wrapper to .text-body`. Body documents the mobile body size-up (`text-sm` → `text-base`) and verification at 375px.
4. **Commit 4 — NeighborhoodCampusDiagram.tsx typography migrations.** Pillar stats list (line 81) → `.text-body`; CenterNode title (line 109) → `.text-subtitle italic`; CenterNode subtitle (line 112) → `.text-meta` with size override. Subject: `FRAC-27: migrate NeighborhoodCampusDiagram typography sites to canonical utilities`. Body documents the three size deltas and 375px verification.

**Acceptable alternative:** merge Commits 2 + 3 + 4 into a single src/ commit if the implementer judges the total diff is small enough (likely ~10 lines changed). The 4-commit split is preferred for cleaner per-file review. **Not acceptable:** one mega-commit covering all lattice + src/ changes.

---

## Test plan

### At every commit gate

```
pnpm typecheck   # MUST pass — clean exit
pnpm test        # MUST show baseline failures only (4 documented; see below)
```

### Documented baseline test failures (NOT regressions)

Per FRAC-25 documentation:
1. Footer FRAC-88 italic test
2. Footer Jacquard test
3. Navigation mobile labels test
4. Neighborhood min-h-screen test

Any failure OUTSIDE this list is a regression — halt and `lattice comment` the task with the stack trace.

### Mobile 375px verification (mandatory per PRD + CLAUDE.md)

After each visible-rendering commit (Commits 2–4), spot-check at 375px viewport that the migrations render correctly:

- [ ] Page bg is still the same gold (`#D4BA58`) — inline style preserved.
- [ ] All body and chrome text on the gold bg reads charcoal (`text-foreground` = #171717) — divergence from Lab/Campus cream is intentional per audit's WCAG rationale.
- [ ] **TalkCard:** wrapper now carries explicit `text-foreground`; the FRAC-42 pairing reads identical to prior (cream card / charcoal text); the byline "Tyler Alterman, 2025" reads in JBM uppercase at tracking-0.1em (was Inter normal-case) — **VISIBLE CHANGE**, byline now reads like a chrome label.
- [ ] **OriginStory narrative:** the 3 paragraphs read **noticeably larger** at 375px (text-sm 14px → text-base 16px) and **slightly heavier** (weight 300 → 400). Hierarchical contrast against the `text-display` heading still reads. No overflow on long lines.
- [ ] **NeighborhoodCampusDiagram pillar stats:** the bullet lists inside each PillarCard read **noticeably larger** at 375px (text-xs 12px → text-base 16px). Critical check: at 375px in the circular layout, do the PillarCards (sized `w-[45%]` mobile) still fit their content without overflow? The audit acknowledges body-paragraph size-up at mobile; visually verify.
- [ ] **NeighborhoodCampusDiagram center node title:** "Fractal NYC" reads in italic Fraunces light weight (logotype). Slightly larger than before. Italic preserved.
- [ ] **NeighborhoodCampusDiagram center node subtitle:** "A NEIGHBORHOOD CAMPUS / FOUNDED IN 2021" now in JBM uppercase with widened tracking. Size unchanged from override.
- [ ] No layout regression on the 8 TalkCard grid at 375px (single-column).
- [ ] Hover effects on TalkCard still pulse the `#D4BA5866` border (raw hex preserved).
- [ ] Selection chrome unchanged.

### After the final commit

Re-run `pnpm typecheck && pnpm test` fresh. Confirm baseline-only failures remain. Move task to `review`.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/story-audit.md` has a corresponding action: edit, EXACT no-op (no code change), GAP-DEFERRED (palette cluster preserved per Token decision), or EXCLUDED.
- [ ] `src/pages/StoryPage.tsx:122` TalkCard wrapper `<a>` carries `text-foreground` in its className (FRAC-42 pairing addition).
- [ ] `src/pages/StoryPage.tsx:174` byline uses `.text-meta` (replacing `text-sm`).
- [ ] `src/components/sections/OriginStory.tsx:9` wrapper uses `.text-body` (replacing `text-sm md:text-base font-light`).
- [ ] `src/components/sections/NeighborhoodCampusDiagram.tsx:81` stats `<ul>` uses `.text-body` (replacing `text-xs md:text-sm`); preserves `space-y-1`, `leading-snug`, `text-foreground/90`.
- [ ] `src/components/sections/NeighborhoodCampusDiagram.tsx:109` CenterNode title uses `.text-subtitle italic` (replacing `font-serif text-lg md:text-xl tracking-tight`); preserves `leading-tight normal-case`.
- [ ] `src/components/sections/NeighborhoodCampusDiagram.tsx:112` CenterNode subtitle uses `.text-meta` with `text-[10px] md:text-xs` as side-by-side size override; preserves `mt-2 opacity-80 leading-snug`.
- [ ] **No Story palette hex values are migrated** — every `STORY_COLOR`, `RING_COLOR`, `RING_SOFT`, and inline `style={{ backgroundColor: "#D4BA58" }}` / `color: "#8A7A20"` site stays verbatim. Grep verification:
  ```
  grep -nE 'STORY_COLOR|RING_COLOR|RING_SOFT|#D4BA58|#8A7A20' \
    src/pages/StoryPage.tsx src/components/sections/NeighborhoodCampusDiagram.tsx
  ```
  Match count MUST be unchanged from pre-PR (audit-doc enumerates the sites; spot-check matches by line).
- [ ] **No new tokens declared in `src/index.css`.** File untouched.
- [ ] **No `DESIGN.md`, `.lattice/notes/audits/story-audit.md`, `.lattice/notes/audit-prompt.md`, or `.lattice/notes/audit-gaps.md` changes.**
- [ ] No files modified outside the scope list: `src/pages/StoryPage.tsx`, `src/components/sections/OriginStory.tsx`, `src/components/sections/NeighborhoodCampusDiagram.tsx`, and the standard `.lattice/events/*` + `.lattice/tasks/*` lifecycle bookkeeping + the plan file itself.
- [ ] `pnpm typecheck` passes clean.
- [ ] `pnpm test` shows the 4 documented baseline failures only.
- [ ] Mobile 375px spot-check documented in the implementer's review-handoff comment.
- [ ] Commit history is 2–4 logical commits.
- [ ] PR target is `frac-26-audit-story`, NOT master.

---

## Review gate

Per CLAUDE.md → Review Gate: the review sub-agent reads the plan + git diff cold, runs typecheck + tests, verifies every audit row's outcome matches the plan, and records findings via `lattice comment --role review`. Specific review checks:

1. **PRD re-read:** the FRAC-22 PRD declares the Story page in Site Architecture; mobile-first is non-negotiable. Verify the body size-up migrations preserve mobile-first readability (no overflow regressions on long event-type strings or stat lists at 375px).
2. **Audit fidelity:** every row in story-audit.md is accounted for. EXACT/no-op rows do not produce edits. NEAR/MIGRATE rows produce the named canonical-utility migration. GAP-DEFERRED palette rows stay verbatim.
3. **No token invention:** `src/index.css` unchanged.
4. **No out-of-scope edits:** DESIGN.md, audit docs, audit-gaps untouched.
5. **Baseline regression check:** typecheck clean; only the 4 documented baseline test failures remain.

If the review agent finds rework needed, it states explicitly "implementation-level rework needed" or "plan-level rework needed" per CLAUDE.md → Review Rework Loop. Default expectation: this PR is a small, surgical canonical-utility migration; minor inline fixes are likely the worst case.

---

## Open questions (low-severity)

1. **NCD pillar stats size-up at 375px (text-xs → text-base) — confirm no overflow.** The audit accepts the size-up; FRAC-25 made the same call (Campus body cluster) without escalation. Default: accept; flag in commit body for review eyes-on at 375px. If a PillarCard's stat list overflows its `w-[45%]` width in the circular layout, that is a layout fix beyond FRAC-27 scope — flag via `needs_human` rather than reverting the migration.
2. **Story palette cluster deferred — surface to human queue?** The audit-gaps Story entry already lives upstream on the audit branch (PR #189). The PR body should reference it explicitly so the reviewer + human understand FRAC-27 deliberately did not touch the palette. No `needs_human` transition required (audit-gaps is the existing queue mechanism).
3. **Italic on center node title via explicit `italic` className — verify cascade.** `.text-subtitle` sets `font-style: normal`. Adding `italic` after `.text-subtitle` in the className string should win via Tailwind's `font-style: italic` utility. Verify via DOM inspection at runtime that the rendered `font-style` is `italic`.

---

## Implementation order

1. Read this plan; re-read FRAC-22 PRD per CLAUDE.md mandatory check; re-read `story-audit.md` once more.
2. Verify `git status` matches expected dirty state (lattice FRAC-27 files + plan).
3. Commit 1 — lattice catchup (stage explicit FRAC-27 files only).
4. Commit 2 — `src/pages/StoryPage.tsx` migrations (TalkCard pairing + byline meta).
5. Commit 3 — `src/components/sections/OriginStory.tsx` body migration.
6. Commit 4 — `src/components/sections/NeighborhoodCampusDiagram.tsx` typography migrations.
7. Final test gate: `pnpm typecheck && pnpm test`. 375px spot-check at minimum (mental walk-through; dev-server validation if practical).
8. `lattice status review` + `lattice comment` with verification summary.
9. Open PR targeting `frac-26-audit-story` (NOT master).
