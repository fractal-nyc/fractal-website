# FRAC-19: Author DESIGN.md — single source of truth for Fractal NYC visual identity

> Plan written 2026-06-05 by `agent:claude-opus-4-7-planner`. Replaces the prior scaffold (which predated the 8 locked decisions from the decisions doc). Authoritative inputs read in order:
> 1. `.lattice/notes/FRAC-19-design-decisions-20260605.md` (8 decisions — primary input)
> 2. `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md` (FRAC-23 gap analysis)
> 3. `/Users/fractalos/Dev/fractal-nyc/.lattice/notes/handoff-2026-06-05-design-md.md` (10 locked handoff decisions; in main `.lattice/` not worktree)
> 4. `.lattice/notes/FRAC-21-team-review-20260605-1551.md` (audit synthesis)
> 5. `.lattice/plans/FRAC-22.md` (PRD — mobile-first 375px is non-negotiable)
> 6. `https://github.com/google-labs-code/design.md` (spec — confirmed top-level keys, closed component property set, typography object fields, canonical section order, 9 lint rules)
> 7. `src/index.css`, `src/data/houses.ts`, `src/components/ui/button.tsx`, `src/components/house/HouseBanner.tsx`, `src/components/layout/Navbar.tsx`, `src/components/three/OctahedronHero.tsx`, `src/hooks/usePrefersReducedMotion.ts` (HEAD values)
> 8. v0 draft at `../agent-a3a9810eccf8190d6/DESIGN.md` is **reference only** — handoff explicitly: "The decisions above supersede whatever's in that draft." Impl authors a fresh `DESIGN.md` at repo root.

## Goal

Author a single new file `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` at the repo root, conforming to `@google/design.md` v0.2.0. It is the **only** file modified by this task — no `src/` edits, no `package.json` script (deferred). The file is the normative source of truth for color tokens, typography, radii, spacing, and the modeled components (Button × 4 variants + HouseBanner). Everything design.md cannot model (motion, shaders, noise textures, gradients, decorative chrome, per-route inversion, hidden-route logic, text-transform) lives in prose. Lint must pass with zero errors; the `missing-primary` warning is **expected and accepted** (decisions-doc #2).

## The 8 decisions from the decisions doc (restated inline — DO NOT re-debate)

1. **Two typography tokens.** Declare `font-sans: { fontFamily: "Inter, system-ui, sans-serif" }` and `font-mono: { fontFamily: "JetBrains Mono, monospace" }`. Inter is *declared, not yet implemented*. Prose under **Typography** must say: "the codebase currently has `--font-sans` = JetBrains Mono as a known short-term artifact of pre-DESIGN.md; the canonical token is Inter and a cleanup task (FRAC-XX) will land it." → lands in YAML `typography:` + **Typography** prose.
2. **Primary = charcoal `#171717`.** Declare `colors.primary: "#171717"`. Accept the `missing-primary` lint warning. Prose under **Colors** must explicitly say: "`primary` is the dominant text color (charcoal), not a brand accent. The site's voice is charcoal-on-cream; we accept the design.md `missing-primary` warning as deliberate." Do NOT introduce `brand` or `text-default`. → YAML `colors.primary` + **Colors** prose + **Linting Notes** prose.
3. **Spacing: inventory now, simplify later.** Declare *only the actually-used* spacing values in `spacing:`. Do NOT invent a clean scale. Impl agent must grep `py-*` / `px-*` / `gap-*` / `space-y-*` across `src/`. (Pre-grepped sample: `py-{0,1,2,3,4,5,6,8,10,12,14,16,20,24,32,40,48,60}`, `gap-{1,2,3,4,5,6,7,8,10,12,16,24}`, `px-{0,1,2,3,4,6,8,10}` + arbitrary `px-[4.5%]`. Impl must verify and emit a `spacing:` map mirroring the Tailwind default rem values for each used number.) Prose under **Layout** notes that mid-values are ad-hoc and will be migrated. → YAML `spacing:` + **Layout** prose.
4. **Components: Button (4 variants) + HouseBanner.** Declare YAML entries `button-default`, `button-outline`, `button-ghost`, `button-link`, `house-banner`. AvatarBadge, Navbar wordmark, Hero combobox, OctahedronHero get prose-only mentions under **Components**. → YAML `components:` + **Components** prose.
5. **House tokens use displayName slugs.** Token naming `house-{displayname-slug}-{light|deep}`, lowercase, kebab-case. Slug map (lock these into a prose mapping table in **Colors**):
   - `neighborhood` → `Visit` → `house-visit-{light,deep}`
   - `events` → `Events` → `house-events-{light,deep}`
   - `campus` → `Campus` → `house-campus-{light,deep}`
   - `school` → `Education` → `house-education-{light,deep}`
   - `forum` → `Political Club` → `house-political-club-{light,deep}`
   - `lab` → `Publications` → `house-publications-{light,deep}`

   **Token values: use `src/data/houses.ts` HEAD, NOT the decisions-doc § 5 table** (those values were stale at write-time). HEAD palette values (verified by planner against `c07192f`):

   | Token | Hex (HEAD) |
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

   Impl agent: **re-verify against `src/data/houses.ts` at HEAD before writing** — palettes can shift fast. Prose explains the forum/school page-bg inversion rule. → YAML `colors:` (12 tokens) + **Colors** prose.
6. **Canonical charcoal `#171717`.** Declare `colors.foreground: "#171717"`. Do NOT declare a separate `charcoal-deep`. The 4 raw `#1a1a1a` sites are drift (follow-up task). → YAML `colors.foreground` + **Linting Notes** prose noting drift.
7. **Lab purple `#6B4C9A` is dead.** Do NOT declare a `house-publications-accent` or `lab-purple` token. Lab/Publications has exactly two tokens (`house-publications-light` and `house-publications-deep`). Prose mentions: "Lab/Publications uses its palette pinks for accents; no third color is canonical." → **Colors** prose (no YAML).
8. **Pin `@google/design.md@0.2.0`.** Lint command: `npx @google/design.md@0.2.0 lint DESIGN.md`. → YAML front-matter `version: "0.2.0"` (or `"alpha"` per spec — see open question below); prose under **Linting Notes** documents the pinned lint command.

## The 10 locked handoff decisions (terse restatement — still apply)

1. **Cream `#f8f6f0` is canonical.** Despite `--background` HSL `40 25% 96%` computing to `#f7f6f2`, DESIGN.md emits `#f8f6f0` (the human-chosen canonical; the HSL math will be tightened in a follow-up — gap analysis § 6). Locked.
2. **House palette SoT:** `HOUSES[id].palette: { light, deep }` in `src/data/houses.ts`. Page-bg literals (`Campus.tsx:8` etc.) are canonical and left alone.
3. **Dark mode: not planned.** `.dark` token block deleted. DESIGN.md MUST NOT declare dark tokens.
4. **Button:** minimal shipped `Button` with Mandelbrot corners on `default` variant only. CTAs migrated; inline text-flow links stay raw.
5. **Octahedron Political Club:** visible as "Coming Soon" at vertex 4. Navbar still hides Political Club.
6. **Octahedron face order:** `campus, events, lab, school, neighborhood, people, forum, story`. Prose only — NOT a token.
7. **Octahedron photo rendering:** `MeshBasicMaterial` + `tex.colorSpace = SRGBColorSpace`. No shader overlay. Not a DESIGN.md concern.
8. **Mobile-first 375px baseline:** non-negotiable per PRD. Called out in **Layout** and **Do's and Don'ts**.
9. **Motion:** `prefers-reduced-motion` honored sitewide via `src/hooks/usePrefersReducedMotion.ts`. Documented in **Do's and Don'ts** + **Components** prose (motion not modeled by spec).
10. **`--font-sans` and `--font-mono` were both JetBrains Mono in code** at handoff time. The decisions doc resolves this: Inter is canonical for `font-sans`, JetBrains Mono for `font-mono`. Decision #10 is now **closed** by decisions-doc #1.

## DESIGN.md structure (canonical section order)

Front-matter YAML, then prose sections in this order:

1. **(YAML front-matter)** — `version`, `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`.
2. **## Overview** — 4–6 sentences. Asimov-Collective editorial aesthetic. Hogwarts-six-houses framing per PRD. Cream + charcoal + Fraunces uppercase-italic + JetBrains Mono body + subtle noise. Three deliberate constraints called out: (a) mobile-first 375px baseline, (b) no dark mode, (c) charcoal-on-cream is the dominant voice (we accept design.md's `missing-primary` lint warning).
3. **## Colors** — surface palette table (19 tokens). House mapping table (6 rows: Internal ID | Display name | Token slug). House values table (12 rows: token → hex). Forum/school page-bg inversion paragraph. Primary-is-charcoal paragraph (decision #2). Lab pinks paragraph (decision #7). Charcoal-drift note. Cream-math note.
4. **## Typography** — three families inventoried: Inter (declared, not yet implemented), JetBrains Mono (body and mono — same family for both, intentionally), Fraunces (display headings — italic uppercase by default, `.display-roman` opts out), Jacquard 24 (inline-only display script — Navbar wordmark, HouseBanner monogram). Global rules: body `text-transform: uppercase`, `h1–h6` italic + uppercase + `letter-spacing: 0.04em`. Italic/uppercase live in prose because typography objects have no `textTransform` or `fontStyle` fields.
5. **## Layout** — mobile-first 375px baseline (non-negotiable). Horizontal padding inventory (`px-6` mobile, `px-[4.5%]` desktop). `max-w-*` container drift (11 distinct values). Vertical rhythm (editorial scale). Reference `spacing:` YAML key as inventory.
6. **## Elevation & Depth** — near-flat system, no shadow tokens. Body noise SVG (inline `feTurbulence` at opacity 0.03). `.hero-text-shadow` utility. Replit `hover-elevate` removed pre-FRAC-27. Only "depth" is the OctahedronHero 3D scene (a scene, not a token).
7. **## Shapes** — Rounded scale (declared in YAML). Mandelbrot corner motif on Button `default` (`button.tsx:99-147`, prose only). Pennant clip-path on HouseBanner (`HouseBanner.tsx:110-111`, prose only). Octahedron geometry + face order (prose only for traceability).
8. **## Components** — YAML-modeled (5 entries): `button-default`, `button-outline`, `button-ghost`, `button-link`, `house-banner`. Prose-only: AvatarBadge, Navbar wordmark, Hero combobox, OctahedronHero.
9. **## Do's and Don'ts** — bullet list (content below).
10. **## Linting Notes** *(closing prose paragraph documenting accepted warnings; kept after canonical sections — should not trigger `section-order`).*

## Token enumeration

### `colors:` (~31 entries)

Surface tokens (values verified against `src/index.css` HEAD `:root` block):

| Token | Value | Source |
|---|---|---|
| `background` | `#f8f6f0` | Locked decision #1 (handoff). Canonical cream. HSL `40 25% 96%` computes to `#f7f6f2` but canonical written value is `#f8f6f0`. |
| `foreground` | `#171717` | `--foreground: 0 0% 9%`. Decisions #2 + #6. |
| `card` | `#fbfaf9` | `--card: 40 25% 98%`. |
| `card-foreground` | `#171717` | `--card-foreground: 0 0% 9%`. |
| `popover` | `#fbfaf9` | `--popover: 40 25% 98%`. |
| `popover-foreground` | `#171717` | `--popover-foreground: 0 0% 9%`. |
| `primary` | `#171717` | Decision #2. |
| `primary-foreground` | `#f8f6f0` | `--primary-foreground: 40 25% 96%`. |
| `secondary` | `#e8e6e3` | `--secondary: 40 10% 90%`. |
| `secondary-foreground` | `#171717` | `--secondary-foreground: 0 0% 9%`. |
| `muted` | `#e8e6e3` | `--muted: 40 10% 90%`. |
| `muted-foreground` | `#525252` | `--muted-foreground: 0 0% 32%` (FRAC-33 AA-conformant). |
| `accent` | `#e3dfd6` | `--accent: 40 15% 88%`. |
| `accent-foreground` | `#171717` | `--accent-foreground: 0 0% 9%`. |
| `destructive` | `#ef4444` | `--destructive: 0 84% 60%` ≈ `#ef4444`. Impl: verify exact hex. |
| `destructive-foreground` | `#f8f6f0` | `--destructive-foreground: 40 25% 96%`. |
| `border` | `#dddad5` | `--border: 40 10% 85%`. |
| `input` | `#dddad5` | `--input: 40 10% 85%`. |
| `ring` | `#171717` | `--ring: 0 0% 9%`. |

House tokens (12 entries; values from `houses.ts` HEAD — impl must re-verify):

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

(Total: 19 surface + 12 house = **31 color tokens**.)

### `typography:` (2 entries — minimal, per decisions)

```yaml
font-sans:
  fontFamily: "Inter, system-ui, sans-serif"
font-mono:
  fontFamily: "JetBrains Mono, monospace"
```

**Do NOT declare** explicit `fontSize` / `fontWeight` / `lineHeight` typography tokens for h1–h3, body-mono, etc. — no codified scale exists yet. Type sizing lives in prose under **Typography** with reference to most-used shipped sizes (the planner observed `text-sm` 116×, `text-xs` 36×, `text-base` 31× via grep). Fraunces display and Jacquard 24 wordmark documented in prose since they're applied via global CSS + inline-style respectively, not Tailwind utilities. This keeps `missing-typography` clean (≥1 typography token).

### `rounded:` (4 entries — from `index.css:38-41`)

```yaml
rounded:
  sm: "0.25rem"   # --radius-sm
  md: "0.5rem"    # --radius-md
  lg: "0.75rem"   # --radius-lg
  xl: "1rem"      # --radius-xl
```

No `full: 9999px` — not declared in `index.css`. Prose notes Tailwind utilities cover any usage.

### `spacing:` (inventory — impl must grep and confirm)

Pre-grepped by planner (numbers used in `py-*` / `gap-*` / `space-y-*`): `0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 60`. Impl emits Tailwind default rem values for each (`1` = `0.25rem`, ..., `60` = `15rem`). Keep Tailwind's numeric keys (`"1"`, `"2"`, … `"60"`). **Do not** invent semantic names — decision #3 forbids inventing a scale. Prose under **Layout** says: "values are the actually-used Tailwind defaults; a follow-up task will collapse the mid-range ad-hoc values."

### `components:` (5 entries)

All values from `src/components/ui/button.tsx` cva config and `src/components/house/HouseBanner.tsx` inline styles.

```yaml
components:
  button-default:
    backgroundColor: "{colors.foreground}"   # bg-foreground/[0.03] translucent — prose explains
    textColor: "{colors.foreground}"          # text-foreground
    rounded: "{rounded.md}"                   # rounded-md
    padding: "1.25rem 2rem"                   # px-8 py-5 (default size)
    typography: "{typography.font-mono}"      # font-mono uppercase tracking-widest
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
    # No padding (compound variant px-0 py-0 across all sizes)
  house-banner:
    backgroundColor: "{colors.house-events-light}"   # representative; runtime swaps per house
    textColor: "{colors.house-events-deep}"
    typography: "{typography.font-mono}"
```

**Prose-only specifics** (cannot fit in YAML — closed property set excludes these):
- Button `default` decorative chrome: four Mandelbrot corners at 4px insets, 20px size, opacity 0.2, rotated to face center.
- Button border (`border border-foreground/20` on default; `border border-current` on outline). No `border` slot in spec.
- Button hover states (`hover:bg-foreground/10` default; `hover:bg-foreground/5` outline; `hover:underline` ghost). No hover slot.
- Button `focus-visible:ring-2 focus-visible:ring-foreground` — focus state not in spec.
- Button compound variant: `link` strips padding to 0 across all sizes.
- Button sizes: `default` (`px-8 py-5 text-sm`), `sm` (`px-4 py-2 text-xs`), `lg` (`px-10 py-6 text-base`), `icon` (`h-9 w-9 p-0`). YAML encodes `default`; other sizes in prose.
- HouseBanner clip-path V-notch (Shapes section).
- HouseBanner per-house monogram letters (Jacquard 24 inline-style).
- HouseBanner overlay opacity (`0.30` for school, `0.45` default).
- HouseBanner `isDark()` luminance helper drives text color — not modelable.
- HouseBanner forum/school page-bg inversion (Colors section).

## Prose section content guidance

### Overview
Hogwarts-six-houses framing per PRD § Look & Feel. Aesthetic name: "Asimov Collective". Warm cream surface, deep charcoal voice, oversized italic Fraunces headings, monospace body, Jacquard display accents, subtle noise texture. Three deliberate constraints: (a) mobile-first 375px baseline, (b) no dark mode, (c) charcoal-on-cream voice (accept `missing-primary` lint warning). Six visible houses; each has `{light, deep}` palette pair; Political Club hidden from navbar+banner grid but accessible via direct route.

### Colors
Surface palette table (19 surface tokens). House mapping table (6 rows). House values table (12 rows). Forum/school page-bg inversion paragraph: "Most houses use `{light}` as page bg with `{deep}` as accent. **Political Club (forum) and Education (school) invert this** — their page bg is `{deep}`, the lighter color is the accent. This is a page-level rule, not encoded in the token system." Primary-is-charcoal paragraph (decision #2 language). Lab pinks paragraph (decision #7). Charcoal-drift note ("4 sites use `#1a1a1a` (drift); canonical is `#171717`. Follow-up task FRAC-XX normalizes."). Cream-math note ("Canonical cream is `#f8f6f0`. Current `--background` HSL `40 25% 96%` computes to `#f7f6f2`; HSL will be tightened in a follow-up so the math produces the canonical hex.").

### Typography
Four families: Inter (declared, not yet implemented — follow-up task FRAC-XX adds Google Font import + swaps `--font-sans`), JetBrains Mono (currently the body family; will become labels/UI chrome only post-Inter migration), Fraunces (display headings, applied to `h1–h6` globally via `index.css:90-94` — italic + uppercase + `letter-spacing: 0.04em`; `.display-roman` opts out — not a YAML token because no canonical size/weight scale yet), Jacquard 24 (applied via inline `style={{ fontFamily: "'Jacquard 24', system-ui" }}` only — Navbar wordmark, HouseBanner monogram; opts out of global uppercase + italic via `[style*="Jacquard"]` rule; prose-only). Global rules: body `text-transform: uppercase`; `h1–h6` italic + uppercase + `letter-spacing: 0.04em`. design.md typography objects have no `textTransform` or `fontStyle: italic` fields — these live in prose.

### Layout
**Mobile-first 375px baseline (non-negotiable per PRD).** All breakpoints add to mobile. Desktop is the progressive enhancement. Horizontal padding: `px-6` is the mobile gutter (~30 sites); `px-[4.5%]` is the desktop page gutter (~9 sites). Documented as convention, not a token. `max-w-*` container drift: 11 distinct values used across pages, plus arbitrary `[800px]` / `[420px]`. No canonical scale. Flag follow-up for consolidation. Vertical rhythm: editorial scale. Sections separate via `py-12 md:py-20` (smaller surfaces) to `py-40 md:py-60` (golden-age section breaks). Mid-range values ad-hoc. Reference `spacing:` YAML key as inventory per decision #3.

### Elevation & Depth
Near-flat system. No shadow tokens declared. Body noise texture: inline `data:image/svg+xml,…` `feTurbulence` filter at opacity 0.03 on `body` (`index.css:86`). Tactile premium feel; not a token. `.hero-text-shadow` (`index.css:124`): two-layer cream-on-cream text shadow over hero photos. Replit `hover-elevate` / `active-elevate-2` removed pre-FRAC-27. Only "depth" is the OctahedronHero 3D scene — a scene, not a token. Documented under **Components**.

### Shapes
Rounded scale: `0.25 / 0.5 / 0.75 / 1rem` (declared in `rounded:`). **Mandelbrot corner motif** on Button `default`: four 20px Mandelbrot icons at 4px insets, opacity 0.2, rotated to face center. Brand shape signature. `button.tsx:99-147`. Not modeled in YAML. **Pennant clip-path** on HouseBanner: `polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)` V-notch shape (`HouseBanner.tsx:110-111`). Not modeled. **Octahedron geometry:** 8 triangular faces. Face order: `campus, events, lab, school, neighborhood, people, forum, story` (`OctahedronHero.tsx:404-413`). Presentation logic, NOT a token. Documented for traceability only.

### Components

YAML entries (5):
- `button-default` — bordered, translucent surface. Default size `px-8 py-5 text-sm`. Mandelbrot corners (prose). `focus-visible:ring-2 ring-foreground ring-offset-2` (prose).
- `button-outline` — same border, no corners. For secondary/compact uses.
- `button-ghost` — no chrome. Hover underline for affordance.
- `button-link` — inline text-action style. Strips padding to 0 across all sizes (compound variant).
- `house-banner` — pennant-shaped V-notch card. Per-house theming via runtime token swap. YAML entry encodes grid-default pairing (representative: `house-events-light` / `house-events-deep`); runtime swap documented in prose.

Prose-only mentions (~3–4 sentences each):
- **AvatarBadge** — small house identity chip. Themed via house palette tokens. Not modeled as YAML entry due to small surface area.
- **Navbar wordmark** — Jacquard 24 inline-style. Responsive via `clamp()` per FRAC-29. Not modeled (font + sizing exceed closed property set).
- **Hero combobox** — combobox/listbox semantics per FRAC-33 a11y pass. Not modeled.
- **OctahedronHero** — Three.js / R3F 3D scene. 8 triangular faces, plain `MeshBasicMaterial` + `tex.colorSpace = THREE.SRGBColorSpace` (handoff #7). Auto-rotation, scrolling edge-text textures, scale-breathing, node scale-pulse — all gated by `usePrefersReducedMotion` (FRAC-28). Keyboard skip-nav via `.sr-only-focusable` (FRAC-33). Face order locked but cheap to tweak (handoff #6). NOT a token.

### Do's and Don'ts

**Do:**
- Design for 375px first. Every component must read on a phone before considering wider layouts.
- Use Fraunces (`font-serif`, applied via `h1–h6` globally) for headings and JetBrains Mono (currently `font-sans` / `font-mono`) for body and labels. Migrate to Inter for body when FRAC-XX lands.
- Use semantic surface tokens (`background`, `foreground`, `card`, `border`, `muted`) rather than raw hex.
- Reach for house palette tokens (`house-{display-slug}-{light|deep}`) inside that house's scope. Don't promote a house color to a global accent.
- Respect the global uppercase + italic-Fraunces convention. If a heading needs Roman (upright), use `.display-roman`. If a block needs mixed-case, use `normal-case`.
- Honor `prefers-reduced-motion`: every new animation must check `usePrefersReducedMotion()` or be CSS-gated by `@media (prefers-reduced-motion: reduce)`.

**Don't:**
- Don't assume dark mode is active or will be added. No dark tokens; `.dark` was deleted (FRAC-30).
- Don't use raw `#1a1a1a` — that's drift. Use `colors.foreground` (`#171717`).
- Don't use raw `#6B4C9A` — that's dead legacy. Lab/Publications uses its palette pinks (`house-publications-{light,deep}`).
- Don't introduce new house-accent tokens without adding them here first.
- Don't apply `primary` as a saturated brand hue — Fractal NYC's primary is editorial charcoal by deliberate decision.
- Don't add motion/shadow/gradient tokens — design.md doesn't model them; they live in prose and code.

### Linting Notes (closing paragraph)

Pinned lint command: `npx @google/design.md@0.2.0 lint DESIGN.md`. Expected output:
- **Errors:** zero. `broken-ref` must not fire — fix immediately if it does.
- **Warnings expected (accepted):** `missing-primary` (charcoal-as-primary deliberate, see Colors). `contrast-ratio` may fire on house pair combinations below WCAG AA 4.5:1 — accepted as decorative house surfaces; document any specific findings.
- **Warnings to actively fix:** `orphaned-tokens` if any declared color isn't referenced by a component entry. Likely candidates: `card`, `popover`, surface-pair foregrounds, possibly house tokens not directly referenced by the `house-banner` representative entry. Strategy: `house-banner` references `house-events-{light,deep}` as representative; other 10 house tokens referenced indirectly (prose mapping table). If `orphaned-tokens` fires on the 10 unused-from-components house tokens, this is acceptable per runtime-swap pattern; document explicitly.
- **Info:** `token-summary` reports counts — acceptable.
- **Pinned version:** `@google/design.md@0.2.0`. Future bump is a deliberate, separate task.

## What lives in prose ONLY (cannot be tokens — gap analysis § 3)

- Motion / transitions (Framer Motion, octahedron auto-rotation, scrolling edge-text, scale-breathing, node scale-pulse, Navbar overlay, SierpinskiCarpet RAF, `@keyframes blink`, `prefers-reduced-motion` gating).
- Shaders & R3F (plain `MeshBasicMaterial` + `tex.colorSpace = SRGBColorSpace`; `FractalCityScene` ambient `#f5f0ea` is a *lighting* color, not tokenized).
- Noise textures (inline `data:image/svg+xml,…` `feTurbulence` on `body`).
- Gradients (`SkylineSilhouette` SVG `stop-opacity` gradient with cream stop at `#f8f6f0`).
- Decorative chrome (Mandelbrot corner motif on Button default).
- Per-house page-bg inversion rule (forum/school).
- Hidden-route logic (`hideFromNavbar`, `hideFromBanners` — FRAC-32).
- Text transforms (global `text-transform: uppercase` on `body`; `font-style: italic` on headings).
- Octahedron face order (presentation logic, not a token).
- Pennant clip-path on HouseBanner.

## Lint expectations (summary)

| Rule | Severity | Expected for this DESIGN.md |
|---|---|---|
| `broken-ref` | error | Must be 0. Verify all `{colors.*}` / `{rounded.*}` / `{typography.*}` refs resolve. |
| `missing-primary` | warning | **Will fire** — accepted per decision #2. Documented in **Linting Notes**. |
| `contrast-ratio` | warning | May fire on house-banner pair combos. Acceptable — banner monogram is decorative. Document specifics. |
| `orphaned-tokens` | warning | May fire on the 10 house tokens not referenced by `house-banner` representative entry. Acceptable per runtime-swap convention. Document. |
| `token-summary` | info | Acceptable. |
| `missing-sections` | info | Should not fire — all canonical sections present. |
| `missing-typography` | warning | Must not fire — we have 2 typography tokens. |
| `section-order` | warning | Must not fire — canonical order followed. |
| `unknown-key` | warning | Must not fire — only canonical YAML keys used. |

## Acceptance criteria (for review sub-agent)

1. **File location:** `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` exists at repo root and is the only file modified in the PR (no `src/` edits, no `package.json` script).
2. **Lint passes:** `npx @google/design.md@0.2.0 lint DESIGN.md` returns zero errors. `broken-ref` count is 0.
3. **All 8 decisions-doc decisions reflected** in YAML + prose as enumerated above.
4. **All 10 locked handoff decisions honored:** cream is `#f8f6f0`; house palette uses `palette.{light,deep}` SoT; no dark tokens; minimal Button with Mandelbrot corners; octahedron face order documented; mobile-first explicit; motion documented as prose-only.
5. **Section headers** present in canonical order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts (+ Linting Notes appended).
6. **Token tables** match `src/index.css` and `src/data/houses.ts` HEAD values exactly (impl re-verifies before write; reviewer re-verifies before merge).
7. **Mobile-first 375px** mentioned literally in both **Layout** and **Do's and Don'ts**.
8. **No source files modified.** `git diff master -- src/` is empty.
9. **No dark-mode tokens** in YAML. No `.dark` references.
10. **The `missing-primary` warning is explicitly justified** in Colors and Linting Notes prose.
11. **The Inter divergence is documented** in Typography prose (Inter declared, JetBrains Mono shipped, follow-up task to migrate).
12. **The 12 house tokens use displayName slugs** (`house-visit-*`, `house-education-*`, `house-political-club-*`, `house-publications-*`), not internal IDs.

## Out of scope (explicit)

- **All source code changes.** Token tightening (`--background` HSL → `#f8f6f0` math), Inter font import, `#1a1a1a` → `--foreground` migration (4 sites), `#6B4C9A` removal (8 sites + `houses.ts` legacy field), spacing scale consolidation — each is a separate follow-up task spun by the orchestrator post-merge.
- **The v0 DESIGN.md draft at `../agent-a3a9810eccf8190d6/DESIGN.md`.** Reference only. Do NOT edit it. Do NOT adopt its structure. The impl agent authors a fresh `DESIGN.md` at repo root from this plan.
- **`DESIGN.md.lock` / `DESIGN.json` companion files.** Spec doesn't require them at 0.2.0. Don't create.
- **`package.json` lint script.** Deferred — follow-up if the team wants `pnpm run design:lint` shorthand.
- **Dark mode tokens.** Locked decision #3 (handoff): not planned, do not declare.
- **Octahedron 3D scene token-ification.** Locked decision #7 (handoff) + gap analysis § 7: scenes/shaders/photos/face-order live in code.

## Open items for the impl agent to verify before writing

1. **Re-verify the 12 house palette hex values** against `src/data/houses.ts` HEAD. Palettes shift fast. If a value differs, use HEAD and note it in the PR description.
2. **Re-grep spacing values** under `src/`. The planner's grep is a starting set, not exhaustive. Emit `spacing:` keys for every observed numeric token.
3. **Confirm `@google/design.md@0.2.0` lints cleanly** before pushing. If the published package surfaces a different `version:` keyword (alpha vs `"0.2.0"`), use whichever the lint CLI accepts. The spec README currently shows `version: "alpha"`; the lint command we pin is `@0.2.0`. If lint rejects `version: "alpha"`, switch the YAML to `version: "0.2.0"` (or the value the lint accepts). Document the choice in **Linting Notes**.
4. **Verify the `destructive` hex.** `--destructive: 0 84% 60%` computes to approximately `#ef4444`. Re-do the HSL→hex conversion and emit the exact computed hex.
5. **Verify the `card` / `popover` hex.** `40 25% 98%` computes to approximately `#fbfaf9`. Confirm.

## Files the impl agent will create

- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` (new, repo root) — the only file modified.

## Out-of-scope follow-up tasks (orchestrator spins after this lands)

Per decisions doc § "Follow-up tasks to spin":
1. Add Inter font import + swap `--font-sans` value in `src/index.css`.
2. Collapse ad-hoc spacing into a canonical scale (using FRAC-19's inventory).
3. Normalize 4 raw `#1a1a1a` sites → `--foreground` (`OctahedronHero.tsx:584,801`, `HouseBanner.tsx:96-97`).
4. **FRAC-34 scope rewrite:** remove `#6B4C9A`, replace 8 sites with Lab palette pinks + drop legacy `color` field from `lab` entry in `houses.ts`.

(Plus from gap analysis open items: tighten `--background` HSL math to produce `#f8f6f0`; container `max-w-*` consolidation; `houses.ts.color` field removal once AvatarBadge / HouseBanner fallback path is refactored.)
