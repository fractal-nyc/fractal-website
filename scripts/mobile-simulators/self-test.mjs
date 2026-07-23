import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import {
  ANDROID_CHROME_113_WEBGL_WORKAROUND,
  SIMULATOR_PROFILES,
  parseSelectionArgs,
  platformFamiliesForProfiles,
  profilesFor,
} from "./config.mjs";
import {
  isRecognizedPlayStorePackageOutput,
  parseIni,
  validateAndroidAvdConfig,
  validateAndroidRuntimeIdentity,
  validateAppleDeviceIdentity,
} from "./identity.mjs";
import {
  ANDROID_CHROME_PACKAGE,
  cleanupAndroidChrome,
  diagnoseAndroidChromeDebugState,
  prepareAndroidChrome,
  resolveAndroidChromeWorkaround,
} from "./android-chrome.mjs";
import { buildWebdriverCapabilities } from "./capabilities.mjs";
import { classifyBrowserLogs } from "./browser-logs.mjs";
import {
  beginRuntimeHealthRoute,
  installRuntimeHealthCapture,
  probeRuntimeHealth,
} from "../../tests/e2e/support/responsive-contract.mjs";

const phone = SIMULATOR_PROFILES.find(({ id }) => id === "android-emulator-s24-class");
const compact = SIMULATOR_PROFILES.find(({ id }) => id === "ios-simulator-compact");

assert.deepEqual(ANDROID_CHROME_113_WEBGL_WORKAROUND.args, [
  "--in-process-gpu",
  "--disable-vulkan",
  "--ignore-gpu-blocklist",
]);
assert.equal(resolveAndroidChromeWorkaround(phone, "113.0.5672.136").required, true);
assert.deepEqual(resolveAndroidChromeWorkaround(phone, "113.0.5672.136").args, ANDROID_CHROME_113_WEBGL_WORKAROUND.args);
assert.equal(resolveAndroidChromeWorkaround(phone, "114.0.5735.60").required, false);
assert.equal(resolveAndroidChromeWorkaround(compact, "113.0.5672.136").required, false);

const androidCapabilities = buildWebdriverCapabilities({
  profile: phone,
  identity: { serial: "emulator-5554", chromeVersion: "113.0.5672.136" },
  baseUrl: "http://10.0.2.2:4173",
});
assert.deepEqual(androidCapabilities["goog:chromeOptions"], { args: ANDROID_CHROME_113_WEBGL_WORKAROUND.args });
const newerAndroidCapabilities = buildWebdriverCapabilities({
  profile: phone,
  identity: { serial: "emulator-5554", chromeVersion: "114.0.5735.60" },
  baseUrl: "http://10.0.2.2:4173",
});
assert.equal("goog:chromeOptions" in newerAndroidCapabilities, false);
const iosCapabilities = buildWebdriverCapabilities({
  profile: compact,
  identity: { udid: "test-udid", deviceName: compact.deviceName, platformVersion: "18.5" },
  baseUrl: "http://127.0.0.1:4173",
});
assert.equal("goog:chromeOptions" in iosCapabilities, false);

const externalNetworkFailure = {
  level: "SEVERE",
  source: "network",
  message: "https://o370968.ingest.us.sentry.io/api/5182504/envelope/ - Failed to load resource: the server responded with a status of 403 ()",
};
const firstPartyNetworkFailure = {
  level: "SEVERE",
  source: "network",
  message: "http://10.0.2.2:4173/assets/app.js - Failed to load resource: the server responded with a status of 500 ()",
};
const relativeNetworkFailure = {
  level: "ERROR",
  source: "network",
  message: "/assets/app.js - Failed to load resource",
};
const javascriptFailure = {
  level: "SEVERE",
  source: "javascript",
  message: "https://third-party.example/embed.js 1:2 Uncaught TypeError: broken",
};
const consoleFailure = {
  level: "ERROR",
  source: "console-api",
  message: "https://third-party.example/embed.js 1:2 intentional console error",
};
const pageFailure = {
  level: "SEVERE",
  source: "page",
  message: "https://third-party.example/embed 1:2 page crashed",
};
const warning = {
  level: "WARNING",
  source: "javascript",
  message: "warning only",
};
assert.deepEqual(
  classifyBrowserLogs([
    externalNetworkFailure,
    firstPartyNetworkFailure,
    relativeNetworkFailure,
    javascriptFailure,
    consoleFailure,
    pageFailure,
    warning,
  ], "http://10.0.2.2:4173"),
  {
    fatal: [firstPartyNetworkFailure, relativeNetworkFailure, javascriptFailure, consoleFailure, pageFailure],
    externalNetwork: [externalNetworkFailure],
  },
);

function fakeAndroidShell({ debugApp = null, waitForDebugger = false, failForceStop = false } = {}) {
  const state = { debugApp, waitForDebugger };
  const calls = [];
  return {
    state,
    calls,
    executeShell(args) {
      calls.push([...args]);
      if (args.join(" ") === "settings get global debug_app") {
        return { status: 0, stdout: state.debugApp ?? "null", stderr: "" };
      }
      if (args.join(" ") === "settings get global wait_for_debugger") {
        return { status: 0, stdout: state.waitForDebugger ? "1" : "0", stderr: "" };
      }
      if (args[0] === "am" && args[1] === "set-debug-app") {
        state.debugApp = args.at(-1);
        state.waitForDebugger = args.includes("-w");
        return { status: 0, stdout: "", stderr: "" };
      }
      if (args.join(" ") === `am force-stop ${ANDROID_CHROME_PACKAGE}`) {
        return failForceStop
          ? { status: 1, stdout: "", stderr: "forced failure" }
          : { status: 0, stdout: "", stderr: "" };
      }
      if (args.join(" ") === "am clear-debug-app") {
        state.debugApp = null;
        state.waitForDebugger = false;
        return { status: 0, stdout: "", stderr: "" };
      }
      return { status: 1, stdout: "", stderr: `unexpected fake command: ${args.join(" ")}` };
    },
  };
}

const availableDebugState = diagnoseAndroidChromeDebugState(phone, "113.0.5672.136", { debugApp: null, waitForDebugger: false });
assert.equal(availableDebugState.ok, true);
assert.equal(availableDebugState.disposition, "available");

const ownedShell = fakeAndroidShell();
const ownedPreparation = prepareAndroidChrome({
  profile: phone,
  chromeVersion: "113.0.5672.136",
  executeShell: ownedShell.executeShell,
});
assert.deepEqual(ownedPreparation.metadata, {
  required: true,
  applied: true,
  preExisting: false,
  chromeVersion: "113.0.5672.136",
  chromeMajor: 113,
  args: ANDROID_CHROME_113_WEBGL_WORKAROUND.args,
  state: "applied-by-run",
});
assert.equal(ownedShell.state.debugApp, ANDROID_CHROME_PACKAGE);
assert.deepEqual(cleanupAndroidChrome({ ownership: ownedPreparation.ownership, executeShell: ownedShell.executeShell }), { state: "cleared-run-owned", cleared: true });
assert.equal(ownedShell.state.debugApp, null);
assert.deepEqual(cleanupAndroidChrome({ ownership: ownedPreparation.ownership, executeShell: ownedShell.executeShell }), { state: "already-clear", cleared: false });

const compatibleShell = fakeAndroidShell({ debugApp: ANDROID_CHROME_PACKAGE });
const compatiblePreparation = prepareAndroidChrome({ profile: phone, chromeVersion: "113.0.5672.136", executeShell: compatibleShell.executeShell });
assert.equal(compatiblePreparation.metadata.preExisting, true);
assert.equal(compatiblePreparation.metadata.applied, false);
assert.deepEqual(cleanupAndroidChrome({ ownership: compatiblePreparation.ownership, executeShell: compatibleShell.executeShell }), { state: "not-owned", cleared: false });
assert.equal(compatibleShell.state.debugApp, ANDROID_CHROME_PACKAGE);

const conflictingShell = fakeAndroidShell({ debugApp: "com.example.debugger" });
assert.throws(
  () => prepareAndroidChrome({ profile: phone, chromeVersion: "113.0.5672.136", executeShell: conflictingShell.executeShell }),
  /debug_app is com\.example\.debugger/,
);
assert.equal(conflictingShell.state.debugApp, "com.example.debugger");
assert.equal(conflictingShell.calls.some((args) => args[0] === "am"), false);

const waitingShell = fakeAndroidShell({ debugApp: ANDROID_CHROME_PACKAGE, waitForDebugger: true });
assert.throws(
  () => prepareAndroidChrome({ profile: phone, chromeVersion: "113.0.5672.136", executeShell: waitingShell.executeShell }),
  /wait_for_debugger is enabled/,
);

const unaffectedShell = fakeAndroidShell({ debugApp: "com.example.debugger", waitForDebugger: true });
const unaffectedPreparation = prepareAndroidChrome({ profile: phone, chromeVersion: "114.0.5735.60", executeShell: unaffectedShell.executeShell });
assert.equal(unaffectedPreparation.metadata.required, false);
assert.deepEqual(unaffectedShell.calls, []);

const rollbackShell = fakeAndroidShell({ failForceStop: true });
assert.throws(
  () => prepareAndroidChrome({ profile: phone, chromeVersion: "113.0.5672.136", executeShell: rollbackShell.executeShell }),
  /am force-stop com\.android\.chrome failed/,
);
assert.equal(rollbackShell.state.debugApp, null);

const changedOwnerShell = fakeAndroidShell({ debugApp: "com.example.new-owner" });
assert.deepEqual(
  cleanupAndroidChrome({ ownership: { appliedByRun: true }, executeShell: changedOwnerShell.executeShell }),
  { state: "ownership-state-changed", cleared: false },
);
assert.equal(changedOwnerShell.state.debugApp, "com.example.new-owner");

assert.deepEqual(parseSelectionArgs([]), { platformName: "all", requestedProfile: "all" });
assert.deepEqual(parseSelectionArgs(["--", "--platform", "ios"]), { platformName: "ios", requestedProfile: "all" });
assert.equal(profilesFor("android", "all").length, 2);
assert.deepEqual([...platformFamiliesForProfiles(profilesFor("all", "android-emulator-s24-class"))], ["android"]);
assert.deepEqual([...platformFamiliesForProfiles(profilesFor("all", "ios-simulator-compact"))], ["ios"]);
assert.deepEqual([...platformFamiliesForProfiles(profilesFor("all", "all"))].sort(), ["android", "ios"]);
assert.throws(() => parseSelectionArgs(["--platform"]), /requires a non-empty value/);
assert.throws(() => parseSelectionArgs(["--profile", ""]), /requires a non-empty value/);
assert.throws(() => parseSelectionArgs(["--platform", "nonsense"]), /Unknown --platform/);
assert.throws(() => parseSelectionArgs(["--profile", "missing"]), /Unknown --profile/);
assert.throws(() => parseSelectionArgs(["--platform", "android", "--profile", "ios-simulator-compact"]), /belongs to --platform ios/);
assert.throws(() => parseSelectionArgs(["--wat"]), /Unknown simulator option/);

const validAvdConfig = parseIni(`
image.sysdir.1=system-images/android-34/google_apis_playstore/arm64-v8a/
target=android-34
abi.type=arm64-v8a
hw.lcd.width=1080
hw.lcd.height=2340
hw.lcd.density=420
`);
assert.equal(validateAndroidAvdConfig(phone, validAvdConfig).ok, true);
for (const [key, value] of [
  ["image.sysdir.1", "system-images/android-33/google_apis_playstore/arm64-v8a/"],
  ["abi.type", "x86_64"],
  ["hw.lcd.width", "720"],
  ["hw.lcd.density", "480"],
]) {
  assert.equal(validateAndroidAvdConfig(phone, { ...validAvdConfig, [key]: value }).ok, false, `${key} mismatch must fail`);
}

const validRuntime = {
  serial: "emulator-5554",
  avdName: phone.avdName,
  api: "34",
  abi: "arm64-v8a",
  wmSize: "Physical size: 1080x2340",
  wmDensity: "Physical density: 420",
  fingerprint: "google/sdk_gphone64_arm64/emu64a:14/test",
  systemImage: "google/sdk_gphone64_arm64/emu64a:14/test",
  playStorePackagePath: "package:/product/priv-app/Phonesky/Phonesky.apk",
};

for (const packageOutput of [
  "package:/system/priv-app/Phonesky/Phonesky.apk",
  "package:/product/priv-app/Phonesky/Phonesky.apk",
  "package:/system/product/priv-app/Phonesky/Phonesky.apk",
  "package:/system_ext/priv-app/Phonesky/Phonesky.apk",
  "package:/data/app/~~1dlB0QiSoZaEu1gIzSdBhA==/com.android.vending-P-vV8qvM7RwYF8xYFb0cAw==/base.apk",
  "package:/data/app/~~1dlB0QiSoZaEu1gIzSdBhA==/com.android.vending-P-vV8qvM7RwYF8xYFb0cAw==/base.apk\npackage:/data/app/~~1dlB0QiSoZaEu1gIzSdBhA==/com.android.vending-P-vV8qvM7RwYF8xYFb0cAw==/split_config.arm64_v8a.apk",
  "package:/data/app/com.android.vending-1/base.apk",
]) {
  assert.equal(isRecognizedPlayStorePackageOutput(packageOutput), true, `${packageOutput} must be accepted`);
  assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, playStorePackagePath: packageOutput }).ok, true, `${packageOutput} must prove Play Store identity`);
}

for (const packageOutput of [
  "",
  "package:/data/app/~~spoof/base.apk",
  "package:/data/app/~~session/com.android.vending.evil-token/base.apk",
  "package:/data/app/~~session/evil.com.android.vending-token/base.apk",
  "package:/data/app/~~session/com.android.vending-token/../../tmp/fake.apk",
  "package:/data/app/~~session/com.android.vending-token/not an apk.apk",
  "package:/tmp/fake.apk",
  "package:/system/app/Unrelated/Unrelated.apk",
  "package:/product/priv-app/PhoneskyEvil/Phonesky.apk",
  "package:/product/priv-app/Phonesky/NotPhonesky.apk",
  "package:/no-spaces.apk",
  " package:/product/priv-app/Phonesky/Phonesky.apk",
  "package:/product/priv-app/Phonesky/Phonesky.apk ",
  "package:/product/priv-app/Phonesky/Phonesky.apk\npackage:/tmp/fake.apk",
]) {
  assert.equal(isRecognizedPlayStorePackageOutput(packageOutput), false, `${JSON.stringify(packageOutput)} must be rejected`);
  assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, playStorePackagePath: packageOutput }).ok, false, `${JSON.stringify(packageOutput)} must not prove Play Store identity`);
}

assert.equal(validateAndroidRuntimeIdentity(phone, validRuntime).ok, true);
assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, wmSize: "Physical size: 720x1280\nOverride size: 1080x2340", wmDensity: "Physical density: 480\nOverride density: 420" }).ok, true);
assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, wmDensity: "Physical density: 480" }).ok, false);
const genericGoogleApisRuntime = { ...validRuntime, playStorePackagePath: "" };
const genericGoogleApisValidation = validateAndroidRuntimeIdentity(phone, genericGoogleApisRuntime);
assert.equal(genericGoogleApisValidation.ok, false);
assert.match(genericGoogleApisValidation.violations.join("\n"), /google_apis_playstore.*com\.android\.vending/);

const validApple = {
  name: compact.deviceName,
  deviceTypeIdentifier: "com.apple.CoreSimulator.SimDeviceType.iPhone-SE-3rd-generation",
  runtime: "com.apple.CoreSimulator.SimRuntime.iOS-18-5",
};
assert.equal(validateAppleDeviceIdentity(compact, validApple, [validApple.runtime]).ok, true);
assert.equal(validateAppleDeviceIdentity(compact, { ...validApple, deviceTypeIdentifier: "com.apple.CoreSimulator.SimDeviceType.iPad-Pro-13-inch-M4" }).ok, false);
assert.equal(validateAppleDeviceIdentity(compact, { ...validApple, runtime: "com.apple.CoreSimulator.SimRuntime.tvOS-18-5" }).ok, false);
assert.equal(validateAppleDeviceIdentity(compact, validApple, ["com.apple.CoreSimulator.SimRuntime.iOS-17-5"]).ok, false);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent('<main><img alt="healthy" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="></main>');
  await page.evaluate(installRuntimeHealthCapture);
  assert.equal(await page.evaluate(beginRuntimeHealthRoute, "/self-test"), true);
  await page.evaluate(() => console.error("intentional simulator self-test error"));
  const consoleResult = await page.evaluate(probeRuntimeHealth);
  assert.match(consoleResult.violations.join("\n"), /console error: intentional simulator self-test error/);

  await page.evaluate(beginRuntimeHealthRoute, "/asset-self-test");
  await page.evaluate(() => {
    const image = document.querySelector("img");
    image.dispatchEvent(new Event("error"));
  });
  const assetResult = await page.evaluate(probeRuntimeHealth);
  assert.match(assetResult.violations.join("\n"), /asset error event: IMG/);

  await page.reload();
  assert.equal(await page.evaluate(() => Boolean(window.__fractalSimulatorHealth)), false);
  await page.evaluate(installRuntimeHealthCapture);
  assert.equal(await page.evaluate(() => Boolean(window.__fractalSimulatorHealth)), true);
  assert.equal(await page.evaluate(beginRuntimeHealthRoute, "/post-navigation-self-test"), true);
} finally {
  await browser.close();
}

console.log("Mobile simulator selection, identity, and route-health self-tests passed.");
