import { useState, useEffect } from "react";

/**
 * Subscribes to the `prefers-reduced-motion: reduce` media query.
 *
 * Returns `true` when the user has opted out of non-essential motion at the
 * OS level. Hook is SSR-safe: when `window`/`matchMedia` are unavailable it
 * returns `false` and skips the effect.
 *
 * Re-renders when the user toggles the OS setting at runtime.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}
