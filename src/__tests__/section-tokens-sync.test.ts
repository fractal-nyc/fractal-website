import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { SECTIONS } from "@/data/houses";

// ═══════════════════════════════════════════════════════════════════════════
// Section-token drift check (FRAC-204, extended FRAC-205)
//
// `SECTIONS` in `src/data/houses.ts` is the canonical source of each non-house
// section's palette hex — three.js (OctahedronHero + heroNavNodes) feeds the
// real color and the Navbar uses it as a JS string. The `--color-section-*`
// tokens in `src/index.css` are a derived mirror so section pages can reference
// tokens instead of hardcoding hex. These two sources can silently diverge.
// This test asserts they stay in lockstep, exactly like the house-token check.
//
// FRAC-205: section entries are HETEROGENEOUS in shape. A "flooded" section
// (People) carries a `{ light, deep }` pair → tokens
// `--color-section-<slug>-{light,deep}`. A "cream" section (Story) carries a
// single `{ accent }` → token `--color-section-<slug>` (no variant suffix).
// This test handles both: it derives the EXPECTED token set from each SECTIONS
// entry's actual keys, asserts every expected token exists and is hex-equal,
// and asserts there are no orphan section tokens. Non-vacuous: a drifted hex,
// a missing token, or an extra token all fail.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../index.css");
const css = readFileSync(cssPath, "utf8");

/**
 * Parse every section token from index.css into a `tokenName → hex` map.
 *
 * Matches BOTH shapes:
 *   - pair tokens   `--color-section-<slug>-<light|deep>: #HEX;`
 *   - single tokens `--color-section-<slug>: #HEX;`              (e.g. story)
 *
 * The slug body forbids the trailing `-light`/`-deep` so a pair token never
 * also matches as a (slug = "people-light") single token. Token names are
 * stored WITHOUT the `--color-section-` prefix.
 */
function parseSectionTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const re =
    /--color-section-([a-z0-9-]+?)(?:-(light|deep))?\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const [, slug, variant, hex] = match;
    const name = variant ? `${slug}-${variant}` : slug;
    tokens.set(name, hex.toLowerCase());
  }
  return tokens;
}

/**
 * Flatten a SECTIONS entry into `tokenName → hex` expectations.
 *   - `{ light, deep }` → `<slug>-light`, `<slug>-deep`
 *   - `{ accent }`      → `<slug>`
 */
function expectedTokensFor(
  slug: string,
  value: Record<string, string>,
): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [variant, hex] of Object.entries(value)) {
    const name = variant === "accent" ? slug : `${slug}-${variant}`;
    out.push([name, hex.toLowerCase()]);
  }
  return out;
}

const tokens = parseSectionTokens(css);
const sectionKeys = Object.keys(SECTIONS) as (keyof typeof SECTIONS)[];

const allExpected: Array<[string, string]> = sectionKeys.flatMap((key) =>
  expectedTokensFor(key, SECTIONS[key] as Record<string, string>),
);

describe("section token sync (houses.ts SECTIONS ↔ index.css)", () => {
  it("defines exactly one token per SECTIONS variant (across both shapes)", () => {
    expect(sectionKeys.length).toBeGreaterThan(0);
    // Sanity: SECTIONS must currently exercise BOTH shapes so the parser /
    // mapping logic above is genuinely covered (keeps this test non-vacuous).
    expect(allExpected.length).toBeGreaterThan(sectionKeys.length);
    expect(tokens.size).toBe(allExpected.length);
  });

  for (const key of sectionKeys) {
    describe(`section "${key}"`, () => {
      for (const [tokenName, expectedHex] of expectedTokensFor(
        key,
        SECTIONS[key] as Record<string, string>,
      )) {
        it(`token --color-section-${tokenName} matches SECTIONS.${key}`, () => {
          const tokenHex = tokens.get(tokenName);
          expect(
            tokenHex,
            `Missing @theme token --color-section-${tokenName} in src/index.css`,
          ).toBeDefined();
          expect(
            tokenHex,
            `Token --color-section-${tokenName} (${tokenHex}) does not match SECTIONS.${key} (${expectedHex})`,
          ).toBe(expectedHex);
        });
      }
    });
  }

  it("has no orphan section token without a matching SECTIONS entry", () => {
    const expectedNames = new Set(allExpected.map(([name]) => name));
    const orphans = [...tokens.keys()].filter((k) => !expectedNames.has(k));
    expect(
      orphans,
      `Orphan section token(s) in index.css with no matching SECTIONS entry: ${orphans.join(", ")}`,
    ).toEqual([]);
  });
});
