# FRAC-28 — Audit New Liberal Arts page (typography + color)

**Task:** task_01KTJQF18KEMXAQJ51JBNKJS24
**Branch:** frac-28-audit-new-liberal-arts
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing)
**Mobile viewport baseline:** 375px

This is the **fourth** per-page audit executed under the FRAC-18/FRAC-19 playbook (Lab → Home → Campus → New Liberal Arts). FRAC-20 (Lab) codified the Text-foregrounds rule. FRAC-22 (Home) codified the FRAC-42 paired-foreground pass. FRAC-24 (Campus) was the first house-page precedent under the full rule set with all four sibling tokens declared together. New Liberal Arts is the **first INVERTED house page** to go through Audit→Apply: per DESIGN.md → "The forum/school page-bg inversion", Education (internal id `school`) uses `house-education-deep` (`#5C1010`) as the page background and `house-education-light` (`#B52828`) as the accent. The HouseBanner grid does NOT invert; the inversion is a per-page rule applied in `LiberalArtsPage.tsx` (audited here) and `PoliticalClubPage.tsx` (separate task).

The downstream FRAC-29 Apply task will declare all four sibling tokens together — `--color-house-education-light`, `--color-house-education-deep`, `--color-house-education-light-foreground`, `--color-house-education-deep-foreground` — in one `@theme inline` block (mirroring the FRAC-25 Campus pattern, the FRAC-21+FRAC-42 paired-from-day-one convention). That declaration is Apply-task work; this audit must classify every Education surface and text-use against the future tokens so FRAC-29 has a complete row-by-row migration spec.

The token slug prefix is `house-education-{light,deep}` (per DESIGN.md → House mapping; uses `displayName` slug, not internal `school` id). DO NOT cross the wires: tokens are `house-education-*`, never `house-school-*`.

No `audit-prompt.md` revisions are expected here. No `DESIGN.md` revisions. If a brand-new playbook gap appears during impl, escalate via a `needs_human` lattice comment instead of editing autonomously.

---

## Scope

### In scope (source of truth: LiberalArtsPage's import graph)

- `src/pages/LiberalArtsPage.tsx` — the page entry (17 lines). Owns the page-level `<main>` surface (line 8) including the raw-hex `#5C1010` background, the `text-white` className, and the inverted selection-chrome (`selection:bg-white selection:text-[#5C1010]`).
- `src/components/sections/LiberalArts.tsx` — the section body (~74 lines). Contains the single `<section>` with inline `color: "#fff"` (line 9), the SectorHeader call site (line 11) with a notable `#C41E20` color prop that does NOT match either canonical house-education palette value, four `PretextParagraph` calls with `text-white/90` classNames, one h3 with `text-subtitle`, one `text-display` paragraph, and two `<Button asChild>` calls (typography locked; only inline className overrides are in scope — and there are none beyond `max-w-xs w-full text-center` which is layout, not color/typography).

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#B52828" />` call site at `LiberalArtsPage.tsx:9` — explicitly excluded per FRAC-20 (Lab) precedent carried by FRAC-24 (Campus). The FractalPattern `color` prop is a shared decorative SVG fill; not audited. Document the exclusion in the audit doc preamble. The hex value at the call site (`#B52828`) is documented only as an excluded site.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audited as a separate task. **Note:** New Liberal Arts's call-site prop `color="#C41E20"` IS audited as part of `LiberalArts.tsx`.
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt section 4). The two `<Button asChild>` call sites at `LiberalArts.tsx:37,46` only carry layout classes (`max-w-xs w-full text-center`); no inline color/typography overrides to audit. Document this in the preamble.
- `src/components/pretext/PretextParagraph.tsx` internals — shared component. Its typography rendering pattern (JBM at TEXT_SIZES.lg inline px) IS audited at the call sites (LiberalArts.tsx:18-23, 29-34, 57-62, 63-68) per the audit-prompt section 4 Pretext rule, but the component code itself is not in scope. The Lab gap entry for the sitewide Pretext-mono-rendering pattern already exists; the impl agent folds this page's four call sites into a single typography row + Rationale referencing the Lab GAP.
- Tests, configs, package files.

### House identity decision (Education = `school`, slug `house-education-*`; INVERTED page)

New Liberal Arts IS a house page. Per DESIGN.md → House mapping, the internal id is `school` and the displayName is "Education"; the canonical token slug prefix is `house-education-{light,deep}` (uses displayName, not internal id). Do not introduce a `house-school-*` token (does not exist; would be a system-rule violation).

Per DESIGN.md → "The forum/school page-bg inversion":

- **`house-education-deep` (`#5C1010`) IS the page background** on `LiberalArtsPage.tsx:8`. This is the INVERTED arrangement (default for forum + school only). `house-education-light` (`#B52828`) is the accent.
- **`house-education-light` (`#B52828`) is the canonical accent** — for the SectorHeader letter color, "Education" eyebrow, the FractalPattern decorative fill, and any future accent chrome. (Education's accent role is filled by `{light}`, not `{deep}` as on other house pages.)
- **The HouseBanner grid does NOT invert** — it always uses `{light}` as the banner background per DESIGN.md → "The forum/school page-bg inversion". HouseBanner is shared chrome and out of scope here; the inversion is a LiberalArtsPage-level rule.
- **Education's `{light}` and `{deep}` ARE permitted** as text/highlight chrome on the New Liberal Arts page — Jacquard monogram letter, accent labels, focus rings, eyebrow text. Per DESIGN.md → Text foregrounds.
- **Other house colors are NOT permitted** as New Liberal Arts chrome text. (Cross-house leak check below; expected to find none.)
- **Cream (paired-foreground) is the editorial voice** on Education's saturated `{deep}` page bg. The FRAC-42 default for Education is that both `--color-house-education-light-foreground` and `--color-house-education-deep-foreground` will resolve to `var(--color-background)` (cream `#f8f6f0`) — declared by FRAC-29 Apply task in one `@theme inline` block alongside the surface siblings.

**CRITICAL INVERSION RULE for the auditor:**

Body voice on the page background is **cream via `text-house-education-deep-foreground`** — NOT via `text-house-education-light`. The `{light}` token (`#B52828`) is the saturated red ACCENT (used for the SectorHeader letter, "Education" eyebrow, FractalPattern decoration); it is **not** the body voice. The body voice resolves through the paired-foreground sibling, which is cream by default.

A row that proposes migrating `text-white` → `text-house-education-light` would be **wrong** under the inversion rule. The correct migration target is `text-house-education-deep-foreground` (paired foreground of the `{deep}` page surface).

For chrome accents that sit on the `{deep}` page surface (border tints, translucent fills serving as raised-cream-on-deep-red cards), the same paired-foreground token (`house-education-deep-foreground`, resolves to cream) is the canonical alpha-tint source.

### Locked rules for New Liberal Arts

- **Raw-hex bg `#5C1010` at `LiberalArtsPage.tsx:8`** → **EXACT MIGRATE to `bg-house-education-deep`** (mirrors Campus's `#2E6B4A` → `house-campus-light` precedent and Lab's `#E870A0` → `house-publications-light` precedent, with the inversion-specific twist that the target is `{deep}` not `{light}`).
- **`text-white` className at `LiberalArtsPage.tsx:8`** → **NEAR MIGRATE to `text-house-education-deep-foreground`** (paired-foreground; resolves to cream `#f8f6f0`; visual delta imperceptible vs `#ffffff`).
- **Inline `color: "#fff"` at `LiberalArts.tsx:9`** → **NEAR MIGRATE to `text-house-education-deep-foreground`** (re-assertion of cream voice on the section root — Apply task may keep or remove based on cascade preference; conservative keep).
- **`text-white/90` className at `LiberalArts.tsx:20, 31, 59, 65`** (four PretextParagraph children) → **NEAR MIGRATE to `text-house-education-deep-foreground/90`** (paired-foreground with alpha modifier).
- **SectorHeader prop `color="#C41E20"` at `LiberalArts.tsx:11`** → **NEAR MIGRATE to `house-education-light`** (`#B52828`). This is the most interesting finding on the page: the hex value `#C41E20` does NOT match either canonical Education palette value (`#B52828` light, `#5C1010` deep). It is closest to `house-education-light` in hue and luminance (both saturated reds in the ~580nm range, both around 30% lightness on the L channel) but differs in chroma. The Apply task migrates to `house-education-light` (the canonical accent role for an inverted page); the visual delta will be small but perceptible. Classified NEAR with a tightened Rationale flagging the value drift.
- **FractalPattern color="#B52828" at `LiberalArtsPage.tsx:9`** → **EXCLUDED** (FractalPattern out of scope per the FRAC-20 + FRAC-24 precedent). Documented only.
- **Selection chrome at `LiberalArtsPage.tsx:8`** — `selection:bg-white selection:text-[#5C1010]`. **Two findings on the selection chrome alone:**
  1. `selection:bg-white` is NOT canonical. The FRAC-42-codified selection chrome uses paired-inverse tokens (`selection:bg-foreground selection:text-background`). However, the inversion here is editorial: white background on a deep-red page on selection. The closest canonical pattern is `selection:bg-house-education-deep-foreground` (cream selection bg) + `selection:text-house-education-deep` (deep-red selection text) — matching the page's own `{deep}` palette. **NEAR MIGRATE** to `selection:bg-house-education-deep-foreground selection:text-house-education-deep`. Alternative: keep the FRAC-42 canonical `selection:bg-foreground selection:text-background` (charcoal-on-cream selection). The Apply task chooses; this audit recommends the house-palette variant to preserve the editorial inversion (cream-on-deep-red, not charcoal-on-cream) but defers the final mechanism. Document both options in the Rationale.
  2. `selection:text-[#5C1010]` is a raw-hex Tailwind arbitrary value. `#5C1010` = `house-education-deep` EXACT. Migrate to the token-driven utility `selection:text-house-education-deep`. EXACT on value, drift is mechanism.

### Inversion check (confirmed present, not a finding)

New Liberal Arts IS a forum/school inverted page (per DESIGN.md → The forum/school page-bg inversion). Source confirms:
- `LiberalArtsPage.tsx:8` page bg inline-styled to `#5C1010` = `house-education-deep` (inverted: `{deep}` not `{light}`).
- `LiberalArts.tsx:11` SectorHeader prop `color="#C41E20"` ≈ `house-education-light` (inverted accent role: `{light}` not `{deep}`).
- `LiberalArtsPage.tsx:9` FractalPattern color `#B52828` = `house-education-light` (consistent with inverted accent).

The audit doc records this as the expected INVERTED arrangement (not a finding — the inversion is canonical for school/forum pages). Finding the default arrangement (`{light}` page bg with `{deep}` accent) on this page would be a finding (but the source confirms the inversion is in place).

### Cross-house leak check

Walk for any `text-house-*` / `bg-house-*` / raw hex matching another house's palette in `LiberalArtsPage.tsx` or `LiberalArts.tsx`. Specifically check for:

- `#E870A0`, `#C44878` (Publications/Lab pinks)
- `#889460`, `#4A5A30` (Visit greens)
- `#D4857A`, `#C13B2A` (Events oranges)
- `#2E6B4A`, `#1A3A2E` (Campus greens)
- `#C83858`, `#6E1830` (Political Club pinks)

Expected: none. The audit doc records "no cross-house leaks found" so a reader can verify the check was performed.

---

## Format (locked 2026-06-08, carried from FRAC-20 + FRAC-22 + FRAC-24)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5 (color), with the FRAC-20 clarifications carried forward:

- **`<file:line>` granularity:** opening JSX tag line of the element. Multi-line elements: opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body, `.font-serif`, `[style*="Jacquard"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale.
- **Color row grouping:** by `(file + token)`. List every role the token serves in that file on the `Role:` line. Across files, repeat the row. New Liberal Arts is much smaller than Campus — most color rows will collapse cleanly.
- **Pretext-rendered text:** four PretextParagraph call sites in `LiberalArts.tsx` (lines 18-23, 29-34, 57-62, 63-68). Per audit-prompt section 4 Pretext rule, record the inline px size in `Current`; nearest fit is the closest body-tier utility regardless of family mismatch (Pretext uses FONTS.body = JetBrains Mono via TEXT_SIZES.lg = 15px; canonical body utilities are Inter). Classification is GAP-LOG-AND-MIGRATE, BUT the Lab gap entry at `audit-gaps.md:27-32` already covers the sitewide mono-Pretext pattern — the New Liberal Arts impl agent records ONE typography row covering all four sites with a Rationale that references the Lab GAP entry and does NOT re-log to `audit-gaps.md` (sitewide dedup already happened at the Lab audit). This mirrors the Campus audit's handling of the italic-aside cluster pattern.
- **Inline `<button>`:** none on this page. The two `<Button asChild>` sites (LiberalArts.tsx:37, 46) wrap `<a>` children; the Button component owns the typography.

### Project-wide text-color rule (from DESIGN.md → Text foregrounds, codified by FRAC-20)

- Text on this site is `text-foreground` (charcoal) or `text-background` (cream) by default.
- On a house's own page, that house's `{light, deep}` pair is permitted as display/highlight text. **Education's `{light}` (`#B52828`) is the accent on this inverted page** — permitted for SectorHeader letter, eyebrow, accent labels, focus rings. NOT for body voice.
- Body voice on `{deep}` page bg goes to the paired foreground token (`text-house-education-deep-foreground`, resolves to cream).
- No raw `text-white`, `text-black`, `text-gray-*`, `color: "#fff"` inline-style, or non-canonical text colors anywhere.

### Surface foreground pairing rule (DESIGN.md → Surface foreground pairing, codified by FRAC-42)

Every `bg-*` declaration must carry its paired `text-*` foreground on the same node. Four canonical pairs:

| Surface | Pair |
|---|---|
| `bg-background` | `text-foreground` |
| `bg-foreground` | `text-background` |
| `bg-house-{slug}-light` | `text-house-{slug}-light-foreground` |
| `bg-house-{slug}-deep` | `text-house-{slug}-deep-foreground` |

Exemptions (per audit-prompt section 5):
- Selection chrome (`selection:bg-foreground selection:text-background`) — paired-inverse states, not surface declarations. (Note: the inverted New Liberal Arts selection chrome `selection:bg-white selection:text-[#5C1010]` is ALSO a paired-inverse state — exempt from the surface-pairing check itself, but its mechanism still needs migration.)
- House display-use text colors on the house's own page surface — SectorHeader letter / "Education" eyebrow using the accent color is display/highlight chrome, exempt from the surface-pairing check.

**For New Liberal Arts, the pairing-check sites the impl agent must visit (pre-walked, very small page):**

- `src/pages/LiberalArtsPage.tsx:8` — `<main className="relative min-h-screen text-white selection:bg-white selection:text-[#5C1010]" style={{ backgroundColor: "#5C1010" }}>`. **Pairing analysis:**
  - The raw-hex bg `#5C1010` is the `{deep}` page surface. The `text-white` className on the same node IS the paired-foreground assertion (white as the body voice). **Migration:** raw-hex bg → `bg-house-education-deep` token utility (EXACT on value); `text-white` → `text-house-education-deep-foreground` token utility (NEAR; paired-foreground). Both migrations land on the SAME node — pairing is canonically satisfied after migration.
  - Selection chrome: see the locked rule above; two findings (mechanism on `selection:bg-white` and `selection:text-[#5C1010]`).

- `src/components/sections/LiberalArts.tsx:9` — `<section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden" style={{ color: "#fff" }}>`. **Re-asserts** the inline white-text color on the section root. No `bg-*` on this node (the cascade carries through from the parent `<main>` page surface). NEAR row: migrate to `text-house-education-deep-foreground` (or remove if the parent `<main>`'s migrated cascade is preferred — Apply task chooses). Conservative migration keeps the cascade explicit and immune to future restructure. Mirrors `Campus.tsx:185` precedent.

- `src/components/sections/LiberalArts.tsx:37,46` — `<Button asChild className="max-w-xs w-full text-center">`. The Button component owns typography and base color (per `buttonVariants`). The inline className override is layout-only (`max-w-xs w-full text-center`) — no color/typography to audit. Document this as the "no override" case in the audit-doc preamble; do not produce a typography or color row for these sites.

**Surface foreground pairing summary for this page:** only one true `bg-*` declaration (the page-level `<main>` at `LiberalArtsPage.tsx:8`), and it co-locates its pair (`text-white` → `text-house-education-deep-foreground` post-migration). The `<section>` at `LiberalArts.tsx:9` re-asserts the foreground without a `bg-*` (cascade-only). No PhotoPlaceholder, no nested card, no translucent button override on this page. The pairing pass for New Liberal Arts is structurally simpler than Campus.

---

## Worked-example rows (drafted at planner level; impl agent reproduces verbatim)

These canonical example rows for FRAC-28 cover one EXACT typography no-op, one NEAR typography (text-subtitle on h3), the Pretext-cluster typography row pointing at the Lab GAP, one display-tier row, the page-bg + paired-foreground color row (the FRAC-42 pattern under inversion), the section-root re-assertion row, the text-white/90 cluster (four sites collapse), the SectorHeader prop row (with the `#C41E20` ≠ `#B52828` value drift), the FractalPattern excluded row, and the selection-chrome migration row (the most interesting row on the page).

### Typography examples

```
Element: src/components/sections/LiberalArts.tsx:13 — <p className="text-display mb-4 md:mb-6 text-center">Tech, Entrepreneurship, Rhetoric, Civics</p>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). Hero display heading rendered as a <p> rather than an h-tag. Mirrors Campus's text-display "Fractal Campus" precedent.
```

```
Element: src/components/sections/LiberalArts.tsx:28 — <h3 className="text-subtitle mb-6 normal-case">Fractal U</h3>
Current: family=Fraunces, weight=300, style=normal (DRIFT — h3 global rule sets italic; .text-subtitle resets style=normal so the utility wins here), transform=none (normal-case override), size=text-xl (mobile), text-2xl (md+), tracking=0.04em
Nearest canonical utility: .text-subtitle
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-subtitle; typography is canonical. The h3 wrapper pulls italic + uppercase from the global rule, but .text-subtitle explicitly sets font-style:normal and the normal-case className overrides text-transform — net rendering matches the spec. Mirrors DocumentBadge.tsx:94 precedent from the Lab audit.
```

```
Element: src/components/sections/LiberalArts.tsx:18,29,57,63 — <PretextParagraph size={TEXT_SIZES.lg} className="text-white/90 mb-{8|6}"> rendered as inline-styled <p>/<div>
Current: family=JetBrains Mono (FONTS.body), weight=400 (PretextParagraph default; no font-light className), style=normal, transform=none, size=15px (TEXT_SIZES.lg, inline), tracking=default
Nearest canonical utility: .text-body-lead
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Body-tier rendering at custom 15px JBM. .text-body-lead is Inter text-lg weight 300 — wrong family AND wrong weight. .text-body is Inter text-base weight 400 — also wrong family. No canonical body utility uses mono. Same sitewide pattern as LabPage.tsx:58 — Pretext-driven sizing breaks the Tailwind size contract. Four sites in LiberalArts.tsx (lines 18, 29, 57, 63) collapse to one typography row by (file + utility) grouping. Sitewide gap entry already logged by Lab audit at audit-gaps.md:27-32 — NOT re-logged here per the sitewide-dedup rule (mirrors the Campus audit's handling of cross-file cluster patterns). Color rows handled separately for the text-white/90 classNames.
```

### Color examples

```
Element: src/pages/LiberalArtsPage.tsx:8 — <main className="relative min-h-screen text-white selection:bg-white selection:text-[#5C1010]" style={{ backgroundColor: "#5C1010" }}>
Current: backgroundColor: "#5C1010" (raw hex inline style), text-white (Tailwind utility), selection:bg-white (raw white selection bg), selection:text-[#5C1010] (raw hex Tailwind arbitrary value)
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: house-education-deep + house-education-deep-foreground (page chrome) ; house-education-deep-foreground + house-education-deep (inverted selection chrome)
Match quality: EXACT (#5C1010 → house-education-deep) ; NEAR (text-white → text-house-education-deep-foreground) ; NEAR (selection:bg-white → selection:bg-house-education-deep-foreground) ; EXACT (selection:text-[#5C1010] → selection:text-house-education-deep)
Action: MIGRATE
Rationale: Four migrations on a single node. (1) Raw-hex bg `#5C1010` matches house-education-deep exactly under the school/forum inversion rule (page bg is {deep}, not {light}). Drift is mechanism (inline style vs token-driven utility). Mirrors Lab/Campus precedent but on the {deep} sibling. (2) text-white is not a canonical text token; migrate to text-house-education-deep-foreground per the project-wide text-color rule (DESIGN.md → Text foregrounds) and the FRAC-42 surface-foreground pairing rule (the {deep} page surface's paired foreground sibling is cream by FRAC-29 default). Visual delta imperceptible (#ffffff vs #f8f6f0). (3) selection:bg-white is the inverted-selection editorial choice (cream selection on deep-red page rather than the canonical FRAC-42 charcoal-selection). Migrate to selection:bg-house-education-deep-foreground (token-driven cream). Alternative: switch to the FRAC-42 canonical selection:bg-foreground (charcoal selection) — but that breaks the editorial inversion; recommend keeping the cream-selection-on-deep-red treatment via the paired-foreground token. (4) selection:text-[#5C1010] is a raw-hex Tailwind arbitrary value. #5C1010 = house-education-deep EXACT. Migrate to selection:text-house-education-deep (token-driven utility). FRAC-29 Apply task declares all four house-education sibling tokens in @theme inline before performing these migrations. The page-level <main> pairing (bg-house-education-deep + text-house-education-deep-foreground co-located on the same node) is canonically satisfied after migration.
```

```
Element: src/components/sections/LiberalArts.tsx:9 — <section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden" style={{ color: "#fff" }}>
Current: color: "#fff" (raw white inline style)
Role: text (section default — re-asserts cream on the {deep} page bg from the parent <main>)
Nearest canonical token: house-education-deep-foreground
Match quality: NEAR
Action: MIGRATE
Rationale: Re-assertion of inline white color on the section root. Migrate to text-house-education-deep-foreground (or remove if the parent <main>'s migrated text-house-education-deep-foreground cascade is sufficient — Apply task chooses). Conservative migration keeps the cascade explicit and immune to future restructure. Mirrors Campus.tsx:185 precedent under the inversion rule.
```

```
Element: src/components/sections/LiberalArts.tsx:20,31,59,65 — text-white/90 on the four PretextParagraph children (the launch-date lede + the three Fractal U body paragraphs)
Current: text-white/90 (Tailwind alpha-modified raw white)
Role: text (body paragraphs on the inverted {deep} page surface)
Nearest canonical token: house-education-deep-foreground (paired-foreground; cream)
Match quality: NEAR
Action: MIGRATE
Rationale: Per project-wide text-color rule (DESIGN.md → Text foregrounds): text is foreground or background; on a house's own page surface, the paired foreground token applies. New Liberal Arts's page surface is house-education-deep (inverted), so its paired foreground is house-education-deep-foreground (resolves to cream per FRAC-42 default declared by FRAC-29 Apply). White is not a canonical token; visual delta imperceptible (#ffffff vs #f8f6f0). Four sites collapse to one row by (file + token) grouping. CRITICAL INVERSION NOTE: the migration target is house-education-DEEP-foreground (paired foreground of the {deep} page bg), NOT house-education-light (the saturated red accent). The {light} sibling is reserved for accent/display use (SectorHeader letter, eyebrow) and would render dark-red-on-deep-red — illegible. Apply task migrates text-white/90 → text-house-education-deep-foreground/90.
```

```
Element: src/components/sections/LiberalArts.tsx:11 — <SectorHeader letter="E" name="Education" color="#C41E20" />
Current: "#C41E20" (raw hex string prop)
Role: prop (consumed by SectorHeader as Jacquard-letter fill + "Education" eyebrow color)
Nearest canonical token: house-education-light (canonical accent for an inverted page; #B52828)
Match quality: NEAR
Action: MIGRATE
Rationale: The hex value #C41E20 does NOT match either canonical Education palette value (light=#B52828, deep=#5C1010). It is closest to house-education-light in hue and luminance (both saturated reds around the ~580nm range, both in the ~30% lightness band) but differs in chroma — #C41E20 is slightly more saturated red than #B52828. Under the inversion rule, the SectorHeader letter sits in the accent role, and the accent on an inverted page is {light}; so the canonical migration target is house-education-light. The Apply task migrates color="#C41E20" → a token-driven mechanism (CSS var on house-education-light, HOUSES[school].palette.light import, or the mechanism FRAC-29 Apply chooses). Visual delta will be small but perceptible — slightly less saturated red on the letter and eyebrow. NEAR (value drift) rather than EXACT (mechanism-only drift). House-light as a display/highlight color on the house's own inverted page is permitted under DESIGN.md → Text foregrounds. SectorHeader internals out of scope. This row is the standout finding on this page: every other color use migrates cleanly to a same-value token, while this one carries a real value shift.
```

```
Element: src/pages/LiberalArtsPage.tsx:9 — <FractalPattern color="#B52828" />
Current: "#B52828" (raw hex string prop)
Role: (excluded — FractalPattern is out of scope per the FRAC-20 + FRAC-24 exclusion precedent)
Nearest canonical token: house-education-light (would be the migration target if in scope)
Match quality: N/A (out of scope)
Action: EXCLUDED
Rationale: FractalPattern is a shared decorative SVG fill; the `color` prop is out of scope per FRAC-20 (Lab) precedent carried by FRAC-24 (Campus). Documented here only to enumerate every color use on the page; FRAC-29 Apply does NOT migrate this site. If a future audit task brings FractalPattern in scope, the value-level migration is `#B52828` → `house-education-light` (EXACT). The hex value is consistent with the canonical Education {light} accent — Education's source-of-truth `HOUSES[school].palette.light` per src/data/houses.ts:274. Listed for completeness, not migration.
```

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in `LiberalArtsPage.tsx` (17 lines, single render block) and `LiberalArts.tsx` (~74 lines, single section). For each text-bearing element, write one typography row per audit-prompt section 4. For each distinct color use, write one color row per section 5 (grouped per the `(file + token)` rule).
2. **Mobile-first:** every responsive element lists both mobile and desktop renderings in `Current`. The New Liberal Arts page has minimal responsive variation:
   - `text-display` (text-5xl md:text-7xl) on LiberalArts.tsx:13
   - `text-subtitle` (text-xl md:text-2xl) on LiberalArts.tsx:28
   - `mb-4 md:mb-6` on LiberalArts.tsx:13 (layout, not typography/color — ignore)
   - `pt-16 pb-24 md:pt-24` on LiberalArts.tsx:9 (layout, not typography/color — ignore)
   - `flex-col sm:flex-row` on LiberalArts.tsx:36 (layout, ignore)
   - `px-6 md:px-[4.5%]` on LiberalArts.tsx:10 (layout, ignore)
   Capture both renderings on the .text-display and .text-subtitle rows.
3. **Surface foreground pairing pass:** only one true `bg-*` site in scope (the page-level `<main>` at `LiberalArtsPage.tsx:8` with inline-style bg). The pairing is satisfied at the same node (text-white → text-house-education-deep-foreground co-located). Document the pass as performed; no additional pairing findings on this page.
4. **House identity check:** New Liberal Arts IS a house page on the INVERTED arrangement. `house-education-{light, deep}` permitted for display/highlight only. Body voice is the `{deep}`-paired-foreground (cream). Verify no other-house tokens / hex values appear.
5. **Cross-house leak check:** walk for any text-house-publications-*, bg-house-publications-*, raw `#E870A0`, `#C44878`, `#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#2E6B4A`, `#1A3A2E`, `#C83858`, `#6E1830` in New Liberal Arts's scope. Audit doc records "no cross-house leaks found".
6. **Tie-breaking** per audit-prompt section 6. The text-foreground rule (codified by FRAC-20) and the surface-foreground pairing rule (codified by FRAC-42) make most New Liberal Arts drift NEAR rather than GAP. The Pretext-mono-rendering pattern is the only GAP candidate; sitewide gap entry already logged by Lab audit — NOT re-logged here per sitewide-dedup rule. The `#C41E20` SectorHeader prop is the standout value-shift NEAR (the only row with a perceptible visual delta after migration).
7. **The audit doc is the spec for FRAC-29 (Apply).** Apply reads only this file. The Apply task's index.css edit (declaring `--color-house-education-light`, `--color-house-education-deep`, `--color-house-education-light-foreground`, `--color-house-education-deep-foreground` in `@theme inline`) is not audit work — but every color row in this audit names the future token explicitly so Apply has a row-by-row migration spec.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/new-liberal-arts-audit.md`** — the audit doc. Structure per audit-prompt section 10:
   - Page metadata block (slug=`new-liberal-arts`, source=`src/pages/LiberalArtsPage.tsx`, date=YYYY-MM-DD, spec snapshot reference, mobile baseline 375px, branch=`frac-28-audit-new-liberal-arts`)
   - In-scope / out-of-scope summary (mirror the campus-audit.md preamble; explicitly call out FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, PretextParagraph internals)
   - **House identity declaration:** Education IS the house (internal id `school`, slug prefix `house-education-*`), and the page IS INVERTED. State the inversion rule prominently in the preamble.
   - **Inversion check:** documented as performed, confirms the inverted arrangement is in place.
   - **Cross-house leak check:** documented as performed, confirms no leaks.
   - `## Typography audit` — all rows (worked examples above + any new rows the impl finds walking each section)
   - `## Color audit` — all rows
   - `## Forward observations (not GAPs under current rules)` — optional. Candidates: the `text-white/90` cluster reads slightly lighter than canonical cream (paired-foreground at /90 alpha is the migration target; this is correct per project rule but worth noting the editorial choice); the SectorHeader `#C41E20` value drift may motivate a small `house-education-accent` palette tweak conversation post-Apply, but not a GAP under current rules (NEAR cleanly resolves).
   - `## Gap appendix` — empty. The Pretext-mono-rendering pattern is covered by the existing Lab GAP entry; no new gap entries from this audit. State "No new gaps." with a one-line note pointing at the Lab entry (audit-gaps.md:27-32) for the Pretext cluster.

2. **`.lattice/notes/audit-gaps.md`** — append-only. **NO new entries from this audit.** The Pretext cluster is covered by the existing Lab entry (sitewide dedup rule). The impl agent should explicitly state this in the audit doc's Gap appendix to make the no-op decision auditable by the reviewer.

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-28 is audit-only. The New Liberal Arts Apply task (FRAC-29) will execute migrations including the `index.css` token declaration.
- `DESIGN.md` — no further changes needed here.
- `.lattice/notes/audit-prompt.md` — no playbook changes needed.
- Tests, configs, package files.
- Sibling agents' working files: `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, root-level `task_*.md` files, FRAC-40's task files at `task_01KTMC9W2DMVSY3ZYP2816ECRP.*`, and any other task's `.lattice/` files.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/new-liberal-arts-audit.md` exists and follows the section-10 structure.
- [ ] Both in-scope files (`src/pages/LiberalArtsPage.tsx`, `src/components/sections/LiberalArts.tsx`) are represented by at least one typography row and at least one color row.
- [ ] Out-of-scope files are listed explicitly in the audit doc's preamble with the same exclusion rationale as this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, PretextParagraph internals).
- [ ] **The INVERSION rule is documented prominently** in the audit doc's preamble: page bg = `{deep}` (`#5C1010` → `house-education-deep`), accent = `{light}` (`#B52828` → `house-education-light`), body voice = cream via `text-house-education-deep-foreground` (NOT `text-house-education-light`).
- [ ] Every typography row matches the section-4 format and the locked clarifications (file:line opening-tag granularity, composite cascade, family/weight/style/transform/size/tracking in `Current`).
- [ ] Every color row matches the section-5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings under `Current` (text-5xl md:text-7xl on text-display; text-xl md:text-2xl on text-subtitle).
- [ ] **No row proposes `text-house-education-light` as the body voice.** The body voice migration target is `text-house-education-deep-foreground` (paired-foreground of the {deep} page surface, resolves to cream). The {light} sibling is reserved for accent/display only.
- [ ] Raw `#5C1010` at `LiberalArtsPage.tsx:8` is classified **EXACT → MIGRATE to house-education-deep** (under the inversion rule — target is {deep}, not {light}).
- [ ] Raw `text-white` className at `LiberalArtsPage.tsx:8` is classified **NEAR → MIGRATE to text-house-education-deep-foreground**.
- [ ] Inline `color: "#fff"` at `LiberalArts.tsx:9` is classified **NEAR → MIGRATE to text-house-education-deep-foreground**.
- [ ] All four `text-white/90` at `LiberalArts.tsx:20,31,59,65` are classified **NEAR → MIGRATE to text-house-education-deep-foreground/90** (single grouped row).
- [ ] Raw `#C41E20` at `LiberalArts.tsx:11` SectorHeader prop is classified **NEAR → MIGRATE to house-education-light** (with Rationale calling out the value drift from `#C41E20` to `#B52828`).
- [ ] Raw `#B52828` at `LiberalArtsPage.tsx:9` FractalPattern prop is **DOCUMENTED AS EXCLUDED** in the audit doc preamble per the FRAC-20 + FRAC-24 precedent.
- [ ] Selection chrome at `LiberalArtsPage.tsx:8` (`selection:bg-white selection:text-[#5C1010]`) is captured in the page-level color row with two migration findings: (a) `selection:bg-white` → `selection:bg-house-education-deep-foreground` (NEAR, mechanism+token migration to preserve the editorial cream-on-deep-red inversion) and (b) `selection:text-[#5C1010]` → `selection:text-house-education-deep` (EXACT on value, drift is mechanism).
- [ ] PretextParagraph cluster (`LiberalArts.tsx:18-23,29-34,57-62,63-68`) is captured in a single typography row classified **GAP → GAP-LOG-AND-MIGRATE** with Rationale stating "sitewide gap entry already logged by Lab audit at audit-gaps.md:27-32 — NOT re-logged here per sitewide-dedup rule".
- [ ] Cross-house leak check is documented as performed (no other-house tokens / hex found in New Liberal Arts's scope).
- [ ] Inversion check is documented as performed (confirms inverted arrangement is in place — no inversion finding, this is the expected default for school/forum pages).
- [ ] The 7 worked-example rows above appear verbatim in the audit doc, in the order presented, alongside any new rows the impl finds.
- [ ] Gap appendix says "No new gaps." with a one-line pointer to the Lab GAP entry covering the sitewide Pretext-mono pattern. No new entries appended to `audit-gaps.md`.
- [ ] No `src/` files modified.
- [ ] No `DESIGN.md` changes.
- [ ] No `audit-prompt.md` changes.
- [ ] `pnpm typecheck && pnpm test` baseline-only on the branch (pre-existing failures on master are NOT regressions from this audit-only work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches audit-prompt section 10.
- Every in-scope file (`LiberalArtsPage.tsx`, `LiberalArts.tsx`) is represented by at least one typography row and at least one color row.
- Exclusion list is documented in the audit doc with rationale matching this plan (FractalPattern, Navbar/Footer/FadeIn/MandelbrotIcon, SectorHeader internals, Button component, PretextParagraph internals).
- **The INVERSION rule is documented prominently** in the audit doc's preamble.
- The 7 worked-example rows above appear verbatim, in the same order.
- Format rules (composite cascade, color grouping, file:line opening-tag granularity, responsive element listing both renderings) are applied consistently across all rows.
- **No row proposes `text-house-education-light` as the body voice.** This is the most important inversion-rule check: confirm every `text-white` / `color: "#fff"` migration targets `text-house-education-deep-foreground`, NOT `text-house-education-light`.
- Project-wide text-color rule applied uniformly (every text-color finding maps to foreground/background or Education's own house-education-{light, deep, light-foreground, deep-foreground} pair).
- Surface foreground pairing rule applied: the single `bg-*` site at LiberalArtsPage.tsx:8 has its pair co-located (post-migration). Section root re-assertion at LiberalArts.tsx:9 is a NEAR re-declaration, not a missing-pair finding.
- House identity decision honored: `text-house-education-*` and `bg-house-education-*` future tokens are the only house tokens named in New Liberal Arts's audit doc. No cross-house leaks classified as MIGRATE-as-is. No `house-school-*` tokens proposed (wrong slug — would be a system-rule violation).
- The raw-hex page bg + raw-hex SectorHeader prop pattern is mirrored under the INVERSION twist: page bg → `{deep}` (not `{light}` as on Lab/Campus); accent prop → `{light}` (with the `#C41E20` value drift flagged).
- `audit-gaps.md` is NOT modified — the sitewide Pretext gap is covered by the existing Lab entry.
- No `src/` changes, no `DESIGN.md` changes, no `audit-prompt.md` changes.
- Tests pass on the branch (modulo documented baseline failures).

If the review finds rework: implementation-level for row-format drift, missed rows, or any wrong-direction migration targets (e.g., body voice migrated to `text-house-education-light` instead of `-deep-foreground`); plan-level only if a structural assumption above (FractalPattern exclusion, scope boundary, inversion rule applicability, Pretext sitewide-dedup decision, SectorHeader prop value-drift classification) turns out wrong.

---

## Open questions to escalate

None blocking. The New Liberal Arts page's surface pattern is the inverted-house precedent — the first audit to land under the school/forum inversion rule. The structural pattern is otherwise identical to Campus (raw-hex page bg, raw-white body voice, raw-hex SectorHeader prop) with one notable twist: the SectorHeader prop value `#C41E20` does not match either canonical Education palette value, suggesting the page was originally authored before the palette was locked in `houses.ts`. The Apply task will resolve this by migrating to `house-education-light` (`#B52828`), absorbing a small visual delta. If the human prefers to keep `#C41E20` as the accent, that becomes a `house-education-accent` palette addition discussion — out of scope here, recorded as a forward observation.

The Pretext-mono-rendering pattern is the only GAP candidate, and the sitewide entry is already in place from Lab. The italic-aside cluster pattern (which dominated the Campus audit gap entry) does NOT appear on this page — no italic body asides in `LiberalArts.tsx`. FRAC-47 has since resolved that cluster via `.text-aside`, so even if a future revision of this page adds italic asides, the canonical home is available.
