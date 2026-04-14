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

vi.mock("@/components/house/MandelbrotIcon", () => ({
  MandelbrotIcon: ({ size }: { size: number }) => (
    <svg data-testid="mandelbrot-icon" width={size} height={size} />
  ),
}));

import { NeighborhoodPage } from "@/pages/NeighborhoodPage";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderNeighborhood() {
  const { hook } = memoryLocation({ path: "/neighborhood", static: true });
  return render(
    <WouterRouter hook={hook}>
      <NeighborhoodPage />
    </WouterRouter>,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Note container max-width constraint (FRAC-87 regression)
// The note container must have a max-width so it doesn't stretch full-width
// on large screens, making it hard to read.
// ═══════════════════════════════════════════════════════════════════════════

describe("Neighborhood page — Note container (FRAC-87 regression)", () => {
  it("should have a max-width constraint on the note container", () => {
    const { container } = renderNeighborhood();
    // The note container uses MandelbrotCorners wrapper with max-w-xl
    const noteContainer = container.querySelector(".max-w-xl");
    expect(noteContainer).toBeTruthy();
    // Verify it contains the "Note" heading
    const noteHeading = noteContainer!.querySelector("p");
    expect(noteHeading).toBeTruthy();
    expect(noteHeading!.textContent).toContain("Note");
  });

  it("should center the note container with mx-auto", () => {
    const { container } = renderNeighborhood();
    const noteContainer = container.querySelector(".max-w-xl.mx-auto");
    expect(noteContainer).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Ordered list centering and structure
// ═══════════════════════════════════════════════════════════════════════════

describe("Neighborhood page — ordered list", () => {
  it("should contain an ordered list with 3 steps", () => {
    const { container } = renderNeighborhood();
    const ol = container.querySelector("ol");
    expect(ol).toBeTruthy();
    const items = ol!.querySelectorAll("li");
    expect(items.length).toBe(3);
  });

  it("should center the ordered list within the note container", () => {
    const { container } = renderNeighborhood();
    // The ol is inside a flex justify-center div
    const centeringDiv = container.querySelector(".flex.justify-center");
    expect(centeringDiv).toBeTruthy();
    const ol = centeringDiv!.querySelector("ol");
    expect(ol).toBeTruthy();
  });

  it("should use list-decimal styling for the ordered list", () => {
    const { container } = renderNeighborhood();
    const ol = container.querySelector("ol");
    expect(ol!.className).toContain("list-decimal");
  });

  it("should have consistent spacing between list items", () => {
    const { container } = renderNeighborhood();
    const ol = container.querySelector("ol");
    // Uses space-y-1 (mobile) md:space-y-2 (desktop) for consistent spacing
    expect(ol!.className).toMatch(/space-y-/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Page content structure
// ═══════════════════════════════════════════════════════════════════════════

describe("Neighborhood page — content", () => {
  it("should display the SectorHeader with letter V", () => {
    renderNeighborhood();
    // "V" appears in navbar NavLink's decorative first letter as well as the
    // SectorHeader's letter span — use getAllByText.
    expect(screen.getAllByText("V").length).toBeGreaterThanOrEqual(1);
    // "Visit" appears in both the navbar links and the SectorHeader name,
    // so use getAllByText and verify at least one is the SectorHeader's <span>
    const visitElements = screen.getAllByText("Visit");
    expect(visitElements.length).toBeGreaterThanOrEqual(1);
    const sectorSpan = visitElements.find(
      (el) => el.tagName === "SPAN" && el.className.includes("tracking-widest"),
    );
    expect(sectorSpan).toBeTruthy();
  });

  it("should display the main heading about living near friends", () => {
    renderNeighborhood();
    expect(screen.getByText(/Live Near 100 Friends/i)).toBeTruthy();
  });

  it("should have a Visitor Form CTA link", () => {
    renderNeighborhood();
    const visitorLink = screen.getByText("Visitor Form");
    expect(visitorLink.closest("a")).toBeTruthy();
    expect(visitorLink.closest("a")!.getAttribute("href")).toContain("airtable.com");
  });

  it("should use full-viewport-height layout (min-h-screen flex centering)", () => {
    const { container } = renderNeighborhood();
    const centeredSection = container.querySelector(".min-h-screen.flex.flex-col.items-center.justify-center");
    expect(centeredSection).toBeTruthy();
  });
});
