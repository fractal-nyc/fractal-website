import type { ReactNode } from "react";
import { ComponentColorScope, COMPONENT_COLORWAYS } from "@/components/content/ComponentColorScope";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { GalleryImage } from "@/components/gallery/GalleryImage";
import { CampusBannerSVG } from "@/components/house/CampusBannerSVG";
import { CoLivingBannerSVG } from "@/components/house/CoLivingBannerSVG";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { EventsBannerSVG } from "@/components/house/EventsBannerSVG";
import { LibraryBannerSVG } from "@/components/house/LibraryBannerSVG";
import { PoliticalClubBannerSVG } from "@/components/house/PoliticalClubBannerSVG";
import type { ComponentRegistryEntry } from "./registry";

const pennants = [
  ["Co-Living", CoLivingBannerSVG], ["Events", EventsBannerSVG], ["Campus", CampusBannerSVG],
  ["Education", EducationBannerSVG], ["Library", LibraryBannerSVG], ["Political Club", PoliticalClubBannerSVG],
] as const;

function TypeBoard() {
  return <div className="library-type-board">
    <p className="text-display">Display</p>
    <p className="text-title">A thoughtful title</p>
    <p className="text-subtitle">Section subtitle</p>
    <p className="text-body">Body copy stays direct and easy to read.</p>
    <p className="text-label">Interface label</p>
  </div>;
}

function LayoutBoard({ id }: { id: string }) {
  if (id === "page-frame") return <div className="library-layout-board library-page-frame-board"><span>page edge</span><div><span>safe content</span></div><span>page edge</span></div>;
  if (id === "reading-column") return <div className="library-reading-board"><p className="text-subtitle">Readable stories</p><p className="text-body">A focused column keeps longer passages comfortable. It gives each line enough room without asking the eye to travel across the whole screen.</p><p className="text-body">The page can still feel spacious around it.</p></div>;
  if (id === "standard-section-frame") return <div className="library-section-board"><span>Space above</span><div><p className="text-subtitle">A page section</p><p className="text-body">Content sits inside consistent outer gutters.</p></div><span>Space below</span></div>;
  return <div className="library-grid-board">{["Story", "Campus", "Education", "Library", "Events", "People"].map((label) => <div key={label}><span>{label}</span></div>)}</div>;
}

function ColorBoard() {
  return <div className="library-color-board">{COMPONENT_COLORWAYS.map((colorway) => <ComponentColorScope key={colorway.id} colorway={colorway.id} surface={colorway.allowedSurfaces.includes("light") ? "light" : "paper"} className="library-color-swatch"><span>{colorway.name}</span></ComponentColorScope>)}</div>;
}

function PhotoBoard({ family = false }: { family?: boolean }) {
  return <div className={family ? "library-photo-board library-photo-board-family" : "library-photo-board"}>
    <GalleryImage src="/images/campus/coworking-space.webp" alt="Fractal Campus coworking space" className="library-board-image" priority />
    {family && <><GalleryImage src="/images/story/story-01.jpg" alt="Fractal community gathering" className="library-board-image" /><GalleryImage src="/images/campus/rooftop.webp" alt="Fractal Campus rooftop" className="library-board-image" /></>}
  </div>;
}

function PennantBoard() {
  return <div className="library-pennant-board">{pennants.map(([label, Pennant]) => <div key={label}><Pennant /><span>{label}</span></div>)}</div>;
}

function ContextBoard({ id }: { id: string }) {
  const image = id === "housing-map" ? "/images/banners/neighborhood.webp"
    : id === "campus-section" || id === "meet-space-carousel" ? "/images/campus/coworking-space.webp"
      : id === "origin-story" ? "/images/fractal-nyc-diagram.png" : "/images/hero/fractal-background-640.webp";
  return <div className="library-context-board"><img src={image} alt="" width="640" height="360" loading="lazy" decoding="async" /><span className="text-label">Full-page interactive preview</span></div>;
}

export function VisualBoard({ entry }: { entry: ComponentRegistryEntry }): ReactNode {
  if (entry.id === "color-pairing") return <ColorBoard />;
  if (entry.id === "type-style") return <TypeBoard />;
  if (["page-frame", "reading-column", "standard-section-frame", "wide-card-grid"].includes(entry.id)) return <LayoutBoard id={entry.id} />;
  if (entry.id === "section-header") return <div className="library-sector-board"><SectorHeader letter="F" name="Fractal section" color="var(--color-house-library-deep)" /></div>;
  if (entry.id === "campus-banner") return <PennantBoard />;
  if (entry.id === "photo-frame" || entry.id === "gallery-image") return <PhotoBoard />;
  if (entry.id === "photo-gallery") return <PhotoBoard family />;
  if (entry.previewMode === "full-context") return <ContextBoard id={entry.id} />;
  return null;
}
