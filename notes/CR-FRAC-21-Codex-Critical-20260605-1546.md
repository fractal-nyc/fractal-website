# Visual Layer Audit — FRAC-21 — Codex Critical

**Auditor:** Codex (Critical)
**Timestamp:** 20260605-1546
**Files reviewed:** `src/index.css`, `src/data/houses.ts`, `src/pages/**`, `src/components/**`, `src/components/three/**`

## 1. Design style overall
- The site is not operating from one visual language. The global system says warm cream + charcoal editorial (`src/index.css:45-47`), but most destination pages switch to saturated, per-page full-screen backgrounds with inline hex values (`src/pages/CampusPage.tsx:8`, `src/pages/LiberalArtsPage.tsx:8`, `src/pages/LabPage.tsx:16`). This turns the "Asimov Collective" surface into page-local poster art.
- The strongest brand typography rules are repeatedly escaped with inline `fontStyle: "normal"` on Fraunces CTAs/headlines (`src/pages/Home.tsx:29-30`, `src/pages/EventsPage.tsx:19`, `src/pages/PeoplePage.tsx:22`). If these are intentional exceptions, they need system names; if not, the global heading rule is too blunt.
- The home hero search is functional, but its visual treatment is custom and isolated: hardcoded cream backgrounds, 30px input height, absolute bottom placement (`src/components/sections/Hero.tsx:90-121`). It does not share tokenized form/button primitives with the rest of the system.
- The `BadgePlayground` route is a dark, purple-accented tuning UI full of inline styles (`src/pages/BadgePlayground.tsx:79-113`). If it is reachable in production, it breaks the editorial aesthetic entirely; if it is not, it is dead visual surface.

## 2. Color palette in actual use
- Inventory: root tokens use HSL for background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring (`src/index.css:44-72`), plus a `.dark` token block (`src/index.css:75-102`). House data uses stale hexes `#8B7355`, `#E07A5F`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A` (`src/data/houses.ts:195`, `src/data/houses.ts:210`, `src/data/houses.ts:227`, `src/data/houses.ts:248`, `src/data/houses.ts:264`, `src/data/houses.ts:280`).
- Inventory: current visual pages/navbar/banner/octahedron use a different "elegant" set: `#D4BA58`, `#2B5A48`, `#889460`, `#D4857A`, `#C41E20`, `#E870A0`, `#C49040`, `#6E1830` (`src/components/layout/Navbar.tsx:8-15`, `src/components/house/HouseBanner.tsx:20-32`, `src/components/three/OctahedronHero.tsx:374-382`). The user-flagged FRAC-17 face/nav colors appear here; this audit does not endorse them.
- Palette source of truth is split at least four ways: `HOUSES.color` (`src/data/houses.ts:35`), `Navbar.sectionLinks` (`src/components/layout/Navbar.tsx:7-16`), `HouseBanner.ELEGANT_PAIRS` (`src/components/house/HouseBanner.tsx:20-33`), and `OctahedronHero.FACE_SECTION_COLORS` (`src/components/three/OctahedronHero.tsx:374-382`). This guarantees drift.
- The base cream is duplicated/near-duplicated: token comment says `#f7f6f2` for `--background` (`src/index.css:46`), home/hero hardcode `#faf8f5` (`src/pages/Home.tsx:25`, `src/components/sections/Hero.tsx:90`), and shadow/tooltips use `rgba(250,248,245,...)` (`src/index.css:152`, `src/components/three/OctahedronHero.tsx:764`).
- `.dark` defines a full palette (`src/index.css:75-102`), but no reviewed app/page/layout code toggles the `.dark` class; it is apparently a vestigial token block while dark-looking pages are implemented with inline hex backgrounds (`src/pages/CampusPage.tsx:8`, `src/pages/PoliticalClubPage.tsx:10`).
- Non-system palettes are leaking in: skyline SVG greys (`src/components/sections/SkylineSilhouette.tsx:12-26`), three.js skyline blues (`src/components/three/Skyline.tsx:13-17`), purple playground controls (`src/pages/BadgePlayground.tsx:43`, `src/pages/BadgePlayground.tsx:107`), and lab focus rings tied to old lab purple (`src/components/lab/ArchiveSearch.tsx:45`).

## 3. Layout strategy
- Container strategy is inconsistent: home uses bare `px-[4.5%]` with no max width (`src/pages/Home.tsx:25-26`), story uses `max-w-6xl mx-auto px-6 md:px-[4.5%]` (`src/pages/StoryPage.tsx:208`), gallery uses `max-w-7xl px-4 md:px-8 lg:px-12` (`src/components/gallery/PhotoGallery.tsx:24`), and directory uses `max-w-7xl px-[4.5%]` (`src/components/sections/Directory.tsx:20`).
- Vertical rhythm has no coherent scale: home jumps to `py-40 md:py-60` (`src/pages/Home.tsx:25`), directory uses `py-24 md:py-40` (`src/components/sections/Directory.tsx:19`), house grids use `py-10 md:py-16` (`src/components/house/HouseBannerGrid.tsx:16`), and individual pages use `pb-32 md:pb-48` (`src/pages/EventsPage.tsx:14`).
- Mobile 375px risk: Events embeds an iframe container with `h-[80vh] min-h-[600px] md:h-[850px]` (`src/pages/EventsPage.tsx:27`), forcing a very tall module on the baseline mobile viewport before CTAs.
- Mobile 375px risk: the full home hero keeps a fixed navbar blurb at `fontSize: "8px"` plus logo and nav letters (`src/components/layout/Navbar.tsx:194-243`), while the search bar is also absolutely pinned at the bottom of the same first viewport (`src/components/sections/Hero.tsx:96-121`). This is fragile at 375px height/width combinations.
- `HouseBanner` grid banners use `aspect-[1/3]` (`src/components/house/HouseBanner.tsx:109`) inside a `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` layout (`src/components/house/HouseBannerGrid.tsx:31`), producing very tall narrow cards on 375px with tiny `text-[10px]` taglines (`src/components/house/HouseBanner.tsx:150-151`).

## 4. Fonts and how they are used
- `font-sans` and `font-mono` both resolve to JetBrains Mono (`src/index.css:6-8`). That makes `font-sans` semantically meaningless and hides whether code expects a sans or mono family.
- The global `body` uppercases all text (`src/index.css:110-113`), then headings and `.font-serif` uppercase/italic again (`src/index.css:117-128`). The result is a cascade that components must fight with `normal-case` and inline styles (`src/components/sections/Directory.tsx:24`, `src/components/sections/Campus.tsx:218`).
- Jacquard escapes are implemented through a brittle substring selector `[style*="Jacquard"]` (`src/index.css:130-133`) rather than a class/token. It only works for inline style strings and will miss class-based or variable-based font usage.
- Fraunces imports the full opsz/wght/italic axes (`src/index.css:1`), but most hero/page headings hardcode weight 300 and normal style inline (`src/pages/Home.tsx:29-30`, `src/components/layout/Navbar.tsx:168-169`). The axis is loaded broadly while usage is narrow and inconsistent.
- Navbar branding uses hardcoded pixel sizes and clamp values instead of type tokens (`src/components/layout/Navbar.tsx:163`, `src/components/layout/Navbar.tsx:200`, `src/components/layout/Navbar.tsx:323-329`), making typography responsive by component exception rather than system scale.

## 5. Buttons / interactive primitives
- The custom `Button` component exists (`src/components/ui/button.tsx:8-43`), but primary page CTAs are mostly raw `<a>` elements with duplicated classes (`src/pages/EventsPage.tsx:55`, `src/pages/PoliticalClubPage.tsx:26`, `src/components/sections/LiberalArts.tsx:41`). This fragments padding, focus, hover, and decoration.
- Many custom CTAs lack any `focus-visible` styling: Events CTAs only define hover/transition classes (`src/pages/EventsPage.tsx:55`, `src/pages/EventsPage.tsx:70`), People CTA does the same (`src/pages/PeoplePage.tsx:29`), and Neighborhood CTA does the same (`src/pages/NeighborhoodPage.tsx:63`).
- Navbar menu buttons have no accessible name beyond the icon and no focus styling (`src/components/layout/Navbar.tsx:282-287`, `src/components/layout/Navbar.tsx:308-313`, `src/components/layout/Navbar.tsx:334-339`). They should expose `aria-label`/state and visible keyboard focus.
- The search dropdown renders clickable `li role="option"` nodes with mouse handlers (`src/components/sections/Hero.tsx:135-149`). They are not native buttons/options, so pointer users get behavior that keyboard/screen-reader users may not get consistently.
- Three.js HTML tooltips are clickable `div`s (`src/components/three/OctahedronHero.tsx:715-730`), and the underlying meshes are pointer-only hit targets (`src/components/three/OctahedronHero.tsx:737-753`). The hero nav is not keyboard accessible.
- `Button` variants reference undefined design variables such as `--button-outline`, `--primary-border`, `--destructive-border`, and `--secondary-border` (`src/components/ui/button.tsx:16-26`), while `src/index.css` only defines `--border`, `--input`, and `--ring` (`src/index.css:70-72`).

## 6. Shaders / textures / effects / motion
- `FadeIn` always animates from opacity/offset and has no `prefers-reduced-motion` branch (`src/components/ui/FadeIn.tsx:28-43`), yet it is used across pages and sections (`src/pages/Home.tsx:27-35`, `src/components/sections/Campus.tsx:176-210`).
- `OctahedronHero` respects reduced motion for nav-node emissive pulsing only (`src/components/three/OctahedronHero.tsx:638-677`), but auto-rotation and scrolling edge text still run unconditionally (`src/components/three/OctahedronHero.tsx:249-253`, `src/components/three/OctahedronHero.tsx:796-800`).
- `SierpinskiCarpet` runs resize and animation RAF loops without checking reduced motion (`src/components/sections/SierpinskiCarpet.tsx:230-241`, `src/components/sections/SierpinskiCarpet.tsx:251-264`).
- Global blink animation has no reduced-motion guard (`src/index.css:169-175`). If used, it will keep blinking for users who requested less motion.
- Tooltip and hero shadow colors are hardcoded translucent cream/charcoal instead of tokens (`src/index.css:151-152`, `src/components/three/OctahedronHero.tsx:762-775`), making effects detached from background token changes.
- The standalone `FractalObject.tsx` still contains the old icosahedron palette and pointer-capture-sensitive click handlers (`src/components/three/FractalObject.tsx:37-45`, `src/components/three/FractalObject.tsx:187-203`), while live city scene imports `FractalObject` from `OctahedronHero` instead (`src/components/three/FractalCityScene.tsx:7-9`).

## 7. General code health
- Dead/vestigial 3D code: `FractalCityScene` comments out the standalone `FractalObject` import and imports from `OctahedronHero` (`src/components/three/FractalCityScene.tsx:7-9`), but `src/components/three/FractalObject.tsx` remains with old colors and old interaction behavior (`src/components/three/FractalObject.tsx:37-45`, `src/components/three/FractalObject.tsx:109-120`).
- Hidden routes are inconsistently represented visually: `HIDDEN_HOUSE_IDS` hides forum from banner UI (`src/data/houses.ts:296-303`), navbar hides Political Club and People (`src/components/layout/Navbar.tsx:18-23`), but `sectionLinks` and colors still include both (`src/components/layout/Navbar.tsx:7-16`) and octahedron face map still includes forum/people faces (`src/components/three/OctahedronHero.tsx:388-397`).
- `BadgePlayground` looks like internal tooling but lives under `src/pages` and carries extensive inline non-system styling (`src/pages/BadgePlayground.tsx:79-113`). This is either route bloat or an ungoverned production page.
- Button/theme contract is broken by undefined CSS variables in button variants (`src/components/ui/button.tsx:16-26`) and absent corresponding declarations in the root token block (`src/index.css:44-72`).
- A11y contrast should be audited for page-local saturated backgrounds: several pages set `text-foreground` on colored backgrounds (`src/pages/StoryPage.tsx:201`, `src/pages/LabPage.tsx:16`, `src/pages/NeighborhoodPage.tsx:12`) while other pages manually force `text-white` (`src/pages/CampusPage.tsx:8`, `src/pages/LiberalArtsPage.tsx:8`). The contrast strategy is ad hoc.

## Top 5 highest-confidence issues
1. Palette source of truth is split across data, navbar, banners, pages, and octahedron — `src/data/houses.ts:195` — severity: critical
2. Custom CTAs and nav controls lack visible keyboard focus/accessibility semantics — `src/pages/EventsPage.tsx:55` — severity: critical
3. Reduced-motion handling is partial; FadeIn, edge text, auto-rotation, blink, and canvas animation still run — `src/components/ui/FadeIn.tsx:28` — severity: critical
4. Button variants reference CSS variables that are not declared in the root theme — `src/components/ui/button.tsx:16` — severity: warning
5. Standalone `FractalObject.tsx` is dead/vestigial and preserves the old palette/interaction model — `src/components/three/FractalCityScene.tsx:7` — severity: warning
