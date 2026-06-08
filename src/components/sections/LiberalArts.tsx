import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { Button } from "@/components/ui/button";

export function LiberalArts() {
  return (
    <section id="new-liberal-arts" className="flex flex-col items-center pt-16 pb-24 md:pt-24 overflow-x-hidden" style={{ color: "#fff" }}>
      <div className="w-full px-6 md:px-[4.5%] text-center">
        <SectorHeader letter="E" name="Education" color="#C41E20" />
        <FadeIn>
          <p className="text-display mb-4 md:mb-6 text-center">
            Tech, Entrepreneurship, Rhetoric, Civics
          </p>
        </FadeIn>
        <FadeIn>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-white/90 mb-8"
          >
            {"More information on the Education house launch coming June 2026"}
          </PretextParagraph>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="text-left max-w-3xl mx-auto">
            <h3 className="text-subtitle mb-6 normal-case">Fractal U</h3>
            <PretextParagraph
              size={TEXT_SIZES.lg}
              className="text-white/90 mb-8"
            >
              {"Fractal University offers in-person, community sections of world-class courses, for fun. We have courses in AI, computer science, friendship + community, NYC government, cooking, mind-body sciences, and more."}
            </PretextParagraph>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center items-center">
              <Button asChild className="max-w-xs w-full text-center">
                <a
                  href="https://fractaluniversity.substack.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </a>
              </Button>
              <Button asChild className="max-w-xs w-full text-center">
                <a
                  href="https://airtable.com/appqj7FQhKgCdLnWM/shr23K8Sa62ptKc7Q"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply as Instructor
                </a>
              </Button>
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
