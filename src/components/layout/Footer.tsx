/**
 * The visible site footer — the black CTA band ("If you're in NYC…", Discord,
 * Ian) and the "Fractal Collective" wordmark band beneath it — was removed at
 * the operator's request; pages now end at their own content.
 *
 * This empty, zero-height `<footer>` is intentionally retained ONLY as the
 * `data-site-footer` anchor that `useBannerAboveFooter` measures against to keep
 * the flanking pennant banners from overrunning the end of the page. Without a
 * marker the hook has nothing to clamp to. Do not add visible chrome here.
 */
export function Footer() {
  return <footer data-site-footer aria-hidden="true" />;
}
