import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock IntersectionObserver — required by Framer Motion's whileInView
// ---------------------------------------------------------------------------

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    private callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {
    // Immediately trigger all observed elements as "intersecting" so
    // whileInView animations resolve synchronously in tests.
  }

  observe(target: Element) {
    // Fire immediately with isIntersecting: true
    const entry = {
      isIntersecting: true,
      target,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry;
    this.callback([entry], this);
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// ---------------------------------------------------------------------------
// Mock window.scrollTo — called by ScrollToTop component
// ---------------------------------------------------------------------------

globalThis.scrollTo = () => {};

// ---------------------------------------------------------------------------
// Mock matchMedia — used by responsive hooks / Radix UI
// ---------------------------------------------------------------------------

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ---------------------------------------------------------------------------
// Mock document.fonts — used by use-fonts-ready hook
// ---------------------------------------------------------------------------

Object.defineProperty(document, "fonts", {
  value: {
    ready: Promise.resolve(),
    addEventListener: () => {},
    removeEventListener: () => {},
  },
});

// ---------------------------------------------------------------------------
// Mock ResizeObserver — used by various UI components
// ---------------------------------------------------------------------------

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

