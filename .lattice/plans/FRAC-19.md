# FRAC-19: Author DESIGN.md — single source of truth for Fractal NYC visual identity

## Scope

The implementation sub-agent will author a single new file, `/Users/fractalos/Dev/fractal-nyc/DESIGN.md`, at the repo root, conforming to the `@google/design.md` spec (alpha). It is the only file modified by this task. No source files (`src/index.css`, `src/data/houses.ts`, components) are changed. No `package.json` script is added in this task (Phase 2). The file canonicalizes the design state that currently lives across `src/index.css` (`@theme inline` + `:root` HSL vars), `src/data/houses.ts` (per-house hex accents), `src/components/layout/Navbar.tsx` (the in-use "Fractal Elegant" 8-color section palette), `src/components/house/HouseBanner.tsx` (paired bg + letter colors), and the user's per-account auto-memory (palette names). It is normative for tokens (colors, typography, rounded, spacing, components) and rationale for everything design.md cannot model (motion, textures, R3F shaders, per-face tinting, mobile-first behavior).

## Approach (phased, for the impl agent)

**Phase 0 — Branch & setup.** Create branch `frac-19-design-md` off `master`. Pull `master` clean — do NOT inherit `frac-17-18-color-tweaks`. Link branch: `lattice branch-link FRAC-19 frac-19-design-md --actor agent:claude-opus-4-7-impl`.

**Phase 1 — Verify the spec.** `npx --yes @google/design.md@alpha --help` to confirm CLI is invokable. If the package name differs in npm, fall back to `gh repo clone google-labs-code/design.md /tmp/design.md && cd /tmp/design.md && npm install && node dist/cli.js --help` to discover the actual published name. Note the actual lint command for the acceptance test.

**Phase 2 — Write YAML front matter.** Translate every token in the gap-analysis section below to YAML. HSL → hex using sRGB conversion. Use lowercase hex with `#` prefix in quotes. Include all 8 Fractal Elegant section colors (Navbar `sectionLinks` is the authoritative list). Include 6 paired letter colors from `HouseBanner.ELEGANT_PAIRS`. Include the surface/text/border tokens from `:root`. Include all three font families. Include typography tokens for h1–h3, body-mono, label-mono, jacquard-display. Include the 4-step rounded scale. Include a spacing scale matching Tailwind defaults (4px base — see "Layout strategy" finding). Components: `button-default`, `button-outline`, `button-secondary`, `button-ghost`, `button-link`, `card`, `house-banner` (only the closed-set props: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`). Everything else goes in prose.

**Phase 3 — Write prose sections** in canonical order (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts). Mobile-first is called out explicitly in **Layout** and **Do's and Don'ts** with a "375px is the design baseline" line. Motion (link-underline cubic-bezier, blink keyframe, octahedron rotation + node pulse + emissive glow, reduced-motion fallbacks) is documented in **Components** as prose only, with an explicit "Motion is intentionally out of scope for design.md tokens — see Do's and Don'ts" note. The noise SVG body texture and `hero-text-shadow` go in **Elevation & Depth**. The pennant clip-path and Mandelbrot corner accents go in **Shapes**.

**Phase 4 — Lint & iterate.** Run the lint command. Resolve any `error` (broken-ref must be zero). Justify any remaining `warn` in a closing prose paragraph or by fixing them. `missing-primary`, `missing-typography`, `section-order` should all be clean. `contrast-ratio` warnings on the dark-mode tokens are expected (dark-mode body on warm-cream foreground has known contrast trade-offs); document them.

**Phase 5 — Commit, PR, hand off to review.**
- `git add DESIGN.md`
- Commit: `FRAC-19: add DESIGN.md (design.md format) as single source of truth for visual identity`
- Push, open PR titled `FRAC-19: add DESIGN.md`
- `lattice status FRAC-19 review --actor agent:claude-opus-4-7-impl`

## Code Review Findings (audit of current visual layer)

### Color palette in use

Three overlapping color systems exist concurrently. They must reconcile in DESIGN.md.

**A. Asimov Collective semantic tokens** — `src/index.css` lines 44–73 (`:root`) and 75–103 (`.dark`). Stored as space-separated HSL channels (no `hsl()` wrapper) and consumed via `--color-*: hsl(var(--*))` in `@theme inline` (lines 5–42). The light-mode values, converted to hex for design.md:

| Token (CSS var) | HSL | Hex (sRGB) | Role |
|---|---|---|---|
| `--background` | `40 25% 96%` | `#f8f6f0` (approx) | Warm cream page bg |
| `--foreground` | `0 0% 9%` | `#171717` | Deep charcoal text |
| `--card` / `--popover` | `40 25% 98%` | `#fcfbf7` | Elevated surfaces |
| `--primary` | `0 0% 9%` | `#171717` | **Same as foreground** — naming conflict (see Gap Analysis) |
| `--primary-foreground` | `40 25% 96%` | `#f8f6f0` | Cream-on-charcoal |
| `--secondary` / `--muted` | `40 10% 90%` | `#e8e5e0` | Subtle bg |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Secondary text |
| `--accent` | `40 15% 88%` | `#e3dfd6` | Hover/highlight bg |
| `--destructive` | `0 84% 60%` | `#ef4444` (approx) | Errors |
| `--border` / `--input` | `40 10% 85%` | `#dcd8d1` | Hairlines |
| `--ring` | `0 0% 9%` | `#171717` | Focus ring |

Impl agent: verify exact hex via an HSL→hex calculator, do not eyeball. The dark-mode block at lines 75–103 exists but `.dark` is never applied anywhere in the codebase (no theme switcher imports `next-themes`'s `ThemeProvider`; the package is in `package.json` but unused). Decision needed: include `.dark` values in DESIGN.md or omit until dark mode actually ships. Recommendation: **omit** — DESIGN.md is the single source of truth, and the dark palette is currently aspirational.

**B. Fractal Elegant section palette** — `src/components/layout/Navbar.tsx` lines 7–16 (the in-use, authoritative 8-color set, matched verbatim in OctahedronHero `OUTER_NAV_NODES` for the 5 visible sections):

| Section | Hex | Used in |
|---|---|---|
| Story | `#D4BA58` | Navbar, FACE_SECTION_COLORS (octahedron face 0) |
| Campus | `#2B5A48` | Navbar, OctahedronHero NAV_NODES + face 1 |
| Visit / Neighborhood | `#889460` | Navbar, NAV_NODES + face 2 |
| Events | `#D4857A` | Navbar, NAV_NODES + face 3 |
| Education / New Liberal Arts | `#C41E20` | Navbar, NAV_NODES + face 4 |
| Political Club / Forum | `#6E1830` (Navbar) vs `#8a7a6a` (octa face 5) | **Inconsistent — see below** |
| Publications / Lab | `#E870A0` | Navbar, NAV_NODES + face 6 |
| People | `#C49040` | Navbar, FACE_SECTION_COLORS face 7 |

**Inconsistency:** `OctahedronHero.FACE_SECTION_COLORS.forum = "#8a7a6a"` (a deliberately desaturated grey-tan because Political Club has no nav node — see code comment lines 372–374). Navbar `sectionLinks` keeps `#6E1830` (burgundy). DESIGN.md should canonicalize `forum: "#6E1830"` as the brand color and note the desaturated `#8a7a6a` as a face-specific override in prose under Components → octahedron, not as a separate color token.

**Visibility filters:** `HIDDEN_HOUSE_IDS = ["forum"]` (houses.ts:298) hides Political Club from the banner grid; `HIDDEN_SECTION_NAMES = ["Political Club", "People"]` (Navbar.tsx:20) hides both from nav. DESIGN.md still defines tokens for these — hidden ≠ removed.

**C. Per-house paired letter colors** — `src/components/house/HouseBanner.tsx` lines 20–33 (`ELEGANT_PAIRS`). Each visible house has a deeper companion color used for the Jacquard 24 monogram letter on the banner background:

| House | Banner bg | Letter |
|---|---|---|
| events | `#D4857A` | `#C13B2A` |
| school | `#C41E20` | `#E63636` |
| neighborhood | `#889460` | `#4A5A30` |
| campus | `#2B5A48` | `#1A3A2E` |
| lab | `#E870A0` | `#C44878` |
| forum | `#C89898` (NOT `#6E1830`) | `#6E1830` |

**Anomaly:** for `forum`, the banner uses dusty rose `#C89898` as bg with `#6E1830` as letter, while Navbar uses `#6E1830` as the link color directly. This is another forum-specific override worth noting.

**D. Legacy `FractalObject.tsx`** — `src/components/three/FractalObject.tsx` lines 38–45 uses an older palette (`#E07A5F`, `#8B7355`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A`) matching the values in `houses.ts` (`House.color` field). This file is not used by `Home.tsx` (which imports `Hero` which mounts `OctahedronHero` — verify), but the `houses.ts` `color:` field IS read by other components implicitly. Impl agent should grep for `house.color` consumers and document whether the houses.ts color field is still authoritative or vestigial.

**E. Other hardcoded colors observed.**
- Body bg hex `#faf8f5` (Home.tsx:25, Hero.tsx:90 + various — slightly warmer cream than the `--background` token) — likely a rounding artifact from when the brand cream was picked, but it diverges from `--background`. **DESIGN.md should pick one canonical cream and the impl agent flags the discrepancy in a Phase 2 follow-up task.**
- Tooltip bg `rgba(250,248,245,0.92)` (OctahedronHero.tsx:764) — another cream variant.
- Streaming-text gold/amber palette inside the octahedron: `#c4a265`, `#e0c880`, `#ddb866`, `#bb8844`, `#cc9955`, `#e8e0d0` (OctahedronHero.tsx:173, 501, 808–823, 832, 835, 842). These are scene-specific accent metals — document as a "hero scene palette" in prose under Components → 3D Hero, not as global tokens.
- Hero text-shadow uses `rgba(250,248,245,0.95)` and `rgba(250,248,245,0.8)` (index.css:152).

### Layout strategy

- **No explicit spacing scale defined** in `@theme inline`. The project relies on Tailwind v4 defaults (4px base, increments `0.5/1/1.5/2/3/4/6/8/12/16/20/24/32/40/...`). `gap-2`, `gap-4`, `gap-6`, `gap-12`, `gap-16`, `space-y-6`, `py-10`, `py-12`, `py-20`, `py-40`, `py-60` all observed. DESIGN.md should declare an explicit spacing scale that matches what the codebase actually uses (xs 4, sm 8, md 16, lg 24, xl 32, 2xl 64, 3xl 96, 4xl 160px-ish to match `py-40`).
- **Section horizontal padding** is conventionally `px-[4.5%]` (Home.tsx, LabPage.tsx, NeighborhoodPage.tsx, StoryPage.tsx) for desktop, `px-6` for mobile. Document as a custom layout convention in prose.
- **Max-widths:** `max-w-md` (modal cards, mobile nav), `max-w-2xl`, `max-w-3xl` (footer content), `max-w-5xl`, `max-w-6xl`, `max-w-7xl`, `max-w-[800px]`. No single container component — varies by page.
- **Mobile-first:** confirmed via Tailwind responsive prefixes — base styles target mobile, `md:`/`lg:` enhance. PRD non-negotiable (375px baseline).
- **Grid:** Home uses `grid grid-cols-1 md:grid-cols-2`. Navbar uses `grid grid-cols-[1fr_auto_1fr]`. No `container` component.
- **Vertical rhythm:** Sections separate via `py-12 md:py-20` (Footer CTA), `py-40 md:py-60` (Home Golden Age section) — extreme spacing for editorial breathing room. Document as "vertical rhythm: editorial scale, not tight."

### Fonts and usage

Three families, imported from Google Fonts in `index.css` line 1:

1. **Fraunces** (variable, italic axis) — `font-serif`. Used for **all** headings (`h1–h6` auto-styled `font-serif font-normal italic, letter-spacing 0.04em, uppercase`, index.css:118–122). Also used as body emphasis (`.font-serif` utility, always italic uppercase, index.css:125–128). Frequent override `normal-case` on Fraunces blocks where mixed-case is desired (Vision.tsx, Campus.tsx). Sizes range `text-base` to `text-7xl` to `clamp(42px, 8vw, 82px)`.
2. **JetBrains Mono** (weights 100–700) — `font-sans` AND `font-mono` (both map to JetBrains Mono — Fraunces is NOT the sans default). This is intentional: body type is monospace. Body is `font-sans uppercase` by default (index.css:111–112). Frequently uses `font-thin` (weight 100) for the editorial mono look. Use cases: body paragraphs, nav links, search bars, labels, tags, tooltip captions.
3. **Jacquard 24** (display, ornamental gothic) — applied **only via inline `style={{ fontFamily: "'Jacquard 24', system-ui" }}`** (never via Tailwind class). The CSS escape hatch `[style*="Jacquard"] { text-transform: none; font-style: normal; }` (index.css:130–133) opts Jacquard out of the global uppercase + italic. Use cases: the "Fractal" logo in Navbar/Footer, banner monogram letters (HouseBanner), SectorHeader letter, nav link leading-caps (each word's first letter in `NavLink`), section headings in Navbar overlay.

**Typography tokens to declare:**
- `h1`: Fraunces, italic, uppercase, ~ `clamp(48px, 8vw, 96px)`, letter-spacing `0.04em`, lineHeight `1.1`
- `h2`: Fraunces, italic, uppercase, ~64px, letter-spacing `0.04em`, lineHeight `1.2`
- `h3`: Fraunces, italic, uppercase, ~36px, letter-spacing `0.04em`, lineHeight `1.3`
- `body-mono`: JetBrains Mono 100, uppercase, 16px, lineHeight `1.6`, letter-spacing `0`
- `label-mono`: JetBrains Mono 300, uppercase, 12px, letter-spacing `0.2em` (used in tracking-widest contexts)
- `display-jacquard`: Jacquard 24, normal (not italic, not uppercase), `clamp(64px, 15vw, 160px)`, letter-spacing `0.04em`, lineHeight `1`

The italic-vs-normal axis on Fraunces is structurally important — half the codebase explicitly sets `style={{ fontStyle: "normal" }}` to opt out of the auto-italic for h2 hero-style copy (Home.tsx:30, LiberalArts.tsx:13, Vision.tsx). DESIGN.md prose must document this dual mode.

### Buttons / interactive primitives

`src/components/ui/button.tsx` (Replit-customized shadcn button) defines six variants × four sizes:

- **variants**: `default` (filled charcoal + cream text, with `border-primary-border`), `destructive`, `outline` (uses CSS var `--button-outline` — **never defined in index.css** — likely inherits a Tailwind/shadcn default), `secondary`, `ghost`, `link`
- **sizes**: `default` (min-h-12 px-5 py-3), `sm` (min-h-10 px-4), `lg` (min-h-14 px-8), `icon` (h-9 w-9)
- All buttons have **decorative Mandelbrot corner stamps** rotated to four corners at 0.2 opacity, layered inside `overflow-hidden relative` (button.tsx:70–73). This is a brand signature: a closed-set design.md component spec cannot express it — must live in prose under Components.
- Universal classes: `rounded-md`, `transition-colors`, `hover-elevate active-elevate-2` (custom utility likely from `tw-animate-css` — verify with `grep -rn "hover-elevate" node_modules/tw-animate-css/dist 2>/dev/null` or accept as opaque "elevation utility").

**Inline button-styled anchors** (not the `Button` component) are common: every "Want to host?" / "Want to learn?" CTA on the house pages uses raw `<Link>` with classes:
`inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300`

— this should be defined as a component-level token `cta-outline-link` in DESIGN.md so the convention is preserved when other agents work on house pages.

**Badge / TagFilter / AvatarBadge / MandelbrotCorners** — secondary UI primitives, document at a high level in prose, not as full tokens.

### Shaders / textures / effects

These are the items design.md explicitly cannot model. All must live in prose.

1. **Body noise texture** (index.css:113–114). An inlined SVG fractal-noise filter at 0.03 opacity rendered as `background-image`. The "tactile premium" body of the site. Mention in **Elevation & Depth** prose.
2. **`hero-text-shadow` utility** (index.css:151–153). Two-layer cream-on-cream text shadow (`0 1px 6px rgba(250,248,245,0.95), 0 0 20px rgba(250,248,245,0.8)`) used over hero photos for readability. Prose under **Elevation & Depth**.
3. **`link-underline` utility** (index.css:155–157). After-element pseudo-underline with a cubic-bezier `(0.65 0.05 0.36 1)` `transition-transform 300ms` originating bottom-right, scaling on hover from bottom-left. Prose under **Components → Links**.
4. **`animate-blink` keyframe** (index.css:169–176). 1s step-end opacity blink. Used for terminal-style cursor indicators. Prose under **Components → Motion**.
5. **OctahedronHero** (`src/components/three/OctahedronHero.tsx`) — Three.js / R3F scene with nested octahedra, scrolling JetBrains Mono "THE PROTOCOL" texture on tube edges, per-face banner-textured center octahedron with **custom shader for hue-mix tinting (line 513–537)**, emissive node pulse with phase decorrelation (line 656–678), `prefers-reduced-motion` fallback, FRAC-124 tap-vs-drag discriminator. Prose under **Components → 3D Hero** with the "in-flux" caveat (see Octahedron caveat section below).
6. **Banner clip-path pennant shape** (HouseBanner.tsx:113–114). `polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)` — the V-notch banner silhouette. Prose under **Shapes**.
7. **Mandelbrot corner stamps** (Button, MandelbrotCorners, banner Mandelbrot icon). The repeating brand watermark. Prose under **Shapes** with reference to `MandelbrotIcon`.
8. **Framer Motion** transitions on Navbar collapse/expand (`duration: 0.4, ease: [0.25, 1, 0.5, 1]`) and mobile menu (`duration: 0.3, ease: "easeInOut"`). Prose under **Components → Motion**.
9. **`FadeIn` component** (`src/components/ui/FadeIn.tsx`) — scroll-triggered opacity ramp used liberally. Prose under **Motion**.

### Recent UI batches (context)

The last ~10 commits all touched visual layer:
- **a9ede7c** FRAC-17/18 — applied per-house section colors as a 0.55 shader-mix tint on banner photos inside the octahedron (FACE_SECTION_COLORS); also bumped Campus bg green. **This is the change FRAC-20 says is incorrect.**
- **d78b44b** FRAC-10..16 — broad UI bug batch (hero text-shadow lives, Mandelbrot corner accent timing, badge consistency).
- **063705d** FRAC-5/9 — octahedron nav parity (5 visible houses, Political Club hidden); pulsing emissive node glow + reduced-motion fallback.
- **dd3917f / 2be90f9** — Campus page restructured with team bios and CTAs; introduced the inline `border border-foreground/20 ... bg-foreground/[0.03]` CTA-link pattern.
- **f010598** — Writing posts content (not visual).
- **1cdea03** — Story page reduced paragraph size + vertical padding (a tightening pass).

Cumulative effect: the design has rapidly converged on Fractal Elegant + Asimov Collective surfaces in the last 30 days; the codebase still bears traces of the earlier Fractal Bright palette (`houses.ts.color` fields, `FractalObject.tsx`) which DESIGN.md should consciously NOT canonicalize.

---

## Gap Analysis: Current state vs `@google/design.md` spec

### What maps cleanly

- **Surface colors**: `--background`, `--foreground`, `--card`, `--popover`, `--muted`, `--accent`, `--border`, `--ring` → `colors.background`, `colors.foreground`, etc. Convert HSL → hex.
- **House accent colors**: 8 hex values → `colors.house-story`, `colors.house-campus`, `colors.house-neighborhood`, `colors.house-events`, `colors.house-school`, `colors.house-forum`, `colors.house-lab`, `colors.house-people`. (Use "school" / "forum" / "lab" since those are the internal data IDs; per global memory rule, display names like "Political Club" / "Publications" / "Education" go in `description:` fields on each token.)
- **House letter pair colors**: 6 hex values → `colors.house-{id}-letter` (or namespace as `colors.house-letter-events` etc.).
- **Rounded scale**: `--radius-sm/md/lg/xl` (0.25/0.5/0.75/1rem) → `rounded.sm/md/lg/xl` directly. Add `rounded.full: 9999px` for the avatar/icon usage.
- **Font families**: three families → `typography.*.fontFamily` per role.

### What needs translation

- **HSL → hex**: every `--*` variable in `:root` is stored as space-separated HSL channels. Convert to hex (sRGB). Document the conversion table inline if helpful for review.
- **CSS-var indirection**: `--color-primary: hsl(var(--primary))` → flat hex in `colors.primary`. design.md doesn't model the layered token approach; it stores the resolved value.
- **Tailwind default spacing → explicit scale**: declare `spacing.xs/sm/md/lg/xl/2xl/3xl/4xl` to make the editorial vertical rhythm legible to other agents.

### What design.md cannot model — must live in prose

- **Motion**: all keyframes (`blink`), the link-underline cubic-bezier, Framer Motion easings, octahedron rotation/pulse/glow, R3F texture scroll, `FadeIn` scroll trigger, reduced-motion fallbacks.
- **Textures**: the noise SVG body bg, the per-face banner shader-mix tint, the streaming "THE PROTOCOL" texture along octahedron edges.
- **Shadows**: `hero-text-shadow`, button `shadow-sm`/`shadow-xs`, the Mandelbrot watermark in Footer.
- **Shapes**: pennant clip-path, octahedron geometry, Mandelbrot corner stamps.
- **3D / WebGL**: the entire OctahedronHero component — geometry, materials, shaders, tap-vs-drag gesture, banner textures. Prose-only.
- **Per-house theming**: design.md has flat tokens, no themed scopes. We list each house color as a separate token and document the convention in prose ("Each section/house page uses its house-accent color for monogram, banner, and nav link — see `src/data/houses.ts` and `src/components/layout/Navbar.tsx` for current bindings").
- **Hidden section visibility filters**: `HIDDEN_HOUSE_IDS` and `HIDDEN_SECTION_NAMES` are runtime data, not design tokens. Mention in prose that tokens exist for hidden houses; their visibility is a content/feature-flag decision, not a design one.

### What's missing from current code

- **`primary` color name conflict**: `--primary: 0 0% 9%` (charcoal) is currently used as "text/button-default bg" rather than "brand/CTA color." design.md's `missing-primary` warning expects a brand `primary`. **Decision for impl:** keep `colors.primary: "#171717"` (matches current code), and in prose under **Colors** explain that Fractal NYC's brand convention treats deep charcoal as the primary (Asimov Collective editorial aesthetic), not a saturated brand hue. Alternative considered and rejected: aliasing one of the house colors (e.g., `#C41E20` school red) as primary — would silently break every `bg-primary` consumer.
- **Spacing scale**: not declared anywhere. We add one.
- **Typography tokens**: only font families are declared in CSS. Heading sizes, weights, letter-spacing live as Tailwind utility classes scattered across components. We promote a canonical h1/h2/h3 + body-mono + label-mono + display-jacquard set.
- **Component tokens**: no explicit per-component design tokens. We declare a minimum useful set: `button-default`, `button-outline`, `button-secondary`, `button-ghost`, `button-link`, `cta-outline-link`, `card`, `house-banner`, `tooltip`.
- **Dark mode**: `.dark` block exists but is not wired up. Recommendation: **document in prose under Do's and Don'ts as "dark mode is scaffolded but not active"** and do NOT declare dark tokens in YAML — design.md spec has no theme/mode mechanism.

### Naming conflicts

- `primary` semantic conflict — covered above.
- `--background` (`#f8f6f0`) vs the `bg-[#faf8f5]` hardcode in Home.tsx/Hero.tsx. These are two slightly different creams. DESIGN.md should pick one (recommend `#faf8f5` since it's the perceived brand cream used in body backgrounds and tooltip surfaces; the `--background` HSL value should later be retuned to match). **Flag for a follow-up FRAC task.**
- `colors.house-forum` token (`#6E1830` per Navbar) vs the desaturated `#8a7a6a` shown on the octahedron face. Resolution: token = brand value; face override = prose footnote.
- House data uses *internal IDs* (`neighborhood`, `school`, `forum`, `lab`) while UI uses *display names* (`Visit`, `Education`, `Political Club`, `Publications`). DESIGN.md token names follow internal IDs (`house-school`, not `house-education`) to match the data model; each token carries a `description:` field stating its display name. This is consistent with the global memory rule "use displayName in conversation, never internal IDs" — DESIGN.md's prose uses display names; only token keys use IDs.

### Per-house theming

`@google/design.md` has no first-class theme/scope mechanism for "this color is the accent for THIS subtree." We flatten:
- 8 `colors.house-{id}` tokens (one per section, including the 3 currently hidden)
- 6 `colors.house-{id}-letter` tokens for the Jacquard monogram pair
- Prose under **Colors → House palettes** lists the canonical name "Fractal Elegant" (currently active) and notes "Fractal Bright" as a previous alternate preserved in `/Users/fractalos/.claude/projects/-Users-fractalos-Dev-fractal-nyc/memory/project_color_palettes.md` (do not redeclare — keep DESIGN.md a single source, not a mirror).

---

## Octahedron caveat (FRAC-20)

FRAC-20 is at `needs_human` because **a9ede7c (FRAC-17) applied the section accent colors as a 0.55 shader-mix tint on the banner images on each of the 8 octahedron faces, and the user has stated this tinting is wrong AND one face is missing its photo.** The unresolved question is the *tint application*, not the *underlying hex values* of the Fractal Elegant palette — those hex values are also used (correctly) in Navbar, HouseBanner, and OctahedronHero's nav-node spheres, all of which remain visually intended.

**Decision for the impl sub-agent:**

1. **Canonicalize the 8 Fractal Elegant hex values as `colors.house-*` tokens.** They are stable across Navbar + HouseBanner + nav-node spheres and have been the brand palette for the last month of commits.
2. **DO NOT canonicalize the per-face shader tint as a design token.** It is a rendering choice (currently broken per FRAC-20), not a token.
3. In prose under **Components → 3D Hero (OctahedronHero)**, write:
   > Each octahedron face displays a banner image tinted with its section's accent color via a fragment shader (`mix(tex.rgb, tint, 0.55)`). **This treatment is in flux pending FRAC-20** — the current tint intensity and one missing face image are known issues. The accent color values themselves are canonical; the application as an image tint is not. The reviewer of FRAC-20 will determine whether to (a) remove the tint, (b) reduce its intensity, or (c) replace per-face image colorways. Until FRAC-20 lands, treat the octahedron face appearance as exploratory, not normative.
4. **Do not edit `OctahedronHero.tsx`** in this task. DESIGN.md is the only file changed.

If FRAC-20 lands before DESIGN.md is merged, the impl agent should re-check the resolution and update the prose paragraph accordingly.

---

## DESIGN.md skeleton

```markdown
---
version: "alpha"
name: "Fractal NYC"
description: "Editorial Asimov-Collective surface palette with the Fractal Elegant section accents. Mobile-first. Three families: Fraunces (serif/italic), JetBrains Mono (sans/mono), Jacquard 24 (display)."

colors:
  # --- Surfaces (Asimov Collective) ---
  background: "#faf8f5"   # description: Warm cream page bg. Reconcile with --background HSL.
  foreground: "#171717"   # description: Deep charcoal text.
  card: "#fcfbf7"
  popover: "#fcfbf7"
  primary: "#171717"      # description: Editorial-charcoal brand primary (not a saturated CTA hue).
  primary-foreground: "#f8f6f0"
  secondary: "#e8e5e0"
  secondary-foreground: "#171717"
  muted: "#e8e5e0"
  muted-foreground: "#666666"
  accent: "#e3dfd6"
  accent-foreground: "#171717"
  destructive: "#ef4444"
  destructive-foreground: "#f8f6f0"
  border: "#dcd8d1"
  input: "#dcd8d1"
  ring: "#171717"

  # --- Fractal Elegant house palette (Navbar.sectionLinks is authoritative) ---
  house-story: "#D4BA58"          # display: "Story"
  house-campus: "#2B5A48"         # display: "Campus"
  house-neighborhood: "#889460"   # display: "Visit"
  house-events: "#D4857A"         # display: "Events"
  house-school: "#C41E20"         # display: "Education"
  house-forum: "#6E1830"          # display: "Political Club"
  house-lab: "#E870A0"            # display: "Publications"
  house-people: "#C49040"         # display: "People"

  # --- House letter (Jacquard monogram) pair colors ---
  house-events-letter: "#C13B2A"
  house-school-letter: "#E63636"
  house-neighborhood-letter: "#4A5A30"
  house-campus-letter: "#1A3A2E"
  house-lab-letter: "#C44878"
  house-forum-letter: "#6E1830"
  # (story, people: no paired letter color defined; banner uses brand value directly.)

typography:
  h1:
    fontFamily: "Fraunces"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.04em
    fontFeature: "'ital' 1"
  h2:
    fontFamily: "Fraunces"
    fontSize: 48px
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: 0.04em
  h3:
    fontFamily: "Fraunces"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.04em
  body-mono:
    fontFamily: "JetBrains Mono"
    fontSize: 16px
    fontWeight: 100
    lineHeight: 1.6
  label-mono:
    fontFamily: "JetBrains Mono"
    fontSize: 12px
    fontWeight: 300
    letterSpacing: 0.2em
  display-jacquard:
    fontFamily: "Jacquard 24"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.04em

rounded:
  sm: 4px      # 0.25rem
  md: 8px      # 0.5rem
  lg: 12px     # 0.75rem
  xl: 16px     # 1rem
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  5xl: 160px   # editorial section padding (py-40 equivalent)

components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.label-mono}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
    typography: "{typography.label-mono}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  button-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    typography: "{typography.label-mono}"
  cta-outline-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 20px
    typography: "{typography.label-mono}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 16px
  house-banner:
    backgroundColor: "{colors.house-events}"   # placeholder; runtime swaps per house
    textColor: "{colors.house-events-letter}"
    typography: "{typography.display-jacquard}"
  tooltip:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 8px
    typography: "{typography.label-mono}"

---

## Overview
…1–2 paragraphs on the Asimov Collective editorial aesthetic, the Fractal Elegant section palette, Hogwarts-house framing per the PRD. Call out: warm cream, deep charcoal, oversized italic Fraunces headings, monospace body, Jacquard display accents. Mention mobile-first.

## Colors
…surface palette explanation, then the 8-house palette table with display names, then the letter-pair palette. Note the `primary` semantic choice. Note the `--background` HSL vs `#faf8f5` reconciliation. Note hidden houses still have tokens.

## Typography
…three families, their roles, the auto-uppercase-italic Fraunces convention, the `[style*="Jacquard"]` escape hatch, the dual italic/normal Fraunces axis. Specify which type token to use where (headings → h1/h2/h3, copy → body-mono, all-caps labels → label-mono, brand display → display-jacquard).

## Layout
…**375px is the design baseline.** All breakpoints add to mobile, not the reverse. Document the `px-6` mobile / `px-[4.5%]` desktop pattern. Document the editorial vertical rhythm (py-12/py-20/py-40/py-60). Document the spacing scale. No global container — pages set their own `max-w-*`.

## Elevation & Depth
…the body noise SVG texture (with the data URL), `hero-text-shadow`, button shadow conventions, Footer Mandelbrot watermark. No drop-shadow tokens — keep these prose-only utilities.

## Shapes
…rounded scale, the pennant clip-path (banner V-notch), the Mandelbrot corner stamps as a brand shape signature, the octahedron as the hero shape primitive.

## Components
…Button variants (six), the inline `cta-outline-link` pattern, HouseBanner pennant with Jacquard monogram, Card, Tooltip, Footer CTA band. Then **3D Hero (OctahedronHero)** subsection with the FRAC-20 caveat verbatim. Then **Motion** subsection covering link-underline, blink, FadeIn, Framer Motion easings, node pulse + emissive glow, reduced-motion fallback.

## Do's and Don'ts
- **Do** design for 375px first. Every component must read on a phone before considering wider layouts.
- **Do** use `font-serif` (Fraunces) for headings and `font-mono` for body and labels.
- **Do** apply `[style*="Jacquard"]` correctly — Jacquard text opts out of the global uppercase + italic.
- **Do** use semantic surface tokens (`background`, `foreground`, `card`, `border`) rather than raw hex.
- **Do** use a house-accent color only inside that house's scope — never as a global brand color.
- **Don't** introduce new accent colors without adding a `colors.house-*` token here first.
- **Don't** apply `primary` as a saturated brand hue — Fractal NYC's primary is editorial charcoal.
- **Don't** assume dark mode is active — the `.dark` CSS block exists but isn't wired.
- **Don't** canonicalize the octahedron per-face image tint until FRAC-20 resolves.
- **Don't** add motion tokens — motion is prose-only by design (see Motion subsection in Components).
- **Don't** mix mode-locked overrides (`normal-case`, `fontStyle: "normal"`) without documenting why — they reverse the global Fraunces convention and the next agent will revert them.

```

## Acceptance criteria

1. `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` exists at repo root and is the **only file modified** in the PR (Phase 2 = optional `package.json` `design:lint` script, deferred to a follow-up task unless trivial).
2. The DESIGN.md lint command passes with **zero errors**. `broken-ref` count is zero. `missing-primary`, `missing-typography`, `section-order` warnings are clean (i.e., not raised).
3. All Asimov Collective surface tokens (`background`, `foreground`, `card`, `popover`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`) have YAML equivalents under `colors:`.
4. All 8 Fractal Elegant house colors and the 6 house letter-pair colors are present.
5. All three font families and the typography token set (h1, h2, h3, body-mono, label-mono, display-jacquard) are declared.
6. Prose sections present in canonical order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
7. Mobile-first is called out explicitly in **Layout** and **Do's and Don'ts** with a literal `375px` reference.
8. The octahedron / FRAC-20 caveat paragraph is present verbatim (or near-verbatim) in **Components → 3D Hero**, marking the per-face image tint as in-flux.
9. Motion is acknowledged in prose under **Components → Motion** as "intentionally out of scope for design.md tokens — declared in prose."
10. The `--background` vs `#faf8f5` cream discrepancy is acknowledged in prose under **Colors** with a note that follow-up work will reconcile them (no new ticket required from this task — just the acknowledgment).
11. Remaining lint warnings (e.g., `contrast-ratio` on dark-mode tokens that we intentionally omit, `orphaned-tokens` if any house token isn't referenced from a component) are justified in a closing prose paragraph titled "Linting Notes" appended after Do's and Don'ts.
12. No source files (`src/**`, `index.html`, `vite.config.ts`, etc.) are modified.

## Files the impl agent will touch

- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` (new, repo root) — only file modified.
- Optionally, **iff trivial** (one line under `"scripts"`): `package.json` to add `"design:lint": "npx @google/design.md@alpha lint DESIGN.md"` so future agents can re-run the check. If the published package name differs or the command is non-trivial, defer to a follow-up task.

## Open questions for review

1. Should the impl agent open a follow-up FRAC task for the `--background` vs `#faf8f5` cream reconciliation, or just note it inline?  Recommendation: note inline; if discrepancy persists in 2+ commits after DESIGN.md merges, the agent observing it then files the task (per CLAUDE.md "recurring observations become tasks").
2. The `.dark` CSS block is present but inactive. DESIGN.md will explicitly NOT declare dark tokens. If/when dark mode is wired, a separate task will extend DESIGN.md — design.md spec doesn't natively support multi-theme, so the convention will need to be revisited.
3. The legacy `houses.ts.color` field (Fractal Bright remnants) is consumed by `FractalObject.tsx`. If `FractalObject` is dead code, DESIGN.md should not honor it. The impl agent should verify usage with `grep -rn "FractalObject" src/` and flag dead-code suspicion (do NOT delete — that's not in scope; just note).
