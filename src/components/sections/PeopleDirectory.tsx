import { PEOPLE } from "@/data/houses";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { FadeIn } from "@/components/ui/FadeIn";

interface PeopleDirectoryProps {
  className?: string;
}

/**
 * Responsive grid of AvatarBadge cards showing every person in the PEOPLE
 * array. Mobile-first: 2 columns at 375 px, 3 columns at sm (640 px)+.
 *
 * Section header follows the HouseBannerGrid pattern (serif heading, muted
 * subtitle, bottom border).
 */
export function PeopleDirectory({ className = "" }: PeopleDirectoryProps) {
  return (
    <section className={`py-10 md:py-16 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section heading */}
        <FadeIn>
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-serif">People</h2>
              <p className="text-muted-foreground mt-2 font-light text-lg">
                The people behind Fractal.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Badge grid — 2 cols mobile, 3 cols sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 overflow-visible">
          {PEOPLE.map((person, index) => (
            <FadeIn key={person.id} delay={index * 0.08}>
              <AvatarBadge person={person} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
