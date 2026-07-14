---
version: "0.3.0"
name: "Fractal NYC"
description: "Asimov-Collective editorial aesthetic for fractal-nyc — cream and charcoal, italic Fraunces headings over a JetBrains Mono body, seven themed houses each owning a {light, deep} palette pair. Mobile-first 375px baseline; no dark mode."
colors:
  background: "#f8f6f0"
  foreground: "#171717"
  foreground-muted: "#525252"
  foreground-faint: "#dddad5"
  house-coliving-light: "#889460"
  house-coliving-deep: "#4A5528"
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
  accel-ink: "#641E28"
  accel-cta: "#9B3741"
  accel-emphasis: "#8C2D37"
  accel-cream: "#F1F0EC"
  accel-pale: "#FCEBED"
  section-people-light: "#C49040"
  section-people-deep: "#B65D19"
  section-story-light: "#D4BA58"
  section-story-deep: "#a08a2e"
  nav-portal: "#5B4A8A"
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
    backgroundColor: "{colors.house-coliving-light}"
    textColor: "{colors.house-coliving-deep}"
    typography: "{typography.font-mono}"
---

# Fractal NYC — Design System

## Overview

Fractal NYC is an editorial site in a warm-print key: cream surfaces, charcoal type, oversized italic Fraunces headings, a JetBrains Mono body, and Jacquard 24 display accents.

Fractal is organized into themed **houses** — Campus, Co-Living, Accelerator, Education, Events, Library, Political Club — one per sector of the organization. Each house owns an accent color pair (`{light, deep}`) that brands its sector and themes its own pages. The houses are where the site's color lives.

Two foundations:

1. **Mobile-first, 375px baseline.** Every page and component is designed at phone width first. Wider viewports are progressive enhancement.
2. **A quiet base so the houses can be loud.** The base is deliberately neutral — cream surfaces, charcoal text, one scheme, no dark mode — so the accent house colors carry the brand and signal Fractal's different sectors. There are so many pops of color from the houses that the base is kept simple, letting those accents read. Hierarchy comes from typography, contrast, and whitespace; color comes from the houses.

### Retired pages, retained tokens

Three sections had a page and no longer do. **Education** (`/education`), **Political Club** (`/political-club`) and **People** (`/people`) were retired: their page components are deleted, their routes are gone, and — like every other removal on this site — they are **not redirected**. Those URLs simply 404. (The site has never been deployed, so there is nothing to preserve.)

**What was removed is pages, not identity.** Each of the three keeps everything else:

- its entry in `HOUSES` / `SECTIONS` (`src/data/houses.ts`),
- its full color pair — `house-education-{light,deep}`, `house-political-club-{light,deep}`, `section-people-{light,deep}` — still declared in `src/index.css` and still enforced by the `house-tokens-sync` / `section-tokens-sync` tests,
- its decorative **octahedron face** on the home hero (a face is not a nav destination),
- the `.btn-on-dark` utility in `src/index.css`, whose only two consumers were the Education and Political Club pages (the two that invert their pair onto a dark flood). It is now **unreferenced but retained**, for the same reason as the tokens.

So the token count below is unchanged, and each section is launch-ready the moment someone wants the page back: rebuild the page, re-add the route, and the color system already has everything it needs. **A surviving token is not evidence of a surviving route** — `routes.test.tsx` pins the 404s precisely so nobody infers one from the other.

Two consequences worth stating plainly, because they read as inconsistencies otherwise:

- The `route` field on the `school` and `forum` houses is now **dead data**. It is left in place rather than deleted so the house entries stay uniform; nothing reads it.
- The octahedron's vertex 1 used to carry Education. Rather than drop the node (which would have changed the hero's geometry), it was **repointed at the Accelerator** — so the 3D nav still offers six live destinations and never lands a user on a 404.

Political Club also retains its `hideFromNavbar` / `hideFromBanners` flags in `src/data/houses.ts` (the latter drives the `VISIBLE_HOUSES` filter). It remains the one house with no per-page banner SVG of its own.

### The Accelerator is the exception

Of the seven houses, four still theme a *Fractal NYC* page — Co-Living, Events, Campus, Library. On those, the house pair floods the surface and everything else on the page is the shared cream / charcoal / Fraunces / JetBrains Mono system. (Education and Political Club themed a page this way until their pages were retired; the rules below still describe how they *would* theme one.)

**The Accelerator does not.** It renders a genuinely different brand — the Fractal Accelerator (see `fractal-os/BRAND/fractalaccelerator.md`): burgundy ink, burgundy CTAs, white and warm-cream panels, Inter body copy, soft shadows, small radii. It still carries a house pair (`house-accelerator-{light,deep}`) so its nav row, octahedron face, and page flood behave like every other house — but the *content* of the page is drawn from the `accel-*` sub-palette below, and it opts out of the two Fractal NYC page motifs: it renders **no `FractalPattern`** and **no pennant banners**, and it ships **its own footer** rather than the shared one.

Treat `AcceleratorPage.tsx` as a sanctioned second brand living inside this codebase, not as drift to be conformed. Do not "fix" it toward the house system.

## Colors

The system declares **28 color tokens**: 4 surface tokens that drive the page chrome, 14 house tokens (7 houses × `{light, deep}`) that theme each house's pages, banner, and avatar, 5 `accel-*` tokens for the Accelerator's second brand, 4 non-house section tokens (`section-people-{light, deep}` and `section-story-{light, deep}`) for section pages that aren't houses (see [Non-house section colors](#non-house-section-colors)), and 1 nav-only token (`nav-portal`).

The surface palette is deliberately lean: cream (`background`) is the page, and the rest is charcoal in three weights — `foreground` → `foreground-muted` → `foreground-faint`, darkest to faintest. Neutral fills are `foreground` at low opacity (e.g. `bg-foreground/5` for the gallery image placeholder) rather than a dedicated fill token; focus rings and text selection use `foreground` directly. The site's color *accents* come from the house palette, not a neutral accent token.

### Surface palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#f8f6f0` | Canonical cream. The page surface. |
| `foreground` | `#171717` | Canonical charcoal — the voice. Dominant text color, plus low-opacity neutral fills (`bg-foreground/5`), focus rings, and text selection. |
| `foreground-muted` | `#525252` | Mid charcoal — the secondary text color, softer than `foreground` for supporting prose, asides, and metadata. Tuned for WCAG AA contrast on cream. |
| `foreground-faint` | `#dddad5` | Faintest charcoal — soft borders / hairlines and quiet structural dividers (the default border color). |

### Houses

Each house has an internal data-model `id` (used in routes and `src/data/houses.ts`) and a human-facing display name. House tokens use the display-name slug, so UI labels map directly to tokens:

House `id`s stay **abstract and decoupled** from both slug and display name (an `AGENTS.md` rule): `school` is Education, `forum` is Political Club. The renamed houses took literal ids because they had no abstract name worth keeping (`neighborhood` → `coliving`, `lab` → `library`), so the set is deliberately mixed — always look the house up by `id`, never by guessing it from the label.

The CSS token slug is a **third, separate** name, declared explicitly as `House.tokenSlug`. It is not derived from the id (`school` → `education`) nor from the display name (`Fractal Co-Living` would slugify to `fractal-co-living`, not `coliving`). The `house-tokens-sync` test reads `tokenSlug`, so renaming a token without updating the field fails loudly.

| Internal ID | Display name | Route | Token slug prefix |
|---|---|---|---|
| `coliving` | Fractal Co-Living | `/co-living` | `house-coliving-{light,deep}` |
| `events` | Events | `/events` | `house-events-{light,deep}` |
| `campus` | Fractal Campus | `/campus` | `house-campus-{light,deep}` |
| `accelerator` | Fractal Accelerator | `/accelerator` | `house-accelerator-{light,deep}` |
| `school` | Education | *(none — page retired)* | `house-education-{light,deep}` |
| `forum` | Political Club | *(none — page retired)* | `house-political-club-{light,deep}` |
| `library` | Library | `/library` | `house-library-{light,deep}` |

The two houses with no route still carry a live `route` field in `src/data/houses.ts` — it is dead data, kept only so the entries stay uniform. Their tokens are fully live; see [Retired pages, retained tokens](#retired-pages-retained-tokens).

| Token | Hex |
|---|---|
| `house-coliving-light` | `#889460` |
| `house-coliving-deep` | `#4A5528` |
| `house-events-light` | `#D4857A` |
| `house-events-deep` | `#C13B2A` |
| `house-campus-light` | `#2E6B4A` |
| `house-campus-deep` | `#1A3A2E` |
| `house-accelerator-light` | `#8E2A1E` |
| `house-accelerator-deep` | `#641E28` |
| `house-education-light` | `#C41E20` |
| `house-education-deep` | `#5C1010` |
| `house-political-club-light` | `#C83858` |
| `house-political-club-deep` | `#6E1830` |
| `house-library-light` | `#E870A0` |
| `house-library-deep` | `#C44878` |

`HOUSES[id].palette: { light, deep }` in `src/data/houses.ts` is the single source of truth for house color, and each house has exactly two colors — the pair is the unit.

**Renames (v0.3.0).** `house-visit-*` → `house-coliving-*` (the Visit page became Fractal Co-Living; `deep` also moved `#4A5A30` → `#4A5528` to match the map-pin and callout borders the page draws with). `house-publications-*` → `house-library-*` (Publications became the Library). Both are pure renames of a live house — not new houses.

### The Accelerator brand sub-palette

Scoped to `AcceleratorPage.tsx` and nothing else. These are the Fractal Accelerator's own brand values, not Fractal NYC house colors, and they are a **sanctioned exception** to "a house is exactly two colors" — see [The Accelerator is the exception](#the-accelerator-is-the-exception).

| Token | Hex | Role |
|---|---|---|
| `accel-ink` | `#641E28` | Burgundy body/heading text on the page's light panels |
| `accel-cta` | `#9B3741` | Primary CTA fill ("Reserve your spot") |
| `accel-emphasis` | `#8C2D37` | Italic emphasis, eyebrow labels, check-badge fill |
| `accel-cream` | `#F1F0EC` | The warm cream panel (distinct from the site's `background` `#f8f6f0`) |
| `accel-pale` | `#FCEBED` | Pale pink text on the burgundy flood |

Do not reach for these anywhere outside the Accelerator page.

**Scope:** house colors live on their own house's pages. On a house's page, its pair may color display headings, the monogram letter, eyebrows, focus rings, and chrome. Most houses use `{light}` as the page background and `{deep}` as the accent; **Political Club and Education invert** (page background `{deep}`, accent `{light}`). That inversion is now a *latent* rule rather than a live one — both pages are retired, so no code applies it today; it is recorded here so a rebuilt page picks the pair up the same way it did before. Each house's per-page banner SVG (see [Components](#components)) likewise draws from the house pair.

A house whose page is retired still spends its color elsewhere, and those uses are live: the Education pair colors the **FractalU** navbar row and the **Community-run University** node on the home page's `FractalDiagram`; both retired houses (and People) keep a decorative **octahedron face**.

### Non-house section colors

A small category distinct from the six houses: section pages that aren't houses but still carry canonical brand color. They are sourced from the exported `SECTIONS` record in `src/data/houses.ts` (the canonical real-hex home), mirrored by `--color-section-*` tokens in `src/index.css`. A test (`src/__tests__/section-tokens-sync.test.ts`) keeps the two in lockstep, exactly like the house-token check.

**Houses flood; non-house sections read as cream.** A house page is *color-flooded* — its `{light, deep}` pair fills the page background and accents (the saturated brand surface). Non-house sections do not follow that rule: **houses get color-flooded pages; non-house sections read as cream / editorial**, and spend their color on decoration and accents instead of the surface. Both sections now carry a `{light, deep}` pair, so the token names are uniform: `section-{slug}-{light,deep}`.

| Token | Hex | Role |
|---|---|---|
| `section-people-light` | `#C49040` | decorative |
| `section-people-deep` | `#B65D19` | accent — may carry text |
| `section-story-light` | `#D4BA58` | decorative only — **fails WCAG as small text on cream** |
| `section-story-deep` | `#a08a2e` | accent — may carry text |

**Both pairs follow the same rule: `light` decorates, `deep` carries text.** The light value of each pair is a soft gold that does not clear 4.5:1 on cream, so it is confined to large display glyphs, SVG strokes, and low-opacity fills; anything at body or label size takes `deep` (or plain charcoal).

**People** has **no page** — `/people` was retired and 404s (see [Retired pages, retained tokens](#retired-pages-retained-tokens)). The pair survives untouched and fully tokenized: `SECTIONS.people` still feeds the section's decorative **octahedron face**, and the tokens stay under `section-tokens-sync`. When the page existed it read as a **cream page** (`bg-background`, `text-foreground`) with `section-people-deep` as its accent rather than a color flood — that is the shape a rebuilt page should take, and the retained pair means it *could* flood instead without a token change.

**Story no longer has a page.** It folded into Home (`/story` is gone), but it kept its identity color, which now themes the Story *block* on the home page: the "S" sector letter (light gold, large + decorative), the fractal diagram's strokes, and the "Curious about Fractal?" callout — whose label takes the **deep** gold precisely because the light gold would fail contrast at 13px. The deep gold also carries the **Venues** node on the home diagram and the **Merlin's Place** nav row, both of which are venue-flavored and have no house of their own.

### Nav-only colors

| Token | Hex | Role |
|---|---|---|
| `nav-portal` | `#5B4A8A` | "Enter the Fractal" — the member portal |

The portal has no page, so it carries a nav-only identity color rather than a section entry. It is mirrored by `NAV_PORTAL_COLOR` in `src/data/houses.ts`.

**Its navbar row is currently hidden**, pending the portal itself. The row used to render as a permanently-disabled `<span>`; a dead-end menu row is worse than no menu row, so it was removed from the Community group and `MenuRow`'s disabled branch went with it. The token and `NAV_PORTAL_COLOR` are **deliberately retained, currently unreferenced**, so restoring the row when the portal ships needs no new color — just the row and the branch back. This is the one token in the system with no live consumer; that is intentional, not drift.

### Surface + text pairings

Two text colors carry the entire site: charcoal (`text-foreground`) and cream (`text-background`). Which one a surface takes is driven by the surface's **perceived luminance**, not by the `-light` / `-deep` token name. A light fill takes charcoal; a dark or saturated fill takes cream:

| Surface luminance | Text | Examples |
|---|---|---|
| Light (cream + light house fills) | `text-foreground` (charcoal) | `bg-background`, `bg-house-coliving-light`, `bg-house-events-light` |
| Dark / saturated (charcoal + dark/saturated house fills) | `text-background` (cream) | `bg-foreground`, `bg-house-campus-light`, `bg-house-education-deep`, `bg-house-library-light`, `bg-house-political-club-deep`, `bg-house-accelerator-light` |

The token suffix does **not** decide the text color. Campus (`house-campus-light` `#2E6B4A`) and Library (`house-library-light` `#E870A0`) both use a `-light` background token yet still take cream `text-background`, because those fills are dark/saturated enough that charcoal would fail contrast. The luminance of the actual surface decides, not the `-light`/`-deep` label.

Secondary / supporting text uses `text-foreground-muted` (`#525252`).

Set the text color explicitly on the same node as the surface. A nested cream surface inside a house page re-asserts `text-foreground` on the inner surface, so text always pairs with its actual background rather than inheriting from the page cascade.

**Known concern:** the Library page floods `bg-house-library-light` (`#E870A0`, a bright pink) under cream `text-background`. Cream-on-pink is a borderline-contrast pairing worth a revisit.

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
- `md:px-[22%]` — the centered narrow-content desktop gutter: mobile stays `px-6`, then on `md+` a deep percentage inset squeezes a single column of editorial copy to the center of wide viewports.

**On the four banner pages, the percentage gutters are gone.** Campus, Co-Living, Events and Library now take their entire desktop horizontal inset from `.clear-banners` (below). A percentage gutter on top of the clearance would compound into a second inset and squeeze the column to a sliver, so those pages keep only their `px-6` mobile gutter. `px-[4.5%]` / `md:px-[22%]` remain available to any page **without** a pennant layer.

### Banner clearance (`.clear-banners`)

The four sector pages flank their content with a pair of pennant banners in a **`position: fixed`** layer. Fixed elements take part in **no layout**, so without an explicit reservation every section of the page scrolls *underneath* the pennants and overlaps them — and because the layer is fixed, the overlap appears at arbitrary scroll depths, not just in the hero.

`.clear-banners` (defined in `src/index.css`, applied to each of the four pages' content wrapper) reserves the gutters the pennants occupy, so content renders **between** the two banners at every scroll position:

| Breakpoint | Reserved inset per side |
|---|---|
| below `md` | **nothing** — the banner layer is `hidden`, so the 375px baseline keeps its full width |
| `md`+ | `3rem` (`inset-x-12`) + `min(16%, 210px)` + `2rem` gap |
| `lg`+ | `4rem` (`inset-x-16`) + `min(16%, 210px)` + `2rem` gap |

**Invariant — the utility is coupled to the banner layer's own geometry.** The layer is `fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 … hidden md:flex`, each pennant `w-[24%] md:w-[16%] max-w-[210px]`. The utility's three terms are (edge inset) + (pennant width) + (breathing gap), mirroring exactly those values. **If the inset scale, the pennant width, or the `md` visibility breakpoint changes, `.clear-banners` must change in the same commit** — they are two halves of one layout. `src/__tests__/banner-clearance.test.tsx` pins both halves.

Apply it to the page's **content wrapper only**. The Navbar and Footer are chrome and stay full-bleed — an inset footer reads as broken.

### Containers

Choose the narrowest `max-w-*` container that fits the content. On the banner pages the clearance is usually the binding constraint, and the `max-w-*` only re-engages on very wide viewports (e.g. Library's grid keeps `max-w-7xl` so it stops growing past ~1280px once the gutters are paid).

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

**`house-banner-svg`** — the per-page pennant banner. Each surfaced house ships its own baked-art SVG component (`CoLivingBannerSVG`, `EventsBannerSVG`, `CampusBannerSVG`, `LibraryBannerSVG`), rendered as a plain `<img>` of `/images/banners/*-banner.svg`. The pennant shape, the house-colored fill, the Mandelbrot pocket, the arc tagline, and the Jacquard 24 monogram are all baked into the SVG — there is no runtime theming. A house page flanks its content with a pair of its banner (a fixed `hidden md:flex` layer on desktop, clamped above the footer by `useBannerAboveFooter`; hidden entirely below `md`). Because the layer is **fixed**, the page must reserve its gutters explicitly — see [Banner clearance](#banner-clearance-clear-banners), whose geometry mirrors this layer's and must be changed alongside it. The YAML entry encodes the Co-Living pair as a representative example.

Three houses have **no banner component**: **Political Club** (never had one), **Education** (`EducationBannerSVG` was deleted with the page — it had exactly one consumer), and the **Accelerator** (a different brand — no Fractal NYC pennant motif). Note the asymmetry with color: the retired houses keep their *tokens* but not their *banner components*, because a banner is page furniture and a token is identity. Co-Living reuses the existing `visit-banner.svg` art (the file kept its old name through the rename); the Library's `library-banner.svg` is the publications pennant with the monogram changed to "L" and the arc reading LIBRARY.

### Prose-only

- **Navbar** — a sticky bar carrying the Jacquard 24 wordmark (fluid `clamp()`, centered and large on Home; left-aligned and smaller on inner pages) plus a hamburger that opens a 280px dropdown. The dropdown groups destinations under three headings — **Spaces** (Campus, Co-Living, Merlin's Place) / **Education** (Accelerator, FractalU) / **Community** (Events, Library) — each row a Jacquard monogram + mono label behind a 3px left border in that destination's color. It mixes internal routes with external links, so it is **not** derived from `HOUSES` alone; house-backed rows still read their hex from `HOUSES` so the color stays in lockstep with the token. The bar is `sticky` and paints itself with **`--page-bg`**, set per page on `<main>` alongside `--accent` — see below.

  **Every row goes somewhere.** All seven are anchors: five in-SPA `<Link>`s, two `target="_blank"` external links. The Community group used to carry an eighth — "Enter the Fractal", the member portal — with no destination at all, rendered as a disabled `<span>`; it is hidden until the portal ships (see [Nav-only colors](#nav-only-colors)), and `MenuRow`'s disabled branch was deleted along with it. `NavRow` is now a union that makes a destination-less row *unrepresentable*, so restoring the portal row is a deliberate act, not an accident.
- **`--accent` and `--page-bg`** — the two custom properties every page sets on its `<main>`. `--accent` is the page's house/section color, read by the Button and the Emphasis-tier borders. `--page-bg` is the page's surface color, read by the sticky Navbar so the bar reads as part of whatever house surface it sits on. A page that forgets `--page-bg` gets a cream navbar floating on a colored flood — always set both.
- **`FractalPattern`** (`src/components/ui/FractalPattern.tsx`) — the low-opacity Sierpinski-tessellation wallpaper placed as the first child of `<main>` so it sits behind content. Its `color` prop is injected straight into SVG `stroke`/`fill` **presentation attributes**, where `var()` does **not** resolve — so the value must be a **literal hex sourced from the data model** (`HOUSES.find(...).palette.{light|deep}` / `SECTIONS.*`), never a hand-typed hex and never a CSS var. The Accelerator page is the one page with no `FractalPattern`.
- **OctahedronHero** — the homepage 3D scene (Three.js / React Three Fiber): an eight-face octahedron, each face carrying a section photo, with auto-rotation and breathing animations all gated by `usePrefersReducedMotion()`. Keyboard users reach the destination routes via the `.sr-only-focusable` skip-nav — which is the **only** keyboard path into the 3D nav nodes, so it must survive any hero rework. Face order is locked in `src/components/three/OctahedronHero.tsx`. It is lazy-loaded behind `Suspense` to keep the ~900 KB three.js chunk off the entry bundle; do not collapse that into a static import.
- **`FractalDiagram`** (`src/components/sections/FractalDiagram.tsx`) — the home page's pentagon lockup: five labelled nodes orbiting a "Fractal NYC" center. Sized with **CSS container queries** (`container-type: inline-size` + `cqw` units) so the labels scale with the diagram rather than the viewport.

  **Every node wears its own section's color**, read from `HOUSES` / `SECTIONS` (literal hex, never hand-typed and never a `var()` — the `FractalPattern` rule applies: these are SVG presentation attributes and JS string colors).

  | Node | Color | Source |
  |---|---|---|
  | Events | `#D4857A` | `house-events-light` |
  | Community-run University | `#C41E20` | `house-education-light` (house id `school`) |
  | Co-Living | `#889460` | `house-coliving-light` |
  | Fractal AI Accelerator | `#8E2A1E` | `house-accelerator-light` |
  | Venues | `#a08a2e` | `SECTIONS.story.deep` — venue-flavored, no house of its own |

  The geometry (decagon, pentagon, spokes) is drawn in `SECTIONS.story.light` (`#D4BA58`) — decoration only, never text, because the light gold fails contrast at label size.

  The Accelerator node previously took the **Campus** green (`#2E6B4A`) — a slip, since Campus is not a node on this diagram, so the Accelerator was wearing an unrelated house's color for no decodable reason. It now takes its own. This does put two reds down the right-hand side (University above, Accelerator below), which is the collision the original choice was avoiding; they hold up because they are far apart in luminance — 5.5:1 vs 7.8:1 on cream, reading as bright-red vs dark-brick — and never touch. Both clear WCAG AA at the label's 11px floor.
- **`HousingMap`** (`src/components/sections/HousingMap.tsx`) — the Co-Living page's Leaflet map of the seven Fractal houses. Marker chips are raw HTML strings passed to `L.divIcon`, so their colors are literal hex from `HOUSES` (same rule as `FractalPattern`). Below a 500px container width it degrades to dot-only markers with tap-to-open popups, because the always-on chips collide at phone width.
- **`AccelHeroCanvas`** (`src/components/sections/AccelHeroCanvas.tsx`) — the Accelerator hero's canvas backdrop: 250 radial "warp lines" streaming outward from the hero's center over a radial glow. Reduced motion paints a single static frame instead of starting the rAF loop.

### Removed in v0.3.0

- **Hero combobox** and the global search index (`use-global-search.ts`) — the home hero is now the octahedron alone.
- **Archive search + tag filter** (`ArchiveSearch`, `TagFilter`, `ArchiveToolbar`, `use-archive-filter.ts`, `publications-tags.ts`) — the Library filters by **category chips** only.
- **`SierpinskiCarpet`** survives on `/the-protocol`, which remains reachable by direct route but is absent from the navbar.

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
