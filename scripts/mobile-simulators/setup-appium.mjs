import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { ANDROID_HOME, ANDROID_JAVA_HOME, APPIUM_HOME, REPO_ROOT, TOOL_VERSIONS } from "./config.mjs";

const appium = resolve(REPO_ROOT, "node_modules/.bin/appium");
const platformIndex = process.argv.indexOf("--platform");
const platformName = platformIndex >= 0 ? process.argv[platformIndex + 1] : "all";
const env = { ...process.env, APPIUM_HOME, ANDROID_HOME, ANDROID_SDK_ROOT: ANDROID_HOME, JAVA_HOME: ANDROID_JAVA_HOME };

function run(args, { allowFailure = false } = {}) {
  const result = spawnSync(appium, args, { cwd: REPO_ROOT, env, encoding: "utf8", stdio: "pipe" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (!allowFailure && result.status !== 0) {
    throw new Error(`appium ${args.join(" ")} exited ${result.status ?? "without a status"}`);
  }
  return result;
}

function exactDriverInstalled(name, version) {
  const result = run(["driver", "list", "--installed"], { allowFailure: true });
  return result.status === 0 && new RegExp(`${name}@${version.replaceAll(".", "\\.")}(?:\\s|$)`).test(`${result.stdout}\n${result.stderr}`);
}

function anyDriverInstalled(name) {
  const result = run(["driver", "list", "--installed"], { allowFailure: true });
  return result.status === 0 && new RegExp(`${name}@`).test(`${result.stdout}\n${result.stderr}`);
}

function installExact({ name, packageName, version }) {
  if (exactDriverInstalled(name, version)) {
    console.log(`${name}@${version} is already installed in ${APPIUM_HOME}`);
    return;
  }
  if (anyDriverInstalled(name)) {
    console.log(`Replacing the mismatched ${name} driver inside the ignored repository-local Appium home.`);
    run(["driver", "uninstall", name]);
  }
  run(["driver", "install", "--source=npm", `${packageName}@${version}`]);
  if (!exactDriverInstalled(name, version)) throw new Error(`${name}@${version} was not reported after installation`);
}

mkdirSync(APPIUM_HOME, { recursive: true });

const versionResult = spawnSync(appium, ["--version"], { cwd: REPO_ROOT, env, encoding: "utf8" });
if (versionResult.status !== 0) {
  throw new Error("Appium is not installed. Run pnpm install before this setup command.");
}
if (versionResult.stdout.trim() !== TOOL_VERSIONS.appium) {
  throw new Error(`Expected Appium ${TOOL_VERSIONS.appium}, found ${versionResult.stdout.trim()}. Run pnpm install --frozen-lockfile.`);
}

const drivers = [
  ...(platformName === "all" || platformName === "android" ? [{ name: "uiautomator2", packageName: "appium-uiautomator2-driver", version: TOOL_VERSIONS.uiautomator2 }] : []),
  ...(platformName === "all" || platformName === "ios" ? [{ name: "xcuitest", packageName: "appium-xcuitest-driver", version: TOOL_VERSIONS.xcuitest }] : []),
];

for (const driver of drivers) installExact(driver);

let doctorFailed = false;
for (const { name } of drivers) {
  const result = run(["driver", "doctor", name], { allowFailure: true });
  doctorFailed ||= result.status !== 0;
}

if (doctorFailed) {
  console.error("One or more driver doctors found host prerequisites that still need setup. No licenses or SDK downloads were started automatically.");
  process.exitCode = 1;
} else {
  console.log(`Pinned Appium drivers are ready in ${APPIUM_HOME}`);
}
