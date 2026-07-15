import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// Mocks
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
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
// Page content structure (content port: Visit → Co-Living)
// ═══════════════════════════════════════════════════════════════════════════

describe("Co-Living page — content", () => {
  it("should display the SectorHeader with letter H and name 'Fractal Co-Living'", () => {
    renderCoLiving();
    // "H" is the SectorHeader letter — no visible navbar link abbreviates to H
    // (visible letters are C, C, A, E, E, L), so it is unique to the header.
    expect(screen.getAllByText("H").length).toBeGreaterThanOrEqual(1);
    // The SectorHeader name renders the full "Fractal Co-Living" label.
    expect(screen.getByText("Fractal Co-Living")).toBeTruthy();
  });

  it("should display the main heading 'Live Near Your Friends'", () => {
    renderCoLiving();
    expect(screen.getByText(/Live Near Your Friends/i)).toBeTruthy();
  });

  it("should have a housing-interest-form Airtable link", () => {
    renderCoLiving();
    const formLink = screen.getByText("housing interest form");
    const anchor = formLink.closest("a");
    expect(anchor).toBeTruthy();
    expect(anchor!.getAttribute("href")).toContain("airtable.com");
  });

  it("should render the 'Visiting NYC?' callout", () => {
    renderCoLiving();
    expect(screen.getByText("Visiting NYC?")).toBeTruthy();
  });

  it("should use a full-viewport-height top-aligned layout (mobile-first)", () => {
    const { container } = renderCoLiving();
    // Content wrapper is a full-viewport flex column, top-aligned (justify-start).
    const centeredSection = container.querySelector(
      ".min-h-screen.flex.flex-col.items-center.justify-start",
    );
    expect(centeredSection).toBeTruthy();
  });
});
