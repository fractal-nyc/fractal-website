import { FadeIn } from "@/components/ui/FadeIn";

const DISCORD_LINK = "https://discord.com/invite/vugp6Nza";
const CALENDAR_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0JUlLukwG9ny_ji86woEKDTE2qWsePnoAz9Ao3Rl4SBssPVd_56rmYcnbb4oO6dIlPiqybWrSo";

export function Footer() {
  return (
    <footer>
      {/* Get Involved Section */}
      <div className="border-t border-border/40 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 md:px-12">
          <FadeIn>
            <h3 className="font-serif text-2xl md:text-3xl mb-8 text-foreground/90">
              How Can I Help / Get Involved?
            </h3>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <p className="text-sm md:text-base leading-relaxed text-foreground/85">
                Glad you asked! One way to help is to{" "}
                <a
                  href="https://hcb.hackclub.com/donations/start/fractal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
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
                    className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
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

            <FadeIn delay={0.2}>
              <div className="pt-6 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  If you&rsquo;re in NYC and would like to introduce yourself, join our{" "}
                  <a
                    href={DISCORD_LINK}
                    className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
                  >
                    Discord
                  </a>{" "}
                  and post in{" "}
                  <span className="font-medium text-foreground/80">#intros</span>.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                  If you&rsquo;d like to learn more about Fractal and prefer a
                  one-on-one conversation,{" "}
                  <a
                    href={CALENDAR_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
                  >
                    schedule a virtual chat with Ian
                  </a>
                  .
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-border bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Fractal Collective</h2>
            <p className="text-muted-foreground text-sm max-w-sm text-balance">
              Living, learning, and building together in New York City since 2021. A neighborhood campus for the curious.
            </p>
          </div>

          <div className="flex flex-col md:text-right gap-2">
            <p className="font-medium text-sm">New York City</p>
            <a href="mailto:hello@fractalnyc.com" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              hello@fractalnyc.com
            </a>
            <p className="text-muted-foreground text-xs mt-8">
              &copy; {new Date().getFullYear()} Fractal Collective.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
