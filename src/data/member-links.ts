/**
 * Canonical destinations for Fractal Campus coworking members.
 *
 * Keep member-home URLs here rather than scattering literals through UI.
 * Luma reuses the public calendar. Discord is the members-only invite
 * (distinct from the public Discord linked on Home, Campus, People,
 * and Co-Living). Manage membership uses the live Stripe Customer Portal
 * login URL (overridable via VITE_STRIPE_CUSTOMER_PORTAL_URL).
 */

export const MEMBERS_HOSTNAME = "members.fractalnyc.com";
export const MEMBERS_ORIGIN = `https://${MEMBERS_HOSTNAME}`;
export const MEMBERS_HOME_PATH = "/members";
/** Former dedicated guide route; redirects to the combined Member Guide. */
export const MEMBER_GUIDE_PATH = "/members/guide";

/** Public Luma calendar already used on /events and /campus. */
export const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";

/** Public Discord invite used on Home, Campus, People, and Co-Living. */
export const DISCORD_URL = "https://discord.gg/Er974gPTXe";

/** Campus coworking members Discord (not the public-site invite). */
export const MEMBERS_DISCORD_URL = "https://discord.gg/DaHFyPubNv";

/**
 * Cuties is not linked anywhere in this repo. The public Cuties site
 * (https://cuties.app/) is a SPA that features Fractal as a community;
 * there is no more-specific community URL in-repo or as a stable public path.
 */
export const CUTIES_URL = "https://cuties.app/";

/**
 * Stripe no-code Customer Portal login (public; Dashboard → Activate link).
 * Return URL is already set to https://members.fractalnyc.com.
 * Optional override: VITE_STRIPE_CUSTOMER_PORTAL_URL.
 */
export const STRIPE_CUSTOMER_PORTAL_LOGIN_URL =
  "https://billing.stripe.com/p/login/7sI8zddAWdabfYc144";

export function stripeCustomerPortalLoginUrl(
  envUrl: string | undefined = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL,
): string {
  const trimmed = envUrl?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : STRIPE_CUSTOMER_PORTAL_LOGIN_URL;
}

export const MEMBER_LINKS = {
  manageMembership: stripeCustomerPortalLoginUrl(),
  events: LUMA_EVENTS_URL,
  cuties: CUTIES_URL,
  discord: MEMBERS_DISCORD_URL,
} as const;

export function membersHomePathForHost(
  hostname: string,
  pathname: string,
): string | null {
  if (hostname === MEMBERS_HOSTNAME && (pathname === "/" || pathname === "")) {
    return MEMBERS_HOME_PATH;
  }
  return null;
}
