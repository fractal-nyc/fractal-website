import * as React from "react"

import { cn } from "@/lib/utils"
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon"

/** Mandelbrot corner decorations for cards */
const cardCorners = [
  { position: "top-0 left-0", rotate: "rotate-[135deg]" },
  { position: "top-0 right-0", rotate: "rotate-[225deg]" },
  { position: "bottom-0 right-0", rotate: "rotate-[315deg]" },
  { position: "bottom-0 left-0", rotate: "rotate-[45deg]" },
] as const;

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow relative overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
    {cardCorners.map((corner, i) => (
      <span
        key={i}
        className={cn(
          "absolute pointer-events-none z-10",
          corner.position,
          corner.rotate
        )}
        style={{ margin: "-2px" }}
        aria-hidden="true"
      >
        <MandelbrotIcon size={12} opacity={0.12} />
      </span>
    ))}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
