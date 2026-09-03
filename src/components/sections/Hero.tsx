import { Suspense, lazy, useCallback } from "react";
import { useLocation } from "wouter";
import type { SearchResult } from "@/hooks/use-global-search";
import { ArrowDown } from "lucide-react";
import { HomeSearchBar } from "@/components/sections/HomeSearchBar";
// FRAC-33: keyboard skip-nav fallback — the 3D nav nodes inside
// FractalCityScene are pointer-only, so we render a parallel
// sr-only-focusable list of the same routes here. Tabbing into the
// hero brings the list into view; Enter follows each route.
// FRAC-181: import from the three-free heroNavNodes module rather than from
// OctahedronHero — the latter statically imports three + @react-three/* and
// would otherwise drag the 900 KB three-vendor chunk onto the entry chunk,
// defeating the lazy FractalCityScene split.
import { OUTER_NAV_NODES } from "@/components/three/heroNavNodes";

const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

export function Hero() {
  const [, setLocation] = useLocation();

  // Keep the absolute-URL branch for external search/document results. All hero
  // navigation nodes themselves now use internal routes.
  const handleNavigate = useCallback(
    (route: string) => {
      if (/^https?:\/\//.test(route)) {
        window.open(route, "_blank", "noopener,noreferrer");
        return;
      }
      setLocation(route);
    },
    [setLocation]
  );

  const handleSearchResult = useCallback((result: SearchResult) => {
    if (result.external) {
      window.open(result.href, "_blank", "noopener");
    } else {
      handleNavigate(result.href);
    }
  }, [handleNavigate]);

  return (
    <section
      className="hero-shell bg-background text-foreground"
      data-hero-shell
    >
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
            <li key={`${node.vertexIndex}:${node.label}`}>
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

      <div className="hero-stage" data-hero-stage>
        <div aria-hidden="true" className="absolute inset-0 page-gutter pointer-events-none">
          <span className="block h-full w-full" data-hero-safe-zone />
        </div>
        <Suspense fallback={null}>
          <FractalCityScene onNavigate={handleNavigate} />
        </Suspense>
      </div>

      {/* CTA — instructs visitors to use the Octant (the hero octahedron) as
          the primary navigation. Intentional hero-only treatment: italic
          Fraunces at a custom caption size (not one of the DESIGN.md display
          tiers) for a quiet editorial voice, sized to sit on a single line at
          the 375px baseline. `italic` is explicit even though .font-serif
          already italicizes, to keep the intent obvious. `font-light` (300) is
          the lightest Fraunces master loaded (index.html trims the family to
          300..500). The whole line uses text-foreground/70 (the darker "Octant"
          color) and is flanked by `~` per the requested treatment. Positioned
          below the geometry (above the search bar) so "above" reads true;
          pointer-transparent so it never blocks taps/swipes underneath. */}
      <p
        className="hidden lg:block font-serif italic font-light normal-case text-lg md:text-2xl whitespace-nowrap absolute bottom-[6.5rem] md:bottom-28 left-1/2 -translate-x-1/2 z-10 max-w-full text-center text-foreground/70 pointer-events-none"
      >
        ~ Interact with the Octant above to navigate ~
      </p>

      {/* Mobile / small-tablet hero footer (< lg) — FRAC-3. The Story now lives
          directly below the hero, so the hero's lower edge previews it: a short
          Story blurb on the left and an "Explore our Story" affordance on the
          right that smooth-scrolls down to the #story section (Home enables
          scroll-behavior: smooth). The desktop search bar and octant caption
          are hidden here; the always-on octant labels (FRAC-266) already signal
          that the octant itself is interactive. The container is
          pointer-events-none so it never blocks taps/swipes on the octant
          underneath — only the scroll link re-enables pointer events. Sizes
          step up from phone (<md) to small tablet (md..lg). */}
      <div
        className="hero-footer lg:hidden z-10 page-gutter pointer-events-none"
        data-hero-footer
      >
        <p
          className="text-body text-foreground/85 leading-relaxed min-w-0 md:text-lg"
          data-hero-blurb
        >
          In 2021, our small group of friends decided to live, learn, and build
          together in NYC.
        </p>
        <a
          href="#story"
          aria-label="Explore our Story — scroll to the Story section"
          className="pointer-events-auto shrink-0 inline-flex max-w-full min-h-11 min-w-11 items-center gap-2 text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-sm py-2"
          data-hero-cta
        >
          <span className="inline-flex items-center text-label leading-none" data-hero-cta-label>
            Explore our Story
          </span>
          <ArrowDown className="block h-6 w-6 shrink-0 md:h-7 md:w-7" data-hero-arrow />
        </a>
      </div>

      {/* Search bar — desktop only (>= lg); on small screens the hero footer
          above replaces it. */}
      <div
        className="hidden lg:block absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-sm"
      >
        <HomeSearchBar
          onSelectResult={handleSearchResult}
          enableGlobalShortcut
        />
      </div>

      {/* Hero background — responsive variants from FRAC-177 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" data-hero-background>
        <picture className="block h-full w-full">
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
            className="hero-background-image block w-full h-full object-cover"
            data-hero-background-image
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

    </section>
  );
}
