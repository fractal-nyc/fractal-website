import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { HOUSES } from "@/data/houses";

// ═══════════════════════════════════════════════════════════════════════════
// House-token drift check (FRAC-203)
//
// `src/data/houses.ts` is the canonical source of each house's palette hex —
// house pages read the pair for flooded backgrounds/accents and three.js feeds
// real colors. The `--color-house-*` tokens in `src/index.css` are a derived
// mirror so house pages can reference tokens instead of hardcoding hex. These
// two sources can silently diverge (FRAC-203 found Political Club missing from
// @theme entirely). This test asserts they stay in lockstep: all 7 houses ×
// {light, deep} = 14 tokens, each present and hex-equal to its palette member.
//
// The token slug comes from the house's explicit `tokenSlug` field. It used to
// be DERIVED from the display name here, which was fragile in exactly the way
// you'd expect: "Fractal Co-Living" slugifies to `fractal-co-living`, but the
// token is `--color-house-coliving-*`. A derived slug turns a token rename into
// a silent pass (the test looks for a token that was never supposed to exist);
// reading the declared field turns it into a loud failure.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../index.css");
const css = readFileSync(cssPath, "utf8");

/** Parse every `--color-house-<slug>-<light|deep>: #HEX;` token from index.css. */
function parseHouseTokens(source: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const re =
    /--color-house-([a-z0-9-]+)-(light|deep)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const [, slug, variant, hex] = match;
    tokens.set(`${slug}-${variant}`, hex.toLowerCase());
  }
  return tokens;
}

const tokens = parseHouseTokens(css);

describe("house token sync (houses.ts ↔ index.css)", () => {
  it("defines exactly 14 house tokens (7 houses × light/deep)", () => {
    expect(HOUSES).toHaveLength(7);
    expect(tokens.size).toBe(14);
  });

  it("every house declares a non-empty tokenSlug", () => {
    for (const house of HOUSES) {
      expect(
        house.tokenSlug,
        `House "${house.id}" is missing its tokenSlug`,
      ).toBeTruthy();
    }
    // Slugs must be unique, or two houses would fight over one token pair.
    const slugs = HOUSES.map((h) => h.tokenSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const house of HOUSES) {
    const slug = house.tokenSlug;

    describe(`${house.displayName ?? house.name} (id "${house.id}", tokenSlug "${slug}")`, () => {
      for (const variant of ["light", "deep"] as const) {
        it(`token --color-house-${slug}-${variant} matches palette.${variant}`, () => {
          const key = `${slug}-${variant}`;
          const tokenHex = tokens.get(key);
          expect(
            tokenHex,
            `Missing @theme token --color-house-${key} in src/index.css`,
          ).toBeDefined();
          expect(
            tokenHex,
            `Token --color-house-${key} (${tokenHex}) does not match houses.ts palette.${variant} (${house.palette[variant]})`,
          ).toBe(house.palette[variant].toLowerCase());
        });
      }
    });
  }

  it("has no orphan house token without a matching house", () => {
    const expectedKeys = new Set(
      HOUSES.flatMap((h) => [`${h.tokenSlug}-light`, `${h.tokenSlug}-deep`]),
    );
    const orphans = [...tokens.keys()].filter((k) => !expectedKeys.has(k));
    expect(
      orphans,
      `Orphan house token(s) in index.css with no matching house: ${orphans.join(", ")}`,
    ).toEqual([]);
  });
});
