# FRAC-42: Surface-foreground token pairing convention + Publications pair migration

**Task:** task_01KTMFG9QW3JYM6733JC0QWQ02
**Branch:** frac-42-surface-foreground-pairing (off master)
**Depends on:** FRAC-21 (merged via PR #182)
**PRD:** `.lattice/plans/FRAC-22.md`
**Mobile viewport baseline:** 375px (non-negotiable)

## Scope

Codify the shadcn/Material-3 paired-foreground token convention as a system rule. Declare the two missing foreground sibling tokens for Publications (the only house pair declared today). Migrate the one off-pattern call site (LabPage `<main>`). Tighten the audit prompt so future audits catch unpaired surfaces.

**No rendering changes** — every edit is on-pattern and resolves to the same pixel output.

### Four canonical pairs

1. **Neutral light**: `bg-background` + `text-foreground` (implicit, no new token)
2. **Neutral dark**: `bg-foreground` + `text-background` (implicit inverse, no new token)
3. **House light**: `bg-house-{X}-light` + `text-house-{X}-light-foreground` (new per house)
4. **House deep**: `bg-house-{X}-deep` + `text-house-{X}-deep-foreground` (new per house)

For Publications, both foreground siblings resolve to `var(--color-background)` (cream).

### In scope

- `DESIGN.md` — add `### Surface foreground pairing` subsection under `## Colors`, after `### Text foregrounds`.
- `src/index.css` — add 2 lines for the Publications foreground siblings.
- `src/pages/LabPage.tsx` — swap `text-background` → `text-house-publications-light-foreground` on `<main>`.
- `.lattice/notes/audit-prompt.md` — add "Surface-foreground pairing check" to the color audit section.

### Out of scope

- Other 5 house pairs' foreground siblings — they don't exist yet (only Publications); they land with per-house Apply tasks.
- Other pages with surface declarations — per-page sweep happens in their Apply tasks.
- `DocumentBadge.tsx` — the FRAC-21 inline fix (`bg-background text-foreground` on card root) is already the canonical pair. **No edit.** Documented to prevent churn.
- CSS-level auto-flip mechanisms (`color-contrast()`, `light-dark()`) — insufficient browser support; rejected.

## Pre-existing repo state

Two categories of dirty files at branch start:

**A. Absorb in commit 1:**
- `.lattice/events/task_01KTJQEZR4FB08WV8M4DDMB14E.jsonl` (FRAC-20 wrap-up)
- `.lattice/tasks/task_01KTJQEZR4FB08WV8M4DDMB14E.json` (FRAC-20)
- `.lattice/events/task_01KTMFG9QW3JYM6733JC0QWQ02.jsonl` (FRAC-42 lifecycle)
- `.lattice/tasks/task_01KTMFG9QW3JYM6733JC0QWQ02.json` (FRAC-42)
- `.lattice/events/_lifecycle.jsonl` and `.lattice/ids.json` (global state)

**B. Do NOT touch (shared worktree discipline):**
- `.claude/`, `notes/.recovered/`, `notes/.tmp/`, `notes/CR-FRAC-21-*.md`, `task_01KTCYBYPNSW6W0MHMR9VK3C9K.md`
- Sibling FRAC-40 files (`task_01KTMC9W2DMVSY3ZYP2816ECRP.*`)
- Sibling FRAC-43 files (`task_01KTMG9MJQARW182SFQ1WGQCXA.*`)

Stage explicitly by filename; never `git add -A` or `git add .`.

## Decision 1 — DESIGN.md: new subsection

Insert after `### Text foregrounds`. Voice matches FRAC-20's prescriptive style.

Exact content:

```markdown
### Surface foreground pairing

Every surface token has a paired foreground token. Authors who reach for a surface utility (`bg-*`) on a container reach for the matching foreground utility (`text-*`) on the same node — never relying on the page-level text-color cascade to "still be correct" inside a nested surface. This is the same convention shadcn/ui and Material 3 use, adapted to the four surface families this system declares.

The four canonical pairs:

| Surface | Pair | Source of the foreground |
|---|---|---|
| Neutral light (cream) | `bg-background` + `text-foreground` | Implicit — `--color-foreground` already exists. No new token. |
| Neutral dark (charcoal as surface) | `bg-foreground` + `text-background` | Implicit inverse — `--color-background` already exists. No new token. |
| House light | `bg-house-{slug}-light` + `text-house-{slug}-light-foreground` | New sibling token per house. |
| House deep | `bg-house-{slug}-deep` + `text-house-{slug}-deep-foreground` | New sibling token per house. |

For every house pair declared today, the light- and deep-foreground siblings resolve to `var(--color-background)` (cream). Cream on saturated house surfaces is the editorial voice; the foreground tokens exist to make the pairing explicit at the call site, not to vary the value.

**Why explicit foreground tokens on saturated surfaces?** Surfaces compose. A cream-card-on-house-page chain (`bg-house-publications-light` → `bg-background`) breaks if the inner surface omits its paired foreground: text inside the card inherits `text-background` from the cascade and renders cream-on-cream. The paired token forces every surface to re-assert its own voice, which is the only way nested surfaces compose correctly. (FRAC-21 review caught exactly this regression — DocumentBadge `h3` titles rendered invisible at 375px.)

**Out of scope today:** Only the Publications pair has its foreground siblings declared (FRAC-42, after FRAC-21). The other five houses' siblings land with their respective per-house Apply tasks; the pairing rule applies to them ahead of declaration.
```

## Decision 2 — src/index.css: add Publications foreground siblings

Inside `@theme inline`, immediately after `--color-house-publications-deep`. Extend the existing FRAC-21 comment block.

Replace the existing FRAC-21 Publications token block with:

```css
  /* House palette tokens (FRAC-21) + paired foregrounds (FRAC-42).
     Static brand hexes — declared directly without the hsl(var(...))
     indirection used by surface tokens above, because house colors do
     not theme-swap (no dark mode per FRAC-30) and the indirection
     would add no value. See DESIGN.md → House palette values for the
     full set; FRAC-21 lands only the Publications pair (the remaining
     5 pairs land in their respective per-house Apply tasks).

     Each house surface ships an explicit *-foreground sibling per the
     shadcn/Material-3 pairing convention (FRAC-42). Today both
     Publications foreground siblings resolve to cream; see DESIGN.md
     → Surface foreground pairing for the rule and the four canonical
     pairs. */
  --color-house-publications-light: #E870A0;
  --color-house-publications-deep: #C44878;
  --color-house-publications-light-foreground: var(--color-background);
  --color-house-publications-deep-foreground: var(--color-background);
```

`var(--color-background)` inside `@theme inline` is supported by Tailwind v4 (resolved at theme-flatten time).

## Decision 3 — src/pages/LabPage.tsx: callsite migration

Single edit on the `<main>` element.

**Before:**
```jsx
<main className="relative min-h-screen bg-house-publications-light text-background selection:bg-foreground selection:text-background">
```

**After:**
```jsx
<main className="relative min-h-screen bg-house-publications-light text-house-publications-light-foreground selection:bg-foreground selection:text-background">
```

Rendering-equivalent (both `text-background` and `text-house-publications-light-foreground` resolve to cream). On-pattern under FRAC-42.

The `selection:` pair stays untouched — selection chrome is an inverted state, exempt from the pairing rule.

## Decision 4 — DocumentBadge.tsx: verify only, no edit

The FRAC-21 inline fix added `text-foreground` next to `bg-background` on the card root. That's already the canonical neutral-light pair under FRAC-42's rule. No edit needed. Document the verification in commit 4.

## Decision 5 — .lattice/notes/audit-prompt.md: add pairing check

Add a new subsection inside the per-element color audit section. Best placement: as a sibling to existing rule-based checks. Read the file's structure to confirm exact insertion point.

Exact content:

```markdown
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
```

## Test plan

1. `pnpm typecheck` — clean.
2. `pnpm test` — exactly the 4 documented baseline failures (footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood min-h-screen). No new failures.
3. `pnpm build` — succeeds.
4. **Mobile 375px**: `/lab` hero is cream-on-pink (pixel-equivalent); DocumentBadge h3 titles render charcoal-on-cream (FRAC-21 fix preserved); selection chrome unchanged.
5. **Desktop 1280px**: same checks.

If sandbox blocks dev server, fall back to compiled-CSS inspection of the new utility (`text-house-publications-light-foreground` should resolve to cream `#f8f6f0` in dist/assets/index-*.css).

## Acceptance criteria

1. DESIGN.md has the new `### Surface foreground pairing` subsection per Decision 1.
2. src/index.css has both Publications foreground siblings declared per Decision 2, with extended comment block.
3. LabPage.tsx `<main>` uses `text-house-publications-light-foreground` per Decision 3. `selection:` chrome retained.
4. DocumentBadge.tsx card root unchanged (`bg-background text-foreground` still present).
5. audit-prompt.md has the new pairing check subsection per Decision 5.
6. 3-4 logical commits per Commit strategy.
7. Typecheck, build, tests clean (baseline failures only).
8. `/lab` renders pixel-equivalent at 375px and 1280px.
9. PRD check: mobile-first respected, no PRD contradiction.

## Commit strategy

**Commit 1 — lattice state catchup.** Absorb pre-existing dirty `.lattice` files. Subject: `FRAC-20/42: lattice state catchup`. Stage explicitly by filename.

**Commit 2 — Publications foreground tokens.** `src/index.css` only. Subject: `FRAC-42: add Publications light/deep -foreground sibling tokens`. Body cites shadcn/Material-3 convention + FRAC-21 regression motivation.

**Commit 3 — DESIGN.md + audit-prompt.** System documentation. Subject: `FRAC-42: document Surface foreground pairing rule + audit check`.

**Commit 4 — LabPage migration.** `src/pages/LabPage.tsx` only. Subject: `FRAC-42: migrate LabPage main surface to paired foreground token`. Body notes DocumentBadge verified on-pattern, no edit needed.

## Open questions

None — all decisions baked from origin comment + FRAC-21 precedent.

## Implementation order

1. Read this plan; re-read FRAC-22 PRD.
2. Verify `git status` matches pre-existing state section.
3. Commit 1 (lattice catchup) — stage explicit files, commit.
4. Edit src/index.css → commit 2.
5. Edit DESIGN.md + audit-prompt.md → commit 3.
6. Edit LabPage.tsx → commit 4.
7. Run full test plan.
8. Lattice transition to `review`.
