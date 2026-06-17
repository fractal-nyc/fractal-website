## Code Review
- **Date:** 2026-06-10 21:39 EDT
- **Model:** Claude (Fable 5) — claude-fable-5
- **Branch:** frac-192-hero-texture-preload
- **Latest Commit:** 3c02aa4f85cd699091322f58bbfe1861c9a2cc8e
- **Linear Story:** FRAC-192 (branch also carries FRAC-193, FRAC-194)
---

## Test & Tooling Status

| Check | Result |
|---|---|
| `pnpm run typecheck` | **PASS** (re-run locally) |
| Lint | **N/A** — no lint script in package.json |
| `pnpm test` (vitest) | **7 failed / 141 passed** — all 7 failures are pre-existing (buttons ×2, footer ×2, navigation ×1, neighborhood ×2). None of the failing test files exercise code touched by this branch (index.html, OctahedronHero, Hero background, scripts). Verified same set/count as documented at the merge base. **Not blockers for this branch**, but they should be tracked as their own task if they aren't already. |

Branch verified up to date: HEAD `3c02aa4`, base `origin/master` = `5a28730` (fetched fresh; no divergence).

## What This Branch Does

Three commits attacking the home-page octahedron "face flash" and hero-image weight:

1. **FRAC-192** — eliminate the placeholder→photo hard cut on the center octahedron:
   - `index.html` gains 8 `<link rel="preload" as="image">` tags for the banner webps plus a responsive `imagesrcset` preload for the hero background AVIF, so bytes are in flight during HTML parse instead of after the lazy three-vendor chunk + Canvas mount.
   - `OctahedronHero.tsx` replaces the single 8-material mesh with **two concentric shells**: an opaque solid-color placeholder octahedron (radius 1.0, visible frame 0) and a textured shell (radius 1.001) whose per-face materials start `transparent/opacity:0` and lerp to 1 in a `useFrame` (`FADE_K = 9`, ~300 ms dissolve). Each textured material is created exactly once in the loader callback and stored in a ref, so a re-render never resets an in-flight tween. Reduced motion snaps opacity to 1. On settle, `transparent=false; depthWrite=true` drops the alpha-blend cost.
   - `scripts/compress-banners.mjs` downscales banners 1024²→512² (on-disk webps verified 512×512, now 9–21 KB each, ~115 KB total vs ~470 KB) and gains a source-dir fallback (`assets-src/banners/` then `public/images/banners/`). `pnpm build:banners` exists.
2. **FRAC-193** — adds `crossorigin="anonymous"` to the 8 banner preloads. Premise verified: three `^0.183.2` `Loader.crossOrigin` defaults to `"anonymous"`, so `TextureLoader` fetches in CORS mode; a no-`crossorigin` preload would not match and the browser would double-fetch. The hero AVIF preload correctly omits `crossorigin` (consumed by a plain `<picture>`). The matching CLAUDE.md "Frontend Gotchas" entry is accurate and a good addition.
3. **FRAC-194** — caps the decorative hero background at 1280w: 1920/2560 AVIF+WebP variants deleted from disk, srcsets, build budgets, and the preload `imagesrcset` all consistently updated. Fallback `fractal-background-fallback.png` still exists and is still referenced.

Load/render sequence after this branch (home page):

1. HTML parse → preload scanner fetches hero AVIF (responsive pick) + 8 banner webps (CORS mode).
2. React mounts; Hero `<picture>` consumes the cached AVIF; solid-color octahedron renders frame 0 (placeholder shell).
3. Lazy scene chunk loads → `TextureLoader.loadAsync` per banner resolves near-instantly from cache (CORS modes match) → textured material swapped into its face slot → `useFrame` dissolves opacity 0→1 over the solid backdrop.
4. Failed loads: caught, warned, face stays solid (textured slot keeps `colorWrite=false`). Unmount: created materials + textures disposed.

Correctness details I checked and found sound: no `frameloop="demand"` anywhere (default `always`, so the fade and the reduced-motion snap actually run); no `StrictMode` (no double-effect dispose hazards); `FACE_SECTION_MAP` ↔ `SOURCE_TO_OUTPUT` ↔ preload hrefs all agree on the irregular `school→new-liberal-arts` / `forum→political-club` filenames; FrontSide-only convex shells mean no transparent-sort artifacts during the fade; the 0.001 radius offset is far above depth precision at camera distance ~8; r3f only raycasts objects with handlers, so the added textured mesh doesn't disturb the FRAC-144 hit-target behavior; sRGB tagging (FRAC-35) and plain-texture rendering (FRAC-41) preserved; FRAC-181 untouched (image hints only).

## Architectural Assessment

The change addresses the actual root causes (late fetch start + instant material swap) rather than papering over them — preload moves the bytes, the fade removes the cut, and both are needed, as the plan itself notes. The two-shell + ref-held-materials design is more code than the old `useMemo`, but each piece is load-bearing (the memo-rebuild reset bug it avoids is real) and well-commented. Right-sized, not overengineered.

The one architectural wrinkle: **the preloads live in the SPA's single `index.html`, so they fire on every route**, while their consumers are route-specific and use *different fetch modes* on different routes. That collision produces finding #1 below.

## Findings

### Blockers

*None.* Typecheck passes, no new test failures, and the implementation matches the plan's acceptance criteria as far as static review can verify.

### Important

1. ✅ **Confirmed — CORS-mode banner preloads double-fetch on house routes.** `index.html` preloads all 8 banners with `crossorigin="anonymous"` on **every** route. But `src/components/house/HouseBanner.tsx:30-37,125` consumes six of these exact files (`lab`, `political-club`, `neighborhood`, `new-liberal-arts`, `campus`, `events`) via a plain `<img>` — a **no-CORS** request. This is precisely the inverse mismatch the new CLAUDE.md gotcha documents: on a deep link to `/houses` or a house page, the CORS preload is never matched, so each rendered banner downloads **twice** (plus "preloaded but not used" console warnings), and `story`/`people` preload entirely unused. Before this branch house routes fetched each banner once; FRAC-193 fixed the home-page double-fetch but introduced the same class of bug on house routes. **Fix (one line per consumer):** add `crossOrigin="anonymous"` to the `HouseBanner` `<img>` (same-origin, so no ACAO header needed — same argument as the preload side), making every consumer CORS-mode so the preload matches on all routes. Also add `HouseBanner.tsx` to the keep-in-sync comments in `index.html` and `OctahedronHero.tsx` — there are now **three** hand-maintained copies of these paths, and the comments only mention two.

2. ✅ **Confirmed — untracked multi-MB PNG masters in `public/` will ship in any local build, and the script change codifies that location.** `public/images/banners/` contains ~13 MB of untracked source PNGs (`campus_brand_photo.png`, `events brand photo.png`, …, plus a stray `fractal nyc photos_ChatGPT Images 2.0 Edit_….png`). Vite copies *everything* under `public/` into `dist/` regardless of git tracking, so a production build from this machine ships all of them. The FRAC-192 change to `scripts/compress-banners.mjs:41-44` adds `public/images/banners/` as a fallback **source** dir — institutionalizing keeping masters there (the comment even calls them "committed PNG masters", which they are not — they're untracked). Recommend: move the masters to `assets-src/banners/` (already gitignored, already the script's preferred dir) and drop the `public/` fallback, restoring the original single-source design. At minimum, correct the comment and document that masters must not live in `public/`.

### Potential

3. ⬇️ **Valid, non-blocking — all preloads fire on non-home routes.** Beyond the mode mismatch in #1, deep links to any non-home route preload the hero AVIF (~21–81 KB, only the home Hero renders it) and `story`/`people` banners (~25 KB) that nothing consumes. For a mostly-home-traffic site this is an acceptable cost, but if house/section deep links matter, consider a tiny inline script that injects the preload tags only when `location.pathname === "/"` (or a Vite HTML transform). Fine to defer; worth a comment.

4. ⬇️ **Suggestion — add `fetchpriority="high"` to the hero AVIF preload.** The `<img>` carries `fetchPriority="high"`, but the request is now initiated earlier by the preload, which gets default image-preload priority and queues alongside 8 banner preloads. Adding `fetchpriority="high"` to the `<link>` (and optionally `fetchpriority="low"` to the banner preloads) keeps the above-the-fold background ahead of the octahedron textures on constrained connections.

5. ⬇️ **Nit — small undisposed GPU objects on unmount.** The effect cleanup diligently disposes textured materials + textures, but the 8 solid `placeholderMaterials` (`OctahedronHero.tsx:509-518`) and the two `usePerFaceOctahedronGeometry` geometries (radius 1 and 1.001) are never disposed when Hero unmounts. No textures are involved and programs are shared, so the leak is bytes-per-navigation small — and the geometry half is a pre-existing pattern — but since FRAC-192's stated goal includes "no leaks across route changes," disposing them in the same cleanup would finish the job.

6. ❓ **Uncertain / informational — one-frame window with a disposed material.** In the loader callback (`OctahedronHero.tsx:577-584`), `prev.dispose()` runs immediately on slot swap, but the mesh's material array only picks up the new material after the forced re-render commits; a frame in between can draw the disposed empty placeholder. Three re-initializes disposed materials on demand and the placeholder is `colorWrite=false`, so there's no visible artifact — at worst a redundant program re-init. No action needed unless you prefer disposing in the next cleanup pass for strictness.

## Validation Pass

Each Blocker/Important item was validated against the live working tree (not just the diff):

- **#1** ✅ Confirmed by reading `HouseBanner.tsx` (plain `<img>`, no `crossOrigin` prop) and `index.html` (8 `crossorigin="anonymous"` preloads, unconditional). Mode mismatch is definitional per the preload-matching rules this branch itself documents in CLAUDE.md.
- **#2** ✅ Confirmed via `git ls-files public/images/banners/` (only webps + svgs tracked) vs `ls` (~13 MB untracked PNGs present) and `scripts/compress-banners.mjs` `SRC_DIRS`.
- **#3–#6** ⬇️/❓ Verified factually (file reads, `sips` dimension checks, grep for `frameloop`/`StrictMode`), classified non-blocking.
- Checked-and-cleared (no finding): preload↔consumer URL match under `base:"/"`; AVIF `imagesrcset` byte-identical to Hero's `<source>`; reduced-motion path; failed-load graceful state; sRGB; hit-target behavior; depth/transparency ordering; 512² sufficiency at observed face sizes; `school`/`forum` filename irregularity consistent in all three lists.
