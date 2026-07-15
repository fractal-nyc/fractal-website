---
version: "0.3.0"
name: "Fractal NYC"
description: "Asimov-Collective editorial aesthetic for fractal-nyc — cream and charcoal, italic Fraunces headings over a JetBrains Mono body, seven themed houses each owning a {light, deep} palette pair. Mobile-first 375px baseline; no dark mode."
colors:
  background: "#f8f6f0"
  foreground: "#171717"
  foreground-muted: "#525252"
  foreground-faint: "#dddad5"
  house-co-living-light: "#889460"
  house-co-living-deep: "#4A5A30"
  house-events-light: "#D4857A"
  house-events-deep: "#C13B2A"
  house-campus-light: "#2E6B4A"
  house-campus-deep: "#1A3A2E"
  house-education-light: "#C41E20"
  house-education-deep: "#5C1010"
  house-political-club-light: "#C83858"
  house-political-club-deep: "#6E1830"
  house-library-light: "#E870A0"
  house-library-deep: "#C44878"
  house-accelerator-light: "#8E2A1E"
  house-accelerator-deep: "#641E28"
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
    backgroundColor: "var(--accent, currentColor)"
    backdropFilter: "blur(6px)"
    textColor: "#ffffff"
    border: "var(--accent, currentColor)"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
    hoverBackgroundColor: "var(--btn-fill, rgba(242, 234, 216, 0.16))"
    hoverTextColor: "var(--btn-text, var(--accent, currentColor))"
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
    backgroundColor: "{colors.house-co-living-light}"
    textColor: "{colors.house-co-living-deep}"
    typography: "{typography.font-mono}"
---

# Fractal NYC — Design System

## Overview

Fractal NYC is an editorial site in a warm-print key: cream surfaces, charcoal type, oversized italic Fraunces headings, a JetBrains Mono body, and Jacquard 24 display accents.

Fractal is organized into themed **houses** — Co-Living, Events, Campus, Education, Political Club, Library, Accelerator — one per sector of the organization. Each house owns an accent color pair (`{light, deep}`) that brands its sector and themes its own pages. The houses are where the site's color lives.

(**v0.3.0 content port:** the *Visit* house was renamed *Co-Living* and *Publications* → *Library* — the same pairs, new user-facing names, slugs, routes, and matching `house-co-living-*` / `house-library-*` tokens. *Accelerator* was added as a 7th house. The *Story* page folded into Home, so Story is now a Home section rather than a route, but keeps its `section-story` accent.)

(**External sectors — no internal page:** the *Accelerator* and *Education* (`school`, shown in the nav as *FractalU*) houses **remain fully in the model** — both keep their `house-accelerator-*` / `house-education-*` token pairs, their nav-letter color, and their octahedron vertex node — but they **no longer have an internal page**. Their nav link and octahedron node point out to standalone sites: Accelerator → `https://www.fractalaccelerator.com/`, FractalU → `https://www.fractalu.nyc/` (opened in a new tab). The old `/accelerator`, `/education`, and `/new-liberal-arts` routes external-redirect there. Still **7 houses / 14 tokens** — nothing was removed from the palette.)

(**Footer removed:** the visible site footer — the black CTA band and the "Fractal Collective" wordmark band — was removed. `Footer.tsx` now renders only an empty, zero-height `<footer data-site-footer aria-hidden="true" />` marker, retained **solely** as the anchor `useBannerAboveFooter` measures against to keep the flanking pennant banners from overrunning the page end. Do not add visible chrome there.)

Two foundations:

1. **Mobile-first, 375px baseline.** Every page and component is designed at phone width first. Wider viewports are progressive enhancement.
2. **A quiet base so the houses can be loud.** The base is deliberately neutral — cream surfaces, charcoal text, one scheme, no dark mode — so the accent house colors carry the brand and signal Fractal's different sectors. There are so many pops of color from the houses that the base is kept simple, letting those accents read. Hierarchy comes from typography, contrast, and whitespace; color comes from the houses.

Political Club is reachable by direct route (`/political-club`) but hidden from the navbar via the `hideFromNavbar` flag in `src/data/houses.ts` (a companion `hideFromBanners` flag drives the `VISIBLE_HOUSES` filter). It is the one house with no per-page banner SVG of its own.

Political Club (and the People page) are intentionally **not surfaced at initial launch**, but they remain fully in the codebase and on the token system — Political Club carries its `house-political-club-{light,deep}` pair like every other house — so both are launch-ready the moment they're re-enabled, with no token or styling work left to do.

## Colors

The system declares **21 color tokens**: 4 surface tokens that drive the page chrome, 14 house tokens (7 houses × `{light, deep}`) that theme each house's pages, banner, and avatar, and 3 non-house section tokens — the `section-people-{light, deep}` pair plus the single `section-story` accent — for section pages that aren't houses (see [Non-house section colors](#non-house-section-colors)).

The surface palette is deliberately lean: cream (`background`) is the page, and the rest is charcoal in three weights — `foreground` → `foreground-muted` → `foreground-faint`, darkest to faintest. Neutral fills are `foreground` at low opacity (e.g. `bg-foreground/5` for the gallery image placeholder) rather than a dedicated fill token; focus rings and text selection use `foreground` directly. The site's color *accents* come from the house palette, not a neutral accent token.

### Surface palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#f8f6f0` | Canonical cream. The page surface. |
| `foreground` | `#171717` | Canonical charcoal — the voice. Dominant text color, plus low-opacity neutral fills (`bg-foreground/5`), focus rings, and text selection. |
| `foreground-muted` | `#525252` | Mid charcoal — the secondary text color, softer than `foreground` for supporting prose, asides, and metadata. Tuned for WCAG AA contrast on cream. |
| `foreground-faint` | `#dddad5` | Faintest charcoal — soft borders / hairlines and quiet structural dividers (the default border color). |

### Houses

Each house has an internal data-model `id` (used in routes and `src/data/houses.ts`) and a human-facing display name. The internal `id` stays abstract and decoupled from the display name (`neighborhood`→Co-Living, `school`→Education, `forum`→Political Club, `lab`→Library) — an intentional convention, so look houses up by `id`. House **tokens** follow the *display-name* slug, so UI labels map directly to tokens and a rename (Visit→Co-Living, Publications→Library) carries the token with it.

| Internal ID | Display name | Token slug prefix |
|---|---|---|
| `neighborhood` | Co-Living | `house-co-living-{light,deep}` |
| `events` | Events | `house-events-{light,deep}` |
| `campus` | Campus | `house-campus-{light,deep}` |
| `school` | Education | `house-education-{light,deep}` |
| `forum` | Political Club | `house-political-club-{light,deep}` |
| `lab` | Library | `house-library-{light,deep}` |
| `accelerator` | Accelerator | `house-accelerator-{light,deep}` |

| Token | Hex |
|---|---|
| `house-co-living-light` | `#889460` |
| `house-co-living-deep` | `#4A5A30` |
| `house-events-light` | `#D4857A` |
| `house-events-deep` | `#C13B2A` |
| `house-campus-light` | `#2E6B4A` |
| `house-campus-deep` | `#1A3A2E` |
| `house-education-light` | `#C41E20` |
| `house-education-deep` | `#5C1010` |
| `house-political-club-light` | `#C83858` |
| `house-political-club-deep` | `#6E1830` |
| `house-accelerator-light` | `#8E2A1E` |
| `house-accelerator-deep` | `#641E28` |
| `house-library-light` | `#E870A0` |
| `house-library-deep` | `#C44878` |

`HOUSES[id].palette: { light, deep }` in `src/data/houses.ts` is the single source of truth for house color, and each house has exactly two colors — the pair is the unit.

**Scope:** house colors live on their own house's pages. On a house's page, its pair may color display headings, the monogram letter, eyebrows, focus rings, and chrome. Most houses use `{light}` as the page background and `{deep}` as the accent; **Political Club inverts** (page background `{deep}`, accent `{light}`) — a per-page decision applied in `PoliticalClubPage.tsx`. (Education used to invert the same way, but it no longer has an internal page — see the external-sectors note above.) Each house's per-page banner SVG (see [Components](#components)) likewise draws from the house pair.

### Non-house section colors

A small category distinct from the six houses: section pages that aren't houses but still carry canonical brand color. They are sourced from the exported `SECTIONS` record in `src/data/houses.ts` (the canonical real-hex home), mirrored by `--color-section-*` tokens in `src/index.css`. A test (`src/__tests__/section-tokens-sync.test.ts`) keeps the two in lockstep, exactly like the house-token check.

**Houses flood; non-house sections read as cream.** A house page is *color-flooded* — its `{light, deep}` pair fills the page background and accents (the saturated brand surface). Non-house sections need not follow that rule, and Story deliberately doesn't: **houses get color-flooded pages; non-house sections may read as cream / editorial.** Because of that, section entries are intentionally **heterogeneous in shape** — a flooded section carries a `{light, deep}` pair, while a cream section carries a single `{accent}`. The token names follow the shape: a pair → `section-{slug}-{light,deep}`; a single accent → `section-{slug}` (no variant suffix).

| Token | Hex | Shape |
|---|---|---|
| `section-people-light` | `#C49040` | flooded pair |
| `section-people-deep` | `#B65D19` | flooded pair |
| `section-story` | `#D4BA58` | cream — single accent |

**People** is a *flooded* section (`{light, deep}`), like a house. The People page is intentionally **deferred from launch** (hidden from the navbar via `EXTRA_HIDDEN_HREFS` in `Navbar.tsx`) but kept fully tokenized and launch-ready — its `/people` route, octahedron face, and nav swatch all read from the same `SECTIONS.people` source.

**Story** is a *cream* section. Since it isn't a house, it reads as a **cream background with charcoal text** and a **single gold identity accent** (`section-story` `#D4BA58`) rather than a color flood. The accent appears only as decoration — the SectorHeader letter/name and the fractal-diagram frame/center — while all body text stays charcoal (`text-foreground`), since gold-on-cream fails WCAG for small text. Story's color is sourced from `SECTIONS.story.accent`. **v0.3.0 content port:** the Story *page* folded into Home, so the story content (SectorHeader, origin narrative, `FractalDiagram`, photo gallery, "Curious about Fractal?" callout) now renders as a Home section rather than at `/story`; the `SECTIONS.story` source, octahedron face, hero nav node, and navbar swatch are unchanged.

**Story deep-gold (`#a08a2e`)** — a *blessed literal* (in `scripts/design-conformance.baseline.json`), used as the "Curious about Fractal?" callout label on Home. It is intentionally a touch deeper/greener than `section-story` `#D4BA58` so it clears contrast on cream at label size (the light gold doesn't). No token — it lives only at that one Story site.

### Surface + text pairings

Two text colors carry the entire site: charcoal (`text-foreground`) and cream (`text-background`). Which one a surface takes is driven by the surface's **perceived luminance**, not by the `-light` / `-deep` token name. A light fill takes charcoal; a dark or saturated fill takes cream:

| Surface luminance | Text | Examples |
|---|---|---|
| Light (cream + light house fills) | `text-foreground` (charcoal) | `bg-background`, `bg-house-co-living-light`, `bg-house-events-light` |
| Dark / saturated (charcoal + dark/saturated house fills) | `text-background` (cream) | `bg-foreground`, `bg-house-campus-light`, `bg-house-education-deep`, `bg-house-library-light`, `bg-house-political-club-deep`, `bg-house-accelerator-light` |

The token suffix does **not** decide the text color. Campus (`house-campus-light` `#2E6B4A`) and Library (`house-library-light` `#E870A0`) both use a `-light` background token yet still take cream `text-background`, because those fills are dark/saturated enough that charcoal would fail contrast. The luminance of the actual surface decides, not the `-light`/`-deep` label.

Secondary / supporting text uses `text-foreground-muted` (`#525252`).

Set the text color explicitly on the same node as the surface. A nested cream surface inside a house page re-asserts `text-foreground` on the inner surface, so text always pairs with its actual background rather than inheriting from the page cascade.

**Known concern:** the Library page (`LibraryPage`) floods `bg-house-library-light` (`#E870A0`, a bright pink) under cream `text-background`. Cream-on-pink is a borderline-contrast pairing worth a revisit.

### 3D-scene palette (out-of-token)

The WebGL hero scenes carry their own material/light palette that lives **deliberately outside** the 2D token system: Three.js materials and lights set color in JS props, where CSS custom properties don't resolve, so these are raw hex literals by necessity, not drift. They're sanctioned exceptions, grandfathered in `scripts/design-conformance.baseline.json` (this section is the *intent* half of that baseline entry). They never appear in 2D CSS — reach for them only inside the `three/` scene code.

| Source | Colors | Role |
|---|---|---|
| `OctahedronHero.tsx` | `#e8e0d0` `#e0c880` `#ddb866` `#cc9955` `#c4a265` `#bb8844` `#8a7a6a` | octahedron gold/sand face-material tints |
| `FractalCityScene.tsx` | `#ffaa66` `#ffcc88` `#f5f0ea` `#aabbcc` `#ffffff` | scene point/directional lights + ambient (`#aabbcc` is the cool fill `directionalLight`) |
| `heroNavNodes.ts` | `#c4a265` | `PALETTE_FALLBACK` — the model gold used when a section/house color is missing |

## Typography

Four families ship, mapped onto three semantic tiers. Two families are declared as tokens (`font-sans`, `font-mono`); the two display families have their rules in global CSS.

- **Fraunces** (`font-serif`) — the **Display** tier: headings, titles, and editorial highlights. Bare `h1–h6` default to plain Fraunces (family only, no forced case/style/weight); the visual tier is set explicitly at the call site via `.text-display` / `.text-title` / `.text-subtitle`. Heading LEVEL (document outline / a11y) is decoupled from visual TIER.
- **Inter** (`font-sans`) — the **Body** tier: the content family for body copy, leads, asides, and editorial sign-offs (bylines, attributions).
- **JetBrains Mono** (`font-mono`) — the **Chrome** tier: the non-content UI furniture — all the buttons, bars, labels, metadata, inputs, and frames that let users *control* the software (think address bar, tabs, nav buttons, status bars).
- **Jacquard 24** — a display script (sits within the Display key). It headlines the Navbar, where a `[style*="Jacquard"]` rule in `src/index.css` renders it in its natural case and posture; it also appears as the monogram letter and arc tagline inside each per-page banner SVG, where the family is embedded (base64) directly in the SVG so it renders independent of page CSS. The Navbar is a **bespoke inline-styled display surface**: the whole mega-menu sets `fontSize`/`fontWeight`/`fontFamily` directly (`Navbar.tsx`, e.g. lines ~78, 90, 100, 180, 186, 218, 225, 273, 285, 318, 347), mixing Jacquard 24 caps with weight-100/300 mono and `clamp()` sizing — deliberately **outside** the semantic `.text-*` scale. It's low-consistency-expectation signature chrome; don't normalize it onto the type utilities.

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

Inline `<strong>` emphasis in body copy renders at `font-semibold` (weight 600) over the Inter-400 body — the sanctioned body-emphasis weight (used in `Campus.tsx`). `<strong>` semantically wants visual weight, and 600 is a measured editorial bump rather than a bold.

**Chrome tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-label` | uppercase, weight 500, tracking 0.1em | `text-sm` |

The single chrome label utility — overline labels, form labels, inline metadata all reach for `.text-label`.

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

The Button ships a single `default` size — JetBrains Mono, uppercase, `tracking-widest`, `font-medium`.

## Layout

**Mobile-first, 375px baseline.** Write the mobile layout first; all breakpoints are additive enhancements.

### Horizontal padding

- `px-6` — the mobile gutter and default page-edge inset.
- `px-[4.5%]` — the full-bleed editorial gutter for sections whose breathing room scales with viewport width.
- `md:px-[22%]` — the centered narrow-content desktop gutter: mobile stays `px-6`, then on `md+` a deep percentage inset squeezes a single column of editorial copy to the center of wide viewports. Used by the single-column sector pages (`EventsPage`, `LibraryPage`, `CoLivingPage`, `Education`).

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

The one true-depth surface is the OctahedronHero 3D scene — see **Components**.

## Shapes

The shape language is editorially square, with a small soft-corner radius for interactive elements and two signature motifs: the Mandelbrot corner and the pennant banner.

### Rounded scale

Radii map to semantic roles, not arbitrary sizes:

| Class | Role | Example |
|---|---|---|
| `rounded-sm` | images | `GalleryImage` |
| `rounded-md` | interactive controls (buttons, inputs, dropdowns, navbar menu buttons) and containers (note cards, embeds) | `button.tsx`, Hero combobox, `VisitPage` note |
| `rounded-lg` | cards | `DocumentBadge`, `ArchiveSearch`, Story TalkCard |
| `rounded-full` | pill shapes: tag-filter pills and accent bars | `TagFilter`, accent bars |

(`rounded.xl` is declared in tokens but currently unused.)

### Borders

Borders resolve to one of three semantic tiers — pick by intent, not by eye:

| Tier | Value | Role | Example sites |
|---|---|---|---|
| **Structural** | `border-foreground-faint` | Default frames, dividers, hairlines. The sitewide default (`* { border-foreground-faint }`). | footer divider, publications cards (`DocumentBadge`, `ArchiveSearch`, Story TalkCard), Navbar menu-row dividers, PublicationsPage section rule |
| **Definition** | `border-foreground/20` | A defining container edge on cream, without emphasis. | Hero search input + results dropdown, Hero keyboard-nav popover |
| **Emphasis** | `[border-color:var(--accent,currentColor)]` | Themed house/section accent border — the same accent the button uses. For containers that want to carry the house color. Inherits `--accent` (set per page on `<main>`); falls back to `currentColor`. | `button-default`, Visit "Note" card (`VisitPage`), Events Luma embed (`EventsPage`) |

The `--accent` custom property is set on each page's `<main>` to that page's house/section color and read by both the button and the Emphasis-tier borders. Focus/hover states (e.g. the Hero input's `focus:border-foreground/40`, the lab `focus:border-house-publications-deep/60`) sit deliberately outside this resting-tier vocabulary — they are transient states, not resting borders.

### Mandelbrot corners

The Button `default` variant places four `MandelbrotIcon` glyphs at 4px insets from each corner — 20px, opacity 0.8, rotated to face center. This is the brand shape signature for primary CTAs; the outline / ghost / link variants render clean (no corners).

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

**`button-default`** — the FRAC-52 frosted-glass CTA. An accent-filled surface (`bg-[var(--accent,currentColor)]`) under a `backdrop-filter: blur(6px)` frost, with a matching accent border (`[border-color:var(--accent,currentColor)]`), white text, a tiled paper-grain overlay (`PAPER_GRAIN_BG` — a 320×320 fractal-noise SVG at `mix-blend-mode: overlay`, opacity 0.35), and the four Mandelbrot corner glyphs. Padding `px-8 py-5`; soft drop shadow. The accent (`--accent`) is set per house page on `<main>`, falling back to `currentColor`. Hover swaps to a cream fill (`hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))]`) with accent-colored text. Real focus-visible ring (`focus-visible:ring-2 ring-foreground`).

**`button-outline`** — same padding, transparent background, `border border-current`, no corner glyphs. Hover `bg-foreground/5`. For secondary or compact uses.

**`button-ghost`** — no chrome; hover affords interaction via `hover:underline underline-offset-4`. For tertiary actions.

**`button-link`** — inline text action for sitting inside prose. Zero padding, `underline underline-offset-4`, hover `text-foreground/80`.

**`house-banner-svg`** — the per-page pennant banner. Surfaced houses ship a baked-art SVG component (`VisitBannerSVG`, `EventsBannerSVG`, `CampusBannerSVG`, `EducationBannerSVG`, `PublicationsBannerSVG`), rendered as a plain `<img>` of `/images/banners/*-banner.svg`. The pennant shape, the house-colored fill, the Mandelbrot pocket, the arc tagline, and the Jacquard 24 monogram are all baked into the SVG — there is no runtime theming. A house page flanks its content with a pair of its banner (an absolute `hidden md:flex` layer on desktop, a `flex md:hidden` in-flow pair on mobile; see `CoLivingPage.tsx`). **Naming note (v0.3.0):** after the content-port renames, `CoLivingPage` still imports `VisitBannerSVG` and `LibraryPage` still imports `PublicationsBannerSVG` — the banner *art* (which reads "VISIT" / "PUBLICATIONS") was intentionally left stale, to be redrawn later. **Political Club and Accelerator have no banner SVG.**

### Prose-only

- **Navbar** — a bespoke inline-styled display surface, not just the wordmark. The wordmark is Jacquard 24 sized fluidly via `clamp()`, and the entire expanded mega-menu likewise sets `fontSize`/`fontWeight`/`fontFamily` inline (Jacquard 24 caps + weight-100/300 mono, `clamp()` sizing) — intentionally outside the `.text-*` scale (see §Typography). Treat it as signature chrome, themed but not on the semantic type system.
- **`FractalPattern`** (`src/components/ui/FractalPattern.tsx`) — the low-opacity Sierpinski-tessellation wallpaper placed as the first child of `<main>` so it sits behind content. Its `color` prop is injected straight into SVG `stroke`/`fill` **presentation attributes**, where `var()` does **not** resolve — so the value must be a **literal hex sourced from the data model** (`HOUSES.find(...).palette.{light|deep}` / `SECTIONS.*`), never a hand-typed hex and never a CSS var. FRAC-206 established the convention (Political Club: `const PC_COLOR = HOUSES.find(h => h.id === "forum")!.palette.light`); FRAC-219 extends it to the remaining house pages (Campus, Co-Living, Library, Events, Education, Accelerator).
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
