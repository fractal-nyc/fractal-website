import { PaintedRelicBanner } from "./PaintedRelicBanner";

interface CampusBannerSVGProps {
  className?: string;
}

/**
 * Campus pennant — full art baked into a single SVG (V-notch, dark-green house
 * fill, elliptical Mandelbrot pocket cut from the fill, arc "CAMPUS" tagline,
 * and the centered Gothic "C" monogram). Loaded as `<img>` so the embedded
 * Jacquard 24 base64 font renders without depending on page CSS.
 *
 * Drop-shadow uses `filter:` so it follows the SVG's V-notch (FRAC-140 pattern).
 */
export function CampusBannerSVG({ className = "" }: CampusBannerSVGProps) {
  return (
    <PaintedRelicBanner
      src="/images/banners/campus-banner.svg"
      foundationColor="var(--color-house-campus-deep)"
      house="campus"
      className={className}
    />
  );
}
