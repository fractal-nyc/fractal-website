import { expect, test } from "@playwright/test";
import { preparePage } from "./support/layout-assertions";
import type { ResponsiveProfile } from "./support/profiles";

const VISUAL_PROFILES = new Set([
  "phone-320x568",
  "landscape-640x360",
  "boundary-1024x768",
  "desktop-1440x900",
]);

test("representative Home layout matches stable Chromium evidence", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || !profile || !VISUAL_PROFILES.has(profile.name), "engine-specific Chromium baseline risk set");
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await preparePage(page);
  await expect(page.locator('[data-hero-scene][data-scene-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect(page).toHaveScreenshot(`chromium-${profile.name}-home.png`, {
    animations: "disabled",
    caret: "hide",
    // The real WebGL scene stays in this evidence (it is not mocked or
    // masked), so allow bounded rasterization variance while still catching
    // composition-scale, clipping, and overlap regressions.
    maxDiffPixelRatio: 0.05,
  });
});

test("representative Library layout matches stable Chromium evidence", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || !profile || !VISUAL_PROFILES.has(profile.name), "engine-specific Chromium baseline risk set");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/library", { waitUntil: "domcontentloaded" });
  await preparePage(page);
  if (["boundary-1024x768", "desktop-1440x900"].includes(profile.name)) {
    const introColumn = page.getByTestId("library-intro-column");
    const introBox = await introColumn.boundingBox();
    expect(introBox).not.toBeNull();
    expect(Math.abs(introBox!.width - 768)).toBeLessThanOrEqual(1);
  }
  await expect(page).toHaveScreenshot(`chromium-${profile.name}-library.png`, {
    animations: "disabled",
    caret: "hide",
    // Font antialiasing differs slightly between macOS development and the
    // Linux CI renderer; layout-scale regressions still exceed this bound.
    maxDiffPixelRatio: 0.03,
  });
});

test("Library headline lines stay clear of both desktop pennants", async ({ page, browserName }, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(browserName !== "chromium" || profile?.name !== "desktop-1440x900", "single Chromium geometry lane");
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of [1024, 1279, 1280, 1440]) {
    await test.step(`${width}px viewport`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/library", { waitUntil: "domcontentloaded" });
      await preparePage(page);

      const introBox = await page.getByTestId("library-intro-column").boundingBox();
      const headlineBox = await page.getByTestId("library-headline").boundingBox();
      expect(introBox).not.toBeNull();
      expect(headlineBox).not.toBeNull();
      expect(Math.abs(introBox!.width - 768)).toBeLessThanOrEqual(1);
      expect(Math.abs(headlineBox!.width - (width < 1280 ? 672 : 768))).toBeLessThanOrEqual(1);

      const geometry = await page.evaluate(() => {
        const headline = document.querySelector<HTMLElement>('[data-testid="library-headline"]');
        const pennantImages = Array.from(
          document.querySelectorAll<HTMLImageElement>('[data-testid="library-desktop-pennants"] img'),
        ).filter((image) => {
          const rect = image.getBoundingClientRect();
          return getComputedStyle(image).visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        });
        if (!headline) throw new Error("Library headline was not rendered");

        const range = document.createRange();
        range.selectNodeContents(headline);
        const lineRects = Array.from(range.getClientRects())
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map(({ left, right, top, bottom, width, height }) => ({ left, right, top, bottom, width, height }));
        const pennantRects = pennantImages.map((image) => {
          const { left, right, top, bottom, width, height } = image.getBoundingClientRect();
          return { left, right, top, bottom, width, height };
        });

        return { lineRects, pennantRects };
      });

      expect(geometry.pennantRects).toHaveLength(2);
      expect(geometry.lineRects.length).toBeGreaterThan(0);
      for (const [lineIndex, lineRect] of geometry.lineRects.entries()) {
        for (const [pennantIndex, pennantRect] of geometry.pennantRects.entries()) {
          const horizontalOverlap = Math.min(lineRect.right, pennantRect.right)
            - Math.max(lineRect.left, pennantRect.left);
          const verticalOverlap = Math.min(lineRect.bottom, pennantRect.bottom)
            - Math.max(lineRect.top, pennantRect.top);
          expect(
            horizontalOverlap > 0.5 && verticalOverlap > 0.5,
            `headline line ${lineIndex + 1} intersects pennant ${pennantIndex + 1} at ${width}px `
              + `(horizontal overlap ${horizontalOverlap.toFixed(2)}px, vertical overlap ${verticalOverlap.toFixed(2)}px)`,
          ).toBe(false);
        }
      }
    });
  }
});
