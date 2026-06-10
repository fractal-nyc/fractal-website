interface CampusBannerSVGProps {
  className?: string;
}

/**
 * Campus pennant — full art baked into a single SVG (V-notch, dark-green house
 * fill, elliptical Mandelbrot pocket cut from the fill, arc "CAMPUS" tagline,
 * and the centered Gothic "C" monogram). Loaded as `<img>` so the embedded
 * Jacquard 24 base64 font renders without depending on page CSS.
 *
 * Hover lifts the shadow and scales the pennant slightly. Drop-shadow uses
 * `filter:` so it follows the SVG's V-notch (FRAC-140 pattern).
 */
export function CampusBannerSVG({ className = "" }: CampusBannerSVGProps) {
  return (
    <img
      src="/images/banners/campus-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block h-full w-full select-none cursor-pointer transition-[filter,transform] duration-300 ease-out hover:scale-[1.03] ${className}`}
      style={{
        filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))",
        willChange: "filter, transform",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter =
          "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.32))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter =
          "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))";
      }}
    />
  );
}
