/**
 * Practical Campus facts already published on the public site.
 * Do not invent Wi-Fi, guest, kitchen, or access-code policies here.
 */

export const MEMBER_GUIDE_ADDRESS = {
  label: "111 Conselyea St, Brooklyn, NY",
  mapsUrl:
    "https://www.google.com/maps/place/111+Conselyea+St,+Brooklyn,+NY+11211/",
} as const;

export const MEMBER_GUIDE_CONTACT = {
  name: "Crystal",
  email: "crystal@fractalnyc.com",
  mailto: "mailto:crystal@fractalnyc.com",
} as const;

/** Access descriptions from the public Campus membership CTAs. */
export const MEMBER_GUIDE_ACCESS = [
  {
    name: "Full time membership",
    detail: "24/7 access to the space.",
  },
  {
    name: "Part time membership",
    detail: "20 hours per week.",
  },
] as const;

/** Amenities listed on the public Campus page. */
export const MEMBER_GUIDE_AMENITIES = [
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
] as const;
