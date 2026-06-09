# FRAC-32 — Audit Visit page (typography + color)

**Task:** task_01KTJQF20EJPS18DC3Z97YGY13
**Branch:** frac-32-audit-visit
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px

This is the **fourth** per-page audit executed under the FRAC-18/FRAC-19 playbook. FRAC-20 (Lab) was the first and is the worked example; FRAC-22 (Home) was the second and codified the FRAC-42 surface-foreground pairing pass for Apply tasks at scale; FRAC-24 (Campus) was the third and is the gold-standard template for a house page that lands the FRAC-42 paired-from-day-one pattern. Visit is the **second house page** to go through Audit→Apply with all four sibling tokens declared together. The Visit Apply task (FRAC-33) will declare all four sibling tokens (`--color-house-visit-light`, `--color-house-visit-deep`, `--color-house-visit-light-foreground`, `--color-house-visit-deep-foreground`) in one `@theme inline` block, mirroring the FRAC-25 Campus precedent.

No `audit-prompt.md` revisions are expected here (FRAC-20 already tightened it). No `DESIGN.md` revisions (FRAC-20 codified Text foregrounds; FRAC-42 codified Surface foreground pairing). If a brand-new playbook gap appears during impl, escalate via a `needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: NeighborhoodPage's import graph)

- `src/pages/NeighborhoodPage.tsx` — the page entry (~78 lines). Owns:
  - The page-level `<main>` surface at line 13 (raw-hex `#889460` background inline style + `text-foreground` className + `selection:bg-foreground selection:text-background`).
  - The "Note" `MandelbrotCorners` card (`text-eyebrow`, `text-xs`, ordered list, all with `text-white`).
  - The `PretextParagraph` lead text ("Want to visit? Fill out this form.") with `text-white` className override.
  - The `<SectorHeader letter="V" name="Visit" color="#4A5A30" />` call site (line 20).
  - The `<Button>` wrapping `<a>` for the Visitor Form CTA.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#4A5A30" />` call site at `NeighborhoodPage.tsx:14` — explicitly excluded per FRAC-20 (Lab) precedent. The FractalPattern color prop is a shared decorative SVG fill; not audited. The hex value at the call site (`#4A5A30`) is documented here only as an excluded site.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` (component internals — only the inline className overrides on the `<MandelbrotCorners …>` call site at `NeighborhoodPage.tsx:29` are in scope) — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audited as a separate task. **Note:** the call-site prop `color="#4A5A30"` at `NeighborhoodPage.tsx:20` IS audited as part of `NeighborhoodPage.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt section 4). The `<Button asChild>` wrapping the `<a>` at `NeighborhoodPage.tsx:60-68` carries no inline className overrides for color (only `max-w-xs w-full text-center` — layout/text-align only). **The wrapped `<a>` child carries no Tailwind classes.** Out of scope for color, except to verify no color override is being added.
- `src/components/pretext/PretextParagraph.tsx` and `src/lib/pretext.ts` internals — the Pretext rendering layer is out of scope as a system (per audit-prompt section 4 "Pretext-rendered text"). **Only the inline className override `text-white` on the PretextParagraph call site at `NeighborhoodPage.tsx:54-59` is in scope for color**, and the inline px size (`TEXT_SIZES.sm` = 12px) is in scope for typography classification.
- `src/components/sections/NeighborhoodCampusDiagram.tsx` — exists but is NOT imported by `NeighborhoodPage.tsx`. It is rendered on the Story page. Out of scope for this audit.
- Tests, configs, package files.

### House identity decision (Visit = `neighborhood` id, `house-visit-*` token slug)

Visit IS a house page. **The internal data-model `id` is `neighborhood`; the displayName is `Visit`; the token slug prefix is `house-visit-{light,deep}`.** Per DESIGN.md → House mapping, the token system uses the displayName slug (not the internal id) for token naming. **Do not cross the wires.** The route `/neighborhood` and the data `HOUSES.find(h => h.id === "neighborhood")` use the internal id; the CSS tokens `--color-house-visit-light` etc. use the displayName slug.

This is the **critical house-identity binding rule for this audit:** every color row that names a future token writes `house-visit-{...}` (NOT `house-neighborhood-*`). The Apply task (FRAC-33) will declare exactly those four token names in `@theme inline`.

Per DESIGN.md → Text foregrounds, the house's `{light, deep}` pair is permitted as text color for display headings and highlight chrome on its own page. Per DESIGN.md → House palette values:

- `house-visit-light = #889460` (the green-olive page bg)
- `house-visit-deep = #4A5A30` (the deep accent — SectorHeader monogram letter + "Visit" eyebrow text + FractalPattern fill)

Lock the rules for Visit:

- **`house-visit-light` (`#889460`) IS the page background** (default arrangement, not the forum/school inversion). `house-visit-deep` (`#4A5A30`) is the accent (SectorHeader letter, FractalPattern fill — excluded site).
- **Visit's `{light}` and `{deep}` ARE permitted** as text/highlight chrome on Visit pages — eyebrow text, focus rings, accent labels, display monogram letters. The SectorHeader letter "V" and "Visit" eyebrow at `NeighborhoodPage.tsx:20` are display/highlight uses of `house-visit-deep`.
- **Other house colors (`house-publications-*`, `house-events-*`, `house-campus-*`, `house-education-*`, `house-political-club-*`) are NOT permitted** as Visit chrome text. The impl agent should walk for cross-house leaks; Visit today has none (no other-house-colored text classes appear in the source).
- **Cream (`text-house-visit-light-foreground`)** is the editorial voice on Visit's saturated olive-green surfaces (both `{light}` page bg and any nested `{deep}` highlight surface, though Visit today has no nested `{deep}` saturated surface). The FRAC-42 default for Visit is that both `--color-house-visit-light-foreground` and `--color-house-visit-deep-foreground` will resolve to `var(--color-background)` (same as Publications and Campus) — declared by FRAC-33.
- **Charcoal (`text-foreground`)** is the body voice on any cream-`bg-background` surface nested inside Visit. Visit today has no such nested cream surface but the `<main>` at line 13 currently declares `text-foreground` directly even though the page bg is `house-visit-light` — this is a pairing finding (see below).
- **Any raw `text-white` or inline `color: "#fff"`** on Visit's saturated bg → **NEAR MIGRATE** to `text-house-visit-light-foreground`. Visual delta imperceptible (`#ffffff` vs `#f8f6f0`). This is the Lab/Campus text-white precedent extended to Visit's paired-foreground token.
- **Any `text-white/<alpha>` variant** → **NEAR MIGRATE** to `text-house-visit-light-foreground/<alpha>` (paired-foreground with alpha modifier).

### Inversion check

Visit is NOT a forum/school inverted page (per DESIGN.md → The forum/school page-bg inversion). Visit uses `{light}` as the page bg (`#889460`) and `{deep}` as the accent (`#4A5A30`). The audit doc records this as the expected default arrangement; finding the inverted arrangement on Visit would itself be a finding (but the source confirms default is in place — no inversion finding).

### Cross-house leak check

Walk for any `text-house-*` / `bg-house-*` / raw hex matching another house's palette in `NeighborhoodPage.tsx`. Visit today has none — but the audit doc records "no cross-house leaks found" so a reader can verify the check was performed. The hexes to walk for: `#E870A0`, `#C44878`, `#2E6B4A`, `#1A3A2E`, `#D4857A`, `#C13B2A`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830`.

---

## Format (locked 2026-06-08 with human, carried from FRAC-20 → FRAC-22 → FRAC-24)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5 (color), with the FRAC-20 clarifications carried forward:

- **`<file:line>` granularity:** opening JSX tag line of the element. Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale.
- **Color row grouping:** by `(file + token)`. List every role the token serves in that file on the `Role:` line.
- **Pretext-rendered text:** APPLICABLE to Visit. NeighborhoodPage uses `<PretextParagraph size={TEXT_SIZES.sm}>` at line 54-59. Per audit-prompt section 4 "Pretext-rendered text": record the inline px size in `Current`; nearest fit is the closest body-tier utility regardless of family mismatch (Pretext always uses JBM via FONTS.body; canonical body utilities are Inter). Family mismatch goes in Rationale; classification is GAP. The Lab gap entry (FRAC-20) already covers the sitewide Pretext pattern at the system level — Visit's Pretext callsite is a **fold-in** (same gap pattern, different size: Visit uses `TEXT_SIZES.sm` = 12px; Lab used `TEXT_SIZES.base` = 13px). Per the gap-register rules ("Sitewide dedup is a later human task" and "Multiple gaps from the same page audit accumulate as separate list items in source order"), the Visit audit appends its own gap entry for the `TEXT_SIZES.sm` callsite, citing the Lab parent entry.
- **Inline `<a>` and `<button>`:** Visit's only inline `<a>` is wrapped by `<Button asChild>` (NeighborhoodPage.tsx:61-67) — typography is locked via `buttonVariants`. **Skip per audit-prompt section 4 Button rule.** Visit has no inline `<button>` elements bypassing the Button component, no `<a>` elements outside the Button wrapper. **No ad-hoc inline links to audit.**

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20 PR)

- Text on this site is `text-foreground` (charcoal `#171717`) or `text-background` (cream `#f8f6f0`) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted as display/highlight text. **Visit IS a house page** — `house-visit-{light, deep}` IS permitted on Visit, but as display/highlight text only (SectorHeader letter, eyebrow). Body copy on Visit's saturated `{light}` page background goes to the paired foreground token (`text-house-visit-light-foreground`), which resolves to cream.
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
- House display-use text colors on the house's own page surface — Visit SectorHeader letter / "Visit" eyebrow using `#4A5A30` is display/highlight chrome, exempt from the surface-pairing check.

**For Visit, the pairing-check sites the impl agent must visit (pre-walked):**

- `src/pages/NeighborhoodPage.tsx:13` — `<main className="… text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#889460" }}>`. **Two findings on the same node:**
  1. **Raw-hex bg** `#889460` → migrate to `bg-house-visit-light` token utility (paralleling LabPage:16 `#E870A0` → `house-publications-light` and CampusPage:8 `#2E6B4A` → `house-campus-light`). EXACT on value; drift is mechanism (inline `style` instead of a token-driven Tailwind utility).
  2. **`text-foreground` on the same node** is a **mispairing finding** — per FRAC-42, `bg-house-visit-light` pairs with `text-house-visit-light-foreground` (cream), NOT `text-foreground` (charcoal). The current `text-foreground` produces charcoal text on the olive-green `{light}` bg, which is wrong by the surface-foreground pairing rule. **NEAR MIGRATE** to `text-house-visit-light-foreground`. Visual delta is noticeable (charcoal → cream) — flag in Rationale so Apply review at 375px catches the intentional rendering change.
  Combine into a single color-audit row (same file:line, joined `Role: background + text (page default)`), per audit-prompt section 5 `(file + token)` grouping where two related migrations land on the same node — write as one row with explicit dual-role and dual-rationale. The selection chrome (`selection:bg-foreground selection:text-background`) gets its own EXACT row (paired-inverse, FRAC-42 exempt).

- `src/pages/NeighborhoodPage.tsx:29` — `<MandelbrotCorners size="sm" opacity={0.15} className="border border-foreground/20 rounded-md px-6 py-5 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-left max-w-xl mx-auto">`. **Three findings on one node (the MandelbrotCorners "Note" card):**
  1. **`bg-foreground/[0.03]`** — translucent charcoal surface tint over the `{light}` page bg. Same Campus PrimaryButton precedent (translucent foreground over a `{light}` surface). The Tailwind arbitrary value `[0.03]` is canonical-token-as-arbitrary-alpha (vs. the Campus `/20`/`/30` standard-step). Resolve to `bg-foreground/[0.03]` — already on the canonical foreground token (EXACT on value; drift is mechanism only at the alpha-syntax level: arbitrary `/[0.03]` vs. standard-step). Since the value matches the canonical token, classify EXACT. Same exempt-composite reasoning as Campus PrimaryButton: a translucent charcoal surface tint over a `{light}` page surface with cream text reads correctly — but for compositional safety per FRAC-42, the card SHOULD carry an explicit `text-house-visit-light-foreground` so its children's text color is re-asserted at the card boundary. **NEAR for pairing.**
  2. **`border-foreground/20`** — canonical foreground token at /20 alpha. EXACT — the foreground token is permitted as a chrome border accent (matches the Lab DocumentBadge `border-border` / arbitrary-foreground-deep border precedent at structural level).
  3. **Pairing addition needed:** `text-house-visit-light-foreground` should be added to this card node so the cascade re-asserts the paired-foreground at the card boundary. Children at lines 30 (`<p className="text-eyebrow text-white …">`) and 33 (`<p className="text-xs … text-white">`) and 37 (`<ol … text-white text-left">`) each carry their own `text-white` and migrate via the master text-white row, so rendering is correct today by descendant re-assertion — but FRAC-42 prefers the card establish its own paired-foreground. **NEAR — pairing addition.**

- `src/pages/NeighborhoodPage.tsx:60` — `<Button asChild className="max-w-xs w-full text-center">`. The Button component is excluded for typography. **No inline color overrides on this Button** — `max-w-xs w-full text-center` is layout/text-align only. The Button's own `buttonVariants` styling cascades canonical foreground (`text-foreground` for default variant) which is the FRAC-21 / Campus pattern. **No finding on this node** beyond noting "no overrides — out of scope per Button rule." Listed in the color audit for enumeration completeness.

### SectorHeader prop check

`NeighborhoodPage.tsx:20` — `<SectorHeader letter="V" name="Visit" color="#4A5A30" />`. The only direct color prop is the raw hex `#4A5A30`, identical to `house-visit-deep`. Migrate to `var(--color-house-visit-deep)` (or the data-model `HOUSES.find(h => h.id==="neighborhood")!.palette.deep` if Apply chooses runtime). EXACT on value, drift is mechanism. (Parallels LabPage:24 `color="#C44878"` and CampusPage:190 `color="#1A3A2E"` precedents.)

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These canonical example rows for FRAC-32 cover one EXACT no-op (text-display), one NEAR for chrome (text-eyebrow drift), one for the body chrome tier text-xs cluster, one GAP for the PretextParagraph callsite, the FRAC-42 raw-hex-bg-with-mispaired-foreground row, the MandelbrotCorners card row, and the SectorHeader prop row. The impl agent reproduces them verbatim in the audit doc, then appends any further rows it discovers.

### Typography examples

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

### Color examples

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

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in `NeighborhoodPage.tsx` (~78 lines, single render block with a few nested sections). For each text-bearing element, write one typography row per audit-prompt section 4. For each distinct color use, write one color row per section 5 (grouped per the `(file + token)` rule).
2. **Mobile-first:** every responsive element lists both mobile and desktop renderings in `Current`. Visit's only responsive typography is the `.text-display` heading (already responsive within the utility's spec) and the FadeIn/MandelbrotCorners layout deltas (out of typography/color scope). The flat `text-xs` text in the disclaimer card has no responsive variant — record as `size=text-xs` (no md+ delta).
3. **Surface foreground pairing pass:** for every `bg-*` site in scope (the pre-walked list above is exhaustive: `NeighborhoodPage.tsx:13` raw-hex bg + mispaired `text-foreground`, `NeighborhoodPage.tsx:29` `bg-foreground/[0.03]` MandelbrotCorners card), check the same JSX node for the matching `text-*`. Missing pair → NEAR MIGRATE per FRAC-42 rule. Mispaired (wrong foreground variant) → NEAR MIGRATE with visible-rendering-change flag.
4. **House identity check:** Visit IS a house page; `house-visit-{light, deep}` permitted for display/highlight only. **The token slug is `house-visit-*` NOT `house-neighborhood-*` — the internal id is `neighborhood` but the displayName slug is `visit`.** Verify no other-house tokens / hex values appear (Visit has none — confirm by walking). The SectorHeader letter color `#4A5A30` → `house-visit-deep` is the canonical display-highlight use.
5. **Cross-house leak check:** walk for any text-house-publications-*, bg-house-publications-*, raw `#E870A0`, `#C44878`, `#2E6B4A`, `#1A3A2E`, `#D4857A`, `#C13B2A`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830` in Visit's scope. Audit doc records "no cross-house leaks found".
6. **Tie-breaking** per audit-prompt section 6. The text-foreground rule (DESIGN.md, codified by FRAC-20) and the surface-foreground pairing rule (DESIGN.md, codified by FRAC-42) make most Visit drift NEAR rather than GAP. The only realistic GAP is the PretextParagraph callsite (same pattern as Lab's FRAC-20 GAP).
7. Real GAPs (after rules applied) get appended to `.lattice/notes/audit-gaps.md` per section 7 AND copied into the audit doc's gap appendix per section 10. The existing `audit-gaps.md` (on master at HEAD) carries 3 entries (FRAC-20 Lab Pretext, FRAC-22 Home golden-age-protocol, FRAC-24 Campus italic-aside). The Visit Pretext gap is appended after the FRAC-24 entry, in chronological-by-audit-date order.
8. The audit doc is the spec for FRAC-33 (Visit Apply). Apply reads only this file. The Apply task's index.css edit (declaring `--color-house-visit-light`, `--color-house-visit-deep`, `--color-house-visit-light-foreground`, `--color-house-visit-deep-foreground` in `@theme inline`) is not audit work — but every color row in this audit names the future token explicitly so Apply has a row-by-row migration spec.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/visit-audit.md`** — the audit doc. Structure per audit-prompt section 10:
   - Page metadata block (slug=`visit`, source=`src/pages/NeighborhoodPage.tsx`, date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px, branch=`frac-32-audit-visit`)
   - In-scope / out-of-scope summary (mirror the campus-audit.md preamble format; explicitly call out FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, MandelbrotCorners component internals — call site IS in scope, SectorHeader internals, Button component, PretextParagraph component internals — call site IS in scope, NeighborhoodCampusDiagram — not imported by NeighborhoodPage)
   - **House identity section:** state explicitly that the internal id is `neighborhood`, displayName is `Visit`, token slug is `house-visit-{light,deep,light-foreground,deep-foreground}` — and that the audit names the future `house-visit-*` tokens in every color row (NOT `house-neighborhood-*`).
   - `## Typography audit` — all rows (worked examples above + any new rows the impl finds walking each section)
   - `## Color audit` — all rows
   - `## Forward observations (not GAPs under current rules)` — optional. Candidates: the `text-xs` disclaimer body has no responsive variant (deliberate compact-card density) and reads ~2 size steps below canonical `.text-body`; the `bg-foreground/[0.03]` arbitrary alpha syntax could be normalized to a standard-step (3% is unusual).
   - `## Gap appendix` — copy of the PretextParagraph gap entry.

2. **`.lattice/notes/audit-gaps.md`** — append-only. The PretextParagraph callsite gap is the candidate entry (folds into the Lab sitewide pattern with a different size).

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-32 is audit-only. The Visit Apply task (FRAC-33) will execute migrations including the `index.css` token declaration.
- `DESIGN.md` — FRAC-20 already added the Text foregrounds section. FRAC-42 already added the Surface foreground pairing section. No further changes needed here.
- `.lattice/notes/audit-prompt.md` — FRAC-20 already tightened the playbook. If FRAC-32 surfaces a genuine new playbook gap, escalate via a `needs_human` lattice comment instead of editing.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`. Other sibling audit doc files at `.lattice/notes/audits/*-audit.md` (do not edit; you only write `visit-audit.md`).

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/visit-audit.md` exists and follows the section-10 structure.
- [ ] `src/pages/NeighborhoodPage.tsx` is represented by at least one typography row and at least one color row.
- [ ] Out-of-scope files are listed explicitly in the audit doc's preamble with the same exclusion rationale as this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, MandelbrotCorners internals, SectorHeader internals, Button component, PretextParagraph internals, NeighborhoodCampusDiagram).
- [ ] **House identity is documented explicitly:** internal id `neighborhood` → displayName `Visit` → token slug `house-visit-{light,deep,light-foreground,deep-foreground}`. Every color row naming a future token uses `house-visit-*` (NOT `house-neighborhood-*`).
- [ ] Every typography row matches the section-4 format (file:line opening-tag granularity, composite cascade, family/weight/style/transform/size/tracking in `Current`).
- [ ] Every color row matches the section-5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings under `Current` (the only responsive typography in scope is `.text-display`'s built-in `text-5xl md:text-7xl`; the flat `text-xs` sites are recorded as `size=text-xs` with no md+ delta).
- [ ] Every `text-foreground/<alpha>` / `text-background/<alpha>` instance is classified EXACT under the alpha-is-presentation rule.
- [ ] Every `text-white` instance (lines 30, 33, 37, 56) is classified **NEAR → MIGRATE to text-house-visit-light-foreground** per the Visit house-identity rule. No text-white instances classified GAP.
- [ ] **The `text-foreground` on the `<main>` at L13 is classified NEAR → MIGRATE to text-house-visit-light-foreground** as the FRAC-42 mispairing finding, with the visible-rendering-change (charcoal → cream) flagged in the Rationale.
- [ ] Raw `#889460` at `NeighborhoodPage.tsx:13` is classified **EXACT → MIGRATE to house-visit-light** (mirrors Campus's `#2E6B4A` → `house-campus-light` precedent).
- [ ] Raw `#4A5A30` at `NeighborhoodPage.tsx:20` SectorHeader prop is classified **EXACT → MIGRATE to house-visit-deep** (mirrors Campus's `#1A3A2E` SectorHeader prop precedent).
- [ ] Raw `#4A5A30` at `NeighborhoodPage.tsx:14` FractalPattern prop is **DOCUMENTED AS EXCLUDED** in the audit doc preamble per the FRAC-20 precedent.
- [ ] `bg-foreground/[0.03]` and `border-foreground/20` at `NeighborhoodPage.tsx:29` MandelbrotCorners card are classified **EXACT (canonical foreground token)**, with the FRAC-42 pairing addition (`text-house-visit-light-foreground` on the same node) classified NEAR.
- [ ] The PretextParagraph callsite at `NeighborhoodPage.tsx:54` (typography only; the `text-white` className is the color row) is classified **GAP → GAP-LOG-AND-MIGRATE** with one gap entry citing the Lab parent gap and noting the different `TEXT_SIZES.sm` (12px) vs. Lab's `TEXT_SIZES.base` (13px).
- [ ] Cross-house leak check is documented as performed (no other-house tokens / hex found in Visit's scope).
- [ ] Inversion check is documented as performed (Visit uses {light} as page bg per the default arrangement — no inversion finding).
- [ ] The 8 worked-example rows above (4 typography + 4 color, including the JUSTIFY Button row and the excluded FractalPattern row) appear verbatim in the audit doc, in the order presented, alongside any new rows the impl finds.
- [ ] Gap appendix in the audit doc mirrors the `audit-gaps.md` entry appended by this run.
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes.
- [ ] No edits to other audit docs (`lab-audit.md`, `home-audit.md`, `campus-audit.md`).
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch (pre-existing failures from master — if any — are NOT regressions from this audit-only work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt section 10.
- `NeighborhoodPage.tsx` is represented by at least one typography row and at least one color row.
- Exclusion list is documented in the audit doc with rationale matching this plan.
- **House identity:** the audit doc states explicitly that the internal id is `neighborhood`, displayName is `Visit`, and token slug is `house-visit-*` — and every color row names `house-visit-*` (NOT `house-neighborhood-*`).
- The 8 worked-example rows appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag granularity, responsive element listing both renderings) are applied consistently across all rows.
- Project-wide text-color rule applied uniformly (every text-color finding maps to foreground/background or Visit's own house-visit-{light, deep, light-foreground, deep-foreground} pair).
- Surface foreground pairing rule applied to every `bg-*` site in scope (`NeighborhoodPage.tsx:13` and `NeighborhoodPage.tsx:29`).
- **The L13 `text-foreground` mispairing finding is flagged explicitly** with the visible-rendering-change note (charcoal → cream).
- House identity decision honored: `text-house-visit-*` and `bg-house-visit-*` future tokens are the only house tokens named in Visit's audit doc. No cross-house leaks classified as MIGRATE-as-is.
- The raw-hex page bg + raw-hex SectorHeader prop pattern from FRAC-20 (Lab) / FRAC-24 (Campus) is mirrored in the Visit rows: same EXACT-on-value classification, same Apply-task-declares-then-migrates expectation, with the FRAC-42 paired-foreground extension explicit.
- `audit-gaps.md` carries only the new Visit PretextParagraph entry, appended after the existing FRAC-20 Lab + FRAC-22 Home + FRAC-24 Campus entries.
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md` changes, no edits to other audit docs.
- Tests pass on the branch (modulo documented baseline failures).

If the review finds rework: implementation-level for row-format drift or missed rows; plan-level only if a structural assumption above (FractalPattern exclusion, scope boundary, house-identity binding `house-visit` vs `house-neighborhood`, surface-pairing applicability to `bg-foreground/[0.03]`, mispairing classification of L13 `text-foreground`) turns out wrong.

---

## Open questions to escalate

None blocking. The Visit page's surface pattern (saturated `{light}` page bg, raw-hex implementation pre-token-declaration, `text-white` text everywhere) is the exact Campus precedent — the only material differences are:

1. **House identity binding:** Visit's internal id is `neighborhood` but the token slug is `house-visit-*`. This is a load-bearing distinction this plan locks explicitly — the impl agent must name `house-visit-*` tokens, not `house-neighborhood-*`.
2. **L13 `text-foreground` mispairing:** Visit's `<main>` declares `text-foreground` (charcoal) where Campus declared raw `color: "#fff"` inline-style. Visit's charcoal-on-olive-green is a visible mispairing today; Campus's white-on-forest-green was canonical-by-imperceptible-delta. Apply (FRAC-33) will produce a visible rendering change at the L13 site (charcoal → cream); the Apply test plan must call out the 375px visual verification of the L13 text color flip.
3. **PretextParagraph callsite uses `TEXT_SIZES.sm` (12px)** vs Lab's `TEXT_SIZES.base` (13px). Same sitewide gap pattern; smaller size. Gap-log fold-in.
4. **NeighborhoodCampusDiagram is NOT imported** by NeighborhoodPage — it lives in the Story page tree. Out of scope; documented to prevent confusion.

The Visit page is **smaller in surface area than Campus** — ~5 in-scope text-bearing nodes vs Campus's ~40+. The audit should be tractable in a single sub-agent pass.
