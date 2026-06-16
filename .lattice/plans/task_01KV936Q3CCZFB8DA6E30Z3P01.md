# FRAC-207: Dedupe octahedron housePalette + octahedron-gold fallback

`housePalette(id)` is duplicated in `heroNavNodes.ts:9` and `OctahedronHero.tsx:11`,
both falling back to magenta `#ff00ff`. The octahedron faces already fall back to the
model's gold `#c4a265` (OctahedronHero.tsx:533). Unify.

## Changes
1. `heroNavNodes.ts` (three-free, canonical home):
   - Add `export const PALETTE_FALLBACK = "#c4a265";` (octahedron model gold).
   - Export `housePalette`; change its fallback `#ff00ff` -> `PALETTE_FALLBACK`.
2. `OctahedronHero.tsx`:
   - Remove the duplicate `housePalette` (+ its comment) and, if now unused, the `HOUSES`
     import.
   - Import `housePalette` (and `PALETTE_FALLBACK`) from `./heroNavNodes`.
   - Replace the face fallback `?? "#c4a265"` / `: "#c4a265"` (line ~533) with
     `PALETTE_FALLBACK` so there's ONE octahedron-gold fallback.
3. Regenerate the conformance baseline (`#ff00ff` drops out; `#c4a265` stays via the const).

## Acceptance
- No `#ff00ff` anywhere in src; `housePalette` defined once (heroNavNodes), imported by
  OctahedronHero. Face + nav-node fallbacks both use `PALETTE_FALLBACK` (`#c4a265`).
- typecheck/build/conformance pass; tests at FRAC-199 baseline (no new failures).
- Zero visual change (fallback only renders on a broken lookup, which never happens).
