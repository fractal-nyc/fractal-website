import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section className="py-10 md:py-16 overflow-hidden" id="story">
      <div className="max-w-5xl mx-auto page-gutter">
        <FadeIn>
          <div className="space-y-4">
            <p className="text-body-lead">
              A {"“"}fractal{"”"} {"–"} aka a {"“"}neighborhood campus{"”"} {"–"} is a social template (like a {"“"}church,{"”"} {"“"}college,{"”"} or {"“"}kibbutz{"”"}).
            </p>
            <p className="text-body-lead">
              The focus of a fractal is on integrating all the aspects of a healthy adult life: work, hobbies, family life, partying, and friendship. This isn{"’"}t anything new. In our grandparents{"’"} time it was called civic society. It was extremely common to be a part of voluntary organizations with overlapping membership: trade unions, service clubs, churches, neighborhood associations, and so on. A fractal is just a structure for revitalizing this sort of active community living.
            </p>
            <p className="text-body-lead">
              The first of these was called Fractal NYC. In 2021, our small group of friends decided to live, learn, and build together in NYC. It started as just a single apartment with weekly dinners where people gave 5-minute talks.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* The original Story-page diagram — a static illustration. (Kept per
          operator request over the newer generated pentagon. The baked-in
          labels still read the pre-rename "Visit"; refresh the PNG later.) */}
      <FadeIn>
        <div className="max-w-5xl mx-auto page-gutter mt-10 md:mt-16">
          <img
            src="/images/fractal-nyc-diagram.png"
            alt="Fractal NYC neighborhood campus diagram — four pillars around the Fractal Collective: Campus, Visit, Events, and Education (Fractal Tech and Fractal University)"
            className="block w-full h-auto mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </FadeIn>

      <div className="max-w-5xl mx-auto page-gutter mt-5 md:mt-8">
        <FadeIn>
          <p className="text-body-lead">
            In 2025, we taught an online class helping small groups of friends create their own neighborhood campuses. That lead to{" "}
            <a
              href="https://fractalgva.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground transition-colors"
            >
              Fractal Geneva
            </a>
            ,{" "}
            <a
              href="https://fractal.boston/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground transition-colors"
            >
              Fractal Boston
            </a>
            , and half a dozen other campuses worldwide.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
