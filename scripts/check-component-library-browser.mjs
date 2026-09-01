import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4174";
const productionOrigin = "http://127.0.0.1:4175";
const componentUrl = `${origin}/components/`;
const catalogServer = spawn("pnpm", ["exec", "vite", "preview", "--config", "vite.components.config.ts", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
const productionServer = spawn("pnpm", ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", "4175", "--strictPort"], { stdio: "ignore" });

const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const columns = (page) => page.locator(".library-gallery-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
const loadedImages = async (locator, label) => {
  const images = await locator.evaluateAll((nodes) => nodes.map((node) => ({ src: node.currentSrc || node.src, width: node.naturalWidth, height: node.naturalHeight })));
  assert(images.length > 0, `${label} rendered no images.`);
  assert(images.every(({ width, height }) => width > 0 && height > 0), `${label} has unloaded images: ${JSON.stringify(images)}.`);
};
const waitForServer = async (url, label) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* preview is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  fail(`${label} preview did not start.`);
};

try {
  await Promise.all([waitForServer(componentUrl, "Component"), waitForServer(productionOrigin, "Production")]);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  const page = await context.newPage();
  const browserErrors = [];
  const failedAssets = [];
  page.on("pageerror", (error) => browserErrors.push(error.stack ?? error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(componentUrl, { waitUntil: "networkidle" });
  const expectedCategories = ["Common components", "Cards & boxes", "Buttons & links", "Forms & filters", "Images & media", "All components"];
  assert(JSON.stringify(await page.locator(".library-category-chooser button span:first-child").allTextContents()) === JSON.stringify(expectedCategories), "Public category labels changed.");
  const categoryCounts = await page.locator(".library-category-chooser button span:last-child").allTextContents();
  assert(JSON.stringify(categoryCounts) === JSON.stringify(["9", "6", "4", "2", "3", "15"]), `Unexpected category counts: ${categoryCounts.join(", ")}.`);

  const expectedByCategory = {
    common: ["Primary Button", "Standalone Link", "Outbound Text Link", "Inline Text Link", "Article Card", "Note Box", "Course Card", "Club Card", "Highlight Box"],
    cards: ["Article Card", "Note Box", "Course Card", "Club Card", "Highlight Box", "Editorial Quote"],
    actions: ["Primary Button", "Standalone Link", "Outbound Text Link", "Inline Text Link"],
    forms: ["Search Bar", "Filter Bar"],
    media: ["Photo Gallery", "House Pennants", "Photo Carousel"],
  };
  for (const [category, expected] of Object.entries(expectedByCategory)) {
    await page.goto(`${componentUrl}#browse/${category}`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    const names = await page.locator(".library-component-name").allTextContents();
    assert(JSON.stringify(names) === JSON.stringify(expected), `${category} choices are ${names.join(", ")}.`);
    const cards = await page.locator(".library-visual-card").evaluateAll((nodes) => nodes.map((card) => ({
      children: card.children.length,
      preview: card.firstElementChild?.classList.contains("library-gallery-preview"),
      names: card.querySelectorAll(".library-component-name").length,
      copies: card.querySelectorAll(".library-copy-prompt").length,
    })));
    assert(cards.every(({ children, preview, names: nameCount, copies }) => children === 2 && preview && nameCount === 1 && copies === 1), `${category} has a non-minimal tile.`);
    await page.screenshot({ path: `/tmp/frac124-${category}-1440x900.png` });
  }

  await page.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
  assert((await page.locator('.library-gallery-heading [role="status"]').innerText()).trim() === "9 components shown", "Common count announcement is wrong.");
  assert(await columns(page) === 3, "Desktop gallery must have three columns.");
  const activeChrome = await page.locator(".library-category-chooser button[aria-pressed='true']").evaluate((button) => {
    const style = getComputedStyle(button);
    const root = getComputedStyle(document.documentElement);
    const resolvedColor = (value) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    return { background: style.backgroundColor, foreground: resolvedColor(root.getPropertyValue("--color-foreground")), libraryPink: resolvedColor(root.getPropertyValue("--color-house-library-deep")) };
  });
  assert(activeChrome.background !== activeChrome.libraryPink && activeChrome.background === activeChrome.foreground, `Catalog selection is not monochrome: ${JSON.stringify(activeChrome)}.`);
  const firstCategory = page.locator(".library-category-chooser button").first();
  await firstCategory.focus();
  assert(await firstCategory.evaluate((button) => getComputedStyle(button).outlineColor) === activeChrome.foreground, "Catalog focus is not monochrome.");
  await page.screenshot({ path: "/tmp/frac124-common-1440x900.png" });

  const search = page.getByRole("searchbox", { name: "Search components" });
  for (const [query, expected] of [
    ["homepage search", "Search Bar"], ["archive search field", "Search Bar"], ["course subject filter", "Filter Bar"],
    ["campus highlight", "Highlight Box"], ["outsource link", "Standalone Link"], ["inter outbound link", "Outbound Text Link"],
  ]) {
    await search.fill(query);
    assert(await page.getByRole("button", { name: `View details for ${expected}`, exact: true }).count() === 1, `${query} did not resolve to ${expected}.`);
  }
  await search.fill("");
  await page.getByRole("button", { name: "Copy prompt for Primary Button" }).click();
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes("Inherit the target page or section’s approved house/section color tokens"), "Copy Prompt lost token inheritance guidance.");

  await page.goto(`${componentUrl}#browse/actions`, { waitUntil: "networkidle" });
  const linkRoles = await page.evaluate(() => {
    const read = (id) => {
      const link = document.querySelector(`#${id} .library-gallery-preview a[data-outbound-link]`);
      return { font: link ? getComputedStyle(link).fontFamily : "", size: link ? Number.parseFloat(getComputedStyle(link).fontSize) : 0, arrows: link?.querySelectorAll("[data-outbound-arrow]").length ?? 0, height: link?.getBoundingClientRect().height ?? 0 };
    };
    return { standalone: read("outbound-link"), outbound: read("outbound-text-link"), inline: read("inline-text-link") };
  });
  assert(linkRoles.standalone.arrows === 1 && linkRoles.standalone.height >= 44, `Standalone Link role is wrong: ${JSON.stringify(linkRoles)}.`);
  assert(linkRoles.outbound.arrows === 1 && linkRoles.inline.arrows === 0, `Outbound/Inline arrow roles are wrong: ${JSON.stringify(linkRoles)}.`);
  assert(linkRoles.outbound.font === linkRoles.inline.font && linkRoles.standalone.font !== linkRoles.inline.font, `Link font roles are wrong: ${JSON.stringify(linkRoles)}.`);
  assert(Math.abs(linkRoles.outbound.size - linkRoles.inline.size) < 0.1, `Outbound and Inline chooser sizes differ: ${JSON.stringify(linkRoles)}.`);

  for (const [id, arrowCount] of [["outbound-text-link", 1], ["inline-text-link", 0]]) {
    await page.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    const link = page.locator(".library-detail-preview a[data-outbound-link]");
    const context = page.locator(".library-detail-preview [data-text-link-context]");
    const readSize = () => link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    assert(await readSize() === 16, `${id} did not inherit the 16px body context.`);
    assert(await link.locator("[data-outbound-arrow]").count() === arrowCount, `${id} has the wrong arrow count.`);
    assert(!(await link.getAttribute("class")).match(/(?:^|\s)text-(?:body|body-lead|label)(?:\s|$)/), `${id} owns a text-size role instead of inheriting it.`);
    if (id === "inline-text-link") await page.getByLabel("Linked words").fill("crystal@fractalnyc.com");
    await page.getByLabel("Example text context").selectOption("lead");
    assert(await readSize() === 18, `${id} did not inherit the 18px lead context.`);
    assert(await context.getAttribute("data-text-link-context") === "lead", `${id} did not switch its preview context.`);
    if (id === "inline-text-link") assert((await context.textContent()).includes("crystal@fractalnyc.com"), "Inline lead preview did not use the production Campus Crystal example.");
    await page.screenshot({ path: `/tmp/frac124-${id}-lead-1440x900.png` });
    await page.getByLabel("Example text context").selectOption("body");
    await page.screenshot({ path: `/tmp/frac124-${id}-body-1440x900.png` });
  }

  for (const legacyView of ["component", "preview"]) {
    await page.goto(`${componentUrl}#${legacyView}/prominent-text-link`, { waitUntil: "networkidle" });
    await page.waitForFunction((expected) => window.location.hash === expected, `#${legacyView}/outbound-text-link`);
    assert(new URL(page.url()).hash === `#${legacyView}/outbound-text-link`, `Legacy ${legacyView} hash did not canonicalize.`);
    assert(await page.getByRole("heading", { name: "Outbound Text Link" }).count() === 1, `Legacy ${legacyView} hash did not render Outbound Text Link.`);
  }

  await page.goto(`${componentUrl}#component/note-callout`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  assert(await page.getByLabel("Actions").count() === 0 && await page.locator(".library-detail-preview button").count() === 0, "Note Box still exposes an action slot.");
  assert(await page.locator(".library-detail-preview p a[data-outbound-link]").count() === 1 && await page.locator(".library-detail-preview [data-outbound-arrow]").count() === 0, "Note Box does not use an inline prose link.");
  await page.getByLabel("Site color").selectOption("campus");
  const themedAccent = await page.locator(".library-detail-preview .library-canvas-scope").evaluate((element) => getComputedStyle(element).getPropertyValue("--component-accent"));
  await page.getByLabel("Site color").selectOption("education");
  const secondAccent = await page.locator(".library-detail-preview .library-canvas-scope").evaluate((element) => getComputedStyle(element).getPropertyValue("--component-accent"));
  assert(themedAccent && secondAccent && themedAccent !== secondAccent, "Themed specimens no longer change token pairings.");

  await page.goto(`${componentUrl}#component/library-article-card`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  const articleBylineFont = await page.locator(".library-detail-preview [data-document-byline]").evaluate((element) => getComputedStyle(element).fontFamily);
  assert(articleBylineFont.includes("Inter"), `Article Card byline is not Inter: ${articleBylineFont}.`);
  const articleBylineStyle = await page.locator(".library-detail-preview [data-document-byline]").evaluate((element) => ({ style: getComputedStyle(element).fontStyle, classes: element.className }));
  assert(articleBylineStyle.style === "normal" && articleBylineStyle.classes.includes("text-body") && !articleBylineStyle.classes.includes("text-aside"), `Article Card byline is not upright body Inter: ${JSON.stringify(articleBylineStyle)}.`);
  assert(await page.locator(".library-detail-preview [data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() === 1, "Article Card lost its decorative shared category icon.");
  await page.screenshot({ path: "/tmp/frac124-component-article-1440x900.png" });

  await page.goto(`${componentUrl}#component/course-card`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  const courseInstructorFont = await page.locator(".library-detail-preview [data-instructor-name]").evaluate((element) => getComputedStyle(element).fontFamily);
  assert(courseInstructorFont.includes("Inter"), `Course Card instructor is not Inter: ${courseInstructorFont}.`);
  assert(await page.locator(".library-detail-preview [data-instructor-name].text-body").count() === 1, "Course Card lost its text-body instructor role.");
  const courseSubject = page.getByLabel("Subject and icon");
  for (const [subject, key] of [["Literature", "book-open"], ["Technology", "cpu"], ["Experimental category", "shapes"]]) {
    await courseSubject.selectOption(subject);
    const lockup = page.locator(".library-detail-preview [data-category-icon-label]");
    assert(await lockup.getAttribute("data-category-icon-key") === key, `${subject} did not resolve to ${key}.`);
    assert((await lockup.locator("span:last-child").textContent()).trim() === subject, `${subject} did not preserve its visible label.`);
  }
  assert(await page.getByLabel(/icon name/i).count() === 0, "Course Card exposes a manual icon-name control.");
  await page.screenshot({ path: "/tmp/frac124-component-course-1440x900.png" });

  await page.goto(`${componentUrl}#component/search-bar`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Search Fractal" }).waitFor();
  assert(await page.getByRole("combobox", { name: "Search Fractal" }).count() === 1, "Search Bar site mode is not the real combobox.");
  await page.screenshot({ path: "/tmp/frac124-search-site-1440x900.png" });
  const catalogHash = new URL(page.url()).hash;
  const siteSearch = page.getByRole("combobox", { name: "Search Fractal" });
  await siteSearch.fill("Campus");
  const siteClear = page.getByRole("button", { name: "Clear search" });
  const siteClearRest = await siteClear.evaluate((button) => getComputedStyle(button).backgroundColor);
  await siteClear.hover();
  await page.waitForTimeout(200);
  const siteClearHover = await siteClear.evaluate((button) => ({ background: getComputedStyle(button).backgroundColor, iconScale: getComputedStyle(button.querySelector("svg")).scale }));
  assert(siteClearHover.background !== siteClearRest && !["none", "1"].includes(siteClearHover.iconScale), `Home-mode clear hover is not reactive: ${JSON.stringify(siteClearHover)}.`);
  await siteClear.click();
  await page.waitForFunction((input) => input.value === "" && document.activeElement === input, await siteSearch.elementHandle());
  await siteSearch.fill("Campus");
  await siteSearch.press("ArrowDown");
  assert(Boolean(await siteSearch.getAttribute("aria-activedescendant")), "Catalog site search lost keyboard result focus.");
  await siteSearch.press("Enter");
  assert(new URL(page.url()).hash === catalogHash, "Catalog site search navigated away.");
  await page.getByLabel("Search behavior").selectOption("collection");
  const collectionSearch = page.getByRole("searchbox", { name: "Search this collection" });
  assert(await collectionSearch.getAttribute("type") === "text", "Collection search reintroduced a native cancel control.");
  await collectionSearch.fill("community");
  const collectionClear = page.getByRole("button", { name: "Clear search" });
  assert(await collectionClear.count() === 1, "Collection Search Bar does not have exactly one clear control.");
  const collectionRest = await collectionClear.evaluate((button) => getComputedStyle(button).backgroundColor);
  await collectionClear.hover();
  await page.waitForTimeout(200);
  const collectionHover = await collectionClear.evaluate((button) => ({ background: getComputedStyle(button).backgroundColor, color: getComputedStyle(button).color, iconScale: getComputedStyle(button.querySelector("svg")).scale }));
  assert(collectionHover.background !== collectionRest && !["none", "1"].includes(collectionHover.iconScale), `Collection clear hover is not reactive: ${JSON.stringify(collectionHover)}.`);
  await page.screenshot({ path: "/tmp/frac125-catalog-search-hover-1440x900.png" });
  await collectionClear.focus();
  await page.waitForTimeout(200);
  assert(await collectionClear.evaluate((button) => getComputedStyle(button).backgroundColor) !== collectionRest, "Collection clear keyboard focus has no surface response.");
  await collectionClear.click();
  await page.waitForFunction((input) => input.value === "" && document.activeElement === input, await collectionSearch.elementHandle());

  await page.goto(`${componentUrl}#component/filter-bar`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-filter-mode='single']").waitFor();
  assert(await page.locator("[data-filter-mode='single']").count() === 1, "Filter Bar did not start in single-select mode.");
  assert(await page.getByLabel("Site color").inputValue() === "education" && await page.getByLabel("Background").inputValue() === "deep", "Filter Bar does not default to Education/deep context.");
  const expectedEducationCategories = ["All", "Literature", "Writing", "Movement", "Music", "Technology", "Craft", "Nature", "Mind & Body"];
  const singleChips = page.locator("[data-filter-bar] button");
  assert(JSON.stringify(await singleChips.allTextContents()) === JSON.stringify(expectedEducationCategories), `Filter Bar does not show the live Education categories: ${(await singleChips.allTextContents()).join(", ")}.`);
  assert(await singleChips.evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().height >= 44 && button.getBoundingClientRect().width >= 44)), "Filter chips are smaller than 44px.");
  assert((await page.locator("[data-filter-bar]").textContent()).includes("20 courses shown."), "Education specimen has the wrong initial result count.");
  const catalogTechnology = page.getByRole("button", { name: "Technology", exact: true });
  await catalogTechnology.click();
  await page.waitForTimeout(250);
  assert(await catalogTechnology.getAttribute("aria-pressed") === "true" && await page.locator("[data-filter-bar] button[aria-pressed='true']").count() === 1, "Education specimen is not single-select.");
  assert((await page.locator("[data-filter-bar]").textContent()).includes("3 courses shown."), "Education specimen has the wrong Technology count.");
  await page.screenshot({ path: "/tmp/frac125-catalog-filter-1440x900.png" });
  await page.getByLabel("Selection behavior").selectOption("multiple");
  const multiChips = page.locator("[data-filter-bar] button");
  await multiChips.nth(1).click();
  assert(await page.locator("[data-filter-bar] button[aria-pressed='true']").count() === 2, "Multi-select Filter Bar did not retain two selections.");
  assert((await multiChips.nth(1).getAttribute("aria-label"))?.includes("results"), "Multi-select chips lost counts.");
  assert((await page.getByLabel("Selection behavior").locator("option:checked").textContent()).includes("Optional Library"), "Multi-select behavior is not identified as optional Library behavior.");

  await page.goto(`${componentUrl}#browse/media`, { waitUntil: "networkidle" });
  await page.locator("#photo-gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#photo-gallery img")].every((image) => image.complete && image.naturalWidth > 0));
  await loadedImages(page.locator("#photo-gallery img"), "Photo Gallery");
  assert(await page.locator("#photo-gallery .library-photo-gallery-stage").count() === 1, "Photo Gallery is not the real bounded component.");
  await page.locator("#campus-banner").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#campus-banner img.painted-relic-banner__art")].every((image) => image.complete && image.naturalWidth > 0));
  await loadedImages(page.locator("#campus-banner img.painted-relic-banner__art"), "House Pennants");
  assert(await page.locator("#campus-banner [data-banner-material='painted-relic']").count() === 6, "House Pennants lost a house.");
  const carousel = page.locator("#meet-space-carousel");
  await carousel.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("#meet-space-carousel img")].some((image) => image.complete && image.naturalWidth > 0));
  assert(await carousel.locator("img").evaluateAll((images) => images.filter((image) => image.naturalWidth > 0).length) >= 1, "Photo Carousel has no loaded active image.");
  await carousel.getByRole("button", { name: "Next photo" }).click();
  await carousel.getByText("02 / 03").waitFor();

  for (const id of ["content-card", "course-fact-grid", "empty-results-message", "membership-button-group", "embed-frame", "mandelbrot-corner-frame", "fade-in", "category-icon-label"]) {
    await page.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    assert(await page.getByText("Internal reference", { exact: true }).count() === 1 && await page.getByRole("button", { name: /Copy prompt/ }).count() === 0, `${id} is publicly copyable.`);
  }

  const matrix = [[320, 1], [375, 1], [767, 1], [769, 2], [1023, 2], [1025, 3], [1180, 3], [1440, 3]];
  for (const [width, expectedColumns] of matrix) {
    const matrixPage = await context.newPage();
    await matrixPage.setViewportSize({ width, height: width <= 375 ? 812 : 900 });
    await matrixPage.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
    assert(await overflow(matrixPage) <= 1, `Catalog overflows at ${width}px.`);
    assert(await columns(matrixPage) === expectedColumns, `${width}px gallery has the wrong column count.`);
    if (width === 375) await matrixPage.screenshot({ path: "/tmp/frac124-common-375x812.png" });
    await matrixPage.close();
  }
  for (const category of ["actions", "forms", "cards", "media"]) {
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${componentUrl}#browse/${category}`, { waitUntil: "networkidle" });
    assert(await overflow(mobile) <= 1, `${category} overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac124-${category}-375x812.png` });
    await mobile.close();
  }
  for (const id of ["outbound-text-link", "inline-text-link"]) {
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    const link = mobile.locator(".library-detail-preview a[data-outbound-link]");
    assert(await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) === 16, `${id} mobile body context is not 16px.`);
    assert(await overflow(mobile) <= 1, `${id} body context overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac124-${id}-body-375x812.png` });
    if (id === "inline-text-link") await mobile.getByLabel("Linked words").fill("crystal@fractalnyc.com");
    await mobile.getByLabel("Example text context").selectOption("lead");
    assert(await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) === 18, `${id} mobile lead context is not 18px.`);
    assert(await overflow(mobile) <= 1, `${id} lead context overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac124-${id}-lead-375x812.png` });
    await mobile.close();
  }
  const articleMobile = await context.newPage();
  await articleMobile.setViewportSize({ width: 375, height: 812 });
  await articleMobile.goto(`${componentUrl}#component/library-article-card`, { waitUntil: "networkidle" });
  const mobileBylineFont = await articleMobile.locator(".library-detail-preview [data-document-byline]").evaluate((element) => getComputedStyle(element).fontFamily);
  assert(mobileBylineFont.includes("Inter"), `Mobile Article Card byline is not Inter: ${mobileBylineFont}.`);
  assert(await overflow(articleMobile) <= 1, "Article Card detail overflows at 375px.");
  const mobileBylineStyle = await articleMobile.locator(".library-detail-preview [data-document-byline]").evaluate((element) => getComputedStyle(element).fontStyle);
  assert(mobileBylineStyle === "normal", `Mobile Article Card byline is italic: ${mobileBylineStyle}.`);
  await articleMobile.screenshot({ path: "/tmp/frac124-component-article-375x812.png" });
  await articleMobile.close();

  for (const [width, suffix] of [[320, "320x812"], [375, "375x812"]]) {
    const courseMobile = await context.newPage();
    await courseMobile.setViewportSize({ width, height: 812 });
    await courseMobile.goto(`${componentUrl}#component/course-card`, { waitUntil: "networkidle" });
    await courseMobile.getByLabel("Subject and icon").selectOption("Experimental category");
    const lockup = courseMobile.locator(".library-detail-preview [data-category-icon-label]");
    await lockup.locator("span:last-child").evaluate((label) => {
      label.textContent = "Experimental interdisciplinary investigations across many practices";
    });
    const iconSize = await lockup.locator("[data-category-icon]").evaluate((icon) => ({
      width: icon.getBoundingClientRect().width,
      height: icon.getBoundingClientRect().height,
    }));
    assert(iconSize.width === 28 && iconSize.height === 28, `${width}px Course Card icon changed size: ${JSON.stringify(iconSize)}.`);
    assert(await lockup.getAttribute("data-category-icon-key") === "shapes", `${width}px Course Card lost its fallback icon.`);
    const mobileInstructorFont = await courseMobile.locator(".library-detail-preview [data-instructor-name]").evaluate((element) => getComputedStyle(element).fontFamily);
    assert(mobileInstructorFont.includes("Inter"), `${width}px Course Card instructor is not Inter: ${mobileInstructorFont}.`);
    assert(await overflow(courseMobile) <= 1, `Course Card long subject overflows at ${width}px.`);
    await courseMobile.screenshot({ path: `/tmp/frac124-component-course-${suffix}.png` });
    await courseMobile.close();
  }
  for (const [id, modes] of [["search-bar", [["Search behavior", "site", "search-site"], ["Search behavior", "collection", "search-collection"]]], ["filter-bar", [["Selection behavior", "single", "filter-single"], ["Selection behavior", "multiple", "filter-multiple"]]]]) {
    for (const [label, value, filename] of modes) {
      const mobile = await context.newPage();
      await mobile.setViewportSize({ width: 375, height: 812 });
      await mobile.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
      await mobile.getByLabel(label).selectOption(value);
      assert(await overflow(mobile) <= 1, `${filename} detail overflows at 375px.`);
      if (id === "filter-bar" && value === "single") {
        const filterButtons = mobile.locator("[data-filter-bar] button");
        assert(JSON.stringify(await filterButtons.allTextContents()) === JSON.stringify(["All", "Literature", "Writing", "Movement", "Music", "Technology", "Craft", "Nature", "Mind & Body"]), "Mobile Filter Bar lost live Education categories.");
        assert(new Set((await filterButtons.evaluateAll((buttons) => buttons.map((button) => Math.round(button.getBoundingClientRect().y))))).size > 1, "Mobile Filter Bar did not wrap.");
        await mobile.screenshot({ path: "/tmp/frac125-catalog-filter-375x812.png" });
      }
      await mobile.close();
    }
  }

  const reducedSearch = await context.newPage();
  await reducedSearch.emulateMedia({ reducedMotion: "reduce" });
  await reducedSearch.goto(`${componentUrl}#component/search-bar`, { waitUntil: "networkidle" });
  await reducedSearch.getByLabel("Search behavior").selectOption("collection");
  await reducedSearch.getByRole("searchbox", { name: "Search this collection" }).fill("community");
  const reducedClear = reducedSearch.getByRole("button", { name: "Clear search" });
  await reducedClear.hover();
  assert(["none", "1"].includes(await reducedClear.locator("svg").evaluate((icon) => getComputedStyle(icon).scale)), "Reduced-motion clear icon still transforms.");
  assert(await reducedClear.evaluate((button) => getComputedStyle(button).backgroundColor) !== "rgba(0, 0, 0, 0)", "Reduced-motion clear lost color/surface feedback.");
  await reducedSearch.close();

  const largeText = await context.newPage();
  await largeText.setViewportSize({ width: 375, height: 812 });
  await largeText.goto(`${componentUrl}#component/course-card`, { waitUntil: "networkidle" });
  await largeText.getByLabel("Subject and icon").selectOption("Experimental category");
  await largeText.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
  await largeText.locator(".library-detail-preview [data-category-icon-label] span:last-child").evaluate((label) => {
    label.textContent = "Experimental interdisciplinary investigations across many practices";
  });
  assert(await overflow(largeText) <= 1, "Course Card overflows with a long subject and 24px root text.");
  await largeText.close();

  for (const id of ["outbound-text-link", "inline-text-link"]) {
    const largeLink = await context.newPage();
    await largeLink.setViewportSize({ width: 320, height: 812 });
    await largeLink.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    await largeLink.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
    await largeLink.getByLabel(id === "outbound-text-link" ? "Link label" : "Linked words").fill("averylongcontactaddressforsemesterquestions@fractalnyc.com");
    await largeLink.getByLabel("Destination type").selectOption("email");
    await largeLink.getByLabel("Example text context").selectOption("lead");
    assert(await overflow(largeLink) <= 1, `${id} overflows at 320px with a 24px root and long email.`);
    assert(await largeLink.locator(".library-detail-preview a[data-outbound-link]").isVisible(), `${id} is not visible under large-text stress.`);
    await largeLink.close();
  }

  const reduced = await context.newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(`${componentUrl}#browse/media`, { waitUntil: "networkidle" });
  assert(await reduced.locator("#meet-space-carousel .swiper-coverflow").count() === 0, "Carousel retained 3D coverflow under reduced motion.");
  const galleryMotion = await reduced.locator("#photo-gallery .library-photo-gallery-stage img").first().evaluate((image) => {
    const animatedParent = image.closest("[style*='transform'], [style*='opacity']");
    if (!animatedParent) return { transform: "none", opacity: "1" };
    const style = getComputedStyle(animatedParent);
    return { transform: style.transform, opacity: style.opacity };
  });
  assert(galleryMotion.transform === "none" && galleryMotion.opacity === "1", `Photo Gallery retained reveal motion: ${JSON.stringify(galleryMotion)}.`);
  await reduced.close();

  assert(browserErrors.length === 0, `Catalog page errors: ${browserErrors.join(" | ")}`);
  assert(failedAssets.length === 0, `Catalog failed assets: ${failedAssets.join(" | ")}`);

  const production = await context.newPage();
  const productionErrors = [];
  production.on("pageerror", (error) => productionErrors.push(error.message));
  for (const width of [375, 1440]) {
    await production.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of ["/", "/library", "/education", "/campus"]) {
      await production.goto(`${productionOrigin}${route}`, { waitUntil: "networkidle" });
      assert(await overflow(production) <= 1, `${route} overflows at ${width}px.`);
      const affected = route === "/library" ? production.locator("[data-document-byline]").first() : route === "/education" ? production.locator("[data-course-id]").first() : route === "/campus" ? production.locator("[data-highlight-box]").first() : null;
      if (affected) {
        await affected.evaluate((element) => element.scrollIntoView({ block: "center" }));
        await production.waitForTimeout(700);
      }
      if (route === "/library") {
        const bylineFont = await production.locator("[data-document-byline]").first().evaluate((element) => getComputedStyle(element).fontFamily);
        const bylineStyle = await production.locator("[data-document-byline]").first().evaluate((element) => getComputedStyle(element).fontStyle);
        assert(bylineFont.includes("Inter"), `Production Library byline is not Inter at ${width}px: ${bylineFont}.`);
        assert(bylineStyle === "normal", `Production Library byline is italic at ${width}px: ${bylineStyle}.`);
        assert(await production.locator("[data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() > 0, "Production Library lost decorative category icons.");
      }
      if (route === "/education") {
        const instructorFont = await production.locator("[data-instructor-name]").first().evaluate((element) => getComputedStyle(element).fontFamily);
        assert(instructorFont.includes("Inter"), `Production Education instructor is not Inter at ${width}px: ${instructorFont}.`);
        assert(await production.locator("[data-course-id]").count() === await production.locator("[data-course-id] [data-category-icon-label]").count(), "Production Education does not have one category icon per Course Card.");
        const future = production.getByRole("link", { name: /Stay tuned for future semesters/ });
        const jump = production.getByRole("link", { name: "What is FractalU?" });
        for (const link of [future, jump]) {
          assert((await link.evaluate((element) => getComputedStyle(element).fontFamily)).includes("Inter"), `Education hero link is not Inter at ${width}px.`);
          assert(await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) === 18, `Education hero link does not inherit lead size at ${width}px.`);
        }
        assert(await future.locator(".lucide-arrow-up-right").count() === 1 && await future.getAttribute("target") === "_blank" && await future.getAttribute("rel") === "noopener noreferrer", "Education future-semester link semantics changed.");
        assert(await jump.locator(".lucide-arrow-down").count() === 1 && await jump.getAttribute("target") === null, "Education information jump semantics changed.");
        const educationFilter = production.getByRole("group", { name: "Filter classes by subject" });
        const educationButtons = educationFilter.getByRole("button");
        assert(JSON.stringify(await educationButtons.allTextContents()) === JSON.stringify(["All", "Literature", "Writing", "Movement", "Music", "Technology", "Craft", "Nature", "Mind & Body"]), `Production Education categories differ at ${width}px.`);
        assert(await production.locator(".fractalu-filter-row").evaluate((element) => getComputedStyle(element).backgroundColor) === "rgba(0, 0, 0, 0)", `Production Education filter has a row-wide background at ${width}px.`);
        assert(await educationButtons.evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().height >= 44 && button.getBoundingClientRect().width >= 44)), `Production Education chips are undersized at ${width}px.`);
        await production.getByRole("button", { name: "Technology", exact: true }).click();
        assert(await production.locator("[data-course-id]").count() === 3 && await production.locator("[data-filter-bar] button[aria-pressed='true']").count() === 1, `Production Education filtering failed at ${width}px.`);
        await production.getByRole("button", { name: "All", exact: true }).click();
        assert(await production.locator("[data-course-id]").count() === 20, `Production Education All recovery failed at ${width}px.`);
        await educationFilter.scrollIntoViewIfNeeded();
        await production.screenshot({ path: `/tmp/frac125-production-education-filter-${width === 375 ? "375x812" : "1440x900"}.png` });
      }
      if (route === "/campus") {
        const crystal = production.getByRole("link", { name: "crystal@fractalnyc.com" });
        assert((await crystal.getAttribute("href")) === "mailto:crystal@fractalnyc.com", "Crystal contact lost its mailto destination.");
        assert(await crystal.locator("[data-outbound-arrow]").count() === 0 && await crystal.getAttribute("target") === null && await crystal.getAttribute("rel") === null, "Crystal contact lost inline same-context behavior.");
        assert((await crystal.evaluate((element) => getComputedStyle(element).fontFamily)).includes("Inter") && await crystal.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) === 18, `Crystal contact does not inherit lead Inter at ${width}px.`);
      }
      const slug = route === "/" ? "home" : route.slice(1);
      await production.screenshot({ path: `/tmp/frac124-production-${slug}-${width === 375 ? "375x812" : "1440x900"}.png` });
    }
  }

  await production.setViewportSize({ width: 1440, height: 900 });
  await production.goto(productionOrigin, { waitUntil: "networkidle" });
  const homeSearch = production.getByRole("combobox", { name: "Search Fractal" });
  await production.keyboard.press("/");
  assert(await homeSearch.evaluate((input) => document.activeElement === input), "Home lost its slash shortcut.");
  await homeSearch.fill("Campus");
  await homeSearch.press("ArrowDown");
  await homeSearch.press("Enter");
  await production.waitForURL(`${productionOrigin}/campus`);
  await production.goto(`${productionOrigin}/library`, { waitUntil: "networkidle" });
  const archiveSearch = production.getByRole("searchbox", { name: "Search the archive" });
  await archiveSearch.evaluate((input) => input.scrollIntoView({ block: "center" }));
  await production.waitForTimeout(800);
  await archiveSearch.fill("community");
  assert(await production.getByRole("button", { name: "Clear search" }).count() === 1, "Library has duplicate clear controls.");
  const libraryClear = production.getByRole("button", { name: "Clear search" });
  const libraryClearRest = await libraryClear.evaluate((button) => getComputedStyle(button).backgroundColor);
  await libraryClear.hover();
  await production.waitForTimeout(200);
  assert(await libraryClear.evaluate((button, resting) => getComputedStyle(button).backgroundColor !== resting, libraryClearRest), "Library clear hover is not reactive.");
  await production.locator("[data-search-bar]").screenshot({ path: "/tmp/frac125-production-library-clear-hover-1440x900.png" });
  await libraryClear.click();
  await production.waitForFunction((input) => input.value === "" && document.activeElement === input, await archiveSearch.elementHandle());
  await production.goto(`${productionOrigin}/education`, { waitUntil: "networkidle" });
  assert(await production.locator("[data-filter-mode='single']").count() >= 1, "Education is not using the shared single-select Filter Bar.");
  await production.goto(`${productionOrigin}/campus`, { waitUntil: "networkidle" });
  assert(await production.locator("[data-highlight-box]").count() >= 1, "Campus is not using Highlight Box.");
  await production.goto(`${productionOrigin}/components`, { waitUntil: "domcontentloaded" });
  assert(await production.getByText("Choose by looking").count() === 0, "Production exposes the team catalog.");
  assert(productionErrors.length === 0, `Production page errors: ${productionErrors.join(" | ")}`);

  await browser.close();
  console.log("FRAC-125 component-library browser checks passed; affected screenshots are in /tmp/frac125-*.png.");
} finally {
  catalogServer.kill("SIGTERM");
  productionServer.kill("SIGTERM");
}
