#!/usr/bin/env node
/**
 * FRAC-177: Compress assets-src/hero/fractal-background-source.png into
 * responsive AVIF + WebP variants (plus a PNG fallback) under
 * public/images/hero/. Exits non-zero if any variant blows its byte budget.
 *
 * Run: pnpm build:hero-bg
 */
import { mkdir, stat, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SOURCE = path.join(
  repoRoot,
  "assets-src",
  "hero",
  "fractal-background-source.png",
);
const OUT_DIR = path.join(repoRoot, "public", "images", "hero");

// width -> { avif: maxBytes, webp: maxBytes }
const BUDGETS = {
  640: { avif: 80 * 1024, webp: 120 * 1024 },
  1280: { avif: 150 * 1024, webp: 220 * 1024 },
  1920: { avif: 280 * 1024, webp: 400 * 1024 },
  2560: { avif: 400 * 1024, webp: 550 * 1024 },
};
const FALLBACK_PNG_MAX = 250 * 1024; // ~200 KB target, 250 KB hard ceiling

const AVIF_OPTS = { quality: 45, effort: 6 };
const WEBP_OPTS = { quality: 70, effort: 6 };

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`✗ Source missing: ${SOURCE}`);
    console.error(
      "  Copy the master PNG into assets-src/hero/ before running this script.",
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  // Clean previous variants so we don't leave stale files behind.
  for (const w of Object.keys(BUDGETS)) {
    for (const ext of ["avif", "webp"]) {
      const p = path.join(OUT_DIR, `fractal-background-${w}.${ext}`);
      if (existsSync(p)) await rm(p);
    }
  }
  const fallbackPath = path.join(OUT_DIR, "fractal-background-fallback.png");
  if (existsSync(fallbackPath)) await rm(fallbackPath);

  const results = [];
  let overBudget = false;

  for (const widthStr of Object.keys(BUDGETS)) {
    const width = Number(widthStr);
    const { avif: avifMax, webp: webpMax } = BUDGETS[width];

    // AVIF
    const avifPath = path.join(OUT_DIR, `fractal-background-${width}.avif`);
    await sharp(SOURCE)
      .resize({ width, withoutEnlargement: true })
      .avif(AVIF_OPTS)
      .toFile(avifPath);
    const avifSize = (await stat(avifPath)).size;
    const avifOk = avifSize <= avifMax;
    if (!avifOk) overBudget = true;
    results.push({
      file: path.relative(repoRoot, avifPath),
      size: avifSize,
      max: avifMax,
      ok: avifOk,
    });

    // WebP
    const webpPath = path.join(OUT_DIR, `fractal-background-${width}.webp`);
    await sharp(SOURCE)
      .resize({ width, withoutEnlargement: true })
      .webp(WEBP_OPTS)
      .toFile(webpPath);
    const webpSize = (await stat(webpPath)).size;
    const webpOk = webpSize <= webpMax;
    if (!webpOk) overBudget = true;
    results.push({
      file: path.relative(repoRoot, webpPath),
      size: webpSize,
      max: webpMax,
      ok: webpOk,
    });
  }

  // PNG fallback. Use 960w (large enough for legacy desktops, small enough to
  // hit ~200 KB after palette quantization). Photo content with 11k+ unique
  // colors compresses poorly as palette PNG at 1280w (~360 KB).
  await sharp(SOURCE)
    .resize({ width: 960, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 80, dither: 0.5 })
    .toFile(fallbackPath);
  const fbSize = (await stat(fallbackPath)).size;
  const fbOk = fbSize <= FALLBACK_PNG_MAX;
  if (!fbOk) overBudget = true;
  results.push({
    file: path.relative(repoRoot, fallbackPath),
    size: fbSize,
    max: FALLBACK_PNG_MAX,
    ok: fbOk,
  });

  // Report
  console.log("\nHero background variants:");
  for (const r of results) {
    const mark = r.ok ? "✓" : "✗";
    console.log(
      `  ${mark} ${r.file.padEnd(50)} ${kb(r.size).padStart(10)}  (budget ${kb(r.max)})`,
    );
  }

  if (overBudget) {
    console.error(
      "\n✗ One or more variants exceeded their byte budget. Lower quality and re-run.",
    );
    process.exit(1);
  }
  console.log("\n✓ All variants within budget.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
