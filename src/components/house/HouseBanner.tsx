import type { House } from "@/data/houses";
import { MandelbrotIcon } from "./MandelbrotIcon";

// ---------------------------------------------------------------------------
// Luminance helper — determines whether text should be white or dark
// ---------------------------------------------------------------------------

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// ---------------------------------------------------------------------------
// HouseBanner
// ---------------------------------------------------------------------------

interface HouseBannerProps {
  house: House;
  variant?: "grid" | "full";
  className?: string;
}

/**
 * Pennant-shaped house banner with a CSS clip-path V-notch at the bottom.
 *
 * - `variant="grid"` (default): compact card for the 6-grid layout
 * - `variant="full"`: wider banner for individual house pages
 */
export function HouseBanner({
  house,
  variant = "grid",
  className = "",
}: HouseBannerProps) {
  const isGrid = variant === "grid";
  const textColor = isDark(house.color) ? "#ffffff" : "#1a1a1a";
  const iconColor = isDark(house.color)
    ? "rgba(255,255,255,0.25)"
    : "rgba(0,0,0,0.15)";

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center text-center
        ${isGrid ? "aspect-[3/5]" : "aspect-[3/4] max-w-2xl mx-auto"}
        ${className}
      `}
      style={{
        backgroundColor: house.color,
        clipPath:
          "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",
        color: textColor,
      }}
    >
      {/* Subtitle */}
      <span
        className={`
          font-sans uppercase tracking-widest
          ${isGrid ? "text-xs mb-3" : "text-sm mb-4"}
        `}
        style={{ opacity: 0.8 }}
      >
        {house.subtitle}
      </span>

      {/* Name */}
      <h3
        className={`
          font-serif leading-tight
          ${isGrid ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"}
        `}
      >
        {house.name}
      </h3>

      {/* Tagline */}
      <p
        className={`
          font-serif italic
          ${isGrid ? "text-base mt-2" : "text-lg mt-3"}
        `}
        style={{ opacity: 0.85 }}
      >
        {house.tagline}
      </p>

      {/* Mandelbrot icon — positioned at the V-notch point */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[12%]">
        <MandelbrotIcon
          size={isGrid ? 24 : 40}
          color={iconColor}
        />
      </div>
    </div>
  );
}
