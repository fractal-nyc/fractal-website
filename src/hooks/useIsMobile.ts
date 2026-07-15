import { useState, useEffect } from "react";

// Phone breakpoint: below Tailwind's `md` (768px). At/above this we treat the
// viewport as tablet or desktop. Kept as a query string so the initializer and
// the effect subscription stay in sync.
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Subscribes to the phone-width media query (`max-width: 767px`).
 *
 * Returns `true` on phone-sized viewports (below `md`), `false` on tablet and
 * desktop. SSR-safe: when `window`/`matchMedia` are unavailable it returns
 * `false` and skips the effect. Re-renders when the viewport crosses the
 * breakpoint (e.g. device rotation, window resize).
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
