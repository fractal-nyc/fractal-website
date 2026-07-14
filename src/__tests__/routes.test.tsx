import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════════════
// Route table check for src/App.tsx.
//
// Every page is stubbed to a marker, so this file tests ONE thing: that each
// URL mounts the page it is supposed to mount. That makes it the test that
// catches a typo'd `path=` or two routes pointing at the same component —
// neither of which a per-page render test can see.
//
// It also pins the "no legacy redirects" decision. The site was never deployed,
// so there are no bookmarks to preserve: /story, /visit and /publications are
// simply 404s now, NOT redirects to their successors. The same decision covers
// the three RETIRED pages — /education, /people and /political-club — whose page
// components were deleted outright. If someone re-adds a redirect (or quietly
// re-adds a page), the 404 assertions below fail and force the conversation.
//
// Navigation mechanism: App owns its own <Router> with the browser hook, so the
// tests drive it by seeding window.history before render (same approach as
// scroll-to-top.test.tsx).
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/pages/Home", () => ({ Home: () => <main data-testid="page-home" /> }));
vi.mock("@/pages/CampusPage", () => ({
  CampusPage: () => <main data-testid="page-campus" />,
}));
vi.mock("@/pages/CoLivingPage", () => ({
  CoLivingPage: () => <main data-testid="page-co-living" />,
}));
vi.mock("@/pages/AcceleratorPage", () => ({
  AcceleratorPage: () => <main data-testid="page-accelerator" />,
}));
vi.mock("@/pages/EventsPage", () => ({
  EventsPage: () => <main data-testid="page-events" />,
}));
vi.mock("@/pages/LibraryPage", () => ({
  LibraryPage: () => <main data-testid="page-library" />,
}));
vi.mock("@/pages/ProtocolPage", () => ({
  ProtocolPage: () => <main data-testid="page-protocol" />,
}));
vi.mock("@/pages/not-found", () => ({
  default: () => <div data-testid="page-not-found" />,
}));

import App from "@/App";

/** Seed the URL, then mount App — its router reads location.pathname on mount. */
function renderAt(path: string) {
  window.history.replaceState(null, "", path);
  return render(<App />);
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

/** The 7 live routes, and the page each must mount. */
const ROUTES = [
  { path: "/", testId: "page-home" },
  { path: "/campus", testId: "page-campus" },
  { path: "/co-living", testId: "page-co-living" },
  { path: "/accelerator", testId: "page-accelerator" },
  { path: "/events", testId: "page-events" },
  { path: "/library", testId: "page-library" },
  { path: "/the-protocol", testId: "page-protocol" },
] as const;

describe("App route table", () => {
  for (const { path, testId } of ROUTES) {
    it(`mounts ${testId} at ${path}`, () => {
      renderAt(path);
      expect(screen.getByTestId(testId)).toBeTruthy();
      expect(screen.queryByTestId("page-not-found")).toBeNull();
    });
  }

  it("maps each route to a DISTINCT page (no duplicate component wiring)", () => {
    const ids = ROUTES.map((r) => r.testId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("No legacy redirects (the site was never deployed)", () => {
  // Story folded into Home, Visit became Co-Living, Publications became the
  // Library. Each simply took its new name — the old paths are 404s.
  const RENAMED = ["/story", "/visit", "/publications"];

  for (const path of RENAMED) {
    it(`${path} renders 404 — it does NOT redirect`, () => {
      renderAt(path);
      expect(screen.getByTestId("page-not-found")).toBeTruthy();
    });
  }

  it("an unknown path renders 404", () => {
    renderAt("/definitely-not-a-page");
    expect(screen.getByTestId("page-not-found")).toBeTruthy();
  });
});

describe("Retired pages 404 (deleted outright, no redirect)", () => {
  // Education, People and Political Club were deleted — page components and all.
  // Same decision as the renames above: no redirect, because nothing links here.
  //
  // NOTE the deliberate asymmetry these assertions protect: the pages are gone,
  // but their COLOR TOKENS are not. `house-education-*`, `house-political-club-*`
  // and `section-people-*` are all still declared (and still exercised by
  // house-tokens-sync / section-tokens-sync), because the houses/sections live on
  // as octahedron faces and diagram nodes and must stay launch-ready. A surviving
  // token is NOT evidence of a surviving route — that is exactly what these
  // assertions pin.
  const RETIRED = ["/education", "/people", "/political-club"];

  for (const path of RETIRED) {
    it(`${path} renders 404 — the page is gone and is NOT redirected`, () => {
      renderAt(path);
      expect(screen.getByTestId("page-not-found")).toBeTruthy();
    });
  }
});
