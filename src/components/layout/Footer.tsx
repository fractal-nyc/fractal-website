import { Link, useLocation } from "wouter";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";

const DISCORD_LINK = "https://discord.gg/Er974gPTXe";
const IAN_CHAT_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0ektkyvH1NQIxPdiKXPASm0WqwG7ee6QKJCDPIarnT5mS_WvLqDLaBb8Pk_va_YlVRXz6DRwnb";

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
    <footer className="relative overflow-hidden">
      {/* CTA section — black background, white text, centered */}
      <div className="relative border-t border-foreground-faint bg-foreground text-background py-12 md:py-20 overflow-hidden">
        {/* Mandelbrot top corners — CTA section */}
        <div className="absolute top-4 left-4 opacity-20 pointer-events-none rotate-[135deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute top-4 right-4 opacity-20 pointer-events-none rotate-[225deg]">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm md:text-base leading-relaxed mb-10">
            If you&rsquo;re in NYC and would like to introduce yourself, join
            our{" "}
            <a
              href={DISCORD_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-background/40 hover:decoration-background/80 transition-colors"
            >
              Discord
            </a>{" "}
            and post in{" "}
            <span className="font-medium">#intros</span>.
          </p>

          <p className="text-sm md:text-base leading-relaxed">
            If you&rsquo;d like to learn more about Fractal and prefer a
            one-on-one conversation, schedule a virtual chat with{" "}
            <a
              href={IAN_CHAT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 decoration-background/40 hover:decoration-background/80 transition-colors"
            >
              Ian
            </a>
            .
          </p>
        </div>
      </div>

      {/* Branding band — black background, Fractal in camelCase italic */}
      <div className="relative bg-foreground text-background py-10 md:py-14 overflow-hidden border-t border-background/10">
        {/* Mandelbrot watermark — background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MandelbrotIcon size={280} color="currentColor" opacity={0.06} className="text-background" />
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
