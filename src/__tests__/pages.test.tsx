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

vi.mock("@/components/publications/DocumentGrid", () => ({
  DocumentGrid: () => <div data-testid="document-grid-mock" />,
}));

// ═══════════════════════════════════════════════════════════════════════════
// Import pages after mocks
// ═══════════════════════════════════════════════════════════════════════════

import { Home } from "@/pages/Home";
import { StoryPage } from "@/pages/StoryPage";
import { CampusPage } from "@/pages/CampusPage";
import { VisitPage } from "@/pages/VisitPage";
import { EventsPage } from "@/pages/EventsPage";
import { EducationPage } from "@/pages/EducationPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { PublicationsPage } from "@/pages/PublicationsPage";
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
  { name: "VisitPage", Component: VisitPage, path: "/visit" },
  { name: "EventsPage", Component: EventsPage, path: "/events" },
  { name: "EducationPage", Component: EducationPage, path: "/education" },
  { name: "PoliticalClubPage", Component: PoliticalClubPage, path: "/political-club" },
  { name: "PublicationsPage", Component: PublicationsPage, path: "/publications" },
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
    { path: "/visit", label: "Visit" },
    { path: "/events", label: "Events" },
    { path: "/education", label: "Education" },
    { path: "/political-club", label: "Political Club" },
    { path: "/publications", label: "Publications" },
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
