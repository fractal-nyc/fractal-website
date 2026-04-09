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
    <section className={`py-10 md:py-16 bg-background ${className}`}>
      <div className="px-[4.5%]">
        {/* Section heading */}
        <FadeIn>
          <div className="mb-8 md:mb-10 text-center border-b border-border pb-6">
              <h2
                className="text-5xl md:text-7xl font-serif"
                style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal", letterSpacing: "0.15em" }}
              >
                How Do I Get Involved
              </h2>
          </div>
        </FadeIn>

        {/* Banner grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {HOUSES.map((house, index) => (
            <FadeIn key={house.id} delay={index * 0.08}>
              <Link
                href={house.route}
                className="block transition-transform duration-300 hover:scale-[1.02] hover:[filter:drop-shadow(0_8px_12px_rgb(0_0_0/0.15))] rounded-sm"
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
