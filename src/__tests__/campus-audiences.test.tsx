import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// Mock the MandelbrotIcon so the four cards' corner decorations are countable
// without rendering the full SVG (same pattern as buttons.test.tsx).
vi.mock("@/components/house/MandelbrotIcon", () => ({
  MandelbrotIcon: ({ size, opacity }: { size: number; opacity: number }) => (
    <svg data-testid="mandelbrot-icon" width={size} height={size} opacity={opacity} />
  ),
}));

import { CampusPage } from "@/pages/CampusPage";

const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";

function renderCampus() {
  const { hook } = memoryLocation({ path: "/campus", static: true });
  return render(
    <WouterRouter hook={hook}>
      <CampusPage />
    </WouterRouter>,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-7 — audience cards
// ═══════════════════════════════════════════════════════════════════════════

describe("Campus — audience cards", () => {
  it("links the Members card to the full-time membership onboarding", () => {
    renderCampus();
    const members = screen.getByText("Members").closest("a");
    expect(members).toBeTruthy();
    expect(members!.getAttribute("href")).toBe(STRIPE_FULLTIME_URL);
    expect(members!.getAttribute("target")).toBe("_blank");
    expect(members!.getAttribute("rel")).toContain("noopener");
  });

  it("styles the 01–04 eyebrow numerals with the .text-label token (no gold)", () => {
    renderCampus();
    for (const num of ["01", "02", "03", "04"]) {
      const span = screen.getByText(num);
      expect(span.className).toContain("text-label");
      // Gold was applied via an inline style; the retoken removes it.
      expect(span.getAttribute("style")).toBeNull();
    }
  });

  it("renders the frosted-Button chrome (4 Mandelbrot corners) on every card", () => {
    renderCampus();
    // Scope per card — the page's Button CTAs also render corner Mandelbrots,
    // so a page-wide count would be ambiguous.
    const titles = [
      "Accelerator participants",
      "Fractal U students",
      "Members",
      "Guests",
    ];
    for (const title of titles) {
      const card = screen.getByText(title).closest("a");
      expect(card).toBeTruthy();
      expect(within(card!).getAllByTestId("mandelbrot-icon")).toHaveLength(4);
    }
  });

  it("gives each audience card the cream-frost hover recipe", () => {
    renderCampus();
    const card = screen.getByText("Accelerator participants").closest("a");
    expect(card).toBeTruthy();
    expect(card!.className).toContain("hover:bg-[var(--btn-fill");
    expect(card!.className).toContain("hover:text-[var(--btn-text");
    expect(card!.className).toContain("[border-color:var(--accent,currentColor)]");
  });
});
