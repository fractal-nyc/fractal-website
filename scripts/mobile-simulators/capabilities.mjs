import { resolveAndroidChromeWorkaround } from "./android-chrome.mjs";

export function buildWebdriverCapabilities({ profile, identity, baseUrl }) {
  if (profile.platform === "android") {
    const workaround = resolveAndroidChromeWorkaround(profile, identity.chromeVersion);
    return {
      platformName: "Android",
      browserName: "Chrome",
      "appium:automationName": "UiAutomator2",
      "appium:udid": identity.serial,
      "appium:noReset": true,
      "appium:newCommandTimeout": 300,
      "appium:chromedriverAutodownload": true,
      "appium:orientation": "PORTRAIT",
      "goog:loggingPrefs": { browser: "ALL" },
      ...(workaround.required ? { "goog:chromeOptions": { args: workaround.args } } : {}),
    };
  }

  return {
    platformName: "iOS",
    browserName: "Safari",
    "appium:automationName": "XCUITest",
    "appium:udid": identity.udid,
    "appium:deviceName": identity.deviceName,
    "appium:platformVersion": identity.platformVersion,
    "appium:noReset": true,
    "appium:newCommandTimeout": 300,
    "appium:orientation": "PORTRAIT",
    "appium:safariInitialUrl": `${baseUrl}/`,
  };
}
