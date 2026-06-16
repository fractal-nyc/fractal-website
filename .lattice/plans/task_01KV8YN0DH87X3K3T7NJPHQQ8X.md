# FRAC-204: Tokenize People as a non-house section color

## Context
The People page is a deferred (hidden-from-launch) **non-house section** with a regular
`{ light: "#C49040", deep: "#B65D19" }` pair — structurally identical to a house page, but
not in `HOUSES`. Its hex is currently hardcoded in **3 places**:
- `src/pages/PeoplePage.tsx` — `backgroundColor: "#C49040"`, `--btn-accent: "#B65D19"`,
  `FractalPattern color="#B65D19"`, `SectorHeader color="#B65D19"`.
- `src/components/layout/Navbar.tsx` — the People nav-item `color: "#C49040"`.
- `src/components/three/OctahedronHero.tsx` — the `people: "#C49040"` face color.

**Architecture invariant (same as houses, FRAC-203):** `OctahedronHero` feeds colors to
three.js and `Navbar` uses the color in JS — both need a **real hex** value, not a CSS
`var()`. So People needs a canonical **real-hex data home**; the `@theme` token is the
derived mirror, kept in sync by a test.

## Scope

### 1. A single real-hex source for non-house section colors
Introduce a small **non-house "section" color model** (real hex). Read `src/data/houses.ts`
first and pick the cleanest home — preferred: add an exported `SECTIONS` record/array there
(cohesive with `HOUSES`), e.g.:
```
export const SECTIONS = {
  people: { light: "#C49040", deep: "#B65D19" },
  // story added in a later task
} as const;
```
This becomes the ONE place People's hex lives.

### 2. @theme tokens mirroring it (`src/index.css`)
Add, in the palette block (direct hex, like house tokens):
```
--color-section-people-light: #C49040;
--color-section-people-deep: #B65D19;
```

### 3. Repoint the 3 usage sites
- `PeoplePage.tsx`: use `bg-section-people-light` on the `<main>` (replacing inline
  `backgroundColor`), `--btn-accent: var(--color-section-people-deep)`, and
  `FractalPattern` / `SectorHeader` `color="var(--color-section-people-deep)"`. No raw
  `#C49040`/`#B65D19` left. (Mirror the structure of the house pages.)
- `Navbar.tsx`: the People nav-item color reads from `SECTIONS.people.light` (import it)
  instead of the raw `"#C49040"`. (Navbar passes the color as a JS string — real hex from
  the data model is correct here, NOT a `var()`.)
- `OctahedronHero.tsx`: the `people` face color reads from `SECTIONS.people.light` instead
  of raw `"#C49040"` (three.js needs the real hex).

### 4. Extend the sync test
Update `src/__tests__/house-tokens-sync.test.ts` (or add a sibling
`section-tokens-sync.test.ts`) to also assert `SECTIONS` entries match their
`--color-section-<name>-{light,deep}` `@theme` tokens (hex-equal, both present, no orphans),
exactly like the house-token check. Keep it non-vacuous (must fail if a value drifts).

### 5. DESIGN.md
Add a short note introducing **non-house section colors** (`section-people-*`) as a small
category distinct from the six houses — used by section pages that aren't houses (People
now; Story later) — and reiterate People is intentionally deferred from launch but kept
tokenized/launch-ready. Update the color-token count/prose if it states a total.

### 6. Conformance baseline
`node scripts/design-conformance.mjs --update-baseline`; `pnpm conformance` must pass.
(`houses.ts`/`SECTIONS` still hold the hex, so the values stay grandfathered; the page's
raw hexes drop out.)

## Acceptance criteria
- People's hex (`#C49040`/`#B65D19`) appears in exactly ONE source (`SECTIONS`) + the
  mirrored `@theme` tokens + the regenerated baseline. `grep -rnE "#C49040|#B65D19" src/`
  shows NO occurrences in `PeoplePage.tsx`, `Navbar.tsx`, or `OctahedronHero.tsx` (only in
  `houses.ts` SECTIONS and `index.css`).
- The section-sync test passes and is non-vacuous (would fail on a drifted hex).
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; `pnpm test` green except the
  pre-existing FRAC-199 failures (7 failed) — the new section-sync assertion(s) PASS, no NEW
  failures.
- People page renders identically (golden `#C49040` bg, `#B65D19` accent); the People nav
  swatch and octahedron face are unchanged colors.
- DESIGN.md note added.

## Out of scope
- **Story** (live + irregular 3rd color `#D4BA58` that's neither its light nor deep — needs a
  design decision on whether it's a 3rd token or normalizes; separate task).
- Codegen to eliminate the data↔css duplication (the sync test remains the chosen approach).
