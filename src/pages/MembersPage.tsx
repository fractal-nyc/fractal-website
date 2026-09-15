import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/content/OutboundLink";
import { HOUSES } from "@/data/houses";
import { MEMBER_GUIDE_WIFI } from "@/data/member-guide";
import { MEMBER_LINKS } from "@/data/member-links";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const CAMPUS_COLOR = HOUSES.find((h) => h.id === "campus")!.palette.deep;

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-subtitle normal-case text-foreground">{title}</h2>
      <div className="flex flex-col gap-3 text-body text-foreground-muted leading-relaxed [overflow-wrap:anywhere]">
        {children}
      </div>
    </section>
  );
}

function ManageMembershipButton({ className }: { className?: string }) {
  return (
    <Button asChild className={className ?? "w-full max-w-xs text-center"}>
      <a
        href={MEMBER_LINKS.manageMembership}
        target="_blank"
        rel="noopener noreferrer"
      >
        Manage membership
      </a>
    </Button>
  );
}

export function MembersPage() {
  useDocumentMeta({
    title: "Member Guide",
    robots: "noindex, nofollow",
  });

  return (
    <main
      data-members-home
      data-member-guide
      className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-campus-deep)" } as CSSProperties}
    >
      <FractalPattern color={CAMPUS_COLOR} />
      <div className="relative z-10">
        <div className="flex flex-col items-stretch pt-8 pb-20 md:pt-10 md:pb-28 w-full">
          <article className="page-gutter mx-auto max-w-2xl w-full">
            <FadeIn>
              <h1 className="text-title whitespace-nowrap text-foreground mb-8 md:mb-10">
                Member Guide
              </h1>
            </FadeIn>

            <div className="flex flex-col gap-10 text-left">
              <FadeIn delay={0.04}>
                <GuideSection title="Membership">
                  <p>
                    To cancel or change your membership, update your payment
                    method, or view invoices, use Stripe.
                  </p>
                  <ManageMembershipButton />
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.06}>
                <GuideSection title="Hours and access">
                  <p>
                    Campus is open 24/7. Part-time members can use the space for
                    up to 20 hours a week.
                  </p>
                  <p>
                    After hours, let yourself in with the pin code from your
                    member email.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.08}>
                <GuideSection title="Kitchens">
                  <p>
                    Both kitchens are open to members. You are welcome to use
                    all of the appliances, including the coffee machines.
                  </p>
                  <p>
                    There are no restrictions on what you can leave in the
                    fridge or pantry. Label food with your name and an expiry
                    date, and do not leave open containers in the pantry. The
                    kitchen and pantry are cleaned from time to time; unlabeled
                    or expired food will be thrown out.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.1}>
                <GuideSection title="Desks">
                  <p>
                    All desks are available unless they are labeled with a name
                    and a reserved sign.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.12}>
                <GuideSection title="Call booths">
                  <p>
                    The call booths in the back are free for members. To reserve
                    one ahead of time, use the time sheets on the doors.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.14}>
                <GuideSection title="Events">
                  <p>
                    Members can host events on the Fractal{" "}
                    <OutboundLink href={MEMBER_LINKS.events} variant="inline">
                      Luma calendar
                    </OutboundLink>
                    . Choose a date that does not already have an event, then
                    submit it for approval.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.16}>
                <GuideSection title="Quiet hours">
                  <p>
                    Keep loud noise to a minimum after 8pm, out of consideration
                    for the neighbors downstairs.
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.18}>
                <GuideSection title="Wi-Fi">
                  <p>
                    Network{" "}
                    <span className="font-mono text-foreground">
                      {MEMBER_GUIDE_WIFI.network}
                    </span>
                    . Password{" "}
                    <span className="font-mono text-foreground">
                      {MEMBER_GUIDE_WIFI.password}
                    </span>
                    .
                  </p>
                </GuideSection>
              </FadeIn>

              <FadeIn delay={0.2}>
                <GuideSection title="Community">
                  <p>
                    See upcoming events and RSVP on{" "}
                    <OutboundLink href={MEMBER_LINKS.events} variant="inline">
                      Luma
                    </OutboundLink>
                    . Community chat is on{" "}
                    <OutboundLink href={MEMBER_LINKS.discord} variant="inline">
                      Discord
                    </OutboundLink>
                    .
                  </p>
                  <p>
                    Want more serendipity?{" "}
                    <OutboundLink href={MEMBER_LINKS.cuties} variant="inline">
                      Cuties
                    </OutboundLink>{" "}
                    is optional — a profile makes it easier for us and other
                    members to know who you are and who to introduce you to, but
                    you do not need one to be a Campus member.
                  </p>
                </GuideSection>
              </FadeIn>
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  );
}
