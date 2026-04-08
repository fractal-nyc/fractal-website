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
  // Red pair: bright red bg + vivid red letter (bright for readability over image)
  school:       { bg: "#C41E20", letter: "#E63636" },
  // Light green pair: olive bg + dark olive letter
  neighborhood: { bg: "#889460", letter: "#4A5A30" },
  // Dark green pair: forest bg + darker forest letter
  campus:       { bg: "#2B5A48", letter: "#1A3A2E" },
  // Fuschia pair: pink bg + deep pink letter
  lab:          { bg: "#E870A0", letter: "#C44878" },
  // Burgundy pair: dusty rose bg + dark burgundy letter
  forum:        { bg: "#C89898", letter: "#6E1830" },
};

// ---------------------------------------------------------------------------
// Duochrome background images — only 4 of 6 houses have images
// ---------------------------------------------------------------------------

const BANNER_IMAGES: Record<string, string> = {
  lab:          "/images/banners/lab.jpeg",
  forum:        "/images/banners/political-club.jpeg",
  neighborhood: "/images/banners/neighborhood.jpeg",
  school:       "/images/banners/new-liberal-arts.png",
};

// ---------------------------------------------------------------------------
// Per-banner overlay opacity — lower = lighter overlay, more image shows through
// ---------------------------------------------------------------------------

const OVERLAY_OPACITY: Record<string, number> = {
  school: 0.30,   // Liberal Arts: lighter so red letters stay readable
};

const DEFAULT_OVERLAY_OPACITY = 0.45;

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
  const bannerImage = BANNER_IMAGES[house.id];

  return (
    <div className={`relative ${className}`}>
      {/* Clipped banner content */}
      <div
        className={`
          relative flex flex-col items-center justify-center text-center overflow-hidden
          ${isGrid ? "aspect-[1/3]" : "aspect-[3/4] max-w-2xl mx-auto"}
        `}
        style={{
          backgroundColor: bgColor,
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",
          color: textColor,
        }}
      >
        {/* Background image (only for houses that have one) */}
        {bannerImage && (
          <>
            <img
              src={bannerImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Semi-transparent overlay to keep text readable */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: bgColor, opacity: OVERLAY_OPACITY[house.id] ?? DEFAULT_OVERLAY_OPACITY }}
            />
          </>
        )}

        {/* First-letter monogram badge */}
        <span
          className={`
            relative z-10 leading-none
            ${isGrid ? "text-6xl sm:text-7xl lg:text-8xl" : "text-[8rem] md:text-[10rem]"}
          `}
          style={{ fontFamily: "'Jacquard 24', system-ui", color: letterColor }}
          aria-hidden="true"
        >
          {house.id === "school"
            ? "LA"
            : house.id === "forum"
              ? "PC"
              : (house.displayName ?? house.name).charAt(0)}
        </span>

        {/* Tagline */}
        <p
          className={`
            relative z-10 font-serif italic px-2 normal-case
            ${isGrid ? "text-[10px] sm:text-xs mt-1" : "text-lg mt-3"}
          `}
          style={{ opacity: 0.85 }}
        >
          {house.tagline}
        </p>
      </div>

      {/* Mandelbrot icon — outside clip, bottom-aligned with V-notch tip */}
      <div
        className="absolute left-1/2"
        style={{ bottom: "0%", transform: "translateX(-50%) translateY(50%)" }}
      >
        <MandelbrotIcon size={isGrid ? 24 : 36} color={letterColor} opacity={0.85} />
      </div>
    </div>
  );
}
