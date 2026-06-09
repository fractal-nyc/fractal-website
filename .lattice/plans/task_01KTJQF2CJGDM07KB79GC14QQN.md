# FRAC-34 — Audit Events page (typography + color)

**Task:** task_01KTJQF2CJGDM07KB79GC14QQN
**Branch:** frac-34-audit-events
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px

This is the **fourth** per-page audit executed under the FRAC-18/FRAC-19 playbook. FRAC-20 (Lab) was the first and is the worked example; FRAC-22 (Home) codified the FRAC-42 surface-foreground pairing pass for Apply tasks at scale; FRAC-24 (Campus) was the most recent and is the closest archetype precedent — same house-page archetype, same default (non-inverted) `{light}`-page-bg arrangement, same SectorHeader prop pattern, same raw-hex `{light}` page bg + inline white text + raw-hex `{deep}` SectorHeader prop. Events is the **second** non-Lab house page to go through Audit→Apply paired-from-day-one (Campus was the first). The Events Apply task (FRAC-35) will declare all four sibling tokens together (`--color-house-events-light`, `--color-house-events-deep`, `--color-house-events-light-foreground`, `--color-house-events-deep-foreground`) in one `@theme inline` block, mirroring FRAC-25.

**Token-declaration state at HEAD (verified):** `src/index.css` lines 53–61 declare only the Publications pair (FRAC-21) and the Campus pair (FRAC-25), each with paired-foreground siblings. **No `--color-house-events-*` tokens exist today.** The DESIGN.md YAML frontmatter lists `house-events-light` (`#D4857A`) and `house-events-deep` (`#C13B2A`) as the representative house-banner pairing because HouseBanner consumes them at runtime via `house.palette.{light,deep}` from `src/data/houses.ts` — so the values are canonical and used by HouseBanner via the runtime swap, but the canonical `@theme inline` declarations are not yet present. FRAC-35 (Apply) will land all four sibling declarations alongside the per-page migrations.

No `audit-prompt.md` revisions are expected here (FRAC-20 tightened it). No `DESIGN.md` revisions (FRAC-20 codified Text foregrounds; FRAC-42 codified Surface foreground pairing; FRAC-47 added `.text-aside` for italic body). If a brand-new playbook gap appears during impl, escalate via a `needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: EventsPage's import graph)

- `src/pages/EventsPage.tsx` — the page entry (~79 lines). Owns the page-level `<main>` surface (line 11) including the raw-hex `#D4857A` background and the canonical `text-foreground` page-default text color (note: Events is one of the few house pages whose page-level text color is canonical `text-foreground` rather than raw white inline-styled — see "House identity decision" below). Renders three `FadeIn`-wrapped display sections (Luma calendar embed, Host CTA, Discord CTA).
- `src/components/sections/Events.tsx` — the section body (~35 lines). **Orphan component: NOT imported by `EventsPage.tsx` or any other live page in `src/` at HEAD** (verified via repo-wide grep). It appears to be a residual Home-page section that survives in the tree. Per the FRAC-34 scope instruction, audit it anyway: every text-bearing element gets a row, every color use gets a row, and the orphan status is documented in the audit doc preamble as a forward observation. The orphan status does NOT change the row format — Apply (FRAC-35) treats it as in-scope source. If the component is later deleted, the rows become no-ops.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#C13B2A" />` call site at `EventsPage.tsx:12` — explicitly excluded per FRAC-20 (Lab) and FRAC-24 (Campus) precedent. The FractalPattern `color` prop is a shared decorative SVG fill; not audited. The hex value at the call site (`#C13B2A`) is documented here only as an excluded site, with the canonical-token equivalent noted (`house-events-deep`) for traceability.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` (`CornerDecorations`) — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audited as a separate task. **Note:** Events's call-site prop `color="#C13B2A"` at `EventsPage.tsx:17` IS audited as part of `EventsPage.tsx`, identical pattern to Campus's `color="#1A3A2E"` SectorHeader prop.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt section 4). The Events page calls `<Button asChild>` at `EventsPage.tsx:54` and `:63` with no inline className overrides beyond `max-w-xs w-full mb-12 text-center` / `max-w-xs w-full text-center` (sizing/alignment only — no typography or color overrides). The wrapping `<a>` children (lines 55, 64-69) carry no extra Tailwind classes. Events therefore has NO inline `<button>` element to audit — the entire Button typography is fully owned by the component. (This is a notable scope simplification vs Campus's PrimaryButton override at `Campus.tsx:161`.)
- Tests, configs, package files.

### House identity decision (Events = `events` id = `Events` displayName — token slug `house-events`)

Events IS a house page. Per DESIGN.md → House mapping, Events's internal id (`houses.ts:231`) is `events` and its `displayName` is `Events` (resolved from `name: "Events"` since the `displayName` field is omitted on this house — see houses.ts:38, "user-facing label when different from name"). **The id and displayName happen to match for Events**, which is the unusual case (Visit vs neighborhood, Education vs school, Political Club vs forum, Publications vs lab all diverge; Events and Campus are the two cases where id == displayName at HEAD). Token slug prefix is `house-events-{light,deep}`.

Lock the rules for Events:

- **`house-events-light` (`#D4857A`) IS the page background** (default arrangement — Events is NOT a forum/school inverted page; mirrors Lab and Campus precedent). `house-events-deep` (`#C13B2A`) is the accent (SectorHeader letter, FractalPattern decorative fill).
- **Events's `{light}` and `{deep}` ARE permitted** as text/highlight chrome on Events pages — eyebrow text, focus rings, accent labels, display monogram letters. The SectorHeader letter and "Events" eyebrow at `EventsPage.tsx:17` are display/highlight uses of `house-events-deep`.
- **Other house colors are NOT permitted** as Events chrome text. The impl agent walks for cross-house leaks; Events today has none (no other-house tokens or other-house hex values appear in EventsPage.tsx or Events.tsx).
- **Charcoal (`text-foreground`) is the canonical page-default text voice on Events.** Unlike Lab (which inline-styled `color: "#fff"`) and Campus (which inline-styled `color: "#fff"` on `<main>` AND re-asserted it on the inner `<section>`), Events's `<main>` at `EventsPage.tsx:11` uses the canonical `text-foreground` utility for page-default text. This is a meaningful departure from the Lab/Campus pattern and is documented as such in the Color audit. **It is NOT a finding** — it is a deliberate, canonical use of the foreground token. Whether the cream-foreground-on-house-light-surface convention is the editorial intent for Events (charcoal on coral) or whether Events should align with Campus/Lab (cream on saturated bg) is an editorial decision the Apply task (FRAC-35) may need to surface, but the audit doc classifies the **current state** — `text-foreground` is canonical and exempt from migration. The Apply task or a separate FRAC ticket can decide whether to flip Events to the paired-foreground convention if the editorial review reads charcoal-on-coral as off-voice. See "Open observations" for the surface-pairing note.
- **No raw `text-white`, inline `color: "#fff"`, `text-black`, `text-gray-*`** appear in Events's scope (verified via grep) — so the canonical-text-on-saturated-bg paired-foreground migration that dominated Campus and Lab has zero rows on Events. This is a true scope reduction, not an oversight. If the impl walks and finds one, classify per the Lab/Campus precedent: NEAR → MIGRATE to `text-house-events-light-foreground` at the same alpha.
- **The orphan `Events.tsx` section uses `bg-background` (line 5)** — i.e., it asserts a cream surface, not Events's house light. Its text uses `text-muted-foreground` (line 9) which is canonical. Its `bg-muted` link wrapper (line 21) is canonical. The orphan component is mostly already on canonical tokens; the audit rows are mostly EXACT-no-op except for the `text-3xl md:text-5xl font-serif … normal-case` at line 10 which is a `.text-title` NEAR-MIGRATE candidate (the same pattern as the Campus opening paragraph at `Campus.tsx:230` — mixed-case Fraunces sized just below the `.text-title` canonical responsive scale).

### Inversion check

Events is NOT a forum/school inverted page (per DESIGN.md → The forum/school page-bg inversion). Events uses `{light}` as the page bg (`#D4857A`) and `{deep}` as the accent (`#C13B2A`). Confirmed by reading `EventsPage.tsx:11` (page bg inline-styled to `#D4857A` = `house-events-light`) and `:17` (SectorHeader prop `color="#C13B2A"` = `house-events-deep`, the accent use). No inversion finding.

### Cross-house leak check

Walk `EventsPage.tsx` and `Events.tsx` for any `text-house-*` / `bg-house-*` Tailwind utility and for any raw hex matching another house's palette (`#889460`, `#4A5A30`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830`, `#E870A0`, `#C44878`). **No cross-house leaks found** (verified at planner level via grep) — Events's only declared color values are `#D4857A` (own `{light}`), `#C13B2A` (own `{deep}` — at the SectorHeader prop AND at the FractalPattern excluded prop), `text-foreground` / `bg-foreground/[0.03]` / `border-foreground/20` (canonical foreground token at default and at alpha), `bg-muted` / `text-muted-foreground` / `bg-background` in the orphan Events.tsx (canonical surface tokens), and `selection:bg-foreground` / `selection:text-background` (canonical paired-inverse). The audit doc records "no cross-house leaks found" with the walked-token list.

---

## Format (locked 2026-06-08 with human, carried from FRAC-20 + FRAC-22 + FRAC-24)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5 (color), with the FRAC-20 clarifications carried forward by FRAC-22 and FRAC-24:

- **`<file:line>` granularity:** opening JSX tag line of the element. Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale.
- **Color row grouping:** by `(file + token)`. List every role the token serves in that file on the `Role:` line. Across files, repeat the row.
- **Pretext-rendered text:** N/A for Events. Events does NOT call `PretextParagraph` anywhere. The Pretext-callsite worked-example row from Lab is not applicable here; the impl agent omits it. The Lab gap entry already covers the sitewide pattern; Events does not need to re-log it.
- **Inline `<a>` and `<button>`:** Events has three inline `<a>` elements: the "Open calendar in new tab →" link at `EventsPage.tsx:40-47` (carries its own typography classes — IN SCOPE for typography AND color), and the two `<Button asChild>` children at `:55` and `:64-69` (Button typography owned by the component; these `<a>` children carry no extra typography/color classes — out of scope for typography, in scope only if they introduced ad-hoc classes). The orphan `Events.tsx` has one inline `<a>` at `:17` carrying chrome utilities (`bg-muted`, `group`) — IN SCOPE for color, no own typography contribution beyond inherited.

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20 PR)

- Text on this site is `text-foreground` (charcoal `#171717`) or `text-background` (cream `#f8f6f0`) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted as display/highlight text. **Events IS a house page** — `house-events-{light, deep}` IS permitted on Events, but as display/highlight text only (SectorHeader letter, eyebrow). For Events specifically, the page-default text is canonical `text-foreground` (charcoal) — editorial-voice charcoal-on-coral.
- No raw `text-white`, `text-black`, `text-gray-*`, `color: "#fff"` inline-style, or non-canonical text colors anywhere. Any `text-foreground/<alpha>` is the canonical token with opacity — classify EXACT under the alpha-is-presentation rule.

### Surface foreground pairing rule (DESIGN.md → Surface foreground pairing, codified by FRAC-42)

Every `bg-*` declaration must carry its paired `text-*` foreground on the same node. Four canonical pairs:

| Surface | Pair |
|---|---|
| `bg-background` | `text-foreground` |
| `bg-foreground` | `text-background` |
| `bg-house-{slug}-light` | `text-house-{slug}-light-foreground` |
| `bg-house-{slug}-deep` | `text-house-{slug}-deep-foreground` |

Exemptions (per audit-prompt section 5):
- Selection chrome (`selection:bg-foreground selection:text-background`) — paired-inverse states, not surface declarations.
- House display-use text colors on the house's own page surface — SectorHeader letter / "Events" eyebrow using `#C13B2A` is display/highlight chrome, exempt from the surface-pairing check.

**For Events, the pairing-check sites the impl agent must visit (pre-walked):**

- `src/pages/EventsPage.tsx:11` — `<main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4857A" }}>`. **Surface + text declarations on the same node:**
  1. **Raw-hex bg** `#D4857A` → migrate to `bg-house-events-light` token utility (paralleling LabPage:16's `#E870A0` → `house-publications-light` and CampusPage:8's `#2E6B4A` → `house-campus-light`). EXACT on value; drift is mechanism (raw-hex inline `style` instead of a token-driven Tailwind utility).
  2. **`text-foreground`** is already a canonical token utility. **NOT** the paired-foreground for `bg-house-events-light` (the pair would be `text-house-events-light-foreground` per FRAC-42). However, the FRAC-42 rule specifies the paired foreground as the canonical mechanism for compositional safety — using `text-foreground` (charcoal) on `bg-house-events-light` (coral) is an editorial choice (charcoal-on-coral), not a token-drift finding. The Apply task gets two routes: (a) preserve `text-foreground` as the page-default voice and document the deliberate departure from the paired-foreground convention as an Events-specific editorial decision (the same "permitted display/highlight house colors" carve-out extended to "permitted off-pair foreground tokens when the editorial voice calls for it"); or (b) flip to `text-house-events-light-foreground` (cream-on-coral) to align with Campus/Lab. **The audit classifies the current state as JUSTIFY** (canonical token, deliberate editorial-voice choice) and surfaces the question as a Forward observation. The Apply task may elect to migrate to the paired-foreground convention if Jules's editorial review reads charcoal-on-coral as off-voice; that decision is out of scope for the audit.
  3. Selection chrome (`selection:bg-foreground selection:text-background`) already canonical (paired-inverse, FRAC-42 exempt). EXACT no-op row.

  Combine into a single color-audit row per the `(file + token)` grouping where two related migrations land on the same node, OR split into one MIGRATE row (bg) + one JUSTIFY row (text-foreground) + one EXACT row (selection). The impl agent chooses the denser presentation; the FRAC-24 precedent splits the selection chrome out (Campus has it as a separate EXACT row). FRAC-34 should follow the same split for traceability.

- `src/pages/EventsPage.tsx:28` — `<div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">`. The Luma embed wrapper. **`bg-foreground/[0.03]`** is a canonical foreground token at arbitrary 3% alpha — translucent charcoal as a surface tint (same translucent-foreground-as-surface-tint pattern Campus's `bg-black/20` migrated TO). **`border-foreground/20`** is canonical foreground at 20% alpha. **EXACT** on token; drift is **mechanism** (`text-[<arbitrary>]` arbitrary value at 3% — `bg-foreground/[0.03]` uses Tailwind's arbitrary alpha syntax for sub-5% precision, since `bg-foreground/5` is the lowest pinned step). FRAC-42 pairing: this `<div>` declares `bg-foreground/[0.03]` (a translucent foreground surface) with no own text color declared — the child `<iframe>` at line 30 has its own document content rendered by Luma, NOT subject to our Tailwind pairing rule (third-party iframe content). The `<CornerDecorations size="xs" />` at line 29 is the only Tailwind-styled child of this `<div>` and it inherits from the page-level `text-foreground`. Since `bg-foreground/[0.03]` is translucent charcoal over the `bg-house-events-light` page surface, the rendered surface reads as a very-slightly-darker coral, and `text-foreground` (charcoal) inherited from the page cascade still reads correctly. Per the Campus PrimaryButton precedent (FRAC-24, `bg-black/20` → `bg-foreground/20` documented as the translucent-foreground-as-surface-tint exempt composite), this `<div>` is the same exempt composite — translucent foreground over an `{light}` surface with the cascaded `text-foreground` reading correctly. NOT a pairing finding. Classification: EXACT no-op for both `bg-foreground/[0.03]` and `border-foreground/20` (canonical tokens with alpha).

- `src/components/sections/Events.tsx:5` — `<section className="py-24 md:py-40 bg-background" id="events">`. The orphan section asserts the cream surface token canonical to the site. FRAC-42 pairing: the section declares `bg-background` (cream) with no own `text-*` on the same node. The grandchild `<h2 className="text-eyebrow text-muted-foreground">` at line 9 carries its own canonical color; the sibling `<p className="…">` at line 10 inherits from the body cascade (which is `text-foreground`). The pairing-check rule (FRAC-42) is "every surface declaration carries its paired foreground at the same node." Strictly, the missing pair → NEAR MIGRATE: add `text-foreground` to the `<section>` for compositional safety. Even though the rendering is currently correct via the body cascade, the rule applies to the cascade-restructure-future-proofing case (same NEAR justification as Campus's PhotoPlaceholder `<div>` at `Campus.tsx:173`). Classification: NEAR — add `text-foreground` to the section.

- `src/components/sections/Events.tsx:17-21` — `<a … className="block overflow-hidden bg-muted relative group">` and `<div className="aspect-[1200/629] overflow-hidden">` inside. The `<a>` declares `bg-muted` (canonical surface token) with no own `text-*` on the same node — same FRAC-42 NEAR pattern as Events.tsx:5: add `text-muted-foreground` (the paired foreground for `bg-muted` per the muted-pair extension of the four canonical pairs — DESIGN.md lists `muted: hsl(var(--muted))` and `muted-foreground: hsl(var(--muted-foreground))`; while the FRAC-42 canonical-pairs table only enumerates background/foreground/house pairs explicitly, the same compositional principle applies to muted/muted-foreground). The text content is just the `<img>` (no rendered text), so the missing pair has zero current rendering impact, but the rule still applies for future-proofing. Classification: NEAR — add `text-muted-foreground` to the `<a>`.

- `src/components/layout/SectorHeader.tsx:9` call-site — Events's call-site prop `color="#C13B2A"` at `EventsPage.tsx:17` is the only direct color use from Events into SectorHeader's audit-internal surface. Migrate to `var(--color-house-events-deep)` (or `HOUSES.find(h => h.id==="events")!.palette.deep` if Apply chooses the runtime-data-model mechanism). EXACT on value, drift is mechanism. Mirrors LabPage:24 (`color="#C44878"` → `house-publications-deep`) and CampusPage:9 SectorHeader (`color="#1A3A2E"` → `house-campus-deep`).

### Cross-house leak check

Walked at planner level (grep on `EventsPage.tsx` and `Events.tsx` for `text-house-*`, `bg-house-*`, `#889460`, `#4A5A30`, `#2E6B4A`, `#1A3A2E`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830`, `#E870A0`, `#C44878`). **No cross-house leaks found.** The audit doc records this so a reader can verify the check was performed.

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These canonical example rows for FRAC-34 cover the EXACT-no-op `.text-display`, the NEAR `.text-title` orphan-section opener, the canonical-token EXACT `text-foreground` / `bg-foreground/[0.03]` / `border-foreground/20` cluster, the raw-hex page-bg + canonical-text-foreground pairing rows on `<main>`, the SectorHeader prop row, and the orphan `Events.tsx` rows (`bg-background` pairing NEAR, `bg-muted` pairing NEAR). The impl agent reproduces them verbatim in the audit doc, then appends any further rows it discovers (the orphan section is small; the page is small; the row count for Events will be substantially lower than Campus's).

### Typography examples

```
Element: src/pages/EventsPage.tsx:20 — <p className="text-display mb-6 text-center">Join Tech Events</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). One of three .text-display sites in EventsPage.tsx (lines 20, 51, 60) — they collapse to one typography row per (file + utility) grouping since the rendering is identical. The three sites are the three section openers: "Join Tech Events" (Luma embed), "Host Our Next Event" (Email Merlin's CTA), "Stay in the Loop" (Discord CTA).
```

```
Element: src/pages/EventsPage.tsx:44 — <a className="inline-block mb-12 text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity duration-300">Open calendar in new tab →</a>
Current: family=Inter (inherited body default — no font-mono override), weight=400 (body default), style=normal, transform=uppercase, size=text-xs, tracking=widest (Tailwind ≈ 0.1em)
Nearest canonical utility: .text-eyebrow (or .text-label / .text-meta — three names for same rendering)
Match quality: NEAR
Action: MIGRATE
Rationale: .text-eyebrow / .text-label / .text-meta is JetBrains Mono uppercase weight 500 text-sm tracking 0.1em. Drift: family Inter (body default — no font-mono) vs spec font-mono; size text-xs vs spec text-sm; weight 400 (default) vs spec 500. Tier (chrome) and role (overline-style link label below the Luma embed — visually-de-emphasized "secondary action" via opacity-70 hover:opacity-100) match. The tracking-widest + uppercase combination is the chrome-tier signature; canonical utility .text-meta (or .text-label) is the closest semantic fit for an inline-link meta label. Apply task migrates: replace the ad-hoc Tailwind class soup with .text-meta (or .text-label), keep the inline-block, mb-12, opacity-70, hover:opacity-100, transition-opacity, duration-300 modifiers as-is. Color row covers the absent text-* classification (inherits text-foreground from page cascade).
```

```
Element: src/components/sections/Events.tsx:9 — <h2 className="text-eyebrow text-muted-foreground mb-4">Events</h2>
Current: family=JetBrains Mono, weight=500, style=italic (h2 global rule italicizes; .text-eyebrow does not pin font-style so the global rule applies), transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: Already on .text-eyebrow; the chrome utility intends mono-uppercase-weight-500-tracking-0.1em. Drift: the h2 wrapper inherits the global italic rule (src/index.css h1–h6 block) — and .text-eyebrow does not pin font-style:normal, so the h2 silently renders italic. Per the audit-prompt section 4 "composite cascade" rule and the matching Lab forward observation, this is the recurring chrome-utility-on-h-tag accidental-italic pattern. Tier and role are canonical; the accidental italic is the NEAR-quality drift. Apply task migrates the typography rendering as-is (no className change required; the italic is the recurring drift to either codify or fix sitewide). The companion color row covers text-muted-foreground separately (canonical EXACT).
```

```
Element: src/components/sections/Events.tsx:10 — <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight normal-case">Come <span className="italic normal-case">hang out</span> with us.</p>
Current: family=Fraunces, weight=400, style=italic (from .font-serif global rule), transform=none (normal-case override), size=text-3xl (mobile), text-5xl (md+), tracking=default Fraunces, leading=tight
Nearest canonical utility: .text-title
Match quality: EXACT
Action: MIGRATE
Rationale: .text-title is italic Fraunces text-3xl md:text-5xl mixed-case tracking 0.04em. Sizes match exactly (text-3xl md:text-5xl). Style matches (italic via .font-serif rule, same as .text-title's italic spec). Transform matches (.text-title has text-transform:none, the normal-case className confirms the same rendering). Drift: weight 400 (.font-serif default) vs spec 350 (.text-title); leading-tight is a per-site override (spec sets no explicit leading); missing explicit tracking 0.04em (Fraunces default tracking is close but not pinned). Tier (display Fraunces italic) and role (section opener — the "come hang out with us" line under the "Events" eyebrow) match exactly. The inline <span className="italic normal-case"> on "hang out" is a no-op since the parent is already italic. Apply task migrates: .text-3xl md:text-5xl font-serif normal-case → .text-title, keep leading-tight, max-w-2xl as positional/sizing modifiers; the inner <span className="italic normal-case"> can be simplified to <span className="italic"> since the parent .text-title already pins normal-case (one-letter trim, optional).
```

### Color examples

```
Element: src/pages/EventsPage.tsx:11 — <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4857A" }}>
Current: backgroundColor: "#D4857A" (raw hex inline style), text-foreground (canonical Tailwind utility), selection:bg-foreground, selection:text-background (Tailwind utilities)
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: house-events-light (for the bg); foreground (for text-foreground, already canonical); foreground / background (for selection chrome, already canonical)
Match quality: EXACT (#D4857A → house-events-light) ; EXACT (text-foreground — already canonical) ; EXACT (selection chrome — already canonical)
Action: MIGRATE (for the raw-hex bg) ; JUSTIFY (for text-foreground — see Rationale) ; MIGRATE (no-op, for selection chrome)
Rationale: Three migrations on a single node, recorded together per (file + node) grouping. (1) Raw-hex bg `#D4857A` matches house-events-light exactly; drift is mechanism (inline style vs token-driven utility). Mirrors LabPage:16 (#E870A0 → house-publications-light) and CampusPage:8 (#2E6B4A → house-campus-light). FRAC-35 Apply declares all four house-events sibling tokens in @theme inline before performing this migration. (2) text-foreground on bg-house-events-light is NOT the FRAC-42-canonical paired-foreground (the canonical pair for {light} would be text-house-events-light-foreground = cream). Events deliberately uses charcoal (text-foreground) as the page-default voice — an editorial choice (charcoal-on-coral) distinct from Campus/Lab (cream-on-saturated). Classify as JUSTIFY: text-foreground is a canonical token used deliberately as the page-default text color. The audit does NOT migrate to the paired-foreground here; the Apply task or a separate editorial-review task may choose to flip to text-house-events-light-foreground if Jules reads charcoal-on-coral as off-voice. The departure from the paired-foreground convention is documented as a Forward observation. (3) Selection chrome already canonical (paired-inverse, FRAC-42 exempt). No-op migration.
```

```
Element: src/pages/EventsPage.tsx:28 — <div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">
Current: bg-foreground/[0.03] (canonical foreground token at 3% alpha, arbitrary-value syntax), border-foreground/20 (canonical foreground token at 20% alpha, pinned-step syntax)
Role: background (translucent foreground tint over the {light} page surface) + border
Nearest canonical token: foreground
Match quality: EXACT (both)
Action: MIGRATE (no-op; both already canonical)
Rationale: Both utilities reference the canonical foreground token at alpha. The arbitrary 3% alpha (bg-foreground/[0.03]) is below Tailwind's pinned scale step (5% is the lowest pinned: /5 = 0.05). The audit accepts the arbitrary alpha as a legitimate sub-pinned-step use of the canonical token — same reasoning as text-foreground/<n> classified EXACT under the alpha-is-presentation rule. No migration target. FRAC-42 pairing: the <div> declares bg-foreground/[0.03] with no own text-* — the child <iframe> at line 30 renders third-party Luma content (not subject to our pairing rule); the only Tailwind-styled child is <CornerDecorations size="xs" /> at line 29 which inherits text-foreground from the page cascade. Since bg-foreground/[0.03] is translucent charcoal over the bg-house-events-light page surface and the cascaded text-foreground reads correctly, this is the exempt translucent-foreground-as-surface-tint composite (precedent: Campus's PrimaryButton bg-black/20 → bg-foreground/20). NOT a pairing finding. No additional pair migration needed.
```

```
Element: src/pages/EventsPage.tsx:17 — <SectorHeader letter="E" name="Events" color="#C13B2A" />
Current: "#C13B2A" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Events" eyebrow color)
Nearest canonical token: house-events-deep
Match quality: EXACT
Action: MIGRATE
Rationale: Hex value identical to house-events-deep. Mirrors LabPage:24's color="#C44878" → house-publications-deep and CampusPage:9 SectorHeader's color="#1A3A2E" → house-campus-deep. Migrate to a token reference (CSS var var(--color-house-events-deep), HOUSES.find(h => h.id==="events")!.palette.deep import, or the mechanism FRAC-35 Apply chooses). The drift is mechanism (raw hex literal), not value. House-deep as a display/highlight color on the house's own page is permitted under DESIGN.md → Text foregrounds. SectorHeader internals out of scope.
```

```
Element: src/pages/EventsPage.tsx:12 — <FractalPattern color="#C13B2A" />
Current: "#C13B2A" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per the FRAC-20 exclusion precedent)
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
Rationale: bg-background is the canonical cream surface token; no token migration needed. FRAC-42 pairing: the <section> declares bg-background with no own text-* on the same node. Per the FRAC-42 four-canonical-pairs rule, bg-background's paired foreground is text-foreground. The page-level body cascade already renders the descendant text in text-foreground (charcoal), so current rendering is correct, but a future restructure (or a nested surface that swaps the cascade) would break the descendant text color. Add text-foreground to the <section> at line 5 for compositional safety. Apply task migration: <section className="py-24 md:py-40 bg-background text-foreground" id="events">. Note: this row is for the orphan Events.tsx — the component is not imported anywhere in the live src/ tree at HEAD (verified via repo-wide grep). Audit included per FRAC-34 scope instruction; Apply (FRAC-35) may choose to migrate the rows or to delete the orphan as a follow-up. Migration here is conservative.
```

```
Element: src/components/sections/Events.tsx:9 — <h2 className="text-eyebrow text-muted-foreground mb-4">Events</h2>
Current: text-muted-foreground (canonical surface token utility)
Role: text (eyebrow label color — muted secondary text)
Nearest canonical token: muted-foreground
Match quality: EXACT
Action: MIGRATE (no-op)
Rationale: Already on canonical muted-foreground token. No migration target. The companion typography row (above) covers the .text-eyebrow utility on an h2 with accidental-italic from the global rule.
```

```
Element: src/components/sections/Events.tsx:17 — <a … className="block overflow-hidden bg-muted relative group">
Current: bg-muted (canonical surface token utility)
Role: background (link wrapper surface — muted backdrop for the image card)
Nearest canonical token: muted
Match quality: EXACT (token); NEAR (pairing — missing text-muted-foreground on the same node)
Action: MIGRATE (add text-muted-foreground for FRAC-42 pairing)
Rationale: bg-muted is the canonical muted surface token; no token migration needed. FRAC-42 pairing: the <a> declares bg-muted with no own text-* on the same node. Per the FRAC-42 pairing principle (extended to the muted/muted-foreground pair via DESIGN.md's declared muted-foreground token), add text-muted-foreground for compositional safety. The child content is currently only an <img> with no rendered text, so current rendering has zero impact, but a future restructure that adds text inside the link would inherit incorrect color. Apply task migration: <a … className="block overflow-hidden bg-muted text-muted-foreground relative group">. Same orphan-component caveat as the row above (Events.tsx is not in the live import graph at HEAD).
```

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in `EventsPage.tsx` (79 lines, single render block with three FadeIn sections) and `Events.tsx` (~35 lines, single section with one FadeIn). For each text-bearing element (including the inline `<a>` at `EventsPage.tsx:40-47` and the orphan-component inline `<a>` at `Events.tsx:17`, but excluding the Button component's own text rendering and the inline `<a>` children of `<Button asChild>` at lines 55, 64-69 which carry no ad-hoc typography), write one typography row per audit-prompt section 4. For each distinct color use, write one color row per section 5 (grouped per the `(file + token)` rule).
2. **Mobile-first:** every responsive element lists both mobile and desktop renderings in `Current`. Events has limited responsive variation — only the page top-padding (`pt-16 md:pt-24`), page bottom-padding (`pb-32 md:pb-48`), section horizontal padding (`px-6 md:px-[4.5%]`), the Luma embed height (`h-[80vh] min-h-[600px] md:h-[850px]`), and the orphan Events.tsx `text-3xl md:text-5xl` opener carry responsive classes. Most typography rows have flat (non-responsive) sizing.
3. **Surface foreground pairing pass:** for every `bg-*` site in scope, check the same JSX node for the matching `text-*`. The pre-walked list above is exhaustive:
   - `EventsPage.tsx:11` `<main>` — `bg` via inline style + canonical `text-foreground` (JUSTIFY for the text — off-pair canonical token used deliberately as editorial voice; the bg gets MIGRATE; the selection chrome is exempt EXACT).
   - `EventsPage.tsx:28` Luma embed wrapper — `bg-foreground/[0.03]` + `border-foreground/20` (canonical translucent foreground; exempt translucent-foreground-as-surface-tint composite per Campus precedent).
   - `Events.tsx:5` orphan section — `bg-background` missing pair; NEAR add `text-foreground`.
   - `Events.tsx:17` orphan link wrapper — `bg-muted` missing pair; NEAR add `text-muted-foreground`.
4. **House identity check:** Events IS a house page; `house-events-{light, deep}` permitted for display/highlight only. Verify no other-house tokens / hex values appear (Events has none — confirm by walking). The SectorHeader letter color `#C13B2A` → `house-events-deep` is the canonical display-highlight use; the FractalPattern excluded prop is also `#C13B2A` (documented, not migrated).
5. **Cross-house leak check:** walk for any `text-house-*` / `bg-house-*` tokens and any raw hex values matching another house's palette in Events's scope. Audit doc records "no cross-house leaks found" so a reader can verify the check was performed.
6. **Tie-breaking** per audit-prompt section 6. Events's surface state is mostly canonical-tokens-with-mechanism-drift (raw-hex inline bg, raw-hex SectorHeader prop, canonical Tailwind utilities everywhere else). The notable departure from Campus/Lab is that Events's page-default text is `text-foreground` (charcoal) rather than inline-styled white — this is JUSTIFY-classified (canonical token, deliberate editorial-voice choice). The chrome-utility-on-h-tag accidental-italic pattern in `Events.tsx:9` is NEAR (Lab forward observation precedent). The orphan-section pairing additions are NEAR. **No GAP candidates surfaced at planner level** — Events has no italic asides, no Pretext, no body-mono passages, no custom typography drift beyond what canonical utilities resolve.
7. **No GAP entries expected** at impl time, unless the impl walking surfaces something the planner missed. If a real GAP appears, append to `.lattice/notes/audit-gaps.md` per section 7 AND copy into the audit doc's gap appendix per section 10. The audit-gaps.md file at HEAD contains FRAC-20 Lab, FRAC-22 Home, and FRAC-24 Campus entries; FRAC-34 Events appends after Campus (chronological order).
8. The audit doc is the spec for FRAC-35 (Events Apply). Apply reads only this file. The Apply task's index.css edit (declaring `--color-house-events-light`, `--color-house-events-deep`, `--color-house-events-light-foreground`, `--color-house-events-deep-foreground` in `@theme inline`) is not audit work — but every color row in this audit names the future token explicitly so Apply has a row-by-row migration spec.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/events-audit.md`** — the audit doc. Structure per audit-prompt section 10:
   - Page metadata block (slug=`events`, source=`src/pages/EventsPage.tsx` + `src/components/sections/Events.tsx`, date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px, branch=`frac-34-audit-events`)
   - In-scope / out-of-scope summary (mirror the campus-audit.md preamble format; explicitly call out FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon/CornerDecorations, SectorHeader internals, Button component, the inline `<a>` children of `<Button asChild>` carrying no ad-hoc classes)
   - **Orphan-component note for `Events.tsx`** — flag that the component is not imported anywhere in the live `src/` tree at HEAD; audit included per scope instruction
   - House identity block (Events = id `events` = displayName `Events`; token slug `house-events-{light,deep}`; default arrangement)
   - Inversion check (Events uses {light} as page bg; no inversion finding)
   - Cross-house leak check (none found)
   - `## Typography audit` — all rows (worked examples above + any new rows the impl finds walking each FadeIn block)
   - `## Color audit` — all rows
   - `## Forward observations (not GAPs under current rules)` — optional but expected. Candidates:
     - **The text-foreground-on-house-events-light editorial-voice question.** Events deliberately uses canonical charcoal (text-foreground) as page-default text on the coral bg, departing from Campus's and Lab's cream-on-saturated paired-foreground convention. The audit classifies the current state as JUSTIFY (canonical token, deliberate choice) but flags the question for the next iteration of the system: is charcoal-on-coral the intended Events editorial voice, or should Events align with the rest of the house pages on cream-on-saturated? An out-of-band editorial review or a separate FRAC ticket can decide.
     - **Chrome-utility-on-h-tag accidental-italic.** `Events.tsx:9` (h2 + .text-eyebrow) renders italic via the h-tag global rule even though the chrome tier intends upright. Recurring pattern across the site (Lab and Campus also have it); not a per-page GAP, but a sitewide forward observation.
     - **Orphan `Events.tsx` deletion candidate.** The component is not imported anywhere in the live src/ tree. Apply (FRAC-35) or a follow-up cleanup task may choose to delete it rather than migrate. Audit included per scope; deletion is a separate decision.
   - `## Gap appendix` — `"No gaps."` if the impl walks and confirms no new GAPs (planner expectation), otherwise append the new entry/entries.

2. **`.lattice/notes/audit-gaps.md`** — append-only. **Planner expectation: zero new entries from FRAC-34.** If the impl walking surfaces a real GAP, append it after the FRAC-24 Campus entry.

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-34 is audit-only. The Events Apply task (FRAC-35) will execute migrations including the `index.css` token declaration.
- `DESIGN.md` — FRAC-20 already added the Text foregrounds section. FRAC-42 already added the Surface foreground pairing section. FRAC-47 added .text-aside. No further changes needed here.
- `.lattice/notes/audit-prompt.md` — FRAC-20 already tightened the playbook. If FRAC-34 surfaces a genuine new playbook gap, escalate via a `needs_human` lattice comment instead of editing.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`.
- Other sibling audit docs in `.lattice/notes/audits/` (`lab-audit.md`, `home-audit.md`, `campus-audit.md`) — read-only references; don't edit them.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/events-audit.md` exists and follows the section-10 structure.
- [ ] Both in-scope files (`src/pages/EventsPage.tsx`, `src/components/sections/Events.tsx`) are represented by at least one typography row and at least one color row.
- [ ] Out-of-scope files are listed explicitly in the audit doc's preamble with the same exclusion rationale as this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon/CornerDecorations, SectorHeader internals, Button component).
- [ ] The orphan status of `src/components/sections/Events.tsx` is documented in the audit doc preamble (component not imported in live `src/` tree at HEAD).
- [ ] House identity block confirms Events = id `events` = displayName `Events`; token slug prefix `house-events-{light,deep}`; default arrangement (NOT forum/school inverted).
- [ ] Every typography row matches the section-4 format and the locked clarifications (file:line opening-tag granularity, composite cascade, family/weight/style/transform/size/tracking in `Current`).
- [ ] Every color row matches the section-5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings under `Current` (text-3xl md:text-5xl on Events.tsx:10, plus the px-6 md:px-[4.5%] container and pt-16 md:pt-24 / pb-32 md:pb-48 padding sites if any text-bearing element inherits responsively).
- [ ] Raw `#D4857A` at `EventsPage.tsx:11` is classified **EXACT → MIGRATE to house-events-light** (mirrors Lab's `#E870A0` → `house-publications-light` and Campus's `#2E6B4A` → `house-campus-light` precedent).
- [ ] Raw `#C13B2A` at `EventsPage.tsx:17` SectorHeader prop is classified **EXACT → MIGRATE to house-events-deep** (mirrors Lab's `#C44878` and Campus's `#1A3A2E` SectorHeader prop precedent).
- [ ] Raw `#C13B2A` at `EventsPage.tsx:12` FractalPattern prop is **DOCUMENTED AS EXCLUDED** in the audit doc preamble per the FRAC-20 / FRAC-24 precedent (FractalPattern out of scope entirely). Value-level migration target (`house-events-deep`) noted for traceability.
- [ ] `text-foreground` at `EventsPage.tsx:11` page-default text is classified **JUSTIFY** (canonical token used deliberately as off-pair editorial voice; departure from the FRAC-42 paired-foreground convention is documented as a Forward observation, not a finding).
- [ ] `bg-foreground/[0.03]` and `border-foreground/20` at `EventsPage.tsx:28` Luma embed wrapper are classified **EXACT no-op MIGRATE** with Rationale documenting the translucent-foreground-as-surface-tint exempt composite per FRAC-24 precedent.
- [ ] Selection chrome (`selection:bg-foreground selection:text-background`) at `EventsPage.tsx:11` is classified **EXACT MIGRATE no-op** (paired-inverse, FRAC-42 exempt).
- [ ] `bg-background` at `Events.tsx:5` orphan section is classified **NEAR → add text-foreground for pairing**.
- [ ] `bg-muted` at `Events.tsx:17` orphan link wrapper is classified **NEAR → add text-muted-foreground for pairing**.
- [ ] Cross-house leak check is documented as performed (no other-house tokens / hex found in Events's scope).
- [ ] Inversion check is documented as performed (Events uses {light} as page bg per the default arrangement — no inversion finding).
- [ ] All 4 typography worked-example rows and all 7 color worked-example rows above appear verbatim in the audit doc, in the order presented, alongside any new rows the impl finds.
- [ ] Forward observations include the text-foreground-on-house-events-light editorial-voice question and the orphan Events.tsx deletion-candidate note.
- [ ] Gap appendix in the audit doc says `"No gaps."` unless the impl walking surfaces a real new GAP (planner expectation: zero new gaps from FRAC-34).
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes.
- [ ] No sibling audit docs edited (`lab-audit.md`, `home-audit.md`, `campus-audit.md` remain unchanged).
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch (pre-existing failures on master — footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood min-h-screen — are NOT regressions from this audit-only work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt section 10.
- Every in-scope file (`EventsPage.tsx`, `Events.tsx`) is represented by at least one typography row and at least one color row.
- Exclusion list is documented in the audit doc with rationale matching this plan.
- The 4 typography + 7 color worked-example rows above appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag granularity, responsive element listing both renderings) are applied consistently across all rows.
- Project-wide text-color rule applied uniformly. Events's page-default `text-foreground` is JUSTIFY-classified (not flagged as a leak or drift).
- Surface foreground pairing rule applied to every `bg-*` site in scope. Each pairing site has its own row, NEAR if relying on cascade or with the pair absent, EXACT if pair is co-located. The translucent-foreground-as-surface-tint composite at `EventsPage.tsx:28` is exempt per the Campus PrimaryButton precedent.
- House identity decision honored: `text-house-events-*` and `bg-house-events-*` future tokens are the only house tokens named in Events's audit doc. No cross-house leaks classified as MIGRATE-as-is.
- The raw-hex page bg + raw-hex SectorHeader prop pattern from FRAC-20 (Lab) and FRAC-24 (Campus) is mirrored in the Events rows.
- The orphan `Events.tsx` status is documented; rows for the orphan section are present and consistent with the format rules.
- `audit-gaps.md` carries only newly-added entries from this run (planner expectation: none), appended after the existing FRAC-20 Lab, FRAC-22 Home, and FRAC-24 Campus entries. If no new gaps, the file is unchanged.
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md` changes, no sibling audit doc edits.
- Tests pass on the branch (modulo documented baseline failures).

If the review finds rework: implementation-level for row-format drift or missed rows; plan-level only if a structural assumption above (FractalPattern exclusion, scope boundary including/excluding the orphan, JUSTIFY classification of text-foreground page-default, surface-pairing applicability) turns out wrong.

---

## Open questions to escalate

None blocking. The Events page's surface pattern (saturated `{light}` page bg via raw-hex inline style, canonical Tailwind utilities for everything else, no inline white text) is a hybrid of the Lab/Campus precedent (raw-hex page bg + raw-hex SectorHeader prop) and the home-page canonical-token discipline (canonical text-foreground, canonical bg-foreground/[0.03] for the embed wrapper). The Events Apply task (FRAC-35) is structurally identical to FRAC-25 (Campus): declare four sibling tokens in @theme inline, migrate the raw-hex bg and SectorHeader prop to the new tokens, and complete the FRAC-42 pairing additions on the two orphan-section bg-* sites. The text-foreground-on-house-events-light editorial-voice question is the only soft signal that may need Jules's review — but it does not block the audit and is surfaced as a Forward observation rather than a finding.
