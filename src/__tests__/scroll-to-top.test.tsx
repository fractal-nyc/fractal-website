/**
 * FRAC-132: Scroll-to-top on navigation — regression tests
 *
 * Verifies the <ScrollToTop /> component defined in src/App.tsx fires
 * window.scrollTo(0, 0) on every route change (FRAC-62 fix). If the
 * <ScrollToTop /> mount is removed from App.tsx, these tests must fail.
 *
 * Covers the seven scenarios from plans/task_01KNQ4JZG03SEM6MP68AWKX87H.md:
 *   1. Home -> deep page (375px mobile viewport)
 *   2. Home -> deep page (1280px desktop viewport)
 *   3. Deep page -> another deep page
 *   4. Mobile menu drawer scenario (navigate directly, per plan fallback)
 *   5. Multi-hop sequential navigations
 *   6. ScrollToTop unit test (narrow contract)
 *   7. Back/forward preservation guard (documents current behavior)
 *
 * IMPORTANT: integration tests mount the real <App /> so the effect under
 * test is the one defined in src/App.tsx. Commenting out <ScrollToTop />
 * in App.tsx must cause these tests to fail — the implementer verifies this
 * manually before PR merge.
 *
 * Navigation mechanism: wouter's browser-location hook monkey-patches
 * history.pushState/replaceState to emit synthetic events that the router
 * listens to. We drive route changes in the test by calling
 * window.history.pushState(...) directly, which both updates location and
 * triggers wouter's subscription.
 */

import { act, render, cleanup } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { useEffect } from "react";
import { Router as WouterRouter, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// Mock heavy page/scene components so <App /> can render synchronously.
// Each page becomes a trivial stub — the test targets <ScrollToTop />, not
// page content.
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

vi.mock("@/components/lab/ArchiveToolbar", () => ({
  ArchiveToolbar: () => <div data-testid="archive-toolbar-mock" />,
}));

vi.mock("@/hooks/use-archive-filter", () => ({
  useArchiveFilter: () => ({ isFiltering: false, filtered: [] }),
}));

// Stub every page to a trivial marker div. The router still mounts and
// transitions between them, which is all ScrollToTop cares about.
vi.mock("@/pages/Home", () => ({
  Home: () => <main data-testid="page-home" />,
}));
vi.mock("@/pages/StoryPage", () => ({
  StoryPage: () => <main data-testid="page-story" />,
}));
vi.mock("@/pages/CampusPage", () => ({
  CampusPage: () => <main data-testid="page-campus" />,
}));
vi.mock("@/pages/NeighborhoodPage", () => ({
  NeighborhoodPage: () => <main data-testid="page-neighborhood" />,
}));
vi.mock("@/pages/EventsPage", () => ({
  EventsPage: () => <main data-testid="page-events" />,
}));
vi.mock("@/pages/LiberalArtsPage", () => ({
  LiberalArtsPage: () => <main data-testid="page-liberal-arts" />,
}));
vi.mock("@/pages/PoliticalClubPage", () => ({
  PoliticalClubPage: () => <main data-testid="page-political-club" />,
}));
vi.mock("@/pages/LabPage", () => ({
  LabPage: () => <main data-testid="page-lab" />,
}));
vi.mock("@/pages/PeoplePage", () => ({
  PeoplePage: () => <main data-testid="page-people" />,
}));
vi.mock("@/pages/ProtocolPage", () => ({
  ProtocolPage: () => <main data-testid="page-protocol" />,
}));
vi.mock("@/pages/BadgePlayground", () => ({
  BadgePlayground: () => <main data-testid="page-badge" />,
}));
vi.mock("@/pages/not-found", () => ({
  default: () => <div data-testid="page-not-found" />,
}));

// ═══════════════════════════════════════════════════════════════════════════
// Import App AFTER mocks are registered
// ═══════════════════════════════════════════════════════════════════════════

import App from "@/App";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Install a vi.fn() spy on window.scrollTo for the current test. */
function installScrollToSpy() {
  const spy = vi.fn();
  Object.defineProperty(window, "scrollTo", {
    value: spy,
    writable: true,
    configurable: true,
  });
  return spy;
}

/** Force window.innerWidth for viewport-sensitive assertions. */
function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
}

/**
 * Set the current URL before rendering <App />. Uses history.replaceState
 * so no synthetic event fires — it's an initial seed, not a navigation.
 *
 * Must be called BEFORE render(<App />). App's router reads
 * location.pathname on mount.
 */
function seedLocation(path: string) {
  window.history.replaceState(null, "", path);
}

/**
 * Programmatically navigate by calling history.pushState. Wouter's browser
 * location hook patches pushState to dispatch a synthetic event that
 * triggers its subscribers — so a real <Router> in <App /> will observe
 * the change and re-render, which in turn runs the ScrollToTop effect.
 */
function pushRoute(path: string) {
  window.history.pushState(null, "", path);
}

// ═══════════════════════════════════════════════════════════════════════════
// Per-test setup/teardown
// ═══════════════════════════════════════════════════════════════════════════

let scrollToSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollToSpy = installScrollToSpy();
  // Always start from a known clean URL.
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  // Restore a no-op scrollTo so other test files in the same run don't see
  // our spy.
  Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
    configurable: true,
  });
  // Reset URL so subsequent tests start clean.
  window.history.replaceState(null, "", "/");
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// Mirror of ScrollToTop in src/App.tsx for the narrow unit-contract test.
// If src/App.tsx's ScrollToTop diverges, update this copy too.
// ═══════════════════════════════════════════════════════════════════════════

function ScrollToTopMirror() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════

describe("Scroll-to-top on navigation (FRAC-132 regression)", () => {
  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 1 + 2: Home -> deep page at both viewports
  // ═════════════════════════════════════════════════════════════════════════
  describe("Home -> flag click (destination page)", () => {
    it("fires scrollTo(0,0) on mobile (375px) when navigating from / to /campus", () => {
      setViewport(375);
      seedLocation("/");
      render(<App />);

      // Clear the initial-mount call so the assertion isolates the navigation.
      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/campus");
      });

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it("fires scrollTo(0,0) on desktop (1280px) when navigating from / to /campus", () => {
      setViewport(1280);
      seedLocation("/");
      render(<App />);

      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/campus");
      });

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 3: Deep page -> another deep page
  // ═════════════════════════════════════════════════════════════════════════
  describe("Deep page -> deep page", () => {
    it("fires scrollTo(0,0) when navigating from /story to /campus", () => {
      seedLocation("/story");
      render(<App />);
      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/campus");
      });

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 4: Mobile menu drawer scenario
  // ═════════════════════════════════════════════════════════════════════════
  describe("Mobile menu drawer navigation (375px)", () => {
    it("fires scrollTo(0,0) when a drawer link triggers navigation", () => {
      // Per plan, the overlay is flaky under jsdom; drive navigation directly.
      // ScrollToTop watches useLocation — the click mechanism is irrelevant to
      // what we're proving: the effect fires on any location change in App.
      setViewport(375);
      seedLocation("/story");
      render(<App />);
      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/events");
      });

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 5: Multi-hop sequential navigations
  // ═════════════════════════════════════════════════════════════════════════
  describe("Multi-hop sequential navigations", () => {
    it("fires scrollTo(0,0) on each hop: / -> /story -> /campus -> /people", () => {
      seedLocation("/");
      render(<App />);
      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/story");
      });
      act(() => {
        pushRoute("/campus");
      });
      act(() => {
        pushRoute("/people");
      });

      const zeroZeroCalls = scrollToSpy.mock.calls.filter(
        ([x, y]) => x === 0 && y === 0,
      );
      expect(zeroZeroCalls.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 6: ScrollToTop unit test (narrow contract)
  //
  // Uses a mirror of ScrollToTop (the real one isn't exported from App.tsx)
  // plus wouter's memoryLocation hook. Pins the component's contract
  // independently of App.tsx wiring: mount + every navigate must fire
  // scrollTo(0,0). If the mirror diverges from App.tsx, update it here.
  // ═════════════════════════════════════════════════════════════════════════
  describe("ScrollToTop unit contract", () => {
    it("fires scrollTo(0,0) on initial mount and every subsequent navigate", () => {
      const loc = memoryLocation({ path: "/", record: true });
      render(
        <WouterRouter hook={loc.hook}>
          <ScrollToTopMirror />
        </WouterRouter>,
      );

      // Initial mount fires the effect once.
      expect(scrollToSpy).toHaveBeenCalledTimes(1);
      expect(scrollToSpy).toHaveBeenNthCalledWith(1, 0, 0);

      act(() => {
        loc.navigate("/campus");
      });
      expect(scrollToSpy).toHaveBeenCalledTimes(2);
      expect(scrollToSpy).toHaveBeenNthCalledWith(2, 0, 0);

      act(() => {
        loc.navigate("/events");
      });
      expect(scrollToSpy).toHaveBeenCalledTimes(3);
      expect(scrollToSpy).toHaveBeenNthCalledWith(3, 0, 0);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Scenario 7: Back/forward preservation guard (documenting expected behavior)
  // ═════════════════════════════════════════════════════════════════════════
  describe("Back/forward behavior (design guard)", () => {
    it("fires scrollTo(0,0) on every location change, including back navigation", () => {
      // NOTE: This test documents the CURRENT intended behavior per FRAC-62.
      // ScrollToTop fires on EVERY route change, including browser back/forward.
      // If a future task adds scroll restoration on back/forward, this test
      // will fail — that is a DESIGN CHANGE, not a regression. Update this
      // test together with the design change; do not silently disable it.
      seedLocation("/");
      render(<App />);
      scrollToSpy.mockClear();

      act(() => {
        pushRoute("/campus");
      });
      const afterForward = scrollToSpy.mock.calls.length;
      expect(afterForward).toBeGreaterThanOrEqual(1);

      // Simulate "back" by pushing the previous route. Observable effect is
      // identical to a real browser-back under the current ScrollToTop
      // contract: location changes, the effect runs, scrollTo(0,0) fires.
      act(() => {
        pushRoute("/");
      });

      const afterBack = scrollToSpy.mock.calls.length;
      expect(afterBack).toBeGreaterThan(afterForward);
      // The last call should still be (0,0).
      const lastCall = scrollToSpy.mock.calls[scrollToSpy.mock.calls.length - 1];
      expect(lastCall).toEqual([0, 0]);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // App-level integration: mounting <App /> alone fires scrollTo(0,0).
  // Simplest probe for FRAC-62 wiring in App.tsx.
  // ═════════════════════════════════════════════════════════════════════════
  describe("App-level integration (verifies App.tsx wiring)", () => {
    it("calls scrollTo(0,0) at least once when <App /> mounts", () => {
      render(<App />);
      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });
});
