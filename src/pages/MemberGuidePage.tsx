import type { CSSProperties } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/content/OutboundLink";
import { HOUSES } from "@/data/houses";
import {
  MEMBER_GUIDE_ACCESS,
  MEMBER_GUIDE_ADDRESS,
  MEMBER_GUIDE_AMENITIES,
  MEMBER_GUIDE_CONTACT,
} from "@/data/member-guide";
import { MEMBER_LINKS, MEMBERS_HOME_PATH } from "@/data/member-links";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const CAMPUS_COLOR = HOUSES.find((h) => h.id === "campus")!.palette.deep;

export function MemberGuidePage() {
  useDocumentMeta({
    title: "Member Guide — Fractal Campus",
    robots: "noindex, nofollow",
  });

  return (
    <main
      data-member-guide
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
                letter="G"
                name="Guide"
                color="var(--color-house-campus-deep)"
              />
              <FadeIn>
                <div className="text-center mb-10 md:mb-14">
                  <h1 className="text-display text-foreground mb-4">
                    Member Guide
                  </h1>
                  <p className="text-body-lead text-foreground-muted normal-case">
                    Everything you need to know about using the space.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.05}>
                <div className="flex flex-col gap-10 text-left">
                  <section>
                    <h2 className="text-subtitle mb-3 normal-case">Where it is</h2>
                    <p className="text-body text-foreground-muted leading-relaxed">
                      Fractal Campus is at{" "}
                      <OutboundLink
                        href={MEMBER_GUIDE_ADDRESS.mapsUrl}
                        variant="inline"
                      >
                        {MEMBER_GUIDE_ADDRESS.label}
                      </OutboundLink>
                      .
                    </p>
                  </section>

                  <section>
                    <h2 className="text-subtitle mb-3 normal-case">Access</h2>
                    <ul className="flex flex-col gap-3 text-body text-foreground-muted">
                      {MEMBER_GUIDE_ACCESS.map((item) => (
                        <li key={item.name} className="flex gap-3">
                          <span aria-hidden className="text-foreground-faint">
                            —
                          </span>
                          <span>
                            <span className="text-foreground">{item.name}.</span>{" "}
                            {item.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-subtitle mb-3 normal-case">
                      What members can use
                    </h2>
                    <ul className="flex flex-col gap-3 text-body text-foreground-muted">
                      {MEMBER_GUIDE_AMENITIES.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="text-foreground-faint">
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-subtitle mb-3 normal-case">Questions</h2>
                    <p className="text-body text-foreground-muted leading-relaxed">
                      For Wi-Fi, guests, meeting rooms, or anything else about
                      using the space, email {MEMBER_GUIDE_CONTACT.name} (
                      <OutboundLink
                        href={MEMBER_GUIDE_CONTACT.mailto}
                        variant="inline"
                        target={undefined}
                        rel={undefined}
                      >
                        {MEMBER_GUIDE_CONTACT.email}
                      </OutboundLink>
                      ). This guide only lists what is already on the public
                      Campus page — we do not invent house rules here.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-subtitle mb-3 normal-case">Also useful</h2>
                    <p className="text-body text-foreground-muted leading-relaxed">
                      Upcoming events live on{" "}
                      <OutboundLink href={MEMBER_LINKS.events} variant="inline">
                        Luma
                      </OutboundLink>
                      . Community chat is on{" "}
                      <OutboundLink href={MEMBER_LINKS.discord} variant="inline">
                        Discord
                      </OutboundLink>
                      . Billing is under Manage membership on the member home.
                    </p>
                  </section>

                  <div className="pt-2">
                    <Button asChild className="w-full max-w-xs text-center">
                      <Link href={MEMBERS_HOME_PATH}>Back to member home</Link>
                    </Button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </main>
  );
}
