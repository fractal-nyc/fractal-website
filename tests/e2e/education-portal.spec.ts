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
  browserName,
}, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  const width = profile?.viewport.width ?? 1440;
  const hasTouch = profile?.hasTouch ?? false;
  const compactDensityTargets = {
    "phone-density-375x812": { maxTop: 852, maxHeight: 660 },
    "phone-390x844": { maxTop: 845, maxHeight: 635 },
    "phone-density-440x956": { maxTop: 956, maxHeight: 585 },
  } as const;
  const densityTarget = profile?.name
    ? compactDensityTargets[profile.name as keyof typeof compactDensityTargets]
    : undefined;
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/education", { waitUntil: "domcontentloaded" });
  await preparePage(page, profile?.rootFontScale);

  await expect(page.getByRole("heading", { level: 1, name: "Fractal University" })).toHaveCount(1);
  await expect(page.getByText("An improvised college in New York City.", { exact: true })).toBeVisible();
  const sectorLetter = page.locator("[data-sector-letter]");
  const sectorName = page.locator("[data-sector-name]");
  await expect(sectorLetter).toHaveCSS("color", "rgb(178, 43, 35)");
  await expect(sectorName).toHaveCSS("color", await page.locator("h1").evaluate((element) => getComputedStyle(element).color));
  const intro = page.locator("[data-education-intro]");
  const portal = page.locator("[data-fractalu-portal]");
  const futureSemestersLink = page.getByRole("link", {
    name: /Stay tuned for future semesters/,
  });
  await expect(futureSemestersLink).toHaveAttribute(
    "href",
    "https://fractaluniversity.substack.com",
  );
  await expect(futureSemestersLink).toHaveAttribute("target", "_blank");
  await expect(futureSemestersLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(futureSemestersLink).toHaveCSS("font-family", /Inter/);
  await expect(futureSemestersLink).not.toHaveClass(/text-body(?:-lead)?|text-label/);
  await expect(futureSemestersLink.locator("..")).toHaveClass(/text-body-lead/);
  expect(
    await futureSemestersLink.evaluate((link) => getComputedStyle(link).fontSize),
  ).toBe(
    await futureSemestersLink.locator("..").evaluate((context) => getComputedStyle(context).fontSize),
  );
  const heroArrow = futureSemestersLink.locator("svg[data-education-outbound-arrow]");
  await expect(heroArrow).toHaveCount(1);
  await expect(heroArrow).toHaveAttribute("aria-hidden", "true");
  await expect(heroArrow).toHaveClass(/lucide-arrow-up-right/);
  const informationJump = page.getByRole("link", { name: "What is FractalU?" });
  await expect(informationJump.locator("[data-education-hero-action-label]")).toHaveCSS(
    "font-family",
    /Inter/,
  );
  await expect(informationJump).not.toHaveClass(/text-body(?:-lead)?|text-label/);
  await expect(informationJump.locator("..")).toHaveClass(/text-body-lead/);
  expect(
    await informationJump.evaluate((link) => getComputedStyle(link).fontSize),
  ).toBe(
    await informationJump.locator("..").evaluate((context) => getComputedStyle(context).fontSize),
  );
  await expect(informationJump).toHaveAttribute("href", "#what-is-fractalu");
  await expect(informationJump).not.toHaveAttribute("data-education-outbound-link");
  const informationArrow = informationJump.locator("svg[data-education-internal-arrow]");
  await expect(informationArrow).toHaveCount(1);
  await expect(informationArrow).toHaveClass(/lucide-arrow-down/);
  await expect(informationJump.locator("svg[data-education-outbound-arrow]")).toHaveCount(0);
  for (const heroLink of [futureSemestersLink, informationJump]) {
    await expect(heroLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(heroLink).toHaveCSS("border-top-width", "0px");
    await expect(heroLink).toHaveCSS("box-shadow", "none");
    expect(
      await heroLink.evaluate((link) => Number.parseFloat(getComputedStyle(link).minHeight)),
    ).toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.locator("[data-education-intro]").evaluate((introElement) => {
      const links = Array.from(
        introElement.querySelectorAll<HTMLAnchorElement>("a"),
      );
      return links.every(
        (link) =>
          link.scrollWidth <= link.clientWidth + 1 &&
          link.getBoundingClientRect().left >= -1 &&
          link.getBoundingClientRect().right <= document.documentElement.clientWidth + 1,
      );
    }),
  ).toBe(true);
  await expect(page.getByRole("link", { name: /Visit Fractal AI Accelerator/ })).toHaveCount(0);
  await expect(portal).toBeVisible();
  expect(
    await intro.evaluate(
      (section, target) => Boolean(section.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING),
      await portal.elementHandle(),
    ),
  ).toBe(true);
  const semesterEyebrow = page.locator("[data-fractalu-semester-eyebrow]");
  const catalogHeading = page.getByRole("heading", { level: 2, name: "Course Catalog" });
  await expect(semesterEyebrow).toHaveText("Summer 2026");
  await expect(catalogHeading).toBeVisible();
  expect(
    await semesterEyebrow.evaluate(
      (eyebrow, heading) =>
        Boolean(eyebrow.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING),
      await catalogHeading.elementHandle(),
    ),
  ).toBe(true);
  await expect(
    page.getByText("Browse and apply to this semester's classes below.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Summer 2026 semester" })).toHaveCount(0);
  const filterEyebrow = page.locator("[data-fractalu-filter-eyebrow]");
  const filterGroup = page.getByRole("group", { name: "Filter classes by subject" });
  const filterScope = page.locator(".fractalu-filter-row");
  await expect(filterEyebrow).toHaveText("Filter classes by subject");
  await expect(filterEyebrow).toBeVisible();
  await expect(filterEyebrow).toHaveClass(/text-label/);
  await expect(filterGroup).toHaveAttribute("aria-labelledby", "fractalu-filter-label");
  await expect(filterScope).toHaveAttribute("data-component-colorway", "education");
  await expect(filterScope).toHaveAttribute("data-component-surface", "deep");
  await expect(filterScope).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(
    await filterEyebrow.evaluate(
      (eyebrow, group) => eyebrow.nextElementSibling === group,
      await filterGroup.elementHandle(),
    ),
  ).toBe(true);
  if (densityTarget) {
    const filterButtons = filterGroup.getByRole("button");
    const groupBox = await filterGroup.boundingBox();
    const buttonBoxes = await filterButtons.evaluateAll((buttons) =>
      buttons.map((button) => {
        const box = button.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
    );
    expect(new Set(buttonBoxes.map(({ y }) => Math.round(y))).size).toBeGreaterThan(1);
    expect(buttonBoxes.every(({ width: buttonWidth, height }) => buttonWidth >= 44 && height >= 44)).toBe(
      true,
    );
    expect(
      groupBox &&
        buttonBoxes.every(
          ({ x, width: buttonWidth }) =>
            x >= groupBox.x - 1 && x + buttonWidth <= groupBox.x + groupBox.width + 1,
        ),
    ).toBeTruthy();
    expect(
      await filterGroup.evaluate(
        (group) =>
          getComputedStyle(group).overflowX === "visible" &&
          group.scrollWidth <= group.clientWidth + 1,
      ),
    ).toBe(true);
  }
  await expect(page.locator("iframe, table, details, summary")).toHaveCount(0);
  await expect(page.locator('[data-fractalu-reveal-group="catalog-heading"]')).toHaveCSS(
    "border-bottom-width",
    "1px",
  );
  await expect(page.locator("[data-fractalu-filter-block]")).toHaveCSS(
    "border-bottom-width",
    "0px",
  );

  const catalog = page.getByTestId("fractalu-course-catalog");
  await expect(catalog).toBeVisible();
  await expect(catalog.locator("article")).toHaveCount(20);
  const initialCourseRevealSlots = catalog.locator('[data-fractalu-reveal-slot="course"]');
  await expect(initialCourseRevealSlots).toHaveCount(20);
  await expect(initialCourseRevealSlots.first()).toHaveAttribute(
    "data-fractalu-reveal-delay",
    "0.00",
  );
  await expect(initialCourseRevealSlots.nth(5)).toHaveAttribute(
    "data-fractalu-reveal-delay",
    "0.30",
  );
  await expect(initialCourseRevealSlots.last()).toHaveAttribute(
    "data-fractalu-reveal-delay",
    "0.30",
  );
  await expect(initialCourseRevealSlots.first()).toHaveAttribute(
    "data-fractalu-reveal-mode",
    "animated",
  );
  await expect(page.locator("[data-course-collection]")).toHaveCount(1);
  await expect(catalog.locator("[data-instructor-bio]")).toHaveCount(20);
  await expect(catalog.locator("[data-instructor-record]")).toHaveCount(23);
  const outboundLinks = page.locator("[data-education-outbound-link]");
  await expect(outboundLinks).toHaveCount(52);
  await expect(outboundLinks.locator("svg[data-education-outbound-arrow]")).toHaveCount(52);
  expect(
    await outboundLinks.evaluateAll((links) =>
      links.every(
        (link) =>
          !link.textContent?.includes("→") &&
          !link.getAttribute("aria-label")?.includes("→") &&
          (() => {
            const arrows = link.querySelectorAll(
              "svg[data-education-outbound-arrow][aria-hidden='true']",
            );
            return (
              arrows.length === 1 &&
              arrows[0].classList.contains("lucide-arrow-up-right")
            );
          })(),
      ),
    ),
  ).toBe(true);
  expect(
    await outboundLinks.evaluateAll((links) =>
      links.every((link) => link.scrollWidth <= link.clientWidth + 1),
    ),
  ).toBe(true);

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
  const allFilter = page.getByRole("button", { name: "All" });
  const selectedFilterStyles = await allFilter.evaluate((button) => ({
    background: getComputedStyle(button).backgroundColor,
    color: getComputedStyle(button).color,
    borderColor: getComputedStyle(button).borderColor,
    borderWidth: getComputedStyle(button).borderWidth,
  }));
  const restingFilterStyles = await technology.evaluate((button) => ({
    background: getComputedStyle(button).backgroundColor,
    color: getComputedStyle(button).color,
    borderColor: getComputedStyle(button).borderColor,
    borderWidth: getComputedStyle(button).borderWidth,
  }));
  expect(selectedFilterStyles.background).toBe("rgb(178, 43, 35)");
  expect(selectedFilterStyles.color).toBe(await filterScope.evaluate((scope) => getComputedStyle(scope).color));
  expect(selectedFilterStyles.borderColor).toBe(selectedFilterStyles.background);
  expect(selectedFilterStyles.borderWidth).toBe("1px");
  expect(restingFilterStyles.background).not.toBe(selectedFilterStyles.background);
  expect(restingFilterStyles.color).not.toBe(selectedFilterStyles.color);
  expect(restingFilterStyles.borderColor).not.toBe(selectedFilterStyles.borderColor);
  expect(restingFilterStyles.borderWidth).toBe("1px");
  expect(
    await technology.evaluate((button) => Number.parseFloat(getComputedStyle(button).minHeight)),
  ).toBeGreaterThanOrEqual(44);
  if (!hasTouch) {
    await technology.hover();
    await expect(technology).toHaveCSS("background-color", restingFilterStyles.background);
    await expect(technology).not.toHaveCSS("color", restingFilterStyles.color);
    await expect(technology).toHaveCSS("border-color", selectedFilterStyles.borderColor);
    await page.mouse.move(0, 0);
    const filters = filterGroup.getByRole("button");
    const filterNames = await filters.allTextContents();
    const technologyIndex = filterNames.indexOf("Technology");
    expect(technologyIndex).toBeGreaterThan(0);
    await filters.nth(technologyIndex - 1).focus();
    await page.keyboard.press("Tab");
    await expect(technology).toBeFocused();
    await expect(technology).toHaveCSS("background-color", restingFilterStyles.background);
    await expect(technology).not.toHaveCSS("color", restingFilterStyles.color);
    await expect(technology).toHaveCSS("border-color", selectedFilterStyles.borderColor);
    expect(await technology.evaluate((button) => getComputedStyle(button).boxShadow)).not.toBe(
      "none",
    );
  }
  await technology.click();
  await expect(technology).toHaveAttribute("aria-pressed", "true");
  await expect(technology).toHaveCSS("background-color", selectedFilterStyles.background);
  await expect(technology).toHaveCSS("color", selectedFilterStyles.color);
  await expect(technology).toHaveCSS("border-color", selectedFilterStyles.borderColor);
  await expect(allFilter).toHaveCSS("background-color", restingFilterStyles.background);
  await expect(allFilter).toHaveCSS("color", restingFilterStyles.color);
  await expect(allFilter).toHaveCSS("border-color", restingFilterStyles.borderColor);
  await expect(page.getByText("3 courses shown.")).toHaveText("3 courses shown.");
  await expect(catalog.locator("article")).toHaveCount(3);
  await expect(catalog.locator('[data-fractalu-reveal-slot="course"]')).toHaveCount(3);
  await expect(
    catalog.locator('[data-fractalu-reveal-slot="course"][data-fractalu-reveal-mode="static"]'),
  ).toHaveCount(3);
  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText("20 courses shown.")).toHaveText("20 courses shown.");
  await expect(catalog.locator("article")).toHaveCount(20);
  await expect(
    catalog.locator('[data-fractalu-reveal-slot="course"][data-fractalu-reveal-mode="static"]'),
  ).toHaveCount(20);

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
  const titleArrow = titleLink.locator("[data-course-external-icon]");
  await expect(titleArrow).toHaveCount(1);
  await expect(catalog.locator('article[data-course-id="butoh-into-the-depth"] [data-course-external-icon]')).toHaveCount(0);
  const instructorName = firstCourse.locator("[data-instructor-name]");
  const instructorBio = firstCourse.locator("[data-instructor-bio]");
  const facts = firstCourse.locator("[data-course-facts]");
  await expect(instructorName).toBeVisible();
  await expect(facts.locator("dt")).toHaveText(["Schedule", "Dates", "Location", "Price"]);

  if (width < 768) {
    await expect(instructorBio).toBeHidden();
    await expect(description).toBeVisible();
    expect(
      await instructorName.evaluate(
        (name, summary) =>
          Boolean(name.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING),
        await description.elementHandle(),
      ),
    ).toBe(true);

    const factBoxes = await facts.locator(":scope > div").evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { x: Math.round(box.x), y: Math.round(box.y) };
      }),
    );
    expect(new Set(factBoxes.map(({ x }) => x)).size).toBe(2);
    expect(new Set(factBoxes.map(({ y }) => y)).size).toBe(2);

    for (const courseId of [
      "lost-generation-close-reading",
      "worldbuilding-for-storytellers",
      "making-a-lamp",
      "fractal-accelerator",
    ]) {
      const compactCard = catalog.locator(`article[data-course-id="${courseId}"]`);
      await expect(compactCard.locator("[data-course-description]")).toBeVisible();
      await expect(compactCard.locator("[data-instructor-name]")).toBeVisible();
      await expect(compactCard.locator("[data-instructor-bio]")).toBeHidden();
      await expect(compactCard.locator("[data-course-facts] dt")).toHaveCount(4);
      const action = compactCard.locator("[data-education-outbound-link]").last();
      expect(
        await action.evaluate((link) => Number.parseFloat(getComputedStyle(link).minHeight)),
      ).toBeGreaterThanOrEqual(44);
    }

    if (densityTarget) {
      const cardBox = await firstCourse.boundingBox();
      expect(cardBox).not.toBeNull();
      expect(cardBox!.y).toBeLessThanOrEqual(densityTarget.maxTop + 1);
      expect(cardBox!.height).toBeLessThanOrEqual(densityTarget.maxHeight);
    }
  }

  if (!hasTouch && width >= 1024 && !profile?.rootFontScale) {
    await expect(titleArrow).toHaveCSS("opacity", "0");
    await firstCourse.locator("dl").hover();
    await expect(titleArrow).toHaveCSS("opacity", "0");
    await expect(firstCourse).toHaveCSS("transform", /matrix\(1\.02/);
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
    await expect(titleArrow).toHaveCSS("opacity", "1");

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

    if (profile?.name === "desktop-1440x900") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await firstCourse.hover();
      await expect(firstCourse).toHaveCSS("transform", "none");
      await expect(titleArrow).toHaveCSS("transform", "none");
      await expect(firstCourse).toHaveCSS(
        "border-color",
        "rgb(178, 43, 35)",
      );
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
  } else {
    await expect(titleArrow).toHaveCSS("opacity", "1");
    await expect(description).toHaveCSS("position", "static");
    await expect(description).toBeVisible();
    if (width < 768) {
      await expect(firstCourse.locator("[data-instructor-bio]")).toBeHidden();
      await expect(lampBio).toBeHidden();
      await expect(acceleratorBio).toBeHidden();
    } else {
      await expect(firstCourse.locator("[data-instructor-bio]")).toBeVisible();
      await expect(lampBio).toBeVisible();
      await expect(acceleratorBio).toBeVisible();
    }
  }

  const jumpLink = page.getByRole("link", { name: "What is FractalU?" });
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
    await expect(page.locator("[data-fractalu-catalog-frame]")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
  }

  if (profile?.name === "boundary-1024x768") {
    for (const boundaryWidth of [767, 768, 769, 1023, 1024, 1025]) {
      await page.setViewportSize({ width: boundaryWidth, height: 900 });
      await expect(catalog).toBeVisible();
      await expect(clubs).toBeVisible();
      if (boundaryWidth < 768) {
        await expect(firstCourse.locator("[data-instructor-bio]")).toBeHidden();
      } else if (boundaryWidth < 1024) {
        await expect(firstCourse.locator("[data-instructor-bio]")).toBeVisible();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(
        await page.evaluate(() => document.documentElement.clientWidth + 1),
      );
    }

    await page.setViewportSize({
      width,
      height: profile?.viewport.height ?? 768,
    });
  }

  const canon = page.locator('section[aria-labelledby="fractalu-canon-title"]');
  await expect(canon).toBeVisible();
  const resourceGroup = page.locator("[data-fractalu-resource-links]");
  const resourceLinks = resourceGroup.locator("[data-fractalu-resource-link]");
  await expect(resourceLinks).toHaveCount(3);
  const resourceFontSizes = await resourceLinks.evaluateAll((links) =>
    links.map((link) => getComputedStyle(link).fontSize),
  );
  expect(new Set(resourceFontSizes).size).toBe(1);
  for (const link of await resourceLinks.all()) {
    await expect(link).toHaveCSS("font-family", /JetBrains Mono/);
    await expect(link).toHaveCSS("text-transform", "uppercase");
    expect(
      await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).minHeight)),
    ).toBeGreaterThanOrEqual(44);
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("outline-style", "none");
  }
  const canonLink = resourceGroup.getByRole("link", {
    name: "Read the FractalU canon PDF (opens in a new tab)",
  });
  await expect(canonLink).toHaveAttribute("href", "https://ajr.fyi/files/fractal-canon.pdf");
  await expect(canonLink.locator("svg[data-education-outbound-arrow]")).toHaveCount(1);
  const substackLink = resourceGroup.getByRole("link", {
    name: "FractalU Substack (opens in a new tab)",
  });
  await expect(substackLink).toHaveAttribute("href", "https://fractaluniversity.substack.com");
  await expect(substackLink.locator("svg[data-education-outbound-arrow]")).toHaveCount(1);
  const resourceEmail = resourceGroup.getByRole("link", {
    name: "fractalu@fractalnyc.com",
  });
  await expect(resourceEmail).toHaveAttribute("href", "mailto:fractalu@fractalnyc.com");
  await expect(resourceEmail).not.toHaveAttribute("target");
  await expect(resourceEmail).not.toHaveAttribute("aria-label");
  await expect(resourceEmail.locator("svg[data-education-outbound-arrow]")).toHaveCount(1);
  await expect(page.locator("[data-fractalu-final-collage], [data-testid='fractalu-collage']")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Fractal University in community" })).toHaveCount(0);

  if (browserName === "chromium") {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    const usesDesktopPennants = width >= 768;
    const educationShell = page.getByTestId(
      usesDesktopPennants ? "education-desktop-pennants" : "education-mobile-pennants",
    );
    const educationSlots = educationShell.locator(":scope > div");
    const educationLeftSlot = educationSlots.first();
    const educationRightSlot = educationSlots.last();
    const educationClasses = await educationShell.getAttribute("class");
    const educationShellBox = await educationShell.boundingBox();
    const educationLeftBox = await educationLeftSlot.boundingBox();
    const educationRightBox = await educationRightSlot.boundingBox();

    await page.goto("/library", { waitUntil: "domcontentloaded" });
    await preparePage(page, profile?.rootFontScale);
    const libraryShell = page.getByTestId(
      usesDesktopPennants ? "library-desktop-pennants" : "library-mobile-pennants",
    );
    const librarySlot = libraryShell.locator(":scope > div").first();
    expect(await libraryShell.getAttribute("class")).toBe(educationClasses);
    const libraryShellBox = await libraryShell.boundingBox();
    const librarySlotBox = await librarySlot.boundingBox();
    expect(libraryShellBox?.width).toBeCloseTo(educationShellBox?.width ?? 0, 4);
    if (usesDesktopPennants) {
      expect(libraryShellBox?.height).toBeCloseTo(educationShellBox?.height ?? 0, 4);
    }

    expect(educationLeftBox).not.toBeNull();
    expect(educationRightBox).not.toBeNull();
    expect(librarySlotBox).not.toBeNull();
    const widthRatio = educationLeftBox!.width / librarySlotBox!.width;
    const heightRatio = educationLeftBox!.height / librarySlotBox!.height;
    expect(widthRatio).toBeGreaterThanOrEqual(0.89);
    expect(widthRatio).toBeLessThanOrEqual(0.91);
    expect(heightRatio).toBeGreaterThanOrEqual(0.89);
    expect(heightRatio).toBeLessThanOrEqual(0.91);

    expect(educationRightBox!.width).toBeCloseTo(educationLeftBox!.width, 4);
    expect(educationRightBox!.height).toBeCloseTo(educationLeftBox!.height, 4);
    expect(educationRightBox!.y).toBeCloseTo(educationLeftBox!.y, 4);

    if (usesDesktopPennants) {
      expect(educationLeftBox!.x).toBeCloseTo(educationShellBox!.x, 4);
      expect(educationRightBox!.x + educationRightBox!.width).toBeCloseTo(
        educationShellBox!.x + educationShellBox!.width,
        4,
      );
    } else {
      const educationPairMidpoint =
        (educationLeftBox!.x + educationRightBox!.x + educationRightBox!.width) / 2;
      const educationShellMidpoint = educationShellBox!.x + educationShellBox!.width / 2;
      expect(educationPairMidpoint).toBeCloseTo(educationShellMidpoint, 4);
    }

    if (profile?.name === "desktop-1440x900") {
      expect(libraryShellBox).toEqual(educationShellBox);
      expect(educationShellBox).toMatchObject({ x: 64, y: 144, height: 648 });
      expect(educationLeftBox).toMatchObject({ x: 64, y: 144 });
      expect(educationLeftBox?.width).toBeCloseTo(189, 0);
      expect(educationLeftBox?.height).toBeCloseTo(583.2, 1);
    }
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth + 1),
  );
  expect(pageErrors).toEqual([]);
});

test("Education reveal groups settle once and respect reduced motion", async ({
  page,
}, testInfo) => {
  const profile = testInfo.project.metadata.profile as ResponsiveProfile | undefined;
  test.skip(
    !["desktop-1440x900", "phone-reduced-motion"].includes(profile?.name ?? ""),
    "Focused motion probe runs in one no-preference and one reduced-motion profile.",
  );

  await page.emulateMedia({
    reducedMotion: profile?.reducedMotion === "reduce" ? "reduce" : "no-preference",
  });
  await page.goto("/education", { waitUntil: "domcontentloaded" });
  await preparePage(page, profile?.rootFontScale);
  expect(
    await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
  ).toBe(profile?.reducedMotion === "reduce");

  const about = page.locator('[data-fractalu-information-reveal="about"]');
  const revealWrapper = about.locator("xpath=..");
  const initialSize = await revealWrapper.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  });

  if (profile?.reducedMotion === "reduce") {
    await expect(revealWrapper).toHaveCSS("opacity", "1");
    await expect(revealWrapper).toHaveCSS("transform", "none");
  } else {
    await expect(revealWrapper).toHaveCSS("opacity", "0");
    expect(await revealWrapper.evaluate((element) => getComputedStyle(element).transform)).not.toBe(
      "none",
    );
    await about.scrollIntoViewIfNeeded();
    await expect(revealWrapper).toHaveCSS("opacity", "1");
    await expect(revealWrapper).toHaveCSS("transform", "none");

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    await about.scrollIntoViewIfNeeded();
    await expect(revealWrapper).toHaveCSS("opacity", "1");
    await expect(revealWrapper).toHaveCSS("transform", "none");
  }

  const settledSize = await revealWrapper.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  });
  expect(settledSize.width).toBeCloseTo(initialSize.width, 0);
  expect(settledSize.height).toBeCloseTo(initialSize.height, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth + 1),
  );
});
