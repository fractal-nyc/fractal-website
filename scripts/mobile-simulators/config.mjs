import { homedir } from "node:os";
import { resolve } from "node:path";

export const TOOL_VERSIONS = Object.freeze({
  appium: "3.5.2",
  webdriverio: "9.29.1",
  uiautomator2: "8.1.0",
  xcuitest: "11.17.7",
});

export const REPO_ROOT = resolve(import.meta.dirname, "../..");
export const APPIUM_HOME = resolve(REPO_ROOT, ".mobile-simulators/appium-home");
export const EVIDENCE_ROOT = resolve(REPO_ROOT, "test-results/mobile-simulators");
export const ANDROID_HOME = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || resolve(homedir(), "Library/Android/sdk");
export const ANDROID_JAVA_HOME = process.env.JAVA_HOME || "/Applications/Android Studio.app/Contents/jbr/Contents/Home";

export const SIMULATOR_PROFILES = Object.freeze([
  {
    id: "android-emulator-s24-class",
    platform: "android",
    avdName: process.env.ANDROID_PHONE_AVD || "Fractal_Galaxy_S24_Class_API_34",
    api: "34",
    expectedWmSize: "1080x2340",
    emulatorPort: 5554,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: true,
    interaction: true,
  },
  {
    id: "android-emulator-tablet",
    platform: "android",
    avdName: process.env.ANDROID_TABLET_AVD || "Fractal_Tablet_API_34",
    api: "34",
    emulatorPort: 5556,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: false,
    interaction: false,
  },
  {
    id: "ios-simulator-compact",
    platform: "ios",
    deviceName: process.env.IOS_COMPACT_SIMULATOR || "Fractal Compact iPhone",
    deviceTypeHint: "iPhone SE",
    deviceTypePattern: /iPhone-SE/i,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: true,
    interaction: true,
  },
  {
    id: "ios-simulator-notched",
    platform: "ios",
    deviceName: process.env.IOS_NOTCHED_SIMULATOR || "Fractal Notched iPhone",
    deviceTypeHint: "iPhone 16 Pro",
    deviceTypePattern: /iPhone-(?:1[5-9]|2[0-9])(?:-Pro)?/i,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: false,
    interaction: false,
  },
  {
    id: "ipados-simulator-pro",
    platform: "ios",
    deviceName: process.env.IPADOS_PRO_SIMULATOR || "Fractal iPad Pro 13-inch",
    deviceTypeHint: "iPad Pro (13-inch)",
    deviceTypePattern: /iPad-Pro.*13-inch/i,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: false,
    interaction: false,
  },
]);

export function profilesFor(platform, requestedProfile) {
  const selected = SIMULATOR_PROFILES.filter((profile) => platform === "all" || profile.platform === platform);
  if (!requestedProfile || requestedProfile === "all") return selected;
  return selected.filter(({ id }) => id === requestedProfile);
}
