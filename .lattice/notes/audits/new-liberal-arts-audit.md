# New Liberal Arts page — typography + color audit

## Page

- Page slug: new-liberal-arts
- Source: `src/pages/LiberalArtsPage.tsx`, `src/components/sections/LiberalArts.tsx`
- Date: 2026-06-09
- Spec snapshot: `.lattice/notes/audit-prompt.md` (FRAC-19 author date 2026-06-08, tightened in FRAC-20 PR; FRAC-42 codified Surface foreground pairing; FRAC-24 first house-page precedent under the full rule set with paired-from-day-one tokens)
- Mobile viewport baseline: 375px
- Branch: `frac-28-audit-new-liberal-arts` (off master)

## Scope

### In scope (source of truth: LiberalArtsPage's import graph)

- `src/pages/LiberalArtsPage.tsx` — the page entry (17 lines). Owns the page-level `<main>` surface (line 8) including the raw-hex `#5C1010` background (the `{deep}` page surface under the school/forum inversion), the `text-white` className (body voice), and the inverted selection chrome (`selection:bg-white selection:text-[#5C1010]`).
- `src/components/sections/LiberalArts.tsx` — the section body (~74 lines). Contains the single `<section>` with inline `color: "#fff"` (line 9, re-asserts cream on the {deep} bg), the SectorHeader call site (line 11) with a `#C41E20` color prop that does NOT match either canonical Education palette value, one `text-display` paragraph (line 13), four `PretextParagraph` calls each carrying `text-white/90` (lines 18-23, 29-34, 57-62, 63-68), one h3 with `text-subtitle normal-case` (line 28), and two `<Button asChild>` calls (lines 37, 46) with layout-only inline classNames (`max-w-xs w-full text-center`) — no color or typography overrides to audit.

### Out of scope (deferred or excluded)

- `src/components/ui/FractalPattern.tsx` and the `<FractalPattern color="#B52828" />` call site at `LiberalArtsPage.tsx:9` — explicitly excluded per FRAC-20 (Lab) precedent carried by FRAC-24 (Campus). The FractalPattern `color` prop is a shared decorative SVG fill; not audited. The hex value at the call site (`#B52828`) is documented only as an excluded site.
- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners` — shared chrome rendered on every page. Audited elsewhere if at all. Same exclusion rationale as Lab/Home/Campus.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audited as a separate task. **Note:** New Liberal Arts's call-site prop `color="#C41E20"` IS audited as part of `LiberalArts.tsx` (color audit row below).
- `src/components/ui/button.tsx` (the `Button` component) — typography locked via `buttonVariants` (audit-prompt section 4). The two `<Button asChild>` call sites at `LiberalArts.tsx:37,46` only carry layout classes (`max-w-xs w-full text-center`); no inline color/typography overrides exist. No typography or color row produced for these sites.
- `src/components/pretext/PretextParagraph.tsx` internals — shared component. Its typography rendering pattern (JBM at TEXT_SIZES.lg inline px) IS audited at the call sites per the audit-prompt section 4 Pretext rule, but the component code itself is not in scope. The Lab gap entry at `audit-gaps.md:27-32` already covers the sitewide mono-Pretext pattern; the New Liberal Arts impl agent records ONE typography row covering all four PretextParagraph sites with a Rationale that references the Lab GAP and does NOT re-log to `audit-gaps.md`.
- Tests, configs, package files.

### House identity declaration (Education = `school`, slug `house-education-*`; INVERTED page)

New Liberal Arts IS a house page. Per DESIGN.md → House mapping, the internal id is `school` and the displayName is "Education"; the canonical token slug prefix is `house-education-{light,deep}` (uses displayName, not internal id). The `house-school-*` token does not exist and must not be introduced.

Per DESIGN.md → "The forum/school page-bg inversion":

- **`house-education-deep` (`#5C1010`) IS the page background** on `LiberalArtsPage.tsx:8`. This is the INVERTED arrangement (default for forum + school only). `house-education-light` (`#B52828`) is the accent.
- **`house-education-light` (`#B52828`) is the canonical accent** — for the SectorHeader letter color, "Education" eyebrow, the FractalPattern decorative fill, and any future accent chrome.
- **The HouseBanner grid does NOT invert** — it always uses `{light}` as the banner background per DESIGN.md. HouseBanner is shared chrome and out of scope here; the inversion is a LiberalArtsPage-level rule.
- **Cream (paired-foreground) is the editorial voice** on Education's saturated `{deep}` page bg. The FRAC-42 default for Education is that both `--color-house-education-light-foreground` and `--color-house-education-deep-foreground` will resolve to `var(--color-background)` (cream `#f8f6f0`) — declared by FRAC-29 Apply task in one `@theme inline` block alongside the surface siblings.

**CRITICAL INVERSION RULE applied throughout this audit:**

Body voice on the page background is **cream via `text-house-education-deep-foreground`** — NOT via `text-house-education-light`. The `{light}` token (`#B52828`) is the saturated red ACCENT (used for the SectorHeader letter, "Education" eyebrow, FractalPattern decoration); it is **not** the body voice. The body voice resolves through the paired-foreground sibling, which is cream by default.

A row migrating `text-white` → `text-house-education-light` would be **wrong** under the inversion rule. The correct migration target is `text-house-education-deep-foreground` (paired foreground of the `{deep}` page surface). Every color row in this audit honors this rule explicitly.

### Inversion check (confirmed present, not a finding)

New Liberal Arts IS a forum/school inverted page (per DESIGN.md → The forum/school page-bg inversion). Source confirms:

- `LiberalArtsPage.tsx:8` page bg inline-styled to `#5C1010` = `house-education-deep` (inverted: `{deep}` not `{light}`).
- `LiberalArts.tsx:11` SectorHeader prop `color="#C41E20"` ≈ `house-education-light` (inverted accent role: `{light}` not `{deep}`; with a value drift documented in the color audit below).
- `LiberalArtsPage.tsx:9` FractalPattern color `#B52828` = `house-education-light` (consistent with inverted accent; FractalPattern site is excluded from migration).

The audit records this as the expected INVERTED arrangement (not a finding — the inversion is canonical for school/forum pages). Finding the default arrangement (`{light}` page bg with `{deep}` accent) on this page would be a finding (but the source confirms the inversion is in place).

### Cross-house leak check (performed)

Walked `LiberalArtsPage.tsx` and `LiberalArts.tsx` for any `text-house-publications-*`, `bg-house-publications-*`, `text-house-events-*`, `bg-house-events-*`, `text-house-visit-*`, `bg-house-visit-*`, `text-house-campus-*`, `bg-house-campus-*`, `text-house-political-club-*`, `bg-house-political-club-*`, and raw hex values from other-house palettes (`#E870A0`, `#C44878`, `#889460`, `#4A5A30`, `#D4857A`, `#C13B2A`, `#2E6B4A`, `#1A3A2E`, `#C83858`, `#6E1830`). **No cross-house leaks found** — the page's only declared color values are `#5C1010` (own `{deep}` page bg), `#B52828` (own `{light}` via the excluded FractalPattern call), `#C41E20` (a near-match to own `{light}` on the SectorHeader prop — flagged as a value-drift NEAR migration), raw white in inline-style and `text-white`/`text-white/90` classNames, and the `selection:text-[#5C1010]` arbitrary value (own `{deep}` via raw hex).

## Typography audit

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

## Color audit

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

## Forward observations (not GAPs under current rules)

Surfaced during this audit, not blocking the Apply task, recorded so the next iteration of the system has them.

- **SectorHeader prop value drift on the only accent-color site.** The SectorHeader prop at `LiberalArts.tsx:11` carries `#C41E20`, which sits between the canonical `house-education-light` (`#B52828`) and a slightly more saturated red. Every other house page's SectorHeader prop matches its palette exactly (Lab=`#C44878` = `house-publications-deep`; Campus=`#1A3A2E` = `house-campus-deep`). The Apply task will migrate to `house-education-light` and absorb the small visual delta. If the human prefers to keep `#C41E20` as the accent, that becomes a `house-education-accent` palette tweak discussion — out of scope here, but flagged as the most likely follow-up. The page was likely authored before the Education palette landed in `houses.ts` (FRAC-50 standardized `palette: { light, deep }`), and the prop value never got reconciled.

- **Inverted selection chrome is an editorial choice the FRAC-42 canonical pattern does not model.** The page uses `selection:bg-white selection:text-[#5C1010]` (cream selection on deep-red page), which preserves the inversion editorial intent. The FRAC-42 canonical selection chrome is `selection:bg-foreground selection:text-background` (charcoal selection on cream-or-saturated page). The Apply task can either preserve the editorial inversion via `selection:bg-house-education-deep-foreground selection:text-house-education-deep` (recommended in the color row above) or switch to the FRAC-42 canonical chrome. If multiple inverted pages (forum, school) ship the same custom selection chrome, codifying a "house-inverted-selection" pattern in DESIGN.md may be worth a tightening pass.

- **Page is structurally simpler than Campus.** New Liberal Arts has no PhotoPlaceholder, no nested cards with `bg-white/<n>` tints, no `border-white/<n>` accent borders, no italic asides, no inline `<button>` elements, no `bg-black/<n>` button overrides. The single `bg-*` site is the page-level `<main>` and it co-locates its pair. The single PretextParagraph cluster collapses to one row (the only GAP candidate, already dedup'd to the Lab entry). The body voice uses `text-white/90` uniformly without per-section weight or alpha variation. The audit doc is correspondingly compact: 3 typography rows, 5 color rows.

- **Body weight drift on PretextParagraph cluster.** The four PretextParagraph call sites do not pass a `font` prop, so they default to `FONTS.body` (JetBrains Mono) at the default weight (400, vs Campus's font-light at 300). This is a per-page editorial choice — Education's body voice is rendered slightly heavier than Campus's. The Apply task will preserve this; no migration finding because the canonical body utility (.text-body / .text-body-lead) doesn't match the family anyway (the Pretext-mono GAP covers the cluster).

## Gap appendix

No new gaps.

The single GAP candidate on this page — the four PretextParagraph call sites at `LiberalArts.tsx:18-23, 29-34, 57-62, 63-68` (JBM body rendering outside the Inter-only canonical body tier) — is covered by the existing sitewide Lab GAP entry at `.lattice/notes/audit-gaps.md:27-32`. Per the sitewide-dedup rule (FRAC-24 Campus audit precedent: "the existing Lab entry covers the sitewide pattern; Campus does not need to re-log it"), the New Liberal Arts impl agent does NOT append a new entry. The Pretext typography row in this audit doc references the Lab entry explicitly, giving FRAC-29 Apply the gap context inline without redundant logging.

The italic-aside cluster (the Campus GAP that motivated FRAC-47's `.text-aside`) does NOT appear on this page. No italic body asides in `LiberalArts.tsx`. FRAC-47 has since resolved that cluster sitewide, so even if a future revision of this page adds italic asides, the canonical home (`.text-aside`) is available.

### Branch ordering note (for reviewers)

This branch (`frac-28-audit-new-liberal-arts`) is off `master`. Master carries the FRAC-20 Lab + FRAC-22 Home + FRAC-24 Campus audit-gaps entries (verified at `.lattice/notes/audit-gaps.md`). This audit appends no new entries to `audit-gaps.md`, so no merge ordering concerns apply. The audit doc itself is a new file at `.lattice/notes/audits/new-liberal-arts-audit.md` and does not conflict with sibling per-page audit docs.
