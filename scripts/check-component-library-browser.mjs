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
    common: ["Primary Button", "Standalone Link", "Prominent Text Link", "Inline Text Link", "Article Card", "Note Box", "Course Card", "Club Card", "Highlight Box"],
    cards: ["Article Card", "Note Box", "Course Card", "Club Card", "Highlight Box", "Editorial Quote"],
    actions: ["Primary Button", "Standalone Link", "Prominent Text Link", "Inline Text Link"],
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
    await page.screenshot({ path: `/tmp/frac123-${category}-1440x900.png` });
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
  await page.screenshot({ path: "/tmp/frac123-common-1440x900.png" });

  const search = page.getByRole("searchbox", { name: "Search components" });
  for (const [query, expected] of [
    ["homepage search", "Search Bar"], ["archive search field", "Search Bar"], ["course subject filter", "Filter Bar"],
    ["campus highlight", "Highlight Box"], ["outsource link", "Standalone Link"], ["inter outbound link", "Prominent Text Link"],
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
      return { font: link ? getComputedStyle(link).fontFamily : "", arrows: link?.querySelectorAll("[data-outbound-arrow]").length ?? 0, height: link?.getBoundingClientRect().height ?? 0 };
    };
    return { standalone: read("outbound-link"), prominent: read("prominent-text-link"), inline: read("inline-text-link") };
  });
  assert(linkRoles.standalone.arrows === 1 && linkRoles.standalone.height >= 44, `Standalone Link role is wrong: ${JSON.stringify(linkRoles)}.`);
  assert(linkRoles.prominent.arrows === 1 && linkRoles.inline.arrows === 0, `Prominent/Inline arrow roles are wrong: ${JSON.stringify(linkRoles)}.`);
  assert(linkRoles.prominent.font === linkRoles.inline.font && linkRoles.standalone.font !== linkRoles.inline.font, `Link font roles are wrong: ${JSON.stringify(linkRoles)}.`);

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
  assert(await page.locator(".library-detail-preview [data-document-byline].text-aside").count() === 1, "Article Card lost its text-aside byline role.");
  assert(await page.locator(".library-detail-preview [data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() === 1, "Article Card lost its decorative shared category icon.");
  await page.screenshot({ path: "/tmp/frac123-component-article-1440x900.png" });

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
  await page.screenshot({ path: "/tmp/frac123-component-course-1440x900.png" });

  await page.goto(`${componentUrl}#component/search-bar`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Search Fractal" }).waitFor();
  assert(await page.getByRole("combobox", { name: "Search Fractal" }).count() === 1, "Search Bar site mode is not the real combobox.");
  await page.screenshot({ path: "/tmp/frac123-search-site-1440x900.png" });
  const catalogHash = new URL(page.url()).hash;
  const siteSearch = page.getByRole("combobox", { name: "Search Fractal" });
  await siteSearch.fill("Campus");
  await siteSearch.press("ArrowDown");
  assert(Boolean(await siteSearch.getAttribute("aria-activedescendant")), "Catalog site search lost keyboard result focus.");
  await siteSearch.press("Enter");
  assert(new URL(page.url()).hash === catalogHash, "Catalog site search navigated away.");
  await page.getByLabel("Search behavior").selectOption("collection");
  const collectionSearch = page.getByRole("searchbox", { name: "Search this collection" });
  assert(await collectionSearch.getAttribute("type") === "text", "Collection search reintroduced a native cancel control.");
  await collectionSearch.fill("community");
  assert(await page.getByRole("button", { name: "Clear search" }).count() === 1, "Collection Search Bar does not have exactly one clear control.");
  await page.getByRole("button", { name: "Clear search" }).click();
  assert(await collectionSearch.inputValue() === "" && await collectionSearch.evaluate((input) => document.activeElement === input), "Collection clear did not clear and restore focus.");
  await page.screenshot({ path: "/tmp/frac123-search-collection-1440x900.png" });

  await page.goto(`${componentUrl}#component/filter-bar`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-filter-mode='single']").waitFor();
  assert(await page.locator("[data-filter-mode='single']").count() === 1, "Filter Bar did not start in single-select mode.");
  const singleChips = page.locator("[data-filter-bar] button");
  assert(await singleChips.evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().height >= 44 && button.getBoundingClientRect().width >= 44)), "Filter chips are smaller than 44px.");
  await singleChips.nth(1).click();
  assert(await singleChips.nth(1).getAttribute("aria-pressed") === "true", "Single-select chip did not select.");
  await page.screenshot({ path: "/tmp/frac123-filter-single-1440x900.png" });
  await page.getByLabel("Selection behavior").selectOption("multiple");
  const multiChips = page.locator("[data-filter-bar] button");
  await multiChips.nth(1).click();
  assert(await page.locator("[data-filter-bar] button[aria-pressed='true']").count() === 2, "Multi-select Filter Bar did not retain two selections.");
  assert((await multiChips.nth(1).getAttribute("aria-label"))?.includes("results"), "Multi-select chips lost counts.");
  await page.screenshot({ path: "/tmp/frac123-filter-multiple-1440x900.png" });

  await page.goto(`${componentUrl}#browse/media`, { waitUntil: "networkidle" });
  await loadedImages(page.locator("#photo-gallery img"), "Photo Gallery");
  assert(await page.locator("#photo-gallery .library-photo-gallery-stage").count() === 1, "Photo Gallery is not the real bounded component.");
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
    if (width === 375) await matrixPage.screenshot({ path: "/tmp/frac123-common-375x812.png" });
    await matrixPage.close();
  }
  for (const category of ["actions", "forms", "cards", "media"]) {
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${componentUrl}#browse/${category}`, { waitUntil: "networkidle" });
    assert(await overflow(mobile) <= 1, `${category} overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac123-${category}-375x812.png` });
    await mobile.close();
  }
  const articleMobile = await context.newPage();
  await articleMobile.setViewportSize({ width: 375, height: 812 });
  await articleMobile.goto(`${componentUrl}#component/library-article-card`, { waitUntil: "networkidle" });
  const mobileBylineFont = await articleMobile.locator(".library-detail-preview [data-document-byline]").evaluate((element) => getComputedStyle(element).fontFamily);
  assert(mobileBylineFont.includes("Inter"), `Mobile Article Card byline is not Inter: ${mobileBylineFont}.`);
  assert(await overflow(articleMobile) <= 1, "Article Card detail overflows at 375px.");
  await articleMobile.screenshot({ path: "/tmp/frac123-component-article-375x812.png" });
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
    await courseMobile.screenshot({ path: `/tmp/frac123-component-course-${suffix}.png` });
    await courseMobile.close();
  }
  for (const [id, modes] of [["search-bar", [["Search behavior", "site", "search-site"], ["Search behavior", "collection", "search-collection"]]], ["filter-bar", [["Selection behavior", "single", "filter-single"], ["Selection behavior", "multiple", "filter-multiple"]]]]) {
    for (const [label, value, filename] of modes) {
      const mobile = await context.newPage();
      await mobile.setViewportSize({ width: 375, height: 812 });
      await mobile.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
      await mobile.getByLabel(label).selectOption(value);
      assert(await overflow(mobile) <= 1, `${filename} detail overflows at 375px.`);
      await mobile.screenshot({ path: `/tmp/frac123-${filename}-375x812.png` });
      await mobile.close();
    }
  }

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
        assert(bylineFont.includes("Inter"), `Production Library byline is not Inter at ${width}px: ${bylineFont}.`);
        assert(await production.locator("[data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() > 0, "Production Library lost decorative category icons.");
      }
      if (route === "/education") {
        const instructorFont = await production.locator("[data-instructor-name]").first().evaluate((element) => getComputedStyle(element).fontFamily);
        assert(instructorFont.includes("Inter"), `Production Education instructor is not Inter at ${width}px: ${instructorFont}.`);
        assert(await production.locator("[data-course-id]").count() === await production.locator("[data-course-id] [data-category-icon-label]").count(), "Production Education does not have one category icon per Course Card.");
      }
      const slug = route === "/" ? "home" : route.slice(1);
      await production.screenshot({ path: `/tmp/frac123-production-${slug}-${width === 375 ? "375x812" : "1440x900"}.png` });
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
  await archiveSearch.fill("community");
  assert(await production.getByRole("button", { name: "Clear search" }).count() === 1, "Library has duplicate clear controls.");
  await production.getByRole("button", { name: "Clear search" }).click();
  assert(await archiveSearch.inputValue() === "" && await archiveSearch.evaluate((input) => document.activeElement === input), "Library clear is not functional.");
  await production.goto(`${productionOrigin}/education`, { waitUntil: "networkidle" });
  assert(await production.locator("[data-filter-mode='single']").count() >= 1, "Education is not using the shared single-select Filter Bar.");
  await production.goto(`${productionOrigin}/campus`, { waitUntil: "networkidle" });
  assert(await production.locator("[data-highlight-box]").count() >= 1, "Campus is not using Highlight Box.");
  await production.goto(`${productionOrigin}/components`, { waitUntil: "domcontentloaded" });
  assert(await production.getByText("Choose by looking").count() === 0, "Production exposes the team catalog.");
  assert(productionErrors.length === 0, `Production page errors: ${productionErrors.join(" | ")}`);

  await browser.close();
  console.log("FRAC-123 component-library browser checks passed; screenshots are in /tmp/frac123-*.png.");
} finally {
  catalogServer.kill("SIGTERM");
  productionServer.kill("SIGTERM");
}
