interface PoliticalClubBannerSVGProps {
  className?: string;
}

/**
 * Prepared artwork for the future Political Club house slot. This decorative
 * wrapper intentionally remains unmounted until that house is surfaced.
 */
export function PoliticalClubBannerSVG({
  className = "",
}: PoliticalClubBannerSVGProps) {
  return (
    <img
      src="/images/banners/political-club-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none block h-full w-full select-none ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
    />
  );
}
