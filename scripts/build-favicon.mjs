#!/usr/bin/env node
// Rasterize public/favicon.svg into PNG + ICO fallbacks.
// One-off script — run manually (`pnpm build:favicon`), then commit the binaries.
// The SVG is the source of truth; rasters are committed artifacts.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/favicon.svg");

const svgBuffer = await readFile(svgPath);

async function rasterize(size) {
  return sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

const [png16, png32, png48, png180] = await Promise.all([
  rasterize(16),
  rasterize(32),
  rasterize(48),
  rasterize(180),
]);

await writeFile(resolve(root, "public/favicon-16.png"), png16);
await writeFile(resolve(root, "public/favicon-32.png"), png32);
await writeFile(resolve(root, "public/apple-touch-icon.png"), png180);

const ico = await pngToIco([png16, png32, png48]);
await writeFile(resolve(root, "public/favicon.ico"), ico);

console.log("Wrote: favicon-16.png, favicon-32.png, apple-touch-icon.png, favicon.ico");
