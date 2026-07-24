# FRAC-23: Lower compact homepage background crop

## Current evidence and layout ownership

- FRAC-21 made the compact background image fill the absolute `data-hero-background` layer with `object-fit: cover`, `object-position: 72% bottom`, `transform: scale(1.06)`, and `transform-origin: 72% bottom` in `src/index.css`. The background layer is decorative and independent from the in-flow Hero grid, translated `hero-stage`, and `hero-footer`; it is therefore the correct and only owner to adjust.
- The 960×538 source art has its visible lower frame/ground line roughly 6% above the bitmap's physical bottom because a narrow credit margin remains below the drawing. Anchoring the bitmap bottom to the Hero bottom consequently leaves the line visibly above the screen edge.
- Fresh FRAC-21 evidence shows the issue in both compact portrait environments: S24-class Chrome at a 412×762 expanded-toolbar visual viewport (`test-results/mobile-simulators/2026-07-23T21-34-01-233Z/...`) and Android tablet Chrome at 800×1128 (`test-results/mobile-simulators/2026-07-23T21-38-22-026Z/...`). The Hero otherwise fits, has no clipping/edge violations, and the desktop treatment is correct.

## Implementation

1. In the base/compact `.hero-background-image` rule in `src/index.css`, keep opacity, `object-position: 72% bottom`, and the bottom-right transform origin. Add a downward translation matching the source art's approximately 6% trailing margin and increase the scale only enough to retain top-edge overscan. Start with `transform: translateY(6%) scale(1.07)`; tune only these two compact art-direction numbers if fresh screenshots show the line more than the tolerance below. This should place the visible ground line at the initial visual-viewport bottom while leaving about 1% top overscan.
2. Do not change `Hero.tsx`, the background asset/srcsets, `.hero-shell`, `.hero-stage`, `.hero-footer`, Navbar, WebGL scene, label projection, hit target, copy, or spacing. The `@media (min-width: 1024px)` declaration must remain `object-position: center bottom` and `transform: translate(2.75%, -8%) scale(1.35)`, so the expanded composition is byte-for-byte unaffected.
3. In `tests/e2e/support/responsive-contract.mjs`, retain the existing compact no-empty-edge check and add a behavioral compact crop contract: the transformed image still covers the background layer's top/left/right edges and extends below its lower edge by a calibrated roughly 5–7% of the layer height. Include the computed bottom-overscan ratio in probe details. Keep expanded layouts exempt from that compact offset requirement. Because this shared probe runs in Playwright and the native simulator lane, it verifies the same ownership contract in both environments.
4. In `tests/e2e/hero-responsive.spec.ts`, extend the compact art-direction assertion to measure the image and background-layer rectangles (rather than matching a transform string alone): assert the downward bottom overscan is in the calibrated range, the top edge remains covered, and `object-position` remains `72% 100%`. Retain all FRAC-21 masthead, blurb, CTA, stage-translation, and desktop assertions unchanged.
5. Regenerate only the compact Home visual baselines whose pixels intentionally move:
   - `tests/e2e/visual-evidence.spec.ts-snapshots/chromium-phone-320x568-home.png`
   - `tests/e2e/visual-evidence.spec.ts-snapshots/chromium-landscape-640x360-home.png`
   Library and expanded Home baselines must not change.

## Acceptance criteria

- On initial compact portrait load, the illustration's visible lower frame/ground line lands within approximately 8 CSS px of the real visual viewport's lower edge; the source credit margin is cropped below the viewport rather than appearing as extra whitespace.
- The decorative image exposes no empty top, left, or right edge at any compact matrix size from 320px through 1023px, including portrait, short landscape, 200% text, and reduced-motion profiles. Short landscape may remain taller than one viewport by design; required content continues to grow/scroll rather than clip.
- The S24-class initial expanded-toolbar screenshot (412×762 visual viewport) and tablet initial expanded-toolbar screenshot (800×1128) show the intended ground alignment. Toolbar collapse/restore and rotation still produce no background seam, horizontal overflow, clipped footer, or interaction misalignment.
- FRAC-21's compact masthead/descriptor, lifted geometry and shared scene/label/hit coordinate space, readable blurb, 44px CTA, and footer containment remain unchanged. Native menu, Story CTA, WebGL drag, and an internal octant-node navigation still pass.
- At every width ≥1024px, the expanded background crop and full Hero composition remain unchanged; the 1024 boundary and desktop visual baselines continue to pass without regeneration.
- `pnpm typecheck`, `pnpm test`, `pnpm conformance`, and `pnpm build` pass.

## Validation sequence

1. Run the focused Hero composition spec across the full responsive/engine matrix serialized (`PW_MATRIX=full pnpm exec playwright test tests/e2e/hero-responsive.spec.ts --workers=1`) to avoid the already-tracked parallel WebGL resource flake.
2. Run the visual-evidence spec, update/review only the two compact Home snapshots, then rerun it without update mode.
3. Run the standard static/unit/build gates.
4. Run fresh native Android profiles separately so each boots cleanly and records real Chrome controls:
   - `node scripts/mobile-simulators/run.mjs --platform android --profile android-emulator-s24-class`
   - `node scripts/mobile-simulators/run.mjs --platform android --profile android-emulator-tablet`
5. Inspect the expanded-toolbar portrait screenshots for the visual ground-line criterion and inspect collapsed-toolbar/landscape evidence for seams, overflow, and preserved content. Record evidence directories and viewport metrics in the review handoff.
