import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { Button } from "@/components/ui/button";
import { MeetTheSpaceCarousel } from "@/components/sections/MeetTheSpaceCarousel";
import { HighlightBox } from "@/components/content/HighlightBox";
import { OutboundLink } from "@/components/content/OutboundLink";
import { cn } from "@/lib/utils";
import { MEMBERS_HOME_PATH, MEMBER_LINKS } from "@/data/member-links";

const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const FRACTAL_U_URL = "https://fractaluniversity.substack.com/";
const FRACTAL_ACCELERATOR_URL = "https://go.fractalaccelerator.com/fractalnycwebsite";
const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";
const STRIPE_PARTTIME_URL = "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G";
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/111+Conselyea+St,+Brooklyn,+NY+11211/";
const CAMPUS_MAILTO = "mailto:campus@fractalnyc.com";
const CAMPUS_TOUR_URL =
  "https://general-fractal-corporation.cal.com/general-fractal-corporation/fractal-campus-tour";
const DISCORD_URL = "https://discord.gg/Er974gPTXe";

function InlineLink({
  href,
  children,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <OutboundLink href={href} variant="inline" tone="dark" className="font-semibold" {...(!external ? { target: undefined, rel: undefined } : {})}>
      {children}
    </OutboundLink>
  );
}

// FRAC-53: the two membership tiers, rendered as HighlightBox cards so the
// price and the access rule stay with the tier name (the reference site lists
// both) instead of being compressed into button chrome.
const membershipTiers = [
  {
    name: "Full-time membership",
    price: "$300/mo",
    access: "Unlimited 24/7 access.",
    href: STRIPE_FULLTIME_URL,
  },
  {
    name: "Part-time membership",
    price: "$150/mo",
    access: "Choose your hours — up to 20 hrs per week.",
    href: STRIPE_PARTTIME_URL,
  },
];

const amenities = [
  "Soundproof phone booths",
  "Stocked kitchen w/ espresso machine",
  "Cozy lounge + library for relaxing and chatting",
  "3D printer and tool library",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
];

const acceleratorOutcomes = [
  "Ship real personal software — tools, dashboards, automations, and workflows — starting from nothing but a plain-language description of what you want",
  "Build an AI agent that knows your work, learns your preferences, and takes action across your email, calendar, and the rest of your apps",
  "Set up a computer that keeps working when you walk away, with agents running in the background and reachable from your phone",
];

// TODO: the design references dedicated overview photos
// (images/campus/overview-workspace.png + overview-lounge.png) which don't
// exist yet. Until those are shot, the Overview section stays text-only — the
// Meet the Space carousel further down already carries the photography load.

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
  const widthClass = fullWidth ? "w-full" : "w-full sm:max-w-xs";
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

export type MembershipButtonGroupLayout = "responsive" | "stacked" | "side-by-side";

/**
 * The two Stripe membership CTAs as a button pair. Not rendered on /campus —
 * the page uses `MembershipTiers` so each tier keeps its price and access rule
 * — but kept as a catalog specimen (`components/catalog/registry.tsx`).
 */
export function MembershipButtonGroup({ layout = "responsive" }: { layout?: MembershipButtonGroupLayout }) {
  const layoutClass = layout === "stacked"
    ? "flex-col"
    : layout === "side-by-side"
      ? "flex-row"
      : "flex-col md:flex-row";
  return (
    <div className="w-full">
      <div className={`flex ${layoutClass} gap-4 items-stretch w-full`} data-membership-layout={layout}>
        {membershipTiers.map((tier) => (
          <PrimaryButton key={tier.name} href={tier.href} fullWidth>
            <span className="flex flex-col items-center gap-1">
              <span>{tier.name}</span>
              <span className="opacity-80">{tier.price}</span>
            </span>
          </PrimaryButton>
        ))}
      </div>
    </div>
  );
}

/** The two priced membership tiers. Rendered once, in Coworking. */
export function MembershipTiers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
      {membershipTiers.map((tier) => (
        <HighlightBox
          key={tier.name}
          eyebrow={tier.price}
          title={tier.name}
          description={`${tier.access} Sign up here.`}
          href={tier.href}
          accessibleName={`${tier.name} — ${tier.price}, sign up`}
        />
      ))}
    </div>
  );
}

export function Campus() {
  return (
    <section id="campus" className="text-background">
      {/* Hero */}
      <div className="flex flex-col items-center justify-start pt-16 md:pt-24 pb-24 md:pb-32 w-full">
        <div className="page-gutter w-full">
          <FadeIn>
            <SectorHeader
              letter="C"
              name="Campus"
              color="var(--color-house-campus-deep)"
            />
          </FadeIn>

          <FadeIn>
            {/* max-w-3xl (not 4xl) so the display line clears the flanking
                CAMPUS banners at laptop widths. */}
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-subtitle text-background/90 mb-6 normal-case">
                <InlineLink href={GOOGLE_MAPS_URL}>
                  111 Conselyea St, Brooklyn, NY
                </InlineLink>
              </p>
              <p className="text-body-lead text-background/90 text-center mb-8">
                First time here? Drop by for free!{" "}
                <InlineLink href={CAMPUS_TOUR_URL}>
                  Sign up for a guided tour here
                </InlineLink>
                . Email{" "}
                <InlineLink href={CAMPUS_MAILTO} external={false}>
                  campus@fractalnyc.com
                </InlineLink>{" "}
                with any questions about memberships.
              </p>
              <div className="flex flex-col gap-4 items-center max-w-2xl mx-auto">
                <MembershipButtonGroup />
                <PrimaryButton href={DISCORD_URL}>Join our Discord</PrimaryButton>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <p className="text-title leading-tight mb-8 normal-case">
              A <span className="italic">campus</span> in the heart of
              Williamsburg.
            </p>
            <p className="text-body-lead text-background mb-6">
              Fractal Campus is a meeting place in the heart of Williamsburg
              for builders, creators, and technologists to do their most
              ambitious work. We run an{" "}
              <InlineLink href={FRACTAL_ACCELERATOR_URL}>
                AI training program
              </InlineLink>{" "}
              and host{" "}
              <InlineLink href={LUMA_EVENTS_URL}>
                daily community events
              </InlineLink>
              .
            </p>
            <p className="text-body-lead text-background">
              The Campus is 4000+ sq ft of indoor space — coworking floors, two
              kitchens, and a communal lounge — plus a 5000 sq ft private roof
              deck.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Coworking */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-title mb-6 normal-case">Coworking</h2>
            <p className="text-body-lead text-background">
              Drop by for free to see our space.{" "}
              <InlineLink href={CAMPUS_TOUR_URL}>
                Book a guided tour
              </InlineLink>{" "}
              or email{" "}
              <InlineLink href={CAMPUS_MAILTO} external={false}>
                campus@fractalnyc.com
              </InlineLink>{" "}
              to plan a visit.
            </p>
            <p className="mt-6 text-body-lead text-background">
              We offer two kinds of membership:
            </p>
            <div className="mt-6">
              <MembershipTiers />
            </div>
            <p className="mt-10 text-body text-background">
              All members have access to:
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body text-background">
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

      {/* Events */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-title mb-6 normal-case">Events</h2>
            <p className="text-body-lead text-background">
              Our community hosts events nearly every day — talks, demo nights,
              dinners, reading groups, and hackathons. Community members also
              teach their own classes on Campus through{" "}
              <InlineLink href={FRACTAL_U_URL}>Fractal U</InlineLink>.
            </p>
            <div className="mt-8 flex justify-center sm:justify-start">
              <PrimaryButton href={LUMA_EVENTS_URL}>See upcoming events</PrimaryButton>
            </div>
            <h3 className="mt-12 text-subtitle text-background normal-case font-semibold">
              Host your own event
            </h3>
            <p className="mt-3 text-body-lead text-background">
              Anyone can host an event in our space, even non-members.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
              <HighlightBox
                eyebrow="Free events"
                title="Add it to our Luma calendar"
                description="Post your event directly to the Fractal calendar and the community will see it."
                href={LUMA_EVENTS_URL}
                accessibleName="Add a free event to the Luma calendar"
              />
              <HighlightBox
                eyebrow="Paid events"
                title="Email us"
                description="Send campus@fractalnyc.com what you have in mind and we'll work out the space and the details."
                href={CAMPUS_MAILTO}
                accessibleName="Email us about hosting a paid event"
              />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* AI Accelerator */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-title mb-6 normal-case">AI Accelerator</h2>
            <p className="text-body-lead text-background">
              We run an AI training program. Our program teaches you how to:
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-y-3 text-body text-background">
              {acceleratorOutcomes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-background/50">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <PrimaryButton href={FRACTAL_ACCELERATOR_URL}>
                Apply to the Accelerator
              </PrimaryButton>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Meet the Space */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-title mb-6 normal-case">Meet the Space</h2>
            <p className="text-body-lead text-background">
              4000+ sq ft of open working space, kitchens, phone booths, and
              large meeting rooms. Oh, and a giant, sunny 5000 sq ft rooftop —
              decorated with an eye towards creativity, focus, and sunny vibes.
            </p>
          </div>
        </FadeIn>
        <FadeIn>
          <MeetTheSpaceCarousel photos={campusPhotos} />
        </FadeIn>
      </div>

      {/* Stay in the Loop */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-40 text-center">
        <FadeIn>
          <p className="text-display text-background mb-6">Stay in the Loop</p>
          <div className="flex justify-center">
            <PrimaryButton href={DISCORD_URL}>Join our Discord</PrimaryButton>
          </div>
        </FadeIn>
      </div>

      {/* Already a member? */}
      <div className="max-w-7xl mx-auto page-gutter pb-24 md:pb-40 text-center">
        <FadeIn>
          <p className="text-display text-background mb-6">Already a member?</p>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center w-full max-w-2xl mx-auto">
            <PrimaryButton href={MEMBERS_HOME_PATH} external={false}>
              View Member Handbook
            </PrimaryButton>
            <PrimaryButton href={MEMBER_LINKS.manageMembership}>
              Manage Membership
            </PrimaryButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
