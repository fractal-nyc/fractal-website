# Events page — typography + color audit

**Page slug:** events
**Source files:** `src/pages/EventsPage.tsx`, `src/components/sections/Events.tsx`
**Audit date:** 2026-06-09
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened by FRAC-20 PR; FRAC-42 codified Surface foreground pairing; FRAC-47 added `.text-aside`)
**Mobile viewport baseline:** 375px
**Branch:** `frac-34-audit-events` (off master)

## Scope

### In scope (source of truth: EventsPage's import graph)

- `src/pages/EventsPage.tsx` — the page entry (79 lines). Owns the page-level
  `<main>` surface (line 11) including the raw-hex `#D4857A` background and
  the canonical `text-foreground` page-default text color. Renders three
  `FadeIn`-wrapped display sections: the Luma calendar embed (lines 19–48),
  the "Host Our Next Event" CTA (lines 50–57), and the "Stay in the Loop"
  Discord CTA (lines 59–72).
- `src/components/sections/Events.tsx` — the section body (~35 lines).
  **Orphan component: NOT imported by `EventsPage.tsx` or any other live page
  in `src/` at HEAD** (verified via repo-wide grep:
  `grep -rn "import.*Events" src --include="*.tsx" --include="*.ts"` returns
  only `EventsPage` references — no `import { Events }` consumer of the
  `sections/Events.tsx` module). It appears to be a residual Home-page
  section that survives in the tree. Per the FRAC-34 scope instruction,
  audited anyway: every text-bearing element gets a row, every color use
  gets a row, and the orphan status is documented here as a forward
  observation. The orphan status does NOT change the row format — Apply
  (FRAC-35) treats it as in-scope source. If the component is later deleted,
  the rows become no-ops.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#C13B2A" />`
  call site at `EventsPage.tsx:12` — explicitly excluded per FRAC-20 (Lab)
  and FRAC-24 (Campus) precedent. The FractalPattern `color` prop is a
  shared decorative SVG fill; not audited. The hex value at the call site
  (`#C13B2A`) is documented in the color audit only as an excluded site,
  with the canonical-token equivalent noted (`house-events-deep`) for
  traceability.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`
  (`CornerDecorations`) — shared chrome rendered on every page. Audited
  elsewhere if at all. Same exclusion rationale as Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across
  all house pages. Audited as a separate task. **Note:** Events's call-site
  prop `color="#C13B2A"` at `EventsPage.tsx:17` IS audited as part of
  `EventsPage.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked
  via `buttonVariants` (audit-prompt section 4). The Events page calls
  `<Button asChild>` at `EventsPage.tsx:54` and `:63` with only
  sizing/alignment className additions (`max-w-xs w-full mb-12 text-center`
  / `max-w-xs w-full text-center`) — no typography or color overrides. The
  wrapping `<a>` children (lines 55, 64-69) carry no extra Tailwind classes.
  Events therefore has NO inline `<button>` element to audit — the entire
  Button typography is fully owned by the component. (Notable scope
  simplification vs Campus's PrimaryButton override at `Campus.tsx:161`.)
- Tests, configs, package files.

### House identity (Events = `events` id = `Events` displayName)

Events IS a house page. Per DESIGN.md → House mapping, Events's internal id
(`houses.ts:231`) is `events` and its `displayName` is `Events` (resolved
from `name: "Events"` since the `displayName` field is omitted on this
house). **The id and displayName happen to match for Events**, which is the
unusual case (Visit vs neighborhood, Education vs school, Political Club vs
forum, Publications vs lab all diverge; Events and Campus are the two cases
where id == displayName at HEAD). Token slug prefix is
`house-events-{light,deep}`.

Locked rules for Events:

- **`house-events-light` (`#D4857A`) IS the page background** (default
  arrangement, NOT the forum/school inversion). `house-events-deep`
  (`#C13B2A`) is the accent (SectorHeader letter, "Events" eyebrow,
  FractalPattern decorative fill).
- **Events's `{light}` and `{deep}` ARE permitted** as text/highlight chrome
  on Events pages — eyebrow text, focus rings, accent labels, display
  monogram letters. The SectorHeader letter and "Events" eyebrow at
  `EventsPage.tsx:17` are display/highlight uses of `house-events-deep`.
- **Other house colors are NOT permitted** as Events chrome text. (No
  cross-house leaks found — see check below.)
- **Charcoal (`text-foreground`) is the canonical page-default text voice
  on Events.** Unlike Lab (which inline-styled `color: "#fff"`) and Campus
  (which inline-styled `color: "#fff"` on `<main>` AND re-asserted it on
  the inner `<section>`), Events's `<main>` at `EventsPage.tsx:11` uses the
  canonical `text-foreground` utility for page-default text. This is a
  meaningful departure from the Lab/Campus pattern and is documented in
  the Color audit. **It is NOT a finding** — it is a deliberate, canonical
  use of the foreground token. Whether the cream-foreground-on-house-light-
  surface convention is the editorial intent for Events (charcoal-on-coral)
  or whether Events should align with Campus/Lab (cream-on-saturated) is
  an editorial decision the Apply task (FRAC-35) may need to surface; see
  Forward observations.
- **No raw `text-white`, inline `color: "#fff"`, `text-black`,
  `text-gray-*`** appear in Events's scope (verified via grep). The
  canonical-text-on-saturated-bg paired-foreground migration that
  dominated Campus and Lab has zero rows on Events. True scope reduction.

### Token-declaration state at HEAD (verified)

`src/index.css` lines 53–61 declare only the Publications pair (FRAC-21)
and the Campus pair (FRAC-25), each with paired-foreground siblings. **No
`--color-house-events-*` tokens exist today.** The DESIGN.md YAML
frontmatter lists `house-events-light` (`#D4857A`) and `house-events-deep`
(`#C13B2A`) as the representative house-banner pairing because HouseBanner
consumes them at runtime via `house.palette.{light,deep}` from
`src/data/houses.ts` — so the values are canonical and used by HouseBanner
via the runtime swap, but the canonical `@theme inline` declarations are
not yet present. FRAC-35 (Apply) will land all four sibling declarations
alongside the per-page migrations.

### Inversion check

Events is NOT a forum/school inverted page (per DESIGN.md → The forum/school
page-bg inversion). Events uses `{light}` as the page bg (`#D4857A` =
`house-events-light`) and `{deep}` as the accent (`#C13B2A` =
`house-events-deep`). Confirmed by reading `EventsPage.tsx:11` (page bg
inline-styled to `#D4857A`) and `:17` (SectorHeader prop `color="#C13B2A"`,
the accent use). **No inversion finding.**

### Cross-house leak check

Walked `EventsPage.tsx` and `Events.tsx` for any `text-house-*` /
`bg-house-*` Tailwind utility and for any raw hex matching another house's
palette (`#889460`, `#4A5A30`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`,
`#C83858`, `#6E1830`, `#E870A0`, `#C44878`). **No cross-house leaks found.**
Events's only declared color values are:

- `#D4857A` (own `{light}`, at `EventsPage.tsx:11` inline bg)
- `#C13B2A` (own `{deep}`, at `EventsPage.tsx:12` FractalPattern excluded
  prop AND at `EventsPage.tsx:17` SectorHeader prop)
- `text-foreground` (canonical foreground token, default and at alpha:
  `text-foreground`, `border-foreground/20`, `bg-foreground/[0.03]`)
- `selection:bg-foreground` / `selection:text-background` (canonical
  paired-inverse)
- `bg-background` / `text-muted-foreground` / `bg-muted` (canonical surface
  tokens in the orphan `Events.tsx`)

## Typography audit

```
Element: src/pages/EventsPage.tsx:20 — <p className="text-display mb-6 text-center">Join Tech Events</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). One of three .text-display sites in EventsPage.tsx (lines 20, 51, 60) — they collapse to one typography row per (file + utility) grouping since the rendering is identical. The three sites are the three section openers: "Join Tech Events" (Luma embed), "Host Our Next Event" (Email Merlin's CTA), "Stay in the Loop" (Discord CTA). All three are <p> tags (not <h*>) so no h-tag global italic rule applies; .text-display's font-style:normal renders upright as intended.
```

```
Element: src/pages/EventsPage.tsx:40 — <a href="https://luma.com/nyc-tech" target="_blank" rel="noopener noreferrer" className="inline-block mb-12 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity duration-300">Open calendar in new tab →</a>
Current: family=Inter (inherited body default — no font-mono override), weight=400 (body default), style=normal, transform=uppercase, size=text-xs, tracking=widest (Tailwind ≈ 0.1em)
Nearest canonical utility: .text-meta (or .text-label / .text-eyebrow — three names for same rendering)
Match quality: NEAR
Action: MIGRATE
Rationale: .text-meta / .text-label / .text-eyebrow is JetBrains Mono uppercase weight 500 text-sm tracking 0.1em. Drift: family Inter (body default — no font-mono) vs spec font-mono; size text-xs vs spec text-sm; weight 400 (default) vs spec 500. Tier (chrome) and role (overline-style link label below the Luma embed — visually-de-emphasized "secondary action" via opacity-70 hover:opacity-100) match. The tracking-widest + uppercase combination is the chrome-tier signature; canonical utility .text-meta is the closest semantic fit for an inline-link meta label ("metadata about the embed: link to open it elsewhere"). Apply task migrates: replace the ad-hoc text-xs tracking-widest uppercase class soup with .text-meta, keep the inline-block, mb-12, opacity-70, hover:opacity-100, transition-opacity, duration-300 modifiers as-is. Color row (below) covers the absent text-* declaration — inherits text-foreground from page cascade.
```

```
Element: src/components/sections/Events.tsx:9 — <h2 className="text-eyebrow text-muted-foreground mb-4">Events</h2>
Current: family=JetBrains Mono, weight=500, style=italic (h2 global rule italicizes; .text-eyebrow does not pin font-style so the global rule applies), transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: Already on .text-eyebrow; the chrome utility intends mono-uppercase-weight-500-tracking-0.1em. Drift: the h2 wrapper inherits the global italic rule (src/index.css h1–h6 block) — and .text-eyebrow does not pin font-style:normal, so the h2 silently renders italic. Per the audit-prompt section 4 "composite cascade" rule and the matching Lab forward observation, this is the recurring chrome-utility-on-h-tag accidental-italic pattern. Tier and role are canonical; the accidental italic is the NEAR-quality drift. Apply task migrates the typography rendering as-is (no className change required; the italic is the recurring drift to either codify or fix sitewide — out of scope for this per-page audit). The companion color row covers text-muted-foreground separately (canonical EXACT). Orphan-component caveat applies (Events.tsx not in live import graph).
```

```
Element: src/components/sections/Events.tsx:10 — <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight normal-case">Come <span className="italic normal-case">hang out</span> with us.</p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-3xl (mobile), text-5xl (md+), tracking=default Fraunces, leading=tight
Nearest canonical utility: .text-title
Match quality: EXACT
Action: MIGRATE
Rationale: .text-title is italic Fraunces text-3xl md:text-5xl mixed-case tracking 0.04em. Sizes match exactly (text-3xl md:text-5xl). Style matches (italic via .font-serif rule, same as .text-title's italic spec). Transform matches (.text-title has text-transform:none, the normal-case className confirms the same rendering). Drift: weight 400 (.font-serif default) vs spec 350 (.text-title); leading-tight is a per-site override (spec sets no explicit leading); missing explicit tracking 0.04em (Fraunces default tracking is close but not pinned). Tier (display Fraunces italic) and role (section opener — the "come hang out with us" line under the "Events" eyebrow) match exactly. The inline <span className="italic normal-case"> on "hang out" is a no-op since the parent is already italic. Apply task migrates: text-3xl md:text-5xl font-serif normal-case → .text-title, keep leading-tight, max-w-2xl as positional/sizing modifiers; the inner <span className="italic normal-case"> can be simplified to <span className="italic"> since the parent .text-title already pins normal-case (one-letter trim, optional). Orphan-component caveat applies.
```

## Color audit

```
Element: src/pages/EventsPage.tsx:11 — <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4857A" }}>
Current: backgroundColor: "#D4857A" (raw hex inline style), text-foreground (canonical Tailwind utility), selection:bg-foreground (canonical Tailwind utility), selection:text-background (canonical Tailwind utility)
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: house-events-light (for the bg); foreground (for text-foreground, already canonical); foreground / background (for selection chrome, already canonical)
Match quality: EXACT (#D4857A → house-events-light) ; EXACT (text-foreground — already canonical) ; EXACT (selection chrome — already canonical)
Action: MIGRATE (for the raw-hex bg) ; JUSTIFY (for text-foreground — see Rationale) ; MIGRATE (no-op, for selection chrome)
Rationale: Three migrations on a single node, recorded together per (file + node) grouping. (1) Raw-hex bg `#D4857A` matches house-events-light exactly; drift is mechanism (inline style vs token-driven utility). Mirrors LabPage:16 (#E870A0 → house-publications-light) and CampusPage:8 (#2E6B4A → house-campus-light). FRAC-35 Apply declares all four house-events sibling tokens in @theme inline before performing this migration. (2) text-foreground on bg-house-events-light is NOT the FRAC-42-canonical paired-foreground (the canonical pair for {light} would be text-house-events-light-foreground = cream). Events deliberately uses charcoal (text-foreground) as the page-default voice — an editorial choice (charcoal-on-coral) distinct from Campus/Lab (cream-on-saturated). Classify as JUSTIFY: text-foreground is a canonical token used deliberately as the page-default text color. The audit does NOT migrate to the paired-foreground here; the Apply task or a separate editorial-review task may choose to flip to text-house-events-light-foreground if Jules reads charcoal-on-coral as off-voice. The departure from the paired-foreground convention is documented as a Forward observation. (3) Selection chrome already canonical (paired-inverse, FRAC-42 exempt from the surface-pairing check). No-op migration.
```

```
Element: src/pages/EventsPage.tsx:28 — <div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">
Current: bg-foreground/[0.03] (canonical foreground token at 3% alpha, arbitrary-value syntax), border-foreground/20 (canonical foreground token at 20% alpha, pinned-step syntax)
Role: background (translucent foreground tint over the {light} page surface) + border
Nearest canonical token: foreground
Match quality: EXACT (both)
Action: MIGRATE (no-op; both already canonical)
Rationale: Both utilities reference the canonical foreground token at alpha. The arbitrary 3% alpha (bg-foreground/[0.03]) is below Tailwind's pinned scale step (5% is the lowest pinned: /5 = 0.05). The audit accepts the arbitrary alpha as a legitimate sub-pinned-step use of the canonical token — same reasoning as text-foreground/<n> classified EXACT under the alpha-is-presentation rule. No migration target. FRAC-42 pairing: the <div> declares bg-foreground/[0.03] with no own text-* — the child <iframe> at line 30 renders third-party Luma content (not subject to our pairing rule); the only Tailwind-styled child is <CornerDecorations size="xs" /> at line 29 which inherits text-foreground from the page cascade. Since bg-foreground/[0.03] is translucent charcoal over the bg-house-events-light page surface and the cascaded text-foreground reads correctly, this is the exempt translucent-foreground-as-surface-tint composite (precedent: Campus's PrimaryButton bg-black/20 → bg-foreground/20 documented as exempt). NOT a pairing finding. No additional pair migration needed.
```

```
Element: src/pages/EventsPage.tsx:17 — <SectorHeader letter="E" name="Events" color="#C13B2A" />
Current: "#C13B2A" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Events" eyebrow color)
Nearest canonical token: house-events-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-events-deep. Mirrors LabPage:24's color="#C44878" → house-publications-deep and Campus.tsx:190 SectorHeader's color="#1A3A2E" → house-campus-deep. Migrate to a token reference (CSS var var(--color-house-events-deep), HOUSES.find(h => h.id==="events")!.palette.deep import, or the mechanism FRAC-35 Apply chooses — Campus's FRAC-25 PR is the precedent for the chosen mechanism). The drift is mechanism (raw hex literal), not value. House-deep as a display/highlight color on the house's own page is permitted under DESIGN.md → Text foregrounds. SectorHeader internals out of scope.
```

```
Element: src/pages/EventsPage.tsx:12 — <FractalPattern color="#C13B2A" />
Current: "#C13B2A" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per the FRAC-20 / FRAC-24 exclusion precedent)
Nearest canonical token: house-events-deep (would be the migration target if in scope)
Match quality: N/A (out of scope)
Action: EXCLUDED
Rationale: FractalPattern is a shared decorative SVG fill; the `color` prop is out of scope per FRAC-20 (Lab) and FRAC-24 (Campus) precedent. Documented here only to enumerate every color use on the page; FRAC-35 Apply does NOT migrate this site. If a future audit task brings FractalPattern in scope, the value-level migration is `#C13B2A` → `house-events-deep`. Listed for completeness, not migration.
```

```
Element: src/components/sections/Events.tsx:5 — <section className="py-24 md:py-40 bg-background" id="events">
Current: bg-background (canonical surface token utility)
Role: background (section cream surface)
Nearest canonical token: background
Match quality: EXACT (token); NEAR (pairing — missing text-foreground on the same node)
Action: MIGRATE (add text-foreground for FRAC-42 pairing)
Rationale: bg-background is the canonical cream surface token; no token migration needed. FRAC-42 pairing: the <section> declares bg-background with no own text-* on the same node. Per the FRAC-42 four-canonical-pairs rule, bg-background's paired foreground is text-foreground. The page-level body cascade already renders the descendant text in text-foreground (charcoal), so current rendering is correct, but a future restructure (or a nested surface that swaps the cascade) would break the descendant text color. Add text-foreground to the <section> at line 5 for compositional safety. Apply task migration: <section className="py-24 md:py-40 bg-background text-foreground" id="events">. Orphan-component caveat: Events.tsx is not imported anywhere in the live src/ tree at HEAD (verified via repo-wide grep). Audit included per FRAC-34 scope instruction; Apply (FRAC-35) may choose to migrate the rows or to delete the orphan as a follow-up. Migration here is conservative.
```

```
Element: src/components/sections/Events.tsx:9 — <h2 className="text-eyebrow text-muted-foreground mb-4">Events</h2>
Current: text-muted-foreground (canonical surface token utility)
Role: text (eyebrow label color — muted secondary text)
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE (no-op)
Rationale: Already on canonical muted-foreground token. No migration target. The companion typography row (above) covers the .text-eyebrow utility on an h2 with accidental-italic from the global rule. Orphan-component caveat applies.
```

```
Element: src/components/sections/Events.tsx:17 — <a href="https://luma.com/nyc-tech" target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-muted relative group">
Current: bg-muted (canonical surface token utility)
Role: background (link wrapper surface — muted backdrop for the image card)
Nearest canonical token: muted
Match quality: EXACT (token); NEAR (pairing — missing text-muted-foreground on the same node)
Action: MIGRATE (add text-muted-foreground for FRAC-42 pairing)
Rationale: bg-muted is the canonical muted surface token; no token migration needed. FRAC-42 pairing: the <a> declares bg-muted with no own text-* on the same node. Per the FRAC-42 pairing principle (extended to the muted/muted-foreground pair via DESIGN.md's declared muted-foreground token — while the FRAC-42 canonical-pairs table only enumerates background/foreground/house pairs explicitly, the same compositional principle applies to muted/muted-foreground), add text-muted-foreground for compositional safety. The child content is currently only an <img> with no rendered text, so current rendering has zero impact, but a future restructure that adds text inside the link would inherit incorrect color. Apply task migration: <a … className="block overflow-hidden bg-muted text-muted-foreground relative group">. Orphan-component caveat applies.
```

## Forward observations (not GAPs under current rules)

Surfaced during this audit, not blocking the Apply task, recorded so the
next iteration of the system has them.

- **text-foreground-on-house-events-light editorial-voice question.** Events
  deliberately uses canonical charcoal (`text-foreground`) as page-default
  text on the coral (`#D4857A`) bg, departing from Campus's and Lab's
  cream-on-saturated paired-foreground convention. The audit classifies the
  current state as JUSTIFY (canonical token, deliberate choice) but flags
  the question for the next iteration of the system: is charcoal-on-coral
  the intended Events editorial voice, or should Events align with the rest
  of the house pages on cream-on-saturated? Visual reading: `#171717`
  charcoal on `#D4857A` coral renders with strong contrast (~6:1, well above
  WCAG AA) and reads as a deliberate brutalist-warm contrast — distinct from
  the deferential cream voice of Campus's `#2E6B4A` forest-green. An
  out-of-band editorial review or a separate FRAC ticket can decide. If
  Jules elects to align Events with the cream-on-saturated convention, FRAC-35
  Apply migrates `text-foreground` at `EventsPage.tsx:11` to
  `text-house-events-light-foreground` (one-line change); if Jules
  preserves the charcoal voice, FRAC-35 leaves it as JUSTIFY.

- **Chrome-utility-on-h-tag accidental-italic.** `Events.tsx:9` (h2 +
  `.text-eyebrow`) renders italic via the h-tag global rule even though
  the chrome tier intends upright. Recurring pattern across the site (Lab
  and Campus also have it); not a per-page GAP, but a sitewide forward
  observation. The fix is either (a) tighten the chrome-tier utilities
  to pin `font-style: normal`, or (b) demote the chrome eyebrow from
  `<h2>` to `<p>` / `<span>` at each call site. Both are sitewide
  refactors, out of scope for FRAC-34.

- **Orphan `Events.tsx` deletion candidate.** The component is not
  imported anywhere in the live src/ tree at HEAD (verified via
  repo-wide `grep -rn "import.*Events" src --include="*.tsx" --include="*.ts"`).
  Apply (FRAC-35) or a follow-up cleanup task may choose to delete it
  rather than migrate. Audit included per scope; deletion is a separate
  decision. If Apply deletes, the four rows above (Events.tsx:5, 9, 10,
  17) become no-ops and the typography row count for the Apply PR drops
  by two. If Apply migrates, the rows land as-spec.

- **Luma embed wrapper as the only saturated-bg "card" on Events.** The
  `bg-foreground/[0.03]` Luma embed wrapper at `EventsPage.tsx:28` is
  the only nested surface on the Events page. Its 3% translucent-charcoal
  fill produces a barely-perceptible darkening of the coral page bg —
  visually reads as a softly-recessed embed container. The
  translucent-foreground-as-surface-tint composite (per Campus PrimaryButton
  precedent) handles this cleanly. If more saturated-bg cards land on
  Events in the future, a documented `.surface-recessed-on-house` utility
  could codify the 3% alpha as a canonical recess tint. Not a per-page
  GAP under current rules.

## Gap appendix

No gaps.
