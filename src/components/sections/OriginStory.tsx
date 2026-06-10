import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section className="py-10 md:py-16 overflow-hidden" id="story">
      <div className="max-w-5xl mx-auto px-[4.5%]">
        <FadeIn>
          <div className="space-y-4">
            <p className="text-body-lead">
              A {"\u201C"}fractal{"\u201D"} {"\u2013"} aka a {"\u201C"}neighborhood campus{"\u201D"} {"\u2013"} is a social template (like a {"\u201C"}church,{"\u201D"} {"\u201C"}college,{"\u201D"} or {"\u201C"}kibbutz{"\u201D"}).
            </p>
            <p className="text-body-lead">
              The focus of a fractal is on integrating all the aspects of a healthy adult life: work, hobbies, family life, partying, and friendship. This isn{"\u2019"}t anything new. In our grandparents{"\u2019"} time it was called civic society. It was extremely common to be a part of voluntary organizations with overlapping membership: trade unions, service clubs, churches, neighborhood associations, and so on. A fractal is just a structure for revitalizing this sort of active community living.
            </p>
            <p className="text-body-lead">
              The first of these was called Fractal NYC. In 2021, our small group of friends decided to live, learn, and build together in NYC. It started as just a single apartment with weekly dinners where people gave 5-minute talks.
            </p>
          </div>
        </FadeIn>
      </div>
      <FadeIn>
        <div className="max-w-5xl mx-auto px-[4.5%] mt-10 md:mt-16">
          <img
            src="/images/fractal-nyc-diagram.png"
            alt="Fractal NYC neighborhood campus diagram — four pillars around the Fractal Collective: Campus, Visit, Events, and Education (Fractal Tech and Fractal University)"
            className="block w-full h-auto mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </FadeIn>
    </section>
  );
}
