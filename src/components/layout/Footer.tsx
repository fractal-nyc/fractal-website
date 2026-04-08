import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";

const DISCORD_LINK = "https://discord.com/invite/vugp6Nza";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* CTA section — black background, white text, centered */}
      <div className="relative border-t border-border bg-foreground text-background py-12 md:py-20 overflow-hidden">
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

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium">
              New York City
            </p>
            <a
              href="mailto:hello@fractalnyc.com"
              className="text-xs md:text-sm tracking-wide text-background/70 hover:text-background transition-colors"
            >
              hello@fractalnyc.com
            </a>
          </div>
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
          {/* Fractal — camelCase, italic */}
          <div
            className="select-none"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "clamp(64px, 15vw, 160px)",
              lineHeight: 1,
              letterSpacing: "0.04em",
              color: "inherit",
            }}
          >
            Fractal
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
