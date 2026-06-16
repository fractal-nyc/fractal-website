import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { SECTIONS } from "@/data/houses";

// ═══════════════════════════════════════════════════════════════════════════
// Section-token drift check (FRAC-204)
//
// `SECTIONS` in `src/data/houses.ts` is the canonical source of each non-house
// section's palette hex — three.js (OctahedronHero) feeds the real color and
// the Navbar uses it as a JS string. The `--color-section-*-{light,deep}`
// tokens in `src/index.css` are a derived mirror so section pages can reference
// tokens instead of hardcoding hex. These two sources can silently diverge.
// This test asserts they stay in lockstep, exactly like the house-token check:
// every SECTIONS entry × {light,deep} is present in @theme and hex-equal, with
// no orphan section tokens. Non-vacuous: a drifted hex fails.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../index.css");
const css = readFileSync(cssPath, "utf8");

/** Parse every `--color-section-<slug>-<light|deep>: #HEX;` token from index.css. */
function parseSectionTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const re =
    /--color-section-([a-z0-9-]+)-(light|deep)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const [, slug, variant, hex] = match;
    tokens.set(`${slug}-${variant}`, hex.toLowerCase());
  }
  return tokens;
}

const tokens = parseSectionTokens(css);
const sectionKeys = Object.keys(SECTIONS) as (keyof typeof SECTIONS)[];

describe("section token sync (houses.ts SECTIONS ↔ index.css)", () => {
  it("defines exactly one token pair per SECTIONS entry", () => {
    expect(sectionKeys.length).toBeGreaterThan(0);
    expect(tokens.size).toBe(sectionKeys.length * 2);
  });

  for (const key of sectionKeys) {
    describe(`section "${key}"`, () => {
      for (const variant of ["light", "deep"] as const) {
        it(`token --color-section-${key}-${variant} matches SECTIONS.${key}.${variant}`, () => {
          const tokenKey = `${key}-${variant}`;
          const tokenHex = tokens.get(tokenKey);
          expect(
            tokenHex,
            `Missing @theme token --color-section-${tokenKey} in src/index.css`,
          ).toBeDefined();
          expect(
            tokenHex,
            `Token --color-section-${tokenKey} (${tokenHex}) does not match SECTIONS.${key}.${variant} (${SECTIONS[key][variant]})`,
          ).toBe(SECTIONS[key][variant].toLowerCase());
        });
      }
    });
  }

  it("has no orphan section token without a matching SECTIONS entry", () => {
    const expectedKeys = new Set(
      sectionKeys.flatMap((k) => [`${k}-light`, `${k}-deep`]),
    );
    const orphans = [...tokens.keys()].filter((k) => !expectedKeys.has(k));
    expect(
      orphans,
      `Orphan section token(s) in index.css with no matching SECTIONS entry: ${orphans.join(", ")}`,
    ).toEqual([]);
  });
});
