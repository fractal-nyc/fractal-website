import { PaintedRelicBanner } from "./PaintedRelicBanner";

interface EventsBannerSVGProps {
  className?: string;
}

export function EventsBannerSVG({ className = "" }: EventsBannerSVGProps) {
  return (
    <PaintedRelicBanner
      src="/images/banners/events-banner.svg"
      foundationColor="var(--color-house-events-deep)"
      house="events"
      className={className}
    />
  );
}
