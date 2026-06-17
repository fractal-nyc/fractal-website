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
