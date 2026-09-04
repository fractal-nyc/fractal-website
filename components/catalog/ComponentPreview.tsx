import { useMemo } from "react";
import {
  COMPONENT_COLORWAYS,
  ComponentColorScope,
  getAllowedComponentSurfaces,
  type ComponentColorwayId,
  type ComponentSurfaceMode,
} from "@/components/content/ComponentColorScope";
import type { ComponentRegistryEntry, SpecimenControlValues } from "./registry";
import { VisualBoard } from "./VisualBoards";

export function defaultValuesFor(entry: ComponentRegistryEntry): SpecimenControlValues {
  return Object.fromEntries(entry.controls.map((control) => [control.id, control.defaultValue]));
}

export function compatibleTheme(entry: ComponentRegistryEntry, requestedColorway?: ComponentColorwayId, requestedSurface?: ComponentSurfaceMode) {
  const preferredColorway = requestedColorway ?? entry.defaultColorway ?? "neutral";
  const preferredSurface = requestedSurface ?? entry.defaultSurface ?? "paper";
  const colorway = COMPONENT_COLORWAYS.some((item) => item.id === preferredColorway && entry.surfaceModes.some((surface) => item.allowedSurfaces.includes(surface)))
    ? preferredColorway
    : COMPONENT_COLORWAYS.find((item) => entry.surfaceModes.some((surface) => item.allowedSurfaces.includes(surface)))?.id ?? "neutral";
  const allowed = entry.surfaceModes.filter((surface) => getAllowedComponentSurfaces(colorway).includes(surface));
  const surface = allowed.includes(preferredSurface) ? preferredSurface : allowed[0] ?? "paper";
  return { colorway, surface, allowedSurfaces: allowed.length ? allowed : ["paper" as const] };
}

export function ComponentPreview({ entry, colorway, surface, values, width = "full", className = "" }: {
  entry: ComponentRegistryEntry;
  colorway?: ComponentColorwayId;
  surface?: ComponentSurfaceMode;
  values?: SpecimenControlValues;
  width?: string;
  className?: string;
}) {
  const theme = compatibleTheme(entry, colorway, surface);
  const actualValues = useMemo(() => values ?? defaultValuesFor(entry), [entry, values]);
  const widthStyle = width === "full" ? undefined : { width: `${width}px`, maxWidth: "100%" };
  const content = entry.render
    ? entry.render({ colorway: theme.colorway, surface: theme.surface, values: actualValues })
    : <VisualBoard entry={entry} />;
  return <div className={`library-canvas ${className}`} data-preview-width={width}>
    <ComponentColorScope colorway={theme.colorway} surface={theme.surface} className="library-canvas-scope" style={widthStyle}>{content}</ComponentColorScope>
  </div>;
}
