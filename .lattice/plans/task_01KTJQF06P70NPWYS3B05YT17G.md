# FRAC-23: Apply Home page audit findings

**Task:** task_01KTJQF06P70NPWYS3B05YT17G
**Branch:** `frac-23-apply-home` (branched off `frac-22-audit-home`, not `master` — the FRAC-22 audit doc + audit-gaps entry are upstream of this work and aren't on `master` yet, PR #185 open)
**Audit doc (spec, frozen):** `.lattice/notes/audits/home-audit.md`
**PRD:** `.lattice/plans/FRAC-22.md` (re-read per CLAUDE.md mandatory PRD check)
**DESIGN.md:** `DESIGN.md` (see `### Text foregrounds`, `### Surface foreground pairing`, `### Semantic type scale`)
**Mobile viewport baseline:** 375px (non-negotiable per PRD + CLAUDE.md)

---

## Scope

**FRAC-23 changes only `src/`.** Specifically the two Home-graph files: `src/pages/Home.tsx` and `src/components/sections/Hero.tsx`. **No `src/index.css` edits, no new tokens, no new utilities.**

### In scope

- `src/pages/Home.tsx`
- `src/components/sections/Hero.tsx`

### Out of scope (do NOT touch)

- The audit doc itself (`.lattice/notes/audits/home-audit.md`) — frozen as the spec.
- `DESIGN.md` and `.lattice/notes/audit-prompt.md` — FRAC-20/FRAC-42 owned those edits.
- `src/index.css` — Home is not a house. No new tokens or utilities are needed (see "House token declaration decision" below).
- Shared chrome: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`, `FractalPattern.tsx`.
- 3D scene files: `src/components/three/FractalCityScene.tsx`, `src/components/three/OctahedronHero.tsx`, `src/components/three/Skyline.tsx`, `src/components/three/FractalObject.tsx`. Explicitly excluded by the audit (audit-prompt section 9, DESIGN.md "Components" non-tokens).
- Hooks and data: `src/hooks/use-global-search.ts`, `src/hooks/usePrefersReducedMotion.ts`, Wouter's `useLocation`, `OUTER_NAV_NODES` data import.
- The commented-out `HouseBannerGrid` import at `Home.tsx:3-5` (FRAC-161 hide). **Leave the commented import as-is** — it is documented context.
- The `<img src="…/skyline4.png" />` raster at `Hero.tsx:305` (image colors / inline `opacity` style — out of scope per audit-prompt section 9).
- Sibling-agent territory: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`.

**No `pnpm install`, no `package.json` changes.** Pure migration.

---

## House token declaration decision

**No new tokens needed. No `src/index.css` changes.**

Home is the entry page — **it is not a house**. Per the audit's "House identity" section: Home chrome text is `text-foreground` (charcoal) or `text-background` (cream) only. No house color is permitted as Home page chrome text or surface. A walk of `Home.tsx` and `Hero.tsx` confirms no `text-house-*` or `bg-house-*` utility appears today.

The FRAC-21 precedent was to declare `--color-house-publications-{light,deep}` in `@theme inline` because Lab is the Publications house page; FRAC-42 then declared the paired foreground siblings. **FRAC-23 declares nothing.** All edits are pure callsite migrations using utilities that already exist (`bg-background`, `text-foreground`, `.text-eyebrow`, `.text-control`, `.text-meta`, `.text-label`, `.text-display`).

`.text-control` (FRAC-41) is **confirmed present** at `src/index.css:229-234` and documented at `DESIGN.md:264-266`. The search input row at `Hero.tsx:194` and the mirror span at `Hero.tsx:199` can migrate to `.text-control` directly — no deferral needed.

---

## Per-file migration plan

### 1. `src/pages/Home.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| Home.tsx:19 (main bg + text + selection) | 19 | `<main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">` | (unchanged — EXACT no-op per audit row Home.tsx:19) | Already canonical. Surface foreground pairing (FRAC-42) satisfied. |
| Home.tsx:25 (section bg — FRAC-42 pairing NEAR) | 25 | `<section className="bg-background px-[4.5%] py-40 md:py-60">` | `<section className="bg-background text-foreground px-[4.5%] py-40 md:py-60">` | Add `text-foreground` to satisfy the FRAC-42 pairing rule. Rendering unchanged (cascade from `<main>` already produces this color today); migration is for compositional safety. |
| Home.tsx:35,42,51,60,69,80 (text-foreground/80 + hover:text-foreground) | 35, 42, 51, 60, 69, 80 | `text-foreground/80` (wrapper) + `hover:text-foreground` (anchors) | (unchanged — EXACT no-op per audit color row covering all 6 sites) | Already canonical foreground token; alpha modifier is presentation. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| Home.tsx:28 (`<h2 className="text-display">`) | 28 | `<h2 className="text-display">` | (unchanged — EXACT no-op per audit row Home.tsx:28) | Already canonical. |
| Home.tsx:35 (GAP — Golden Age Protocol prose wrapper) | 35 | `<div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}>` | (unchanged — **GAP deferred**; see "GAP cluster handling" below) | Defer to a future ticket. Verify the cascade still produces JBM uppercase weight 100 at responsive `text-sm md:text-base` after surrounding edits. |
| Home.tsx:38,47,56,65,78 (inline anchor links inheriting GAP) | 38, 47, 56, 65, 78 | `<a className="underline underline-offset-2 hover:text-foreground transition-colors">` | (unchanged — GAP-inherited; covered by L35 wrapper deferral) | Inherits family/weight/size/transform from L35 wrapper; the `<em>scenius</em>` at L84 stays italic via UA default. Implementer should sanity-check that all 5 anchors render identically pre/post the **pairing** edit at L25. |

---

### 2. `src/components/sections/Hero.tsx`

#### Color audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| Hero.tsx:120 (hero section bg — FRAC-42 pairing NEAR) | 120 | `<section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background">` | `<section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background text-foreground">` | Add `text-foreground` for FRAC-42 pairing. Rendering unchanged (cascade from `<main>` already produces this color today). |
| Hero.tsx:133 (skip-nav ul bg + border — FRAC-42 pairing NEAR / border EXACT) | 133 | `<ul className="flex flex-col gap-1 bg-background border border-foreground p-3 font-mono text-xs uppercase tracking-wider">` | `<ul className="flex flex-col gap-1 bg-background text-foreground border border-foreground p-3 text-eyebrow">` | **Combines two audit rows**: (a) FRAC-42 pairing — add `text-foreground`; (b) typography NEAR migration — replace `font-mono text-xs uppercase tracking-wider` with `.text-eyebrow`. `border border-foreground` stays (already EXACT). See typography section below for the typography row. |
| Hero.tsx:143 (skip-nav anchor hover/focus chrome) | 143 | `<a className="block px-2 py-1 hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">` | (unchanged — EXACT no-op per audit color row) | All three utilities already on canonical foreground token. State-only surfaces exempt from pairing rule. |
| Hero.tsx:143,163,194,221,243,259,261,262,272,278,289 (text-foreground variations) | 143, 163, 194, 221, 243, 259, 261, 262, 272, 278, 289 | various `text-foreground/40`, `/60`, `/70`, `/80`, plain `text-foreground` | (unchanged — EXACT no-op per audit color row covering all sites) | Every site on canonical foreground token; alpha is presentation. |
| Hero.tsx:194 (input chrome bundle — text + border + bg + placeholder) | 194 | `text-foreground/60 border border-foreground/20 bg-background/90 placeholder:text-foreground/60 focus:border-foreground/40 focus:text-foreground/80` | (unchanged — EXACT no-op per audit color row) | Pairing satisfied co-declared on same node (`bg-background/90` + `text-foreground/60`). Typography row migrates separately (see below). |
| Hero.tsx:221 (caret bg-foreground/70) | 221 | `bg-foreground/70` | (unchanged — EXACT no-op) | Decorative fill; pairing N/A (no text content). |
| Hero.tsx:240 (listbox container bg + border — FRAC-42 pairing NEAR / border EXACT) | 240 | `<div id={listboxId} role="listbox" aria-label="Search results" className="absolute bottom-full left-0 mb-1 w-full bg-background/95 backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto">` | `<div id={listboxId} role="listbox" aria-label="Search results" className="absolute bottom-full left-0 mb-1 w-full bg-background/95 text-foreground backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto">` | Add `text-foreground` for FRAC-42 pairing. Descendant `<li>` and "No results" `<div>` re-declare their own text colors per state, so rendering is unchanged. |
| Hero.tsx:259-263 (option li states) | 259-263 | `${isFocused ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/5"}` | (unchanged — EXACT no-op) | Focused branch pair already satisfied; default + hover branches are state-only surfaces. |
| Hero.tsx:270,275 (icon opacity) | 270, 275 | `<Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />` + `<ArrowUpRight className="h-3 w-3 opacity-40 shrink-0" />` | (unchanged — EXACT no-op) | currentColor inheritance is canonical; opacity is layout/effect. |

#### Typography audit rows

| Audit row | Line | Old | New | Notes |
|---|---|---|---|---|
| Hero.tsx:133 (skip-nav ul NEAR — JBM uppercase tracking-wider → .text-eyebrow) | 133 | `font-mono text-xs uppercase tracking-wider` (on the `<ul>`) | `text-eyebrow` (replaces all four utilities; size shifts text-xs→text-sm, weight 400→500, tracking wider→0.1em — intentional canonical correction per audit row) | **Combined with the pairing edit above into one className change.** `<a>` children at L143 inherit the corrected typography automatically (audit row Hero.tsx:143 NEAR/MIGRATE; no per-anchor change). |
| Hero.tsx:143 (skip-nav anchor — inherits L133) | 143 | `className="block px-2 py-1 hover:bg-foreground/10 …"` | (unchanged — inherited from L133 migration) | Audit row explicitly says no per-anchor className change. |
| Hero.tsx:194 (input NEAR — .text-label → .text-control) | 194 | `text-label text-foreground/60` (on the `<input>`) | `text-control text-foreground/60` | Migrate to `.text-control` per audit. Case (uppercase→normal-case) and size (text-sm 14px→text-base 16px) are the intended UX corrections (iOS no-zoom, no forced uppercase). The mirror span at L199 must migrate in lockstep. |
| Hero.tsx:199 (mirror span — NEAR, lockstep with input) | 199-213 | `<span ref={mirrorRef} aria-hidden="true" className="text-label" style={…}>{query || "Explore Fractal..."}</span>` | `<span ref={mirrorRef} aria-hidden="true" className="text-control" style={…}>{query || "Explore Fractal..."}</span>` | MUST stay in lockstep with the input at L194 so `offsetWidth` measurement matches actual rendered width. Visibility:hidden — no contrast concern. |
| Hero.tsx:243 (No results — EXACT) | 243 | `<div className="text-meta text-foreground/60 text-center px-3 py-3">No results</div>` | (unchanged — EXACT no-op per audit row) | Already canonical. |
| Hero.tsx:272 (result title EXACT — .text-label) | 272 | `<div className="text-label truncate flex items-center gap-1">{result.title}…</div>` | (unchanged — EXACT no-op per audit row) | Already canonical. |
| Hero.tsx:278 (result subtitle NEAR — text-xs → .text-meta + density override) | 278 | `<div className="text-xs text-foreground/60 truncate mt-0.5">{result.subtitle}</div>` | `<div className="text-meta text-xs text-foreground/60 truncate mt-0.5">{result.subtitle}</div>` | Add `.text-meta` (semantic canonical) **side by side with `text-xs`** to preserve the compact-dropdown density. Pattern mirrors the L289 group label (`text-eyebrow text-[10px]`). Family flips Inter→JBM, weight 400→500, transform→uppercase, tracking→0.1em — these are intentional canonical corrections per audit row. Size stays text-xs via the explicit override. The audit row's forward observation calls this out as a candidate for a future container-scoped utility; today we keep the override side-by-side. |
| Hero.tsx:289 (group label NEAR — .text-eyebrow with density override) | 289 | `<div className="text-eyebrow text-[10px] text-foreground/40 px-3 pt-2 pb-1">{group.label}</div>` | (unchanged — already on `.text-eyebrow` with `text-[10px]` density override side-by-side; comment at L288 documents it) | Already canonical pattern; the audit row preserves it. |

---

## Surface foreground pairing migrations (FRAC-42)

This is the first Apply task that hits the FRAC-42 pairing rule at scale (Lab's Apply task FRAC-21 was the first to use it inline on `DocumentBadge`; FRAC-42 itself migrated only one `<main>` call site). Four sites in Home need `text-foreground` added next to `bg-background*`:

| File | Line | Before (`bg-*`) | After (`bg-*` + `text-*`) |
|---|---|---|---|
| `src/pages/Home.tsx` | 25 | `bg-background px-[4.5%] py-40 md:py-60` | `bg-background text-foreground px-[4.5%] py-40 md:py-60` |
| `src/components/sections/Hero.tsx` | 120 | `… overflow-hidden bg-background` | `… overflow-hidden bg-background text-foreground` |
| `src/components/sections/Hero.tsx` | 133 | `… bg-background border border-foreground p-3 …` | `… bg-background text-foreground border border-foreground p-3 …` |
| `src/components/sections/Hero.tsx` | 240 | `… w-full bg-background/95 backdrop-blur-sm border border-foreground/20 …` | `… w-full bg-background/95 text-foreground backdrop-blur-sm border border-foreground/20 …` |

All four are **rendering-equivalent today** (page-level cascade from `Home.tsx:19` already supplies `text-foreground` to every descendant). The migration is for compositional safety: if any future nested surface flips the cascade (e.g., a future house surface inside a banner), these nodes will continue to render correctly because they re-assert their own voice. This is the same "surfaces compose" rationale called out in DESIGN.md → Surface foreground pairing.

---

## GAP cluster handling (`Home.tsx:35`)

**Decision: defer the GAP. Leave `Home.tsx:35` exactly as written.**

The audit logs a GAP entry for the "Golden Age Protocol" prose wrapper (`<div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}>`). The nearest-fit `.text-eyebrow` / `.text-label` / `.text-meta` are all flat `text-sm` at weight 500 with tracking 0.1em — wrong weight (100 vs 500), wrong responsive size (text-sm→text-base vs flat text-sm), missing tracking. No canonical body utility today uses mono uppercase at weight 100.

Three options considered:

- **A. Defer the GAP** — leave `Home.tsx:35` untouched; the same posture FRAC-21 took for the ArchiveSearch input (deferred to FRAC-41). Forward observation noted in commit message + audit-gaps entry (already filed at `.lattice/notes/audit-gaps.md:34-38`). **CHOSEN.**
- **B. Add a new `.text-body-mono` utility tier** to DESIGN.md + `src/index.css`. Out of FRAC-23 scope per the FRAC-21 precedent ("Apply tasks do not edit DESIGN.md or add new system utilities"). Would need a separate ticket (like FRAC-41 was for `.text-control`). **Rejected for this task.**
- **C. Migrate to nearest fit** — `.text-eyebrow` (flat text-sm, weight 500, tracking 0.1em). Loses responsive `text-sm md:text-base` size and changes weight from 100 to 500 — visible regression. **Rejected.**

**What the implementer does:**

1. Leave `Home.tsx:35` className verbatim: `font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin` plus the `style={{ fontStyle: "normal" }}` override.
2. Leave the five inline anchors at lines 38, 47, 56, 65, 78 untouched (they inherit from L35 and the audit explicitly defers them with the wrapper).
3. Leave the `<em>scenius</em>` at line 84 untouched — UA italic default is intentional editorial emphasis, no Tailwind utility involved.
4. **Do not** invent a `.text-body-mono` utility. **Do not** "fix" the audit-gaps entry.
5. The audit-gaps.md entry at `.lattice/notes/audit-gaps.md:34-38` already records this gap with a proposed system change; do **not** edit audit-gaps.md.
6. Commit message for the Home.tsx commit notes: "GAP at L35 deferred per plan; see audit-gaps.md entry for proposed body-mono utility tier."

**Open question for orchestrator (LOW severity):** Should a follow-up ticket be filed now to track the new body-mono utility? Plan default: do not file (audit-gaps.md already records the proposal; a ticket can be opened later). The implementer should not autonomously open a new ticket — flag as `needs_human` if tempted.

---

## `.text-control` migration handling (`Hero.tsx:194` + `Hero.tsx:199`)

**Verified: `.text-control` exists at `src/index.css:229-234` and `DESIGN.md:264-266`. Migration proceeds directly — no deferral.**

The audit NEAR row at `Hero.tsx:194` says: migrate `text-label` → `text-control` on the search input. The mirror span at `Hero.tsx:199` carries the same `.text-label` for measurement parity and migrates in lockstep.

- **Input (L194):** Replace `text-label` with `text-control` in the className. Color tokens (`text-foreground/60`, `placeholder:text-foreground/60`, `focus:text-foreground/80`) stay as-is. The rest of the className is preserved.
- **Mirror (L199):** Replace `text-label` with `text-control` so `offsetWidth` matches the input's rendered width. The mirror is visibility:hidden, so no color concern.

After this migration:
- Typed text renders in JBM **mixed-case** (was forced uppercase by `.text-label`).
- Input height/size: `text-base` is 16px, which hits iOS's no-zoom threshold. The `h-[30px]` override on the input is a fixed height; verify at 375px that the 16px text still fits inside the 30px-tall input (it should — 16px font + line-height baseline is well under 30px, plus iOS's zoom heuristic uses computed font-size, not rendered height).
- Placeholder text follows the same case/size as user input — `.text-control` defines normal-case + text-base on the input itself; `placeholder:text-foreground/60` only sets color, so the placeholder inherits the input's typography.

The audit row Rationale explicitly calls this out as the FRAC-51 UX trap fix; the migration is the intended correction, not a drift acceptance.

---

## Commit strategy

Suggested commit boundaries — logical, reviewable units, mobile-first verification gates between them. The implementer absorbs the pre-existing dirty `.lattice` files in commit 1 (matches FRAC-42's "lattice state catchup" pattern).

1. **Commit 1: lattice state catchup** — Subject: `FRAC-22/23: lattice state catchup`.
   - Stage explicitly by filename:
     - `.lattice/events/task_01KTJQF0482H67984A2QTMMESE.jsonl`
     - `.lattice/tasks/task_01KTJQF0482H67984A2QTMMESE.json`
     - `.lattice/events/task_01KTJQF06P70NPWYS3B05YT17G.jsonl`
     - `.lattice/tasks/task_01KTJQF06P70NPWYS3B05YT17G.json`
     - `.lattice/plans/task_01KTJQF06P70NPWYS3B05YT17G.md`
   - Do NOT stage `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, or FRAC-40's `task_01KTMC9W2DMVSY3ZYP2816ECRP.*` files.
   - Body: "FRAC-22 transitions + FRAC-23 planning/planned state catchup."

2. **Commit 2: `refactor(home): migrate Home.tsx surface to paired foreground (FRAC-42)`**
   - File: `src/pages/Home.tsx` only.
   - Single edit: add `text-foreground` to the `<section>` at line 25.
   - GAP at L35 deferred — commit message body cites audit-gaps.md:34-38.
   - Verify: typecheck, test, mobile 375px browser check.

3. **Commit 3: `refactor(hero): migrate Hero surfaces to paired foregrounds + skip-nav .text-eyebrow`**
   - File: `src/components/sections/Hero.tsx` only.
   - Edits:
     - L120: add `text-foreground` to hero `<section>`.
     - L133: add `text-foreground` AND replace `font-mono text-xs uppercase tracking-wider` with `text-eyebrow` on the skip-nav `<ul>`.
     - L240: add `text-foreground` to listbox container.
   - Verify: typecheck, test, mobile 375px browser check — especially the skip-nav popping on focus (tab into hero, verify the list renders at the new `.text-eyebrow` rendering — JBM uppercase weight 500 tracking 0.1em text-sm).

4. **Commit 4: `refactor(hero): migrate search input + mirror to .text-control + result subtitle to .text-meta`**
   - File: `src/components/sections/Hero.tsx` only.
   - Edits:
     - L194: `text-label` → `text-control` on the `<input>`.
     - L199: `text-label` → `text-control` on the mirror `<span>`.
     - L278: add `.text-meta` side-by-side with `text-xs` on the result subtitle `<div>`.
   - Verify: typecheck, test, mobile 375px browser check — typed text renders mixed-case JBM, no iOS zoom on focus, caret overlay sits flush at end-of-text, result subtitle renders as uppercase JBM tracked metadata at text-xs density.

**Why four commits and not one mega-commit:** matches FRAC-21 / FRAC-42 commit-discipline pattern. Splitting Hero's edits into commit 3 (pairing + skip-nav) and commit 4 (input + result subtitle) makes the input migration reviewable in isolation — it's the only commit with a behaviorally observable rendering change (typed text case + iOS zoom).

**Acceptable alternative:** combine commits 3 + 4 into one Hero commit if the implementer judges the rows are light enough. Not acceptable: one giant commit covering everything.

---

## Test plan

### At every commit gate

```
pnpm typecheck   # MUST pass — clean exit
pnpm test        # MUST show baseline failures only (4 documented; see below)
```

### Documented baseline test failures (NOT regressions)

Per FRAC-20 / FRAC-21 / FRAC-42 orchestrator handoff, these 4 pre-existing failures live on this branch and are NOT introduced by FRAC-23:

1. Footer FRAC-88 italic test
2. Footer Jacquard test
3. Navigation mobile labels test
4. Neighborhood min-h-screen test

Any test failure OUTSIDE this list is a regression. Halt and `lattice comment` with the failure stack trace before continuing.

### Mobile 375px browser verification (mandatory per PRD + CLAUDE.md)

After commits 2, 3, and 4 (every visible-rendering commit), open the dev server at 375px viewport width and verify:

- [ ] `/` page bg is cream (`#f8f6f0`) — unchanged.
- [ ] Hero section renders cream-on-cream-page (R3F canvas + skyline image overlay). Skip-nav is hidden until Tab focuses it.
- [ ] **Tab into hero**: skip-nav `<ul>` pops out in top-left, renders at `.text-eyebrow` (JBM uppercase weight 500 tracking 0.1em text-sm) — **slightly larger** than before (was text-xs, now text-sm) and slightly **less wide tracking** (was `tracking-wider` ≈ 0.05em, now 0.1em). Border + bg unchanged.
- [ ] **Tab to search input**: focus ring visible (charcoal border at /40), typed text renders **mixed-case JBM at text-base** (was uppercase + text-sm). The decorative caret overlay sits flush at end-of-text — verify on `"a"`, `"abc"`, `"abcdef"` to confirm the mirror span measurement still matches.
- [ ] **iOS zoom check**: open at 375px in mobile emulation or actual iOS device, tap into the input — page should **not** zoom (16px = iOS no-zoom threshold).
- [ ] Type a query that matches results (e.g., `"lab"`): dropdown renders at `bg-background/95` with `text-foreground` paired, `<li>` options render with their per-state colors, result title at `.text-label`, **result subtitle at `.text-meta + text-xs`** (uppercase JBM tracked, density-overridden to text-xs).
- [ ] Type a query that matches no results (e.g., `"xzzzz"`): "No results" renders at `.text-meta` (unchanged).
- [ ] Scroll past hero to the Golden Age Protocol section — **prose at L35 renders identically pre/post migration** (JBM uppercase weight 100 responsive text-sm → text-base). Inline anchors render identically. `<em>scenius</em>` is italic (UA default). GAP is deferred; visual rendering unchanged.
- [ ] Selection chrome: select text on the page, highlight is charcoal-on-cream.
- [ ] No raw `text-white`, `text-black`, `text-gray-*` anywhere in either file (grep verify).

### After the final commit

```
pnpm typecheck && pnpm test
```

Confirm baseline-only failures remain, then proceed to the review handoff.

---

## Acceptance criteria

- [ ] Every audit row in `.lattice/notes/audits/home-audit.md` has a corresponding edit (or is explicitly marked as already-canonical EXACT no-op, or is the GAP at L35 which is explicitly deferred).
- [ ] `src/index.css` is **untouched**. No new tokens, no new utilities.
- [ ] `DESIGN.md` is **untouched**.
- [ ] `.lattice/notes/audit-prompt.md` is **untouched**.
- [ ] `.lattice/notes/audits/home-audit.md` is **untouched** (frozen as spec).
- [ ] `.lattice/notes/audit-gaps.md` is **untouched** (Home gap entry already filed).
- [ ] `Home.tsx` line 25 `<section>` has `text-foreground` added next to `bg-background`. No other JSX change in `Home.tsx`.
- [ ] `Home.tsx` line 35 GAP cluster is **left untouched** — the className is verbatim from the audit spec.
- [ ] `Hero.tsx` line 120 `<section>` has `text-foreground` added next to `bg-background`.
- [ ] `Hero.tsx` line 133 `<ul>` has both `text-foreground` added AND `font-mono text-xs uppercase tracking-wider` replaced with `text-eyebrow` in one combined className.
- [ ] `Hero.tsx` line 240 listbox `<div>` has `text-foreground` added next to `bg-background/95`.
- [ ] `Hero.tsx` line 194 `<input>` has `text-label` replaced with `text-control`.
- [ ] `Hero.tsx` line 199 mirror `<span>` has `text-label` replaced with `text-control`.
- [ ] `Hero.tsx` line 278 result subtitle has `text-meta` added side-by-side with `text-xs`.
- [ ] No `text-house-*` or `bg-house-*` utility appears in either Home file (Home is not a house).
- [ ] No raw `text-white` / `text-black` / `text-gray-*` anywhere in either file.
- [ ] Commented `HouseBannerGrid` import at `Home.tsx:3-5` is preserved verbatim.
- [ ] No files modified outside the scope list: `src/pages/Home.tsx`, `src/components/sections/Hero.tsx`, plus the lattice state files staged in commit 1.
- [ ] No work in `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, or FRAC-40's task files.
- [ ] `pnpm typecheck` passes clean on the final commit.
- [ ] `pnpm test` shows the 4 documented baseline failures and nothing else.
- [ ] Mobile 375px browser verification documented in the implementer's review-handoff `lattice comment` — per-bullet check including the iOS no-zoom verification.
- [ ] Commit history is the 3-4 logical commits suggested above (or a reasoned-out alternative); not one mega-commit, not amended-into-oblivion.

---

## Open questions

1. **GAP cluster follow-up ticket — file now or later?** Plan default: do not file. The audit-gaps.md entry already records the proposed `body-mono` utility tier addition. Future ticket can be opened by the orchestrator after FRAC-23 lands. Implementer should NOT autonomously file a new ticket — flag as `needs_human` if tempted.
2. **Hero.tsx:278 result subtitle — accept the density override or size up?** Plan default: keep the density override (`text-meta text-xs` side-by-side, mirroring the L289 group label pattern). The audit row's forward observation flags this as a candidate for a future container-scoped chrome utility (e.g., `.text-meta-compact`) — same rationale, leave for a future ticket.
3. **Commit 3 + 4 split — combine or keep separate?** Plan default: separate. The input typography migration (commit 4) is the only commit with behaviorally observable rendering change (typed text case + iOS zoom) and benefits from isolation. Implementer judgment if the rows feel light enough to combine.

---

## Implementation order

1. Read this plan; re-read `.lattice/notes/audits/home-audit.md` end-to-end; re-read `.lattice/plans/FRAC-22.md` per CLAUDE.md mandatory PRD check.
2. Verify `git status` shows the lattice state files dirty (matches "Pre-existing repo state" at top).
3. Commit 1 (lattice state catchup) — stage files explicitly, commit.
4. Edit `src/pages/Home.tsx` (single edit at L25) → commit 2. Run typecheck + test + 375px browser check.
5. Edit `src/components/sections/Hero.tsx` (L120 + L133 + L240) → commit 3. Run typecheck + test + 375px browser check (focus skip-nav).
6. Edit `src/components/sections/Hero.tsx` (L194 + L199 + L278) → commit 4. Run typecheck + test + 375px browser check (focus input, type, verify iOS no-zoom, verify caret tracking, verify result subtitle rendering).
7. Final full test run: `pnpm typecheck && pnpm test`.
8. `lattice comment` the task with the verification summary (per-bullet 375px check, baseline-only test failures confirmed).
9. `lattice status task_01KTJQF06P70NPWYS3B05YT17G review --actor agent:claude-opus-4-7-impl`.
