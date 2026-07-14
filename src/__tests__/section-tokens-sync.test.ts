import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { SECTIONS, NAV_PORTAL_COLOR } from "@/data/houses";

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
// SHAPE: every section entry is a `{ light, deep }` PAIR — People and Story
// alike — mirroring a HousePalette. Story used to be the odd one out, carrying
// a single `{ accent }` (token `--color-section-story`, no variant suffix); it
// is now the gold pair `{ light: #D4BA58, deep: #a08a2e }`, so that shape is
// gone and no section exercises it any more.
//
// The PARSER below still recognises the old suffix-less shape on purpose. It is
// not dead code: expectations are built strictly as pairs, so a leftover or
// hand-added `--color-section-<slug>: #HEX;` gets parsed, matches no expected
// token, and is caught by the orphan check instead of being silently ignored.
// Narrowing the parser to `-light|-deep` would quietly weaken that.
//
// Non-vacuous: a drifted hex, a missing token, an extra token, or a section
// that stops being a pair all fail.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../index.css");
const css = readFileSync(cssPath, "utf8");

/**
 * Parse every section token from index.css into a `tokenName → hex` map.
 *
 * Matches BOTH shapes:
 *   - pair tokens   `--color-section-<slug>-<light|deep>: #HEX;`   (the only
 *                                                                   shape in use)
 *   - single tokens `--color-section-<slug>: #HEX;`                (legacy; kept
 *                                                                   so strays are
 *                                                                   caught as
 *                                                                   orphans)
 *
 * The lazy slug body means a pair token always binds its `-light`/`-deep` into
 * the variant group rather than swallowing it into the slug. Token names are
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

/** Flatten a SECTIONS entry into `tokenName → hex` expectations: `<slug>-{light,deep}`. */
function expectedTokensFor(
  slug: string,
  value: Record<string, string>,
): Array<[string, string]> {
  return Object.entries(value).map(([variant, hex]) => [
    `${slug}-${variant}`,
    hex.toLowerCase(),
  ]);
}

const tokens = parseSectionTokens(css);
const sectionKeys = Object.keys(SECTIONS) as (keyof typeof SECTIONS)[];

const allExpected: Array<[string, string]> = sectionKeys.flatMap((key) =>
  expectedTokensFor(key, SECTIONS[key] as Record<string, string>),
);

describe("section token sync (houses.ts SECTIONS ↔ index.css)", () => {
  it("every SECTIONS entry is a {light, deep} pair", () => {
    expect(sectionKeys.length).toBeGreaterThan(0);
    for (const key of sectionKeys) {
      expect(
        Object.keys(SECTIONS[key]).sort(),
        `SECTIONS.${key} must be a { light, deep } pair`,
      ).toEqual(["deep", "light"]);
    }
  });

  it("defines exactly one token per SECTIONS variant", () => {
    // Pairs only ⇒ two tokens per section, and index.css must hold exactly those.
    expect(allExpected.length).toBe(sectionKeys.length * 2);
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

// ═══════════════════════════════════════════════════════════════════════════
// NAV_PORTAL_COLOR — the "Enter the Fractal" menu row.
//
// It has no page, so it is not a section and carries a nav-only identity color.
// The Navbar reads the JS constant; `--color-nav-portal` in index.css is the
// mirror. Same drift risk, same check.
// ═══════════════════════════════════════════════════════════════════════════

describe("nav portal token sync (NAV_PORTAL_COLOR ↔ index.css)", () => {
  it("--color-nav-portal matches NAV_PORTAL_COLOR", () => {
    const match = /--color-nav-portal\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/.exec(css);
    expect(
      match,
      "Missing @theme token --color-nav-portal in src/index.css",
    ).toBeTruthy();
    expect(match![1].toLowerCase()).toBe(NAV_PORTAL_COLOR.toLowerCase());
  });
});
