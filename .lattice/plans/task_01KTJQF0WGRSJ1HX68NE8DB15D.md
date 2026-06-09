# FRAC-26 — Audit Story page (typography + color)

**Task:** task_01KTJQF0WGRSJ1HX68NE8DB15D
**Branch:** frac-26-audit-story
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px

This is the **fourth** per-page audit executed under the FRAC-18/FRAC-19 playbook. FRAC-20 (Lab) was the worked example; FRAC-22 (Home) codified the FRAC-42 surface-foreground pairing pass for Apply tasks at scale; FRAC-24 (Campus) extended the precedent to the first house page after Lab. **Story is the first non-house, non-Home page** to go through Audit — closer in spirit to Home (no canonical house pair, raw-hex accent in source) than to Lab/Campus (which had a clean `{light, deep}` token pair). The closest playbook precedent is Home; the closest mechanical precedent (raw-hex page bg + raw-hex SectorHeader prop) is Lab/Campus, but with a **critical twist**: Story's accent (`#D4BA58` + `#8A7A20`) is NOT in DESIGN.md's house token list. This forces every Story accent classification to GAP (no token fits) or NEAR (foreground/background nearest fit), and the gap log gets a Story-specific entry proposing how the system should handle non-house pages with their own accent pair.

No `audit-prompt.md` revisions are expected here. No `DESIGN.md` revisions. If a brand-new playbook gap appears during impl, escalate via a `needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: StoryPage's import graph)

- `src/pages/StoryPage.tsx` (~251 lines) — the page entry. Owns the page-level `<main>` surface (line 201) with the raw-hex `#D4BA58` golden background, the `STORY_COLOR = "#D4BA58"` constant (line 18), the `TalkCard` component definition (lines 117–193) used in the talks grid, the page's outer layout sections (lines 207–246), and inline-styled accent uses on the TalkCard (lines 137, 146, 151, 156, 189).
- `src/components/sections/OriginStory.tsx` (~27 lines) — the origin-narrative section, three `<p>` children inside a `space-y-4 text-sm md:text-base font-light` wrapper. Imports and renders `NeighborhoodCampusDiagram`.
- `src/components/sections/NeighborhoodCampusDiagram.tsx` (~216 lines) — IN SCOPE. Invoked from OriginStory. Owns the `RING_COLOR = "#8A7A20"` / `RING_SOFT = "#8A7A2033"` constants (the deep accent paired with `STORY_COLOR`), all PillarCard typography/color (`text-subtitle`, `text-xs md:text-sm text-foreground/90`, opacity utilities), CenterNode typography (`font-serif text-lg md:text-xl`, `text-[10px] md:text-xs opacity-80`), and the SVG ring stroke color (`stroke={RING_COLOR}` with `opacity={0.6}`).
- `src/components/gallery/PhotoGallery.tsx` (~118 lines) — IN SCOPE. Invoked from StoryPage. Pure layout (grids and FadeIn wrappers); the only color-token reference is the `bg-muted` placeholder on the GalleryImage container (covered via the GalleryImage row). The PhotoGallery component itself has no text content beyond its image `alt` attributes (image content out of scope per audit-prompt §9). Listed as in-scope so the audit doc explicitly enumerates it and records the "no typography rows, one inherited bg-muted color row" finding.
- `src/components/gallery/GalleryImage.tsx` (~52 lines) — IN SCOPE. Renders the `motion.div` container with `bg-muted` and a `rounded-sm` token. The hover `boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"` is a Framer Motion animation value, not a declared Tailwind/CSS value — out of scope per audit-prompt §9 ("Motion, shadow, gradient tokens — DESIGN.md does not model these; not audited") and §10 (no shadow tokens). The `bg-muted` is canonical (surface token); the `bg-muted` row in the audit doc.

### Out of scope (deferred or excluded, per the audit-prompt §9 carve-outs)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#8A7A20" />` call site at `StoryPage.tsx:202` — explicitly excluded per FRAC-20 (Lab) / FRAC-24 (Campus) precedent. FractalPattern is a shared decorative SVG fill; not audited. The hex value at the call site (`#8A7A20`) is documented here only as an excluded site (parallels Campus's `<FractalPattern color="#1A3A2E" />` exclusion at `CampusPage.tsx:9`).
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home/Campus. Note: Navbar.tsx:20 declares `{ name: "Story", href: "/story", color: "#D4BA58" }` and OctahedronHero.tsx:128 / .tsx:396 also reference `#D4BA58` — those are Navbar/OctahedronHero internals (shared chrome / 3D scene material) and remain out of scope for this audit. The Story page itself owns the canonical declaration at `StoryPage.tsx:18`.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house/non-house pages. Audited as a separate task. **Note:** Story's call-site prop `color="#8A7A20"` IS audited as part of `StoryPage.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt §4). Story does not use `Button` at all (the TalkCard is a raw `<a>`, not a `<Button asChild>`), so the Button carve-out is satisfied trivially.
- `src/data/storyPhotos.ts` — pure data (image URLs, alt strings, aspect labels, gallery section structure). No JSX, no Tailwind classes, no color tokens. Excluded as data layer per the Home audit's `OUTER_NAV_NODES` precedent.
- `src/components/pretext/PretextParagraph.tsx` and `src/lib/pretext.ts` — Pretext renderer mechanics. Story consumes `PretextParagraph` at two call sites (`StoryPage.tsx:179`, `:224`). The CALL SITES are in scope (per the Lab `PretextParagraph` precedent: inline px sizes + FONTS.body family go in `Current`, classified GAP). The PretextParagraph component INTERNALS are out of scope.
- `src/hooks/use-pretext.ts` — hook layer, no UI.
- Image files under `public/images/story/` — raster content, out of scope per audit-prompt §9 ("Image colors, photographs, gradients in raster assets" — out of scope).
- Tests, configs, package files.

### House identity decision (Story has NO house — closest analog is Home)

**Story is NOT a house page.** Per DESIGN.md → House mapping, the six house slugs are `house-visit-*`, `house-events-*`, `house-campus-*`, `house-education-*`, `house-political-club-*`, `house-publications-*`. **Story does not appear.** Per DESIGN.md → Components (OctahedronHero), Story is the **Story nav node** (vertex 4 of the octahedron, replacing the FRAC-36 Political Club placeholder per FRAC-47). Per the PRD § Site Architecture, Story is a top-level page alongside Home and Protocol — not one of the six houses.

This is the central audit puzzle. Lock the rule for Story:

- **No house token applies to Story.** `text-house-*` / `bg-house-*` on Story chrome is forbidden per DESIGN.md → Text foregrounds ("house colors do not cross page boundaries"). Walk for any house-token use; flag any finding as a cross-house leak and migrate.
- **`#D4BA58` (the Story golden) is NOT a canonical token.** It is a Navbar nav-node color declared at `Navbar.tsx:20` and re-declared at `StoryPage.tsx:18` (`STORY_COLOR`), used 6 times in StoryPage.tsx, plus the inline `style={{ backgroundColor: "#D4BA58" }}` on `<main>` at line 201. DESIGN.md's house token list does NOT include this color. **Every `#D4BA58` use is a GAP** by the audit-prompt §3 rule: "Any standard Tailwind color utility resolving to a value not in DESIGN.md's token list … treat as ad-hoc. Resolve to nearest canonical token per role." For Story's accent uses, **there is no canonical token at the value `#D4BA58`** — the nearest-fit for a golden-yellow accent in the existing 31-token palette is debatable (foreground/background for body text; for accents nothing fits). Classify each `#D4BA58` use as **GAP → GAP-LOG-AND-MIGRATE** with the nearest-fit being either the project-wide text-foreground/background rule (for text/accent text uses) or "no canonical fit" (for the bg-as-page-color use). Log ONE consolidated gap entry covering the Story palette cluster.
- **`#8A7A20` (the Story deep) is also NOT a canonical token.** It appears as the SectorHeader prop (`StoryPage.tsx:209`), the FractalPattern prop (excluded), and the `RING_COLOR` / `RING_SOFT` constants in NeighborhoodCampusDiagram (`#8A7A20`, `#8A7A2033`). Same GAP classification: no canonical token matches this value. Log under the same Story palette cluster gap entry.
- **Text-color choice on Story's golden bg.** `StoryPage.tsx:201` declares `text-foreground` (charcoal `#171717`) directly on `<main>` — not `text-background` (cream). This **diverges from the Lab/Campus precedent** (which uses cream-on-saturated-house-bg per FRAC-42 paired-foreground). For Story, charcoal-on-gold is the editorial voice the source author chose. Two readings:
  1. The current author intentionally chose charcoal-on-gold because the gold has high enough luminance that charcoal reads. This is the "Story is a hybrid: saturated bg like a house but using a non-house palette so the cream paired-foreground convention doesn't apply" reading.
  2. Story should follow the house convention and migrate to text-background (cream) — but then would need to declare a Story-foreground token (`#f8f6f0` or otherwise), which doesn't exist.
  **Lock for this audit:** classify `text-foreground` on the Story golden bg as **EXACT → MIGRATE** (no change; it's already on the canonical foreground token). The text-color choice (charcoal vs cream) is an editorial decision the audit cannot make — DESIGN.md → Text foregrounds permits both `text-foreground` and `text-background` on any surface; the audit's job is to verify each text color is canonical (charcoal or cream). The audit forward-observation section flags the divergence so a future system iteration can decide whether non-house pages need their own paired-foreground convention.
- **Charcoal alpha-modified utilities** on Story's golden bg (`text-foreground/80`, `text-foreground/90`, etc., used in OriginStory and NeighborhoodCampusDiagram) — classify EXACT under the alpha-is-presentation rule (mirrors Lab and Home).
- **`bg-muted` on GalleryImage** — classify EXACT (canonical surface token).
- **`STORY_COLOR` constant + inline-style references** — each separate hex-string concatenation site (`${STORY_COLOR}66`, `${STORY_COLOR}20` for translucent shades) is a distinct color use; group by `(file + token-cluster)` per audit-prompt §5. The Story palette cluster collapses to one consolidated row covering all 6 sites in StoryPage.tsx plus the 2 SectorHeader-prop and FractalPattern-prop sites.

### Inversion check

Story is NOT a house page, so the forum/school inversion rule does not apply. The page uses `#D4BA58` (the lighter golden) as the page bg and `#8A7A20` (the deeper golden) as the accent — the same "{light} as bg, {deep} as accent" pattern Campus uses, but with a non-canonical palette pair. No inversion finding (no inversion rule to apply).

### Cross-house leak check

Walk for any `text-house-*` / `bg-house-*` / raw hex matching another house's palette in `StoryPage.tsx`, `OriginStory.tsx`, `NeighborhoodCampusDiagram.tsx`, `PhotoGallery.tsx`, `GalleryImage.tsx`. Story today has none — but the audit doc must explicitly record "no cross-house leaks found" so a reader can verify the check was performed. The walk targets the 12 house hex values (`#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830`, `#E870A0`, `#C44878`) plus the dead-token `#6B4C9A` and the drift `#1a1a1a`.

---

## Format (locked 2026-06-08 with human, carried from FRAC-20 + FRAC-22 + FRAC-24)

Use the formats specified in `audit-prompt.md` §4 (typography) and §5 (color), with the FRAC-20 clarifications carried forward by FRAC-22 / FRAC-24:

- **`<file:line>` granularity:** opening JSX tag line of the element. Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale.
- **Color row grouping:** by `(file + token)`. List every role the token serves in that file on the `Role:` line. Across files, repeat the row. Story will have a very dense `StoryPage.tsx` row for the **non-canonical Story palette cluster** — group every `#D4BA58` (+ alpha-string-concatenated translucent variants `${STORY_COLOR}66`, `${STORY_COLOR}20`) and `#8A7A20` site into one consolidated gap row.
- **Pretext-rendered text:** TWO call sites in `StoryPage.tsx` (line 179 — TalkCard description; line 224 — pre-cards intro). Apply the Lab `PretextParagraph` precedent: inline px size + FONTS.body family go in `Current`, classified GAP. The Lab gap entry already covers the sitewide pattern; **Story does NOT need to re-log the Pretext gap** — it is already in `audit-gaps.md` from FRAC-20 (Lab). Record both sites as `GAP-LOG-AND-MIGRATE` for traceability but the gap appendix in the Story audit doc states "covered by the Lab Pretext gap entry, no new audit-gaps.md entry."
- **Inline `<a>` and `<button>`:** Story's `TalkCard` (StoryPage.tsx:122) is a raw `<a>` with ad-hoc Tailwind utilities + inline-style hover handlers, IN SCOPE. No `<button>` elements in Story scope outside of Navbar/Footer (out of scope as shared chrome).

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20 PR)

- Text on this site is `text-foreground` (charcoal `#171717`) or `text-background` (cream `#f8f6f0`) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted as display/highlight text. **Story is NOT a house page** — therefore no house tokens permitted as Story chrome text. But Story uses its own `#D4BA58` / `#8A7A20` palette as accents (TalkCard category label, accent bar, SectorHeader letter, RingColor diagram stroke). These accents are non-canonical and get GAP-classified.
- No raw `text-white`, `text-black`, `text-gray-*`, `color: "#fff"` inline-style anywhere. Walk Story sources for these — Story today has none (the only inline `color:` on text elements is `color: STORY_COLOR` = `#D4BA58`, which is the gap finding above).
- Any `text-foreground/<alpha>` is the canonical token with opacity — classify EXACT under the alpha-is-presentation rule.

### Surface foreground pairing rule (DESIGN.md → Surface foreground pairing, codified by FRAC-42)

Every `bg-*` declaration must carry its paired `text-*` foreground on the same node. Four canonical pairs:

| Surface | Pair |
|---|---|
| `bg-background` | `text-foreground` |
| `bg-foreground` | `text-background` |
| `bg-house-{slug}-light` | `text-house-{slug}-light-foreground` |
| `bg-house-{slug}-deep` | `text-house-{slug}-deep-foreground` |

Exemptions (per audit-prompt §5):
- Selection chrome (`selection:bg-foreground selection:text-background`) — paired-inverse states, not surface declarations.
- House display-use text colors on the house's own page surface — N/A for Story (no house).

**For Story, the pairing-check sites the impl agent must visit (pre-walked):**

- `src/pages/StoryPage.tsx:201` — `<main className="… text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4BA58" }}>`. **Three findings on the same node:**
  1. **Inline-style bg `#D4BA58`** → GAP. No canonical token matches; nearest fit is "none" (the Story palette is not in the system). Apply task migration target depends on what the human decides about the Story palette — a future Apply task may declare a `--color-story-light` / `--color-story-deep` pair (matching the house token pattern) or leave the raw hex with an explicit justification. The audit only classifies; gap-log entry proposes the system change. **GAP-LOG-AND-MIGRATE** with nearest-fit `(no canonical token)`.
  2. **`text-foreground` (charcoal) on the golden bg** → EXACT on the canonical text token. The surface-foreground pairing rule says `bg-background` pairs with `text-foreground`, but Story's bg is `#D4BA58` (non-canonical), not `bg-background`. The pairing pair is undefined for non-house, non-system surfaces. Classify EXACT for the text-foreground reference (canonical token correctly used) and note the gap for the surface side. Document the divergence-from-house-precedent in Rationale: house pages use cream-on-saturated; Story uses charcoal-on-gold — author choice, audit accepts.
  3. **Selection chrome (`selection:bg-foreground selection:text-background`)** → EXACT (paired-inverse, FRAC-42 exempt). Same as Lab/Home/Campus.
  Combine into a single color-audit row for findings (1)+(2) where pairing-implications collapse; selection chrome gets its own EXACT row.

- `src/pages/StoryPage.tsx:122` — `<a className="… rounded-lg border border-border bg-background …">` (TalkCard wrapper). **Three findings:**
  1. **`bg-background`** (the TalkCard's own cream surface, raised over the golden page bg) → EXACT on the canonical surface token. Per FRAC-42, this needs paired `text-foreground` on the same node — currently absent (the children re-declare their own colors). NEAR (missing pair).
  2. **`border-border`** (canonical surface token, `#dddad5`) → EXACT.
  3. **`focus-visible:ring-ring`** → EXACT.
  Three roles collapse to one row by (file + token) grouping; pairing finding is its own NEAR sub-finding.

- `src/components/gallery/GalleryImage.tsx:24` — `<motion.div className="overflow-hidden rounded-sm bg-muted …">` (gallery image container). **One finding:**
  - **`bg-muted`** (canonical surface token, `#e8e6e3`) → EXACT. Per FRAC-42, paired `text-muted-foreground` is the canonical pair; but this `<div>` has no direct text children (only an `<img>`), so the pairing rule is N/A here (no foreground to pair with — DESIGN.md → Surface foreground pairing applies to text-bearing surfaces). EXACT.

### Dead-value check

- Raw `#1a1a1a` → none found in Story scope.
- Raw `#6B4C9A` → none found in Story scope.
- `text-white` / `text-black` / `text-gray-*` → none found in Story scope.
- Tailwind arbitrary `text-[…]` values: one site at `NeighborhoodCampusDiagram.tsx:112` (`text-[10px] md:text-xs`). Resolve to nearest canonical: `text-[10px]` is a density override on the existing `.text-meta` / `.text-eyebrow` family — mirror the Home audit's `Hero.tsx:289` precedent (call-site density override on chrome utility). NEAR.

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These canonical example rows for FRAC-26 cover: (1) the EXACT no-op text-display case, (2) the **Story palette gap cluster** color row, (3) the `text-subtitle` NEAR-with-cascade case, (4) the `text-foreground/90` body-alpha EXACT case, (5) the **PretextParagraph** GAP (covered by Lab gap, no new entry), (6) the FRAC-42 raw-hex-page-bg-+-charcoal-text composite row, and (7) the SectorHeader prop row. The impl agent reproduces them verbatim in the audit doc, then appends any further rows it discovers walking the four in-scope files.

### Typography examples

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
Current: family=JetBrains Mono (FONTS.body), weight=400, style=normal, transform=none, size=13px (TEXT_SIZES.base, inline), tracking=default
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
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: weight 300 (font-light) vs spec 400; mobile size text-sm vs spec text-base. Same NEAR pattern as Campus's body-paragraph cluster (Campus.tsx:233+). The wrapper's typography cascades to the 3 <p> children (lines 10, 13, 16). One row per (file + utility) grouping covers all 4 elements (wrapper + 3 children).
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:77 — <h3 className="text-subtitle leading-tight normal-case">{pillar.title}</h3>
Current: family=Fraunces, weight=300, style=normal (DRIFT — h3 global rule sets italic; .text-subtitle resets style=normal so utility wins), transform=none (normal-case override), size=text-xl (mobile), text-2xl (md+), tracking=0.04em, leading-tight
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: Utility canonical. Drift: leading-tight is a per-call-site override (spec does not pin leading). Same pattern as StoryPage:169 TalkCard title and Lab's DocumentBadge:94. Renders at every PillarCard call site (5 sites in PILLARS array via the .map at line 185 → PillarCard at line 197). One row covers all instances via (file + utility) grouping.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:81 — <ul className="space-y-1 text-xs md:text-sm leading-snug text-foreground/90"> rendering pillar.stats list-items at line 82
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-xs (mobile), text-sm (md+), tracking=default, leading-snug
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: mobile size text-xs vs spec text-base; md size text-sm vs spec text-base. Same slightly-undersized body pattern as Lab's DocumentBadge:103 and Campus's body cluster. Tier (body Inter) and role (stat list inside pillar card) match. Color row covers text-foreground/90 separately.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:109 — <div className="font-serif text-lg md:text-xl leading-tight tracking-tight normal-case">Fractal NYC</div>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-lg (mobile), text-xl (md+), tracking=tight (overrides default Fraunces), leading-tight
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: .text-subtitle is upright Fraunces weight 300 mixed-case text-xl md:text-2xl tracking 0.04em. Drift: style italic (.font-serif rule) vs spec normal; weight 400 vs spec 300; mobile size text-lg vs spec text-xl; tracking-tight vs spec 0.04em; leading-tight per-site override. Tier (display Fraunces) and role (center-node label inside the diagram) match the subtitle slot. Same NEAR pattern as Campus's bio names at Campus.tsx:529.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:112 — <div className="text-[10px] md:text-xs mt-2 opacity-80 leading-snug">A neighborhood campus<br />founded in 2021</div>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-[10px] (mobile, arbitrary), text-xs (md+), tracking=default, leading-snug
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family (Inter vs JBM), weight (400 vs 500), transform (none vs uppercase), tracking (default vs 0.1em), size (text-[10px] / text-xs vs spec text-sm) — extensive drift on rendering attributes but semantic role (compact center-node subtitle / metadata) matches .text-meta. Same density-override pattern as Home's Hero.tsx:289 (text-eyebrow text-[10px] for compact dropdown chrome). Apply task: keep .text-meta with the size override side-by-side. Color: opacity-80 is presentation, parent text color cascades (text-foreground per <main>).
```

### Color examples

```
Element: src/pages/StoryPage.tsx:18,137,146,151,156,189,201,202,209 + src/components/sections/NeighborhoodCampusDiagram.tsx:57,58,165,168 — the Story palette cluster (STORY_COLOR = "#D4BA58" + concatenated translucent variants ${STORY_COLOR}66 / ${STORY_COLOR}20 ; RING_COLOR = "#8A7A20" / RING_SOFT = "#8A7A2033" ; inline-style bg "#D4BA58" on <main>; SectorHeader color="#8A7A20" prop; FractalPattern color="#8A7A20" prop — last is EXCLUDED but documented here as a value site for completeness)
Current: #D4BA58 (golden, used as page bg + accent icon color + category eyebrow color + accent bar bg) ; #D4BA5866 / #D4BA5820 (translucent variants for hover border + icon-chip bg) ; #8A7A20 (deeper golden, used as SectorHeader letter + eyebrow color + FractalPattern fill [excluded] + diagram ring stroke + pillar-card border-soft) ; #8A7A2033 (translucent ring-soft)
Role: background (page) + background (accent icon chip + accent bar) + text (category eyebrow + lucide icon stroke) + border (TalkCard hover) + prop (SectorHeader letter + eyebrow color) + stroke (SVG ring) + border (pillar card)
Nearest canonical token: (no canonical token matches Story's golden palette) — for text/icon role: closest project-wide rule says text is foreground or background; for surface role: no canonical fit ; for SectorHeader/letter display-use role: house pages use the house's own {deep} but Story has no house token
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Story's golden palette (#D4BA58 + #8A7A20) is non-canonical. DESIGN.md declares 31 color tokens (19 surface + 12 house pairs); none have these values. Per audit-prompt §3 dead-value check ("Any standard Tailwind color utility resolving to a value not in DESIGN.md's token list … treat as ad-hoc"), every Story palette use is a finding. Per audit-prompt §6 tie-breaking ("MIGRATE vs. GAP — if you can identify a canonical utility/token whose tier and semantic role matches the element … pick NEAR → MIGRATE. Only escalate to GAP when no canonical option matches the element's tier OR role at all"), Story's golden role does not match any of the 12 house deep/light pairs (no golden in palette) and does not match the surface neutrals (cream, putty, charcoal). The closest semantic match is the "house display/highlight chrome" role used by Lab's #C44878 SectorHeader prop and Campus's #1A3A2E SectorHeader prop — but Story has no house, so no house pair applies. GAP. Multiple sites — collapsed into one consolidated row by (file + token-cluster) grouping; Role line enumerates every role the cluster serves across both files. Apply task choices (the audit doesn't decide):
  (a) Declare a `--color-story-light` (#D4BA58) and `--color-story-deep` (#8A7A20) pair in @theme inline as a non-house accent pair, matching the house token mechanism but without the foreground siblings.
  (b) Leave the raw hex values in place with an explicit DESIGN.md "non-system accents permitted on non-house pages" carve-out.
  (c) Migrate the page palette to an existing house pair (e.g., reuse Visit's olive `#889460` / `#4A5A30`), losing the Story-specific golden voice.
  ONE consolidated gap entry covers the cluster; see Gap appendix and audit-gaps.md.
```

```
Element: src/pages/StoryPage.tsx:201 — <main className="… text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4BA58" }}>
Current: text-foreground (#171717), selection:bg-foreground, selection:text-background, inline style bg #D4BA58 (covered in palette gap row above)
Role: text (page default) + selection-background + selection-text
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: text-foreground reference is canonical; charcoal-on-gold is the author's editorial choice (diverges from the cream-on-saturated-house-bg precedent used by Lab/Campus — captured in Forward observations, not a finding). Selection chrome is paired-inverse and FRAC-42 exempt. The bg-side gap is captured in the Story palette cluster row above; this row covers the text + selection sides only. No-op migration for the text/selection tokens. FRAC-42 surface-foreground pairing: text-foreground IS the same node's foreground, so pairing is satisfied for the charcoal-text side — even though the bg side is a non-canonical hex, the text-bearing surface declares its own foreground.
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
Element: src/pages/StoryPage.tsx:164 — <ArrowUpRight className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
Current: text-muted-foreground (#525252)
Role: stroke (icon, via currentColor)
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. No-op migration. ArrowUpRight icon affordance on TalkCard, same pattern as Lab's DocumentBadge:89.
```

```
Element: src/pages/StoryPage.tsx:179,224 — <PretextParagraph className="text-foreground …"> (TalkCard description; pre-cards intro)
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
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:81 — <ul className="… text-foreground/90"> (pillar stats list)
Current: text-foreground/90 (Tailwind alpha-modified canonical token)
Role: text
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Canonical foreground with /90 alpha — alpha is presentation, not a different value. Mirrors Campus's text-white/<n> cluster (post-migration target) and Home's text-foreground/80. One site; listed standalone.
```

```
Element: src/components/sections/NeighborhoodCampusDiagram.tsx:84,112 — opacity-60 / opacity-80 on the bullet glyph and center-node subtitle
Current: opacity-60 / opacity-80 (no text-* declared; inherits text-foreground via the page-level cascade)
Role: text-via-opacity (inherited)
Nearest canonical token: foreground (inherited)
Match quality: EXACT
Action: MIGRATE
Rationale: Opacity utilities only; no own text-color declaration. Parent <main>'s text-foreground cascades. Listed for completeness; not a separate token reference. Same pattern as Home's Hero.tsx:270,275 lucide icons (opacity-40/60 with currentColor inherit).
```

```
Element: src/components/gallery/GalleryImage.tsx:24 — <motion.div className="overflow-hidden rounded-sm bg-muted ${className}">
Current: bg-muted (#e8e6e3), rounded-sm (canonical rounding token)
Role: background + rounded
Nearest canonical token: muted
Match quality: EXACT
Action: MIGRATE
Rationale: Canonical surface token. The bg-muted is the placeholder color before the <img> loads — a deliberate "image-loading shimmer" surface choice. Per FRAC-42, paired text-muted-foreground is the canonical pair; but the <motion.div> has no direct text children (only the <motion.img>), so pairing is N/A. The Framer-Motion boxShadow on hover at line 28 (rgba(0,0,0,0.15)) is an animation value, not a declared Tailwind class — out of scope per audit-prompt §9 (shadow not modeled).
```

```
Element: src/components/sections/PhotoGallery.tsx:23 — <section className="py-16 md:py-24">
Current: (no color or typography classes; pure layout)
Role: (no color contribution)
Nearest canonical token: N/A
Match quality: N/A
Action: JUSTIFY
Rationale: PhotoGallery is pure layout — no Tailwind color or typography classes anywhere except the bg-muted on GalleryImage (covered separately). Listed for completeness so the audit doc explicitly enumerates the file. The section's py-16 md:py-24 vertical rhythm is layout (out of scope per audit-prompt §9).
```

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every text-bearing element in `StoryPage.tsx` (focus: lines 117–193 TalkCard, 199–251 StoryPage), `OriginStory.tsx` (lines 1–27), and `NeighborhoodCampusDiagram.tsx` (lines 1–216 — especially PillarCard at 64–93 and CenterNode at 99–120). For each, write one typography row per audit-prompt §4. For each distinct color use, write one color row per §5 (grouped per the `(file + token)` rule).
2. **Mobile-first:** every responsive element lists both mobile and desktop renderings in `Current`. Story has many responsive elements: `text-sm md:text-base` (OriginStory), `text-xs md:text-sm` (PillarCard stats), `text-[10px] md:text-xs` (CenterNode subtitle), `text-lg md:text-xl` (CenterNode title), `text-xl md:text-2xl` (PillarCard title), `pt-16 md:pt-24` and `pt-8 md:pt-12` (section padding), `p-5 md:p-6` (TalkCard padding). Capture both renderings on every row that has a responsive class.
3. **Surface foreground pairing pass:** the pre-walked list above is exhaustive (`StoryPage.tsx:201` <main>; `StoryPage.tsx:122` TalkCard <a>; `GalleryImage.tsx:24` <motion.div>; `NeighborhoodCampusDiagram.tsx:66` PillarCard <div> — though this last one uses `backgroundColor: "transparent"` with a `border` style, not a `bg-*` utility, so it does NOT trigger the pairing check; `NeighborhoodCampusDiagram.tsx:101` CenterNode <div> — same `backgroundColor: "transparent"`, no pairing finding). Missing pair → NEAR MIGRATE per FRAC-42 rule.
4. **House identity check:** Story has NO house. `text-house-*` / `bg-house-*` on Story chrome is forbidden. Verify no house tokens appear (walked: none). The `#D4BA58` + `#8A7A20` palette is non-canonical and triggers the cluster GAP.
5. **Cross-house leak check:** walk for any text-house-*, bg-house-*, raw house hex (`#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830`, `#E870A0`, `#C44878`) in Story's scope. Audit doc records "no cross-house leaks found" so a reader can verify the check.
6. **Tie-breaking** per audit-prompt §6. Per §6 tie-breaking rule "MIGRATE vs. GAP — Only escalate to `GAP` when no canonical option matches the element's tier OR role at all," Story's non-canonical golden accents do not match any of the 31 canonical color tokens at the value level. GAP for the palette cluster. The text-foreground / bg-background / border-border / bg-muted / muted-foreground references are EXACT. The PretextParagraph sites are GAP (covered by Lab's existing entry — no new entry needed). The body-paragraph clusters are NEAR (size/weight drift on .text-body). The eyebrow / subtitle / display utilities are EXACT or NEAR depending on cascade drift.
7. Real GAPs (after rules applied) get appended to `.lattice/notes/audit-gaps.md` per §7 AND copied into the audit doc's gap appendix per §10. **One new entry only**: the Story palette cluster. The PretextParagraph sites do NOT get a new entry — Lab's entry covers the pattern sitewide.
8. The audit doc is the spec for the future Story Apply task (`task_01KTJQF0YX7V5688XP73BVXZPS` per `lattice show FRAC-26`). Apply reads only this file. The Apply task's resolution depends on what the human decides for the Story palette gap entry (declare a Story token pair, leave raw hex with carve-out, or migrate to an existing house pair).

---

## Files the impl agent writes

1. **`.lattice/notes/audits/story-audit.md`** — the audit doc. Structure per audit-prompt §10:
   - Page metadata block (slug=`story`, source=`src/pages/StoryPage.tsx` (+ OriginStory + NeighborhoodCampusDiagram + PhotoGallery + GalleryImage), date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px, branch `frac-26-audit-story`)
   - In-scope / out-of-scope summary (mirror this plan's preamble; explicitly call out FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, storyPhotos data, PretextParagraph internals)
   - House identity decision section (Story has no house, page-bg charcoal-text divergence from house precedent, golden palette is non-canonical)
   - `## Typography audit` — all rows (worked examples above + any new rows the impl finds walking each in-scope file)
   - `## Color audit` — all rows including the consolidated Story palette gap row
   - `## Forward observations (not GAPs under current rules)` — REQUIRED for Story: at minimum the "charcoal-on-saturated-Story-bg vs cream-on-saturated-house-bg divergence" observation, the body-paragraph size drift forward observation (same as Lab/Campus), and the "Story palette pattern likely repeats for Protocol page (not yet audited)" forward observation
   - `## Gap appendix` — copy of the Story palette gap entry, plus a NOTE that the PretextParagraph sites are covered by the Lab gap entry already in audit-gaps.md (no new entry)

2. **`.lattice/notes/audit-gaps.md`** — append-only. ONE new entry: the Story palette cluster (`#D4BA58` + `#8A7A20`). The PretextParagraph sites are covered by the existing Lab entry from 2026-06-08; do NOT re-add.

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-26 is audit-only. The Story Apply task (`task_01KTJQF0YX7V5688XP73BVXZPS`) will execute migrations.
- `DESIGN.md` — no changes. If the Story palette gap entry's "Proposed system change" turns out to need a DESIGN.md update, that's an Apply-task concern (or a follow-up FRAC task), not this audit.
- `.lattice/notes/audit-prompt.md` — FRAC-20 already tightened the playbook. If FRAC-26 surfaces a genuine new playbook gap (e.g., "what about non-house pages with their own accent pair?"), escalate via a `needs_human` lattice comment instead of editing autonomously.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, root-level `task_*.md` files, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`, the `task_01KTNAJ1BTKEDV16FGWKYAYXJY.md` plan, and any other task's `.lattice/` files outside FRAC-26.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/story-audit.md` exists and follows the §10 structure.
- [ ] All in-scope files (`src/pages/StoryPage.tsx`, `src/components/sections/OriginStory.tsx`, `src/components/sections/NeighborhoodCampusDiagram.tsx`, `src/components/gallery/PhotoGallery.tsx`, `src/components/gallery/GalleryImage.tsx`) are represented by at least one row each (typography or color or — for pure-layout components like PhotoGallery — an explicit "no-op listed for enumeration" row).
- [ ] Out-of-scope files are listed explicitly in the audit doc's preamble with the same exclusion rationale as this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, storyPhotos data, PretextParagraph internals).
- [ ] Every typography row matches the §4 format (file:line opening-tag granularity, composite cascade, family/weight/style/transform/size/tracking in `Current`).
- [ ] Every color row matches the §5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings under `Current`.
- [ ] Every `text-foreground/<alpha>` / `text-background/<alpha>` instance is classified EXACT under the alpha-is-presentation rule.
- [ ] **No `text-white`, `text-black`, `text-gray-*`, raw `#fff` inline-style anywhere in Story scope** — walked, none found. If any appear during impl walk, classify per the Lab/Campus precedent (NEAR → MIGRATE to text-foreground or text-background).
- [ ] **The Story palette cluster (`#D4BA58` + `#D4BA5866` + `#D4BA5820` + `#8A7A20` + `#8A7A2033` + `STORY_COLOR` constant + inline-style sites + SectorHeader prop + NeighborhoodCampusDiagram constants + diagram SVG stroke + pillar-card border)** is classified **GAP → GAP-LOG-AND-MIGRATE** with one consolidated gap entry covering the cluster.
- [ ] FractalPattern call site (`StoryPage.tsx:202`) is **DOCUMENTED AS EXCLUDED** in the audit doc preamble per the FRAC-20/FRAC-24 precedent.
- [ ] SectorHeader call site (`StoryPage.tsx:209`) is classified **GAP → GAP-LOG-AND-MIGRATE** (Story has no canonical deep token — different from Lab's #C44878→house-publications-deep EXACT or Campus's #1A3A2E→house-campus-deep EXACT). Covered by the Story palette cluster entry.
- [ ] Both PretextParagraph sites (`StoryPage.tsx:179`, `:224`) are classified **GAP → GAP-LOG-AND-MIGRATE** with the rationale noting "covered by the Lab Pretext gap entry already in audit-gaps.md from 2026-06-08; no new entry."
- [ ] Cross-house leak check is documented as performed (no other-house tokens / hex found in Story's scope).
- [ ] The text-foreground-on-Story-golden-bg vs cream-on-saturated-house-bg divergence is captured in **Forward observations** with the rationale "audit accepts the editorial author choice; flagging for future system iteration to decide whether non-house saturated pages need their own paired-foreground convention."
- [ ] The body-paragraph size drift (text-sm md:text-base vs canonical .text-body text-base, weight 300/400 vs spec 400) appears in Forward observations as a continuation of the Lab/Campus pattern.
- [ ] The 12 worked-example rows above (5 typography + 7 color, including the consolidated palette gap row) appear verbatim in the audit doc, in the order presented, alongside any new rows the impl finds.
- [ ] Gap appendix in the audit doc mirrors the single new `audit-gaps.md` entry appended by this run, with the note about Pretext-being-covered-by-Lab.
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes.
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch — audit-only work, no `src/` changes, so no new regressions expected.

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt §10.
- Every in-scope file (`StoryPage.tsx`, `OriginStory.tsx`, `NeighborhoodCampusDiagram.tsx`, `PhotoGallery.tsx`, `GalleryImage.tsx`) is represented by at least one row.
- Exclusion list is documented in the audit doc with rationale matching this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, storyPhotos data, PretextParagraph internals).
- The 12 worked-example rows above appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag granularity, responsive element listing both renderings) are applied consistently across all rows.
- Project-wide text-color rule applied uniformly (every text-color finding maps to foreground/background — Story has no house, so no house-token uses).
- Surface foreground pairing rule applied to every `bg-*` site in scope. Each pairing site has its own row.
- House identity decision honored: NO house tokens classified as MIGRATE-as-is in Story chrome. The `#D4BA58` / `#8A7A20` palette is consistently classified as GAP, not EXACT/NEAR to a house pair.
- The Story palette gap cluster row in the audit doc and the audit-gaps.md entry are consistent (same sites enumerated, same proposed system changes listed).
- Pretext sites note the Lab gap precedent — no double-entry in audit-gaps.md.
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md` changes.
- Tests baseline (modulo any pre-existing failures on master — same as documented for Campus).

If the review finds rework: implementation-level for row-format drift or missed rows; plan-level only if a structural assumption above (FractalPattern exclusion, scope boundary, Story-palette GAP classification, PretextParagraph-covered-by-Lab decision) turns out wrong.

---

## Open questions to escalate

None blocking. The key open question — "how should the system handle Story's non-canonical golden palette?" — is itself the gap-log entry's "Proposed system change" line, deferred to the human-decision queue per audit-prompt §7. The audit's job is to surface it, not solve it.
