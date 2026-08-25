import { expect, test } from "@playwright/test";
import type { ResponsiveProfile } from "./support/profiles";
import { preparePage } from "./support/layout-assertions";

test("Education portal keeps one wide accessible catalog across input modes", async ({
  page,
}, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  const width = profile?.viewport.width ?? 1440;
  const hasTouch = profile?.hasTouch ?? false;
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/education", { waitUntil: "domcontentloaded" });
  await preparePage(page, profile?.rootFontScale);

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
  await expect(page.locator("iframe, table, details, summary")).toHaveCount(0);

  const catalog = page.getByTestId("fractalu-course-catalog");
  await expect(catalog).toBeVisible();
  await expect(catalog.locator("article")).toHaveCount(20);
  await expect(page.locator("[data-course-collection]")).toHaveCount(1);

  const technology = page.getByRole("button", { name: "Technology" });
  expect(
    await technology.evaluate((button) => Number.parseFloat(getComputedStyle(button).minHeight)),
  ).toBeGreaterThanOrEqual(44);
  await technology.click();
  await expect(technology).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("3 courses shown.")).toHaveText("3 courses shown.");
  await expect(catalog.locator("article")).toHaveCount(3);
  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText("20 courses shown.")).toHaveText("20 courses shown.");
  await expect(catalog.locator("article")).toHaveCount(20);

  const firstCourse = catalog.locator('article[data-course-id="lost-generation-close-reading"]');
  const description = firstCourse.locator("[data-course-description]");
  const titleLink = firstCourse.getByRole("link", {
    name: /The Lost Generation Close Reading course description/,
  });
  await expect(titleLink).toHaveAttribute(
    "href",
    "https://closereadingnyc.notion.site/The-Lost-Generation-Close-Reading-359c580377d680b0b8fefba14aaef8a0",
  );
  await expect(titleLink).toHaveAttribute("aria-describedby", "lost-generation-close-reading-description");

  if (!hasTouch && width >= 1024 && !profile?.rootFontScale) {
    await expect(description).toHaveCSS("visibility", "hidden");
    await titleLink.hover();
    await expect(description).toHaveCSS("visibility", "visible");
    await titleLink.focus();
    await expect(description).toHaveCSS("visibility", "visible");

    const instructor = firstCourse.getByRole("button", { name: "Elena Navarrete" });
    const instructorPreview = instructor.locator("..");
    const instructorBio = firstCourse.locator("[data-instructor-bio]");
    await instructor.focus();
    await expect(instructorBio).toHaveCSS("visibility", "visible");
    await instructor.click();
    await expect(instructor).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(instructor).toHaveAttribute("aria-expanded", "false");
    await expect(instructor).toBeFocused();
    await expect(instructorPreview).toHaveAttribute("data-pinned", "false");
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "true");
    await expect(instructorBio).toHaveCSS("visibility", "hidden");
    await expect(instructorBio).toHaveCSS("opacity", "0");

    await page.mouse.move(0, 0);
    await firstCourse.getByRole("link", { name: /Apply for The Lost Generation/ }).focus();
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await instructor.focus();
    await expect(instructorBio).toHaveCSS("visibility", "visible");
  } else {
    await expect(description).toHaveCSS("position", "static");
    await expect(description).toBeVisible();
    await expect(firstCourse.locator("[data-instructor-bio]")).toBeVisible();
  }

  const jumpLink = page.getByRole("link", { name: "What's FractalU?" });
  await jumpLink.click();
  await expect(page).toHaveURL(/#what-is-fractalu$/);
  await expect(page.locator("#what-is-fractalu")).toBeFocused();

  const longTitle = catalog.getByText("Worldbuilding for Storytellers and Narrative Designers");
  await expect(longTitle).toBeVisible();
  expect((await longTitle.boundingBox())?.width).toBeLessThanOrEqual((await longTitle.locator("xpath=ancestor::article").boundingBox())!.width);

  if (!hasTouch && width >= 1024) {
    const wideShell = page.locator("[data-fractalu-wide-shell]");
    const leftPennant = page.getByTestId("education-desktop-pennants").locator(":scope > div").first();
    const shellBox = await wideShell.boundingBox();
    const pennantBox = await leftPennant.boundingBox();
    expect(shellBox && pennantBox && shellBox.x < pennantBox.x + pennantBox.width).toBeTruthy();
    await expect(wideShell).toHaveCSS("z-index", "20");
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth + 1),
  );
  expect(pageErrors).toEqual([]);
});
