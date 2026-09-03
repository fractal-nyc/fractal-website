import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildForVercel } from "./build-vercel.mjs";

async function withFixture(callback) {
  const root = await mkdtemp(path.join(os.tmpdir(), "fractal-vercel-build-"));
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function fixtureRunner(commands) {
  return async (script, root) => {
    commands.push(script);
    if (script === "build") {
      await mkdir(path.join(root, "dist"), { recursive: true });
      await writeFile(path.join(root, "dist", "index.html"), "public site");
      return;
    }
    if (script === "build:components") {
      await mkdir(path.join(root, "dist-components", "assets"), { recursive: true });
      await writeFile(path.join(root, "dist-components", "index.html"), "component catalog");
      await writeFile(path.join(root, "dist-components", "assets", "catalog.js"), "catalog asset");
      return;
    }
    throw new Error(`Unexpected fixture command: ${script}`);
  };
}

test("preview embeds the component catalog after the public build", async () => {
  await withFixture(async (root) => {
    const commands = [];
    const result = await buildForVercel({ environment: "preview", root, run: fixtureRunner(commands) });

    assert.deepEqual(commands, ["build", "build:components"]);
    assert.equal(result.includesComponentCatalog, true);
    assert.equal(await readFile(path.join(root, "dist", "index.html"), "utf8"), "public site");
    assert.equal(await readFile(path.join(root, "dist", "components", "index.html"), "utf8"), "component catalog");
    assert.equal(await readFile(path.join(root, "dist", "components", "assets", "catalog.js"), "utf8"), "catalog asset");
  });
});

for (const environment of ["production", undefined, "development"]) {
  test(`${environment ?? "unset"} excludes the catalog and removes stale preview output`, async () => {
    await withFixture(async (root) => {
      const commands = [];
      await mkdir(path.join(root, "dist", "components"), { recursive: true });
      await writeFile(path.join(root, "dist", "components", "index.html"), "stale catalog");

      const result = await buildForVercel({ environment, root, run: fixtureRunner(commands) });

      assert.deepEqual(commands, ["build"]);
      assert.equal(result.includesComponentCatalog, false);
      await assert.rejects(readFile(path.join(root, "dist", "components", "index.html"), "utf8"), { code: "ENOENT" });
      assert.equal(await readFile(path.join(root, "dist", "index.html"), "utf8"), "public site");
    });
  });
}
