#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const missing = ["BROWSERSTACK_USERNAME", "BROWSERSTACK_ACCESS_KEY"].filter((name) => !process.env[name]);
if (missing.length) {
  console.error(
    `Real-device tests not started: missing ${missing.join(" and ")}. ` +
    "Add these as GitHub Actions secrets or export them locally; never commit credentials.",
  );
  process.exit(2);
}

const config = resolve(process.argv[2] ?? "browserstack.smoke.yml");
if (!existsSync(config)) {
  console.error(`Real-device tests not started: BrowserStack config not found at ${config}`);
  process.exit(2);
}

const identifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER ??
  `fractal-responsive-${process.env.GITHUB_RUN_ID ?? Date.now()}`;
const child = spawn(
  "pnpm",
  ["exec", "browserstack-node-sdk", "playwright", `--browserstack.config=${config}`, "--config=playwright.config.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      BROWSERSTACK_RUN: "1",
      BROWSERSTACK_LOCAL_IDENTIFIER: identifier,
      RESPONSIVE_BASE_URL: process.env.RESPONSIVE_BASE_URL ?? "http://bs-local.com:4173",
    },
  },
);

child.on("error", (error) => {
  console.error(`Unable to start BrowserStack Playwright runner: ${error.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  if (signal) console.error(`BrowserStack runner stopped by ${signal}`);
  process.exit(code ?? 1);
});
