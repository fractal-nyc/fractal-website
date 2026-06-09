import { Navbar } from "@/components/layout/Navbar";
import { LiberalArts } from "@/components/sections/LiberalArts";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function LiberalArtsPage() {
  return (
    <main className="relative min-h-screen bg-house-education-deep text-house-education-deep-foreground selection:bg-house-education-deep-foreground selection:text-house-education-deep">
      <FractalPattern color="#B52828" />
      <div className="relative z-10">
        <Navbar />
        <LiberalArts />
        <Footer />
      </div>
    </main>
  );
}
