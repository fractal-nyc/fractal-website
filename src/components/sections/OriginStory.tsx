import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section className="py-24 md:py-40 overflow-hidden" id="story">
      <div className="max-w-5xl mx-auto px-[4.5%]">
        <FadeIn>
          <div className="space-y-6 text-lg md:text-xl font-light">
            <p>
              It started simply: weekly dinners where people gave 5-minute talks about things they were passionate about.
            </p>
            <p>
              What began as a gathering of friends quickly outgrew its original container.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
