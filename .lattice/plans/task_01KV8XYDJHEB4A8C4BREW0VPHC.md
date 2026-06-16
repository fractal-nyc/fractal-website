# FRAC-203: Tokenize Political Club + house-token sync check

## Context
Political Club is a real house (`HOUSES` id `"forum"`, displayName "Political Club",
palette `{ light: "#C83858", deep: "#6E1830" }`) that is **intentionally hidden from
initial launch** (`hideFromNavbar`/`hideFromBanners`) but may render later. It's missing
from `src/index.css` `@theme` (only 10 of 12 house tokens defined), so
`PoliticalClubPage.tsx` hardcodes its hex everywhere instead of using tokens/vars like
sibling house pages. DESIGN.md's frontmatter already claims 12 house tokens — so this also
closes a real 12-vs-10 doc↔code gap.

**Architecture invariant:** `houses.ts` `palette` MUST stay real hex — `HouseBanner.tsx`
does luminance math on it (`parseInt(hex.slice(...),16)`), and `OctahedronHero` feeds real
colors to three.js. So `houses.ts` is the canonical hex source; `@theme` house tokens are
the derived mirror. Do NOT convert houses.ts palette to `var()`.

## Scope

### 1. Add the missing @theme tokens (`src/index.css`)
In the `@theme inline` house-palette block (where the other 10 house tokens are direct hex,
e.g. `--color-house-visit-deep: #4A5A30;`), add — values copied from the `forum` palette in
`houses.ts`:
```
--color-house-political-club-light: #C83858;
--color-house-political-club-deep: #6E1830;
```
Now all 12 house tokens exist. (Direct hex like the siblings — no `:root` indirection.)

### 2. Repoint `src/pages/PoliticalClubPage.tsx` to tokens (no raw house hex)
Match the **inverted-house pattern** used by `LiberalArtsPage.tsx` (Education also inverts:
deep page bg, light accent) — read that file first and mirror its structure. Concretely:
- `style={{ backgroundColor: "#6E1830", ... }}` → use the `bg-house-political-club-deep`
  utility on the `<main>` className; keep `--btn-accent` but set it to
  `var(--color-house-political-club-light)`.
- `text-white` → `text-background` (the system's cream-on-dark text).
- `selection:text-[#6E1830]` → match siblings' selection (whatever `LiberalArtsPage` uses —
  keep it consistent with that page).
- `FractalPattern color="#C83858"` → `color="var(--color-house-political-club-light)"`.
- `SectorHeader color="#C83858"` → `color="var(--color-house-political-club-light)"`.
- Result: zero raw `#C83858`/`#6E1830` in the page; references tokens/vars only.

### 3. Drift-check test (`src/__tests__/house-tokens-sync.test.ts`)
A vitest test that **prevents the two sources from diverging again**:
- Import `HOUSES` from `src/data/houses.ts`. Read `src/index.css`, extract every
  `--color-house-<slug>-<light|deep>: #HEX;`.
- Assert: every house in `HOUSES` has BOTH `@theme` tokens and the hex matches the palette
  (case-insensitive); and no orphan house token lacks a house. The token slug uses the
  display-name slug (forum→`political-club`, lab→`publications`, school→`education`,
  neighborhood→`visit`); derive the mapping robustly (e.g. match each palette hex to its
  token, and assert a 1:1 mapping with both light+deep present for all 6 houses = 12 tokens).
- Fail with a clear message naming the mismatch.

### 4. DESIGN.md
The Houses section already notes Political Club is hidden from navbar/banner grid. Add a
short note that **Political Club (and the People page) are intentionally not surfaced at
initial launch but remain in the codebase and on the token system**, so they're launch-ready
when re-enabled. Keep the 12-token table as-is (now accurate).

### 5. Conformance baseline
After repointing the page, run `node scripts/design-conformance.mjs --update-baseline` and
commit the regenerated baseline (the page's raw hexes drop out; houses.ts still defines the
palette hex so those values remain). Then `pnpm conformance` must pass.

## Acceptance criteria
- All 12 house tokens defined in `@theme`; `house-tokens-sync` test passes.
- `PoliticalClubPage.tsx` contains no raw `#C83858`/`#6E1830` (grep clean); renders the same
  (deep background, light accent, cream text) — structure matches `LiberalArtsPage`.
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; `pnpm test` green except the
  pre-existing FRAC-199 failures — the NEW sync test must PASS, so pass count goes 141→142
  (total 148→149). Confirm no NEW failures beyond FRAC-199.
- DESIGN.md note added; token table still 12 houses.

## Out of scope
- People / Story non-house section colors (separate follow-up — they need a data-model home).
- Eliminating the houses.ts↔index.css duplication via codegen (the sync test is the chosen
  "however is best" — both files must exist for their different consumers).
