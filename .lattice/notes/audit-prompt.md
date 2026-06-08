# FRAC-18 per-page audit prompt — typography + color

**Spec snapshot date:** 2026-06-08
**Source of truth:** `DESIGN.md` at the commit this prompt was authored against.
**Status:** Prescriptive. No human in loop. Every finding deterministically maps to
exactly one action.

If `DESIGN.md` changes after this prompt is written, re-author this prompt — do
not edit in place. Every audit produced under this prompt must be traceable to
a specific snapshot.

---

## 1. Purpose & invocation

- **Who reads this:** the per-page Audit sub-agent for FRAC-20, FRAC-22, FRAC-24,
  FRAC-26, FRAC-28, FRAC-30, FRAC-32, FRAC-34, FRAC-36, FRAC-38 — one Audit task
  per user-facing page.
- **What that sub-agent produces:** exactly one file at
  `.lattice/notes/audits/<page-slug>-audit.md`. It contains the full audit table
  for the page plus a gap appendix if any gaps were found. No other files.
- **What the downstream Apply task does:** reads the produced audit doc and
  executes every `MIGRATE` and `GAP-LOG-AND-MIGRATE` row with exact line edits.
  The Apply task does not re-audit and does not make decisions. The audit doc
  is the spec for the Apply PR.
- **Page-slug convention:** lowercase, kebab-case, matches the page's product
  display name. Examples: `lab`, `home`, `campus`, `story`, `new-liberal-arts`,
  `political-club`, `visit`, `events`, `people`, `protocol`.
- **Snapshot pinning:** the canonical type scale (section 2) and color tokens
  (section 3) are pinned at the moment this prompt is authored. Treat them as
  the source of truth for every audit produced under this prompt. If
  `DESIGN.md` has changed since, the orchestrator will re-author this prompt
  before launching further audits.
- **Audit directory:** `.lattice/notes/audits/` is created lazily by the first
  Audit sub-agent (FRAC-20). If it doesn't exist when you start, create it.

---

## 2. Canonical type scale (snapshot pinned to DESIGN.md)

Pinned from `DESIGN.md` lines ~207–246 at write time. Post-FRAC-17:
`.text-title` is italic mixed-case, `.text-subtitle` is upright weight 300
mixed-case — neither carries `text-transform: uppercase` any more.

### Display tier (Fraunces)

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-display` | upright, weight 300, uppercase, tracking 0.04em, leading 1.1 | `text-5xl md:text-7xl` |
| `.text-title` | italic, mixed-case, tracking 0.04em | `text-3xl md:text-5xl` |
| `.text-subtitle` | upright, weight 300, mixed-case, tracking 0.04em | `text-xl md:text-2xl` |

### Body tier (Inter, normal-case)

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-body` | weight 400, normal-case | `text-base` |
| `.text-body-lead` | weight 300, normal-case, leading 1.7 | `text-lg` |

### Chrome tier (JetBrains Mono)

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-eyebrow` | uppercase, weight 500, tracking 0.1em | `text-sm` |
| `.text-label` | identical to `.text-eyebrow` | `text-sm` |
| `.text-meta` | identical to `.text-eyebrow` | `text-sm` |

`.text-eyebrow`, `.text-label`, and `.text-meta` are three names for the same
rendering. Choose the name whose semantic meaning fits the call site (overline
label vs. form label vs. inline metadata). The auditor should preserve whichever
the source already uses; if the source has none, prefer the name with the closest
semantic match to the element's role.

### Wordmark carve-out (exempt)

- Jacquard 24 "Fractal" + Fraunces extra-light italic "Collective" (Navbar
  wordmark) is **exempt**.
- Action for any element matching this: `JUSTIFY-WORDMARK`. Untouched. No
  migration considered. No further classification needed.

### Button (not audited as text)

Button typography is locked in `src/components/ui/button.tsx` via
`buttonVariants` (`text-sm tracking-widest uppercase font-medium` for `default`,
`text-xs tracking-widest uppercase font-medium` for `sm`). The auditor must:

- **Skip** every element rendered through the `Button` component (`<Button …>`).
- **Flag only** inline `<button>` elements with ad-hoc typography that bypass the
  `Button` component. These are audited like any other text element against the
  canonical scale.

### `.display-roman` escape hatch

`.display-roman` (font-style/weight/transform only, no size or tracking) is the
low-level escape hatch preserved alongside the semantic scale. If a heading
opts out of italic with `.display-roman` *and* the surrounding rendering matches
`.text-display`, prefer migrating to `.text-display` (the full preset). If
`.display-roman` is used alone without a size/tracking partner that matches a
preset, leave it — it is a documented escape hatch.

---

## 3. Canonical color tokens (snapshot pinned to DESIGN.md)

Pinned from `DESIGN.md` lines ~110–168 at write time.

### Surface palette — 19 tokens

| Token | Hex | Role |
|---|---|---|
| `background` | `#f8f6f0` | Canonical cream. Page background. |
| `foreground` | `#171717` | Canonical charcoal. Dominant text color. |
| `card` | `#fbfaf9` | Slightly raised cream for card surfaces. |
| `card-foreground` | `#171717` | Text on `card`. |
| `popover` | `#fbfaf9` | Popover surface (same as `card`). |
| `popover-foreground` | `#171717` | Text on `popover`. |
| `primary` | `#171717` | Charcoal — see DESIGN.md "Primary is charcoal" note. |
| `primary-foreground` | `#f8f6f0` | Cream on charcoal (inverted button states). |
| `secondary` | `#e8e6e3` | Warm putty for muted chrome. |
| `secondary-foreground` | `#171717` | Text on `secondary`. |
| `muted` | `#e8e6e3` | Same as `secondary`. |
| `muted-foreground` | `#525252` | WCAG AA 4.5:1 against cream (FRAC-33). |
| `accent` | `#e5e2dc` | Slightly warmer neutral for subtle accent fills. |
| `accent-foreground` | `#171717` | Text on `accent`. |
| `destructive` | `#ef4343` | Destructive action red. |
| `destructive-foreground` | `#f8f6f0` | Text on `destructive`. |
| `border` | `#dddad5` | Soft editorial border. |
| `input` | `#dddad5` | Form input border (same as `border`). |
| `ring` | `#171717` | Canonical charcoal focus ring. |

### House tokens — 12 tokens (6 houses × {light, deep})

DESIGN.md uses `displayName` slugs (not internal `houses.ts` ids) for token
naming. The mapping is:

| Internal ID (`houses.ts`) | Display name | Token slug prefix |
|---|---|---|
| `neighborhood` | Visit | `house-visit-{light,deep}` |
| `events` | Events | `house-events-{light,deep}` |
| `campus` | Campus | `house-campus-{light,deep}` |
| `school` | Education | `house-education-{light,deep}` |
| `forum` | Political Club | `house-political-club-{light,deep}` |
| `lab` | Publications | `house-publications-{light,deep}` |

House palette hex values (verified against `src/data/houses.ts`):

| Token | Hex |
|---|---|
| `house-visit-light` | `#889460` |
| `house-visit-deep` | `#4A5A30` |
| `house-events-light` | `#D4857A` |
| `house-events-deep` | `#C13B2A` |
| `house-campus-light` | `#2E6B4A` |
| `house-campus-deep` | `#1A3A2E` |
| `house-education-light` | `#B52828` |
| `house-education-deep` | `#5C1010` |
| `house-political-club-light` | `#C83858` |
| `house-political-club-deep` | `#6E1830` |
| `house-publications-light` | `#E870A0` |
| `house-publications-deep` | `#C44878` |

### Per-page inversion rules

From `DESIGN.md` lines ~170–172:

- **Political Club** (internal id `forum`) page: page background = `{deep}`,
  accent = `{light}` (inverted from default).
- **New Liberal Arts / Education** (internal id `school`) page: same inversion.
- **All other house pages:** page background = `{light}`, accent = `{deep}`
  (default).
- **HouseBanner grid does NOT invert** — it always uses `{light}` as the banner
  background regardless of which house. Inversion is a per-page rule applied in
  `PoliticalClubPage.tsx` and `LiberalArtsPage.tsx`.

When auditing the Political Club or New Liberal Arts pages, expect `{deep}` on
the page background. A `{light}` background on those pages is a finding.

### Dead tokens / forbidden values (call out explicitly)

The Apply task will never migrate **to** these. Finding any of them is itself a
finding to migrate **away from**.

- **`#6B4C9A`** — legacy Publications/Lab purple. Removed in FRAC-34 and FRAC-50.
  If found, migrate to the appropriate `house-publications-{light|deep}` based on
  role (deep purple → `house-publications-deep` = `#C44878`; lighter purple →
  `house-publications-light` = `#E870A0`). Record as a NEAR match (color shift
  intended).
- **Raw `#1a1a1a`** — charcoal drift. Canonical charcoal is `#171717` via
  `foreground` token. If found, migrate to `text-foreground` /
  `hsl(var(--foreground))` and record as EXACT (visually indistinguishable).
- **Any `text-[<arbitrary>]` or `bg-[<arbitrary>]` Tailwind arbitrary value** —
  treat as ad-hoc. Resolve the literal to its nearest canonical token and
  classify per section 6.
- **Any standard Tailwind color utility resolving to a value not in DESIGN.md's
  token list (`text-white`, `bg-white`, `text-black`, `text-gray-*`, etc.)** —
  treat as ad-hoc. Resolve to nearest canonical token per role (see DESIGN.md
  → Text foregrounds for the text-color rule). Not just arbitrary `text-[…]`
  values; standard utilities count too.
- **No `house-publications-accent`, `lab-purple`, or `charcoal-deep`** — these
  are explicitly forbidden by DESIGN.md. If a finding seems to require one of
  these, it is a `GAP` — log to `audit-gaps.md`, migrate to nearest fit, and
  the system change goes in the gap entry's "Proposed system change" line.

---

## 4. Per-element typography checklist (PRESCRIPTIVE format)

For every text-bearing element in the page (rendered text, not button-component
labels), produce exactly one row in this format:

```
Element: <file:line, surrounding 1-line context>
Current: family=<Fraunces|Inter|JBM|Jacquard|inherited>, weight=<n>, style=<italic|normal>, transform=<uppercase|none|capitalize>, size=<class or computed>, tracking=<value or class>
Nearest canonical utility: <.text-display | .text-title | .text-subtitle | .text-body | .text-body-lead | .text-eyebrow | .text-label | .text-meta | WORDMARK | BUTTON>
Match quality: EXACT | NEAR | GAP
Action: MIGRATE | JUSTIFY-WORDMARK | GAP-LOG-AND-MIGRATE | JUSTIFY
Rationale: <one line>
```

`<file:line>` points at the opening JSX tag of the element. For multi-line
elements, the opening-tag line wins.

### Match quality definitions

- **EXACT** — every rendering attribute (family, weight, style, transform, size,
  tracking) matches the chosen utility's spec. The element is already
  semantically correct; migration replaces ad-hoc class soup with the canonical
  utility name.
- **NEAR** — the chosen utility's **tier and semantic role** match, but one or
  two rendering attributes drift (e.g., Fraunces italic at `text-2xl` when
  `.text-title` is `text-3xl md:text-5xl`). Migration is still the right call;
  document the near-miss attribute(s) in the Rationale so the Apply task knows
  what visual drift to expect.
- **GAP** — no canonical utility fits the element's semantic role *and*
  rendering intent. Example: small-caps italic Fraunces card title at
  `text-base` — neither `.text-title` nor `.text-subtitle` matches the
  combination. The auditor still picks the nearest utility for migration and
  records the gap.

### Inherited / global rules

`body` is normal-case (post-FRAC-51). `h1–h6` carry the global italic +
uppercase Fraunces rule from `src/index.css`. If an element relies on these
global rules without explicit utility application, treat the rendered result as
its `Current` state and classify as if those rules were applied.

When a utility class and a global rule (h1–h6, `body`, `.font-serif`,
`[style*="Jacquard"]`) both apply, record the rendered state in `Current` and
classify against the utility's intended spec. Drift between rendered and
intended goes in the Rationale. Pattern: chrome utility (`.text-eyebrow`,
`.text-label`, `.text-meta`) on an h-tag yields accidental italic; flag NEAR
and log to audit-gaps if recurring.

### Pretext-rendered text

Elements rendered via `PretextParagraph` (and the underlying `usePretext`
hook) use inline pixel sizes from `TEXT_SIZES` and font families from
`FONTS`. Record the inline px size in `Current`; nearest fit is the closest
body-tier utility regardless of family mismatch (Pretext always uses JBM via
FONTS.body; canonical body utilities are Inter). Family mismatch goes in
Rationale; classification is GAP unless a future body-mono utility lands in
the system.

---

## 5. Per-element color checklist (PRESCRIPTIVE format)

One row per **distinct color use** in the page. Group identical uses with the
same role into a single row (e.g., one row covering "all card body text uses
`text-foreground`"). Format:

```
Element: <file:line, surrounding 1-line context>
Current: <hex | hsl | Tailwind class | arbitrary value>
Role: <text | background | border | ring | accent | fill | placeholder>
Nearest canonical token: <token name from section 3>
Match quality: EXACT | NEAR | GAP
Action: MIGRATE | JUSTIFY | GAP-LOG-AND-MIGRATE
Rationale: <one line>
```

Group color findings by (file + canonical token). The `Role:` line lists every
role the token serves in that file (e.g., `Role: text + background + stroke`).
Across files, repeat the row. This keeps the doc dense enough to read but
enumerable enough for the Apply task to find every site.

### House-scope check

If the audited page belongs to a house, house tokens on that page must use the
page's own house slug. A Lab page (`house-publications-*`) using
`house-events-light` is a finding — cross-house color leak. Call this out in
the Rationale and migrate to the page's own house token at the same `{light|deep}`
role.

### Inversion check

On the Political Club (`forum`) and New Liberal Arts (`school`) pages, the page
background is `{deep}` and the accent is `{light}`. If you find the default
arrangement (`{light}` page background, `{deep}` accent), that is a finding —
classify per section 6 (likely `MIGRATE` with NEAR quality).

### Dead-value check

- Raw `#1a1a1a` → migrate to `foreground` (`text-foreground` /
  `hsl(var(--foreground))`). EXACT.
- Raw `#6B4C9A` (anywhere) → migrate to `house-publications-deep` or
  `house-publications-light` per role. NEAR.

### Surface-foreground pairing check

Every surface declaration on the audited page must carry its paired foreground token at the same node. Per DESIGN.md → Surface foreground pairing, the four canonical pairs are:

| Surface utility | Paired foreground utility |
|---|---|
| `bg-background` | `text-foreground` |
| `bg-foreground` | `text-background` |
| `bg-house-{slug}-light` | `text-house-{slug}-light-foreground` |
| `bg-house-{slug}-deep` | `text-house-{slug}-deep-foreground` |

When auditing a `bg-*` row, check the same JSX node (or its nearest ancestor that establishes the text color) for the matching `text-*` foreground utility. A surface that relies on the page-level text cascade — without re-asserting its own foreground — is a finding: classify as `NEAR` (rendering may be correct today by inheritance, but a nested surface or future restructure will break it) and migrate to the paired token.

Selection-chrome utilities (`selection:bg-foreground selection:text-background`) are paired-inverse states, not surface declarations — exempt from this check.

`{deep}` and `{light}` used as text-color highlights on a same-house page surface (the SectorHeader letter color, accent labels, eyebrows) are display uses, not surface declarations — also exempt.

If a house's foreground sibling token does not yet exist at `src/index.css` (the other 5 houses, pre-Apply-task), record the finding as `GAP-LOG-AND-MIGRATE`: migrate to the nearest neutral (`text-background` for `{light}` or `{deep}` surfaces), log a gap entry proposing the token addition, and let the per-house Apply task pick it up.

---

## 6. Decision rubric — NO HUMAN IN LOOP

For every Element row, the Action follows deterministically from the Match
quality:

| Match quality | Action | What happens in the Apply task |
|---|---|---|
| EXACT | `MIGRATE` | Replace ad-hoc classes/values with the canonical utility/token. |
| NEAR | `MIGRATE` | Same as EXACT. Record the near-miss attribute(s) in the Rationale so the Apply task knows what visual drift to expect. |
| GAP | `GAP-LOG-AND-MIGRATE` | Migrate to the nearest-fit utility/token AND append an entry to `.lattice/notes/audit-gaps.md` (format in section 7). |
| Wordmark (Fractal Collective) | `JUSTIFY-WORDMARK` | Untouched. No migration. |
| Intentional design exception | `JUSTIFY` | Untouched. One-line reason required in Rationale (e.g., "hero treatment, see FRAC-XX"). |

### Tie-breaking rules

The auditor never asks a question. The auditor never invents a tier or token.

- **MIGRATE vs. GAP** — if you can identify a canonical utility/token whose
  *tier and semantic role* matches the element (even if 1–2 rendering
  attributes drift), pick `NEAR` → `MIGRATE`. Only escalate to `GAP` when no
  canonical option matches the element's tier OR role at all.
- **MIGRATE vs. JUSTIFY** — err toward `MIGRATE`. Reserve `JUSTIFY` for
  documented, intentional exceptions backed by a specific FRAC task or a clear
  one-line rationale (e.g., "Jacquard 24 monogram letter, decorative,
  `aria-hidden`"). Vibes are not a justification.
- **GAP vs. JUSTIFY** — `GAP` always wins. If something looks like both, log
  the gap.
- **Multiple GAP candidates** — for an element that gaps in both typography
  and color, file two separate gap entries (one in each audit table row,
  appended as two gap entries with distinct "Why it didn't fit" lines).
- **Auditor flagged → human decided → audit re-classified.** When an audit run
  surfaces a pattern the human resolves with a system rule (e.g., "text is
  always foreground or background, or the page's own house colors for
  display/highlight"), fold the decision back into DESIGN.md AND tighten this
  prompt to reference it, then re-classify rows to reflect the rule. Do not
  log to audit-gaps if the rule is now canonical. The audit run becomes the
  moment the system rule is codified.

New tiers/tokens are proposed only in the gaps register, never executed in the
Apply task.

---

## 7. Gap entry format (for audit-gaps.md)

When Action is `GAP-LOG-AND-MIGRATE`, append one entry to
`.lattice/notes/audit-gaps.md` under the `## Gaps` section. Format:

```
- file:line — <element description>
  Nearest-fit chosen: <utility or token>
  Why it didn't fit: <one line, specific>
  Proposed system change: <one line, e.g., "add .text-card-title tier (Fraunces italic, text-base, small-caps)" or "add --accent-pink-deep token at #C44878">
  Page: <page slug>
  Date: YYYY-MM-DD
```

Rules:

- Multiple gaps from the same page audit accumulate as separate list items in
  source order.
- No deduplication within a single audit. Sitewide dedup is a later human task.
- Append-only. Do not edit existing entries.
- Do not invent tiers or tokens here — describe the proposed change in prose;
  the human reviewer decides whether to file a task.

The same gap entries are also copied into the audit doc's "Gap appendix"
section (see section 10), so an Apply task can read them without opening
`audit-gaps.md`.

---

## 8. Mobile-first requirement

Per `DESIGN.md` and the project CLAUDE.md, every audit reads the page at
**375px viewport first**, desktop second. The auditor must:

- Note any element whose rendering changes between mobile and desktop
  (responsive size classes like `text-3xl md:text-5xl`). Produce a single row
  per element, listing both renderings under `Current` (e.g.,
  `size=text-3xl (mobile), text-5xl (md+)`).
- Note any element that is hidden at one viewport (e.g., `hidden md:block`).
  Flag in Rationale.
- Layout-shift-only differences (no typography/color change) are out of scope.

Acceptance check: an audit doc that lists only desktop renderings is incomplete
and must be redone.

---

## 9. Non-goals

- **Wordmark "Fractal Collective"** — `JUSTIFY-WORDMARK`, untouched.
- **Spacing, layout, animation, interaction** — out of scope. Audit typography
  and color only.
- **Inventing tiers or tokens** — never. Always log to `audit-gaps.md` and
  migrate to nearest fit.
- **Button component typography** — locked in `buttonVariants`. Auditor flags
  only ad-hoc `<button>` elements that bypass the `Button` component.
- **Cross-page changes** — each Audit task is scoped to a single page's source
  tree (the page file plus components it imports that are unique to it). Shared
  chrome (Navbar, Footer) is audited once via its own task structure if needed;
  do not re-audit it per page.
- **Image colors, photographs, gradients in raster assets** — out of scope.
  Audit declared CSS/Tailwind values only.
- **Motion, shadow, gradient tokens** — DESIGN.md does not model these; not
  audited.

---

## 10. Output format the Audit task must produce

The per-page Audit sub-agent writes exactly one file at
`.lattice/notes/audits/<page-slug>-audit.md`. Structure:

```markdown
# <Page name> audit — typography + color

## Page

- Page slug: <slug>
- Source: <primary file path>
- Date: YYYY-MM-DD
- Spec snapshot: `.lattice/notes/audit-prompt.md` (FRAC-19 author date: 2026-06-08)
- Mobile viewport baseline: 375px

## Typography audit

<one row per element in the format from section 4>

## Color audit

<one row per distinct color use in the format from section 5>

## Forward observations (not GAPs under current rules)

<optional. Surfaced during this audit, not blocking the Apply task, recorded so the next iteration of the system has them. Patterns that fall short of a GAP under section 6 tie-breaking rules — e.g., "container body copy reads slightly smaller than .text-body in cards; not a GAP because .text-body cleanly resolves these rows, but worth flagging for a future container-scoped utility." If nothing, omit the section.>

## Gap appendix

<copy of any GAP-LOG-AND-MIGRATE entries also appended to .lattice/notes/audit-gaps.md, OR "No gaps." if none>
```

The Apply task reads only this file to produce its implementation plan. The
audit doc is the spec for the Apply PR — its diff is reviewable against the
audit doc.
