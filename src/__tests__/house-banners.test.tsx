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
import {
  PAINTED_RELIC_PRESET,
  PAINTED_RELIC_TEXTURES,
  PaintedRelicBanner,
} from "@/components/house/PaintedRelicBanner";

const BANNER_ROOT = path.resolve(process.cwd(), "public/images/banners");
const TEXTURE_ROOT = path.resolve(
  process.cwd(),
  "public/images/textures/rough-linen",
);
const PRESET_STYLE_PROPERTIES = {
  texture: "texture-opacity",
  bump: "bump-opacity",
  roughness: "roughness-opacity",
  patina: "patina-opacity",
  dye: "dye-opacity",
  saturation: "saturation",
  contrast: "contrast",
} as const;

const banners = [
  {
    name: "co-living",
    label: "co-living",
    monogram: "CL",
    foundation: "#4F5B0D",
    foundationToken: "var(--color-house-co-living-deep)",
    motif: "#AEB175",
    textFill: "#AEB175",
    labelSize: "17",
    monogramSize: "48",
    Component: CoLivingBannerSVG,
  },
  {
    name: "events",
    label: "events",
    monogram: "E",
    foundation: "#CA5C4E",
    foundationToken: "var(--color-house-events-deep)",
    motif: "#E5A794",
    textFill: "#E5A794",
    labelSize: "20",
    monogramSize: "61",
    Component: EventsBannerSVG,
  },
  {
    name: "campus",
    label: "campus",
    monogram: "C",
    foundation: "#1A3A2E",
    foundationToken: "var(--color-house-campus-deep)",
    motif: "#51805C",
    textFill: "#51805C",
    labelSize: "20",
    monogramSize: "61",
    Component: CampusBannerSVG,
  },
  {
    name: "education",
    label: "education",
    monogram: "E",
    foundation: "#C51C15",
    foundationToken: "var(--color-house-education-light)",
    motif: "#4C0000",
    textFill: "#4C0000",
    labelSize: "17",
    monogramSize: "61",
    Component: EducationBannerSVG,
  },
  {
    name: "library",
    label: "library",
    monogram: "L",
    foundation: "#A33E6F",
    foundationToken: "var(--color-house-library-deep)",
    motif: "#C889AB",
    textFill: "#C889AB",
    labelSize: "20",
    monogramSize: "55",
    Component: LibraryBannerSVG,
  },
  {
    name: "political-club",
    label: "political club",
    monogram: "PC",
    foundation: "#82AFA2",
    foundationToken: "var(--color-house-political-club-light)",
    motif: "#084247",
    textFill: "#084247",
    labelSize: "14",
    monogramSize: "48",
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

  it("keeps the Events label on its approved upward arc", () => {
    const source = fs.readFileSync(
      path.join(BANNER_ROOT, "events-banner.svg"),
      "utf8",
    );
    const document = new DOMParser().parseFromString(source, "image/svg+xml");

    expect(document.querySelector("#eventsArc")?.getAttribute("d")).toBe(
      "M 17 64 Q 61.36 30 105.72 64",
    );
  });

  it("keeps the Education label centered on its lowered arc", () => {
    const source = fs.readFileSync(
      path.join(BANNER_ROOT, "education-banner.svg"),
      "utf8",
    );
    const document = new DOMParser().parseFromString(source, "image/svg+xml");

    expect(document.querySelector("#educationArc")?.getAttribute("d")).toBe(
      "M 9 72 Q 61.36 37 113.72 72",
    );
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
      expect(label?.getAttribute("fill")).toBe(banner.textFill);
      expect(label?.getAttribute("fill")).not.toBe("#D4BA58");
      expect(label?.getAttribute("font-size")).toBe(banner.labelSize);
      expect(label?.textContent).toBe(banner.label);
      expect(monogram?.getAttribute("fill")).toBe(banner.textFill);
      expect(monogram?.getAttribute("fill")).not.toBe("#D4BA58");
      expect(monogram?.getAttribute("font-size")).toBe(banner.monogramSize);
      expect(monogram?.textContent).toBe(banner.monogram);
      expect(source.match(/#D4BA58/gi)).toHaveLength(1);
      expect(source).not.toContain("#C49040");
      expect(source).toMatch(
        /src:url\(data:font\/ttf;base64,[A-Za-z0-9+/]+={0,2}\) format\('truetype'\)/,
      );
      expect(source).not.toContain("#CE8B2D");
    });

    it(`${banner.name} wrapper uses the shared decorative Painted Relic material`, () => {
      const Component = banner.Component;
      const { container } = render(<Component className="test-banner" />);
      const wrapper = container.firstElementChild;
      const image = container.querySelector("img");

      expect(wrapper?.getAttribute("data-banner-material")).toBe(
        "painted-relic",
      );
      expect(wrapper?.getAttribute("data-banner-house")).toBe(banner.name);
      expect(wrapper?.getAttribute("aria-hidden")).toBe("true");
      expect(wrapper?.className).toContain("test-banner");
      expect(wrapper?.className).toContain("pointer-events-none");
      expect(wrapper?.getAttribute("style")).toContain(
        `--painted-relic-foundation: ${banner.foundationToken}`,
      );
      for (const [name, value] of Object.entries(PAINTED_RELIC_PRESET)) {
        const property =
          PRESET_STYLE_PROPERTIES[name as keyof typeof PRESET_STYLE_PROPERTIES];
        expect(wrapper?.getAttribute("style")).toContain(
          `--painted-relic-${property}: ${value}`,
        );
      }
      expect(image).toBeTruthy();
      expect(image?.getAttribute("src")).toBe(
        `/images/banners/${banner.name}-banner.svg`,
      );
      expect(image?.getAttribute("alt")).toBe("");
      expect(image?.getAttribute("aria-hidden")).toBe("true");
      expect(image?.draggable).toBe(false);
      expect(container.querySelectorAll("[data-texture-layer]")).toHaveLength(5);
      expect(
        [...container.querySelectorAll("[data-texture-layer]")].map((layer) =>
          layer.getAttribute("data-texture-layer"),
        ),
      ).toEqual([
        "diffuse",
        "displacement",
        "roughness",
        "patina-edge",
        "dye",
      ]);
      expect(
        container.querySelector('[data-texture-map$="rough_linen_diff_1k.webp"]'),
      ).toBeTruthy();
      expect(
        container.querySelector('[data-texture-map$="rough_linen_disp_1k.webp"]'),
      ).toBeTruthy();
      expect(
        container.querySelector('[data-texture-map$="rough_linen_rough_1k.webp"]'),
      ).toBeTruthy();
    });
  }
});

describe("shared Painted Relic renderer", () => {
  it("keeps the Site B comparison preset and CSS fallback synchronized", () => {
    const css = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/components/house/PaintedRelicBanner.css",
      ),
      "utf8",
    );

    expect(PAINTED_RELIC_PRESET).toEqual({
      texture: 0.14,
      bump: 0.2,
      roughness: 0.14,
      patina: 0.42,
      dye: 0.34,
      saturation: 1.2,
      contrast: 1.08,
    });
    expect(css).toContain(
      "saturate(var(--painted-relic-saturation, 1.2))",
    );
  });

  it("owns geometry, mask hooks, and custom class placement", () => {
    const { container } = render(
      <PaintedRelicBanner
        src="/images/banners/campus-banner.svg"
        foundationColor="var(--color-house-campus-deep)"
        className="custom-banner"
      />,
    );
    const wrapper = container.firstElementChild;
    const css = fs.readFileSync(
      path.resolve(
        process.cwd(),
        "src/components/house/PaintedRelicBanner.css",
      ),
      "utf8",
    );

    expect(wrapper?.className).toContain("custom-banner");
    expect(wrapper?.getAttribute("style")).toContain(
      "--painted-relic-mask: url(/images/banners/campus-banner.svg)",
    );
    expect(css).toContain("aspect-ratio: 122.72 / 368.16");
    expect(css).toContain("-webkit-mask-image: var(--painted-relic-mask)");
    expect(css).toContain("mask-image: var(--painted-relic-mask)");
    expect(css).not.toMatch(/woven|velvet/i);
  });

  it("ships exactly the three referenced production maps", () => {
    const files = fs
      .readdirSync(TEXTURE_ROOT)
      .filter((name) => !name.endsWith(".md"))
      .sort();

    expect(files).toEqual([
      "rough_linen_diff_1k.webp",
      "rough_linen_disp_1k.webp",
      "rough_linen_rough_1k.webp",
    ]);
    for (const texturePath of Object.values(PAINTED_RELIC_TEXTURES)) {
      expect(
        fs.existsSync(path.resolve(process.cwd(), "public", texturePath.slice(1))),
      ).toBe(true);
    }
  });
});
