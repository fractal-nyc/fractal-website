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
export const ANDROID_AVD_HOME = process.env.ANDROID_AVD_HOME
  || resolve(process.env.ANDROID_USER_HOME || resolve(homedir(), ".android"), "avd");

export const SUPPORTED_PLATFORMS = Object.freeze(["all", "android", "ios"]);

export const ANDROID_CHROME_113_WEBGL_WORKAROUND = Object.freeze({
  chromeMajorVersions: Object.freeze([113]),
  args: Object.freeze([
    "--in-process-gpu",
    "--disable-vulkan",
    "--ignore-gpu-blocklist",
  ]),
});

export const SIMULATOR_PROFILES = Object.freeze([
  {
    id: "android-emulator-s24-class",
    platform: "android",
    avdName: process.env.ANDROID_PHONE_AVD || "Fractal_Galaxy_S24_Class_API_34",
    api: "34",
    abi: "arm64-v8a",
    systemImagePackage: "system-images;android-34;google_apis_playstore;arm64-v8a",
    expectedWmSize: "1080x2340",
    expectedWmDensity: 420,
    emulatorPort: 5554,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: true,
    interaction: true,
    androidChromeWorkaround: ANDROID_CHROME_113_WEBGL_WORKAROUND,
  },
  {
    id: "android-emulator-tablet",
    platform: "android",
    avdName: process.env.ANDROID_TABLET_AVD || "Fractal_Tablet_API_34",
    api: "34",
    abi: "arm64-v8a",
    systemImagePackage: "system-images;android-34;google_apis_playstore;arm64-v8a",
    expectedWmSize: "1600x2560",
    expectedWmDensity: 320,
    emulatorPort: 5556,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: false,
    interaction: false,
    androidChromeWorkaround: ANDROID_CHROME_113_WEBGL_WORKAROUND,
  },
  {
    id: "ios-simulator-compact",
    platform: "ios",
    deviceName: process.env.IOS_COMPACT_SIMULATOR || "Fractal Compact iPhone",
    deviceTypeHint: "iPhone SE",
    deviceTypePattern: /iPhone-SE/i,
    runtimePattern: /^com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+$/,
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
    runtimePattern: /^com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+$/,
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
    runtimePattern: /^com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+$/,
    orientations: ["PORTRAIT", "LANDSCAPE"],
    routeSweep: false,
    interaction: false,
  },
]);

export function profilesFor(platformName, requestedProfile) {
  if (!SUPPORTED_PLATFORMS.includes(platformName)) {
    throw new Error(`Unknown --platform "${platformName}". Expected one of: ${SUPPORTED_PLATFORMS.join(", ")}.`);
  }
  if (typeof requestedProfile !== "string" || requestedProfile.length === 0) {
    throw new Error("--profile requires a non-empty value.");
  }
  const profile = requestedProfile === "all"
    ? null
    : SIMULATOR_PROFILES.find(({ id }) => id === requestedProfile);
  if (requestedProfile !== "all" && !profile) {
    throw new Error(`Unknown --profile "${requestedProfile}". Expected "all" or one of: ${SIMULATOR_PROFILES.map(({ id }) => id).join(", ")}.`);
  }
  if (profile && platformName !== "all" && profile.platform !== platformName) {
    throw new Error(`Profile "${requestedProfile}" belongs to --platform ${profile.platform}, not ${platformName}.`);
  }
  return SIMULATOR_PROFILES.filter((candidate) => (
    (platformName === "all" || candidate.platform === platformName)
    && (!profile || candidate.id === profile.id)
  ));
}

export function platformFamiliesForProfiles(profiles) {
  return new Set(profiles.map(({ platform: family }) => family));
}

export function parseSelectionArgs(argv, { booleanFlags = [] } = {}) {
  const allowedBooleanFlags = new Set(booleanFlags);
  const values = { platformName: "all", requestedProfile: "all" };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (allowedBooleanFlags.has(argument)) continue;
    if (argument !== "--platform" && argument !== "--profile") {
      throw new Error(`Unknown simulator option "${argument}".`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${argument} requires a non-empty value.`);
    if (argument === "--platform") values.platformName = value;
    else values.requestedProfile = value;
    index += 1;
  }
  profilesFor(values.platformName, values.requestedProfile);
  return values;
}
