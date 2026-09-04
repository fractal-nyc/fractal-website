import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Search, X } from "lucide-react";

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  value: string;
  label: string;
  onClear?: () => void;
  endAdornment?: ReactNode;
  showDecorativeCaret?: boolean;
  containerClassName?: string;
}

/** Shared visual shell for site-search comboboxes and collection searchboxes. */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar({
  value,
  label,
  onClear,
  endAdornment,
  showDecorativeCaret = true,
  containerClassName = "",
  className = "",
  onFocus,
  onBlur,
  ...inputProps
}, forwardedRef) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caretLeft, setCaretLeft] = useState(40);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  useLayoutEffect(() => {
    const mirrorWidth = mirrorRef.current?.offsetWidth ?? 0;
    const fieldWidth = containerRef.current?.offsetWidth ?? 0;
    const reservedEnd = value && onClear ? 52 : endAdornment ? 44 : 20;
    setCaretLeft(Math.max(40, Math.min(40 + mirrorWidth, fieldWidth - reservedEnd - 9)));
  }, [endAdornment, onClear, value]);

  return <div ref={containerRef} className={`relative min-w-0 w-full ${containerClassName}`} data-search-bar>
    <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-foreground-muted" strokeWidth={1.5} />
    <input
      {...inputProps}
      ref={inputRef}
      type="text"
      name={inputProps.name ?? "search"}
      autoComplete={inputProps.autoComplete ?? "off"}
      value={value}
      aria-label={label}
      onFocus={(event) => { setIsFocused(true); onFocus?.(event); }}
      onBlur={(event) => { setIsFocused(false); onBlur?.(event); }}
      style={{ ...inputProps.style, caretColor: showDecorativeCaret ? "transparent" : undefined }}
      className={`text-input h-11 w-full rounded-lg border border-foreground-faint bg-background pl-10 pr-12 text-foreground placeholder:text-foreground-muted transition-colors duration-200 focus-visible:border-[var(--component-focus,var(--color-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--component-focus,var(--color-foreground))]/30 ${className}`}
    />
    <span ref={mirrorRef} aria-hidden="true" className="text-input pointer-events-none invisible absolute left-0 top-0 block overflow-hidden whitespace-pre" style={{ maxWidth: "calc(100% - 5rem)" }}>{value}</span>
    {showDecorativeCaret && isFocused && <span aria-hidden="true" className="animate-blink pointer-events-none absolute top-1/2 inline-block h-[18px] w-[9px] -translate-y-1/2 bg-foreground/70" style={{ left: caretLeft }} data-search-caret />}
    {value && onClear ? <button
      type="button"
      onClick={() => { onClear(); requestAnimationFrame(() => inputRef.current?.focus()); }}
      aria-label="Clear search"
      className="group absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-lg text-foreground-muted transition-colors duration-150 hover:bg-foreground/10 hover:text-foreground active:bg-foreground/15 focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--component-focus,var(--color-foreground))]"
    ><X aria-hidden="true" className="h-4 w-4 transition-transform duration-150 motion-safe:group-hover:scale-110 motion-safe:group-focus-visible:scale-110 motion-safe:group-active:scale-95 motion-reduce:transform-none motion-reduce:transition-none" strokeWidth={1.5} /></button> : endAdornment ? <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">{endAdornment}</span> : null}
  </div>;
});
