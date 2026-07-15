import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { CampusPage } from "@/pages/CampusPage";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderCampus() {
  const { hook } = memoryLocation({ path: "/campus", static: true });
  return render(
    <WouterRouter hook={hook}>
      <CampusPage />
    </WouterRouter>,
  );
}

// The nine Meet-the-Space captions, in source order.
const CAPTIONS = [
  /5000 sq\. ft of private rooftop/i,
  /A full kitchen, with an island/i,
  /Open coworking space with room to spread out/i,
  /Seating, seating, and more seating/i,
  /Large call booths for meetings/i,
  /Small call booths for quick one-on-ones/i,
  /cozy engineers are productive engineers/i,
  /Roomy private office or large meeting room/i,
  /Nice and clean/i,
];

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-4 — "Meet the Space" carousel
// ═══════════════════════════════════════════════════════════════════════════

describe("Campus — Meet the Space carousel", () => {
  it("renders a carousel region", () => {
    renderCampus();
    const region = screen.getByRole("region", { name: /photos of fractal campus/i });
    expect(region).toBeTruthy();
    expect(region.getAttribute("aria-roledescription")).toBe("carousel");
  });

  it("keeps all nine photos and their captions in the DOM (content parity)", () => {
    renderCampus();
    const region = screen.getByRole("region", { name: /photos of fractal campus/i });
    // Embla renders every slide up front (no virtualization), so all nine
    // slide groups are present regardless of layout measurement in jsdom.
    const slides = within(region).getAllByRole("group");
    expect(slides).toHaveLength(9);
    for (const caption of CAPTIONS) {
      expect(within(region).getByText(caption)).toBeTruthy();
    }
  });

  it("exposes accessible previous/next controls", () => {
    renderCampus();
    const region = screen.getByRole("region", { name: /photos of fractal campus/i });
    expect(within(region).getByRole("button", { name: /previous slide/i })).toBeTruthy();
    expect(within(region).getByRole("button", { name: /next slide/i })).toBeTruthy();
  });

  it("uses a mobile-first peek layout on the first slide (375px baseline)", () => {
    renderCampus();
    const region = screen.getByRole("region", { name: /photos of fractal campus/i });
    const [firstSlide] = within(region).getAllByRole("group");
    // ~1 card + peek on mobile, widening to 1/2 (tablet) and 1/3 (desktop).
    expect(firstSlide.className).toContain("basis-[82%]");
    expect(firstSlide.className).toContain("sm:basis-1/2");
    expect(firstSlide.className).toContain("lg:basis-1/3");
  });
});
