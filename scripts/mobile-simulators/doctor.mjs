import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { arch, platform } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  ANDROID_HOME,
  ANDROID_AVD_HOME,
  ANDROID_JAVA_HOME,
  APPIUM_HOME,
  REPO_ROOT,
  SIMULATOR_PROFILES,
  TOOL_VERSIONS,
  profilesFor,
  parseSelectionArgs,
} from "./config.mjs";
import { parseIni, validateAndroidAvdConfig, validateAppleDeviceIdentity } from "./identity.mjs";

function executable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function run(command, args = [], env = process.env) {
  const result = spawnSync(command, args, { cwd: REPO_ROOT, env, encoding: "utf8", timeout: 15_000 });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    error: result.error?.message ?? null,
  };
}

function check(name, ok, detail, remediation = null, required = true) {
  return { name, ok: Boolean(ok), detail: detail || "not found", remediation: ok ? null : remediation, required };
}

function portIsFree(port) {
  const result = run("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
  return !result.ok && !result.stdout;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readAndroidAvdConfig(avdName) {
  const pointerPath = join(ANDROID_AVD_HOME, `${avdName}.ini`);
  const pointer = existsSync(pointerPath) ? parseIni(readFileSync(pointerPath, "utf8")) : {};
  const configPath = pointer.path
    || (pointer["path.rel"] ? resolve(ANDROID_AVD_HOME, "..", pointer["path.rel"]) : join(ANDROID_AVD_HOME, `${avdName}.avd`));
  const avdConfigPath = join(configPath, "config.ini");
  return {
    pointerPath,
    configPath: avdConfigPath,
    config: existsSync(avdConfigPath) ? parseIni(readFileSync(avdConfigPath, "utf8")) : null,
  };
}

export async function runDoctor({ platformName = "all", requestedProfile = "all" } = {}) {
  const selected = profilesFor(platformName, requestedProfile);
  const checks = [];
  const wantsAndroid = platformName === "all" || platformName === "android";
  const wantsIos = platformName === "all" || platformName === "ios";

  checks.push(check("macOS host", platform() === "darwin", `${platform()} ${arch()}`, "Run Apple/Android simulator tests on an Apple Silicon Mac."));
  checks.push(check("Apple Silicon", arch() === "arm64", arch(), "Use an arm64 Mac; the maintained Android images are arm64."));

  if (wantsIos) {
    const developerPath = run("xcode-select", ["-p"]);
    const fullXcode = developerPath.ok && !developerPath.stdout.endsWith("CommandLineTools");
    checks.push(check("full Xcode selected", fullXcode, developerPath.stdout || developerPath.stderr, "Install and launch full Xcode, accept its license/components, then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"));
    const version = run("xcodebuild", ["-version"]);
    checks.push(check("xcodebuild", fullXcode && version.ok, version.stdout || version.stderr, "Complete Xcode first launch and license acceptance."));
    const runtimesResult = run("xcrun", ["simctl", "list", "runtimes", "available", "--json"]);
    const runtimes = parseJson(runtimesResult.stdout)?.runtimes ?? [];
    const iosRuntimes = runtimes.filter((runtime) => /iOS/i.test(runtime.name) && runtime.isAvailable !== false);
    checks.push(check("available iOS Simulator runtime", iosRuntimes.length > 0, iosRuntimes.map((runtime) => `${runtime.name} (${runtime.identifier})`).join(", "), "In Xcode > Settings > Components, install one supported iOS Simulator runtime."));
    const devicesResult = run("xcrun", ["simctl", "list", "devices", "available", "--json"]);
    const deviceGroups = parseJson(devicesResult.stdout)?.devices ?? {};
    const devices = Object.entries(deviceGroups).flatMap(([runtime, entries]) => entries.map((entry) => ({ runtime, ...entry })));
    const availableRuntimeIds = iosRuntimes.map(({ identifier }) => identifier);
    for (const profile of selected.filter(({ platform: family }) => family === "ios")) {
      const matches = devices.filter(({ name }) => name === profile.deviceName);
      const validMatches = matches.filter((device) => validateAppleDeviceIdentity(profile, device, availableRuntimeIds).ok);
      const identityDetails = matches.map((device) => {
        const validation = validateAppleDeviceIdentity(profile, device, availableRuntimeIds);
        return `${device.name} ${device.udid} ${device.runtime} ${device.deviceTypeIdentifier || "unknown-type"}: ${validation.ok ? "valid" : validation.violations.join("; ")}`;
      }).join(", ");
      checks.push(check(
        profile.id,
        validMatches.length > 0,
        identityDetails,
        `Create an available ${profile.deviceTypeHint} simulator named "${profile.deviceName}" in Xcode, or set the corresponding IOS_*_SIMULATOR/IPADOS_PRO_SIMULATOR environment variable.`,
      ));
      const booted = validMatches.filter(({ state }) => state === "Booted");
      checks.push(check(`${profile.id} boot state`, booted.length > 0, booted.map(({ udid }) => udid).join(", ") || "not booted (the runner can boot it)", null, false));
      if (booted[0]) {
        const safari = run("xcrun", ["simctl", "get_app_container", booted[0].udid, "com.apple.mobilesafari"]);
        checks.push(check(`${profile.id} Mobile Safari`, safari.ok, safari.stdout || safari.stderr, "Boot the simulator once and clear any Safari welcome/consent screen."));
      }
    }
  }

  if (wantsAndroid) {
    const adb = join(ANDROID_HOME, "platform-tools/adb");
    const emulator = join(ANDROID_HOME, "emulator/emulator");
    const sdkmanager = join(ANDROID_HOME, "cmdline-tools/latest/bin/sdkmanager");
    const avdmanager = join(ANDROID_HOME, "cmdline-tools/latest/bin/avdmanager");
    checks.push(check("ANDROID_HOME", executable(adb) && executable(emulator), ANDROID_HOME, "Complete Android Studio Setup Wizard and install Platform Tools plus Android Emulator; export ANDROID_HOME if the SDK is not in ~/Library/Android/sdk."));
    checks.push(check("sdkmanager", executable(sdkmanager), sdkmanager, "Install Android SDK Command-line Tools (latest) from Android Studio's SDK Manager."));
    checks.push(check("avdmanager", executable(avdmanager), avdmanager, "Install Android SDK Command-line Tools (latest) from Android Studio's SDK Manager."));
    const java = join(ANDROID_JAVA_HOME, "bin/java");
    const javaVersion = executable(java) ? run(java, ["-version"], { ...process.env, JAVA_HOME: ANDROID_JAVA_HOME }) : { ok: false, stdout: "", stderr: "", error: null };
    checks.push(check("Android Studio JBR/JAVA_HOME", javaVersion.ok, javaVersion.stderr || javaVersion.stdout || ANDROID_JAVA_HOME, "Install Android Studio and use its bundled JBR, or export JAVA_HOME to a compatible JDK."));
    const avdList = executable(emulator) ? run(emulator, ["-list-avds"]).stdout.split(/\r?\n/).filter(Boolean) : [];
    for (const profile of selected.filter(({ platform: family }) => family === "android")) {
      const definition = readAndroidAvdConfig(profile.avdName);
      const validation = definition.config ? validateAndroidAvdConfig(profile, definition.config) : { ok: false, violations: ["config.ini is missing"], actual: {} };
      checks.push(check(
        profile.id,
        avdList.includes(profile.avdName) && validation.ok,
        `${profile.avdName}; ${definition.configPath}; ${validation.ok ? JSON.stringify(validation.actual) : validation.violations.join("; ")}`,
        `In Android Studio Device Manager create or repair "${profile.avdName}" with ${profile.systemImagePackage}, ${profile.expectedWmSize} at ${profile.expectedWmDensity} dpi.${profile.id.includes("s24") ? " This is S24-class geometry, not Samsung hardware." : ""}`,
      ));
    }
    const adbDevices = executable(adb) ? run(adb, ["devices", "-l"]).stdout : "";
    checks.push(check("ADB emulator boot state", /^emulator-\d+\s+device\b/m.test(adbDevices), adbDevices || "no booted emulator (the runner can boot it)", null, false));
    if (/^emulator-\d+\s+device\b/m.test(adbDevices)) {
      const serial = adbDevices.match(/^(emulator-\d+)\s+device\b/m)?.[1];
      const chrome = serial ? run(adb, ["-s", serial, "shell", "dumpsys", "package", "com.android.chrome"]) : { ok: false, stdout: "", stderr: "" };
      checks.push(check("Chrome for Android", chrome.ok && /versionName=/i.test(chrome.stdout), chrome.stdout.match(/versionName=[^\s]+/)?.[0] || chrome.stderr, "Boot the AVD, finish Chrome's first-run flow, and ensure Chrome is enabled."));
    }
  }

  const appiumBinary = resolve(REPO_ROOT, "node_modules/.bin/appium");
  const appiumVersion = executable(appiumBinary) ? run(appiumBinary, ["--version"], { ...process.env, APPIUM_HOME }) : { ok: false, stdout: "", stderr: "" };
  checks.push(check("Appium", appiumVersion.ok && appiumVersion.stdout === TOOL_VERSIONS.appium, appiumVersion.stdout || appiumBinary, "Run pnpm install, then pnpm simulators:setup-appium."));
  let webdriverioVersion = null;
  try {
    webdriverioVersion = JSON.parse(readFileSync(resolve(REPO_ROOT, "node_modules/webdriverio/package.json"), "utf8")).version;
  } catch {
    webdriverioVersion = null;
  }
  checks.push(check("WebdriverIO", webdriverioVersion === TOOL_VERSIONS.webdriverio, webdriverioVersion || "not installed", "Run pnpm install --frozen-lockfile."));
  if (appiumVersion.ok) {
    const driverList = run(appiumBinary, ["driver", "list", "--installed"], { ...process.env, APPIUM_HOME });
    const driverOutput = `${driverList.stdout}\n${driverList.stderr}`;
    if (wantsAndroid) checks.push(check("UiAutomator2 driver", new RegExp(`uiautomator2@${TOOL_VERSIONS.uiautomator2.replaceAll(".", "\\.")}`).test(driverOutput), driverOutput.trim(), "Run pnpm simulators:setup-appium."));
    if (wantsIos) checks.push(check("XCUITest driver", new RegExp(`xcuitest@${TOOL_VERSIONS.xcuitest.replaceAll(".", "\\.")}`).test(driverOutput), driverOutput.trim(), "Run pnpm simulators:setup-appium."));
  }
  checks.push(check("preview port 4173", portIsFree(4173), "127.0.0.1:4173", "Stop the existing process on port 4173 before starting a simulator run."));
  checks.push(check("Appium port 4723", portIsFree(4723), "127.0.0.1:4723", "Stop the existing process on port 4723 before starting a simulator run."));

  const requiredFailures = checks.filter(({ ok, required }) => required && !ok);
  return {
    ok: requiredFailures.length === 0,
    host: { platform: platform(), arch: arch() },
    paths: { androidHome: ANDROID_HOME, androidAvdHome: ANDROID_AVD_HOME, javaHome: ANDROID_JAVA_HOME, appiumHome: APPIUM_HOME },
    profiles: SIMULATOR_PROFILES.map(({ id, platform: family }) => ({ id, platform: family })),
    checks,
    requiredFailures: requiredFailures.map(({ name, remediation }) => ({ name, remediation })),
  };
}

async function main() {
  const { platformName, requestedProfile } = parseSelectionArgs(process.argv.slice(2), { booleanFlags: ["--json"] });
  const report = await runDoctor({ platformName, requestedProfile });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Mobile simulator doctor (${report.host.platform}/${report.host.arch})`);
    for (const item of report.checks) {
      console.log(`${item.ok ? "PASS" : item.required ? "FAIL" : "INFO"}  ${item.name}: ${item.detail}`);
      if (item.remediation) console.log(`      Fix: ${item.remediation}`);
    }
    console.log(report.ok ? "\nReady for the selected simulator matrix." : `\n${report.requiredFailures.length} required prerequisite(s) remain.`);
  }
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`Simulator doctor selection error: ${error.message}`);
    process.exitCode = 2;
  }
}
