# FRAC-20 — Audit Publications (Lab) page (typography + color)

**Task:** task_01KTJQEZR4FB08WV8M4DDMB14E
**Branch:** frac-20-audit-lab
**Spec snapshot:** `.lattice/notes/audit-prompt.md` (FRAC-19, author date 2026-06-08)
**Mobile viewport baseline:** 375px

This is the **first** per-page audit executed under the FRAC-18/FRAC-19
playbook. It is both a real deliverable (the Lab audit doc Apply/FRAC-21 will
consume) and the worked example future audits will model on. As the first run,
it is also expected to surface gaps in the playbook itself; those gaps get
fixed in this same PR.

---

## Scope

### In scope (source of truth: LabPage's import graph)

- `src/pages/LabPage.tsx`
- `src/components/lab/DocumentGrid.tsx`
- `src/components/lab/DocumentBadge.tsx` (rendered transitively by DocumentGrid; Lab-only)
- `src/components/lab/ArchiveToolbar.tsx`
- `src/components/lab/ArchiveSearch.tsx` (rendered transitively by ArchiveToolbar)
- `src/components/pretext/PretextParagraph.tsx` (inline-style rendering only, as Lab uses it)

### Out of scope (deferred or excluded)

- `src/components/lab/TagFilter.tsx` — dead path on Lab today (`showTags={false}` per FRAC-169 cleanup). Audit when/if tags return.
- `src/components/layout/SectorHeader.tsx` internals — shared chrome across all house pages. Audit as a separate task (will be folded into a shared-chrome sweep). **Note:** Lab's call-site prop `color="#C44878"` IS audited as part of LabPage.tsx.
- `src/components/ui/FractalPattern.tsx` and its prop site `<FractalPattern color="#C44878" />` — explicitly excluded by user direction. Out of scope entirely.
- Navbar, Footer, MandelbrotIcon, MandelbrotCorners, FadeIn — shared chrome, audited elsewhere if at all.
- `src/lib/pretext.ts`, `src/hooks/use-archive-filter.ts` — data/hook layer, no UI.
- `src/components/lab/DocumentBadge`'s `MandelbrotCorners` import — shared decorative SVG, no text/color of its own (color is house-deep via prop).

---

## Format (locked 2026-06-08 with human)

Use the formats specified in `audit-prompt.md` sections 4 (typography) and 5
(color), with these locked clarifications from the format-lock dialogue:

- **`<file:line>` granularity:** point at the opening JSX tag line of the
  element. For multi-line elements, the opening-tag line wins.
- **Composite cascade:** when a utility class + a global rule (h1–h6, body,
  `.font-serif`, `[style*="Jacquard"]`) both apply, record the **rendered
  state** in `Current` and classify against the utility's **intended spec**.
  Drift between rendered and intended goes in the Rationale. Example: an h2
  with `.text-eyebrow` renders italic because the h-tag global rule sets
  italic and `.text-eyebrow` doesn't reset it — Current says
  `style=italic (DRIFT — inherited from h1–h6 global rule)`, classification is
  against the .text-eyebrow spec (non-italic), match quality is NEAR.
- **Color row grouping:** group by `(file + token)`. List every role the token
  serves in that file on the `Role:` line. Across files, repeat the row.
  Example: DocumentBadge.tsx uses LAB_DEEP (= `house-publications-deep`) as
  text + icon-bg-with-alpha + icon-stroke + accent-bar-bg + focus-ring color
  — one row, `Role: text + background + stroke + fill`.
- **Pretext-rendered text:** record the inline px size in `Current`. Nearest
  fit is the closest body-tier utility regardless of family mismatch (Pretext
  always uses JBM via FONTS.body; canonical body utilities are Inter). Family
  mismatch goes in Rationale.

### Project-wide text-color rule (locked 2026-06-08, codified in DESIGN.md by this PR)

Text on this site is **`text-foreground`** (charcoal `#171717`) or
**`text-background`** (cream `#f8f6f0`) by default. **On a house's own
page**, that house's `{light, deep}` pair is permitted as text color for
display headings and highlight chrome — Jacquard monogram letters, accent
labels, focus rings, eyebrow text on the house's own bg. House colors do not
cross page boundaries (Lab may use `house-publications-{light,deep}` but not
`house-events-light`). No raw `text-white`, `text-black`, `text-gray-*`, or
non-canonical text colors anywhere.

For the Lab audit specifically:

- `text-white` on the saturated pink bg (LabPage:49, LabPage:58) → NEAR
  migrate to `text-background` (cream). Not a GAP — the rule covers it.
- `color: LAB_DEEP` on DocumentBadge eyebrow → EXACT migrate. House-deep as
  highlight text on a non-house surface is permitted under the rule because
  DocumentBadge sits on the Lab page (its own house) and the eyebrow is a
  highlight label, not body copy.
- `color="#C44878"` prop on the SectorHeader call from LabPage:24 → EXACT
  migrate to a token reference. Color is canonical; mechanism (raw hex
  literal) is drift.

---

## Worked-example rows (the format template)

Drafted and locked with human during planning. These exist verbatim in the
audit doc; new rows the impl agent discovers follow the same shape. Reproduced
here so the impl agent can pattern-match without re-reading the chat history.

### Typography examples

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

### Color examples

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
Element: src/pages/LabPage.tsx:49 — text-white on "Research + Writing" eyebrow (also re-applies at LabPage:58 PretextParagraph)
Current: text-white (#ffffff)
Role: text
Nearest canonical token: background (cream #f8f6f0)
Match quality: NEAR
Action: MIGRATE
Rationale: Per project rule (locked 2026-06-08, codified in DESIGN.md by this PR): text foregrounds are text-foreground (charcoal) or text-background (cream); house colors permitted only for display/highlight cases on the house's own page. White is not a token. The eyebrow + Pretext lede are body/chrome on saturated bg — not display/highlight — so migrate to text-background. Visual delta imperceptible (#ffffff vs #f8f6f0).
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

---

## DESIGN.md edit in this PR

Add one new sub-section to the **Colors** section in `DESIGN.md`, placed
between `### Lab/Publications uses palette pinks; the old #6B4C9A is dead`
(line ~180) and `### Charcoal drift note` (line ~183). Title: `### Text
foregrounds`. Content:

```
### Text foregrounds

Two canonical text colors carry the entire site: `foreground` (`#171717` charcoal) and `background` (`#f8f6f0` cream). Charcoal is the default voice on cream surfaces; cream is the default voice on charcoal or saturated house backgrounds. The absence of a white or gray text token is the canonical statement that the system does not use them.

**House colors for display and highlight.** On a house's own page, that house's `{light, deep}` pair is permitted as text color for display headings and highlight chrome — Jacquard monogram letters, accent labels, focus rings, eyebrow text on the house's own bg. House colors do not cross page boundaries; the Lab page may use `house-publications-{light,deep}` but not `house-events-light`.
```

This follows DESIGN.md's existing format (positive declaration of source of
truth, not a prescriptive Do/Don't). The "Don't use raw text-white" instinct
is satisfied by the absence of a white token, not by an explicit Don't entry.

---

## Audit-prompt revisions in this PR

In addition to the audit doc and the DESIGN.md edit, the impl agent edits
`.lattice/notes/audit-prompt.md` in place to close these playbook gaps
surfaced during planning:

1. **Section 3, "Dead tokens / forbidden values":** add a bullet — *"Any standard Tailwind color utility resolving to a value not in DESIGN.md's token list (`text-white`, `bg-white`, `text-black`, `text-gray-*`, etc.) — treat as ad-hoc. Resolve to nearest canonical token per role (see DESIGN.md → Text foregrounds for the text-color rule). Not just arbitrary `text-[…]` values; standard utilities count too."*

2. **Section 4, before "Match quality definitions":** add a one-liner — *"`<file:line>` points at the opening JSX tag of the element. For multi-line elements, the opening-tag line wins."*

3. **Section 4, "Inherited / global rules" paragraph:** extend with — *"When a utility class and a global rule (h1–h6, `body`, `.font-serif`, `[style*=\"Jacquard\"]`) both apply, record the rendered state in `Current` and classify against the utility's intended spec. Drift between rendered and intended goes in the Rationale. Pattern: chrome utility (`.text-eyebrow`, `.text-label`, `.text-meta`) on an h-tag yields accidental italic; flag NEAR and log to audit-gaps if recurring."*

4. **Section 5, before "House-scope check":** add — *"Group color findings by (file + canonical token). The `Role:` line lists every role the token serves in that file (e.g., `Role: text + background + stroke`). Across files, repeat the row. This keeps the doc dense enough to read but enumerable enough for the Apply task to find every site."*

5. **Section 4, new sub-section after "Inherited / global rules":** add — *"**Pretext-rendered text.** Elements rendered via `PretextParagraph` (and the underlying `usePretext` hook) use inline pixel sizes from `TEXT_SIZES` and font families from `FONTS`. Record the inline px size in `Current`; nearest fit is the closest body-tier utility regardless of family mismatch (Pretext always uses JBM via FONTS.body; canonical body utilities are Inter). Family mismatch goes in Rationale; classification is GAP unless a future body-mono utility lands in the system."*

6. **Section 6, end of "Tie-breaking rules":** add — *"**Auditor flagged → human decided → audit re-classified.** When an audit run surfaces a pattern the human resolves with a system rule (e.g., 'text is always foreground or background, or the page's own house colors for display/highlight'), fold the decision back into DESIGN.md AND tighten this prompt to reference it, then re-classify rows to reflect the rule. Do not log to audit-gaps if the rule is now canonical. The audit run becomes the moment the system rule is codified."*

These revisions are scoped narrowly: each is a single-bullet or
single-paragraph addition. They do not change the methodology — they tighten
edges the first real audit run exposed.

---

## Methodology (concise — full playbook in audit-prompt.md)

1. Walk every element in scope. For each text-bearing element, write one
   typography row per section 4. For each distinct color use, write one color
   row per section 5 (grouped per the format rule above).
2. Mobile-first: every responsive element lists both mobile and desktop
   renderings in `Current`. Single-viewport elements just list the one.
3. Tie-breaking rules per section 6. With the project-wide text-color rule
   above, the most common drift (`text-white`) becomes NEAR migrate, not GAP.
4. Real GAPs (after rules applied) get appended to
   `.lattice/notes/audit-gaps.md` per section 7 AND copied into the audit
   doc's gap appendix per section 10.
5. The audit doc itself is the spec for FRAC-21 Apply. Apply reads only this
   file.

---

## Files the impl agent writes

1. **`.lattice/notes/audits/lab-audit.md`** — the audit doc. Structure per
   audit-prompt section 10:
   - Page metadata block
   - `## Typography audit` — all rows
   - `## Color audit` — all rows
   - `## Gap appendix` — copy of any GAP-LOG-AND-MIGRATE entries, or "No gaps."

2. **`DESIGN.md`** — one new sub-section `### Text foregrounds` added to the
   Colors section, content per the "DESIGN.md edit" section above. No other
   DESIGN.md changes.

3. **`.lattice/notes/audit-prompt.md`** — six in-place edits per the
   "Audit-prompt revisions" section above. Do not rewrite the file; edit only
   the bullets/paragraphs called out.

4. **`.lattice/notes/audit-gaps.md`** — append-only. The Lab audit may produce
   one or more entries. The Pretext-px GAP (LabPage:58) is the certain entry;
   the impl agent appends any others it finds.

5. **`.lattice/notes/audits/`** directory — create if it doesn't exist
   (audit-prompt section 1 specifies lazy creation by the first Audit
   sub-agent; FRAC-20 IS that first sub-agent).

## Files the impl agent must NOT touch

- Anything in `src/` — FRAC-20 is audit-only. FRAC-21 is the Apply task.
- Any DESIGN.md content outside the one new sub-section described above.
- Tests, configs, package files — out of scope.

---

## Acceptance criteria

The impl agent's commit is accepted when:

- [ ] `.lattice/notes/audits/lab-audit.md` exists and follows the section-10 structure.
- [ ] Every typography row matches the section-4 format and the locked clarifications above.
- [ ] Every color row matches the section-5 format and the (file + token) grouping rule.
- [ ] Every responsive element lists both mobile and desktop renderings.
- [ ] Every `text-white` instance is classified NEAR → MIGRATE to `text-background` (not GAP).
- [ ] Every LAB_DEEP / house-publications-deep / house-publications-light text use is classified as MIGRATE under the house-colors-for-display/highlight allowance.
- [ ] The Pretext-px-size pattern at LabPage:58 is classified GAP and appended to audit-gaps.md.
- [ ] The 8 worked-example rows above appear verbatim in the audit doc, in the same order, alongside any new rows the impl finds.
- [ ] `DESIGN.md` carries the one new `### Text foregrounds` sub-section in the Colors section, with no other DESIGN.md changes.
- [ ] `audit-prompt.md` carries the six revisions listed above (single-bullet/single-paragraph edits in place).
- [ ] Gap appendix in the audit doc mirrors `audit-gaps.md` entries appended by this run, or says "No gaps." if none.
- [ ] No `src/` files modified.
- [ ] `pnpm typecheck && pnpm test` pass on the branch (note: pre-existing baseline failures on master — footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood min-h-screen — are NOT regressions from this work).

---

## Review gate

The review sub-agent reads cold (no implementation context) and verifies:

- Audit doc structure matches section 10.
- Every in-scope file is represented by at least one row.
- The 8 locked rows appear verbatim.
- Format rules (composite cascade, color grouping, Pretext sizing, file:line granularity) are applied consistently.
- The text-white rule and the house-colors-for-display/highlight allowance are applied uniformly.
- DESIGN.md edit is exactly the one new sub-section, in the right place, in DESIGN.md's existing positive-declaration style (no Do/Don't framing).
- audit-prompt.md carries all six revisions, and each is scoped narrowly (no methodology rewrite).
- No `src/` changes.
- Tests pass on the branch (modulo the documented baseline failures).

If the review finds rework: implementation-level for row-format drift;
plan-level only if a structural assumption above turns out wrong.
