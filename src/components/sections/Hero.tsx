import { Suspense, lazy, useCallback } from "react";
import { useLocation } from "wouter";

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
  );
}
