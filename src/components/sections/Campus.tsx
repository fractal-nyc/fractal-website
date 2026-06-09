import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LUMA_URL = "https://luma.com/nyc-tech";
const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const FRACTAL_U_URL = "https://fractaluniversity.substack.com/";
const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";
const STRIPE_PARTTIME_URL = "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/111+Conselyea+St,+Brooklyn,+NY+11211/";
const PAMPAM_URL = "https://www.pampam.city/p/3hItQdj7pnuUtEkU4p7I";
const FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/";
const FRACTAL_BOOTCAMP_URL = "https://fractalbootcamp.com/";
const STRIPE_BILLING_URL = "https://billing.stripe.com/p/login/7sI8zddAWdabfYc144";
const CONTACT_ANDREW_MAILTO = "mailto:ajroberts0417@gmail.com";
const HELLO_FRACTAL_MAILTO = "mailto:hello@fractaltech.xyz";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";

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

const teamBios = [
  {
    name: "Andrew Rose",
    role: "Co-Founder",
    links: [
      { label: "twitter", href: "https://twitter.com/__drewface" },
      { label: "github", href: "https://github.com/ajroberts0417" },
    ],
    previously: (
      <>
        Founder of{" "}
        <InlineLink href="https://www.producthunt.com/products/qrono">Qrono</InlineLink>,
        founding engineer at{" "}
        <InlineLink href="https://culdesac.com/">Culdesac</InlineLink>, and Interim Head of
        School at{" "}
        <InlineLink href="https://www.guidepostmontessori.com/schools/museum-mile-new-york-ny">
          Guidepost Montessori at Museum Mile
        </InlineLink>
        .
      </>
    ),
  },
  {
    name: "Jake Zegil",
    role: "Co-Founder",
    links: [{ label: "github", href: "https://github.com/jakezegil" }],
    previously: (
      <>
        Founding Engineer, Director of Engineering at{" "}
        <InlineLink href="https://tenet.com/">Tenet</InlineLink>.
      </>
    ),
  },
];

const amenities = [
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
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

const eventTypes = [
  {
    name: "Demo Nights",
    description:
      "Build nights with demos to spotlight your project. Receive fast feedback, practice your pitch, and see what others are working on.",
  },
  {
    name: "Lightning Talks",
    description: "Sharing knowledge and stories through quick informal talks.",
  },
  {
    name: "Fireside Chats",
    description:
      "Conversations with seasoned founders who've been where you are. They'll share their journeys, answer questions, and offer insights into navigating your startup.",
  },
  {
    name: "Group Dinners",
    description: "Share a meal with other interesting, ambitious people.",
  },
  {
    name: "Paper Reading Groups",
    description: "Deep dives into the latest research and trends with a weekly reading group.",
  },
  {
    name: "Hackathons",
    description: "Monthly collaborations to build your ideas and meet new people.",
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
  // accent border via `--btn-accent` set on CampusPage's <main>). The old
  // Campus-specific `bg-foreground/20 hover:bg-foreground/30` override has
  // been dropped — the cream tint reads cleanly against the green Campus
  // background and matches every other house page.
  const widthClass = fullWidth ? "w-full" : "max-w-xs w-full";
  // FRAC-53: Long membership/day-pass labels (up to 53 chars) overflow the
  // max-w-xs container at the 375px mobile baseline. Default wrap=true lets
  // them flow to 2-3 lines via whitespace-normal + leading-snug. Mandelbrot
  // corners are position:absolute at 4px insets so they continue to hug the
  // border on multi-line wraps without manual adjustment.
  const wrapClass = wrap ? "whitespace-normal leading-snug" : "";
  return (
    <Button
      asChild
      className={cn(widthClass, "text-center", wrapClass)}
    >
      <a href={href} {...externalProps}>
        {children}
      </a>
    </Button>
  );
}

function MembershipTiers({ showLeadIn = false }: { showLeadIn?: boolean }) {
  return (
    <div className="w-full">
      {showLeadIn && (
        <p className="text-body text-background/90 leading-relaxed mb-4">
          We offer two kinds of membership:
        </p>
      )}
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
            <span className="opacity-80">50 hr/wk $150/mo</span>
          </span>
        </PrimaryButton>
      </div>
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
      <p className="text-body text-background/70 leading-relaxed">
        {caption}
      </p>
    </div>
  );
}

export function Campus() {
  return (
    <section id="campus" className="text-background">
      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-16 md:pb-24 w-full">
        <div className="px-6 md:px-[4.5%] w-full">
          <FadeIn>
            <SectorHeader letter="C" name="Campus" color="var(--color-house-campus-deep)" />
          </FadeIn>

          <FadeIn>
            <div className="text-center max-w-4xl mx-auto">
              <p
                className="font-serif not-italic font-light text-3xl md:text-4xl tracking-[0.04em] uppercase leading-[1.1] text-background mb-4 text-center"
              >
                Be Ambitious at Fractal Campus
              </p>
              <p className="text-subtitle text-background/80 mb-8 normal-case">
                <InlineLink href={GOOGLE_MAPS_URL}>
                  111 Conselyea St, Brooklyn, NY
                </InlineLink>
              </p>
              <div className="flex flex-col gap-4 items-center mb-4 max-w-2xl mx-auto">
                <PrimaryButton href={LUMA_URL} fullWidth>
                  Visit by joining us for an event
                </PrimaryButton>
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
              A <span className="italic">campus</span> in the heart of Williamsburg.
            </p>
            <div className="space-y-6 text-body-lead text-background/90">
              <p>
                The Fractal Campus is a meeting place in the heart of Williamsburg to do your
                most ambitious work. We offer 4000+ square feet of both shared office space and
                private offices, two kitchens, a communal lounge, and a 5000+ square foot private
                roof deck.
              </p>
            </div>
            <p className="mt-8 text-body text-background/90">
              All members have access to:
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body text-background/90">
              {amenities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-background/50">—</span>
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
            <ul className="space-y-5 text-body text-background/90 leading-relaxed">
              <li>
                <strong className="font-semibold text-background">
                  <InlineLink href={FRACTAL_ACCELERATOR_URL}>
                    Fractal AI Accelerator participants
                  </InlineLink>
                </strong>
              </li>
              <li>
                <strong className="font-semibold text-background">
                  <a
                    href={FRACTAL_U_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-background/40 hover:decoration-background transition-colors"
                  >
                    Fractal U
                  </a>{" "}
                  students
                </strong>{" "}
                — participants in a class held on Campus
              </li>
              <li>
                <strong className="font-semibold text-background">Members</strong>, who have 24/7 access
                to our space for coworking and projects
              </li>
              <li>
                <strong className="font-semibold text-background">Guests</strong> coming to one of the{" "}
                <InlineLink href={LUMA_EVENTS_URL}>5+ events we host per week</InlineLink>
              </li>
            </ul>
            <p className="mt-8 text-body-lead text-background/90">
              First time here? Drop by for free! Contact Crystal (
              <InlineLink href={CRYSTAL_MAILTO} external={false}>
                crystal@fractalnyc.com
              </InlineLink>
              ) for a guided tour.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
              <PrimaryButton href={FRACTAL_ACCELERATOR_URL}>Fractal Accelerator</PrimaryButton>
              <PrimaryButton href={FRACTAL_U_URL}>Fractal U</PrimaryButton>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* AI Accelerator */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              AI Accelerator
            </h2>
            <div className="space-y-6 text-body text-background/90 leading-relaxed">
              <p className="text-body-lead text-background/90">
                We run an AI training program that teaches ambitious professionals to
                master AI. No prior programming experience is needed. Our program runs
                every 6 weeks, starting in summer 2026.
              </p>
              <p>Our program teaches you how to:</p>
            </div>
            <ul className="mt-6 space-y-5 text-body text-background/90 leading-relaxed">
              <li className="flex gap-3">
                <span aria-hidden className="text-background/50">—</span>
                <span>
                  Ship real personal software — tools, dashboards, automations, and
                  workflows — starting from nothing but a plain-language description
                  of what you want
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="text-background/50">—</span>
                <span>
                  Build an AI agent that knows your work, learns your preferences,
                  and takes action across your email, calendar, and the rest of your
                  apps
                </span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden className="text-background/50">—</span>
                <span>
                  Set up a computer that keeps working when you walk away, with
                  agents running in the background and reachable from your phone
                </span>
              </li>
            </ul>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
              <PrimaryButton href={FRACTAL_ACCELERATOR_URL}>
                Apply to the AI Accelerator
              </PrimaryButton>
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
            <div className="space-y-6 text-body text-background/90 leading-relaxed">
              <p>
                Fractal Campus is a curated community. Companies and members that work from the
                Campus have earnest intentions and a firm grip on reality. When we're not doing
                focused work, we're scheming with one another on side projects, figuring out how to
                advise the city government on tech policy, unblocking each other by asking incisive
                questions, or taking a look at that bug you're stuck on, just because it's fun.
              </p>
              <p>
                Oh, and our desks are set up with cushy office chairs and external monitors. Time is
                too precious for a single screen.
              </p>
            </div>
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
            <div className="space-y-6 text-body text-background/90 leading-relaxed">
              <p>
                We prioritize intentional community: you'll share space, meals, conversations, and
                ideate with small companies, talented founders, designers, and engineers from all
                over New York City, as well as be motivated by working alongside our{" "}
                <InlineLink href={FRACTAL_ACCELERATOR_URL}>
                  Fractal AI Accelerator cohorts
                </InlineLink>
                .
              </p>
              <p>
                The Campus hosts{" "}
                <InlineLink href={LUMA_EVENTS_URL}>regular events</InlineLink> in evenings and on
                weekends. We aim to ignite a New York City Renaissance by networking
              </p>
              <p>
                While we have strict rules against interrupting people who are mid-work, or being
                loud in our quiet spaces, people at Fractal Campus are social, ambitious, and eager
                to help each other win.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* More than a WeWork */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              More than a WeWork…
            </h2>
            <div className="space-y-6 text-subtitle text-background/90 leading-relaxed">
              <p>
                "When I was building my first startup, I'd eat my Chipotle bowl in the WeWork kitchen
                and eavesdrop on conversations about "optimizing engagement metrics through
                synergistic strategies".
              </p>
              <p>It was lonely. Life is too short for bullshit jobs and wasteful meetings.</p>
              <p>
                Fractal Campus is a sanctuary for serious, experimental tinkerers. Our relationships
                here matter, and you can trust that we are conspiring with everyone in the building
                to push your work forward. We're building a startup community the way we've always
                wanted — as a home away from home."
              </p>
              <p className="text-aside text-background/70">— Andrew Rose, Fractal Campus co-founder</p>
            </div>
            <div className="mt-10 flex flex-col gap-6">
              <MembershipTiers showLeadIn />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Meet the Space */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-title mb-6">Meet the Space</h2>
            <p className="text-body-lead text-background/90">
              4200 sq ft of open working space, kitchen, phone booths, and large meeting rooms. Oh,
              and 5000 sq. ft of sunny rooftop. We're re-decorating the space now, and will continue
              to do so throughout winter, with an eye towards creativity, focus, and sunny vibes.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {campusPhotos.map((photo, i) => (
            <FadeIn key={photo.src} delay={i * 0.05}>
              <CampusPhoto
                src={photo.src}
                alt={photo.alt}
                caption={photo.caption}
              />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* What's it like */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              What's it like to be here?
            </h2>
            <div className="space-y-6 text-subtitle text-background/90 leading-relaxed">
              <p>
                "Imagine waking up every day to work on projects and companies you burn for, beside
                people who motivate you, in a workplace dedicated to people who love their work.
              </p>
              <p>
                But it's more than that! Imagine a workplace dedicated to research, community,
                effectiveness, and play, where the ultimate product of our work is a one of a kind
                culture — a culture that creates the conditions for exceptional ambition and
                exceptional work, because you know the people here, you trust them, and you want to
                help each other succeed.
              </p>
              <p>
                Fractal Campus is the best place in the world for you to do your most ambitious
                work… no matter how old you are:"
              </p>
              <p className="text-aside text-background/70">— Co-founder (and uncle) Jake Zegil</p>
            </div>
            <div className="mt-10 flex flex-col gap-6">
              <MembershipTiers />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Events */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6">Events</h2>
            <p className="text-body text-background/90 leading-relaxed mb-8">
              Types of events we've hosted at the Fractal Campus so far:
            </p>
            <ul className="space-y-5 text-body text-background/90 leading-relaxed">
              {eventTypes.map((event) => (
                <li key={event.name}>
                  <strong className="font-semibold text-background">{event.name}:</strong>{" "}
                  {event.description}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-body text-background/90 leading-relaxed">
              And many more — seriously, we've hosted almost one event per day we've been open!
            </p>
            <div className="mt-10 mb-6 flex flex-col sm:flex-row gap-4 justify-start items-center">
              <PrimaryButton href={LUMA_URL}>Join events at Fractal Campus</PrimaryButton>
            </div>
            <div className="mt-8 space-y-4 text-body text-background/90 leading-relaxed">
              <p>
                Our community hosts events nearly every day. See upcoming events on our{" "}
                <InlineLink href={LUMA_EVENTS_URL}>Luma calendar</InlineLink>
              </p>
              <p>Anyone can host an event in our space, even non-members:</p>
              <p>
                To host a free event, add it directly to our{" "}
                <InlineLink href={LUMA_EVENTS_URL}>Luma calendar</InlineLink>
              </p>
              <p>
                To host a paid event, email{" "}
                <InlineLink href={CRYSTAL_MAILTO} external={false}>
                  crystal@fractalnyc.com
                </InlineLink>
              </p>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Williamsburg */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              Our little corner in Williamsburg
            </h2>
            <p className="text-body text-background/90 leading-relaxed">
              We're in the heart of Williamsburg, a few blocks away from the commercial hotspot
              Bedford Avenue. You'll have easy access to great eats, cafes, and transit to
              Manhattan.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* McCarren Park */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              …and a short walk to McCarren Park
            </h2>
            <blockquote className="border-l-2 border-background/30 pl-6 my-6">
              <p className="text-subtitle text-background/90 leading-relaxed normal-case">
                "All truly great thoughts are conceived while walking."
              </p>
              <footer className="mt-3 text-aside text-background/70">
                — Friedrich Nietzsche
              </footer>
            </blockquote>
            <p className="text-aside text-background/90">
              For more, check out our{" "}
              <InlineLink href={PAMPAM_URL}>PamPam map</InlineLink> of our favorite spots to eat,
              drink, and explore nearby!
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Build with us */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6">Build with us.</h2>
            <p className="text-body text-background/90 leading-relaxed mb-10">
              <InlineLink href={HELLO_FRACTAL_MAILTO} external={false}>
                hello@fractaltech.xyz
              </InlineLink>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 max-w-4xl mx-auto mb-12">
            {teamBios.map((bio) => (
              <div key={bio.name} className="flex flex-col gap-3">
                <div>
                  <p className="text-subtitle text-background normal-case">
                    {bio.name}
                  </p>
                  <p className="text-aside text-sm text-background/70">{bio.role}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-body text-background/80">
                  {bio.links.map((link, idx) => (
                    <span key={link.href} className="flex items-center gap-4">
                      {idx > 0 && <span aria-hidden className="text-background/30">·</span>}
                      <InlineLink href={link.href}>{link.label}</InlineLink>
                    </span>
                  ))}
                </div>
                <p className="text-body text-background/90 leading-relaxed">
                  <span className="text-background/60">Previously: </span>
                  {bio.previously}
                </p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 text-body text-background/90 leading-relaxed mb-10">
              <p>
                We built Fractal Campus to raise the aspirations of every founder and engineer
                looking for community. Instead of working solo, we want our members to find
                themselves in good company — with founders who are earnest about building something
                meaningful, students who are earnest about learning new skills, and researchers who
                share what they're learning.
              </p>
              <p>It's dangerous to build alone! Join us:</p>
            </div>

            <div className="flex flex-col gap-6 mb-10">
              <MembershipTiers />
            </div>

            <p className="text-aside text-background/70">
              P.S. Need to manage or cancel your membership?{" "}
              <InlineLink href={STRIPE_BILLING_URL}>You can do that here</InlineLink>.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* …by the way, what's Fractal? */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-40">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-title mb-6 normal-case">
              …by the way, what's Fractal?
            </h2>
            <div className="space-y-6 text-body text-background/90 leading-relaxed">
              <p>
                <strong className="font-semibold text-background">
                  <InlineLink href="/" external={false}>
                    Fractal
                  </InlineLink>
                </strong>{" "}
                is a loose collective of writers, designers, musicians, clowns, entrepreneurs,
                artists, coders, and scientists who decided to live within walking distance of each
                other in Brooklyn.
              </p>
              <p>
                Fractal is made up of 15+ affiliated co-living houses and has spawned a bunch of fun
                projects, including{" "}
                <InlineLink href={FRACTAL_U_URL}>Fractal University</InlineLink>, third spaces like{" "}
                <InlineLink href="https://merlins.place/">Merlin's Place</InlineLink>, and of course{" "}
                <InlineLink href="/campus" external={false}>
                  Fractal Campus
                </InlineLink>{" "}
                and{" "}
                <InlineLink href={FRACTAL_BOOTCAMP_URL}>Fractal Bootcamp</InlineLink>!
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
