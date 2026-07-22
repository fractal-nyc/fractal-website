# Responsive testing: simulation, real devices, and release evidence

The responsive system has three layers. Vitest checks React behavior in jsdom.
Playwright renders every internal route in local Chromium, Firefox, and WebKit
at maintained width/height, touch, motion, orientation, and text-stress
profiles. BrowserStack runs the same structural specs on physical Android and
iOS hardware. A resized desktop browser is useful simulation, but is never
recorded as real-mobile evidence.

## Commands

```sh
pnpm build
pnpm test:e2e:fast       # PR subset, simulated Chromium
pnpm test:e2e:full       # all local profiles in Chromium/Firefox/WebKit
pnpm test:e2e:real:smoke # S24 Chrome portrait/landscape + iPhone Safari
pnpm test:e2e:real       # maintained physical-device matrix
```

Install local engines once with `pnpm exec playwright install chromium firefox
webkit`. The project pins `@playwright/test` 1.59.1 because BrowserStack's
compatibility table, checked 2026-07-22, lists 1.59 for both Android and iOS;
newer rows did not list Android. `browserstack-node-sdk` is pinned to 1.64.2.
Review compatibility before upgrading either dependency.

Every Playwright failure attaches runtime metrics: layout and visual viewports,
screen/orientation, DPR, UA/platform, touch/hover/pointer state, reduced motion,
100vh/svh/dvh probes, safe-area probes, scroll position, route, project, build,
and timestamp. Traces and screenshots are retained on failure. BrowserStack also
retains video/network artifacts. These measurements prevent a desktop fallback
from being accepted as a mobile run.

## Coverage

`tests/e2e/support/profiles.ts` is the single source of truth. It covers 320px
compact phones through iPad Pro and desktop, portrait and short landscape,
1023/1024 structural-boundary states, touch and hover, reduced motion, and 200%
root-text stress. Root-text stress is focused on Home while route-specific
stress defects found during rollout stay visible as linked, annotated skips.
`tests/e2e/support/routes.ts` lists all rendered routes and
legacy internal redirects. External FractalU/Accelerator destinations are never
opened during a route sweep.

The local suite asserts document containment, canonical computed gutters, menu
touch targets, errors/assets, and the Home Hero's stage/footer/CTA ownership.
The Hero suite waits for the actual WebGL scene—never a mock—then samples visible
projected labels against the computed page-gutter/safe-area box. Short landscape
and enlarged text may make the Hero taller than one viewport; content must stay
reachable rather than being clipped.

## BrowserStack setup

An Automate Mobile plan and two secrets are required:

```sh
export BROWSERSTACK_USERNAME="…"
export BROWSERSTACK_ACCESS_KEY="…"
pnpm test:e2e:real:smoke
```

Add the same names as GitHub Actions secrets. The runner exits with code 2 and a
specific setup message when either is absent. Credentials do not belong in YAML,
logs, commits, screenshots, or Lattice comments. The SDK owns its Local tunnel;
do not start a second tunnel action. Each CI run supplies a unique local ID and
the SDK cleans it up when the process exits.

`browserstack.smoke.yml` is the internal-PR lane. `browserstack.yml` is the
nightly/manual matrix: Galaxy S24 Android 14 Chrome, Pixel 8 Chrome, Galaxy Tab
S9 Chrome, compact/notched iPhones in Safari, and iPad Pro Safari. Android
orientation is fixed before each session by capability. BrowserStack Playwright
does not reliably expose iOS landscape configuration, so iOS rotation remains
a physical release step. Provider device names and OS versions drift; check the
live capability inventory before changing the dated matrix.

BrowserStack Playwright automates Chrome on the Galaxy S24, **not Samsung
Internet**. Never report the S24 Chrome lane as Samsung Internet coverage.

## Physical release protocol

Record the following table in the release/task review and link screenshots or
video. A DevTools preset cannot fill any physical-result row.

| Device | OS build | Browser/version | Nav mode | Font/display scale | Orientation | visualViewport | Result/evidence | Tester/date |
|---|---|---|---|---|---|---|---|---|

Required passes:

- Galaxy S24 in Chrome and Samsung Internet, portrait and landscape.
- Load with address/tab and OS navigation bars expanded; scroll to collapse
  browser bars, expand again, then rotate without reloading.
- Android gesture navigation and three-button navigation when available.
- Default and largest practical Android font/display settings.
- Current notched iPhone Safari with default and Larger Text, browser bars in
  both states, portrait and landscape.
- iPad Safari through iPad Pro size in both orientations, including touch labels
  at the desktop structural breakpoint.
- Desktop Chrome, Safari, and Firefox at normal and compact heights.

For each state exercise the mobile menu, full Hero drag/rotation and node tap,
Story CTA, every internal route, and reduced motion. Confirm no horizontal pan,
clipped copy/media, overlap, duplicate navigation, or failed first-party assets.
For the Home browser-bar check, capture actual `visualViewport` before collapse,
after collapse, and after expansion. If automation cannot change those metrics,
mark that case inconclusive and complete it physically.

## CI tiers

- Pull requests: frozen install, typecheck, Vitest, build, design conformance,
  and the fast Chromium route matrix.
- Internal pull requests with secrets: physical S24/iPhone smoke. Forks and
  unconfigured repositories emit an explicit skip summary.
- Nightly/manual: full local three-engine matrix and full BrowserStack matrix.
- Release: nightly green plus the completed physical protocol, including
  Samsung Internet. No local or cloud-emulated result substitutes for it.

Provider references checked 2026-07-22: [Android
Playwright](https://www.browserstack.com/docs/automate/playwright/playwright-android/nodejs),
[iOS Playwright](https://www.browserstack.com/docs/automate/playwright/playwright-ios/nodejs),
[local testing](https://www.browserstack.com/docs/automate/playwright/local-testing),
and [device inventory](https://www.browserstack.com/list-of-browsers-and-platforms/playwright).
