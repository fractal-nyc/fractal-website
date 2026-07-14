import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// Mocks for the three components jsdom genuinely cannot host.
//
//   FractalCityScene — WebGL. No GL context in jsdom.
//   HousingMap       — Leaflet. Needs real layout/DOM box metrics; jsdom
//                      reports every element as 0×0, so the map throws.
//   AccelHeroCanvas  — canvas 2D. jsdom has no `getContext("2d")`.
//
// Everything else on these pages is plain DOM and renders for real, which is
// the point: these are the smoke tests that catch a page that crashes on mount.
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

vi.mock("@/components/sections/HousingMap", () => ({
  HousingMap: () => <div data-testid="housing-map-mock" />,
}));

vi.mock("@/components/sections/AccelHeroCanvas", () => ({
  AccelHeroCanvas: () => <div data-testid="accel-hero-canvas-mock" />,
}));

// ═══════════════════════════════════════════════════════════════════════════
// Import pages after mocks
// ═══════════════════════════════════════════════════════════════════════════

import { Home } from "@/pages/Home";
import { CampusPage } from "@/pages/CampusPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { AcceleratorPage } from "@/pages/AcceleratorPage";
import { EventsPage } from "@/pages/EventsPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { ProtocolPage } from "@/pages/ProtocolPage";
import NotFound from "@/pages/not-found";

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

/**
 * The 7 routed pages, in App.tsx route order.
 *
 * Education, Political Club and People were RETIRED — their page components are
 * deleted and their routes 404 (pinned in routes.test.tsx). Their color tokens
 * deliberately survive, so house-tokens-sync / section-tokens-sync still cover
 * them; there is simply no page left to smoke-test.
 *
 * `accent` / `pageBg` are the EXACT `--accent` / `--page-bg` values the page is
 * expected to set on its own `<main>`. `null` means "deliberately unset" — see
 * the exception notes in the token describe block below. Asserting the literal
 * value (rather than mere presence) makes this a real drift check: repointing a
 * page at the wrong house's token fails here.
 */
const PAGES = [
  {
    name: "Home",
    Component: Home,
    path: "/",
    accent: "var(--color-section-story-deep)",
    pageBg: "var(--color-background)",
    ownFooter: false,
  },
  {
    name: "CampusPage",
    Component: CampusPage,
    path: "/campus",
    accent: "var(--color-house-campus-deep)",
    pageBg: "var(--color-house-campus-light)",
    ownFooter: false,
  },
  {
    name: "CoLivingPage",
    Component: CoLivingPage,
    path: "/co-living",
    accent: "var(--color-house-coliving-deep)",
    pageBg: "var(--color-house-coliving-light)",
    ownFooter: false,
  },
  {
    name: "AcceleratorPage",
    Component: AcceleratorPage,
    path: "/accelerator",
    // The Accelerator renders a DIFFERENT brand (burgundy accel-* tokens) and
    // has no `--accent` consumer on the page — no <Button>, no MandelbrotCorners.
    // It still sets --page-bg because it renders the shared sticky <Navbar />.
    accent: null,
    pageBg: "var(--color-house-accelerator-light)",
    // ...and it ships its own small <footer>, NOT the shared <Footer />.
    ownFooter: true,
  },
  {
    name: "EventsPage",
    Component: EventsPage,
    path: "/events",
    accent: "var(--color-house-events-deep)",
    pageBg: "var(--color-house-events-light)",
    ownFooter: false,
  },
  {
    name: "LibraryPage",
    Component: LibraryPage,
    path: "/library",
    accent: "var(--color-house-library-deep)",
    pageBg: "var(--color-house-library-light)",
    ownFooter: false,
  },
  {
    name: "ProtocolPage",
    Component: ProtocolPage,
    path: "/the-protocol",
    // The Protocol page is an unthemed CREAM page: it sets neither custom
    // property and relies on the Navbar's own fallback
    // (`bg-[var(--page-bg,var(--color-background))]`), which resolves to the
    // same cream the page floods with. Correct, but it is the one page that
    // does not opt in explicitly.
    accent: null,
    pageBg: null,
    ownFooter: false,
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// Smoke: every page mounts and carries the shared chrome
// ═══════════════════════════════════════════════════════════════════════════

describe("Page rendering", () => {
  for (const { name, Component, path, ownFooter } of PAGES) {
    describe(name, () => {
      it(`renders a <main> without crashing at ${path}`, () => {
        const { container } = renderPage(Component, path);
        expect(container.querySelector("main")).toBeTruthy();
      });

      it("renders the shared Navbar", () => {
        const { container } = renderPage(Component, path);
        // The Navbar is the page's only <header>.
        expect(container.querySelector("header")).toBeTruthy();
      });

      // NB: match the shared Footer by its `data-site-footer` marker, NOT by
      // "the first <footer>". Campus renders a semantic <footer> inside a
      // blockquote citation, which precedes the site footer in the DOM.
      if (ownFooter) {
        it("renders its OWN footer, not the shared <Footer />", () => {
          const { container } = renderPage(Component, path);
          // A <footer> exists...
          expect(container.querySelector("footer")).toBeTruthy();
          // ...but it is not the shared one.
          expect(container.querySelector("[data-site-footer]")).toBeNull();
        });
      } else {
        it("renders the shared Footer", () => {
          const { container } = renderPage(Component, path);
          expect(container.querySelector("footer[data-site-footer]")).toBeTruthy();
        });
      }
    });
  }

  it("NotFound renders the 404 copy and no <main>", () => {
    const { container } = renderPage(NotFound, "/nope");
    expect(container.textContent).toContain("404");
    expect(container.querySelector("main")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// `--accent` + `--page-bg` on <main>
//
// The sticky Navbar paints itself with `var(--page-bg, var(--color-background))`.
// A page that floods a house color but forgets `--page-bg` therefore renders a
// CREAM navbar sitting on a colored page — a silent, purely visual regression
// that no smoke test would catch. `--accent` is the matching contract for the
// page's CTA chrome (<Button> reads `var(--accent, currentColor)`).
// ═══════════════════════════════════════════════════════════════════════════

describe("page surface tokens on <main>", () => {
  /** Pages that flood a non-cream house color — for these, --page-bg is mandatory. */
  const FLOODED = PAGES.filter((p) => p.pageBg && p.pageBg !== "var(--color-background)");

  it("every flooded page sets --page-bg (else: cream navbar on a colored page)", () => {
    expect(FLOODED.length).toBeGreaterThan(0);
    for (const { name, Component, path } of FLOODED) {
      const { container, unmount } = renderPage(Component, path);
      const main = container.querySelector("main")!;
      expect(
        main.style.getPropertyValue("--page-bg"),
        `${name} must set --page-bg on <main>`,
      ).not.toBe("");
      unmount();
    }
  });

  for (const { name, Component, path, accent, pageBg } of PAGES) {
    describe(name, () => {
      it(
        pageBg === null
          ? "leaves --page-bg unset (falls back to cream)"
          : `sets --page-bg to ${pageBg}`,
        () => {
          const { container } = renderPage(Component, path);
          const main = container.querySelector("main")!;
          expect(main.style.getPropertyValue("--page-bg")).toBe(pageBg ?? "");
        },
      );

      it(
        accent === null
          ? "leaves --accent unset (no --accent consumer on this page)"
          : `sets --accent to ${accent}`,
        () => {
          const { container } = renderPage(Component, path);
          const main = container.querySelector("main")!;
          expect(main.style.getPropertyValue("--accent")).toBe(accent ?? "");
        },
      );
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-161 — hidden surfaces
// ═══════════════════════════════════════════════════════════════════════════

describe("FRAC-161 visibility filters", () => {
  it("Home does NOT render the 'How Do I Get Involved' banner grid heading", () => {
    const { container } = renderPage(Home, "/");
    expect(container.textContent).not.toContain("How Do I Get Involved");
  });
});
