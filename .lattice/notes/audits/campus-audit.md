# Campus page — typography + color audit

**Page slug:** campus
**Source files:** `src/pages/CampusPage.tsx`, `src/components/sections/Campus.tsx`
**Audit date:** 2026-06-08
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px
**Branch:** `frac-24-audit-campus` (off master; Lab audit lives on master via FRAC-20 PR #182; Home audit lives upstream on PR #185, not yet merged)

## Scope

### In scope (source of truth: CampusPage's import graph)

- `src/pages/CampusPage.tsx` — the page entry (17 lines). Owns the page-level
  `<main>` surface (line 8) including the raw-hex `#2E6B4A` background and the
  inline raw-white text color.
- `src/components/sections/Campus.tsx` — the section body (~610 lines). The
  bulk of the audit. Contains all narrative paragraphs, headings, inline `<a>`
  (`InlineLink`), the `<SectorHeader>` call site, the `PrimaryButton` and
  `PhotoPlaceholder` helpers, the team-bios block, the McCarren Park
  blockquote, the events list, the amenities list.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#1A3A2E" />`
  call site at `CampusPage.tsx:9` — explicitly excluded per FRAC-20 (Lab)
  precedent. The FractalPattern `color` prop is a shared decorative SVG fill;
  not audited. The hex value at the call site (`#1A3A2E`) is documented here
  only as an excluded site.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` —
  shared chrome rendered on every page. Audited elsewhere if at all. Same
  exclusion rationale as Lab/Home.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across
  all house pages. Audited as a separate task. **Note:** Campus's call-site
  prop `color="#1A3A2E"` IS audited as part of `Campus.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked
  via `buttonVariants` (audit-prompt section 4). `<PrimaryButton>` wraps
  `<Button asChild>`, so the Button typography is owned by the component;
  **only** the inline `bg-black/20 hover:bg-black/30 text-center` className
  override at `Campus.tsx:161` is in scope (color audit row), and the wrapping
  `<a>` child (`Campus.tsx:163`) carries no extra Tailwind classes of its own.
- Tests, configs, package files.

### House identity (Campus = `campus`, NOT `school`)

Campus IS a house page. Per DESIGN.md → House mapping, Campus's internal id
is `campus` (slug prefix `house-campus-{light,deep}`) — distinct from `school`
(internal id `school`, displayName `Education`, slug prefix
`house-education-{light,deep}`). Do not cross the wires.

Locked rules for Campus:

- **`house-campus-light` (`#2E6B4A`) IS the page background** (default
  arrangement, not the forum/school inversion). `house-campus-deep`
  (`#1A3A2E`) is the accent (SectorHeader letter, accent borders).
- **Campus's `{light}` and `{deep}` ARE permitted** as text/highlight chrome
  on Campus pages — eyebrow text, focus rings, accent labels, display
  monogram letters. The SectorHeader letter and "Campus" eyebrow at
  `Campus.tsx:190` are display/highlight uses of `house-campus-deep`.
- **Other house colors are NOT permitted** as Campus chrome text.
- **Cream (paired-foreground)** is the editorial voice on Campus's saturated
  forest-green surfaces (both `{light}` page bg and any nested `{deep}`
  highlight surface). The FRAC-42 default for Campus is that both
  `--color-house-campus-light-foreground` and `--color-house-campus-deep-foreground`
  will resolve to `var(--color-background)` (same as Publications) — declared
  by FRAC-25 (Apply).
- **Any raw `text-white`, `text-white/<alpha>`, inline `color: "#fff"`,
  `decoration-white/<alpha>`, `border-white/<alpha>`, `bg-white/<alpha>`** on
  Campus's saturated bg → **NEAR MIGRATE** to the
  `text-house-campus-light-foreground` token (or decoration-/border-/bg-
  variant at the same alpha). Visual delta imperceptible (`#ffffff` vs
  `#f8f6f0`). This extends the Lab text-white precedent to Campus's
  paired-foreground token.
- **`bg-black/<alpha>` and `hover:bg-black/<alpha>`** on Campus chrome →
  **NEAR MIGRATE** to `bg-foreground/<alpha>` (charcoal token with alpha).
  Visually indistinguishable; mechanism is the drift.

### Inversion check

Campus is NOT a forum/school inverted page (per DESIGN.md → The forum/school
page-bg inversion). Campus uses `{light}` as the page bg (`#2E6B4A`) and
`{deep}` as the accent (`#1A3A2E`). Confirmed by reading `CampusPage.tsx:8`
(page bg inline-styled to `#2E6B4A` = `house-campus-light`) and
`Campus.tsx:190` (SectorHeader prop `color="#1A3A2E"` = `house-campus-deep`,
the accent use). No inversion finding.

### Cross-house leak check

Walked `CampusPage.tsx` and `Campus.tsx` for any `text-house-publications-*`,
`bg-house-publications-*`, `text-house-events-*`, `bg-house-events-*`,
`text-house-visit-*`, `bg-house-visit-*`, `text-house-education-*`,
`bg-house-education-*`, `text-house-political-club-*`,
`bg-house-political-club-*`, and raw hex values from other-house palettes
(`#E870A0`, `#C44878`, `#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#B52828`,
`#5C1010`, `#C83858`, `#6E1830`). **No cross-house leaks found** — Campus's
only declared color values are `#2E6B4A` (own `{light}`), `#1A3A2E` (own
`{deep}`), raw white in many forms (covered below), raw black at alpha (one
site), and `text-foreground` / `bg-foreground` from the selection-chrome
utilities.

## Typography audit

```
Element: src/components/sections/Campus.tsx:196 — <p className="text-display text-white mb-4 text-center">Fractal Campus</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). text-white handled in the color audit row below.
```

```
Element: src/components/sections/Campus.tsx:256 — <h2 className="text-title mb-8 normal-case">Fractal Campus serves four audiences</h2>
Current: family=Fraunces, weight=400, style=italic (from .font-serif + h2 global rule), transform=none (normal-case override), size=text-3xl (mobile), text-5xl (md+), tracking=0.04em
Nearest canonical utility: .text-title
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-title; typography is canonical. The h2 wrapper's global italic+uppercase rule is preserved by .text-title's italic spec and overridden by the normal-case className. Net rendering matches the spec. One of 12 .text-title sites in Campus.tsx (lines 256, 299, 321, 351, 383, 400, 435, 465, 482, 496, 518, 580) — they collapse to one typography row per (file + utility) grouping since the rendering is identical across all of them. Differences in trailing modifier classes (normal-case vs. unset) are noted in Rationale.
```

```
Element: src/components/sections/Campus.tsx:230 — <p className="text-2xl md:text-3xl font-serif leading-tight mb-8 normal-case">A <span className="italic">campus</span> in the heart of Williamsburg.</p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule on .font-serif), transform=none (normal-case override), size=text-2xl (mobile), text-3xl (md+), tracking=default Fraunces, leading=tight
Nearest canonical utility: .text-title
Match quality: NEAR
Action: MIGRATE
Rationale: .text-title is italic Fraunces text-3xl md:text-5xl mixed-case tracking 0.04em. Drift: mobile size text-2xl vs spec text-3xl; md size text-3xl vs spec text-5xl; missing tracking 0.04em; leading-tight is a per-site override (spec does not pin leading). Tier (display Fraunces italic) and role (section title — the overview paragraph reads as a title-tier statement) match. The inline <span className="italic"> is a no-op since the parent is already italic. Same NEAR pattern as Lab's "The Records" (LabPage:53) — title-tier rendered slightly small.
```

```
Element: src/components/sections/Campus.tsx:174 — <span className="text-label text-white/40">Photo</span>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-label
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-label; typography is canonical. Placeholder label inside PhotoPlaceholder. Color (text-white/40) handled in color audit row.
```

```
Element: src/components/sections/Campus.tsx:233,241,259,302,324,354,384,403,436,439,447,468,485,507,519,542,550,570,583 — body paragraphs and <ul> wrappers with className="… text-sm md:text-base text-white/90 font-light leading-relaxed …"
Current: family=Inter (body default), weight=300 (font-light), style=normal, transform=none, size=text-sm (mobile), text-base (md+), tracking=default, leading=relaxed
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: weight 300 (font-light) vs spec 400; mobile size text-sm vs spec text-base; leading-relaxed is a per-site override. Tier (body Inter) and role (narrative paragraph) match. Many sites (19+ paragraphs and list wrappers in Campus.tsx) collapse to one row per (file + utility) grouping for typography. Color rows handled separately under the white-on-Campus-bg findings.
```

```
Element: src/components/sections/Campus.tsx:218 — <p className="text-xs md:text-sm text-white/70 italic text-center">Want a reduced rate? Let us know. We want the space to be accessible to all.</p>
Current: family=Inter (body default), weight=400, style=italic, transform=none, size=text-xs (mobile), text-sm (md+), tracking=default
Nearest canonical utility: .text-body
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Italic Inter body at sub-base sizing (text-xs→text-sm) with text-center alignment — an editorial aside / note pattern. .text-body is upright Inter weight 400 text-base normal-case — wrong size (xs/sm vs base), wrong style (italic vs normal). .text-body-lead is also upright. No canonical body utility is italic-bodied. This is Campus's closest equivalent to Lab's PretextParagraph GAP — an editorial aside rendered at undersized italic body, sitting outside the Tailwind size contract for canonical body. Other italic aside sites in Campus.tsx use the same pattern at slightly different sizings (`text-sm text-white/70 italic` at lines 367, 419, 453, 503, 532, 570). Logging once; the gap entry covers the cluster.
```

```
Element: src/components/sections/Campus.tsx:200 — <p className="font-serif text-lg md:text-xl text-white/80 mb-8 normal-case"><InlineLink href={GOOGLE_MAPS_URL}>111 Conselyea St, Brooklyn, NY</InlineLink></p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-lg (mobile), text-xl (md+), tracking=default Fraunces
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: .text-subtitle is upright Fraunces weight 300 mixed-case text-xl md:text-2xl tracking 0.04em. Drift: style italic (.font-serif rule) vs spec normal (.text-subtitle is upright per post-FRAC-17 spec); weight 400 vs spec 300; size text-lg/text-xl vs spec text-xl/text-2xl; missing tracking 0.04em. Tier (display Fraunces) and role (address subtitle under the hero display heading) match the subtitle slot. Inline <a> child carries link decoration but does not re-declare typography; inherits from the <p>. Color row covers text-white/80 separately.
```

```
Element: src/components/sections/Campus.tsx:367,419,532 — <p className="text-white/70 italic">…</p> bio captions (Andrew Rose; Jake Zegil; bio role labels via {bio.role}) — italic Inter body without responsive sizing
Current: family=Inter (body default), weight=400, style=italic, transform=none, size=text-base (inherited from body default; no own size class), tracking=default
Nearest canonical utility: .text-body
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Italic Inter body in attribution/byline aside role. Same italic-body cluster as line 218 but at the body-default size (no text-xs/text-sm override). The .text-body utility is upright and the existing italic asides drift on style only here (vs both style and size at line 218). Collapsed into the line-218 GAP entry; covered by the same gap-appendix item. The 367/419/532 sites also share the text-white/70 color treatment (covered in the master text-white color row).
```

```
Element: src/components/sections/Campus.tsx:453 — <p className="mt-4 text-sm md:text-base text-white/70 italic font-light leading-relaxed max-w-3xl">Want to host an event here? <InlineLink href={MERLINS_EVENTS_MAILTO} external={false}>Email Merlin's Place</InlineLink></p>
Current: family=Inter (body default), weight=300 (font-light), style=italic, transform=none, size=text-sm (mobile), text-base (md+), tracking=default, leading=relaxed
Nearest canonical utility: .text-body
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Italic Inter body at body-paragraph responsive sizing — another aside-prose variant (sub-CTA hint after a button). Combines the body-paragraph NEAR pattern (text-sm md:text-base font-light leading-relaxed) with italic styling — neither .text-body nor .text-body-lead is italic. Folded into the line-218 italic-aside GAP cluster; covered by the same gap-appendix item.
```

```
Element: src/components/sections/Campus.tsx:503 — <footer className="mt-3 text-sm text-white/70">— Friedrich Nietzsche</footer>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Inline byline footer inside the McCarren Park blockquote. .text-body is text-base; drift is mobile-only size text-sm vs spec text-base. Tier (body Inter upright) and role (attribution line) match. Same slightly-undersized body pattern as the .text-body cluster above; sits inside <blockquote> with the body-paragraph cascade, not italic (so NOT a member of the italic-aside GAP). Color row covers text-white/70 separately.
```

```
Element: src/components/sections/Campus.tsx:500 — <p className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed normal-case">"All truly great thoughts are conceived while walking."</p>
Current: family=Fraunces, weight=400, style=italic (font-serif + explicit italic), transform=none (normal-case override), size=text-lg (mobile), text-xl (md+), tracking=default Fraunces, leading=relaxed
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: .text-subtitle is upright Fraunces weight 300 mixed-case text-xl md:text-2xl tracking 0.04em. Drift: style italic vs spec normal (deliberate — blockquote pull quote); weight 400 vs spec 300; size text-lg/text-xl vs spec text-xl/text-2xl. Tier (display Fraunces) and role (pull quote in McCarren Park blockquote) match the subtitle slot. Italic is editorially intentional for blockquote rendering — Apply task may choose to keep italic via a .font-serif + override or pick .text-title (which is italic at text-3xl md:text-5xl, too large for this density). Document the call-site italic-intentional decision in the Apply migration. Color row covers text-white/90 separately. NOT a member of the italic-aside GAP because it sits in the display tier, not the body tier — the canonical display tier accepts italic.
```

```
Element: src/components/sections/Campus.tsx:529 — <p className="text-lg md:text-xl font-serif text-white normal-case">{bio.name}</p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-lg (mobile), text-xl (md+), tracking=default Fraunces
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: .text-subtitle is upright Fraunces weight 300 mixed-case text-xl md:text-2xl tracking 0.04em. Drift: style italic (.font-serif rule) vs spec normal; weight 400 vs spec 300; size text-lg/text-xl vs spec text-xl/text-2xl; missing tracking 0.04em. Tier (display Fraunces) and role (team-bio name as a subtitle-tier headline above the role/bio prose) match. Two sites (one per bio entry in teamBios) collapse to one row by (file + utility) grouping. Color row covers text-white separately.
```

```
Element: src/components/sections/Campus.tsx:176 — <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed">{caption}</p> (PhotoPlaceholder caption)
Current: family=Inter (body default), weight=300 (font-light), style=normal, transform=none, size=text-xs (mobile), text-sm (md+), tracking=default, leading=relaxed
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: weight 300 vs spec 400; size text-xs/text-sm vs spec text-base. Tier (body Inter upright) and role (photo caption — short prose under a placeholder image) match. Renders at every photoCaptions site (PhotoPlaceholder used in the Meet the Space grid at line 391, looped over 7 captions). One row covers all instances via (file + utility) grouping.
```

```
Element: src/components/sections/Campus.tsx:534 — <div className="flex flex-wrap gap-4 text-sm text-white/80 font-light">…<InlineLink>…</InlineLink>…</div> (bio link row)
Current: family=Inter (body default), weight=300 (font-light), style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: weight 300 vs spec 400; size text-sm vs spec text-base. Tier (body Inter upright) and role (inline link row — "twitter · github" labels under the bio name) match. Per bio entry; two sites collapse by (file + utility) grouping into the broader body row above. Color row covers text-white/80 separately.
```

```
Element: src/components/sections/Campus.tsx:244 — <span aria-hidden className="text-white/50">—</span> (amenities bullet glyph)
Current: family=Inter (body default), weight=300 (font-light from parent <ul>), style=normal, transform=none, size=text-sm (mobile inherited), text-base (md+ inherited), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Em-dash bullet glyph; aria-hidden so semantically inert. Inherits typography from the parent <ul> at line 241 (which is itself a member of the .text-body cluster — see master row above). No own typography classes beyond color; rendered at the same NEAR profile as the parent. Listed for completeness; folded into the line-241 .text-body row. Color row covers text-white/50 separately.
```

```
Element: src/components/sections/Campus.tsx:537 — <span aria-hidden className="text-white/30">·</span> (interpunct between bio links)
Current: family=Inter (body default), weight=300 (font-light inherited from L534), style=normal, transform=none, size=text-sm (inherited), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Interpunct separator between bio links; aria-hidden so semantically inert. Inherits typography from the L534 <div>. No own typography classes beyond color. Same NEAR profile as the parent row. Listed for completeness; folded into the L534 .text-body row. Color row covers text-white/30 separately.
```

```
Element: src/components/sections/Campus.tsx:543 — <span className="text-white/60">Previously: </span> (bio prose label)
Current: family=Inter (body default), weight=300 (font-light inherited from L542 <p>), style=normal, transform=none, size=text-sm (mobile inherited), text-base (md+ inherited), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Inline "Previously: " label inside the bio paragraph; inherits typography from the L542 <p>. No own typography classes beyond color. Same NEAR profile as the parent .text-body cluster. Listed for completeness; folded into the master .text-body row. Color row covers text-white/60 separately.
```

```
Element: src/components/sections/Campus.tsx:261,268,282,286,442,585 — <strong className="font-semibold text-white">…</strong> (inline emphasis on audiences list, events list, and "Fractal" callout)
Current: family=Inter (body default), weight=600 (font-semibold override), style=normal, transform=none, size=text-sm (mobile inherited from parent), text-base (md+ inherited), tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: Inline emphasis. Parent list/paragraph is in the .text-body cluster; the <strong> bumps weight to 600 (font-semibold) for emphasis. .text-body's weight is 400; the inline weight bump is a deliberate per-site override of the canonical utility. Tier (body Inter) and role (inline emphasis on key labels: "Fractal AI Accelerator participants", "Fractal U", "Members", "Guests", event names, "Fractal") match. Six sites collapse to one row by (file + utility + role) grouping. Color row covers text-white separately.
```

```
Element: src/components/sections/Campus.tsx:40 — <a href={href} {...externalProps} className={inlineLinkClass}> (InlineLink wrapper component; inlineLinkClass at line 24–25 = "underline decoration-white/40 hover:decoration-white transition-colors")
Current: family=Inter (body default — inherited from each call site's parent), weight=inherited, style=inherited (italic in italic-aside callers, normal elsewhere), transform=none, size=inherited from parent, tracking=default
Nearest canonical utility: (inherited from caller; no own utility)
Match quality: EXACT (no own typography contribution)
Action: JUSTIFY
Rationale: InlineLink is a structural anchor wrapper for inline links; the only typography contribution is the underline + decoration utilities (chrome, not typography tier). Renders at every InlineLink call site (Campus.tsx:201, 262, 287, 329, 336, 455, 509, 520, 538, 572, 586/597/599/603 in the "by the way" section). No own typography utility; rendering follows the caller's tier. JUSTIFY (typography-neutral wrapper). Color rows cover decoration-white/40 and decoration-white separately (folded into the master text-white color row via the decoration-white pattern).
```

## Color audit

```
Element: src/pages/CampusPage.tsx:8 — <main className="relative min-h-screen selection:bg-foreground selection:text-background" style={{ backgroundColor: "#2E6B4A", color: "#fff" }}>
Current: backgroundColor: "#2E6B4A" (raw hex inline style), color: "#fff" (raw white inline style), selection:bg-foreground, selection:text-background (Tailwind utilities)
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: house-campus-light + house-campus-light-foreground (selection chrome: foreground / background)
Match quality: EXACT (#2E6B4A → house-campus-light) ; NEAR (#fff → house-campus-light-foreground) ; EXACT (selection chrome)
Action: MIGRATE
Rationale: Three migrations on a single node. (1) Raw-hex bg `#2E6B4A` matches house-campus-light exactly; drift is mechanism (inline style vs token-driven utility). Mirrors LabPage:16's #E870A0 → house-publications-light pattern. (2) Inline `color: "#fff"` (raw white) is not a canonical text token; migrate to text-house-campus-light-foreground per the project-wide text-color rule and the FRAC-42 surface-foreground pairing rule. Visual delta imperceptible (#ffffff vs #f8f6f0). The paired-foreground token resolves to cream by default. (3) Selection chrome already canonical (paired-inverse, FRAC-42 exempt). FRAC-25 Apply task declares all four house-campus sibling tokens in @theme inline before performing these migrations.
```

```
Element: src/components/sections/Campus.tsx:185 — <section id="campus" style={{ color: "#fff" }}>
Current: color: "#fff" (raw white inline style)
Role: text (section default — re-asserts white on the saturated bg from the parent <main>)
Nearest canonical token: house-campus-light-foreground
Match quality: NEAR
Action: MIGRATE
Rationale: Re-assertion of inline white color on the section root. Migrate to text-house-campus-light-foreground (or remove if the parent <main>'s migrated text-house-campus-light-foreground cascade is sufficient — Apply task chooses). Conservative migration keeps the cascade explicit and immune to future restructure.
```

```
Element: src/components/sections/Campus.tsx:174,176,196,200,233,241,244,259,261,262,268,273,282,286,302,324,354,367,384,403,419,436,439,442,447,453,468,485,500,503,507,519,529,532,537,542,550,570,583,585 — text-white and text-white/<alpha> (default, /30, /40, /50, /60, /70, /80, /90) across Campus.tsx body paragraphs, eyebrows, list bullets, italic asides, bio names, blockquote, decoration-white/<alpha> on inline links
Current: text-white (#ffffff), text-white/<alpha> (Tailwind alpha-modified raw white)
Role: text (default + body paragraphs + list items + eyebrow + display + bio names + italic asides + decoration on inline links + bullet glyphs + interpunct)
Nearest canonical token: house-campus-light-foreground (paired-foreground; cream)
Match quality: NEAR
Action: MIGRATE
Rationale: Per project-wide text-color rule (DESIGN.md → Text foregrounds): text is foreground or background; on a house's own page surface, the paired foreground token applies. Campus's page surface is house-campus-light, so its paired foreground is house-campus-light-foreground (resolves to cream per FRAC-42 default). White is not a canonical token; visual delta imperceptible (#ffffff vs #f8f6f0). All sites — 40+ JSX nodes spanning paragraphs, eyebrows, display, blockquote, bio names, italic asides, decoration utilities — collapse to one row by (file + token) grouping. Role line lists every role this token serves in Campus.tsx. Apply task migrates text-white → text-house-campus-light-foreground, text-white/<n> → text-house-campus-light-foreground/<n>, decoration-white/<n> → decoration-house-campus-light-foreground/<n>, etc. The inlineLinkClass constant at Campus.tsx:24-25 carries decoration-white/40 hover:decoration-white — Apply task migrates the constant in place, propagating to all InlineLink consumers.
```

```
Element: src/components/sections/Campus.tsx:190 — <SectorHeader letter="C" name="Campus" color="#1A3A2E" />
Current: "#1A3A2E" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Campus" eyebrow color)
Nearest canonical token: house-campus-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-campus-deep. Mirrors LabPage:24's color="#C44878" → house-publications-deep pattern from FRAC-20. Migrate to a token reference (CSS var, HOUSES[campus].palette.deep import, or the mechanism FRAC-25 Apply chooses). The drift is mechanism (raw hex literal), not value. House-deep as a display/highlight color on the house's own page is permitted under DESIGN.md → Text foregrounds. SectorHeader internals out of scope.
```

```
Element: src/components/sections/Campus.tsx:173 — <div className="aspect-[4/5] md:aspect-square w-full bg-white/5 border border-white/10 flex items-center justify-center">
Current: bg-white/5, border-white/10 (raw white Tailwind alpha-modified utilities)
Role: background + border
Nearest canonical token: house-campus-light-foreground (paired-foreground used as translucent cream tint over the {light} page surface)
Match quality: NEAR
Action: MIGRATE
Rationale: bg-white/5 is a translucent raised-cream surface tint inside a PhotoPlaceholder card. Raw white is not a canonical token; canonical cream is the paired-foreground house-campus-light-foreground. Apply task migrates: bg-white/5 → bg-house-campus-light-foreground/5, border-white/10 → border-house-campus-light-foreground/10. FRAC-42 pairing: this <div> declares a bg-* but no own text-* — the child <span className="text-label text-white/40"> at line 174 carries its own color, but the rule is to re-assert pairing on the surface node. NEAR add text-house-campus-light-foreground to the <div> for compositional safety. Two roles + one pairing addition collapse to one row by (file + token) grouping; Rationale enumerates the three migrations.
```

```
Element: src/components/sections/Campus.tsx:161 — <Button … className={cn(widthClass, "bg-black/20 hover:bg-black/30 text-center", wrapClass)}> (PrimaryButton override)
Current: bg-black/20, hover:bg-black/30 (raw black Tailwind alpha-modified utilities)
Role: background (default + hover) on Button surface — Campus-specific tint over the {light} page bg
Nearest canonical token: foreground (charcoal, canonical token used translucent as surface tint)
Match quality: NEAR
Action: MIGRATE
Rationale: Raw black is not canonical; charcoal #171717 (foreground token) is. The Campus-specific PrimaryButton tints the default Button surface with a translucent charcoal layer for readability over the green page bg — see Campus.tsx:147-150 comment. Apply task migrates: bg-black/20 → bg-foreground/20, hover:bg-black/30 → hover:bg-foreground/30. FRAC-42 pairing: a translucent foreground surface over a {light} surface with text cascading from the page-level text-house-campus-light-foreground (cream) reads correctly — translucent charcoal over cream-on-green produces a darker-green button face with cream text. This is an exempt composite (similar to selection-inverse-states pattern); no separate pairing migration. Document the rule edge case in Rationale.
```

```
Element: src/components/sections/Campus.tsx:499 — <blockquote className="border-l-2 border-white/30 pl-6 my-6 max-w-3xl">
Current: border-white/30 (raw white Tailwind alpha-modified utility)
Role: border (left accent on McCarren Park blockquote)
Nearest canonical token: house-campus-light-foreground (paired-foreground used as a translucent cream accent border)
Match quality: NEAR
Action: MIGRATE
Rationale: Raw white border is not canonical. Migrate to border-house-campus-light-foreground/30. Mirrors the bg-white/<n> / decoration-white/<n> pattern — paired-foreground used at alpha for chrome accents on the house's own surface. Single site; merged into the master text-white row above by (file + token) grouping only if the impl prefers density — otherwise its own row is fine.
```

```
Element: src/pages/CampusPage.tsx:8 — <main className="… selection:bg-foreground selection:text-background …">
Current: selection:bg-foreground (#171717), selection:text-background (#f8f6f0)
Role: selection-background + selection-text
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: Selection chrome already canonical (paired-inverse, FRAC-42 exempt from the surface-pairing check). No-op migration. Listed separately so the audit doc enumerates every token use on the page-level <main>; the same tokens also appear bundled inline in the top color row above. Two sites for the same tokens on the same node collapse via (file + token) grouping.
```

```
Element: src/pages/CampusPage.tsx:9 — <FractalPattern color="#1A3A2E" />
Current: "#1A3A2E" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per the FRAC-20 exclusion precedent)
Nearest canonical token: house-campus-deep (would be the migration target if in scope)
Match quality: N/A (out of scope)
Action: EXCLUDED
Rationale: FractalPattern is a shared decorative SVG fill; the `color` prop is out of scope per FRAC-20 (Lab) precedent. Documented here only to enumerate every color use on the page; FRAC-25 Apply does NOT migrate this site. If a future audit task brings FractalPattern in scope, the value-level migration is `#1A3A2E` → `house-campus-deep`. Listed for completeness, not migration.
```

## Forward observations (not GAPs under current rules)

Surfaced during this audit, not blocking the Apply task, recorded so the next
iteration of the system has them.

- **Container body size.** The dominant `.text-body` cluster (19 sites with
  `text-sm md:text-base text-white/90 font-light leading-relaxed`) reads
  slightly smaller and lighter than canonical `.text-body` (weight 400,
  text-base). Apply task will size up to `text-base` and shift weight to 400
  unless a future container-scoped utility lands. Same forward observation
  Lab logged (DocumentBadge:103, DocumentGrid:29) — the cross-page repetition
  suggests a future `.text-body-prose-light` or section-scoped body utility
  would capture the editorial intent better than the canonical single
  `.text-body`. Not a GAP under current rules because NEAR → MIGRATE cleanly
  resolves every row.

- **Italic-aside cluster density.** Campus has at least 5 sites (lines 218,
  367, 419, 453, 532) of italic body asides — small italic Inter text
  serving as editorial notes, bylines, and "want a reduced rate" / "host
  here" hints. This cluster motivates a future italic-body utility tier
  (e.g., `.text-body-aside` or `.text-body-note`) so editorial asides have a
  canonical home. Logged once as a single GAP entry in the gap appendix; the
  forward observation is the pattern density across this single page.

- **Subtitle slot under-sized.** The address line (Campus.tsx:200), the bio
  names (Campus.tsx:529), and the McCarren blockquote pull-quote
  (Campus.tsx:500) all render at `text-lg md:text-xl` Fraunces (italic in
  two cases, italic-by-intent in the third) where `.text-subtitle` is
  `text-xl md:text-2xl` upright. Apply task migrates each to `.text-subtitle`
  with the per-site override (italic for the blockquote) preserved. Not a
  GAP under current rules because tier and role match; the size delta is
  NEAR-acceptable drift.

- **PrimaryButton override edge case.** The translucent-charcoal-on-green
  `bg-black/20` pattern at Campus.tsx:161 introduces a Campus-specific
  surface composition (paired-foreground cream cascades through, no
  re-declaration needed) that the FRAC-42 pairing rule formally permits but
  doesn't model. If more houses ship similar translucent-button overrides,
  a documented exemption pattern ("translucent-foreground-as-surface-tint")
  would tighten the surface-pairing playbook.

## Gap appendix

```
- src/components/sections/Campus.tsx:218 — <p className="text-xs md:text-sm text-white/70 italic text-center">Want a reduced rate? Let us know.</p> (cluster: lines 218, 367, 419, 453, 503 footer line is upright so not a member, 532, 570)
  Nearest-fit chosen: .text-body
  Why it didn't fit: Italic Inter body at sub-base sizing (text-xs/text-sm at line 218; text-base elsewhere) serving editorial-aside / byline / sub-CTA roles. No canonical body utility is italic. .text-body and .text-body-lead are both upright; the display tier (.text-title, .text-subtitle) is italic but at display sizes (text-3xl+, text-xl+), too large for these inline asides.
  Proposed system change: add a body-aside italic tier (e.g., .text-body-aside or .text-body-note) sized to the existing body scale (text-sm or text-base) at Inter italic weight 400, with optional text-center variant. Alternative: codify the .font-serif italic rule as a body utility for short prose asides (note: would conflict with the existing Fraunces-implies-italic rule on .font-serif, so a dedicated body-mono-italic-aside utility is cleaner).
  Page: campus
  Date: 2026-06-08
```

### Branch ordering note (for reviewers)

This branch (`frac-24-audit-campus`) is off `master`. Master carries the
FRAC-20 Lab audit-gaps entry. The FRAC-22 Home audit-gaps entry lives
upstream on `frac-22-audit-home` / `frac-23-apply-home` (PRs #185 + #186)
and has not yet merged.

The `.lattice/notes/audit-gaps.md` on this branch contains:

1. The pre-existing FRAC-20 Lab entry (untouched, append-only).
2. The new FRAC-24 Campus entry appended below it.

When PRs land in order (FRAC-22 → FRAC-23 → FRAC-24), the merge resolution
will fold the FRAC-22 Home entry between the Lab and Campus entries (the
Home entry already lives in chronological-by-audit-date order on the
upstream branch; both Home and Campus are dated 2026-06-08, so the merge
preserves the chronological-by-PR-landing order via append-only rules). No
manual conflict resolution is required as long as each branch only appends
its own new entry and does not edit existing entries — which is the
audit-gaps.md author convention codified in the file's preamble.
