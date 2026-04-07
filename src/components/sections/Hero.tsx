import { Suspense, lazy, useCallback, useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

const SEARCH_PAGES = [
  { name: "Story", href: "/story" },
  { name: "Campus", href: "/campus" },
  { name: "Neighborhood", href: "/neighborhood" },
  { name: "Events", href: "/events" },
  { name: "New Liberal Arts", href: "/new-liberal-arts" },
  { name: "Political Club", href: "/political-club" },
  { name: "Lab", href: "/lab" },
  { name: "People", href: "/people" },
  { name: "The Protocol", href: "/the-protocol" },
];

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (route: string) => setLocation(route),
    [setLocation]
  );

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query
    ? SEARCH_PAGES.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_PAGES;

  // Reset active index when filtered results change
  useEffect(() => {
    setActiveIndex(0);
  }, [filtered.length]);

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

  function navigateTo(href: string) {
    setIsOpen(false);
    setQuery("");
    handleNavigate(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) {
        navigateTo(filtered[activeIndex].href);
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      <Suspense fallback={null}>
        <FractalCityScene onNavigate={handleNavigate} />
      </Suspense>

      {/* Search bar */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
        ref={containerRef}
      >
        <div className="relative">
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
            className="font-mono text-sm tracking-widest uppercase text-foreground/60 border border-foreground/20 rounded-md bg-transparent placeholder:text-foreground/40 outline-none transition-all duration-200 focus:border-foreground/40 focus:text-foreground/80"
            style={{
              width: isOpen ? "320px" : "280px",
              height: "30px",
              padding: "2px 8px",
            }}
          />

          {/* Dropdown */}
          {isOpen && filtered.length > 0 && (
            <ul
              className="absolute bottom-full left-0 mb-1 w-full bg-[#faf8f5] border border-foreground/20 rounded-md overflow-hidden shadow-sm"
              role="listbox"
            >
              {filtered.map((page, i) => (
                <li
                  key={page.href}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`font-mono text-sm tracking-widest uppercase cursor-pointer px-3 py-2 transition-colors ${
                    i === activeIndex
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/60 hover:bg-foreground/5"
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigateTo(page.href);
                  }}
                >
                  {page.name}
                </li>
              ))}
            </ul>
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
