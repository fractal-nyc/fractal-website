import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// ═══════════════════════════════════════════════════════════════════════════
// Carousel — a small, hand-authored primitive over Embla (FRAC-4).
//
// Deliberately trimmed vs. the upstream shadcn/ui dump: we only ship what the
// Campus "Meet the Space" gallery needs — a peek layout, arrows, and dots —
// and theme it entirely with the page's design tokens (no raw hex, no CSS
// import; Embla is headless). Reduced motion is honored by collapsing the
// scroll `duration` to 0 so slides jump instantly instead of gliding.
//
// Structure required by Embla: an `overflow-hidden` viewport wrapping a flex
// track whose children are `min-w-0 shrink-0 grow-0` slots — omit any of these
// and the slides collapse.
// ═══════════════════════════════════════════════════════════════════════════

type EmblaApi = UseEmblaCarouselType[1];
type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: EmblaApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export function useCarousel(): CarouselContextValue {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel>");
  }
  return context;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: CarouselOptions;
  /** Optional label announced by screen readers for the whole region. */
  ariaLabel?: string;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ opts, ariaLabel, className, children, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [carouselRef, api] = useEmblaCarousel({
      align: "start",
      containScroll: "trimSnaps",
      // Reduced motion: instant snap (0) rather than the default glide.
      duration: prefersReducedMotion ? 0 : 25,
      ...opts,
    });

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);
    const scrollTo = React.useCallback(
      (index: number) => api?.scrollTo(index),
      [api],
    );

    const onSelect = React.useCallback((embla: EmblaApi) => {
      if (!embla) return;
      setSelectedIndex(embla.selectedScrollSnap());
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    }, []);

    React.useEffect(() => {
      if (!api) return;
      setScrollSnaps(api.scrollSnapList());
      onSelect(api);
      api.on("select", onSelect);
      api.on("reInit", onSelect);
      return () => {
        api.off("select", onSelect);
        api.off("reInit", onSelect);
      };
    }, [api, onSelect]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          scrollPrev,
          scrollNext,
          scrollTo,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={onKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        // Negative left margin pairs with each item's left padding to create
        // an even gutter between slides without a trailing edge gap.
        className={cn("flex -ml-4 md:-ml-6", className)}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 pl-4 md:pl-6", className)}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const arrowClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border " +
  "border-background/25 text-background transition-colors " +
  "hover:bg-background/5 disabled:opacity-30 disabled:pointer-events-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-house-campus-light";

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      className={cn(arrowClass, className)}
      {...props}
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next slide"
      className={cn(arrowClass, className)}
      {...props}
    >
      <ArrowRight className="h-5 w-5" aria-hidden />
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";
