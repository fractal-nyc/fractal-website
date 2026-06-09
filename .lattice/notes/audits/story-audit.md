# Story page — typography + color audit

**Page slug:** story
**Source files:** `src/pages/StoryPage.tsx`, `src/components/sections/OriginStory.tsx`, `src/components/sections/NeighborhoodCampusDiagram.tsx`, `src/components/gallery/PhotoGallery.tsx`, `src/components/gallery/GalleryImage.tsx`
**Audit date:** 2026-06-09
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px
**Branch:** `frac-26-audit-story`

## Scope

### In scope (source of truth: StoryPage's import graph)

- `src/pages/StoryPage.tsx` (~251 lines) — the page entry. Owns the page-level
  `<main>` surface (line 201) with the raw-hex `#D4BA58` golden background,
  the `STORY_COLOR = "#D4BA58"` constant (line 18), the `TalkCard` component
  (lines 117–193) used in the talks grid, and the page outer sections.
- `src/components/sections/OriginStory.tsx` (~27 lines) — origin-narrative
  section, three `<p>` children inside a `space-y-4 text-sm md:text-base
  font-light` wrapper. Imports and renders `NeighborhoodCampusDiagram`.
- `src/components/sections/NeighborhoodCampusDiagram.tsx` (~216 lines) —
  invoked from OriginStory. Owns the `RING_COLOR = "#8A7A20"` /
  `RING_SOFT = "#8A7A2033"` constants (the deep accent paired with
  `STORY_COLOR`), PillarCard typography/color, CenterNode typography, and
  the SVG ring stroke color.
- `src/components/gallery/PhotoGallery.tsx` (~118 lines) — invoked from
  StoryPage. Pure layout (grids and FadeIn wrappers); the only color-token
  reference is the inherited `bg-muted` on the GalleryImage container.
- `src/components/gallery/GalleryImage.tsx` (~52 lines) — renders the
  `motion.div` container with `bg-muted` and `rounded-sm`. Framer Motion
  `boxShadow` animation is out of scope per audit-prompt §9.

### Out of scope (with rationale, per the plan)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#8A7A20" />`
  call site at `StoryPage.tsx:202` — explicitly excluded per FRAC-20 (Lab)
  and FRAC-24 (Campus) precedent. FractalPattern is a shared decorative SVG
  fill; not audited. The hex value at the call site (`#8A7A20`) is
  documented as an excluded site (parallels Campus's `<FractalPattern
  color="#1A3A2E" />` exclusion at `CampusPage.tsx:9`).
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` —
  shared chrome rendered on every page. Same exclusion rationale as
  Lab/Home/Campus. Note: `Navbar.tsx:20` declares `{ name: "Story",
  href: "/story", color: "#D4BA58" }` and `OctahedronHero.tsx:128,396` also
  reference `#D4BA58` — those are Navbar/OctahedronHero internals (shared
  chrome / 3D scene material) and remain out of scope. The Story page itself
  owns the canonical site-of-truth declaration at `StoryPage.tsx:18`.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across
  all house/non-house pages. Audited as a separate task. **Note:** Story's
  call-site prop `color="#8A7A20"` IS audited as part of `StoryPage.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked
  via `buttonVariants` (audit-prompt §4). Story does not use `Button` at all
  (the TalkCard is a raw `<a>`).
- `src/data/storyPhotos.ts` — pure data (image URLs, alt strings, aspect
  labels). No JSX, no Tailwind classes, no color tokens. Excluded as data
  layer per the Home audit's `OUTER_NAV_NODES` precedent.
- `src/components/pretext/PretextParagraph.tsx` and `src/lib/pretext.ts` —
  Pretext renderer mechanics. Story consumes `PretextParagraph` at two call
  sites (`StoryPage.tsx:179`, `:224`). **CALL SITES are in scope** (Lab
  precedent); component internals are out of scope.
- `src/hooks/use-pretext.ts` — hook layer, no UI.
- Image files under `public/images/story/` — raster content, out of scope
  per audit-prompt §9.
- Tests, configs, package files.

### House identity (Story has NO house — closest analog is Home)

**Story is NOT a house page.** Per DESIGN.md → House mapping, the six house
slugs are `house-visit-*`, `house-events-*`, `house-campus-*`,
`house-education-*`, `house-political-club-*`, `house-publications-*`.
**Story does not appear.** Per DESIGN.md → Components (OctahedronHero),
Story is the Story nav node (vertex 4 of the octahedron, replacing the
FRAC-36 Political Club placeholder per FRAC-47). Per the PRD § Site
Architecture, Story is a top-level page alongside Home and Protocol — not
one of the six houses.

Locked rules for Story:

- **No house token applies to Story.** `text-house-*` / `bg-house-*` on Story
  chrome is forbidden per DESIGN.md → Text foregrounds ("house colors do not
  cross page boundaries"). Walked: no house-token use found.
- **`#D4BA58` (Story golden / light) is NOT a canonical token.** It is the
  Navbar nav-node color (`Navbar.tsx:20`) and is re-declared at
  `StoryPage.tsx:18` (`STORY_COLOR`), used 6 times in StoryPage.tsx plus the
  inline `style={{ backgroundColor: "#D4BA58" }}` on `<main>`. DESIGN.md's
  31-token palette does NOT include this value. **Every `#D4BA58` use is a
  GAP** per audit-prompt §3 dead-value rule.
- **`#8A7A20` (Story deep) is also NOT a canonical token.** Appears as the
  SectorHeader prop (`StoryPage.tsx:209`), the FractalPattern prop
  (excluded), and `RING_COLOR` / `RING_SOFT` in NeighborhoodCampusDiagram.
  Same GAP classification.
- **Text-color choice on Story's golden bg.** `StoryPage.tsx:201` declares
  `text-foreground` (charcoal `#171717`) — not `text-background` (cream).
  This **diverges from the Lab/Campus precedent** (cream-on-saturated-house-
  bg per FRAC-42 paired-foreground). For Story, charcoal-on-gold is the
  editorial voice the source author chose. The audit accepts the choice:
  text-foreground is the canonical foreground token, charcoal-on-gold has
  high contrast at #D4BA58 luminance, and DESIGN.md → Text foregrounds
  permits both `text-foreground` and `text-background` on any surface. The
  divergence-from-house-precedent is captured in Forward observations.
- **Charcoal alpha-modified utilities** on Story's golden bg
  (`text-foreground/90`, etc., used in NeighborhoodCampusDiagram) — classify
  EXACT under the alpha-is-presentation rule.
- **`bg-muted` on GalleryImage** — classify EXACT (canonical surface token).
- **`STORY_COLOR` constant + inline-style references** — each separate
  hex-string concatenation site (`${STORY_COLOR}66`, `${STORY_COLOR}20` for
  translucent shades) is a distinct color use; grouped by `(file +
  token-cluster)` into one consolidated row covering all Story palette
  sites across `StoryPage.tsx` and `NeighborhoodCampusDiagram.tsx`.

### Inversion check

Story is NOT a house page; the forum/school inversion rule does not apply.
The page uses `#D4BA58` (lighter golden) as the page bg and `#8A7A20`
(deeper golden) as the accent — the same "{light} as bg, {deep} as accent"
pattern Campus uses, but with a non-canonical palette pair. No inversion
finding (no inversion rule to apply).

### Cross-house leak check

Walked `StoryPage.tsx`, `OriginStory.tsx`, `NeighborhoodCampusDiagram.tsx`,
`PhotoGallery.tsx`, `GalleryImage.tsx` for any `text-house-*` /
`bg-house-*` and the 12 house hex values (`#889460`, `#4A5A30`, `#D4857A`,
`#C13B2A`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`, `#C83858`,
`#6E1830`, `#E870A0`, `#C44878`) plus dead-token `#6B4C9A` and drift
`#1a1a1a`. **No cross-house leaks found** — Story's only declared color
values are `#D4BA58` (own golden light), `#8A7A20` (own golden deep), the
canonical surface tokens (`text-foreground`, `bg-background`, `bg-muted`,
`border-border`, `ring-ring`, `text-muted-foreground`), and the
selection-chrome utilities. The text-color cascade is `text-foreground`
throughout (page-level inheritance from `<main>`).

## Typography audit

```
Element: src/pages/StoryPage.tsx:211 — <p className="text-display mb-12 text-center">From a Single Apartment to a Neighborhood Campus</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). Same EXACT pattern as Lab's LabPage:27 and Campus's Campus.tsx:196 display-tier hero. Color: inherits text-foreground from <main> at line 201 — covered in color audit rows.
```

```
Element: src/pages/StoryPage.tsx:169 — <h3 className="text-subtitle leading-snug normal-case">{talk.title}</h3>
Current: family=Fraunces, weight=300, style=normal (DRIFT — h3 global rule sets italic; .text-subtitle resets style=normal so utility wins), transform=none (normal-case override), size=text-xl (mobile), text-2xl (md+), tracking=0.04em, leading-snug
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: Utility canonical. Drift: leading-snug (1.375) is a per-call-site override of the default; .text-subtitle does not pin a line-height, so this is acceptable drift. h3 wrapper pulls italic + uppercase from the global rule, but .text-subtitle explicitly sets font-style:normal and the normal-case className overrides text-transform — net rendering matches the spec. Identical pattern to Lab's DocumentBadge:94 — TalkCard's design is explicitly modeled after DocumentBadge per the StoryPage.tsx:115 source comment.
```

```
Element: src/pages/StoryPage.tsx:174 — <p className="text-sm text-foreground mt-1">{talk.author}, {talk.year}</p>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family (Inter vs JBM), weight (400 vs 500), transform (none vs uppercase), tracking (default vs 0.1em) — but the semantic role (inline metadata: author byline + year) matches .text-meta's intent, and size (text-sm) matches. Same NEAR pattern as Lab's DocumentBadge:99 (author byline). Color row covers text-foreground separately.
```

```
Element: src/pages/StoryPage.tsx:155 — <span className="text-eyebrow" style={{ color: STORY_COLOR }}>{categoryLabel}</span>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-eyebrow; typography is canonical. Same EXACT pattern as Lab's DocumentBadge:80. The inline style={{ color: STORY_COLOR }} (#D4BA58) is non-canonical and handled in the Story palette gap color row.
```

```
Element: src/pages/StoryPage.tsx:179 — <PretextParagraph size={TEXT_SIZES.base} className="text-foreground mt-3">{talk.description}</PretextParagraph>
Current: family=JetBrains Mono (FONTS.body), weight=400 (default), style=normal, transform=none, size=13px (TEXT_SIZES.base, inline), tracking=default
Nearest canonical utility: .text-body-lead
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Body-tier rendering at custom 13px JBM. .text-body-lead is Inter text-lg weight 300; .text-body is Inter text-base weight 400. Wrong family AND wrong size. No canonical body utility uses mono. Identical to Lab's LabPage:58 PretextParagraph GAP — covered by the Lab gap entry already in audit-gaps.md (Date 2026-06-08, Page lab). No new audit-gaps.md entry needed; the Story gap appendix references the Lab entry for traceability.
```

```
Element: src/pages/StoryPage.tsx:224 — <PretextParagraph size={TEXT_SIZES.lg} font={FONTS.body} className="text-foreground font-light max-w-5xl mx-auto text-center text-pretty mb-12">{…intro string…}</PretextParagraph>
Current: family=JetBrains Mono (FONTS.body, explicit), weight=300 (font-light className override), style=normal, transform=none, size=15px (TEXT_SIZES.lg, inline), tracking=default
Nearest canonical utility: .text-body-lead
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Body-tier rendering at custom 15px JBM weight 300. Same GAP profile as line 179 — no canonical body utility uses mono. Covered by the Lab Pretext gap entry; no new audit-gaps.md entry.
```

```
Element: src/components/sections/OriginStory.tsx:9 — <div className="space-y-4 text-sm md:text-base font-light"> rendering 3 <p> children (lines 10–18)
Current: family=Inter (body default), weight=300 (font-light), style=normal, transform=none, size=text-sm (mobile), text-base (md+), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: weight 300 (font-light) vs spec 400; mobile size text-sm vs spec text-base. Same NEAR pattern as Campus's body-paragraph cluster (Campus.tsx:233+) and Lab's DocumentBadge:103. The wrapper's typography cascades to the 3 <p> children at lines 10, 13, 16. One row per (file + utility) grouping covers all 4 elements (wrapper + 3 children).
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:77 — <h3 className="text-subtitle leading-tight normal-case">{pillar.title}</h3>
Current: family=Fraunces, weight=300, style=normal (DRIFT — h3 global rule sets italic; .text-subtitle resets style=normal so utility wins), transform=none (normal-case override), size=text-xl (mobile), text-2xl (md+), tracking=0.04em, leading-tight
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: Utility canonical. Drift: leading-tight is a per-call-site override (spec does not pin leading). Same pattern as StoryPage:169 TalkCard title and Lab's DocumentBadge:94. Renders at every PillarCard call site — PillarCard is rendered for each entry in PILLARS array (5 entries) via the .map at NeighborhoodCampusDiagram.tsx:185 → PillarCard at line 197. One row covers all 5 instances via (file + utility) grouping.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:81 — <ul className="space-y-1 text-xs md:text-sm leading-snug text-foreground/90"> rendering pillar.stats list-items at line 82
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-xs (mobile), text-sm (md+), tracking=default, leading-snug
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: mobile size text-xs vs spec text-base; md size text-sm vs spec text-base. Same slightly-undersized body pattern as Lab's DocumentBadge:103 and Campus's body cluster. Tier (body Inter) and role (stat list inside pillar card) match. Color row covers text-foreground/90 separately. Inner <li> at line 83 and child <span>s at lines 84,87 inherit typography from this <ul> — folded into this single row.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:109 — <div className="font-serif text-lg md:text-xl leading-tight tracking-tight normal-case">Fractal NYC</div>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-lg (mobile), text-xl (md+), tracking=tight (overrides default Fraunces), leading-tight
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: .text-subtitle is upright Fraunces weight 300 mixed-case text-xl md:text-2xl tracking 0.04em. Drift: style italic (.font-serif rule) vs spec normal; weight 400 vs spec 300; mobile size text-lg vs spec text-xl; tracking-tight vs spec 0.04em; leading-tight per-site override. Tier (display Fraunces) and role (center-node label inside the diagram — the headline "Fractal NYC" branding inside the circle) match the subtitle slot. Same NEAR pattern as Campus's bio names at Campus.tsx:529 and Campus's address line at Campus.tsx:200. Apply task should preserve the italic if it's editorially intentional for the diagram (italic Fraunces in a circle reads as a logotype), otherwise migrate to upright per .text-subtitle spec.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:112 — <div className="text-[10px] md:text-xs mt-2 opacity-80 leading-snug">A neighborhood campus<br />founded in 2021</div>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-[10px] (mobile, arbitrary), text-xs (md+), tracking=default, leading-snug
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family (Inter vs JBM), weight (400 vs 500), transform (none vs uppercase), tracking (default vs 0.1em), size (text-[10px] / text-xs vs spec text-sm) — extensive drift on rendering attributes but semantic role (compact center-node subtitle / metadata) matches .text-meta. Same density-override pattern as Home's Hero.tsx:289 (text-eyebrow text-[10px] for compact dropdown chrome). Apply task: migrate to .text-meta with the size override side-by-side; opacity-80 is presentation, parent text color cascades (text-foreground per <main>).
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:74 — <span className="text-xl md:text-2xl" aria-hidden>{pillar.emoji}</span>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-xl (mobile), text-2xl (md+), tracking=default
Nearest canonical utility: (no canonical fit — emoji rendering)
Match quality: GAP
Action: JUSTIFY
Rationale: Pure emoji glyph (🎉, 🏛️, 👾, 📍, 🏠) sized for display. aria-hidden so semantically inert. Canonical type scale targets text rendering (Fraunces / Inter / JBM); emoji glyphs render via the system emoji font regardless of declared family. .text-subtitle is the nearest tier by size (text-xl md:text-2xl matches mobile/desktop exactly) but the emoji rendering doesn't consume the font-family, font-style, or letter-spacing. JUSTIFY: this is a sized-emoji decorative glyph, not a text element subject to the type scale. Listed for completeness so the Apply task does not "fix" the missing utility. Same pattern as Home's Home.tsx:84 <em>scenius</em> (inline editorial emphasis treated as JUSTIFY-by-intent).
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:83-89 — <li className="flex gap-2"> <span aria-hidden className="opacity-60">•</span> <span>{stat}</span> </li> (the inner spans inside the stats <ul>)
Current: family=Inter (inherited from L81 <ul>), weight=400 (inherited), style=normal, transform=none, size=text-xs/text-sm (inherited from L81), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Inner spans inherit typography from the L81 <ul>. The bullet glyph (• at line 85) is aria-hidden decorative; the stat text span (line 87) carries the user-visible content. No own typography classes beyond opacity-60 (presentation). Same NEAR profile as the parent .text-body row. Listed for completeness; folded into the L81 .text-body row. Color: opacity-60 on bullet inherits text-foreground via cascade; stat text inherits text-foreground/90 from L81 — covered in color audit rows.
```

```
Element: src/pages/StoryPage.tsx:122 — <a href={talk.url} target="_blank" rel="noopener noreferrer" className="group block rounded-lg border border-border bg-background … p-5 md:p-6"> (TalkCard wrapper anchor)
Current: family=Inter (body default, no own declaration — cascades from <main>), weight=400, style=normal, transform=none, size=inherited (text-base from body default; children re-declare), tracking=default
Nearest canonical utility: (no own typography contribution — wrapper anchor)
Match quality: EXACT (no own typography)
Action: JUSTIFY
Rationale: TalkCard wrapper <a>. The only typography contribution is via its children (the eyebrow span at line 155, h3 title at 169, byline p at 174, PretextParagraph at 179). No own utility declaration; rendering follows each child's own utility. JUSTIFY (typography-neutral wrapper). Color row covers the bg-background + border-border + ring-ring chrome separately.
```

## Color audit

```
Element: src/pages/StoryPage.tsx:18,137,146,151,156,189,201,202,209 + src/components/sections/NeighborhoodCampusDiagram.tsx:57,58,165,168 — the Story palette cluster (STORY_COLOR = "#D4BA58" + concatenated translucent variants ${STORY_COLOR}66 / ${STORY_COLOR}20 ; RING_COLOR = "#8A7A20" / RING_SOFT = "#8A7A2033" ; inline-style bg "#D4BA58" on <main>; SectorHeader color="#8A7A20" prop; FractalPattern color="#8A7A20" prop [EXCLUDED — listed for completeness]; diagram SVG ring stroke; PillarCard border-soft via RING_SOFT)
Current: #D4BA58 (golden, used as page bg + accent icon chip bg + category eyebrow color + accent bar bg + lucide icon stroke) ; #D4BA5866 / #D4BA5820 (translucent variants for TalkCard hover border + icon-chip bg) ; #8A7A20 (deeper golden, used as SectorHeader letter + "Story" eyebrow color + FractalPattern fill [excluded] + diagram ring stroke + PillarCard border) ; #8A7A2033 (translucent ring-soft for PillarCard border)
Role: background (page on <main>) + background (accent icon chip + accent bar on TalkCard) + text (category eyebrow + lucide icon stroke on TalkCard) + border (TalkCard hover via inline-style onMouseEnter) + prop (SectorHeader letter + eyebrow color) + stroke (SVG ring in CircularLayout) + border (PillarCard via inline border style)
Nearest canonical token: (no canonical token matches Story's golden palette) — DESIGN.md's 31 tokens include neither #D4BA58 nor #8A7A20 ; closest semantic match is the "house display/highlight chrome" role used by Lab's #C44878 SectorHeader prop and Campus's #1A3A2E SectorHeader prop, but Story has no house pair
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Story's golden palette (#D4BA58 + #8A7A20) is non-canonical. DESIGN.md declares 31 color tokens (19 surface + 12 house pairs); none have these values. Per audit-prompt §3 dead-value check ("Any standard Tailwind color utility resolving to a value not in DESIGN.md's token list … treat as ad-hoc"), every Story palette use is a finding. Per audit-prompt §6 tie-breaking ("MIGRATE vs. GAP — Only escalate to GAP when no canonical option matches the element's tier OR role at all"), Story's golden role does not match any of the 12 house deep/light pairs (no golden in palette) and does not match the surface neutrals (cream, putty, charcoal). The closest semantic match is the "house display/highlight chrome" role used by Lab's #C44878 SectorHeader prop and Campus's #1A3A2E SectorHeader prop — but Story has no house, so no house pair applies. GAP. Multiple sites — collapsed into one consolidated row by (file + token-cluster) grouping; Role line enumerates every role the cluster serves across both files. Apply task choices (the audit doesn't decide):
  (a) Declare a `--color-story-light` (#D4BA58) and `--color-story-deep` (#8A7A20) pair in @theme inline as a non-house accent pair, matching the house token mechanism but without the foreground siblings.
  (b) Leave the raw hex values in place with an explicit DESIGN.md "non-system accents permitted on non-house pages" carve-out.
  (c) Migrate the page palette to an existing house pair (e.g., reuse Visit's olive `#889460` / `#4A5A30`), losing the Story-specific golden voice.
  ONE consolidated gap entry covers the cluster; see Gap appendix and audit-gaps.md.
```

```
Element: src/pages/StoryPage.tsx:201 — <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4BA58" }}>
Current: text-foreground (#171717), selection:bg-foreground, selection:text-background, inline style bg #D4BA58 (covered in palette gap row above)
Role: text (page default) + selection-background + selection-text
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: text-foreground reference is canonical; charcoal-on-gold is the author's editorial choice (diverges from the cream-on-saturated-house-bg precedent used by Lab/Campus — captured in Forward observations, not a finding). Selection chrome is paired-inverse and FRAC-42 exempt. The bg-side gap is captured in the Story palette cluster row above; this row covers the text + selection sides only. No-op migration for the text/selection tokens. FRAC-42 surface-foreground pairing: text-foreground IS the same node's foreground utility, so pairing is satisfied for the charcoal-text side — even though the bg side is a non-canonical hex, the text-bearing surface declares its own foreground.
```

```
Element: src/pages/StoryPage.tsx:122 — <a className="… rounded-lg border border-border bg-background … focus-visible:ring-ring …">
Current: bg-background (#f8f6f0), border-border (#dddad5), ring-ring (#171717 on focus-visible)
Role: background + border + ring
Nearest canonical token: background / border / ring
Match quality: EXACT (bg+border+ring as tokens) ; NEAR (missing paired text-foreground on the same node per FRAC-42)
Action: MIGRATE
Rationale: All three utilities on canonical surface tokens. Card surface (cream over the golden page bg) renders the TalkCard as an editorial card — mirrors Lab's DocumentBadge:58. Per FRAC-42 pairing rule, the same node should declare text-foreground; currently absent. Children re-declare their own colors (the eyebrow at line 156 uses inline STORY_COLOR; the title at line 169 cascades to text-foreground via the page-level rule; the byline at line 174 declares text-foreground; the Pretext desc at line 179 declares text-foreground). NEAR-pairing finding — Apply task adds text-foreground to the <a> for compositional safety. Three roles + one pairing addition collapse to one row by (file + token) grouping.
```

```
Element: src/pages/StoryPage.tsx:174 — <p className="text-sm text-foreground mt-1">{talk.author}, {talk.year}</p>
Current: text-foreground (#171717)
Role: text
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical foreground token. No-op migration. Author byline inside TalkCard. Listed for completeness; the (file + token) grouping rule consolidates with other text-foreground uses in StoryPage.tsx if any — but this is the only standalone text-foreground reference in StoryPage.tsx aside from the <main> at line 201 (covered above) and the Pretext sites at lines 179/227 (which carry text-foreground via className but their typography is the GAP — the color is EXACT here).
```

```
Element: src/pages/StoryPage.tsx:164 — <ArrowUpRight size={16} strokeWidth={1.5} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
Current: text-muted-foreground (#525252)
Role: stroke (icon, via currentColor)
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. No-op migration. ArrowUpRight icon affordance on TalkCard, same pattern as Lab's DocumentBadge:89. The opacity-0 group-hover:opacity-100 is a presentation/interaction effect, not a color token contribution.
```

```
Element: src/pages/StoryPage.tsx:179,224 — <PretextParagraph className="text-foreground …"> (TalkCard description at line 179; pre-cards intro at line 224)
Current: text-foreground (#171717)
Role: text
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Both Pretext sites consume the canonical foreground token. Typography is the GAP (mono-on-px-size, see typography rows); color is EXACT. Two sites collapse to one row by (file + token) grouping.
```

```
Element: src/pages/StoryPage.tsx:209 — <SectorHeader letter="S" name="Story" color="#8A7A20" />
Current: "#8A7A20" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Story" eyebrow color)
Nearest canonical token: (no canonical token; covered by Story palette gap cluster above)
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: #8A7A20 is the Story deep accent; non-canonical. Mirrors Lab's LabPage:24 color="#C44878" (Publications deep) and Campus's Campus.tsx:190 color="#1A3A2E" (Campus deep) — but Lab/Campus migrate to a canonical house-{slug}-deep token. Story has no such token. Covered by the Story palette gap cluster row above; listed separately for traceability so the Apply task can find this exact site.
```

```
Element: src/pages/StoryPage.tsx:202 — <FractalPattern color="#8A7A20" />
Current: "#8A7A20" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per FRAC-20 / FRAC-24 precedent)
Nearest canonical token: (would be the Story deep palette site if in scope)
Match quality: N/A (out of scope)
Action: EXCLUDED
Rationale: FractalPattern is a shared decorative SVG fill; the `color` prop is out of scope per FRAC-20 (Lab) and FRAC-24 (Campus) precedent. Documented here only to enumerate every color use on the page; the Story Apply task does NOT migrate this site. Same exclusion pattern as Campus's <FractalPattern color="#1A3A2E" /> at CampusPage.tsx:9.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:81 — <ul className="… text-foreground/90"> (pillar stats list at line 82)
Current: text-foreground/90 (Tailwind alpha-modified canonical token)
Role: text
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Canonical foreground with /90 alpha — alpha is presentation, not a different value. Mirrors Home's text-foreground/80 (Home.tsx:35) and post-migration Campus body-paragraph cluster. One site; listed standalone. Inner <span> elements at lines 84 (opacity-60 bullet) and 87 (stat text) inherit this color via the cascade — folded into this row.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:84,112 — opacity-60 on bullet glyph + opacity-80 on center-node subtitle (no text-* declared; inherits text-foreground via the page-level cascade)
Current: opacity-60 / opacity-80 (no own text-color declaration)
Role: text-via-opacity (inherited foreground)
Nearest canonical token: foreground (inherited)
Match quality: EXACT
Action: MIGRATE
Rationale: Opacity utilities only; no own text-color declaration. Parent <main>'s text-foreground cascades. Listed for completeness; not a separate token reference. Same pattern as Home's Hero.tsx:270,275 lucide icons (opacity-40/60 with currentColor inherit). Two sites collapse to one row by (file + token) grouping.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:66 — <div className="rounded-xl p-4 md:p-5 text-left" style={{ backgroundColor: "transparent", border: `1px solid ${RING_SOFT}` }}> (PillarCard outer)
Current: backgroundColor: "transparent" (inline style); border: 1px solid #8A7A2033 (inline style via RING_SOFT — covered in palette gap cluster above)
Role: background (transparent — no token) + border (covered in palette gap cluster)
Nearest canonical token: N/A (transparent) / (palette gap for border)
Match quality: EXACT (transparent is not a token, no migration target) ; GAP (border-via-RING_SOFT covered in palette cluster)
Action: JUSTIFY (for transparent bg) ; GAP-LOG-AND-MIGRATE (for border, covered above)
Rationale: Transparent bg is intentional — the PillarCard sits directly on the page golden bg with no surface declaration. No token migration applies to "transparent". The border uses RING_SOFT (#8A7A2033 — translucent Story deep), which is covered by the Story palette gap cluster row above. FRAC-42 pairing N/A — transparent surface does not establish a foreground requirement.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:101 — <div className={…} style={{ border: `2px solid ${RING_COLOR}`, backgroundColor: "transparent" }}> (CenterNode outer)
Current: backgroundColor: "transparent" (inline style); border: 2px solid #8A7A20 (inline style via RING_COLOR — covered in palette gap cluster above)
Role: background (transparent — no token) + border (covered in palette gap cluster)
Nearest canonical token: N/A (transparent) / (palette gap for border)
Match quality: EXACT (transparent) ; GAP (border-via-RING_COLOR covered in palette cluster)
Action: JUSTIFY (for transparent bg) ; GAP-LOG-AND-MIGRATE (for border, covered above)
Rationale: Same pattern as PillarCard at line 66 — transparent surface sits directly on the page golden bg; the border uses the Story deep accent. Both findings covered above. FRAC-42 pairing N/A.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:160-169 — <circle … stroke={RING_COLOR} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} /> (SVG ring inside CircularLayout)
Current: stroke #8A7A20 via RING_COLOR (inline JSX prop — covered in palette gap cluster above); opacity 0.6 (presentation)
Role: stroke (SVG decorative ring)
Nearest canonical token: (covered by Story palette gap cluster above)
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: SVG stroke driven by RING_COLOR (#8A7A20 — Story deep). Covered by the Story palette gap cluster row above; listed separately for traceability so the Apply task can find this exact site. The aria-hidden SVG is decorative; opacity 0.6 is presentation.
```

```
Element: src/components/gallery/GalleryImage.tsx:24 — <motion.div className={`overflow-hidden rounded-sm bg-muted ${className}`}> (gallery image container)
Current: bg-muted (#e8e6e3), rounded-sm (canonical rounding token)
Role: background + rounded
Nearest canonical token: muted
Match quality: EXACT
Action: MIGRATE
Rationale: Canonical surface token. The bg-muted is the placeholder color before the <img> loads — a deliberate "image-loading shimmer" surface choice. Per FRAC-42, paired text-muted-foreground is the canonical pair; but the <motion.div> has no direct text children (only the <motion.img>), so pairing is N/A (DESIGN.md → Surface foreground pairing applies to text-bearing surfaces). The Framer-Motion boxShadow on hover at line 28 (rgba(0,0,0,0.15)) is an animation value, not a declared Tailwind class — out of scope per audit-prompt §9 (shadow not modeled).
```

```
Element: src/components/gallery/PhotoGallery.tsx:23 — <section className="py-16 md:py-24"> (entire file; pure layout)
Current: (no color or typography classes; layout only — py-*, max-w-*, grid-cols-*, gap-*, aspect-ratio-* utilities)
Role: (no color contribution)
Nearest canonical token: N/A
Match quality: N/A
Action: JUSTIFY
Rationale: PhotoGallery is pure layout — no Tailwind color or typography classes anywhere except the inherited bg-muted on GalleryImage (covered separately). Listed for completeness so the audit doc explicitly enumerates the file. The section's py-16 md:py-24 vertical rhythm and arbitrary aspect-ratios (aspect-[4/3], aspect-[16/10], aspect-[3/4], aspect-[10/3]) are layout (out of scope per audit-prompt §9). The image alt strings rendered via section.photos[…].alt are sourced from storyPhotos data (out of scope) and not Tailwind/CSS values.
```

## Forward observations (not GAPs under current rules)

- **Charcoal-on-saturated-Story-bg vs cream-on-saturated-house-bg
  divergence.** Story's `<main>` at `StoryPage.tsx:201` declares
  `text-foreground` (charcoal) on a saturated golden background, while every
  house page (Lab, Campus) uses `text-background` (cream) on its saturated
  house background. Both choices are canonical per DESIGN.md → Text
  foregrounds ("text is `text-foreground` or `text-background` by default"),
  but the **convention divergence** between house and non-house pages is
  worth recording. On golden #D4BA58 (luminance ~74%), charcoal #171717
  yields a contrast ratio of ~8.2:1 vs cream #f8f6f0's ~1.2:1 (cream-on-gold
  fails WCAG and would be unreadable) — so charcoal is the correct choice on
  *this particular* golden bg, but the system has no rule to predict which
  text color to use on a non-house saturated surface. A future system
  iteration could (a) introduce a per-page text-foreground token for
  non-house saturated pages (matching the FRAC-42 house pair convention but
  for non-houses), or (b) codify a luminance-based selection rule in
  DESIGN.md. Not a GAP today — text-foreground cleanly resolves this row.

- **Body-paragraph size drift.** Two body-paragraph clusters in Story scope
  (`OriginStory.tsx:9` wrapper rendering 3 paragraphs; `NeighborhoodCampusDiagram.tsx:81`
  pillar stats list) read slightly smaller and lighter than canonical
  `.text-body` (weight 400, text-base). Apply task will size them up to
  `text-base` (and weight 400 for the OriginStory cluster) unless a future
  container-scoped utility lands. Same forward observation Lab logged
  (DocumentBadge:103, DocumentGrid:29) and Campus logged (19+ sites in
  Campus.tsx). The cross-page repetition (now 4+ pages) strengthens the
  case for a future `.text-body-prose-light` or container-scoped body
  utility. Not a GAP under current rules because NEAR → MIGRATE cleanly
  resolves every row.

- **Center-node italic-Fraunces in a logotype role.** The center node at
  `NeighborhoodCampusDiagram.tsx:109` renders "Fractal NYC" in italic
  Fraunces inside a circle — reading as a logotype rather than running
  display text. The .text-subtitle utility is upright (post-FRAC-17 spec);
  the italic here is intentional editorial choice. Apply task should
  preserve italic via a `.font-serif` + `.text-subtitle` combo or note the
  intentional drift. Worth flagging for the system: a future
  italic-subtitle variant (or a logotype-display tier) could capture this
  call site without forcing an opt-out modifier. Not a GAP — .text-subtitle
  with the cascade-italic from .font-serif resolves cleanly.

- **Non-house pages with their own accent pair pattern.** Story is the
  first audited page to use a non-canonical golden accent pair (#D4BA58 /
  #8A7A20). The Protocol page (per the FRAC-22 PRD § Site Architecture, not
  yet audited) is likely to have a similar pattern — and Home itself has a
  partial precedent in the OctahedronHero scene's per-node accent colors
  (FRAC-22 OctahedronHero face order at DESIGN.md → Components). The
  Story-palette gap entry's proposed system changes should be evaluated
  with Protocol's likely needs in mind: if Protocol also needs its own
  accent pair, the answer is more likely to be (a) "declare per-non-house
  token pairs" than (b) "carve out raw hex" or (c) "reuse a house pair."
  Worth recording so the gap entry's human decision can take the sitewide
  pattern into account.

- **PillarCard / CenterNode `backgroundColor: "transparent"`** pattern. Both
  `PillarCard` (`NeighborhoodCampusDiagram.tsx:66`) and `CenterNode`
  (`NeighborhoodCampusDiagram.tsx:101`) use inline `backgroundColor:
  "transparent"` to sit directly on the page golden background. This is a
  pattern the FRAC-42 surface-pairing rule does not formally address —
  transparent is the **absence of a surface declaration**, not a
  declaration on the canonical token list. The cards rely on the
  page-level `text-foreground` cascade with no own foreground token. This
  is correct and FRAC-42-compliant by virtue of the absence (a transparent
  surface doesn't *break* the pairing rule because it doesn't declare a
  surface) but it's worth recording for the next audit iteration: should
  DESIGN.md → Surface foreground pairing explicitly exempt
  `backgroundColor: "transparent"` and `bg-transparent` from the pairing
  check, or should it require an explicit `text-*` re-assertion at every
  transparent surface for forward-compatibility? Not a GAP today.

## Gap appendix

```
- src/pages/StoryPage.tsx:18,137,146,151,156,189,201,209 + src/components/sections/NeighborhoodCampusDiagram.tsx:57,58,165,168 — the Story palette cluster (#D4BA58 STORY_COLOR + concatenated alpha variants ${STORY_COLOR}66 / ${STORY_COLOR}20 ; #8A7A20 RING_COLOR + #8A7A2033 RING_SOFT ; inline-style page bg on <main>; SectorHeader letter+eyebrow prop; SVG ring stroke ; PillarCard border)
  Nearest-fit chosen: (no canonical token — closest semantic match is the house display/highlight chrome role, but Story has no house pair)
  Why it didn't fit: Story is not a house page, so the 12 house tokens (`house-{visit,events,campus,education,political-club,publications}-{light,deep}`) do not apply per DESIGN.md → Text foregrounds ("house colors do not cross page boundaries"). The 19 surface tokens are neutrals (cream, putty, charcoal, muted-foreground, destructive-red, border) — none match Story's golden palette. The page consistently uses #D4BA58 (golden light) as its surface and #8A7A20 (golden deep) as its display accent, mirroring the house-{light}/{deep} convention — but the values are not in the system.
  Proposed system change: One of three options for the human queue:
  (a) Declare a `--color-story-light: #D4BA58` and `--color-story-deep: #8A7A20` pair in `@theme inline` (and DESIGN.md tokens block) as a non-house accent pair, matching the house-token mechanism but without forcing a `houses.ts` data-model entry (Story is in `OUTER_NAV_NODES`, not `HOUSES`). The Story Apply task then migrates raw hex → token-driven utilities, mirroring the Campus FRAC-25 pattern.
  (b) Leave the raw hex values in place with an explicit DESIGN.md "non-system accents permitted on non-house pages" carve-out — record the policy and document each non-house page's accent in prose so future audits can verify intent.
  (c) Migrate the page palette to an existing house pair (e.g., reuse Visit's olive `#889460` / `#4A5A30` or another close match) — would lose the Story-specific golden voice; not recommended unless the design team has a reason to consolidate.
  Note: Protocol page (not yet audited) is likely to have a similar pattern, so the human decision should consider the sitewide non-house-accent question. Option (a) scales best if Protocol also needs its own pair.
  Page: story
  Date: 2026-06-09
```

**Pretext sites note:** The two PretextParagraph call sites at
`StoryPage.tsx:179` (TalkCard description, 13px JBM) and `StoryPage.tsx:224`
(pre-cards intro, 15px JBM weight 300) are classified GAP in the
Typography audit but **do not produce new audit-gaps.md entries** — they
are covered by the existing Lab Pretext gap entry from 2026-06-08
(`src/pages/LabPage.tsx:58`) which proposes a body-mono utility tier
solving the sitewide pattern. Adding a Story-specific Pretext entry would
duplicate Lab's; the per-page Audit playbook (§7 "No deduplication within
a single audit. Sitewide dedup is a later human task.") allows
duplication, but the Lab entry's proposed system change already covers
both Story sites — explicitly cross-referencing the Lab entry here is the
cleaner pattern.

### Branch ordering note (for reviewers)

This branch (`frac-26-audit-story`) is off `master`. Master carries the
FRAC-20 Lab + FRAC-22 Home + FRAC-24 Campus audit-gaps entries (all merged
upstream by 2026-06-08). The new Story palette cluster entry appends after
the Campus entry on this branch. No upstream merge conflicts expected as
long as each branch only appends its own new entry and does not edit
existing entries — the append-only convention is codified in
`audit-gaps.md`'s preamble.
