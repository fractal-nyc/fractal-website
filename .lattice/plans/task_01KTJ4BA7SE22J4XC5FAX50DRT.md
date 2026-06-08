# FRAC-50 — Remove deprecated 'color' field from all House entries + HouseBanner fallback

**Complexity:** low
**Branch:** `frac-50-houses-color-sweep`

## Context

DESIGN.md "Accepted divergences" item #2 (after FRAC-48 cleanup) documents this deferred sweep. FRAC-34 removed every consumer of the legacy `house.color` field from `src/components/lab/*`; the field itself remained because `color: string` is required on the `House` interface and a TypeScript-clean removal requires also dropping the fallback in `HouseBanner.tsx`. This task does the full sweep.

**Planner-verified facts:**
- 6 `color: "..."` literals in `houses.ts` (one per house: neighborhood, events, campus, school, forum, lab).
- **All 6 colors are drift** — none match either palette token. They're pre-FRAC-24 single-color brand values. No preservation needed.
- 2 reads of `house.color` in `HouseBanner.tsx:95-96`, both gated by `?? house.color` fallbacks behind `pair?` checks.
- `getBannerPair(house.id)` only returns null if HOUSES doesn't contain the id — impossible when input is `house: House`. So the fallback is dead code.
- No other consumers: `Navbar`, `AvatarBadge` read `palette` directly. Tests use literal hex props on `SectorHeader`, not `house.color`.
- DESIGN.md has 3 places referencing the field: Accepted divergences item #2 (line 348), Lab/Publications callout (~line 180), and a "slated for removal in a follow-up" line (~line 153).

## Scope

1. Drop `color: string` from the `House` interface (`houses.ts:42-44`).
2. Drop the 6 `color: "..."` literals from the house entries.
3. Simplify `HouseBanner.tsx` — remove the dead `?? house.color` fallback. Kill the `getBannerPair` indirection (planner option B — recommended) since it's pure boilerplate now.
4. Update DESIGN.md: drop Accepted-divergences item #2, trim the "one last occurrence" clause in the Lab/Publications callout, refresh the "slated for removal" line.

## Files to edit

1. `src/data/houses.ts` — interface change + 6 literal removals.
2. `src/components/house/HouseBanner.tsx` — drop fallback + kill getBannerPair.
3. `DESIGN.md` — 3 prose edits.

## Per-file edits

### `src/data/houses.ts`

**Interface change (lines 42-44):** delete:
```ts
  /** @deprecated FRAC-24 — use `palette.light` or `palette.deep`. Kept temporarily
   *  for AvatarBadge backwards-compat; will be removed in a follow-up. */
  color: string; // hex accent color (legacy)
```

**Six entry removals** (line numbers approximate; grep to confirm):
| Line | Delete |
|---|---|
| 224 | `    color: "#8B7355",` (neighborhood) |
| 240 | `    color: "#E07A5F",` (events) |
| 258 | `    color: "#457B9D",` (campus) |
| 280 | `    color: "#1D3557",` (school) |
| 297 | `    color: "#CC2936",` (forum) |
| 319 | `    color: "#6B4C9A",` (lab) |

### `src/components/house/HouseBanner.tsx`

Planner recommends **option B**: kill the `getBannerPair` indirection since it only existed to hedge against legacy `house.color` data. With `house: House` directly passed and `palette` always present, the helper is pure boilerplate.

**Replace lines 94-98:**
```ts
// Before
  const isGrid = variant === "grid";
  const pair = getBannerPair(house.id);
  const bgColor = pair?.bg ?? house.color;
  const letterColor = pair?.letter ?? (isDark(house.color) ? "#ffffff" : "hsl(var(--foreground))");
  const textColor = isDark(bgColor) ? "#ffffff" : "hsl(var(--foreground))";

// After
  const isGrid = variant === "grid";
  const bgColor = house.palette.light;
  const letterColor = house.palette.deep;
  const textColor = isDark(bgColor) ? "#ffffff" : "hsl(var(--foreground))";
```

**Also delete:**
- Lines ~17-30: the `getBannerPair` helper + its comment block.
- The `import { HOUSES }` from line 2 (no other use in file — verify before deleting).

If the implementer prefers the more conservative option A (keep `getBannerPair` with a non-`house.color` defensive default), document why. B is preferred.

### `DESIGN.md`

**Edit 1 — drop Accepted-divergences item #2 (~line 348):**

Before:
```
1. `colors.background = "#f8f6f0"` (canonical written cream) — current CSS `hsl(40 25% 96%)` computes to `#f7f6f2`. Follow-up task: tighten the HSL math so it produces `#f8f6f0`.
2. `houses.ts:319` still carries the deprecated `color: "#6B4C9A"` field on the `lab` entry. FRAC-34 removed every consumer of the legacy `color` field from `src/components/lab/`; the field itself stays until the broader sweep that drops the deprecated `color` field from every house entry. The Lab purple is no longer rendered anywhere in the UI.
```

After (item #2 removed):
```
1. `colors.background = "#f8f6f0"` (canonical written cream) — current CSS `hsl(40 25% 96%)` computes to `#f7f6f2`. Follow-up task: tighten the HSL math so it produces `#f8f6f0`.
```

**Edit 2 — trim Lab/Publications "one last occurrence" callout (~line 180):**

Before:
```
Lab/Publications (internal id `lab`, displayName `Publications`) has exactly two canonical color tokens — `house-publications-light` (`#E870A0`) and `house-publications-deep` (`#C44878`). The legacy `#6B4C9A` purple was removed from `src/components/lab/*` in FRAC-34; one last occurrence remains on the deprecated `color` field of the `lab` entry in `houses.ts` (line 319) and is slated for removal alongside the rest of the legacy `color` field cleanup. Lab uses its palette pinks for accents; **no third color is canonical**. Do not declare a `house-publications-accent` or `lab-purple` token.
```

After:
```
Lab/Publications (internal id `lab`, displayName `Publications`) has exactly two canonical color tokens — `house-publications-light` (`#E870A0`) and `house-publications-deep` (`#C44878`). The legacy `#6B4C9A` purple was removed from `src/components/lab/*` in FRAC-34 (consumers) and from `src/data/houses.ts` in FRAC-50 (the deprecated `color` field itself). Lab uses its palette pinks for accents; **no third color is canonical**. Do not declare a `house-publications-accent` or `lab-purple` token.
```

**Edit 3 — refresh "slated for removal" line (~line 153):**

Before:
```
The HOUSES[id].palette: { light, deep } field is the single source of truth — the legacy color field on each house entry is @deprecated and slated for removal in a follow-up.
```

After:
```
The HOUSES[id].palette: { light, deep } field is the single source of truth for house color; the pre-FRAC-24 single-color `color` field was removed in FRAC-50.
```

(Exact wording may need adapting to the surrounding sentence structure — preserve the meaning.)

## Approach (sequenced for clean TypeScript)

1. **HouseBanner.tsx first.** Apply option B replacement; remove `getBannerPair` helper + `HOUSES` import if unused. Run `pnpm tsc --noEmit` — file should be clean.
2. **Drop the 6 `color` literals from houses.ts.** TypeScript will now error: 6 entries missing required field.
3. **Drop the `color: string` declaration from the House interface.** Errors clear.
4. **`pnpm tsc --noEmit` + `pnpm build` + `pnpm test`** — expect baseline 143/4.
5. **Apply 3 DESIGN.md edits.**
6. **Lint DESIGN.md:** `npx --no-install @google/design.md@0.2.0 lint DESIGN.md` → `0 errors`, warnings ≤ 27.
7. **Visual smoke** at 375px + desktop: all 6 house banners render visually identical to master (same palette.light bg, same palette.deep letter color).

## Out of scope

- No palette value changes.
- No new tokens.
- No SectorHeader refactor.
- No Navbar / AvatarBadge changes (both already read `palette`).
- No test changes (no test reads `house.color`).
- No house additions/removals.

## Acceptance criteria

- `grep -rn "house\.color\|h\.color" src/ --include="*.ts" --include="*.tsx"` returns 0.
- `grep -n 'color: "#' src/data/houses.ts` returns 0.
- `grep -n "color: string" src/data/houses.ts` returns 0.
- `grep -rn "getBannerPair" src/` returns 0 (if option B taken).
- `pnpm tsc --noEmit` clean.
- `pnpm build` clean.
- `pnpm test` baseline 143/4.
- DESIGN.md Accepted-divergences list has exactly 1 item (cream-math precision).
- DESIGN.md lint: `0 errors`, warnings ≤ 27.
- All 6 house banners visually identical at 375px + desktop.
- Diff size reasonable (~15-20 lines deleted, ~5 added).

## Risk

Near-zero. The fallback is dead code today and the field values don't match the rendered palette. TypeScript and the visual smoke catch any miss.

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/data/houses.ts`
- `/Users/fractalos/Dev/fractal-nyc/src/components/house/HouseBanner.tsx`
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md`
