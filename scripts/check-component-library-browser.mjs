import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4174";
const server = spawn("pnpm", ["exec", "vite", "preview", "--config", "vite.components.config.ts", "--host", "127.0.0.1", "--port", "4174", "--strictPort"], { stdio: "ignore" });
const productionOrigin = "http://127.0.0.1:4175";
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

  const colorways = ["neutral", "co-living", "events", "campus", "education", "library", "political-club", "story", "people"];
  for (const colorway of colorways) {
    await page.locator(".library-global-controls label", { hasText: "Color pairing" }).locator("select").selectOption(colorway);
    const surfaceOptions = await page.locator(".library-global-controls label", { hasText: "Surface" }).locator("option").evaluateAll((options) => options.map((option) => option.value));
    const expected = colorway === "story" || colorway === "people" ? ["paper"] : ["paper", "light", "deep"];
    if (JSON.stringify(surfaceOptions) !== JSON.stringify(expected)) fail(`${colorway} exposed invalid surfaces: ${surfaceOptions.join(", ")}`);
    for (const surface of expected) {
      await page.locator(".library-global-controls label", { hasText: "Surface" }).locator("select").selectOption(surface);
      const style = await page.locator("#color-pairing .library-canvas > .component-color-scope").evaluate((element) => {
        const computed = getComputedStyle(element);
        return { background: computed.backgroundColor, color: computed.color };
      });
      if (!style.background || style.background === "rgba(0, 0, 0, 0)") fail(`${colorway}/${surface} has no computed background.`);
      if (!style.color) fail(`${colorway}/${surface} has no computed text color.`);
    }
  }

  const note = page.locator("#note-callout");
  await note.getByLabel("Sample content").fill("Semester reminder");
  await note.getByLabel("State").selectOption("long");
  await note.getByLabel("Preview width").selectOption("320");
  if (await note.locator('[data-preview-width="320"]').count() !== 1) fail("Specimen viewport control did not update the preview.");
  if (!(await note.getByText("Semester reminder").count())) fail("Specimen content control did not update the production component.");

  const importArea = page.getByLabel("Paste catalog JSON");
  await importArea.fill(JSON.stringify({ semester: "Fall 2026", sourceProvenance: null, courses: [null], clubs: [null] }));
  await page.getByRole("button", { name: "Import JSON" }).click();
  await page.getByText("Preview paused").waitFor();
  await page.getByRole("link", { name: /courses\.0\.instructors:/i }).click();
  await page.waitForFunction(() => document.activeElement?.id === "workshop-courses-0-instructors");
  const focusedId = await page.evaluate(() => document.activeElement?.id);
  if (focusedId !== "workshop-courses-0-instructors") fail(`Validation summary focused ${focusedId || "nothing"}.`);

  const canonical = JSON.parse(await readFile("src/data/fractalu-catalog.json", "utf8"));
  canonical.uiState = { selected: true };
  canonical.courses[0].instructor = "derived";
  canonical.courses[0].unknown = true;
  await importArea.fill(JSON.stringify(canonical));
  await page.getByRole("button", { name: "Import JSON" }).click();
  await page.getByRole("button", { name: "Copy normalized JSON" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  if (/"(?:uiState|instructor|unknown)"/.test(copied)) fail("Normalized export retained forbidden keys.");

  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) fail(`Component library overflows horizontally at ${width}px by ${overflow}px.`);
  }
  if (errors.length) fail(`Browser page errors: ${errors.join(" | ")}`);

  const productionPage = await context.newPage();
  const productionErrors = [];
  productionPage.on("pageerror", (error) => productionErrors.push(error.message));
  for (const width of [375, 1440]) {
    await productionPage.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    for (const route of ["/", "/education", "/library", "/campus", "/co-living", "/events"]) {
      await productionPage.goto(`${productionOrigin}${route}`, { waitUntil: "domcontentloaded" });
      const overflow = await productionPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) fail(`${route} overflows horizontally at ${width}px by ${overflow}px.`);
    }
  }
  await productionPage.goto(`${productionOrigin}/components`, { waitUntil: "domcontentloaded" });
  if (await productionPage.getByText("Fractal NYC Component Library").count()) fail("Production unexpectedly exposes the team component library.");
  if (productionErrors.length) fail(`Production page errors: ${productionErrors.join(" | ")}`);
  await browser.close();
  console.log("Component library and migrated production-page browser checks passed.");
} finally {
  server.kill("SIGTERM");
  productionServer.kill("SIGTERM");
}
