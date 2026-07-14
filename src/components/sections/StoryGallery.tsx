import { FadeIn } from "@/components/ui/FadeIn";
import { gallerySections } from "@/data/storyPhotos";

/**
 * StoryGallery — the editorial photo run that closes the Story block on Home.
 *
 * Layout is driven entirely by `gallerySections` in src/data/storyPhotos.ts
 * (house rule: copy and data live in their source-of-truth files). Three block
 * types:
 *   - hero      full-width 16:10
 *   - pair      auto-fit columns, minmax(280px, 1fr) — one column at 375px,
 *               two as soon as there's room. Mobile-first with no breakpoint.
 *   - panoramic full-width 10:3 band
 *
 * Motion is limited to the scroll-in fade, which FadeIn already gates on
 * usePrefersReducedMotion(). The images themselves are static.
 */

const PAIR_GRID = "grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]";

function Frame({
  src,
  alt,
  aspect,
  priority = false,
}: {
  src: string;
  alt: string;
  /** Tailwind aspect-ratio class for the frame. */
  aspect: string;
  priority?: boolean;
}) {
  return (
    <div className={`overflow-hidden rounded-sm bg-foreground/5 ${aspect}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function StoryGallery() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-[4.5%]">
        {gallerySections.map((section, i) => {
          switch (section.type) {
            case "hero":
              return (
                <FadeIn key={i} delay={0.1}>
                  <Frame
                    src={section.photos[0].src}
                    alt={section.photos[0].alt}
                    aspect="aspect-[16/10]"
                    priority={i === 0}
                  />
                </FadeIn>
              );

            case "panoramic":
              return (
                <FadeIn key={i} delay={0.1}>
                  <Frame
                    src={section.photos[0].src}
                    alt={section.photos[0].alt}
                    aspect="aspect-[10/3]"
                  />
                </FadeIn>
              );

            case "pair":
              return (
                <div key={i} className={PAIR_GRID}>
                  {section.photos.map((photo, j) => (
                    <FadeIn
                      key={photo.src}
                      direction={j === 0 ? "left" : "right"}
                      delay={j * 0.15}
                    >
                      <Frame src={photo.src} alt={photo.alt} aspect="aspect-[4/3]" />
                    </FadeIn>
                  ))}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
