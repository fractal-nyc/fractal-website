import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";

// ═══════════════════════════════════════════════════════════════════════════
// Minimal Button — replaces the broken shadcn/Replit Button (FRAC-27).
//
// The old src/components/ui/button.tsx depended on undefined Replit-injected
// utilities (hover-elevate, active-elevate-2,
// [border-color:var(--button-outline)], border-primary-border,
// border-secondary-border, border-destructive-border). None of those classes
// existed in src/index.css, and no product page actually imported the Button —
// real CTAs were raw <a> elements with hand-rolled classes and no
// focus-visible state.
//
// This rewrite matches the shipped product reality:
//   - Uppercase JetBrains Mono (site default body type)
//   - Bordered, translucent surface (preserves the existing CTA look on
//     EventsPage / NeighborhoodPage / PoliticalClubPage / PeoplePage / Campus
//     / LiberalArts — see FRAC-86 regression test for the inline-block +
//     max-w-xs pattern)
//   - Real focus-visible ring (was missing sitewide)
//   - Mandelbrot corner motifs on the default variant (preserved from the
//     prior implementation's house aesthetic — old button.tsx:70-73)
//
// Export shape is preserved: `{ Button, buttonVariants }`. The vendored
// shadcn ui/* files (alert-dialog, pagination, calendar, sidebar, carousel,
// input-group) continue to import without changes.
// ═══════════════════════════════════════════════════════════════════════════

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
    "font-mono uppercase tracking-widest transition-colors duration-300 overflow-hidden " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default (FRAC-52): frosted-glass surface ported from Renoverse's
        // .btn--frosted recipe. The border + corner Mandelbrots take the
        // house accent via `--accent` (set on each house page's <main>);
        // unset pages fall back to `currentColor`. Text inherits the page's
        // body color via text-current. Cream tint (rgba(242,234,216,...)) is
        // neutral against every house background and reads as a subtle
        // translucent fill on dark surfaces, and as a border-only chrome on
        // cream surfaces — both intentional.
        default:
          "border bg-[var(--accent,currentColor)] " +
          "[backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] " +
          "[isolation:isolate] [transform:translateZ(0)] " +
          "[border-color:var(--accent,currentColor)] " +
          "text-white " +
          "shadow-[0_8px_24px_-12px_rgba(11,26,43,0.18)] " +
          "hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))] " +
          "hover:text-[var(--btn-text,var(--accent,currentColor))]",
        // Outline: same border, no corners. For secondary or compact uses.
        outline:
          "border border-current bg-transparent text-foreground hover:bg-foreground/5",
        // Ghost: no chrome. Hover underline for affordance.
        ghost:
          "border border-transparent bg-transparent text-foreground hover:underline underline-offset-4",
        // Link: inline text-action style. Strips padding so it sits in prose.
        link:
          "border-0 bg-transparent text-foreground underline underline-offset-4 hover:text-foreground/80",
      },
      size: {
        default: "px-8 py-5 text-sm font-medium",
      },
    },
    compoundVariants: [
      // Link variant should have no padding.
      { variant: "link", class: "px-0 py-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Mandelbrot corner placement, matching the prior button.tsx:70-73 rotations
// so the "top" of each icon faces the container center.
const cornerStyle = (
  top: boolean,
  left: boolean,
  rot: string
): React.CSSProperties => ({
  position: "absolute",
  [top ? "top" : "bottom"]: 4,
  [left ? "left" : "right"]: 4,
  transform: `rotate(${rot})`,
  pointerEvents: "none",
});

// Corners render on the default variant only. Outline / ghost / link skip them.
const variantsWithCorners = new Set(["default"]);

// FRAC-52: Paper-grain overlay ported from Renoverse's .fx-grain--warm
// (shared/effects.css). Tiled 320×320 SVG fractal-noise; the baseFrequency /
// numOctaves / seed values are part of Renoverse's brand fingerprint — don't
// drift them. Rendered as a sibling of the corner Mandelbrots inside the
// frosted default variant.
const PAPER_GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.96 0 0 0 0 0.93 0 0 0 0 0.85 0 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23n)'/%3E%3C/svg%3E\")";

const grainStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: PAPER_GRAIN_BG,
  backgroundSize: "320px 320px",
  mixBlendMode: "overlay",
  opacity: 0.35,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const showCorners = variantsWithCorners.has(variant ?? "default");

    // When asChild + corners, Radix Slot requires exactly one child. Wrap the
    // user's child + corners in a fragment so the consumer's element gets the
    // className/ref while still rendering the corners. The corners must be
    // siblings of the original child *inside* the slotted element — which
    // Radix Slot achieves by cloning children into the asChild element.
    //
    // FRAC-52: corner spans inherit the button's current text color (which is
    // accent at rest, white on hover). MandelbrotIcon's SVGs use
    // fill="currentColor", so spans + icons just cascade naturally — no
    // per-span color override needed.
    const corners = showCorners ? (
      <>
        <span style={grainStyle} aria-hidden />
        <span
          style={cornerStyle(true, true, "135deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.8} />
        </span>
        <span
          style={cornerStyle(true, false, "225deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.8} />
        </span>
        <span
          style={cornerStyle(false, false, "315deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.8} />
        </span>
        <span
          style={cornerStyle(false, true, "45deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.8} />
        </span>
      </>
    ) : null;

    if (asChild) {
      // Slot expects exactly one React element; merge corners as additional
      // children of that element by wrapping the children in a fragment is
      // not enough (Slot would still see two children). Instead we pass the
      // child through and inject corners by cloning. The simplest reliable
      // approach is to require the consumer to pass a single element child;
      // we add corners as siblings inside that element via React.cloneElement.
      const child = React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      const merged = React.cloneElement(
        child,
        undefined,
        <>
          {child.props.children}
          {corners}
        </>
      );
      return (
        <Comp
          // ref type is polymorphic when asChild=true (Slot forwards to
          // whatever element the consumer passed). The ButtonProps shape is
          // ButtonHTMLAttributes for the non-asChild case; the ref cast is
          // safe here because Slot will forward to the consumer's element.
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref as unknown as React.Ref<HTMLButtonElement>}
          {...props}
        >
          {merged}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {corners}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
