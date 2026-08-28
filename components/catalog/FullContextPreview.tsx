import { lazy, Suspense } from "react";
import type { ComponentRegistryEntry } from "./registry";

const Navbar = lazy(() => import("@/components/layout/Navbar").then((module) => ({ default: module.Navbar })));
const Campus = lazy(() => import("@/components/sections/Campus").then((module) => ({ default: module.Campus })));
const Hero = lazy(() => import("@/components/sections/Hero").then((module) => ({ default: module.Hero })));
const HousingMap = lazy(() => import("@/components/sections/HousingMap").then((module) => ({ default: module.HousingMap })));
const MeetTheSpaceCarousel = lazy(() => import("@/components/sections/MeetTheSpaceCarousel").then((module) => ({ default: module.MeetTheSpaceCarousel })));
const OriginStory = lazy(() => import("@/components/sections/OriginStory").then((module) => ({ default: module.OriginStory })));
const SierpinskiCarpet = lazy(() => import("@/components/sections/SierpinskiCarpet").then((module) => ({ default: module.SierpinskiCarpet })));

const campusPhotos = [
  { src: "/images/campus/coworking-space.webp", alt: "Fractal Campus coworking space", caption: "Shared coworking space" },
  { src: "/images/campus/rooftop.webp", alt: "Fractal Campus rooftop", caption: "The Campus rooftop" },
  { src: "/images/campus/kitchen.webp", alt: "Fractal Campus kitchen", caption: "Community kitchen" },
];

function LiveComponent({ id }: { id: string }) {
  if (id === "site-navigation") return <Navbar />;
  if (id === "campus-section") return <div className="bg-house-campus-light"><Campus /></div>;
  if (id === "housing-map") return <div className="library-live-contained"><HousingMap /></div>;
  if (id === "meet-space-carousel") return <div className="library-live-campus"><MeetTheSpaceCarousel photos={campusPhotos} /></div>;
  if (id === "origin-story") return <OriginStory />;
  if (id === "sierpinski-carpet") return <div className="library-live-carpet"><SierpinskiCarpet autoPlay={false} /></div>;
  return <div className="library-live-hero"><Hero /></div>;
}

export function FullContextPreview({ entry, onBack }: { entry: ComponentRegistryEntry; onBack: () => void }) {
  return <main className="library-full-preview">
    <div className="library-full-preview-bar"><button type="button" onClick={onBack}>← Back to {entry.name}</button><p className="text-label">Live preview · {entry.name}</p></div>
    <Suspense fallback={<div className="library-preview-loading" role="status">Loading live preview…</div>}><LiveComponent id={entry.id} /></Suspense>
  </main>;
}
