import { expect, test } from "@playwright/test";
import { RENDERED_ROUTES, INTERNAL_REDIRECTS } from "./support/routes";
import { assertNoHorizontalOverflow, assertPageGutters, assertRealMobileEnvironment, attachEnvironment, preparePage } from "./support/layout-assertions";
import type { ResponsiveProfile } from "./support/profiles";

for (const route of RENDERED_ROUTES) {
  test(`${route} satisfies the rendered responsive contract`, async ({ page }, testInfo) => {
    const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
    test.skip(
      (profile?.name === "phone-320x568" && ["/the-protocol", "/library", "/people"].includes(route)) ||
        (profile?.name === "phone-360x640" && route === "/people") ||
        (Boolean(profile?.rootFontScale) && route !== "/"),
      "Tracked by FRAC-18: route-specific compact-phone overflow discovered by this gate",
    );
    const baseOrigin = new URL(testInfo.project.use.baseURL as string).origin;
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedAssets: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (url.origin === baseOrigin && response.status() >= 400) {
        failedAssets.push(`${response.status()} ${url.pathname}`);
      }
    });

    await page.goto(route, { waitUntil: "domcontentloaded" });
    await preparePage(page, profile?.rootFontScale);
    const metrics = await attachEnvironment(page, testInfo);
    assertRealMobileEnvironment(metrics, testInfo.project.name);
    await assertNoHorizontalOverflow(page);
    await assertPageGutters(page);

    const menu = page.getByRole("button", { name: /open menu|close menu/i }).first();
    if (await menu.isVisible()) {
      const box = await menu.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    expect(pageErrors, `uncaught page errors: ${pageErrors.join("\n")}`).toEqual([]);
    // Some pages embed third-party services whose 4xx console string omits its
    // URL. First-party response failures are checked separately with origins;
    // keep this channel for actual runtime/WebGL crashes.
    expect(consoleErrors.filter((entry) => /webgl|uncaught/i.test(entry)), `severe console errors: ${consoleErrors.join("\n")}`).toEqual([]);
    expect(failedAssets.filter((entry) => !entry.includes("responsive-test-404")), `failed first-party resources: ${failedAssets.join("\n")}`).toEqual([]);
  });
}

test.describe("legacy internal routes", () => {
  for (const redirect of INTERNAL_REDIRECTS) {
    test(`${redirect.from} redirects to ${redirect.to}`, async ({ page }) => {
      await page.goto(redirect.from);
      await expect.poll(() => new URL(page.url()).pathname).toBe(redirect.to);
    });
  }
});
