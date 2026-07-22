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

test.beforeEach(async ({ page }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  if (profile?.reducedMotion) await page.emulateMedia({ reducedMotion: profile.reducedMotion });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await preparePage(page, profile?.rootFontScale);
  await attachEnvironment(page, testInfo);
});

test("stage, Story footer, and CTA remain reachable without overlap", async ({ page }, testInfo) => {
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  const metrics = await environmentMetrics(page);
  const portrait = (metrics.visualViewport?.height ?? metrics.inner.height) >= (metrics.visualViewport?.width ?? metrics.inner.width);
  const requiresInitialContainment = width < 1024 && !profile?.rootFontScale && portrait && (profile?.viewport.height ?? 0) >= 568;
  await assertHeroComposition(page, requiresInitialContainment);
  await assertNoHorizontalOverflow(page);
  await assertNavbarDoesNotCoverContent(page);
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
