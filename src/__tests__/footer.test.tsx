import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { Footer } from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════════════════
// The Footer was rewritten. It is now a single dark band: the Jacquard
// "Fractal" wordmark, two X links, and a "Designed by Julianna" credit.
//
// GONE: the old Discord / "schedule a virtual chat with Ian" CTA band, the
// "New York City Collective" tagline, the copyright line, and the Mandelbrot
// corner decorations. That CTA content moved to the Home page — the tests for
// it live with Home now, not here.
//
// KEPT: `data-site-footer` (the marker `useBannerAboveFooter` measures the
// flanking pennants against) and the same-route smooth-scroll-to-top on the
// wordmark (FRAC-183).
// ═══════════════════════════════════════════════════════════════════════════

function renderFooter(path = "/") {
  const { hook } = memoryLocation({ path, static: true });
  const user = userEvent.setup();
  const utils = render(
    <WouterRouter hook={hook}>
      <Footer />
    </WouterRouter>,
  );
  return { ...utils, user };
}

const wordmark = () => screen.getByRole("link", { name: /fractal — back to home/i });

describe("Footer", () => {
  it("renders a <footer> carrying the data-site-footer marker", () => {
    const { container } = renderFooter();
    const footer = container.querySelector("footer");
    expect(footer).toBeTruthy();
    // useBannerAboveFooter queries this attribute to stop the pennants
    // overlapping the footer. Removing it silently breaks every house page.
    expect(footer!.hasAttribute("data-site-footer")).toBe(true);
  });

  // ═════════════════════════════════════════════════════════════════════
  // Branding wordmark (FRAC-88 regression: camelCase, not all-caps)
  // ═════════════════════════════════════════════════════════════════════

  describe("Branding wordmark", () => {
    it('renders "Fractal" in camelCase — never "FRACTAL"', () => {
      const { container } = renderFooter();
      expect(wordmark().textContent).toContain("Fractal");
      expect(container.querySelector("footer")!.textContent).not.toContain("FRACTAL");
    });

    it("uses the Jacquard 24 display face", () => {
      renderFooter();
      expect(wordmark().getAttribute("style")).toContain("Jacquard 24");
    });

    it("links back to /", () => {
      renderFooter("/campus");
      expect(wordmark().getAttribute("href")).toBe("/");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // FRAC-183 — same-route wordmark click smooth-scrolls to top.
  //
  // wouter's <Link> does not re-fire the router on a same-route nav, so App's
  // ScrollToTop effect (which keys on location change) never runs when the user
  // is already on / and clicks the wordmark. The Footer intercepts that case.
  // ═════════════════════════════════════════════════════════════════════

  describe("Scroll-to-top on the wordmark (FRAC-183)", () => {
    let scrollToSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      scrollToSpy = vi.fn();
      Object.defineProperty(window, "scrollTo", {
        value: scrollToSpy,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "scrollTo", {
        value: () => {},
        writable: true,
        configurable: true,
      });
    });

    it("smooth-scrolls to top when already on / (same-route click)", async () => {
      const { user } = renderFooter("/");

      await user.click(wordmark());

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("does NOT intercept the click from another route — wouter navigates instead", async () => {
      const { user } = renderFooter("/campus");

      await user.click(wordmark());

      // Cross-route: App's ScrollToTop owns the scroll, so the Footer must not
      // call scrollTo itself (and must not preventDefault the navigation).
      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // Social links
  // ═════════════════════════════════════════════════════════════════════

  describe("Social links", () => {
    const SOCIALS = [
      { label: "@fractal_nyc", href: "https://x.com/fractal_nyc" },
      { label: "@fractaltechnyc", href: "https://x.com/fractaltechnyc" },
    ];

    for (const { label, href } of SOCIALS) {
      it(`links ${label} to ${href}, opening in a new tab`, () => {
        renderFooter();
        const link = screen.getByText(label).closest("a");
        expect(link).toBeTruthy();
        expect(link!.getAttribute("href")).toBe(href);
        expect(link!.getAttribute("target")).toBe("_blank");
        expect(link!.getAttribute("rel")).toContain("noopener");
      });
    }
  });

  // ═════════════════════════════════════════════════════════════════════
  // Design credit
  // ═════════════════════════════════════════════════════════════════════

  describe("Design credit", () => {
    it("credits Julianna with a link to parallax.haus", () => {
      renderFooter();
      const link = screen.getByText("Julianna").closest("a");
      expect(link).toBeTruthy();
      expect(link!.getAttribute("href")).toContain("parallax.haus");
      expect(link!.getAttribute("target")).toBe("_blank");
    });
  });

  // ═════════════════════════════════════════════════════════════════════
  // The old CTA band is gone (its content moved to Home)
  // ═════════════════════════════════════════════════════════════════════

  describe("Removed CTA band", () => {
    it("no longer carries the Discord / Ian / tagline / copyright content", () => {
      const { container } = renderFooter();
      const text = container.querySelector("footer")!.textContent ?? "";

      expect(text).not.toContain("Discord");
      expect(text).not.toContain("#intros");
      expect(text).not.toContain("Ian");
      expect(text).not.toContain("New York City Collective");
      expect(text).not.toContain("Fractal Collective");
    });

    it("renders a single dark band (bg-foreground / text-background)", () => {
      const { container } = renderFooter();
      const bands = container.querySelectorAll(".bg-foreground.text-background");
      // Was two bands (branding + CTA). Now exactly one.
      expect(bands.length).toBe(1);
    });
  });
});
