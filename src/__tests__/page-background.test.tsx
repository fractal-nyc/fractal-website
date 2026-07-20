import { act, cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/pages/Home", () => ({
  Home: () => <main data-testid="page-home" />,
}));
vi.mock("@/pages/ProtocolPage", () => ({
  ProtocolPage: () => <main data-testid="page-protocol" />,
}));
vi.mock("@/pages/CoLivingPage", () => ({
  CoLivingPage: () => <main data-testid="page-co-living" />,
}));
vi.mock("@/pages/CampusPage", () => ({
  CampusPage: () => <main data-testid="page-campus" />,
}));
vi.mock("@/pages/EventsPage", () => ({
  EventsPage: () => <main data-testid="page-events" />,
}));
vi.mock("@/pages/PoliticalClubPage", () => ({
  PoliticalClubPage: () => <main data-testid="page-political-club" />,
}));
vi.mock("@/pages/LibraryPage", () => ({
  LibraryPage: () => <main data-testid="page-library" />,
}));
vi.mock("@/pages/PeoplePage", () => ({
  PeoplePage: () => <main data-testid="page-people" />,
}));
vi.mock("@/pages/not-found", () => ({
  default: () => <div data-testid="page-not-found" />,
}));

import App from "@/App";

const ROOT_BACKGROUND_PROPERTY = "--page-background";
const CREAM = "var(--color-background)";

const CANONICAL_ROUTE_BACKGROUNDS = [
  ["/", CREAM],
  ["/the-protocol", CREAM],
  ["/people", CREAM],
  ["/does-not-exist", CREAM],
  ["/co-living", "var(--color-house-co-living-light)"],
  ["/campus", "var(--color-house-campus-light)"],
  ["/events", "var(--color-house-events-light)"],
  ["/political-club", "var(--color-house-political-club-deep)"],
  ["/library", "var(--color-house-library-light)"],
] as const;

const LEGACY_ROUTE_BACKGROUNDS = [
  ["/story", CREAM],
  ["/visit", "var(--color-house-co-living-light)"],
  ["/neighborhood", "var(--color-house-co-living-light)"],
  ["/publications", "var(--color-house-library-light)"],
  ["/lab", "var(--color-house-library-light)"],
] as const;

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
}

function seedLocation(path: string) {
  window.history.replaceState(null, "", path);
}

function expectRootBackground(value: string) {
  expect(
    document.documentElement.style.getPropertyValue(ROOT_BACKGROUND_PROPERTY),
  ).toBe(value);
}

beforeEach(() => {
  Object.defineProperty(window, "scrollTo", {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });
  document.documentElement.style.removeProperty(ROOT_BACKGROUND_PROPERTY);
  seedLocation("/");
});

afterEach(() => {
  cleanup();
  document.documentElement.style.removeProperty(ROOT_BACKGROUND_PROPERTY);
  seedLocation("/");
  vi.clearAllMocks();
});

describe("page canvas background", () => {
  for (const width of [375, 1280]) {
    describe(`${width}px viewport`, () => {
      for (const [path, expectedBackground] of CANONICAL_ROUTE_BACKGROUNDS) {
        it(`uses ${expectedBackground} at ${path}`, () => {
          setViewport(width);
          seedLocation(path);

          render(<App />);

          expectRootBackground(expectedBackground);
        });
      }
    });
  }

  it.each(LEGACY_ROUTE_BACKGROUNDS)(
    "uses the destination background immediately at legacy route %s",
    (path, expectedBackground) => {
      seedLocation(path);

      render(<App />);

      expectRootBackground(expectedBackground);
    },
  );

  it("updates before paint across client-side route changes and cleans up on unmount", () => {
    seedLocation("/");
    const view = render(<App />);
    expectRootBackground(CREAM);

    act(() => {
      window.history.pushState(null, "", "/campus");
    });
    expectRootBackground("var(--color-house-campus-light)");

    act(() => {
      window.history.pushState(null, "", "/library");
    });
    expectRootBackground("var(--color-house-library-light)");

    view.unmount();
    expectRootBackground("");
  });

  it("makes both the root canvas and body consume the shared background variable", () => {
    const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

    expect(css).toMatch(
      /html,\s*body\s*\{[^}]*background-color:\s*var\(--page-background,\s*var\(--color-background\)\);?[^}]*\}/s,
    );
  });
});
