# FRAC-17: Typography spec change — drop uppercase from `.text-title`; drop italic + uppercase from `.text-subtitle`

## Scope

Spec-only change to the canonical Fraunces display tier: `.text-title` drops uppercase (italic + mixed case); `.text-subtitle` drops both uppercase and italic (upright thin + mixed case). DESIGN.md is the source of truth and updates first; `src/index.css` follows. No component sweeps, no per-page audit, no `normal-case` cleanup — those land in FRAC-18.

## Files to change

### `DESIGN.md` (Semantic type scale table at lines 210–216)

- **Line 215** — `.text-title` row, change rendering column:
  - From: `italic, uppercase, tracking 0.04em`
  - To: `italic, tracking 0.04em`
- **Line 216** — `.text-subtitle` row, change rendering column:
  - From: `italic, weight 300, uppercase, tracking 0.04em`
  - To: `upright, weight 300, tracking 0.04em`
- **Line 214** — `.text-display` row: no change (uppercase remains; it is the only uppercase tier in the Fraunces display group).

**Prose audit (no changes needed):** I read every `uppercase` / `italic` reference in DESIGN.md against the locked spec:

| Line | Reference | Action |
|---|---|---|
| 100, 278 | Site-voice prose ("oversized italic Fraunces headings") | No change — still accurate for `.text-display` / `.text-title` |
| 196 | Fraunces global `h1–h6` rule (italic + uppercase via `src/index.css:90-94`) | No change — global h-tag rule is separate from the `.text-title`/`.text-subtitle` utilities and is **out of scope** |
| 197 | Jacquard 24 opts out of global uppercase + italic | No change |
| 201–203 | "Global type rules (prose-only)" — describes `body`, `h1–h6`, `.font-serif` global rules | No change — these are global Fraunces rules, not the semantic utilities |
| 244 | `.display-roman` escape hatch description | No change |
| 345, 348 | Do's: "global `h1–h6` italic + uppercase rule", "global uppercase + italic-Fraunces rule" | No change — these refer to the global rule, not the semantic utilities |
| 239–242 | Button typography (mono uppercase) | Out of scope (button tier) |
| 229 | `.text-eyebrow` chrome tier uppercase | Out of scope (chrome tier) |

Net DESIGN.md edits: 2 table cells (lines 215, 216).

### `src/index.css` (Semantic utility classes at lines 167–180)

- **`.text-title` at lines 167–172** — remove line 170 (`text-transform: uppercase;`). Final block:
  ```css
  .text-title {
    @apply font-serif text-3xl md:text-5xl;
    font-style: italic;
    letter-spacing: 0.04em;
  }
  ```
- **`.text-subtitle` at lines 174–180** — remove line 178 (`text-transform: uppercase;`) AND change line 176 from `font-style: italic;` to `font-style: normal;`. Final block:
  ```css
  .text-subtitle {
    @apply font-serif text-xl md:text-2xl;
    font-style: normal;
    font-weight: 300;
    letter-spacing: 0.04em;
  }
  ```
- **`.text-display` at lines 158–164** — no change.

## Acceptance criteria

- DESIGN.md table rows for `.text-title` (line 215) and `.text-subtitle` (line 216) reflect the new spec.
- `npx @google/design.md@0.2.0 lint DESIGN.md` passes.
- `.text-title` in `src/index.css` no longer applies `text-transform: uppercase`; it remains italic + tracking 0.04em.
- `.text-subtitle` in `src/index.css` no longer applies `text-transform: uppercase` and is upright (`font-style: normal`); weight 300 + tracking 0.04em retained.
- `.text-display` is unchanged.
- `pnpm typecheck` and `pnpm test` pass (no NEW failures; pre-existing failures permitted are: footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood `min-h-screen`).

## Mobile-first

This is a `text-transform` / `font-style` change only — no layout, no sizing, no breakpoint behavior changes. The 375px viewport experience is identical to desktop other than text rendering. No screenshot pass required at this stage (those land in FRAC-18 with the component sweep).

## Quality gates

- `npx @google/design.md@0.2.0 lint DESIGN.md` — must pass (DESIGN.md is source of truth).
- `pnpm typecheck` — must pass.
- `pnpm test` — must not introduce new failures beyond the known pre-existing set.

## Out of scope (handled by FRAC-18)

- Sweeping ad-hoc Fraunces leftovers in `src/components/sections/*.tsx` and `src/pages/*.tsx` to canonical utilities.
- Stripping now-redundant `normal-case` from existing `.text-title` / `.text-subtitle` call sites.
- Per-page visual checks at 375px viewport.
- Body / chrome tier changes (`.text-body`, `.text-eyebrow`, etc.).
- Button typography changes.
- Introducing new utilities (e.g. `.text-body-serif`).
- Killing or revising the global `.font-serif { italic; uppercase }` rule at `src/index.css:96` or the global `h1–h6` italic + uppercase rule.
