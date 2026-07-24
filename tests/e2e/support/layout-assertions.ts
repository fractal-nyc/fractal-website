import { expect, type Page, type TestInfo } from "@playwright/test";
import {
  collectEnvironmentMetrics,
  probeHeroComposition,
  probeHeroLabelSafeZone,
  probeHorizontalOverflow,
  probeNavbarContent,
  probePageGutters,
  probePrimaryContentIntegrity,
  probeTouchTargets,
  probeVisualBounds,
} from "./responsive-contract.mjs";

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
  environment: "simulated-desktop";
}

interface ProbeResult {
  violations: string[];
  details: unknown;
}

function expectProbe(result: ProbeResult, label: string): void {
  expect(result.violations, `${label}: ${JSON.stringify(result.details)}`).toEqual([]);
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
  return page.evaluate(collectEnvironmentMetrics, {
    build: process.env.GITHUB_SHA ?? "local",
    environment: "simulated-desktop",
  }) as Promise<EnvironmentMetrics>;
}

export async function attachEnvironment(page: Page, testInfo: TestInfo): Promise<EnvironmentMetrics> {
  const metrics = await environmentMetrics(page);
  await testInfo.attach("runtime-environment.json", {
    body: Buffer.from(JSON.stringify({ project: testInfo.project.name, route: new URL(page.url()).pathname, ...metrics }, null, 2)),
    contentType: "application/json",
  });
  return metrics;
}

export async function assertNavbarDoesNotCoverContent(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probeNavbarContent), "navbar/content relationship");
}

export async function assertPrimaryContentIntegrity(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probePrimaryContentIntegrity), "primary-content reflow");
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probeHorizontalOverflow), "horizontal containment");
}

export async function assertPageGutters(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probePageGutters), "canonical page gutters");
}

export async function assertTouchTargets(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probeTouchTargets), "touch targets");
}

export async function assertHeroComposition(page: Page, requireInitialContainment: boolean): Promise<void> {
  expectProbe(await page.evaluate(probeHeroComposition, { requireInitialContainment }), "Hero stage/footer composition");
}

export async function assertHeroLabelSafeZone(page: Page): Promise<void> {
  expectProbe(await page.evaluate(probeHeroLabelSafeZone), "Hero projected-label safe zone");
}

export async function visualBounds(page: Page) {
  return page.evaluate(probeVisualBounds);
}
