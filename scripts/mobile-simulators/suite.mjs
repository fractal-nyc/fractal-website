import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { remote } from "webdriverio";
import { INTERNAL_REDIRECTS, RENDERED_ROUTES } from "../../tests/e2e/support/routes.mjs";
import { validateAndroidRuntimeIdentity, validateAppleDeviceIdentity } from "./identity.mjs";
import { buildWebdriverCapabilities } from "./capabilities.mjs";
import { classifyBrowserLogs } from "./browser-logs.mjs";
import { createNativeWebViewTransform, nativeWebViewSelector } from "./native-coordinates.mjs";
import {
  collectEnvironmentMetrics,
  beginRuntimeHealthRoute,
  installRuntimeHealthCapture,
  probeHeroComposition,
  probeHeroLabelSafeZone,
  probeHorizontalOverflow,
  probeNavbarContent,
  probePageGutters,
  probePrimaryContentIntegrity,
  probeRuntimeHealth,
  probeTouchTargets,
} from "../../tests/e2e/support/responsive-contract.mjs";

function slug(value) {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function assertProbe(label, result) {
  if (result.violations.length) {
    throw new Error(`${label}: ${result.violations.join("; ")}\n${JSON.stringify(result.details, null, 2)}`);
  }
  return result;
}

async function waitForDocument(browser) {
  await browser.waitUntil(async () => browser.execute(() => document.readyState === "complete"), {
    timeout: 30_000,
    timeoutMsg: "document did not reach complete",
  });
  await browser.executeAsync((done) => {
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(done)));
  });
}

async function webContext(browser) {
  const contexts = await browser.getContexts();
  const names = contexts.map((entry) => typeof entry === "string" ? entry : entry.id);
  const selected = names.find((name) => /^WEBVIEW/i.test(name)) || names.find((name) => /CHROM|SAFARI/i.test(name));
  if (!selected) throw new Error(`No mobile web context found. Contexts: ${JSON.stringify(names)}`);
  await browser.switchContext(selected);
  return selected;
}

async function nativeContext(browser) {
  await browser.switchContext("NATIVE_APP");
}

async function nativeGesture(browser, points, pauseMs = 180) {
  const actions = [{
    type: "pointer",
    id: "finger1",
    parameters: { pointerType: "touch" },
    actions: [
      { type: "pointerMove", duration: 0, x: Math.round(points[0].x), y: Math.round(points[0].y) },
      { type: "pointerDown", button: 0 },
      ...points.slice(1).map((point) => ({ type: "pointerMove", duration: pauseMs, x: Math.round(point.x), y: Math.round(point.y) })),
      { type: "pointerUp", button: 0 },
    ],
  }];
  await browser.performActions(actions);
  await browser.releaseActions();
}

async function nativeWebViewTransform(browser, profile, metrics, nativeWindow) {
  const selector = nativeWebViewSelector(profile.platform);
  const elements = await browser.$$(selector);
  const visibleRects = [];
  for (const element of elements) {
    if (await element.isDisplayed()) visibleRects.push(await element.getRect());
  }
  if (visibleRects.length !== 1) {
    throw new Error(`Expected exactly one visible native WebView (${selector}), found ${visibleRects.length}`);
  }
  if (!metrics.visualViewport) throw new Error("Cannot map native gestures without a live visualViewport");
  return createNativeWebViewTransform({
    nativeRect: visibleRects[0],
    nativeWindow,
    cssViewport: metrics.visualViewport,
    cssScreen: metrics.screen,
  });
}

export async function runSimulatorSuite({ profile, identity, baseUrl, evidenceDir, androidChromeWorkaround = null, appiumPort = 4723 }) {
  mkdirSync(evidenceDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const manifest = {
    runId: `${slug(profile.id)}-${Date.now()}`,
    environment: profile.platform === "android" ? "android-emulator" : "apple-simulator",
    profile: profile.id,
    identity,
    ...(profile.platform === "android" ? { androidChromeWorkaround } : {}),
    baseUrl,
    startedAt,
    records: [],
    manualChecks: [],
  };
  const manifestPath = join(evidenceDir, "manifest.json");
  const record = (type, data) => {
    manifest.records.push({ type, timestamp: new Date().toISOString(), ...data });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  };

  const capabilities = buildWebdriverCapabilities({ profile, identity, baseUrl });

  const browser = await remote({ hostname: "127.0.0.1", port: appiumPort, path: "/", logLevel: "info", capabilities });
  try {
    const ensureRuntimeHealthCapture = async (context) => {
      await browser.execute(installRuntimeHealthCapture);
      if (!await browser.execute(() => Boolean(window.__fractalSimulatorHealth))) {
        throw new Error(`Unable to install the simulator runtime-health capture ${context}`);
      }
    };

    await webContext(browser);
    await browser.url(`${baseUrl}/protocol?simulator-health-bootstrap=1`);
    await waitForDocument(browser);
    await ensureRuntimeHealthCapture("during bootstrap");

    let browserLogChannel = "unknown";
    const readBrowserLogs = async (route, { drain = false } = {}) => {
      try {
        const logs = await browser.getLogs("browser");
        browserLogChannel = "supported";
        if (drain) return [];
        const { fatal, externalNetwork } = classifyBrowserLogs(logs, baseUrl);
        record("route-browser-logs", { route, result: "supported", logs, fatal, externalNetwork });
        if (fatal.length) throw new Error(`fatal browser errors on ${route}:\n${fatal.map((entry) => `${entry.level}: ${entry.message}`).join("\n")}`);
        return logs;
      } catch (error) {
        if (browserLogChannel === "supported") throw error;
        browserLogChannel = "unsupported-by-driver";
        record("route-browser-logs", { route, result: "unsupported-by-driver", message: error.message });
        if (profile.platform === "android") {
          throw new Error(`Android Chrome browser-log channel is required but unavailable: ${error.message}`);
        }
        return [];
      }
    };
    await readBrowserLogs("bootstrap", { drain: true });

    const metricsFor = async (orientation, route, state = "loaded") => browser.execute(collectEnvironmentMetrics, {
      build: process.env.GITHUB_SHA ?? "local",
      environment: manifest.environment,
      profile: profile.id,
      orientation,
      route,
      state,
      simulatorIdentity: identity,
      browserVersion: browser.capabilities.browserVersion ?? null,
      platformVersion: browser.capabilities.platformVersion ?? identity.platformVersion ?? null,
    });

    const assertEnvironment = async (metrics, orientation) => {
      const violations = [];
      const android = /Android/i.test(metrics.userAgent);
      const iphone = /iPhone|iPod/i.test(metrics.userAgent);
      const ipad = /iPad/i.test(metrics.userAgent) || (metrics.platform === "MacIntel" && metrics.maxTouchPoints > 1);
      if (!metrics.visualViewport) violations.push("visualViewport is unavailable");
      if (metrics.maxTouchPoints <= 0) violations.push("mobile browser does not expose touch points");
      if (metrics.hover) violations.push("mobile browser reports a hover-primary environment");
      if (metrics.dpr <= 1) violations.push("mobile browser DPR is not greater than one");
      if (profile.platform === "android") {
        violations.push(...validateAndroidRuntimeIdentity(profile, identity).violations);
        if (`${identity.navigationMode}` !== "2") violations.push(`expected Android gesture navigation (navigation_mode=2), got ${identity.navigationMode}`);
        if (!android || !/Chrome/i.test(metrics.userAgent)) violations.push(`expected Chrome for Android UA, got ${metrics.userAgent}`);
      } else {
        if (!identity.udid) violations.push(`CoreSimulator UDID is missing: ${JSON.stringify(identity)}`);
        violations.push(...validateAppleDeviceIdentity(profile, {
          name: identity.deviceName,
          deviceTypeIdentifier: identity.deviceTypeIdentifier,
          runtime: identity.runtime,
        }).violations);
        if (!/Safari/i.test(metrics.userAgent) || /CriOS|Chrome/i.test(metrics.userAgent)) violations.push(`expected Mobile Safari UA, got ${metrics.userAgent}`);
        if (profile.id === "ipados-simulator-pro" ? !ipad : !iphone) violations.push(`Apple simulator family mismatch for ${profile.id}`);
      }
      const portrait = (metrics.visualViewport?.height ?? metrics.inner.height) >= (metrics.visualViewport?.width ?? metrics.inner.width);
      if (portrait !== (orientation === "PORTRAIT")) violations.push(`expected ${orientation}, got ${portrait ? "PORTRAIT" : "LANDSCAPE"}`);
      const chromePressure = metrics.screen.height - (metrics.visualViewport?.height ?? metrics.inner.height);
      if (chromePressure <= 0) violations.push("browser/system chrome does not reduce the live visual viewport");
      if (violations.length) throw new Error(`Simulator environment preflight failed:\n- ${violations.join("\n- ")}\n${JSON.stringify(metrics, null, 2)}`);
      return { chromePressure };
    };

    const saveDeviceScreenshot = async (name, metadata = {}) => {
      const current = await browser.getContext();
      await nativeContext(browser);
      const path = join(evidenceDir, `${slug(name)}.png`);
      await browser.saveScreenshot(path);
      await browser.switchContext(typeof current === "string" ? current : current.id);
      record("whole-device-screenshot", { name, path, ...metadata });
      return path;
    };

    const navigate = async (path, orientation, state = "loaded", expectedPath = path) => {
      const captureReset = await browser.execute(beginRuntimeHealthRoute, path);
      if (!captureReset) throw new Error(`runtime-health capture disappeared before navigating to ${path}`);
      await browser.execute((nextPath) => {
        history.pushState({}, "", nextPath);
        dispatchEvent(new PopStateEvent("popstate"));
      }, path);
      await browser.waitUntil(async () => new URL(await browser.getUrl()).pathname === expectedPath, {
        timeout: 15_000,
        timeoutMsg: `${path} did not reach expected route ${expectedPath}`,
      });
      await waitForDocument(browser);
      await browser.pause(100);
      const runtimeHealth = assertProbe(`runtime health for ${path}`, await browser.execute(probeRuntimeHealth));
      record("route-runtime-health", { route: path, actualRoute: expectedPath, result: "passed", browserLogChannel, probe: runtimeHealth });
      await readBrowserLogs(path);
      const metrics = await metricsFor(orientation, path, state);
      const identityEvidence = await assertEnvironment(metrics, orientation);
      record("runtime-environment", { route: path, orientation, state, metrics, identityEvidence });
      return metrics;
    };

    const responsiveContract = async (route) => {
      const probes = {
        horizontalOverflow: assertProbe("horizontal containment", await browser.execute(probeHorizontalOverflow)),
        primaryContent: assertProbe("primary-content reflow", await browser.execute(probePrimaryContentIntegrity)),
        pageGutters: assertProbe("canonical page gutters", await browser.execute(probePageGutters)),
        navbar: assertProbe("navbar/content relationship", await browser.execute(probeNavbarContent)),
        touchTargets: assertProbe("touch targets", await browser.execute(probeTouchTargets)),
      };
      record("responsive-contract", { route, probes });
    };

    await browser.setOrientation("PORTRAIT");
    const routes = profile.routeSweep ? RENDERED_ROUTES : ["/"];
    for (const route of routes) {
      await navigate(route, "PORTRAIT");
      await responsiveContract(route);
    }
    if (profile.routeSweep) {
      for (const redirect of INTERNAL_REDIRECTS) {
        const metrics = await navigate(redirect.from, "PORTRAIT", "redirect", redirect.to);
        const actual = new URL(metrics.url).pathname;
        if (actual !== redirect.to) throw new Error(`${redirect.from} redirected to ${actual}, expected ${redirect.to}`);
        record("redirect", { from: redirect.from, to: redirect.to, actual });
      }
    }

    await navigate("/", "PORTRAIT", "initial-expanded-toolbar");
    await browser.waitUntil(async () => browser.execute(() => document.querySelector('[data-hero-scene][data-scene-ready="true"]') !== null), { timeout: 45_000, timeoutMsg: "Hero WebGL scene did not become ready" });
    await browser.waitUntil(async () => browser.execute(() => document.querySelectorAll("[data-hero-label]").length > 0), { timeout: 45_000, timeoutMsg: "Hero projected labels did not appear" });
    const initialMetrics = await metricsFor("PORTRAIT", "/", "initial-expanded-toolbar");
    const requireInitialContainment = initialMetrics.inner.width < 1024;
    assertProbe("Hero stage/footer composition", await browser.execute(probeHeroComposition, { requireInitialContainment }));
    for (let sample = 0; sample < 10; sample += 1) {
      assertProbe("Hero projected-label safe zone", await browser.execute(probeHeroLabelSafeZone));
      await browser.pause(100);
    }
    await saveDeviceScreenshot("home-portrait-expanded-toolbar", { orientation: "PORTRAIT", state: "expanded" });

    const nativeSize = await (async () => {
      const current = await browser.getContext();
      await nativeContext(browser);
      const size = await browser.getWindowSize();
      await browser.switchContext(typeof current === "string" ? current : current.id);
      return size;
    })();
    await nativeContext(browser);
    await nativeGesture(browser, [
      { x: nativeSize.width * 0.5, y: nativeSize.height * 0.78 },
      { x: nativeSize.width * 0.5, y: nativeSize.height * 0.25 },
    ]);
    await webContext(browser);
    await browser.pause(750);
    const collapsedMetrics = await metricsFor("PORTRAIT", "/", "collapsed-toolbar-attempt");
    await saveDeviceScreenshot("home-portrait-collapsed-toolbar-attempt", { orientation: "PORTRAIT", state: "collapsed-attempt" });
    await browser.execute(() => scrollTo({ top: 0, behavior: "instant" }));
    await nativeContext(browser);
    await nativeGesture(browser, [
      { x: nativeSize.width * 0.5, y: nativeSize.height * 0.28 },
      { x: nativeSize.width * 0.5, y: nativeSize.height * 0.72 },
    ]);
    await webContext(browser);
    await browser.pause(750);
    const expandedMetrics = await metricsFor("PORTRAIT", "/", "expanded-toolbar-attempt");
    await saveDeviceScreenshot("home-portrait-expanded-toolbar-attempt", { orientation: "PORTRAIT", state: "expanded-attempt" });
    const heights = [initialMetrics, collapsedMetrics, expandedMetrics].map((entry) => Math.round(entry.visualViewport?.height ?? entry.inner.height));
    const chromeResult = new Set(heights).size > 1 ? "observed" : "inconclusive-manual-simulator-check-required";
    if (chromeResult !== "observed") manifest.manualChecks.push("Interactively collapse and expand the browser toolbar in this simulator and confirm the live visualViewport changes without Hero clipping.");
    record("browser-chrome-transition", { result: chromeResult, heights, initialMetrics, collapsedMetrics, expandedMetrics });

    if (profile.interaction) {
      await browser.execute(() => document.querySelector('[data-site-navbar] button[aria-label="Open menu"]')?.click());
      await browser.pause(250);
      const menuOpen = await browser.execute(() => document.querySelector('[data-site-navbar] button[aria-label="Close menu"]') !== null);
      if (!menuOpen) throw new Error("mobile menu did not open");
      await browser.execute(() => document.querySelector('[data-site-navbar] button[aria-label="Close menu"]')?.click());
      record("interaction", { name: "mobile-menu", result: "passed" });

      await browser.execute(() => document.querySelector("[data-hero-cta]")?.click());
      await browser.waitUntil(async () => new URL(await browser.getUrl()).hash === "#story", { timeout: 10_000, timeoutMsg: "Story CTA did not reach #story" });
      await waitForDocument(browser);
      await ensureRuntimeHealthCapture("after Story CTA navigation");
      record("interaction", { name: "story-cta", result: "passed", url: await browser.getUrl() });
      await navigate("/", "PORTRAIT", "interaction-reset");
      await browser.execute(() => scrollTo({ top: 0, behavior: "instant" }));
      await browser.waitUntil(async () => browser.execute(() => document.querySelectorAll("[data-hero-label]").length > 0), { timeout: 45_000 });

      const labelCentersBefore = await browser.execute(() => Array.from(document.querySelectorAll("[data-hero-label]")).map((element) => {
        const box = element.getBoundingClientRect();
        return { label: element.dataset.heroLabel, x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }));
      const stage = await browser.execute(() => {
        const box = document.querySelector("[data-hero-hit-region]")?.getBoundingClientRect();
        return box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null;
      });
      if (!stage) throw new Error("Hero hit region is unavailable for native gesture evidence");
      const currentMetrics = await metricsFor("PORTRAIT", "/", "before-native-drag");
      await nativeContext(browser);
      const coordinateTransform = await nativeWebViewTransform(browser, profile, currentMetrics, nativeSize);
      const center = { x: stage.x + stage.width / 2, y: stage.y + stage.height / 2 };
      await nativeGesture(browser, [
        coordinateTransform.mapPoint({ x: center.x - 50, y: center.y }),
        coordinateTransform.mapPoint({ x: center.x + 50, y: center.y }),
      ]);
      record("native-coordinate-space", {
        nativeWebViewRect: coordinateTransform.nativeRect,
        scaleX: coordinateTransform.scaleX,
        scaleY: coordinateTransform.scaleY,
        expectedScaleX: coordinateTransform.expectedScaleX,
        expectedScaleY: coordinateTransform.expectedScaleY,
      });
      await webContext(browser);
      await browser.pause(350);
      const labelCentersAfter = await browser.execute(() => Array.from(document.querySelectorAll("[data-hero-label]")).map((element) => {
        const box = element.getBoundingClientRect();
        return { label: element.dataset.heroLabel, x: box.x + box.width / 2, y: box.y + box.height / 2 };
      }));
      const moved = labelCentersAfter.some((after) => {
        const before = labelCentersBefore.find(({ label }) => label === after.label);
        return before && Math.hypot(after.x - before.x, after.y - before.y) > 2;
      });
      if (!moved) throw new Error("native drag did not move the real WebGL projected labels");
      record("interaction", { name: "native-webgl-drag", result: "passed" });

      const target = labelCentersAfter.find(({ label }) => /events|campus|co-living|library/i.test(label));
      if (!target) throw new Error("no visible internal Hero node is available for native tap evidence");
      const beforeUrl = await browser.getUrl();
      await nativeContext(browser);
      const nativeTarget = coordinateTransform.mapPoint(target);
      await nativeGesture(browser, [nativeTarget, nativeTarget], 80);
      await webContext(browser);
      await browser.waitUntil(async () => (await browser.getUrl()) !== beforeUrl, { timeout: 10_000, timeoutMsg: `native tap on ${target.label} did not navigate` });
      const afterUrl = await browser.getUrl();
      await browser.pause(750);
      if ((await browser.getUrl()) !== afterUrl) throw new Error("Hero node tap caused duplicate/unstable navigation");
      record("interaction", { name: "native-node-tap", label: target.label, beforeUrl, afterUrl, result: "passed" });
    }

    await navigate("/", "PORTRAIT", "before-rotation");
    const navigationEntries = await browser.execute(() => performance.getEntriesByType("navigation").length);
    await browser.setOrientation("LANDSCAPE");
    await browser.waitUntil(async () => browser.execute(() => innerWidth > innerHeight), { timeout: 15_000, timeoutMsg: "simulator did not rotate to landscape" });
    const landscapeMetrics = await metricsFor("LANDSCAPE", "/", "rotated-without-reload");
    await assertEnvironment(landscapeMetrics, "LANDSCAPE");
    assertProbe("landscape horizontal containment", await browser.execute(probeHorizontalOverflow));
    assertProbe("landscape navbar/content relationship", await browser.execute(probeNavbarContent));
    assertProbe("landscape Hero composition", await browser.execute(probeHeroComposition, { requireInitialContainment: false }));
    if (await browser.execute(() => performance.getEntriesByType("navigation").length) !== navigationEntries) throw new Error("orientation change reloaded the page");
    await saveDeviceScreenshot("home-landscape", { orientation: "LANDSCAPE", state: "rotated-without-reload" });
    record("orientation", { from: "PORTRAIT", to: "LANDSCAPE", result: "passed", metrics: landscapeMetrics });
    await browser.setOrientation("PORTRAIT");

    manifest.manualChecks.push("Set the largest practical Android font/display scale or iOS Larger Text plus Safari Page Zoom interactively, then rerun the focused Home observations; private preference-file automation is intentionally not used.");
    record("browser-log-capability", { result: browserLogChannel });
    manifest.finishedAt = new Date().toISOString();
    manifest.result = "passed";
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifest;
  } catch (error) {
    manifest.finishedAt = new Date().toISOString();
    manifest.result = "failed";
    manifest.error = { message: error.message, stack: error.stack };
    try {
      const current = await browser.getContext();
      await nativeContext(browser);
      await browser.saveScreenshot(join(evidenceDir, "failure-whole-device.png"));
      await browser.switchContext(typeof current === "string" ? current : current.id);
    } catch (screenshotError) {
      manifest.screenshotError = screenshotError.message;
    }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    throw error;
  } finally {
    await browser.deleteSession();
  }
}
