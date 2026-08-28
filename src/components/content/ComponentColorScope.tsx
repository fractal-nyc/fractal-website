import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HOUSES, SECTIONS } from "@/data/houses";

export type ComponentColorwayId =
  | "neutral"
  | "co-living"
  | "events"
  | "campus"
  | "education"
  | "library"
  | "political-club"
  | "story"
  | "people";

export type ComponentSurfaceMode = "paper" | "light" | "deep";

export interface ComponentColorway {
  id: ComponentColorwayId;
  name: string;
  light: string;
  deep: string;
  onLight: string;
  onDeep: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  allowedSurfaces: readonly ComponentSurfaceMode[];
  notes: string;
}

const PAPER = "var(--color-background)";
const INK = "var(--color-foreground)";
const MUTED = "var(--color-foreground-muted)";
const house = (id: string) => HOUSES.find((item) => item.id === id)!.palette;
const allSurfaces = ["paper", "light", "deep"] as const;
const paperOnly = ["paper"] as const;
const neighborhood = house("neighborhood");
const events = house("events");
const campus = house("campus");
const education = house("school");
const library = house("lab");
const politicalClub = house("forum");

export const COMPONENT_COLORWAYS: readonly ComponentColorway[] = [
  { id: "neutral", name: "Neutral", light: PAPER, deep: INK, onLight: INK, onDeep: PAPER, accent: INK, accentSoft: PAPER, onAccent: PAPER, allowedSurfaces: allSurfaces, notes: "Cream and charcoal foundation." },
  { id: "co-living", name: "Co-Living pair", ...neighborhood, onLight: INK, onDeep: PAPER, accent: neighborhood.deep, accentSoft: neighborhood.light, onAccent: PAPER, allowedSurfaces: allSurfaces, notes: "Olive house pairing." },
  { id: "events", name: "Events pair", ...events, onLight: INK, onDeep: INK, accent: events.deep, accentSoft: events.light, onAccent: INK, allowedSurfaces: allSurfaces, notes: "Essential text remains charcoal on both event surfaces." },
  { id: "campus", name: "Campus pair", ...campus, onLight: PAPER, onDeep: PAPER, accent: campus.deep, accentSoft: campus.light, onAccent: PAPER, allowedSurfaces: allSurfaces, notes: "Campus is the approved light-surface cream-text exception." },
  { id: "education", name: "Education pair", ...education, onLight: PAPER, onDeep: PAPER, accent: education.light, accentSoft: education.deep, onAccent: PAPER, allowedSurfaces: allSurfaces, notes: "Education inverts the pair: light red is the accent and deep red is the field." },
  { id: "library", name: "Library pair", ...library, onLight: INK, onDeep: PAPER, accent: library.deep, accentSoft: library.light, onAccent: PAPER, allowedSurfaces: allSurfaces, notes: "Pink library pairing." },
  { id: "political-club", name: "Political Club pair", ...politicalClub, onLight: INK, onDeep: PAPER, accent: politicalClub.light, accentSoft: politicalClub.deep, onAccent: INK, allowedSurfaces: allSurfaces, notes: "Political Club inverts the pair: light teal is the accent and deep teal is the field." },
  { id: "story", name: "Story accent on cream", light: PAPER, deep: PAPER, onLight: INK, onDeep: INK, accent: SECTIONS.story.accent, accentSoft: SECTIONS.story.accent, onAccent: INK, allowedSurfaces: paperOnly, notes: "Story stays on cream; gold is decorative only." },
  { id: "people", name: "People accent on cream", light: PAPER, deep: PAPER, onLight: INK, onDeep: INK, accent: SECTIONS.people.accent, accentSoft: SECTIONS.people.accent, onAccent: INK, allowedSurfaces: paperOnly, notes: "People stays on cream; gold is decorative only." },
] as const;

export function getComponentColorway(id: ComponentColorwayId) {
  return COMPONENT_COLORWAYS.find((item) => item.id === id) ?? COMPONENT_COLORWAYS[0];
}

export function getAllowedComponentSurfaces(id: ComponentColorwayId) {
  return getComponentColorway(id).allowedSurfaces;
}

export const DEFAULT_COMPONENT_COLORWAYS = {
  campus: "campus",
  education: "education",
  library: "library",
} as const satisfies Record<string, ComponentColorwayId>;

interface ComponentColorScopeProps extends HTMLAttributes<HTMLDivElement> {
  colorway?: ComponentColorwayId;
  surface?: ComponentSurfaceMode;
  children: ReactNode;
}

export function ComponentColorScope({
  colorway = "neutral",
  surface = "paper",
  className,
  children,
  style,
  ...props
}: ComponentColorScopeProps) {
  const palette = getComponentColorway(colorway);
  const safeSurface = palette.allowedSurfaces.includes(surface) ? surface : palette.allowedSurfaces[0];
  const surfaceColor = safeSurface === "paper" ? PAPER : palette[safeSurface];
  const onSurface = safeSurface === "paper" ? INK : safeSurface === "light" ? palette.onLight : palette.onDeep;
  const variables = {
    "--component-surface": surfaceColor,
    "--component-on-surface": onSurface,
    "--component-muted": safeSurface === "paper" ? MUTED : `color-mix(in srgb, ${onSurface} 78%, transparent)`,
    "--component-accent": palette.accent,
    "--component-accent-soft": palette.accentSoft,
    "--component-on-accent": palette.onAccent,
    "--component-border": `color-mix(in srgb, ${onSurface} 22%, transparent)`,
    "--component-focus": palette.accent,
    "--accent": palette.accent,
    "--btn-text": palette.accent,
    backgroundColor: surfaceColor,
    color: onSurface,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={cn("component-color-scope min-w-0", className)}
      data-component-colorway={colorway}
      data-component-surface={safeSurface}
      style={{ ...variables, ...style }}
    >
      {children}
    </div>
  );
}
