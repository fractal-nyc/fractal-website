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

      <Footer />
    </main>
  );
}
