import type { BrowserName, Project } from "@playwright/test";

export interface ResponsiveProfile {
  name: string;
  viewport: { width: number; height: number };
  hasTouch?: boolean;
  reducedMotion?: "reduce" | "no-preference";
  rootFontScale?: number;
}

export const FULL_PROFILES: ResponsiveProfile[] = [
  { name: "phone-320x568", viewport: { width: 320, height: 568 }, hasTouch: true },
  { name: "phone-360x640", viewport: { width: 360, height: 640 }, hasTouch: true },
  { name: "phone-375x667", viewport: { width: 375, height: 667 }, hasTouch: true },
  { name: "phone-390x844", viewport: { width: 390, height: 844 }, hasTouch: true },
  { name: "phone-412x915", viewport: { width: 412, height: 915 }, hasTouch: true },
  { name: "landscape-568x320", viewport: { width: 568, height: 320 }, hasTouch: true },
  { name: "landscape-640x360", viewport: { width: 640, height: 360 }, hasTouch: true },
  { name: "landscape-844x390", viewport: { width: 844, height: 390 }, hasTouch: true },
  { name: "landscape-915x412", viewport: { width: 915, height: 412 }, hasTouch: true },
  { name: "tablet-768x1024", viewport: { width: 768, height: 1024 }, hasTouch: true },
  { name: "tablet-820x1180", viewport: { width: 820, height: 1180 }, hasTouch: true },
  { name: "tablet-1023x1366", viewport: { width: 1023, height: 1366 }, hasTouch: true },
  { name: "boundary-1024x768", viewport: { width: 1024, height: 768 }, hasTouch: true },
  { name: "ipad-pro-1024x1366", viewport: { width: 1024, height: 1366 }, hasTouch: true },
  { name: "ipad-pro-landscape-1366x1024", viewport: { width: 1366, height: 1024 }, hasTouch: true },
  { name: "desktop-1280x720", viewport: { width: 1280, height: 720 } },
  { name: "desktop-1440x900", viewport: { width: 1440, height: 900 } },
  { name: "desktop-1920x1080", viewport: { width: 1920, height: 1080 } },
  { name: "phone-text-200", viewport: { width: 390, height: 844 }, hasTouch: true, rootFontScale: 2 },
  { name: "tablet-text-200", viewport: { width: 820, height: 1180 }, hasTouch: true, rootFontScale: 2 },
  { name: "desktop-text-200", viewport: { width: 1440, height: 900 }, rootFontScale: 2 },
  { name: "phone-reduced-motion", viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: "reduce" },
];

export const FAST_PROFILES = FULL_PROFILES.filter(({ name }) =>
  [
    "phone-320x568",
    "phone-360x640",
    "landscape-640x360",
    "tablet-1023x1366",
    "boundary-1024x768",
    "desktop-1440x900",
    "phone-text-200",
    "phone-reduced-motion",
  ].includes(name),
);

export function localProjects(matrix: "fast" | "full"): Project[] {
  const profiles = matrix === "full" ? FULL_PROFILES : FAST_PROFILES;
  const browsers: BrowserName[] = matrix === "full" ? ["chromium", "firefox", "webkit"] : ["chromium"];

  return browsers.flatMap((browserName) =>
    profiles.map((profile) => ({
      name: `simulated-${browserName}-${profile.name}`,
      metadata: { profile },
      use: {
        browserName,
        viewport: profile.viewport,
        hasTouch: profile.hasTouch ?? false,
        isMobile: browserName === "chromium" && Boolean(profile.hasTouch),
        deviceScaleFactor: profile.hasTouch ? 2 : 1,
        reducedMotion: profile.reducedMotion ?? "no-preference",
      },
    })),
  );
}
