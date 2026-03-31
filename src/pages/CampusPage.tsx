import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";

export function CampusPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <Campus />
      </div>
      <Footer />
    </main>
  );
}
