export const ANDROID_CHROME_PACKAGE = "com.android.chrome";

function chromeMajor(version) {
  const match = String(version ?? "").match(/^(\d+)(?:\.|$)/);
  return match ? Number(match[1]) : null;
}

function normalizeSetting(value) {
  const normalized = String(value ?? "").trim();
  return !normalized || normalized === "null" || normalized === "undefined" ? null : normalized;
}

function waitForDebuggerEnabled(value) {
  const normalized = normalizeSetting(value);
  return normalized !== null && !["0", "false"].includes(normalized.toLowerCase());
}

function checked(executeShell, args) {
  const result = executeShell(args);
  if (result.status !== 0) {
    throw new Error(`adb shell ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout || "no output"}`);
  }
  return result;
}

export function resolveAndroidChromeWorkaround(profile, chromeVersion) {
  const declaration = profile.platform === "android" ? profile.androidChromeWorkaround : null;
  const major = chromeMajor(chromeVersion);
  const required = Boolean(declaration && major !== null && declaration.chromeMajorVersions.includes(major));
  return {
    required,
    chromeVersion: chromeVersion ?? null,
    chromeMajor: major,
    args: required ? [...declaration.args] : [],
  };
}

export function inspectAndroidChromeDebugState(executeShell) {
  const debugApp = normalizeSetting(checked(executeShell, ["settings", "get", "global", "debug_app"]).stdout);
  const waitForDebugger = waitForDebuggerEnabled(checked(executeShell, ["settings", "get", "global", "wait_for_debugger"]).stdout);
  return { debugApp, waitForDebugger };
}

export function diagnoseAndroidChromeDebugState(profile, chromeVersion, state) {
  const workaround = resolveAndroidChromeWorkaround(profile, chromeVersion);
  if (!workaround.required) return { ok: true, workaround, disposition: "not-required" };
  if (state.waitForDebugger) {
    return {
      ok: false,
      workaround,
      disposition: "conflict",
      message: `wait_for_debugger is enabled; clear the existing debug state with "adb shell am clear-debug-app" before running ${profile.id}`,
    };
  }
  if (state.debugApp && state.debugApp !== ANDROID_CHROME_PACKAGE) {
    return {
      ok: false,
      workaround,
      disposition: "conflict",
      message: `debug_app is ${state.debugApp}, not ${ANDROID_CHROME_PACKAGE}; clear or restore that owner before running ${profile.id}`,
    };
  }
  return {
    ok: true,
    workaround,
    disposition: state.debugApp === ANDROID_CHROME_PACKAGE ? "pre-existing-compatible" : "available",
  };
}

export function prepareAndroidChrome({ profile, chromeVersion, executeShell }) {
  const workaround = resolveAndroidChromeWorkaround(profile, chromeVersion);
  const baseMetadata = {
    required: workaround.required,
    applied: false,
    preExisting: false,
    chromeVersion: workaround.chromeVersion,
    chromeMajor: workaround.chromeMajor,
    args: workaround.args,
  };
  if (!workaround.required) {
    return { metadata: { ...baseMetadata, state: "not-required" }, ownership: { appliedByRun: false } };
  }

  const state = inspectAndroidChromeDebugState(executeShell);
  const diagnosis = diagnoseAndroidChromeDebugState(profile, chromeVersion, state);
  if (!diagnosis.ok) throw new Error(`Android Chrome WebGL preparation conflict: ${diagnosis.message}`);

  const preExisting = diagnosis.disposition === "pre-existing-compatible";
  let appliedByRun = false;
  try {
    if (!preExisting) {
      checked(executeShell, ["am", "set-debug-app", "--persistent", ANDROID_CHROME_PACKAGE]);
      appliedByRun = true;
    }
    checked(executeShell, ["am", "force-stop", ANDROID_CHROME_PACKAGE]);
  } catch (error) {
    if (appliedByRun) {
      try { checked(executeShell, ["am", "clear-debug-app"]); } catch { /* preserve the original preparation error */ }
    }
    throw error;
  }

  return {
    metadata: {
      ...baseMetadata,
      applied: appliedByRun,
      preExisting,
      state: preExisting ? "pre-existing-compatible" : "applied-by-run",
    },
    ownership: { appliedByRun },
  };
}

export function cleanupAndroidChrome({ ownership, executeShell }) {
  if (!ownership?.appliedByRun) return { state: "not-owned", cleared: false };
  const state = inspectAndroidChromeDebugState(executeShell);
  if (state.debugApp === null && !state.waitForDebugger) return { state: "already-clear", cleared: false };
  if (state.debugApp !== ANDROID_CHROME_PACKAGE || state.waitForDebugger) {
    return { state: "ownership-state-changed", cleared: false };
  }
  checked(executeShell, ["am", "clear-debug-app"]);
  return { state: "cleared-run-owned", cleared: true };
}
