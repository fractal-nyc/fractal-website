#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Design-conformance gate (FRAC-202)
//
// Preventive half of the design-governance loop: fails CI when *new* off-vocabulary
// color values are introduced, so drift is either conformed to a token or
// deliberately documented — never merged silently. Companion to the periodic
// /design-audit sweep.
//
// "Sanctioned" = design tokens parsed live from src/index.css @theme (so a token
// rename never breaks the gate) + a baseline allowlist of currently-grandfathered
// off-token values (scripts/design-conformance.baseline.json). Only values beyond
// the baseline fail.
//
//   node scripts/design-conformance.mjs              # check; exits 1 on net-new drift
//   node scripts/design-conformance.mjs --update-baseline   # regenerate the baseline
//
// Currently covers the COLOR dimension. Structured so typography/spacing can be
// added as further "extractors" later.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const CSS = join(ROOT, "src", "index.css");
const BASELINE = join(ROOT, "scripts", "design-conformance.baseline.json");
const UPDATE = process.argv.includes("--update-baseline");

// ── helpers ──────────────────────────────────────────────────────────────────
function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "__tests__" || name === "node_modules") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}
const rel = (p) => p.slice(ROOT.length + 1);
// Normalize a hex to lowercase #rrggbb (expand #rgb) for stable comparison.
function normHex(h) {
  let x = h.replace("#", "").toLowerCase();
  if (x.length === 3) x = x.split("").map((c) => c + c).join("");
  if (x.length === 8) x = x.slice(0, 6); // drop alpha
  return "#" + x;
}

// ── 1. sanctioned token names, derived from index.css @theme ──────────────────
function tokenColorNames() {
  const css = readFileSync(CSS, "utf8");
  const theme = css.match(/@theme[^{]*\{([\s\S]*?)\n\}/);
  const block = theme ? theme[1] : css;
  const names = new Set();
  for (const m of block.matchAll(/--color-([a-z0-9-]+)\s*:/g)) names.add(m[1]);
  return names; // e.g. background, foreground, foreground-muted, foreground-faint, house-*
}

// ── 2. extract off-token color usages from a file ─────────────────────────────
// Returns [{ value, line }] for raw hex in arbitrary classes and inline styles.
function extractHexUsages(text) {
  const out = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // skip data-URI / SVG filter noise (feTurbulence etc.) — not design colors
    if (/data:image\/svg|feColorMatrix|feTurbulence|baseFrequency/.test(line)) return;
    // a) arbitrary color classes:  bg-[#abc], text-[#aabbcc], ring-[#...], etc.
    for (const m of line.matchAll(
      /\b(?:bg|text|border|ring|from|to|via|fill|stroke|outline|divide|decoration|shadow|caret|accent)-\[#([0-9a-fA-F]{3,8})\]/g
    )) {
      out.push({ value: normHex(m[1]), line: i + 1 });
    }
    // b) QUOTED hex literals — inline style objects, JSX color attrs, color
    //    props (e.g. style={{ color: "#171717" }}, fill="#aabbcc"). The quotes
    //    are required so prose, comments, git refs, and hex-shaped words aren't
    //    mistaken for colors (FRAC-202 review finding). Same quote char both
    //    sides via the \1 backref.
    for (const m of line.matchAll(/(["'])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\1/g)) {
      out.push({ value: normHex(m[2]), line: i + 1 });
    }
  });
  return out;
}

// ── 3. collect all usages across src ──────────────────────────────────────────
function collectUsages() {
  const files = walk(SRC, [".tsx", ".ts", ".css"]);
  const usages = []; // { value, file, line }
  const seen = new Set(); // dedup: a value matched by >1 pattern on the same line counts once
  for (const f of files) {
    // index.css IS the token source of truth — its hex defs aren't "usage"
    if (f === CSS) continue;
    const file = rel(f);
    for (const u of extractHexUsages(readFileSync(f, "utf8"))) {
      const key = `${file}:${u.line}:${u.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      usages.push({ ...u, file });
    }
  }
  return usages;
}

// ── main ──────────────────────────────────────────────────────────────────────
const tokens = tokenColorNames(); // (informational — utilities are inherently fine)
const usages = collectUsages();
const distinct = [...new Set(usages.map((u) => u.value))].sort();

if (UPDATE) {
  writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        _comment:
          "Grandfathered off-token color values (FRAC-202). Net-new values beyond this list fail the design-conformance gate. To bless a new value: add it here AND document the intent in DESIGN.md. Regenerate with `node scripts/design-conformance.mjs --update-baseline`.",
        colors: distinct,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`Baseline updated: ${distinct.length} grandfathered color values.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE)
  ? new Set(JSON.parse(readFileSync(BASELINE, "utf8")).colors ?? [])
  : new Set();

const violations = usages.filter((u) => !baseline.has(u.value));

if (violations.length === 0) {
  console.log(
    `✓ design-conformance: no net-new off-vocabulary colors ` +
      `(${distinct.length} grandfathered values; ${tokens.size} sanctioned tokens).`
  );
  process.exit(0);
}

// Report net-new violations grouped by value.
console.error("✗ design-conformance: net-new off-vocabulary color(s) introduced.\n");
const byValue = new Map();
for (const v of violations) {
  if (!byValue.has(v.value)) byValue.set(v.value, []);
  byValue.get(v.value).push(v);
}
for (const [value, sites] of [...byValue].sort()) {
  console.error(`  ${value}`);
  for (const s of sites) console.error(`    ${s.file}:${s.line}`);
}
console.error(
  `\nResolve each by EITHER:\n` +
    `  • using a design token (see src/index.css @theme / DESIGN.md), or\n` +
    `  • blessing it as intentional: add the value to scripts/design-conformance.baseline.json\n` +
    `    (or run \`node scripts/design-conformance.mjs --update-baseline\`) AND document the\n` +
    `    intent in DESIGN.md.\n`
);
process.exit(1);
