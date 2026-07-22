# FRAC-17: Real-device responsive test system and mobile hero validation

## Goal and operating principle

Build a layered responsive test system, then use it to repair the Home hero. A
desktop Chromium window resized to a phone preset is useful as a fast layout
stress test, but it is never evidence that a mobile environment passed. Mobile
acceptance must run on a physical Android/iOS device and record the runtime's
actual visual viewport, safe area, touch/hover state, OS, browser, orientation,
and device-pixel ratio.

This task covers all internal routes and the complete compact-to-iPad-Pro layout
range. It does **not** promise a session on every handset ever manufactured.
Coverage is defined by layout/environment classes plus a maintained set of real
representative devices. Device availability and browser versions are dated in
the test documentation and reviewed periodically.

## Findings from the current repository

- Vitest runs in jsdom (`vitest.config.ts`); it cannot calculate real layout,
  initialize the WebGL scene, reproduce mobile browser chrome, or validate safe
  areas. Some current tests only assign `window.innerWidth`, and `pages.test.tsx`
  mocks the scene. Keep these tests for component behavior, not responsive proof.
- The only current GitHub workflow is the zero-dependency color-conformance
  check. Typecheck, unit tests, build, rendered layout, and mobile hardware are
  not CI gates.
- `Hero.tsx` is a `min-h-screen` flex container with two absolutely positioned
  owners competing for the same lower area: a full-section WebGL canvas and the
  mobile Story footer. The footer is limited to a 54%-wide blurb, so it becomes
  tall on short phones. The section clips both axes. `FractalCityScene.tsx`
  centers the scene in the entire Hero instead of the space remaining between
  the fixed navbar and intrinsic footer. This reproduces the Galaxy failure by
  construction, independent of a particular screenshot.
- `index.html` uses `maximum-scale=1`, which prevents an honest user-zoom
  acceptance test and should be removed. The viewport does not currently opt in
  to `viewport-fit=cover`; if that is enabled, navbar/hero/footer top and bottom
  safe-area ownership must be added in the same change.
- FRAC-11 is real prior work, but it never reached `origin/master`. Commits
  `b49b046` (standalone Playwright/Chromium layout gate), `eceb2cd` (projected
  hero-label clamp plus gallery overflow containment), and `de3149b` (agent
  layout guidance) exist on local branch
  `frac-13-nav-links-search-affordances`. The gate proved red (7 violations at
  375/414/768) and green on four routes at five fixed widths. Recover the useful
  logic deliberately; do not cherry-pick stale package/lockfile or unrelated
  skill changes wholesale. This task supersedes the fixed-height, Chromium-only
  matrix with a shared Playwright Test suite.

## Provider decision and credential boundary

Use **BrowserStack Automate Mobile + Playwright Test** for the primary hardware
lane:

- BrowserStack's official Playwright docs support `deviceName`, `osVersion`, and
  real Android Chrome projects, including Samsung devices.
- BrowserStack's official iOS docs support Playwright on real iPhones and iPads
  with Safari, and its device catalog includes Galaxy S24 Android 14 and iPad Pro
  models.
- Its official GitHub Actions integration supplies credentials and creates a
  BrowserStack Local tunnel, allowing physical cloud devices to reach the Vite
  preview server on the CI runner.
- This preserves one assertion/spec API between local engines and physical
  Android/iOS rather than rewriting the suite in Appium.

Official references checked 2026-07-22:

- <https://www.browserstack.com/docs/automate/playwright/playwright-android/nodejs>
- <https://www.browserstack.com/docs/automate/playwright/playwright-ios/nodejs>
- <https://www.browserstack.com/docs/automate/playwright/github-actions>
- <https://www.browserstack.com/docs/automate/playwright/local-testing>
- <https://www.browserstack.com/list-of-browsers-and-platforms/automate>

Credential-dependent work is an explicit boundary. The repository can contain
and locally validate the specs, BrowserStack configuration, CI workflow,
credential checks, tunnel lifecycle, and documentation without secrets. A real
session cannot be run or certified until the operator provisions an Automate
Mobile plan and adds `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` as
GitHub Actions secrets (and local environment variables when running from a
laptop). No such credentials are currently configured. Never commit them.

BrowserStack's documented Playwright Android examples target Chrome, not
Samsung Internet. Therefore this task must not claim automated Samsung Internet
coverage. Make Samsung Internet on a physical Galaxy S24 a manual release gate.
If the operator later requires it in every CI run, create a follow-up task for a
small Selenium/Automate lane after confirming the account's exact Samsung
Internet capabilities; do not introduce and maintain a second automation stack
speculatively here.

### Dependency choice

- Add `@playwright/test` as an exact dev dependency and commit the lockfile.
  Choose the newest version explicitly listed by BrowserStack as compatible with
  **both** real Android and real iOS on implementation day. The provider table
  inspected during planning lists 1.59 for both platforms while its 1.60 row
  omits Android; therefore do not blindly restore FRAC-11's `^1.61.1` range.
  Confirm the table again before installation and record the chosen version in
  `docs/responsive-testing.md`.
- Use BrowserStack's Node Playwright SDK/configuration if its pinned version
  supports that Playwright version. Prefer `browserstack.yml` and the SDK wrapper
  over custom websocket/capability plumbing. Pin the SDK dependency and pin
  GitHub Actions to immutable release SHAs rather than moving `@master` refs.
- Do not add Percy or another screenshot subscription. Playwright screenshots,
  traces, video, and BrowserStack session artifacts are enough for this task.

## Implementation phases

### Phase 1 — Shared responsive contract and local rendered-browser gate

Create a normal Playwright Test project (rather than another one-off Node loop)
so the same specs run locally and remotely. Expected files are:

- `playwright.config.ts` — local projects, production-preview `webServer`, trace,
  screenshot, and retry policy.
- `tests/e2e/responsive.spec.ts` — route-wide structural assertions.
- `tests/e2e/hero-responsive.spec.ts` — Home hero geometry/footer/CTA contract.
- `tests/e2e/support/routes.ts`, `profiles.ts`, and `layout-assertions.ts` (names
  may be consolidated if clearer) — one source for routes, environment profiles,
  metrics, and assertions.
- `browserstack.yml` plus the minimum SDK fixture/config required to run the same
  specs on real devices.
- `docs/responsive-testing.md` — why emulation is not certification, commands,
  matrix, secret setup, artifact interpretation, and physical release protocol.
- `package.json`/`pnpm-lock.yaml` scripts and dependencies.
- GitHub Actions workflow(s) described below.

Recover FRAC-11's useful checks: horizontal overflow, `.page-gutter` bounds,
WebGL label mount, and per-frame projected-label measurement. Expand them to
measure height and the **actual visual viewport**, not a fixed width with height
800. Each environment record attached to failures must include:

- `innerWidth`/`innerHeight` and `visualViewport` width, height, offsets, and
  scale;
- `screen` width/height, orientation, device-pixel ratio;
- user agent/platform, `navigator.maxTouchPoints`, `(hover)`, `(pointer)`,
  reduced-motion state;
- computed 100vh/100svh/100dvh probe heights and computed safe-area probe
  insets;
- route, scroll position, browser/project, and timestamp/build identifier.

Real-device specs must assert their environment before testing layout: Android
projects report Android + touch/non-hover; iPhone projects report iOS/Safari
characteristics; iPad desktop-style UA is handled by provider capability plus
touch/maxTouchPoints rather than a brittle `iPad` substring. A remote project
that silently falls back to desktop emulation must fail, not produce a false
green result.

#### Route set

Run structural coverage on all current internal rendered views:

`/`, `/the-protocol`, `/co-living`, `/campus`, `/events`, `/political-club`,
`/library`, `/people`, and a 404 URL. Add cheap redirect assertions for
`/story`, `/visit`, `/publications`, `/neighborhood`, and `/lab`. Do not navigate
to external FractalU/Accelerator destinations during layout sweeps.

#### Local layout profiles (fast simulation, never labeled real-device proof)

- Phones portrait: 320x568, 360x640, 375x667, 390x844, 412x915.
- Phones landscape/short: 568x320, 640x360, 844x390, 915x412.
- Tablets: 768x1024, 820x1180, 1023x1366.
- Structural boundary and iPad Pro: 1024x768, 1024x1366, 1366x1024.
- Desktop: 1280x720, 1440x900, 1920x1080.
- Stress profiles: representative phone, tablet, and desktop with injected
  200%-root-font sizing; touch/non-hover and hover-capable projects; reduced
  motion on and off where motion behavior itself is under test.

The fast PR local gate may use Chromium and a smaller risk-based profile subset,
but the scheduled full local gate runs Chromium, Firefox, and WebKit across the
complete route/profile matrix. Playwright device descriptors may configure touch
simulation locally, but reports and docs must call these projects simulated.

#### Shared structural assertions

After navigation, wait for `document.fonts.ready`, route-specific lazy content,
and a stable animation frame pair. Assert:

1. `scrollWidth <= clientWidth + 1` at the document and any full-bleed owner.
2. Visible tracked content remains inside the visual viewport/safe gutter;
   off-screen entrance-animation elements are ignored only while truly hidden
   and must pass after entering.
3. Navbar variant matches the `lg` contract; the fixed navbar does not cover the
   first interactive/content owner and its controls have usable touch targets.
4. `.page-gutter` resolves within the canonical DESIGN.md floor/ceiling and real
   safe area. No test copies layout rules into production code.
5. Primary headings, controls, cards, media, and footer never overlap, become
   clipped, or create horizontal scroll under default and text-stress profiles.
6. Every route loads without uncaught page errors, severe console errors,
   failed first-party assets, or WebGL initialization errors.
7. Portrait/landscape route rotation keeps the correct structural variant and
   does not require a reload.

Use stable `data-*` hooks only where semantic locators cannot express a geometry
owner. Do not assert Tailwind class strings as the layout contract.

#### Visual evidence

- Keep deterministic visual baselines to a representative risk set (Home and
  one content-heavy route on compact phone, short landscape, tablet boundary,
  iPad Pro, and desktop) under reduced motion. Separate baselines per local
  browser engine; never compare one engine's font rasterization to another.
- On real devices, structural assertions are authoritative and screenshots,
  videos, network logs, and traces are retained for every failure. Do not use a
  cross-device pixel-perfect baseline for the rotating WebGL hero.
- Wait for the hero background, fonts, lazy scene, and texture readiness before
  capture. Under reduced motion the initial WebGL pose is the deterministic
  snapshot pose; a separate interaction test covers rotation.

### Phase 2 — Physical cloud matrix and CI tiers

Configure BrowserStack projects using actual `deviceName`/`osVersion` and
`realMobile` capabilities. Confirm names against the live capability generator
when implementing because the provider can deprecate devices.

Minimum maintained real-device classes:

| Class | Primary device/browser | Why |
|---|---|---|
| reported Android | Galaxy S24, Android 14, Chrome | exact reported hardware family and OEM |
| second Android | Pixel 8, Android 14, Chrome | non-Samsung aspect/OEM |
| short/narrow iPhone | iPhone 13 mini or available SE, Safari | compact-height pressure |
| notched iPhone | iPhone 15 Pro, iOS 17, Safari | current safe-area/browser-bar behavior |
| Android tablet | Galaxy Tab S9, Chrome | touch tablet below/around expanded layout |
| iPad Pro | iPad Pro 12.9 2021 (or current equivalent), iOS 17, Safari | 1024/1366 touch layout |

Run portrait and landscape where the provider supports orientation. Do not set a
fake viewport on real projects; read what the device/browser supplies. The Home
test runs twice around browser chrome: initial top-of-page state, then after a
real scroll intended to collapse controls and a return-to-top gesture intended
to expand them. Record visual-viewport metrics before/after. If automation does
not produce a viewport transition, mark that browser-bar case inconclusive and
leave the physical release step mandatory; never infer it from a desktop size.

CI tiers:

1. **Every PR, local:** frozen install; typecheck; Vitest; build; color
   conformance; fast Chromium responsive suite across every route; upload
   Playwright report/traces/screenshots on failure.
2. **Every internal PR, real smoke (when secrets exist):** BrowserStack Local
   tunnel to the same production preview; all routes on Galaxy S24 Chrome and a
   current iPhone Safari in portrait, plus the focused Hero in landscape. Skip
   safely (with an explicit summary) for fork PRs where secrets are unavailable.
3. **Nightly and manual dispatch:** full local Chromium/Firefox/WebKit matrix and
   full real device table, all internal routes, both orientations, default and
   reduced motion. Avoid multiplying sessions per route: one device session may
   visit all routes when isolation remains reliable.
4. **Release:** nightly must be green plus the physical protocol below. Real
   device failures are not made optional merely because the desktop suite is
   green.

The workflow builds and serves the site on `0.0.0.0` with a strict port, waits
for readiness, starts a uniquely identified BrowserStack Local tunnel, runs the
suite, and stops the tunnel in `always()` cleanup. Secrets are referenced only
through GitHub Actions/environment variables. Set bounded retries (remote only),
timeouts for WebGL/font readiness, concurrency no higher than the purchased
parallel-session quota, and artifact retention. The no-credentials path must
exit with a precise setup message rather than an opaque websocket error.

### Phase 3 — Home Hero red-to-green repair

Add semantic geometry hooks (`data-hero-stage`, `data-hero-footer`,
`data-hero-blurb`, `data-hero-cta`, `data-hero-label`, and a scene-ready signal)
and capture the pre-fix red result. The ticket is reproduced when the initial
Galaxy-class visual viewport shows any of the following: footer or arrow outside
the visible rectangle, footer intersecting a visible projected label/geometry
stage, horizontal label clipping, or content hidden by the section's clip.

Implement the structural hybrid rather than a height-specific transform patch:

1. Make the mobile Hero a two-row layout: a flexible, relative geometry stage
   and an intrinsic Story footer in normal flow. The Canvas and hit-target region
   fill the geometry stage, not the entire Hero. Preserve the desktop composition
   at `lg` unless the new tests expose a real regression.
2. Use `100vh` only as a fallback and `min-height: 100svh` as the mobile minimum
   so initial expanded browser controls define the safe one-screen target. Never
   force `height: 100vh`; short landscape/text-enlarged content may grow and
   scroll instead of being clipped. Clip horizontal decorative overdraw only;
   do not hide required vertical content.
3. On compact phones, give the blurb the available content width and make the
   Story CTA a compact inline text+arrow row below it. At `md` it may become the
   current two-column relationship. Keep readable type; solve the ownership and
   measure problem before reducing font size.
4. Give the fixed mobile navbar real top-safe-area padding and the footer real
   bottom-safe-area padding. Remove `maximum-scale=1`. Enable
   `viewport-fit=cover` only in the same commit that proves all horizontal/top/
   bottom safe-area owners on real notched devices.
5. Recover FRAC-11's projected-label clamp, but clamp to the **computed** Hero
   safe-zone/page-gutter bounds so landscape notch insets participate. Do not
   merely copy its `Math.max(24, min(4.5vw, 64))`, which omitted real
   `env(safe-area-inset-*)` values. Keep labels pointer-transparent and retain
   front/back visibility and touch behavior.
6. Center/size the octahedron within the remaining stage. If a compact-height
   camera adjustment is still necessary after the structural change, derive it
   from the stage's measured aspect/height and use a fluid clamp, not per-phone
   media queries. The default portrait target keeps the geometry prominent; the
   short-landscape fallback prioritizes no overlap and reachable content.
7. Keep the background as one responsive `<picture>` and preserve preload/source
   matching. After the stage/footer layout is correct, tune a responsive
   `object-position`/focal point so the skyline/geometry relationship moves up
   on compact screens without adding a request, changing DESIGN.md tokens, or
   relying on an arbitrary transform for each handset.
8. Carry over FRAC-11's `PhotoGallery` horizontal containment only if the new
   route-wide red proof reproduces that independent overflow on current code.

Focused Hero assertions across every compact/tablet profile and all primary real
devices:

- The initial portrait view on Galaxy S24 Chrome contains the navbar, complete
  visible geometry/labels, full blurb, `Explore our Story`, and arrow within the
  actual visual viewport, with no intersections.
- At extreme short landscape, required content remains reachable by vertical
  scroll and nothing is clipped by the Hero; one-screen containment is not
  forced at the cost of lost content.
- Every visible projected label stays within the computed safe gutter over a
  sampled rotation; document width never changes as labels rotate.
- Touch drag rotates the model without navigating; vertical swipe outside/through
  the intended region scrolls; a tap on a node navigates exactly once.
- The Story link reaches `#story` without the fixed navbar covering its heading.
- Reduced motion freezes automatic motion/bounce but leaves navigation and
  content intact.
- 200% text stress grows/reflows the Hero rather than overlapping or clipping.

### Phase 4 — Physical release protocol

Document a dated, checkable protocol whose results are attached to the release
or Lattice review comment. Automation complements but does not erase OS/browser
states that a provider cannot deterministically force.

Required physical checks:

- Galaxy S24 in Chrome **and Samsung Internet**, portrait and landscape.
- Initial load with address/tab and OS navigation bars visible; scroll until
  browser bars collapse; expand them again; rotate without reloading.
- Android gesture navigation and three-button navigation when available.
- Default and largest practical Android font/display settings, including 200%
  text/reflow inspection.
- Current iPhone Safari with notch/safe areas, default and Larger Text; browser
  bars expanded/collapsed; portrait/landscape.
- iPad Safari through iPad Pro size, portrait/landscape, touch labels at widths
  where desktop structure appears.
- Desktop Chrome, Safari, and Firefox at compact-height and standard desktop
  windows.
- Full Hero rotation/tap/swipe, mobile menu, Story CTA, all internal routes,
  reduced motion, no horizontal pan, no clipped text/media, and console/network
  sanity where inspection is available.

Record device model, OS build, browser/version, navigation mode, font/display
scale, orientation, observed `visualViewport` metrics, result, screenshot/video,
tester, and date. A width-only Chrome DevTools screenshot is never accepted in
this column.

## Test and review sequence

1. Restore/adapt the local Playwright foundation and prove the focused Hero
   fails before its repair. Preserve red output in a Lattice comment or review
   artifact.
2. Implement the Hero and label/safe-area changes; make focused local tests green.
3. Run the required repository gates in order: `pnpm typecheck`, `pnpm test`,
   `pnpm build`, then design conformance and the fast rendered-layout suite.
4. Run the full local three-engine matrix and inspect deterministic visual diffs.
5. If BrowserStack credentials are available, run Galaxy S24, iPhone, and iPad
   real-device suites, link the Automate build/session, and attach metrics and
   failure artifacts. If credentials remain absent, do not claim this acceptance;
   transition/report the task as requiring the two secrets/subscription after all
   no-secret implementation is complete.
6. Cold review compares the implementation to this plan, reruns local gates,
   audits that remote projects are truly `realMobile`, and checks that CI never
   exposes secrets or hangs a tunnel.

## Acceptance criteria

- One shared Playwright assertion suite covers every rendered internal route,
  compact phones through iPad Pro and desktop, portrait/landscape, touch/hover,
  reduced motion, safe-area/visual-viewport metrics, and text reflow.
- Fast local responsive checks run on every PR; complete local and real-device
  matrices are scheduled/manual; BrowserStack failure artifacts are retained.
- Real Android/iOS projects use physical BrowserStack devices and self-verify
  their environment. Documentation never calls local device descriptors real.
- Secret/tunnel setup is documented and safe; missing credentials produce an
  actionable result. No credential is added to the repository.
- The Home Hero is red before repair and green after it, with no footer/geometry/
  label overlap or clipped blurb/CTA/arrow on the Galaxy S24's measured initial
  visual viewport; short landscape and 200% text remain reachable without loss.
- All visible 3D labels remain within the computed page-gutter/safe area during
  rotation, and all routes have no horizontal overflow.
- Real Galaxy S24 Chrome, real iPhone Safari, and real iPad Safari runs are linked
  as evidence before full completion. Samsung Internet remains an explicit
  physical release result unless/until a separately approved Selenium lane is
  implemented.
- Existing interaction, route, performance/preload, reduced-motion, design-token,
  unit, typecheck, and production-build contracts remain green.

## Risks and mitigations

- **Paid vendor/credentials:** configuration can be completed without them, but
  hardware certification cannot. Surface this as a human dependency, not a pass.
- **Provider device/version drift:** keep the matrix in one file, date it, and use
  documented device names; fail clearly when a device is retired.
- **Playwright/provider version mismatch:** exact-pin the common supported
  version and update deliberately; avoid caret drift.
- **Browser chrome is gesture/stateful:** capture actual visual-viewport metrics
  and retain the physical protocol when automation cannot trigger a transition.
- **Samsung Internet gap:** state it plainly and test physically; do not label
  Android Chrome as Samsung Internet coverage.
- **Matrix cost/time:** tier PR/nightly/release coverage and reuse sessions across
  routes without dropping any route from the full matrix.
- **WebGL/font flake:** reduced-motion snapshot pose, explicit font/scene/texture
  readiness, bounded remote retry, real device logs/video, and SwiftShader only
  for local Chromium fallback. Never replace the real Hero with a mock in E2E.
- **False visual diffs:** keep pixel baselines engine-specific and limited;
  structural geometry assertions are the cross-device truth.
- **Shared-worktree/stale FRAC-11 state:** port only attributable changes, inspect
  current diffs before editing, and do not revert unrelated work.
