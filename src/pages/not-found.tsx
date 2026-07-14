import type { CSSProperties } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    // `--accent` is REQUIRED here, not decorative. The default Button variant fills
    // with `var(--accent, currentColor)` and sets `text-white` on that same node, so
    // when no page supplies `--accent` the fallback `currentColor` resolves to the
    // button's own white text — a white fill and a white border under white text,
    // i.e. an invisible button. 404 is the one page with no house to inherit an
    // accent from, so it pins charcoal explicitly.
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground"
      style={{ "--accent": "var(--color-foreground)" } as CSSProperties}
    >
      <h1 className="text-display mb-4">404</h1>
      <p className="text-xl text-foreground-muted mb-8">Page not found.</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
