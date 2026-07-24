# FRAC-25: Document and organize the testing system

## Objective

Add a canonical `TESTING.md` that makes the repository's test system legible to a human who did not build it. The guide will identify what every current test suite and testing-support file does, distinguish simulated viewport coverage from native mobile-browser coverage, explain which command to run, and show where evidence is written. Link the guide from `README.md`. Preserve all existing test paths and behavior.

## Current system observed

The repository has four complementary verification layers:

1. Vitest + Testing Library in jsdom for fast behavior, component, route, regression, and token-sync checks.
2. Playwright against the production Vite preview for browser-rendered responsive contracts, Hero/WebGL interactions, and selected Chromium screenshot baselines.
3. Appium + WebdriverIO against Android emulators and Apple simulators for real mobile browser/system chrome, live `visualViewport`, orientation, touch, and whole-device evidence.
4. TypeScript/build/design-conformance and GitHub Actions orchestration gates.

Playwright's fast matrix is Chromium-only and representative; its full matrix expands to every profile across Chromium, Firefox, and WebKit. Native simulator runs are local/manual and are not part of hosted Ubuntu CI. The native harness is a higher-fidelity mobile environment than viewport resizing, but an emulator/simulator is still not a physical device.

## Implementation

### 1. Create the canonical handbook

Create `TESTING.md` with the following organization:

- A short purpose statement and accuracy ladder. Label the layers consistently (for example `UNIT`, `BROWSER-CONTRACT`, `VISUAL`, `NATIVE`, and `GATE`) and state what each layer proves and does not prove. Put physical-device testing above native simulators as the unautomated final fidelity tier so the guide does not overclaim.
- A quick command table sourced from `package.json`, including runner/environment, intended use, approximate scope, prerequisites, and evidence/result location for:
  - `pnpm typecheck`, `pnpm build`, `pnpm conformance`
  - `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
  - `pnpm test:e2e:fast`, `pnpm test:e2e:full`
  - `pnpm simulators:doctor`, `pnpm simulators:self-test`, `pnpm simulators:setup-appium`
  - `pnpm test:e2e:android-emulator`, `pnpm test:e2e:ios-simulator`, `pnpm test:e2e:simulators`
- A directory map for `src/__tests__`, `tests/e2e`, `scripts/mobile-simulators`, the conformance script/baseline, `.github/workflows`, and ignored evidence directories.
- A compact "normal workflow" that distinguishes the required pre-PR trio in `AGENTS.md` from the broader responsive/design checks that CI runs, and recommends the relevant native lane for changes that depend on browser chrome, touch, safe areas, or orientation.

### 2. Catalog every Vitest test file

Add a table with a human-readable label, category, file link, purpose/notes, runner/environment, and applicable command. Include all 13 current files:

- `buttons.test.tsx` — Button variants, Radix `asChild`, Mandelbrot decoration, focus-visible state, and CTA regression behavior.
- `campus-audiences.test.tsx` — Campus audience-card destinations and card token/chrome/hover contracts.
- `campus-carousel.test.tsx` — Campus coverflow content parity, captions, controls, dots, and counter.
- `co-living.test.tsx` — Co-Living page content, external interest link, callout, and mobile-first top layout.
- `footer.test.tsx` — Footer structure, brand casing/type, removed legacy copy/links, surface pairing, current year, and decorations.
- `hero-pointer-coordinates.test.ts` — Pure client-coordinate to canvas-NDC conversion, including offset canvases.
- `hero-scroll.test.tsx` — Hero tap-vs-drag discriminator thresholds and gesture-sequence behavior.
- `house-tokens-sync.test.ts` — `houses.ts` house palette versus `index.css` token drift contract.
- `navigation.test.tsx` — Inner/home/scrolled navbar states, mobile menu, visibility, route targets, and internal versus external navigation.
- `pages.test.tsx` — Route/page smoke coverage, shared Navbar/Footer presence, visibility regression, and expected route declarations.
- `scroll-to-top.test.tsx` — Scroll restoration on mount and route changes across mobile, desktop, drawer, multi-hop, and history cases.
- `section-tokens-sync.test.ts` — Heterogeneous `SECTIONS` palette versus CSS token drift contract.
- `sector-header.test.tsx` — Section label/color mapping, centered/responsive typography, font, and animation wrapper.

Document `vitest.config.ts` and `src/test-setup.ts` separately as infrastructure: jsdom selection, include glob, aliases, jest-dom, and mocked browser APIs. Note that WebGL and native browser chrome are intentionally outside this layer.

### 3. Catalog Playwright suites and shared browser contracts

Add a table for each suite:

- `responsive.spec.ts` — rendered-route and redirect sweep; overflow, gutters, navbar/content overlap, content clipping, touch targets, runtime errors, WebGL errors, and first-party asset failures.
- `hero-responsive.spec.ts` — Hero composition/reachability, `lg` art direction, WebGL readiness/label safe zone, Story CTA, resize/orientation without reload, trusted touch/mouse interaction, and reduced motion.
- `visual-evidence.spec.ts` — selected Home/Library Chromium baselines at phone, landscape, 1024 boundary, and desktop profiles with bounded WebGL/font raster variance.

Catalog the supporting files as testing infrastructure rather than standalone suites:

- `playwright.config.ts` — preview server, reporters, retries, two-worker WebGL limit, output paths, and fast/full project selection.
- `tests/e2e/support/profiles.ts` — 22 full profiles and 8 representative fast profiles, browsers, touch, 200% text, and reduced motion.
- `tests/e2e/support/routes.mjs` — rendered routes and legacy redirects shared with the native harness.
- `tests/e2e/support/responsive-contract.mjs` — runner-neutral environment collection and DOM probes reused by Playwright and native simulators.
- `tests/e2e/support/layout-assertions.ts` — Playwright adapters, page stabilization, attachments, and assertion wrappers around the shared contract.
- Co-located `visual-evidence.spec.ts-snapshots/` — versioned reference images; describe intentional update/review workflow and distinguish them from ignored run artifacts.

State the exact fast/full matrix difference and list the profile families (phone portrait/landscape, tablet, 1024 boundary, iPad Pro, desktop, 200% text, reduced motion) without implying a simulated browser project includes physical browser chrome.

### 4. Catalog the native simulator harness file by file

Add a labeled infrastructure table for all files under `scripts/mobile-simulators/`:

- `config.mjs` — pinned tools, evidence roots, selection parsing, launch settings, two Android and three Apple profiles.
- `run.mjs` — top-level doctor/build/preview/Appium/device lifecycle, profile execution, cleanup, and run summary.
- `suite.mjs` — WebdriverIO route/interaction/orientation/browser-toolbar test suite and evidence manifest.
- `doctor.mjs` — non-mutating prerequisite and device-identity diagnostics with remediation guidance.
- `setup-appium.mjs` — repository-local installation/doctoring of pinned UiAutomator2/XCUITest drivers.
- `self-test.mjs` — harness-level assertions for selection, identity, capabilities, log classification, coordinates, gestures, toolbar transitions, runtime health, and Android workaround ownership.
- `capabilities.mjs` — platform-specific Appium capability construction.
- `identity.mjs` — Android AVD/runtime and Apple simulator identity validation.
- `native-coordinates.mjs` — mapping CSS visual-viewport targets into native screen coordinates.
- `browser-logs.mjs` — first-party/fatal versus external network log classification.
- `android-chrome.mjs` — scoped Chrome 113 WebGL workaround detection, setup, conflict handling, and cleanup.

Document the maintained profiles accurately:

- Galaxy S24-class Android phone (1080x2340, density 420; route sweep + interaction)
- Android tablet (1600x2560, density 320)
- compact iPhone / iPhone SE class
- notched iPhone / iPhone 16 Pro class
- iPad Pro 13-inch class

Explain that profile configuration or driver availability does not prove a successful current run. A native result is evidenced only by that run's `run.json`, per-profile `manifest.json`, screenshots, environment metrics, and logs under `test-results/mobile-simulators/<timestamp>/`. Do not claim native iOS has passed unless a current artifact demonstrates it.

### 5. Document gates, CI, and evidence

Catalog:

- `scripts/design-conformance.mjs` and `scripts/design-conformance.baseline.json` — zero-dependency net-new raw-color gate and grandfathered baseline.
- `.github/workflows/responsive.yml` — PR fast lane versus scheduled/manual full lane, browser installation, type/test/build/conformance checks, and 14-day Playwright/test-results artifact upload.
- `.github/workflows/conformance.yml` — color-conformance gate on PRs/pushes to `master`.

Add an evidence table covering stdout-only checks, Vitest coverage output when requested, versioned visual baselines, ignored `test-results/playwright`, local/CI `playwright-report`, ignored native timestamped evidence, and CI artifact retention. Make clear that ignored local evidence should not be treated as a durable shared record unless deliberately promoted elsewhere.

### 6. Add contribution guidance and known gaps

Add a decision guide for where a new test belongs:

- Pure logic, component semantics, content/route regression, or token sync -> `src/__tests__/*.test.ts(x)`.
- Layout behavior across routes/viewports/engines -> Playwright responsive contracts.
- Homepage 3D/touch/reduced-motion behavior -> Hero Playwright suite.
- Deliberately stable pixel composition -> visual-evidence suite and reviewed snapshots.
- Browser toolbar, safe-area/live viewport, native touch coordinates, or rotation -> shared runner-neutral probe plus native simulator suite where possible.
- New route/redirect/profile -> update the shared route/profile source instead of copying matrices into a spec.
- Design-token vocabulary drift -> conformance gate or sync contract, according to whether the rule is static-source or runtime/data mirroring.

Define naming/notes conventions: `.test.ts(x)` for Vitest, `.spec.ts` for Playwright, behavior-oriented suite/test names, ticket IDs only for meaningful regression context, comments that explain environment limits or non-obvious mocks, and shared DOM probes kept runner-neutral. Require each future catalog entry to state label, proof, limits, command, and evidence.

Record current gaps without presenting them as failures of existing suites:

- Coverage can be generated but no coverage threshold is configured or enforced in CI.
- No comprehensive automated axe accessibility audit exists; current focus/touch checks are targeted.
- No Lighthouse/performance-budget gate exists.
- Native simulator lanes are local/manual, not hosted CI.
- Native emulators/simulators are not physical-device testing.
- Visual snapshots cover selected Home/Library Chromium risk views, not every route/profile/engine.
- PR Playwright uses the representative Chromium fast matrix; exhaustive cross-engine coverage is scheduled/manual.

### 7. Link and orient from README

Update `README.md` without turning it into a duplicate handbook:

- Add a "Testing or responsive QA?" entry under "Where to start" linking to `TESTING.md`.
- Add the principal test commands, or a compact pointer after the existing command block, so a reader can discover unit, responsive, and native lanes.
- Extend the structure tree only enough to show `TESTING.md`, `tests/e2e`, and `scripts/mobile-simulators` if it improves orientation.

## Files changed

- New: `TESTING.md`
- Edit: `README.md`
- Lattice lifecycle files for FRAC-25

No test files, test configuration, package scripts, snapshots, application source, or simulator profiles will be moved or functionally changed.

## Verification

1. Compare every `src/__tests__/*.test.{ts,tsx}`, `tests/e2e/*.spec.ts`, `tests/e2e/support/*`, and `scripts/mobile-simulators/*.mjs` path from `rg --files` against the handbook catalog; no current file is omitted.
2. Compare every testing-related `package.json` script against the command table and run each documented command string through a script-name/path existence check (do not run hardware-heavy simulator suites merely to validate documentation).
3. Verify all relative Markdown file links resolve and all documented evidence paths match configuration/source.
4. Run `git diff --check`.
5. Because this is documentation-only, run the repository's required pre-PR checks (`pnpm typecheck`, `pnpm test`, `pnpm build`) and `pnpm conformance`; record any pre-existing or environment-specific failures precisely.

## Acceptance criteria

- A new contributor can identify the correct test layer and command without reading configuration source first.
- Every current suite and testing-support file has a human label and useful note in one canonical document.
- The guide clearly separates jsdom, simulated browser viewports, native mobile browsers, and physical-device fidelity.
- Fast/full profiles, route coverage, native profiles, CI behavior, and evidence locations match the checked-in source.
- Known limitations are explicit, including the absence of coverage thresholds, comprehensive axe/performance gates, hosted native CI, and physical-device automation.
- Nothing implies that configured native iOS support has produced a successful current run without an artifact.
- `README.md` links prominently to `TESTING.md`.
- Existing test locations and behavior remain unchanged.
