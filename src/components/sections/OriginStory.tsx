import { FadeIn } from "@/components/ui/FadeIn";

/**
 * OriginStory — the three-paragraph "what is a fractal" narrative that opens the
 * Story block on the home page. The fractal diagram that used to live at the
 * bottom of this section is now its own component (FractalDiagram), composed by
 * Home directly, so the prose and the lockup can carry their own spacing.
 */
export function OriginStory() {
  return (
    <section className="overflow-hidden pt-10 pb-16 md:pb-28" id="story">
      {/* max-w-5xl = 1024px — the design's prose measure. */}
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-[4.5%]">
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
    </section>
  );
}
