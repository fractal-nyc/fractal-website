import { expect, test } from "@playwright/test";
import { assertHeroComposition, assertHeroLabelSafeZone, assertNavbarDoesNotCoverContent, assertNoHorizontalOverflow, attachEnvironment, environmentMetrics, preparePage } from "./support/layout-assertions";
import type { ResponsiveProfile } from "./support/profiles";

async function dispatchTouchGesture(page: import("@playwright/test").Page, points: Array<{ x: number; y: number }>): Promise<void> {
  const session = await page.context().newCDPSession(page);
  const touch = (point: { x: number; y: number }) => [{ x: point.x, y: point.y, radiusX: 2, radiusY: 2, force: 1, id: 1 }];
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touch(points[0]) });
  for (const point of points.slice(1)) {
    await page.waitForTimeout(60);
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touch(point) });
  }
  await page.waitForTimeout(60);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
}

const INTERNAL_HERO_ROUTES: Record<string, string> = {
  "CO-LIVING": "/co-living",
  EVENTS: "/events",
  CAMPUS: "/campus",
  LIBRARY: "/library",
};

async function visibleInternalNodeAnchor(page: import("@playwright/test").Page) {
  const target = await page.locator("[data-hero-label]").evaluateAll((labels, routes) => {
    const region = document.querySelector("[data-hero-hit-region] > div")?.getBoundingClientRect();
    if (!region) return null;
    for (const label of labels) {
      const name = (label as HTMLElement).dataset.heroLabel?.toUpperCase() ?? "";
      const route = routes[name];
      if (!route) continue;
      const box = label.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const transformValue = getComputedStyle(label).transform;
      const transform = transformValue === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transformValue);
      const x = box.x + box.width / 2 - transform.m41;
      const y = box.y + box.height / 2 - transform.m42;
      if (x >= region.left && x <= region.right && y >= region.top && y <= region.bottom) {
        return { label: name, route, x, y };
      }
    }
    return null;
  }, INTERNAL_HERO_ROUTES);
  expect(target, "a visible internal Hero node must have a projected anchor inside the hit target").toBeTruthy();
  return target;
}

test.beforeEach(async ({ page }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  if (profile?.reducedMotion) await page.emulateMedia({ reducedMotion: profile.reducedMotion });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await preparePage(page, profile?.rootFontScale);
  await attachEnvironment(page, testInfo);
});

test("stage, Story footer, and CTA remain reachable without overlap", async ({ page }, testInfo) => {
  test.slow();
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  const metrics = await environmentMetrics(page);
  const portrait = (metrics.visualViewport?.height ?? metrics.inner.height) >= (metrics.visualViewport?.width ?? metrics.inner.width);
  const requiresInitialContainment = width < 1024 && !profile?.rootFontScale && portrait && (profile?.viewport.height ?? 0) >= 568;
  await assertHeroComposition(page, requiresInitialContainment);
  await assertNoHorizontalOverflow(page);
  await assertNavbarDoesNotCoverContent(page);
});

test("mobile masthead and portrait art direction split cleanly at lg", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  const mobileHeader = page.locator("[data-home-mobile-header]");
  const descriptor = page.locator("[data-home-mobile-descriptor]");
  const footer = page.locator("[data-hero-footer]");
  const expectedSceneScale = width < 768 ? "1.08" : "1";

  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-scene-scale", expectedSceneScale);

  if (width < 1024) {
    await expect(mobileHeader).toBeVisible();
    await expect(descriptor).toBeVisible();
    await expect(descriptor).toHaveText("A neighborhood campus in NYC");
    await expect(footer).toBeVisible();
    const treatment = await page.evaluate(() => {
      const fractal = document.querySelector<HTMLElement>("[data-home-mobile-wordmark] > span:first-child");
      const blurb = document.querySelector<HTMLElement>("[data-hero-blurb]");
      const cta = document.querySelector<HTMLElement>("[data-hero-cta]");
      const ctaLabel = document.querySelector<HTMLElement>("[data-hero-cta-label]");
      const ctaArrow = document.querySelector<HTMLElement>("[data-hero-arrow]");
      const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
      const background = document.querySelector<HTMLElement>("[data-hero-background]");
      const image = document.querySelector<HTMLElement>("[data-hero-background-image]");
      const ctaBox = cta?.getBoundingClientRect();
      const ctaLabelBox = ctaLabel?.getBoundingClientRect();
      const ctaArrowBox = ctaArrow?.getBoundingClientRect();
      const backgroundBox = background?.getBoundingClientRect();
      const imageBox = image?.getBoundingClientRect();
      const blurbStyle = getComputedStyle(blurb!);
      return {
        mastheadFontSize: Number.parseFloat(getComputedStyle(fractal!).fontSize),
        blurbFontSize: Number.parseFloat(blurbStyle.fontSize),
        blurbFontFamily: blurbStyle.fontFamily,
        blurbFontWeight: blurbStyle.fontWeight,
        blurbTextTransform: blurbStyle.textTransform,
        ctaWidth: ctaBox?.width ?? 0,
        ctaHeight: ctaBox?.height ?? 0,
        ctaCenterDelta: ctaLabelBox && ctaArrowBox
          ? Math.abs((ctaLabelBox.top + ctaLabelBox.height / 2) - (ctaArrowBox.top + ctaArrowBox.height / 2))
          : null,
        arrowAnimation: ctaArrow ? getComputedStyle(ctaArrow).animationName : null,
        stageTranslate: getComputedStyle(stage!).translate,
        objectPosition: getComputedStyle(image!).objectPosition,
        imageDisplay: getComputedStyle(image!).display,
        backgroundBox: backgroundBox ? { top: backgroundBox.top, bottom: backgroundBox.bottom, height: backgroundBox.height } : null,
        imageBox: imageBox ? { top: imageBox.top, bottom: imageBox.bottom } : null,
      };
    });
    expect(treatment.mastheadFontSize).toBeGreaterThanOrEqual(32);
    expect(treatment.blurbFontSize).toBeGreaterThanOrEqual(16);
    expect(treatment.blurbFontFamily.toLowerCase()).toContain("inter");
    expect(treatment.blurbFontWeight).toBe("400");
    expect(treatment.blurbTextTransform).toBe("none");
    expect(treatment.ctaWidth).toBeGreaterThanOrEqual(44);
    expect(treatment.ctaHeight).toBeGreaterThanOrEqual(44);
    expect(treatment.ctaCenterDelta).not.toBeNull();
    expect(treatment.ctaCenterDelta ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(1);
    expect(treatment.arrowAnimation).toBe("none");
    expect(treatment.stageTranslate).not.toBe("none");
    expect(treatment.objectPosition).toBe("72% 100%");
    expect(treatment.imageDisplay).toBe("block");
    expect(treatment.backgroundBox).toBeTruthy();
    expect(treatment.imageBox).toBeTruthy();
    if (treatment.backgroundBox && treatment.imageBox) {
      const topOverscanRatio = (treatment.backgroundBox.top - treatment.imageBox.top) / treatment.backgroundBox.height;
      const bottomOverscanRatio = (treatment.imageBox.bottom - treatment.backgroundBox.bottom) / treatment.backgroundBox.height;
      expect(topOverscanRatio).toBeGreaterThanOrEqual(0.05);
      expect(topOverscanRatio).toBeLessThanOrEqual(0.07);
      expect(bottomOverscanRatio).toBeGreaterThanOrEqual(0.05);
      expect(bottomOverscanRatio).toBeLessThanOrEqual(0.07);
    }
  } else {
    await expect(mobileHeader).toBeHidden();
    await expect(descriptor).toBeHidden();
    await expect(footer).toBeHidden();
    const desktopTreatment = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
      const image = document.querySelector<HTMLElement>("[data-hero-background-image]");
      return {
        stageTranslate: getComputedStyle(stage!).translate,
        objectPosition: getComputedStyle(image!).objectPosition,
        backgroundScale: new DOMMatrixReadOnly(getComputedStyle(image!).transform).a,
      };
    });
    expect(desktopTreatment.stageTranslate).toBe("none");
    expect(desktopTreatment.objectPosition).toBe("50% 100%");
    expect(desktopTreatment.backgroundScale).toBeCloseTo(1.35, 4);
  }
});

test("WebGL scene signals readiness and projected labels stay in the computed safe zone", async ({ page }, testInfo) => {
  test.slow();
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  const hasTouch = Boolean(testInfo.project.use.hasTouch);
  if (width < 1024 || hasTouch) {
    await expect.poll(() => page.locator("[data-hero-label]").count(), { timeout: 30_000 }).toBeGreaterThan(0);
    for (let sample = 0; sample < 10; sample += 1) {
      await assertHeroLabelSafeZone(page);
      await page.waitForTimeout(100);
    }
  }
  await assertNoHorizontalOverflow(page);
});

test("Story CTA reaches an unobscured Story section", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  test.skip(width >= 1024, "mobile/tablet CTA is intentionally hidden in the desktop composition");
  await page.locator("[data-hero-cta]").click();
  await expect(page).toHaveURL(/#story$/);
  // Smooth scrolling and the scroll-direction navbar animation finish on
  // separate frames. The destination is unobscured when either the header has
  // cleared the visual viewport or the target sits below its visible edge.
  await expect.poll(() => page.evaluate(() => {
    const story = document.querySelector("#story")?.getBoundingClientRect();
    const navbar = document.querySelector("[data-site-navbar]")?.getBoundingClientRect();
    const storyTop = story?.top ?? -1;
    const navbarBottom = navbar?.bottom ?? 0;
    return navbarBottom <= 0 || storyTop >= navbarBottom - 1;
  })).toBeTruthy();
});

test("portrait-to-landscape rotation reflows without a reload", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || profile?.name !== "phone-360x640", "one designated simulated Chromium touch profile exercises live viewport rotation");
  const navigationEntries = await page.evaluate(() => performance.getEntriesByType("navigation").length);

  await page.setViewportSize({ width: 640, height: 360 });
  await preparePage(page);
  expect(await page.evaluate(() => innerWidth > innerHeight), "viewport must rotate to landscape").toBeTruthy();
  await assertNoHorizontalOverflow(page);
  await assertNavbarDoesNotCoverContent(page);

  await page.setViewportSize({ width: 360, height: 640 });
  await preparePage(page);
  expect(await page.evaluate(() => innerHeight > innerWidth), "viewport must rotate back to portrait").toBeTruthy();
  expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(navigationEntries);
});

test("trusted touch drag rotates and the Hero stage permits page scroll", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || profile?.name !== "phone-reduced-motion", "CDP touch injection is a deterministic simulated Chromium interaction contract; simulator gestures run in the Appium lane");
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect.poll(() => page.locator("[data-hero-label]").count(), { timeout: 30_000 }).toBeGreaterThan(0);
  const region = await page.locator("[data-hero-hit-region] > div").boundingBox();
  expect(region).toBeTruthy();
  if (!region) return;
  const labelPositions = () => page.locator("[data-hero-label]").evaluateAll((labels) => labels.map((label) => {
    const box = label.getBoundingClientRect();
    return { name: (label as HTMLElement).dataset.heroLabel, x: box.x, y: box.y };
  }));
  const before = await labelPositions();
  const center = { x: region.x + region.width / 2, y: region.y + region.height / 2 };
  await dispatchTouchGesture(page, [
    { x: center.x - 55, y: center.y },
    { x: center.x - 15, y: center.y },
    { x: center.x + 35, y: center.y },
  ]);
  await page.waitForTimeout(250);
  const after = await labelPositions();
  const moved = after.some((label) => {
    const prior = before.find(({ name }) => name === label.name);
    return prior && Math.hypot(label.x - prior.x, label.y - prior.y) > 2;
  });
  expect(moved, "horizontal touch drag must rotate the real WebGL scene").toBeTruthy();
  expect(new URL(page.url()).pathname).toBe("/");

  expect(await page.locator("[data-hero-hit-region] > div").evaluate((element) => getComputedStyle(element).touchAction)).toBe("pan-y");
  await page.mouse.move(center.x, center.y);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("trusted touch and mouse taps navigate from the projected Hero node anchor", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || profile?.name !== "phone-reduced-motion", "one stable touch profile exercises trusted Hero taps");
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect.poll(() => page.locator("[data-hero-label]").count(), { timeout: 30_000 }).toBeGreaterThan(0);

  const touchTarget = await visibleInternalNodeAnchor(page);
  if (!touchTarget) return;
  await dispatchTouchGesture(page, [{ x: touchTarget.x, y: touchTarget.y }]);
  await expect(page).toHaveURL(new RegExp(`${touchTarget.route}$`));
  await page.waitForTimeout(500);
  expect(new URL(page.url()).pathname).toBe(touchTarget.route);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await preparePage(page);
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect.poll(() => page.locator("[data-hero-label]").count(), { timeout: 30_000 }).toBeGreaterThan(0);
  const mouseTarget = await visibleInternalNodeAnchor(page);
  if (!mouseTarget) return;
  await page.mouse.click(mouseTarget.x, mouseTarget.y);
  await expect(page).toHaveURL(new RegExp(`${mouseTarget.route}$`));
});

test("reduced motion freezes Hero motion while preserving content", async ({ page }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(profile?.name !== "phone-reduced-motion", "dedicated reduced-motion project");
  const metrics = await environmentMetrics(page);
  expect(metrics.reducedMotion).toBeTruthy();
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  const label = page.locator("[data-hero-label]").first();
  await expect(label).toBeVisible({ timeout: 30_000 });
  const before = await label.boundingBox();
  await page.waitForTimeout(600);
  const after = await label.boundingBox();
  expect(before && after && Math.hypot(after.x - before.x, after.y - before.y), "projected labels must freeze with reduced motion").toBeLessThanOrEqual(1);
  expect(await page.locator("[data-hero-arrow]").evaluate((arrow) => getComputedStyle(arrow).animationName)).toBe("none");
  await expect(page.locator("[data-hero-cta]")).toBeVisible();
});
