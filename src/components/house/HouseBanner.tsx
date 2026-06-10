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
// Color pair derivation — FRAC-24 single source of truth
// ---------------------------------------------------------------------------
// Per-house bg + Jacquard 24 letter colors derive from each House's canonical
// `palette` pair (set in `src/data/houses.ts`). The banner grid uniformly uses
// `palette.light` as the bg and `palette.deep` as the monogram letter color.
// Per-page "inverted" treatments (forum, school) are page-level decisions and
// do not affect the banner grid.

// ---------------------------------------------------------------------------
// Duochrome background images — only 4 of 6 houses have images
// ---------------------------------------------------------------------------

const BANNER_IMAGES: Record<string, string> = {
  lab:          "/images/banners/lab.webp",
  forum:        "/images/banners/political-club.webp",
  neighborhood: "/images/banners/neighborhood.webp",
  school:       "/images/banners/new-liberal-arts.webp",
  campus:       "/images/banners/campus.webp",
  events:       "/images/banners/events.webp",
};

// ---------------------------------------------------------------------------
// Per-banner overlay opacity — lower = lighter overlay, more image shows through
// ---------------------------------------------------------------------------

const OVERLAY_OPACITY: Record<string, number> = {
  school: 0.30,   // Liberal Arts: lighter so red letters stay readable
};

const DEFAULT_OVERLAY_OPACITY = 0.45;

// ---------------------------------------------------------------------------
// Monogram letters per house — explicit map so displayName changes don't
// silently break the banner letter (FRAC-139).
// ---------------------------------------------------------------------------

const HOUSE_LETTERS: Record<string, string> = {
  neighborhood: "N",
  events: "E",
  campus: "C",
  school: "LA",
  forum: "PC",
  lab: "L",
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
  const bgColor = house.palette.light;
  const letterColor = house.palette.deep;
  const textColor = isDark(bgColor) ? "#ffffff" : "hsl(var(--foreground))";
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
          {HOUSE_LETTERS[house.id] ?? (house.displayName ?? house.name).charAt(0)}
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

      {/* Mandelbrot icon — sits at the visual bottom of the banner, nudged up to clear whitespace */}
      <div
        className="absolute left-1/2"
        style={{ bottom: "8px", transform: "translateX(-50%) translateY(50%)" }}
      >
        <MandelbrotIcon size={isGrid ? 24 : 36} color={letterColor} opacity={0.85} />
      </div>
    </div>
  );
}
