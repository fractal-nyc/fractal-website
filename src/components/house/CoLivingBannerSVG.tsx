interface CoLivingBannerSVGProps {
  className?: string;
}

export function CoLivingBannerSVG({ className = "" }: CoLivingBannerSVGProps) {
  return (
    <img
      src="/images/banners/co-living-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none block h-full w-full select-none ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
    />
  );
}
