# Layout & Spacing System Proposal — fractal-website

**Status:** Proposal (research + definition only). No code or `DESIGN.md` was modified. Adopting this requires operator approval, then a `DESIGN.md` § Layout update + `src/index.css` mirror, per AGENTS.md conformance rules.

**Grounded in:** Apple Human Interface Guidelines — Layout / Adaptivity; Material Design 3 — Grids & spacing / Window size classes; and the project's existing tokens (`DESIGN.md` § Layout, `spacing:` YAML, `src/index.css @theme`).

**Baseline facts inherited from the project:** mobile-first, 375px baseline; 1 Tailwind unit = `0.25rem` = 4px; no dark mode; Tailwind 4 default breakpoints (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`); editorial cream/charcoal, mostly single-column.

---

## 1. Executive summary

- **One gutter rule replaces three.** A single `.page-gutter` utility — `padding-inline: max(clamp(1.5rem, 4.5vw, 4rem), env(safe-area-inset-*))` — retires `px-6`, `px-[4.5%]`, and `md:px-[22%]`. It floors at the comfortable 24px phones already use, scales on the site's existing 4.5% editorial intent (now as `4.5vw`), and caps at 64px so ultra-wide viewports don't waste space.
- **Two structural breakpoints, named.** Standardize on Tailwind `md` (768) and `lg` (1024). `lg` is the single "goes desktop" break (navbar 3-col grid, multi-column sections); `md` is for gutter/type refinement only. This ends the hero-`lg` vs inner-page-`md` split.
- **Gutter ≠ measure.** The deep `md:px-[22%]` was a readable-measure hack done with padding. Separate the two concerns: `.page-gutter` prevents edge-touching; a `max-w-*` container caps line length. Single-column editorial pages become `page-gutter mx-auto max-w-2xl` (672px measure), not a percentage inset.
- **Formalize the container ladder & vertical rhythm** already implicit in the code into named tiers, tied to existing spacing tokens (no new scale invented).
- **Safe areas become first-class.** The fixed header and full-bleed hero honor `env(safe-area-inset-*)` and switch `min-h-screen` → `min-h-[100svh]` for correct mobile-viewport behavior around notch / Dynamic Island / home indicator.

---

## 2. What Apple HIG says

Apple's Layout / Adaptivity guidance ([HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Adaptivity and layout](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)):

| Principle | Value / rule | Relevance here |
|---|---|---|
| **Standard content margins** | ~**16pt** edge margin on iPhone (portrait); ~**20pt** on larger iPhones; larger on iPad. Delivered via the system *layout margins guide*. | Our phone floor of **24px** already meets/exceeds Apple's 16–20pt comfort minimum — keep it. |
| **Directional layout margins** | Default subview spacing **8pt**; spacing increments of **8 / 16 / 24pt**. | Matches our 4px-base scale (`gap-2/4/6`). Vertical rhythm should stay on 8-multiples. |
| **Readable content guide** | Constrains text to a comfortable line length — **narrower than the layout margins** on wide screens (e.g. iPad landscape centers text in a column). Width is dynamic (font-size driven), not a fixed number. | Justifies capping editorial prose with a `max-w-*` measure rather than letting it fill wide viewports — exactly what `22%` was groping toward. |
| **Safe area** | Content avoids nav/tab/toolbars **and device features** — notch, **Dynamic Island**, camera housing, home indicator. | Fixed header + full-bleed hero must use `env(safe-area-inset-*)`. |
| **Size classes** | Two axes, **compact** vs **regular**, per dimension. iPhone portrait = *compact width, regular height*; iPad and large-iPhone landscape = *regular width*. | Maps cleanly to our phone (compact) → tablet/desktop (regular) intent; reinforces a two-tier structural break. |
| **Touch targets** | Minimum **44×44pt**. | Nav rows already use `min-h-[56px]` / `min-h-[36px]` pills — keep ≥44 for primary taps. |

**Apple's stance:** margins are *modest and fairly fixed* (16–20pt); readability on wide screens comes from a **max content width**, not from ballooning side margins.

---

## 3. What Material 3 says

M3 responsive grid ([Grids & spacing](https://m3.material.io/foundations/layout/grids-spacing/grids), [Window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes), [Breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview)). The grid = **columns + gutters + margins**; a **body** region caps content width and lets margins absorb extra space on large screens.

| Window size class | Range (dp) | Columns | Margin | Gutter | Typical device |
|---|---|---|---|---|---|
| **Compact** | 0–599 | **4** | **16** | 16 | phone portrait |
| **Medium** | 600–839 | **12** | **24** (→ up to 32) | 24 | phone landscape, small tablet, foldable |
| **Expanded** | 840–1199 | **12** | 24 → body-capped | 24 | tablet, small laptop |
| **Large** | 1200–1599 | **12** | 32 → up to ~200 | 24 | desktop |
| **Extra-large** | 1600+ | **12** | up to ~200 (body capped) | 24 | large desktop / TV |

Key documented numbers ([M2 responsive grid](https://m2.material.io/design/layout/responsive-layout-grid.html) corroborates the 4-col phone / 16dp margin baseline): phone **4 columns, 16dp margins**; the **gutter widens with the screen** (16→24dp); at ≥600dp margins step **16→32dp**; on the largest classes margins grow (toward ~200dp) while a **fixed-width body** keeps content readable. Spacing scale sits on a **4dp base** (increments 4/8/16/24…).

**M3's stance:** columns and gutters *grow* with the window (opposite of Apple's fixed-margin view), but past Expanded it agrees with Apple — cap the **body** width and dump the slack into margins.

**Where they conflict → recommendation:** Apple wants near-fixed margins; M3 wants growing margins. For an editorial, mostly single-column cream site, **adopt Apple's restraint for the gutter (bounded, not sprawling) + M3's body-cap for measure.** A `clamp()` gutter with a hard 64px ceiling is the synthesis: it scales modestly (M3 flavor) but never sprawls (Apple flavor), and content readability is owned by `max-w-*` (both sources agree).

---

## 4. Current-state audit

Three competing horizontal-gutter strategies coexist, and the structural breakpoint is applied inconsistently.

### Gutter strategies (the core problem)

| Pattern | Computed width | Where | Problem |
|---|---|---|---|
| `px-6` (fixed 24px) | 24px at every width | 9 files — Navbar mobile/inner headers, Home, Campus, PeoplePage, PoliticalClubPage, overlay menu | Doesn't scale; fine on phone, cramped-looking beside 4.5% siblings on desktop |
| `px-[4.5%]` (viewport %) | ~17px @375 · ~35px @768 · ~65px @1440 | 6 files — `OriginStory` (bare, no `px-6` floor), Home, Campus, LibraryPage | **On phone gives ~17px — *less* than the 24px `px-6` siblings on the same screen.** Root of the "inconsistent margins across devices" report. |
| `md:px-[22%]` (centered inset) | mobile `px-6`; @768 →169px/side (content ~430px, cramped); @1440 →317px/side (content ~806px) | 3 files — `CoLivingPage`, `EventsPage`, `LibraryPage` | A readable-measure hack via padding; content width swings wildly and is cramped right at the `md` switch. |

### Breakpoint application

| Concern | Switch used | File(s) | Inconsistency |
|---|---|---|---|
| Home hero / full navbar (3-col grid) | **`lg` (1024)** | `Hero.tsx`, `Navbar.tsx` (`max-lg:hidden`, `lg:hidden`) | Structural desktop layout flips at 1024… |
| Inner-page header + sector body | **`md` (768)** | `Navbar.tsx` inner (`max-md:hidden`), `CampusPage`, `EventsPage`, etc. | …but inner pages flip at 768. Two different "desktop starts here" lines. |
| Flanking banner insets | `inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16` | Home, house pages | A 4th ad-hoc spatial scale, unrelated to the gutters. |

### Container ladder (implicit, works — just unnamed)

`max-w-xs`(11×, buttons) · `max-w-2xl`(3×) · `max-w-3xl`(7×, prose) · `max-w-5xl`(6×) · `max-w-7xl`(8×, wide sections) · `max-w-[1600px]`(archive) · `max-w-md`(overlay menu). Reasonable set; needs semantic names, not replacement.

### Vertical rhythm (already documented in `DESIGN.md`, honored in code)

`py-12 md:py-20` (compact) · `py-20 md:py-32` (standard) · `py-32 md:py-48` (feature) · `py-40 md:py-60` (break). First-section-under-header uses `pt-16 md:pt-24`. These are consistent — keep and name them.

---

## 5. Proposed system for fractal-website

### 5.1 Breakpoints / size classes (canonical set)

Keep Tailwind's defaults — do **not** re-map to M3's 600/840 (the octahedron navbar's 3-column grid physically cannot fit below ~1024, and 768 is Tailwind's natural tool boundary). Adopt **two structural breakpoints** and assign each concern to exactly one:

| Name | Tailwind | Range | M3 analog | What flips here |
|---|---|---|---|---|
| **Compact** | (base) | <768 | Compact | single column; `.page-gutter` floor 24px; mobile nav (hamburger + overlay) |
| **Medium** | `md:` | 768–1023 | Medium | gutter/type **refinement only** — larger type, 2-col media grids, mildly wider gutter. **Not** the navbar/hero structural switch. |
| **Expanded** | `lg:` | 1024–1279 | Expanded | **the** desktop structural break — 3-col navbar grid, full hero search, multi-column layouts |
| **Wide** | `xl:` | ≥1280 | Large | max-width containers cap; gutter at ceiling |

**The one rule to remember:** *structural* layout (navbar grid, hero, column count) flips at **`lg` (1024)**, everywhere. *Refinement* (gutter step, type scale, media grids) steps at **`md` (768)**. This directly resolves the hero-`lg`/inner-page-`md` split — inner-page **headers** move their structural switch from `md` to `lg` to match the home navbar; inner-page **body** refinements stay at `md`.

### 5.2 Horizontal gutter — the single rule

Define one semantic utility. It floors at the phone-comfortable 24px, scales on the existing 4.5% editorial intent (as `4.5vw`), caps at 64px, and folds in safe-area insets for landscape notch:

```css
/* src/index.css */
@utility page-gutter {
  padding-inline: max(clamp(1.5rem, 4.5vw, 4rem), env(safe-area-inset-left), env(safe-area-inset-right));
}
```

Resulting gutter by width (replaces all three strategies):

| Viewport | `.page-gutter` | vs old `px-6` | vs old `px-[4.5%]` |
|---|---|---|---|
| 375 (phone) | **24px** (floor) | = 24 ✓ | was ~17 (too tight) — **fixed** |
| 768 (md) | **~35px** | was 24 | ~35 ✓ |
| 1024 (lg) | ~46px | was 24 | ~46 |
| 1440 | **64px** (ceiling) | was 24 | was ~65 ✓ |
| 2560 | 64px (capped) | — | was ~115 (sprawl) — **fixed** |

If a discrete, class-based form is preferred over `clamp()` (easier to reason about, matches M3's stepped table), the equivalent is:

`px-6 md:px-8 lg:px-12` → 24 / 32 / 48px. **Recommendation: ship the `clamp()` `.page-gutter`** (smoother "consistency across devices," honors the 4.5% heritage) and keep the stepped form as the documented fallback.

### 5.3 Column grid

Most sections are **single-column editorial** — say so explicitly, and don't force a 12-col grid where it isn't used. Adopt M3's column counts only where multi-column already appears (media galleries, doc grids, feature cards):

| Class | Columns (available) | Gutter | Actual use in this site |
|---|---|---|---|
| Compact <768 | 1 (4-col logical) | 16px (`gap-4`) | single column everywhere |
| Medium 768–1023 | 2 | 24px (`gap-6`) | `sm:grid-cols-2` media/card grids (Campus, gallery, docs) |
| Expanded ≥1024 | 3 (12-col logical) | 24–32px (`gap-6`/`gap-8`) | `lg:grid-cols-3` cards; `xl:grid-cols-4` doc grid; navbar `grid-cols-[1fr_auto_1fr]` |

Rule: **default to one column; opt into `sm:grid-cols-2` / `lg:grid-cols-3` per section.** Gutters use the spacing tokens (`gap-4/6/8`), not new values.

### 5.4 Containers / readable measure

Name the existing ladder; pick the narrowest that fits (already the `DESIGN.md` instruction):

| Token name | Tailwind | px | Role |
|---|---|---|---|
| `measure-prose` | `max-w-2xl` | 672 | **single-column editorial body** — replaces `md:px-[22%]` |
| `measure-wide-prose` | `max-w-3xl` | 768 | longer-form prose blocks (Campus copy) |
| `container-section` | `max-w-5xl` | 1024 | standard section content |
| `container-wide` | `max-w-7xl` | 1280 | full-width sections, card grids |
| `container-archive` | `max-w-[1600px]` | 1600 | publications archive (widest) |
| `container-menu` | `max-w-md` | 448 | overlay nav list |
| `full-bleed` | (none) | — | hero, banners, background — no cap |

Pattern for single-column pages: **`page-gutter mx-auto max-w-2xl`** (gutter prevents edge-touch, container caps measure). This is the clean replacement for `px-6 md:px-[22%]`.

### 5.5 Vertical rhythm

Keep the four documented tiers; name them as tokens (values unchanged, all 8-multiples per Apple):

| Token | Value | Use |
|---|---|---|
| `section-y-compact` | `py-12 md:py-20` | dense lists, small surfaces |
| `section-y` | `py-20 md:py-32` | standard sections |
| `section-y-feature` | `py-32 md:py-48` | feature sections |
| `section-y-break` | `py-40 md:py-60` | major narrative breaks (Golden Age) |
| `section-y-first` | `pt-16 md:pt-24` + `scroll-mt-24` | first section under the fixed header (clears header, sets scroll anchor) |

Component padding stays on the token scale; the Mandelbrot-corner min-padding invariants (`p-6`/`p-9`/`p-14`/`p-16` for `xs`/`sm`/`md`/`lg`) are unaffected.

### 5.6 Safe areas / notch

| Surface | Change | Why |
|---|---|---|
| Fixed header (`Navbar` `motion.header`) | add `padding-top: env(safe-area-inset-top)` (or wrap gutter in `.page-gutter` for L/R) | clears notch / Dynamic Island in landscape |
| `.page-gutter` | already `max(…, env(safe-area-inset-left/right))` | landscape notch never overlaps content |
| Full-bleed hero (`min-h-screen`) | → `min-h-[100svh]`; add `pb-[env(safe-area-inset-bottom)]` to the bottom footer row | correct mobile viewport height; home-indicator clearance |
| Overlay menu (`fixed inset-0`) | `pt-[max(6rem,env(safe-area-inset-top))]` | list clears the notch when open |

---

## 6. Migration map

| Current pattern | Files affected | Replace with |
|---|---|---|
| `px-6` (page edge) | Navbar (mobile/inner headers, overlay), `Home.tsx`, `Campus.tsx`, `PeoplePage`, `PoliticalClubPage` | `page-gutter` |
| `px-[4.5%]` | `OriginStory` (add floor!), `Home.tsx`, `Campus.tsx`, `LibraryPage` | `page-gutter` |
| `px-6 md:px-[4.5%]` (combined) | `Home.tsx`, `Campus.tsx`, `CoLivingPage` inner sections | `page-gutter` |
| `px-6 md:px-[22%]` (centered column) | `CoLivingPage`, `EventsPage`, `LibraryPage` | `page-gutter mx-auto max-w-2xl` (measure-prose) |
| Hero structural switch at **`lg`** vs inner-page header at **`md`** | `Navbar.tsx` (`max-md:hidden` inner header), inner page headers | move inner-page **header** structural switch to **`lg`**; keep body refinements at `md` |
| `inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16` (banner flanks) | Home, `CampusPage`, `EventsPage`, `CoLivingPage`, `LibraryPage` | align to gutter rhythm: `inset-x-6 md:inset-x-8 lg:inset-x-12` (or a `.banner-flank-inset` utility) |
| `min-h-screen` (hero + pages) | `Hero.tsx`, sector pages | `min-h-[100svh]` |
| Ad-hoc `max-w-*` | site-wide | keep values; adopt the §5.4 semantic names in `DESIGN.md` |

Migration is mechanical and low-risk: it's a find-and-replace of gutter classes plus two breakpoint moves. Recommend one FRAC task per cluster (gutter utility + rollout; breakpoint reconciliation; safe-area) rather than a single mega-diff — and a visual pass at 375 / 768 / 1024 / 1440.

---

## 7. Implementation notes (Tailwind 4)

1. **Custom utility** — Tailwind 4 uses `@utility` (not `@layer`) for named utilities. Add to `src/index.css` after `@theme`:
   ```css
   @utility page-gutter {
     padding-inline: max(clamp(1.5rem, 4.5vw, 4rem), env(safe-area-inset-left), env(safe-area-inset-right));
   }
   ```
2. **Breakpoints** — no `@theme` change needed; Tailwind defaults (`md 768 / lg 1024 / xl 1280`) are already the canonical set. The reconciliation is a *convention* (which break each concern uses), enforceable via review/`/design-audit`, not new tokens.
3. **Spacing** — no new scale; every value above is an existing Tailwind step already inventoried in the `spacing:` YAML. `clamp()`'s `1.5rem`/`4rem` = `spacing.6`/`spacing.16`.
4. **`svh` unit** — `min-h-[100svh]` needs no config; it's a native CSS unit Tailwind passes through.
5. **`DESIGN.md` mirror (requires operator approval — do not silently edit):** expand § Layout to (a) name the two structural breakpoints and their concern-assignment, (b) document `.page-gutter` as *the* horizontal-gutter rule and deprecate the three raw patterns, (c) add the §5.4 container-name table, (d) add the safe-area guidance. No YAML token *values* change; if a `--gutter` custom property is later desired it would be added to `@theme` and mirrored in the `spacing:`/a new `layout:` block. Per AGENTS.md, surface as: *"This proposes updating DESIGN.md § Layout to define a single `.page-gutter` rule and named breakpoints — approve?"*
6. **Conformance** — this introduces no new colors, so the `pnpm conformance` color gate is unaffected. The gutter/breakpoint consistency would be governed by the periodic `/design-audit` spacing pass.

---

### Sources

- Apple HIG — [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Adaptivity and layout](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- Material 3 — [Grids & spacing](https://m3.material.io/foundations/layout/grids-spacing/grids), [Window size classes](https://m3.material.io/foundations/layout/applying-layout/window-size-classes), [Breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview)
- Material 2 (corroborating grid numbers) — [Responsive layout grid](https://m2.material.io/design/layout/responsive-layout-grid.html)
- Project — `DESIGN.md` § Layout, `src/index.css @theme`, `src/components/layout/Navbar.tsx`, `src/components/sections/Hero.tsx`, `src/pages/*`
