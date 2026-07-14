import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const DISCORD_URL = "https://discord.gg/Er974gPTXe";
const FRACTAL_U_URL = "https://fractaluniversity.substack.com/";
const FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/";
const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";
const STRIPE_PARTTIME_URL = "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/111+Conselyea+St,+Brooklyn,+NY+11211/";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";

// Campus floods the page with the saturated house green, so every surface here
// pairs with cream text (`text-background`) — see AGENTS.md § House rules.
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

/** Shared column wrapper — the 768px editorial measure the design uses for all prose. */
function Prose({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl px-6 md:px-8", className)}>
      {children}
    </div>
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
    number: "01",
    name: "Accelerator participants",
    description:
      "Students of the Fractal AI Accelerator, our 6-week program for mastering AI.",
    href: FRACTAL_ACCELERATOR_URL,
  },
  {
    number: "02",
    name: "Fractal U students",
    description:
      "Participants in one of the community-taught classes held on Campus.",
    href: FRACTAL_U_URL,
  },
  {
    number: "03",
    name: "Members",
    description: "24/7 access to our space for coworking and socializing.",
    href: null,
  },
  {
    number: "04",
    name: "Guests",
    description: "Visitors joining one of the 5+ events we host every week.",
    href: LUMA_EVENTS_URL,
  },
] as const;

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

/**
 * Membership CTA — the Button default variant already fills with `--accent`
 * (house-campus-deep, set on CampusPage's <main>) and flips to the cream frost
 * on hover, which is exactly the design's spec for these two.
 *
 * `whitespace-normal leading-snug` because the two-line labels overflow at the
 * 375px baseline otherwise (the Button base sets `whitespace-nowrap`).
 */
function MembershipButton({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <Button
      asChild
      className="w-full flex-1 whitespace-normal leading-snug text-center"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <span className="flex flex-col items-center gap-1">
          <span>{label}</span>
          <span className="opacity-80">{detail}</span>
        </span>
      </a>
    </Button>
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
      <div className="aspect-square w-full overflow-hidden border border-background/25 bg-background/[0.08]">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-body leading-relaxed text-background/75">{caption}</p>
    </div>
  );
}

export function Campus() {
  return (
    <section id="campus" className="text-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex min-h-[90vh] w-full flex-col items-center px-6 py-16 md:px-8 md:py-24">
        <SectorHeader
          letter="C"
          name="Campus"
          color="var(--color-house-campus-deep)"
        />

        <FadeIn className="w-full">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-display mb-4">Be Ambitious with Us</p>

            <p className="text-subtitle mb-8 text-background/80">
              <InlineLink href={GOOGLE_MAPS_URL}>
                111 Conselyea St, Brooklyn, NY
              </InlineLink>
            </p>

            <div className="mx-auto mb-4 flex w-full max-w-2xl flex-col items-stretch gap-4 sm:flex-row">
              <MembershipButton
                href={STRIPE_FULLTIME_URL}
                label="Full time membership"
                detail="24/7 access $300/mo"
              />
              <MembershipButton
                href={STRIPE_PARTTIME_URL}
                label="Part time membership"
                detail="20 hr/wk $150/mo"
              />
            </div>

            <p className="text-body-lead text-background/70">
              First time here? Drop by for free! Contact Crystal (
              <InlineLink href={CRYSTAL_MAILTO} external={false}>
                crystal@fractalnyc.com
              </InlineLink>
              ) for a guided tour.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      <div className="py-20">
        <Prose>
          <FadeIn>
            <h2 className="text-title mb-8">
              A <em>campus</em> in the heart of Williamsburg.
            </h2>

            <p className="text-body-lead text-background/90">
              Fractal Campus is a meeting place in the heart of Williamsburg for
              builders, creators, and technologists to do their most ambitious
              work. We offer 4000+ square feet of both co-working space, two
              kitchens, a communal lounge, and a private roof deck.
            </p>

            {/*
              TODO: the design calls for two dedicated overview photos
              (images/campus/overview-workspace.png and
              images/campus/overview-lounge.png) which do not exist in this repo
              yet. Standing in with the closest shipped assets until the real
              overview photography lands.
            */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src="/images/campus/coworking-space.webp"
                  alt="Open workspace at Fractal Campus with room to spread out"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-md">
                <img
                  src="/images/campus/seating.webp"
                  alt="Lounge seating at Fractal Campus"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <p className="text-body mt-8 text-background/90">
              All members have access to:
            </p>
            <ul className="mt-3 grid list-none grid-cols-1 gap-x-8 gap-y-3 p-0 sm:grid-cols-2">
              {amenities.map((amenity) => (
                <li key={amenity} className="text-body flex gap-3 text-background/90">
                  <span aria-hidden="true" className="text-background/50">
                    &mdash;
                  </span>
                  <span>{amenity}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </Prose>
      </div>

      {/* ── Four audiences ───────────────────────────────────────────────── */}
      <Prose className="pt-20 pb-24">
        <FadeIn>
          <h2 className="text-title mb-8">Fractal Campus serves four audiences</h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {audiences.map(({ number, name, description, href }) => {
              const cardClass =
                "flex flex-col gap-2 rounded-lg bg-house-campus-deep p-7 text-background shadow-lg";
              const body = (
                <>
                  <span className="text-label text-section-story-light">
                    {number}
                  </span>
                  <span className="text-subtitle leading-snug">{name}</span>
                  <span className="text-body leading-relaxed text-background/75">
                    {description}
                  </span>
                </>
              );

              return href ? (
                <a
                  key={number}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    cardClass,
                    "no-underline transition-shadow duration-300 hover:shadow-xl",
                  )}
                >
                  {body}
                </a>
              ) : (
                <div key={number} className={cardClass}>
                  {body}
                </div>
              );
            })}
          </div>
        </FadeIn>
      </Prose>

      {/* ── Get shit done / have a good time ─────────────────────────────── */}
      <div className="py-20">
        <Prose className="pb-16">
          <FadeIn>
            <h2 className="text-title mb-6">A place to get shit done&hellip;</h2>
            <p className="text-body leading-relaxed text-background/90">
              Companies and members that work from the Campus have earnest
              intentions and a firm grip on reality. When we're not doing focused
              work, we're scheming with one another on side projects, figuring out
              how to advise the city government on tech policy, unblocking each
              other by asking incisive questions, or taking a look at that bug
              you're stuck on, just because it's fun.
            </p>
          </FadeIn>
        </Prose>

        <Prose>
          <FadeIn>
            <h2 className="text-title mb-6">
              &hellip;and have a good time doing it.
            </h2>
            <p className="text-body leading-relaxed text-background/90">
              We prioritize intentional community: you'll share space, meals,
              conversations, and ideate with small companies, talented founders,
              designers, and engineers from all over New York City, as well as be
              motivated by working alongside our{" "}
              <InlineLink href={FRACTAL_ACCELERATOR_URL}>
                Fractal AI Accelerator cohorts
              </InlineLink>
              .
            </p>
          </FadeIn>
        </Prose>
      </div>

      {/* ── More than a WeWork ───────────────────────────────────────────── */}
      <Prose className="pt-20 pb-24">
        <FadeIn>
          <h2 className="text-title mb-10">More than a WeWork&hellip;</h2>

          {/* The citation uses a semantic <footer>, which is why
              useBannerAboveFooter targets [data-site-footer] and not `footer`. */}
          <blockquote className="relative border-l-[3px] border-background/35 pt-2 pl-7 md:pl-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-7 left-5 font-serif text-8xl leading-none text-background/25 not-italic select-none md:left-9"
            >
              &ldquo;
            </span>

            <div className="text-subtitle flex flex-col gap-6 italic leading-relaxed text-background">
              <p>
                When I was building my first startup, I'd eat my Chipotle bowl in
                the WeWork kitchen and eavesdrop on conversations about
                &ldquo;optimizing engagement metrics through synergistic
                strategies.&rdquo;
              </p>
              <p>
                It was lonely. Life is too short for bullshit jobs and wasteful
                meetings.
              </p>
              <p>
                Fractal Campus is a sanctuary for serious, experimental tinkerers.
                Our relationships here matter, and you can trust that we are
                conspiring with everyone in the building to push your work forward.
                We're building a startup community the way we've always wanted
                &mdash; as a home away from home.
              </p>
            </div>

            <footer className="mt-8 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block h-px w-8 bg-background/50"
              />
              <span className="text-label text-background/75">
                Andrew Rose &middot; Fractal Campus co-founder
              </span>
            </footer>
          </blockquote>
        </FadeIn>
      </Prose>

      {/* ── Meet the Space ───────────────────────────────────────────────── */}
      <div className="py-20">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-3xl">
              <h2 className="text-title mb-6">Meet the Space</h2>
              <p className="text-body-lead text-background/90">
                4200 sq ft of open working space, kitchen, phone booths, and large
                meeting rooms. Oh, and a giant, sunny rooftop. We're re-decorating
                the space now, and will continue to do so throughout winter, with
                an eye towards creativity, focus, and sunny vibes.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {campusPhotos.map((photo, i) => (
              <FadeIn key={photo.src} delay={(i % 3) * 0.1}>
                <CampusPhoto {...photo} />
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stay in the Loop ─────────────────────────────────────────────── */}
      <div className="px-6 pt-20 pb-24 text-center md:px-8">
        <FadeIn>
          <p className="text-display mb-6">Stay in the Loop</p>
          <Button asChild className="w-full max-w-xs text-center">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              Join Discord
            </a>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
