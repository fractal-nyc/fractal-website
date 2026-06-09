# Visit page — typography + color audit

**Page slug:** visit
**Source files:** `src/pages/NeighborhoodPage.tsx`
**Audit date:** 2026-06-09
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px
**Branch:** `frac-32-audit-visit` (off master)

## Scope

### In scope (source of truth: NeighborhoodPage's import graph)

- `src/pages/NeighborhoodPage.tsx` — the page entry (~78 lines). Single render
  block. Owns the page-level `<main>` surface (line 13, raw-hex `#889460`
  inline `style` + `text-foreground` className + `selection:bg-foreground
  selection:text-background`), the SectorHeader call site (line 20, raw-hex
  `color="#4A5A30"` prop), the "Note" MandelbrotCorners disclaimer card with
  its `text-eyebrow` / `text-xs` text-bearing children (lines 29–49), the
  PretextParagraph lead text (lines 54–59), and the Visitor Form CTA Button
  wrapper (lines 60–68).

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern
  color="#4A5A30" />` call site at `NeighborhoodPage.tsx:14` — explicitly
  excluded per FRAC-20 (Lab) precedent. The FractalPattern `color` prop is a
  shared decorative SVG fill; not audited. The hex value at the call site
  (`#4A5A30`) is documented below in the color audit only as an excluded site.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`
  (component internals — only the inline className overrides on the
  `<MandelbrotCorners …>` call site at `NeighborhoodPage.tsx:29` are in
  scope) — shared chrome rendered on every page. Same exclusion rationale as
  Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across
  all house pages. Audited as a separate task. **Note:** the call-site prop
  `color="#4A5A30"` at `NeighborhoodPage.tsx:20` IS audited as part of
  `NeighborhoodPage.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography
  locked via `buttonVariants` (audit-prompt section 4). The `<Button asChild>`
  wrapping the `<a>` at `NeighborhoodPage.tsx:60-68` carries no inline color
  overrides; the wrapped `<a>` carries no Tailwind classes. Out of scope for
  color, except to verify no color override is being added.
- `src/components/pretext/PretextParagraph.tsx` and `src/lib/pretext.ts`
  internals — the Pretext rendering layer is out of scope as a system (per
  audit-prompt section 4 "Pretext-rendered text"). **Only the inline
  className override `text-white` on the PretextParagraph call site at
  `NeighborhoodPage.tsx:54-59` is in scope for color**, and the inline px
  size (`TEXT_SIZES.sm` = 12px) is in scope for typography classification.
- `src/components/sections/NeighborhoodCampusDiagram.tsx` — exists but is
  NOT imported by `NeighborhoodPage.tsx`. It is rendered on the Story page.
  Out of scope for this audit.
- Tests, configs, package files.

### House identity (Visit = `neighborhood` id, `house-visit-*` token slug)

Visit IS a house page. **The internal data-model `id` is `neighborhood`; the
displayName is `Visit`; the token slug prefix is `house-visit-{light,deep}`.**
Per DESIGN.md → House mapping, the token system uses the displayName slug
(not the internal id) for token naming. **Do not cross the wires.** The route
`/neighborhood` and the data `HOUSES.find(h => h.id === "neighborhood")` use
the internal id; the CSS tokens `--color-house-visit-light` etc. use the
displayName slug.

This is the **critical house-identity binding rule for this audit:** every
color row that names a future token writes `house-visit-{...}` (NOT
`house-neighborhood-*`). The Apply task (FRAC-33) will declare exactly those
four token names in `@theme inline`:

- `--color-house-visit-light` (= `#889460`)
- `--color-house-visit-deep` (= `#4A5A30`)
- `--color-house-visit-light-foreground` (= `var(--color-background)`, cream)
- `--color-house-visit-deep-foreground` (= `var(--color-background)`, cream)

Locked rules for Visit:

- **`house-visit-light` (`#889460`) IS the page background** (default
  arrangement, not the forum/school inversion). `house-visit-deep`
  (`#4A5A30`) is the accent (SectorHeader letter, FractalPattern fill —
  excluded site).
- **Visit's `{light}` and `{deep}` ARE permitted** as text/highlight chrome
  on Visit pages — eyebrow text, focus rings, accent labels, display
  monogram letters. The SectorHeader letter "V" and "Visit" eyebrow at
  `NeighborhoodPage.tsx:20` are display/highlight uses of `house-visit-deep`.
- **Other house colors are NOT permitted** as Visit chrome text.
- **Cream (paired-foreground)** is the editorial voice on Visit's saturated
  olive-green `{light}` surface. The FRAC-42 default for Visit is that both
  `--color-house-visit-light-foreground` and `--color-house-visit-deep-foreground`
  resolve to `var(--color-background)` (same as Publications and Campus) —
  declared by FRAC-33.
- **Any raw `text-white` or inline `color: "#fff"`** on Visit's saturated
  bg → **NEAR MIGRATE** to `text-house-visit-light-foreground`. Visual delta
  imperceptible (`#ffffff` vs `#f8f6f0`). This is the Lab/Campus text-white
  precedent extended to Visit's paired-foreground token.
- **`text-foreground` (charcoal) on the page-level `<main>` is a FRAC-42
  mispairing.** Per Surface foreground pairing, `bg-house-visit-light`
  pairs with `text-house-visit-light-foreground` (cream), NOT `text-foreground`
  (charcoal). The current rendering is charcoal text on olive-green; the
  canonical rendering is cream text on olive-green. **Visual delta is
  noticeable** (charcoal → cream) — flagged in the L13 finding as a
  legitimate Apply-time rendering change.

### Inversion check

Visit is NOT a forum/school inverted page (per DESIGN.md → The forum/school
page-bg inversion). Visit uses `{light}` as the page bg (`#889460`) and
`{deep}` as the accent (`#4A5A30`). Confirmed by reading
`NeighborhoodPage.tsx:13` (page bg inline-styled to `#889460` =
`house-visit-light`) and `NeighborhoodPage.tsx:20` (SectorHeader prop
`color="#4A5A30"` = `house-visit-deep`, the accent use). **No inversion
finding.**

### Cross-house leak check

Walked `NeighborhoodPage.tsx` for any `text-house-publications-*`,
`bg-house-publications-*`, `text-house-events-*`, `bg-house-events-*`,
`text-house-campus-*`, `bg-house-campus-*`, `text-house-education-*`,
`bg-house-education-*`, `text-house-political-club-*`,
`bg-house-political-club-*`, and raw hex values from other-house palettes
(`#E870A0`, `#C44878`, `#2E6B4A`, `#1A3A2E`, `#D4857A`, `#C13B2A`,
`#B52828`, `#5C1010`, `#C83858`, `#6E1830`). **No cross-house leaks found**
— Visit's only declared color values are `#889460` (own `{light}`),
`#4A5A30` (own `{deep}`, two sites: SectorHeader prop in scope + FractalPattern
prop excluded), raw `text-white` (four sites), `text-foreground` (one site
on the `<main>` — MISPAIRED, see L13 row), and `border-foreground` /
`bg-foreground` (two sites with alpha on the MandelbrotCorners card +
selection chrome).

## Typography audit

```
Element: src/pages/NeighborhoodPage.tsx:23 — <p className="text-display mb-3 md:mb-10 text-center">Live Near 100 Friends & Peers</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). Wrapped by <FadeIn> at L22 which contributes no typography. The Hero display heading for the Visit page; mirrors LabPage:27 and Campus.tsx:196 EXACT patterns.
```

```
Element: src/pages/NeighborhoodPage.tsx:30 — <p className="text-eyebrow text-white mb-2 md:mb-3">Note</p>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-eyebrow; typography is canonical. "Note" is the eyebrow label on the MandelbrotCorners disclaimer card. Color (text-white) handled in the master text-white color row below.
```

```
Element: src/pages/NeighborhoodPage.tsx:33,37 — <p className="text-xs leading-relaxed text-white">…</p> (line 33 — disclaimer body) and <ol className="list-decimal list-inside space-y-1 md:space-y-2 text-xs leading-relaxed text-white text-left">…</ol> (line 37 — ordered list)
Current: family=Inter (body default), weight=400, style=normal, transform=none, size=text-xs, tracking=default, leading=relaxed
Nearest canonical utility: .text-body
Match quality: NEAR
Action: MIGRATE
Rationale: .text-body is Inter weight 400 normal-case text-base. Drift: size text-xs (12px) vs spec text-base (16px) — undersized by two Tailwind size steps. Family, weight, style, transform all match. Tier (body Inter upright) and role (disclaimer body + ordered-list copy inside the "Note" card) match. Two sites (line 33 paragraph + line 37 ordered list) collapse to one row by (file + utility) grouping — the <li> children inherit typography from the <ol>. The flat text-xs (no md:text-base) is a deliberate per-site density override for the compact "Note" card; Apply task either sizes up to text-base or keeps the override side by side with .text-body and documents the size deviation. Color rows handled separately.
```

```
Element: src/pages/NeighborhoodPage.tsx:54 — <PretextParagraph size={TEXT_SIZES.sm} className="text-white mb-3 md:mb-4">{"Want to visit? Fill out this form."}</PretextParagraph> (rendered as inline-styled <p>/<div> by PretextParagraph)
Current: family=JetBrains Mono (FONTS.body), weight=400 (default — no font-light className), style=normal, transform=none, size=12px (TEXT_SIZES.sm, inline), tracking=default
Nearest canonical utility: .text-body
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Pretext-rendered body-tier text at custom 12px JBM weight 400. .text-body is Inter text-base (16px) weight 400; .text-body-lead is Inter text-lg (18px) weight 300. Family mismatch (JBM vs Inter) and size mismatch (12px vs 16px) — no canonical body utility uses mono OR sizes at 12px. Pretext-driven sizing breaks the Tailwind size contract. Same sitewide gap as LabPage:58 (`TEXT_SIZES.base` = 13px) — Visit's callsite uses `TEXT_SIZES.sm` (12px), one size step smaller. The Lab parent gap entry covers the system-level pattern; Visit appends its own gap entry citing the parent and the specific size step used here. Apply task migrates only the className `text-white` (color audit row) — the Pretext typography itself stays unchanged because no canonical utility fits.
```

## Color audit

```
Element: src/pages/NeighborhoodPage.tsx:13 — <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#889460" }}>
Current: backgroundColor: "#889460" (raw hex inline style), text-foreground (Tailwind utility), selection:bg-foreground, selection:text-background
Role: background + text (page default — MISPAIRED) + selection-background + selection-text
Nearest canonical token: house-visit-light + house-visit-light-foreground (selection chrome: foreground / background)
Match quality: EXACT (#889460 → house-visit-light) ; NEAR (text-foreground → text-house-visit-light-foreground; this is the FRAC-42 mispairing finding) ; EXACT (selection chrome)
Action: MIGRATE
Rationale: Three migrations on a single node. (1) Raw-hex bg `#889460` matches house-visit-light exactly; drift is mechanism (inline style vs token-driven utility). Mirrors LabPage:16 (#E870A0 → house-publications-light) and CampusPage:8 (#2E6B4A → house-campus-light). (2) **`text-foreground` is the FRAC-42 mispairing finding for Visit.** Per the Surface foreground pairing rule, `bg-house-visit-light` pairs with `text-house-visit-light-foreground` (cream), NOT `text-foreground` (charcoal). The current rendering is charcoal text on olive-green; the canonical rendering is cream text on olive-green. **Visual delta is noticeable** — this is a legitimate rendering change in Apply, flagged so reviewer eyes-on at 375px catches it intentionally. NEAR MIGRATE to text-house-visit-light-foreground; the paired-foreground token resolves to cream per FRAC-42 default. (3) Selection chrome already canonical (paired-inverse, FRAC-42 exempt). FRAC-33 Apply task declares all four house-visit sibling tokens in @theme inline before performing these migrations.
```

```
Element: src/pages/NeighborhoodPage.tsx:29 — <MandelbrotCorners size="sm" opacity={0.15} className="border border-foreground/20 rounded-md px-6 py-5 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-left max-w-xl mx-auto">
Current: bg-foreground/[0.03] (canonical foreground token at /3% alpha via Tailwind arbitrary syntax), border-foreground/20 (canonical foreground token at /20 alpha)
Role: background (card surface tint) + border + pairing-addition-needed (text-* not co-declared on this node)
Nearest canonical token: foreground (background tint and border) + house-visit-light-foreground (pairing addition for FRAC-42)
Match quality: EXACT (bg-foreground tokens) ; NEAR (FRAC-42 pairing: no co-declared text-*)
Action: MIGRATE
Rationale: Two foreground-token utilities + one pairing addition. (1) `bg-foreground/[0.03]` is the canonical foreground token at 3% alpha — drift is the arbitrary-value alpha syntax (`/[0.03]`) vs. the standard-step alpha syntax (`/3`); both resolve to the same value, so classify EXACT. The translucent-charcoal surface tint over a `{light}` page surface is the same exempt-composite pattern as Campus PrimaryButton (`bg-foreground/20` over `bg-house-campus-light`) — translucent charcoal over `{light}` with cream text cascading reads correctly. (2) `border-foreground/20` is canonical foreground at /20 alpha — EXACT, no migration needed. (3) **FRAC-42 pairing addition:** this card declares a `bg-foreground/[0.03]` surface but no own `text-*` foreground — the children at lines 30, 33, 37 each carry their own `text-white` (covered in the master row below) and migrate to `text-house-visit-light-foreground`. The card SHOULD re-assert its own paired-foreground for compositional safety per FRAC-42. NEAR pairing: Apply task adds `text-house-visit-light-foreground` to the card's className. Roles collapse into one row by (file + token) grouping; the rationale enumerates the three migrations. Note: the canonical Tailwind arbitrary `/[0.03]` alpha may be re-expressed as the standard `/[3%]` or kept verbatim — Apply task chooses; both render identically.
```

```
Element: src/pages/NeighborhoodPage.tsx:13,30,33,37,56 — text-foreground and text-white on the page-level <main> default, the "Note" eyebrow, the disclaimer body, the ordered list, the PretextParagraph className
Current: text-foreground (#171717 on the <main> — MISPAIRED, see L13 row above for the dedicated finding); text-white (#ffffff) on the four other sites
Role: text (page default — MISPAIRED) + text (eyebrow) + text (body) + text (list copy) + text (PretextParagraph lead)
Nearest canonical token: house-visit-light-foreground (paired-foreground; cream)
Match quality: NEAR
Action: MIGRATE
Rationale: Per project-wide text-color rule (DESIGN.md → Text foregrounds): text is foreground or background; on a house's own page surface, the paired foreground token applies. Visit's page surface is house-visit-light, so its paired foreground is house-visit-light-foreground (resolves to cream per FRAC-42 default). White is not a canonical token; visual delta imperceptible (#ffffff vs #f8f6f0). The `text-foreground` on the `<main>` (L13) is a mispairing — visual delta IS noticeable (charcoal → cream) — covered in the L13 dedicated row above; listed here for the (file + token) grouping completeness. All four `text-white` sites — eyebrow at L30, disclaimer body at L33, ordered list at L37, PretextParagraph className at L56 — collapse to this single row. Apply task migrates text-white → text-house-visit-light-foreground at every site (with the L37 ordered list's <li> children inheriting via the cascade; no per-<li> migration needed). The L13 text-foreground migration is the only delta with visible rendering change.
```

```
Element: src/pages/NeighborhoodPage.tsx:20 — <SectorHeader letter="V" name="Visit" color="#4A5A30" />
Current: "#4A5A30" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Visit" eyebrow color)
Nearest canonical token: house-visit-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-visit-deep. Mirrors LabPage:24 (`color="#C44878"` → house-publications-deep) and CampusPage:190 (`color="#1A3A2E"` → house-campus-deep) precedents. Migrate to a token reference (CSS var, HOUSES[neighborhood].palette.deep import, or the mechanism FRAC-33 Apply chooses). The drift is mechanism (raw hex literal), not value. House-deep as a display/highlight color on the house's own page is permitted under DESIGN.md → Text foregrounds. SectorHeader internals out of scope.
```

```
Element: src/pages/NeighborhoodPage.tsx:14 — <FractalPattern color="#4A5A30" />
Current: "#4A5A30" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per the FRAC-20 exclusion precedent)
Nearest canonical token: house-visit-deep (would be the migration target if in scope)
Match quality: N/A (out of scope)
Action: EXCLUDED
Rationale: FractalPattern is a shared decorative SVG fill; the `color` prop is out of scope per FRAC-20 (Lab) precedent. Documented here only to enumerate every color use on the page; FRAC-33 Apply does NOT migrate this site. If a future audit task brings FractalPattern in scope, the value-level migration is `#4A5A30` → `house-visit-deep`. Listed for completeness, not migration.
```

```
Element: src/pages/NeighborhoodPage.tsx:60 — <Button asChild className="max-w-xs w-full text-center">…</Button>
Current: max-w-xs w-full text-center (layout/text-align only — no color utilities)
Role: (no color tokens declared; Button component owns its own color via buttonVariants)
Nearest canonical token: (n/a — Button component, out of scope)
Match quality: N/A
Action: JUSTIFY
Rationale: The Button component's typography and color are locked via `buttonVariants` (audit-prompt section 4). The inline className override carries no color utilities — only `max-w-xs w-full text-center` (layout + text-align). No migration. Listed for completeness so the audit doc enumerates every Tailwind-utility node on the page; the audit confirms no per-call color override is being injected here.
```

```
Element: src/pages/NeighborhoodPage.tsx:13 — <main className="… selection:bg-foreground selection:text-background …">
Current: selection:bg-foreground (#171717), selection:text-background (#f8f6f0)
Role: selection-background + selection-text
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: Selection chrome already canonical (paired-inverse, FRAC-42 exempt from the surface-pairing check). No-op migration. Listed separately so the audit doc enumerates every token use on the page-level <main>; the same tokens also appear bundled inline in the top color row above. Two sites for the same tokens on the same node collapse via (file + token) grouping.
```

## Forward observations (not GAPs under current rules)

Surfaced during this audit, not blocking the Apply task, recorded so the next
iteration of the system has them.

- **Compact-card body density.** The "Note" MandelbrotCorners disclaimer
  card uses a flat `text-xs` (12px) — no md+ responsive variant — on both
  the disclaimer paragraph (L33) and the ordered list (L37). The canonical
  `.text-body` ships at `text-base` (16px), two size steps larger. The
  deliberately compact density on a small inline disclaimer card is a
  legitimate editorial choice; Apply (FRAC-33) will size up to `text-base`
  per the audit's NEAR → MIGRATE decision unless the size-up causes a 375px
  layout overflow. If size-up degrades the card readability/density at
  375px, a future container-scoped body utility (e.g. `.text-body-compact`
  at `text-xs` or `text-sm`) would let editorial choose between
  canonical-body and dense-card-body without abusing arbitrary sizing. Same
  forward observation Lab and Campus made (DocumentBadge:103, DocumentGrid:29
  for Lab; the 19-site body cluster for Campus) — the cross-page repetition
  reinforces the case for a future tier.

- **`bg-foreground/[0.03]` arbitrary alpha syntax.** Visit's MandelbrotCorners
  card uses the Tailwind arbitrary-value alpha syntax (`/[0.03]`) where
  Campus's PrimaryButton uses standard-step alpha (`/20`, `/30`). The
  `[0.03]` evaluates to 3% which is not a standard Tailwind alpha step
  (steps are typically 0, 5, 10, 20, 25, 30, …). Apply (FRAC-33) may
  normalize to `/[3%]` (also arbitrary but more readable), or keep verbatim,
  or round up to `/5`. Today the value is the canonical foreground token
  and renders as intended (an extremely subtle charcoal tint over the
  olive-green page bg); the arbitrary syntax is the only drift. Not a GAP
  — both forms render correctly; mechanism-only consideration for Apply.

- **`text-foreground` as the inherited page default for the Visit
  surface.** Visit's `<main>` declares `text-foreground` (charcoal) as the
  page-default text color even though the page bg is `house-visit-light`
  (saturated olive-green). The mispairing produces a hard-to-read
  charcoal-on-green rendering for any descendant that doesn't override its
  own color. Today every text-bearing descendant on Visit explicitly
  declares its own `text-white` — so the L13 `text-foreground` is dead in
  practice (no rendered text inherits it). But the Apply migration to
  `text-house-visit-light-foreground` (cream) makes the cascade correct,
  removing the latent-bug — if a future descendant is added that inherits
  the page default, it will render correctly. The L13 finding captures
  this as a NEAR migration with visible-rendering-change, but the
  rendering change today is **invisible** because no descendant actually
  inherits the page default. Apply review should still verify at 375px
  in case a descendant is added before this PR lands.

## Gap appendix

```
- src/pages/NeighborhoodPage.tsx:54 — <PretextParagraph size={TEXT_SIZES.sm} className="text-white mb-3 md:mb-4">{"Want to visit? Fill out this form."}</PretextParagraph> rendered as inline-styled <p>/<div> (JBM 12px weight 400)
  Nearest-fit chosen: .text-body
  Why it didn't fit: No canonical body utility uses mono and no canonical body utility sizes at 12px. .text-body is Inter text-base (16px) weight 400; .text-body-lead is Inter text-lg (18px) weight 300. Pretext always renders via FONTS.body (JetBrains Mono) at inline px sizes from TEXT_SIZES, which sits outside the Inter-only body tier and outside the Tailwind size scale. Folds into the sitewide Pretext gap first logged for LabPage:58 (FRAC-20); Visit's call site differs only in size step (TEXT_SIZES.sm = 12px vs. Lab's TEXT_SIZES.base = 13px).
  Proposed system change: add a body-mono utility tier (e.g., .text-body-mono / .text-body-mono-sm / .text-body-mono-lead) sized to the TEXT_SIZES bridge (sm=12px, base=13px, lg=15px), OR re-author Pretext to consume Tailwind body utilities instead of TEXT_SIZES px constants. Both proposals are upstream of the Lab gap entry; Visit's entry sharpens the size-step argument because the sitewide pattern now spans two Pretext size steps.
  Page: visit
  Date: 2026-06-09
```
