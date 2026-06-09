# FRAC-22 — Audit Home page (typography + color)

**Task:** task_01KTJQF0482H67984A2QTMMESE
**Branch:** frac-22-audit-home
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR)
**Mobile viewport baseline:** 375px

This is the **second** per-page audit executed under the FRAC-18/FRAC-19
playbook. FRAC-20 (Lab) was the first and is the worked example. Unlike
FRAC-20 (which surfaced six playbook revisions during planning), FRAC-22
should NOT need to edit `audit-prompt.md` or `DESIGN.md` — FRAC-20 already
folded the text-foreground rule into DESIGN.md and tightened the playbook,
and FRAC-42 added the Surface foreground pairing rule. If a brand-new gap
appears during impl that demands a playbook revision, escalate via a
`needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: Home's import graph)

- `src/pages/Home.tsx` — the page entry. Renders `<Navbar />`, `<Hero />`,
  the inline "Golden Age Protocol" section, `<Footer />`. Home-owned
  surfaces: the page-level `<main>` (line 19) and the protocol `<section>`
  (line 25).
- `src/components/sections/Hero.tsx` — Home's hero. Renders the keyboard
  skip-nav, the search combobox/listbox, the lazy-loaded `FractalCityScene`,
  the NYC skyline background image. ~318 lines.

### Out of scope (deferred or excluded)

- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`,
  `FractalPattern.tsx` — shared chrome rendered on every page. Audited
  elsewhere if at all. Same exclusion rationale as FRAC-20 (Lab).
- `src/components/three/FractalCityScene.tsx` — the R3F canvas wrapper.
  No text/color content in JSX classNames (its `bg-transparent` canvas style
  is a scene-canvas concern, not a Tailwind surface declaration). The
  `<div className="absolute inset-0 z-[1]">` and `<div className="pointer-events-auto">`
  wrappers carry no typography or color tokens. **Exclude** entirely.
  Document explicitly.
- `src/components/three/OctahedronHero.tsx` — the 3D scene rendered into the
  R3F canvas. Decision: **exclude**. Rationale:
  - The vast majority of its color is THREE.js material color (R3F props
    `color`, `emissive`, `material.color`), which DESIGN.md → Components
    explicitly classifies as "code, not tokens" (OctahedronHero entry,
    "Motion, shaders, materials, and the face order are not tokens").
  - Its text content (EDGE_TEXT "THE PROTOCOL", nav-node labels) is
    canvas-baked into textures (`ctx.font = "bold 28px 'JetBrains Mono'…"`,
    line 238) or rendered via `<Html>` overlays with inline CSS strings in
    `tooltipStyle()` (lines 783–798). These do not consume Tailwind
    utilities and sit outside the audit-prompt's scope (audit-prompt
    section 9 non-goal: "audit declared CSS/Tailwind values only").
  - The `tooltipStyle()` does reference `hsl(var(--foreground))` (line 795)
    — that IS canonical-token consumption, and would be a 1-row finding.
    Document it as the lone in-bounds OctahedronHero use, but classify it
    against the wider exclusion: the file is excluded as a 3D scene
    artifact per DESIGN.md, audit-prompt section 9 "Non-goals — motion,
    shadow, gradient tokens — DESIGN.md does not model these; not audited"
    (extended by analogy to Three.js scene internals).
  - This mirrors FRAC-20's exclusion of `FractalPattern.tsx` and shared
    chrome — Home does not re-audit scene internals.
- `src/components/three/Skyline.tsx` — not imported by Hero (orphan). Not
  in render graph; out of scope.
- `src/components/three/FractalObject.tsx` — dead-code path per FRAC-21
  team review; the live `FractalObject` export comes from `OctahedronHero`.
  Not in scope either way.
- `src/hooks/use-global-search.ts`, `src/hooks/usePrefersReducedMotion.ts`,
  Wouter's `useLocation` — data/hook layer, no UI.
- `OUTER_NAV_NODES` const import — pure data (route + label + color
  strings consumed by 3D nodes). The skip-nav UI in Hero:129–150 IS in
  scope and uses Tailwind utilities; the `OUTER_NAV_NODES` data import
  itself is not.
- The `<img src="…/skyline4.png" />` raster at Hero:305 — per
  audit-prompt section 9, "Image colors, photographs, gradients in raster
  assets" are out of scope. The inline `style={{ opacity: 0.15, … }}` is
  layout, not typography or color.
- Tests, configs, package files.

### House identity decision

Home is the entry page — it is not a single house's page. Per DESIGN.md →
Text foregrounds: "house colors do not cross page boundaries." But Home
shows references to every house (the skip-nav lists every route, the 3D
scene shows house-colored nav nodes via `housePalette()`).

**Lock**: every house pair is permitted as a text/color highlight WITHIN
its own banner or 3D node on Home (the OctahedronHero face/node treatment
is scene code, out of scope anyway). For Tailwind-utility text on Home
chrome (the skip-nav `<a>` labels, the protocol-section `<p>` paragraphs,
the search combobox), the page-level rule applies: text is
`text-foreground` (charcoal) or `text-background` (cream) only. No house
color is permitted as Home page chrome text.

If the impl agent finds a `text-house-*` utility on a Home-level chrome
element (not inside a house banner or scene), classify as NEAR → MIGRATE
to `text-foreground`/`text-background` per role.

---

## Format (locked 2026-06-08 with human, carried from FRAC-20)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5
(color), with the FRAC-20 clarifications:

- **`<file:line>` granularity:** opening JSX tag line of the element.
  Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6,
  body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the
  rendered state in `Current` and classify against the utility's intended
  spec. Drift between rendered and intended goes in the Rationale. (Same
  rule as Lab.)
- **Color row grouping:** by `(file + token)`. List every role the token
  serves in that file on the `Role:` line. Across files, repeat the row.
- **Pretext-rendered text:** as in Lab — record the inline px size in
  `Current`. Classification is GAP unless a future body-mono utility
  lands. **NOTE for Home:** Home/Hero does NOT call `PretextParagraph` at
  all. The Pretext-callsite worked-example row from Lab is not applicable
  here; the impl agent omits that example row. (The Lab gap entry
  already covers the sitewide pattern; Home does not need to re-log it.)

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20 PR)

- Text on this site is `text-foreground` (charcoal `#171717`) or
  `text-background` (cream `#f8f6f0`) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted
  as display/highlight text. **Home is not a house page** — house colors
  are NOT permitted as page-level chrome text. (See "House identity
  decision" above.)
- No raw `text-white`, `text-black`, `text-gray-*`, or non-canonical text
  colors anywhere. Any `text-foreground/<alpha>` is the canonical token
  with opacity — treat as canonical token use (the rule covers it; the
  opacity is presentation, not a different value), classify EXACT.

### Surface foreground pairing rule (NEW for FRAC-22, from DESIGN.md → Surface foreground pairing, codified by FRAC-42)

Every `bg-*` declaration must carry its paired `text-*` foreground on the
same node. Four canonical pairs:

| Surface | Pair |
|---|---|
| `bg-background` | `text-foreground` |
| `bg-foreground` | `text-background` |
| `bg-house-{slug}-light` | `text-house-{slug}-light-foreground` |
| `bg-house-{slug}-deep` | `text-house-{slug}-deep-foreground` |

Exemptions:

- Selection chrome (`selection:bg-foreground selection:text-background`)
  — paired-inverse states, not surface declarations.
- House display-use text colors on the house's own page surface — N/A
  for Home (no house surfaces here).

For Home, the pairing-check sites the impl agent must visit:

- `src/pages/Home.tsx:19` — `<main className="… bg-background text-foreground …">` already pairs correctly. EXACT row.
- `src/pages/Home.tsx:25` — `<section className="bg-background px-[4.5%] py-40 md:py-60">` declares `bg-background` but does NOT re-assert `text-foreground` on the same node. Per the pairing rule, this is a finding — classify NEAR → MIGRATE to add `text-foreground`. Rationale: rendering is correct today by cascade from `<main>`, but the rule is canonical now (FRAC-42), and a future nested surface or restructure would break it.
- `src/components/sections/Hero.tsx:120` — `<section className="relative min-h-screen … bg-background">` declares `bg-background` without re-asserting `text-foreground`. Same NEAR → MIGRATE finding as the protocol section.
- `src/components/sections/Hero.tsx:133` — `<ul className="… bg-background border border-foreground …">` declares `bg-background` without `text-foreground`. The skip-nav `<a>` children at Hero:143 inherit color from the page cascade. NEAR → MIGRATE: add `text-foreground` to the `<ul>`.
- `src/components/sections/Hero.tsx:194` — `<input className="… bg-background/90 backdrop-blur-sm … text-foreground/60 …">`. The input declares both a surface AND a text color on the same node — the pairing rule is satisfied. Classify EXACT for the pairing (separate rows handle the alpha-modified token values).
- `src/components/sections/Hero.tsx:240` — `<div id={listboxId} … className="… bg-background/95 backdrop-blur-sm border border-foreground/20 …">` declares `bg-background/95` without an explicit `text-foreground`. The descendant options at Hero:259–263 each re-declare `text-foreground/60` or `text-foreground` per state — pairing for the listbox container is NEAR → MIGRATE: add `text-foreground` to the `<div id={listboxId}>` for compositional safety.

Document the rule application clearly in the audit doc so the Apply PR's
reviewer can verify every `bg-*` site was checked.

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These are the canonical example rows for FRAC-22. The impl agent
reproduces them verbatim in the audit doc, then appends any further rows
it discovers walking the rest of `Home.tsx` and `Hero.tsx`. Selected to
cover: one EXACT no-op, one NEAR (chrome-utility-on-h-tag style drift OR
cascade-pairing migration), one GAP (closest equivalent to Lab's Pretext
case), one `(file + token)` color-grouping example, and the new
surface-foreground pairing example.

### Typography examples

```
Element: src/pages/Home.tsx:28 — <h2 className="text-display">A Golden<br />Age Protocol</h2>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). h2 wrapper's global italic+uppercase rule is overridden by .text-display's font-style:normal — net rendering matches the spec.
```

```
Element: src/pages/Home.tsx:35 — <div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}> (renders three <p> children at lines 36/76/90)
Current: family=JetBrains Mono, weight=100 (font-thin), style=normal (inline override), transform=uppercase, size=text-sm (mobile), text-base (md+), tracking=default, leading=relaxed
Nearest canonical utility: .text-eyebrow
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Chrome-tier rendering (JBM uppercase) but at body-passage length and md:text-base sizing. .text-eyebrow / .text-label / .text-meta are all single-size text-sm at weight 500 with tracking 0.1em — wrong weight (100 vs 500), wrong responsive size (text-sm→text-base vs flat text-sm), missing tracking, but matches family (JBM) and transform (uppercase) and serves the role of body prose in chrome key. No canonical body utility uses mono uppercase at weight 100. This is the closest equivalent to Lab's PretextParagraph GAP — Home's protocol paragraphs are body text rendered with chrome-tier vibe at a weight (100) the canonical scale does not declare. Logging.
```

```
Element: src/components/sections/Hero.tsx:133 — <ul className="flex flex-col gap-1 bg-background border border-foreground p-3 font-mono text-xs uppercase tracking-wider">
Current: family=JetBrains Mono, weight=400 (default), style=normal, transform=uppercase, size=text-xs, tracking=wider
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: .text-eyebrow is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on weight (400 vs 500), size (text-xs vs text-sm), tracking (wider≈0.05em vs 0.1em). Family and transform match. Skip-nav label list — semantic role (visually hidden chrome label set, popped on focus) is .text-eyebrow's "overline label" intent. Apply task migrates to .text-eyebrow on the <ul> (children inherit) or on each <a>. Color row covers bg-background/border-foreground separately.
```

```
Element: src/components/sections/Hero.tsx:194 — <input … placeholder="Explore Fractal..." className="… text-label text-foreground/60 …">
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-control
Match quality: NEAR
Action: MIGRATE
Rationale: The input currently uses .text-label, which the FRAC-51 typography spec explicitly calls out as a UX trap on typeable controls (uppercase forces typed text uppercase; text-sm = 14px triggers iOS zoom-on-focus). DESIGN.md → typography → Control tier introduced .text-control specifically for inputs: JBM weight 400 normal-case text-base. Migrate text-label → text-control. Drift between current and target is intentional (case + size correction). Color row covers text-foreground/60 + placeholder:text-foreground/60 separately. Mirror span at Hero:202 also carries text-label — same migration applies so the caret-width measurement stays accurate.
```

```
Element: src/components/sections/Hero.tsx:243 — <div className="text-meta text-foreground/60 text-center px-3 py-3">No results</div>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-meta
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-meta; typography is canonical. "No results" is inline metadata in the listbox empty state — .text-meta's semantic role matches. Color row covers text-foreground/60 separately.
```

### Color examples

```
Element: src/pages/Home.tsx:19 — <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
Current: bg-background (#f8f6f0), text-foreground (#171717), selection:bg-foreground, selection:text-background
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: background / foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All four utilities already on canonical tokens. Surface foreground pairing satisfied (bg-background + text-foreground on the same node, FRAC-42 rule). Selection chrome is paired-inverse and exempt from the pairing rule per audit-prompt section 5. No-op migration. Multiple roles collapse into one row by (file + token) grouping.
```

```
Element: src/pages/Home.tsx:25 — <section className="bg-background px-[4.5%] py-40 md:py-60">
Current: bg-background (#f8f6f0)
Role: background
Nearest canonical token: background (paired with text-foreground, currently absent on this node)
Match quality: NEAR
Action: MIGRATE
Rationale: Surface declaration bg-background is canonical. Per DESIGN.md → Surface foreground pairing (FRAC-42), every bg-* must carry its paired text-* foreground on the same node. This section declares bg-background but inherits text-foreground from <main> at line 19 via the cascade. Apply task: add text-foreground to the className. Rendering unchanged today; the rule is for compositional safety against future nested surfaces. Same NEAR-pairing pattern appears at Hero.tsx:120 (hero section), Hero.tsx:133 (skip-nav ul), Hero.tsx:240 (listbox container) — those are separate rows per (file + token) grouping.
```

```
Element: src/pages/Home.tsx:35,42,51,60,80 — text-foreground/80 on the protocol paragraphs wrapper (line 35) and hover:text-foreground on the inline link <a> elements (lines 42, 51, 60, 69, 80)
Current: text-foreground/80 (Tailwind alpha-modified canonical token), text-foreground (hover state)
Role: text (default) + text (hover)
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All sites on the canonical foreground token with Tailwind alpha modifier on the default state and full opacity on hover. Per project-wide text-color rule (DESIGN.md → Text foregrounds): text is foreground or background; alpha-modified is presentation, not a different value. Five sites collapse to one row by (file + token) grouping; Role line lists default + hover.
```

```
Element: src/components/sections/Hero.tsx:120 — <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background">
Current: bg-background (#f8f6f0)
Role: background
Nearest canonical token: background (paired with text-foreground, currently absent on this node)
Match quality: NEAR
Action: MIGRATE
Rationale: Same FRAC-42 pairing finding as Home.tsx:25 — bg-background without text-foreground on the same node. Apply task adds text-foreground. Hero is the page's first viewport; the cascade does carry text-foreground from Home.tsx:19's <main>, so rendering is correct today. Migration is for compositional safety.
```

```
Element: src/components/sections/Hero.tsx:143,163,194,221,243,259,261,262,272,278,289 — text-foreground variations (text-foreground/40, /60, /70, /80, plain text-foreground) across the skip-nav link, search icon, input, caret overlay, no-results message, listbox options, eyebrow group label, etc.
Current: text-foreground with Tailwind alpha modifiers (text-foreground/40, /60, /70, /80) and plain text-foreground
Role: text + icon-stroke + caret-fill + option-state + label
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Every site already on the canonical foreground token. Alpha modifiers are presentation, not a different value. Many sites collapse to one row by (file + token) grouping; Role line lists every role this token serves in Hero. No raw text-white, text-black, or text-gray-* anywhere in Hero.
```

### House identity worked-example row

```
Element: src/components/sections/Hero.tsx:133 — <ul className="… border border-foreground …"> within the keyboard skip-nav <nav>
Current: border-foreground (#171717)
Role: border
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Already on canonical foreground token. The skip-nav is Home page chrome, not a house surface — house-color borders would violate the house-identity decision (Home is the entry page; house colors do not cross page boundaries). foreground/charcoal is the correct chrome color. No-op migration.
```

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in `Home.tsx` and `Hero.tsx`. For each text-bearing
   element (including inline `<a>` and `<button>` not rendered through the
   `Button` component), write one typography row per section 4. For each
   distinct color use, write one color row per section 5 (grouped per the
   (file + token) rule).
2. **Mobile-first:** every responsive element lists both mobile and
   desktop renderings in `Current`. Single-viewport elements list just the
   one. Elements hidden at one viewport (e.g., `sr-only-focusable`, `hidden
   md:block`) flag in Rationale.
3. **Surface foreground pairing pass:** for every `bg-*` site in scope,
   check the same JSX node for the matching `text-*`. Missing pair → NEAR
   MIGRATE per FRAC-42 rule (rendering correct today by cascade, but the
   rule is canonical). See the pre-walked list in "Surface foreground
   pairing rule" above.
4. **House identity check:** verify no Home chrome element uses a
   `text-house-*` or `bg-house-*` utility. If found, classify NEAR →
   MIGRATE to `text-foreground` / `text-background` / `bg-background`
   per role.
5. Tie-breaking per audit-prompt section 6. The text-foreground rule
   (DESIGN.md, codified by FRAC-20 PR) makes most ad-hoc text-color
   findings NEAR rather than GAP.
6. Real GAPs (after rules applied) get appended to
   `.lattice/notes/audit-gaps.md` per section 7 AND copied into the
   audit doc's gap appendix per section 10.
7. The audit doc is the spec for FRAC-23 (Home Apply). Apply reads only
   this file.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/home-audit.md`** — the audit doc. Structure
   per audit-prompt section 10:
   - Page metadata block (slug=`home`, source=`src/pages/Home.tsx`,
     date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px)
   - In-scope/out-of-scope summary (mirror the lab-audit.md preamble
     format)
   - `## Typography audit` — all rows (worked examples above + any new
     rows the impl finds)
   - `## Color audit` — all rows
   - `## Forward observations (not GAPs under current rules)` — optional
   - `## Gap appendix` — copy of any GAP-LOG-AND-MIGRATE entries, or
     "No gaps." if none

2. **`.lattice/notes/audit-gaps.md`** — append-only. The "Golden Age
   Protocol" paragraph cluster (`Home.tsx:35`) is the likely candidate
   for a gap entry (mono uppercase at weight 100, no canonical fit).
   Other gaps the impl finds also append here.

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-22 is audit-only. The Home Apply task
  (FRAC-23) will execute migrations.
- `DESIGN.md` — FRAC-20 already added the Text foregrounds section.
  Surface foreground pairing was codified by FRAC-42. No further changes
  needed here.
- `.lattice/notes/audit-prompt.md` — FRAC-20 already tightened the
  playbook. If FRAC-22 surfaces a genuine new playbook gap, escalate
  via a `needs_human` lattice comment instead of editing.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`,
  `notes/.tmp/`, `notes/CR-FRAC-21-*.md`,
  `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at
  `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/home-audit.md` exists and follows the
      section-10 structure.
- [ ] Both in-scope files (`src/pages/Home.tsx`,
      `src/components/sections/Hero.tsx`) are represented by at least one
      typography row and at least one color row.
- [ ] Out-of-scope files are listed explicitly in the audit doc's
      preamble with the same exclusion rationale as this plan.
- [ ] Every typography row matches the section-4 format and the locked
      clarifications (file:line granularity, composite cascade,
      `<file:line>` opening-tag rule).
- [ ] Every color row matches the section-5 format and the (file + token)
      grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings
      under `Current`.
- [ ] Every `text-foreground/<alpha>` and `text-background/<alpha>`
      instance is classified EXACT under the project-wide text-color rule
      (alpha is presentation, not a different value).
- [ ] No `text-white`, `text-black`, `text-gray-*`, or raw `text-[…]`
      utilities are left unclassified. (Home does not currently use them,
      but the impl agent confirms by walking.)
- [ ] Every `bg-*` site listed in "Surface foreground pairing rule" above
      has a corresponding row classifying the pair: EXACT if the pair is
      present on the same node, NEAR → MIGRATE if it relies on cascade.
- [ ] The "Golden Age Protocol" paragraph cluster (`Home.tsx:35`) is
      classified GAP and appended to `audit-gaps.md` (or, if the impl
      finds a cleaner canonical fit on a re-walk, downgraded to NEAR
      with rationale).
- [ ] OctahedronHero and FractalCityScene are documented as excluded with
      the rationale from this plan's Scope section.
- [ ] The worked-example rows in this plan appear verbatim in the audit
      doc in the order presented, alongside any new rows the impl finds.
- [ ] Gap appendix in the audit doc mirrors the `audit-gaps.md` entries
      appended by this run, or says "No gaps." if none.
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes (FRAC-20 already tightened it).
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch
      (pre-existing failures on master — footer FRAC-88 italic, footer
      Jacquard, navigation mobile labels, neighborhood min-h-screen —
      are NOT regressions from this audit-only work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt section 10.
- Every in-scope file is represented by at least one row.
- Exclusion list is documented in the audit doc with rationale matching
  this plan (OctahedronHero, FractalCityScene, Skyline, FractalObject,
  shared chrome).
- The worked-example rows above appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag
  granularity, responsive element listing both renderings) are applied
  consistently across all rows.
- Project-wide text-color rule applied uniformly (every text-color
  finding maps to foreground/background or the page's own house pair —
  Home has no own-house pair, so all chrome text is foreground/background).
- Surface foreground pairing rule applied to every `bg-*` site in scope.
  Each pairing site has its own row, NEAR if relying on cascade, EXACT
  if pair is co-located.
- House identity decision honored: no `text-house-*` or `bg-house-*`
  utility on a Home chrome element is classified as MIGRATE-as-is.
  (Home has no such uses today; the rule is a guard against future
  drift.)
- `audit-gaps.md` carries only newly-added entries from this run,
  appended after the existing FRAC-20 Lab entry; no edits to prior
  entries.
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md`
  changes.
- Tests pass on the branch (modulo documented baseline failures).

If the review finds rework: implementation-level for row-format drift or
missed rows; plan-level only if a structural assumption above
(OctahedronHero exclusion, Hero scope boundary, surface-pairing
applicability) turns out wrong.
