import { defineConfig } from "@playwright/test";
import { localProjects } from "./tests/e2e/support/profiles";

const matrix = process.env.PW_MATRIX === "full" ? "full" : "fast";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  // Keep one Chromium layout baseline across developer and Linux CI hosts.
  // The bounded pixel ratios in the visual spec absorb font rasterization and
  // real WebGL noise; project/profile names remain part of each explicit arg.
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // WebGL contexts are resource-heavy; a small fixed pool avoids false
  // initialization/asset failures on laptops and CI runners.
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]] : "list",
  use: {
    baseURL: process.env.RESPONSIVE_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 15_000,
  },
  projects: localProjects(matrix),
  webServer: {
    command: "pnpm exec vite preview --host 0.0.0.0 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
