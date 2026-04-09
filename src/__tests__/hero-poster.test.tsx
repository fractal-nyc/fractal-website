import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-145: HeroPoster Suspense fallback + crossfade handoff
// ═══════════════════════════════════════════════════════════════════════════
//
// These tests lock in the contract between <Hero> and <FractalCityScene>:
// the poster paints at first render with data-poster-state="visible", and
// flips to "fading" when FractalCityScene signals `onReady`. The actual
// unmount on `transitionend` is covered by manual Slow 3G testing — jsdom
// CSS transitions are notoriously unreliable.
//
// We mock FractalCityScene so its r3f/WebGL innards never touch jsdom,
// and so we can capture the `onReady` prop and invoke it on demand.
// ═══════════════════════════════════════════════════════════════════════════

let capturedOnReady: (() => void) | undefined;

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: ({ onReady }: { onReady?: () => void }) => {
    capturedOnReady = onReady;
    return <div data-testid="fractal-city-mock" />;
  },
}));

import { Hero } from "@/components/sections/Hero";

function renderHero() {
  const { hook } = memoryLocation({ path: "/", static: true });
  return render(
    <WouterRouter hook={hook}>
      <Hero />
    </WouterRouter>,
  );
}

beforeEach(() => {
  capturedOnReady = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HeroPoster — Suspense fallback + crossfade handoff", () => {
  it("renders the poster <img> pointing at hero-poster.jpg on initial mount", async () => {
    renderHero();
    // The poster <img> has alt="" (decorative), so we query by src directly.
    const img = document.querySelector(
      'img[src$="images/hero-poster.jpg"]',
    ) as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute("aria-hidden")).toBeNull(); // the wrapper has aria-hidden, not the img
    expect(img?.getAttribute("draggable")).toBe("false");
  });

  it("starts with data-poster-state=\"visible\" before onReady fires", () => {
    renderHero();
    const poster = document.querySelector("[data-poster-state]");
    expect(poster).not.toBeNull();
    expect(poster?.getAttribute("data-poster-state")).toBe("visible");
  });

  it("flips data-poster-state to \"fading\" when FractalCityScene onReady fires", async () => {
    renderHero();
    // The lazy Suspense boundary needs to resolve before the mock mounts and
    // captures onReady. Waiting for the mock's testid handles that.
    const mock = await screen.findByTestId("fractal-city-mock");
    expect(mock).toBeTruthy();
    expect(capturedOnReady).toBeTypeOf("function");

    act(() => {
      capturedOnReady?.();
    });

    const poster = document.querySelector("[data-poster-state]");
    expect(poster?.getAttribute("data-poster-state")).toBe("fading");
  });

  it("renders the poster at mobile viewport (375px iPhone SE baseline)", () => {
    // Simulate a mobile viewport. Nothing in Hero reads innerWidth directly
    // for layout decisions, but this satisfies CLAUDE.md's mobile-assertion
    // rule and locks in that the poster mounts on mobile viewports too.
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 667,
    });

    renderHero();
    const img = document.querySelector('img[src$="images/hero-poster.jpg"]');
    expect(img).not.toBeNull();
    const poster = document.querySelector("[data-poster-state]");
    expect(poster?.getAttribute("data-poster-state")).toBe("visible");
  });
});
