import { spawn } from "node:child_process";
import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PREVIEW_ENVIRONMENT = "preview";

function runPnpm(script, root) {
  const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  return new Promise((resolve, reject) => {
    const child = spawn(executable, [script], {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm ${script} failed (${signal ? `signal ${signal}` : `exit ${code}`}).`));
    });
  });
}

async function assertFile(file, description) {
  try {
    if (!(await stat(file)).isFile()) throw new Error();
  } catch {
    throw new Error(`${description} is missing: ${file}`);
  }
}

/**
 * Build the public site for every Vercel environment. The internal component
 * catalog is embedded only in authenticated Preview deployments.
 */
export async function buildForVercel({
  environment = process.env.VERCEL_ENV,
  root = process.cwd(),
  run = runPnpm,
} = {}) {
  const dist = path.join(root, "dist");
  const componentSource = path.join(root, "dist-components");
  const componentDestination = path.join(dist, "components");

  await run("build", root);
  await assertFile(path.join(dist, "index.html"), "Public site build");

  // Defense in depth: even if the public builder ever stops clearing dist,
  // a production build cannot retain a catalog copied by an earlier preview.
  await rm(componentDestination, { recursive: true, force: true });

  if (environment !== PREVIEW_ENVIRONMENT) {
    console.log(`Vercel ${environment ?? "local/unset"} build: public site only.`);
    return { includesComponentCatalog: false };
  }

  await run("build:components", root);
  await assertFile(path.join(componentSource, "index.html"), "Component catalog build");
  await mkdir(dist, { recursive: true });
  await cp(componentSource, componentDestination, { recursive: true });
  await assertFile(path.join(componentDestination, "index.html"), "Embedded component catalog");
  console.log("Vercel preview build: component catalog embedded at dist/components/.");
  return { includesComponentCatalog: true };
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  buildForVercel().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
