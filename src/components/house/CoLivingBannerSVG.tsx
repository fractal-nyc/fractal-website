import { PaintedRelicBanner } from "./PaintedRelicBanner";

interface CoLivingBannerSVGProps {
  className?: string;
}

export function CoLivingBannerSVG({ className = "" }: CoLivingBannerSVGProps) {
  return (
    <PaintedRelicBanner
      src="/images/banners/co-living-banner.svg"
      foundationColor="var(--color-house-co-living-deep)"
      house="co-living"
      className={className}
    />
  );
}
