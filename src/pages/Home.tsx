import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { OriginStory } from "@/components/sections/OriginStory";
import { FractalDiagram } from "@/components/sections/FractalDiagram";
import { StoryGallery } from "@/components/sections/StoryGallery";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { SECTIONS } from "@/data/houses";

// The Story identity is a GOLD PAIR, not a single accent (see houses.ts):
//   light #D4BA58 — decoration only. Fails WCAG as small text on cream.
//   deep  #a08a2e — the member that may carry text.
// FractalPattern takes a JS string color, so it reads the literal from SECTIONS
// rather than a var() — the repo convention for non-CSS color consumers.
const STORY_LIGHT = SECTIONS.story.light;
const STORY_DEEP = SECTIONS.story.deep;

const DISCORD_URL = "https://discord.gg/Er974gPTXe";
const IAN_CHAT_URL =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0ektkyvH1NQIxPdiKXPASm0WqwG7ee6QKJCDPIarnT5mS_WvLqDLaBb8Pk_va_YlVRXz6DRwnb";

const CALLOUT_LINK =
  "text-foreground underline underline-offset-[3px] decoration-foreground/35 hover:decoration-foreground transition-colors";

export function Home() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-foreground selection:text-background"
      style={
        {
          "--accent": "var(--color-section-story-deep)",
          "--page-bg": "var(--color-background)",
        } as CSSProperties
      }
    >
      <FractalPattern color={STORY_LIGHT} />

      <div className="relative z-10">
        <Navbar />

        {/* The 3D octahedron hero over the NYC skyline backdrop. */}
        <Hero />

        {/* ---------------------------------------------------------------
            Story — folded into Home (it no longer has a page of its own).
            --------------------------------------------------------------- */}
        <section className="relative flex flex-col items-center pt-24">
          {/*
            Flanking favicon watermarks. Decorative brand framing pinned to the
            page edges so it never constrains the heading's measure.
            Design rule: hidden at ≤700px, where they'd crowd the headline.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-52 z-0 hidden items-center justify-between min-[701px]:flex"
            style={{ height: "min(46vh, 380px)" }}
          >
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-auto w-[14%] max-w-[260px]" />
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-auto w-[14%] max-w-[260px]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl px-[4.5%]">
            {/*
              Sector header. NOT <SectorHeader/>: that component paints the
              letter and the label the SAME color, and here they must differ.
              DEVIATION FROM DESIGN (deliberate): the design gives both the big
              "S" and the small mono "Story" label the light gold #D4BA58. Light
              gold on cream fails WCAG AA at 14px, so the label takes the DEEP
              gold (#a08a2e) instead. The decorative "S" — huge, non-essential,
              and not carrying meaning on its own — keeps the light gold.
            */}
            <FadeIn>
              <div className="mb-12 text-center">
                <span
                  aria-hidden="true"
                  className="block leading-none"
                  style={{
                    fontFamily: "'Jacquard 24', serif",
                    fontSize: "clamp(7rem, 14vw, 14rem)",
                    color: STORY_LIGHT,
                  }}
                >
                  S
                </span>
                <span className="text-label" style={{ color: STORY_DEEP }}>
                  Story
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-display mb-12 text-center">
                From a Single Apartment to a Neighborhood Campus
              </h1>
            </FadeIn>
          </div>
        </section>

        <OriginStory />

        <FractalDiagram />

        <section className="mx-auto max-w-5xl px-[4.5%] pt-5 pb-24">
          <FadeIn>
            <p className="text-body-lead">
              In 2025, we taught an online class helping small groups of friends
              create their own neighborhood campuses. That lead to{" "}
              <a
                href="https://fractalgva.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className={CALLOUT_LINK}
              >
                Fractal Geneva
              </a>
              ,{" "}
              <a
                href="https://fractal.boston/"
                target="_blank"
                rel="noopener noreferrer"
                className={CALLOUT_LINK}
              >
                Fractal Boston
              </a>
              , and half a dozen other campuses worldwide.
            </p>
          </FadeIn>
        </section>

        <StoryGallery />

        {/* Curious about Fractal? — Discord + a 1:1 with Ian. */}
        <section className="pb-24">
          <div className="mx-auto max-w-xl px-[4.5%]">
            <FadeIn>
              <div
                className="rounded-md border border-foreground-faint px-8 py-7 text-foreground"
                // 0x14 == 8% alpha — the gold wash behind the callout. JS string
                // color, so it takes the literal from SECTIONS (see above).
                style={{ backgroundColor: `${STORY_LIGHT}14` }}
              >
                <p className="text-label mb-3" style={{ color: STORY_DEEP }}>
                  Curious about Fractal?
                </p>
                <p className="text-body leading-relaxed text-foreground/85">
                  Join our{" "}
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CALLOUT_LINK}
                  >
                    Discord
                  </a>{" "}
                  and say hi. Or if you prefer a one-on-one conversation,{" "}
                  <a
                    href={IAN_CHAT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CALLOUT_LINK}
                  >
                    schedule a virtual chat with Ian
                  </a>
                  .
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
