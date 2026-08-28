import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4174";
const productionOrigin = "http://127.0.0.1:4175";
const server = spawn("pnpm", ["exec", "vite", "preview", "--config", "vite.components.config.ts", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
const productionServer = spawn("pnpm", ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", "4175", "--strictPort"], { stdio: "ignore" });
const fail = (message) => { throw new Error(message); };

try {
  const waitForServer = async (url, name) => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try { if ((await fetch(url)).ok) return; } catch { /* server is starting */ }
      if (attempt === 39) fail(`${name} preview server did not start.`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  };
  await Promise.all([waitForServer(`${origin}/components/`, "Component"), waitForServer(productionOrigin, "Production")]);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/components/`, { waitUntil: "networkidle" });

  const common = ["Action Button", "External Link", "Article Card", "Note Box", "Course Card", "Club Card", "Campus Highlight", "Editorial Quote"];
  for (const name of common) if (!(await page.getByRole("heading", { name, exact: true }).count())) fail(`Common gallery is missing ${name}.`);
  const visiblePreviews = await page.locator(".library-gallery-preview").evaluateAll((items) => items.filter((item) => item.getBoundingClientRect().top < innerHeight && item.getBoundingClientRect().bottom > 0).length);
  if (visiblePreviews < 3) fail(`Desktop initial viewport showed ${visiblePreviews} previews instead of at least three.`);
  const forbidden = ["ComponentColorScope", "Use when", "Do not use when", "Content fields", "Accessibility", "Responsive behavior", "Reference specimen"];
  const bodyText = await page.locator("body").innerText();
  for (const text of forbidden) if (bodyText.includes(text)) fail(`Closed gallery exposed ${text}.`);
  const columns = (await page.locator(".library-gallery-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length));
  if (columns !== 3) fail(`Desktop gallery used ${columns} columns instead of three.`);
  const previewRatio = await page.locator(".library-visual-card").first().evaluate((card) => {
    const preview = card.querySelector(".library-gallery-preview");
    const copy = card.querySelector(".library-card-copy");
    return preview.getBoundingClientRect().height / (preview.getBoundingClientRect().height + copy.getBoundingClientRect().height);
  });
  if (previewRatio < 0.6) fail(`Closed card preview ratio was ${previewRatio.toFixed(2)}.`);
  await page.screenshot({ path: "/tmp/frac116-component-gallery-1440x900.png" });

  for (const [query, expected] of [["note", "Note Box"], ["class container", "Course Card"], ["outsource link", "External Link"], ["DocumentCard", "Article Card"]]) {
    await page.getByRole("searchbox", { name: "Search components" }).fill(query);
    if (!(await page.getByRole("heading", { name: expected, exact: true }).count())) fail(`${query} did not find ${expected}.`);
  }
  await page.getByRole("searchbox", { name: "Search components" }).fill("");

  const noteCard = page.locator("#note-callout");
  await noteCard.getByRole("button", { name: "Learn more about Note Box" }).click();
  if (!page.url().includes("#component/note-callout")) fail("Learn more did not create an addressable component route.");
  if (await page.locator("details[open]").count()) fail("Usage details opened by default.");
  const order = await page.evaluate(() => {
    const preview = document.querySelector(".library-detail-preview");
    const controls = document.querySelector(".library-detail-controls");
    const details = document.querySelector(".library-usage-details");
    return Boolean(preview && controls && details && (preview.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING) && (controls.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  if (!order) fail("Focused component order is not preview, controls, then usage details.");
  await page.getByLabel("Note label").fill("Semester reminder");
  await page.getByLabel("Body content").selectOption("long");
  await page.getByLabel("Actions").selectOption("without");
  await page.getByLabel("Corner size").selectOption("lg");
  await page.getByLabel("Preview width").selectOption("320");
  await page.getByLabel("Site color").selectOption("story");
  const surfaces = await page.getByLabel("Background").locator("option").evaluateAll((options) => options.map((option) => option.value));
  if (JSON.stringify(surfaces) !== JSON.stringify(["paper"])) fail(`Story exposed invalid backgrounds: ${surfaces.join(", ")}`);
  if (!(await page.getByText("Semester reminder").count())) fail("Focused content controls did not update the real Note Box.");
  await page.getByText("Usage details").click();
  if (!(await page.getByText("CalloutCard", { exact: true }).count())) fail("Usage details omitted the technical component name.");
  await page.getByRole("button", { name: "Copy prompt" }).click();
  if ((await page.evaluate(() => navigator.clipboard.readText())) !== "Use the Note Box component.") fail("Tell an agent prompt was not copied.");
  await page.reload({ waitUntil: "networkidle" });
  if (!page.url().includes("#component/note-callout")) fail("Component detail did not survive reload.");
  await page.goBack();
  await page.waitForSelector("#note-callout");
  await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Learn more about Note Box");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  if (focused !== "Learn more about Note Box") fail(`Back restored focus to ${focused || "nothing"}.`);

  if (await page.locator("canvas, [data-site-navbar]").count()) fail("A heavy full-context preview mounted behind the browse gallery.");
  await page.getByRole("searchbox", { name: "Search components" }).fill("Site Navigation");
  await page.getByRole("button", { name: "Learn more about Site Navigation" }).click();
  if (await page.locator("[data-site-navbar]").count()) fail("Site Navigation mounted in the focused detail before requested.");
  await page.getByRole("button", { name: /Open live preview/i }).click();
  await page.locator("[data-site-navbar]").waitFor();
  if (!page.url().includes("#preview/site-navigation")) fail("Full-context preview did not create an addressable route.");
  await page.getByRole("button", { name: /Back to Site Navigation/ }).click();
  await page.getByRole("button", { name: /Back to components/ }).click();

  if (await page.locator("#education-workshop").count()) fail("Education workshop is mounted in browse view.");
  await page.getByRole("button", { name: "Edit Education courses" }).click();
  if (!page.url().includes("#education") || !(await page.locator("#education-workshop").count())) fail("Education workshop did not open as its own view.");
  const importArea = page.getByLabel("Paste catalog JSON");
  await importArea.fill(JSON.stringify({ semester: "Fall 2026", sourceProvenance: null, courses: [null], clubs: [null] }));
  await page.getByRole("button", { name: "Import JSON" }).click();
  await page.getByText("Preview paused").waitFor();
  await page.getByRole("link", { name: /courses\.0\.instructors:/i }).click();
  await page.waitForFunction(() => document.activeElement?.id === "workshop-courses-0-instructors");
  const canonical = JSON.parse(await readFile("src/data/fractalu-catalog.json", "utf8"));
  canonical.uiState = { selected: true }; canonical.courses[0].instructor = "derived"; canonical.courses[0].unknown = true;
  await importArea.fill(JSON.stringify(canonical)); await page.getByRole("button", { name: "Import JSON" }).click(); await page.getByRole("button", { name: "Copy normalized JSON" }).click();
  if (/"(?:uiState|instructor|unknown)"/.test(await page.evaluate(() => navigator.clipboard.readText()))) fail("Normalized export retained forbidden keys.");

  for (const [width, expectedColumns] of [[375, 1], [768, 2], [1024, 3]]) {
    const matrixPage = await context.newPage();
    await matrixPage.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await matrixPage.goto(`${origin}/components/#browse/common`, { waitUntil: "networkidle" });
    const overflow = await matrixPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) fail(`Component library overflows at ${width}px by ${overflow}px.`);
    const actualColumns = await matrixPage.locator(".library-gallery-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    if (actualColumns !== expectedColumns) fail(`${width}px used ${actualColumns} columns instead of ${expectedColumns}.`);
    if (width === 375) {
      const preview = await matrixPage.locator(".library-gallery-preview").first().boundingBox();
      if (!preview || preview.y < 0 || preview.y >= 500 || preview.height < 220) fail(`Mobile first preview was y=${preview?.y}, height=${preview?.height}.`);
      const smallTargets = await matrixPage.locator(".library-category-chooser button").evaluateAll((buttons) => buttons.filter((button) => button.getBoundingClientRect().height < 44).length);
      if (smallTargets) fail(`${smallTargets} mobile category targets were shorter than 44px.`);
      await matrixPage.screenshot({ path: "/tmp/frac116-component-gallery-375x812.png" });
    }
    await matrixPage.close();
  }
  const largeTextPage = await context.newPage();
  await largeTextPage.setViewportSize({ width: 375, height: 812 });
  await largeTextPage.goto(`${origin}/components/#browse/common`, { waitUntil: "networkidle" });
  await largeTextPage.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
  if (await largeTextPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) > 1) fail("Component library overflows with 24px root text.");
  await largeTextPage.close();
  if (errors.length) fail(`Browser page errors: ${errors.join(" | ")}`);

  const productionPage = await context.newPage();
  const productionErrors = []; productionPage.on("pageerror", (error) => productionErrors.push(error.message));
  for (const width of [375, 1440]) {
    await productionPage.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of ["/", "/education", "/library", "/campus", "/co-living", "/events"]) {
      await productionPage.goto(`${productionOrigin}${route}`, { waitUntil: "domcontentloaded" });
      if (await productionPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) > 1) fail(`${route} overflows at ${width}px.`);
    }
  }
  await productionPage.goto(`${productionOrigin}/components`, { waitUntil: "domcontentloaded" });
  if (await productionPage.getByText("Choose by looking").count()) fail("Production exposes the team component gallery.");
  if (productionErrors.length) fail(`Production page errors: ${productionErrors.join(" | ")}`);
  await browser.close();
  console.log("Visual component gallery checks passed. Screenshots: /tmp/frac116-component-gallery-1440x900.png and /tmp/frac116-component-gallery-375x812.png");
} finally {
  server.kill("SIGTERM"); productionServer.kill("SIGTERM");
}
