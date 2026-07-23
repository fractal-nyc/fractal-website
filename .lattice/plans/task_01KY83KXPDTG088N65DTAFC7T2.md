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
