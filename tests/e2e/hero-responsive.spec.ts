import { expect, test } from "@playwright/test";
import { assertNoHorizontalOverflow, assertRealMobileEnvironment, attachEnvironment, preparePage, visualBounds } from "./support/layout-assertions";
import type { ResponsiveProfile } from "./support/profiles";

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  await preparePage(page, profile?.rootFontScale);
  const metrics = await attachEnvironment(page, testInfo);
  assertRealMobileEnvironment(metrics, testInfo.project.name);
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
    if ((profile?.viewport.height ?? 0) >= 568 && !profile?.rootFontScale) {
      const visual = await visualBounds(page);
      expect(footerBox && footerBox.y + footerBox.height <= visual.bottom + 1, "portrait footer must fit the initial visual viewport").toBeTruthy();
    }
  } else {
    await expect(footer).toBeHidden();
  }
  await assertNoHorizontalOverflow(page);
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
  const result = await page.evaluate(() => {
    const story = document.querySelector("#story")?.getBoundingClientRect();
    const navbar = document.querySelector("[data-site-navbar]")?.getBoundingClientRect();
    return { storyTop: story?.top ?? -1, navbarBottom: navbar?.bottom ?? 0 };
  });
  expect(result.storyTop).toBeGreaterThanOrEqual(result.navbarBottom - 1);
});
