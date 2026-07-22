import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { SIMULATOR_PROFILES, parseSelectionArgs, profilesFor } from "./config.mjs";
import {
  parseIni,
  validateAndroidAvdConfig,
  validateAndroidRuntimeIdentity,
  validateAppleDeviceIdentity,
} from "./identity.mjs";
import {
  beginRuntimeHealthRoute,
  installRuntimeHealthCapture,
  probeRuntimeHealth,
} from "../../tests/e2e/support/responsive-contract.mjs";

const phone = SIMULATOR_PROFILES.find(({ id }) => id === "android-emulator-s24-class");
const compact = SIMULATOR_PROFILES.find(({ id }) => id === "ios-simulator-compact");

assert.deepEqual(parseSelectionArgs([]), { platformName: "all", requestedProfile: "all" });
assert.deepEqual(parseSelectionArgs(["--", "--platform", "ios"]), { platformName: "ios", requestedProfile: "all" });
assert.equal(profilesFor("android", "all").length, 2);
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
};
assert.equal(validateAndroidRuntimeIdentity(phone, validRuntime).ok, true);
assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, wmSize: "Physical size: 720x1280\nOverride size: 1080x2340", wmDensity: "Physical density: 480\nOverride density: 420" }).ok, true);
assert.equal(validateAndroidRuntimeIdentity(phone, { ...validRuntime, wmDensity: "Physical density: 480" }).ok, false);

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
} finally {
  await browser.close();
}

console.log("Mobile simulator selection, identity, and route-health self-tests passed.");
