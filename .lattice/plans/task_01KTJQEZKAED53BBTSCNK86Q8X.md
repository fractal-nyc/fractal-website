# FRAC-19: Author typography + color audit prompt + gaps register

## Context

FRAC-19 is the one-off setup task under the FRAC-18 umbrella. It produces the **instruction document** that all 10 per-page Audit sub-agents (FRAC-20, 22, 24, 26, 28, 30, 32, 34, 36, 38) will follow, plus the **empty sitewide gaps register** they will append to.

Per the FRAC-18 SCOPE REVISION (2026-06-08, "fully autonomous, no human-in-the-loop"):

- The audit prompt must be **prescriptive** — every finding deterministically maps to one of a finite set of actions, no orchestrator gates.
- System gaps (text/color that doesn't fit any canonical utility/token) are handled non-blocking: **always migrate to the nearest fit AND append the gap to `.lattice/notes/audit-gaps.md`** for later batch human review.
- Per the second SCOPE REVISION (2026-06-08, "per-page audit and update are SEPARATE Lattice tasks"): the Audit task produces *only* a markdown audit doc; the Apply task produces *only* source code changes. FRAC-19 is upstream of both — it authors the rubric they share.

## Deliverables

1. **`.lattice/notes/audit-prompt.md`** — prescriptive instruction document the per-page Audit sub-agents read verbatim.
2. **`.lattice/notes/audit-gaps.md`** — empty sitewide register (header + format example, no entries) that each page audit appends GAP-LOG-AND-MIGRATE entries to.

No source code changes. No tests. This is a docs-only task.

## audit-prompt.md — section-by-section spec

The implementer should write `.lattice/notes/audit-prompt.md` with the following ten sections, in order. Each section heading is fixed (so Audit sub-agents can grep). Content guidance is given per section.

### 1. Purpose & invocation

- **Who reads this:** the per-page Audit sub-agent for FRAC-20, FRAC-22, FRAC-24, FRAC-26, FRAC-28, FRAC-30, FRAC-32, FRAC-34, FRAC-36, FRAC-38 (one Audit task per user-facing page).
- **What that sub-agent produces:** `.lattice/notes/audits/<page-slug>-audit.md` — a single markdown file containing the full audit table for the page plus a gap appendix if any.
- **What the downstream Apply task does:** reads the produced audit doc and executes every `MIGRATE` and `GAP-LOG-AND-MIGRATE` action with exact line edits. The Apply task does not re-audit and does not make decisions.
- **Page-slug convention:** lowercase, kebab-case, matches the page's product display name. E.g. `lab`, `home`, `campus`, `story`, `new-liberal-arts`, `political-club`, `visit`, `events`, `people`, `protocol`.
- **Snapshot pinning:** the canonical type scale and color tokens in sections 2 and 3 are pinned at the moment this prompt is authored. If `DESIGN.md` changes later, the prompt must be re-authored — not edited in place — so each audit can be traced back to a specific spec snapshot.

### 2. Canonical type scale (snapshot pinned to DESIGN.md)

Reproduce the type scale verbatim from `DESIGN.md` lines ~207–246, structured as three tiers. The implementer should pull these from DESIGN.md at write time so the snapshot is accurate at commit time.

**Display tier (Fraunces)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-display` | upright, weight 300, uppercase, tracking 0.04em, leading 1.1 | `text-5xl md:text-7xl` |
| `.text-title` | italic, **mixed-case** (post-FRAC-17), tracking 0.04em | `text-3xl md:text-5xl` |
| `.text-subtitle` | upright, weight 300, **mixed-case** (post-FRAC-17), tracking 0.04em | `text-xl md:text-2xl` |

**Note on FRAC-17 dependency:** FRAC-18 lists FRAC-17 as a hard dependency. The pinned scale must reflect the post-FRAC-17 state of `.text-title` and `.text-subtitle` (mixed-case, no `text-transform: uppercase`). If FRAC-17 has not yet merged at the time the implementer writes this prompt, the implementer should still pin the post-FRAC-17 target state and add a one-line note in the prompt indicating this is the target spec — orchestrator gates merging of FRAC-19 to the actual FRAC-17 merge.

**Body tier (Inter, normal-case)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-body` | weight 400, normal-case | `text-base` |
| `.text-body-lead` | weight 300, normal-case, leading 1.7 | `text-lg` |

**Chrome tier (JetBrains Mono)**

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-eyebrow` | uppercase, weight 500, tracking 0.1em | `text-sm` |
| `.text-label` | identical to `.text-eyebrow` | `text-sm` |
| `.text-meta` | identical to `.text-eyebrow` | `text-sm` |

**Wordmark carve-out (exempt):**

- Jacquard 24 "Fractal" + Fraunces extra-light italic "Collective" (Navbar wordmark).
- Action for any element matching this: `JUSTIFY-WORDMARK`. Untouched, no migration considered.

**Button (not audited as text):** Button typography is locked in `src/components/ui/button.tsx` via `buttonVariants`. Auditor flags only inline `<button>` elements that do NOT use the Button component and have ad-hoc typography.

### 3. Canonical color tokens (snapshot pinned to DESIGN.md)

Reproduce the surface palette verbatim from `DESIGN.md` lines ~110–168.

**Surface (global) tokens — 19 tokens:** `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`. (Include the hex table from DESIGN.md verbatim.)

**House tokens — 12 tokens (6 houses × {light, deep}):**

| Token | Hex | Display name (per houses.ts) |
|---|---|---|
| `house-visit-{light,deep}` | `#889460` / `#4A5A30` | Visit (internal id: `neighborhood`) |
| `house-events-{light,deep}` | `#D4857A` / `#C13B2A` | Events |
| `house-campus-{light,deep}` | `#2E6B4A` / `#1A3A2E` | Campus |
| `house-education-{light,deep}` | `#B52828` / `#5C1010` | New Liberal Arts (internal id: `school`) |
| `house-political-club-{light,deep}` | `#C83858` / `#6E1830` | Political Club (internal id: `forum`) |
| `house-publications-{light,deep}` | `#E870A0` / `#C44878` | Publications (internal id: `lab`) |

**Per-page inversion rules (from `DESIGN.md` lines ~170–172):**

- Political Club (forum) page: page background = `{deep}`, accent = `{light}` (inverted from default).
- New Liberal Arts (school) page: same inversion.
- All other house pages: page background = `{light}`, accent = `{deep}` (default).
- HouseBanner grid does NOT invert (always uses `{light}` for banner bg).

**Dead tokens / forbidden values (call out explicitly):**

- `#6B4C9A` legacy Publications purple — dead, do NOT migrate to.
- Raw `#1a1a1a` — drift; canonical charcoal is `#171717` via `--foreground`.
- Any `text-[<arbitrary>]` or `bg-[<arbitrary>]` Tailwind arbitrary value is treated as ad-hoc and must be classified.

### 4. Per-element typography checklist (PRESCRIPTIVE format)

The auditor produces **one row per text-bearing element** in the page. The row is verbatim this fenced block:

```
Element: <file:line, surrounding 1-line context>
Current: family=<Fraunces|Inter|JBM|Jacquard|inherited>, weight=<n>, style=<italic|normal>, transform=<uppercase|none|capitalize>, size=<class or computed>, tracking=<value or class>
Nearest canonical utility: <.text-display | .text-title | .text-subtitle | .text-body | .text-body-lead | .text-eyebrow | .text-label | .text-meta | WORDMARK | BUTTON>
Match quality: EXACT | NEAR | GAP
Action: MIGRATE | JUSTIFY-WORDMARK | GAP-LOG-AND-MIGRATE
Rationale: <one line>
```

**Match quality definitions:**

- **EXACT** — every rendering attribute (family, weight, style, transform, size, tracking) matches the chosen utility's spec.
- **NEAR** — chosen utility's *tier and semantic role* match, but one or two rendering attributes drift (e.g., Fraunces italic at `text-2xl` when `.text-title` is `text-3xl md:text-5xl`). Migration is still the right call; near-miss is documented in the Rationale.
- **GAP** — no canonical utility fits the element's semantic role *and* rendering intent. (Example from FRAC-18: small-caps italic Fraunces card title at `text-base` — neither `.text-title` nor `.text-subtitle` matches.) Auditor still picks the nearest utility for migration; gap is recorded.

### 5. Per-element color checklist (PRESCRIPTIVE format)

One row per **distinct color use** (text color, background, border, ring, fill, accent). Group identical uses (e.g., one row for "all card body text uses `text-foreground`").

```
Element: <file:line, surrounding 1-line context>
Current: <hex | hsl | Tailwind class | arbitrary value>
Role: <text | background | border | ring | accent | fill | placeholder>
Nearest canonical token: <token name from section 3>
Match quality: EXACT | NEAR | GAP
Action: MIGRATE | JUSTIFY | GAP-LOG-AND-MIGRATE
Rationale: <one line>
```

**House-scope check:** if the audited page belongs to a house (e.g., Lab → Publications), house tokens on that page must use the page's own house slug (`house-publications-*`). A Lab page using `house-events-light` is a finding (cross-house color leak). Call this out in the Rationale.

### 6. Decision rubric — NO HUMAN IN LOOP

For every Element row, the Action follows deterministically from the Match quality:

| Match quality | Action | What happens in the Apply task |
|---|---|---|
| EXACT | `MIGRATE` | Replace ad-hoc classes/values with the canonical utility/token. |
| NEAR | `MIGRATE` | Same as EXACT. Record the near-miss attribute(s) in the Rationale so the Apply task knows what visual drift to expect. |
| GAP | `GAP-LOG-AND-MIGRATE` | Migrate to the nearest-fit utility/token AND append an entry to `.lattice/notes/audit-gaps.md` (format in section 7). |
| Wordmark (Fractal Collective) | `JUSTIFY-WORDMARK` | Untouched. No migration. |
| Intentional design exception | `JUSTIFY` | Untouched. One-line reason required in Rationale (e.g., "hero treatment, see FRAC-XX"). |

**The auditor never asks a question.** If unsure between MIGRATE and GAP, the auditor errs toward MIGRATE (pick the nearest fit, log the drift in Rationale). If unsure between MIGRATE and JUSTIFY, the auditor errs toward MIGRATE — JUSTIFY is reserved for documented, intentional exceptions.

**The auditor never invents a tier or token.** New tiers/tokens are proposed only in the gaps register, never executed in the Apply task.

### 7. Gap entry format (for audit-gaps.md)

When Action is `GAP-LOG-AND-MIGRATE`, the auditor appends one entry to `.lattice/notes/audit-gaps.md` under the `## Gaps` section. Format:

```
- file:line — <element description>
  Nearest-fit chosen: <utility or token>
  Why it didn't fit: <one line, specific>
  Proposed system change: <one line, e.g., "add .text-card-title tier (Fraunces italic, text-base, small-caps)" or "add --accent-pink-deep token at #C44878">
  Page: <page slug>
  Date: YYYY-MM-DD
```

Multiple gaps from the same page audit accumulate as separate list items, in source order. No deduplication during a single audit; sitewide dedup is a later human task.

### 8. Mobile-first requirement

Per `DESIGN.md` and project CLAUDE.md: every audit reads the page at **375px viewport first**, desktop second. The auditor should:

- Note any element whose rendering changes between mobile and desktop (responsive size classes like `text-3xl md:text-5xl`). These get a single row, listing both renderings under Current.
- Note any element that is hidden at one viewport — flag it in Rationale.
- Layout-shift-only differences (no typography/color change) are out of scope.

### 9. Non-goals

- **Wordmark "Fractal Collective"** — `JUSTIFY-WORDMARK`, untouched.
- **Spacing, layout, animation, interaction** — out of scope. Audit typography + color only.
- **Inventing tiers or tokens** — never. Always log to `audit-gaps.md` and migrate to nearest fit.
- **Button component typography** — locked in `buttonVariants`; auditor flags only ad-hoc `<button>` elements that bypass the Button component.
- **Cross-page changes** — each Audit task is scoped to a single page's source tree (the page file + components it imports that are unique to it). Shared chrome (Navbar, Footer) is audited once via its own task structure if needed; do not re-audit it per page.

### 10. Output format the Audit task must produce

The per-page Audit sub-agent writes exactly one file: `.lattice/notes/audits/<page-slug>-audit.md`. Structure:

```markdown
# <Page name> audit — typography + color

## Page

- Page slug: <slug>
- Source: <primary file path>
- Date: YYYY-MM-DD
- Spec snapshot: `.lattice/notes/audit-prompt.md` (FRAC-19 author date)
- Mobile viewport baseline: 375px

## Typography audit

<one row per element in the format from section 4>

## Color audit

<one row per distinct color use in the format from section 5>

## Gap appendix

<copy of any GAP-LOG-AND-MIGRATE entries also appended to .lattice/notes/audit-gaps.md, OR "No gaps." if none>
```

The Apply task reads only this file to produce its implementation plan. The audit doc is the spec for the Apply PR — its diff is reviewable against the audit doc.

## audit-gaps.md — full content spec

The implementer writes this file as a near-empty register that subsequent audits append to.

```markdown
# Sitewide audit gaps register

Append-only register of typography and color elements that did not fit any
canonical utility/token during per-page audits under FRAC-18. Each entry
represents a system-gap surfaced by an Audit sub-agent and migrated to a
nearest-fit utility/token in the corresponding Apply PR.

This register exists so the gaps accumulate sitewide and can be reviewed in
one batch by a human. Do NOT edit existing entries. Do NOT invent tiers or
tokens here. The register is a human-decision queue, not a system change.

## Entry format

<!--
- file:line — <element description>
  Nearest-fit chosen: <utility or token>
  Why it didn't fit: <one line>
  Proposed system change: <one line>
  Page: <page slug>
  Date: YYYY-MM-DD
-->

## Gaps

<!-- entries appended here by per-page audit sub-agents, in chronological order -->
```

The example entry under "Entry format" is left HTML-commented so the file renders cleanly and the format is still visible to anyone opening the file. The "Gaps" section starts empty (with the inline HTML comment as a hint for the first appender).

## Implementer notes

- **Both files are pure docs.** No source code, no tests, no type-check expected. The standard gates (`pnpm type-check`, `pnpm lint`, `pnpm test`) should still be run as a sanity check, but they verify nothing about the deliverables themselves.
- **Pin the snapshot at write time.** When writing section 2 and section 3 of `audit-prompt.md`, read `DESIGN.md` at HEAD and reproduce the tables verbatim. If anything in DESIGN.md disagrees with this plan file, **DESIGN.md wins** — this plan was written against a known snapshot but DESIGN.md is the live spec.
- **Note about FRAC-17 state.** This plan assumes `.text-title` and `.text-subtitle` will be **mixed-case** post-FRAC-17. If `src/index.css` still has `text-transform: uppercase` on those utilities when the implementer reads it (i.e., FRAC-17 hasn't merged), the implementer should still pin the post-FRAC-17 target spec in the prompt and add a one-line note at the top of section 2 indicating the spec is pinned to the FRAC-17 target state. The orchestrator gates FRAC-19 merge to FRAC-17 merge.
- **No new directories needed.** Both files live directly under `.lattice/notes/`. The per-page audit directory `.lattice/notes/audits/` will be created lazily by the first Audit sub-agent (FRAC-20).
- **No tags, no actor switch.** Use `agent:claude-opus-4-7-impl` for the implementation sub-agent, `agent:claude-opus-4-7-reviewer` for the review sub-agent.

## Acceptance criteria

1. `.lattice/notes/audit-prompt.md` exists and contains all 10 sections in the structure above. Sections 2 and 3 reproduce the type scale and color tokens verbatim from current DESIGN.md.
2. The prompt is prescriptive — no "ask orchestrator" / "human decision required" / "TBD" steps anywhere. The decision rubric (section 6) deterministically assigns one of {MIGRATE, JUSTIFY-WORDMARK, GAP-LOG-AND-MIGRATE, JUSTIFY} to every possible finding.
3. `.lattice/notes/audit-gaps.md` exists with the header, format example (HTML-commented), and empty "Gaps" section.
4. Both files committed on `frac-19-audit-prompt` branch in a single commit.
5. Type-check / lint / test gates: N/A for content, but run as a sanity check that the docs-only commit doesn't accidentally break the build.

## Out of scope

- Filing new Lattice tasks (the umbrella orchestrator already filed FRAC-20 through FRAC-39).
- Running any per-page audit (those are FRAC-20, 22, 24, 26, 28, 30, 32, 34, 36, 38).
- Modifying DESIGN.md, `src/index.css`, or any source file.
- Creating `.lattice/notes/audits/` — first Audit sub-agent creates it.
