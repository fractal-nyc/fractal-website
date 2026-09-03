import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  CornerDownLeft,
  FileText,
  Hash,
  LayoutGrid,
  MapPin,
  Search,
  User,
} from "lucide-react";

import {
  useGlobalSearch,
  type SearchResult,
} from "@/hooks/use-global-search";
import { SearchBar } from "@/components/content/SearchBar";

// FRAC-13: single, static placeholder — cleared on focus so the empty,
// caret-ready field visibly invites typing. Thin-space-separated dots (instead
// of a single "…" glyph) give the trailing ellipsis a little breathing room
// before the caret without a full space between each.
const SEARCH_PLACEHOLDER = "Explore Fractal . . .";

const TYPE_ICONS: Record<string, typeof Search> = {
  page: LayoutGrid,
  person: User,
  document: FileText,
  house: MapPin,
  topic: Hash,
};

export interface HomeSearchBarProps {
  onSelectResult: (result: SearchResult) => void;
  enableGlobalShortcut?: boolean;
}

/** The production Home combobox, separated from Hero's viewport positioning. */
export function HomeSearchBar({
  onSelectResult,
  enableGlobalShortcut = false,
}: HomeSearchBarProps) {
  const { query, setQuery, groups, flatResults, clear } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  // FRAC-33: -1 = no option focused. ArrowDown moves toward the last index;
  // ArrowUp can move back to -1 (input regains focus visually). Pointer hover
  // also drives this so keyboard and mouse stay in sync.
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // FRAC-13: the placeholder shown — cleared on focus so the empty, caret-ready
  // field visibly invites typing.
  const placeholder = isFocused ? "" : SEARCH_PLACEHOLDER;

  // FRAC-13: "/" focuses the search from anywhere (a familiar search shortcut),
  // unless the user is already typing in a field or holding a modifier. Catalog
  // specimens disable this page-global behavior.
  useEffect(() => {
    if (!enableGlobalShortcut) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enableGlobalShortcut]);

  // FRAC-33: stable IDs for combobox/listbox/option ARIA wiring.
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  useEffect(() => {
    setFocusedIndex(-1);
  }, [flatResults.length, isOpen, query]);

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

  function selectResult(result: SearchResult) {
    setIsOpen(false);
    clear();
    onSelectResult(result);
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
      setFocusedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && flatResults[focusedIndex]) {
        selectResult(flatResults[focusedIndex]);
      }
    }
  }

  let globalIdx = 0;
  const hasResults = query.trim().length > 0 && flatResults.length > 0;
  const noResults = query.trim().length > 1 && flatResults.length === 0;

  return (
    <div className="relative" ref={containerRef} data-home-search-bar>
      <div className="relative">
        <SearchBar
          ref={inputRef}
          value={query}
          label="Search Fractal"
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
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && (hasResults || noResults)}
          aria-controls={listboxId}
          aria-activedescendant={
            focusedIndex >= 0 ? optionId(focusedIndex) : undefined
          }
          onClear={clear}
          endAdornment={hasResults ? <CornerDownLeft className="h-3 w-3" /> : !isFocused && !query ? <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-foreground/20 bg-foreground/5 px-1 font-mono text-[11px] leading-none">/</kbd> : null}
        />
      </div>

      {isOpen && (hasResults || noResults) && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute bottom-full left-0 mb-1 w-full bg-background/95 text-foreground backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto"
        >
          {noResults && (
            <div className="text-label text-foreground/60 text-center px-3 py-3">
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
                    selectResult(result);
                  }}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <div className="text-label truncate flex items-center gap-1">
                      {result.title}
                      {result.external && (
                        <ArrowUpRight aria-hidden="true" className="h-3 w-3 opacity-40 shrink-0" />
                      )}
                    </div>
                    <div className="text-label text-xs text-foreground/60 truncate mt-0.5">
                      {result.subtitle}
                    </div>
                  </div>
                </li>
              );
            });

            return (
              <div key={group.type} role="presentation">
                <div className="text-label text-[10px] text-foreground/40 px-3 pt-2 pb-1">
                  {group.label}
                </div>
                <ul role="presentation">{items}</ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
