interface EventsBannerSVGProps {
  className?: string;
}

export function EventsBannerSVG({ className = "" }: EventsBannerSVGProps) {
  return (
    <img
      src="/images/banners/events-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block h-full w-full select-none ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
    />
  );
}
