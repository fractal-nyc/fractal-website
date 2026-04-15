/**
 * FractalPattern — Subtle geometric fractal background wallpaper.
 *
 * Renders an SVG pattern overlay using a Sierpinski-triangle-inspired
 * tessellation. The pattern tiles seamlessly and uses the page's accent
 * color at very low opacity so it decorates without competing with content.
 *
 * Usage:
 *   <FractalPattern color="#C13B2A" />
 *
 * Place it as the first child inside <main> so it sits behind all content.
 */

interface FractalPatternProps {
  /** Accent color for the pattern strokes / fills (hex). */
  color: string;
  /** Overall opacity of the pattern layer (default 0.045). */
  opacity?: number;
}

export function FractalPattern({
  color,
  opacity = 0.15,
}: FractalPatternProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* ---- Small-scale triangular tessellation ---- */}
          <pattern
            id="fractal-tri-sm"
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            {/* Upward triangle */}
            <polygon
              points="30,2 58,50 2,50"
              fill="none"
              stroke={color}
              strokeWidth="0.75"
            />
            {/* Inner upward triangle (Sierpinski subdivision) */}
            <polygon
              points="30,18 44,42 16,42"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            {/* Tiny center triangle */}
            <polygon
              points="30,28 36,38 24,38"
              fill={color}
              fillOpacity="0.12"
              stroke="none"
            />
          </pattern>

          {/* ---- Medium diamond / rotated-square grid ---- */}
          <pattern
            id="fractal-diamond"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Reference the small triangles as a fill */}
            <rect
              width="120"
              height="120"
              fill="url(#fractal-tri-sm)"
            />
            {/* Overlapping rotated square */}
            <rect
              x="20"
              y="20"
              width="80"
              height="80"
              fill="none"
              stroke={color}
              strokeWidth="0.4"
              transform="rotate(45 60 60)"
            />
          </pattern>

          {/* ---- Large-scale circle / mandelbrot hint ---- */}
          <pattern
            id="fractal-lg"
            x="0"
            y="0"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <rect
              width="240"
              height="240"
              fill="url(#fractal-diamond)"
            />
            {/* Subtle large circle to break up repetition */}
            <circle
              cx="120"
              cy="120"
              r="90"
              fill="none"
              stroke={color}
              strokeWidth="0.35"
            />
            <circle
              cx="120"
              cy="120"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="0.25"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#fractal-lg)" />
      </svg>
    </div>
  );
}
