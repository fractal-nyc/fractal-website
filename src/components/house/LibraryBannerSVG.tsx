interface LibraryBannerSVGProps {
  className?: string;
}

export function LibraryBannerSVG({ className = "" }: LibraryBannerSVGProps) {
  return (
    <img
      src="/images/banners/library-banner.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`block h-full w-full select-none ${className}`}
      style={{ filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))" }}
    />
  );
}
