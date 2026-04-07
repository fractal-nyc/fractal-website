import { FadeIn } from "@/components/ui/FadeIn";

const DISCORD_LINK = "https://discord.com/invite/vugp6Nza";
const CALENDAR_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0JUlLukwG9ny_ji86woEKDTE2qWsePnoAz9Ao3Rl4SBssPVd_56rmYcnbb4oO6dIlPiqybWrSo";

export function Footer() {
  return (
    <footer>
      {/* CTA Section */}
      <div className="border-t border-border/40 bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 md:px-12">
          <FadeIn>
            <h3 className="font-serif text-2xl md:text-3xl mb-8 text-foreground/90">
              Get involved
            </h3>
          </FadeIn>

          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you're in NYC and would like to introduce yourself, join our{" "}
                <a
                  href={DISCORD_LINK}
                  className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
                >
                  Discord
                </a>{" "}
                and post in{" "}
                <span className="font-medium text-foreground/80">#intros</span>.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you'd like to learn more about Fractal and prefer a
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
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Existing footer */}
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
