import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Footer } from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════════════════
// The visible footer (black CTA band — "If you're in NYC…", Discord, Ian — and
// the "Fractal Collective" wordmark band) was removed at the operator's request.
// The <Footer /> now renders only an empty, zero-height `data-site-footer`
// marker retained solely as the anchor `useBannerAboveFooter` measures against.
// These tests pin that contract: the footer must exist as a marker and carry
// no visible chrome.
// ═══════════════════════════════════════════════════════════════════════════

describe("Footer", () => {
  it("renders an empty footer element carrying the data-site-footer marker", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toBeTruthy();
    expect(footer!.hasAttribute("data-site-footer")).toBe(true);
    // aria-hidden: it is a decorative measurement anchor, not real content.
    expect(footer!.getAttribute("aria-hidden")).toBe("true");
  });

  it("contains no visible content (no wordmark, CTA, Discord, or copyright)", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer")!;
    expect(footer.textContent).toBe("");
    // The former footer copy must be gone.
    for (const gone of [
      "Fractal Collective",
      "New York City Collective",
      "Discord",
      "#intros",
      "Ian",
    ]) {
      expect(footer.textContent).not.toContain(gone);
    }
    // No child elements — it is a self-closing marker.
    expect(footer.children.length).toBe(0);
  });
});
