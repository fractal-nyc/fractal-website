#!/usr/bin/env node
// scripts/compress-banners.mjs
//
// FRAC-179: One-shot compression for the 8 octahedron face / house banner
// brand photos. Reads raw PNGs (~1.5–2.2 MB each) from `assets-src/banners/`,
// emits 1024x1024 WebP at quality 78 to `public/images/banners/<slug>.webp`.
//
// Source PNGs are git-ignored. Drop the originals into `assets-src/banners/`
// using the exact filenames in SOURCE_TO_OUTPUT below (spaces / underscores
// preserved — these are the human-friendly names the user exports from
// Figma / Photoshop without renaming).
//
// Run: `pnpm build:banners` (or `node scripts/compress-banners.mjs`).
//
// Budget: <80 KB per face, <500 KB combined. Script exits non-zero if either
// budget is violated.
//
// Two output filenames intentionally use the public-facing house slug rather
// than the internal face key:
//   - face key `school` -> `new-liberal-arts.webp`
//   - face key `forum`  -> `political-club.webp`
// This continues the naming convention from the old JPEGs.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SRC_DIR = path.join(ROOT, "assets-src", "banners");
const OUT_DIR = path.join(ROOT, "public", "images", "banners");

// face key -> { source PNG filename, output slug, optional quality override }
// Default WebP quality is 45 (visually fine for these small octahedron faces and
// /house/:slug banner backgrounds with overlay). `neighborhood` has unusually
// busy high-frequency content (city scenes, signage, foliage) and needs a
// lower quality to fit under the 80 KB per-face budget.
const SOURCE_TO_OUTPUT = [
  { face: "story",        src: "story brand photo.png",              out: "story.webp" },
  { face: "campus",       src: "campus_brand_photo.png",             out: "campus.webp" },
  { face: "neighborhood", src: "visit neighborhood brand photo.png", out: "neighborhood.webp", quality: 22 },
  { face: "events",       src: "events brand photo.png",             out: "events.webp" },
  { face: "school",       src: "education NLA brand photo.png",      out: "new-liberal-arts.webp" },
  { face: "forum",        src: "political club brand photo.png",     out: "political-club.webp" },
  { face: "lab",          src: "publications lab brand photo.png",   out: "lab.webp" },
  { face: "people",       src: "people brand photo.png",             out: "people.webp" },
];

const PER_FACE_BUDGET = 80 * 1024;      // 80 KB
const TOTAL_BUDGET    = 500 * 1024;     // 500 KB

const DEFAULT_QUALITY = 45;
const WEBP_EFFORT = 6;
const RESIZE = { width: 1024, height: 1024, fit: "cover", position: "centre" };

function fmtBytes(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const results = [];
  let total = 0;
  let overBudgetFaces = [];

  for (const { face, src, out, quality } of SOURCE_TO_OUTPUT) {
    const srcPath = path.join(SRC_DIR, src);
    const outPath = path.join(OUT_DIR, out);

    try {
      await fs.access(srcPath);
    } catch {
      console.error(`MISSING source: ${srcPath}`);
      process.exitCode = 1;
      continue;
    }

    const q = typeof quality === "number" ? quality : DEFAULT_QUALITY;
    const buf = await sharp(srcPath)
      .resize(RESIZE)
      .webp({ quality: q, effort: WEBP_EFFORT })
      .toBuffer();

    await fs.writeFile(outPath, buf);

    const size = buf.byteLength;
    total += size;
    results.push({ face, out, size });
    if (size > PER_FACE_BUDGET) overBudgetFaces.push({ out, size });
  }

  console.log("Compressed banners:");
  for (const { face, out, size } of results) {
    const flag = size > PER_FACE_BUDGET ? "  OVER" : "";
    console.log(`  [${face.padEnd(13)}] ${out.padEnd(26)} ${fmtBytes(size).padStart(10)}${flag}`);
  }
  console.log(`Total: ${fmtBytes(total)}  (budget ${fmtBytes(TOTAL_BUDGET)})`);

  if (overBudgetFaces.length > 0) {
    console.error(`\nFAIL: ${overBudgetFaces.length} face(s) exceed ${fmtBytes(PER_FACE_BUDGET)} per-face budget.`);
    process.exitCode = 1;
  }
  if (total > TOTAL_BUDGET) {
    console.error(`\nFAIL: total ${fmtBytes(total)} exceeds combined budget ${fmtBytes(TOTAL_BUDGET)}.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
