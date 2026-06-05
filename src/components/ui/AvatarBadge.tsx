import type { Person, PersonSocials } from "@/data/houses";
import { HOUSES } from "@/data/houses";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { Globe } from "lucide-react";

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

/** Resolve the accent color for a person (first house's deep palette color,
 *  fallback warm system charcoal). FRAC-24: derives from canonical palette
 *  pair instead of the deprecated `color` field. */
function getPersonColor(person: Person): string {
  if (person.houses.length === 0) return "#171717"; // warm system charcoal
  const house = HOUSES.find((h) => h.id === person.houses[0]);
  return house?.palette?.deep ?? "#171717";
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
  // MVP v0: Substack icon intentionally hidden — FRAC-169
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
// Badge layout (from playground: 183×309 card inside 211×388 image)
//
// Component sizes to IMAGE (211×388). No overflow — grid-safe.
// Lining + mandelbrots are percentage-inset overlays on the image.
// ---------------------------------------------------------------------------

// Lining position as % of image (card inset + 7px lining inset)
const LINING = {
  top: "13.1%",    // (44+7) / 388
  bottom: "10.8%", // (35+7) / 388
  left: "9.5%",    // (13+7) / 211
  right: "10.4%",  // (15+7) / 211
};

// Mandelbrot: 3px outside lining corners (as % of image)
const M = {
  vNudge: "0.8%",  // 3 / 388
  hNudge: "1.4%",  // 3 / 211
};

const MANDELBROT_SIZE = 16;

// ---------------------------------------------------------------------------
// AvatarBadge
// ---------------------------------------------------------------------------

interface AvatarBadgeProps {
  person: Person;
  className?: string;
}

/**
 * Collectible-card badge (HP-inspired). Component = image boundary.
 * Lining + mandelbrots are inset overlays. No overflow, grid-safe.
 */
export function AvatarBadge({ person, className = "" }: AvatarBadgeProps) {
  const color = getPersonColor(person);

  return (
    <div
      className={`
        group relative aspect-[211/388]
        transition-transform duration-300 hover:scale-[1.02]
        ${className}
      `}
    >
      {/* Image fills entire component */}
      {person.avatar ? (
        <img
          src={person.avatar}
          alt={person.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
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

      {/* Inner lining */}
      <div
        className="absolute z-20 rounded-[2px] border border-white pointer-events-none"
        style={{ top: LINING.top, bottom: LINING.bottom, left: LINING.left, right: LINING.right }}
      />

      {/* Mandelbrot corners — 45° rotated, tops pointing inward */}
      {([
        { top: `calc(${LINING.top} - ${M.vNudge})`, left: `calc(${LINING.left} - ${M.hNudge})`, rotate: "135deg" },
        { top: `calc(${LINING.top} - ${M.vNudge})`, right: `calc(${LINING.right} - ${M.hNudge})`, rotate: "-135deg" },
        { bottom: `calc(${LINING.bottom} - ${M.vNudge})`, left: `calc(${LINING.left} - ${M.hNudge})`, rotate: "45deg" },
        { bottom: `calc(${LINING.bottom} - ${M.vNudge})`, right: `calc(${LINING.right} - ${M.hNudge})`, rotate: "-45deg" },
      ] as const).map((pos, i) => (
        <div
          key={i}
          className="absolute z-20 pointer-events-none"
          style={{
            top: "top" in pos ? pos.top : undefined,
            bottom: "bottom" in pos ? pos.bottom : undefined,
            left: "left" in pos ? pos.left : undefined,
            right: "right" in pos ? pos.right : undefined,
            transform: `rotate(${pos.rotate})`,
          }}
        >
          <MandelbrotIcon size={MANDELBROT_SIZE} color="white" opacity={1} />
        </div>
      ))}

      {/* Gradient + text at bottom of image */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-4 pt-16">
        <h3 className="font-serif text-sm sm:text-base font-medium leading-tight text-white drop-shadow-sm">
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
