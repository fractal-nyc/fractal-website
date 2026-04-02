interface MandelbrotIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Inline SVG of a simplified Mandelbrot set silhouette.
 * The classic cardioid + main bulb shape, rendered as a filled path.
 */
export function MandelbrotIcon({
  size = 24,
  color = "currentColor",
  className = "",
}: MandelbrotIconProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M100,15 C60,15 25,40 15,80 C5,120 20,160 55,180 C70,188 85,190 100,185 C108,182 115,177 120,170 C128,158 132,142 130,126 C128,110 120,98 110,90 C100,82 88,78 78,82 C68,86 62,95 62,106 C62,117 70,126 80,128 C88,130 95,126 98,120 C101,114 100,107 95,104"
        fill={color}
        stroke="none"
      />
    </svg>
  );
}
