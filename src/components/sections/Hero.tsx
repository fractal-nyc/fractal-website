import { Suspense, lazy, useCallback, useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { Search, User, FileText, MapPin, Hash, ArrowUpRight, LayoutGrid } from "lucide-react";
// FRAC-33: keyboard skip-nav fallback — the 3D nav nodes inside
// FractalCityScene are pointer-only, so we render a parallel
// sr-only-focusable list of the same routes here. Tabbing into the
// hero brings the list into view; Enter follows each route.
import { OUTER_NAV_NODES } from "@/components/three/OctahedronHero";

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

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (route: string) => setLocation(route),
    [setLocation]
  );

  const { query, setQuery, groups, flatResults, clear } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  // FRAC-33: -1 = no option focused. ArrowDown moves toward the last index;
  // ArrowUp can move back to -1 (input regains focus visually). Pointer
  // hover also drives this so keyboard and mouse stay in sync.
  const [focusedIndex, setFocusedIndex] = useState(-1);
  // FRAC-43: thick blinking cursor overlay state. isFocused gates render so
  // the decorative caret only shows while typing; caretLeft is the measured
  // text-width offset from the mirror span below.
  const [isFocused, setIsFocused] = useState(false);
  const [caretLeft, setCaretLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  // FRAC-43: measure rendered text width same-frame so the caret sits flush
  // at end-of-text. Keyed on [query, isFocused] — focus toggling matters
  // because the placeholder string is what's measured when query is empty.
  useLayoutEffect(() => {
    if (!mirrorRef.current) return;
    setCaretLeft(mirrorRef.current.offsetWidth);
  }, [query, isFocused]);

  // FRAC-33: stable IDs for combobox/listbox/option ARIA wiring.
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  // Reset focused index when results change or the dropdown closes.
  useEffect(() => {
    setFocusedIndex(-1);
  }, [flatResults.length, isOpen, query]);

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
      setFocusedIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen || flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      // FRAC-33: clamp at last index instead of wrapping. -1 -> 0 on first
      // press; further presses advance until the end of the list.
      setFocusedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // FRAC-33: clamp at -1 (no option focused) instead of wrapping.
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && flatResults[focusedIndex]) {
        navigateTo(flatResults[focusedIndex]);
      }
    }
  }

  // Build the grouped dropdown
  let globalIdx = 0;
  const hasResults = query.trim().length > 0 && flatResults.length > 0;
  const noResults = query.trim().length > 1 && flatResults.length === 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background text-foreground">
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
        <ul className="flex flex-col gap-1 bg-background text-foreground border border-foreground p-3 text-eyebrow">
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
              onFocus={() => {
                setIsOpen(true);
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Explore Fractal..."
              // FRAC-33: combobox semantics — input owns the listbox via
              // aria-controls and reports the currently focused option via
              // aria-activedescendant. aria-autocomplete=list because we
              // suggest matches but the input's text is the user's query.
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isOpen && (hasResults || noResults)}
              aria-controls={listboxId}
              aria-activedescendant={
                focusedIndex >= 0 ? optionId(focusedIndex) : undefined
              }
              aria-label="Search Fractal"
              // FRAC-43: native caret suppressed — overlay span below renders
              // the thick blinking cursor restored from commit 1ba8aa2.
              style={{ caretColor: "transparent" }}
              className="w-full text-label text-foreground/60 border border-foreground/20 rounded-md bg-background/90 backdrop-blur-sm placeholder:text-foreground/60 outline-none transition-all duration-200 focus:border-foreground/40 focus:text-foreground/80 h-[30px] pl-8 pr-3"
            />
            {/* FRAC-43: hidden mirror — its offsetWidth drives the caret's
                left offset. Same typography class as the input so width
                measurement matches actual rendered width. */}
            <span
              ref={mirrorRef}
              aria-hidden="true"
              className="text-label"
              style={{
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                pointerEvents: "none",
                top: 0,
                left: 0,
              }}
            >
              {query || "Explore Fractal..."}
            </span>
            {/* FRAC-43: thick blinking cursor overlay. 9px × 18px charcoal
                block at end-of-text, restored from commit 1ba8aa2. Reuses
                the surviving .animate-blink utility (with FRAC-28 reduced-
                motion guard) and is purely decorative. */}
            {isFocused && (
              <span
                aria-hidden="true"
                className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none"
                style={{
                  left: 32 + caretLeft,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>

          {/* Dropdown */}
          {isOpen && (hasResults || noResults) && (
            // FRAC-33: the outer container is the listbox the combobox
            // owns via aria-controls. Group headings are stamped with
            // role=presentation so AT focus stays on options only.
            <div
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              className="absolute bottom-full left-0 mb-1 w-full bg-background/95 text-foreground backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto"
            >
              {noResults && (
                <div className="text-meta text-foreground/60 text-center px-3 py-3">
                  No results
                </div>
              )}

              {groups.map((group) => {
                const items = group.results.map((result) => {
                  const idx = globalIdx++;
                  const Icon = TYPE_ICONS[result.type] ?? Search;
                  const isFocused = idx === focusedIndex;
                  return (
                    <li
                      key={`${result.type}-${result.href}-${result.title}`}
                      id={optionId(idx)}
                      role="option"
                      aria-selected={isFocused}
                      className={`flex items-start gap-2.5 cursor-pointer px-3 py-2 transition-colors ${
                        isFocused
                          ? "bg-foreground/10 text-foreground"
                          : "text-foreground/60 hover:bg-foreground/5"
                      }`}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigateTo(result);
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <div className="text-label truncate flex items-center gap-1">
                          {result.title}
                          {result.external && (
                            <ArrowUpRight className="h-3 w-3 opacity-40 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-foreground/60 truncate mt-0.5">
                          {result.subtitle}
                        </div>
                      </div>
                    </li>
                  );
                });

                return (
                  <div key={group.type} role="presentation">
                    {/* text-[10px] density override for compact search dropdown */}
                    <div className="text-eyebrow text-[10px] text-foreground/40 px-3 pt-2 pb-1">
                      {group.label}
                    </div>
                    <ul role="presentation">{items}</ul>
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
