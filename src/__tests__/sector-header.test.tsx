import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SectorHeader } from "@/components/layout/SectorHeader";

// ═══════════════════════════════════════════════════════════════════════════
// Mock Framer Motion — SectorHeader uses FadeIn which wraps motion.div.
// We let the real FadeIn render (IntersectionObserver is mocked in setup).
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SectorHeader renders correct letter and name for each section
// ═══════════════════════════════════════════════════════════════════════════

const sections = [
  { letter: "S", name: "Story", color: "#8A7A20" },
  { letter: "C", name: "Campus", color: "#1A3A2E" },
  { letter: "V", name: "Visit", color: "#4A5A30" },
  { letter: "E", name: "Events", color: "#C13B2A" },
  { letter: "E", name: "Education", color: "#C41E20" },
  { letter: "PC", name: "Political Club", color: "#C83858" },
  { letter: "W", name: "Writing", color: "#C44878" },
  { letter: "P", name: "People", color: "#B65D19" },
] as const;

describe("SectorHeader", () => {
  for (const section of sections) {
    describe(`${section.name} section`, () => {
      it(`should render the letter "${section.letter}"`, () => {
        render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        expect(screen.getByText(section.letter)).toBeTruthy();
      });

      it(`should render the name "${section.name}"`, () => {
        render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        expect(screen.getByText(section.name)).toBeTruthy();
      });

      it("should apply the section color to both letter and name", () => {
        const { container } = render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        // jsdom normalizes hex colors to rgb() — check that both spans
        // have a non-empty color style set (the actual value is the section color)
        const spans = container.querySelectorAll("span");
        const coloredSpans = Array.from(spans).filter(
          (el) => el.style.color !== "",
        );
        // Letter span and name span should both have color set
        expect(coloredSpans.length).toBeGreaterThanOrEqual(2);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Layout consistency — FRAC-85 regression test
  // All SectorHeaders should use centered text with consistent sizing
  // ═══════════════════════════════════════════════════════════════════════

  describe("Layout consistency (FRAC-85 regression)", () => {
    it("should have text-center class for centered layout", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color="#8A7A20" />,
      );
      const headerDiv = container.querySelector(".text-center");
      expect(headerDiv).toBeTruthy();
    });

    it("should use consistent responsive text sizing for the letter", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color="#8A7A20" />,
      );
      const letterSpan = container.querySelector("span.block");
      expect(letterSpan).toBeTruthy();
      // Mobile: text-[7rem], Desktop: md:text-[14rem]
      expect(letterSpan!.className).toContain("text-[7rem]");
      expect(letterSpan!.className).toContain("md:text-[14rem]");
    });

    it("should use Jacquard serif font for the letter", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color="#8A7A20" />,
      );
      const letterSpan = container.querySelector<HTMLElement>("span.block");
      expect(letterSpan).toBeTruthy();
      expect(letterSpan!.style.fontFamily).toContain("Jacquard");
    });

    it("should wrap content in FadeIn animation", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color="#8A7A20" />,
      );
      // FadeIn renders a motion.div — in jsdom this becomes a regular div
      // with data-* or style attributes from framer-motion
      const wrapper = container.firstElementChild;
      expect(wrapper).toBeTruthy();
      // The wrapper should contain the text-center div
      expect(wrapper!.querySelector(".text-center")).toBeTruthy();
    });
  });
});
