import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { HOUSES, SECTIONS } from "@/data/houses";

// ═══════════════════════════════════════════════════════════════════════════
// SectorHeader renders the correct letter, name, and color for each section.
//
// Colors are pulled from the canonical data model (HOUSES / SECTIONS) rather
// than hand-typed hex, so a palette change can't leave a stale literal behind
// here. The letter/name/variant of each row mirrors its call site:
//
//   Campus          C   house campus         deep    (Campus.tsx)
//   Fractal Co-Living H house coliving       deep    (CoLivingPage.tsx)
//   Events          E   house events         deep    (EventsPage.tsx)
//   Library         L   house library        deep    (LibraryPage.tsx)
//   Education       E   house school         LIGHT   (page RETIRED — inverted)
//   Political Club  PC  house forum          LIGHT   (page RETIRED — inverted)
//   People          P   SECTIONS.people      deep    (page RETIRED)
//
// The last three no longer have a page: Education, Political Club and People were
// retired and their routes 404 (see routes.test.tsx). Their rows STAY here on
// purpose. The houses/sections and their tokens were deliberately retained so the
// pages are launch-ready, and these rows are what prove the retained colors are
// still real, still SectorHeader-renderable values — not orphans that quietly
// rotted to `undefined` (exactly the failure the Story `accent` note below
// describes). Delete a row only when its token is deleted.
//
// Education and the Political Club invert the pair (deep floods the page, light
// is the accent) — see the House.palette doc comment in src/data/houses.ts.
//
// Story keeps a row here even though Home hand-rolls its own header markup
// (it paints the big "S" and the small label DIFFERENT golds, which SectorHeader
// cannot express). Its color is now SECTIONS.story.deep — the pair's text-safe
// member. `SECTIONS.story.accent` no longer exists: Story became a
// {light, deep} pair like People.
// ═══════════════════════════════════════════════════════════════════════════

const house = (id: string) => {
  const h = HOUSES.find((x) => x.id === id);
  if (!h) throw new Error(`sector-header.test: unknown house id "${id}"`);
  return h;
};

const sections = [
  { letter: "S", name: "Story", color: SECTIONS.story.deep },
  { letter: "C", name: "Campus", color: house("campus").palette.deep },
  { letter: "H", name: "Fractal Co-Living", color: house("coliving").palette.deep },
  { letter: "E", name: "Events", color: house("events").palette.deep },
  { letter: "E", name: "Education", color: house("school").palette.light },
  { letter: "PC", name: "Political Club", color: house("forum").palette.light },
  { letter: "L", name: "Library", color: house("library").palette.deep },
  { letter: "P", name: "People", color: SECTIONS.people.deep },
] as const;

describe("SectorHeader", () => {
  it("every section supplies a real color (guards against an undefined prop)", () => {
    // The old suite fed `SECTIONS.story.accent`, which quietly became undefined
    // when Story turned into a pair — SectorHeader then rendered colorless
    // spans and the color assertion below was the only thing that noticed.
    for (const { name, color } of sections) {
      expect(color, `${name} has no color`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    }
  });

  for (const section of sections) {
    describe(`${section.name} section`, () => {
      it(`renders the letter "${section.letter}"`, () => {
        render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        expect(screen.getByText(section.letter)).toBeTruthy();
      });

      it(`renders the name "${section.name}"`, () => {
        render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        expect(screen.getByText(section.name)).toBeTruthy();
      });

      it("applies the section color to BOTH the letter and the name", () => {
        const { container } = render(
          <SectorHeader
            letter={section.letter}
            name={section.name}
            color={section.color}
          />,
        );
        const letterSpan = container.querySelector<HTMLElement>("span.block")!;
        const nameSpan = container.querySelector<HTMLElement>("span.text-label")!;

        // jsdom normalizes hex to rgb(), so compare both spans against each
        // other and assert neither is empty — an undefined color prop yields "".
        expect(letterSpan.style.color).not.toBe("");
        expect(nameSpan.style.color).not.toBe("");
        expect(letterSpan.style.color).toBe(nameSpan.style.color);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Layout consistency — FRAC-85 regression test
  // ═══════════════════════════════════════════════════════════════════════

  describe("Layout consistency (FRAC-85 regression)", () => {
    const renderStory = () =>
      render(<SectorHeader letter="S" name="Story" color={SECTIONS.story.deep} />);

    it("centers the header", () => {
      const { container } = renderStory();
      expect(container.querySelector(".text-center")).toBeTruthy();
    });

    it("uses the responsive letter sizing (text-[7rem] → md:text-[14rem])", () => {
      const { container } = renderStory();
      const letterSpan = container.querySelector("span.block");
      expect(letterSpan).toBeTruthy();
      expect(letterSpan!.className).toContain("text-[7rem]");
      expect(letterSpan!.className).toContain("md:text-[14rem]");
    });

    it("uses the Jacquard display face for the letter", () => {
      const { container } = renderStory();
      const letterSpan = container.querySelector<HTMLElement>("span.block");
      expect(letterSpan!.style.fontFamily).toContain("Jacquard");
    });

    it("wraps its content in the FadeIn animation", () => {
      const { container } = renderStory();
      const wrapper = container.firstElementChild;
      expect(wrapper).toBeTruthy();
      expect(wrapper!.querySelector(".text-center")).toBeTruthy();
    });
  });
});
