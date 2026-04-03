import { Search, X } from "lucide-react";
import { useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// ArchiveSearch — full-width search input for the Lab archive
// ---------------------------------------------------------------------------

interface ArchiveSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ArchiveSearch({ value, onChange }: ArchiveSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <Search
        size={18}
        strokeWidth={1.5}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />

      {/* Input — h-11 (44px) for touch target, text-base to prevent iOS zoom */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search titles, authors, topics..."
        aria-label="Search the archive"
        className="
          w-full h-11 pl-10 pr-10
          text-base font-light
          bg-background border border-border rounded-lg
          text-foreground placeholder:text-muted-foreground
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[#6B4C9A]/40 focus:border-[#6B4C9A]/60
        "
      />

      {/* Clear button — only visible when there's a query */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-1 rounded-md
            text-muted-foreground hover:text-foreground
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#6B4C9A]/40
          "
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
