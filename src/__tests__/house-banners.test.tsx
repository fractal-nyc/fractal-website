import fs from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampusBannerSVG } from "@/components/house/CampusBannerSVG";
import { CoLivingBannerSVG } from "@/components/house/CoLivingBannerSVG";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { EventsBannerSVG } from "@/components/house/EventsBannerSVG";
import { LibraryBannerSVG } from "@/components/house/LibraryBannerSVG";
import { PoliticalClubBannerSVG } from "@/components/house/PoliticalClubBannerSVG";

const BANNER_ROOT = path.resolve(process.cwd(), "public/images/banners");

const banners = [
  {
    name: "co-living",
    label: "co-living",
    monogram: "CL",
    foundation: "#4F5B0D",
    motif: "#AEB175",
    Component: CoLivingBannerSVG,
  },
  {
    name: "events",
    label: "events",
    monogram: "E",
    foundation: "#CA5C4E",
    motif: "#E5A794",
    Component: EventsBannerSVG,
  },
  {
    name: "campus",
    label: "campus",
    monogram: "C",
    foundation: "#1A3A2E",
    motif: "#51805C",
    Component: CampusBannerSVG,
  },
  {
    name: "education",
    label: "education",
    monogram: "E",
    foundation: "#C51C15",
    motif: "#4C0000",
    Component: EducationBannerSVG,
  },
  {
    name: "library",
    label: "library",
    monogram: "L",
    foundation: "#A33E6F",
    motif: "#C889AB",
    Component: LibraryBannerSVG,
  },
  {
    name: "political-club",
    label: "political club",
    monogram: "PC",
    foundation: "#82AFA2",
    motif: "#084247",
    Component: PoliticalClubBannerSVG,
  },
] as const;

describe("canonical house banner artwork", () => {
  it("ships exactly six canonical assets with no legacy filenames", () => {
    expect(
      fs
        .readdirSync(BANNER_ROOT)
        .filter((name) => name.endsWith("-banner.svg"))
        .sort(),
    ).toEqual(banners.map(({ name }) => `${name}-banner.svg`).sort());
  });

  for (const banner of banners) {
    it(`${banner.name} locks geometry, colors, text roles, and embedded font`, () => {
      const source = fs.readFileSync(
        path.join(BANNER_ROOT, `${banner.name}-banner.svg`),
        "utf8",
      );
      const document = new DOMParser().parseFromString(source, "image/svg+xml");
      const root = document.documentElement;
      const inset = document.querySelector('[data-role="inset-outline"]');
      const label = document.querySelector('[data-role="banner-label"]');
      const monogram = document.querySelector('[data-role="monogram"]');

      expect(root.getAttribute("viewBox")).toBe("0 0 122.72 368.16");
      expect(document.querySelector('[data-role="foundation"]')).toBeTruthy();
      expect(source).toContain(banner.foundation);
      expect(source).toContain(banner.motif);
      expect(inset?.getAttribute("stroke")).toBe("#D4BA58");
      expect(inset?.getAttribute("d")).toContain("L61.36 323.70");
      expect(label?.getAttribute("fill")).toBe("#C49040");
      expect(label?.textContent).toBe(banner.label);
      expect(monogram?.getAttribute("fill")).toBe("#C49040");
      expect(monogram?.textContent).toBe(banner.monogram);
      expect(source).toMatch(/data:font\/ttf;base64,[A-Za-z0-9+/=]+/);
      expect(source).not.toContain("#CE8B2D");
    });

    it(`${banner.name} wrapper remains a decorative, non-draggable image`, () => {
      const Component = banner.Component;
      const { container } = render(<Component className="test-banner" />);
      const image = container.querySelector("img");

      expect(image).toBeTruthy();
      expect(image?.getAttribute("src")).toBe(
        `/images/banners/${banner.name}-banner.svg`,
      );
      expect(image?.getAttribute("alt")).toBe("");
      expect(image?.getAttribute("aria-hidden")).toBe("true");
      expect(image?.draggable).toBe(false);
      expect(image?.className).toContain("test-banner");
      expect(image?.className).toContain("pointer-events-none");
    });
  }
});
