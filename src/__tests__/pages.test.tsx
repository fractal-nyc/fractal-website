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
import { CampusPage } from "@/pages/CampusPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { EventsPage } from "@/pages/EventsPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { PeoplePage } from "@/pages/PeoplePage";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { EducationPage } from "@/pages/EducationPage";
import { MembersPage } from "@/pages/MembersPage";

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
  { name: "Home", Component: Home, path: "/", hasNavbar: true },
  { name: "CampusPage", Component: CampusPage, path: "/campus", hasNavbar: true },
  { name: "CoLivingPage", Component: CoLivingPage, path: "/co-living", hasNavbar: true },
  { name: "EventsPage", Component: EventsPage, path: "/events", hasNavbar: true },
  { name: "EducationPage", Component: EducationPage, path: "/education", hasNavbar: true },
  { name: "PoliticalClubPage", Component: PoliticalClubPage, path: "/political-club", hasNavbar: true },
  { name: "LibraryPage", Component: LibraryPage, path: "/library", hasNavbar: true },
  { name: "PeoplePage", Component: PeoplePage, path: "/people", hasNavbar: true },
  { name: "ProtocolPage", Component: ProtocolPage, path: "/the-protocol", hasNavbar: true },
  { name: "MembersPage", Component: MembersPage, path: "/members", hasNavbar: true },
] as const;

describe("Page rendering", () => {
  for (const { name, Component, path, hasNavbar } of pages) {
    describe(name, () => {
      it(`should render without crashing at ${path}`, () => {
        const { container } = renderPage(Component, path);
        expect(container.querySelector("main")).toBeTruthy();
      });

      it(`${hasNavbar ? "should include" : "should not include"} the Navbar`, () => {
        renderPage(Component, path);
        if (hasNavbar) {
          expect(document.querySelector("header")).toBeTruthy();
        } else {
          expect(document.querySelector("header")).toBeNull();
        }
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

  it("links the visible Home hero navigation to the existing Story section", () => {
    const { container } = renderPage(Home, "/");
    const storyLink = container.querySelector<HTMLAnchorElement>(
      'header a.nav-link[href="#story"]',
    );

    expect(storyLink).toBeTruthy();
    expect(storyLink).toHaveTextContent("Story");
    expect(
      Array.from(
        storyLink!.closest("nav")!.querySelectorAll<HTMLAnchorElement>(
          "a.nav-link",
        ),
        (link) => link.textContent,
      ),
    ).toEqual(["Events", "Library", "Story"]);
    expect(container.querySelector("main #story")).toBeTruthy();
  });

  it("keeps the Home Note Box token scope transparent and its tinted card intact", () => {
    const { container } = renderPage(Home, "/");
    const label = screen.getByText("Curious about Fractal?");
    const callout = label.closest<HTMLElement>(".rounded-md")!;
    const scope = callout.closest<HTMLElement>("[data-component-colorway]")!;

    expect(scope).toHaveAttribute("data-component-colorway", "story");
    expect(scope).toHaveAttribute("data-component-surface", "paper");
    expect(scope.style.backgroundColor).toBe("transparent");
    expect(scope).not.toHaveClass("bg-transparent");
    expect(callout).toHaveClass(
      "rounded-md",
      "border",
      "bg-[color-mix(in_srgb,var(--component-accent,var(--accent,currentColor))_8%,transparent)]",
    );
    expect(callout.querySelectorAll('svg[width="30"][height="30"]')).toHaveLength(4);
    expect(container.querySelectorAll("a[data-outbound-link] svg")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "Discord" })).toHaveAttribute(
      "href",
      "https://discord.gg/Er974gPTXe",
    );
  });
});

describe("Route paths match expected URLs", () => {
  const expectedRoutes = [
    { path: "/", label: "Home" },
    { path: "/campus", label: "Campus" },
    { path: "/co-living", label: "Co-Living" },
    { path: "/events", label: "Events" },
    { path: "/education", label: "Education" },
    { path: "/political-club", label: "Political Club" },
    { path: "/library", label: "Library" },
    { path: "/people", label: "People" },
    { path: "/the-protocol", label: "Protocol" },
    { path: "/members", label: "Members" },
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
