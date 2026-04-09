import { Navbar } from "@/components/layout/Navbar";
import { LiberalArts } from "@/components/sections/LiberalArts";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function LiberalArtsPage() {
  return (
    <main className="relative min-h-screen text-white selection:bg-white selection:text-[#5C1010]" style={{ backgroundColor: "#5C1010" }}>
      <FractalPattern color="#B52828" />
      <div className="relative z-10">
        <Navbar />
        <LiberalArts />
        <Footer />
      </div>
    </main>
  );
}
