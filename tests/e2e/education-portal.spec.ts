import { expect, test } from "@playwright/test";
import type { ResponsiveProfile } from "./support/profiles";

test("Education portal filters, discloses, and preserves the responsive catalog", async ({
  page,
}, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  const width = profile?.viewport.width ?? 1440;
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/education", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1, name: "A new liberal arts" })).toHaveCount(1);
  const accelerator = page.getByRole("link", {
    name: "Visit Fractal AI Accelerator (opens in a new tab)",
  });
  const portal = page.locator("[data-fractalu-portal]");
  await expect(accelerator).toHaveAttribute(
    "href",
    "https://go.fractalaccelerator.com/fractalnycwebsite",
  );
  await expect(portal).toBeVisible();
  expect(
    await accelerator.evaluate(
      (link, target) => Boolean(link.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING),
      await portal.elementHandle(),
    ),
  ).toBe(true);
  await expect(page.locator("iframe")).toHaveCount(0);

  const cards = page.getByTestId("fractalu-course-cards");
  const table = page.getByTestId("fractalu-course-table");
  if (width < 1024) {
    await expect(cards).toBeVisible();
    await expect(table).toBeHidden();
  } else {
    await expect(cards).toBeHidden();
    await expect(table).toBeVisible();
  }

  const technology = page.getByRole("button", { name: "Technology" });
  await expect(technology).toHaveCSS("min-height", "44px");
  await technology.click();
  await expect(technology).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("3 courses shown.")).toHaveText("3 courses shown.");
  if (width < 1024) {
    await expect(cards.locator("article")).toHaveCount(3);
    const firstDisclosure = cards.locator("details").first();
    await firstDisclosure.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(firstDisclosure).toHaveAttribute("open", "");
  } else {
    await expect(table.locator("tbody tr")).toHaveCount(3);
    const firstDisclosure = table.locator("details").first();
    await firstDisclosure.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(firstDisclosure).toHaveAttribute("open", "");
  }

  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText("20 courses shown.")).toHaveText("20 courses shown.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth + 1),
  );
  expect(pageErrors).toEqual([]);
});
