interface CoLivingBannerSVGProps {
  className?: string;
}

/**
 * The Co-Living pennant. Renamed from `VisitBannerSVG` when the Visit house became
 * Fractal Co-Living. The Claude Design export still pointed this page at
 * `visit-banner.svg`, whose baked-in art reads "V" / "VISIT" — a stale label on a
 * page that is no longer called Visit. `coliving-banner.svg` is that same olive
 * pennant with the monogram redrawn as "H" and the arc reading CO-LIVING.
 */
export function CoLivingBannerSVG({ className = "" }: CoLivingBannerSVGProps) {
  return (
    <img
      src="/images/banners/coliving-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block h-full w-full select-none ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
    />
  );
}
