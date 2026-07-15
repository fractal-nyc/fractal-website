import { useState, useEffect } from "react";

// "Can't hover to reveal" breakpoint. Two OR'd conditions (comma = logical OR
// in a media query): any viewport below Tailwind's `lg` (1024px), OR any device
// that cannot hover (touch). This is what gates the always-on Octant labels:
// they must show wherever the user can't hover a node to reveal its label.
// The old `(max-width: 767px)` cutoff was the bug — iPad Mini (768) / Air (820)
// are touch tablets above 767, so labels waited for a hover that never fires.
const MOBILE_QUERY = "(max-width: 1023px), (hover: none)";

/**
 * Subscribes to `(max-width: 1023px), (hover: none)`.
 *
 * Returns `true` on compact viewports (below `lg`) OR any non-hover (touch)
 * device — i.e. anywhere the user can't hover to reveal a control. Used to
 * force the Octant's always-on labels on phones AND tablets. `false` only on
 * hover-capable viewports at/above `lg` (mouse desktop). SSR-safe: returns
 * `false` when `window`/`matchMedia` are unavailable. Re-renders when the match
 * changes (resize, rotation, pointer-type change).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return isMobile;
}
