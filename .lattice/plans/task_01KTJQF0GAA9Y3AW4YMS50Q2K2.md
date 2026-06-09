# FRAC-24 — Audit Campus page (typography + color)

**Task:** task_01KTJQF0GAA9Y3AW4YMS50Q2K2
**Branch:** frac-24-audit-campus
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR)
**Mobile viewport baseline:** 375px

This is the **third** per-page audit executed under the FRAC-18/FRAC-19 playbook. FRAC-20 (Lab) was the first and is the worked example; FRAC-22 (Home) was the second and codified the FRAC-42 surface-foreground pairing pass for Apply tasks at scale. Campus is the **first house page** to go through Audit→Apply since Lab. Unlike Lab — which only saw the half-codified FRAC-21 token landing — the Campus Apply task (FRAC-25) will declare all four sibling tokens together (`--color-house-campus-light`, `--color-house-campus-deep`, `--color-house-campus-light-foreground`, `--color-house-campus-deep-foreground`) in one `@theme inline` block. That declaration is Apply-task work; this audit must classify every Campus surface and text-use against the future tokens so FRAC-25 has a complete row-by-row migration spec.

No `audit-prompt.md` revisions are expected here (FRAC-20 already tightened it). No `DESIGN.md` revisions (FRAC-20 codified Text foregrounds; FRAC-42 codified Surface foreground pairing). If a brand-new playbook gap appears during impl, escalate via a `needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: CampusPage's import graph)

- `src/pages/CampusPage.tsx` — the page entry (17 lines). Owns the page-level `<main>` surface (line 8) including the raw-hex `#2E6B4A` background and the raw-white inline text color.
- `src/components/sections/Campus.tsx` — the section body (~610 lines). The bulk of the audit. Contains all narrative paragraphs, headings, inline `<a>` (`InlineLink`), the `<SectorHeader>` call site, the `PrimaryButton`/`PhotoPlaceholder` helpers, the team-bios block, the McCarren Park blockquote, the events list, the amenities list.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#1A3A2E" />` call site at `CampusPage.tsx:9` — explicitly excluded per FRAC-20 (Lab) precedent. The FractalPattern color prop is a shared decorative SVG fill; do not audit. Document the exclusion in the audit doc preamble.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audit as a separate task. **Note:** Campus's call-site prop `color="#1A3A2E"` IS audited as part of `Campus.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt section 4). `<PrimaryButton>` wraps `<Button asChild>`, so the Button typography is owned by the component; **only** the inline `bg-black/20 hover:bg-black/30 text-center` className override at `Campus.tsx:161` is in scope (color audit row), and the wrapping `<a>` child (`Campus.tsx:163`) carries no extra Tailwind classes of its own.
- Tests, configs, package files.

### House identity decision (Campus = `campus`; NOT `school`)

Campus IS a house page. Per DESIGN.md → Text foregrounds, the house's `{light, deep}` pair is permitted as text color for display headings and highlight chrome on its own page. Per DESIGN.md → House mapping, Campus's internal id is `campus` (slug prefix `house-campus-{light,deep}`) — distinct from `school` (internal id `school`, displayName `Education`, slug prefix `house-education-{light,deep}`). Do not cross the wires.

Lock the rule for Campus:

- **`house-campus-light` (`#2E6B4A`) IS the page background** (default arrangement, not the forum/school inversion). `house-campus-deep` (`#1A3A2E`) is the accent (SectorHeader letter, accent borders).
- **Campus's `{light}` and `{deep}` ARE permitted** as text/highlight chrome on Campus pages — eyebrow text, focus rings, accent labels, display monogram letters. The SectorHeader letter and "Campus" eyebrow at `Campus.tsx:190` are display/highlight uses of `house-campus-deep`.
- **Other house colors (`house-publications-*`, `house-events-*`, `house-visit-*`, `house-education-*`, `house-political-club-*`) are NOT permitted** as Campus chrome text. The impl agent should walk for cross-house leaks; Campus today has none (no other-house-colored text classes appear in the source).
- **Cream (`text-background`) is the editorial voice** on Campus's saturated forest-green surfaces (both `{light}` page bg and any nested `{deep}` highlight surface). The FRAC-42 default for Campus is that both `--color-house-campus-light-foreground` and `--color-house-campus-deep-foreground` will resolve to `var(--color-background)` (same as Publications) — declared by FRAC-25.
- **Charcoal (`text-foreground`) is the body voice** on any cream-`bg-background` surface nested inside Campus (e.g., a future card on the green page). Campus today has no such nested cream surface.
- **Any raw `text-white` or inline `color: "#fff"`** on a Campus saturated bg → **NEAR MIGRATE** to `text-house-campus-light-foreground` (or `text-house-campus-deep-foreground` if the immediate surface is `{deep}`). Visual delta imperceptible (`#ffffff` vs `#f8f6f0`). This is the Lab text-white precedent extended to Campus's paired-foreground token.
- **Any `text-white/<alpha>` variant** (`/40`, `/50`, `/60`, `/70`, `/80`, `/90`) → **NEAR MIGRATE** to `text-house-campus-light-foreground/<alpha>` (paired-foreground with alpha modifier). The alpha is presentation, the token is what matters.
- **`decoration-white/40` and `decoration-white`** on inline links (`Campus.tsx:25,273`) → **NEAR MIGRATE** to `decoration-house-campus-light-foreground/<alpha>` and `decoration-house-campus-light-foreground` (decoration role uses the same paired-foreground token; same NEAR pattern).

---

## Format (locked 2026-06-08 with human, carried from FRAC-20 + FRAC-22)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5 (color), with the FRAC-20 clarifications carried forward by FRAC-22:

- **`<file:line>` granularity:** opening JSX tag line of the element. Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale. (Same rule as Lab and Home.)
- **Color row grouping:** by `(file + token)`. List every role the token serves in that file on the `Role:` line. Across files, repeat the row. Campus will have a very dense `Campus.tsx` row for the `house-campus-light-foreground` token (default text on every paragraph cluster).
- **Pretext-rendered text:** N/A for Campus. Campus does NOT call `PretextParagraph` anywhere. The Pretext-callsite worked-example row from Lab is not applicable here; the impl agent omits it. The Lab gap entry already covers the sitewide pattern; Campus does not need to re-log it.
- **Inline `<a>` and `<button>`:** Campus's `InlineLink` (`Campus.tsx:27–44`) is a raw `<a>` with ad-hoc Tailwind utilities, IN SCOPE. `PrimaryButton` wraps `<Button asChild>` so its typography is locked; only its inline `className` override (`bg-black/20 hover:bg-black/30 text-center`) is in scope for the color audit.

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20 PR)

- Text on this site is `text-foreground` (charcoal `#171717`) or `text-background` (cream `#f8f6f0`) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted as display/highlight text. **Campus IS a house page** — `house-campus-{light, deep}` IS permitted on Campus, but as display/highlight text only (SectorHeader letter, eyebrow). Body copy on Campus's saturated `{light}` page background goes to the paired foreground token (`text-house-campus-light-foreground`), which resolves to cream.
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
- House display-use text colors on the house's own page surface — Campus SectorHeader letter / "Campus" eyebrow using `#1A3A2E` is display/highlight chrome, exempt from the surface-pairing check.

**For Campus, the pairing-check sites the impl agent must visit (pre-walked):**

- `src/pages/CampusPage.tsx:8` — `<main className="… selection:bg-foreground selection:text-background" style={{ backgroundColor: "#2E6B4A", color: "#fff" }}>`. **Two findings on the same node:**
  1. **Raw-hex bg** `#2E6B4A` → migrate to `bg-house-campus-light` token utility (paralleling LabPage:16's `#E870A0` → `house-publications-light`). EXACT on value; drift is mechanism (raw-hex inline `style` instead of a token-driven Tailwind utility).
  2. **Inline `color: "#fff"`** → migrate to `text-house-campus-light-foreground`. NEAR (paired-foreground migration; visual delta imperceptible).
  Combine into a single color-audit row (same file:line, joined `Role: background + text (page default)`), per audit-prompt section 5 `(file + token)` grouping where two related migrations land on the same node — write as one row with explicit dual-role and dual-rationale. The selection chrome (`selection:bg-foreground selection:text-background`) gets its own EXACT row (paired-inverse, FRAC-42 exempt).

- `src/components/sections/Campus.tsx:185` — `<section id="campus" style={{ color: "#fff" }}>`. **Re-asserts** the inline white-text color — needs migration to `text-house-campus-light-foreground` (or removal once the page-level `<main>` carries the token, but conservatively migrate to keep the cascade explicit). NEAR row.

- `src/components/sections/Campus.tsx:173` — `<div className="aspect-[4/5] md:aspect-square w-full bg-white/5 border border-white/10 …">` — PhotoPlaceholder body. **Two findings:**
  1. `bg-white/5` — raw white surface utility; not a canonical token. Resolve to `bg-house-campus-light-foreground/5` (paired-foreground token used as a translucent fill on top of the page's `{light}` surface — the same cream value, just slightly raised). NEAR. Document that `bg-house-campus-light-foreground` exists for surface-as-text-color symmetry, and a 5% alpha tint of cream is the canonical way to render the "lightly raised cream-tinted card on green" effect on Campus.
  2. `border-white/10` — raw white border; migrate to `border-house-campus-light-foreground/10`. NEAR.
  Pairing check: there is no `text-*` on this `<div>` itself; the child `<span>` at line 174 and the sibling `<p>` at line 176 each declare their own `text-white/<alpha>` (covered below). NEAR for missing pair on the `<div>` — apply task adds `text-house-campus-light-foreground` to the `<div>` even though its only direct text child is the span at line 174.

- `src/components/sections/Campus.tsx:161` — `<Button … className={cn(widthClass, "bg-black/20 hover:bg-black/30 text-center", …)}>`. The Button component is excluded for typography, but its inline className override is in scope for color. `bg-black/20` and `bg-black/30` are raw-black surface utilities — not canonical. Resolve to `bg-foreground/20` and `bg-foreground/30` (charcoal token with alpha modifier; same `#171717` value, canonical mechanism). NEAR row. Pairing check: the Button's own base styles handle the foreground text color (`text-current` cascade from the parent `<a>` which inherits from `<main>`). Per FRAC-42 the `bg-foreground/<alpha>` translucent surface on a parent `text-house-campus-light-foreground` is paired-by-context — selection-chrome-style exemption: a translucent charcoal overlay rendering over a `{light}` surface with cream text reads correctly. Document as the rule edge case. NEAR migrate; no separate pairing finding.

- `src/components/layout/SectorHeader.tsx:9` — Campus's call-site prop `color="#1A3A2E"` is the only direct color use from Campus into SectorHeader's audit-internal surface. Migrate to `var(--color-house-campus-deep)` (or `HOUSES.find(h => h.id==="campus")!.palette.deep` if Apply chooses the runtime-data-model mechanism). EXACT on value, drift is mechanism. (Parallels LabPage:24 SectorHeader prop.)

### Inversion check

Campus is NOT a forum/school inverted page (per DESIGN.md → The forum/school page-bg inversion). Campus uses `{light}` as the page bg (`#2E6B4A`) and `{deep}` as the accent (`#1A3A2E`). The audit doc records this as the expected default arrangement; finding the inverted arrangement on Campus would itself be a finding (but the source confirms default is in place — no inversion finding).

### Cross-house leak check

Walk for any `text-house-*` / `bg-house-*` / raw hex matching another house's palette in `CampusPage.tsx` or `Campus.tsx`. Campus today has none — but the audit doc records "no cross-house leaks found" so a reader can verify the check was performed.

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These canonical example rows for FRAC-24 cover one EXACT no-op, one NEAR (text-white-on-Campus-bg → paired-foreground migration), one NEAR (chrome utility drift), one closest-to-GAP equivalent for Campus (italic asides), one `(file + token)` color-grouping example, one FRAC-42 raw-hex-bg-with-paired-foreground row, and one SectorHeader prop row. The impl agent reproduces them verbatim in the audit doc, then appends any further rows it discovers.

### Typography examples

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

### Color examples

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

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in `CampusPage.tsx` (17 lines, single render block) and `Campus.tsx` (~610 lines, 14 narrative sub-sections). For each text-bearing element (including inline `<a>` via `InlineLink` and the inline `<button>`-via-asChild PrimaryButton wrapper, but excluding the Button component's own text rendering), write one typography row per audit-prompt section 4. For each distinct color use, write one color row per section 5 (grouped per the `(file + token)` rule).
2. **Mobile-first:** every responsive element lists both mobile and desktop renderings in `Current`. Campus is heavily responsive (every body paragraph has `text-sm md:text-base`; the address has `text-lg md:text-xl`; the blockquote has `text-lg md:text-xl`; photo captions have `text-xs md:text-sm`). Capture both renderings on every row.
3. **Surface foreground pairing pass:** for every `bg-*` site in scope (the pre-walked list above is exhaustive: `CampusPage.tsx:8` raw-hex bg, `Campus.tsx:161` bg-black/20 PrimaryButton override, `Campus.tsx:173` bg-white/5 PhotoPlaceholder), check the same JSX node for the matching `text-*`. Missing pair → NEAR MIGRATE per FRAC-42 rule.
4. **House identity check:** Campus IS a house page; `house-campus-{light, deep}` permitted for display/highlight only. Verify no other-house tokens / hex values appear (Campus has none — confirm by walking). The SectorHeader letter color `#1A3A2E` → `house-campus-deep` is the canonical display-highlight use.
5. **Cross-house leak check:** walk for any text-house-publications-*, bg-house-publications-*, raw `#E870A0`, `#C44878`, `#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#B52828`, `#5C1010`, `#C83858`, `#6E1830` in Campus's scope. Audit doc records "no cross-house leaks found" so a reader can verify the check was performed.
6. **Tie-breaking** per audit-prompt section 6. The text-foreground rule (DESIGN.md, codified by FRAC-20) and the surface-foreground pairing rule (DESIGN.md, codified by FRAC-42) make most Campus drift NEAR rather than GAP. The italic-aside cluster is the realistic GAP candidate; gap-log once for the whole cluster.
7. Real GAPs (after rules applied) get appended to `.lattice/notes/audit-gaps.md` per section 7 AND copied into the audit doc's gap appendix per section 10. Note: the existing `audit-gaps.md` lives on `frac-22-audit-home` / `frac-23-apply-home` and is not on master — the impl agent will create/append on the `frac-24-audit-campus` branch and surface the branch-ordering note in the audit doc (rebase merging upstream will fold the Lab entry above the Campus entries).
8. The audit doc is the spec for FRAC-25 (Campus Apply). Apply reads only this file. The Apply task's index.css edit (declaring `--color-house-campus-light`, `--color-house-campus-deep`, `--color-house-campus-light-foreground`, `--color-house-campus-deep-foreground` in `@theme inline`) is not audit work — but every color row in this audit names the future token explicitly so Apply has a row-by-row migration spec.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/campus-audit.md`** — the audit doc. Structure per audit-prompt section 10:
   - Page metadata block (slug=`campus`, source=`src/pages/CampusPage.tsx`, date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px)
   - In-scope / out-of-scope summary (mirror the lab-audit.md and home-audit-plan preamble format; explicitly call out FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component)
   - `## Typography audit` — all rows (worked examples above + any new rows the impl finds walking each narrative sub-section)
   - `## Color audit` — all rows
   - `## Forward observations (not GAPs under current rules)` — optional. Candidates: the `text-sm md:text-base` body-paragraph cluster reads slightly smaller than `.text-body` (canonical text-base at mobile), same pattern Lab flagged as a forward observation; the dense italic-aside cluster could motivate a future italic-body-aside utility tier.
   - `## Gap appendix` — copy of the italic-aside GAP entry, or "No gaps." if the impl re-walks and finds canonical fits.

2. **`.lattice/notes/audit-gaps.md`** — append-only. The italic-aside cluster (`Campus.tsx:218` and siblings at 367, 419, 453, 503, 532, 570) is the likely candidate for a gap entry. Other gaps the impl finds also append here. Note: the file exists upstream on `frac-22-audit-home` / `frac-23-apply-home` but not on master — impl agent creates a new file on the `frac-24-audit-campus` branch and the merge sequence will resolve.

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-24 is audit-only. The Campus Apply task (FRAC-25) will execute migrations including the `index.css` token declaration.
- `DESIGN.md` — FRAC-20 already added the Text foregrounds section. FRAC-42 already added the Surface foreground pairing section. No further changes needed here.
- `.lattice/notes/audit-prompt.md` — FRAC-20 already tightened the playbook. If FRAC-24 surfaces a genuine new playbook gap, escalate via a `needs_human` lattice comment instead of editing.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/campus-audit.md` exists and follows the section-10 structure.
- [ ] Both in-scope files (`src/pages/CampusPage.tsx`, `src/components/sections/Campus.tsx`) are represented by at least one typography row and at least one color row.
- [ ] Out-of-scope files are listed explicitly in the audit doc's preamble with the same exclusion rationale as this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component).
- [ ] Every typography row matches the section-4 format and the locked clarifications (file:line opening-tag granularity, composite cascade, family/weight/style/transform/size/tracking in `Current`).
- [ ] Every color row matches the section-5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings under `Current` (text-sm md:text-base, text-xs md:text-sm, text-lg md:text-xl, text-2xl md:text-3xl, etc.).
- [ ] Every `text-foreground/<alpha>` / `text-background/<alpha>` instance (if any appear) is classified EXACT under the alpha-is-presentation rule.
- [ ] Every `text-white`, `text-white/<n>`, `decoration-white/<n>`, raw `#fff` inline-style is classified **NEAR → MIGRATE to text-house-campus-light-foreground** (or decoration-/border- variant at the same alpha), per the Campus house-identity rule. No text-white instances classified GAP.
- [ ] Raw `#2E6B4A` at `CampusPage.tsx:8` is classified **EXACT → MIGRATE to house-campus-light** (mirrors Lab's `#E870A0` → `house-publications-light` precedent).
- [ ] Raw `#1A3A2E` at `Campus.tsx:190` SectorHeader prop is classified **EXACT → MIGRATE to house-campus-deep** (mirrors Lab's `#C44878` SectorHeader prop precedent).
- [ ] Raw `#1A3A2E` at `CampusPage.tsx:9` FractalPattern prop is **DOCUMENTED AS EXCLUDED** in the audit doc preamble per the FRAC-20 precedent (FractalPattern out of scope entirely).
- [ ] `bg-black/20` and `hover:bg-black/30` at `Campus.tsx:161` are classified **NEAR → MIGRATE to bg-foreground/20 / hover:bg-foreground/30** with Rationale documenting the translucent-charcoal-on-{light}-page composite as a FRAC-42 exempt edge case.
- [ ] `bg-white/5` and `border-white/10` at `Campus.tsx:173` PhotoPlaceholder are classified **NEAR → MIGRATE to bg-house-campus-light-foreground/5 / border-house-campus-light-foreground/10** with an added `text-house-campus-light-foreground` on the same `<div>` per FRAC-42 pairing.
- [ ] `border-white/30` at `Campus.tsx:499` blockquote is classified **NEAR → MIGRATE to border-house-campus-light-foreground/30**.
- [ ] The italic-aside cluster (`Campus.tsx:218,367,419,453,503,532,570`) is classified **GAP → GAP-LOG-AND-MIGRATE** with one consolidated gap entry covering the cluster.
- [ ] Cross-house leak check is documented as performed (no other-house tokens / hex found in Campus's scope).
- [ ] Inversion check is documented as performed (Campus uses {light} as page bg per the default arrangement — no inversion finding).
- [ ] The 7 worked-example rows above appear verbatim in the audit doc, in the order presented, alongside any new rows the impl finds.
- [ ] Gap appendix in the audit doc mirrors the `audit-gaps.md` entries appended by this run, or says "No gaps." if none.
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes.
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch (pre-existing failures on master — footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood min-h-screen — are NOT regressions from this audit-only work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt section 10.
- Every in-scope file (`CampusPage.tsx`, `Campus.tsx`) is represented by at least one typography row and at least one color row.
- Exclusion list is documented in the audit doc with rationale matching this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component typography).
- The 7 worked-example rows above appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag granularity, responsive element listing both renderings) are applied consistently across all rows.
- Project-wide text-color rule applied uniformly (every text-color finding maps to foreground/background or Campus's own house-campus-{light, deep, light-foreground, deep-foreground} pair).
- Surface foreground pairing rule applied to every `bg-*` site in scope. Each pairing site has its own row, NEAR if relying on cascade or with the pair absent, EXACT if pair is co-located.
- House identity decision honored: `text-house-campus-*` and `bg-house-campus-*` future tokens are the only house tokens named in Campus's audit doc. No cross-house leaks classified as MIGRATE-as-is.
- The raw-hex page bg + raw-hex SectorHeader prop pattern from FRAC-20 (Lab) is mirrored in the Campus rows: same EXACT-on-value classification, same Apply-task-declares-then-migrates expectation, with the FRAC-42 paired-foreground extension explicit.
- `audit-gaps.md` carries only newly-added entries from this run, appended after the existing FRAC-20 Lab + FRAC-22 Home entries (or if Home entries don't appear due to branch ordering, the impl agent documents the ordering note in the audit doc).
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md` changes.
- Tests pass on the branch (modulo documented baseline failures).

If the review finds rework: implementation-level for row-format drift or missed rows; plan-level only if a structural assumption above (FractalPattern exclusion, scope boundary, surface-pairing applicability, italic-aside GAP classification) turns out wrong.

---

## Open questions to escalate

None blocking. The Campus page's surface pattern (saturated `{light}` page bg, raw-hex implementation pre-token-declaration, inline white text everywhere) is the exact Lab precedent — the only material difference is that FRAC-25 Apply will declare four sibling tokens (light, deep, light-foreground, deep-foreground) in one block versus Lab's FRAC-21 PR which landed only two (FRAC-42 added the foreground siblings to the canonical pair). The audit follows the Lab structure with the FRAC-42 paired-foreground extension applied. The italic-aside cluster is the closest-to-GAP pattern and gets logged once.
