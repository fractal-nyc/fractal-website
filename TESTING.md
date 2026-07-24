# Testing and responsive QA

This is the canonical map of Fractal NYC's verification system. Use it to choose the right test layer, understand what a passing result proves, find the generated evidence, and decide where a new regression test belongs.

The labels used throughout this guide are:

- `UNIT` — Vitest and Testing Library behavior in jsdom.
- `BROWSER-CONTRACT` — DOM, layout, navigation, and interaction contracts in Playwright browser engines.
- `VISUAL` — reviewed Chromium screenshot baselines for deliberately stable compositions.
- `NATIVE` — Appium and WebdriverIO in Android emulators or Apple simulators, including browser and system chrome.
- `GATE` — static checks, production build verification, and CI orchestration.

## Accuracy ladder

No single layer replaces the others. Move up this ladder when a bug depends on more of the real device environment.

| Fidelity | Layer | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Fastest | `UNIT` | React behavior, semantics, route/content regressions, pure gesture math, and token synchronization | Real layout, WebGL, browser chrome, native touch, or a physical device |
| Browser-rendered | `BROWSER-CONTRACT` | Production-preview layout and behavior across controlled viewports and Chromium/Firefox/WebKit engines | A named phone's system bars, live mobile browser toolbar, or physical hardware |
| Pixel baseline | `VISUAL` | Selected Chromium compositions still resemble reviewed reference images within bounded raster variance | Every route, engine, device, or native browser UI |
| Native virtual device | `NATIVE` | Mobile Chrome/Safari with emulator/simulator identity, live `visualViewport`, browser/system chrome, native gestures, and rotation | Physical display cutouts, OEM/browser variants not represented by the profile, thermals, or real hardware performance |
| Highest, manual | Physical-device check | The exact device/browser/OS combination in a user's hand | Broad repeatable automation unless a separate device lab is introduced |

An emulator or simulator is substantially more faithful than resizing Chrome DevTools, but it is still not a physical device. A configured native profile also does not count as a successful run: use that run's recorded artifacts as proof.

## Commands

All commands run from the repository root after `pnpm install`.

| Command | Label / environment | Use it for | Scope and prerequisites | Result or evidence |
| --- | --- | --- | --- | --- |
| `pnpm typecheck` | `GATE` / TypeScript | Type correctness | Entire TypeScript project | Pass/fail on stdout |
| `pnpm build` | `GATE` / Vite | Production bundling | Entire application; writes the production bundle | `dist/` plus stdout |
| `pnpm conformance` | `GATE` / Node | Net-new off-vocabulary color detection | Source files compared with the sanctioned CSS tokens and grandfathered baseline | Pass/fail on stdout |
| `pnpm test` | `UNIT` / Vitest + jsdom | Fast behavior and regression suite | All `src/__tests__/**/*.test.{ts,tsx}` files | Vitest result on stdout |
| `pnpm test:watch` | `UNIT` / Vitest + jsdom | Focused development feedback | Same suite, rerun interactively on changes | Interactive terminal result |
| `pnpm test:coverage` | `UNIT` / Vitest coverage | Local coverage inspection | Same suite; requires a compatible Vitest coverage provider to be installed | Coverage summary and, when configured, local `coverage/` output; no threshold is enforced |
| `pnpm test:e2e:fast` | `BROWSER-CONTRACT` + `VISUAL` / Playwright Chromium | Pull-request responsive confidence | 8 representative profiles; Vite preview is started automatically | List reporter locally; failure traces/screenshots in `test-results/playwright/` |
| `pnpm test:e2e:full` | `BROWSER-CONTRACT` + `VISUAL` / Playwright | Scheduled/manual exhaustive browser matrix | 22 profiles across Chromium, Firefox, and WebKit; browser binaries must be installed | Local list output; failure evidence in `test-results/playwright/`; CI HTML report in `playwright-report/` |
| `pnpm simulators:doctor` | `NATIVE` / local host | Read-only prerequisite and identity diagnosis | Android SDK/AVDs and/or Xcode simulators, Appium, drivers, and host tooling | Diagnostic stdout; no device suite run |
| `pnpm simulators:self-test` | `NATIVE` / Node | Verify harness logic without launching devices | Repository dependencies installed | Assertions on stdout; no product/device evidence |
| `pnpm simulators:setup-appium` | `NATIVE` / local host | Install and doctor pinned Appium drivers | Network access and platform SDK prerequisites | Repository-local drivers in `.mobile-simulators/appium-home/` plus stdout |
| `pnpm test:e2e:android-emulator` | `NATIVE` / Android Chrome | Android phone and tablet verification | Android SDK, configured AVDs, Chrome/WebView, and Appium driver | Timestamped run under `test-results/mobile-simulators/` |
| `pnpm test:e2e:ios-simulator` | `NATIVE` / Mobile Safari | iPhone and iPad simulator verification | macOS, Xcode, configured simulators, and XCUITest driver | Timestamped run under `test-results/mobile-simulators/` |
| `pnpm test:e2e:simulators` | `NATIVE` / Android + Apple | Run all maintained native profiles | All Android and Apple prerequisites above | Timestamped combined run under `test-results/mobile-simulators/` |

The heavy native commands accept the harness's `--profile <id>` selection after `--`, for example `pnpm test:e2e:android-emulator -- --profile android-emulator-s24-class`.

## Normal workflow

1. While editing, run the focused `UNIT` suite with `pnpm test` or `pnpm test:watch`.
2. For layout, navigation, Hero, or responsive changes, run `pnpm test:e2e:fast` locally.
3. Before a pull request, the repository rulebook requires `pnpm typecheck`, `pnpm test`, then `pnpm build`. The responsive CI lane additionally runs `pnpm conformance` and `pnpm test:e2e:fast`.
4. Use `pnpm test:e2e:full` when changing shared layout contracts, breakpoints, engine-sensitive behavior, or screenshot baselines. CI also runs it on the schedule and by manual dispatch.
5. Use the relevant `NATIVE` lane whenever the risk involves collapsing browser toolbars, safe areas or live viewport height, native touch coordinates, named-device density, or rotation. Run `pnpm simulators:doctor` first.
6. For a high-risk release or a bug reported on one exact device, finish with a manual physical-device check when that hardware is available.

## Repository map

```text
src/__tests__/                         UNIT suites
src/test-setup.ts                      Shared jsdom/browser API mocks
vitest.config.ts                       Vitest environment and discovery
tests/e2e/*.spec.ts                    BROWSER-CONTRACT and VISUAL suites
tests/e2e/support/                     Shared profile, route, probe, and adapter code
tests/e2e/*-snapshots/                 Versioned VISUAL reference images
playwright.config.ts                   Playwright projects, preview server, and output
scripts/mobile-simulators/             NATIVE harness and harness self-tests
scripts/design-conformance.mjs         GATE implementation
scripts/design-conformance.baseline.json  Grandfathered conformance baseline
.github/workflows/                     Hosted GATE orchestration
test-results/playwright/               Ignored Playwright run artifacts
test-results/mobile-simulators/        Ignored timestamped native evidence
playwright-report/                     Ignored local/CI Playwright HTML report
```

## `UNIT`: Vitest suites

Vitest discovers these files through [`vitest.config.ts`](./vitest.config.ts). Every row runs under `pnpm test`, `pnpm test:watch`, or `pnpm test:coverage`.

| Label | Category | File | Purpose and notes | Runner / environment |
| --- | --- | --- | --- | --- |
| Button contracts | Component behavior | [`buttons.test.tsx`](./src/__tests__/buttons.test.tsx) | Button variants, Radix `asChild`, Mandelbrot decoration, focus-visible state, and CTA regression behavior | Vitest + Testing Library / jsdom |
| Campus audience cards | Page component | [`campus-audiences.test.tsx`](./src/__tests__/campus-audiences.test.tsx) | Audience-card destinations plus card token, chrome, and hover contracts | Vitest + Testing Library / jsdom |
| Campus coverflow | Component behavior | [`campus-carousel.test.tsx`](./src/__tests__/campus-carousel.test.tsx) | Content parity, captions, controls, dots, and counter | Vitest + Testing Library / jsdom |
| Co-Living page | Page regression | [`co-living.test.tsx`](./src/__tests__/co-living.test.tsx) | Page content, external interest link, callout, and mobile-first top layout | Vitest + Testing Library / jsdom |
| Footer contracts | Shared layout | [`footer.test.tsx`](./src/__tests__/footer.test.tsx) | Structure, brand casing/type, removed legacy copy/links, surface pairing, current year, and decorations | Vitest + Testing Library / jsdom |
| Hero pointer coordinates | Pure logic | [`hero-pointer-coordinates.test.ts`](./src/__tests__/hero-pointer-coordinates.test.ts) | Client-coordinate to canvas normalized-device-coordinate conversion, including offset canvases | Vitest / jsdom |
| Hero gesture discriminator | Interaction logic | [`hero-scroll.test.tsx`](./src/__tests__/hero-scroll.test.tsx) | Tap-versus-drag thresholds and gesture-sequence behavior | Vitest + Testing Library / jsdom |
| House token synchronization | Token contract | [`house-tokens-sync.test.ts`](./src/__tests__/house-tokens-sync.test.ts) | Keeps the `houses.ts` palette aligned with matching `index.css` tokens | Vitest / jsdom |
| Navigation contracts | Shared navigation | [`navigation.test.tsx`](./src/__tests__/navigation.test.tsx) | Inner/home/scrolled navbar states, mobile menu, visibility, targets, and internal versus external navigation | Vitest + Testing Library / jsdom |
| Route/page smoke coverage | Route regression | [`pages.test.tsx`](./src/__tests__/pages.test.tsx) | Route rendering, shared Navbar/Footer presence, visibility regressions, and expected route declarations | Vitest + Testing Library / jsdom |
| Scroll restoration | Navigation behavior | [`scroll-to-top.test.tsx`](./src/__tests__/scroll-to-top.test.tsx) | Scroll-to-top across mobile, desktop, drawer, route changes, multi-hop paths, and history cases | Vitest + Testing Library / jsdom |
| Section token synchronization | Token contract | [`section-tokens-sync.test.ts`](./src/__tests__/section-tokens-sync.test.ts) | Keeps heterogeneous `SECTIONS` palettes aligned with CSS tokens | Vitest / jsdom |
| Sector header contracts | Shared component | [`sector-header.test.tsx`](./src/__tests__/sector-header.test.tsx) | Section label/color mapping, centered responsive typography, font, and animation wrapper | Vitest + Testing Library / jsdom |

### Vitest infrastructure

| Label | File | Notes |
| --- | --- | --- |
| Vitest configuration | [`vitest.config.ts`](./vitest.config.ts) | Selects jsdom, globals, the `@` alias, `src/test-setup.ts`, disabled CSS processing, and the `src/__tests__/**/*.test.{ts,tsx}` include glob. |
| Shared browser mocks | [`src/test-setup.ts`](./src/test-setup.ts) | Adds jest-dom and controlled mocks for `IntersectionObserver`, `scrollTo`, `matchMedia`, `document.fonts`, and `ResizeObserver`. |

This layer deliberately does not validate actual CSS geometry, WebGL rendering, native browser chrome, or real touch input. Put those contracts in the browser or native layers.

## `BROWSER-CONTRACT` and `VISUAL`: Playwright

Playwright exercises the production Vite preview, not the development server. The `fast` matrix uses 8 representative Chromium projects. The `full` matrix uses all 22 profiles across Chromium, Firefox, and WebKit, producing 66 browser/profile projects before per-spec skips. These are simulated browser viewports; even touch-enabled projects do not include a phone's physical frame or browser/system bars.

### Suites

| Label | File | Purpose and notes | Command | Evidence |
| --- | --- | --- | --- | --- |
| Cross-route responsive contract | [`responsive.spec.ts`](./tests/e2e/responsive.spec.ts) | Sweeps rendered routes and legacy redirects; checks horizontal overflow, gutters, navbar/content overlap, primary-content clipping/reflow, 44px touch targets, runtime/WebGL errors, and failed first-party assets | `pnpm test:e2e:fast` or `pnpm test:e2e:full` | Reporter output; failure screenshots/traces under `test-results/playwright/` |
| Homepage Hero responsive contract | [`hero-responsive.spec.ts`](./tests/e2e/hero-responsive.spec.ts) | Checks stage/footer/CTA reachability, the `lg` art-direction split, WebGL readiness and label safe zones, Story CTA, resize/orientation without reload, trusted touch/mouse drag and navigation, and reduced motion | `pnpm test:e2e:fast` or `pnpm test:e2e:full` | Environment attachments and failure evidence under `test-results/playwright/` |
| Reviewed visual baselines | [`visual-evidence.spec.ts`](./tests/e2e/visual-evidence.spec.ts) | Compares selected Home and Library Chromium views with versioned baselines; bounded pixel ratios accommodate real WebGL and font raster variance | `pnpm test:e2e:fast` or `pnpm test:e2e:full` | Snapshot diff evidence under `test-results/playwright/`; references beside the spec |

### Support and configuration

| Label | File | Purpose and notes |
| --- | --- | --- |
| Playwright orchestration | [`playwright.config.ts`](./playwright.config.ts) | Starts Vite preview on port 4173, selects fast/full projects, uses two workers because WebGL contexts are resource-heavy, retries once in CI, retains traces/screenshots on failure, and writes run output to `test-results/playwright/`. CI also writes `playwright-report/`. |
| Responsive profiles | [`profiles.ts`](./tests/e2e/support/profiles.ts) | Defines the 22 full profiles, 8 fast representatives, touch flags, 200% root-font cases, reduced motion, and browser-project expansion. |
| Shared routes | [`routes.mjs`](./tests/e2e/support/routes.mjs) | One source for 9 rendered routes and 5 internal redirects, reused by Playwright and native simulators. |
| Runner-neutral probes | [`responsive-contract.mjs`](./tests/e2e/support/responsive-contract.mjs) | Collects environment metrics and exposes DOM probes for overflow, content integrity, gutters, navbar relationships, touch targets, Hero composition/safe zones, and toolbar transitions. It contains no Playwright/WebdriverIO assumptions. |
| Playwright adapters | [`layout-assertions.ts`](./tests/e2e/support/layout-assertions.ts) | Stabilizes fonts/animations/pages, attaches environment details, and wraps shared probes in Playwright assertions with diagnostic output. |
| Versioned visual references | [`visual-evidence.spec.ts-snapshots/`](./tests/e2e/visual-evidence.spec.ts-snapshots/) | Checked-in reference images. Update only after intentionally changing composition, inspect every diff, and commit the reviewed replacements with the code change. |

### Route contract

The rendered sweep covers `/`, `/the-protocol`, `/co-living`, `/campus`, `/events`, `/political-club`, `/library`, `/people`, and the deliberate `/responsive-test-404` fallback. Redirect checks cover `/story` → `/`, `/visit` → `/co-living`, `/publications` → `/library`, `/neighborhood` → `/co-living`, and `/lab` → `/library`.

Update [`routes.mjs`](./tests/e2e/support/routes.mjs) when adding a rendered route or internal redirect so the browser and native route sweeps stay synchronized.

### Viewport matrix

| Family | Full profiles | Included in fast |
| --- | --- | --- |
| Phone portrait | 320×568, 360×640, 375×667, 390×844, 412×915 | 320×568, 360×640 |
| Phone landscape | 568×320, 640×360, 844×390, 915×412 | 640×360 |
| Tablet below `lg` | 768×1024, 820×1180, 1023×1366 | 1023×1366 |
| 1024 boundary / iPad Pro | 1024×768, 1024×1366, 1366×1024 | 1024×768 boundary |
| Desktop | 1280×720, 1440×900, 1920×1080 | 1440×900 |
| 200% text | phone 390×844, tablet 820×1180, desktop 1440×900 | phone 390×844 |
| Reduced motion | phone 390×844 | phone 390×844 |

### Versioned screenshot references

The visual suite intentionally limits its stable baselines to Home and Library at four representative Chromium views:

| View | Home reference | Library reference |
| --- | --- | --- |
| Phone 320×568 | [`chromium-phone-320x568-home.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-phone-320x568-home.png) | [`chromium-phone-320x568-library.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-phone-320x568-library.png) |
| Landscape 640×360 | [`chromium-landscape-640x360-home.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-landscape-640x360-home.png) | [`chromium-landscape-640x360-library.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-landscape-640x360-library.png) |
| 1024 boundary | [`chromium-boundary-1024x768-home.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-boundary-1024x768-home.png) | [`chromium-boundary-1024x768-library.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-boundary-1024x768-library.png) |
| Desktop 1440×900 | [`chromium-desktop-1440x900-home.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-desktop-1440x900-home.png) | [`chromium-desktop-1440x900-library.png`](./tests/e2e/visual-evidence.spec.ts-snapshots/chromium-desktop-1440x900-library.png) |

## `NATIVE`: Android and Apple simulator harness

The native lane launches real mobile Chrome or Safari inside maintained virtual devices, drives them through Appium/WebdriverIO, measures the live visual viewport, and takes whole-device screenshots that include browser/system chrome.

### Harness files

| Label | File | Purpose and notes |
| --- | --- | --- |
| Native configuration | [`config.mjs`](./scripts/mobile-simulators/config.mjs) | Pins Appium/WebdriverIO/driver versions, evidence roots, selection parsing, emulator launch settings, and the five maintained profiles. |
| Run orchestrator | [`run.mjs`](./scripts/mobile-simulators/run.mjs) | Runs doctor/build/preview/Appium/device lifecycle, executes selected profiles, cleans up owned processes/workarounds, and writes the run summary. |
| Device suite | [`suite.mjs`](./scripts/mobile-simulators/suite.mjs) | WebdriverIO route, responsive-probe, runtime-health, WebGL, menu/CTA, drag/tap, orientation, and toolbar-collapse/expand checks; writes per-profile manifests and whole-device screenshots. |
| Prerequisite doctor | [`doctor.mjs`](./scripts/mobile-simulators/doctor.mjs) | Non-mutating host, SDK, AVD, simulator, driver, and device-identity diagnostics with remediation guidance. |
| Appium driver setup | [`setup-appium.mjs`](./scripts/mobile-simulators/setup-appium.mjs) | Installs and doctors the pinned UiAutomator2 and XCUITest drivers in the repository-local Appium home. |
| Harness self-test | [`self-test.mjs`](./scripts/mobile-simulators/self-test.mjs) | Tests selection, identity, capabilities, log classification, coordinate mapping, gestures, toolbar transitions, runtime health, evidence separation, and Android-workaround ownership without launching a full product run. |
| Appium capabilities | [`capabilities.mjs`](./scripts/mobile-simulators/capabilities.mjs) | Builds platform-specific Android Chrome and iOS Safari capabilities from a validated profile and identity. |
| Device identity | [`identity.mjs`](./scripts/mobile-simulators/identity.mjs) | Validates Android AVD/runtime size/density/navigation and Apple simulator name/type/runtime identity. |
| Native coordinate mapping | [`native-coordinates.mjs`](./scripts/mobile-simulators/native-coordinates.mjs) | Converts CSS visual-viewport targets into native WebView/screen coordinates and describes gestures/toolbars. |
| Browser-log classification | [`browser-logs.mjs`](./scripts/mobile-simulators/browser-logs.mjs) | Separates fatal or first-party failures from tolerated external-network noise. |
| Android Chrome workaround | [`android-chrome.mjs`](./scripts/mobile-simulators/android-chrome.mjs) | Detects the scoped Chrome 113 WebGL workaround, handles setup/conflicts, and cleans up only state owned by the harness. |

### Maintained profiles

| Profile ID | Virtual device | Identity / dimensions | Coverage mode |
| --- | --- | --- | --- |
| `android-emulator-s24-class` | Galaxy S24-class Android phone | API 34 AVD, 1080×2340, density 420 | Portrait + landscape, full route sweep, redirects, Hero/native interactions |
| `android-emulator-tablet` | Android tablet | API 34 AVD, 1600×2560, density 320 | Portrait + landscape, Home/native environment contract |
| `ios-simulator-compact` | Compact iPhone | iPhone SE-class simulator | Portrait + landscape, full route sweep, redirects, Hero/native interactions |
| `ios-simulator-notched` | Notched iPhone | iPhone 16 Pro-class simulator | Portrait + landscape, Home/native environment contract |
| `ipados-simulator-pro` | Large iPad | iPad Pro 13-inch-class simulator | Portrait + landscape, Home/native environment contract |

These rows describe configuration, not the outcome of a current run. In particular, do not claim native iOS has passed unless a recent Apple-simulator artifact exists and its status is successful.

### Native evidence contract

Each invocation writes a timestamped directory under `test-results/mobile-simulators/<timestamp>/` containing:

- `run.json` — selected profiles, host-level result, and per-profile result/manifest paths.
- `doctor.json` — captured prerequisite and identity diagnostics.
- `<profile>/manifest.json` — timestamped environment, route, probe, log, interaction, screenshot, and outcome records.
- `<profile>/*.png` — whole-device screenshots including mobile browser/system chrome.
- Appium, preview-server, browser-log, runtime-health, and measured-environment records referenced by the run/manifest.

A native claim is supported by these files from that run, not by the existence of an AVD, simulator, profile object, or installed driver. The entire evidence root is ignored by Git; deliberately promote evidence to a reviewed artifact location if it must become a durable shared record.

## `GATE`: conformance and CI

| Label | File | Purpose and notes | Evidence |
| --- | --- | --- | --- |
| Color conformance script | [`design-conformance.mjs`](./scripts/design-conformance.mjs) | Zero-dependency static scan that rejects net-new raw/off-vocabulary colors outside the sanctioned CSS tokens and baseline | Pass/fail and offending file/line on stdout |
| Grandfathered color baseline | [`design-conformance.baseline.json`](./scripts/design-conformance.baseline.json) | Existing intentionally tolerated raw colors. Updating it requires documented design intent; it is not a general suppression list | Versioned JSON diff |
| Responsive CI | [`responsive.yml`](./.github/workflows/responsive.yml) | On pull requests: install Chromium and run typecheck, unit tests, build, conformance, and fast responsive matrix. Scheduled/manual: install Chromium, Firefox, and WebKit and run the full matrix. Uploads Playwright report/test results for 14 days even after failure | GitHub check plus `local-responsive-<run-id>` artifact |
| Design conformance CI | [`conformance.yml`](./.github/workflows/conformance.yml) | Runs the zero-dependency color gate on pull requests and pushes to `master` | GitHub check output |

Native lanes are intentionally local/manual because GitHub's Ubuntu runners do not provide the required Android and Xcode simulator environment used by this harness.

## Evidence locations

| Evidence | Location | Versioned? | Retention / interpretation |
| --- | --- | --- | --- |
| Typecheck, build, conformance, unit results | Terminal or CI logs | CI logs only | A pass/fail record; `dist/` is ignored build output |
| Optional Vitest coverage | Terminal and coverage-provider output (normally `coverage/`) | No by default | Local diagnostic; no repository or CI threshold is configured |
| Reviewed visual references | `tests/e2e/visual-evidence.spec.ts-snapshots/` | Yes | Durable baselines; every changed image requires human review |
| Playwright traces, diffs, failure screenshots | `test-results/playwright/` | No | Local run artifacts; uploaded by responsive CI |
| Playwright HTML report | `playwright-report/` | No | Produced in CI; uploaded with test results |
| Native run summary, manifests, metrics, logs, screenshots | `test-results/mobile-simulators/<timestamp>/` | No | Local run proof; not automatically a shared durable record |
| Responsive CI artifact | GitHub Actions `local-responsive-<run-id>` | External artifact | Retained for 14 days |

Ignored local evidence can be deleted or overwritten outside version control. Do not cite it as a permanent team record unless it has been deliberately copied to a reviewed, durable artifact location.

## Where a new test belongs

| Change or regression | Add the test here |
| --- | --- |
| Pure logic, component semantics, content/route regression, or data/token synchronization | `src/__tests__/*.test.ts(x)` (`UNIT`) |
| Layout behavior across routes, viewport families, or browser engines | `tests/e2e/responsive.spec.ts`, preferably through a shared probe (`BROWSER-CONTRACT`) |
| Homepage 3D, touch, CTA, orientation reflow, or reduced-motion behavior | `tests/e2e/hero-responsive.spec.ts` (`BROWSER-CONTRACT`) |
| Deliberately stable pixel composition at a selected risk view | `tests/e2e/visual-evidence.spec.ts` plus reviewed snapshots (`VISUAL`) |
| Browser toolbar, live visual viewport, safe-area pressure, native touch coordinates, device identity, or actual rotation | Runner-neutral probe where possible plus `scripts/mobile-simulators/suite.mjs` (`NATIVE`) |
| A new rendered route or internal redirect | `tests/e2e/support/routes.mjs`; do not duplicate route lists in a spec |
| A new browser viewport/profile | `tests/e2e/support/profiles.ts`; choose intentionally whether it is full-only or representative fast coverage |
| A new virtual phone/tablet profile | `scripts/mobile-simulators/config.mjs`, with identity/doctor/self-test coverage |
| Static design-token vocabulary drift | `scripts/design-conformance.mjs` for source scanning, or a Vitest token-sync contract for runtime/data mirrors |

When a DOM rule must run in both Playwright and Appium, keep the probe in [`responsive-contract.mjs`](./tests/e2e/support/responsive-contract.mjs) and let each runner supply its own adapter. Do not copy matrices or browser-specific APIs into the shared contract.

## Naming and notes conventions

- Name Vitest files `*.test.ts` or `*.test.tsx`; name Playwright suites `*.spec.ts`.
- Prefer behavior-oriented suite/test names that say what must remain true.
- Include a ticket ID only when it adds useful regression history; the behavior must still be clear without looking up the ticket.
- Add comments for environment limits, deliberate tolerances, non-obvious mocks, or why a case runs only in one profile. Avoid comments that merely restate the assertion.
- Keep shared DOM probes runner-neutral; put Playwright, WebdriverIO, Appium, or native-device operations in their adapters/harness.
- When adding a test or support file, update this catalog with a human label, what it proves, what it does not prove, its command, and its evidence location.

## Known gaps

These are current scope boundaries, not claims that the existing suites are failing:

- Coverage can be requested, but no coverage percentage threshold is configured or enforced in CI.
- There is no comprehensive automated axe accessibility audit; focus-visible and touch-target coverage is targeted rather than exhaustive.
- There is no Lighthouse or performance-budget gate.
- Native Android/iOS simulator lanes are local/manual, not hosted CI.
- Emulators and simulators are not physical-device testing.
- Visual snapshots cover selected Home/Library Chromium risk views, not every route, profile, or engine.
- Pull requests run the representative Chromium fast matrix; exhaustive cross-engine coverage is scheduled/manual.
