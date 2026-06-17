# Visual Layer Audit — FRAC-21 — Claude Critical

**Auditor:** Claude (Critical)
**Timestamp:** 20260605-1547
**Files reviewed:** `src/index.css`, `src/data/houses.ts`, `src/components/three/{OctahedronHero,FractalObject,FractalCityScene}.tsx`, `src/components/house/HouseBanner.tsx`, `src/components/ui/{button,FadeIn}.tsx`, `src/components/sections/Hero.tsx`, `src/components/layout/Navbar.tsx`, `src/pages/{ProtocolPage,LiberalArtsPage,PoliticalClubPage}.tsx`, `src/components/lab/**`, plus repo-wide greps for hex literals, focus/motion, padding/rhythm tokens.

> **Scope honored:** I do **not** re-litigate the octahedron *face-tint values* (`#889460`, `#D4857A`, `#2B5A48`, `#C41E20`, `#E870A0`) — FRAC-20 owns that at `needs_human`. Where those values appear below it is strictly to document *structural* problems (single-source-of-truth violations, duplication across files), never to endorse or judge the hues themselves.

---

## 1. Design style overall

The "Asimov Collective" system is real and mostly coherent at the type/surface level, but it is enforced by **global side-effecting CSS rules plus a long tail of inline escapes**, which is fragile.

- The global heading rule and `.font-serif` utility force `uppercase + italic` on *everything* (`src/index.css:118-128`). The body itself is `text-transform: uppercase` (`src/index.css:112`). This is an aggressive global mutation that components must constantly fight.
- That fight is visible: **61 inline `normal-case` / `not-italic` / `textTransform:"none"` / `fontStyle:"normal"` escapes across 11 files** (e.g. `src/components/house/HouseBanner.tsx:150`, `src/components/layout/Navbar.tsx:169`, `src/pages/StoryPage.tsx`, `src/components/sections/LiberalArts.tsx`). When the exceptions outnumber a sane component count, the "default" is mis-chosen — taglines, body copy, and Jacquard wordmarks are all *opt-outs* of the global rule. A senior reviewer would flag the global `body { text-transform: uppercase }` as the root cause.
- Aesthetic coherence is otherwise good (cream + charcoal + Fraunces). The breakage is mechanical, not stylistic.

## 2. Color palette in actual use

This is the weakest area. There is **no single source of truth for a house's accent color** — a house renders in three different hues depending on the surface.

**Four parallel, conflicting house palettes:**

| House | `houses.ts` `color` (data model) | Hero nav node `OUTER_NAV_NODES` | `HouseBanner` `ELEGANT_PAIRS.bg` |
|---|---|---|---|
| neighborhood | `#8B7355` `houses.ts:195` | `#889460` `OctahedronHero.tsx:111` | `#889460` `HouseBanner.tsx:26` |
| events | `#E07A5F` `houses.ts:210` | `#D4857A` `OctahedronHero.tsx:112` | `#D4857A` `HouseBanner.tsx:22` |
| campus | `#457B9D` `houses.ts:227` | `#2B5A48` `OctahedronHero.tsx:113` | `#2B5A48` `HouseBanner.tsx:28` |
| school | `#1D3557` `houses.ts:248` | `#C41E20` `OctahedronHero.tsx:114` | `#C41E20` `HouseBanner.tsx:24` |
| lab | `#6B4C9A` `houses.ts:280` | `#E870A0` `OctahedronHero.tsx:115` | `#E870A0` `HouseBanner.tsx:30` |
| forum | `#CC2936` `houses.ts:264` | (hidden) | `#C89898` `HouseBanner.tsx:32` |

The data-model `color` field is **not stale dead data** — it is actively read by `AvatarBadge.tsx:24` (`house?.color ?? "#6B7280"`) and `BadgePlayground.tsx:14`, and used as the fallback in `HouseBanner.tsx:98-99`. So a person's avatar badge for Events renders `#E07A5F`, the Events banner renders `#D4857A`, and the Events hero node renders `#D4857A`. **Same house, three identities.** The banner and hero have been migrated (FRAC-17) but the data model was left behind. This is a critical consistency defect independent of which hue is "correct."

**Cream/off-white fragmentation** — at least five near-duplicate light values, none agreeing with the token:
- `--background: 40 25% 96%` with a **stale comment `/* #f7f6f2 */`** (`src/index.css:46`); the HSL actually resolves ≈ `#f8f6f1`, and the PRD states `#f8f6f0`. Three different "the background" values in one decision.
- The hero, home, search input, and dropdown all hardcode `bg-[#faf8f5]` (`Hero.tsx:90,114,121`, `Home.tsx:25`) — a *different, pinker* cream than the body token. The `<body>` paints the token cream; the hero `<section>` paints `#faf8f5` on top → a visible seam at the section boundary, and the canonical token is never actually shown in the hero.
- Tooltips use `rgba(250,248,245,0.92)` = `#faf8f5` (`OctahedronHero.tsx:764`, `FractalObject.tsx:233`); ambient light uses `#f5f0ea` (`FractalCityScene.tsx:14`); `.hero-text-shadow` uses `rgba(250,248,245,...)` (`index.css:152`).

**Hardcoded literals that should be tokens:**
- Lab purple `#6B4C9A` appears **11×** as raw `border-[#6B4C9A]` / `ring-[#6B4C9A]` across `ArchiveSearch.tsx:45,60`, `ArchiveToolbar.tsx:64`, `DocumentBadge.tsx:59`, `TagFilter.tsx:52,54`. Should be one token.
- One-off dark reds with no home in the palette: `text-[#5C1010]` (`LiberalArtsPage.tsx:8`), `text-[#6E1830]` (`PoliticalClubPage.tsx:10`).
- Default badge fallback `#6B7280` (`AvatarBadge.tsx:24`, `BadgePlayground.tsx:14`) is a cool Tailwind slate-gray — completely outside the warm system.

**HSL-vs-hex inconsistency:** the shadcn token layer is HSL triplets (`:root`), but every house/3D/banner color is hex, and components mix `hsl(var(--...))` tokens with raw `#...` freely.

**`.dark` block is dead** (`src/index.css:75-103`, ~28 tokens): there is **no `ThemeProvider`, no `.dark` class toggle, no `document.documentElement.classList` manipulation** anywhere in `src/`. Only 8 `dark:` utility usages exist, all in vendored shadcn `ui/*`. The entire dark palette is unreachable config.

## 3. Layout strategy

- **Two competing horizontal-padding conventions with no rule:** `px-[4.5%]` (32×) vs `px-6` (30×) vs `px-8` (11×) vs `px-4` (8×). A percentage gutter and three fixed gutters are used interchangeably; nothing documents when each applies. Pick one container primitive.
- **`max-w` is a free-for-all:** `max-w-3xl` (21×), `max-w-7xl` (19×), `max-w-xs` (17×), plus `xl/sm/2xl/5xl/4xl/lg/6xl/md` and arbitrary `max-w-[800px]`, `max-w-[420px]`. Eleven distinct max-widths means there is no container scale — every section author picked their own.
- **Vertical rhythm has no scale:** `py-40`, `py-60`, `py-48`, `py-32`, `py-24`, `py-20`, `py-16`, `py-14`, `py-12`, `py-10`… these are not multiples of a base step chosen deliberately; they read as hand-tuned per section.
- **Mobile-first (375px):** the section/page shells are responsive (`w-[80%] md:w-[70%] lg:w-[60%] max-w-[800px]` at `ProtocolPage.tsx:11` is fine; `NeighborhoodCampusDiagram.tsx:190` `w-[220px]` and `toast.tsx:17` `w-[420px]` both sit under or near 375 and are safe). No hard horizontal-overflow offenders found in app code — good. The real 375px risk is typographic, see §4.

## 4. Fonts and how they are used

- **`--font-sans` and `--font-mono` are the identical family** — both `'JetBrains Mono', monospace` (`src/index.css:6,8`). This is vestigial: `font-sans` is referenced exactly **once** in app code (`ui/kbd.tsx`), everything else uses `font-mono` or inherits `body { font-sans }`. Two token names, one font → delete one or make `--font-sans` an actual sans. As written, any future "switch the sans" change silently also changes the mono.
- **Fixed-px Jacquard sizes risk 375px overflow.** The desktop Navbar wordmark uses hardcoded `fontSize: "82px"` (`Navbar.tsx:163`), `"50px"` (`:255`), `"48px"` (`:169`). The mobile-menu variants correctly use `clamp(42px, 8vw, 82px)` (`:323`) and `clamp(27px, 5vw, 48px)` (`:329`) — proving the author *knows* the responsive pattern but applied it inconsistently. Any fixed-px Jacquard string that is not behind a `md:`/`hidden` gate is a baseline-overflow candidate; these should all be `clamp()`.
- **Jacquard 24 declares no weight axis** (`index.css:1` imports `family=Jacquard+24` with no `wght`) yet is used at many sizes — fine (it's a single-weight display face), but it is loaded blocking in the `@import` and used only for monograms/wordmarks. The `[style*="Jacquard"]` selector (`index.css:130`) is a brittle attribute-substring hook for un-doing the global uppercase/italic — it only works because every Jacquard usage is an inline `style` string; a className-based Jacquard usage would silently get force-uppercased.
- **Fraunces** imports the full `100..900` + `opsz 9..144` variable axes (`index.css:1`) but the global rule pins it to `font-normal` (`index.css:119`). The 100–900 weight range and optical-size axis are paid for in the font download and never exercised — bundle cost for unused axes.

## 5. Buttons / interactive primitives

- **The shadcn `Button` depends on tokens/utilities that do not exist in this repo.** `button.tsx` uses `hover-elevate active-elevate-2` (`:10`), `border-primary-border` (`:16`), `border-destructive-border` (`:18`), `[border-color:var(--button-outline)]` (`:23`), `border-secondary-border` (`:26`). **None of `hover-elevate`, `active-elevate`, `--button-outline`, `--primary-border`, `--secondary-border`, `--destructive-border` are defined** anywhere in `src/index.css` or the project (grep-confirmed; these are Replit-injected `@replit` artifacts). Consequences: the outline variant's border-color resolves to an undefined var (no border), and **every button's hover/active elevation is a silent no-op**. The primary CTA has no real hover feedback. This is shipped-but-dead interaction design.
- **Dead CSS interactive utilities:** `.link-underline` (`index.css:155-157`, the cubic-bezier underline) is **referenced zero times** in `src/`. `.animate-blink` / `@keyframes blink` (`index.css:169-176`) — **zero references**. `.hero-text-shadow` (`index.css:151-153`) — **zero references**. Three bespoke interactive/effect utilities, all dead.
- **Custom CTA patterns bypass the Button component**: pages use raw `text-[#5C1010]` links (`LiberalArtsPage.tsx:8`) rather than the `link` variant, so focus/hover behavior is inconsistent with the design system.
- Focus-visible coverage is actually decent inside vendored `ui/*` (`focus-visible:ring-ring` 13×, `focus-visible:ring-2` 10×) — but those rings key off `--ring`, which is only defined for light mode, and bespoke page links (§above) define **no** focus-visible state at all.

## 6. Shaders / textures / effects / motion

- **`prefers-reduced-motion` is honored in exactly one place** — the R3F nav-node glow (`OctahedronHero.tsx:32-45,668`). Everything else ignores it:
  - The octahedron **auto-rotation** (`OctahedronHero.tsx:796-801`) and the **scrolling "THE PROTOCOL" edge texture** (`:249-253`) keep animating under reduced-motion. The center scale-breathing (`:561-567`) and node scale-pulse (`:656-663`) also keep running — only the *emissive* pulse is gated.
  - **Framer-Motion `FadeIn`** (`FadeIn.tsx:28-44`) has no reduced-motion branch — every scroll-reveal animates regardless. This component wraps large amounts of page content, so it is the highest-impact motion offender.
- **Per-face tint is a hand-rolled `ShaderMaterial`** (`OctahedronHero.tsx:513-538`) with `tintMix: 0.55` hardcoded — a magic constant doing a `mix(tex.rgb, tint, 0.55)`. It is undocumented why 0.55, and it bakes the (FRAC-20-disputed) tint strength into a shader literal rather than a tunable token.
- **Texture/material churn:** `usePerFaceMaterials` rebuilds the entire 8-material array (including new `ShaderMaterial` instances) on every texture state update (`OctahedronHero.tsx:498-548`) and the old materials are not explicitly disposed — minor GPU-resource leak across the 1–8 progressive texture loads.
- The body noise SVG (`index.css:114`) is a reasonable tactile touch, but it is a full-viewport `feTurbulence` filter at `opacity 0.03` — fine visually, worth knowing it composites over the whole page.
- Banner clip-path V-notch (`HouseBanner.tsx:113-114`) is consistent and clean — no issue.

## 7. General code health

- **`FractalObject.tsx` is dead code carrying a stale full palette.** `FractalCityScene.tsx:9` imports `FractalObject` from **`./OctahedronHero`**, not from `./FractalObject`. The standalone `src/components/three/FractalObject.tsx` (327 lines) is imported nowhere live (grep-confirmed; the only other reference is the commented-out import at `FractalCityScene.tsx:7`). It still defines an **icosahedron** nav with the *old* house colors `#E07A5F/#8B7355/#457B9D/#1D3557/#CC2936/#6B4C9A` (`FractalObject.tsx:38-45`) — i.e. it agrees with `houses.ts` and disagrees with the live hero, making it a misleading "second source of truth" that a future editor could easily mistake for the live component.
- **Name collision:** two files export a component literally named `FractalObject` (`FractalObject.tsx:252` and `OctahedronHero.tsx:783`). The live one lives in a file called `OctahedronHero`; the dead one lives in `FractalObject`. This is maximally confusing — the filename and the export name point at different implementations.
- **Duplicated `tooltipStyle`** is copy-pasted verbatim between `OctahedronHero.tsx:762-777` and `FractalObject.tsx:231-246` (down to `#1a1a1a` and the `translateY(-28px)`).
- **A11y / contrast risk:** body text sits on a `feTurbulence`-noised cream (`index.css:112-114`); muted text uses `--muted-foreground: 0 0% 40%` (`index.css:62`) ≈ `#666` on `#f8f6f1` ≈ **4.0:1 — below WCAG AA 4.5:1** for normal text. Hero search placeholder is `text-foreground/40` (`Hero.tsx:114`) — ~2:1, fails AA. The HouseBanner luminance switch (`HouseBanner.tsx:8-13,99-100`) is a reasonable auto-contrast attempt but uses a naive 0.5 luminance threshold and overlays text on photos at `0.45` opacity — not guaranteed to clear AA on every banner.
- **Bundle:** Fraunces full variable axes + Jacquard 24 + 7 JetBrains Mono weights all loaded blocking via one `@import` (`index.css:1`); §4 notes the unused Fraunces weight/opsz range.
- Mobile-first per CLAUDE.md is broadly respected in shells; the gaps are the fixed-px Jacquard sizes (§4) and the reduced-motion omissions (§6), not layout overflow.

---

## Top 5 highest-confidence issues

1. **House accent color has no single source of truth — same house renders 3 different hues** (data model vs banner vs hero/avatar). — `src/data/houses.ts:195` vs `src/components/house/HouseBanner.tsx:22` vs `src/components/three/OctahedronHero.tsx:112` — severity: **critical**
2. **`Button` relies on undefined Replit tokens/utilities (`hover-elevate`, `active-elevate-2`, `--button-outline`, `*-border`); button hover/active elevation and the outline border are silent no-ops.** — `src/components/ui/button.tsx:10,16,18,23,26` — severity: **critical**
3. **`FractalObject.tsx` is dead code with a stale conflicting palette and a name that collides with the live component exported from `OctahedronHero.tsx`.** — `src/components/three/FractalObject.tsx:252` vs `src/components/three/OctahedronHero.tsx:783` — severity: **warning**
4. **`prefers-reduced-motion` is honored only for the node glow; octahedron rotation, scrolling edge text, and all Framer-Motion `FadeIn` reveals ignore it.** — `src/components/ui/FadeIn.tsx:28` and `src/components/three/OctahedronHero.tsx:796` — severity: **warning**
5. **Cream/background fragmentation: stale `#f7f6f2` token comment, body token never shown in hero, hero hardcodes a different `#faf8f5`; plus `--font-sans`/`--font-mono` are the same family and the entire `.dark` block is unwired.** — `src/index.css:6,8,46,75-103` and `src/components/sections/Hero.tsx:90` — severity: **warning**
