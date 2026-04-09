import { Suspense, lazy, useCallback, useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { Search, User, FileText, MapPin, Hash, ArrowUpRight, LayoutGrid } from "lucide-react";

const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

const TYPE_ICONS: Record<string, typeof Search> = {
  page: LayoutGrid,
  person: User,
  document: FileText,
  house: MapPin,
  topic: Hash,
};

// FRAC-145: Static octahedron poster shown during Suspense + WebGL warm-up.
// Owned by Hero state (posterMounted + posterFading), NOT by Suspense's
// `fallback` prop — Suspense resolves at chunk-parse time, several frames
// before WebGL paints, so fading on Suspense resolution would flash an
// empty Canvas. Instead, Hero triggers the fade when FractalCityScene
// signals `onReady` (after a double-rAF chain) and unmounts on
// `transitionend` so the opacity transition can actually play.
function HeroPoster({
  fading,
  onTransitionEnd,
}: {
  fading: boolean;
  onTransitionEnd: () => void;
}) {
  return (
    <div
      className={`absolute inset-0 z-[3] flex items-center justify-center pointer-events-none transition-opacity duration-300 motion-reduce:duration-0 ${fading ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
      data-poster-state={fading ? "fading" : "visible"}
      onTransitionEnd={onTransitionEnd}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/hero-poster.jpg`}
        alt=""
        className="object-contain"
        style={{ width: "min(90vmin, 550px)", aspectRatio: "1 / 1" }}
        draggable={false}
      />
    </div>
  );
}

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (route: string) => setLocation(route),
    [setLocation]
  );

  // FRAC-145: Poster lifecycle. Two states because a single `posterVisible`
  // boolean would unmount the DOM node before the opacity transition could
  // play — mount must persist *through* the fade, then unmount after
  // `transitionend`.
  const [posterMounted, setPosterMounted] = useState(true);
  const [posterFading, setPosterFading] = useState(false);

  const handleSceneReady = useCallback(() => {
    setPosterFading(true);
  }, []);

  const handlePosterTransitionEnd = useCallback(() => {
    setPosterMounted(false);
  }, []);

  const { query, setQuery, groups, flatResults, clear } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateTo(result: SearchResult) {
    setIsOpen(false);
    clear();
    if (result.external) {
      window.open(result.href, "_blank", "noopener");
    } else {
      handleNavigate(result.href);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[activeIndex]) {
        navigateTo(flatResults[activeIndex]);
      }
    }
  }

  // Build the grouped dropdown
  let globalIdx = 0;
  const hasResults = query.trim().length > 0 && flatResults.length > 0;
  const noResults = query.trim().length > 1 && flatResults.length === 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      <Suspense fallback={null}>
        <FractalCityScene onNavigate={handleNavigate} onReady={handleSceneReady} />
      </Suspense>
      {posterMounted && (
        <HeroPoster fading={posterFading} onTransitionEnd={handlePosterTransitionEnd} />
      )}

      {/* Search bar */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-sm"
        ref={containerRef}
      >
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Explore Fractal..."
              className="w-full font-mono text-sm tracking-widest uppercase text-foreground/60 border border-foreground/20 rounded-md bg-[#faf8f5]/90 backdrop-blur-sm placeholder:text-foreground/40 outline-none transition-all duration-200 focus:border-foreground/40 focus:text-foreground/80 h-[30px] pl-8 pr-3"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (hasResults || noResults) && (
            <div
              className="absolute bottom-full left-0 mb-1 w-full bg-[#faf8f5]/95 backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto"
              role="listbox"
            >
              {noResults && (
                <div className="px-3 py-3 text-sm text-foreground/40 font-mono tracking-wider uppercase text-center">
                  No results
                </div>
              )}

              {groups.map((group) => {
                const items = group.results.map((result) => {
                  const idx = globalIdx++;
                  const Icon = TYPE_ICONS[result.type] ?? Search;
                  return (
                    <li
                      key={`${result.type}-${result.href}-${result.title}`}
                      role="option"
                      aria-selected={idx === activeIndex}
                      className={`flex items-start gap-2.5 cursor-pointer px-3 py-2 transition-colors ${
                        idx === activeIndex
                          ? "bg-foreground/10 text-foreground"
                          : "text-foreground/60 hover:bg-foreground/5"
                      }`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigateTo(result);
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm tracking-wider uppercase truncate flex items-center gap-1">
                          {result.title}
                          {result.external && (
                            <ArrowUpRight className="h-3 w-3 opacity-40 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-foreground/40 truncate mt-0.5">
                          {result.subtitle}
                        </div>
                      </div>
                    </li>
                  );
                });

                return (
                  <div key={group.type}>
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono tracking-[0.2em] uppercase text-foreground/30">
                      {group.label}
                    </div>
                    <ul>{items}</ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Skyline background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <img
          src={`${import.meta.env.BASE_URL}images/skyline4.png`}
          alt="NYC skyline illustration"
          className="w-full h-full object-cover object-bottom"
          style={{
            opacity: 0.15,
            transform: "translate(2.75%, -8%) scale(1.35)",
          }}
        />
      </div>

    </section>
  );
}
