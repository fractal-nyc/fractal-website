import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { EffectCoverflow, Keyboard, A11y } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Swiper's headless-ish core CSS + the coverflow effect layer. Scoped to
// `.swiper-*` classes, so it doesn't leak into the Tailwind token system.
import "swiper/css";
import "swiper/css/effect-coverflow";

export interface MeetTheSpacePhoto {
  src: string;
  alt: string;
  caption: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MeetTheSpaceCarousel (FRAC-8) — a 3D coverflow of the Campus photos.
//
// Desktop/tablet: Swiper's EffectCoverflow — the centered card sits forward,
// neighbours rotate + recede + fade, contained to a centered stage so the side
// cards fall well inside the flanking CAMPUS banner gutters. Mobile (<640px):
// a clean single centered card with a slight peek (plain `slide` effect).
// Reduced motion drops the 3D entirely (flat slide, instant). The active
// photo's caption renders below the stage so the cards themselves stay clean
// (they'd collide in 3D); every image keeps descriptive alt text.
// ═══════════════════════════════════════════════════════════════════════════
export function MeetTheSpaceCarousel({
  photos,
}: {
  photos: MeetTheSpacePhoto[];
}) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const prefersReducedMotion = usePrefersReducedMotion();
  const coverflow = isDesktop && !prefersReducedMotion;
  // `mode` keys the Swiper so switching effect re-inits it cleanly.
  const mode = coverflow ? "coverflow" : "slide";

  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = (s: SwiperClass) => {
    setActive(s.activeIndex);
    setAtStart(s.isBeginning);
    setAtEnd(s.isEnd);
  };

  const total = photos.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  const arrowClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border " +
    "border-background/25 text-background transition-colors " +
    "hover:bg-background/5 disabled:opacity-30 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-house-campus-light";

  return (
    <div className="mx-auto w-full max-w-3xl lg:max-w-4xl">
      <Swiper
        key={mode}
        modules={[EffectCoverflow, Keyboard, A11y]}
        effect={coverflow ? "coverflow" : "slide"}
        grabCursor
        centeredSlides
        slidesPerView="auto"
        spaceBetween={coverflow ? 0 : 16}
        speed={prefersReducedMotion ? 0 : 500}
        keyboard={{ enabled: true }}
        a11y={{
          prevSlideMessage: "Previous photo",
          nextSlideMessage: "Next photo",
        }}
        coverflowEffect={{
          rotate: 32,
          stretch: 0,
          depth: 160,
          modifier: 1.15,
          scale: 0.92,
          slideShadows: false,
        }}
        onSwiper={(s) => {
          setSwiper(s);
          sync(s);
        }}
        onSlideChange={sync}
        // Let the coverflow transforms spill outside the stage without a
        // scrollbar; the fade + fixed card widths keep them centered.
        className="!overflow-visible !px-2"
      >
        {photos.map((photo, i) => {
          const dist = Math.abs(i - active);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.7 : 0.45;
          return (
            <SwiperSlide
              key={photo.src}
              // Fixed slide widths so `slidesPerView:auto` has a size to work
              // with: ~78vw single-card peek on mobile, 300px stage on desktop.
              className="!flex justify-center !w-[78vw] max-w-[280px] sm:!w-[300px] sm:max-w-none"
            >
              <div
                className={cn(
                  "w-full overflow-hidden rounded-md border border-background/15 bg-background/5",
                  "aspect-[3/4] transition-shadow duration-300",
                  dist === 0 && "shadow-2xl",
                )}
                style={{ opacity }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Active caption — reserved height so the controls don't jump between
          slides of different caption lengths. */}
      <p className="mx-auto mt-8 min-h-[3.5rem] max-w-xl text-center text-body text-background/80 leading-relaxed">
        {photos[active]?.caption}
      </p>

      {/* Controls: prev · dots · next, with a slim NN / TT counter. */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => swiper?.slidePrev()}
          disabled={atStart}
          aria-label="Previous photo"
          className={arrowClass}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex items-center gap-2.5">
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => swiper?.slideTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-house-campus-light",
                i === active
                  ? "bg-background"
                  : "bg-background/30 hover:bg-background/50",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => swiper?.slideNext()}
          disabled={atEnd}
          aria-label="Next photo"
          className={arrowClass}
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <p className="mt-4 text-center text-label text-background/50">
        {pad(active + 1)} / {pad(total)}
      </p>
    </div>
  );
}
