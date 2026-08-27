import { PaintedRelicBanner } from "./PaintedRelicBanner";

interface EducationBannerSVGProps {
  className?: string;
}

export function EducationBannerSVG({ className = "" }: EducationBannerSVGProps) {
  return (
    <PaintedRelicBanner
      src="/images/banners/education-banner.svg"
      foundationColor="var(--color-house-education-light)"
      house="education"
      className={className}
    />
  );
}
