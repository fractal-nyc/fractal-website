import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  CreditCard,
  MessageCircle,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { HOUSES } from "@/data/houses";
import { MEMBER_LINKS } from "@/data/member-links";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { cn } from "@/lib/utils";

const CAMPUS_COLOR = HOUSES.find((h) => h.id === "campus")!.palette.deep;

function DestinationCta({
  href,
  children,
  featured = false,
}: {
  href: string;
  children: ReactNode;
  featured?: boolean;
}) {
  const external = /^https?:\/\//.test(href);
  const className = cn(
    "mt-2 w-full max-w-xs text-center whitespace-normal leading-snug",
    featured && "md:max-w-sm",
  );

  if (external) {
    return (
      <Button asChild className={className}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

function DestinationCard({
  icon: Icon,
  heading,
  body,
  cta,
  href,
  featured = false,
}: {
  icon: LucideIcon;
  heading: string;
  body: string;
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <article
      data-member-destination={featured ? "manage" : heading}
      className={cn(
        "relative flex min-w-0 flex-col gap-4 rounded-lg border p-7 text-left md:p-8",
        featured
          ? "border-[var(--color-house-campus-deep)] bg-[color-mix(in_srgb,var(--color-house-campus-deep)_10%,var(--color-background))] text-foreground"
          : "border-foreground-faint bg-background text-foreground",
      )}
    >
      {featured ? <CornerDecorations size="xs" opacity={0.15} /> : null}
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-house-campus-deep)_12%,transparent)] text-[var(--color-house-campus-deep)]"
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={1.5} />
        </span>
        <h2
          className={cn(
            "min-w-0 normal-case [overflow-wrap:anywhere]",
            featured ? "text-title" : "text-subtitle",
          )}
        >
          {heading}
        </h2>
      </div>
      <p className="text-body text-foreground-muted leading-relaxed [overflow-wrap:anywhere]">
        {body}
      </p>
      <DestinationCta href={href} featured={featured}>
        {cta}
      </DestinationCta>
    </article>
  );
}

export function MembersPage() {
  useDocumentMeta({
    title: "Fractal Campus Member Home",
    robots: "noindex, nofollow",
  });

  return (
    <main
      data-members-home
      className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-campus-deep)" } as CSSProperties}
    >
      <FractalPattern color={CAMPUS_COLOR} />
      <div className="relative z-10">
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
          <section className="w-full">
            <div className="page-gutter mx-auto max-w-2xl">
              <SectorHeader
                letter="M"
                name="Members"
                color="var(--color-house-campus-deep)"
              />
              <FadeIn>
                <div className="text-center mb-10 md:mb-14">
                  <h1 className="text-display text-foreground mb-4 [overflow-wrap:anywhere]">
                    Fractal Campus Member Home
                  </h1>
                  <p className="text-body-lead text-foreground-muted normal-case">
                    Everything you need as a Fractal Campus coworking member.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.05}>
                <DestinationCard
                  featured
                  icon={CreditCard}
                  heading="Manage your membership"
                  body="Update your payment method, view invoices, make changes to your membership, or cancel."
                  cta="Manage membership"
                  href={MEMBER_LINKS.manageMembership}
                />
              </FadeIn>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <FadeIn delay={0.08}>
                  <DestinationCard
                    icon={BookOpen}
                    heading="Member Guide"
                    body="Everything you need to know about using the space."
                    cta="View member guide"
                    href={MEMBER_LINKS.memberGuide}
                  />
                </FadeIn>
                <FadeIn delay={0.1}>
                  <DestinationCard
                    icon={Calendar}
                    heading="Upcoming events"
                    body="See what's happening at Fractal and RSVP to upcoming events."
                    cta="See upcoming events"
                    href={MEMBER_LINKS.events}
                  />
                </FadeIn>
                <FadeIn delay={0.12}>
                  <DestinationCard
                    icon={Users}
                    heading="Meet people"
                    body="Want more serendipity at Fractal? Join the Fractal community on Cuties. A profile is optional — it just makes it easier for us and other members to know who you are, what you're looking for, and who we should introduce you to."
                    cta="Join us on Cuties"
                    href={MEMBER_LINKS.cuties}
                  />
                </FadeIn>
                <FadeIn delay={0.14}>
                  <DestinationCard
                    icon={MessageCircle}
                    heading="Community chat"
                    body="Talk with other members and keep up with the community."
                    cta="Open Discord"
                    href={MEMBER_LINKS.discord}
                  />
                </FadeIn>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </main>
  );
}
