import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";

export function CampusPage() {
  return (
    <main className="min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#2B5A48" }}>
      <Navbar />
      <Campus />
      <Footer />
    </main>
  );
}
