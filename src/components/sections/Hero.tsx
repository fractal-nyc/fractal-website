import { Suspense, lazy } from "react";
import { FadeIn } from "@/components/ui/FadeIn";


const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#faf8f5]">
      <Suspense fallback={null}>
        <FractalCityScene />
      </Suspense>

      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ clipPath: 'inset(8% 6% 0 6%)', maskImage: 'linear-gradient(to right, transparent 3%, black 15%, black 85%, transparent 97%)', WebkitMaskImage: 'linear-gradient(to right, transparent 3%, black 15%, black 85%, transparent 97%)' }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/skyline4.png`}
          alt="NYC skyline illustration"
          className="w-full h-full object-cover object-bottom"
          style={{
            opacity: 0.35,
            transform: 'translateX(2.75%)',
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-16 pointer-events-none" style={{ left: '8%', right: '8%' }}>
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <FadeIn delay={0.5} className="max-w-lg">
            <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed text-foreground/85 text-balance hero-text-shadow">
              In 2021, our small group of friends decided to live, learn, and build together in NYC.
            </p>
          </FadeIn>

          <a
            href="#story"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-medium uppercase tracking-widest link-underline pb-1 shrink-0 hero-text-shadow"
          >
            Explore our story
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-90">
              <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
