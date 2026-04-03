import type { Person, PersonSocials } from "@/data/houses";
import { HOUSES } from "@/data/houses";
import { Newspaper, Globe } from "lucide-react";

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
// Social link icons
// ---------------------------------------------------------------------------

/** Inline X (formerly Twitter) icon — lucide doesn't ship one. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Row of social link icons for a person. */
function SocialLinks({ socials }: { socials: PersonSocials }) {
  const links: { href: string; label: string; icon: React.ReactNode }[] = [];

  if (socials.twitter) {
    links.push({
      href: `https://x.com/${socials.twitter}`,
      label: `@${socials.twitter} on X`,
      icon: <XIcon className="h-3 w-3" />,
    });
  }
  if (socials.substack) {
    links.push({
      href: socials.substack,
      label: "Substack",
      icon: <Newspaper className="h-3 w-3" />,
    });
  }
  if (socials.website) {
    links.push({
      href: socials.website,
      label: "Website",
      icon: <Globe className="h-3 w-3" />,
    });
  }

  if (links.length === 0) return null;

  return (
    <span className="mt-1 flex items-center gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-6 w-6 items-center justify-center text-white/60 transition-colors hover:text-white"
        >
          {l.icon}
        </a>
      ))}
    </span>
  );
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
        {person.socials && <SocialLinks socials={person.socials} />}
      </div>
    </div>
  );
}
