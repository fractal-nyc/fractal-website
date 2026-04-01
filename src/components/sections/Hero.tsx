import { FadeIn } from "@/components/ui/FadeIn";
import { SierpinskiCarpet } from "./SierpinskiCarpet";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      {/* Skyline background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          clipPath: "inset(8% 6% 0 6%)",
          maskImage:
            "linear-gradient(to right, transparent 3%, black 15%, black 85%, transparent 97%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 3%, black 15%, black 85%, transparent 97%)",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/skyline4.png`}
          alt="NYC skyline"
          className="w-full h-full object-cover object-bottom"
          style={{ opacity: 0.35, transform: "translateX(2.75%)" }}
        />
      </div>

      {/* Sierpinski carpet with photo showing through holes */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
        <SierpinskiCarpet
          depth={3}
          imageUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          className="w-[60vmin] h-[60vmin] max-w-[500px] max-h-[500px] opacity-80"
        />
      </div>

      {/* Hero text overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-16 pointer-events-none"
        style={{ left: "8%", right: "8%" }}
      >
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <FadeIn delay={0.5} className="max-w-lg">
            <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed text-foreground/85 text-balance hero-text-shadow">
              An open source protocol for creating golden ages — starting in
              Brooklyn.
            </p>
          </FadeIn>

          <a
            href="#directory"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-widest link-underline pb-1 shrink-0 hero-text-shadow"
          >
            Explore
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transform rotate-90"
            >
              <path
                d="M1 6H11M11 6L6 1M11 6L6 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
