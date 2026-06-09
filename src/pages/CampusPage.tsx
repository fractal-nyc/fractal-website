import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function CampusPage() {
  return (
    <main className="relative min-h-screen bg-house-campus-light text-background selection:bg-foreground selection:text-background">
      <FractalPattern color="#1A3A2E" />
      <div className="relative z-10">
        <Navbar />
        <Campus />
        <Footer />
      </div>
    </main>
  );
}
