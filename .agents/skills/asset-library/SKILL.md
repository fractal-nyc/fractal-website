---
name: asset-library
description: Open Fractal NYC's repository-local, team-only visual Component Library in a visible browser. Use when someone asks to open, launch, view, or browse this repository's asset or component library; do not use the public Publications Library or exported portfolio assets.
---

# Asset Library

Invoke this skill as `$asset-library`, or select **Asset Library** from `/skills`.

Open the existing visual Component Library at its Common components view and leave its local development server running.

1. Resolve the repository root from the current working directory with Git and operate from that root.
2. Verify that the checkout contains `components/`, `vite.components.config.ts`, and a `components` script in `package.json`. If any entry point is missing, stop and say that the current checkout does not contain the component catalog and that the user should switch to or update from a branch where it has been merged. Do not open the public `/library` route, `docs/asset-component-library.md`, or `portfolio-assets/component-library/` as a substitute.
3. Check whether this repository's component-catalog Vite server is already running. Reuse it only after verifying that its local HTTP response is the team-only Fractal NYC Component Library. Open its actual local origin with `/components/#browse/common` appended; do not assume a fixed port.
4. If no verified catalog server is running, start `pnpm components --open '/components/#browse/common'` from the repository root in a long-running terminal session. Preserve the session so the server remains available, and use the local origin printed by Vite if it selects a different port. If the host cannot honor Vite's `--open`, use its visible browser-opening capability for the same URL.
5. If dependencies are missing, perform only the repository's normal `pnpm install`, subject to the host's approval and sandbox rules, then retry once. Surface dependency installation, startup, or port failures with the relevant error and a concise next action.
6. Report the opened URL and the live server session succinctly.

Keep this workflow local and team-only. Do not change, rebuild, export, publish, or add a production route for the catalog.
