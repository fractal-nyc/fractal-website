const DEFAULT_SCALE_TOLERANCE = 0.02;

export const ANDROID_CHROME_TOOLBAR_SELECTOR = '//*[@resource-id="com.android.chrome:id/toolbar"]';

export function nativeWebViewSelector(platform) {
  return platform === "android"
    ? '//*[@class="android.webkit.WebView"]'
    : '//*[@type="XCUIElementTypeWebView"]';
}

function assertPositiveNumber(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number, got ${value}`);
  }
}

function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number, got ${value}`);
  }
}

function relativeDifference(actual, expected) {
  return Math.abs(actual - expected) / expected;
}

function assertNativeRectWithinWindow(nativeRect, nativeWindow, label) {
  const rectRight = nativeRect.x + nativeRect.width;
  const rectBottom = nativeRect.y + nativeRect.height;
  if (nativeRect.x < 0 || nativeRect.y < 0 || rectRight > nativeWindow.width + 1 || rectBottom > nativeWindow.height + 1) {
    throw new Error(`${label} is outside the native window: ${JSON.stringify({ nativeRect, nativeWindow })}`);
  }
}

export function createAndroidChromeViewportRect({
  toolbarRect,
  nativeWindow,
  cssViewport,
  cssScreen,
  dpr,
  scaleTolerance = DEFAULT_SCALE_TOLERANCE,
}) {
  for (const [label, value] of [
    ["toolbarRect.x", toolbarRect?.x],
    ["toolbarRect.y", toolbarRect?.y],
  ]) assertFiniteNumber(value, label);
  for (const [label, value] of [
    ["toolbarRect.width", toolbarRect?.width],
    ["toolbarRect.height", toolbarRect?.height],
    ["nativeWindow.width", nativeWindow?.width],
    ["nativeWindow.height", nativeWindow?.height],
    ["cssViewport.width", cssViewport?.width],
    ["cssViewport.height", cssViewport?.height],
    ["cssViewport.scale", cssViewport?.scale],
    ["cssScreen.width", cssScreen?.width],
    ["cssScreen.height", cssScreen?.height],
    ["dpr", dpr],
    ["scaleTolerance", scaleTolerance],
  ]) assertPositiveNumber(value, label);
  assertNativeRectWithinWindow(toolbarRect, nativeWindow, "Android Chrome toolbar rect");

  const scale = dpr * cssViewport.scale;
  const expectedScaleX = (nativeWindow.width / cssScreen.width) * cssViewport.scale;
  const expectedScaleY = (nativeWindow.height / cssScreen.height) * cssViewport.scale;
  const scaleViolations = [
    ["horizontal", scale, expectedScaleX],
    ["vertical", scale, expectedScaleY],
    ["viewport width", cssViewport.width * scale, nativeWindow.width],
    ["toolbar width", toolbarRect.width, nativeWindow.width],
  ].filter(([, actual, expected]) => relativeDifference(actual, expected) > scaleTolerance);
  if (toolbarRect.x > 1 || scaleViolations.length) {
    throw new Error(`Android Chrome toolbar does not establish a valid viewport scale: ${scaleViolations.map(([axis, actual, expected]) => `${axis} ${actual.toFixed(4)} vs ${expected.toFixed(4)}`).join("; ") || `toolbar x ${toolbarRect.x}`}`);
  }

  const nativeRect = {
    x: 0,
    y: toolbarRect.y + toolbarRect.height,
    width: nativeWindow.width,
    height: cssViewport.height * scale,
  };
  assertNativeRectWithinWindow(nativeRect, nativeWindow, "Derived Android Chrome viewport rect");
  return nativeRect;
}

export function createNativeWebViewTransform({
  nativeRect,
  nativeWindow,
  cssViewport,
  cssScreen,
  scaleTolerance = DEFAULT_SCALE_TOLERANCE,
}) {
  for (const [label, value] of [
    ["nativeRect.x", nativeRect?.x],
    ["nativeRect.y", nativeRect?.y],
    ["cssViewport.offsetLeft", cssViewport?.offsetLeft],
    ["cssViewport.offsetTop", cssViewport?.offsetTop],
  ]) assertFiniteNumber(value, label);
  for (const [label, value] of [
    ["nativeRect.width", nativeRect?.width],
    ["nativeRect.height", nativeRect?.height],
    ["nativeWindow.width", nativeWindow?.width],
    ["nativeWindow.height", nativeWindow?.height],
    ["cssViewport.width", cssViewport?.width],
    ["cssViewport.height", cssViewport?.height],
    ["cssViewport.scale", cssViewport?.scale],
    ["cssScreen.width", cssScreen?.width],
    ["cssScreen.height", cssScreen?.height],
  ]) assertPositiveNumber(value, label);
  assertPositiveNumber(scaleTolerance, "scaleTolerance");

  assertNativeRectWithinWindow(nativeRect, nativeWindow, "Native WebView rect");

  const scaleX = nativeRect.width / cssViewport.width;
  const scaleY = nativeRect.height / cssViewport.height;
  const expectedScaleX = (nativeWindow.width / cssScreen.width) * cssViewport.scale;
  const expectedScaleY = (nativeWindow.height / cssScreen.height) * cssViewport.scale;
  const scaleViolations = [
    ["horizontal", scaleX, expectedScaleX],
    ["vertical", scaleY, expectedScaleY],
    ["axis consistency", scaleY, scaleX],
  ].filter(([, actual, expected]) => relativeDifference(actual, expected) > scaleTolerance);
  if (scaleViolations.length) {
    throw new Error(`Native WebView rect does not match the live CSS viewport scale: ${scaleViolations.map(([axis, actual, expected]) => `${axis} ${actual.toFixed(4)} vs ${expected.toFixed(4)}`).join("; ")}`);
  }

  const mapPoint = (point) => {
    assertFiniteNumber(point?.x, "CSS point.x");
    assertFiniteNumber(point?.y, "CSS point.y");
    const viewportX = point.x - cssViewport.offsetLeft;
    const viewportY = point.y - cssViewport.offsetTop;
    if (viewportX < 0 || viewportX > cssViewport.width || viewportY < 0 || viewportY > cssViewport.height) {
      throw new Error(`CSS point is outside the live visual viewport: ${JSON.stringify({ point, cssViewport })}`);
    }
    return {
      x: nativeRect.x + viewportX * scaleX,
      y: nativeRect.y + viewportY * scaleY,
    };
  };

  return {
    nativeRect: { ...nativeRect },
    scaleX,
    scaleY,
    expectedScaleX,
    expectedScaleY,
    mapPoint,
  };
}
