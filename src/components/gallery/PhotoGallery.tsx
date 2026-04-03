import { FadeIn } from "@/components/ui/FadeIn";
import { GalleryImage } from "@/components/gallery/GalleryImage";
import type { GallerySection } from "@/data/storyPhotos";

interface PhotoGalleryProps {
  sections: GallerySection[];
}

/**
 * Editorial photo gallery that renders sections with different layouts.
 * Mobile-first: single column on small screens, multi-column on md+.
 *
 * Section types:
 * - hero: single full-width image
 * - pair: two images side by side (stacked on mobile)
 * - masonry: portrait + two landscapes stacked (stacked on mobile)
 * - panoramic: full-width wide crop
 */
export function PhotoGallery({ sections }: PhotoGalleryProps) {
  const directions: Array<"up" | "left" | "right"> = ["up", "left", "right"];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 space-y-6 md:space-y-10">
        {sections.map((section, sectionIdx) => {
          const dir = directions[sectionIdx % directions.length];

          switch (section.type) {
            case "hero":
              return (
                <FadeIn key={sectionIdx} direction={dir} delay={0.1}>
                  <GalleryImage
                    src={section.photos[0].src}
                    alt={section.photos[0].alt}
                    className="aspect-[4/3] md:aspect-[16/10] w-full"
                    priority={sectionIdx === 0}
                  />
                </FadeIn>
              );

            case "pair":
              return (
                <div
                  key={sectionIdx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
                >
                  {section.photos.map((photo, photoIdx) => (
                    <FadeIn
                      key={photoIdx}
                      direction={photoIdx === 0 ? "left" : "right"}
                      delay={photoIdx * 0.15}
                    >
                      <GalleryImage
                        src={photo.src}
                        alt={photo.alt}
                        className="aspect-[4/3] w-full"
                      />
                    </FadeIn>
                  ))}
                </div>
              );

            case "masonry":
              return (
                <div
                  key={sectionIdx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
                >
                  {/* Portrait/tall image takes left 5 columns */}
                  <FadeIn
                    direction="left"
                    delay={0.1}
                    className="md:col-span-5"
                  >
                    <GalleryImage
                      src={section.photos[0].src}
                      alt={section.photos[0].alt}
                      className="aspect-[3/4] md:h-full w-full"
                    />
                  </FadeIn>
                  {/* Two landscapes stacked on the right 7 columns */}
                  <div className="md:col-span-7 grid grid-rows-2 gap-4 md:gap-6">
                    {section.photos.slice(1).map((photo, photoIdx) => (
                      <FadeIn
                        key={photoIdx}
                        direction="right"
                        delay={0.15 + photoIdx * 0.15}
                      >
                        <GalleryImage
                          src={photo.src}
                          alt={photo.alt}
                          className="aspect-[4/3] w-full"
                        />
                      </FadeIn>
                    ))}
                  </div>
                </div>
              );

            case "panoramic":
              return (
                <FadeIn key={sectionIdx} direction="up" delay={0.1}>
                  <GalleryImage
                    src={section.photos[0].src}
                    alt={section.photos[0].alt}
                    className="aspect-[10/3] w-full"
                  />
                </FadeIn>
              );

            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
