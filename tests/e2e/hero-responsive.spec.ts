import { expect, test } from "@playwright/test";
import { assertNavbarDoesNotCoverContent, assertNoHorizontalOverflow, assertRealMobileEnvironment, attachEnvironment, environmentMetrics, expectedRealDevice, preparePage, visualBounds } from "./support/layout-assertions";
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
  const metrics = await attachEnvironment(page, testInfo);
  await assertRealMobileEnvironment(page, metrics, testInfo);
});

test("stage, Story footer, and CTA remain reachable without overlap", async ({ page }, testInfo) => {
  const stage = page.locator("[data-hero-stage]");
  const footer = page.locator("[data-hero-footer]");
  const blurb = page.locator("[data-hero-blurb]");
  const cta = page.locator("[data-hero-cta]");
  await expect(stage).toBeVisible();

  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  if (width < 1024) {
    await expect(footer).toBeVisible();
    await expect(blurb).toBeVisible();
    await expect(cta).toBeVisible();
    const [stageBox, footerBox, blurbBox, ctaBox] = await Promise.all([stage.boundingBox(), footer.boundingBox(), blurb.boundingBox(), cta.boundingBox()]);
    expect(stageBox && footerBox && stageBox.y + stageBox.height <= footerBox.y + 1, "stage must end before the in-flow footer").toBeTruthy();
    expect(blurbBox && footerBox && blurbBox.x >= footerBox.x - 1 && blurbBox.x + blurbBox.width <= footerBox.x + footerBox.width + 1).toBeTruthy();
    expect(ctaBox && footerBox && ctaBox.y + ctaBox.height <= footerBox.y + footerBox.height + 1).toBeTruthy();

    const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
    const metrics = await environmentMetrics(page);
    const expected = expectedRealDevice(testInfo.project.name);
    const portrait = (metrics.visualViewport?.height ?? metrics.inner.height) >= (metrics.visualViewport?.width ?? metrics.inner.width);
    const requiresInitialContainment = !profile?.rootFontScale && portrait &&
      ((profile?.viewport.height ?? 0) >= 568 || expected?.orientation === "portrait");
    if (requiresInitialContainment) {
      const visual = await visualBounds(page);
      const navbarBox = await page.locator("[data-site-navbar]").boundingBox();
      expect(navbarBox && navbarBox.y >= visual.top - 1 && navbarBox.y + navbarBox.height <= visual.bottom + 1, "navbar must fit the initial visual viewport").toBeTruthy();
      expect(footerBox && footerBox.y + footerBox.height <= visual.bottom + 1, "portrait footer must fit the initial visual viewport").toBeTruthy();
    }
  } else {
    await expect(footer).toBeHidden();
  }
  await assertNoHorizontalOverflow(page);
  await assertNavbarDoesNotCoverContent(page);
});

test("WebGL scene signals readiness and projected labels stay in the computed safe zone", async ({ page }, testInfo) => {
  test.slow();
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  const width = testInfo.project.use.viewport?.width ?? (await page.evaluate(() => innerWidth));
  const hasTouch = Boolean(testInfo.project.use.hasTouch) || process.env.BROWSERSTACK_RUN === "1";
  if (width < 1024 || hasTouch) {
    await expect.poll(() => page.locator("[data-hero-label]").count(), { timeout: 30_000 }).toBeGreaterThan(0);
    for (let sample = 0; sample < 10; sample += 1) {
      const failures = await page.evaluate(() => {
        const safe = document.querySelector<HTMLElement>("[data-hero-safe-zone]")?.getBoundingClientRect();
        if (!safe) return ["missing safe zone"];
        return Array.from(document.querySelectorAll<HTMLElement>("[data-hero-label]"))
          .filter((element) => getComputedStyle(element).visibility !== "hidden")
          .flatMap((element) => {
            const box = element.getBoundingClientRect();
            return box.left < safe.left - 1 || box.right > safe.right + 1
              ? [`${element.dataset.heroLabel}: ${box.left.toFixed(1)}..${box.right.toFixed(1)} outside ${safe.left.toFixed(1)}..${safe.right.toFixed(1)}`]
              : [];
          });
      });
      expect(failures).toEqual([]);
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
  test.skip(process.env.BROWSERSTACK_RUN === "1" || browserName !== "chromium" || profile?.name !== "phone-360x640", "one designated local touch profile exercises live rotation; BrowserStack sessions assert their configured orientation separately");
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
  test.skip(process.env.BROWSERSTACK_RUN === "1" || browserName !== "chromium" || profile?.name !== "phone-reduced-motion", "CDP touch injection is a deterministic local Chromium interaction contract; physical touch remains in the release protocol");
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

test("remote browser-bar probe records transition or explicit inconclusive evidence", async ({ page }, testInfo) => {
  test.skip(process.env.BROWSERSTACK_RUN !== "1", "physical BrowserStack evidence only");
  const initial = await environmentMetrics(page);
  await page.evaluate(() => scrollTo({ top: Math.min(500, document.documentElement.scrollHeight - innerHeight), behavior: "instant" }));
  await page.waitForTimeout(750);
  const collapsedAttempt = await environmentMetrics(page);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(750);
  const expandedAttempt = await environmentMetrics(page);
  const heights = [initial, collapsedAttempt, expandedAttempt].map((entry) => entry.visualViewport?.height ?? entry.inner.height);
  const changed = new Set(heights.map((height) => Math.round(height))).size > 1;
  await testInfo.attach("browser-chrome-transition.json", {
    body: Buffer.from(JSON.stringify({ changed, result: changed ? "observed" : "inconclusive-physical-check-required", initial, collapsedAttempt, expandedAttempt }, null, 2)),
    contentType: "application/json",
  });
});
