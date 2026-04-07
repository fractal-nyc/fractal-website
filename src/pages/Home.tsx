import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HouseBannerGrid } from "@/components/house/HouseBannerGrid";
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
      <HouseBannerGrid />

      {/* Vision Quote */}
      <section className="bg-[#faf8f5] px-6 md:px-[8%] py-16 md:py-24">
        <FadeIn className="max-w-4xl mx-auto text-center">
          <blockquote className="font-serif text-lg md:text-xl lg:text-2xl leading-relaxed text-foreground/80 italic text-pretty">
            <span className="not-italic font-semibold">&ldquo;Is there a vision?&rdquo;</span>{" "}
            Many of us want to help improve the creative and civic culture in NYC
            &mdash; housing, energy, art, community, flourishing &mdash; but some
            are just here to live a well-rounded life.
          </blockquote>
        </FadeIn>
      </section>

      {/* How Can I Help / Get Involved */}
      <section className="bg-[#faf8f5] px-6 md:px-[8%] pb-20 md:pb-28">
        <FadeIn>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-8 text-center uppercase">
            How Can I Help / Get Involved?
          </h2>
        </FadeIn>

        <div className="max-w-4xl mx-auto space-y-10">
          <FadeIn delay={0.1}>
            <p className="text-sm md:text-base leading-relaxed text-foreground/85">
              Glad you asked! One way to help is to{" "}
              <a
                href="https://hcb.hackclub.com/donations/start/fractal"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                donate to Fractal
              </a>{" "}
              which helps fund our non-commercial activities like writing, giving
              talks, and going on podcasts.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-sm md:text-base leading-relaxed text-foreground/85 mb-4">
              If you&rsquo;re in NYC, here is other help we seek:
            </p>

            <ul className="space-y-6">
              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We receive hundreds of inbound housing requests per year and we
                can&rsquo;t accommodate them all. We would love for someone to build
                the equivalent of{" "}
                <a
                  href="https://www.directorysf.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  directorysf.com
                </a>{" "}
                but for New York City and our extended social scene. If you want to
                build this, we are happy to give you guidance and help promote it.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We would love for someone to host FractalFest, and for someone to
                host Fractal Prom. We think a good organizer could make a profit
                from these events, and we are happy to promote it. You must already
                be part of the Fractal community.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We currently have one economic engine within the community, Fractal
                Bootcamp, which teaches software engineering. We would like someone
                to teach a sales bootcamp which ultimately places students in high
                paid sales roles. About you: you have a history of excelling at
                tech sales. How we can help: we can provide space at Fractal Tech
                for you to run your first cohort, and help with curriculum
                development and marketing.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We are seeking someone to help us launch a startup accelerator
                program. We have the talent, we have the space, we have the demand,
                and we have a dozen founders who have already casually applied. We
                need a talented leader who will drive the program with us.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We are looking for someone to build us a forum, it can be cloned
                from the open sourced Less Wrong forum.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                Some people within Fractal have the money and interest to co-buy
                property in New York, but currently those most interested are busy
                with other projects. If you&rsquo;re also considering co-buying, in
                a position to do so, and willing to take the lead, we can introduce
                you to some excellent building-mates.
              </li>

              <li className="text-sm md:text-base leading-relaxed text-foreground/80 pl-4 border-l-2 border-foreground/15">
                We would love to work with a broker who specializes in Williamsburg
                south of the BQE, or the neighborhood near the Morgan L stop. In
                the past many of our friends have moved to live near us, and we
                would like to continue to facilitate this.
              </li>
            </ul>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
