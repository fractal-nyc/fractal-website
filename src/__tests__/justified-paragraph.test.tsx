import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { JustifiedParagraph } from "@/components/typeset/JustifiedParagraph";
import { hyphenateWord, softHyphenate } from "@/lib/typeset/hyphenate";

beforeAll(() => {
  // jsdom does not implement canvas getContext. Stub it with a minimal mock so
  // the component can mount and exercise its layout path without crashing.
  // The mock returns a context whose measureText reports 7px per character —
  // not pixel-accurate, but stable and finite.
  const fakeCtx = {
    fillStyle: "",
    font: "",
    textBaseline: "",
    setTransform: () => {},
    clearRect: () => {},
    fillRect: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
    measureText: (s: string) => ({ width: s.length * 7 }),
  } as unknown as CanvasRenderingContext2D;
  HTMLCanvasElement.prototype.getContext = vi
    .fn()
    .mockReturnValue(fakeCtx) as unknown as HTMLCanvasElement["getContext"];
});

afterEach(() => {
  cleanup();
});

describe("JustifiedParagraph", () => {
  const SAMPLE = "we believe small groups who share context deeply build agentic tools";

  it("renders an sr-only mirror with the exact source text", () => {
    const { container } = render(
      <JustifiedParagraph
        text={SAMPLE}
        fontFamily="'JetBrains Mono'"
        fontSize={13}
        lineHeight={18}
      />,
    );
    const srOnly = container.querySelector("p.sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toBe(SAMPLE);
  });

  it("renders an aria-hidden canvas", () => {
    const { container } = render(
      <JustifiedParagraph
        text={SAMPLE}
        fontFamily="'JetBrains Mono'"
        fontSize={13}
        lineHeight={18}
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("does not throw when mounted with uppercase prop", () => {
    expect(() =>
      render(
        <JustifiedParagraph
          text={SAMPLE}
          fontFamily="'JetBrains Mono'"
          fontSize={13}
          lineHeight={18}
          uppercase
        />,
      ),
    ).not.toThrow();
  });

  it("preserves the original (non-uppercased) text in the sr-only mirror even when uppercase is set", () => {
    // Screen readers and crawlers see the source text. Visual rendering uses
    // toUpperCase but the accessible text stays in its original casing.
    const { container } = render(
      <JustifiedParagraph
        text={SAMPLE}
        fontFamily="'JetBrains Mono'"
        fontSize={13}
        lineHeight={18}
        uppercase
      />,
    );
    const srOnly = container.querySelector("p.sr-only");
    expect(srOnly?.textContent).toBe(SAMPLE);
  });
});

describe("hyphenate", () => {
  it("returns single-element array for short words", () => {
    expect(hyphenateWord("foo")).toEqual(["foo"]);
    expect(hyphenateWord("the")).toEqual(["the"]);
  });

  it("uses HYPHEN_EXCEPTIONS for known hero copy words", () => {
    expect(hyphenateWord("apartment")).toEqual(["a", "part", "ment"]);
    expect(hyphenateWord("collaboration")).toEqual([
      "col",
      "lab",
      "o",
      "ra",
      "tion",
    ]);
    expect(hyphenateWord("neighborhood")).toEqual(["neigh", "bor", "hood"]);
  });

  it("softHyphenate joins parts with U+00AD", () => {
    const out = softHyphenate("we believe");
    expect(out).toBe("we be\u00ADlieve");
  });

  it("softHyphenate preserves whitespace tokens", () => {
    const out = softHyphenate("hello   world");
    expect(out.includes("   ")).toBe(true);
  });
});
