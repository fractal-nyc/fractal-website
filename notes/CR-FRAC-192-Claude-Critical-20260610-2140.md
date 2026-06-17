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
