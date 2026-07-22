export const RENDERED_ROUTES = [
  "/",
  "/the-protocol",
  "/co-living",
  "/campus",
  "/events",
  "/political-club",
  "/library",
  "/people",
  "/responsive-test-404",
] as const;

export const INTERNAL_REDIRECTS = [
  { from: "/story", to: "/" },
  { from: "/visit", to: "/co-living" },
  { from: "/publications", to: "/library" },
  { from: "/neighborhood", to: "/co-living" },
  { from: "/lab", to: "/library" },
] as const;
