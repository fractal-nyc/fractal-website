import type { Person } from "@/data/houses";
import { HOUSES } from "@/data/houses";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract up to two initials from a name. */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Resolve the accent color for a person (first house's color, fallback gray). */
function getPersonColor(person: Person): string {
  if (person.houses.length === 0) return "#6B7280"; // gray-500
  const house = HOUSES.find((h) => h.id === person.houses[0]);
  return house?.color ?? "#6B7280";
}

// ---------------------------------------------------------------------------
// AvatarBadge
// ---------------------------------------------------------------------------

interface AvatarBadgeProps {
  person: Person;
  className?: string;
}

/**
 * Tall vertical photo card (aspect 2:3) with:
 * - Photo with object-cover (or initials fallback on colored bg)
 * - Thin border frame with 4 corner pin dots
 * - Bottom gradient overlay with name (serif, white) and role text
 * - Hover: scale-[1.02] transition
 */
export function AvatarBadge({ person, className = "" }: AvatarBadgeProps) {
  const color = getPersonColor(person);

  return (
    <div
      className={`
        group relative aspect-[2/3] overflow-hidden rounded-sm
        border border-border
        transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg
        ${className}
      `}
    >
      {/* Corner pin dots */}
      <span className="absolute top-1.5 left-1.5 z-10 h-1.5 w-1.5 rounded-full bg-white/60" />
      <span className="absolute top-1.5 right-1.5 z-10 h-1.5 w-1.5 rounded-full bg-white/60" />
      <span className="absolute bottom-1.5 left-1.5 z-10 h-1.5 w-1.5 rounded-full bg-white/60" />
      <span className="absolute bottom-1.5 right-1.5 z-10 h-1.5 w-1.5 rounded-full bg-white/60" />

      {/* Photo or initials fallback */}
      {person.avatar ? (
        <img
          src={person.avatar}
          alt={person.name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <span className="font-serif text-3xl sm:text-4xl font-medium text-white/90 select-none">
            {getInitials(person.name)}
          </span>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-3 pb-3 pt-12">
        <h3 className="font-serif text-sm sm:text-base font-medium leading-tight text-white">
          {person.name}
        </h3>
        <p className="mt-0.5 text-[11px] sm:text-xs leading-snug text-white/75">
          {person.role}
        </p>
      </div>
    </div>
  );
}
