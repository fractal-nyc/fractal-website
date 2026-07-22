import { expect, test } from "@playwright/test";
import { preparePage } from "./support/layout-assertions";
import type { ResponsiveProfile } from "./support/profiles";

const VISUAL_PROFILES = new Set([
  "phone-320x568",
  "landscape-640x360",
  "boundary-1024x768",
  "desktop-1440x900",
]);

test("representative Home and Library layouts match stable Chromium evidence", async ({ page, browserName }, testInfo) => {
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

  await page.goto("/library", { waitUntil: "domcontentloaded" });
  await preparePage(page);
  await expect(page).toHaveScreenshot(`chromium-${profile.name}-library.png`, {
    animations: "disabled",
    caret: "hide",
    // Font antialiasing differs slightly between macOS development and the
    // Linux CI renderer; layout-scale regressions still exceed this bound.
    maxDiffPixelRatio: 0.03,
  });
});
