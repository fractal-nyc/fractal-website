import { expect, type Page, type TestInfo } from "@playwright/test";

export interface EnvironmentMetrics {
  inner: { width: number; height: number };
  visualViewport: { width: number; height: number; offsetLeft: number; offsetTop: number; scale: number } | null;
  screen: { width: number; height: number; orientation: string | null };
  dpr: number;
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  hover: boolean;
  pointer: string;
  reducedMotion: boolean;
  viewportUnits: { vh: number; svh: number; dvh: number };
  safeArea: { top: number; right: number; bottom: number; left: number };
  scroll: { x: number; y: number };
  url: string;
  timestamp: string;
  build: string;
}

interface BrowserStackSessionDetails {
  device: string | null;
  os: string | null;
  os_version: string | null;
  browser: string | null;
  browser_version: string | null;
  hashed_id?: string;
  browser_url?: string;
}

export interface ExpectedRealDevice {
  project: string;
  device: RegExp;
  osVersion: string;
  family: "android" | "iphone" | "ipad";
  browser: "chrome" | "safari";
  orientation: "portrait" | "landscape";
}

const EXPECTED_REAL_DEVICES: ExpectedRealDevice[] = [
  { project: "bs-galaxy-s24-portrait", device: /Samsung Galaxy S24/i, osVersion: "14", family: "android", browser: "chrome", orientation: "portrait" },
  { project: "bs-galaxy-s24-landscape", device: /Samsung Galaxy S24/i, osVersion: "14", family: "android", browser: "chrome", orientation: "landscape" },
  { project: "bs-pixel-8-portrait", device: /Google Pixel 8/i, osVersion: "14", family: "android", browser: "chrome", orientation: "portrait" },
  { project: "bs-galaxy-tab-s9-portrait", device: /Samsung Galaxy Tab S9/i, osVersion: "13", family: "android", browser: "chrome", orientation: "portrait" },
  { project: "bs-iphone-se-portrait", device: /iPhone SE 2022/i, osVersion: "15.4", family: "iphone", browser: "safari", orientation: "portrait" },
  { project: "bs-iphone-15-pro-max-portrait", device: /iPhone 15 Pro Max/i, osVersion: "17.5", family: "iphone", browser: "safari", orientation: "portrait" },
  { project: "bs-ipad-pro-portrait", device: /iPad Pro 13 2024/i, osVersion: "17.5", family: "ipad", browser: "safari", orientation: "portrait" },
];

export function expectedRealDevice(projectName: string): ExpectedRealDevice | undefined {
  return EXPECTED_REAL_DEVICES.find(({ project }) => projectName === project || projectName.includes(project));
}

export async function preparePage(page: Page, rootFontScale = 1): Promise<void> {
  if (rootFontScale !== 1) {
    await page.addStyleTag({ content: `html { font-size: ${rootFontScale * 100}% !important; }` });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

export async function environmentMetrics(page: Page): Promise<EnvironmentMetrics> {
  return page.evaluate((build) => {
    const probe = (value: string) => {
      const element = document.createElement("div");
      element.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;height:${value}`;
      document.body.append(element);
      const height = element.getBoundingClientRect().height;
      element.remove();
      return height;
    };
    const safe = document.createElement("div");
    safe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
    document.body.append(safe);
    const safeStyle = getComputedStyle(safe);
    const safeArea = {
      top: parseFloat(safeStyle.paddingTop) || 0,
      right: parseFloat(safeStyle.paddingRight) || 0,
      bottom: parseFloat(safeStyle.paddingBottom) || 0,
      left: parseFloat(safeStyle.paddingLeft) || 0,
    };
    safe.remove();
    const vv = visualViewport;
    return {
      inner: { width: innerWidth, height: innerHeight },
      visualViewport: vv ? { width: vv.width, height: vv.height, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop, scale: vv.scale } : null,
      screen: { width: screen.width, height: screen.height, orientation: screen.orientation?.type ?? null },
      dpr: devicePixelRatio,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      hover: matchMedia("(hover: hover)").matches,
      pointer: matchMedia("(pointer: coarse)").matches ? "coarse" : matchMedia("(pointer: fine)").matches ? "fine" : "none",
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      viewportUnits: { vh: probe("100vh"), svh: probe("100svh"), dvh: probe("100dvh") },
      safeArea,
      scroll: { x: scrollX, y: scrollY },
      url: location.href,
      timestamp: new Date().toISOString(),
      build,
    };
  }, process.env.GITHUB_SHA ?? "local");
}

export async function attachEnvironment(page: Page, testInfo: TestInfo): Promise<EnvironmentMetrics> {
  const metrics = await environmentMetrics(page);
  await testInfo.attach("runtime-environment.json", {
    body: Buffer.from(JSON.stringify({ project: testInfo.project.name, route: new URL(page.url()).pathname, ...metrics }, null, 2)),
    contentType: "application/json",
  });
  return metrics;
}

async function browserStackSessionDetails(page: Page): Promise<BrowserStackSessionDetails> {
  const command = `browserstack_executor: ${JSON.stringify({ action: "getSessionDetails" })}`;
  const response = await page.evaluate(() => undefined, command) as unknown;
  const parsed = typeof response === "string" ? JSON.parse(response) as BrowserStackSessionDetails : response as BrowserStackSessionDetails;
  if (!parsed || typeof parsed !== "object") throw new Error("BrowserStack did not return session details");
  return parsed;
}

export async function assertRealMobileEnvironment(page: Page, metrics: EnvironmentMetrics, testInfo: TestInfo): Promise<void> {
  if (process.env.BROWSERSTACK_RUN !== "1") return;
  const projectName = testInfo.project.name;
  const expected = expectedRealDevice(projectName);
  expect(expected, `${projectName} must map to one configured real-device identity`).toBeTruthy();
  if (!expected) return;

  const session = await browserStackSessionDetails(page);
  await testInfo.attach("browserstack-session.json", {
    body: Buffer.from(JSON.stringify(session, null, 2)),
    contentType: "application/json",
  });
  const android = /Android/i.test(metrics.userAgent);
  const iphone = /iPhone|iPod/i.test(metrics.userAgent);
  const ipad = /iPad/i.test(metrics.userAgent) || (metrics.platform === "MacIntel" && metrics.maxTouchPoints > 1);
  expect(session.device ?? "", `${projectName} session device must match its configured hardware`).toMatch(expected.device);
  expect(session.os_version ?? "", `${projectName} session OS must match its configured version`).toMatch(new RegExp(`^${expected.osVersion.replace(".", "\\.")}`));
  expect(session.browser ?? "", `${projectName} session browser must match its configured browser`).toMatch(new RegExp(expected.browser, "i"));
  expect(expected.family === "android" ? android : expected.family === "iphone" ? iphone : ipad, `${projectName} runtime must match ${expected.family}`).toBeTruthy();
  expect(expected.browser === "chrome" ? /Chrome|CriOS/i.test(metrics.userAgent) : /Safari/i.test(metrics.userAgent) && !/Chrome|CriOS/i.test(metrics.userAgent), `${projectName} UA must match ${expected.browser}`).toBeTruthy();
  expect(metrics.maxTouchPoints, `${projectName} must expose a real touch environment`).toBeGreaterThan(0);
  expect(metrics.hover, `${projectName} must not expose a hover-primary pointer`).toBeFalsy();
  expect(metrics.dpr, `${projectName} must expose a mobile device-pixel ratio`).toBeGreaterThan(1);
  const portrait = (metrics.visualViewport?.height ?? metrics.inner.height) >= (metrics.visualViewport?.width ?? metrics.inner.width);
  expect(portrait, `${projectName} visual viewport must match configured ${expected.orientation} orientation`).toBe(expected.orientation === "portrait");
}

export async function assertNavbarDoesNotCoverContent(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const navbar = document.querySelector<HTMLElement>("[data-site-navbar]")?.getBoundingClientRect();
    const desktopHome = location.pathname === "/" && innerWidth >= 1024;
    // The desktop Home composition deliberately puts a transparent fixed nav
    // over a full-bleed scene. On smaller Home layouts the stage is in normal
    // flow; inner routes use their first semantic text block as the owner.
    const selector = location.pathname === "/"
      ? "[data-hero-stage]"
      : "main h1, main h2, main h3, main p";
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((element) => !element.closest("[data-site-navbar]") && !element.closest("[data-hero-label]") && !element.closest(".sr-only-focusable") && !element.closest('[aria-hidden="true"]'))
      .map((element) => ({ element, box: element.getBoundingClientRect(), style: getComputedStyle(element) }))
      .filter(({ box, style }) => box.width > 0 && box.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0)
      .filter(({ style }) => style.position !== "fixed" && style.position !== "absolute")
      .sort((a, b) => a.box.top - b.box.top);
    const first = candidates.find(({ box }) => box.bottom > 0);
    return {
      navbar: navbar ? { top: navbar.top, bottom: navbar.bottom } : null,
      exempt: desktopHome,
      first: first ? { tag: first.element.tagName, text: first.element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80), top: first.box.top, bottom: first.box.bottom } : null,
    };
  });
  if (!geometry.navbar || geometry.exempt) return;
  expect(geometry.first, "route must expose a primary content owner").toBeTruthy();
  expect(geometry.first!.top, `navbar/content overlap: ${JSON.stringify(geometry)}`).toBeGreaterThanOrEqual(geometry.navbar!.bottom - 1);
}

export async function assertPrimaryContentIntegrity(page: Page): Promise<void> {
  const failures = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main a, main button, main img, main video, main canvas"))
    .filter((element) => !element.closest("[data-site-navbar]") && !element.closest("[data-hero-label]") && !element.closest(".sr-only-focusable") && !element.closest('[aria-hidden="true"]'))
    .flatMap((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return [];
      // Firefox correctly reports clientWidth=0 for inline anchors even when
      // their rendered text box has width. A zero-width CSS content box cannot
      // establish an overflow container, so compare scrollWidth only for
      // elements that actually own a measurable content box.
      if (element.clientWidth <= 0) return [];
      const uncontainedText = !/^(IMG|VIDEO|CANVAS)$/.test(element.tagName) && style.overflowX === "visible" && element.scrollWidth > element.clientWidth + 1;
      return uncontainedText ? [{ tag: element.tagName, text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }] : [];
    }));
  expect(failures, `primary content clips instead of reflowing: ${JSON.stringify(failures)}`).toEqual([]);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const box = element.getBoundingClientRect();
        const ancestors = Array.from(element.parentElement?.closest(".swiper") ? [element.parentElement.closest<HTMLElement>(".swiper")!] : [])
          .map((ancestor) => {
            const ancestorBox = ancestor.getBoundingClientRect();
            const style = getComputedStyle(ancestor);
            return `${ancestor.className}:${ancestorBox.left.toFixed(1)}..${ancestorBox.right.toFixed(1)}:${style.overflowX}`;
          });
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
          text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "",
          left: Number(box.left.toFixed(1)),
          right: Number(box.right.toFixed(1)),
          width: Number(box.width.toFixed(1)),
          ancestors,
        };
      })
      .filter(({ left, right, width }) => width > 0 && (left < -1 || right > clientWidth + 1))
      .sort((a, b) => Math.max(b.right - clientWidth, -b.left) - Math.max(a.right - clientWidth, -a.left))
      .slice(0, 12);
    const scrollOffenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
        text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "",
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }))
      .filter(({ clientWidth: width, scrollWidth }) => width > 0 && scrollWidth > width + 1)
      .sort((a, b) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))
      .slice(0, 12);
    return {
      document: document.documentElement.scrollWidth - clientWidth,
      body: document.body.scrollWidth - clientWidth,
      offenders,
      scrollOffenders,
    };
  });
  expect(overflow.document, `document horizontal overflow: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(1);
  expect(overflow.body, `body horizontal overflow: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(1);
}

export async function assertPageGutters(page: Page): Promise<void> {
  const failures = await page.locator(".page-gutter").evaluateAll((elements) => elements.flatMap((element) => {
    const style = getComputedStyle(element);
    const left = parseFloat(style.paddingLeft) || 0;
    const right = parseFloat(style.paddingRight) || 0;
    return left < 23 || right < 23 || left > 128 || right > 128
      ? [{ left, right, tag: element.tagName, text: element.textContent?.trim().slice(0, 60) }]
      : [];
  }));
  expect(failures, `invalid computed .page-gutter values: ${JSON.stringify(failures)}`).toEqual([]);
}

export async function visualBounds(page: Page) {
  return page.evaluate(() => {
    const vv = visualViewport;
    return {
      left: vv?.offsetLeft ?? 0,
      top: vv?.offsetTop ?? 0,
      right: (vv?.offsetLeft ?? 0) + (vv?.width ?? innerWidth),
      bottom: (vv?.offsetTop ?? 0) + (vv?.height ?? innerHeight),
    };
  });
}
