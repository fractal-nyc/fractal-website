import { Suspense, lazy, useCallback } from "react";
import { useLocation } from "wouter";
// FRAC-33: keyboard skip-nav fallback — the 3D nav nodes inside
// FractalCityScene are pointer-only, so we render a parallel
// sr-only-focusable list of the same routes here. Tabbing into the
// hero brings the list into view; Enter follows each route.
// FRAC-181: import from the three-free heroNavNodes module rather than from
// OctahedronHero — the latter statically imports three + @react-three/* and
// would otherwise drag the 900 KB three-vendor chunk onto the entry chunk,
// defeating the lazy FractalCityScene split.
import { OUTER_NAV_NODES } from "@/components/three/heroNavNodes";

// Keep the lazy()/Suspense split: FractalCityScene pulls in three +
// @react-three/fiber + drei (~900 KB). A static import would move that chunk
// onto the entry bundle and stall first paint on phones.
const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (route: string) => setLocation(route),
    [setLocation]
  );

  return (
    // Height/padding note: this used to be `min-h-screen ... pt-20`, which dated
    // from the old fixed-overlay Navbar that content had to clear. The Navbar is
    // now `sticky` and sits in normal flow, so that top padding was dead space
    // stacked on top of a full-viewport box — it pushed the octahedron well below
    // the fold. 88vh (no pt) is the design's own hero height and centers the
    // scene just under the wordmark.
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-background text-foreground">
      {/* FRAC-33: Keyboard skip-nav for the hero octahedron.
          The 3D nav nodes are only reachable via pointer events on the
          R3F mesh — keyboard users have no path. This parallel nav is
          visually hidden until any descendant receives focus, at which
          point it pops out in the top-left corner. Anchors use full
          page reloads (no Wouter Link import here intentionally — the
          tag is invisible to mouse users so a tiny extra reload on
          activation isn't worth the coupling). */}
      <nav
        aria-label="Hero navigation (keyboard)"
        className="sr-only-focusable absolute top-2 left-2 z-50"
      >
        <ul className="flex flex-col gap-1 bg-background text-foreground border border-foreground/20 p-3 text-label">
          {OUTER_NAV_NODES.map((node) => (
            <li key={node.route}>
              <a
                href={node.route}
                onClick={(e) => {
                  // Stay inside the SPA when activated by mouse/keyboard.
                  e.preventDefault();
                  handleNavigate(node.route);
                }}
                className="block px-2 py-1 hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              >
                {node.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Suspense fallback={null}>
        <FractalCityScene onNavigate={handleNavigate} />
      </Suspense>

      {/* Hero background — responsive variants from FRAC-177 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <picture>
          {/* FRAC-194: capped at 1280w. The background is decorative (opacity
              0.15, scale 1.35) — larger variants are imperceptible and the 2560w
              AVIF was the page's heaviest asset (242 KB). Keep srcset in sync with
              the AVIF preload in index.html and BUDGETS in scripts/build-hero-bg.mjs. */}
          <source
            type="image/avif"
            srcSet={`
              ${import.meta.env.BASE_URL}images/hero/fractal-background-640.avif 640w,
              ${import.meta.env.BASE_URL}images/hero/fractal-background-1280.avif 1280w
            `}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`
              ${import.meta.env.BASE_URL}images/hero/fractal-background-640.webp 640w,
              ${import.meta.env.BASE_URL}images/hero/fractal-background-1280.webp 1280w
            `}
            sizes="100vw"
          />
          <img
            src={`${import.meta.env.BASE_URL}images/hero/fractal-background-fallback.png`}
            alt="NYC skyline backdrop"
            className="w-full h-full object-cover object-bottom"
            style={{
              opacity: 0.15,
              transform: "translate(2.75%, -8%) scale(1.35)",
            }}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

    </section>
  );
}
