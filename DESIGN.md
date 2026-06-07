---
version: "0.2.0"
name: "Fractal NYC"
description: "Asimov-Collective editorial aesthetic for fractal-nyc — cream and charcoal, italic Fraunces headings over a JetBrains Mono body, six themed houses each owning a {light, deep} palette pair. Mobile-first 375px baseline; no dark mode."
colors:
  background: "#f8f6f0"
  foreground: "#171717"
  card: "#fbfaf9"
  card-foreground: "#171717"
  popover: "#fbfaf9"
  popover-foreground: "#171717"
  primary: "#171717"
  primary-foreground: "#f8f6f0"
  secondary: "#e8e6e3"
  secondary-foreground: "#171717"
  muted: "#e8e6e3"
  muted-foreground: "#525252"
  accent: "#e5e2dc"
  accent-foreground: "#171717"
  destructive: "#ef4343"
  destructive-foreground: "#f8f6f0"
  border: "#dddad5"
  input: "#dddad5"
  ring: "#171717"
  house-visit-light: "#889460"
  house-visit-deep: "#4A5A30"
  house-events-light: "#D4857A"
  house-events-deep: "#C13B2A"
  house-campus-light: "#2E6B4A"
  house-campus-deep: "#1A3A2E"
  house-education-light: "#B52828"
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
  house-banner:
    backgroundColor: "{colors.house-events-light}"
    textColor: "{colors.house-events-deep}"
    typography: "{typography.font-mono}"
---

# Fractal NYC — Design System

## Overview

Fractal NYC is a six-house editorial site in the Asimov-Collective key: warm cream surface, deep charcoal voice, oversized italic Fraunces headings, monospace body text, Jacquard 24 display accents, and a subtle noise texture on the page background for a tactile, slightly printed feel. The Hogwarts-six-houses framing from the PRD treats each section of the site (Visit, Events, Campus, Education, Political Club, Publications) as a house with its own `{light, deep}` palette pair; the global voice stays charcoal-on-cream and each house tints its own pages from there.

Three deliberate constraints sit at the foundation of this system:

1. **Mobile-first, 375px baseline.** Every page and component is designed at a phone first. Wider viewports are progressive enhancement. The PRD calls this non-negotiable.
2. **No dark mode.** The `.dark` token block was deleted (FRAC-30); we are not planning a dark scheme. Surfaces are always cream, type is always charcoal.
3. **Charcoal-on-cream is the voice, not a brand accent.** `colors.primary` is the dominant text color (`#171717`), not a saturated brand hue. This deliberately trips the `@google/design.md` `missing-primary` lint as a warning — see **Linting Notes**.

The Political Club house is hidden from the OctahedronHero 3D scene, the Navbar, and the banner grid via the `hideFromNavbar` / `hideFromBanners` flags on `houses.ts`. It is reachable by direct route. Vertex 4 of the octahedron — previously a Political Club "Coming Soon" placeholder — is now the Story nav node (FRAC-47).

## Colors

The system declares **31 color tokens**: 19 surface tokens that drive the page chrome and 12 house tokens (6 houses × `{light, deep}`) that theme each house's pages, banner, and avatar.

### Surface palette

| Token | Hex | Source / role |
|---|---|---|
| `background` | `#f8f6f0` | Canonical cream. See *cream-math note* below. |
| `foreground` | `#171717` | Canonical charcoal. Dominant text color. See *charcoal drift note*. |
| `card` | `#fbfaf9` | `--card: 40 25% 98%`. Slightly raised cream for card surfaces. |
| `card-foreground` | `#171717` | |
| `popover` | `#fbfaf9` | Same as `card`. |
| `popover-foreground` | `#171717` | |
| `primary` | `#171717` | Charcoal — see primary-is-charcoal note below. |
| `primary-foreground` | `#f8f6f0` | Cream on charcoal (e.g. inverted button states). |
| `secondary` | `#e8e6e3` | Warm putty, used for muted chrome. |
| `secondary-foreground` | `#171717` | |
| `muted` | `#e8e6e3` | Same as `secondary` — the system has a tight neutral palette. |
| `muted-foreground` | `#525252` | FRAC-33 lifted this to 32% lightness for WCAG AA 4.5:1 against cream (~5.5:1 actual). |
| `accent` | `#e5e2dc` | Slightly warmer neutral for subtle accent fills. |
| `accent-foreground` | `#171717` | |
| `destructive` | `#ef4343` | Tailwind-flavored red for destructive actions. |
| `destructive-foreground` | `#f8f6f0` | |
| `border` | `#dddad5` | Visible-but-soft border for editorial structure. |
| `input` | `#dddad5` | Same as `border`. |
| `ring` | `#171717` | Focus ring is canonical charcoal. |

### House mapping

Each house has both an internal data-model `id` (used in routes and `houses.ts`) and a human-facing `displayName`. **DESIGN.md house tokens use `displayName` slugs**, lowercase and kebab-cased, so an agent reading the spec can map directly from product UI labels back to tokens without consulting the data model:

| Internal ID (`houses.ts`) | Display name | Token slug prefix |
|---|---|---|
| `neighborhood` | Visit | `house-visit-{light,deep}` |
| `events` | Events | `house-events-{light,deep}` |
| `campus` | Campus | `house-campus-{light,deep}` |
| `school` | Education | `house-education-{light,deep}` |
| `forum` | Political Club | `house-political-club-{light,deep}` |
| `lab` | Publications | `house-publications-{light,deep}` |

### House palette values

Verified against `src/data/houses.ts` at HEAD. The `HOUSES[id].palette: { light, deep }` field is the single source of truth for house color; the pre-FRAC-24 single-color `color` field was removed in FRAC-50.

| Token | Hex |
|---|---|
| `house-visit-light` | `#889460` |
| `house-visit-deep` | `#4A5A30` |
| `house-events-light` | `#D4857A` |
| `house-events-deep` | `#C13B2A` |
| `house-campus-light` | `#2E6B4A` |
| `house-campus-deep` | `#1A3A2E` |
| `house-education-light` | `#B52828` |
| `house-education-deep` | `#5C1010` |
| `house-political-club-light` | `#C83858` |
| `house-political-club-deep` | `#6E1830` |
| `house-publications-light` | `#E870A0` |
| `house-publications-deep` | `#C44878` |

### The forum/school page-bg inversion

Most houses use `{light}` as the page background with `{deep}` as the accent for the monogram letter and headings. **Political Club (`forum`) and Education (`school`) invert this**: their page background is `{deep}` and the lighter shade is the accent. The HouseBanner grid does **not** invert (it always uses `{light}` as the banner background); the inversion is a per-page rule applied in `PoliticalClubPage.tsx` and `LiberalArtsPage.tsx`. This is not encoded in the token system — it is a page-level decision.

### Primary is charcoal — not a brand accent

`colors.primary` is `#171717`. This is the dominant text color, not a saturated brand hue. The site's voice is charcoal-on-cream and we treat charcoal as the load-bearing color. We accept the `@google/design.md` `missing-primary` lint warning as deliberate — see **Linting Notes**. Do not introduce a `brand` or `text-default` token to "fix" the warning; the warning is the correct read of an unconventional but intentional choice.

### Lab/Publications uses palette pinks; the old `#6B4C9A` is dead

Lab/Publications (internal id `lab`, displayName `Publications`) has exactly two canonical color tokens — `house-publications-light` (`#E870A0`) and `house-publications-deep` (`#C44878`). The legacy `#6B4C9A` purple was removed from `src/components/lab/*` in FRAC-34 (consumers) and from `src/data/houses.ts` in FRAC-50 (the deprecated `color` field itself). Lab uses its palette pinks for accents; **no third color is canonical**. Do not declare a `house-publications-accent` or `lab-purple` token.

### Charcoal drift note

The canonical charcoal is `#171717` (the `foreground` token). Raw `#1a1a1a` is drift; the four sites that previously used it were normalized to `hsl(var(--foreground))` in FRAC-46. Do not reintroduce raw `#1a1a1a` and do not declare a `charcoal-deep` token to legitimize drift if it appears in future code.

### Cream-math note

The canonical written cream is `#f8f6f0`. The `--background` CSS variable in `src/index.css` is currently `hsl(40 25% 96%)`, which converts to `#f7f6f2`. The two are visually indistinguishable but the math disagrees with the canonical hex by a hair. DESIGN.md emits the human-chosen canonical `#f8f6f0`; a follow-up task will tighten the HSL so the math produces the canonical hex. Do not "fix" this by changing the token value here.

## Typography

Four type families ship; two are declared as tokens (`font-sans`, `font-mono`) and two live in prose because the system does not yet have a codified size/weight scale for them.

- **Inter** (declared `font-sans`). The canonical sans for body and label use. Imported at `src/index.css:1` and assigned to `--font-sans` at `src/index.css:6` (FRAC-44). New designs that reach for `font-sans` get Inter at runtime.
- **JetBrains Mono** (declared `font-mono`). The body family today, and the long-term home for labels, UI chrome, and monospaced metadata. Used by Button via `font-mono uppercase tracking-widest`.
- **Fraunces** (display serif, prose-only). Applied globally to `h1–h6` via `src/index.css:90-94`: `font-style: italic`, `text-transform: uppercase`, `letter-spacing: 0.04em`. The `.display-roman` utility (FRAC-31) opts a heading out of the italic rule when an upright Fraunces is needed. Not modeled as a `typography:` token because design.md's typography schema has no `textTransform` or `fontStyle` fields — italic and uppercase are the load-bearing rules and they live in prose.
- **Jacquard 24** (display script, prose-only). Inline-styled only — used on the Navbar wordmark and the HouseBanner monogram letter. The `[style*="Jacquard"]` rule in `src/index.css:102-105` opts it out of the global uppercase + italic. No size or weight scale is codified; sizing is per-surface via `clamp()` (FRAC-29) or fixed-`px`.

### Global type rules (prose-only, not modelable)

- `body` has `text-transform: uppercase` applied globally (`src/index.css:84`). All body copy renders uppercase by default. Use `normal-case` to opt out for headlines, taglines, and any content where case carries meaning.
- `h1–h6` are italic + uppercase Fraunces with `letter-spacing: 0.04em`. Use `.display-roman` for upright headings.
- `.font-serif` also implies italic + uppercase by rule.
- `[style*="Jacquard"]` opts out of both transforms.

### Why no `headline-lg` / `body-md` tokens?

There is no codified `text-*` scale in the codebase yet. The shipped components each set their own sizes (planner observed `text-sm` 116×, `text-xs` 36×, `text-base` 31× in `src/`). Declaring a fictional scale now would be aspirational rather than descriptive. The two declared `font-sans` / `font-mono` family tokens satisfy `missing-typography` while accurately reflecting today's reality.

## Layout

**Mobile-first, 375px baseline.** This is non-negotiable per the PRD. Every component must read on a phone before any consideration of wider viewports. All breakpoints are additive: write the mobile layout first, then progressively enhance.

### Horizontal padding

- `px-6` is the mobile gutter (~30 sites in `src/`). Use it as the default page edge inset.
- `px-[4.5%]` is the desktop page gutter (~9 sites). Used for full-bleed editorial sections where the breathing room scales with viewport width. Not a token — it is a documented convention.

### Container widths

The codebase uses 11 distinct `max-w-*` values (`max-w-xs` through `max-w-7xl`) plus the arbitrary `max-w-[800px]` and `max-w-[420px]`. There is no canonical container scale yet; consolidation is a follow-up task. Today, choose the narrowest container that fits the content.

### Vertical rhythm

Editorial scale — section spacing climbs steeply from compact surfaces to golden-age section breaks:

- `py-12 md:py-20` — compact section padding (small surfaces, dense lists).
- `py-20 md:py-32` — standard section padding.
- `py-32 md:py-48` — feature section padding.
- `py-40 md:py-60` — golden-age section break (used between major narrative beats).

Mid-range values (`py-14`, `py-16`, `py-24`, etc.) appear ad-hoc and will be consolidated when a canonical vertical-rhythm scale is adopted.

### Spacing inventory

The `spacing:` YAML key inventories the numeric tokens **actually used** in `src/` (`py-*`, `px-*`, `gap-*`, `space-y-*`, `space-x-*`). Values are the Tailwind defaults (one number → `0.25rem`). This is a *descriptive* inventory, not a *prescriptive* scale — a follow-up task will collapse the mid-range ad-hoc values into a canonical scale.

## Elevation & Depth

The system is **near-flat**. There are no shadow tokens, no elevation system, no surface-tonal-layer scale. Visual hierarchy is conveyed by typography (oversized italic Fraunces vs. uppercase monospace body), color contrast (charcoal on cream, house deep on house light), and editorial whitespace.

A few touches add tactility without depth:

- **Body noise.** The `body` background carries an inline `data:image/svg+xml,...` `feTurbulence` filter at opacity `0.03` (`src/index.css:86`). It is too subtle to read as "texture"; it reads as the absence of digital flatness. Not a token.
- **`.hero-text-shadow`.** A two-layer cream-on-cream text shadow utility (`src/index.css:123-125`) used to lift hero text over photographic backgrounds. Not a token.
- **Replit `hover-elevate` / `active-elevate-2` were removed** pre-FRAC-27. Do not reintroduce them.

The only true "depth" surface is the OctahedronHero 3D scene (Three.js / R3F). It is a scene, not a token — see **Components**.

## Shapes

The shape language is **editorially square** with a small soft-corner radius for interactive elements. Two custom motifs add identity: the **Mandelbrot corner** on Button and the **pennant clip-path** on HouseBanner.

### Rounded scale

Declared in YAML (`rounded.{sm,md,lg,xl}`). Sourced from `src/index.css:38-41`:

| Token | Value |
|---|---|
| `rounded.sm` | `0.25rem` |
| `rounded.md` | `0.5rem` |
| `rounded.lg` | `0.75rem` |
| `rounded.xl` | `1rem` |

No `rounded.full` is declared — pill / circular shapes are handled with Tailwind's `rounded-full` utility on a per-use basis (avatar badges).

### Mandelbrot corner motif (Button `default`)

The Button `default` variant places four `MandelbrotIcon` glyphs at `4px` insets from each corner, sized `20px`, opacity `0.2`, rotated to face the container center (`src/components/ui/button.tsx:99-147`). This is the brand shape signature for primary CTAs. It is not modelable in the `components:` schema (no decorative-glyph slot exists), so it lives in prose. Outline / ghost / link variants and the `sm` / `icon` sizes skip the corners.

### Pennant clip-path (HouseBanner)

HouseBanner uses a CSS clip-path V-notch shape — `polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)` (`src/components/house/HouseBanner.tsx:110-111`). The result reads as a downward-pointing pennant. A second MandelbrotIcon sits outside the clip-path centered at the V-notch tip on the cream page background. Not a token; lives in prose.

### Octahedron geometry (prose, for traceability only)

OctahedronHero renders an 8-face octahedron with each face mapped to one section of the site. The face order is locked at `campus, events, lab, school, neighborhood, people, forum, story` (`src/components/three/OctahedronHero.tsx:410-419`). This is presentation logic, not a token — recorded here so future agents do not re-derive it.

## Components

Five components are modeled in the `components:` YAML block. Four more are documented in prose only because they exceed design.md's closed component property set.

### YAML-modeled

**`button-default`** — bordered, translucent surface. Default size is `px-8 py-5 text-sm` (`1.25rem 2rem` padding, body text size). Carries the four Mandelbrot corners (prose-only — no decorative-glyph slot in the spec). Border: `border-foreground/20` (prose-only — no `border` slot). Hover: `bg-foreground/10`. Focus-visible: `ring-2 ring-foreground ring-offset-2 ring-offset-background` (prose-only — no focus slot). The `backgroundColor` token reference points at `{colors.foreground}` to indicate "charcoal-tinted translucent surface"; the actual rendered fill is `bg-foreground/[0.03]`, which the spec cannot model. Smaller (`sm`) and icon sizes skip the corners because they look crowded at compact padding.

**`button-outline`** — same `1.25rem 2rem` padding, transparent background, `border border-current`, no Mandelbrot corners, `hover:bg-foreground/5`. For secondary or compact uses.

**`button-ghost`** — no chrome, no background, no border. Hover affords interaction via `hover:underline underline-offset-4`. Used for tertiary actions.

**`button-link`** — inline text-action style for sitting inside prose. The compound variant in `buttonVariants` strips padding to `px-0 py-0` regardless of size. `underline underline-offset-4`, `hover:text-foreground/80`.

**`house-banner`** — the pennant-shaped V-notch card used in the 6-house grid (`variant="grid"`, `aspect-[1/3]`) and on individual house pages (`variant="full"`, `aspect-[3/4] max-w-2xl mx-auto`). The YAML entry encodes a representative pairing — `house-events-light` / `house-events-deep` — because design.md cannot express "the background and text color are swapped per house at runtime." The actual `bgColor` is `house.palette.light` and `letterColor` is `house.palette.deep`, both read directly from the House passed in (`HouseBanner.tsx`). The banner overlay opacity is `0.45` for most houses and `0.30` for `school` so the red letters stay readable over the Liberal Arts photo. An `isDark()` luminance helper drives the body text color; this is not modelable. The monogram letter (Jacquard 24, inline-styled) is per-house: `N E C LA PC L`.

### Prose-only

- **AvatarBadge** — small circular identity chip for a person, themed by their associated house palette. Not modeled because its surface area is small and its theming runs through the house palette tokens via the data model rather than via design tokens directly.
- **Navbar wordmark** — Jacquard 24 inline-style, sized via `clamp()` for fluid responsiveness (FRAC-29). Sizing exceeds the closed property set; not modeled.
- **Hero combobox** — the search/filter combobox on the homepage hero. FRAC-33 ironed out combobox/listbox a11y semantics. Behavior dominates; not modeled.
- **OctahedronHero** — the 3D octahedron scene at the homepage hero. Three.js / R3F with eight triangular faces, each carrying a section photo on a plain `MeshBasicMaterial` with `tex.colorSpace = THREE.SRGBColorSpace` for correct gamma (locked decision #7). Auto-rotation, edge-text scrolling textures, center-scale breathing, and node-scale pulses are all gated by `usePrefersReducedMotion()` (FRAC-28). Keyboard skip-nav is provided via the `.sr-only-focusable` utility (FRAC-33) so keyboard users can reach the destination routes without depending on 3D pointer events. Vertex 4 is the Story nav node (FRAC-47, replaces the FRAC-36 Political Club "Coming Soon" placeholder); Political Club remains hidden from the Navbar and banner grid and is reachable only by direct route. Motion, shaders, materials, and the face order are not tokens — they are code.

## Do's and Don'ts

**Do:**

- Design for the 375px mobile baseline first. Every component must read on a phone before any wider-viewport consideration. The PRD says mobile-first is non-negotiable; the system enforces it.
- Use Fraunces for headings (via the global `h1–h6` italic + uppercase rule), JetBrains Mono (`font-mono`) for labels and chrome, and Inter (`font-sans`) for body copy where the design calls for sans rather than mono.
- Reach for semantic surface tokens (`background`, `foreground`, `card`, `border`, `muted`, `accent`) rather than raw hex values.
- Use house palette tokens (`house-{display-slug}-{light|deep}`) inside that house's scope. Theme banners, avatars, and per-house chrome from the matching house's pair.
- Respect the global uppercase + italic-Fraunces rule. If a heading needs Roman (upright), reach for `.display-roman`. If a block needs mixed-case, use `normal-case`.
- Honor `prefers-reduced-motion`. Every new animation must check `usePrefersReducedMotion()` (the project-wide hook from FRAC-28) or be CSS-gated by `@media (prefers-reduced-motion: reduce)`.

**Don't:**

- Don't assume dark mode is present or coming. The `.dark` token block was deleted (FRAC-30); DESIGN.md declares no dark tokens.
- Don't use raw `#1a1a1a`. That is charcoal drift; the canonical charcoal is `colors.foreground` = `#171717`.
- Don't use raw `#6B4C9A`. That is dead Lab/Publications legacy from pre-FRAC-24. Lab/Publications uses its palette pinks (`house-publications-{light,deep}`).
- Don't introduce house-accent tokens without adding them here first. House palettes are pairs — adding a third color requires a system-wide reason.
- Don't promote a house color to a global accent. House colors are scoped to their house.
- Don't apply `primary` as a saturated brand hue. Fractal NYC's primary is editorial charcoal by deliberate decision (`missing-primary` lint warning is accepted).
- Don't add motion, shadow, or gradient tokens. The spec does not model them; they live in prose and code.

## Linting Notes

Pinned lint command: `npx @google/design.md@0.2.0 lint DESIGN.md`. Future spec bumps are deliberate, separate tasks — `0.2.0` is alpha-stage and breaking changes can land upstream, so pinning prevents surprise CI failures.

**Front-matter `version` value.** The spec README shows `version: alpha` in examples, but the CLI also accepts a quoted SemVer-style string. This document emits `version: "0.2.0"` to match the pinned CLI version; if a future CLI rejects this we will switch to `"alpha"` and document the change here.

### Lint output as of this revision

`0 errors, 27 warnings, 1 info`.

- **Errors:** zero. `broken-ref` does not fire — all `{colors.*}` / `{rounded.*}` / `{typography.*}` references resolve.
- **Warnings, accepted (do not "fix"):**
  - **2 contrast warnings.**
    - `components.button-default` — `textColor` and `backgroundColor` both resolve to `{colors.foreground}` (charcoal/charcoal, 1.00:1). The real render is `bg-foreground/[0.03]` (3% translucent charcoal over cream) with `text-foreground` on top — high contrast in practice. The spec cannot model the alpha channel, so the lint sees charcoal-on-charcoal.
    - `components.house-banner` — representative pair `house-events-light` over `house-events-deep` is 1.89:1. The monogram letter (`#c13b2a` on `#d4857a`) is decorative Jacquard 24 with `aria-hidden`; the visible tagline uses a luminance-derived `isDark()` text color that the spec cannot trace.
  - **25 `orphaned-tokens` warnings.** Surface tokens that don't appear in any `components:` entry (`card`, `popover`, the matched `*-foreground` tokens, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, etc.) and 10 of the 12 house tokens (only `house-events-{light,deep}` are referenced, by the representative `house-banner` entry). Acceptable because:
    - Surface tokens are consumed by raw Tailwind utilities (`bg-card`, `text-muted-foreground`, etc.) and global CSS in `src/index.css`, not by modeled components.
    - House tokens are runtime-swapped per house via `house.palette.{light,deep}` (`HouseBanner.tsx`); static analysis cannot trace the reference. The **Colors** mapping table is the human-readable trace.
- **Info:** `token-summary` reports `31 colors, 2 typography scales, 4 rounding levels, 19 spacing tokens, 5 components` — matches intent.

The `missing-primary` warning anticipated by the plan does **not** fire — the lint validates that a `primary` token exists, not that it carries a saturated brand hue. The charcoal-as-primary decision still stands for the system (see **Colors**), but it does not produce a lint warning. Documented here so future readers don't expect one.

### Accepted divergences from shipped code (documented for the next agent)

1. `colors.background = "#f8f6f0"` (canonical written cream) — current CSS `hsl(40 25% 96%)` computes to `#f7f6f2`. Follow-up task: tighten the HSL math so it produces `#f8f6f0`.
