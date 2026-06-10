interface CampusBannerSVGProps {
  className?: string;
}

/**
 * Campus pennant — full art baked into a single SVG (V-notch, dark-green house
 * fill, elliptical Mandelbrot pocket cut from the fill, arc "CAMPUS" tagline,
 * and the centered Gothic "C" monogram). Loaded as `<img>` so the embedded
 * Jacquard 24 base64 font renders without depending on page CSS.
 *
 * On hover the pennant waves like a flag in wind (CSS keyframe rotate+skew,
 * anchored at the top edge) and the drop-shadow lifts. Drop-shadow uses
 * `filter:` so it follows the SVG's V-notch (FRAC-140 pattern).
 */
export function CampusBannerSVG({ className = "" }: CampusBannerSVGProps) {
  return (
    <img
      src="/images/banners/campus-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`campus-banner-wave block h-full w-full select-none cursor-pointer ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          "drop-shadow(0 16px 32px rgba(0, 0, 0, 0.34))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter =
          "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))";
      }}
    />
  );
}
