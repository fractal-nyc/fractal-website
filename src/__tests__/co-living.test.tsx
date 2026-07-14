import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// Mocks
//
// HousingMap is Leaflet. Leaflet needs real box metrics to place tiles and
// markers; jsdom reports every element as 0×0, so the map cannot mount. Stub it
// and assert the page gives it a home (its "Where We Live" panel) instead.
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/sections/HousingMap", () => ({
  HousingMap: () => <div data-testid="housing-map-mock" />,
}));

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

vi.mock("@/components/house/MandelbrotIcon", () => ({
  MandelbrotIcon: ({ size }: { size: number }) => (
    <svg data-testid="mandelbrot-icon" width={size} height={size} />
  ),
}));

import { CoLivingPage } from "@/pages/CoLivingPage";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderCoLiving() {
  const { hook } = memoryLocation({ path: "/co-living", static: true });
  return render(
    <WouterRouter hook={hook}>
      <CoLivingPage />
    </WouterRouter>,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sector header + hero
// ═══════════════════════════════════════════════════════════════════════════

describe("Co-Living page — hero", () => {
  it("renders the SectorHeader as H / Fractal Co-Living", () => {
    renderCoLiving();

    // NB: select by text, not by `span.block` — the Navbar wordmark is also a
    // `span.block`, and it comes first in the DOM.
    const letter = screen.getByText("H");
    expect(letter.className).toContain("text-[7rem]");

    // The label is the SectorHeader's mono `text-label` span. It is unique in
    // the document because the Navbar menu (which also has a "Fractal Co-Living"
    // row) is closed, so its rows are not mounted.
    const label = screen.getByText("Fractal Co-Living");
    expect(label.className).toContain("text-label");
  });

  it("renders the display heading", () => {
    renderCoLiving();
    expect(screen.getByText(/Live Near Your Friends/i)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Where We Live — the Leaflet housing map
// ═══════════════════════════════════════════════════════════════════════════

describe("Co-Living page — Where We Live", () => {
  it('renders the "Where We Live" section around the housing map', () => {
    renderCoLiving();
    expect(screen.getByText("Where We Live")).toBeTruthy();
    expect(screen.getByTestId("housing-map-mock")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Photo strip
// ═══════════════════════════════════════════════════════════════════════════

describe("Co-Living page — photo strip", () => {
  it("renders three lazily-loaded, alt-texted photos", () => {
    const { container } = renderCoLiving();
    // Scope to the strip by src: the pennants and FractalPattern are inline
    // SVG components, not <img>s, so only the story photos match.
    const photos = Array.from(container.querySelectorAll("img")).filter((img) =>
      (img.getAttribute("src") ?? "").includes("/images/story/"),
    );
    expect(photos.length).toBe(3);

    for (const img of photos) {
      expect(img.getAttribute("loading")).toBe("lazy");
      expect(img.getAttribute("alt")).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// "Visiting NYC?" callout
// ═══════════════════════════════════════════════════════════════════════════

describe("Co-Living page — Visiting NYC? callout", () => {
  it("renders the callout inside a max-w-xl container", () => {
    const { container } = renderCoLiving();
    const callout = container.querySelector(".max-w-xl");
    expect(callout).toBeTruthy();
    expect(callout!.textContent).toContain("Visiting NYC?");
  });

  it("links out to Discord in a new tab", () => {
    renderCoLiving();
    const discord = screen.getByText("Discord").closest("a");
    expect(discord).toBeTruthy();
    expect(discord!.getAttribute("href")).toContain("discord.gg");
    expect(discord!.getAttribute("target")).toBe("_blank");
    expect(discord!.getAttribute("rel")).toContain("noopener");
  });

  it("links the housing interest form out to Airtable in a new tab", () => {
    // This used to be a non-navigating <span>: the design shipped the form as
    // href="#", so the page rendered inert placeholder text rather than a dead
    // link. The real Airtable URL is now known and wired up — the assertion is
    // inverted accordingly, and guards against a regression back to a placeholder
    // (or, worse, an href="#").
    renderCoLiving();
    const form = screen.getByText("housing interest form").closest("a");
    expect(form).toBeTruthy();
    expect(form!.getAttribute("href")).toBe(
      "https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd",
    );
    expect(form!.getAttribute("target")).toBe("_blank");
    expect(form!.getAttribute("rel")).toContain("noopener");
  });

  it("no longer advertises the form as 'coming soon'", () => {
    const { container } = renderCoLiving();
    expect(container.textContent).not.toContain("coming soon");
  });
});
