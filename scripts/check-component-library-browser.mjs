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
  assert(await page.getByRole("heading", { name: "Component Library", exact: true }).count() === 1, "Browse shell does not have exactly one Component Library heading.");
  const removedBrowseCopy = ["Team component gallery", "Choose by looking", "Select a component name for options, or copy its prompt and hand it to an agent.", "Pick the one that looks right", "The patterns editors use most often."];
  const visibleBrowseText = await page.locator("body").innerText();
  assert(removedBrowseCopy.every((phrase) => !visibleBrowseText.includes(phrase)), `Removed browse copy is still visible: ${removedBrowseCopy.filter((phrase) => visibleBrowseText.includes(phrase)).join(", ")}.`);
  assert(await page.locator(".library-gallery-heading").count() === 0, "Removed gallery heading wrapper is still rendered.");
  const desktopUtilityLayout = await page.evaluate(() => {
    const search = document.querySelector(".library-search")?.getBoundingClientRect();
    const tools = document.querySelector(".library-mode-switch")?.getBoundingClientRect();
    const categories = document.querySelector(".library-category-chooser")?.getBoundingClientRect();
    return search && tools && categories ? { searchTop: search.top, searchBottom: search.bottom, toolsTop: tools.top, toolsBottom: tools.bottom, categoriesTop: categories.top } : null;
  });
  assert(desktopUtilityLayout && Math.min(desktopUtilityLayout.searchBottom, desktopUtilityLayout.toolsBottom) > Math.max(desktopUtilityLayout.searchTop, desktopUtilityLayout.toolsTop), `Desktop search and tools do not share a row: ${JSON.stringify(desktopUtilityLayout)}.`);
  assert(desktopUtilityLayout.categoriesTop >= Math.max(desktopUtilityLayout.searchBottom, desktopUtilityLayout.toolsBottom), `Categories do not follow the utility row: ${JSON.stringify(desktopUtilityLayout)}.`);
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
      opens: card.querySelectorAll(".library-open-component").length,
      cues: [...card.querySelectorAll(".library-view-options")].filter((cue) => cue.getBoundingClientRect().width > 0 && cue.getBoundingClientRect().height > 0).length,
      copies: card.querySelectorAll(".library-copy-prompt").length,
    })));
    assert(cards.every(({ children, preview, names: nameCount, opens, cues, copies }) => children === 2 && preview && nameCount === 1 && opens === 1 && cues === 1 && copies === 1), `${category} has a non-minimal or undiscoverable tile.`);
    await page.screenshot({ path: `/tmp/frac130-${category}-1440x900.png` });
  }

  await page.goto(`${componentUrl}#browse/all`, { waitUntil: "networkidle" });
  const nativeCanvasTokens = {
    "action-buttons": "--color-house-events-light",
    "outbound-link": "--color-house-events-light",
    "outbound-text-link": "--color-house-education-deep",
    "inline-text-link": "--color-house-campus-light",
    "search-bar": "--color-background",
    "filter-bar": "--color-house-education-deep",
    "library-article-card": "--color-house-library-light",
    "note-callout": "--color-house-co-living-light",
    "course-card": "--color-house-education-deep",
    "club-card": "--color-house-education-deep",
    "campus-audience-highlight": "--color-house-campus-light",
    "editorial-quote": "--color-house-campus-light",
    "meet-space-carousel": "--color-background",
    "photo-gallery": "--color-background",
    "campus-banner": "--color-background",
  };
  for (const [id, token] of Object.entries(nativeCanvasTokens)) {
    const colors = await page.locator(`#${id}`).evaluate((card, tokenName) => {
      const resolve = (value) => {
        const probe = document.createElement("span");
        probe.style.color = value;
        document.body.append(probe);
        const result = getComputedStyle(probe).color;
        probe.remove();
        return result;
      };
      const root = getComputedStyle(document.documentElement);
      const canvas = card.querySelector(".library-gallery-preview > .library-canvas-scope");
      const actions = card.querySelector(".library-card-actions");
      return {
        expected: resolve(root.getPropertyValue(tokenName)),
        canvas: canvas ? getComputedStyle(canvas).backgroundColor : "",
        card: getComputedStyle(card).backgroundColor,
        chrome: resolve(root.getPropertyValue("--color-background")),
        actionsTop: actions?.getBoundingClientRect().top ?? 0,
        canvasBottom: canvas?.getBoundingClientRect().bottom ?? 0,
      };
    }, token);
    assert(colors.canvas === colors.expected, `${id} canvas is not using ${token}: ${JSON.stringify(colors)}.`);
    assert(colors.card === colors.chrome, `${id} recolored the catalogue card chrome: ${JSON.stringify(colors)}.`);
    assert(colors.actionsTop >= colors.canvasBottom, `${id} native color escaped behind its label/actions: ${JSON.stringify(colors)}.`);
  }
  const paperCardContexts = await page.evaluate(() => Object.fromEntries([
    ["library-article-card", "[data-document-byline]"],
    ["course-card", ".fractalu-course-card"],
    ["club-card", ".fractalu-club-card"],
  ].map(([id, selector]) => {
    const card = document.querySelector(`#${id}`);
    const productionContent = card?.querySelector(selector);
    const outer = card?.querySelector(".library-gallery-preview > .library-canvas-scope");
    const paper = productionContent?.closest("[data-component-surface='paper']");
    const paintedCard = productionContent?.closest(".rounded-lg") ?? productionContent;
    const nestedLink = paintedCard?.querySelector("a[data-outbound-link]");
    const root = getComputedStyle(document.documentElement);
    const resolve = (value) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    };
    return [id, {
      hasPaperScope: Boolean(paper),
      paperTransparent: paper ? getComputedStyle(paper).backgroundColor === "rgba(0, 0, 0, 0)" : false,
      contentBackground: paintedCard ? getComputedStyle(paintedCard).backgroundColor : "",
      contentColor: paintedCard ? getComputedStyle(paintedCard).color : "",
      linkColor: nestedLink ? getComputedStyle(nestedLink).color : "",
      paperColor: resolve(root.getPropertyValue("--color-background")),
      inkColor: resolve(root.getPropertyValue("--color-foreground")),
      outerBackground: outer ? getComputedStyle(outer).backgroundColor : "",
    }];
  })));
  assert(Object.values(paperCardContexts).every(({ hasPaperScope, paperTransparent }) => hasPaperScope && paperTransparent), `Native cards lost their transparent paper token scope: ${JSON.stringify(paperCardContexts)}.`);
  assert(Object.values(paperCardContexts).every(({ contentBackground, contentColor, linkColor, paperColor, inkColor }) => contentBackground === paperColor && contentColor === inkColor && (!linkColor || linkColor === inkColor)), `Nested Article/Course/Club content stopped owning paper contrast: ${JSON.stringify(paperCardContexts)}.`);

  await page.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
  assert((await page.locator('.library-gallery-shell > [role="status"]').innerText()).trim() === "9 components shown", "Common count announcement is wrong.");
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
  const hoverCard = page.locator("#action-buttons");
  const hoverRest = await hoverCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow, transform: getComputedStyle(card).transform }));
  await hoverCard.hover();
  await page.waitForTimeout(180);
  const hoverActive = await hoverCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow, transform: getComputedStyle(card).transform, durations: getComputedStyle(card).transitionDuration.split(",").map((duration) => duration.trim().endsWith("ms") ? Number.parseFloat(duration) : Number.parseFloat(duration) * 1000) }));
  assert(hoverActive.transform !== "none" && (hoverActive.border !== hoverRest.border || hoverActive.shadow !== hoverRest.shadow), `Card hover does not provide motion plus non-motion feedback: ${JSON.stringify({ hoverRest, hoverActive })}.`);
  assert(hoverActive.durations.every((duration) => duration <= 180), `Card hover exceeds 180ms: ${hoverActive.durations.join(", ")}.`);
  const hoverBox = await hoverCard.boundingBox();
  assert(hoverBox, "Primary Button card has no hover box.");
  await hoverCard.evaluate((card) => card.addEventListener("click", (event) => event.preventDefault(), { capture: true, once: true }));
  await page.mouse.move(hoverBox.x + 4, hoverBox.y + 4);
  await page.mouse.down();
  await page.waitForTimeout(100);
  const pressedTransform = await hoverCard.evaluate((card) => getComputedStyle(card).transform);
  assert(pressedTransform !== "none" && pressedTransform !== hoverActive.transform, `Card press has no distinct scale feedback: ${pressedTransform}.`);
  await page.mouse.up();
  await page.mouse.move(0, 0);
  const focusCard = page.locator("#action-buttons");
  await focusCard.locator(".library-open-component").focus();
  const focusFeedback = await focusCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow }));
  assert(focusFeedback.border === activeChrome.foreground && focusFeedback.shadow !== "none", `View options focus has no equivalent card feedback: ${JSON.stringify(focusFeedback)}.`);
  await page.screenshot({ path: "/tmp/frac130-common-1440x900.png" });

  const search = page.getByRole("searchbox", { name: "Search components" });
  for (const [query, expected] of [
    ["homepage search", "Search Bar"], ["archive search field", "Search Bar"], ["course subject filter", "Filter Bar"],
    ["campus highlight", "Highlight Box"], ["outsource link", "Standalone Link"], ["inter outbound link", "Outbound Text Link"],
  ]) {
    await search.fill(query);
    assert(await page.getByRole("link", { name: `View options for ${expected}`, exact: true }).count() === 1, `${query} did not resolve to ${expected}.`);
  }
  await search.fill("");
  const copyHash = new URL(page.url()).hash;
  await page.getByRole("button", { name: "Copy prompt for Primary Button" }).click();
  assert((await page.evaluate(() => navigator.clipboard.readText())).includes("Inherit the target page or section’s approved house/section color tokens"), "Copy Prompt lost token inheritance guidance.");
  assert(new URL(page.url()).hash === copyHash, "Copy Prompt opened a component or changed the browse hash.");

  await page.locator("#note-callout .library-gallery-preview").dispatchEvent("click");
  await page.waitForFunction(() => window.location.hash === "#component/note-callout");
  assert(await page.getByRole("heading", { name: "Note Box", exact: true }).count() === 1, "Card surface did not open Note Box detail.");
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.location.hash === "#browse/common");
  await page.getByRole("link", { name: "View options for Note Box" }).click();
  await page.waitForFunction(() => window.location.hash === "#component/note-callout");
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.location.hash === "#browse/common");

  await page.getByRole("button", { name: "Edit Education courses" }).click();
  await page.waitForFunction(() => window.location.hash === "#education");
  assert(await page.getByRole("button", { name: "← Back to components" }).count() === 1, "Education workshop did not open from the compact tool row.");
  await page.getByRole("button", { name: "← Back to components" }).click();
  await page.waitForFunction(() => window.location.hash === "#browse/common");

  await page.goto(`${componentUrl}#browse/actions`, { waitUntil: "networkidle" });
  const actionSearch = page.getByRole("searchbox", { name: "Search components" });
  await actionSearch.fill("inline");
  await page.locator("#inline-text-link .library-gallery-preview").dispatchEvent("click");
  await page.waitForFunction(() => window.location.hash === "#component/inline-text-link");
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.location.hash === "#browse/actions?q=inline");
  assert(await actionSearch.inputValue() === "inline", "Browser Back did not restore the prior component query.");
  assert(await page.locator("#inline-text-link .library-open-component").evaluate((link) => document.activeElement === link), "Browser Back did not restore focus to the View options link.");

  await page.goto(`${componentUrl}#browse/actions`, { waitUntil: "networkidle" });
  const actionsHash = new URL(page.url()).hash;
  await page.locator("#action-buttons .library-gallery-preview button").click();
  assert(new URL(page.url()).hash === actionsHash, "Primary Button preview opened its card.");
  await page.locator("#outbound-link .library-gallery-preview a[data-outbound-link]").evaluate((link) => link.addEventListener("click", (event) => event.preventDefault(), { once: true }));
  await page.locator("#outbound-link .library-gallery-preview a[data-outbound-link]").click();
  assert(new URL(page.url()).hash === actionsHash, "Standalone Link preview opened its card.");
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
  const nativeLinkTreatments = await page.evaluate(() => Object.fromEntries([
    ["outbound-link", "light"],
    ["outbound-text-link", "dark"],
    ["inline-text-link", "dark"],
  ].map(([id, expectedTone]) => {
    const card = document.querySelector(`#${id}`);
    const scope = card?.querySelector(".library-gallery-preview > .library-canvas-scope");
    const link = card?.querySelector("a[data-outbound-link]");
    link?.focus();
    const linkStyle = link ? getComputedStyle(link) : null;
    const scopeStyle = scope ? getComputedStyle(scope) : null;
    return [id, {
      expectedTone,
      tone: link?.getAttribute("data-outbound-tone"),
      linkColor: linkStyle?.color,
      decoration: linkStyle?.textDecorationColor,
      surfaceColor: scopeStyle?.backgroundColor,
      onSurfaceColor: scopeStyle?.color,
      decorationToken: scopeStyle?.getPropertyValue("--component-link-decoration").trim(),
      ringOffset: scopeStyle?.getPropertyValue("--component-ring-offset").trim(),
    }];
  })));
  assert(Object.values(nativeLinkTreatments).every(({ expectedTone, tone, linkColor, decoration, onSurfaceColor, surfaceColor, decorationToken, ringOffset }) => tone === expectedTone && linkColor === onSurfaceColor && decoration !== "rgba(0, 0, 0, 0)" && decorationToken?.startsWith("color-mix") && ringOffset && surfaceColor), `Native link contrast is not semantic: ${JSON.stringify(nativeLinkTreatments)}.`);

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
    await page.screenshot({ path: `/tmp/frac130-detail-${id}-1440x900.png` });
  }

  for (const id of ["outbound-link", "outbound-text-link", "inline-text-link"]) {
    await page.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    const scope = page.locator(".library-detail-preview > .library-canvas-scope");
    const link = page.locator(".library-detail-preview a[data-outbound-link]");
    await page.getByLabel("Site color").selectOption("neutral");
    await page.getByLabel("Background").selectOption("paper");
    await page.waitForTimeout(200);
    const alternate = await page.evaluate(() => {
      const canvas = document.querySelector(".library-detail-preview > .library-canvas-scope");
      const anchor = document.querySelector(".library-detail-preview a[data-outbound-link]");
      return canvas && anchor ? {
        colorway: canvas.getAttribute("data-component-colorway"),
        surface: canvas.getAttribute("data-component-surface"),
        tone: anchor.getAttribute("data-outbound-tone"),
        canvasColor: getComputedStyle(canvas).color,
        linkColor: getComputedStyle(anchor).color,
      } : null;
    });
    assert(alternate && alternate.colorway === "neutral" && alternate.surface === "paper" && alternate.tone === "light" && alternate.canvasColor === alternate.linkColor, `${id} did not adapt safely after changing its approved pairing: ${JSON.stringify(alternate)}.`);
    assert(await scope.count() === 1 && await link.count() === 1, `${id} stopped using its production preview after changing theme.`);
  }

  for (const legacyView of ["component", "preview"]) {
    await page.goto(`${componentUrl}#${legacyView}/prominent-text-link`, { waitUntil: "networkidle" });
    await page.waitForFunction((expected) => window.location.hash === expected, `#${legacyView}/outbound-text-link`);
    assert(new URL(page.url()).hash === `#${legacyView}/outbound-text-link`, `Legacy ${legacyView} hash did not canonicalize.`);
    assert(await page.getByRole("heading", { name: "Outbound Text Link" }).count() === 1, `Legacy ${legacyView} hash did not render Outbound Text Link.`);
  }

  await page.goto(`${componentUrl}#component/note-callout`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/frac130-detail-note-1440x900.png" });
  assert(await page.getByLabel("Actions").count() === 0 && await page.locator(".library-detail-preview button").count() === 0, "Note Box still exposes an action slot.");
  assert(await page.locator(".library-detail-preview p a[data-outbound-link]").count() === 1 && await page.locator(".library-detail-preview [data-outbound-arrow]").count() === 0, "Note Box does not use an inline prose link.");
  await page.getByLabel("Site color").selectOption("campus");
  const themedAccent = await page.locator(".library-detail-preview .library-canvas-scope").evaluate((element) => getComputedStyle(element).getPropertyValue("--component-accent"));
  await page.getByLabel("Site color").selectOption("education");
  await page.getByLabel("Background").selectOption("deep");
  await page.waitForTimeout(200);
  const secondAccent = await page.locator(".library-detail-preview .library-canvas-scope").evaluate((element) => getComputedStyle(element).getPropertyValue("--component-accent"));
  assert(themedAccent && secondAccent && themedAccent !== secondAccent, "Themed specimens no longer change token pairings.");
  const notePaperContrast = await page.evaluate(() => {
    const canvas = document.querySelector(".library-detail-preview > .library-canvas-scope");
    const card = document.querySelector(".library-detail-preview .component-paper-surface");
    const link = document.querySelector(".library-detail-preview .component-paper-surface a[data-outbound-link]");
    link?.focus();
    const root = getComputedStyle(document.documentElement);
    const resolve = (value) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const result = getComputedStyle(probe).color;
      probe.remove();
      return result;
    };
    const canvasStyle = canvas ? getComputedStyle(canvas) : null;
    const cardStyle = card ? getComputedStyle(card) : null;
    const linkStyle = link ? getComputedStyle(link) : null;
    return {
      colorway: canvas?.getAttribute("data-component-colorway"),
      surface: canvas?.getAttribute("data-component-surface"),
      canvasBackground: canvasStyle?.backgroundColor,
      canvasText: canvasStyle?.color,
      expectedCanvas: resolve(root.getPropertyValue("--color-house-education-deep")),
      cardBackground: cardStyle?.backgroundColor,
      cardText: cardStyle?.color,
      expectedPaper: resolve(root.getPropertyValue("--color-background")),
      expectedInk: resolve(root.getPropertyValue("--color-foreground")),
      linkColor: linkStyle?.color,
      decoration: linkStyle?.textDecorationColor,
      ringOffset: linkStyle?.getPropertyValue("--tw-ring-offset-color").trim(),
    };
  });
  assert(notePaperContrast.colorway === "education" && notePaperContrast.surface === "deep" && notePaperContrast.canvasBackground === notePaperContrast.expectedCanvas, `Note Box reproduction did not reach Education/deep: ${JSON.stringify(notePaperContrast)}.`);
  assert(notePaperContrast.cardBackground === notePaperContrast.expectedPaper && notePaperContrast.cardText === notePaperContrast.expectedInk && notePaperContrast.linkColor === notePaperContrast.expectedInk && notePaperContrast.linkColor !== notePaperContrast.canvasText, `Paper Note Box lost nearest-surface contrast: ${JSON.stringify(notePaperContrast)}.`);
  assert(notePaperContrast.decoration && notePaperContrast.decoration !== "rgba(0, 0, 0, 0)" && notePaperContrast.ringOffset, `Paper Note Box lost decoration or ring offset: ${JSON.stringify(notePaperContrast)}.`);
  await page.screenshot({ path: "/tmp/frac130-rework-note-education-deep-paper-1440x900.png" });

  await page.goto(`${componentUrl}#component/library-article-card`, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  const articleBylineFont = await page.locator(".library-detail-preview [data-document-byline]").evaluate((element) => getComputedStyle(element).fontFamily);
  assert(articleBylineFont.includes("Inter"), `Article Card byline is not Inter: ${articleBylineFont}.`);
  const articleBylineStyle = await page.locator(".library-detail-preview [data-document-byline]").evaluate((element) => ({ style: getComputedStyle(element).fontStyle, classes: element.className }));
  assert(articleBylineStyle.style === "normal" && articleBylineStyle.classes.includes("text-body") && !articleBylineStyle.classes.includes("text-aside"), `Article Card byline is not upright body Inter: ${JSON.stringify(articleBylineStyle)}.`);
  assert(await page.locator(".library-detail-preview [data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() === 1, "Article Card lost its decorative shared category icon.");
  await page.screenshot({ path: "/tmp/frac130-detail-article-1440x900.png" });

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
  await courseSubject.selectOption("Literature");
  const galleryCourseCollection = page.locator(".library-detail-preview [data-course-collection]");
  const galleryCourseCard = galleryCourseCollection.locator("[data-course-id]");
  const galleryCourseDescription = galleryCourseCard.locator("[data-course-description]");
  const galleryInstructor = galleryCourseCard.locator("[data-instructor-name]");
  const galleryBiography = galleryCourseCard.locator("[data-instructor-bio]");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(220);
  assert(await galleryCourseCollection.getAttribute("data-preview-mode") === "enhanced", "Desktop Course Card specimen is not using the production enhanced collection mode.");
  assert(await galleryCourseCollection.locator('[data-fractalu-reveal-mode="static"]').count() === 1, "Course Card specimen did not disable only its entrance reveal.");
  const restingPreviewState = await galleryCourseCard.evaluate((card) => {
    const description = card.querySelector("[data-course-description]");
    const biography = card.querySelector("[data-instructor-bio]");
    const cardStyle = getComputedStyle(card);
    return {
      cardHeight: card.getBoundingClientRect().height,
      border: cardStyle.borderColor,
      shadow: cardStyle.boxShadow,
      transform: cardStyle.transform,
      descriptionPosition: description ? getComputedStyle(description).position : null,
      descriptionVisibility: description ? getComputedStyle(description).visibility : null,
      biographyPosition: biography ? getComputedStyle(biography).position : null,
      biographyVisibility: biography ? getComputedStyle(biography).visibility : null,
    };
  });
  assert(restingPreviewState.cardHeight < 700 && restingPreviewState.descriptionPosition === "absolute" && restingPreviewState.descriptionVisibility === "hidden" && restingPreviewState.biographyPosition === "absolute" && restingPreviewState.biographyVisibility === "hidden", `Desktop Course Card is not compact at rest: ${JSON.stringify(restingPreviewState)}.`);
  await page.screenshot({ path: "/tmp/frac130-detail-course-1440x900.png" });

  await galleryCourseCard.hover();
  await page.waitForTimeout(220);
  const galleryHoverState = await galleryCourseCard.evaluate((card) => {
    const style = getComputedStyle(card);
    return { border: style.borderColor, shadow: style.boxShadow, transform: style.transform };
  });
  assert(galleryHoverState.transform !== restingPreviewState.transform && galleryHoverState.border !== restingPreviewState.border && galleryHoverState.shadow !== restingPreviewState.shadow, `Course Card specimen lost its production lift/border/shadow response: ${JSON.stringify({ restingPreviewState, galleryHoverState })}.`);

  const productionParity = await context.newPage();
  await productionParity.setViewportSize({ width: 1440, height: 900 });
  await productionParity.goto(`${productionOrigin}/education`, { waitUntil: "networkidle" });
  await productionParity.waitForTimeout(700);
  const productionCourseCard = productionParity.locator("[data-course-id]").first();
  await productionCourseCard.hover();
  await productionParity.waitForTimeout(220);
  const productionHoverState = await productionCourseCard.evaluate((card) => {
    const style = getComputedStyle(card);
    return { border: style.borderColor, shadow: style.boxShadow, transform: style.transform };
  });
  assert(JSON.stringify(galleryHoverState) === JSON.stringify(productionHoverState), `Gallery and production Course Card hover responses differ: ${JSON.stringify({ galleryHoverState, productionHoverState })}.`);
  await productionParity.close();

  const galleryCourseTitle = galleryCourseCard.locator(".fractalu-course-title-link");
  await galleryCourseTitle.hover();
  await page.waitForTimeout(180);
  assert(await galleryCourseDescription.evaluate((element) => getComputedStyle(element).visibility) === "visible", "Course title hover did not reveal its description preview.");
  assert(await galleryBiography.evaluate((element) => getComputedStyle(element).visibility) === "hidden", "Course title hover incorrectly revealed the instructor biography.");
  await page.screenshot({ path: "/tmp/frac129-course-card-title-preview-1440x900.png" });

  const galleryApplyLink = galleryCourseCard.getByRole("link", { name: /Apply for The Lost Generation Close Reading/ });
  await galleryApplyLink.focus();
  await galleryApplyLink.evaluate((element) => element.blur());
  await galleryInstructor.hover();
  await page.waitForTimeout(180);
  assert(await galleryBiography.evaluate((element) => getComputedStyle(element).visibility) === "visible", "Instructor hover did not reveal the biography preview.");
  assert(await galleryCourseDescription.evaluate((element) => getComputedStyle(element).visibility) === "hidden", "Instructor hover incorrectly revealed the course description.");
  await page.screenshot({ path: "/tmp/frac129-course-card-instructor-preview-1440x900.png" });

  await galleryInstructor.click();
  assert(await galleryInstructor.getAttribute("aria-expanded") === "true", "Instructor click did not pin the biography preview.");
  await page.mouse.move(0, 0);
  assert(await galleryBiography.evaluate((element) => getComputedStyle(element).visibility) === "visible", "Pinned biography closed when the pointer left.");
  await page.keyboard.press("Escape");
  assert(await galleryInstructor.getAttribute("aria-expanded") === "false", "Escape did not close the pinned biography.");
  assert(await galleryInstructor.evaluate((element) => document.activeElement === element), "Escape did not restore focus to the instructor control.");
  assert(await galleryInstructor.locator("..").getAttribute("data-suppressed") === "true", "Escape did not suppress the focus-within preview.");
  await page.waitForTimeout(180);
  assert(await galleryBiography.evaluate((element) => getComputedStyle(element).visibility) === "hidden", "Escape left the suppressed biography visible.");
  await galleryApplyLink.focus();
  assert(await galleryInstructor.locator("..").getAttribute("data-suppressed") === "false", "Biography suppression did not reset after focus left.");
  await galleryCourseTitle.focus();
  await page.waitForTimeout(180);
  assert(await galleryCourseDescription.evaluate((element) => getComputedStyle(element).visibility) === "visible", "Course title focus did not reveal its description preview.");

  await page.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
  const galleryTileCollection = page.locator("#course-card [data-course-collection]");
  const galleryTileDescription = galleryTileCollection.locator("[data-course-description]");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(220);
  assert(await galleryTileCollection.getAttribute("data-preview-mode") === "enhanced", "Browse-tile Course Card is not using the production enhanced collection mode.");
  assert(await galleryTileDescription.evaluate((element) => getComputedStyle(element).visibility) === "hidden", "Browse-tile Course Card is not compact at rest.");
  await page.locator("#course-card").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "/tmp/frac129-course-card-gallery-rest-1440x900.png" });
  await galleryTileCollection.locator(".fractalu-course-title-link").hover();
  await page.waitForTimeout(180);
  assert(await galleryTileDescription.evaluate((element) => getComputedStyle(element).visibility) === "visible", "Browse-tile Course Card title hover did not reveal its description.");
  assert(await page.locator("#course-card .library-canvas").evaluate((element) => getComputedStyle(element).overflow) === "visible" && await page.locator("#course-card").evaluate((element) => getComputedStyle(element).overflow) === "visible", "Browse-tile Course Card preview is clipped by gallery-only overflow.");
  await page.screenshot({ path: "/tmp/frac129-course-card-gallery-title-preview-1440x900.png" });

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
  assert(await singleChips.evaluateAll((buttons) => buttons.every((button) => Math.round(button.getBoundingClientRect().height) >= 44 && Math.round(button.getBoundingClientRect().width) >= 44)), "Filter chips are smaller than 44px.");
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

  await page.goto(`${componentUrl}#browse/forms`, { waitUntil: "networkidle" });
  const formsHash = new URL(page.url()).hash;
  const embeddedSearch = page.locator("#search-bar .library-gallery-preview input");
  await embeddedSearch.fill("Campus");
  assert(await embeddedSearch.inputValue() === "Campus" && new URL(page.url()).hash === formsHash, "Embedded Search Bar typing opened its card or changed the browse route.");
  const embeddedFilterChip = page.locator("#filter-bar .library-gallery-preview [data-filter-bar] button").nth(1);
  await embeddedFilterChip.click();
  assert(await embeddedFilterChip.getAttribute("aria-pressed") === "true" && new URL(page.url()).hash === formsHash, "Embedded Filter Bar chip opened its card or failed to select.");

  await page.goto(`${componentUrl}#browse/media`, { waitUntil: "networkidle" });
  const mediaHash = new URL(page.url()).hash;
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
  assert(new URL(page.url()).hash === mediaHash, "Photo Carousel control opened its card.");

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
    if (width <= 375) {
      const compactLayout = await matrixPage.evaluate(() => {
        const box = (selector) => document.querySelector(selector)?.getBoundingClientRect();
        const title = box(".library-title");
        const search = box(".library-search");
        const tools = box(".library-mode-switch");
        const categories = box(".library-category-chooser");
        const toolButtons = [...document.querySelectorAll(".library-mode-switch button")].map((button) => button.getBoundingClientRect());
        return title && search && tools && categories ? { titleBottom: title.bottom, searchTop: search.top, searchBottom: search.bottom, toolsTop: tools.top, toolsBottom: tools.bottom, categoriesTop: categories.top, toolButtons: toolButtons.map(({ width: buttonWidth, height }) => ({ width: buttonWidth, height })) } : null;
      });
      assert(compactLayout && compactLayout.titleBottom <= compactLayout.searchTop && compactLayout.searchBottom <= compactLayout.toolsTop && compactLayout.toolsBottom <= compactLayout.categoriesTop, `${width}px browse controls are out of logical order: ${JSON.stringify(compactLayout)}.`);
      assert(compactLayout.toolButtons.length === 2 && compactLayout.toolButtons.every(({ width: buttonWidth, height }) => buttonWidth >= 44 && height >= 44), `${width}px tool choices are not both usable: ${JSON.stringify(compactLayout.toolButtons)}.`);
    }
    if (width === 375) await matrixPage.screenshot({ path: "/tmp/frac130-common-375x812.png" });
    await matrixPage.close();
  }
  for (const category of ["actions", "forms", "cards", "media"]) {
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${componentUrl}#browse/${category}`, { waitUntil: "networkidle" });
    assert(await overflow(mobile) <= 1, `${category} overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac130-${category}-375x812.png` });
    await mobile.close();
  }
  for (const id of ["outbound-text-link", "inline-text-link"]) {
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 812 });
    await mobile.goto(`${componentUrl}#component/${id}`, { waitUntil: "networkidle" });
    const link = mobile.locator(".library-detail-preview a[data-outbound-link]");
    assert(await link.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)) === 16, `${id} mobile body context is not 16px.`);
    assert(await overflow(mobile) <= 1, `${id} body context overflows at 375px.`);
    await mobile.screenshot({ path: `/tmp/frac130-detail-${id}-375x812.png` });
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
  await articleMobile.screenshot({ path: "/tmp/frac130-detail-article-375x812.png" });
  await articleMobile.close();

  const noteMobile = await context.newPage();
  await noteMobile.setViewportSize({ width: 375, height: 812 });
  await noteMobile.goto(`${componentUrl}#component/note-callout`, { waitUntil: "networkidle" });
  assert(await overflow(noteMobile) <= 1, "Note Box detail overflows at 375px.");
  await noteMobile.screenshot({ path: "/tmp/frac130-detail-note-375x812.png" });
  await noteMobile.close();

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
    const mobileCollection = courseMobile.locator(".library-detail-preview [data-course-collection]");
    const mobileDescription = mobileCollection.locator("[data-course-description]");
    const mobileBiography = mobileCollection.locator("[data-instructor-bio]");
    assert(await mobileCollection.getAttribute("data-preview-mode") === "inline", `${width}px Course Card did not use inline mode.`);
    assert(await mobileCollection.getByRole("button", { name: "Elena Navarrete" }).count() === 0, `${width}px instructor should be non-interactive body text.`);
    assert(await mobileDescription.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.position === "static" && style.visibility === "visible";
    }), `${width}px course description is not inline and visible.`);
    assert(await mobileBiography.evaluate((element) => getComputedStyle(element).display) === "none", `${width}px compact biography policy changed.`);
    assert(await overflow(courseMobile) <= 1, `Course Card long subject overflows at ${width}px.`);
    await courseMobile.screenshot({ path: `/tmp/frac130-detail-course-${suffix}.png` });
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
  await largeText.setViewportSize({ width: 1440, height: 900 });
  await largeText.goto(`${componentUrl}#component/course-card`, { waitUntil: "networkidle" });
  await largeText.getByLabel("Subject and icon").selectOption("Experimental category");
  await largeText.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
  await largeText.locator(".library-detail-preview [data-category-icon-label] span:last-child").evaluate((label) => {
    label.textContent = "Experimental interdisciplinary investigations across many practices";
  });
  await largeText.waitForFunction(() => document.querySelector(".library-detail-preview [data-course-collection]")?.getAttribute("data-preview-mode") === "inline");
  assert(await largeText.locator(".library-detail-preview [data-course-description]").evaluate((element) => {
    const style = getComputedStyle(element);
    return style.position === "static" && style.visibility === "visible";
  }), "Large-text Course Card left its description hover-dependent.");
  assert(await largeText.locator(".library-detail-preview [data-instructor-name]").evaluate((element) => element.tagName === "P"), "Large-text Course Card kept an enhanced instructor button.");
  assert(await overflow(largeText) <= 1, "Course Card overflows with a long subject and 24px root text.");
  await largeText.screenshot({ path: "/tmp/frac129-course-card-large-text-1440x900.png" });
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
  await reduced.goto(`${componentUrl}#browse/common`, { waitUntil: "networkidle" });
  const reducedCard = reduced.locator("#action-buttons");
  const reducedRestBorder = await reducedCard.evaluate((card) => getComputedStyle(card).borderColor);
  await reducedCard.hover();
  await reduced.waitForTimeout(180);
  const reducedHover = await reducedCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow, transform: getComputedStyle(card).transform }));
  assert(reducedHover.transform === "none" && (reducedHover.border !== reducedRestBorder || reducedHover.shadow !== "none"), `Reduced-motion card lost non-motion hover feedback or still transforms: ${JSON.stringify(reducedHover)}.`);
  const reducedOpen = reducedCard.locator(".library-open-component");
  await reducedOpen.focus();
  const reducedFocus = await reduced.evaluate(() => ({ cardTransform: getComputedStyle(document.querySelector("#action-buttons")).transform, linkTransform: getComputedStyle(document.querySelector("#action-buttons .library-open-component")).transform, cueTransform: getComputedStyle(document.querySelector("#action-buttons .library-view-options")).transform, border: getComputedStyle(document.querySelector("#action-buttons")).borderColor }));
  assert(reducedFocus.cardTransform === "none" && reducedFocus.linkTransform === "none" && reducedFocus.cueTransform === "none" && reducedFocus.border !== reducedRestBorder, `Reduced-motion focus feedback is wrong: ${JSON.stringify(reducedFocus)}.`);
  await reduced.goto(`${componentUrl}#component/course-card`, { waitUntil: "networkidle" });
  const reducedCourseCard = reduced.locator(".library-detail-preview [data-course-id]");
  const reducedCourseDescription = reducedCourseCard.locator("[data-course-description]");
  await reduced.mouse.move(0, 0);
  await reduced.waitForTimeout(20);
  const reducedCourseRest = await reducedCourseCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow }));
  await reducedCourseCard.hover();
  await reduced.waitForTimeout(20);
  const reducedCourseHover = await reducedCourseCard.evaluate((card) => ({ border: getComputedStyle(card).borderColor, shadow: getComputedStyle(card).boxShadow, transform: getComputedStyle(card).transform, transitionDuration: getComputedStyle(card).transitionDuration }));
  assert(reducedCourseHover.transform === "none" && reducedCourseHover.transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0) && (reducedCourseHover.border !== reducedCourseRest.border || reducedCourseHover.shadow !== reducedCourseRest.shadow), `Reduced-motion Course Card feedback is wrong: ${JSON.stringify({ reducedCourseRest, reducedCourseHover })}.`);
  await reducedCourseCard.locator(".fractalu-course-title-link").hover();
  assert(await reducedCourseDescription.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.visibility === "visible" && style.transform === "none" && style.transitionDuration.split(",").every((duration) => Number.parseFloat(duration) === 0);
  }), "Reduced-motion Course Card lost its non-motion description reveal.");
  await reduced.close();

  assert(browserErrors.length === 0, `Catalog page errors: ${browserErrors.join(" | ")}`);
  assert(failedAssets.length === 0, `Catalog failed assets: ${failedAssets.join(" | ")}`);

  const production = await context.newPage();
  const productionErrors = [];
  production.on("pageerror", (error) => productionErrors.push(error.message));
  for (const width of [375, 1440]) {
    await production.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of ["/", "/co-living", "/library", "/education", "/campus"]) {
      await production.goto(`${productionOrigin}${route}`, { waitUntil: "networkidle" });
      assert(await overflow(production) <= 1, `${route} overflows at ${width}px.`);
      const affected = route === "/library" ? production.locator("[data-document-byline]").first() : route === "/education" ? production.locator("[data-course-id]").first() : route === "/campus" ? production.locator("[data-highlight-box]").first() : null;
      if (affected) {
        await affected.evaluate((element) => element.scrollIntoView({ block: "center" }));
        await production.waitForTimeout(700);
      }
      if (route === "/library") {
        const articleBylines = production.locator("[data-document-byline]");
        const fullArticleCount = await articleBylines.count();
        assert(fullArticleCount > 1, `Production Library did not render its full archive at ${width}px.`);
        const articleSurfaces = await articleBylines.evaluateAll((bylines) => bylines.map((byline) => {
          const scope = byline.closest("[data-component-colorway]");
          const card = byline.closest(".bg-background");
          const slot = scope?.parentElement;
          return {
            colorway: scope?.getAttribute("data-component-colorway"),
            surface: scope?.getAttribute("data-component-surface"),
            inlineBackground: scope?.style.backgroundColor,
            scopeBackground: scope ? getComputedStyle(scope).backgroundColor : null,
            slotBackground: slot ? getComputedStyle(slot).backgroundColor : null,
            cardBackground: card ? getComputedStyle(card).backgroundColor : null,
            hasTransparentClass: scope?.classList.contains("bg-transparent"),
            icons: card?.querySelectorAll("[data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").length ?? 0,
            corners: scope?.querySelectorAll(":scope > .relative > span.absolute.pointer-events-none svg").length ?? 0,
          };
        }));
        assert(articleSurfaces.every(({ colorway, surface, inlineBackground, scopeBackground, slotBackground, cardBackground, hasTransparentClass, icons, corners }) => colorway === "library" && surface === "paper" && inlineBackground === "transparent" && scopeBackground === "rgba(0, 0, 0, 0)" && slotBackground === "rgba(0, 0, 0, 0)" && cardBackground === "rgb(247, 246, 242)" && !hasTransparentClass && icons === 1 && corners === 4), `Production Library scope/card surfaces diverged at ${width}px: ${JSON.stringify(articleSurfaces)}.`);
        const archiveGrid = articleBylines.first().locator("xpath=ancestor::div[contains(@class, 'grid')][1]");
        assert(await archiveGrid.evaluate((element) => getComputedStyle(element).backgroundColor) === "rgba(0, 0, 0, 0)", `Production Library grid has a background at ${width}px.`);
        const bylineFont = await articleBylines.first().evaluate((element) => getComputedStyle(element).fontFamily);
        const bylineStyle = await articleBylines.first().evaluate((element) => getComputedStyle(element).fontStyle);
        assert(bylineFont.includes("Inter"), `Production Library byline is not Inter at ${width}px: ${bylineFont}.`);
        assert(bylineStyle === "normal", `Production Library byline is italic at ${width}px: ${bylineStyle}.`);
        assert(await production.locator("[data-category-icon-label] [data-category-icon] svg[aria-hidden='true']").count() > 0, "Production Library lost decorative category icons.");
        await articleBylines.first().scrollIntoViewIfNeeded();
        await production.screenshot({ path: `/tmp/frac127-library-${width === 375 ? "375x812" : "1440x900"}.png` });

        const archiveSearchForState = production.getByRole("searchbox", { name: "Search the archive" });
        await archiveSearchForState.fill("Reversing the Centrifuge of Modernity");
        await production.waitForFunction(() => document.querySelectorAll("[data-document-byline]").length === 1);
        assert(await production.getByText(/Showing\s+1\s+of/).count() === 1, `Production Library partial count is wrong at ${width}px.`);
        const partialSurface = await production.locator("[data-document-byline]").evaluate((byline) => {
          const scope = byline.closest("[data-component-colorway]");
          const card = byline.closest(".bg-background");
          return { scope: scope ? getComputedStyle(scope).backgroundColor : null, card: card ? getComputedStyle(card).backgroundColor : null };
        });
        assert(partialSurface.scope === "rgba(0, 0, 0, 0)" && partialSurface.card === "rgb(247, 246, 242)", `Production Library partial row surfaces diverged at ${width}px: ${JSON.stringify(partialSurface)}.`);
        await production.locator("[data-document-byline]").scrollIntoViewIfNeeded();
        await production.waitForTimeout(800);
        await production.screenshot({ path: `/tmp/frac127-library-filtered-${width === 375 ? "375x812" : "1440x900"}.png` });

        await archiveSearchForState.fill("no matching fractal archive record zzz");
        const emptyMessage = production.getByText("No documents match your filters.");
        await emptyMessage.waitFor();
        assert(await production.locator("[data-document-byline]").count() === 0 && await production.locator("[data-component-colorway='library']").count() === 0, `Production Library empty state retained Article Card scopes at ${width}px.`);
        assert(await emptyMessage.locator("..").evaluate((element) => getComputedStyle(element).backgroundColor) === "rgba(0, 0, 0, 0)", `Production Library empty state has a background at ${width}px.`);
        await production.screenshot({ path: `/tmp/frac127-library-empty-${width === 375 ? "375x812" : "1440x900"}.png` });

        const stateClear = production.getByRole("button", { name: "Clear search" });
        assert(await stateClear.count() === 1, `Production Library empty state has duplicate clear controls at ${width}px.`);
        await stateClear.click();
        await production.waitForFunction((expected) => document.querySelectorAll("[data-document-byline]").length === expected, fullArticleCount);
        assert(await archiveSearchForState.inputValue() === "" && await production.locator("[data-component-colorway='library']").count() === fullArticleCount, `Production Library clear did not recover its full transparent grid at ${width}px.`);
      }
      if (route === "/" || route === "/co-living") {
        const label = route === "/" ? "Curious about Fractal?" : "Visiting NYC?";
        const noteLabel = production.getByText(label, { exact: true });
        await noteLabel.scrollIntoViewIfNeeded();
        await production.waitForTimeout(300);
        const noteSurface = await noteLabel.evaluate((element) => {
          const card = element.closest(".rounded-md");
          const scope = card?.closest("[data-component-colorway]");
          return {
            colorway: scope?.getAttribute("data-component-colorway"),
            surface: scope?.getAttribute("data-component-surface"),
            inlineBackground: scope?.style.backgroundColor,
            scopeBackground: scope ? getComputedStyle(scope).backgroundColor : null,
            cardBackground: card ? getComputedStyle(card).backgroundColor : null,
            hasTransparentClass: scope?.classList.contains("bg-transparent"),
            corners: card?.querySelectorAll("span.absolute.pointer-events-none svg").length ?? 0,
            arrows: card?.querySelectorAll("a[data-outbound-link] [data-outbound-arrow]").length ?? 0,
          };
        });
        const expectedColorway = route === "/" ? "story" : "co-living";
        assert(noteSurface.colorway === expectedColorway && noteSurface.surface === "paper" && noteSurface.inlineBackground === "transparent" && noteSurface.scopeBackground === "rgba(0, 0, 0, 0)" && noteSurface.cardBackground !== "rgba(0, 0, 0, 0)" && !noteSurface.hasTransparentClass && noteSurface.corners === 4 && noteSurface.arrows === 0, `Production ${label} Note Box surfaces diverged at ${width}px: ${JSON.stringify(noteSurface)}.`);
        const screenshotName = route === "/" ? "home-note" : "co-living-note";
        await production.screenshot({ path: `/tmp/frac127-${screenshotName}-${width === 375 ? "375x812" : "1440x900"}.png` });
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
        const courseCatalog = production.locator("[data-course-collection]");
        const courseScope = courseCatalog.locator("..");
        assert(await courseScope.getAttribute("data-component-surface") === "paper", `Production Education course scope lost paper tokens at ${width}px.`);
        assert(await courseScope.evaluate((element) => getComputedStyle(element).backgroundColor) === "rgba(0, 0, 0, 0)", `Production Education course collection has a background at ${width}px.`);
        assert(await production.locator("[data-course-id]").first().evaluate((element) => getComputedStyle(element).backgroundColor) === "rgb(247, 246, 242)", `Production Education Course Card lost its paper surface at ${width}px.`);
        const teachingLabel = production.getByText("Want to teach?", { exact: true });
        const teachingSurface = await teachingLabel.evaluate((element) => {
          const card = element.closest(".rounded-md");
          return {
            background: card ? getComputedStyle(card).backgroundColor : null,
            redundantScope: card?.closest("[data-component-colorway]") !== null,
            corners: card?.querySelectorAll("span.absolute.pointer-events-none svg").length ?? 0,
            arrows: card?.querySelectorAll("a[data-outbound-link] [data-outbound-arrow]").length ?? 0,
          };
        });
        assert(teachingSurface.background === "rgb(247, 246, 242)" && !teachingSurface.redundantScope && teachingSurface.corners === 4 && teachingSurface.arrows === 0, `Production Education Note Box changed at ${width}px: ${JSON.stringify(teachingSurface)}.`);
        const clubCards = production.locator("[data-club-id]");
        assert(await clubCards.count() === 4, `Production Education club inventory changed at ${width}px.`);
        assert(await clubCards.evaluateAll((cards) => cards.every((card) => {
          const scope = card.closest("[data-component-colorway]");
          return scope !== null && getComputedStyle(scope).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(card).backgroundColor === "rgb(247, 246, 242)";
        })), `Production Education club scope/card backgrounds diverged at ${width}px.`);
        assert(await educationButtons.evaluateAll((buttons) => buttons.every((button) => Math.round(button.getBoundingClientRect().height) >= 44 && Math.round(button.getBoundingClientRect().width) >= 44)), `Production Education chips are undersized at ${width}px.`);
        await production.getByRole("button", { name: "Technology", exact: true }).click();
        assert(await production.locator("[data-course-id]").count() === 3 && await production.locator("[data-filter-bar] button[aria-pressed='true']").count() === 1, `Production Education filtering failed at ${width}px.`);
        assert(await courseScope.evaluate((element) => getComputedStyle(element).backgroundColor) === "rgba(0, 0, 0, 0)", `Production Education filtering repainted the course collection at ${width}px.`);
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
  assert(await production.locator(".library-page").count() === 0 && await production.getByRole("heading", { name: "Component Library", exact: true }).count() === 0, "Production exposes the team catalog.");
  assert(productionErrors.length === 0, `Production page errors: ${productionErrors.join(" | ")}`);

  await browser.close();
  console.log("Component-library and production browser checks passed; native-color evidence is in /tmp/frac130-*.png.");
} finally {
  catalogServer.kill("SIGTERM");
  productionServer.kill("SIGTERM");
}
