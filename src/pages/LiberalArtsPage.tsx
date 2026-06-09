import { Navbar } from "@/components/layout/Navbar";
import { LiberalArts } from "@/components/sections/LiberalArts";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function LiberalArtsPage() {
  return (
    <main className="relative min-h-screen bg-house-education-deep text-background selection:bg-foreground selection:text-background">
      <FractalPattern color="#C41E20" />
      <div className="relative z-10">
        <Navbar />
        <LiberalArts />
        <Footer />
      </div>
    </main>
  );
}
