import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { HOUSES, SECTIONS } from "@/data/houses";

// ═══════════════════════════════════════════════════════════════════════════
// Mock Framer Motion — SectorHeader uses FadeIn which wraps motion.div.
// We let the real FadeIn render (IntersectionObserver is mocked in setup).
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SectorHeader renders correct letter and name for each section
// ═══════════════════════════════════════════════════════════════════════════

const sections = [
  // FRAC-205: Story is now a cream section with a single gold identity accent
  // sourced from SECTIONS.story.accent. Its old deep-gold accent was dropped
  // when the page moved off the gold flood; this test just feeds the
  // SectorHeader a color prop and asserts it renders, so it reads from the
  // canonical source like the People row below.
  { letter: "S", name: "Story", color: SECTIONS.story.accent },
  { letter: "C", name: "Campus", color: "#1A3A2E" },
  // Content port: Visit → Co-Living (monogram "CL"), Publications →
  // Library (letter "L").
  { letter: "CL", name: "Co-Living", color: "#4F5B0D" },
  { letter: "E", name: "Events", color: "#CA5C4E" },
  { letter: "E", name: "Education", color: HOUSES.find(({ id }) => id === "school")!.palette.light },
  { letter: "PC", name: "Political Club", color: "#82AFA2" },
  { letter: "L", name: "Library", color: "#A33E6F" },
  { letter: "P", name: "People", color: SECTIONS.people.accent },
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
        render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        expect(screen.getByText(section.letter)).toHaveStyle({ color: section.color });
        expect(screen.getByText(section.name)).toHaveStyle({ color: section.color });
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
        <SectorHeader letter="S" name="Story" color={SECTIONS.story.accent} />,
      );
      const headerDiv = container.querySelector(".text-center");
      expect(headerDiv).toBeTruthy();
    });

    it("should use consistent responsive text sizing for the letter", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color={SECTIONS.story.accent} />,
      );
      const letterSpan = container.querySelector("span.block");
      expect(letterSpan).toBeTruthy();
      // Mobile: text-[7rem], Desktop: md:text-[14rem]
      expect(letterSpan!.className).toContain("text-[7rem]");
      expect(letterSpan!.className).toContain("md:text-[14rem]");
    });

    it("should use Jacquard serif font for the letter", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color={SECTIONS.story.accent} />,
      );
      const letterSpan = container.querySelector<HTMLElement>("span.block");
      expect(letterSpan).toBeTruthy();
      expect(letterSpan!.style.fontFamily).toContain("Jacquard");
    });

    it("should wrap content in FadeIn animation", () => {
      const { container } = render(
        <SectorHeader letter="S" name="Story" color={SECTIONS.story.accent} />,
      );
      // FadeIn renders a motion.div — in jsdom this becomes a regular div
      // with data-* or style attributes from framer-motion
      const wrapper = container.firstElementChild;
      expect(wrapper).toBeTruthy();
      // The wrapper should contain the text-center div
      expect(wrapper!.querySelector(".text-center")).toBeTruthy();
    });
  });

  it("can split decorative letter paint from the essential name label", () => {
    render(
      <SectorHeader
        letter="E"
        name="Education"
        color="var(--color-house-education-light)"
        nameColor="hsl(var(--background))"
      />,
    );
    expect(document.querySelector("[data-sector-letter]")).toHaveStyle({
      color: "var(--color-house-education-light)",
    });
    expect(document.querySelector("[data-sector-name]")).toHaveStyle({
      color: "hsl(var(--background))",
    });
  });
});
