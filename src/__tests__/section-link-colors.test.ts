import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexCss = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

describe("section link color contract", () => {
  it("uses the semantic default token and the light token for interaction states", () => {
    expect(indexCss).toMatch(
      /\.nav-link\s*\{[\s\S]*?color:\s*var\(--nav-c-default,\s*var\(--nav-c-deep,\s*var\(--nav-c,\s*currentColor\)\)\)/,
    );
    expect(indexCss).toMatch(
      /\.nav-link:hover,[\s\S]*?\.nav-link:focus-visible,[\s\S]*?\.nav-link:active,[\s\S]*?\.nav-link\.is-active\s*\{[\s\S]*?color:\s*var\(--nav-c,\s*var\(--nav-c-deep,\s*currentColor\)\)/,
    );
    expect(indexCss).toMatch(
      /\.nav-link:focus-visible\s*\{[\s\S]*?outline:\s*2px solid var\(--nav-c-deep,\s*currentColor\)/,
    );
  });
});
