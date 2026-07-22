export function parseIni(text) {
  return Object.fromEntries(text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }));
}

export function normalizeSystemImagePackage(value = "") {
  if (!value) return "";
  return value
    .replace(/^system-images[;/\\]/, "")
    .replace(/[\\/]+/g, ";")
    .replace(/;+$/, "")
    .replace(/^/, "system-images;");
}

function configuredSize(config) {
  const width = Number(config["hw.lcd.width"]);
  const height = Number(config["hw.lcd.height"]);
  if (width > 0 && height > 0) return `${Math.min(width, height)}x${Math.max(width, height)}`;
  const skinSize = config["skin.name"]?.match(/(\d+)x(\d+)/);
  return skinSize ? `${Math.min(Number(skinSize[1]), Number(skinSize[2]))}x${Math.max(Number(skinSize[1]), Number(skinSize[2]))}` : null;
}

export function normalizeWmSize(value = "") {
  const match = value.match(/Override size:\s*(\d+)x(\d+)/i)
    || value.match(/Physical size:\s*(\d+)x(\d+)/i)
    || value.match(/\b(\d+)x(\d+)\b/);
  return match ? `${Math.min(Number(match[1]), Number(match[2]))}x${Math.max(Number(match[1]), Number(match[2]))}` : null;
}

export function normalizeWmDensity(value = "") {
  const match = value.match(/Override density:\s*(\d+)/i)
    || value.match(/Physical density:\s*(\d+)/i)
    || value.match(/\b(\d+)\b/);
  return match ? Number(match[1]) : null;
}

export function validateAndroidAvdConfig(profile, config) {
  const violations = [];
  const actualPackage = normalizeSystemImagePackage(config["image.sysdir.1"] || "");
  const actualApi = config["android.api"] || config.target?.match(/android-(\d+)/)?.[1] || actualPackage.match(/android-(\d+)/)?.[1] || null;
  const actualAbi = config["abi.type"] || config["hw.cpu.arch"] || actualPackage.split(";").at(-1) || null;
  const actualSize = configuredSize(config);
  const actualDensity = Number(config["hw.lcd.density"]) || null;
  const expectedSize = normalizeWmSize(profile.expectedWmSize);

  if (actualPackage !== profile.systemImagePackage) violations.push(`system image must be ${profile.systemImagePackage}, got ${actualPackage || "missing"}`);
  if (`${actualApi}` !== `${profile.api}`) violations.push(`API must be ${profile.api}, got ${actualApi || "missing"}`);
  if (actualAbi !== profile.abi) violations.push(`ABI must be ${profile.abi}, got ${actualAbi || "missing"}`);
  if (actualSize !== expectedSize) violations.push(`LCD size must be ${expectedSize}, got ${actualSize || "missing"}`);
  if (actualDensity !== profile.expectedWmDensity) violations.push(`LCD density must be ${profile.expectedWmDensity}, got ${actualDensity || "missing"}`);

  return {
    ok: violations.length === 0,
    violations,
    actual: { systemImagePackage: actualPackage, api: actualApi, abi: actualAbi, size: actualSize, density: actualDensity },
  };
}

export function validateAndroidRuntimeIdentity(profile, identity) {
  const violations = [];
  const actualSize = normalizeWmSize(identity.wmSize);
  const actualDensity = normalizeWmDensity(identity.wmDensity);
  if (!identity.serial?.startsWith("emulator-")) violations.push(`ADB target must be emulator-*, got ${identity.serial || "missing"}`);
  if (identity.avdName !== profile.avdName) violations.push(`AVD must be ${profile.avdName}, got ${identity.avdName || "missing"}`);
  if (`${identity.api}` !== `${profile.api}`) violations.push(`API must be ${profile.api}, got ${identity.api || "missing"}`);
  if (identity.abi !== profile.abi) violations.push(`ABI must be ${profile.abi}, got ${identity.abi || "missing"}`);
  if (actualSize !== normalizeWmSize(profile.expectedWmSize)) violations.push(`runtime size must be ${normalizeWmSize(profile.expectedWmSize)}, got ${actualSize || "missing"}`);
  if (actualDensity !== profile.expectedWmDensity) violations.push(`runtime density must be ${profile.expectedWmDensity}, got ${actualDensity || "missing"}`);
  if (!/google/i.test(identity.fingerprint || "")) violations.push(`runtime fingerprint must identify a Google image, got ${identity.fingerprint || "missing"}`);
  return { ok: violations.length === 0, violations, actual: { size: actualSize, density: actualDensity } };
}

export function validateAppleDeviceIdentity(profile, device, availableRuntimeIds = []) {
  const violations = [];
  if (!device) return { ok: false, violations: ["device is missing"] };
  if (device.name !== profile.deviceName) violations.push(`name must be ${profile.deviceName}, got ${device.name || "missing"}`);
  if (!profile.deviceTypePattern.test(device.deviceTypeIdentifier || "")) violations.push(`device type must match ${profile.deviceTypeHint}, got ${device.deviceTypeIdentifier || "missing"}`);
  if (!profile.runtimePattern.test(device.runtime || "")) violations.push(`runtime must be an iOS CoreSimulator runtime, got ${device.runtime || "missing"}`);
  if (availableRuntimeIds.length && !availableRuntimeIds.includes(device.runtime)) violations.push(`runtime ${device.runtime || "missing"} is not installed and available`);
  return { ok: violations.length === 0, violations };
}
