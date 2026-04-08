import * as React from "react";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { cn } from "@/lib/utils";

type CornerSize = "xs" | "sm" | "md" | "lg";

interface MandelbrotCornersProps {
  children: React.ReactNode;
  /** Size preset for the corner icons */
  size?: CornerSize;
  /** Opacity of corner decorations (0-1) */
  opacity?: number;
  /** Additional className for the wrapper */
  className?: string;
  /** Whether to render as a different element */
  as?: React.ElementType;
}

const sizeMap: Record<CornerSize, { icon: number; inset: string }> = {
  xs: { icon: 8, inset: "-1px" },
  sm: { icon: 12, inset: "-2px" },
  md: { icon: 18, inset: "-4px" },
  lg: { icon: 24, inset: "-6px" },
};

/**
 * Rotation per corner so the "top" of each Mandelbrot faces the container center:
 *   top-left:     135° (faces bottom-right)
 *   top-right:    225° (faces bottom-left)
 *   bottom-right: 315° (faces top-left)
 *   bottom-left:   45° (faces top-right)
 */
const corners = [
  { position: "top-0 left-0", rotate: "rotate-[135deg]" },
  { position: "top-0 right-0", rotate: "rotate-[225deg]" },
  { position: "bottom-0 right-0", rotate: "rotate-[315deg]" },
  { position: "bottom-0 left-0", rotate: "rotate-[45deg]" },
] as const;

/**
 * Wraps any container with small Mandelbrot decorations in each corner,
 * rotated at 45-degree increments so the top of each icon faces inward.
 *
 * Usage:
 *   <MandelbrotCorners size="md">
 *     <Card>...</Card>
 *   </MandelbrotCorners>
 *
 * Or applied directly:
 *   <MandelbrotCorners as="section" size="lg" className="py-24 bg-muted">
 *     ...content...
 *   </MandelbrotCorners>
 */
export function MandelbrotCorners({
  children,
  size = "sm",
  opacity = 0.15,
  className,
  as: Comp = "div",
}: MandelbrotCornersProps) {
  const { icon, inset } = sizeMap[size];

  return (
    <Comp className={cn("relative", className)}>
      {children}
      {corners.map((corner, i) => (
        <span
          key={i}
          className={cn(
            "absolute pointer-events-none z-10",
            corner.position,
            corner.rotate
          )}
          style={{
            marginTop: corner.position.includes("top") ? inset : undefined,
            marginBottom: corner.position.includes("bottom") ? inset : undefined,
            marginLeft: corner.position.includes("left") ? inset : undefined,
            marginRight: corner.position.includes("right") ? inset : undefined,
          }}
          aria-hidden="true"
        >
          <MandelbrotIcon size={icon} opacity={opacity} />
        </span>
      ))}
    </Comp>
  );
}
