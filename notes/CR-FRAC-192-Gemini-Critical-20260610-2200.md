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