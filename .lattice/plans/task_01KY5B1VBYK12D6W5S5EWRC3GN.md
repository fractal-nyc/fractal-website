# FRAC-17: Free simulator responsive test system and mobile Hero validation

## Human decision and truth boundary (2026-07-22)

The operator rejected paid BrowserStack. Replace the BrowserStack lane with the
free Android Emulator supplied by Android Studio and Apple's free iOS/iPadOS
Simulator supplied by Xcode. Keep the exhaustive local Playwright matrix as the
fast rendered-layout gate.

The three layers must be named accurately everywhere:

1. **Playwright desktop-engine simulation**: desktop Chromium, Firefox, and
   WebKit rendered at maintained viewport/touch profiles. This is fast layout
   coverage, not a mobile OS or mobile browser.
2. **Android Emulator / Apple Simulator**: Chrome for Android and Mobile Safari
   running inside virtual Android/iOS/iPadOS environments, including simulated
   system bars, browser chrome, safe areas, touch, orientation, and the live
   `visualViewport`. This is substantially closer to a phone/tablet experience,
   but is still virtual.
3. **Physical-device observation**: optional release/ticket evidence from a
   borrowed or owned handset/tablet. Only this layer may be called a real-device
   or physical-device pass.

An Android Virtual Device can match the Galaxy S24's layout class, resolution,
density, Android version, orientation, and navigation-bar pressure, but it is
stock Google Android/Chrome rather than Samsung hardware, One UI, or Samsung
Internet. An Apple Simulator runs simulated Mobile Safari rather than a physical
iPhone/iPad. The task can complete with simulator evidence after this pivot, but
must preserve those limitations in docs and reports. If the ticket owner later
requires exact Galaxy S24/Samsung Internet certification, the no-cost route is a
manual check on a borrowed/owned S24; do not silently restore a paid cloud lane.

## Current repository state to preserve

The branch `frac-17-real-device-responsive-testing` is six commits ahead of
`origin/master`. It already contains and has independently reviewed:

- a Playwright Test matrix spanning 320x568 phones through 1366x1024 iPad-Pro
  layout classes and 1920x1080 desktop, portrait/short landscape, touch/hover,
  reduced motion, and 200% root-text stress;
- all rendered routes and redirect coverage;
- runtime capture for `visualViewport`, layout viewport, screen/orientation,
  DPR, touch/hover/pointer, viewport units, safe-area probes, and failures;
- the mobile Home Hero repair: an in-flow stage/footer grid, `100svh` minimum,
  horizontal-only clipping, safe-area ownership, responsive background focal
  point, projected-label clamp, full-width compact blurb, and reachable CTA;
- rotation, WebGL touch, Story target, reduced-motion, overflow, navbar,
  primary-content, and stable Chromium visual evidence checks;
- green exhaustive Chromium/Firefox/WebKit validation recorded in Lattice.

Do not redo or weaken those changes. The pivot is to remove the paid provider,
adapt environment-specific assertions, and add simulator execution/evidence.

## Local machine findings

This Mac is Apple Silicon (`arm64`), runs macOS 26.2, has Homebrew 6.0.11, and
has about 246 GiB free, so it is capable of hosting both simulator stacks.
Neither stack is installed yet:

- `xcode-select -p` points to `/Library/Developer/CommandLineTools`; full Xcode,
  `xcodebuild`, `simctl`, Simulator.app, iOS runtimes, and simulator devices are
  absent.
- Android Studio, Android SDK, `adb`, `emulator`, `sdkmanager`, `avdmanager`,
  Java/JDK, and AVD definitions are absent.

Installing the applications and system images requires a large network download
and writing to `/Applications`/developer directories. Xcode may require App
Store/Apple-ID interaction, license acceptance, first-launch component setup,
and an iOS runtime selection. Android Studio requires its first-run Setup Wizard,
SDK-license acceptance, and system-image download. These are one-time host setup
steps, not repository test failures. Automate and document everything after the
applications/runtimes exist; if an App Store login, admin password, license
dialog, or first-run GUI blocks unattended work, stop with the exact required
operator action rather than bypassing it.

## Supported tooling decision

Use **Appium 3 + WebdriverIO** for the simulator lane:

- Appium's UiAutomator2 driver officially automates mobile web Chrome on Android
  emulators and can switch between the native browser UI and web context.
- Appium's XCUITest driver officially automates Safari on iOS/iPadOS simulators
  with `browserName: Safari`.
- Native context permits system/browser-bar gestures and whole-device evidence;
  web context permits DOM geometry, navigation, interaction, and JavaScript
  metrics.
- One WebDriver adapter can execute the same runner-neutral page contracts on
  Android and Apple simulators. Do not attempt to represent desktop Playwright
  WebKit as Mobile Safari.

Playwright's `_android` API is a viable experimental fallback for Android only,
but it cannot cover iOS Simulator and its own documentation says not everything
works. Prefer one supported simulator harness instead of introducing separate
Android and iOS runner designs. Keep `@playwright/test` for the existing local
matrix; it no longer needs to stay pinned for BrowserStack compatibility.

Official implementation references checked 2026-07-22:

- <https://developer.android.com/studio/run/emulator-commandline>
- <https://developer.android.com/studio/run/managing-avds>
- <https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators>
- <https://developer.apple.com/documentation/xcode/xcode-command-line-tool-reference>
- <https://github.com/appium/appium-uiautomator2-driver>
- <https://appium.github.io/appium-xcuitest-driver/latest/>
- <https://appium.github.io/appium-xcuitest-driver/latest/guides/capability-sets/>

## Phase 1 — Remove the paid-provider implementation cleanly

Remove only the BrowserStack-specific layer:

- delete `browserstack.yml`, `browserstack.smoke.yml`, and
  `scripts/run-browserstack.mjs`;
- remove `browserstack-node-sdk` and the `test:e2e:real*` scripts, updating the
  lockfile through pnpm rather than hand-editing it;
- remove the credential/tunnel/physical-device job from
  `.github/workflows/responsive.yml`, while retaining the local Playwright PR and
  scheduled/manual matrix and its artifacts;
- replace `BROWSERSTACK_RUN`, BrowserStack session APIs, exact provider-device
  mappings, remote timeouts/video, and paid-secret instructions with explicit
  simulator mode/identity;
- rename report labels and comments from `real`, `physical`, and provider names
  to `android-emulator`, `ios-simulator`, or `simulated-desktop` as appropriate.

Do not remove Playwright tests, screenshots, Hero fixes, metrics, the local CI
job, or the truthful optional physical checklist.

## Phase 2 — Reproducible host setup and doctor

### One-time application/runtime setup

Document the operator-visible first-run sequence and then record the discovered
versions; do not hardcode a future marketing name when a runtime/device-type ID
is available.

Apple:

1. Install full Xcode from Apple's supported distribution, launch it once,
   accept its license/components, select it as the active developer directory,
   and install one supported iOS Simulator runtime.
2. Verify `xcodebuild -version`, `xcrun simctl list runtimes`, and
   `xcrun simctl list devices available`.
3. Create or select simulator devices for a compact iPhone, a current notched or
   Dynamic-Island iPhone, and a 13-inch iPad Pro device type from the installed
   runtime. Use stable local names but discover their UDIDs dynamically.
4. Boot each once and clear any first-run Safari welcome/consent screen that
   prevents automation.

Android:

1. Install Android Studio, complete its Setup Wizard, install current Platform
   Tools/Emulator/Command-line Tools, and install an ARM64 Android 14 Google Play
   image. Android Studio's bundled JBR can supply `JAVA_HOME`; do not require a
   second arbitrary Java download unless the driver doctor rejects it.
2. Create a phone AVD named as **Galaxy-S24-class**, not Galaxy S24 hardware. Use
   a supported Google phone device definition plus recorded resolution/density
   overrides approximating the 1080x2340 S24 layout class. Create a Google tablet
   AVD for Android tablet coverage if the installed SDK supports it.
3. Boot each once, accept Chrome's first-run screen, enable Chrome's required
   testing/debugging state, and confirm `adb devices -l` reports it online.
4. Record `getprop`, `wm size`, `wm density`, Chrome version, system-image
   package/revision, navigation mode, and AVD name with every run.

### Repository setup scripts

Add idempotent, non-destructive scripts (exact filenames may be consolidated if
the ownership is clearer):

- `scripts/mobile-simulators/doctor.mjs`: checks macOS/arm64, full Xcode and
  active developer path, available iOS runtime/device types, Android SDK tools,
  `ANDROID_HOME`, Android Studio JBR/`JAVA_HOME`, required system image/AVDs,
  Appium and installed drivers, device boot state, Chrome/Safari availability,
  and ports. It exits with actionable setup text and never downloads or accepts
  licenses implicitly.
- `scripts/mobile-simulators/setup-appium.mjs`: exact-pins compatible Appium,
  UiAutomator2, XCUITest, and WebdriverIO versions; installs drivers into a
  documented local Appium home; and runs each driver's doctor. Generated SDK,
  AVD, Appium-home, WebDriverAgent, and browser-driver caches stay ignored.
- `scripts/mobile-simulators/run.mjs`: builds/serves the production preview on
  `0.0.0.0:4173`, starts Appium bound to loopback, boots/selects one declared
  simulator at a time, waits for readiness, runs the requested matrix, captures
  logs/evidence, and closes only processes/devices it started in `finally`.

Add scripts such as `simulators:doctor`, `test:e2e:android-emulator`,
`test:e2e:ios-simulator`, and `test:e2e:simulators`. No default `pnpm test` or PR
command should trigger multi-gigabyte SDK downloads.

## Phase 3 — Share the responsive contract across runners

Refactor—not duplicate—the current geometry logic into runner-neutral browser
functions that return serializable metrics and violations. Keep thin adapters:

- the existing Playwright adapter performs Playwright `expect` assertions and
  attachments;
- the Appium/WebdriverIO adapter executes the same page probes in the mobile web
  context, asserts the returned violations, and attaches the same environment
  schema plus simulator identity.

The shared contract must retain:

- every rendered internal route and redirect in `tests/e2e/support/routes.ts`;
- document/body horizontal overflow, primary-content reflow, canonical gutters,
  navbar/content relationship, touch-targets, page/console/first-party asset
  errors where the driver exposes them;
- Home stage/footer/blurb/CTA order, initial portrait visual-viewport
  containment, scene readiness, safe-zone projected labels, Story target,
  reduced motion, and reachability in short landscape/200% text stress;
- actual `inner*`, `visualViewport`, screen/orientation, DPR, UA/platform,
  touch/hover/pointer, `vh`/`svh`/`dvh`, safe-area, scroll, URL, timestamp,
  profile, OS/runtime/browser version, and simulator/AVD identity.

Simulator sessions must fail their environment preflight when:

- Android is not an `emulator-*` ADB target with the declared AVD/API/image,
  touch/non-hover Chrome UA, expected orientation, and live system/browser bars;
- Apple is not a booted CoreSimulator UDID matching the declared iPhone/iPad
  device type/runtime with Mobile Safari, touch semantics, and expected
  orientation;
- a desktop browser, WebView shell, different device, missing visual viewport,
  or unexpected fallback is returned.

Use native context for whole-screen screenshots and gestures, then web context
for DOM assertions. Store evidence under ignored `test-results/mobile-simulators`
and attach a manifest tying every screenshot/metric/log to profile, route,
orientation, state, run ID, and timestamp.

## Phase 4 — Simulator matrix and browser-chrome states

### Automated matrix

Run all rendered routes and redirects at least once per OS/browser family, with
the focused Home contract in every orientation/profile:

| Label in reports | Virtual environment | Required states |
|---|---|---|
| `android-emulator-s24-class` | Android 14 ARM64 Google image + Chrome, S24-class phone geometry | portrait, landscape, expanded toolbar, collapsed-toolbar attempt, gesture navigation; default font/display |
| `android-emulator-tablet` | supported Google tablet AVD + Chrome | portrait and landscape, touch tablet layout |
| `ios-simulator-compact` | compact available iPhone (prefer SE class) + Mobile Safari | portrait and landscape, expanded/collapsed toolbar attempt |
| `ios-simulator-notched` | current available notched/Dynamic-Island iPhone + Mobile Safari | portrait and landscape, safe-area evidence |
| `ipados-simulator-pro` | available 13-inch iPad Pro + Mobile Safari | 1024/1366-class portrait and landscape, touch desktop-boundary behavior |

Do not fake simulator browser dimensions with WebDriver window resizing. Select
the simulator device and orientation, then read its actual viewport. The host is
reachable from Android at `http://10.0.2.2:4173` and from Apple Simulator through
the host loopback address; the runner must prove readiness before navigation.

For browser chrome, capture whole-screen plus page metrics at initial load, use a
native touch scroll to attempt collapse, capture again, return to the top to
attempt expansion, and capture a third time. A visual-viewport height change is
positive automated evidence. If the simulator/browser version does not expose a
deterministic transition, record `inconclusive-manual-simulator-check-required`
and complete the check interactively in that simulator; never convert an
unchanged height into a pass.

Rotate without page reload and assert orientation/viewport changes, route state
survives, content reflows, the Hero remains reachable, and no horizontal pan is
introduced. Exercise a native drag on the WebGL model, a vertical page swipe,
the mobile menu, Story CTA, and one node tap without duplicate navigation.

### Text/accessibility stress

Keep the automated 200% web text-reflow profile in Playwright. In simulator
evidence also record:

- Android's largest practical system font/display scale plus Chrome page text
  behavior;
- iOS Larger Text and Safari Page Zoom where those settings affect web content.

If those settings cannot be changed reliably through supported simulator APIs,
make them a short, documented interactive simulator checklist rather than
editing private preference files or claiming automation.

## Phase 5 — CI and cost policy

The existing Linux Playwright job remains the automatic PR and nightly/manual
gate. Remove the paid BrowserStack job. Do not add an automatic macOS simulator
job until the repository owner's GitHub Actions billing/quota is confirmed;
Apple-hosted runner minutes are not guaranteed to be cost-free for every repo.

Simulator scripts are initially local/manual and produce durable artifacts. A
future opt-in `workflow_dispatch` job may use preinstalled GitHub runner Xcode
and an Android-emulator action only after a separate cost/runner-compatibility
decision. It must still label results virtual, cache SDKs safely, and never be a
condition for running the no-cost local tools.

## Validation sequence

1. Preserve the previously reviewed Hero/local-suite baseline and current
   screenshots before provider removal.
2. Remove BrowserStack code/dependency/CI and prove no provider/secret/tunnel
   reference remains outside historical Lattice events.
3. Install/initialize host tooling as far as permissions and first-run dialogs
   allow; run `simulators:doctor` and record exact versions/device inventory.
4. Refactor shared probes and keep `pnpm test:e2e:fast` and the complete local
   three-engine matrix green.
5. Bring up one Android phone AVD; run preflight, all routes, focused Home,
   interaction/orientation/browser-chrome checks, and inspect device screenshots.
6. Bring up compact/notched iPhone and iPad Pro simulators; run the corresponding
   Mobile Safari matrix and inspect safe-area/browser-chrome screenshots.
7. Run repository gates in order: `pnpm typecheck`, `pnpm test`, `pnpm build`,
   `pnpm conformance`, `pnpm test:e2e:fast`, then the exhaustive local matrix and
   complete simulator matrix.
8. Cold review checks the diff, doctors, evidence manifests/screenshots, every
   acceptance item, truthful terminology, process cleanup, and no user-level
   generated simulator files committed.

## Acceptance criteria

- BrowserStack configs, SDK, secrets, tunnel runner, scripts, documentation, and
  CI job are gone; the local Playwright matrix and all Hero fixes remain.
- One runner-neutral responsive contract is used by desktop Playwright and the
  Appium simulator adapter; route and geometry rules are not copied into two
  drifting suites.
- `simulators:doctor` accurately detects this Mac's Xcode/iOS and Android/AVD/
  JDK/Appium prerequisites and gives precise, non-destructive remediation.
- Actual Chrome inside an Android 14 S24-class AVD passes every route plus the
  focused Home contract in portrait and landscape, with whole-screen browser/
  system-bar screenshots and recorded live visual-viewport metrics.
- Actual Mobile Safari inside compact and notched iPhone simulators and an iPad
  Pro simulator passes every route plus the focused Home contract in required
  orientations, with safe-area/browser-toolbar evidence through iPad Pro size.
- Initial portrait Home evidence contains the complete stage/labels, blurb,
  `Explore our Story`, and arrow without intersection or visual-viewport clip;
  short landscape and enlarged text grow/scroll without lost content.
- Native toolbar-collapse/expand attempts, rotation without reload, WebGL drag,
  page swipe, menu, CTA, and node navigation are recorded; unsupported toolbar
  or accessibility-setting automation is explicitly marked for an interactive
  simulator check.
- Reports and docs call the environments emulators/simulators and never claim a
  physical Galaxy S24, Samsung Internet, iPhone, or iPad pass. The S24-class AVD
  limitation is visible in the main testing guide, not buried in a footnote.
- No SDK, system image, AVD, CoreSimulator data, WebDriverAgent build, Appium
  home, Chromedriver cache, credentials, or multi-gigabyte generated artifact is
  committed.
- Typecheck, Vitest, build, design conformance, fast Playwright, exhaustive
  Chromium/Firefox/WebKit, and all configured simulator runs pass, or a genuine
  one-time GUI/admin installation blocker is recorded as `needs_human` with the
  exact action required.

## Risks and mitigations

- **First-run GUI/admin gate:** Xcode/App Store/license/runtime and Android Studio
  Setup Wizard may require the operator. Detect and report one exact action;
  continue all repository work that does not depend on it.
- **Large downloads/disk:** check disk and installed inventory first; install one
  supported ARM64 runtime/image per OS family and reuse it.
- **Chrome/Chromedriver drift:** record Chrome and driver versions, exact-pin the
  harness, use Appium's supported compatibility discovery only on loopback, and
  fail with a version-specific message.
- **Simulator version drift:** discover runtime/device-type IDs from `simctl`
  rather than assuming a marketing model exists in every Xcode release.
- **WebGL/gesture flake:** wait for font/texture/scene readiness, serialize
  simulator sessions, use bounded retries only for boot/WDA startup, and retain
  whole-screen screenshots/Appium/Xcode/ADB logs on failure.
- **False physical claims:** encode environment type in project names, manifest,
  filenames, docs, and test preflight. A matching viewport is not matching
  hardware.
- **CI cost:** keep simulators local/manual until runner quota is explicitly
  approved; retain the Linux Playwright gate for automatic coverage.

## Review Cycle 1 Findings

Independent review classified the following as implementation-level rework:

1. Reject unknown `--platform` and `--profile` values in doctor, setup, and run
   entry points. No empty selection may return `ok: true` or claim that zero
   drivers are ready.
2. Verify simulator identity beyond display names: Apple profiles must match the
   declared CoreSimulator device type/runtime, while Android profiles must
   inspect the AVD config/system image/API/ABI plus the S24-class or tablet
   size/density contract before reporting readiness.
3. Enforce simulator browser health per route. Browser/page errors and failed
   first-party assets must be collected for each navigation and fail the run;
   recording a single terminal browser-log snapshot is not sufficient.

Re-run the doctor/setup negative cases, focused shared-contract tests, standard
repository gates, and an independent cold review after these corrections.

## Reset 2026-07-22 by agent:codex-root
