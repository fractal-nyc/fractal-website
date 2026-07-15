import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { PaperGrain } from "@/components/ui/PaperGrain";
import { cn } from "@/lib/utils";

const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const FRACTAL_U_URL = "https://fractaluniversity.substack.com/";
const FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/";
const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";
const STRIPE_PARTTIME_URL = "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/111+Conselyea+St,+Brooklyn,+NY+11211/";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";
const DISCORD_URL = "https://discord.gg/Er974gPTXe";

const inlineLinkClass =
  "underline decoration-background/40 hover:decoration-background transition-colors";

function InlineLink({
  href,
  children,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <a href={href} {...externalProps} className={inlineLinkClass}>
      {children}
    </a>
  );
}

const amenities = [
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
];

const audiences = [
  {
    num: "01",
    title: "Accelerator participants",
    description:
      "Students of the Fractal AI Accelerator, our 6-week program for mastering AI.",
    href: FRACTAL_ACCELERATOR_URL,
  },
  {
    num: "02",
    title: "Fractal U students",
    description:
      "Participants in one of the community-taught classes held on Campus.",
    href: FRACTAL_U_URL,
  },
  {
    num: "03",
    title: "Members",
    description: "24/7 access to our space for coworking and socializing.",
    href: STRIPE_FULLTIME_URL,
  },
  {
    num: "04",
    title: "Guests",
    description: "Visitors joining one of the 5+ events we host every week.",
    href: LUMA_EVENTS_URL,
  },
];

// TODO: the design references dedicated overview photos
// (images/campus/overview-workspace.png + overview-lounge.png) which don't
// exist yet. Substituting two existing Campus photos until the real overview
// shots are shot; swap `src`/`alt` here once they land.
const overviewPhotos = [
  {
    src: "/images/campus/coworking-space.webp",
    alt: "Open coworking space at Fractal Campus",
  },
  {
    src: "/images/campus/seating.webp",
    alt: "Lounge seating at Fractal Campus",
  },
];

const campusPhotos = [
  {
    src: "/images/campus/rooftop.webp",
    alt: "Fractal Campus private rooftop deck in Williamsburg",
    caption:
      "Did we mention we had 5000 sq. ft of private rooftop? We have 5000 sq. ft of private rooftop.",
  },
  {
    src: "/images/campus/kitchen.webp",
    alt: "Fractal Campus kitchen",
    caption: "A full kitchen, with an island",
  },
  {
    src: "/images/campus/coworking-space.webp",
    alt: "Fractal Campus coworking floor",
    caption: "Open coworking space with room to spread out",
  },
  {
    src: "/images/campus/seating.webp",
    alt: "Lounge seating at Fractal Campus",
    caption: "Seating, seating, and more seating",
  },
  {
    src: "/images/campus/large-call-booths.webp",
    alt: "Large call booths at Fractal Campus",
    caption: "Large call booths for meetings and focused calls",
  },
  {
    src: "/images/campus/small-call-booths.webp",
    alt: "Small call booths at Fractal Campus",
    caption: "Small call booths for quick one-on-ones",
  },
  {
    src: "/images/campus/parth-and-norman-cozy.webp",
    alt: "Two members working side-by-side at Fractal Campus",
    caption:
      "Parth and Norman proving that cozy engineers are productive engineers",
  },
  {
    src: "/images/campus/private-office.avif",
    alt: "Private office at Fractal Campus",
    caption: "Roomy private office or large meeting room",
  },
  {
    src: "/images/campus/bathroom.webp",
    alt: "Bathroom at Fractal Campus",
    caption: "Nice and clean",
  },
];

function PrimaryButton({
  href,
  children,
  external = true,
  fullWidth = false,
  wrap = true,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  fullWidth?: boolean;
  wrap?: boolean;
}) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  // FRAC-52: Campus inherits the sitewide frost recipe (cream-tinted glass +
  // accent border via `--accent` set on CampusPage's <main>).
  const widthClass = fullWidth ? "w-full" : "max-w-xs w-full";
  // FRAC-53: Long membership labels wrap to 2-3 lines via whitespace-normal +
  // leading-snug at the 375px mobile baseline.
  const wrapClass = wrap ? "whitespace-normal leading-snug" : "";
  return (
    <Button asChild className={cn(widthClass, "text-center", wrapClass)}>
      <a href={href} {...externalProps}>
        {children}
      </a>
    </Button>
  );
}

function MembershipTiers() {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
        <PrimaryButton href={STRIPE_FULLTIME_URL} fullWidth>
          <span className="flex flex-col items-center gap-1">
            <span>Full time membership</span>
            <span className="opacity-80">24/7 access $300/mo</span>
          </span>
        </PrimaryButton>
        <PrimaryButton href={STRIPE_PARTTIME_URL} fullWidth>
          <span className="flex flex-col items-center gap-1">
            <span>Part time membership</span>
            <span className="opacity-80">20 hr/wk $150/mo</span>
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}

function AudienceCard({
  num,
  title,
  description,
  href,
}: {
  num: string;
  title: string;
  description: string;
  href: string | null;
}) {
  // FRAC-7: the audience cards adopt the frosted-Button design schema (see
  // ui/button.tsx default variant) — accent fill + border, backdrop blur, the
  // shared paper-grain overlay, Mandelbrot corners, and the cream-frost hover
  // (bg → --btn-fill, text → --btn-text/accent). `--accent` is campus-deep on
  // this page, so the card's rest color matches the sitewide CTA buttons.
  const cardClass = cn(
    "group relative overflow-hidden flex flex-col gap-2 rounded-md p-7 shadow-lg",
    "border bg-[var(--accent,currentColor)] text-background",
    "[border-color:var(--accent,currentColor)]",
    "[backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] [isolation:isolate] [transform:translateZ(0)]",
    "transition-colors duration-300",
    "hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))] hover:text-[var(--btn-text,var(--accent,currentColor))]",
  );
  const body = (
    <>
      {/* Eyebrow numeral: the .text-label chrome tier (mono/uppercase/wide
          tracking), inheriting the card text color so it inverts with the
          frost hover — FRAC-7 retired the italic gold treatment. */}
      <span className="text-label">{num}</span>
      <span className="text-subtitle normal-case">{title}</span>
      {/* opacity (not a fixed token color) so the description follows
          currentColor through the hover inversion. */}
      <span className="text-body opacity-75 leading-relaxed">{description}</span>
    </>
  );
  // Decorative chrome, mirrored from the Button: paper grain + corner
  // Mandelbrots. p-7 (28px) clears the size="xs" safe-padding minimum (24px).
  const decorations = (
    <>
      <PaperGrain />
      <CornerDecorations size="xs" opacity={0.8} />
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardClass, "no-underline")}
      >
        {body}
        {decorations}
      </a>
    );
  }
  return (
    <div className={cardClass}>
      {body}
      {decorations}
    </div>
  );
}

function CampusPhoto({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] md:aspect-square w-full overflow-hidden border border-background/10 bg-background/5">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-body text-background/70 leading-relaxed">{caption}</p>
    </div>
  );
}

// FRAC-4: dot indicators for the Meet-the-Space carousel. One dot per Embla
// snap position (fewer than the photo count once >1 slide is visible). Reads
// live state from the surrounding <Carousel> via context.
function CarouselDots() {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();
  if (scrollSnaps.length <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2.5">
      {scrollSnaps.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => scrollTo(i)}
          aria-label={`Go to photo ${i + 1}`}
          aria-current={i === selectedIndex}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-house-campus-light",
            i === selectedIndex
              ? "bg-background"
              : "bg-background/30 hover:bg-background/50",
          )}
        />
      ))}
    </div>
  );
}

// FRAC-4: the "Meet the Space" gallery as a peek carousel — ~1 photo on mobile,
// 2 on tablet, 3 on desktop with a peek of the next. Swipe/drag, arrows, dots,
// and keyboard (←/→) all advance it; reduced motion is honored by the Carousel
// primitive. Replaces the former 9-row stacked grid to cut scroll time.
function MeetTheSpaceCarousel() {
  return (
    <Carousel ariaLabel="Photos of Fractal Campus">
      <CarouselContent>
        {campusPhotos.map((photo) => (
          <CarouselItem
            key={photo.src}
            className="basis-[82%] sm:basis-1/2 lg:basis-1/3"
          >
            <CampusPhoto
              src={photo.src}
              alt={photo.alt}
              caption={photo.caption}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-8 flex items-center justify-center gap-5">
        <CarouselPrevious />
        <CarouselDots />
        <CarouselNext />
      </div>
    </Carousel>
  );
}

export function Campus() {
  return (
    <section id="campus" className="text-background">
      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-16 md:pb-24 w-full">
        <div className="px-6 md:px-[4.5%] w-full">
          <FadeIn>
            <SectorHeader
              letter="C"
              name="Campus"
              color="var(--color-house-campus-deep)"
            />
          </FadeIn>

          <FadeIn>
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-display text-background mb-4 text-center">
                Be Ambitious with Us
              </p>
              <p className="text-subtitle text-background/80 mb-8 normal-case">
                <InlineLink href={GOOGLE_MAPS_URL}>
                  111 Conselyea St, Brooklyn, NY
                </InlineLink>
              </p>
              <div className="flex flex-col gap-4 items-center mb-4 max-w-2xl mx-auto">
                <MembershipTiers />
              </div>
              <p className="text-body-lead text-background/70 text-center">
                First time here? Drop by for free! Contact Crystal (
                <InlineLink href={CRYSTAL_MAILTO} external={false}>
                  crystal@fractalnyc.com
                </InlineLink>
                ) for a guided tour.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <p className="text-title leading-tight mb-8 normal-case">
              A <span className="italic">campus</span> in the heart of
              Williamsburg.
            </p>
            <p className="text-body-lead text-background/90">
              Fractal Campus is a meeting place in the heart of Williamsburg for
              builders, creators, and technologists to do their most ambitious
              work. We offer 4000+ square feet of both co-working space, two
              kitchens, a communal lounge, and a private roof deck.
            </p>
            {/* Overview photo pair — see `overviewPhotos` TODO above. */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {overviewPhotos.map((photo) => (
                <div
                  key={photo.src}
                  className="aspect-[4/3] w-full overflow-hidden rounded-md border border-background/10 bg-background/5"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="mt-8 text-body text-background/90">
              All members have access to:
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body text-background/90">
              {amenities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-background/50">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>

      {/* Four audiences */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-8 normal-case">
              Fractal Campus serves four audiences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {audiences.map((audience) => (
                <AudienceCard key={audience.num} {...audience} />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Get shit done */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              A place to get shit done…
            </h2>
            <p className="text-body-lead text-background/90 leading-relaxed">
              Companies and members that work from the Campus have earnest
              intentions and a firm grip on reality. When we're not doing focused
              work, we're scheming with one another on side projects, figuring
              out how to advise the city government on tech policy, unblocking
              each other by asking incisive questions, or taking a look at that
              bug you're stuck on, just because it's fun.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* And have a good time */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              …and have a good time doing it.
            </h2>
            <p className="text-body-lead text-background/90 leading-relaxed">
              We prioritize intentional community: you'll share space, meals,
              conversations, and ideate with small companies, talented founders,
              designers, and engineers from all over New York City, as well as be
              motivated by working alongside our{" "}
              <InlineLink href={FRACTAL_ACCELERATOR_URL}>
                Fractal AI Accelerator cohorts
              </InlineLink>
              .
            </p>
          </div>
        </FadeIn>
      </div>

      {/* More than a WeWork */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-10 normal-case">
              More than a WeWork…
            </h2>
            <blockquote className="relative border-l-2 border-background/35 pl-8 md:pl-12">
              <span
                aria-hidden
                className="absolute -top-7 left-4 md:left-8 select-none font-serif text-background/25 leading-none text-[96px]"
              >
                “
              </span>
              <div className="space-y-6 text-subtitle text-background leading-relaxed normal-case italic">
                <p>
                  When I was building my first startup, I'd eat my Chipotle bowl
                  in the WeWork kitchen and eavesdrop on conversations about
                  “optimizing engagement metrics through synergistic
                  strategies.”
                </p>
                <p>
                  It was lonely. Life is too short for bullshit jobs and wasteful
                  meetings.
                </p>
                <p>
                  Fractal Campus is a sanctuary for serious, experimental
                  tinkerers. Our relationships here matter, and you can trust
                  that we are conspiring with everyone in the building to push
                  your work forward. We're building a startup community the way
                  we've always wanted — as a home away from home.
                </p>
              </div>
              {/* Semantic <footer> for the citation. The banner-clearance hook
                  (useBannerAboveFooter) targets [data-site-footer] specifically
                  so it never mistakes this for the page footer. */}
              <footer className="mt-8 flex items-center gap-3">
                <span
                  aria-hidden
                  className="block h-px w-8 bg-background/50"
                />
                <span className="text-aside text-background/75">
                  Andrew Rose · Fractal Campus co-founder
                </span>
              </footer>
            </blockquote>
          </div>
        </FadeIn>
      </div>

      {/* Meet the Space */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-title mb-6 normal-case">Meet the Space</h2>
            <p className="text-body-lead text-background/90">
              4200 sq ft of open working space, kitchen, phone booths, and large
              meeting rooms. Oh, and a giant, sunny rooftop. We're re-decorating
              the space now, and will continue to do so throughout winter, with
              an eye towards creativity, focus, and sunny vibes.
            </p>
          </div>
        </FadeIn>
        <FadeIn>
          <MeetTheSpaceCarousel />
        </FadeIn>
      </div>

      {/* Stay in the Loop */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-40 text-center">
        <FadeIn>
          <p className="text-display text-background mb-6">Stay in the Loop</p>
          <div className="flex justify-center">
            <PrimaryButton href={DISCORD_URL}>Join Discord</PrimaryButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
