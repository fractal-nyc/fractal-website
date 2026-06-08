# Lab (Publications) audit — typography + color

## Page

- Page slug: lab
- Source: `src/pages/LabPage.tsx`
- Date: 2026-06-08
- Spec snapshot: `.lattice/notes/audit-prompt.md` (FRAC-19 author date: 2026-06-08)
- Mobile viewport baseline: 375px

In-scope components (LabPage's import graph): `LabPage.tsx`, `DocumentGrid.tsx`,
`DocumentBadge.tsx`, `ArchiveToolbar.tsx`, `ArchiveSearch.tsx`,
`PretextParagraph.tsx` (inline-style rendering only, as Lab uses it).

Out of scope (per plan): `TagFilter.tsx` (dead path on Lab today,
`showTags={false}` per FRAC-169), `SectorHeader.tsx` internals (audited as
shared-chrome sweep; only Lab's call-site prop is audited here),
`FractalPattern.tsx` (excluded by user direction — not even the call site),
Navbar / Footer / MandelbrotIcon / MandelbrotCorners / FadeIn (shared chrome),
`src/lib/pretext.ts` and `src/hooks/use-archive-filter.ts` (data/hook layer).

## Typography audit

```
Element: src/pages/LabPage.tsx:27 — <p className="text-display mb-6 text-center">A Research Institute…</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical).
```

```
Element: src/pages/LabPage.tsx:49 — <h2 className="text-eyebrow flex items-center gap-2 text-white mb-3">Research + Writing<MandelbrotIcon …/></h2>
Current: family=JetBrains Mono, weight=500, style=italic (DRIFT — inherited from h1–h6 global rule; .text-eyebrow does not reset font-style), transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: Utility is already canonical. The h2 wrapper pulls italic from src/index.css h1–h6 rule; .text-eyebrow doesn't override font-style, so rendering drifts italic. Apply task: keep .text-eyebrow, demote h2 → span or add font-style:normal override. Recurring sitewide pattern (chrome utility on h-tag) — flag in audit-gaps so dedup happens later.
```

```
Element: src/pages/LabPage.tsx:53 — <p className="text-3xl md:text-4xl font-serif leading-tight normal-case">The Records</p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif), transform=none (normal-case override), size=text-3xl (mobile), text-4xl (md+), tracking=default Fraunces
Nearest canonical utility: .text-title
Match quality: NEAR
Action: MIGRATE
Rationale: .text-title is italic Fraunces text-3xl md:text-5xl mixed-case tracking 0.04em. Drift: md size text-4xl vs spec text-5xl; missing tracking 0.04em. Tier (display Fraunces italic) and role (section title) match.
```

```
Element: src/pages/LabPage.tsx:58 — <PretextParagraph size={TEXT_SIZES.base}> rendered as inline-styled <p>/<div>
Current: family=JetBrains Mono (FONTS.body), weight=300 (font-light className), style=normal, transform=none, size=13px (TEXT_SIZES.base, inline), tracking=default
Nearest canonical utility: .text-body-lead
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Body-tier rendering at custom 13px JBM weight 300. .text-body-lead is Inter text-lg weight 300 — wrong family AND wrong size. .text-body is Inter text-base weight 400 — also wrong family. No canonical body utility uses mono. Pretext-driven sizing breaks the Tailwind size contract; logging.
```

```
Element: src/components/lab/DocumentBadge.tsx:80 — <span className="text-eyebrow" style={{ color: LAB_DEEP }}>Publication</span>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-eyebrow; typography is canonical. Color handled in color audit row.
```

```
Element: src/components/lab/DocumentBadge.tsx:94 — <h3 className="text-subtitle leading-snug normal-case">{document.title}</h3>
Current: family=Fraunces, weight=300, style=normal (DRIFT — h3 global rule sets italic; .text-subtitle resets style=normal so the utility wins here), transform=none (normal-case override), size=text-xl (mobile), text-2xl (md+), tracking=0.04em, leading-snug
Nearest canonical utility: .text-subtitle
Match quality: NEAR
Action: MIGRATE
Rationale: Utility canonical. Drift: leading-snug (1.375) is a per-call-site override of the default; the .text-subtitle spec does not pin a line-height, so this is acceptable drift but worth noting for the Apply task. h3 wrapper does pull italic + uppercase from the global rule, but .text-subtitle explicitly sets font-style:normal and the normal-case className overrides text-transform — net rendering matches the spec.
```

```
Element: src/components/lab/DocumentBadge.tsx:99 — <p className="text-sm text-muted-foreground mt-1">{authorName}</p>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family (Inter vs JBM), weight (400 vs 500), transform (none vs uppercase), tracking (default vs 0.1em) — but the semantic role (inline metadata: author byline) matches .text-meta's intent, and size (text-sm) matches. Color row covers text-muted-foreground separately.
```

```
Element: src/components/lab/DocumentBadge.tsx:103 — <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{document.description}</p>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-sm, tracking=default, leading-relaxed
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: size text-sm vs spec text-base. Tier (body Inter) and role (description prose) match. Slightly undersized body copy — Apply task should size up to text-base or document the smaller-body decision. Color row covers text-muted-foreground separately.
```

```
Element: src/components/lab/DocumentGrid.tsx:26 — <p className="text-lg font-light text-muted-foreground">No documents match your filters.</p>
Current: family=Inter (body default), weight=300, style=normal, transform=none, size=text-lg, tracking=default
Nearest canonical utility: .text-body-lead
Match quality: EXACT
Action: MIGRATE
Rationale: .text-body-lead is Inter weight 300 normal-case text-lg leading 1.7. Family, weight, size all match; leading not declared at call site (inherits default — Apply task can add the leading-1.7 from the utility). Empty-state lede copy maps cleanly to body-lead's role.
```

```
Element: src/components/lab/DocumentGrid.tsx:29 — <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or clearing some tags.</p>
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: size text-sm vs spec text-base. Same pattern as DocumentBadge:103 — slightly undersized body copy. Color row covers text-muted-foreground separately.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:47 — <p className="text-muted-foreground font-light">Showing <span>N</span> of <span>M</span> documents</p>
Current: family=Inter (body default), weight=300, style=normal, transform=none, size=text-sm (inherited from parent `text-sm` on the wrapper at line 46), tracking=default
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family/weight/transform/tracking but the semantic role (inline result-count metadata) matches .text-meta. Size (text-sm via parent) matches. Color row covers text-muted-foreground separately. Inline children at line 49/53 toggle to font-medium text-foreground — see next row.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:49,53 — <span className="font-medium text-foreground">{filtered.length}</span> ... <span className="font-medium text-foreground">{total}</span>
Current: family=Inter (body default), weight=500, style=normal, transform=none, size=text-sm (inherited from line-46 parent), tracking=default
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: Same row as parent (line 47). The inline numeric spans bump weight to 500 to highlight the count; .text-meta lands at weight 500 natively. Drift remains on family/transform/tracking. Two sites (line 49 + line 53) collapse to one row by the (file + utility + role) grouping rule applied to typography.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:56 — <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground underline …">Clear filters</button>
Current: family=Inter (body default), weight=500, style=normal, transform=none, size=text-sm, tracking=default
Nearest canonical utility: .text-label
Match quality: NEAR
Action: MIGRATE
Rationale: Inline `<button>` (NOT the Button component, so audited as text per section 4). .text-label is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on family/transform/tracking; size and weight match. Semantic role (form/UI label-as-action) maps to .text-label. Color row covers text-muted-foreground + hover:text-foreground separately. Focus ring uses raw #C44878 — separate color row.
```

```
Element: src/components/lab/ArchiveSearch.tsx:32 — <input type="search" placeholder="SEARCH TITLES, AUTHORS, TOPICS..." className="text-base font-light text-foreground placeholder:text-muted-foreground …">
Current: family=Inter (body default), weight=300, style=normal, transform=none (placeholder rendered uppercase via the literal string content, not via CSS), size=text-base, tracking=default
Nearest canonical utility: .text-body-lead
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body-lead is Inter weight 300 normal-case text-lg leading 1.7. Drift: size text-base vs spec text-lg; leading not declared. Family and weight match. text-base on iOS prevents zoom on focus (deliberate accessibility choice — Apply task should preserve the iOS-zoom guard either by keeping text-base or by switching to a utility that emits >=16px). Color rows handled separately for the placeholder vs text colors.
```

## Color audit

```
Element: src/pages/LabPage.tsx:16 — <main style={{ backgroundColor: "#E870A0" }}>
Current: #E870A0 (raw hex inline style)
Role: background
Nearest canonical token: house-publications-light
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-publications-light. Migrate to token reference; Apply task chooses mechanism (declare in @theme inline, use CSS var, or HOUSES[lab].palette.light import).
```

```
Element: src/pages/LabPage.tsx:16 — <main className="… text-foreground selection:bg-foreground selection:text-background …">
Current: text-foreground (#171717), selection:bg-foreground, selection:text-background
Role: text + selection-background + selection-text
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: Already on canonical tokens. No migration needed beyond a no-op rewrite. Page-level default text-foreground on a saturated house-light bg is intentional per the project text-color rule (foreground or background; house pair for display/highlight only).
```

```
Element: src/pages/LabPage.tsx:24 — <SectorHeader letter="P" name="Publications" color="#C44878" />
Current: "#C44878" (raw hex string prop)
Role: prop (consumed by SectorHeader as fill/text/accent; SectorHeader internals audited separately)
Nearest canonical token: house-publications-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-publications-deep. Migrate to a token reference (CSS var, HOUSES[lab].palette.deep import, or the same mechanism chosen for LabPage:16). The drift is mechanism (raw hex literal), not value. SectorHeader's internal use of the prop is out of scope for this audit.
```

```
Element: src/pages/LabPage.tsx:48 — <div className="… border-b border-border …">
Current: border-border (CSS var --border resolves to #dddad5)
Role: border
Nearest canonical token: border
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical border token. No-op migration.
```

```
Element: src/pages/LabPage.tsx:49,58 — text-white on "Research + Writing" eyebrow and on PretextParagraph lede
Current: text-white (#ffffff)
Role: text
Nearest canonical token: background (cream #f8f6f0)
Match quality: NEAR
Action: MIGRATE
Rationale: Per project rule (locked 2026-06-08, codified in DESIGN.md by this PR): text foregrounds are text-foreground (charcoal) or text-background (cream); house colors permitted only for display/highlight cases on the house's own page. White is not a token. The eyebrow + Pretext lede are body/chrome on saturated bg — not display/highlight — so migrate to text-background. Visual delta imperceptible (#ffffff vs #f8f6f0). Two sites (line 49 + line 58) collapse to one row by (file + token) grouping.
```

```
Element: src/components/lab/DocumentBadge.tsx:34,71,76,81,111 — LAB_DEEP = HOUSES.find(h => h.id==="lab")!.palette.deep ; used in 5 sites in this component (icon bg with alpha, icon stroke, eyebrow text, accent bar bg, etc.)
Current: runtime read of HOUSES[lab].palette.deep → #C44878
Role: text + background + stroke + fill
Nearest canonical token: house-publications-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Value is canonical and pulled via the data model (correct pattern). DocumentBadge sits on the Lab page → house colors permitted for highlight chrome. Multiple sites in one row because role-distinct uses all resolve to the same token. Apply task may CSS-var-ify or leave the runtime lookup as-is.
```

```
Element: src/components/lab/DocumentBadge.tsx:58 — className="… border border-border bg-background …"
Current: border-border (#dddad5), bg-background (#f8f6f0)
Role: border + background
Nearest canonical token: border / background
Match quality: EXACT
Action: MIGRATE
Rationale: Already on canonical tokens. Card surface (cream over the saturated pink page bg) renders the badge as an editorial card. No-op migration.
```

```
Element: src/components/lab/DocumentBadge.tsx:60 — className="… hover:border-[#C44878]/40 …"
Current: #C44878 (raw hex inside Tailwind arbitrary value, with /40 alpha)
Role: border (hover state)
Nearest canonical token: house-publications-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-publications-deep; drift is mechanism (arbitrary Tailwind value `border-[#C44878]/40` instead of a token reference). House-deep on the house's own page is permitted as highlight chrome (hover affordance). Apply task migrates to a token-driven Tailwind utility once the token is declared in @theme.
```

```
Element: src/components/lab/DocumentBadge.tsx:61 — className="… focus-visible:ring-ring …"
Current: focus-visible:ring-ring (resolves to #171717)
Role: ring (focus)
Nearest canonical token: ring
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical ring token (charcoal). No-op migration. Note: contrast with the canonical text-color rule — charcoal ring on a cream card sitting on a saturated pink page is acceptable focus chrome. Not switched to house-deep because the focus ring elsewhere in DocumentBadge / on the toolbar uses #C44878 inconsistently; consolidating those is an Apply-task call.
```

```
Element: src/components/lab/DocumentBadge.tsx:89,99,103 — text-muted-foreground on the ArrowUpRight icon and on the author / description paragraphs
Current: text-muted-foreground (CSS var --muted-foreground resolves to #525252)
Role: text + stroke
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. Three sites collapse to one row by (file + token) grouping. The text-color rule permits muted-foreground because it is a surface token (not a raw text-white / text-gray), and the cards sit on cream bg-background where muted-foreground meets WCAG AA per FRAC-33.
```

```
Element: src/components/lab/DocumentGrid.tsx:26,29 — text-muted-foreground on the empty-state paragraphs
Current: text-muted-foreground (#525252)
Role: text
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. Two sites collapse to one row by (file + token) grouping.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:47,60,61 — text-muted-foreground and hover:text-foreground on the result-count paragraph and the Clear filters button
Current: text-muted-foreground (#525252), text-foreground (#171717)
Role: text (default + hover)
Nearest canonical token: muted-foreground / foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on canonical tokens. Three sites collapse to one row by (file + token) grouping. Inline numeric children at 49/53 use text-foreground — covered in next row.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:49,53 — <span className="font-medium text-foreground">…</span> on the result count numerals
Current: text-foreground (#171717)
Role: text
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. Two sites collapse to one row by (file + token) grouping.
```

```
Element: src/components/lab/ArchiveToolbar.tsx:64 — className="… focus:ring-[#C44878]/40 focus:rounded"
Current: #C44878 (raw hex inside Tailwind arbitrary value, with /40 alpha)
Role: ring (focus)
Nearest canonical token: house-publications-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-publications-deep; drift is mechanism (Tailwind arbitrary value). House-deep on the house's own page is permitted as highlight chrome (focus ring on a button affordance). Apply task migrates to a token-driven utility.
```

```
Element: src/components/lab/ArchiveSearch.tsx:27 — <Search className="… text-muted-foreground …" />
Current: text-muted-foreground (#525252)
Role: stroke (icon, via currentColor)
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on the canonical token. No-op migration.
```

```
Element: src/components/lab/ArchiveSearch.tsx:42,43 — <input className="… bg-background border border-border text-foreground placeholder:text-muted-foreground …">
Current: bg-background (#f8f6f0), border-border (#dddad5), text-foreground (#171717), placeholder:text-muted-foreground (#525252)
Role: background + border + text + placeholder
Nearest canonical token: background / border / foreground / muted-foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All four classes already on canonical tokens. Four sites in one row by (file + tokens-bundle) grouping for the input chrome.
```

```
Element: src/components/lab/ArchiveSearch.tsx:45,60 — className="… focus:ring-[#C44878]/40 focus:border-[#C44878]/60 …" (input) and "… focus:ring-[#C44878]/40 …" (clear button)
Current: #C44878 (raw hex inside Tailwind arbitrary value, with /40 or /60 alpha)
Role: ring (focus) + border (focus)
Nearest canonical token: house-publications-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-publications-deep; drift is mechanism (Tailwind arbitrary value). House-deep on the house's own page is permitted as highlight chrome (focus ring + focus border on input affordance). Three sites (input ring, input border, clear-button ring) collapse to one row by (file + token) grouping. Apply task migrates to token-driven utilities.
```

```
Element: src/components/lab/ArchiveSearch.tsx:58 — <button className="… text-muted-foreground hover:text-foreground …">
Current: text-muted-foreground (#525252), text-foreground (#171717) on hover
Role: text (default + hover)
Nearest canonical token: muted-foreground / foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on canonical tokens. No-op migration. Clear-button affordance.
```

## Gap appendix

```
- src/pages/LabPage.tsx:58 — <PretextParagraph size={TEXT_SIZES.base}> rendered as inline-styled <p>/<div> (JBM 13px weight 300)
  Nearest-fit chosen: .text-body-lead
  Why it didn't fit: No canonical body utility uses mono. .text-body-lead is Inter text-lg weight 300; .text-body is Inter text-base weight 400. Pretext always renders via FONTS.body (JetBrains Mono) at inline px sizes from TEXT_SIZES, which sits outside the Inter-only body tier and outside the Tailwind size scale.
  Proposed system change: add a body-mono utility tier (e.g., .text-body-mono / .text-body-mono-lead) sized to the TEXT_SIZES bridge (sm=12px, base=13px, lg=15px), OR re-author Pretext to consume Tailwind body utilities instead of TEXT_SIZES px constants.
  Page: lab
  Date: 2026-06-08
```
