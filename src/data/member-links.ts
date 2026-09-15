/**
 * Canonical destinations for Fractal Campus coworking members.
 *
 * Keep member-home URLs here rather than scattering literals through UI.
 * Luma and Discord reuse the public site's existing destinations.
 * The Stripe Customer Portal login URL is Dashboard-provisioned — see
 * docs/members-home.md.
 */

export const MEMBERS_HOSTNAME = "members.fractalnyc.com";
export const MEMBERS_ORIGIN = `https://${MEMBERS_HOSTNAME}`;
export const MEMBERS_HOME_PATH = "/members";
export const MEMBER_GUIDE_PATH = "/members/guide";

/** Public Luma calendar already used on /events and /campus. */
export const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";

/** Public Discord invite already used on Home, Campus, People, Co-Living. */
export const DISCORD_URL = "https://discord.gg/Er974gPTXe";

/**
 * Cuties is not linked anywhere in this repo. The public Cuties site
 * (https://cuties.app/) is a SPA that features Fractal as a community;
 * there is no more-specific community URL in-repo or as a stable public path.
 */
export const CUTIES_URL = "https://cuties.app/";

/**
 * Stripe no-code Customer Portal login.
 * Shape: https://billing.stripe.com/p/login/{LIVE_ID}
 * Set VITE_STRIPE_CUSTOMER_PORTAL_URL once the Dashboard link is activated.
 */
export const STRIPE_CUSTOMER_PORTAL_LOGIN_FALLBACK =
  "https://billing.stripe.com/p/login/";

export function stripeCustomerPortalLoginUrl(
  envUrl: string | undefined = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL,
): string {
  const trimmed = envUrl?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : STRIPE_CUSTOMER_PORTAL_LOGIN_FALLBACK;
}

export const MEMBER_LINKS = {
  manageMembership: stripeCustomerPortalLoginUrl(),
  memberGuide: MEMBER_GUIDE_PATH,
  events: LUMA_EVENTS_URL,
  cuties: CUTIES_URL,
  discord: DISCORD_URL,
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
