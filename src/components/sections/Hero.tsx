import { Suspense, lazy, useCallback } from "react";
import { useLocation } from "wouter";
import { FadeIn } from "@/components/ui/FadeIn";

const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

export function Hero() {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (route: string) => setLocation(route),
    [setLocation]
  );

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      <Suspense fallback={null}>
        <FractalCityScene onNavigate={handleNavigate} />
      </Suspense>

      {/* Search bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 font-mono text-sm tracking-widest uppercase text-foreground/60 border border-foreground/20 rounded-md p-[2px]" style={{ width: "280px", height: "30px" }}>
          <span>Explore Fractal...</span>
          <span className="inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink" />
        </div>
      </div>

      {/* Skyline background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <img
          src={`${import.meta.env.BASE_URL}images/skyline4.png`}
          alt="NYC skyline illustration"
          className="w-full h-full object-cover object-bottom"
          style={{
            opacity: 0.15,
            transform: "translate(2.75%, -8%) scale(1.35)",
          }}
        />
      </div>

    </section>

      {/* Summary + Explore — sits below the hero, revealed on scroll */}
      <div
        className="relative z-10 bg-[#faf8f5] px-[8%] py-12 md:py-16"
      >
        <div className="flex items-end justify-between gap-4">
          <FadeIn className="max-w-lg">
            <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed text-foreground/85 text-balance">
              In 2021, our small group of friends decided to live, learn, and
              build together in NYC.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="shrink-0">
            <button
              onClick={() => handleNavigate("/story")}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-widest link-underline pb-1 cursor-pointer"
            >
              Explore our story
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
            </button>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
