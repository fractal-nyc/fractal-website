import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function CampusPage() {
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#2B5A48" }}>
      <FractalPattern color="#1A3A2E" />
      <Navbar />
      <Campus />
      <Footer />
    </main>
  );
}
