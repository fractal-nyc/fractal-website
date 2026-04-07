import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";

export function LiberalArts() {
  return (
    <section id="new-liberal-arts" className="py-24 md:py-40 bg-background">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <SectorHeader letter="N" name="New Liberal Arts" color="#C41E20" />
        <FadeIn>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-foreground/70 mb-16"
          >
            {"More information on the New Liberal Arts Launch coming June 2026"}
          </PretextParagraph>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h3 className="text-2xl md:text-3xl font-serif mb-6">Fractal U</h3>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-foreground/70 mb-6"
          >
            {"Fractal University offers in-person, community sections of world-class courses, for fun. We have courses in AI, computer science, friendship + community, NYC government, cooking, mind-body sciences, and more."}
          </PretextParagraph>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-foreground/70 mb-6"
          >
            {"We aim to democratize enjoyable, community education and public research culture by creating an easily replicable model for a decentralized university \u2014 and the economic, social, and creative opportunities they create."}
          </PretextParagraph>
          <PretextParagraph
            size={TEXT_SIZES.lg}
            className="text-foreground/70 mb-8"
          >
            {"The dream is 100s of writers, artists, and scientists and 1000s of great works to emerge from this program \u2014 but we are really in it just for the love of the game."}
          </PretextParagraph>

          <p className="font-serif text-base md:text-lg mb-4">
            <a
              href="https://fractaluniversity.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground/70 transition-colors"
            >
              Learn more here.
            </a>
          </p>
          <p className="font-serif text-base md:text-lg text-foreground/70">
            If you would like to offer a class as a TA or Instructor,{" "}
            <a
              href="https://airtable.com/appqj7FQhKgCdLnWM/shr23K8Sa62ptKc7Q"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 text-foreground hover:text-foreground/70 transition-colors"
            >
              apply here
            </a>
            .
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
