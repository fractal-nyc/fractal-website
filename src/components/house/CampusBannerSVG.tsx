interface CampusBannerSVGProps {
  mirrored?: boolean;
  className?: string;
}

/**
 * Campus pennant — full art baked into a single SVG (V-notch, dark-green house
 * fill, elliptical Mandelbrot pocket cut from the fill, arc "CAMPUS" tagline,
 * and the centered Gothic "C" monogram). Loaded as `<img>` so the embedded
 * Jacquard 24 base64 font in the file renders without depending on page CSS.
 *
 * Drop-shadow + hover lift live on this wrapper so they follow the V-notch
 * (FRAC-140 pattern). `mirrored` flips horizontally for the right-side flanker.
 */
export function CampusBannerSVG({ mirrored = false, className = "" }: CampusBannerSVGProps) {
  return (
    <div
      className={`group h-full w-full ${className}`}
      style={{
        filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))",
        transform: mirrored ? "scaleX(-1)" : undefined,
        transition: "filter 300ms ease, transform 300ms ease",
        willChange: "filter, transform",
      }}
    >
      <img
        src="/images/banners/campus-banner.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block h-full w-full select-none transition-transform duration-300 ease-out group-hover:scale-[1.02]"
      />
    </div>
  );
}
