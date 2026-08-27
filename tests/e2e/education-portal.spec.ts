import { expect, test } from "@playwright/test";
import type { ResponsiveProfile } from "./support/profiles";
import { preparePage } from "./support/layout-assertions";

const MEL_BRAND_BIO =
  "Mel Brand is a Brooklyn-based industrial designer creating environmentally conscious furniture that balances sustainability with playful conceptual thinking. With 10 years of experience in architecture, architectural lighting design, and industrial design her work considers the relationship between furniture, space, and human interaction in the home. She brings levity to complex topics, using humor as a design tool to make serious issues more approachable. Her recent projects span furniture, lighting, and home goods, often working with materials such as wood, 3D printing, ceramics, and fabric. By combining thoughtful design with a systems-oriented mindset, Mel aims to create work that sparks both joy and reflection.";
const JULIANNE_LEFELHOCZ_BIO =
  "Julianne Lefelhocz is a multidisciplinary creative technologist and designer merging fashion, design, math, and technology. With over 10 years of experience 3D modeling, two degrees in Computer Science and Footwear and Accessories Design, she is a teacher at the Brooklyn Shoe Space for 3D modeling footwear and a software engineer building CAD tools for jewelry design. She leverages tools such as 3D printing, laser cutting, electronics, kinetics and parametric code to create unique designs for accessories, home goods and fashion. Inspired by the natural world and the mathematical formulas that underpin it, her work often reflects themes of recursion, geometry, and dichotomy.";
const ANDREW_ROSE_BIO =
  "Andrew Rose, Founder of Fractal, Fractal University, and Fractal Bootcamp — Andrew has trained 100 engineers in the last 2 years, following his career as a software engineer and educator.";
const LIAM_DUFFY_BIO =
  "Liam Duffy, senior software engineer at Seso Inc. — Liam has been a senior software engineer for over 5 years and has been engineering for over a decade. At Seso, he is leading the adoption of AI engineering practices, and now he's bringing that real-world expertise to Fractal Accelerator students.";

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
  await expect(catalog.locator("[data-instructor-bio]")).toHaveCount(20);
  await expect(catalog.locator("[data-instructor-record]")).toHaveCount(23);

  const clubs = page.getByTestId("fractalu-clubs");
  const clubCards = clubs.locator("article[data-club-id]");
  await expect(clubCards).toHaveCount(4);
  await expect(clubs.getByText("Open group", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Clubs & open groups" })).toBeVisible();

  for (const clubId of [
    "controversial-politics-salon",
    "last-summer-lecture-series",
    "founding-debate-reading-group",
    "claude-squad",
  ]) {
    const card = clubs.locator(`article[data-club-id="${clubId}"]`);
    const title = card.locator("h3");
    const metadata = card.locator("[data-club-metadata]");
    const description = card.locator("p").first();
    await expect(metadata.locator("dt")).toHaveText(["Schedule", "Location"]);
    expect(
      await title.evaluate(
        (heading, target) => heading.nextElementSibling === target,
        await metadata.elementHandle(),
      ),
    ).toBe(true);
    expect(
      await metadata.evaluate(
        (details, target) =>
          Boolean(details.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING),
        await description.elementHandle(),
      ),
    ).toBe(true);
    expect(await metadata.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );
    const cardBox = await card.boundingBox();
    const metadataBox = await metadata.boundingBox();
    expect(
      cardBox &&
        metadataBox &&
        metadataBox.x >= cardBox.x &&
        metadataBox.x + metadataBox.width <= cardBox.x + cardBox.width + 1,
    ).toBeTruthy();
  }

  const lastSummer = clubs.locator('article[data-club-id="last-summer-lecture-series"]');
  await expect(lastSummer.locator("dd").nth(0)).toHaveText(
    "Saturdays, time varies — join the WhatsApp for details",
  );
  await expect(lastSummer.locator("dd").nth(1)).toHaveText(
    "Fractal Campus, 111 Conselyea St",
  );
  const claudeSquad = clubs.locator('article[data-club-id="claude-squad"]');
  await expect(claudeSquad.locator("dd").nth(0)).toHaveText(
    "6:30 pm, usually every other Thursday. Join the WhatsApp group for dates.",
  );
  await expect(claudeSquad.locator("dd").nth(1)).toHaveText("Vital Williamsburg");

  const lampCourse = catalog.locator('article[data-course-id="making-a-lamp"]');
  const lampBio = lampCourse.locator("[data-instructor-bio]");
  await expect(lampBio.locator("[data-instructor-record]")).toHaveCount(2);
  await expect(lampBio.locator("[data-instructor-record]").nth(0)).toHaveText(MEL_BRAND_BIO);
  await expect(lampBio.locator("[data-instructor-record]").nth(1)).toHaveText(
    JULIANNE_LEFELHOCZ_BIO,
  );

  const acceleratorCourse = catalog.locator('article[data-course-id="fractal-accelerator"]');
  const acceleratorBio = acceleratorCourse.locator("[data-instructor-bio]");
  await expect(acceleratorBio.locator("[data-instructor-record]")).toHaveCount(2);
  await expect(acceleratorBio.locator("[data-instructor-record]").nth(0)).toHaveText(
    ANDREW_ROSE_BIO,
  );
  await expect(acceleratorBio.locator("[data-instructor-record]").nth(1)).toHaveText(
    LIAM_DUFFY_BIO,
  );

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
    const lampInstructor = lampCourse.getByRole("button", {
      name: "Mel Brand & Julianne Lefelhocz",
    });
    await lampInstructor.focus();
    await expect(lampBio).toHaveCSS("visibility", "visible");
    await lampInstructor.click();
    await expect(lampInstructor).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(lampInstructor).toHaveAttribute("aria-expanded", "false");
    await expect(lampInstructor).toBeFocused();
    await expect(lampBio).toHaveCSS("visibility", "hidden");

    await expect(description).toHaveCSS("visibility", "hidden");
    await titleLink.hover();
    await expect(description).toHaveCSS("visibility", "visible");
    await titleLink.focus();
    await expect(description).toHaveCSS("visibility", "visible");

    const instructor = firstCourse.getByRole("button", { name: "Elena Navarrete" });
    const instructorPreview = firstCourse.locator(".fractalu-instructor-preview");
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

    await page.setViewportSize({ width: 900, height: 900 });
    await expect(catalog).toHaveAttribute("data-preview-mode", "inline");
    await expect(firstCourse.getByRole("button", { name: "Elena Navarrete" })).toHaveCount(0);
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await expect(instructorBio).toHaveCSS("position", "static");
    await expect(instructorBio).toHaveCSS("visibility", "visible");
    await expect(instructorBio).toHaveCSS("opacity", "1");

    await page.setViewportSize({ width, height: profile?.viewport.height ?? 900 });
    await expect(catalog).toHaveAttribute("data-preview-mode", "enhanced");
    const restoredInstructor = firstCourse.getByRole("button", { name: "Elena Navarrete" });
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await restoredInstructor.focus();
    await expect(instructorBio).toHaveCSS("visibility", "visible");

    await restoredInstructor.click();
    await page.keyboard.press("Escape");
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "true");
    await expect(instructorBio).toHaveCSS("visibility", "hidden");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await expect(catalog).toHaveAttribute("data-preview-mode", "inline");
    await expect(firstCourse.getByRole("button", { name: "Elena Navarrete" })).toHaveCount(0);
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await expect(instructorBio).toHaveCSS("position", "static");
    await expect(instructorBio).toHaveCSS("visibility", "visible");
    await expect(instructorBio).toHaveCSS("opacity", "1");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await expect(catalog).toHaveAttribute("data-preview-mode", "enhanced");
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await firstCourse.getByRole("button", { name: "Elena Navarrete" }).focus();
    await expect(instructorBio).toHaveCSS("visibility", "visible");

    await page.mouse.move(0, 0);
    await firstCourse.getByRole("link", { name: /Apply for The Lost Generation/ }).focus();
    await expect(instructorPreview).toHaveAttribute("data-suppressed", "false");
    await instructor.focus();
    await expect(instructorBio).toHaveCSS("visibility", "visible");
  } else {
    await expect(description).toHaveCSS("position", "static");
    await expect(description).toBeVisible();
    await expect(firstCourse.locator("[data-instructor-bio]")).toBeVisible();
    await expect(lampBio).toBeVisible();
    await expect(acceleratorBio).toBeVisible();
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
