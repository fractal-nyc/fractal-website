import { closeSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import {
  ANDROID_HOME,
  ANDROID_JAVA_HOME,
  APPIUM_HOME,
  EVIDENCE_ROOT,
  REPO_ROOT,
  buildAndroidEmulatorLaunchArgs,
  parseSelectionArgs,
  profilesFor,
} from "./config.mjs";
import { runDoctor } from "./doctor.mjs";
import { validateAndroidRuntimeIdentity, validateAppleDeviceIdentity } from "./identity.mjs";
import { runSimulatorSuite } from "./suite.mjs";
import { cleanupAndroidChrome, prepareAndroidChrome } from "./android-chrome.mjs";

let selection;
try {
  selection = parseSelectionArgs(process.argv.slice(2));
} catch (error) {
  console.error(`Simulator run selection error: ${error.message}`);
  process.exit(2);
}
const { platformName, requestedProfile } = selection;
const profiles = profilesFor(platformName, requestedProfile);
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const runRoot = join(EVIDENCE_ROOT, runId);
const children = new Set();
const startedDevices = [];
const logDescriptors = [];
const androidEnv = { ...process.env, ANDROID_HOME, ANDROID_SDK_ROOT: ANDROID_HOME, JAVA_HOME: ANDROID_JAVA_HOME };

function command(commandName, args, { env = process.env, allowFailure = false, timeout = 30_000 } = {}) {
  const result = spawnSync(commandName, args, { cwd: REPO_ROOT, env, encoding: "utf8", timeout });
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${commandName} ${args.join(" ")} failed (${result.status ?? result.error?.message}):\n${result.stderr || result.stdout}`);
  }
  return { status: result.status, stdout: result.stdout?.trim() ?? "", stderr: result.stderr?.trim() ?? "" };
}

function startProcess(name, commandName, args, env = process.env) {
  const descriptor = openSync(join(runRoot, `${name}.log`), "a");
  logDescriptors.push(descriptor);
  const child = spawn(commandName, args, { cwd: REPO_ROOT, env, stdio: ["ignore", descriptor, descriptor] });
  child.__simulatorName = name;
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

async function waitFor(predicate, label, timeout = 120_000, interval = 1_000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, interval));
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

async function waitForHttp(url, label, timeout = 60_000) {
  await waitFor(async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  }, label, timeout, 500);
}

async function terminateChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => child.once("exit", resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
  ]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
}

function androidTool(relativePath) {
  return join(ANDROID_HOME, relativePath);
}

function runningAndroidAvds() {
  const adb = androidTool("platform-tools/adb");
  const devices = command(adb, ["devices"], { env: androidEnv, allowFailure: true }).stdout
    .split(/\r?\n/)
    .map((line) => line.match(/^(emulator-\d+)\s+device$/)?.[1])
    .filter(Boolean);
  return devices.flatMap((serial) => {
    const name = command(adb, ["-s", serial, "emu", "avd", "name"], { env: androidEnv, allowFailure: true }).stdout.split(/\r?\n/)[0];
    return name ? [{ serial, name }] : [];
  });
}

async function bootAndroid(profile) {
  const adb = androidTool("platform-tools/adb");
  const emulator = androidTool("emulator/emulator");
  const existing = runningAndroidAvds().find(({ name }) => name === profile.avdName);
  let serial = existing?.serial ?? `emulator-${profile.emulatorPort}`;
  let child = null;
  if (!existing) {
    child = startProcess(
      `emulator-${profile.id}`,
      emulator,
      buildAndroidEmulatorLaunchArgs(profile),
      androidEnv,
    );
    startedDevices.push({ platform: "android", serial, child });
  }
  await waitFor(() => command(adb, ["-s", serial, "shell", "getprop", "sys.boot_completed"], { env: androidEnv, allowFailure: true, timeout: 5_000 }).stdout === "1", `${profile.avdName} boot`, 240_000, 2_000);
  command(adb, ["-s", serial, "wait-for-device"], { env: androidEnv });
  const getprop = (key) => command(adb, ["-s", serial, "shell", "getprop", key], { env: androidEnv }).stdout;
  const shell = (...args) => command(adb, ["-s", serial, "shell", ...args], { env: androidEnv, allowFailure: true }).stdout;
  const chromeDump = shell("dumpsys", "package", "com.android.chrome");
  const actualAvdName = command(adb, ["-s", serial, "emu", "avd", "name"], { env: androidEnv }).stdout.split(/\r?\n/)[0];
  const identity = {
    serial,
    avdName: actualAvdName,
    api: getprop("ro.build.version.sdk"),
    androidRelease: getprop("ro.build.version.release"),
    abi: getprop("ro.product.cpu.abi"),
    fingerprint: getprop("ro.build.fingerprint"),
    model: getprop("ro.product.model"),
    wmSize: shell("wm", "size").replace(/\r?\n/g, "; "),
    wmDensity: shell("wm", "density").replace(/\r?\n/g, "; "),
    navigationMode: shell("settings", "get", "secure", "navigation_mode"),
    chromeVersion: chromeDump.match(/versionName=([^\s]+)/)?.[1] ?? null,
    systemImage: getprop("ro.system.build.fingerprint"),
    playStorePackagePath: shell("pm", "path", "com.android.vending"),
    wasAlreadyBooted: Boolean(existing),
  };
  if (!identity.chromeVersion) throw new Error(`Chrome is unavailable on ${profile.avdName}. Boot it interactively and complete Chrome's first-run flow.`);
  const validation = validateAndroidRuntimeIdentity(profile, identity);
  if (!validation.ok) throw new Error(`Android runtime identity mismatch for ${profile.id}:\n- ${validation.violations.join("\n- ")}`);
  return identity;
}

function availableAppleDevices() {
  const result = command("xcrun", ["simctl", "list", "devices", "available", "--json"]);
  const groups = JSON.parse(result.stdout).devices;
  return Object.entries(groups).flatMap(([runtime, devices]) => devices.map((device) => ({ runtime, ...device })));
}

function applePlatformVersion(runtime) {
  const match = runtime.match(/\.iOS-([0-9-]+)$/);
  return match ? match[1].replaceAll("-", ".") : null;
}

async function bootApple(profile) {
  const matches = availableAppleDevices().filter(({ name }) => name === profile.deviceName);
  if (!matches.length) throw new Error(`No available CoreSimulator named "${profile.deviceName}". Run pnpm simulators:doctor for the creation guidance.`);
  const validMatches = matches.filter((device) => validateAppleDeviceIdentity(profile, device).ok);
  if (!validMatches.length) {
    const details = matches.map((device) => validateAppleDeviceIdentity(profile, device).violations.join("; ")).join(" | ");
    throw new Error(`CoreSimulator identity mismatch for ${profile.id}: ${details}`);
  }
  const device = validMatches.sort((a, b) => b.runtime.localeCompare(a.runtime, undefined, { numeric: true }))[0];
  const wasAlreadyBooted = device.state === "Booted";
  if (!wasAlreadyBooted) {
    command("xcrun", ["simctl", "boot", device.udid]);
    startedDevices.push({ platform: "ios", udid: device.udid });
  }
  command("xcrun", ["simctl", "bootstatus", device.udid, "-b"], { timeout: 180_000 });
  const safari = command("xcrun", ["simctl", "get_app_container", device.udid, "com.apple.mobilesafari"], { allowFailure: true });
  if (safari.status !== 0) throw new Error(`Mobile Safari is unavailable in ${profile.deviceName}. Boot it once and clear first-run screens.`);
  return {
    udid: device.udid,
    deviceName: device.name,
    deviceTypeIdentifier: device.deviceTypeIdentifier ?? null,
    runtime: device.runtime,
    platformVersion: applePlatformVersion(device.runtime),
    state: "Booted",
    wasAlreadyBooted,
  };
}

async function cleanup() {
  for (const device of startedDevices.reverse()) {
    if (device.platform === "android") {
      command(androidTool("platform-tools/adb"), ["-s", device.serial, "emu", "kill"], { env: androidEnv, allowFailure: true });
      await terminateChild(device.child);
    } else {
      command("xcrun", ["simctl", "shutdown", device.udid], { allowFailure: true });
    }
  }
  for (const child of [...children]) await terminateChild(child);
  for (const descriptor of logDescriptors) {
    try { closeSync(descriptor); } catch { /* already closed */ }
  }
}

mkdirSync(runRoot, { recursive: true });
const summary = { runId, platform: platformName, profiles: profiles.map(({ id }) => id), startedAt: new Date().toISOString(), results: [] };
writeFileSync(join(runRoot, "run.json"), JSON.stringify(summary, null, 2));

try {
  const doctor = await runDoctor({ platformName, requestedProfile });
  writeFileSync(join(runRoot, "doctor.json"), JSON.stringify(doctor, null, 2));
  if (!doctor.ok) {
    const fixes = doctor.requiredFailures.map(({ name, remediation }) => `- ${name}: ${remediation}`).join("\n");
    throw new Error(`Simulator prerequisites are incomplete:\n${fixes}\nRun pnpm simulators:doctor for the full inventory.`);
  }

  command("pnpm", ["build"], { timeout: 120_000 });
  const preview = startProcess("vite-preview", "pnpm", ["exec", "vite", "preview", "--host", "0.0.0.0", "--port", "4173", "--strictPort"]);
  await waitForHttp("http://127.0.0.1:4173/", "Vite production preview");
  const appium = startProcess(
    "appium",
    resolve(REPO_ROOT, "node_modules/.bin/appium"),
    ["--address", "127.0.0.1", "--port", "4723", "--base-path", "/", "--allow-insecure", "uiautomator2:chromedriver_autodownload"],
    { ...process.env, APPIUM_HOME, ANDROID_HOME, ANDROID_SDK_ROOT: ANDROID_HOME, JAVA_HOME: ANDROID_JAVA_HOME },
  );
  await waitForHttp("http://127.0.0.1:4723/status", "Appium server");
  if (preview.exitCode !== null) throw new Error("Vite preview exited during startup; inspect vite-preview.log");
  if (appium.exitCode !== null) throw new Error("Appium exited during startup; inspect appium.log");

  for (const profile of profiles) {
    const identity = profile.platform === "android" ? await bootAndroid(profile) : await bootApple(profile);
    const baseUrl = profile.platform === "android" ? "http://10.0.2.2:4173" : "http://127.0.0.1:4173";
    const profileDir = join(runRoot, profile.id);
    const executeAndroidShell = profile.platform === "android"
      ? (args) => command(androidTool("platform-tools/adb"), ["-s", identity.serial, "shell", ...args], { env: androidEnv, allowFailure: true })
      : null;
    let chromePreparation = null;
    let profileResult = null;
    let profileError = null;
    try {
      if (profile.platform === "android") {
        chromePreparation = prepareAndroidChrome({
          profile,
          chromeVersion: identity.chromeVersion,
          executeShell: executeAndroidShell,
        });
      }
      const result = await runSimulatorSuite({
        profile,
        identity,
        baseUrl,
        evidenceDir: profileDir,
        androidChromeWorkaround: chromePreparation?.metadata ?? null,
      });
      profileResult = { profile: profile.id, result: result.result, manifest: join(profileDir, "manifest.json") };
    } catch (error) {
      profileError = error;
      profileResult = { profile: profile.id, result: "failed", message: error.message, manifest: join(profileDir, "manifest.json") };
    } finally {
      if (chromePreparation) {
        try {
          chromePreparation.metadata.cleanup = cleanupAndroidChrome({
            ownership: chromePreparation.ownership,
            executeShell: executeAndroidShell,
          }).state;
        } catch (cleanupError) {
          chromePreparation.metadata.cleanup = "failed";
          chromePreparation.metadata.cleanupError = cleanupError.message;
          if (!profileError) profileError = cleanupError;
        }
        profileResult.androidChromeWorkaround = chromePreparation.metadata;
      }
      const started = startedDevices.find((device) => device.platform === profile.platform && (device.serial === identity.serial || device.udid === identity.udid));
      if (started) {
        if (started.platform === "android") {
          command(androidTool("platform-tools/adb"), ["-s", started.serial, "emu", "kill"], { env: androidEnv, allowFailure: true });
          await terminateChild(started.child);
        } else {
          command("xcrun", ["simctl", "shutdown", started.udid], { allowFailure: true });
        }
        startedDevices.splice(startedDevices.indexOf(started), 1);
      }
    }
    summary.results.push(profileResult);
    writeFileSync(join(runRoot, "run.json"), JSON.stringify(summary, null, 2));
    if (profileError) throw profileError;
  }
  summary.result = "passed";
} catch (error) {
  summary.result = "failed";
  summary.error = { message: error.message, stack: error.stack };
  process.exitCode = 1;
  console.error(error.message);
} finally {
  summary.finishedAt = new Date().toISOString();
  writeFileSync(join(runRoot, "run.json"), JSON.stringify(summary, null, 2));
  await cleanup();
  console.log(`Simulator evidence: ${runRoot}`);
}
