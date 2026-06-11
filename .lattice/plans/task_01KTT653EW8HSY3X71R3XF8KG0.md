# FRAC-195: Team-review fixes for the frac-192-hero-texture-preload branch

## Context

A six-agent team review (`notes/team-review-frac-192-hero-texture-preload-20260610-2135.md`)
of the frac-192 branch confirmed five fixable findings. FRAC-192/193/194 are
already `done`; this task tracks the rework, committed to the same branch so
the fixes ride the same PR. Scope confirmed by the human (fix tap target
*keeping groupRef*, kill the double-fetch, plus the "quick wins" bundle).

## Fixes (all small, same branch)

1. **Kill the relocated double-fetch (review finding #1).** `index.html`
   preloads all 8 banners in CORS mode, but `src/components/house/HouseBanner.tsx`
   consumes 6 of them via a plain no-CORS `<img>` — preload unmatched on house
   routes, every rendered banner downloads twice. Fix: `crossOrigin="anonymous"`
   on the HouseBanner `<img>` + extend the keep-in-sync comments in `index.html`
   and `OctahedronHero.tsx` (`FACE_BANNER_IMAGES`) to name HouseBanner as the
   third copy of these paths.

2. **Restore the tap-target size while keeping groupRef scaling (finding #7).**
   The group (rest scale 0.9) now scales the previously-unscaled radius-1.0 hit
   mesh → ~19% tap-area shrink on the primary mobile CTA. Fix: compensate the
   hit geometry radius to `1 / 0.9` so its effective world-space radius at rest
   is 1.0 again (hover 0.95 → ~1.056, slightly more forgiving, fine). Hoist the
   0.9/0.95 literals into named constants used by both the scale lerp and the
   hit geometry so they can't drift apart.

3. **Preload priorities (finding #3).** `fetchpriority="high"` on the hero AVIF
   preload (matches the `<img fetchPriority="high">` it feeds), and
   `fetchpriority="low"` on the 8 banner preloads so decorative textures never
   contend with the LCP asset. This also softens finding #2 (eager preloads on
   non-home routes) without route-conditioning.

4. **Close the disposal gaps (finding #4, acceptance criterion "no leaks").**
   - Dispose the 8 solid `placeholderMaterials` in the existing
     `usePerFaceMaterials` effect cleanup (they're identity-stable, safe with
     the `[]` deps).
   - Dispose the geometry built by `usePerFaceOctahedronGeometry` via a
     `useEffect` cleanup keyed on the geometry (covers both the radius-1 and
     radius-1.001 shells, and the pre-existing leak).

5. **Banner masters out of `public/` (finding #5).** Vite ships everything
   under `public/` into `dist/`; ~13 MB of untracked PNG masters currently
   live in `public/images/banners/`. Fix: `mkdir assets-src/banners`, move all
   master PNGs there (incl. the stray ChatGPT-edit PNG), drop the `public/`
   fallback from `SRC_DIRS` in `scripts/compress-banners.mjs`, and correct the
   false "committed PNG masters" comment. `.gitignore` already covers
   `assets-src/` and keeps the `public/images/banners/*.png` patterns as a
   guard against reintroduction. Also remove the stray `.DS_Store` from the
   banners dir (ships in dist otherwise).

## Acceptance criteria

- `pnpm run typecheck` passes; no new vitest failures (baseline: 7 pre-existing).
- `pnpm build:banners` still succeeds with masters in `assets-src/banners/`
  and byte-identical (or budget-passing) webp outputs.
- House routes: banner `<img>` CORS mode matches the preload (single fetch).
- Hit-target effective radius at rest scale ≈ 1.0 (unchanged vs merge base).
- No master PNGs / .DS_Store remain under `public/images/banners/`.

## Out of scope (tracked in the review report's Consider list)

Drift test for preload↔FACE_BANNER_IMAGES↔Hero srcset; route-conditioning the
preloads; dispose-ordering tightening in the loader callback; Lattice task for
the 7 pre-existing test failures.
