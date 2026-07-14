import { Link, useLocation } from "wouter";

const SOCIALS = [
  { label: "@fractal_nyc", href: "https://x.com/fractal_nyc" },
  { label: "@fractaltechnyc", href: "https://x.com/fractaltechnyc" },
];

export function Footer() {
  const [location] = useLocation();

  // FRAC-183: wouter's <Link> does not re-fire the router on a same-route nav, so
  // the App's ScrollToTop effect (which keys on location change) misses the case
  // "user is already on / and clicks the Fractal wordmark". Intercept and scroll
  // explicitly when that happens; let wouter handle the cross-route case.
  const handleHomeClick = (e: React.MouseEvent) => {
    if (location === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // `data-site-footer` is the marker `useBannerAboveFooter` measures against to
  // stop the flanking pennants from overlapping the footer. Don't remove it.
  return (
    <footer data-site-footer className="relative overflow-hidden">
      <div className="border-t border-foreground-faint bg-foreground text-background px-6 py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            onClick={handleHomeClick}
            aria-label="Fractal — back to home"
            className="cursor-pointer select-none text-inherit no-underline transition-opacity duration-200 hover:opacity-75 focus-visible:opacity-75 focus-visible:outline-none"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "clamp(64px, 15vw, 160px)",
              lineHeight: 1,
              letterSpacing: "0.04em",
            }}
          >
            Fractal
          </Link>

          <div className="mt-2 flex items-center gap-6">
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-background/60 no-underline transition-colors hover:text-background"
              >
                {s.label}
              </a>
            ))}
          </div>

          <p className="mt-4 font-sans text-[13px] text-background/30">
            Designed by{" "}
            <a
              href="https://parallax.haus/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/50 underline decoration-background/30 underline-offset-[3px]"
            >
              Julianna
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
