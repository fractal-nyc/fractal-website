# FRAC-19: Stabilize WebGL in Android simulator Chrome

## Scope and approach

Automate the API 34 / Chrome 113 Apple-Silicon emulator workaround without changing the website or weakening any responsive/WebGL assertions.

1. In `scripts/mobile-simulators/config.mjs`, declare the exact Chrome workaround on the maintained Android profiles (Chrome args `--in-process-gpu`, `--disable-vulkan`, and `--ignore-gpu-blocklist`, gated to the affected Chrome 113 runtime). Keep iOS and unaffected/newer Chrome runtimes unchanged.
2. Extract/build Android WebDriver capabilities in a testable helper and have `scripts/mobile-simulators/suite.mjs` pass the profile-declared flags through `goog:chromeOptions.args`. This is required because Appium/Chromedriver rewrites `/data/local/tmp/chrome-command-line`; the runner must not race it by writing that file itself. Preserve the existing browser-log requirement, route-health probes, Hero-ready wait, projected-label checks, native WebGL drag/tap, screenshots, and all other pass/fail criteria.
3. Add a small Android Chrome preparation helper used by `scripts/mobile-simulators/run.mjs` after AVD identity/version validation and before Appium creates the browser session. Inspect the selected AVD's `debug_app`/wait state, refuse to overwrite a conflicting debug package or wait-for-debugger state, apply `am set-debug-app --persistent com.android.chrome` only when the affected profile needs it, force-stop Chrome so the next Appium launch is clean, and return ownership metadata. Cleanup must be idempotent and clear only debug state introduced by this run, including normal failure paths; pre-existing compatible Chrome debug state must be left intact. Record whether the workaround was required/applied/pre-existing in run evidence without recording unrelated device state.
4. Extend `scripts/mobile-simulators/doctor.mjs` read-only diagnostics for a booted selected Android AVD: report the Chrome version/workaround applicability and fail with precise remediation for conflicting debug-app/wait state. An unbooted AVD remains runnable because the runner performs the authoritative check after boot.
5. Extend `scripts/mobile-simulators/self-test.mjs` with pure/faked-command coverage for version/profile gating, exact `goog:chromeOptions.args`, no Android flags on iOS or unaffected Chrome, compatible/pre-existing/conflicting debug states, mutation ownership, and idempotent cleanup. Update `docs/responsive-testing.md` to explain why Chrome 113 needs the emulator-only flags, that Chromedriver owns the temporary command-line file, how the runner safely manages/restores `debug_app`, and that this does not represent production browser flags or physical-S24 certification.

## Acceptance criteria

- The affected Android API 34 Chrome 113 Appium session receives all three workaround flags and persistent Chrome debug mode before browser launch; newer/unaffected Chrome and all Apple profiles do not.
- Re-running setup is safe: conflicts are rejected, compatible pre-existing state is preserved, and runner-owned state is removed on ordinary success or failure.
- Existing site-health and WebGL interaction checks remain mandatory; no skips, console suppression, fallback content, or relaxed timeouts/assertions are introduced.
- `pnpm simulators:self-test`, `pnpm simulators:doctor -- --platform android`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- Focused real-environment validation passes on `android-emulator-s24-class`, then on `android-emulator-tablet`, with manifests showing Chrome 113, workaround metadata, WebGL Hero readiness, and the existing native interaction evidence.

## Review Cycle 1 Findings

- Static review passed: Chrome 113/profile gating, exact Appium flags, iOS/newer-Chrome isolation, safe debug-app ownership/cleanup, doctor behavior, self-tests, typecheck, Vitest, and build are correct.
- Complete a full S24-class run after the scroll-reset fix, including the native node tap, and then a full tablet run.
- The S24 rerun reached `/political-club` with all first-party health checks green but failed on `source: network` 403s emitted by the embedded Luma iframe's external Sentry endpoint. Treat only cross-origin third-party network log failures as evidence-only; keep first-party network failures and all JavaScript, console, and page errors fatal. Add focused self-test coverage for this classification before rerunning both profiles.

## Review Cycle 2 Findings

- S24 host-GPU evidence `2026-07-23T18-49-59-899Z` passed the complete route sweep, homepage WebGL readiness, native drag/tap interaction, and CTA navigation to `/#story`.
- The expected CTA navigation reloads the document, so the suite's injected runtime-health capture no longer exists when it resets to `/`. Reinstall and verify the same capture immediately after the CTA navigation before beginning the next route; do not relax any health, WebGL, or interaction assertion.
- Rerun S24-class and tablet profiles to completion.

## Review Cycle 3 Findings

- S24 evidence `2026-07-23T18-54-40-927Z` passed the route sweep, real browser-chrome height transition, homepage WebGL, Story CTA, runtime-health recovery, and native WebGL drag, then missed the Co-Living label during the native tap.
- The suite's inferred `browserTop` treated all non-web height as top browser chrome. On this device that is 340 physical pixels, but 63 pixels are the bottom Android navigation bar. The native hierarchy reports the exact Chrome WebView bounds as `[0,279][1080,2280]`; the old mapping therefore tapped 61 pixels below the label.
- Resolve the actual native WebView rectangle after switching to native context (`android.webkit.WebView` on Android and the corresponding `XCUIElementTypeWebView` on Apple), validate its dimensions against the CSS visual viewport, and map CSS points from that rect. Add a pure/testable coordinate transform with focused coverage. Do not silently fall back to the inaccurate subtraction heuristic.
- Rerun S24-class and tablet profiles to completion. This is the final permitted review-rework cycle.

## Reset 2026-07-23 by agent:codex-root

## Reset 2026-07-23 by agent:codex-root

## Reset 2026-07-23 by agent:codex-root
