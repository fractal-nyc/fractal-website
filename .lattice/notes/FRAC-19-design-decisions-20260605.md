# FRAC-19 design decisions — answers to the 8 open questions from FRAC-23 gap analysis

**Source:** Live conversation between human (jannar18) and agent:claude-opus-4-7-orchestrator, 2026-06-05.
**Status:** Authoritative input for FRAC-19 (DESIGN.md authoring). The planning sub-agent for FRAC-19 must read this in full before writing the plan.
**Gap analysis under review:** `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md` (FRAC-23), PR #164.

---

## 1. `--font-sans` is now Inter

- DESIGN.md declares **two distinct typography tokens**:
  - `font-sans: { fontFamily: "Inter, system-ui, sans-serif" }`
  - `font-mono: { fontFamily: "JetBrains Mono, monospace" }`
- This is a deliberate change from shipped reality (which has both = JetBrains Mono).
- **Out of FRAC-19 scope:** the actual source change (add Inter Google Font import, swap `--font-sans` value in `src/index.css`). Spin a follow-up task: *"FRAC-XX: Add Inter font import and migrate --font-sans"*.
- DESIGN.md prose should note the divergence: "the codebase has `--font-sans` ≡ JetBrains Mono as a known short-term artifact of pre-DESIGN.md; the canonical token is Inter and a cleanup task (FRAC-XX) will land it."

## 2. `primary` = charcoal; accept the lint warning

- DESIGN.md declares `colors.primary: "#171717"`.
- `npx @google/design.md@0.2.0 lint` will fire a `missing-primary` warning (severity: warning, not error). This is **expected and accepted**.
- Prose in DESIGN.md should explicitly say: "`primary` is the dominant text color (charcoal), not a brand accent. The site's voice is charcoal-on-cream; we accept the design.md `missing-primary` warning as deliberate."
- Do NOT introduce a brand-color slot; do NOT rename to `brand`; do NOT add a separate `text-default` token.

## 3. Spacing: inventory now, simplify next

- DESIGN.md `spacing:` key declares only the **actually-used** spacing values (the impl agent must grep `py-{N}` / `px-{N}` / `gap-{N}` / `space-y-{N}` etc. across `src/` to find them).
- Do NOT invent a clean scale; do NOT prescribe values that aren't in shipped code.
- Spin a follow-up task: *"FRAC-XX: Collapse ad-hoc spacing values into a canonical scale"* — to be done after FRAC-19 lands, using the inventory as input.

## 4. Components: Button + HouseBanner

- DESIGN.md `components:` entries:
  - `button-default`, `button-outline`, `button-ghost`, `button-link` (one entry per Button variant, since each has different `backgroundColor` / `textColor` / `rounded` / `padding`).
  - `house-banner` (single entry; per-house theming happens via token refs to `house-{displayname-slug}-{light|deep}`).
- AvatarBadge gets a **prose-only** mention in the Components section ("AvatarBadge: small house identity chip, themed via house palette tokens, not modeled as a component entry due to its small surface area").
- Navbar wordmark, Hero combobox, OctahedronHero: prose only. They exceed design.md's closed property set.

## 5. House tokens use displayName slugs

- Token naming convention: `house-{displayname-slug}-{light|deep}`. **All lowercase, kebab-cased.**
- DESIGN.md MUST include an explicit mapping table for auditability:

  | Internal ID (in `houses.ts`) | Display name | Token slug |
  |---|---|---|
  | `neighborhood` | Visit | `house-visit-{light,deep}` |
  | `events` | Events | `house-events-{light,deep}` |
  | `campus` | Campus | `house-campus-{light,deep}` |
  | `school` | Education | `house-education-{light,deep}` |
  | `forum` | Political Club | `house-political-club-{light,deep}` |
  | `lab` | Publications | `house-publications-{light,deep}` |

- Token values (verified against `src/data/houses.ts` at HEAD `c07192f` by the FRAC-19 planner; **the original draft of this table had stale, made-up values — corrected here 2026-06-05**):

  | Token | Hex (HEAD) |
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

  *(Impl agent should still re-verify against `src/data/houses.ts` at HEAD before writing — palette values shift fast across sibling branches.)*

- Prose section MUST explain the forum/school page-bg inversion rule (forum and school pages use their `deep` shade as page background; other houses use `light`).

## 6. Canonical charcoal: `#171717`

- DESIGN.md declares `colors.foreground: "#171717"` (matches `--foreground` HSL `0 0% 9%`).
- The 4 raw `#1a1a1a` literal sites (`OctahedronHero.tsx:584,801` and `HouseBanner.tsx:96-97`) are **drift**, not canonical.
- Spin a follow-up task: *"FRAC-XX: Replace 4 raw `#1a1a1a` literals with `--foreground`"*.
- Do NOT introduce a separate `charcoal-deep` token. The difference between `#171717` and `#1a1a1a` is invisible and not intentional.

## 7. Lab purple `#6B4C9A` is dead

- **DESIGN.md does NOT declare a `house-publications-accent` or `lab-purple` token.** Lab/Publications has exactly two color tokens: `house-publications-light` (`#E870A0`) and `house-publications-deep` (`#C44878`).
- The 8 raw `#6B4C9A` sites in `src/components/lab/` (`TagFilter`, `DocumentBadge`, `ArchiveSearch`, `ArchiveToolbar` — including the `LAB_COLOR` const) are **legacy from before the palette migration (pre-FRAC-24)** and must be replaced with Lab's actual palette pinks.
- The `color: "#6B4C9A"` field on the Lab entry in `houses.ts` is dead legacy and should be removed entirely.
- **FRAC-34 scope is rewritten:** it's no longer "tokenize the purple"; it's "remove the purple, replace 8 sites with `palette.deep` (or `palette.light` where contrast permits)."
- DESIGN.md prose can mention: "Lab/Publications uses its palette pinks for accents; no third color is canonical."

## 8. Pin `@google/design.md@0.2.0`

- Lint command everywhere: `npx @google/design.md@0.2.0 lint DESIGN.md`.
- Any future bump is a deliberate, separate task.
- Alpha-stage spec means breaking changes can land upstream — pinning prevents surprise CI failures.

---

## Follow-up tasks to spin (orchestrator will create these in Lattice when FRAC-19 wraps)

1. **Add Inter font import + swap `--font-sans` value** (~10 LOC; touches `index.html` or wherever fonts are imported, plus `src/index.css`).
2. **Collapse ad-hoc spacing into canonical scale** (uses FRAC-19's inventory as input; touches every page's `py-N` / `gap-N` usage).
3. **Normalize `#1a1a1a` → `--foreground` (4 sites)** (`OctahedronHero.tsx:584,801`, `HouseBanner.tsx:96-97`).
4. **FRAC-34 (rewrite scope): remove `#6B4C9A`, replace with Lab palette pinks** (8 sites + drop the legacy `color` field from `lab` entry in `houses.ts`).

---

## Decisions NOT re-debated (from session handoff `handoff-2026-06-05-design-md.md`)

The 10 locked decisions from the handoff still apply. The 8 answers above are *in addition to* those, not a replacement.
