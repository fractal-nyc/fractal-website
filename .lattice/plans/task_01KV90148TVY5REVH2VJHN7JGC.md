# FRAC-205: Restyle Story as a cream non-house section + tokenize

## Design decision (human-set)
Story is **not a house**, so it should read distinctly from the color-flooded house pages:
**cream background, charcoal text, editorial calm.** Collapse Story's three golds to a single
identity accent.

Today Story uses three golds (`src/pages/StoryPage.tsx` + Navbar + OctahedronHero):
- `#DFCA7A` — page background (pale gold; **drop → cream**)
- `#8A7A20` — deep accent: `--btn-accent`, `FractalPattern`, `SectorHeader` (**collapse → `#D4BA58`**)
- `#D4BA58` — `STORY_COLOR` (nav swatch, TalkCard accents) — **becomes the one identity color**

`#D4BA58` is the only one legible on cream (the pale `#DFCA7A` being invisible on the cream
navbar is exactly why the 3rd color was bolted on).

## Scope

### 1. Single source + token
- Add `story` to `SECTIONS` in `src/data/houses.ts`. Story has a single identity accent (cream
  is just `background`), so model it as `story: { accent: "#D4BA58" }`. (People stays
  `{ light, deep }` — sections may differ in shape; both are non-house.)
- Add `--color-section-story: #D4BA58;` to the `@theme` block in `src/index.css`.

### 2. Restyle `src/pages/StoryPage.tsx` (the live redesign)
- Page `<main>`: drop inline `backgroundColor: "#DFCA7A"` → `bg-background text-foreground`
  (charcoal on cream). Keep selection consistent with other pages
  (`selection:bg-foreground selection:text-background`).
- `--btn-accent` → `var(--color-section-story)` (was `#8A7A20`).
- `FractalPattern color` → `var(--color-section-story)` or `#D4BA58` (was `#8A7A20`).
- `SectorHeader color` → `var(--color-section-story)` or `#D4BA58` (was `#8A7A20`).
- `STORY_COLOR` const → reference `SECTIONS.story.accent` (value `#D4BA58` unchanged, just
  sourced). TalkCards already sit on `bg-background` (cream) with `#D4BA58` accents — preserved;
  **keep all TalkCard text charcoal** (no gold text).
- No raw `#DFCA7A` / `#8A7A20` / `#D4BA58` left in StoryPage.
- IMPORTANT: text stays charcoal (`text-foreground`) throughout — gold is accents/decorative
  only (gold-on-cream fails WCAG for small text).

### 3. Repoint the other two sites (value `#D4BA58` unchanged — just sourced)
- `src/components/layout/Navbar.tsx`: Story nav-item color reads `SECTIONS.story.accent` (real
  hex — JS string), replacing raw `"#D4BA58"`.
- `src/components/three/OctahedronHero.tsx`: the `story` face reads `SECTIONS.story.accent`
  (three.js needs real hex), replacing raw `"#D4BA58"`.

### 4. Extend the sync test
Update `src/__tests__/section-tokens-sync.test.ts` to also assert `SECTIONS.story` matches
`--color-section-story` (handle the single-accent shape alongside People's light/deep). Keep
non-vacuous.

### 5. DESIGN.md
Document **Story as a cream section with a single gold accent (`section-story` `#D4BA58`)**,
and state the principle — *houses get color-flooded pages; non-house sections read as
cream/editorial* — with the rationale (the pale page gold was illegible on the cream nav).
People remains a flooded section. Update the token count (+1 section token).

### 6. Conformance baseline
`node scripts/design-conformance.mjs --update-baseline`; `pnpm conformance` must pass.
`#DFCA7A` and `#8A7A20` should DROP OUT of the baseline once removed — verify the baseline
shrinks by exactly those two values, confirming they're fully gone.

## Acceptance criteria
- No raw `#DFCA7A` / `#8A7A20` anywhere in `src/`; `#D4BA58` only in `houses.ts` (SECTIONS) +
  `index.css`.
- Story page: cream bg, charcoal text, `#D4BA58` accents; no gold flood.
- section-sync test passes (people + story) and is non-vacuous.
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; `pnpm test` green except the
  pre-existing FRAC-199 failures — no NEW failures. There ARE Story-related tests (e.g.
  justified-paragraph / story); check none assert the old gold bg — if one does, update it to
  the new cream design and note it.
- DESIGN.md updated.

## NOTE — visual approval before merge
This changes a LIVE page's look. After implementation + cold review, the **orchestrator runs
the dev server and the human views `/story`** before merging. If the `#D4BA58` FractalPattern
reads too faint on cream, the fallback is to keep `#8A7A20` for the pattern only (a second,
deeper section token) — do NOT do that pre-emptively; wait for the visual call.

## Out of scope
- Re-flooding or changing People.
- The houses↔css duplication (sync test stays the approach).
