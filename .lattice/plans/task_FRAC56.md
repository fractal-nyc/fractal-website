# FRAC-56: Fix house banner color pairs

## Plan
Update three entries in the ELEGANT_PAIRS mapping in `src/components/house/HouseBanner.tsx`:
- `events` letter: `#8B2A1E` -> `#C13B2A` (deeper coral-red from peach pair)
- `forum` letter: `#D4857A` -> `#C83858` (brighter red from burgundy pair, was using peach color)
- `lab` letter: `#6E1830` -> `#C44878` (deep pink from fuschia pair, was using burgundy color)

Also reorder entries to match the canonical order and add comments.

## Acceptance Criteria
- All six house entries use colors from their correct palette pair
- Build passes (`npx vite build`)
