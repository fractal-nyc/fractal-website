# Visual Layer Audit — FRAC-21 — Codex Standard

**Auditor:** Codex (Standard)
**Timestamp:** 20260605-1546
**Files reviewed:** `src/index.css`, `src/data/houses.ts`, `src/components/three/*`, `src/components/layout/*`, `src/components/sections/*`, `src/components/house/*`, `src/components/ui/{button,FadeIn,AvatarBadge,MandelbrotCorners}.tsx`, `src/pages/*`, `src/App.tsx`

## 1. Design style overall
The core editorial system is clear: HSL background/foreground tokens, global uppercase body text, Fraunces italic headings, and a light tactile noise surface establish the Asimov Collective baseline in `src/index.css:44` and `src/index.css:110`. The issue is that multiple route pages now use saturated full-page house-color backgrounds instead of the warm off-white site surface, for example Events `src/pages/EventsPage.tsx:10`, Neighborhood `src/pages/NeighborhoodPage.tsx:12`, Campus `src/pages/CampusPage.tsx:8`, Liberal Arts `src/pages/LiberalArtsPage.tsx:8`, Lab `src/pages/LabPage.tsx:16`, and People `src/pages/PeoplePage.tsx:12`. This can be intentional for sector pages, but the treatment is not represented as tokens and reads as a second visual system beside the editorial baseline.

The home page still uses the warm editorial base, but it hardcodes a near-token cream `bg-[#faf8f5]` in the hero/section layer at `src/components/sections/Hero.tsx:90` and `src/pages/Home.tsx:25`, while `--background` is declared as HSL with a comment claiming `#f7f6f2` at `src/index.css:46`. That makes the canonical cream ambiguous.

Mobile-first conformance is partly protected by explicit mobile variants, but there are still page-level choices that are risky at the 375px baseline. The Events calendar frame enforces `min-h-[600px]` inside a mobile section at `src/pages/EventsPage.tsx:27`, and the Protocol graphic uses `w-[80%]` plus `max-w-[800px]` rather than a shared mobile container at `src/pages/ProtocolPage.tsx:11`. Neither is obviously broken, but they show that similar full-screen visual modules are not using the same layout contract.

## 2. Color palette in actual use
Inventory observed:

- Core light tokens: `--background: 40 25% 96%`, `--foreground: 0 0% 9%`, `--card: 40 25% 98%`, `--secondary/--muted: 40 10% 90%`, `--accent: 40 15% 88%`, `--destructive: 0 84% 60%`, `--border/--input: 40 10% 85%` in `src/index.css:44`.
- Core dark tokens: charcoal background/card, warm foreground, dark muted/accent/border, and darker destructive in `src/index.css:75`.
- House data accents: `#8B7355`, `#E07A5F`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A` in `src/data/houses.ts:195`, `src/data/houses.ts:210`, `src/data/houses.ts:227`, `src/data/houses.ts:248`, `src/data/houses.ts:264`, and `src/data/houses.ts:280`.
- Current nav/face palette: `#889460`, `#D4857A`, `#2B5A48`, `#C41E20`, `#E870A0`, plus `#D4BA58`, `#8a7a6a`, `#C49040`, and `#c4a265` in `src/components/three/OctahedronHero.tsx:110`, `src/components/three/OctahedronHero.tsx:173`, `src/components/three/OctahedronHero.tsx:374`, and `src/components/three/OctahedronHero.tsx:501`.
- Standalone legacy object palette: old house colors and warm glow colors (`#E07A5F`, `#8B7355`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A`, `#ddbb77`, `#cc9944`, `#bb8844`, `#cc9955`, `#ddaa66`) in `src/components/three/FractalObject.tsx:37`, `src/components/three/FractalObject.tsx:217`, and `src/components/three/FractalObject.tsx:291`.
- Page and component hardcoded colors: sector backgrounds and pattern colors such as `#D4857A/#C13B2A` at `src/pages/EventsPage.tsx:10`, `#889460/#4A5A30` at `src/pages/NeighborhoodPage.tsx:12`, `#E870A0/#C44878` at `src/pages/LabPage.tsx:16`, and banner pairs in `src/components/house/HouseBanner.tsx:20`.

The largest palette issue is that house color source-of-truth has split. `src/data/houses.ts` still declares the older accents (`#8B7355`, `#E07A5F`, etc.) at `src/data/houses.ts:195`, while Navbar, HouseBanner, route pages, and the octahedron use the newer saturated set (`#889460`, `#D4857A`, `#2B5A48`, `#C41E20`, `#E870A0`) at `src/components/layout/Navbar.tsx:8`, `src/components/house/HouseBanner.tsx:20`, and `src/components/three/OctahedronHero.tsx:110`. Per context, the recent octahedron face-tint colors are already flagged wrong, so this audit should not treat them as canonical.

The dark palette appears defined but not product-wired. `.dark` variables exist at `src/index.css:75`, and some shadcn components carry `dark:` classes, but the top-level app mounts only providers/router/toaster and does not apply or toggle a `dark` class at `src/App.tsx:50`. The dark block is therefore a dormant second palette unless another out-of-band mechanism exists.

The cream surface has near-duplicates: token comment says `#f7f6f2` at `src/index.css:46`, hero shadows use rgba values equivalent to `#faf8f5` at `src/index.css:152`, and home/hero hardcode `#faf8f5` at `src/pages/Home.tsx:25` and `src/components/sections/Hero.tsx:114`.

## 3. Layout strategy
Container strategy is inconsistent. Some areas use full-width sections with `px-[4.5%]` (`src/pages/Home.tsx:25`, `src/components/house/HouseBannerGrid.tsx:17`), some use mobile `px-6 md:px-[4.5%]` (`src/pages/EventsPage.tsx:15`, `src/pages/NeighborhoodPage.tsx:18`), and some add `max-w-* mx-auto` around those same paddings (`src/pages/StoryPage.tsx:208`, `src/components/sections/Campus.tsx:215`). These are all reasonable in isolation, but there is no visible rule for when the site uses viewport-percent gutters versus fixed mobile gutters versus max-width containers.

Vertical rhythm has a similar split. The home editorial section jumps to `py-40 md:py-60` at `src/pages/Home.tsx:25`, Events uses `pb-32 md:pb-48` at `src/pages/EventsPage.tsx:14`, HouseBannerGrid uses `py-10 md:py-16` at `src/components/house/HouseBannerGrid.tsx:16`, and Projects uses `py-24 md:py-40` at `src/components/sections/Projects.tsx:26`. The scale is coherent emotionally but not codified, so page authors are reselecting large spacing values ad hoc.

The Events calendar module is the clearest 375px risk: `h-[80vh] min-h-[600px] md:h-[850px]` at `src/pages/EventsPage.tsx:27` guarantees a very tall embed on small screens and may push primary actions far below the first viewport. This is not horizontal overflow, but it does conflict with mobile-first wayfinding by making the first interactive content expensive to reach.

## 4. Fonts and how they are used
The global font rules are unusually strong: `body` uppercases all text at `src/index.css:110`, every heading gets `font-serif font-normal italic`, uppercase, and `letter-spacing: 0.04em` at `src/index.css:117`, and `.font-serif` itself forces uppercase italic at `src/index.css:125`. This produces a strong editorial voice, but it also forces many components to escape the rule with inline styles.

Those de-facto exceptions are widespread: home H2 disables italic while retaining uppercase at `src/pages/Home.tsx:30`, Events headings repeat `fontStyle: "normal"` at `src/pages/EventsPage.tsx:19`, `src/pages/EventsPage.tsx:50`, and `src/pages/EventsPage.tsx:63`, Navbar brand/link fragments reset `textTransform` and `fontStyle` at `src/components/layout/Navbar.tsx:60` and `src/components/layout/Navbar.tsx:168`, and Sector/Header-like banners use Jacquard inline styles at `src/components/layout/SectorHeader.tsx:15` and `src/components/house/HouseBanner.tsx:141`. This suggests the actual font system has named exceptions that are not encoded as utilities.

`font-sans` and `font-mono` both resolve to JetBrains Mono in `src/index.css:6` and `src/index.css:8`. That may be intentional for a mono-bodied site, but it makes the `font-sans` token semantically misleading and keeps shadcn defaults visually mono even where component code expects a neutral sans.

The imported Fraunces axis range is broad (`100..900`, opsz `9..144`) at `src/index.css:1`, while the implementation mostly uses CSS `fontWeight: 300` escapes and `font-normal` at `src/index.css:119`. The weight axis is technically available, but the design system does not expose named weights or optical-size decisions.

## 5. Buttons / interactive primitives
There is a decorated Button primitive with variants and Mandelbrot corner adornments in `src/components/ui/button.tsx:8`, but many user-facing CTAs bypass it. Events uses inline anchor button classes at `src/pages/EventsPage.tsx:53` and `src/pages/EventsPage.tsx:66`, Neighborhood does the same at `src/pages/NeighborhoodPage.tsx:59`, and Campus defines its own `PrimaryButton` at `src/components/sections/Campus.tsx:130`. These patterns share enough styling to deserve one primitive, but they currently diverge in background treatment, padding, and focus behavior.

The Button primitive has a focus-visible ring at `src/components/ui/button.tsx:9`, while custom CTA anchors generally only define hover/transition classes and no explicit `focus-visible` state, for example `src/pages/EventsPage.tsx:55` and `src/components/sections/Campus.tsx:149`. Keyboard users can still rely on browser defaults in some cases, but the visual system does not guarantee an accessible focus indicator across CTA patterns.

The search dropdown uses `li role="option"` with click/mousedown handlers at `src/components/sections/Hero.tsx:135`, not buttons or anchors. Keyboard navigation is implemented on the input at `src/components/sections/Hero.tsx:63`, but pointer users are clicking non-interactive elements and screen readers do not get a standard combobox/listbox relationship from the input at `src/components/sections/Hero.tsx:103`.

## 6. Shaders / textures / effects / motion
The body noise texture is centralized and subtle at `src/index.css:110`, and the hero text-shadow utility uses the cream near-token rgba values at `src/index.css:151`. These fit the editorial system, but the shadow references `#faf8f5`-equivalent values rather than the background token.

Motion is not consistently reduced-motion aware. Octahedron nav node emissive pulse checks `prefers-reduced-motion` at `src/components/three/OctahedronHero.tsx:32` and `src/components/three/OctahedronHero.tsx:638`, but the center octahedron hover interpolation still runs every frame at `src/components/three/OctahedronHero.tsx:561`, streaming edge texture offsets always animate at `src/components/three/OctahedronHero.tsx:249`, and FadeIn animations do not check reduced motion at `src/components/ui/FadeIn.tsx:28`. Navbar scroll/overlay motion also animates unconditionally at `src/components/layout/Navbar.tsx:128` and `src/components/layout/Navbar.tsx:345`.

The standalone `FractalObject.tsx` still contains its own R3F motion and old palette, including continuous rotation at `src/components/three/FractalObject.tsx:279` and hover/node pulses at `src/components/three/FractalObject.tsx:151`. Since the live scene imports `FractalObject` from `OctahedronHero.tsx` at `src/components/three/FractalCityScene.tsx:9`, this standalone file looks like dead visual legacy rather than an active alternate.

Mandelbrot motifs are consistently present in buttons, footer, banners, and page decorations, for example Button corners at `src/components/ui/button.tsx:70`, footer accents at `src/components/layout/Footer.tsx:10`, and banner notches at `src/components/house/HouseBanner.tsx:159`. The motif is coherent, but because custom CTA anchors duplicate `CornerDecorations` outside the Button primitive at `src/pages/EventsPage.tsx:57`, motif application depends on copy-pasted patterns.

## 7. General code health
`src/components/three/FractalObject.tsx` is a strong dead-code candidate. `FractalCityScene` comments out the standalone import and imports `FractalObject` from `OctahedronHero.tsx` instead at `src/components/three/FractalCityScene.tsx:7` and `src/components/three/FractalCityScene.tsx:9`, while the standalone file still exports a component with an older icosahedron nav palette at `src/components/three/FractalObject.tsx:252`. Keeping it increases audit/design drift because it looks authoritative but is not live.

`BadgePlayground` is still routed in the app at `src/App.tsx:44` and uses a black/purple playground palette (`#0a0a0a`, `#a855f7`) at `src/pages/BadgePlayground.tsx:43` and `src/pages/BadgePlayground.tsx:79`. If this route is intended as internal tooling, it should probably be gated or excluded from the public visual layer; if it is public, it breaks the site aesthetic more than any production page.

The house color source split is also a code-health concern, not just a design concern. `HOUSES` declares a `color` field as the model source at `src/data/houses.ts:35`, but HouseBanner immediately overrides most ids with `ELEGANT_PAIRS` at `src/components/house/HouseBanner.tsx:20`, Navbar owns its own `sectionLinks` colors at `src/components/layout/Navbar.tsx:7`, and Octahedron owns another set at `src/components/three/OctahedronHero.tsx:110`. This makes future visual changes hard to apply consistently.

## Top 5 highest-confidence issues
1. House colors have multiple competing sources of truth across data, navbar, banners, pages, and octahedron — `src/data/houses.ts:195` — severity: warning
2. The standalone `FractalObject.tsx` appears dead but still carries the old palette and motion system — `src/components/three/FractalCityScene.tsx:9` — severity: warning
3. Custom CTA anchors bypass the shared Button primitive and lack consistent focus-visible styling — `src/pages/EventsPage.tsx:55` — severity: warning
4. Reduced-motion handling only covers part of the 3D scene; FadeIn, navbar motion, streaming text, and center interpolation still animate — `src/components/ui/FadeIn.tsx:28` — severity: warning
5. The canonical warm cream is ambiguous between HSL token/comment, `#faf8f5` hardcodes, and rgba shadow values — `src/index.css:46` — severity: info
