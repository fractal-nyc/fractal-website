/**
 * Runner-neutral DOM probes for the responsive contract.
 *
 * Every exported function is intentionally self-contained: Playwright and
 * WebDriver serialize the function into the page, so it must not close over
 * module state. Each probe returns plain JSON instead of throwing or importing
 * a runner assertion library.
 */

export function collectEnvironmentMetrics(context = {}) {
  const lengthProbe = (value) => {
    const element = document.createElement("div");
    element.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;height:${value}`;
    document.body.append(element);
    const height = element.getBoundingClientRect().height;
    element.remove();
    return height;
  };
  const safe = document.createElement("div");
  safe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  document.body.append(safe);
  const safeStyle = getComputedStyle(safe);
  const safeArea = {
    top: parseFloat(safeStyle.paddingTop) || 0,
    right: parseFloat(safeStyle.paddingRight) || 0,
    bottom: parseFloat(safeStyle.paddingBottom) || 0,
    left: parseFloat(safeStyle.paddingLeft) || 0,
  };
  safe.remove();
  const vv = visualViewport;
  return {
    inner: { width: innerWidth, height: innerHeight },
    visualViewport: vv ? { width: vv.width, height: vv.height, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop, scale: vv.scale } : null,
    screen: { width: screen.width, height: screen.height, orientation: screen.orientation?.type ?? null },
    dpr: devicePixelRatio,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    hover: matchMedia("(hover: hover)").matches,
    pointer: matchMedia("(pointer: coarse)").matches ? "coarse" : matchMedia("(pointer: fine)").matches ? "fine" : "none",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    viewportUnits: { vh: lengthProbe("100vh"), svh: lengthProbe("100svh"), dvh: lengthProbe("100dvh") },
    safeArea,
    scroll: { x: scrollX, y: scrollY },
    url: location.href,
    timestamp: new Date().toISOString(),
    ...context,
  };
}

export function probeHorizontalOverflow() {
  const clientWidth = document.documentElement.clientWidth;
  const offenders = Array.from(document.querySelectorAll("body *"))
    .map((element) => {
      const box = element.getBoundingClientRect();
      const swiper = element.parentElement?.closest(".swiper");
      const ancestors = swiper ? [swiper].map((ancestor) => {
        const ancestorBox = ancestor.getBoundingClientRect();
        const style = getComputedStyle(ancestor);
        return `${ancestor.className}:${ancestorBox.left.toFixed(1)}..${ancestorBox.right.toFixed(1)}:${style.overflowX}`;
      }) : [];
      return {
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
        text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "",
        left: Number(box.left.toFixed(1)),
        right: Number(box.right.toFixed(1)),
        width: Number(box.width.toFixed(1)),
        ancestors,
      };
    })
    .filter(({ left, right, width }) => width > 0 && (left < -1 || right > clientWidth + 1))
    .sort((a, b) => Math.max(b.right - clientWidth, -b.left) - Math.max(a.right - clientWidth, -a.left))
    .slice(0, 12);
  const scrollOffenders = Array.from(document.querySelectorAll("body *"))
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
      text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) ?? "",
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    .filter(({ clientWidth: width, scrollWidth }) => width > 0 && scrollWidth > width + 1)
    .sort((a, b) => (b.scrollWidth - b.clientWidth) - (a.scrollWidth - a.clientWidth))
    .slice(0, 12);
  const documentOverflow = document.documentElement.scrollWidth - clientWidth;
  const bodyOverflow = document.body.scrollWidth - clientWidth;
  return {
    violations: [
      ...(documentOverflow > 1 ? [`document is ${documentOverflow}px wider than the layout viewport`] : []),
      ...(bodyOverflow > 1 ? [`body is ${bodyOverflow}px wider than the layout viewport`] : []),
    ],
    details: { document: documentOverflow, body: bodyOverflow, offenders, scrollOffenders },
  };
}

export function probePrimaryContentIntegrity() {
  const failures = Array.from(document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button, main img, main video, main canvas"))
    .filter((element) => !element.closest("[data-site-navbar]") && !element.closest("[data-hero-label]") && !element.closest(".sr-only-focusable") && !element.closest('[aria-hidden="true"]'))
    .flatMap((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0 || element.clientWidth <= 0) return [];
      const uncontainedText = !/^(IMG|VIDEO|CANVAS)$/.test(element.tagName) && style.overflowX === "visible" && element.scrollWidth > element.clientWidth + 1;
      return uncontainedText ? [{ tag: element.tagName, text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }] : [];
    });
  return { violations: failures.map((failure) => `primary content clips instead of reflowing: ${JSON.stringify(failure)}`), details: failures };
}

export function probePageGutters() {
  const failures = Array.from(document.querySelectorAll(".page-gutter")).flatMap((element) => {
    const style = getComputedStyle(element);
    const left = parseFloat(style.paddingLeft) || 0;
    const right = parseFloat(style.paddingRight) || 0;
    return left < 23 || right < 23 || left > 128 || right > 128
      ? [{ left, right, tag: element.tagName, text: element.textContent?.trim().slice(0, 60) }]
      : [];
  });
  return { violations: failures.map((failure) => `invalid computed .page-gutter: ${JSON.stringify(failure)}`), details: failures };
}

export function probeNavbarContent() {
  const navbar = document.querySelector("[data-site-navbar]")?.getBoundingClientRect();
  const desktopHome = location.pathname === "/" && innerWidth >= 1024;
  const selector = location.pathname === "/" ? "[data-hero-stage]" : "main h1, main h2, main h3, main p";
  const candidates = Array.from(document.querySelectorAll(selector))
    .filter((element) => !element.closest("[data-site-navbar]") && !element.closest("[data-hero-label]") && !element.closest(".sr-only-focusable") && !element.closest('[aria-hidden="true"]'))
    .map((element) => ({ element, box: element.getBoundingClientRect(), style: getComputedStyle(element) }))
    .filter(({ box, style }) => box.width > 0 && box.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0)
    .filter(({ style }) => style.position !== "fixed" && style.position !== "absolute")
    .sort((a, b) => a.box.top - b.box.top);
  const first = candidates.find(({ box }) => box.bottom > 0);
  const details = {
    navbar: navbar ? { top: navbar.top, bottom: navbar.bottom } : null,
    exempt: desktopHome,
    first: first ? { tag: first.element.tagName, text: first.element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80), top: first.box.top, bottom: first.box.bottom } : null,
  };
  const violations = [];
  if (navbar && !desktopHome && !first) violations.push("route does not expose a primary content owner");
  if (navbar && !desktopHome && first && first.box.top < navbar.bottom - 1) violations.push(`navbar covers primary content: ${JSON.stringify(details)}`);
  return { violations, details };
}

export function probeTouchTargets() {
  const failures = Array.from(document.querySelectorAll('[data-site-navbar] button[aria-label*="menu" i]')).flatMap((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    if (style.display === "none" || style.visibility === "hidden" || box.width <= 0 || box.height <= 0) return [];
    return box.width < 44 || box.height < 44 ? [{ label: element.getAttribute("aria-label"), width: box.width, height: box.height }] : [];
  });
  return { violations: failures.map((failure) => `mobile-menu touch target is under 44px: ${JSON.stringify(failure)}`), details: failures };
}

export function probeHeroComposition(options = {}) {
  const visibleBox = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0 || box.width <= 0 || box.height <= 0
      ? null
      : { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
  };
  const stage = visibleBox("[data-hero-stage]");
  const footer = visibleBox("[data-hero-footer]");
  const blurb = visibleBox("[data-hero-blurb]");
  const cta = visibleBox("[data-hero-cta]");
  const navbar = visibleBox("[data-site-navbar]");
  const vv = visualViewport;
  const visual = { left: vv?.offsetLeft ?? 0, top: vv?.offsetTop ?? 0, right: (vv?.offsetLeft ?? 0) + (vv?.width ?? innerWidth), bottom: (vv?.offsetTop ?? 0) + (vv?.height ?? innerHeight) };
  const compact = innerWidth < 1024;
  const violations = [];
  if (!stage) violations.push("Hero stage is not visible");
  if (compact) {
    if (!footer) violations.push("compact Hero footer is not visible");
    if (!blurb) violations.push("compact Hero blurb is not visible");
    if (!cta) violations.push("compact Hero CTA is not visible");
    if (stage && footer && stage.bottom > footer.top + 1) violations.push("Hero stage overlaps its in-flow footer");
    if (blurb && footer && (blurb.left < footer.left - 1 || blurb.right > footer.right + 1)) violations.push("Hero blurb escapes its footer owner");
    if (cta && footer && cta.bottom > footer.bottom + 1) violations.push("Hero CTA escapes its footer owner");
    if (options.requireInitialContainment && navbar && (navbar.top < visual.top - 1 || navbar.bottom > visual.bottom + 1)) violations.push("navbar does not fit the initial visual viewport");
    if (options.requireInitialContainment && footer && footer.bottom > visual.bottom + 1) violations.push("portrait Hero footer does not fit the initial visual viewport");
  } else if (footer) {
    violations.push("compact Hero footer is unexpectedly visible in the desktop composition");
  }
  return { violations, details: { compact, stage, footer, blurb, cta, navbar, visual } };
}

export function probeHeroLabelSafeZone() {
  const safe = document.querySelector("[data-hero-safe-zone]")?.getBoundingClientRect();
  if (!safe) return { violations: ["missing Hero safe zone"], details: null };
  const failures = Array.from(document.querySelectorAll("[data-hero-label]"))
    .filter((element) => getComputedStyle(element).visibility !== "hidden")
    .flatMap((element) => {
      const box = element.getBoundingClientRect();
      return box.left < safe.left - 1 || box.right > safe.right + 1
        ? [{ label: element.dataset.heroLabel, left: box.left, right: box.right, safeLeft: safe.left, safeRight: safe.right }]
        : [];
    });
  return { violations: failures.map((failure) => `projected Hero label escapes safe zone: ${JSON.stringify(failure)}`), details: failures };
}

export function probeVisualBounds() {
  const vv = visualViewport;
  return {
    left: vv?.offsetLeft ?? 0,
    top: vv?.offsetTop ?? 0,
    right: (vv?.offsetLeft ?? 0) + (vv?.width ?? innerWidth),
    bottom: (vv?.offsetTop ?? 0) + (vv?.height ?? innerHeight),
  };
}
