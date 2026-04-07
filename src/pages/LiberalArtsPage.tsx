import { Navbar } from "@/components/layout/Navbar";
import { LiberalArts } from "@/components/sections/LiberalArts";
import { Footer } from "@/components/layout/Footer";

export function LiberalArtsPage() {
  return (
    <main className="min-h-screen text-white selection:bg-white selection:text-[#8B1A1A]" style={{ backgroundColor: "#8B1A1A" }}>
      <Navbar />
      <LiberalArts />
      <Footer />
    </main>
  );
}
