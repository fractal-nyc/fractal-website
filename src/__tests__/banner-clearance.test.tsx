import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// Same three un-hostable-in-jsdom components mocked by pages.test.tsx:
// WebGL, Leaflet, and canvas-2d have no jsdom implementation.
vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

vi.mock("@/components/sections/HousingMap", () => ({
  HousingMap: () => <div data-testid="housing-map-mock" />,
}));

vi.mock("@/components/sections/AccelHeroCanvas", () => ({
  AccelHeroCanvas: () => <div data-testid="accel-hero-canvas-mock" />,
}));

import { Home } from "@/pages/Home";
import { CampusPage } from "@/pages/CampusPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { AcceleratorPage } from "@/pages/AcceleratorPage";
import { EventsPage } from "@/pages/EventsPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { ProtocolPage } from "@/pages/ProtocolPage";
import NotFound from "@/pages/not-found";

function renderPage(Page: React.ComponentType, path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <WouterRouter hook={hook}>
      <Page />
    </WouterRouter>,
  );
}

/**
 * The four sector pages that flank their content with the FIXED pennant banner
 * layer. Because that layer is `position: fixed` it takes part in no layout —
 * without `.clear-banners` on the content wrapper, every section of the page
 * scrolls underneath the pennants and overlaps them.
 */
const BANNER_PAGES = [
  { name: "Campus", Page: CampusPage, path: "/campus" },
  { name: "Co-Living", Page: CoLivingPage, path: "/co-living" },
  { name: "Events", Page: EventsPage, path: "/events" },
  { name: "Library", Page: LibraryPage, path: "/library" },
] as const;

/** Pages with no pennant layer — they must NOT reserve the banner gutters. */
const NO_BANNER_PAGES = [
  { name: "Home", Page: Home, path: "/" },
  { name: "Accelerator", Page: AcceleratorPage, path: "/accelerator" },
  { name: "Protocol", Page: ProtocolPage, path: "/the-protocol" },
  { name: "NotFound", Page: NotFound, path: "/nope" },
] as const;

describe("banner clearance (.clear-banners)", () => {
  describe.each(BANNER_PAGES)("$name", ({ Page, path }) => {
    it("applies .clear-banners to its content wrapper", () => {
      const { container } = renderPage(Page, path);
      expect(container.querySelectorAll(".clear-banners")).toHaveLength(1);
    });

    it("renders a fixed pennant layer whose geometry the clearance mirrors", () => {
      const { container } = renderPage(Page, path);
      const layer = container.querySelector(".fixed[aria-hidden='true']");
      expect(layer).not.toBeNull();
      // The clearance in src/index.css is derived from exactly these two values.
      // If either changes here, `.clear-banners` must change with it.
      expect(layer!.className).toContain("md:inset-x-12");
      expect(layer!.className).toContain("lg:inset-x-16");
      const pennant = layer!.firstElementChild;
      expect(pennant!.className).toContain("md:w-[16%]");
      expect(pennant!.className).toContain("max-w-[210px]");
    });

    it("does not inset the footer — chrome stays full-bleed", () => {
      const { container } = renderPage(Page, path);
      const wrapper = container.querySelector(".clear-banners")!;
      const footer = container.querySelector("[data-site-footer]");
      expect(footer).not.toBeNull();
      expect(wrapper.contains(footer)).toBe(false);
      // The navbar is chrome too — the sticky bar must span the full viewport.
      const nav = container.querySelector("nav") ?? container.querySelector("header");
      if (nav) expect(wrapper.contains(nav)).toBe(false);
    });

    it("keeps the fixed banner layer outside the padded wrapper", () => {
      // The clearance reserves space for the banners; if the banner layer were
      // itself inside the padded wrapper the two would feed back on each other.
      const { container } = renderPage(Page, path);
      const wrapper = container.querySelector(".clear-banners")!;
      const layer = container.querySelector(".fixed[aria-hidden='true']")!;
      expect(wrapper.contains(layer)).toBe(false);
    });
  });

  describe.each(NO_BANNER_PAGES)("$name", ({ Page, path }) => {
    it("has no pennant layer, so it does not reserve banner gutters", () => {
      const { container } = renderPage(Page, path);
      expect(container.querySelector(".clear-banners")).toBeNull();
    });
  });

  /**
   * jsdom does not evaluate media queries, so the responsive half of the
   * contract is pinned against the CSS source. This is the mobile-first
   * assertion that matters: the 375px baseline must reserve NOTHING, because
   * the banner layer is `hidden` below `md`.
   */
  describe("the utility's geometry (src/index.css)", () => {
    // Strip comments — the utility's doc-comment discusses padding in prose,
    // which would otherwise trip the "no padding below md" assertion below.
    const css = readFileSync(resolve(__dirname, "../index.css"), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    const block = css.slice(css.indexOf(".clear-banners {"));

    it("declares the pennant width as min(16%, 210px) — mirroring the layer", () => {
      expect(block).toMatch(/--banner-pennant:\s*min\(16%,\s*210px\)/);
    });

    it("reserves inset-x-12 (3rem) at md and inset-x-16 (4rem) at lg", () => {
      expect(block).toMatch(
        /min-width:\s*48rem[\s\S]*?padding-inline:\s*calc\(3rem \+ var\(--banner-pennant\) \+ var\(--banner-gap\)\)/,
      );
      expect(block).toMatch(
        /min-width:\s*64rem[\s\S]*?padding-inline:\s*calc\(4rem \+ var\(--banner-pennant\) \+ var\(--banner-gap\)\)/,
      );
    });

    it("adds NO padding below md — the 375px baseline keeps its full width", () => {
      // Every padding declaration in the utility must sit inside a min-width
      // media query. An unguarded one would narrow the phone layout for a
      // decoration that is `hidden` there.
      const utility = block.slice(0, block.indexOf("@media"));
      expect(utility).not.toMatch(/padding/);
    });
  });
});
