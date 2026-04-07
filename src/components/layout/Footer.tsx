import { FadeIn } from "@/components/ui/FadeIn";

const DISCORD_LINK = "https://discord.com/invite/vugp6Nza";
const CALENDAR_LINK =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0JUlLukwG9ny_ji86woEKDTE2qWsePnoAz9Ao3Rl4SBssPVd_56rmYcnbb4oO6dIlPiqybWrSo";

export function Footer() {
  return (
    <footer>
      {/* Bottom footer */}
      <div className="border-t border-border bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-[4.5%] flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="flex flex-col gap-3 max-w-sm">
            <p className="text-muted-foreground text-sm leading-relaxed">
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
            <p className="text-muted-foreground text-sm leading-relaxed">
              Prefer a one-on-one conversation?{" "}
              <a
                href={CALENDAR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground/60 transition-colors"
              >
                Schedule a virtual chat with Ian
              </a>
              .
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
