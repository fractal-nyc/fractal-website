import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OriginStory } from "@/components/sections/OriginStory";
import { Vision } from "@/components/sections/Vision";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { gallerySections } from "@/data/storyPhotos";

export function StoryPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-20">
        <OriginStory />
        <Vision />
        <PhotoGallery sections={gallerySections} />
      </div>
      <Footer />
    </main>
  );
}
