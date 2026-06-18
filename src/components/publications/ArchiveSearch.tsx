import { Search, X } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// ArchiveSearch — full-width search input for the Lab archive
// ---------------------------------------------------------------------------

interface ArchiveSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ArchiveSearch({ value, onChange }: ArchiveSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // FRAC-43: thick blinking cursor overlay state. isFocused gates render
  // so the decorative caret only shows while typing; caretLeft is the
  // measured text-width offset from the hidden mirror span.
  const [isFocused, setIsFocused] = useState(false);
  const [caretLeft, setCaretLeft] = useState(0);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxCaretLeft, setMaxCaretLeft] = useState<number | null>(null);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  // FRAC-43: measure rendered text width same-frame so the caret sits flush
  // at end-of-text. Also clamp the caret so it never collides with the
  // clear-X button (right pr-10 = 40px) when query is non-empty.
  useLayoutEffect(() => {
    if (!mirrorRef.current) return;
    setCaretLeft(mirrorRef.current.offsetWidth);
    if (containerRef.current) {
      const inputWidth = containerRef.current.offsetWidth;
      // 40px right padding (clear-X area) + 9px caret width — clamp left so
      // the overlay never overlaps the button.
      setMaxCaretLeft(inputWidth - 40 - 9);
    }
  }, [value, isFocused]);

  // Final left offset: 40 (pl-10) + measured width, clamped against the
  // clear-X area when a clamp value is available.
  const overlayLeft =
    maxCaretLeft != null
      ? Math.min(40 + caretLeft, maxCaretLeft)
      : 40 + caretLeft;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search icon */}
      <Search
        size={18}
        strokeWidth={1.5}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
        aria-hidden="true"
      />

      {/* Input — h-11 (44px) for touch target, text-base to prevent iOS zoom */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="SEARCH TITLES, AUTHORS, TOPICS..."
        aria-label="Search the archive"
        // FRAC-43: native caret suppressed — overlay span below renders
        // the thick blinking cursor restored from commit 1ba8aa2.
        style={{ caretColor: "transparent" }}
        className="
          w-full h-11 pl-10 pr-10
          text-input
          bg-background border border-foreground-faint rounded-lg
          text-foreground placeholder:text-foreground-muted
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-house-publications-deep/40 focus:border-house-publications-deep/60
        "
      />

      {/* FRAC-43: hidden mirror — its offsetWidth drives the caret's left
          offset. Same .text-input typography class as the input so width
          measurement matches actual rendered width. */}
      <span
        ref={mirrorRef}
        aria-hidden="true"
        className="text-input"
        style={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre",
          pointerEvents: "none",
          top: 0,
          left: 0,
        }}
      >
        {value || "SEARCH TITLES, AUTHORS, TOPICS..."}
      </span>

      {/* FRAC-43: thick blinking cursor overlay. 9px × 18px charcoal block
          at end-of-text, restored from commit 1ba8aa2. Reuses the
          surviving .animate-blink utility (with FRAC-28 reduced-motion
          guard). Decorative — aria-hidden + pointer-events-none. */}
      <span
        aria-hidden="true"
        className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none"
        style={{
          left: overlayLeft,
          top: "50%",
          transform: "translateY(-50%)",
        }}
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
            text-foreground-muted hover:text-foreground
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-house-publications-deep/40
          "
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
