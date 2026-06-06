# FRAC-21 — Team Visual-Layer Audit Synthesis

**Reviewed:** 2026-06-05 15:51 ET
**Branch:** `frac-17-18-color-tweaks`
**Agents:** Claude (Standard + Critical) ✅ · Codex (Standard + Critical) ✅ · Gemini (Standard + Critical) ❌
**Coverage:** 4 of 6 reviews completed. Both Gemini agents exhausted `gemini-3-pro-preview` capacity after 10 retries (rate-limited at provider level). Synthesis below is based on the 4 successful reviews; consensus signal is still strong because Claude and Codex each ran both Standard and Critical postures.

---

## Executive Summary

The "Asimov Collective" aesthetic is **coherent at the atomic level** (warm cream + charcoal + Fraunces uppercase-italic + JetBrains Mono + subtle noise) but **fragmented at the system level**. Four agents independently surfaced the same five structural problems, and the highest-confidence ones are not stylistic — they're consistency, accessibility, and dead-code failures that any senior design engineer would block on.

**The visual layer cannot be safely codified into DESIGN.md until at least the House Palette source-of-truth problem and the dead-code traps (`FractalObject.tsx`, undefined Button CSS variables) are resolved or explicitly waved.** Authoring DESIGN.md on top of the current state will canonicalize four conflicting palettes into a single document.

---

## High-Confidence Issues (3+ agents converged)

### 🔴 H1. House accent color has **no single source of truth** — 4–5 conflicting palettes per house
*Flagged as #1 critical/warning by Claude-Std, Claude-Crit, Codex-Std, Codex-Crit.*

The same house renders in different hues depending on the surface. The data-model `houses.ts color` field is the oldest "Fractal Bright" palette but is still actively read by `AvatarBadge` and as a `HouseBanner` fallback. The newer "Fractal Elegant" palette lives independently in `Navbar.sectionLinks`, `HouseBanner.ELEGANT_PAIRS`, `OctahedronHero.NAV_NODES` / `FACE_SECTION_COLORS`, and per-page hardcoded backgrounds.

| House | `houses.ts` (model) | Hero/Banner (elegant) | Page bg |
|---|---|---|---|
| neighborhood | `#8B7355` | `#889460` | `#889460` |
| events | `#E07A5F` | `#D4857A` | `#D4857A` |
| **campus** | **`#457B9D`** (blue) | **`#2B5A48`** (forest green) | `#2E6B4A` |
| **school** | **`#1D3557`** (navy) | **`#C41E20`** (red) | `#5C1010`/`#B52828` |
| lab | `#6B4C9A` | `#E870A0` | `#E870A0` |
| forum | `#CC2936` | `#C89898`/`#6E1830` | `#6E1830` |

Campus (blue→green) and School (navy→red) are **hue-family conflicts, not shade drift**. A user clicking the Events avatar badge sees one orange; their banner shows a different one; the hero nav-node shows a third.

**Cites:** `src/data/houses.ts:195-281` · `src/components/layout/Navbar.tsx:7-16` · `src/components/house/HouseBanner.tsx:20-33` · `src/components/three/OctahedronHero.tsx:110-115,374-383` · `src/pages/{Campus,Events,Lab,Liberal Arts,Political Club,Neighborhood}Page.tsx`

---

### 🔴 H2. Custom CTAs bypass the `Button` component → **focus-visible coverage is missing on real product CTAs**
*Flagged critical by Claude-Std #3, Claude-Crit #2, Codex-Std #3, Codex-Crit #2.*

The shadcn `Button` (`src/components/ui/button.tsx`) is imported only by other vendored `ui/**` files. **No product page uses it.** Real CTAs are raw `<a>` with hand-rolled classes (`EventsPage.tsx:55`, `NeighborhoodPage.tsx:59`, `PoliticalClubPage.tsx:26`, `LiberalArts.tsx:41`, `PeoplePage.tsx:29`). Across all of `pages/`, `sections/`, `layout/`, `house/`, `focus-visible:` appears **twice**. Navbar menu buttons (`Navbar.tsx:282-339`) also have no `aria-label` or visible focus styling.

**Additionally — Critical reviewers found:** `Button` itself references undefined Replit-injected tokens — `hover-elevate`, `active-elevate-2`, `[border-color:var(--button-outline)]`, `border-primary-border`, `border-destructive-border`, `border-secondary-border` (`button.tsx:10,16,18,23,26`). None are declared in `src/index.css`. Every Button's hover/active elevation is a **silent no-op** and the outline variant has no border. So both the unused primitive *and* its potential replacement are broken.

**Cites:** `src/components/ui/button.tsx:8-43` · `src/pages/EventsPage.tsx:55,70` · `src/pages/PeoplePage.tsx:29` · `src/components/layout/Navbar.tsx:282-287`

---

### 🟡 H3. `prefers-reduced-motion` is honored in **exactly one place** — the rest of the motion system ignores it
*Flagged by Claude-Std #4, Claude-Crit #4, Codex-Std §6, Codex-Crit #3.*

Only the octahedron nav-node emissive pulse (`OctahedronHero.tsx:638-677`) checks the user's reduced-motion preference. Everything else animates regardless:

- Octahedron auto-rotation (`:796-800`)
- Scrolling "THE PROTOCOL" edge-text textures (`:249-253`)
- Center scale-breathing (`:561-567`) and node scale-pulse (`:656-663`)
- **Framer-Motion `FadeIn`** (`ui/FadeIn.tsx:28-44`) — the highest-impact offender; wraps content across most pages
- Navbar scroll/overlay motion (`Navbar.tsx:128,345`)
- `SierpinskiCarpet` RAF loops (`:230-264`)
- `@keyframes blink` (`index.css:169-176`)

A reduced-motion user gets the entirety of the experience except one glow. This is a real accessibility failure, not a nitpick.

---

### 🟡 H4. `FractalObject.tsx` is dead code carrying a stale conflicting palette + name collision
*Flagged by Claude-Std #2, Claude-Crit #3, Codex-Std #2, Codex-Crit #5.*

- The live `FractalCityScene.tsx:9` imports `FractalObject` from **`./OctahedronHero`**, not the standalone file
- The standalone `src/components/three/FractalObject.tsx` (327 lines) is imported nowhere live
- It carries the **old "Fractal Bright" palette** (`#E07A5F`, `#8B7355`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A`) — i.e. it agrees with `houses.ts` and disagrees with the live hero
- It still includes a **visible Political Club nav node**, contradicting FRAC-161
- It still uses the **old `onClick` handlers** that caused the iOS-scroll regression that OctahedronHero was rewritten to fix
- **Name collision:** two files export a component literally named `FractalObject`

Re-pointing the import would silently regress three things. Trap.

---

### 🟡 H5. Cream / off-white surface has **3+ near-duplicate values** and the canonical token is never actually shown in the hero
*Flagged by all 4 agents.*

| Source | Value |
|---|---|
| `src/index.css:46` comment claim | `/* #f7f6f2 */` (stale) |
| `--background` HSL math (`40 25% 96%`) | ≈ `#f8f6f1` |
| Hero, Home Protocol section, search input | hardcoded `bg-[#faf8f5]` (a different, pinker cream) |
| Tooltips, `.hero-text-shadow` | `rgba(250,248,245,0.92)` = `#faf8f5` |
| FractalCityScene ambient light | `#f5f0ea` |

Three near-identical creams for what's conceptually one surface — and **the `<body>` token cream is never actually shown in the hero**, because the hero `<section>` overlays a different value (`#faf8f5`). The user-confirmed canonical is `#f8f6f0`.

---

## Standard Review Consensus (additional)

### S1. Global uppercase/italic Fraunces rule encodes the rare case — ~60 inline escapes across 11 files
The de-facto pattern `style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}` is copy-pasted ~12 times verbatim across Home, Events, Lab, Neighborhood, Political Club, People, Story, Campus, LiberalArts. When the override is more common than the default, the default is miscalibrated. (`src/index.css:118-128`)

### S2. `--font-sans` and `--font-mono` resolve to the same family — `'JetBrains Mono', monospace`
Vestigial shadcn scaffolding. `font-sans` is used ~1–3× in product code; everything else uses `font-mono` or inherits `body`. Two token names pointing at one font is a latent footgun. (`src/index.css:6,8`)

### S3. `.dark` block defined but never wired
~28 dark tokens at `src/index.css:75-103`. No `ThemeProvider`, no `dark` class toggle, no `next-themes` provider. The only `dark:` utilities live in vendored shadcn `ui/*`. Entire palette is unreachable config.

### S4. Two horizontal-padding conventions with no documented rule
`px-[4.5%]` (~31×) and `px-6` (~30×) and `px-8` (~8–11×) and `px-4` (~8×) used interchangeably. The split is *mostly* principled (page gutter vs component inset) but undocumented.

### S5. Container `max-w-*` is scattered — 11 distinct values
`max-w-3xl` (21×), `max-w-7xl` (19×), `max-w-xs` (17×), plus `xl`/`sm`/`2xl`/`5xl`/`4xl`/`lg`/`6xl`/`md`/arbitrary. No scale.

### S6. Vertical rhythm has no codified scale
`py-40 / py-60 / py-48 / py-32 / py-24 / py-20 / py-16 / py-14 / py-12 / py-10` mixed ad-hoc. Coherent emotionally; not a system.

---

## Critical Review Findings (adversarial perspective surfaced these)

### C1. Hero search uses non-semantic `li role="option"` without combobox/listbox relationship
Pointer users get an interactive list; keyboard/screen-reader users don't get the same affordances. (`src/components/sections/Hero.tsx:103,135-149`)

### C2. Octahedron tooltips are clickable `<div>`s; meshes are pointer-only hit targets
The hero navigation is **not keyboard accessible**. (`OctahedronHero.tsx:715-730,737-753`)

### C3. Hidden routes are inconsistently represented across data and visuals
`HIDDEN_HOUSE_IDS` hides forum from banner UI, Navbar hides Political Club and People, but `sectionLinks` still includes them and OctahedronHero face-map still includes forum/people faces. (`src/data/houses.ts:296-303` · `src/components/layout/Navbar.tsx:18-23,7-16` · `OctahedronHero.tsx:388-397`)

### C4. Navbar fixed-pixel Jacquard sizes break 375px baseline
Desktop wordmark hardcodes `fontSize: "82px"`, `"50px"`, `"42px"` with no responsive step. The author *does* know the responsive pattern — mobile variants use `clamp(...)` — but applied it inconsistently. Every fixed-px Jacquard string is a baseline-overflow candidate. (`Navbar.tsx:163,200,255,323-329`)

### C5. A11y contrast risk on cream surfaces
`--muted-foreground: 0 0% 40%` (≈ `#666`) on `#f8f6f1` cream lands at ~4.0:1 — **below WCAG AA 4.5:1** for body text. The noise SVG erodes it further. Hero search placeholder is `text-foreground/40` ≈ 2:1, fails AA. The white-text-vs-charcoal decision on saturated house-page bgs is made ad-hoc per page via local `isDark()` helpers, not from a guaranteed contrast computation. (`src/index.css:62,114` · `Hero.tsx:114` · `HouseBanner.tsx:8-13`)

### C6. Hardcoded design constants that should be tokens
- Lab purple `#6B4C9A` appears **11×** as raw `border-[#6B4C9A]`/`ring-[#6B4C9A]` across `ArchiveSearch`, `ArchiveToolbar`, `DocumentBadge`, `TagFilter`
- Charcoal `#1a1a1a` literals duplicate `--foreground` `#171717` in tooltips and banner fallback
- One-off dark reds: `text-[#5C1010]` (`LiberalArtsPage.tsx:8`), `text-[#6E1830]` (`PoliticalClubPage.tsx:10`)
- Default badge fallback `#6B7280` (Tailwind cool slate) sits outside the warm system

### C7. `ShaderMaterial.tintMix: 0.55` is a hardcoded magic constant in the octahedron
Bakes the (FRAC-20-disputed) tint strength into a GLSL literal rather than a tunable token. (`OctahedronHero.tsx:513-538`)

### C8. `usePerFaceMaterials` rebuilds materials on every texture state update without disposal
Minor GPU-resource leak across the progressive texture-load sequence. (`OctahedronHero.tsx:498-548`)

### C9. Dead CSS utilities
`.link-underline` (the cubic-bezier underline-grow hover), `.hero-text-shadow`, `@keyframes blink`/`.animate-blink`, `.border-grid` — all defined in `src/index.css`, all zero consumers. (`index.css:146-176`)

### C10. `BadgePlayground` ships as a routable page with off-palette colors
`#0a0a0a`, `#a855f7`, `#6B7280` — purple playground UI. Either route-gate for internal tooling or remove. (`src/pages/BadgePlayground.tsx`)

---

## Contradictions / Disagreements

**None substantive.** Where two agents framed the same issue differently:

- Claude-Std treats `houses.ts.color` as "effectively orphaned for visible houses." Claude-Crit and Codex correctly note it's **actively read by `AvatarBadge.tsx:24` and `BadgePlayground.tsx:14`** and used as a `HouseBanner` fallback. Treat as actively live — not orphaned.

- Mobile-first: Claude-Std says "mostly good." Codex-Crit found additional 375px risks (Events `min-h-[600px]`, Navbar fixed-px Jacquard, HouseBanner `aspect-[1/3]` with `text-[10px]`). Both true — shells are fine; specific module choices break the baseline.

---

## Combined Action Items

### Blockers (must be addressed before authoring DESIGN.md)

- [ ] **H1** — Resolve house palette source of truth. Decide: (a) is `houses.ts.color` the canonical brand color or is it the legacy "Fractal Bright" set? (b) Should AvatarBadge/HouseBanner-fallback render the new "Fractal Elegant" palette, the old one, or distinct? — `src/data/houses.ts:195-281`
- [ ] **H4** — Decide fate of `src/components/three/FractalObject.tsx` (delete, or fix to match live state). Trap-grade as long as it survives.
- [ ] **H2-Critical** — Decide button strategy: (a) ship the shadcn `Button` and define the missing Replit tokens in `src/index.css`, (b) remove `Button` entirely and codify the raw-anchor CTA pattern as the system, or (c) build a new minimal Button that matches the current product reality. Then add `focus-visible:` to whichever survives.
- [ ] **H5** — Confirm canonical cream as `#f8f6f0` (user-confirmed). Plan for normalizing `#faf8f5` and the stale `#f7f6f2` comment in a subsequent cleanup task.

### Important (address before or during DESIGN.md authoring)

- [ ] **H3** — Add `prefers-reduced-motion` guard to `FadeIn` (highest impact), octahedron auto-rotation/scrolling text/scale-pulse, Navbar scroll motion, SierpinskiCarpet RAF, `.animate-blink`
- [ ] **C4** — Convert Navbar fixed-px Jacquard sizes to `clamp(...)` matching the mobile-variant pattern the author already uses
- [ ] **C5** — Either raise `--muted-foreground` lightness for AA conformance on cream, or scope the `/80`-`/40` opacity utilities to large/heading text only
- [ ] **S1** — Replace the inline `style={{ fontWeight:300, textTransform:"uppercase", fontStyle:"normal" }}` triplet (~12 sites) with a single utility (e.g. `.display-roman`)
- [ ] **S3** — Either wire `.dark` (ThemeProvider + class toggle) or delete the block. DESIGN.md should not declare dark tokens that don't exist in the runtime
- [ ] **S2** — Decide: keep `font-sans` ≡ `font-mono` (rename `--font-sans` to a real sans, or delete one of the two)
- [ ] **C3** — Reconcile hidden-route data: `HIDDEN_HOUSE_IDS` vs Navbar `sectionLinks` vs OctahedronHero face-map should agree

### Consider (would tighten the system; not blocking)

- [ ] **S4, S5, S6** — Codify horizontal-padding rule (page vs component), max-width scale (e.g. 3 tiers), vertical-rhythm scale (multiples of an 8/16 base)
- [ ] **C1, C2** — Add proper combobox/listbox semantics to hero search; add keyboard-accessible navigation to octahedron tooltips
- [ ] **C6** — Tokenize Lab purple `#6B4C9A`, charcoal `#1a1a1a`, the one-off dark reds; replace the cool slate fallback `#6B7280` with a warm-system equivalent
- [ ] **C7, C8** — Promote `tintMix` to a tunable; dispose old materials in `usePerFaceMaterials`
- [ ] **C9** — Delete unused CSS utilities (`link-underline`, `hero-text-shadow`, `animate-blink`, `border-grid`) OR wire them into the components that should be using them
- [ ] **C10** — Route-gate or remove `BadgePlayground`

---

## What this means for FRAC-23 (gap analysis) and FRAC-19 (DESIGN.md authoring)

**For FRAC-23 (gap analysis):**
- The "What's missing from current code" section now has concrete evidence: no real spacing scale, no real button system, no motion-token strategy, no dark-mode wiring, no source of truth for house palette
- The "Naming conflicts" section must reconcile: `--font-sans` vs `--font-mono`, four house palettes, multiple cream values, charcoal duplication
- Gap analysis should produce a recommended set of **upstream cleanup tasks** that should happen before or alongside DESIGN.md authoring

**For FRAC-19 (DESIGN.md authoring):**
- DESIGN.md cannot meaningfully ship if the codebase has four conflicting house palettes — the spec would canonicalize whichever one the author picks, leaving the other three as drift
- Recommended sequence: address H1 (house palette SoT), H4 (FractalObject), H5 (cream) as small cleanup tasks first; then DESIGN.md authoring picks up clean state
- DESIGN.md should explicitly note in **Do's and Don'ts** that motion is not modeled by the format and reduced-motion handling lives in CSS/component code per H3 guidance

---

## Open follow-up tasks recommended (to discuss with user)

Based on findings, candidates for new Lattice tasks:

1. **House palette source of truth** — design decision + refactor across `houses.ts`, `Navbar`, `HouseBanner`, `OctahedronHero`, page bgs, `AvatarBadge`
2. **Delete or repair `FractalObject.tsx`** — currently a trap
3. **Button strategy** — pick one and wire it; remove the broken Replit-token dependencies
4. **`prefers-reduced-motion` coverage** — single ticket covering FadeIn + the unguarded R3F loops
5. **Cream normalization** — replace `#faf8f5` literals with the canonical `#f8f6f0`; fix the stale `index.css:46` comment
6. **Navbar responsive Jacquard sizes** — convert fixed-px to `clamp()`
7. **`.dark` decision** — wire or delete
8. **Inline display-roman triplet → utility class**
9. **Hidden-route data reconciliation** (FRAC-161 follow-up)
10. **A11y pass** — hero search semantics, octahedron keyboard nav, muted-text contrast

---

<details>
<summary>Full Claude (Standard) Review</summary>

See `notes/CR-FRAC-21-Claude-Standard-20260605-1547.md` (17,856 bytes).

</details>

<details>
<summary>Full Claude (Critical) Review</summary>

See `notes/CR-FRAC-21-Claude-Critical-20260605-1547.md` (15,601 bytes).

</details>

<details>
<summary>Full Codex (Standard) Review</summary>

See `notes/CR-FRAC-21-Codex-Standard-20260605-1546.md` (13,831 bytes).

</details>

<details>
<summary>Full Codex (Critical) Review</summary>

See `notes/CR-FRAC-21-Codex-Critical-20260605-1546.md` (12,457 bytes).

</details>

<details>
<summary>Gemini reviews (failed)</summary>

Both `gemini-3-pro-preview` runs exhausted provider capacity after 10 retries. Logs at `notes/.tmp/gemini-{standard,critical}.log`. Not a structural issue with the audit — provider-side rate-limit.

</details>
