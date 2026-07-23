# FRAC-20: Fix native Android Hero node taps

## Scope and diagnosis

Repair the real pointer path from the centered Hero event source to the R3F nav-node hit meshes so a native Android tap navigates exactly once. Preserve the existing interaction contract: the full-bleed canvas remains visually independent from the smaller hit region, horizontal one-finger drags continue to orbit, vertical gestures continue to participate in native `pan-y` page scrolling, and desktop pointer behavior remains intact. No visual or design-token change is required.

The current evidence rules out the Appium coordinate transform as the primary fault:

- `test-results/mobile-simulators/2026-07-23T19-23-51-839Z/android-emulator-s24-class/manifest.json` records a valid native WebView transform and a passing `native-webgl-drag` through the same `.hero-hit-target` event source.
- The Appium log sends a real W3C touch sequence to `(540,1574)` native px. With the recorded WebView rect/scale, that is approximately `(206,493)` CSS client px, which is the visible Co-Living node/dot anchor derived from its projected label.
- The whole-device failure screenshot visibly confirms the Co-Living dot at that location, but the URL remains `/`.
- `FractalCityScene.tsx` connects R3F to the centered hit-region div while rendering the canvas in the full Hero stage, and sets `eventPrefix="client"`. In installed R3F 9.5.0, that prefix computes NDC as `clientX / state.size.width` and `clientY / state.size.height` without subtracting the canvas bounding rect. The Hero canvas begins below the 80px navbar. Therefore the observed tap is raycast as roughly `y=-0.736` instead of the canvas-local `y=-0.454`, missing the visible node. OrbitControls still reacts because it consumes the DOM pointer stream directly and does not depend on the R3F mesh raycast.

Treat that offset-coordinate mismatch as the leading diagnosis, then confirm it with the trace below before keeping a production change.

## Implementation plan

1. **Capture a diagnostic before/after event trace.** In the focused Android run, install temporary/test-only capture listeners on `[data-hero-hit-region] > div` for `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, and `lostpointercapture`. Record event type, pointer id/type, client coordinates, target, default-prevented state, pointer-capture state, elapsed time, the canvas `getBoundingClientRect()`, and both the current prefix-based NDC and canvas-rect-adjusted NDC. Temporarily instrument the `useTapHandlers` mesh callbacks (or dispatch an equivalent test-only trace signal) to distinguish "DOM events arrived but ray missed" from cancellation/timing. Remove temporary production logging before commit. Expected pre-fix trace: matching DOM down/up with no meaningful motion, but no nav-mesh callback at the current NDC; expected post-fix trace: the same DOM sequence reaches the Co-Living mesh down/up and calls `handleNavigate` once. If the trace instead shows mesh down/up already firing, pause this approach and inspect the tap duration/cancellation/Wouter callback path rather than layering on an unrelated fix.

2. **Normalize R3F events in canvas-local coordinates.** In `src/components/three/FractalCityScene.tsx`, replace `eventPrefix="client"` with a small custom R3F event manager/compute function based on the default `events(state)` manager. For every pointer event, sample `state.gl.domElement.getBoundingClientRect()`, subtract `rect.left/top` from `event.clientX/clientY`, normalize against the canvas CSS `rect.width/height`, assign `state.pointer`, and refresh `state.raycaster` from the active camera. Remove `eventPrefix` because Canvas applies it after manager creation and would overwrite the custom compute function. Keep `eventSource={eventSourceRef}`, OrbitControls' `domElement`, the `.hero-hit-target` size, and the scoped `touch-action: pan-y !important` rule unchanged. Sampling the rect per event keeps the mapping correct under scrolling, responsive resize/orientation, browser toolbar changes, safe-area offsets, and any nonzero canvas origin.

3. **Keep the tap discriminator's scroll guarantees.** Do not restore mesh `onClick`, call `setPointerCapture` from `useTapHandlers`, or stop propagation on pointerdown. Retain the existing movement/time classifier and only stop R3F propagation on a confirmed pointerup. Add `onPointerCancel` cleanup only if the diagnostic proves Android leaves stale `downRef` state; it is not part of the coordinate fix by default.

4. **Add focused regression coverage.** Extract the client-to-canvas NDC calculation into a small pure helper if needed for deterministic tests. Add cases for the observed mobile geometry (`canvas top=80`, 412px-wide stage, Co-Living client point), a nonzero left/top origin, and the canvas center. Assert the old unadjusted value would differ and the adjusted value is in the expected range. Retain/run `src/__tests__/hero-scroll.test.tsx` to prove pointerdown still does not stop propagation, a short stationary gesture taps, and drags/long presses do not navigate.

5. **Exercise the real interaction in Playwright.** Extend `tests/e2e/hero-responsive.spec.ts` (or a focused adjacent spec) on the designated touch Chromium profile: wait for the WebGL scene and projected labels, choose a visible internal node, derive the node anchor by undoing the label's decorative DOM translation as the Appium suite does, send a trusted CDP touch tap, and assert one stable internal route transition. Continue asserting `getComputedStyle(hitTarget).touchAction === "pan-y"`, horizontal drag rotates labels, and a vertical page gesture/wheel can scroll. Add a desktop mouse-click assertion if the new touch test does not naturally cover fine-pointer navigation.

6. **Preserve and improve native evidence, not the workaround.** Reuse the FRAC-19 Appium projected-anchor and native-coordinate code; do not add hard-coded S24 coordinates or special-case Chrome 113 in production. Optionally persist the concise DOM/R3F trace fields in the simulator manifest if they are useful durable evidence, but keep verbose diagnostic logging out of normal production/browser output. The native-node record must include label, before URL, after URL, and a single stable navigation.

## Files expected to change

- `src/components/three/FractalCityScene.tsx` — custom R3F canvas-local pointer computation; remove the overriding `eventPrefix`.
- A small three-free coordinate helper/test file if extraction makes the computation directly testable.
- `tests/e2e/hero-responsive.spec.ts` — trusted touch node-navigation regression plus preserved drag/scroll assertions.
- `src/__tests__/hero-scroll.test.tsx` only if an additional tap-state assertion is necessary; existing behavior should otherwise remain unchanged.
- `scripts/mobile-simulators/suite.mjs` / `self-test.mjs` only if retaining compact event-trace evidence or a pure trace helper. Do not weaken the existing native tap acceptance check.
- No `DESIGN.md`, token, layout, node-geometry, route-data, or visual-style changes are expected.

## Validation

Run the narrow checks first, then the repository gates:

1. Focused coordinate/tap unit tests and `pnpm simulators:self-test`.
2. The focused Hero Playwright spec on the designated touch project, confirming node tap, horizontal drag, `pan-y`, and scroll behavior.
3. `pnpm typecheck`, `pnpm test`, and `pnpm build` in the required order; run `pnpm test:e2e:fast` (or the full Hero-relevant matrix) to catch desktop/mobile regressions.
4. `pnpm simulators:doctor -- --platform android`, then `node scripts/mobile-simulators/run.mjs --platform android --profile android-emulator-s24-class` against the production preview. The new evidence manifest must finish `passed`, include both `native-webgl-drag: passed` and `native-node-tap: passed`, show `/ -> /co-living` (or another selected internal route) exactly once, and complete the subsequent portrait-to-landscape check without reload. Review the whole-device screenshots and browser/page logs, not only the exit code.
5. Treat this as S24-class Android 14 emulator/Chrome 113 evidence, not physical Galaxy S24 certification; keep the documented physical-device observation separate.

## Acceptance criteria

- The diagnostic trace demonstrates that the failure was a canvas-origin raycast mismatch (or records the alternate observed cause before changing direction).
- A real Appium W3C tap on a visible internal Hero node navigates once to the node's route and remains stable after the wait period.
- Horizontal native drag still moves the real WebGL projected labels.
- Vertical gestures over the hit region retain native `pan-y` scrolling; `useTapHandlers` still does not capture/stop pointerdown.
- Desktop mouse and keyboard fallback navigation continue to work; external Hero destinations retain their new-tab behavior.
- No hard-coded device coordinates, browser-version production branch, visual change, or DESIGN.md drift is introduced.
- Focused tests, typecheck, unit suite, build, Hero browser coverage, and the S24-class Appium profile pass with inspectable evidence.

## Branch and commit coordination

The shared worktree is currently on `frac-19-stabilize-android-webgl` at `0b1f50e`, with the unmerged FRAC-17 simulator system underneath it and eight FRAC-19 commits providing the native-coordinate/tap harness. Local `master` does not contain that stack, and the worktree also contains unrelated/uncommitted Lattice state. Do not clean, reset, stash, amend, or commit over those files.

Before implementation, create/link a dedicated `frac-20-fix-native-android-hero-taps` branch. Because validation depends on the unmerged FRAC-19 harness, make it an explicit stacked branch from the current FRAC-19 HEAD and isolate its PR/diff against `frac-19-stabilize-android-webgl`; do not add FRAC-20 production changes directly to the FRAC-19 branch. Once the prerequisite stack lands, retarget/synchronize the FRAC-20 branch with `master` through the orchestrator's approved workflow (no force-push without explicit approval). Keep the production fix and its regression tests in a focused `FRAC-20:` commit, link the branch with Lattice, and leave Lattice lifecycle/review artifacts attributable to their own agents.
