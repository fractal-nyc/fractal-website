import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SierpinskiCarpet } from "@/components/sections/SierpinskiCarpet";

export function ProtocolPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-32 pb-16">
        {/* Sierpinski carpet — canvas-based animated ASCII art, centered */}
        <div className="w-[80%] md:w-[70%] lg:w-[60%] max-w-[800px] aspect-square">
          <SierpinskiCarpet
            photoUrl={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            autoPlay
            padding={0}
            className="w-full h-full"
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
