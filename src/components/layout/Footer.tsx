import { Link, useLocation } from "wouter";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";

export function Footer() {
  const [location] = useLocation();

  // FRAC-183: wouter's <Link> does not re-fire the router on a same-route nav,
  // so the App's ScrollToTop effect (which keys on location change) misses the
  // case "user is already on / and clicks the Fractal wordmark". Intercept and
  // scroll explicitly when that happens; let wouter handle the cross-route case.
  const handleHomeClick = (e: React.MouseEvent) => {
    if (location === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer data-site-footer className="relative overflow-hidden">
      {/* Branding band — black background, Fractal in camelCase italic. The
          Discord/Ian CTA that used to sit above this now lives in its own
          section on the home page (Home.tsx "Curious about Fractal?"). */}
      <div className="relative border-t border-foreground-faint bg-foreground text-background py-10 md:py-14 overflow-hidden">
        {/* Mandelbrot watermark — background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MandelbrotIcon size={280} color="currentColor" opacity={0.06} className="text-background" />
        </div>

        {/* Mandelbrot top corner accents (relocated from the removed CTA band) */}
        <div className="absolute top-4 left-4 opacity-20 pointer-events-none rotate-[135deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute top-4 right-4 opacity-20 pointer-events-none rotate-[225deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>

        {/* Mandelbrot bottom corner accents */}
        <div className="absolute bottom-4 left-4 opacity-20 pointer-events-none rotate-[45deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none rotate-[315deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          {/* Fractal — links back to the home page from any inner page. */}
          <Link
            href="/"
            onClick={handleHomeClick}
            aria-label="Fractal — back to home"
            className="select-none cursor-pointer transition-opacity duration-200 hover:opacity-75 focus-visible:outline-none focus-visible:opacity-75"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "clamp(64px, 15vw, 160px)",
              lineHeight: 1,
              letterSpacing: "0.04em",
              color: "inherit",
            }}
          >
            Fractal
          </Link>

          {/* Tagline */}
          <p
            className="text-label text-background/50 text-center"
          >
            New York City Collective
          </p>

          {/* Copyright */}
          <p className="text-background/30 text-xs mt-4">
            &copy; {new Date().getFullYear()} Fractal Collective.
          </p>
        </div>
      </div>
    </footer>
  );
}
