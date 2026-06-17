# FRAC-212 — DESIGN.md accuracy: house/text pairings + rounded radii semantics

## Scope

**Doc-only.** Two corrections to `DESIGN.md` so the prose matches verified code reality. No code, no CSS, no component changes. `complexity: low`.

Two edits:
1. **Surface + text pairings** (`### Surface + text pairings`, DESIGN.md lines ~161–172) — replace the value-enumeration table with the LUMINANCE-DRIVEN model the code actually uses.
2. **Rounded scale** (`### Rounded scale`, DESIGN.md lines ~283–292) — replace the bare value table with semantic ROLES, and drop `rounded-xl` as a live value.

## Code reality (verified this session)

### House pages — bg + text (grep over `src/pages/*`)

| Page (file) | bg class | text class | Luminance bucket |
|---|---|---|---|
| Visit (`NeighborhoodPage.tsx:14`) | `bg-house-visit-light` | `text-foreground` (charcoal) | LIGHT |
| Events (`EventsPage.tsx:17`) | `bg-house-events-light` | `text-foreground` (charcoal) | LIGHT |
| Story (`StoryPage.tsx:131,203`) | `bg-background` (cream) | `text-foreground` (charcoal) | LIGHT — **not a house** |
| Campus (`CampusPage.tsx:11`) | `bg-house-campus-light` | `text-background` (cream) | DARK |
| Education (`LiberalArtsPage.tsx:11`) | `bg-house-education-deep` | `text-background` (cream) | DARK |
| Political Club (`PoliticalClubPage.tsx:12`) | `bg-house-political-club-deep` | `text-background` (cream) | DARK |
| Publications (`LabPage.tsx:17`) | `bg-house-publications-light` | `text-background` (cream) | DARK |

**Key insight the current doc misses:** text color is NOT a mechanical function of the `-light`/`-deep` token suffix. Campus and Publications both use a `-light` background token yet pair it with cream `text-background`, because those `-light` hexes (`#2E6B4A`, `#E870A0`) are dark/saturated enough that charcoal would fail contrast. The driver is the **perceived luminance of the actual surface**, not the token's light/deep label. The current table (`House light (saturated) + text-background` / `House deep (saturated) + text-background`) implies both house variants always take cream text and is keyed off the suffix — that's the stale framing to fix.

- LIGHT-enough surfaces (cream `background`, the olive `house-visit-light`, the dusty-rose `house-events-light`) → charcoal `text-foreground`.
- DARK/saturated surfaces (charcoal `foreground`, and every other house fill in active use) → cream `text-background`.

### Secondary text token

- `foreground-light` — **0 occurrences** in `src/` (deleted in an earlier PR; confirmed by grep). DESIGN.md already does NOT mention it — do NOT re-introduce it.
- `foreground-muted` (`#525252`, `--foreground-muted: 0 0% 32%`) is the live secondary/muted text token (used in NeighborhoodPage, lab components, etc.). DESIGN.md's Surface palette table already documents it correctly at line 110. The pairings section should reference `text-foreground-muted` (not `foreground-light`) if/when it mentions secondary text.

### Publications contrast concern

`LabPage.tsx` floods the page with `bg-house-publications-light` (`#E870A0`, a bright pink) under cream `text-background`. Cream-on-pink is a known borderline-contrast pairing worth a revisit. Flag it in the doc as a known concern (do not change code).

### Rounded radii — verified usage (grep `rounded-` over `src/`)

| Class | Count | Where | Semantic role |
|---|---|---|---|
| `rounded-sm` | 1 | `GalleryImage.tsx:24` | **images** |
| `rounded-md` | many | `button.tsx:35`; inputs/comboboxes (`Hero.tsx:198,242`, `ArchiveSearch.tsx:124`); navbar menu buttons (`Navbar.tsx:298,327,356`); note container (`NeighborhoodPage.tsx:61` MandelbrotCorners); embed panel (`EventsPage.tsx:47`); icon badges (`DocumentBadge.tsx:70`, `StoryPage.tsx:149`) | **interactive controls** (buttons, inputs, dropdowns, navbar menu buttons) AND **containers** (note containers, embeds) |
| `rounded-lg` | 3 | `ArchiveSearch.tsx:76`, `DocumentBadge.tsx:58`, `StoryPage.tsx:131` | **cards** |
| `rounded-full` | 3 | tag-filter pills (`TagFilter.tsx:51`); accent bars (`DocumentBadge.tsx:110`, `StoryPage.tsx:189`) | **pill shapes**: tag-filter pills + accent bars |
| `rounded-xl` | **0** | — | **DEAD** — remove from doc as a live value |

Note: `--radius-xl: 1rem` still exists in `src/index.css:61` and in the DESIGN.md YAML frontmatter (`rounded.xl`, line 31). The YAML is the machine token mirror of CSS; since this is a doc-only task and the token still exists in CSS, the YAML mirror is left as-is. The fix targets the human-readable **prose** "Rounded scale" table, where `rounded-xl` should not be listed as a live shape value. (If desired, a one-line parenthetical can note that `rounded.xl` is declared but currently unused.)

## Edits

### Edit 1 — `### Surface + text pairings` (lines ~161–172)

Rewrite the section so it leads with the luminance model, then gives the canonical mappings. Target content:

- Opening: two text colors carry the site — charcoal (`text-foreground`) and cream (`text-background`) — and **which one a surface takes is driven by the surface's perceived luminance, not by the `-light`/`-deep` token name.**
- Replace the 4-row "Surface | Pair" table with a luminance-bucketed table, e.g.:

  | Surface luminance | Text | Examples |
  |---|---|---|
  | Light (cream + light house fills) | `text-foreground` (charcoal) | `bg-background`, `bg-house-visit-light`, `bg-house-events-light` |
  | Dark / saturated (charcoal + dark/saturated house fills) | `text-background` (cream) | `bg-foreground`, `bg-house-campus-light`, `bg-house-education-deep`, `bg-house-publications-light`, `bg-house-political-club-deep` |

  Make explicit that Campus and Publications use a `-light` background token but still take cream text because the fill is dark/saturated — the suffix doesn't decide the text color, the luminance does.
- Add a line on secondary text: muted/supporting text uses `text-foreground-muted` (NOT `foreground-light`, which was removed).
- Keep the existing sentence about re-asserting `text-foreground` on nested cream surfaces.
- Add a **known concern** note: the Publications page floods `house-publications-light` (`#E870A0`, bright pink) under cream text — cream-on-pink is a borderline-contrast pairing to revisit.

Keep the Story line consistent with the existing Non-house section colors section (Story = cream + charcoal, single gold accent).

### Edit 2 — `### Rounded scale` (lines ~283–292)

Replace the bare "Token | Value" table (which lists `rounded.xl`) and the `rounded-full` sentence with a **semantic role** table:

| Class | Role | Example |
|---|---|---|
| `rounded-sm` | images | `GalleryImage` |
| `rounded-md` | interactive controls (buttons, inputs, dropdowns, navbar menu buttons) and containers (note cards, embeds) | `button.tsx`, Hero combobox, `NeighborhoodPage` note |
| `rounded-lg` | cards | `DocumentBadge`, `ArchiveSearch`, Story TalkCard |
| `rounded-full` | pill shapes: tag-filter pills and accent bars | `TagFilter`, accent bars |

- Do NOT list `rounded-xl` as a live value. Optionally a single parenthetical: "`rounded.xl` is declared in tokens but currently unused."
- Fold the existing `rounded-full` "pill and circular shapes" sentence into the table row (avatar badges note can stay only if accurate; verified `rounded-full` uses are pills + accent bars).

Leave the surrounding "Shapes" intro, Mandelbrot corners, and Pennant banner subsections untouched.

## Acceptance criteria

- `DESIGN.md` Surface + text pairings section describes the **luminance-driven** text model (not a `-light`/`-deep` suffix rule), explicitly notes Campus & Publications take cream text despite `-light` bg tokens, references `text-foreground-muted` for secondary text, and flags the Publications cream-on-pink contrast concern.
- `DESIGN.md` Rounded scale section documents **semantic roles** (image / interactive+container / card / pill) and does NOT present `rounded-xl` as a live shape value.
- No mention of `foreground-light` anywhere in DESIGN.md as a live token.
- No code, CSS, or YAML-token changes (prose tables only). Existing unrelated DESIGN.md content unchanged.
- Claims in the doc match grep-verified code reality (file refs above).
