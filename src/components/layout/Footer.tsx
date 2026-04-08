import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";

const DISCORD_LINK = "https://discord.com/invite/vugp6Nza";
const CALENDAR_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0JUlLukwG9ny_ji86woEKDTE2qWsePnoAz9Ao3Rl4SBssPVd_56rmYcnbb4oO6dIlPiqybWrSo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Main footer content */}
      <div className="border-t border-border bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-[4.5%] flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="flex flex-col gap-3 max-w-sm">
            <p className="text-muted-foreground text-sm leading-relaxed">
              If you&rsquo;re in NYC and would like to introduce yourself, join our{" "}
              <a
                href={DISCORD_LINK}
                className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
              >
                Discord
              </a>{" "}
              and post in{" "}
              <span className="font-medium text-foreground/80">#intros</span>.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Prefer a one-on-one conversation?{" "}
              <a
                href={CALENDAR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
              >
                Schedule a virtual chat with Ian
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col md:text-right gap-2">
            <p className="font-medium text-sm">New York City</p>
            <a href="mailto:hello@fractalnyc.com" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              hello@fractalnyc.com
            </a>
          </div>
        </div>
      </div>

      {/* Bold branding band */}
      <div className="relative bg-foreground text-background py-10 md:py-14 overflow-hidden">
        {/* Mandelbrot watermark — background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MandelbrotIcon size={280} color="currentColor" opacity={0.06} className="text-background" />
        </div>

        {/* Mandelbrot corner accents */}
        <div className="absolute top-4 left-4 opacity-20 pointer-events-none">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20 pointer-events-none">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
          <MandelbrotIcon size={24} color="currentColor" className="text-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-[4.5%] flex flex-col items-center gap-4">
          {/* Large FRACTAL text in Jacquard 24 */}
          <div
            className="text-center select-none"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "clamp(64px, 15vw, 160px)",
              lineHeight: 1,
              letterSpacing: "0.04em",
              color: "inherit",
            }}
          >
            FRACTAL
          </div>

          {/* Tagline */}
          <p
            className="text-background/50 text-xs md:text-sm tracking-[0.25em] uppercase text-center"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
