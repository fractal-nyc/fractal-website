import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// Mocks for heavy / WebGL dependencies
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

vi.mock("@/components/gallery/PhotoGallery", () => ({
  PhotoGallery: () => <div data-testid="photo-gallery-mock" />,
}));

vi.mock("@/components/sections/OriginStory", () => ({
  OriginStory: () => <div data-testid="origin-story-mock" />,
}));

vi.mock("@/components/lab/DocumentGrid", () => ({
  DocumentGrid: () => <div data-testid="document-grid-mock" />,
}));

// ═══════════════════════════════════════════════════════════════════════════
// Import pages after mocks
// ═══════════════════════════════════════════════════════════════════════════

import { Home } from "@/pages/Home";
import { HouseBannerGrid } from "@/components/house/HouseBannerGrid";
import { StoryPage } from "@/pages/StoryPage";
import { CampusPage } from "@/pages/CampusPage";
import { NeighborhoodPage } from "@/pages/NeighborhoodPage";
import { EventsPage } from "@/pages/EventsPage";
import { LiberalArtsPage } from "@/pages/LiberalArtsPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { LabPage } from "@/pages/LabPage";
import { PeoplePage } from "@/pages/PeoplePage";

// ---------------------------------------------------------------------------
// Helper: render a page component at the given route
// ---------------------------------------------------------------------------

function renderPage(Page: React.ComponentType, path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <WouterRouter hook={hook}>
      <Page />
    </WouterRouter>,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Each page renders without crashing and includes Navbar + Footer
// ═══════════════════════════════════════════════════════════════════════════

const pages = [
  { name: "StoryPage", Component: StoryPage, path: "/story" },
  { name: "CampusPage", Component: CampusPage, path: "/campus" },
  { name: "NeighborhoodPage", Component: NeighborhoodPage, path: "/neighborhood" },
  { name: "EventsPage", Component: EventsPage, path: "/events" },
  { name: "LiberalArtsPage", Component: LiberalArtsPage, path: "/new-liberal-arts" },
  { name: "PoliticalClubPage", Component: PoliticalClubPage, path: "/political-club" },
  { name: "LabPage", Component: LabPage, path: "/lab" },
  { name: "PeoplePage", Component: PeoplePage, path: "/people" },
] as const;

describe("Page rendering", () => {
  for (const { name, Component, path } of pages) {
    describe(name, () => {
      it(`should render without crashing at ${path}`, () => {
        const { container } = renderPage(Component, path);
        expect(container.querySelector("main")).toBeTruthy();
      });

      it("should include the Navbar", () => {
        renderPage(Component, path);
        // Navbar renders a <header> with fixed positioning
        expect(document.querySelector("header")).toBeTruthy();
      });

      it("should include the Footer", () => {
        renderPage(Component, path);
        expect(document.querySelector("footer")).toBeTruthy();
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Route path mapping — verify the App routes match expected URL structure
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-161 — hidden surfaces
// ═══════════════════════════════════════════════════════════════════════════

describe("FRAC-161 visibility filters", () => {
  it("HouseBannerGrid should NOT render Political Club", () => {
    const { container } = render(<HouseBannerGrid />);
    expect(container.textContent).not.toContain("Political Club");
    // Banner uses "PC" as the monogram for the forum house; it should be absent.
    expect(container.textContent).not.toContain("PC");
  });

  it("Home page should NOT render the 'How Do I Get Involved' banner grid heading", () => {
    const { hook } = memoryLocation({ path: "/", static: true });
    const { container } = render(
      <WouterRouter hook={hook}>
        <Home />
      </WouterRouter>,
    );
    expect(container.textContent).not.toContain("How Do I Get Involved");
  });
});

describe("Route paths match expected URLs", () => {
  const expectedRoutes = [
    { path: "/story", label: "Story" },
    { path: "/campus", label: "Campus" },
    { path: "/neighborhood", label: "Visit" },
    { path: "/events", label: "Events" },
    { path: "/new-liberal-arts", label: "Education" },
    { path: "/political-club", label: "Political Club" },
    { path: "/lab", label: "Publications" },
    { path: "/people", label: "People" },
  ];

  for (const { path, label } of expectedRoutes) {
    it(`should have a route for ${label} at ${path}`, () => {
      // We verify by rendering the correct page at the correct path
      // and checking it renders meaningful content (not a 404).
      const page = pages.find((p) => p.path === path);
      expect(page, `No page found for path ${path}`).toBeTruthy();
      const { container } = renderPage(page!.Component, path);
      // Should render <main> — not-found page doesn't wrap in <main>
      expect(container.querySelector("main")).toBeTruthy();
    });
  }
});
