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
// MeetTheSpaceCarousel (FRAC-8) — an infinite 3D coverflow of the Campus photos.
//
// Desktop/tablet: Swiper's EffectCoverflow — the centered card sits forward,
// neighbours overlap + rotate + recede + fade. Cards and the stage are kept
// narrow (and neighbours pulled inward via negative `stretch`) so the fan
// stays in the central channel between the flanking CAMPUS banner pennants.
// Mobile (<640px): a clean single centered card with a slight peek (plain
// `slide` effect). Reduced motion drops the 3D entirely (flat, instant).
//
// The carousel loops, so you can page backwards off the first photo and wrap
// to the last. The active photo's caption renders below the stage (the cards
// themselves stay clean — they'd collide in 3D); every image keeps descriptive
// alt text for content parity.
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
  // Loop duplicates slides, so track realIndex (the logical photo), not
  // activeIndex (the physical, duplicate-inclusive slide).
  const [active, setActive] = useState(0);

  const total = photos.length;
  // Only accept a real, in-range index. Under loop, Swiper can briefly report
  // a NaN/out-of-range realIndex (notably in layout-less envs), which would
  // otherwise blank the caption or print "NaN" in the counter.
  const syncActive = (s: SwiperClass) => {
    if (Number.isInteger(s.realIndex) && s.realIndex >= 0 && s.realIndex < total) {
      setActive(s.realIndex);
    }
  };
  const pad = (n: number) => String(n).padStart(2, "0");

  const arrowClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border " +
    "border-background/25 text-background transition-colors " +
    "hover:bg-background/5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-house-campus-light";

  return (
    // The site has no grid — content tracks the width of the primary
    // text/content column (max-w-3xl, same as the section's heading + body).
    // The carousel matches that column exactly.
    <div className="mx-auto w-full max-w-3xl">
      {/* Stage: clip the coverflow to the content column so the fan never
          reaches the flanking banners, with a soft horizontal edge-fade so the
          receding side cards dissolve rather than hard-cut. */}
      <div
        className="overflow-hidden py-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <Swiper
          key={mode}
          modules={[EffectCoverflow, Keyboard, A11y]}
          effect={coverflow ? "coverflow" : "slide"}
          loop
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
            rotate: 40,
            stretch: -28,
            depth: 210,
            modifier: 1,
            scale: 0.86,
            slideShadows: false,
          }}
          onSwiper={(s) => {
            setSwiper(s);
            syncActive(s);
          }}
          onSlideChange={syncActive}
        >
          {photos.map((photo, i) => {
          // Circular distance so wrapped neighbours (e.g. last slide when the
          // first is active) fade like the visual neighbours they are.
          const raw = Math.abs(i - active);
          const dist = Math.min(raw, total - raw);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.7 : 0.45;
          return (
            <SwiperSlide
              key={photo.src}
              // Fixed slide widths so `slidesPerView:auto` has a size to work
              // with: single-card peek on mobile, a narrow stage on desktop.
              className="!flex justify-center !w-[70vw] max-w-[260px] sm:!w-[240px] sm:max-w-none"
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
      </div>

      {/* Active caption — reserved height so the controls don't jump between
          slides of different caption lengths. */}
      <p className="mx-auto mt-8 min-h-[3.5rem] max-w-xl text-center text-body text-background/80 leading-relaxed">
        {photos[active]?.caption}
      </p>

      {/* Controls: prev · dots · next, with a slim NN / TT counter. The loop
          means the arrows never disable — they wrap. */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => swiper?.slidePrev()}
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
              onClick={() => swiper?.slideToLoop(i)}
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
