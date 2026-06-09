import * as React from "react";
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
// CTA link button styling (FRAC-86 regression, FRAC-53 migration)
//
// Originally these assertions enforced the raw `inline-block + max-w-xs`
// fake-button pattern used sitewide before FRAC-27 / FRAC-53. After the
// migration to <Button asChild>, the consuming pages now pass max-w-xs /
// w-full through className to a Button that wraps a real <a>. These tests
// assert the migrated equivalent: a Button asChild over an <a> still
// produces the inline-flex CTA chrome (border, translucent background,
// Mandelbrot corners) and forwards width constraints from the consumer.
// ═══════════════════════════════════════════════════════════════════════════

describe("CTA link button styling (FRAC-86 regression)", () => {
  it("should render <Button asChild> over an <a> as a styled CTA link", () => {
    const { container } = render(
      <Button asChild className="max-w-xs w-full">
        <a href="https://example.com">Long Label Text That Wraps</a>
      </Button>,
    );
    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    // Slot forwards width constraints from the Button consumer to the <a>.
    expect(link!.className).toContain("max-w-xs");
    expect(link!.className).toContain("w-full");
    // The Button base styles render the inline-flex CTA chrome on the
    // forwarded element.
    expect(link!.className).toContain("inline-flex");
    // The default variant supplies the frosted CTA surface (FRAC-52: cream
    // tinted glass + accent border via --btn-accent, preserved across the
    // FRAC-86 fake-button → Button migration).
    expect(link!.className).toContain("bg-[rgba(242,234,216,0.08)]");
    expect(link!.className).toContain("[border-color:var(--btn-accent,currentColor)]");
  });

  it("should propagate --btn-accent from a parent <main> to the rendered Button border class", () => {
    // FRAC-52: pages set `--btn-accent` on <main> to colorize the Button's
    // border + Mandelbrot corners. jsdom doesn't compute CSS custom property
    // resolution, so we assert the class reference (the CSS engine in the
    // browser resolves the var() at paint time).
    const { container } = render(
      <main style={{ "--btn-accent": "#FF0000" } as React.CSSProperties}>
        <Button>Accented</Button>
      </main>,
    );
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    // The button still references the custom property via its border-color
    // class — page-level <main style="--btn-accent: ..."> cascades through.
    expect(button!.className).toContain("[border-color:var(--btn-accent,currentColor)]");
  });

  it("should render four Mandelbrot corner decorations on the CTA <a>", () => {
    // Corners are appended as siblings inside the slotted child via
    // React.cloneElement — see Button.tsx asChild branch.
    const { container } = render(
      <Button asChild className="max-w-xs w-full">
        <a href="https://example.com">CTA</a>
      </Button>,
    );
    const icons = container.querySelectorAll('[data-testid="mandelbrot-icon"]');
    expect(icons.length).toBe(4);
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
