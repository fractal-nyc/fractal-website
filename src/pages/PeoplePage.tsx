import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PeopleDirectory } from "@/components/sections/PeopleDirectory";

export function PeoplePage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <PeopleDirectory />
      </div>
      <Footer />
    </main>
  );
}
