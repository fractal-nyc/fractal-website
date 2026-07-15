import { useEffect, useState } from "react";

/**
 * SSR-safe subscription to a CSS media query.
 *
 * Returns `true` while `query` matches. When `window`/`matchMedia` are
 * unavailable (SSR, older test envs) it returns `false` and skips the effect.
 * Re-renders when the match state changes (viewport resize, orientation, etc).
 *
 * Mirrors the shape of `usePrefersReducedMotion` so the two read the same way.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Sync in case the query changed between render and effect.
    setMatches(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [query]);

  return matches;
}
