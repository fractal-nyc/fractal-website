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
        // Default: bordered, translucent surface — the shipped CTA look.
        // Mandelbrot corners are rendered separately below.
        default:
          "border border-foreground/20 bg-foreground/[0.03] text-foreground hover:bg-foreground/10",
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
        default: "px-8 py-5 text-sm",
        sm: "px-4 py-2 text-xs",
        lg: "px-10 py-6 text-base",
        // `icon` is required by vendored shadcn components (calendar, carousel,
        // sidebar). Square button for a single glyph.
        icon: "h-9 w-9 p-0",
      },
    },
    compoundVariants: [
      // Link variant should have no padding regardless of size.
      { variant: "link", size: "default", class: "px-0 py-0" },
      { variant: "link", size: "sm", class: "px-0 py-0" },
      { variant: "link", size: "lg", class: "px-0 py-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
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
// Small size skips them too — they look crowded at xs padding.
const variantsWithCorners = new Set(["default"]);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const showCorners =
      variantsWithCorners.has(variant ?? "default") &&
      size !== "sm" &&
      size !== "icon";

    // When asChild + corners, Radix Slot requires exactly one child. Wrap the
    // user's child + corners in a fragment so the consumer's element gets the
    // className/ref while still rendering the corners. The corners must be
    // siblings of the original child *inside* the slotted element — which
    // Radix Slot achieves by cloning children into the asChild element.
    const corners = showCorners ? (
      <>
        <span
          style={cornerStyle(true, true, "135deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.2} />
        </span>
        <span
          style={cornerStyle(true, false, "225deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.2} />
        </span>
        <span
          style={cornerStyle(false, false, "315deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.2} />
        </span>
        <span
          style={cornerStyle(false, true, "45deg")}
          className="[&_svg]:!size-auto"
          aria-hidden
        >
          <MandelbrotIcon size={20} opacity={0.2} />
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
