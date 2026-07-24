# FRAC-24: Polish compact hero and document viewport set

## Scope and design decisions

This is a bounded follow-up to FRAC-21/23. Keep the existing compact source order, stage/footer ownership, masthead, scene lift, 6% downward background crop, and the expanded composition at `lg` (1024px). Do not alter `DESIGN.md` or introduce another structural breakpoint.

- The Story blurb already uses the canonical `.text-body` utility. Per `DESIGN.md`, that means Inter (`font-sans`), weight 400, normal case. Keep that token and the existing `md:text-lg` size refinement; the feedback reflects the intentional change from the old JetBrains Mono treatment, not a missing font. Add a computed-style regression assertion so this is explicit.
- Enlarge only phone geometry (`<768px`) by scaling the single root Three group to `1.08`. Drive the value once in `FractalCityScene` and pass it to `FractalObject`; because the visible meshes, invisible Three hit meshes, and Drei `<Html>` labels are descendants of that root group, they remain coupled. Keep the full-stage canvas and DOM event-source region unchanged and prove projected anchors remain inside it. At `>=768px`, including tablets and desktop, the scale remains exactly `1`.
- Remove the arrow's bounce transform and keep the CTA as one `inline-flex items-center` row. The static icon and label centers must agree within 1 CSS px; this favors the requested alignment over decorative motion.
- Preserve `object-position: 72% bottom`, `translateY(6%)`, and the bottom transform origin, but increase compact scale from `1.07` to `1.10`. This yields about 4% top overscan while retaining about 6% bottom overscan, covering the exposed stripe without moving the ground line. Make the image block-level to eliminate any replaced-element baseline seam. The existing `lg` background rule stays byte-for-byte unchanged.

## Implementation

1. **Phone-only scene scale**
   - `src/components/three/FractalCityScene.tsx`: use the existing `useMediaQuery` hook with `(max-width: 767px)`, define the compact scale once, expose it on `data-hero-scene` for test evidence, and pass it to `FractalObject`.
   - `src/components/three/OctahedronHero.tsx`: accept a numeric scene scale (default `1`) and apply it to the existing root `<group ref={groupRef} position={[0, 0.35, 0]}>`. Do not scale individual meshes, labels, or DOM hit layers separately.

2. **Typography, CTA alignment, and background coverage**
   - `src/components/sections/Hero.tsx`: retain `.text-body` on the blurb; remove `motion-safe:animate-bounce` from `ArrowDown`; keep the label and arrow in the existing centered flex row; add `block` to the background image class.
   - `src/index.css`: change only the compact `.hero-background-image` scale to `1.10`; preserve `translateY(6%)`, `object-position: 72% bottom`, and `transform-origin: 72% bottom`. Do not touch the `@media (min-width: 1024px)` treatment.

3. **Responsive contracts and visual baselines**
   - `tests/e2e/support/responsive-contract.mjs`: report/assert compact background top and bottom overscan, scene scale, computed blurb family/weight/case, and CTA label/icon vertical-center delta. Continue enforcing stage/scene/hit-region ownership, safe-zone containment, 44px CTA target, no overlap, and initial visual-viewport containment.
   - `tests/e2e/hero-responsive.spec.ts`: assert scale `1.08` below `md` and `1` at/above `md`; Inter/400/normal-case blurb typography; arrow/label center delta `<=1px` with no active animation; top overscan approximately 3–5% and bottom overscan 5–7%; and unchanged desktop transform/object-position/scene scale.
   - `tests/e2e/visual-evidence.spec.ts-snapshots/chromium-phone-320x568-home.png` and `tests/e2e/visual-evidence.spec.ts-snapshots/chromium-landscape-640x360-home.png`: regenerate only after reviewing the new phone geometry/crop. The 1024 and 1440 Home baselines must remain unchanged; unrelated Library baselines must remain unchanged.

## Validation

Run and record:

1. `pnpm typecheck`
2. `pnpm test`
3. `pnpm conformance`
4. `pnpm build`
5. Focused Playwright hero/visual tests with one worker, then the full responsive matrix across Chromium, WebKit, and Firefox with one worker to avoid known parallel WebGL GPU contention.
6. Inspect the 320x568 and 640x360 updated baselines plus representative 390x844, 412x915, 768/820/1023 tablets, 1024 boundary, 1440, and 1920 captures. Confirm no clipped labels, header/footer overlap, horizontal overflow, stripe, or ground-line regression.
7. Cold-boot and run the native Android suite separately for `android-emulator-s24-class` and `android-emulator-tablet`. Require real Chrome/browser bars, toolbar collapse/expand evidence, portrait/landscape reflow, zero fatal browser logs/health violations, and successful native S24 drag/tap/Story CTA interactions. Do not substitute a desktop-width emulation for this native lane.

## Paper viewport board (deliverable, not committed site code)

Create a new Paper document titled **Fractal Homepage — Responsive Viewport Review (FRAC-24)** after Paper Desktop is open. Capture the top-of-page viewport (not a full-page stitch) with fonts ready, the WebGL scene ready, reduced motion, scroll position 0, and deterministic initial scene pose. Store source PNGs under `test-results/viewport-gallery/FRAC-24/` and import them into labeled Paper frames.

Arrange four horizontal sections, each ordered small to large. Each frame label must include device class, engine/environment, and CSS viewport so simulated evidence is never represented as physical-device evidence:

| Section | Views |
|---|---|
| iPhone / WebKit layout | Small — 375x667; Medium — 390x844; Large — 430x932 |
| Android / Chromium layout | Small — 360x640; Medium Galaxy S24-class — 412x915; Large — 480x960 |
| Tablets | iPad Air / WebKit — 820x1180; Android / Chromium — 800x1280; iPad Pro boundary / WebKit — 1024x1366 |
| Desktop / Chromium | Compact desktop boundary — 1024x768; Standard — 1440x900; Wide — 1920x1080 |

Add a final **Native browser evidence** strip using the runner's fresh whole-device S24 and Android tablet portrait screenshots, labeled with their measured `visualViewport` and browser-toolbar state. If Apple CoreSimulator profiles are available, add their whole-device evidence too; otherwise retain the accurate `WebKit layout simulation` labels and do not claim native iOS verification. Return the Paper document identifier/link and the PNG evidence directory in the handoff.

## Acceptance criteria

- At phone widths below 768px, the complete Three scene is 8% larger; its labels and Three hit meshes scale with it, projected anchors remain within the DOM event source, and all visible labels remain inside the computed header/footer/gutter safe zone.
- At 768px and above the geometry scale is exactly 1; at 1024px and above the existing desktop hero/footer/masthead/background behavior is unchanged.
- The blurb computes to Inter, weight 400, normal case via `.text-body`; it remains at least 16px and readable without escaping its footer.
- The Story CTA remains at least 44x44px, reaches `#story`, has no arrow animation, and arrow/label vertical centers differ by no more than 1px.
- Compact background coverage has no exposed edge: top overscan is 3–5%, bottom overscan remains 5–7%, and visual inspection shows the ground line at the viewport bottom. Desktop crop is unchanged.
- Typecheck, unit tests, conformance, build, focused visual tests, full cross-browser responsive matrix, and fresh S24/tablet native Android suites pass.
- The Paper document contains all 12 labeled viewport captures plus native Android evidence, with simulation/native provenance explicit and a shareable document reference in the handoff.

## Reset 2026-07-24 by agent:codex-root

## Operator review rework: restore desktop crop

The compact background treatment is approved below 1024px and must remain unchanged. At the 1024px desktop boundary, explicitly restore the pre-FRAC-21 desktop `transform-origin: center`; otherwise the unchanged desktop transform inherits the compact `72% bottom` origin and produces a different crop. Verify the computed background position, transform, and origin immediately below and at the breakpoint, and confirm the 1024/1440 desktop visual baselines match the original desktop reference.

## Review Cycle 1 Findings

Native Galaxy S24 inspection showed that the source bitmap itself contains a rectangular border about 4.5% below its top edge. The initial `scale(1.10)` crop produced only about 4% top overscan, so the border remained visible even though the image covered the element bounds. Increase only the compact background scale to `1.12`, retaining `translateY(6%)`, `object-position: 72% bottom`, `transform-origin: 72% bottom`, and the existing `lg` rule. Update compact top-overscan contracts to 5–7%; bottom overscan remains 5–7%. Regenerate and inspect only the compact Home baselines, then run focused composition/visual checks and representative cross-engine crop checks. Geometry, typography, CTA, native/gallery work, and the full 528-case matrix are outside this rework pass.

## Reset 2026-07-24 by agent:codex-root
