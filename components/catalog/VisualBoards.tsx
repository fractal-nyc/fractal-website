import type { ReactNode } from "react";
import { GalleryImage } from "@/components/gallery/GalleryImage";
import { CampusBannerSVG } from "@/components/house/CampusBannerSVG";
import { CoLivingBannerSVG } from "@/components/house/CoLivingBannerSVG";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { EventsBannerSVG } from "@/components/house/EventsBannerSVG";
import { LibraryBannerSVG } from "@/components/house/LibraryBannerSVG";
import { PaintedRelicBanner } from "@/components/house/PaintedRelicBanner";
import politicalClubBannerSrc from "../assets/political-club-banner.svg";
import type { ComponentRegistryEntry } from "./registry";

function PoliticalClubGalleryPennant() {
  return (
    <PaintedRelicBanner
      src={politicalClubBannerSrc}
      foundationColor="var(--color-house-political-club-deep)"
      house="political-club"
    />
  );
}

const pennants = [
  ["Co-Living", CoLivingBannerSVG], ["Events", EventsBannerSVG], ["Campus", CampusBannerSVG],
  ["Education", EducationBannerSVG], ["Library", LibraryBannerSVG], ["Political Club", PoliticalClubGalleryPennant],
] as const;

function PhotoBoard({ family = false }: { family?: boolean }) {
  return <div className={family ? "library-photo-board library-photo-board-family" : "library-photo-board"}>
    <GalleryImage src="/images/campus/coworking-space.webp" alt="Fractal Campus coworking space" className="library-board-image" priority />
    {family && <><GalleryImage src="/images/story/story-01.jpg" alt="Fractal community gathering" className="library-board-image" /><GalleryImage src="/images/campus/rooftop.webp" alt="Fractal Campus rooftop" className="library-board-image" /></>}
  </div>;
}

function PennantBoard() {
  return <div className="library-pennant-board">{pennants.map(([label, Pennant]) => <div key={label}><Pennant /><span>{label}</span></div>)}</div>;
}

export function VisualBoard({ entry }: { entry: ComponentRegistryEntry }): ReactNode {
  if (entry.id === "campus-banner") return <PennantBoard />;
  if (entry.id === "photo-frame" || entry.id === "gallery-image") return <PhotoBoard />;
  if (entry.id === "photo-gallery") return <PhotoBoard family />;
  return null;
}
