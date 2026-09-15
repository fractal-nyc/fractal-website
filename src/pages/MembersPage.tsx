import type { CSSProperties, ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/content/OutboundLink";
import { MEMBER_GUIDE_WIFI } from "@/data/member-guide";
import { MEMBER_LINKS } from "@/data/member-links";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

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
      <Navbar />
      <div className="flex flex-col items-stretch pt-24 pb-16 md:pt-28 md:pb-20 w-full">
        <article className="page-gutter mx-auto max-w-2xl w-full">
          <h1 className="text-title whitespace-nowrap text-foreground mb-6">
            Member Guide
          </h1>

          <div className="flex flex-col gap-10 text-left">
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

            <GuideSection title="Kitchens">
              <p>
                You are welcome to use all of the appliances, including the
                coffee machines.
              </p>
              <p>
                You may leave food in the fridge and pantry. Label food with
                your name and an expiry date, and do not leave open containers
                in the pantry. The kitchen and pantry are cleaned from time to
                time; unlabeled or expired food will be thrown out.
              </p>
            </GuideSection>

            <GuideSection title="Desks">
              <p>
                All desks are available unless they are labeled with a name
                and a reserved sign.
              </p>
            </GuideSection>

            <GuideSection title="Call booths">
              <p>
                The call booths in the back are free for members. To reserve
                one ahead of time, use the time sheets on the doors.
              </p>
            </GuideSection>

            <GuideSection title="Events">
              <p>
                Members can host events on the Fractal{" "}
                <OutboundLink href={MEMBER_LINKS.events} variant="inline">
                  Luma calendar
                </OutboundLink>
                . Choose a date and time that does not already have an event,
                then submit it for approval by clicking “Submit Event”.
              </p>
            </GuideSection>

            <GuideSection title="Quiet hours">
              <p>
                Keep loud noise to a minimum after 8pm, out of consideration
                for the neighbors downstairs.
              </p>
            </GuideSection>

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

            <GuideSection title="Community">
              <p>
                See upcoming events on{" "}
                <OutboundLink href={MEMBER_LINKS.events} variant="inline">
                  Luma
                </OutboundLink>
                . Say hi and ask questions on{" "}
                <OutboundLink href={MEMBER_LINKS.discord} variant="inline">
                  Discord
                </OutboundLink>
                .
              </p>
              <p>
                Want to make friends, find collaborators, or look for love?
                Join the Fractal community on{" "}
                <OutboundLink href={MEMBER_LINKS.cuties} variant="inline">
                  Cuties
                </OutboundLink>
                .
              </p>
            </GuideSection>

            <GuideSection title="Membership Changes">
              <ManageMembershipButton />
            </GuideSection>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  );
}
