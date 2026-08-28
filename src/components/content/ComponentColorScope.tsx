import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  notes: string;
}

const PAPER = "var(--color-background)";
const INK = "var(--color-foreground)";
const MUTED = "var(--color-foreground-muted)";

export const COMPONENT_COLORWAYS: readonly ComponentColorway[] = [
  { id: "neutral", name: "Neutral", light: PAPER, deep: INK, onLight: INK, onDeep: PAPER, notes: "Cream and charcoal foundation." },
  { id: "co-living", name: "Co-Living pair", light: "var(--color-house-co-living-light)", deep: "var(--color-house-co-living-deep)", onLight: INK, onDeep: PAPER, notes: "Olive house pairing." },
  { id: "events", name: "Events pair", light: "var(--color-house-events-light)", deep: "var(--color-house-events-deep)", onLight: INK, onDeep: INK, notes: "Essential text remains charcoal on both event surfaces." },
  { id: "campus", name: "Campus pair", light: "var(--color-house-campus-light)", deep: "var(--color-house-campus-deep)", onLight: PAPER, onDeep: PAPER, notes: "Campus is the approved light-surface cream-text exception." },
  { id: "education", name: "Education pair", light: "var(--color-house-education-light)", deep: "var(--color-house-education-deep)", onLight: PAPER, onDeep: PAPER, notes: "Education surfaces use cream essential text." },
  { id: "library", name: "Library pair", light: "var(--color-house-library-light)", deep: "var(--color-house-library-deep)", onLight: INK, onDeep: PAPER, notes: "Pink library pairing." },
  { id: "political-club", name: "Political Club pair", light: "var(--color-house-political-club-light)", deep: "var(--color-house-political-club-deep)", onLight: INK, onDeep: PAPER, notes: "Teal political-club pairing." },
  { id: "story", name: "Story accent on cream", light: PAPER, deep: "var(--color-section-story)", onLight: INK, onDeep: INK, notes: "Story stays on cream; gold is decorative." },
  { id: "people", name: "People accent on cream", light: PAPER, deep: "var(--color-section-people)", onLight: INK, onDeep: INK, notes: "People stays on cream; gold is decorative." },
] as const;

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
  const palette = COMPONENT_COLORWAYS.find(({ id }) => id === colorway) ?? COMPONENT_COLORWAYS[0];
  const surfaceColor = surface === "paper" ? PAPER : palette[surface];
  const onSurface = surface === "paper" ? INK : surface === "light" ? palette.onLight : palette.onDeep;
  const variables = {
    "--component-surface": surfaceColor,
    "--component-on-surface": onSurface,
    "--component-muted": surface === "paper" ? MUTED : `color-mix(in srgb, ${onSurface} 78%, transparent)`,
    "--component-accent": palette.deep,
    "--component-accent-soft": palette.light,
    "--component-on-accent": palette.onDeep,
    "--component-border": `color-mix(in srgb, ${onSurface} 22%, transparent)`,
    "--component-focus": surface === "deep" ? palette.light : palette.deep,
    "--accent": palette.deep,
    "--btn-text": palette.deep,
  } as CSSProperties;

  return (
    <div
      {...props}
      className={cn("min-w-0 bg-[var(--component-surface)] text-[var(--component-on-surface)]", className)}
      data-component-colorway={colorway}
      data-component-surface={surface}
      style={{ ...variables, ...style }}
    >
      {children}
    </div>
  );
}
