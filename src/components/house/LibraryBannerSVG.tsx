import { PaintedRelicBanner } from "./PaintedRelicBanner";

interface LibraryBannerSVGProps {
  className?: string;
}

export function LibraryBannerSVG({ className = "" }: LibraryBannerSVGProps) {
  return (
    <PaintedRelicBanner
      src="/images/banners/library-banner.svg"
      foundationColor="var(--color-house-library-deep)"
      house="library"
      className={className}
    />
  );
}
