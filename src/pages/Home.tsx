import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
// FRAC-161: below-hero banner grid hidden on home. To restore, uncomment this
// import and the <HouseBannerGrid /> line below.
// import { HouseBannerGrid } from "@/components/house/HouseBannerGrid";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";
import { useEffect } from "react";

export function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <Hero />
      {/* FRAC-161: <HouseBannerGrid /> hidden on home. */}

      {/* Golden Age Protocol */}
      <section className="bg-background px-[4.5%] py-40 md:py-60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <FadeIn>
            <h2
              className="font-serif text-5xl md:text-7xl leading-[1.3] display-roman"
            >
              A Golden<br />Age Protocol
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}>
              <p>
                From the{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Founding_Fathers_of_the_United_States#Historical_founders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Founding Fathers
                </a>{" "}
                to{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Bell_Labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Bell Labs
                </a>
                ,{" "}
                <a
                  href="https://www.ycombinator.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  YCombinator
                </a>{" "}
                to{" "}
                <a
                  href="https://en.wikipedia.org/wiki/History_of_Florence#Role_in_art,_literature,_music_and_science"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Renaissance Florence
                </a>
                , tight networks of collaborators have produced innovations
                and institutions that we now take for granted.
              </p>
              <p>
                Brian Eno gives these flowerings of collective genius a name:{" "}
                <a
                  href="https://kk.org/thetechnium/scenius-or-comm/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  <em>scenius</em>
                </a>
                . Scenius tends to blossom under particular
                conditions that we believe are replicable. Namely: close proximity
                and a culture of lively collaboration.
              </p>
              <p>
                Fractals are designed to replicate these conditions. Our greatest
                hope is that this program will lead to sceniuses popping up all
                over the world.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
