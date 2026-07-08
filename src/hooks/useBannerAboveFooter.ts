import { useEffect, type RefObject } from "react";

/**
 * Keeps a `position: fixed` decorative layer pinned to the viewport while the
 * user scrolls, but releases it before the page footer so it keeps a constant
 * gap above it: the moment the footer enters the bottom of the viewport the
 * layer starts moving up 1:1 with the footer, preserving exactly the breathing
 * room the layer had on landing (its fixed bottom to the viewport bottom) as
 * the gap between the layer's bottom and the footer. Used by the flanking
 * house-banner layer on the sector pages (Events, Education, Visit,
 * Publications, Campus).
 *
 * This is scroll-linked *layout* — the same contract as `position: sticky` —
 * not decorative motion: there is no transition and the offset tracks scroll
 * 1:1, so it is intentionally NOT gated behind `prefers-reduced-motion`
 * (disabling it would let the banners crowd the footer, which is worse).
 *
 * The per-scroll work is a single `getBoundingClientRect` on the footer. On
 * viewports where the layer is hidden (`display: none`, mobile) its measured
 * height is 0, so the clamp stays inert. SSR-safe: no-ops without `window`.
 *
 * The default selector targets the site footer's `data-site-footer` marker
 * rather than a bare `footer` tag — semantic `<footer>` elements can appear
 * inside page content (e.g. a `<blockquote><footer>` citation on CampusPage),
 * and a bare selector would match the first of those instead.
 */
export function useBannerAboveFooter(
  bannerRef: RefObject<HTMLElement | null>,
  footerSelector = "[data-site-footer]",
): void {
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || typeof window === "undefined") return;
    const footer = document.querySelector<HTMLElement>(footerSelector);
    if (!footer) return;

    // Whether the layer is actually rendered — it is `display: none` on mobile,
    // where the clamp must stay inert. Re-checked on resize.
    let visible = false;
    const measure = () => {
      banner.style.transform = "";
      visible = banner.getBoundingClientRect().height > 0;
    };
    const update = () => {
      if (!visible) {
        banner.style.transform = "";
        return;
      }
      // Once the footer's top rises above the viewport bottom, lift the layer
      // by however far the footer has entered the viewport. The layer's own
      // (fixed) bottom cancels out of the algebra, so the gap it holds above
      // the footer is always its landing gap (fixed bottom -> viewport bottom).
      const shift = Math.min(0, footer.getBoundingClientRect().top - window.innerHeight);
      banner.style.transform = shift < 0 ? `translate3d(0, ${shift}px, 0)` : "";
    };

    measure();
    update();
    const onResize = () => {
      measure();
      update();
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      banner.style.transform = "";
    };
  }, [bannerRef, footerSelector]);
}
