import { Navbar } from "@/components/layout/Navbar";
import { Events } from "@/components/sections/Events";
import { Footer } from "@/components/layout/Footer";

export function EventsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <Events />
      </div>
      <Footer />
    </main>
  );
}
