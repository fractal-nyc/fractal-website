import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
           // @replit: no hover, and add primary border
           "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          " border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          "border bg-secondary text-secondary-foreground border border-secondary-border ",
        // @replit no hover, transparent border
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // @replit changed sizes
        default: "min-h-12 px-5 py-3",
        sm: "min-h-10 rounded-md px-4 text-sm",
        lg: "min-h-14 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const cornerStyle = (top: boolean, left: boolean, rot: string): React.CSSProperties => ({
  position: "absolute",
  [top ? "top" : "bottom"]: 2,
  [left ? "left" : "right"]: 2,
  transform: `rotate(${rot})`,
  pointerEvents: "none",
})

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn("relative overflow-hidden", buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
        <span style={cornerStyle(true, true, "135deg")} className="[&_svg]:!size-auto" aria-hidden><MandelbrotIcon size={25} opacity={0.2} /></span>
        <span style={cornerStyle(true, false, "225deg")} className="[&_svg]:!size-auto" aria-hidden><MandelbrotIcon size={25} opacity={0.2} /></span>
        <span style={cornerStyle(false, false, "315deg")} className="[&_svg]:!size-auto" aria-hidden><MandelbrotIcon size={25} opacity={0.2} /></span>
        <span style={cornerStyle(false, true, "45deg")} className="[&_svg]:!size-auto" aria-hidden><MandelbrotIcon size={25} opacity={0.2} /></span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
