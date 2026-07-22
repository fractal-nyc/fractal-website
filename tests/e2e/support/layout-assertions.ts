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

export function assertRealMobileEnvironment(metrics: EnvironmentMetrics, projectName: string): void {
  if (process.env.BROWSERSTACK_RUN !== "1") return;
  const android = /Android/i.test(metrics.userAgent);
  const ios = /iPhone|iPad|iPod/i.test(metrics.userAgent) || (metrics.platform === "MacIntel" && metrics.maxTouchPoints > 1);
  expect(android || ios, `${projectName} must report Android or iOS/iPadOS, not desktop emulation`).toBeTruthy();
  expect(metrics.maxTouchPoints, `${projectName} must expose a real touch environment`).toBeGreaterThan(0);
  expect(metrics.hover, `${projectName} must not expose a hover-primary pointer`).toBeFalsy();
  expect(metrics.dpr, `${projectName} must expose a mobile device-pixel ratio`).toBeGreaterThan(1);
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.documentElement.clientWidth,
  }));
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
