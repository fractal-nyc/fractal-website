import { HOUSES } from "@/data/houses";
import { HouseBanner } from "./HouseBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "wouter";

interface HouseBannerGridProps {
  className?: string;
}

/**
 * A 3x2 (desktop) / 2x3 (tablet) / 1-col (mobile) grid of HouseBanner
 * pennants linking to each house page.
 */
export function HouseBannerGrid({ className = "" }: HouseBannerGridProps) {
  return (
    <section className={`py-24 md:py-40 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section heading */}
        <FadeIn>
          <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif">
                Six Houses
              </h2>
              <p className="text-muted-foreground mt-4 font-light text-lg">
                The sectors of Fractal.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Banner grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {HOUSES.map((house, index) => (
            <FadeIn key={house.id} delay={index * 0.08}>
              <Link
                href={house.route}
                className="block transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg rounded-sm"
              >
                <HouseBanner house={house} variant="grid" />
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
