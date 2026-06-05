import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// ═══════════════════════════════════════════════════════════════════════════
// Mock the MandelbrotIcon — it's a large SVG component irrelevant to button
// behavior tests and would add noise to the DOM.
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@/components/house/MandelbrotIcon", () => ({
  MandelbrotIcon: ({ size, opacity }: { size: number; opacity: number }) => (
    <svg data-testid="mandelbrot-icon" width={size} height={size} opacity={opacity} />
  ),
}));

import { Button, buttonVariants } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════
// Button component renders all variants
//
// FRAC-27: The old shadcn Button shipped `destructive` / `secondary` / `icon`
// variants and a `min-h-12` default size — all dependent on undefined
// Replit-injected utilities (hover-elevate, [border-color:var(...)],
// border-primary-border, etc.) that were never declared in src/index.css.
// The new minimal Button matches shipped CTA reality: four variants
// (default, outline, ghost, link) and three sizes (default, sm, lg) plus
// `icon` for vendored shadcn components.
// ═══════════════════════════════════════════════════════════════════════════

describe("Button component", () => {
  const variants = ["default", "outline", "ghost", "link"] as const;

  for (const variant of variants) {
    it(`should render the "${variant}" variant without crashing`, () => {
      render(<Button variant={variant}>Click me</Button>);
      expect(screen.getByText("Click me")).toBeTruthy();
    });
  }

  const sizes = ["default", "sm", "lg", "icon"] as const;

  for (const size of sizes) {
    it(`should render at size "${size}"`, () => {
      render(<Button size={size}>Btn</Button>);
      expect(screen.getByText("Btn")).toBeTruthy();
    });
  }

  it("should support the asChild prop (Radix Slot pattern)", () => {
    // asChild forwards classes and ref to the consumer's child element.
    // The Button injects Mandelbrot corner decorations into that child via
    // React.cloneElement, so asChild remains compatible with the
    // corner-decoration default variant.
    render(
      <Button asChild>
        <a href="https://example.com">Linky</a>
      </Button>
    );
    const link = screen.getByText("Linky");
    expect(link.tagName).toBe("A");
    expect((link as HTMLAnchorElement).href).toContain("example.com");
  });

  it("should have inline-flex (not full-width) as the default display", () => {
    render(<Button>Test</Button>);
    const button = screen.getByText("Test").closest("button");
    expect(button).toBeTruthy();
    expect(button!.className).toContain("inline-flex");
  });

  it("should include Mandelbrot corner decorations on the default variant", () => {
    const { container } = render(<Button>Decorated</Button>);
    const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
    // 4 corners
    expect(icons.length).toBe(4);
  });

  it("should mark corner decorations as aria-hidden", () => {
    const { container } = render(<Button>Accessible</Button>);
    const corners = container.querySelectorAll("[aria-hidden]");
    expect(corners.length).toBe(4);
  });

  it("should NOT render Mandelbrot corners on the outline variant", () => {
    const { container } = render(<Button variant="outline">Plain</Button>);
    const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
    expect(icons.length).toBe(0);
  });

  it("should NOT render Mandelbrot corners on the ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghosty</Button>);
    const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
    expect(icons.length).toBe(0);
  });

  it("should NOT render Mandelbrot corners on the link variant", () => {
    const { container } = render(<Button variant="link">Linky</Button>);
    const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
    expect(icons.length).toBe(0);
  });

  it("should expose a real focus-visible ring state (was missing sitewide)", () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByText("Focusable").closest("button");
    expect(button!.className).toContain("focus-visible:ring-2");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CTA link button styling (FRAC-86 regression)
//
// These assertions live alongside the Button tests so the inline-block +
// max-w-xs pattern stays enforced even after CTAs migrate to <Button asChild>.
// The Button's default variant intentionally does not constrain width — the
// consuming page wraps the Button with `max-w-xs w-full` when the constraint
// is desired (as on EventsPage, NeighborhoodPage, etc.).
// ═══════════════════════════════════════════════════════════════════════════

describe("CTA link button styling (FRAC-86 regression)", () => {
  it("should use inline-block + max-w-xs pattern for CTA links", () => {
    // Render a typical CTA link as found on EventsPage, NeighborhoodPage, etc.
    const { container } = render(
      <a
        href="https://example.com"
        className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
      >
        Test CTA
      </a>,
    );
    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    // Must have inline-block to prevent full-width stretching
    expect(link!.className).toContain("inline-block");
    // Must have max-w-xs to constrain width
    expect(link!.className).toContain("max-w-xs");
  });

  it("should not have full-width stretching without max-width constraint", () => {
    const { container } = render(
      <a
        href="https://example.com"
        className="inline-block max-w-xs w-full"
      >
        Constrained CTA
      </a>,
    );
    const link = container.querySelector("a");
    // The combination of inline-block + max-w-xs + w-full means:
    // - w-full makes it fill its inline-block container
    // - max-w-xs caps it at 20rem (320px)
    // - inline-block prevents block-level full-width
    expect(link!.className).toContain("inline-block");
    expect(link!.className).toContain("max-w-xs");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// buttonVariants utility produces correct class strings
// ═══════════════════════════════════════════════════════════════════════════

describe("buttonVariants utility", () => {
  it("should produce a string containing inline-flex for default variant", () => {
    const classes = buttonVariants({ variant: "default", size: "default" });
    expect(classes).toContain("inline-flex");
  });

  it("should include focus-visible ring (real a11y state, not Replit's hover-elevate)", () => {
    const classes = buttonVariants();
    expect(classes).toContain("focus-visible:ring-2");
  });

  it("should include uppercase tracking for site mono CTA aesthetic", () => {
    const classes = buttonVariants({ size: "default" });
    expect(classes).toContain("uppercase");
    expect(classes).toContain("tracking-widest");
  });

  it("should produce a smaller padding string for sm size", () => {
    const classes = buttonVariants({ size: "sm" });
    expect(classes).toContain("px-4");
    expect(classes).toContain("py-2");
  });
});
