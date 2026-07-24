import { defineConfig } from "@playwright/test";
import { heroInteractionProjects, localProjects } from "./tests/e2e/support/profiles";

const matrix = process.env.PW_MATRIX === "full" ? "full" : "fast";
const lane = process.env.PW_LANE === "hero-interaction" ? "hero-interaction" : "matrix";
const interactionTag = /@hero-interaction/;
const evidenceSuffix = lane === "hero-interaction" ? "hero-interaction" : `matrix-${matrix}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: `test-results/playwright/${evidenceSuffix}`,
  // Keep one Chromium layout baseline across developer and Linux CI hosts.
  // The bounded pixel ratios in the visual spec absorb font rasterization and
  // real WebGL noise; project/profile names remain part of each explicit arg.
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // WebGL contexts are resource-heavy; a small fixed pool avoids false
  // initialization/asset failures on laptops and CI runners.
  workers: lane === "hero-interaction" ? 1 : 2,
  retries: lane === "hero-interaction" ? 0 : process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["line"], ["html", { outputFolder: `playwright-report/${evidenceSuffix}`, open: "never" }]]
    : "list",
  grep: lane === "hero-interaction" ? interactionTag : undefined,
  grepInvert: lane === "hero-interaction" ? undefined : interactionTag,
  use: {
    baseURL: process.env.RESPONSIVE_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 15_000,
  },
  projects: lane === "hero-interaction" ? heroInteractionProjects() : localProjects(matrix),
  webServer: {
    command: "pnpm exec vite preview --host 0.0.0.0 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
