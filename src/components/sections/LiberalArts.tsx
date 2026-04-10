import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

export function LiberalArts() {
  return (
    <section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden" style={{ color: "#fff" }}>
      <div className="w-full px-6 md:px-[4.5%] text-center">
        <SectorHeader letter="LA" name="New Liberal Arts" color="#C41E20" />
        <FadeIn>
          <p className="font-serif text-2xl sm:text-4xl md:text-6xl leading-[1.3] mb-4 md:mb-6 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
            Tech, Entrepreneurship, Rhetoric, Civics
          </p>
        </FadeIn>
        <FadeIn>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-white/90 mb-8"
          >
            {"More information on the New Liberal Arts Launch coming June 2026"}
          </PretextParagraph>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="text-left max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-serif mb-6 normal-case">Fractal U</h3>
            <PretextParagraph
              size={TEXT_SIZES.lg}
              className="text-white/90 mb-8"
            >
              {"Fractal University offers in-person, community sections of world-class courses, for fun. We have courses in AI, computer science, friendship + community, NYC government, cooking, mind-body sciences, and more."}
            </PretextParagraph>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center items-center">
              <a
                href="https://fractaluniversity.substack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
              >
                <CornerDecorations size="xs" />
                Learn More
              </a>
              <a
                href="https://airtable.com/appqj7FQhKgCdLnWM/shr23K8Sa62ptKc7Q"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
              >
                <CornerDecorations size="xs" />
                Apply as Instructor
              </a>
            </div>

            <PretextParagraph
              size={TEXT_SIZES.lg}
              className="text-white/90 mb-6"
            >
              {"We aim to democratize enjoyable, community education and public research culture by creating an easily replicable model for a decentralized university \u2014 and the economic, social, and creative opportunities they create."}
            </PretextParagraph>
            <PretextParagraph
              size={TEXT_SIZES.lg}
              className="text-white/90"
            >
              {"The dream is 100s of writers, artists, and scientists and 1000s of great works to emerge from this program \u2014 but we are really in it just for the love of the game."}
            </PretextParagraph>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
