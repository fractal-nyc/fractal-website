# Visual Layer Audit — FRAC-21 — Claude Standard

**Auditor:** Claude (Standard)
**Timestamp:** 20260605-1547
**Files reviewed:** `src/index.css`, `src/data/houses.ts`, `src/components/three/{OctahedronHero,FractalObject,FractalCityScene,Skyline}.tsx`, `src/components/house/HouseBanner.tsx`, `src/components/layout/SectorHeader.tsx`, `src/components/ui/{button,FadeIn,FractalPattern}.tsx`, `src/pages/{Home,CampusPage,EventsPage,LabPage,NeighborhoodPage,PoliticalClubPage,LiberalArtsPage,PeoplePage,StoryPage}.tsx`, plus repo-wide greps for hex literals, fonts, `normal-case`, `focus-visible`, `dark:`, and motion handling.

---

## 1. Design style overall

The "Asimov Collective" aesthetic is genuinely coherent at the atomic level — warm cream surface, charcoal ink, Fraunces uppercase-italic headings, JetBrains Mono body, a subtle noise texture, and a recurring Mandelbrot motif. As a *vocabulary* it reads as intentional and distinctive. The fragmentation shows up one level higher, in how that vocabulary is wired together.

- **Two front-door treatments coexist.** The Home hero (`src/components/sections/Hero.tsx`) sits on the cream `bg-background`, while every house page (`src/pages/CampusPage.tsx:8`, `EventsPage.tsx:10`, `LabPage.tsx:16`, etc.) is a full-bleed saturated color field with white/charcoal text and a `FractalPattern` overlay. Both are defensible, but the transition from cream editorial home → fully color-flooded interior pages is the single biggest stylistic seam in the site. It's worth a deliberate decision rather than an emergent one.
- **The global uppercase rule is fought everywhere.** `src/index.css:112` forces `text-transform: uppercase` on `body`, and `:118`/`:125` force uppercase+italic on all headings and `.font-serif`. The result is that real content constantly opts out: `normal-case` appears across `src/components/sections/Campus.tsx` (15+ times), `Vision.tsx:17`, `Projects.tsx:31`, `Directory.tsx:24`, `LiberalArts.tsx:28`, and the house pages all carry inline `style={{ textTransform: "uppercase", fontStyle: "normal" }}` (e.g. `src/pages/Home.tsx:30`, `EventsPage.tsx:19`). When the override is more common than the default, the default is miscalibrated (see §4).
- **Mobile-first conformance is mostly good** — the layout leans on `flex`/`grid` with responsive `md:` steps and percentage padding — but a few fixed-pixel display sizes break the 375px baseline (see §3, Navbar Jacquard sizes).

## 2. Color palette in actual use

This is the area with the most real debt. The six houses are colored **independently in four different places**, and the four don't agree. Inventory:

**A. Base tokens — `src/index.css` `:root` (HSL):**
- `--background: 40 25% 96%` (≈ `#f7f6f2`) — but the inline comment at `:46` says `#f7f6f2` while the actual cream used in hardcoded literals is `#faf8f5` (`Hero.tsx:90,114,121`, `Home.tsx:25`) and the tooltip/`hero-text-shadow` cream is `rgba(250,248,245,…)` (`index.css:152`, `OctahedronHero.tsx:764`). Three near-identical creams (`#f7f6f2` / `#faf8f5` / `#fafaf5`) for what is conceptually one surface color. **The `:root` background and the literal `#faf8f5` sections are slightly different shades sitting adjacent on the page.**
- `--foreground: 0 0% 9%` (`#171717`), with charcoal also hardcoded as `#1a1a1a` in both three.js tooltips (`OctahedronHero.tsx:774`, `FractalObject.tsx:243`) and the banner letter fallback (`HouseBanner.tsx:99`). `#171717` vs `#1a1a1a` — a near-duplicate pair.
- Remaining tokens (`card`, `popover`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`) are standard shadcn scaffolding.

**B. House accents — `src/data/houses.ts` `color:` field (the original "Fractal Bright" palette):**
neighborhood `#8B7355`, events `#E07A5F`, campus `#457B9D`, school `#1D3557`, forum `#CC2936`, lab `#6B4C9A`.

**C. Octahedron hero — `OctahedronHero.tsx` (FRAC-17 palette):** NAV_NODES (`:111–115`) and FACE_SECTION_COLORS (`:374–383`): neighborhood `#889460`, events `#D4857A`, campus `#2B5A48`, school `#C41E20`, forum `#8a7a6a`, lab `#E870A0`, plus story `#D4BA58`, people `#C49040`. *(Per scope, I note these are flagged WRONG via FRAC-20 and do not endorse them — I cite them only to show the cross-file divergence.)*

**D. Banner pairs — `HouseBanner.tsx` ELEGANT_PAIRS (`:20–33`):** events bg `#D4857A`/letter `#C13B2A`, school bg `#C41E20`/letter `#E63636`, neighborhood bg `#889460`/letter `#4A5A30`, campus bg `#2B5A48`/letter `#1A3A2E`, lab bg `#E870A0`/letter `#C44878`, forum bg `#C89898`/letter `#6E1830`.

**E. House *page* backgrounds — `src/pages/*` (a fifth set):** campus `#2E6B4A` + pattern `#1A3A2E` (`CampusPage.tsx:8–9`), neighborhood `#889460` + `#4A5A30` (`NeighborhoodPage.tsx:12–13`), events `#D4857A` + `#C13B2A`, lab `#E870A0` + `#C44878`, political-club `#6E1830` + `#C83858` (`PoliticalClubPage.tsx:10–11`), liberal-arts `#5C1010` + `#B52828` (`LiberalArtsPage.tsx:8–9`), people `#C49040` + `#B65D19`, story `#D4BA58` + `#8A7A20`.

**Flags:**
- **The `houses.ts` `color` field is effectively orphaned for the visible houses.** Set C/D/E have superseded it. It survives only as a fallback (`HouseBanner.tsx:98` `pair?.bg ?? house.color`) and is otherwise dead for the 5 visible houses. Either it should become the single source of truth that the others derive from, or it should be removed to stop implying it's authoritative.
- **Campus is the worst case: four distinct hues** — `#457B9D` (houses.ts, a blue) vs `#2B5A48` (hero/banner, a forest green) vs `#2E6B4A` (page bg, a brighter green) vs `#1A3A2E` (pattern). The houses.ts value is a *different color family* (blue) from everything the user actually sees (green).
- **School/Education has a hue conflict, not just a shade drift:** `#1D3557` (houses.ts — dark navy) vs `#C41E20`/`#5C1010`/`#B52828` (hero/banner/page — reds). Navy and red are not reconcilable as "the same accent."
- **Forum/Political Club has 5 values** across houses.ts `#CC2936`, hero `#8a7a6a`, banner bg `#C89898`/letter `#6E1830`, page `#6E1830`/`#C83858`. (It's hidden from nav per FRAC-161, which partly explains the drift, but the page still ships.)
- **Cream near-duplicates:** `#f7f6f2` (stale comment), `--background` HSL, `#faf8f5`, `rgba(250,248,245,…)`. Worth collapsing to one token.
- **Charcoal near-duplicates:** `#171717` token vs `#1a1a1a` literals.
- **HSL-vs-hex split:** base tokens are HSL `:root` vars; everything house- and page-specific is raw hex literals bypassing the token system entirely. There is no token bridge between the two worlds.
- **`.dark` block is defined (`index.css:75–103`) but dark mode is not wired.** There is no `ThemeProvider`, no `dark` class toggle, and no `next-themes` provider in the app — the only `useTheme()` consumer is the unused `sonner.tsx` toast. The entire `.dark` token set is dead config. (Confirmed: zero `dark:` utilities outside vendored `src/components/ui/**`.)

## 3. Layout strategy

- **Horizontal padding is genuinely two-system:** `px-[4.5%]` (31 occurrences) and `px-6` (30) dominate, with `px-8` (8) as a third. `px-[4.5%]` is the editorial full-bleed convention; `px-6` tends to appear in cards/inner blocks. The split is *mostly* principled but not documented, so new code picks one by coin-flip. Worth codifying "page gutters = `px-[4.5%]`, component insets = `px-6`."
- **Container widths are scattered:** `max-w-3xl` (21), `max-w-7xl` (19), then a long tail (`xs`, `sm`, `2xl`, `4xl`, `5xl`, `6xl`, `lg`, `md`…). `max-w-3xl` for prose and `max-w-7xl` for full sections is a reasonable two-tier system hiding inside the noise, but the tail suggests one-off tuning rather than a scale.
- **Vertical rhythm has outliers but a recognizable spine:** `py-40` (4) / `py-60` (1) / `py-48` (1) for big section breaks, `py-24`/`py-16` mid, `py-5`/`py-3` for chrome. It's coherent enough; `py-60` (240px) on `Home.tsx:25` is the largest single jump and may feel cavernous at 375px.
- **Mobile-first is mostly respected** via `flex`/`grid` + `md:` progressive enhancement. The clearest 375px risk is in `src/components/layout/Navbar.tsx`, which sets Jacquard display caps at fixed pixel sizes (`fontSize: "82px"` `:163`, `"50px"` `:255`, `"42px"` `:200`) with no responsive step — those can overflow or dominate a 375px viewport. `SectorHeader.tsx:14` handles this correctly by contrast (`text-[7rem] md:text-[14rem]`), which is the pattern Navbar should follow.
- **Section scaffolding is consistent across house pages** — each is `<main style={{backgroundColor}}> → <FractalPattern> → <Navbar> → content → <Footer>`. That consistency is a real strength; the only variation is whether text is `text-white` vs `text-foreground`, decided ad hoc per page based on the bg color's darkness rather than computed.

## 4. Fonts and how they are used

- **`--font-sans` and `--font-mono` resolve to the identical family** (`'JetBrains Mono', monospace`, `index.css:6,8`). This is almost certainly vestigial shadcn scaffolding — there's no design reason for two token names pointing at one font. `font-mono` is used ~10× and `font-sans` ~3×; collapsing them (or making `font-sans` an actual sans) would remove a latent footgun where someone assumes they differ.
- **The global heading/`.font-serif` rules over-reach.** Forcing uppercase+italic on *all* serif text (`index.css:118–128`) means the larger, more "designed" Fraunces moments (Vision pull-quote `Vision.tsx:17`, Projects `Projects.tsx:31`, house-page hero lines) all have to escape via `normal-case` + inline `fontStyle:"normal"`. The de-facto truth is "Fraunces is usually title-case roman, occasionally uppercase-italic" — the global default encodes the rarer case. This is the root cause of the override sprawl noted in §1.
- **Inline escapes are the de-facto exception API.** `style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}` recurs verbatim across `Home.tsx:30`, `EventsPage.tsx:19,50,63`, `LabPage.tsx:27`, `NeighborhoodPage.tsx:22`, `PoliticalClubPage.tsx:19`, `PeoplePage.tsx:22`, `StoryPage.tsx:211`, `Campus.tsx:184`, `LiberalArts.tsx:13`. That this exact triple is copy-pasted ~12 times is a clear signal it should be a single utility class (e.g. `.display-roman`) rather than repeated inline.
- **Jacquard 24** is used intentionally and in a contained way — only as single display caps (`Navbar.tsx`, `SectorHeader.tsx:15`, `HouseBanner.tsx:141`) — and is correctly exempted from the uppercase/italic rules via `[style*="Jacquard"]` (`index.css:130`). This part of the font system is clean.
- **Fraunces opsz/weight axes:** the import pulls the full `9..144` optical-size and `100..900` weight range (`index.css:1`), but actual usage clusters at `fontWeight: 300` and default. The full variable range is justified only if heavier display weights are coming; otherwise it's bundle weight for unused axes.

## 5. Buttons / interactive primitives

- **The shadcn `Button` component is dead for the actual product.** `src/components/ui/button.tsx` — with its five variants, `hover-elevate`/`active-elevate-2`, and four decorative Mandelbrot corner spans — is imported only by other vendored `ui/**` components (`pagination`, `calendar`, `carousel`, `sidebar`, `alert-dialog`, `input-group`) and one test. **No page or section uses it.** The real site's interactive elements are raw `<a className="underline underline-offset-2 hover:text-foreground">` (e.g. `Home.tsx:39–73`). So the documented button system and the shipped button reality have fully diverged.
- **Consequence — no focus-visible coverage on real CTAs.** Across all pages + `sections/` + `layout/` + `house/`, `focus-visible`/`focus:` appears only **twice**. The raw `<a>` links that constitute the site's real navigation and external links have no visible keyboard-focus indicator. The shadcn Button *has* `focus-visible:ring-1` (`button.tsx:9`) — but nothing ships it. This is the most concrete a11y gap in the audit.
- **`link-underline` utility is defined but unused.** `index.css:155` ships a polished cubic-bezier underline-grow hover, but `grep` finds zero consumers. Meanwhile links use a plainer `hover:underline`/`underline-offset-2`. The nicer primitive exists and isn't wired up — low-effort, high-polish win.
- **Three.js tooltips are the other interactive surface** (`OctahedronHero.tsx:714–735`) and are handled thoughtfully (tap-vs-drag discriminator, reveal-then-navigate on touch). That's solid; just note it's a bespoke interaction model living entirely outside the Button/link system.

## 6. Shaders / textures / effects / motion

- **`prefers-reduced-motion` is honored in exactly one place.** `OctahedronHero.tsx:32–45` has a proper hook, and it gates the nav-node glow pulse (`:668`). But it does **not** gate: the octahedron auto-rotation (`OctahedronHero.tsx:798`), the scrolling "THE PROTOCOL" edge-text textures (`:251` `offset.x -= delta*0.15`), the node scale-pulse (`:659`), or the **`FadeIn` component** (`ui/FadeIn.tsx`) which drives nearly every entrance animation on the site (via `SectorHeader` and direct use). For a user who has asked for reduced motion, the most pervasive animation (FadeIn) and the most prominent one (a perpetually rotating, text-streaming 3D object) both keep moving. This is a real accessibility gap, not a nitpick.
- **Dead CSS effects.** `hero-text-shadow` (`index.css:151`), `animate-blink`/`@keyframes blink` (`:169–176`), `border-grid` (`:146`), and `link-underline` (`:155`) — `grep` finds no consumers for any of them outside `index.css` itself. Several polished utilities are defined and unused.
- **The noise texture** (`index.css:114`, inline SVG feTurbulence at `opacity 0.03`) is a nice tactile touch and correctly applied once on `body`. No issue — just note it compounds with the contrast concern in §7 on low-contrast text.
- **The octahedron is well-engineered.** Per-face material groups, the deliberate bypass of React Suspense for progressive texture loading (`OctahedronHero.tsx:465–496`, well-documented), and the tube-based streaming-text are all thoughtful. The face-tint *colors* are out of scope (FRAC-20); the *mechanism* is sound.
- **`FadeIn` ease curve** `[0.21,0.47,0.32,0.98]` (`FadeIn.tsx:42`) and `link-underline`'s `cubic-bezier(0.65,0.05,0.36,1)` are two different "house" easing curves. Minor, but a single motion-easing token would tighten the system.

## 7. General code health

- **`src/components/three/FractalObject.tsx` is dead code.** Nothing imports it — `FractalCityScene.tsx:9` imports `FractalObject` from `./OctahedronHero`, not from the standalone file (confirmed by grep: zero imports of `three/FractalObject`). The standalone file additionally carries (a) the old "Fractal Bright" palette from set B (`#E07A5F`, `#8B7355`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A`), (b) **Political Club still visible in nav** (`FractalObject.tsx:43`) contradicting FRAC-161, and (c) the old `onClick` handlers that caused the iOS-scroll regression OctahedronHero was rewritten to fix. Keeping it around is an active trap — a future agent could re-point the import and silently regress three separate things.
- **`BadgePlayground.tsx`** is a dev-only scratch page with its own off-palette colors (`#0a0a0a`, `#a855f7`, `#6B7280`) — fine as a playground, but it ships in `src/pages/` with no guard; worth confirming it's route-gated or removed for production.
- **A11y / contrast:** `--muted-foreground: 0 0% 40%` on the cream `#f7f6f2`/`#faf8f5` surface (used as `text-foreground/80`, `/70`, `/60` in many places, e.g. `Home.tsx:36`, `Campus.tsx:163,206`) lands near or below the WCAG AA 4.5:1 floor for body text, and the noise texture erodes it further. The white-text-on-saturated-bg pages compute legibility ad hoc (`isDark()` in `HouseBanner.tsx:8`) rather than from a contrast guarantee.
- **`isDark()` luminance helper** (`HouseBanner.tsx:8`) is a local one-off; the same white-vs-charcoal decision is made by hand on every house page (`text-white` vs `text-foreground`). Centralizing it would prevent per-page drift.
- **CLAUDE.md adherence:** mobile-first is largely followed; the Navbar fixed-px Jacquard sizes (§3) are the clearest deviation worth a ticket.

---

## Top 5 highest-confidence issues

1. **Each house is colored independently in 4–5 files that disagree — `houses.ts color` is orphaned, and campus (blue vs green) + school (navy vs red) are hue-level conflicts, not shade drift.** — `src/data/houses.ts:195–281`, `OctahedronHero.tsx:111–115,374–383`, `HouseBanner.tsx:20–33`, `CampusPage.tsx:8` — severity: critical
2. **`FractalObject.tsx` is dead code carrying the stale palette, a still-visible Political Club nav node (violates FRAC-161), and the old onClick iOS-scroll regression — a re-import trap.** — `src/components/three/FractalObject.tsx:37–46` — severity: warning
3. **The site's real CTAs are raw `<a>` links with essentially no `focus-visible` indicator (only 2 occurrences site-wide); the shadcn `Button` that has focus styling is unused by every page.** — `src/components/ui/button.tsx` (unused), `src/pages/Home.tsx:39–73` — severity: critical
4. **`prefers-reduced-motion` gates only the octahedron glow pulse; `FadeIn` (used site-wide), the auto-rotation, and the scrolling edge-text all ignore it.** — `src/components/ui/FadeIn.tsx`, `OctahedronHero.tsx:251,798` — severity: warning
5. **The global uppercase+italic serif rule encodes the rare case, forcing a verbatim `style={{textTransform:"uppercase",fontStyle:"normal"}}` escape copy-pasted ~12× plus `normal-case` everywhere; `.dark` tokens and several CSS utilities (`link-underline`, `hero-text-shadow`, `animate-blink`) are dead.** — `src/index.css:75–103,118–128,151–176` — severity: warning
