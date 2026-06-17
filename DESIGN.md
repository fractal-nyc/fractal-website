---
version: "0.2.0"
name: "Fractal NYC"
description: "Asimov-Collective editorial aesthetic for fractal-nyc — cream and charcoal, italic Fraunces headings over a JetBrains Mono body, six themed houses each owning a {light, deep} palette pair. Mobile-first 375px baseline; no dark mode."
colors:
  background: "#f8f6f0"
  foreground: "#171717"
  foreground-muted: "#525252"
  foreground-faint: "#dddad5"
  house-visit-light: "#889460"
  house-visit-deep: "#4A5A30"
  house-events-light: "#D4857A"
  house-events-deep: "#C13B2A"
  house-campus-light: "#2E6B4A"
  house-campus-deep: "#1A3A2E"
  house-education-light: "#C41E20"
  house-education-deep: "#5C1010"
  house-political-club-light: "#C83858"
  house-political-club-deep: "#6E1830"
  house-publications-light: "#E870A0"
  house-publications-deep: "#C44878"
typography:
  font-sans:
    fontFamily: "Inter, system-ui, sans-serif"
  font-mono:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
spacing:
  "0": "0rem"
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "7": "1.75rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "14": "3.5rem"
  "16": "4rem"
  "20": "5rem"
  "24": "6rem"
  "32": "8rem"
  "40": "10rem"
  "48": "12rem"
  "60": "15rem"
components:
  button-default:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
  button-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.font-mono}"
  house-banner-svg:
    backgroundColor: "{colors.house-visit-light}"
    textColor: "{colors.house-visit-deep}"
    typography: "{typography.font-mono}"
---

# Fractal NYC — Design System

## Overview

Fractal NYC is an editorial site in a warm-print key: cream surfaces, charcoal type, oversized italic Fraunces headings, a JetBrains Mono body, Jacquard 24 display accents, and a subtle noise texture that gives the page a faintly printed feel. There is one color scheme — surfaces are always cream, type is always charcoal.

The site is organized as six themed houses — Visit, Events, Campus, Education, Political Club, Publications — each owning a `{light, deep}` color pair. The global voice stays charcoal-on-cream; each house tints its own pages from its pair.

Two foundations:

1. **Mobile-first, 375px baseline.** Every page and component is designed at phone width first. Wider viewports are progressive enhancement.
2. **Charcoal is the voice.** `colors.foreground` is the dominant text color (`#171717`), an editorial charcoal rather than a saturated brand hue. Hierarchy comes from typography, color contrast, and whitespace; house colors provide scoped accents.

Political Club is reachable by direct route (`/political-club`) but hidden from the navbar via the `hideFromNavbar` flag in `src/data/houses.ts` (a companion `hideFromBanners` flag drives the `VISIBLE_HOUSES` filter). It is the one house with no per-page banner SVG of its own.

Political Club (and the People page) are intentionally **not surfaced at initial launch**, but they remain fully in the codebase and on the token system — Political Club carries its `house-political-club-{light,deep}` pair like every other house — so both are launch-ready the moment they're re-enabled, with no token or styling work left to do.

## Colors

The system declares **19 color tokens**: 4 surface tokens that drive the page chrome, 12 house tokens (6 houses × `{light, deep}`) that theme each house's pages, banner, and avatar, and 3 non-house section tokens — the `section-people-{light, deep}` pair plus the single `section-story` accent — for section pages that aren't houses (see [Non-house section colors](#non-house-section-colors)).

The surface palette is deliberately lean: cream (`background`) is the page, and the rest is a **single charcoal voice expressed in three weights**. Naming reflects that — `foreground` → `foreground-muted` → `foreground-faint`, darkest to faintest. Neutral fills are expressed as `foreground` at low opacity (e.g. `bg-foreground/5` for the gallery image placeholder) rather than a dedicated fill token; focus rings and text selection use `foreground` directly. The site's color *accents* come from the house palette, not a neutral accent token. The original shadcn scaffold's unused neutrals (`card`, `popover`, `accent`, `secondary`, `primary`, `muted`, `destructive`, `input`, `ring`, and their `-foreground` pairs) were removed in FRAC-201 along with the dead components that consumed them; the two surviving charcoal tints were renamed from the scaffold's `muted-foreground` / `border` into this ladder.

### Surface palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#f8f6f0` | Canonical cream. The page surface. |
| `foreground` | `#171717` | Canonical charcoal — the voice. Dominant text color, plus low-opacity neutral fills (`bg-foreground/5`), focus rings, and text selection. |
| `foreground-muted` | `#525252` | Mid charcoal — the secondary text color, softer than `foreground` for supporting prose, asides, and metadata. Tuned for WCAG AA contrast on cream. |
| `foreground-faint` | `#dddad5` | Faintest charcoal — soft borders / hairlines and quiet structural dividers (the default border color). |

### Houses

Each house has an internal data-model `id` (used in routes and `src/data/houses.ts`) and a human-facing display name. House tokens use the display-name slug, so UI labels map directly to tokens:

| Internal ID | Display name | Token slug prefix |
|---|---|---|
| `neighborhood` | Visit | `house-visit-{light,deep}` |
| `events` | Events | `house-events-{light,deep}` |
| `campus` | Campus | `house-campus-{light,deep}` |
| `school` | Education | `house-education-{light,deep}` |
| `forum` | Political Club | `house-political-club-{light,deep}` |
| `lab` | Publications | `house-publications-{light,deep}` |

| Token | Hex |
|---|---|
| `house-visit-light` | `#889460` |
| `house-visit-deep` | `#4A5A30` |
| `house-events-light` | `#D4857A` |
| `house-events-deep` | `#C13B2A` |
| `house-campus-light` | `#2E6B4A` |
| `house-campus-deep` | `#1A3A2E` |
| `house-education-light` | `#C41E20` |
| `house-education-deep` | `#5C1010` |
| `house-political-club-light` | `#C83858` |
| `house-political-club-deep` | `#6E1830` |
| `house-publications-light` | `#E870A0` |
| `house-publications-deep` | `#C44878` |

`HOUSES[id].palette: { light, deep }` in `src/data/houses.ts` is the single source of truth for house color, and each house has exactly two colors — the pair is the unit.

**Scope:** house colors live on their own house's pages. On a house's page, its pair may color display headings, the monogram letter, eyebrows, focus rings, and chrome. Most houses use `{light}` as the page background and `{deep}` as the accent; **Political Club and Education invert** (page background `{deep}`, accent `{light}`) — a per-page decision applied in `PoliticalClubPage.tsx` and `LiberalArtsPage.tsx`. Each house's per-page banner SVG (see [Components](#components)) likewise draws from the house pair.

### Non-house section colors

A small category distinct from the six houses: section pages that aren't houses but still carry canonical brand color. They are sourced from the exported `SECTIONS` record in `src/data/houses.ts` (the canonical real-hex home), mirrored by `--color-section-*` tokens in `src/index.css`. A test (`src/__tests__/section-tokens-sync.test.ts`) keeps the two in lockstep, exactly like the house-token check.

**Houses flood; non-house sections read as cream.** A house page is *color-flooded* — its `{light, deep}` pair fills the page background and accents (the saturated brand surface). Non-house sections need not follow that rule, and Story deliberately doesn't: **houses get color-flooded pages; non-house sections may read as cream / editorial.** Because of that, section entries are intentionally **heterogeneous in shape** — a flooded section carries a `{light, deep}` pair, while a cream section carries a single `{accent}`. The token names follow the shape: a pair → `section-{slug}-{light,deep}`; a single accent → `section-{slug}` (no variant suffix).

| Token | Hex | Shape |
|---|---|---|
| `section-people-light` | `#C49040` | flooded pair |
| `section-people-deep` | `#B65D19` | flooded pair |
| `section-story` | `#D4BA58` | cream — single accent |

**People** is a *flooded* section (`{light, deep}`), like a house. The People page is intentionally **deferred from launch** (hidden from the navbar via `EXTRA_HIDDEN_HREFS` in `Navbar.tsx`) but kept fully tokenized and launch-ready — its `/people` route, octahedron face, and nav swatch all read from the same `SECTIONS.people` source.

**Story** is a *cream* section (FRAC-205). It is a live page but, since it isn't a house, it reads as a **cream background with charcoal text** and a **single gold identity accent** (`section-story` `#D4BA58`) rather than a color flood. The accent appears only as decoration — the SectorHeader letter/name, the `FractalPattern` wallpaper, the `--btn-accent`, and the TalkCard accents — while all body text stays charcoal (`text-foreground`), since gold-on-cream fails WCAG for small text. Story previously carried *three* golds (a pale `#DFCA7A` page background, a deep `#8A7A20` accent, and `#D4BA58`); those collapsed to this one. The pale page gold was the reason a third color had been bolted on — it was illegible on the cream navbar — so `#D4BA58`, the only one legible on cream, became the single identity color. Story's color is sourced from `SECTIONS.story.accent`; its `/story` page, octahedron face, hero nav node, and navbar swatch all read from there.

### Surface + text pairings

Two text colors carry the entire site: charcoal (`text-foreground`) and cream (`text-background`). Which one a surface takes is driven by the surface's **perceived luminance**, not by the `-light` / `-deep` token name. A light fill takes charcoal; a dark or saturated fill takes cream:

| Surface luminance | Text | Examples |
|---|---|---|
| Light (cream + light house fills) | `text-foreground` (charcoal) | `bg-background`, `bg-house-visit-light`, `bg-house-events-light` |
| Dark / saturated (charcoal + dark/saturated house fills) | `text-background` (cream) | `bg-foreground`, `bg-house-campus-light`, `bg-house-education-deep`, `bg-house-publications-light`, `bg-house-political-club-deep` |

The token suffix does **not** decide the text color. Campus (`house-campus-light` `#2E6B4A`) and Publications (`house-publications-light` `#E870A0`) both use a `-light` background token yet still take cream `text-background`, because those fills are dark/saturated enough that charcoal would fail contrast. The luminance of the actual surface decides, not the `-light`/`-deep` label.

Secondary / supporting text uses `text-foreground-muted` (`#525252`), not `foreground-light` (that token was removed).

Set the text color explicitly on the same node as the surface. A nested cream surface inside a house page re-asserts `text-foreground` on the inner surface, so text always pairs with its actual background rather than inheriting from the page cascade.

**Known concern:** the Publications page (`LabPage`) floods `bg-house-publications-light` (`#E870A0`, a bright pink) under cream `text-background`. Cream-on-pink is a borderline-contrast pairing worth a revisit.

## Typography

Four families ship, mapped onto three semantic tiers. Two families are declared as tokens (`font-sans`, `font-mono`); the two display families have their rules in global CSS.

- **Fraunces** (`font-serif`) — the **Display** tier: headings, titles, and editorial highlights. Bare `h1–h6` default to plain Fraunces (family only, no forced case/style/weight); the visual tier is set explicitly at the call site via `.text-display` / `.text-title` / `.text-subtitle`. Heading LEVEL (document outline / a11y) is decoupled from visual TIER.
- **Inter** (`font-sans`) — the **Body** tier: the content family for body copy, leads, asides, and editorial sign-offs (bylines, attributions).
- **JetBrains Mono** (`font-mono`) — the **Chrome** tier: the non-content UI furniture — all the buttons, bars, labels, metadata, inputs, and frames that let users *control* the software (think address bar, tabs, nav buttons, status bars).
- **Jacquard 24** — a display script (sits within the Display key). Inline-styled on the Navbar wordmark, where a `[style*="Jacquard"]` rule in `src/index.css` renders it in its natural case and posture; it also appears as the monogram letter and arc tagline inside each per-page banner SVG, where the family is embedded (base64) directly in the SVG so it renders independent of page CSS.

Global rules: `body` renders normal-case by default; uppercase is opt-in via `.font-serif` or the chrome utilities below.

### Semantic type scale

The scale is delivered as utility classes in `src/index.css`. Each utility maps to exactly one Tailwind size.

**Display tier (Fraunces)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-display` | upright, weight 300, uppercase, tracking 0.04em, leading 1.1 | `text-4xl md:text-7xl` |
| `.text-title` | italic, weight 350, mixed-case, tracking 0.04em | `text-3xl md:text-5xl` |
| `.text-subtitle` | upright, weight 300, mixed-case, tracking 0.04em | `text-xl md:text-2xl` |

`.text-title` and `.text-subtitle` pin `text-transform: none` themselves, so call sites get mixed-case without a modifier.

**Body tier (Inter, normal-case)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-body` | weight 400 | `text-base` |
| `.text-body-lead` | weight 300, leading 1.7 | `text-lg` |
| `.text-aside` | weight 400, italic, leading-relaxed | `text-base` |

`.text-aside` is the editorial italic voice — bylines, attributions, role labels, parenthetical asides. It pairs with `.text-subtitle` on quoted passages: the quote uses `.text-subtitle`, the byline uses `.text-aside`.

**Chrome tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-label` | uppercase, weight 500, tracking 0.1em | `text-sm` |

The single chrome label utility — overline labels, form labels, inline metadata all reach for `.text-label`. (Earlier `.text-eyebrow` / `.text-meta` aliases were collapsed into this one name in FRAC-209.)

**Mono-display tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-mono-display` | mono, weight 100, uppercase, relaxed leading | `text-sm md:text-base` |

Body-length passages that carry the chrome tier's mono-uppercase identity but read as paragraphs — editorial / manifesto prose, e.g. the Home page's Golden Age Protocol section.

**Input tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-input` | mono, weight 400, uppercase | `text-base` |

For `<input>`, `<textarea>`, `<select>`, and other typeable controls. Sized at 16px (the iOS no-zoom threshold) with normal tracking; typed text renders uppercase by design.

**Button** (`src/components/ui/button.tsx`)

| Size | Padding | Type |
|---|---|---|
| `default` | `px-8 py-5` | `text-sm tracking-widest uppercase font-medium` |
| `sm` | `px-4 py-2.5` | `text-xs tracking-widest uppercase font-medium` |

Both sizes share the JetBrains Mono / uppercase / `tracking-widest` base.

## Layout

**Mobile-first, 375px baseline.** Write the mobile layout first; all breakpoints are additive enhancements.

### Horizontal padding

- `px-6` — the mobile gutter and default page-edge inset.
- `px-[4.5%]` — the full-bleed editorial gutter for sections whose breathing room scales with viewport width.

### Containers

Choose the narrowest `max-w-*` container that fits the content.

### Vertical rhythm

Section spacing climbs steeply from compact surfaces to major narrative breaks:

- `py-12 md:py-20` — compact (small surfaces, dense lists).
- `py-20 md:py-32` — standard sections.
- `py-32 md:py-48` — feature sections.
- `py-40 md:py-60` — golden-age section break, between major narrative beats.

### Spacing tokens

The `spacing:` YAML key inventories the numeric Tailwind steps in use across `src/` (`py-*`, `px-*`, `gap-*`, `space-y-*`, `space-x-*`); values are the Tailwind defaults (one unit = `0.25rem`).

## Elevation & Depth

The system is **near-flat**: hierarchy is carried by typography (oversized Fraunces vs. mono body), color contrast (charcoal on cream, house deep on house light), and editorial whitespace.

Two touches add tactility:

- **Body noise.** The `body` background carries an inline SVG `feTurbulence` texture at opacity `0.03` — it reads as printed paper rather than digital flatness.
- **`.hero-text-shadow`.** A two-layer cream text-shadow utility that lifts hero text over photographic backgrounds.

The one true-depth surface is the OctahedronHero 3D scene — see **Components**.

## Shapes

The shape language is editorially square, with a small soft-corner radius for interactive elements and two signature motifs: the Mandelbrot corner and the pennant banner.

### Rounded scale

Radii map to semantic roles, not arbitrary sizes:

| Class | Role | Example |
|---|---|---|
| `rounded-sm` | images | `GalleryImage` |
| `rounded-md` | interactive controls (buttons, inputs, dropdowns, navbar menu buttons) and containers (note cards, embeds) | `button.tsx`, Hero combobox, `NeighborhoodPage` note |
| `rounded-lg` | cards | `DocumentBadge`, `ArchiveSearch`, Story TalkCard |
| `rounded-full` | pill shapes: tag-filter pills and accent bars | `TagFilter`, accent bars |

(`rounded.xl` is declared in tokens but currently unused.)

### Mandelbrot corners

The Button `default` variant places four `MandelbrotIcon` glyphs at 4px insets from each corner — 20px, opacity 0.2, rotated to face center. This is the brand shape signature for primary CTAs; outline / ghost / link variants and the `sm` / `icon` sizes render clean.

The reusable `MandelbrotCorners` wrapper (`src/components/ui/MandelbrotCorners.tsx`) puts the same motif around any container — a note card, a badge, an embed panel. **Invariant:** when the wrapped container holds text, its padding on every side, at every breakpoint, must be ≥ `inset + iconSize` so the glyphs stay clear of the copy:

| `size` | inset | icon | min padding |
|---|---|---|---|
| `xs` | 4px | 20px | **24px** (`p-6`) |
| `sm` | 6px | 30px | **36px** (`p-9`) |
| `md` | 8px | 45px | **53px** (`p-14`) |
| `lg` | 10px | 60px | **70px** (`p-16`+) |

### Pennant banner

The pennant motif lives in the per-page banner SVGs (see [Components](#components)). Each is a tall, downward-pointing pennant with a V-notch at the bottom, an elliptical Mandelbrot pocket cut from the house fill, an arc tagline, and a centered Jacquard 24 monogram — the whole shape is **baked into a single SVG file** (`/images/banners/*-banner.svg`, viewBox ≈ `123 × 368`) rather than applied as a runtime CSS `clip-path`. They render as plain `<img>` so the embedded base64 Jacquard font draws without page-CSS dependencies.

## Components

Five components are modeled in the `components:` YAML block; the rest are described here in prose.

### YAML-modeled

**`button-default`** — bordered, translucent charcoal-tinted surface (`bg-foreground/[0.03]`, `border-foreground/20`) with the four Mandelbrot corners. Padding `px-8 py-5`. Hover `bg-foreground/10`; focus-visible ring in canonical charcoal.

**`button-outline`** — same padding, transparent background, `border border-current`, no corner glyphs. Hover `bg-foreground/5`. For secondary or compact uses.

**`button-ghost`** — no chrome; hover affords interaction via `hover:underline underline-offset-4`. For tertiary actions.

**`button-link`** — inline text action for sitting inside prose. Zero padding, `underline underline-offset-4`, hover `text-foreground/80`.

**`house-banner-svg`** — the per-page pennant banner. Each of the five surfaced houses ships its own baked-art SVG component (`VisitBannerSVG`, `EventsBannerSVG`, `CampusBannerSVG`, `EducationBannerSVG`, `PublicationsBannerSVG`), rendered as a plain `<img>` of `/images/banners/*-banner.svg`. The pennant shape, the house-colored fill, the Mandelbrot pocket, the arc tagline, and the Jacquard 24 monogram are all baked into the SVG — there is no runtime theming. A house page flanks its content with a pair of its banner (an absolute `hidden md:flex` layer on desktop, a `flex md:hidden` in-flow pair on mobile; see `NeighborhoodPage.tsx`). The YAML entry encodes the Visit pair as a representative example. **Political Club has no banner SVG** — it is unsurfaced at launch.

### Prose-only

- **Navbar wordmark** — Jacquard 24, inline-styled, sized fluidly via `clamp()`.
- **Hero combobox** — the search/filter combobox on the homepage hero, with full combobox/listbox a11y semantics.
- **OctahedronHero** — the homepage 3D scene (Three.js / React Three Fiber): an eight-face octahedron, each face carrying a section photo, with auto-rotation and breathing animations all gated by `usePrefersReducedMotion()`. Keyboard users reach the destination routes via the `.sr-only-focusable` skip-nav. Face order is locked in `src/components/three/OctahedronHero.tsx`.

## Do's

- Design for the 375px mobile baseline first; treat every wider viewport as progressive enhancement.
- Use Fraunces for the Display tier (headings/titles) — set the visual tier explicitly via `.text-display` / `.text-title` / `.text-subtitle`; JetBrains Mono (`font-mono`) for the Chrome tier (labels, inputs, buttons, metadata); and Inter (`font-sans`) for the Body tier.
- Reach for semantic surface tokens (`background`, `foreground`, `foreground-muted`, `foreground-faint`) and the semantic type utilities (`.text-display`, `.text-body`, `.text-label`, …) rather than raw values.
- Use house tokens (`house-{slug}-{light|deep}`) inside that house's own pages, and keep each house to its two-color pair.
- Pair every surface with its text color explicitly on the same node, driven by the surface's perceived luminance (light → charcoal `text-foreground`; dark/saturated → cream `text-background`).
- Reach for the explicit tier utility a heading needs (`.text-display` for upright uppercase Fraunces, `.text-title` for italic mixed-case), and `normal-case` when a block needs mixed-case.
- Gate every animation on `usePrefersReducedMotion()` (or an equivalent `@media (prefers-reduced-motion: reduce)` rule).

## Design conformance (the governance loop)

This doc is the source of design **intent**; the code must conform, and any deliberate divergence must be reconciled back here.

- **Continuous gate** — `pnpm conformance` (CI: `.github/workflows/conformance.yml`) fails when a PR introduces a **net-new off-vocabulary color** — a raw hex that isn't a design token and isn't already grandfathered. The sanctioned token set is read live from `src/index.css` `@theme`, so renames never break the gate.
- **Blessing an intentional color** — if a raw value is a deliberate exception (e.g. a non-house page-identity color), record it: run `node scripts/design-conformance.mjs --update-baseline` to add it to `scripts/design-conformance.baseline.json`, **and** document the intent here. Drift gets conformed; intent gets written down — never merged silently.
- **Periodic sweep** — the `/design-audit` command does the full per-dimension coherence pass (color, typography, spacing, …): declared vocabulary vs used vocabulary, sorting divergences into consolidate / bless-and-document / flag. Use it to burn down the grandfathered baseline over time.
