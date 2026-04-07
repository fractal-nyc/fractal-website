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
// Fractal Elegant palette — paired bg + Jacquard 24 letter colors per house
// ---------------------------------------------------------------------------

const ELEGANT_PAIRS: Record<string, { bg: string; letter: string }> = {
  // Peach pair: light peach bg + deep coral letter
  events:       { bg: "#D4857A", letter: "#C13B2A" },
  // Red pair: bright red bg + cream letter for contrast
  school:       { bg: "#C41E20", letter: "#F5E6D8" },
  // Light green pair: olive bg + dark olive letter
  neighborhood: { bg: "#889460", letter: "#4A5A30" },
  // Dark green pair: forest bg + gold letter for contrast
  campus:       { bg: "#2B5A48", letter: "#D4BA58" },
  // Fuschia pair: pink bg + deep pink letter
  lab:          { bg: "#E870A0", letter: "#C44878" },
  // Burgundy pair: wine bg + brighter rose letter for contrast
  forum:        { bg: "#6E1830", letter: "#C83858" },
};

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
 *
 * The Mandelbrot icon sits outside the clip-path, centered at the V-notch
 * tip on the cream page background.
 */
export function HouseBanner({
  house,
  variant = "grid",
  className = "",
}: HouseBannerProps) {
  const isGrid = variant === "grid";
  const pair = ELEGANT_PAIRS[house.id];
  const bgColor = pair?.bg ?? house.color;
  const letterColor = pair?.letter ?? (isDark(house.color) ? "#ffffff" : "#1a1a1a");
  const textColor = isDark(bgColor) ? "#ffffff" : "#1a1a1a";

  return (
    <div className={`relative ${className}`}>
      {/* Clipped banner content */}
      <div
        className={`
          relative flex flex-col items-center justify-center text-center
          ${isGrid ? "aspect-[1/3]" : "aspect-[3/4] max-w-2xl mx-auto"}
        `}
        style={{
          backgroundColor: bgColor,
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",
          color: textColor,
        }}
      >
        {/* First-letter monogram badge */}
        <span
          className={`
            leading-none
            ${isGrid ? "text-6xl sm:text-7xl lg:text-8xl" : "text-[8rem] md:text-[10rem]"}
          `}
          style={{ fontFamily: "'Jacquard 24', system-ui", color: letterColor }}
          aria-hidden="true"
        >
          {(house.displayName ?? house.name).charAt(0)}
        </span>

        {/* Tagline */}
        <p
          className={`
            font-serif italic px-2
            ${isGrid ? "text-[10px] sm:text-xs mt-1" : "text-lg mt-3"}
          `}
          style={{ opacity: 0.85 }}
        >
          {house.tagline}
        </p>
      </div>

      {/* Mandelbrot icon — outside clip, centered at the V-notch tip */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "15%" }}
      >
        <MandelbrotIcon size={isGrid ? 24 : 36} opacity={0.2} />
      </div>
    </div>
  );
}
