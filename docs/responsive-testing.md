# Responsive testing: desktop engines, mobile simulators, and physical checks

The responsive system deliberately names three different evidence levels:

1. **Playwright desktop-engine simulation** renders every route in desktop
   Chromium, Firefox, and WebKit at maintained viewport, touch, orientation,
   motion, and text-stress profiles. It is fast layout coverage, not a mobile
   operating system or mobile browser.
2. **Android Emulator / Apple Simulator** runs Chrome for Android and Mobile
   Safari inside virtual Android, iOS, and iPadOS environments. These runs
   include simulated system bars, browser chrome, safe areas, touch,
   orientation, and the live `visualViewport`, but they are still virtual.
3. **Physical-device observation** is an optional release or ticket check on a
   borrowed/owned handset or tablet. Only this level may be called a real- or
   physical-device pass.

The maintained Android phone is **Galaxy S24-class**, not a Galaxy S24. Its AVD
can approximate 1080x2340 resolution, density, Android 14, orientation, and
navigation-bar pressure, but it runs Google's emulator image and Chrome—not
Samsung hardware, One UI, or Samsung Internet. Exact S24/Samsung Internet
certification still requires a physical S24.

## Fast local commands

```sh
pnpm test:e2e:fast # PR subset in simulated desktop Chromium
pnpm test:e2e:full # all profiles in desktop Chromium, Firefox, and WebKit
```

Install the three Playwright engines once with:

```sh
pnpm exec playwright install chromium firefox webkit
```

The Linux GitHub Actions job runs the fast matrix on pull requests and the full
matrix on schedule/manual dispatch. Simulator jobs are intentionally local and
manual: macOS hosted-runner minutes and SDK storage are not assumed to be free.

## One-time simulator host setup

The repository never downloads multi-gigabyte SDKs, accepts licenses, edits
private simulator preferences, or installs applications implicitly. Complete
these supported first-run flows, then let the doctor report what remains.

### Apple Simulator

1. Install full Xcode from Apple's supported distribution.
2. Launch Xcode once, accept its license and components, and install one
   supported iOS Simulator runtime in **Xcode > Settings > Components**.
3. Select full Xcode if needed:

   ```sh
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

4. In Xcode's Devices and Simulators window, create available device types with
   these stable local names:

   - `Fractal Compact iPhone` — prefer an available iPhone SE class.
   - `Fractal Notched iPhone` — use a current notched/Dynamic-Island iPhone.
   - `Fractal iPad Pro 13-inch` — use an available 13-inch iPad Pro.

5. Boot each once, open Safari, and clear any welcome/consent screen.

If a device type is named differently in the installed Xcode, keep the profile
role but override the local name with `IOS_COMPACT_SIMULATOR`,
`IOS_NOTCHED_SIMULATOR`, or `IPADOS_PRO_SIMULATOR`.

### Android Emulator

1. Install Android Studio and complete its Setup Wizard.
2. In SDK Manager install Platform Tools, Emulator, Command-line Tools (latest),
   and an ARM64 Android 14 / API 34 Google image. Android Studio's bundled JBR
   is the default Java runtime; a second JDK is not required unless the driver
   doctor rejects it.
3. In Device Manager create:

   - `Fractal_Galaxy_S24_Class_API_34` — a supported Google phone definition
     using the API 34 image, with recorded 1080x2340-class resolution/density
     overrides where the Device Manager supports them.
   - `Fractal_Tablet_API_34` — a supported Google tablet definition using the
     same API/image family.

4. Boot each once, finish Chrome's first-run flow, use gesture navigation, and
   confirm it appears in `adb devices -l`.

Override nonstandard AVD names with `ANDROID_PHONE_AVD` and
`ANDROID_TABLET_AVD`. Override an SDK outside `~/Library/Android/sdk` with
`ANDROID_HOME`; the scripts also honor `ANDROID_SDK_ROOT` and `JAVA_HOME`.

### Repository harness

```sh
pnpm install
pnpm simulators:setup-appium # exact-pinned Appium drivers in ignored local cache
pnpm simulators:doctor       # read-only inventory and precise remediation
```

The harness pins Appium, WebdriverIO, UiAutomator2, and XCUITest. Driver state is
kept under ignored `.mobile-simulators/`; Android SDKs, AVDs, CoreSimulator
data, WebDriverAgent builds, and Chromedriver caches remain outside version
control. Re-running setup is idempotent for matching versions.

## Simulator commands

```sh
pnpm test:e2e:android-emulator
pnpm test:e2e:ios-simulator
pnpm test:e2e:simulators

# Diagnose or run one family/profile while iterating:
pnpm simulators:doctor -- --platform android
node scripts/mobile-simulators/run.mjs --platform android --profile android-emulator-s24-class
```

The runner builds and serves the production site on `0.0.0.0:4173`, starts a
loopback-only Appium server, boots/selects one declared virtual device at a
time, verifies its identity, and cleans up only processes/devices it started.
Android reaches the host at `http://10.0.2.2:4173`; Apple Simulator uses the
host loopback address. Port 4173 or 4723 already being occupied is an explicit
doctor failure, preventing a stale server from being mistaken for this run.

Evidence is written under ignored `test-results/mobile-simulators/<run-id>/`.
Each profile manifest ties whole-screen screenshots, DOM probes, live viewport
metrics, orientation, toolbar state, route, browser/runtime version, AVD/UDID,
and timestamps to the run. An unchanged toolbar height is recorded as
`inconclusive-manual-simulator-check-required`, never as a pass.

## Maintained coverage

The shared route list and runner-neutral DOM probes live in
`tests/e2e/support/`. Thin Playwright and Appium adapters use the same overflow,
primary-content, gutter, navbar, touch-target, Hero composition, label-safe-zone,
and environment metrics contract.

The automated simulator matrix is:

| Report label | Virtual browser/environment | Required states |
|---|---|---|
| `android-emulator-s24-class` | Android 14 Google AVD + Chrome | portrait, landscape, toolbar attempts, gesture navigation |
| `android-emulator-tablet` | Android 14 Google tablet AVD + Chrome | portrait and landscape |
| `ios-simulator-compact` | compact iPhone Simulator + Mobile Safari | portrait, landscape, toolbar attempts |
| `ios-simulator-notched` | notched iPhone Simulator + Mobile Safari | portrait, landscape, safe-area evidence |
| `ipados-simulator-pro` | 13-inch iPad Pro Simulator + Mobile Safari | portrait and landscape through the 1024px structural boundary |

Every rendered route and legacy redirect runs at least once in Android Chrome
and once in Mobile Safari. Every profile runs the focused Home contract. The
interaction profiles exercise a native WebGL drag, page swipe/browser-toolbar
attempt, menu, Story CTA, and one projected-node tap; rotation occurs without a
page reload.

The simulator cannot reliably automate supported system accessibility settings
across every runtime. For each profile, interactively check the largest
practical Android font/display scale or iOS Larger Text plus Safari Page Zoom.
The 200% web text-reflow profiles remain automatic in Playwright.

## Optional physical release observation

When a ticket or release requires hardware evidence, record device/OS build,
browser/version, navigation mode, font/display scale, orientation, live
`visualViewport`, tester/date, and linked screenshots. For this Hero ticket,
the highest-value physical check is a Galaxy S24 in Chrome and Samsung Internet
with browser/OS bars expanded and collapsed, portrait and landscape. Simulators
and desktop-engine profiles do not substitute for that claim.

References: [Android Emulator command line](https://developer.android.com/studio/run/emulator-commandline),
[managing AVDs](https://developer.android.com/studio/run/managing-avds),
[Apple installing Xcode and simulators](https://developer.apple.com/documentation/safari-developer-tools/installing-xcode-and-simulators),
[UiAutomator2 driver](https://github.com/appium/appium-uiautomator2-driver), and
[XCUITest driver](https://appium.github.io/appium-xcuitest-driver/latest/).
