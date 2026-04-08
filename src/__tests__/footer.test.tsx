import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// ═══════════════════════════════════════════════════════════════════════════
// Mock MandelbrotIcon — renders a lightweight SVG placeholder
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/house/MandelbrotIcon", () => ({
  MandelbrotIcon: ({ size }: { size: number }) => (
    <svg data-testid="mandelbrot-icon" width={size} height={size} />
  ),
}));

import { Footer } from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════════════════
// Footer content and structure
// ═══════════════════════════════════════════════════════════════════════════

describe("Footer", () => {
  it("should render without crashing", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeTruthy();
  });

  // ═════════════════════════════════════════════════════════════════════
  // FRAC-88 regression: Footer branding uses "Fractal" in camelCase,
  // NOT "FRACTAL" in all-caps. This was fixed and must stay fixed.
  // ═════════════════════════════════════════════════════════════════════

  describe("Branding text (FRAC-88 regression)", () => {
    it('should display "Fractal" in camelCase — not "FRACTAL" in all-caps', () => {
      render(<Footer />);
      // The large branding text should be "Fractal" (capital F, lowercase ractal)
      const brandingElements = screen.getAllByText("Fractal");
      expect(brandingElements.length).toBeGreaterThanOrEqual(1);

      // Verify none of them say "FRACTAL" (all-caps)
      const allText = document.querySelector("footer")!.textContent;
      expect(allText).not.toContain("FRACTAL");
    });

    it("should render branding text with italic styling", () => {
      const { container } = render(<Footer />);
      // The branding div has class "italic"
      const brandingDiv = container.querySelector(".italic");
      expect(brandingDiv).toBeTruthy();
      expect(brandingDiv!.textContent).toContain("Fractal");
    });

    it("should use Jacquard 24 font for the branding", () => {
      const { container } = render(<Footer />);
      const brandingDiv = container.querySelector(".italic");
      expect(brandingDiv).toBeTruthy();
      expect(brandingDiv!.getAttribute("style")).toContain("Jacquard 24");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // Discord CTA
  // ═════════════════════════════════════════════════════════════════════

  describe("Discord CTA", () => {
    it("should contain a link to Discord", () => {
      render(<Footer />);
      const discordLink = screen.getByText("Discord");
      expect(discordLink.closest("a")).toBeTruthy();
      expect(discordLink.closest("a")!.getAttribute("href")).toContain("discord.com");
    });

    it('should mention #intros channel', () => {
      render(<Footer />);
      expect(screen.getByText("#intros")).toBeTruthy();
    });

    it("should open Discord link in a new tab", () => {
      render(<Footer />);
      const discordLink = screen.getByText("Discord").closest("a");
      expect(discordLink!.getAttribute("target")).toBe("_blank");
      expect(discordLink!.getAttribute("rel")).toContain("noopener");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // Contact and location info
  // ═════════════════════════════════════════════════════════════════════

  describe("Contact and location", () => {
    it('should display "New York City"', () => {
      render(<Footer />);
      expect(screen.getByText("New York City")).toBeTruthy();
    });

    it("should display the email address hello@fractalnyc.com", () => {
      render(<Footer />);
      const emailLink = screen.getByText("hello@fractalnyc.com");
      expect(emailLink).toBeTruthy();
      expect(emailLink.closest("a")!.getAttribute("href")).toBe("mailto:hello@fractalnyc.com");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // Visual styling — black background, white text
  // ═════════════════════════════════════════════════════════════════════

  describe("Visual styling", () => {
    it("should use dark background with light text (bg-foreground text-background)", () => {
      const { container } = render(<Footer />);
      const ctaSection = container.querySelector(".bg-foreground.text-background");
      expect(ctaSection).toBeTruthy();
    });

    it("should have the branding band with bg-foreground", () => {
      const { container } = render(<Footer />);
      // There are two sections with bg-foreground
      const bgForegroundSections = container.querySelectorAll(".bg-foreground");
      expect(bgForegroundSections.length).toBeGreaterThanOrEqual(2);
    });

    it('should display "New York City Collective" tagline', () => {
      render(<Footer />);
      expect(screen.getByText("New York City Collective")).toBeTruthy();
    });

    it("should display copyright with current year", () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear().toString();
      const footer = document.querySelector("footer")!;
      expect(footer.textContent).toContain(currentYear);
      expect(footer.textContent).toContain("Fractal Collective");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // Mandelbrot decorations
  // ═════════════════════════════════════════════════════════════════════

  describe("Mandelbrot decorations", () => {
    it("should include Mandelbrot corner accents", () => {
      const { container } = render(<Footer />);
      const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
      // 1 watermark center + 4 corner accents = 5 total
      expect(icons.length).toBeGreaterThanOrEqual(5);
    });
  });
});
