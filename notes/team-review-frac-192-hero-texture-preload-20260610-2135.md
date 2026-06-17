# Team Code Review: frac-192-hero-texture-preload

**Reviewed:** 2026-06-10
**Agents:** Claude (Standard + Critical), Gemini (Standard + Critical). **Codex: FAILED** — see Agent Failures below.
**Test Results:** typecheck PASS, lint N/A (no lint script), tests 7 FAIL / 141 PASS — all 7 failures verified pre-existing on origin/master; this branch introduces zero new failures.

## Agent Failures & Substitutions

- **Codex (both reviews): failed.** `codex exec` v0.128.0 rejects every model (`gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5-codex`, `gpt-5.2`, `gpt-5.1-codex`) with "not supported when using Codex with a ChatGPT account" despite `codex login status` showing logged in. Account/auth-level issue — likely needs a fresh `codex login` after the CLI update. No Codex perspective in this report.
- **Gemini (both reviews): ran on `gemini-2.5-flash`**, not `gemini-3-pro-preview` — quota was exhausted on both `gemini-3-pro-preview` and `gemini-2.5-pro` (429s). Flash output is noticeably shallower than the Claude reviews; weight accordingly. (Gemini also mislabeled its own report headers — the "Claude-Opus-4-Orchestrator" and "gemini-1.5-flash" model lines in the pasted reviews are self-reporting errors.)

## Executive Summary

**Ready to merge after three cheap fixes and one product decision.** All four agents agree the core work is sound — the two-shell cross-dissolve in `OctahedronHero.tsx` is the right architecture, no blockers, no new test failures. But both Claude reviews independently confirmed that FRAC-193's crossorigin fix **relocated the double-fetch bug to the house routes** (one-attribute fix), and the critical review surfaced an unflagged **~19% shrink of the octahedron tap target** on a mobile-first site — that one needs a human call, not just code.

## Synthesis

### High Confidence Issues (multiple agents, validated)

1. **Banner preloads double-fetch on house routes** — found by Claude Standard #1 + Claude Critical #1, both validated against the working tree. `index.html` preloads all 8 banners with `crossorigin="anonymous"` on every route, but `HouseBanner.tsx:125` consumes them via a plain no-CORS `<img>`. Deep links to `/houses` or any house page double-download each rendered banner — the exact inverse of the mismatch this branch's own CLAUDE.md gotcha documents. **Fix: add `crossOrigin="anonymous"` to the HouseBanner `<img>`** (same-origin, so no ACAO header needed), and add `HouseBanner.tsx` to the keep-in-sync comments (there are now three hand-maintained copies of these paths, comments mention two).

2. **All 9 preloads fire on every route** — Claude Standard #3 + Claude Critical #2. Deep links to non-home routes eagerly fetch ~115 KB of banners + the hero AVIF that nothing consumes (`story`/`people` banners are unused outside home entirely). Acceptable if home dominates traffic; at minimum add `fetchpriority="low"` to banner preloads, or route-condition the tags.

3. **LCP priority mismatch on the hero preload** — Claude Standard #4 + Claude Critical #4. The hero `<img>` has `fetchPriority="high"` but the preload `<link>` doesn't, so the LCP asset queues at default priority alongside 8 decorative banners. **Fix: `fetchpriority="high"` on the hero preload, `fetchpriority="low"` on banner preloads.** Two attributes, directly serves FRAC-192's stated goal.

4. **"No leaks" acceptance criterion not fully met** — Claude Standard #5 + Claude Critical #5. Cleanup disposes textured materials/textures but never the 8 `placeholderMaterials` (`OctahedronHero.tsx:509-518`) nor the two `usePerFaceOctahedronGeometry` geometries (the branch doubles the geometry count). Small drip per home↔section cycle; dispose them in the same cleanup.

5. **Untracked ~13 MB of PNG masters in `public/images/banners/` + false "committed PNG masters" comment** — Claude Standard #2 + Claude Critical nit. Vite ships everything under `public/` into `dist/`, so local builds ship the masters; `.gitignore` excludes them so `pnpm build:banners` fails on a fresh clone while the comment claims they're committed. **Fix: move masters to gitignored `assets-src/banners/`, drop the `public/` fallback in `compress-banners.mjs`, correct the comment.**

6. **No drift test for the plan's own #1 risk** — Claude Critical #8 + Gemini Standard Imp-1 + Gemini Critical P2 (3 agents). `FACE_BANNER_IMAGES` ↔ `index.html` preloads ↔ Hero srcset are kept in sync by comments alone. A ~20-line vitest reading `index.html` would make drift unshippable.

### Critical Review Findings (adversarial-only)

7. **Tap target shrunk ~10% linear / ~19% by area** — Claude Critical #3 only, but verified against the merge base. Converting `meshRef` scaling to `groupRef` scaling (`OctahedronHero.tsx:690`) now scales the previously-unscaled radius-1.0 hit-target mesh to 0.9 along with the visible shells. Unflagged interaction change on the primary mobile CTA. **DECISION needed:** restore the forgiveness margin (keep hit mesh outside the scaled group) or record the shrink as intentional FRAC-144 alignment in a lattice comment.

8. **Stale-HTML 404 window during deploy** — Claude Critical #6. Clients holding pre-FRAC-194 HTML that selects a ≥1920w hero candidate 404 until refresh. Decorative at opacity 0.15; verify CDN cache behavior at deploy, no code change.

9. **Dispose ordering nits** — Claude Standard #6 + Claude Critical #9. `prev.dispose()` runs before React commits the new material array (one frame can draw a disposed material — three resurrects it), and swapped materials live in two ownership lists so unmount double-disposes. Harmless today; tighten ownership next time in the file.

### Worth Investigating (single agent)

- **FADE_K as a named tunable** (Gemini): hoist `FADE_K = 9` to a documented constant for easier animation tuning. Cosmetic.
- **Pre-existing red test suite deserves a Lattice task** (both Claude reviews flagged in passing): 7 failures have persisted across multiple tasks — per the project's "recurring observations become tasks" rule, file it.

### Contradictions

- **Z-fighting:** Gemini Standard listed it as a *Blocker* (self-marked ❓ uncertain), suggesting `polygonOffset`/`renderOrder`. Claude Critical explicitly validated the opposite: the 0.001 radius offset clears 24-bit depth precision at z≈8 by ~25×, and FrontSide-only convex shells avoid transparent-sort artifacts. Gemini Critical *also* confirmed the mitigation is effective. **Verdict: not a blocker; Claude's depth math + Gemini-Critical's confirmation outweigh the uncertain flag.**
- **`build:banners` script:** Gemini Standard claimed it's missing from `package.json`. **False** — it exists (verified directly: `"build:banners": "node scripts/compress-banners.mjs"`). Flash-model hallucination; disregard.
- **Severity split:** Gemini Critical found "Important: None" and would "mass deploy to 100k users"; Claude Critical confirmed 5 Important items. Given Gemini ran on flash and validated only what the plan claimed (rather than hunting consumers like `HouseBanner.tsx`), Claude's deeper pass is the more trustworthy signal.

## Combined Issues

### Blockers
*None.* All four agents agree.

### Important (should fix before merge)
1. Add `crossOrigin="anonymous"` to `HouseBanner.tsx` `<img>`; extend keep-in-sync comments. (#1)
2. Add `fetchpriority="high"` to hero preload, `fetchpriority="low"` to banner preloads in `index.html`. (#3)
3. DECISION: tap-target shrink — restore radius-1.0 hit mesh or record as intentional. (#7)
4. Dispose `placeholderMaterials` + geometries in cleanup to actually meet acceptance criterion #8. (#4)
5. Move PNG masters out of `public/`, fix the false "committed" comment in `compress-banners.mjs`. (#5)

### Consider
6. Drift test: `index.html` preloads ↔ `FACE_BANNER_IMAGES` ↔ Hero srcset. (#6)
7. Route-condition or down-prioritize preloads for non-home entries. (#2)
8. Tighten dispose ordering/ownership in the loader callback. (#9)
9. Verify CDN cache behavior for deleted 1920/2560 hero variants at deploy. (#8)
10. Lattice task for the 7 pre-existing test failures.

## Action Items

```markdown
- [ ] Add crossOrigin="anonymous" to banner <img> (`src/components/house/HouseBanner.tsx:125`) — found by: Claude, type: both
- [ ] Add fetchpriority="high" to hero AVIF preload + fetchpriority="low" to 8 banner preloads (`index.html:20-44`) — found by: Claude, type: both
- [ ] Dispose placeholderMaterials + both geometries in effect cleanup (`src/components/three/OctahedronHero.tsx:509-518,595-607`) — found by: Claude, type: both
- [ ] Move banner PNG masters public/images/banners/ → assets-src/banners/; drop public/ fallback + fix comment (`scripts/compress-banners.mjs:41-44,733-734`) — found by: Claude, type: both
- [ ] Add preload↔FACE_BANNER_IMAGES↔Hero-srcset drift test (~20-line vitest) — found by: Claude+Gemini×2, type: both
- [ ] Create Lattice task for 7 pre-existing test failures (buttons×2, footer×2, navigation×1, neighborhood×2) — found by: Claude×2, type: both
- [ ] DECISION: tap-target shrink 1.0→0.9 on group scaling (`OctahedronHero.tsx:690`) — intentional FRAC-144 alignment or restore margin? — found by: Claude, type: critical
- [ ] DECISION: accept ~115KB+ eager preloads on non-home deep links, or route-condition them? — found by: Claude, type: both
- [ ] Fix Codex CLI auth (`codex login`) before the next team review — infra
```

---

<details>
<summary>Full Claude (Standard) Review</summary>

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

</details>

<details>
<summary>Full Claude (Critical) Review</summary>

# Critical Code Review

## Critical Code Review
- **Date:** 2026-06-10 21:40 EDT
- **Model:** Claude Fable 5 (claude-fable-5[1m])
- **Branch:** frac-192-hero-texture-preload
- **Latest Commit:** 3c02aa4f85cd699091322f58bbfe1861c9a2cc8e
- **Story:** FRAC-192 (Lattice; branch also carries FRAC-193, FRAC-194)
- **Review Type:** Critical/Adversarial
---

## Test Results (re-run during this review)

- `pnpm run typecheck` — **PASS** (clean).
- `pnpm test` — **7 failed / 141 passed (148)**. Identical to the 7 failures the context document verified as pre-existing at the merge base (buttons ×2, footer ×2, navigation ×1, neighborhood ×2). This branch introduces **zero new failures**, and fixes none. Not blockers for this diff, but the suite has been red on master for at least two tasks now — per the project's own "recurring observations become tasks" rule, this deserves a Lattice task if it doesn't have one.

## The Ugly Truth

This is better-than-average work, and I don't say that often. The plan file is genuinely thorough, the comments explain *why* at every load-bearing decision, and the FRAC-193 follow-up commit shows someone actually opened DevTools and caught their own plan being wrong (the original plan explicitly said "Do NOT add `crossorigin`" — it was exactly backwards for `THREE.TextureLoader`, and the fix plus the CLAUDE.md gotcha entry is how this should work).

But here's the thing about that crossorigin fix: **it's still only half right.** The same 8 banner URLs have a *second* consumer in this app — `HouseBanner.tsx` renders them through a plain `<img>` with no `crossorigin` attribute. The preloads were tuned to match the TextureLoader (CORS mode) and now mismatch the house pages (no-CORS mode). The codebase's own freshly-written CLAUDE.md gotcha describes this exact failure. The double-fetch bug wasn't fixed; it was relocated to a page nobody re-tested.

And there's a silent interaction regression nobody flagged: converting `meshRef` scaling to `groupRef` scaling means the invisible tap-target octahedron — which previously sat unscaled at radius 1.0 — now shrinks to 0.9 with the group. That's a ~19% reduction in tap-target area on the primary CTA of a **mobile-first** site, mentioned nowhere in the plan, the commits, or the comments.

Nothing here will page anyone at 3am. But two of the three commits are performance work whose benefit is partially given back on every non-home page load, and the review gate should have caught both issues above.

## What Will Break

1. **When a user lands directly on `/houses` or any house page** (deep link, shared URL, refresh), the SPA shell's `<head>` fires all 8 banner preloads in CORS mode. `HouseBanner.tsx:125` then fetches 5 of those same URLs via plain `<img>` (no-CORS). The request modes don't match, so the preload is not reusable for the `<img>` — the browser issues a second fetch per banner (served from HTTP disk cache only if cache headers allow; guaranteed double network hit in dev and on no-store CDNs) plus "resource was preloaded but not used" console warnings. This is FRAC-193's bug, inverted, on a different page.
2. **Every non-home entry downloads up to ~265 KB it may never use.** index.html is served for all routes; the 8 banner preloads (~115 KB) and the hero AVIF preload fire unconditionally. A user deep-linking to `/story` on mobile data pays for all of it. The plan never weighed this trade-off.
3. **Mobile users will find the center octahedron slightly harder to tap.** Merge base: visible mesh scaled to 0.9, hit-target mesh stayed at radius 1.0 (an ~11% forgiveness margin). Now (`OctahedronHero.tsx:672-681`, `690-727`): the whole group scales to 0.9, hit target included. Effective tap radius drops 1.0 → 0.9 (~19% by area). Arguably this is what FRAC-144's comment always claimed ("matches the visible shape"), but it's an unreviewed interaction change on the primary nav affordance, shipped inside a rendering task.
4. **During the deploy window, stale cached pages will 404 on the hero background.** The 1920/2560 AVIF/WebP variants are deleted; any client holding a cached pre-FRAC-194 HTML/JS bundle that selects a ≥1920w candidate gets a broken (decorative, opacity-0.15 — so cosmetically minor) background until refresh.

## What's Missing

- **A sync test for the plan's own #1 risk.** The plan names "FACE_BANNER_IMAGES ↔ index.html drift" as the top risk and mitigates it with… comments. A ~20-line vitest that reads `index.html`, extracts the preload hrefs, and compares them to `FACE_BANNER_IMAGES` (and asserts `crossorigin` is present) would make the drift impossible to ship. Same test could pin the hero `imagesrcset` to Hero.tsx's AVIF srcset (the plan's risk #4).
- **Any automated evidence for the 8 acceptance criteria.** No-flash, single-fetch, reduced-motion snap, graceful failure, and the leak criterion are all manual-DevTools checks, and nothing in the branch (commits, notes, lattice comments) records that they were performed.
- **Disposal of the placeholder shell.** The new cleanup (`OctahedronHero.tsx:595-607`) disposes textured materials and the textured-shell placeholders, but the 8 opaque `placeholderMaterials` from the `useMemo` (`:509-518`) are never disposed, and neither of the two geometries from `usePerFaceOctahedronGeometry` ever was (pre-existing — but this branch doubles the geometry count by adding the radius-1.001 shell). Acceptance criterion #8 says "no leaks"; this is a slow drip per home↔section navigation cycle, not a flood, but the criterion is explicitly not met.

## The Nits

- Textured materials that were swapped into face slots live in **both** the `created` array and `texturedFacesRef.current`, so unmount disposes them (and their textures) twice (`:599-606`). Three.js tolerates double-dispose, but it signals the two ownership lists aren't actually disjoint.
- `prev.dispose()` (`:581`) runs before React commits the new material array — the renderer can draw one frame with a disposed material (three silently re-uploads it, then it leaks its re-acquired program when swapped out). Harmless at n=8; still backwards ordering.
- `compress-banners.mjs:733-734` comment claims the fallback reads "committed PNG masters that already live alongside the webp outputs" — **false**. `.gitignore:34-36` explicitly excludes `public/images/banners/*.png` and `* brand photo.*`; `git ls-files` confirms only webp/svg are committed. On a fresh clone the script fails for all 8 sources. The fallback only works on machines that happen to hold the local masters. The mechanism is fine; the comment lies.
- `main.tsx` has no `<React.StrictMode>`, so the latent hazard is dormant — but if StrictMode is ever enabled, the effect cleanup disposes the materials held in `texturedFacesRef` without nulling the ref, and the re-run reuses disposed materials. Works today only because three resurrects disposed-but-rendered materials.
- The hero preload covers AVIF only; the WebP `<source>` path (non-AVIF browsers) gets no preload. Deliberate and correctly reasoned in the comment — noted for completeness, not a defect.

---

## Findings

### Blockers
None. I tried. Nothing in this diff loses data, throws, breaks rendering, or regresses the texture pipeline's correctness (sRGB, plain-texture, graceful-failure paths are all preserved and the two-shell cross-dissolve is structurally sound — mixed opaque/transparent material arrays sort per-group in three's render lists, the 0.001 radius offset clears 24-bit depth precision at z≈8 by ~25×, and the `min(1, delta·k)` lerp clamps tab-suspend delta spikes).

### Important

1. ✅ **Confirmed — Banner preloads (CORS) mismatch HouseBanner's no-CORS `<img>`; double-fetch on house routes.** `index.html:37-44` (`crossorigin="anonymous"`) vs `src/components/house/HouseBanner.tsx:125-130` (plain `<img>`, 5 banner webps after campus's early return). Verified both files; this is byte-for-byte the inverse-direction mismatch documented in CLAUDE.md's own Frontend Gotchas entry. **Fix:** add `crossOrigin="anonymous"` to the HouseBanner `<img>` — same-origin, zero visual effect, makes every consumer CORS-mode so one preload serves both. One attribute.

2. ✅ **Confirmed — All 9 image preloads fire on every route of the SPA.** `index.html` is the shell for all paths; ~115 KB of banners + the hero AVIF are eagerly fetched on deep links to pages that may use none of them (e.g. `/story`). Verified: no route conditioning exists, and Hero/Octahedron mount only on home. **Fix options:** accept and document the trade-off explicitly (home is presumably the dominant entry), or add `fetchpriority="low"` to the banner preloads so the waste at least never competes with the critical path.

3. ✅ **Confirmed — Tap/hover target shrunk ~10% linear / ~19% area.** Diffed `CenterOctahedron` at merge base 5a28730 vs HEAD: previously `meshRef` scaled only the visible mesh and the radius-1 hit mesh stayed unscaled; now `groupRef` (`OctahedronHero.tsx:690`) scales placeholder, textured shell, **and** hit target to 0.9/0.95. Unflagged interaction change on a mobile-first site. **Fix:** either keep the hit mesh outside the scaled group (restoring the old forgiveness margin) or record the shrink as an intentional FRAC-144-alignment decision in a lattice comment so it's a choice, not an accident.

4. ✅ **Confirmed — LCP preload priority mismatch.** Hero `<img>` carries `fetchPriority="high"` (Hero.tsx:334 area), but the preload `index.html:20-22` has no `fetchpriority` → Chrome schedules `as="image"` preloads at Low, queued alongside the 8 banner preloads. The preload still wins on start-time, but the LCP asset contends with 8 decorative textures at equal priority. **Fix:** `fetchpriority="high"` on the hero preload, `fetchpriority="low"` on the banner preloads. Two attributes, directly serves FRAC-192's stated LCP goal.

5. ✅ **Confirmed — Acceptance criterion #8 ("no leaks") not met.** Cleanup at `OctahedronHero.tsx:595-607` never disposes the 8 `placeholderMaterials` (`:509-518`), and the branch adds a second never-disposed geometry (`:630`). Magnitude per home↔section cycle is small (8 color-only materials + 1 geometry), but the criterion is explicit and the cleanup comment claims coverage it doesn't have.

### Potential

6. ❓ **Likely but unproven in practice — stale-HTML 404 window for deleted 1920/2560 hero variants** during deploy. Decorative asset at opacity 0.15; bounded by cache TTLs. Verify CDN behavior at deploy time; no code change warranted.
7. ✅ **Confirmed — misleading "committed PNG masters" comment + fresh-clone failure of `pnpm build:banners`** (`scripts/compress-banners.mjs:733-734` vs `.gitignore:34-36`). Fix the comment; optionally have the script print which source dir it actually used.
8. ✅ **Confirmed — no drift test** for index.html preloads ↔ `FACE_BANNER_IMAGES` ↔ Hero srcset, the plan's top two named risks. Cheap to add, permanent protection.
9. ⬇️ **Real but lower priority than it looks — double-dispose + dispose-before-commit ordering** in the loader callback and cleanup (`:574-584`, `:599-606`). Three.js tolerates both today; tighten ownership (faces-ref as the single dispose list) next time someone is in the file.

## Closing

**Ready for production? Yes — with items 1, 3, and 4 fixed first.** Item 1 is a one-attribute fix that closes a bug this branch's own follow-up commit (FRAC-193) was supposed to have killed; shipping without it means the team's freshly-documented gotcha is live on the house pages. Item 4 is two attributes in `index.html`. Item 3 needs a human decision more than code: shrinking the primary mobile tap target is a product call, not an implementation detail.

Would I mass-deploy to 100k users as-is? It wouldn't cause an incident — worst case is wasted bytes, console warnings, and slightly-harder taps. But "wouldn't cause an incident" is a low bar for a branch whose entire purpose is performance polish. Fix the three cheap things, record the tap-target decision, and this is genuinely good work: the two-shell cross-dissolve is the right architecture, the constraint preservation (FRAC-28/35/41/127/181) is meticulous, and the comment discipline is the best I've seen in this repo.

</details>

<details>
<summary>Full Gemini (Standard) Review</summary>

## Code Review
- **Date:** 2026-06-10 17:00 PDT
- **Model:** Gemini (gemini-1.5-flash)
- **Branch:** frac-192-hero-texture-preload
- **Latest Commit:** 3c02aa4f85cd699091322f58bbfe1861c9a2cc8e
- **Linear Story:** FRAC-192
---

### Assessment of Branch Changes

This branch addresses three related performance and visual quality issues on the home page:

1.  **FRAC-192: Eliminate octahedron face-texture flash on home-screen render.** This is achieved by:
    *   Preloading the 8 octahedron banner textures (`.webp`) in `index.html` using `<link rel="preload">` with `crossorigin="anonymous"` to ensure they are fetched during HTML parse and cached for `THREE.TextureLoader`.
    *   Implementing a smooth opacity fade-in for these textures in `OctahedronHero.tsx`. Instead of a hard cut from solid color to textured face, the textured material now dissolves in (0% to 100% opacity) over a solid-color placeholder. This is done by rendering two concentric octahedron meshes: an opaque solid-color one and a slightly larger transparent textured one.
    *   Handling `prefers-reduced-motion` to instantly show textures without animation.
    *   Ensuring proper disposal of Three.js materials and textures to prevent GPU memory leaks on route changes.

2.  **FRAC-193: Add crossorigin to banner preloads to fix double-fetch.** This is directly related to FRAC-192's preload implementation. The `crossorigin="anonymous"` attribute is added to the preload links in `index.html` because `THREE.TextureLoader` defaults to anonymous CORS mode, preventing double-fetches and "preloaded but not used" warnings.

3.  **FRAC-194: Cap decorative hero background at 1280w.** The hero background images (`.avif`, `.webp`) in `src/components/sections/Hero.tsx` and the corresponding AVIF preload in `index.html` have had their `imagesrcset` values capped at 1280w. Previously, 1920w and 2560w variants were served, but these were deemed imperceptible for a decorative background and significantly contributed to page weight. The `scripts/build-hero-bg.mjs` script was also updated to reflect this change by removing the higher-width budget entries.

Additionally, `scripts/compress-banners.mjs` has been updated to downscale the banner textures from 1024x1024 to 512x512. This reduces the total preloaded banner bytes and GPU texture memory without a visible loss in quality, as faces render well under 512px even at 2x DPR. The script now also correctly resolves source PNGs from either `assets-src/banners` or `public/images/banners`.

The overall goal of this branch is to improve perceived loading performance and visual smoothness on the home page by optimizing image loading and transitions, while also reducing asset size.

### Architectural Review

The architectural approach to solving the texture flash (FRAC-192) by using two concentric meshes (a solid-color background and a fading textured foreground) is a robust and elegant solution. It cleanly separates the placeholder state from the loaded state and ensures a consistent visual experience even if textures fail to load. This pattern is well-suited for progressive rendering and avoids the visual jank of a hard material swap.

The decision to cap the hero background at 1280w (FRAC-194) is a pragmatic optimization that aligns with performance best practices. Removing imperceptible larger variants reduces bandwidth and processing without sacrificing user experience.

The use of `crossorigin="anonymous"` for preloaded images consumed by `THREE.TextureLoader` (FRAC-193) demonstrates a good understanding of browser caching mechanisms and CORS, preventing unnecessary double downloads.

The refactor of `usePerFaceMaterials` to manage material instances outside of the `useMemo` and use `useState` to trigger re-renders only when a texture arrives, along with the `useRef` for `texturedFaces`, correctly addresses the memoization caveat and ensures smooth, uninterrupted opacity transitions. The disposal logic for materials and textures on unmount is crucial for preventing GPU memory leaks, especially in a single-page application with frequent route changes.

The update to `scripts/compress-banners.mjs` to downscale images and correctly resolve source paths is a sensible improvement for asset management and build process robustness.

### Tactical Review

#### General Feedback:

The implementation details largely follow the proposed approach from the plan document, indicating a clear understanding of the problem and solutions. The code comments (`index.html`, `OctahedronHero.tsx`, `scripts/build-hero-bg.mjs`, `scripts/compress-banners.mjs`) are excellent and crucial for maintaining the synchronization points (e.g., preload hrefs with `FACE_BANNER_IMAGES`, `imagesrcset` with `Hero.tsx` and `build-hero-bg.mjs`).

#### Specific Issues:

**Blockers**
- **Blockers** — must fix before merge
    1.  **FRAC-192: Potential Z-fighting or transparency issues with two concentric meshes.** The textured shell is set at `radius 1.001` and `transparent: true, depthWrite: false` during fade-in, becoming `transparent: false, depthWrite: true` when fully opaque. While the `1.001` radius helps, it's generally safer to use `polygonOffset` for guaranteeing draw order between co-planar or near-co-planar meshes, or to ensure that the transparent mesh's `renderOrder` is higher than the opaque one. `depthWrite: false` on transparent objects is good, but `depthTest: true` should remain to prevent rendering transparent objects "through" opaque objects. It's worth verifying thoroughly during acceptance testing that no z-fighting occurs, especially at oblique angles or when parts of the meshes are clipped. *Location: `src/components/three/OctahedronHero.tsx`* ❓ Uncertain or needs input and/or discussion


**Important** — should fix, not blocking

1.  **FRAC-192: `FACE_BANNER_IMAGES` and `index.html` preload list synchronization.** The comments highlight this risk, which is good. While the current solution relies on manual synchronization, a more robust solution could involve generating the preload tags dynamically during the build process, perhaps via a Vite plugin, to reduce the chance of human error. This is out of scope for the current task but a good future consideration. ✅ Confirmed
2.  **FRAC-194: `imagesrcset` and `BASE_URL` caveat.** The `index.html` preload hardcodes `/images/hero/...`, which relies on `Vite base` being `/`. The comment correctly highlights this risk. If the project ever changes its base path (e.g., for deployment under a sub-directory), these preloads will silently fail. A Vite HTML transform could inject these preloads with the correct base URL. *Location: `index.html`* ✅ Confirmed
3.  **FRAC-192: Linting status N/A.** The context document states "Lint: N/A — no lint script exists in package.json". This is a pre-existing issue but worth flagging as part of a review, as linting would help enforce code style and catch potential issues early. ✅ Confirmed
4.  **FRAC-192: Hardcoded `FADE_K` constant.** The `FADE_K = 9` constant directly influences the fade duration. While `9` gives a "300 ms dissolve feel," it might be beneficial to expose this as a configurable constant (e.g., at the top of the file) or even a CSS variable for easier tuning without code changes. *Location: `src/components/three/OctahedronHero.tsx`* ✅ Confirmed


**Potential** — nice-to-have or uncertain items

1.  **FRAC-192: Console warning for failed texture loads.** The `catch` block for `loader.loadAsync` currently just logs a `console.warn`. While this is a graceful degradation, a more explicit visual indicator to the user (e.g., a small "!" icon on the affected face, or a temporary tooltip) could be considered for improved debugging/user feedback in rare cases of asset loading failure. *Location: `src/components/three/OctahedronHero.tsx`* ⬇️ Lower priority, valid but non-blocking
2.  **FRAC-192: `package.json` `build:banners` script.** The plan document mentions wiring `pnpm build:banners` but it's not reflected in the provided diff. This is a task for the implementer, but should be noted as a necessary step. *Location: `package.json` (missing entry)* ✅ Confirmed


---

</details>

<details>
<summary>Full Gemini (Critical) Review</summary>

## Critical Code Review
- **Date:** 2026-06-10 22:00 EDT
- **Model:** Claude-Opus-4-Orchestrator
- **Branch:** frac-192-hero-texture-preload
- **Latest Commit:** 3c02aa4f85cd699091322f58bbfe1861c9a2cc8e
- **Linear Story:** FRAC-192 (FRAC-193, FRAC-194)
- **Review Type:** Critical/Adversarial
---

**The Ugly Truth**: This branch delivers a solid and well-reasoned solution to the identified visual flicker on the home page. The problem space was thoroughly analyzed in the plan, and the implementation reflects a careful consideration of various pitfalls (e.g., `crossorigin` mismatches, race conditions, disposal). The two-shell approach for the fading textures is a particularly elegant solution for maintaining graceful degradation while introducing a smooth animation. The downscaling of banner textures is a pragmatic optimization that directly addresses performance.

**What Will Break**:
Based on the adversarial analysis, no immediate breaking changes or incidents are likely with this implementation. The error handling for texture loading (falling back to solid color) and the disposal logic for GPU resources are robust.

**What's Missing**:
*   **Automated Sync Check for Preloads:** The `FACE_BANNER_IMAGES` list in `OctahedronHero.tsx` and the preload links in `index.html` are explicitly called out as prone to drift. While comments are added, a build-time check (e.g., a script that validates these lists are identical or generates the `index.html` links from the JS source) would prevent future manual errors. This is acknowledged as "out of scope here" in the plan, but remains a long-term improvement.
*   **Lint Script:** The `package.json` still lacks a lint script. While not directly related to this change, it's a general project health issue noted in the test results.

**The Nits**:
*   The `forceRender((n) => n + 1)` in `usePerFaceMaterials` is a valid React pattern to force a re-render when using `useRef` for imperative updates, but it could potentially be optimized further with a more granular state management solution if performance becomes an issue with many concurrent texture loads (unlikely for 8 faces).

**Blockers** — will cause production incidents or data loss
- None. The implementation is robust against critical failures.

**Important** — will cause bugs or poor UX
- None. The identified risks (drift, BASE_URL changes) are clearly documented and are primarily maintenance/configuration concerns rather than immediate bug producers in the current setup.

**Potential** — code smells, missing tests, things that will bite you later
- **P1: `BASE_URL` dependency**: The hardcoded `/` paths in `index.html` for preloads (both banners and hero background) are dependent on Vite's `base` being `/`. If the project ever deploys to a sub-path, these preloads will silently fail (and potentially cause double downloads), leading to performance regressions. The comment in `index.html` mitigates this by making it explicit, but it's a future configuration gotcha.
- **P2: Manual `index.html` preload sync**: As noted in "What's Missing", the manual synchronization between `FACE_BANNER_IMAGES` and `index.html` is a source of potential human error in future updates.

---
**Summary of Validation Pass:**

*   ✅ **Confirmed:** The `crossorigin="anonymous"` for banner preloads and its absence for the AVIF preload correctly aligns with browser caching rules to prevent double fetches (FRAC-193).
*   ✅ **Confirmed:** The two-shell rendering with `radius 1.0` for solid and `radius 1.001` for textured, combined with `depthWrite: false` initially and then true when opaque, is an effective z-fighting mitigation strategy.
*   ✅ **Confirmed:** The `useEffect` cleanup properly disposes of `MeshBasicMaterial` and `THREE.Texture` instances to prevent GPU memory leaks on component unmount/navigation.
*   ✅ **Confirmed:** The use of `useRef` for `texturedFacesRef` and imperative updates with `forceRender` effectively addresses the memoization caveat, ensuring in-flight opacity tweens are not reset.
*   ✅ **Confirmed:** The `usePrefersReducedMotion` implementation correctly skips the opacity animation, setting `mat.opacity = 1` immediately, upholding accessibility (FRAC-28).

## Closing

This code is **ready for production**. The changes are well-designed, robust, and address the identified performance and visual issues effectively. The potential issues are primarily documentation/maintenance concerns for future development, rather than immediate flaws that would cause incidents. I would mass deploy this change to 100k users.
</details>

<details>
<summary>Codex (Standard + Critical) — FAILED</summary>

Both Codex agents failed with: `The 'gpt-5.3-codex' model is not supported when using Codex with a ChatGPT account.` All fallback models rejected identically. Needs `codex login` re-auth.

</details>
