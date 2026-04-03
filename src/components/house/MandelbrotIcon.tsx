interface MandelbrotIconProps {
  size?: number;
  opacity?: number;
  className?: string;
}

/**
 * Mandelbrot set icon rendered from the actual PNG asset.
 * Displays at low opacity for a muted gray appearance on the cream background.
 */
export function MandelbrotIcon({
  size = 30,
  opacity = 0.18,
  className = "",
}: MandelbrotIconProps) {
  return (
    <img
      src={import.meta.env.BASE_URL + "images/mandelbrot.png"}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ opacity, objectFit: "contain" }}
    />
  );
}
