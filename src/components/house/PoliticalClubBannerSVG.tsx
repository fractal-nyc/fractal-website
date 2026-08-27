import { PaintedRelicBanner } from "./PaintedRelicBanner";

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
    <PaintedRelicBanner
      src="/images/banners/political-club-banner.svg"
      foundationColor="var(--color-house-political-club-light)"
      house="political-club"
      className={className}
    />
  );
}
