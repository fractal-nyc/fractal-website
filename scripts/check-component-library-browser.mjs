import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4174";
const productionOrigin = "http://127.0.0.1:4175";
const componentUrl = `${origin}/components/`;
const server = spawn("pnpm", ["exec", "vite", "preview", "--config", "vite.components.config.ts", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
const productionServer = spawn("pnpm", ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", "4175", "--strictPort"], { stdio: "ignore" });
const fail = (message) => { throw new Error(message); };
const assert = (condition, message) => { if (!condition) fail(message); };

const columnCount = async (page) => page.locator(".library-gallery-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
const horizontalOverflow = async (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const assertLoadedImages = async (locator, label) => {
  const results = await locator.evaluateAll((images) => images.map((image) => ({
    src: image.currentSrc || image.src,
    complete: image.complete,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
  })));
  assert(results.length > 0, `${label} did not render any images.`);
  const broken = results.filter((image) => image.naturalWidth < 1 || image.naturalHeight < 1);
  if (broken.length) fail(`${label} contains unloaded assets: ${JSON.stringify(broken)}`);
};

try {
  const waitForServer = async (url, name) => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try { if ((await fetch(url)).ok) return; } catch { /* server is starting */ }
      if (attempt === 39) fail(`${name} preview server did not start.`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  };
  await Promise.all([waitForServer(componentUrl, "Component"), waitForServer(productionOrigin, "Production")]);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  const page = await context.newPage();
  const errors = [];
  const failedCatalogResponses = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) failedCatalogResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(componentUrl, { waitUntil: "networkidle" });

  const categoryLabels = await page.locator(".library-category-chooser button span:first-child").allTextContents();
  assert(JSON.stringify(categoryLabels) === JSON.stringify(["Common components", "Cards & boxes", "Buttons & links", "Forms & filters", "Images & decoration", "All components"]), `Unexpected chooser categories: ${categoryLabels.join(", ")}`);

  const common = ["Primary Button", "Standalone Link", "Inline Text Link", "Article Card", "Note Box", "Course Card", "Club Card", "Campus Highlight", "Editorial Quote"];
  for (const name of common) assert(await page.getByRole("button", { name: `View details for ${name}`, exact: true }).count(), `Common gallery is missing ${name}.`);
  const closedCards = await page.locator(".library-visual-card").evaluateAll((cards) => cards.map((card) => ({
    children: card.children.length,
    first: card.firstElementChild?.classList.contains("library-gallery-preview"),
    last: card.lastElementChild?.classList.contains("library-card-actions"),
    names: card.querySelectorAll(".library-component-name").length,
    copies: card.querySelectorAll(".library-copy-prompt").length,
  })));
  assert(closedCards.every((card) => card.children === 2 && card.first && card.last && card.names === 1 && card.copies === 1), `Closed cards are not preview + two-action-row only: ${JSON.stringify(closedCards)}.`);
  const visiblePreviews = await page.locator(".library-gallery-preview").evaluateAll((items) => items.filter((item) => item.getBoundingClientRect().top < innerHeight && item.getBoundingClientRect().bottom > 0).length);
  assert(visiblePreviews >= 3, `Desktop initial viewport showed ${visiblePreviews} previews instead of at least three.`);
  const forbidden = ["ComponentColorScope", "Use when", "Do not use when", "Content fields", "Accessibility", "Responsive behavior", "Reference specimen", "Learn more", "One approved style", "Outline action", "Quiet action", "Disabled", "Inline link", "Linked title", "The branded Mandelbrot-corner button"];
  const bodyText = await page.locator("body").innerText();
  for (const text of forbidden) assert(!bodyText.includes(text), `Closed gallery exposed ${text}.`);
  assert(await columnCount(page) === 3, "Desktop gallery did not use three columns.");
  const previewRatio = await page.locator(".library-visual-card").first().evaluate((card) => {
    const preview = card.querySelector(".library-gallery-preview");
    const actions = card.querySelector(".library-card-actions");
    return preview.getBoundingClientRect().height / (preview.getBoundingClientRect().height + actions.getBoundingClientRect().height);
  });
  assert(previewRatio >= 0.6, `Closed card preview ratio was ${previewRatio.toFixed(2)}.`);

  // Catch a standalone Tailwind build that styles the catalog shell but drops
  // utilities used exclusively by imported production components.
  const actionFidelity = await page.locator("#action-buttons .library-gallery-preview button").first().evaluate((button) => {
    const style = getComputedStyle(button);
    const buttonBox = button.getBoundingClientRect();
    const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    const range = document.createRange();
    if (textNode) range.selectNodeContents(textNode);
    const textBox = textNode ? range.getBoundingClientRect() : null;
    const cornerBoxes = [...button.querySelectorAll(":scope > span[aria-hidden]")].map((corner) => corner.getBoundingClientRect());
    const cornersContained = cornerBoxes.every((corner) => corner.left >= buttonBox.left && corner.right <= buttonBox.right && corner.top >= buttonBox.top && corner.bottom <= buttonBox.bottom);
    return {
      height: buttonBox.height,
      paddingInline: Number.parseFloat(style.paddingInlineStart),
      paddingBlock: Number.parseFloat(style.paddingBlockStart),
      background: style.backgroundColor,
      display: style.display,
      position: style.position,
      text: button.textContent?.trim(),
      textInsetStart: textBox ? textBox.left - buttonBox.left : 0,
      textInsetEnd: textBox ? buttonBox.right - textBox.right : 0,
      cornersContained,
    };
  });
  assert(actionFidelity.height >= 44, `Primary Action Button is only ${actionFidelity.height}px high.`);
  assert(actionFidelity.paddingInline >= 24 && actionFidelity.paddingBlock >= 16, `Primary Action Button lost production padding: ${JSON.stringify(actionFidelity)}.`);
  assert(actionFidelity.background !== "rgba(0, 0, 0, 0)" && actionFidelity.background !== "transparent", "Primary Action Button lost its production fill.");
  assert(["flex", "inline-flex"].includes(actionFidelity.display) && actionFidelity.position === "relative", `Primary Action Button lost production layout: ${JSON.stringify(actionFidelity)}.`);
  assert(actionFidelity.text?.includes("Primary action") && actionFidelity.textInsetStart >= 28 && actionFidelity.textInsetEnd >= 28 && actionFidelity.cornersContained, `Primary Action Button label or corners are obscured: ${JSON.stringify(actionFidelity)}.`);

  const actionSeparation = await page.evaluate(() => {
    const primary = document.querySelector("#action-buttons .library-gallery-preview");
    const standalone = document.querySelector("#outbound-link .library-gallery-preview");
    const inline = document.querySelector("#inline-text-link .library-gallery-preview");
    const standaloneLink = standalone?.querySelector("a[data-outbound-link]");
    return {
      primaryButtons: primary?.querySelectorAll(":scope button").length ?? 0,
      standaloneLinks: standalone?.querySelectorAll("a[data-outbound-link]").length ?? 0,
      standaloneArrows: standalone?.querySelectorAll("[data-outbound-arrow]").length ?? 0,
      standaloneHeight: standaloneLink?.getBoundingClientRect().height ?? 0,
      inlineInSentence: Boolean(inline?.querySelector("p a[data-outbound-link]")),
      inlineArrows: inline?.querySelectorAll("[data-outbound-arrow]").length ?? 0,
    };
  });
  assert(actionSeparation.primaryButtons === 1, `Primary Button tile rendered peer controls: ${JSON.stringify(actionSeparation)}.`);
  assert(actionSeparation.standaloneLinks === 1 && actionSeparation.standaloneArrows === 1 && actionSeparation.standaloneHeight >= 44, `Standalone Link is not one arrowed 44px link: ${JSON.stringify(actionSeparation)}.`);
  assert(actionSeparation.inlineInSentence && actionSeparation.inlineArrows === 0, `Inline Text Link is not an arrow-free link in prose: ${JSON.stringify(actionSeparation)}.`);

  const representativeLayout = await page.evaluate(() => {
    const note = document.querySelector("#note-callout .library-canvas-scope > *");
    const noteCorner = note?.querySelector(":scope > span[aria-hidden]");
    const article = document.querySelector("#library-article-card .library-canvas-scope a > div");
    const course = document.querySelector("#course-card [data-course-id]");
    const actions = document.querySelector("#note-callout .library-card-actions");
    const preview = document.querySelector("#note-callout .library-gallery-preview");
    return {
      notePosition: note ? getComputedStyle(note).position : "missing",
      cornerPosition: noteCorner ? getComputedStyle(noteCorner).position : "missing",
      articlePadding: article ? Number.parseFloat(getComputedStyle(article).paddingInlineStart) : 0,
      courseWidth: course?.getBoundingClientRect().width ?? 0,
      actionsAfterPreview: Boolean(actions && preview && actions.getBoundingClientRect().top >= preview.getBoundingClientRect().bottom),
    };
  });
  assert(representativeLayout.notePosition === "relative" && representativeLayout.cornerPosition === "absolute", `Note Box positioning utilities are missing: ${JSON.stringify(representativeLayout)}.`);
  assert(representativeLayout.articlePadding >= 20 && representativeLayout.courseWidth > 200 && representativeLayout.actionsAfterPreview, `Representative component layout is not production-faithful: ${JSON.stringify(representativeLayout)}.`);

  const independentHeights = await page.evaluate(() => {
    const note = document.querySelector("#note-callout")?.getBoundingClientRect();
    const course = document.querySelector("#course-card")?.getBoundingClientRect();
    const club = document.querySelector("#club-card")?.getBoundingClientRect();
    return { note: note?.height ?? 0, course: course?.height ?? 0, club: club?.height ?? 0 };
  });
  assert(new Set(Object.values(independentHeights).map((height) => Math.round(height))).size > 1, `Cards are still stretched to equal row heights: ${JSON.stringify(independentHeights)}.`);
  assert(independentHeights.course > independentHeights.note + 80, `The tall Course Card still forces blank space into its Note Box neighbor: ${JSON.stringify(independentHeights)}.`);

  assert(await page.locator(".library-gallery-shell[aria-live]").count() === 0, "The full gallery is still an aria-live region.");
  const status = page.locator('.library-gallery-heading [role="status"][aria-live="polite"]');
  assert(await status.count() === 1, "Browse view must expose exactly one concise results live region in its heading.");
  assert((await status.innerText()).trim() === "9 components shown", `Unexpected initial results announcement: ${await status.innerText()}`);

  const firstCategory = page.locator(".library-category-chooser button").first();
  await firstCategory.focus();
  const focusStyle = await firstCategory.evaluate((button) => ({ style: getComputedStyle(button).outlineStyle, width: getComputedStyle(button).outlineWidth }));
  assert(focusStyle.style !== "none" && Number.parseFloat(focusStyle.width) >= 2, `Category keyboard focus is not visibly styled: ${JSON.stringify(focusStyle)}.`);
  await page.screenshot({ path: "/tmp/frac118-common-1440x900.png" });

  const browseHash = new URL(page.url()).hash;
  await page.getByRole("button", { name: "Copy prompt for Primary Button" }).click();
  const expectedPrimaryPrompt = "Use the “Primary Button” component from the Fractal NYC component library on the page or section I’m working on. Inherit the target page or section’s approved house/section color tokens where this component supports them; otherwise keep its approved default. Use the real production component and preserve its accessibility and responsive behavior. Ask only if the required button label and destination or action are unclear.";
  assert((await page.evaluate(() => navigator.clipboard.readText())) === expectedPrimaryPrompt, "Primary Button tile copied the wrong prompt.");
  assert(await page.getByText("Copied", { exact: true }).count(), "Tile copy did not show its copied state.");
  assert((await page.locator("#action-buttons [role='status']").innerText()).trim() === "Prompt copied for Primary Button", "Tile copy did not announce component-specific success.");
  assert(new URL(page.url()).hash === browseHash, "Copy prompt unexpectedly navigated away from browse.");

  await page.getByRole("button", { name: "View details for Primary Button" }).click();
  assert(page.url().includes("#component/action-buttons"), "Primary Button name did not open its addressable detail route.");
  assert(await page.getByLabel("Site color").count() && await page.getByLabel("Background").count(), "Primary Button detail lost color/background previews.");
  await page.screenshot({ path: "/tmp/frac117-primary-button-detail-1440x900.png" });
  await page.goBack();
  await page.waitForSelector("#action-buttons");
  await page.getByRole("button", { name: /Buttons & links/ }).click();
  const actionIds = await page.locator(".library-visual-card").evaluateAll((cards) => cards.map((card) => card.id));
  assert(JSON.stringify(actionIds) === JSON.stringify(["action-buttons", "outbound-link", "inline-text-link"]), `Buttons & links contains misleading choices: ${actionIds.join(", ")}.`);
  await page.getByRole("button", { name: /All components/ }).click();
  const allCardActions = await page.locator(".library-visual-card").evaluateAll((cards) => cards.map((card) => ({
    preview: card.firstElementChild?.classList.contains("library-gallery-preview"),
    names: card.querySelectorAll(".library-component-name").length,
    copies: card.querySelectorAll(".library-copy-prompt").length,
  })));
  assert(allCardActions.every((card) => card.preview && card.names === 1 && card.copies === 1), "At least one gallery component is missing its preview, name, or Copy prompt.");
  await page.getByRole("button", { name: /Common components/ }).click();

  const search = page.getByRole("searchbox", { name: "Search components" });
  for (const [query, expected] of [["note", "Note Box"], ["class container", "Course Card"], ["Action Button", "Primary Button"], ["outsource link", "Standalone Link"], ["prose link", "Inline Text Link"], ["DocumentCard", "Article Card"]]) {
    await search.fill(query);
    assert(await page.getByRole("button", { name: `View details for ${expected}`, exact: true }).count(), `${query} did not find ${expected}.`);
    const announcement = (await status.innerText()).trim();
    assert(/^\d+ (?:match|matches)$/.test(announcement) && announcement.length < 20, `Search announced verbose gallery content instead of a count: ${announcement}`);
  }
  await search.fill("");

  await page.getByRole("button", { name: /Cards & boxes/ }).click();
  const cardNames = ["Content Card", "Note Box", "Course Fact Grid", "Club Card", "Campus Highlight", "Membership Button Group", "Editorial Quote", "Article Card", "Course Card"];
  for (const name of cardNames) assert(await page.getByRole("button", { name: `View details for ${name}`, exact: true }).count(), `Cards & boxes is missing ${name}.`);

  await search.fill("House Pennants");
  const pennantCard = page.locator("#campus-banner");
  await pennantCard.scrollIntoViewIfNeeded();
  assert(await pennantCard.locator('[data-banner-material="painted-relic"]').count() === 6, "House Pennants did not render all six production pennants.");
  await assertLoadedImages(pennantCard.locator("img.painted-relic-banner__art"), "House Pennants");
  const pennantLabels = await pennantCard.locator(".library-pennant-board > div > span").allTextContents();
  assert(JSON.stringify(pennantLabels) === JSON.stringify(["Co-Living", "Events", "Campus", "Education", "Library", "Political Club"]), `House Pennants labels are incomplete: ${pennantLabels.join(", ")}`);

  await search.fill("Photo Gallery");
  const photoCard = page.locator("#photo-gallery");
  await photoCard.scrollIntoViewIfNeeded();
  await assertLoadedImages(photoCard.locator("img"), "Photo Gallery");
  await search.fill("");

  const noteCard = page.locator("#note-callout");
  await noteCard.getByRole("button", { name: "View details for Note Box" }).click();
  assert(page.url().includes("#component/note-callout"), "Component name did not create an addressable component route.");
  assert(await page.locator("details[open]").count() === 0, "Usage details opened by default.");
  const order = await page.evaluate(() => {
    const preview = document.querySelector(".library-detail-preview");
    const controls = document.querySelector(".library-detail-controls");
    const details = document.querySelector(".library-usage-details");
    return Boolean(preview && controls && details && (preview.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING) && (controls.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert(order, "Focused component order is not preview, controls, then usage details.");
  await page.getByLabel("Note label").fill("Semester reminder");
  await page.getByLabel("Body content").selectOption("long");
  await page.getByLabel("Actions").selectOption("without");
  await page.getByLabel("Corner size").selectOption("lg");
  await page.getByLabel("Preview width").selectOption("320");
  await page.getByLabel("Site color").selectOption("story");
  const surfaces = await page.getByLabel("Background").locator("option").evaluateAll((options) => options.map((option) => option.value));
  assert(JSON.stringify(surfaces) === JSON.stringify(["paper"]), `Story exposed invalid backgrounds: ${surfaces.join(", ")}`);
  assert(await page.getByText("Semester reminder").count(), "Focused content controls did not update the real Note Box.");
  await page.getByText("Usage details").click();
  assert(await page.getByText("CalloutCard", { exact: true }).count(), "Usage details omitted the technical component name.");
  await page.getByRole("button", { name: "Copy prompt for Note Box" }).click();
  const notePrompt = "Use the “Note Box” component from the Fractal NYC component library on the page or section I’m working on. Inherit the target page or section’s approved house/section color tokens where this component supports them; otherwise keep its approved default. Use the real production component and preserve its accessibility and responsive behavior. Ask only if the required content or destination are unclear.";
  assert((await page.evaluate(() => navigator.clipboard.readText())) === notePrompt, "Tell an agent prompt was not copied.");
  await page.reload({ waitUntil: "networkidle" });
  assert(page.url().includes("#component/note-callout"), "Component detail did not survive reload.");
  await page.goBack();
  await page.waitForSelector("#note-callout");
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "View details for Note Box");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  assert(focused === "View details for Note Box", `Back restored focus to ${focused || "nothing"}.`);

  assert(await page.locator("canvas, [data-site-navbar], [data-hero-shell], [data-hero-scene]").count() === 0, "Page-owned infrastructure mounted behind the browse gallery.");
  await search.fill("Site Navigation");
  assert(await page.locator(".library-visual-card").count() === 0, "Internal Site Navigation remained searchable in the chooser.");
  await search.fill("");

  // The two approved reusable choices are real production components, not
  // thumbnails or page-owned context previews.
  await page.getByRole("button", { name: /Forms & filters/ }).click();
  assert(await page.locator(".library-visual-card").first().getAttribute("id") === "hero-search", "Home Search Bar is not first in Forms & filters.");
  const homeSearchCard = page.locator("#hero-search");
  assert(await homeSearchCard.getByRole("button", { name: "View details for Home Search Bar" }).count(), "Home Search Bar tile is missing its name action.");
  assert(await homeSearchCard.getByRole("button", { name: "Copy prompt for Home Search Bar" }).count(), "Home Search Bar tile is missing Copy prompt.");
  assert(await homeSearchCard.locator("[data-home-search-bar]").count() === 1 && await homeSearchCard.locator("[data-hero-shell], canvas").count() === 0, "Home Search Bar mounted the whole Hero or a duplicate preview.");
  const homeCombobox = homeSearchCard.getByRole("combobox", { name: "Search Fractal" });
  await page.locator(".library-gallery-heading").click();
  await page.keyboard.press("/");
  assert(!(await homeCombobox.evaluate((input) => document.activeElement === input)), "Catalog Home Search Bar installed the Home-only slash shortcut.");
  await homeCombobox.fill("Campus");
  await homeSearchCard.getByRole("listbox", { name: "Search results" }).waitFor();
  const beforeSearchSelection = new URL(page.url()).hash;
  await homeCombobox.press("ArrowDown");
  assert(Boolean(await homeCombobox.getAttribute("aria-activedescendant")), "Home Search Bar ArrowDown did not focus a result.");
  await homeCombobox.press("Enter");
  assert(new URL(page.url()).hash === beforeSearchSelection && await homeCombobox.inputValue() === "", "Catalog search selection navigated away or failed to clear.");
  await page.screenshot({ path: "/tmp/frac118-forms-1440x900.png" });
  await homeSearchCard.getByRole("button", { name: "View details for Home Search Bar" }).click();
  assert(page.url().includes("#component/hero-search") && await page.locator(".library-detail-preview [data-home-search-bar]").count(), "Home Search Bar detail is not live or addressable.");
  assert(await page.locator(".library-detail-controls").count() === 0 && await page.locator("details[open]").count() === 0, "Home Search Bar detail invented options or opened guidance.");
  assert(await page.locator('.library-agent-prompt button[aria-label="Copy prompt for Home Search Bar"]').count(), "Home Search Bar detail lost Copy prompt.");
  await page.goBack();
  await page.waitForSelector("#hero-search");

  await page.getByRole("button", { name: /Images & decoration/ }).click();
  const carouselCard = page.locator("#meet-space-carousel");
  await carouselCard.scrollIntoViewIfNeeded();
  assert(await carouselCard.getByRole("button", { name: "View details for Photo Carousel" }).count(), "Photo Carousel tile is missing its name action.");
  assert(await carouselCard.getByRole("button", { name: "Copy prompt for Photo Carousel" }).count(), "Photo Carousel tile is missing Copy prompt.");
  assert(await carouselCard.getByRole("button", { name: "Previous photo" }).count() && await carouselCard.getByRole("button", { name: "Next photo" }).count(), "Photo Carousel lost production controls.");
  await assertLoadedImages(carouselCard.locator("img"), "Photo Carousel");
  const initialCaption = (await carouselCard.locator("p.text-body").innerText()).trim();
  await carouselCard.getByRole("button", { name: "Next photo" }).click();
  await carouselCard.getByText("02 / 03").waitFor();
  const nextCaption = (await carouselCard.locator("p.text-body").innerText()).trim();
  assert(nextCaption !== initialCaption, "Photo Carousel control did not advance its caption/counter.");
  await page.waitForTimeout(600);
  await carouselCard.getByRole("button", { name: "Next photo" }).focus();
  await carouselCard.getByRole("button", { name: "Next photo" }).press("Enter");
  await carouselCard.getByText("03 / 03").waitFor();
  await page.waitForTimeout(600);
  await carouselCard.getByRole("button", { name: "Next photo" }).click();
  await carouselCard.getByText("01 / 03").waitFor();
  const stageContainment = await carouselCard.locator(".library-photo-carousel-stage").evaluate((stage) => ({ client: stage.clientWidth, scroll: stage.scrollWidth }));
  assert(stageContainment.scroll <= stageContainment.client + 1, `Photo Carousel escaped its tile: ${JSON.stringify(stageContainment)}.`);
  await page.screenshot({ path: "/tmp/frac118-media-1440x900.png" });
  await carouselCard.getByRole("button", { name: "View details for Photo Carousel" }).click();
  assert(page.url().includes("#component/meet-space-carousel") && await page.locator(".library-detail-preview .swiper").count(), "Photo Carousel detail is not live or addressable.");
  assert(await page.locator(".library-detail-controls").count() === 0 && await page.locator("details[open]").count() === 0, "Photo Carousel detail invented options or opened guidance.");
  assert(await page.locator('.library-agent-prompt button[aria-label="Copy prompt for Photo Carousel"]').count(), "Photo Carousel detail lost Copy prompt.");

  await page.goto(`${componentUrl}#component/site-navigation`, { waitUntil: "networkidle" });
  assert(await page.getByText("Internal reference", { exact: true }).count() && await page.getByRole("button", { name: /Copy prompt/ }).count() === 0, "Internal direct detail is selectable or copyable.");
  assert(await page.locator("[data-site-navbar], [data-hero-shell], canvas").count() === 0, "Internal direct detail eagerly mounted page infrastructure.");

  for (const removedCategory of ["basics", "sections"]) {
    await page.goto(`${componentUrl}#browse/${removedCategory}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.location.hash === "#browse/common");
    assert(new URL(page.url()).hash === "#browse/common", `Stale ${removedCategory} hash did not canonicalize to Common.`);
  }

  assert(await page.locator("#education-workshop").count() === 0, "Education workshop is mounted in browse view.");
  await page.getByRole("button", { name: "Edit Education courses" }).click();
  assert(page.url().includes("#education") && await page.locator("#education-workshop").count(), "Education workshop did not open as its own view.");
  const importArea = page.getByLabel("Paste catalog JSON");
  await importArea.fill(JSON.stringify({ semester: "Fall 2026", sourceProvenance: null, courses: [null], clubs: [null] }));
  await page.getByRole("button", { name: "Import JSON" }).click();
  await page.getByText("Preview paused").waitFor();
  await page.getByRole("link", { name: /courses\.0\.instructors:/i }).click();
  await page.waitForFunction(() => document.activeElement?.id === "workshop-courses-0-instructors");
  const canonical = JSON.parse(await readFile("src/data/fractalu-catalog.json", "utf8"));
  canonical.uiState = { selected: true }; canonical.courses[0].instructor = "derived"; canonical.courses[0].unknown = true;
  await importArea.fill(JSON.stringify(canonical)); await page.getByRole("button", { name: "Import JSON" }).click(); await page.getByRole("button", { name: "Copy normalized JSON" }).click();
  assert(!/(?:"uiState"|"instructor"|"unknown")/.test(await page.evaluate(() => navigator.clipboard.readText())), "Normalized export retained forbidden keys.");

  const matrix = [[320, 1], [375, 1], [767, 1], [769, 2], [1023, 2], [1025, 3], [1180, 3], [1440, 3]];
  for (const [width, expectedColumns] of matrix) {
    const matrixPage = await context.newPage();
    await matrixPage.setViewportSize({ width, height: width <= 375 ? 812 : 900 });
    await matrixPage.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
    const overflow = await horizontalOverflow(matrixPage);
    assert(overflow <= 1, `Component library overflows at ${width}px by ${overflow}px.`);
    const actualColumns = await columnCount(matrixPage);
    assert(actualColumns === expectedColumns, `${width}px used ${actualColumns} columns instead of ${expectedColumns}.`);
    if (width === 375) {
      const preview = await matrixPage.locator(".library-gallery-preview").first().boundingBox();
      assert(preview && preview.y >= 0 && preview.y < 712 && preview.height >= 220, `Mobile first preview was y=${preview?.y}, height=${preview?.height}.`);
      const categoryLayout = await matrixPage.locator(".library-category-chooser").evaluate((chooser) => {
        const box = chooser.getBoundingClientRect();
        const buttons = [...chooser.querySelectorAll("button")].map((button) => button.getBoundingClientRect());
        return {
          chooserWidth: box.width,
          scrollWidth: chooser.scrollWidth,
          rows: new Set(buttons.map((button) => Math.round(button.top))).size,
          smallTargets: buttons.filter((button) => button.height < 44 || button.width < 44).length,
          offCanvas: buttons.filter((button) => button.left < box.left - 1 || button.right > box.right + 1).length,
        };
      });
      assert(categoryLayout.rows > 1 && categoryLayout.scrollWidth <= categoryLayout.chooserWidth + 1 && !categoryLayout.smallTargets && !categoryLayout.offCanvas, `Mobile categories do not wrap into visible 44px targets: ${JSON.stringify(categoryLayout)}.`);
      await matrixPage.screenshot({ path: "/tmp/frac118-common-375x812.png" });
    }
    await matrixPage.close();
  }

  for (const [category, screenshot] of [["forms", "/tmp/frac118-forms-375x812.png"], ["media", "/tmp/frac118-media-375x812.png"]]) {
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 812 });
    await mobilePage.goto(`${componentUrl}#browse/${category}`, { waitUntil: "networkidle" });
    assert(await horizontalOverflow(mobilePage) <= 1, `${category} gallery overflows at 375px.`);
    if (category === "forms") {
      assert(await mobilePage.locator("#hero-search [data-home-search-bar]").count(), "Mobile Forms view does not show the real Home Search Bar.");
      await mobilePage.screenshot({ path: screenshot });
    } else {
      const mobileCarousel = mobilePage.locator("#meet-space-carousel");
      await mobileCarousel.scrollIntoViewIfNeeded();
      assert(await mobileCarousel.getByRole("button", { name: "Next photo" }).count(), "Mobile Media view does not show an operable Photo Carousel.");
      await mobilePage.screenshot({ path: screenshot });
    }
    await mobilePage.close();
  }

  const largeTextPage = await context.newPage();
  await largeTextPage.setViewportSize({ width: 375, height: 812 });
  await largeTextPage.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
  await largeTextPage.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
  assert(await horizontalOverflow(largeTextPage) <= 1, "Component library overflows with 24px root text.");
  await largeTextPage.close();

  const reducedPage = await context.newPage();
  await reducedPage.emulateMedia({ reducedMotion: "reduce" });
  await reducedPage.goto(`${componentUrl}#browse/media?q=Fade%20In`, { waitUntil: "networkidle" });
  const reducedFade = await reducedPage.locator("#fade-in .library-canvas-scope > div").evaluate((element) => ({ transform: getComputedStyle(element).transform, opacity: getComputedStyle(element).opacity }));
  assert(reducedFade.transform === "none" && reducedFade.opacity === "1", `Fade In did not bypass motion for reduced-motion users: ${JSON.stringify(reducedFade)}.`);
  await reducedPage.goto(`${componentUrl}#browse/media?q=Photo%20Carousel`, { waitUntil: "networkidle" });
  assert(await reducedPage.locator("#meet-space-carousel .swiper-coverflow").count() === 0, "Photo Carousel kept its 3D coverflow under reduced motion.");
  await reducedPage.locator("#meet-space-carousel").getByRole("button", { name: "Next photo" }).click();
  await reducedPage.locator("#meet-space-carousel").getByText("02 / 03").waitFor();
  await reducedPage.close();

  if (errors.length) fail(`Browser page errors: ${errors.join(" | ")}`);
  if (failedCatalogResponses.length) fail(`Built catalog returned failed first-party assets: ${failedCatalogResponses.join(" | ")}`);

  const productionPage = await context.newPage();
  const productionErrors = []; productionPage.on("pageerror", (error) => productionErrors.push(error.message));
  for (const width of [375, 1440]) {
    await productionPage.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of ["/", "/education", "/library", "/campus", "/co-living", "/events"]) {
      await productionPage.goto(`${productionOrigin}${route}`, { waitUntil: "domcontentloaded" });
      assert(await horizontalOverflow(productionPage) <= 1, `${route} overflows at ${width}px.`);
    }
  }
  await productionPage.setViewportSize({ width: 1440, height: 900 });
  await productionPage.goto(productionOrigin, { waitUntil: "networkidle" });
  const productionSearch = productionPage.getByRole("combobox", { name: "Search Fractal" });
  await productionSearch.waitFor();
  await productionPage.keyboard.press("/");
  assert(await productionSearch.evaluate((input) => document.activeElement === input), "Home lost its global slash search shortcut after extraction.");
  await productionSearch.fill("Campus");
  await productionSearch.press("ArrowDown");
  await productionSearch.press("Enter");
  await productionPage.waitForURL(`${productionOrigin}/campus`);
  await productionPage.setViewportSize({ width: 375, height: 812 });
  await productionPage.goto(productionOrigin, { waitUntil: "domcontentloaded" });
  assert(!(await productionPage.getByRole("combobox", { name: "Search Fractal" }).isVisible()) && await productionPage.locator("[data-hero-footer]").isVisible(), "Home mobile placement changed when the search was extracted.");
  await productionPage.goto(`${productionOrigin}/components`, { waitUntil: "domcontentloaded" });
  assert(await productionPage.getByText("Choose by looking").count() === 0, "Production exposes the team component gallery.");
  if (productionErrors.length) fail(`Production page errors: ${productionErrors.join(" | ")}`);
  await browser.close();
  console.log("Visual component gallery checks passed. FRAC-118 screenshots are in /tmp/frac118-{forms,media}-{1440x900,375x812}.png");
} finally {
  server.kill("SIGTERM"); productionServer.kill("SIGTERM");
}
