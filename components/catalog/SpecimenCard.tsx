import { useEffect, useMemo, useState } from "react";
import {
  COMPONENT_COLORWAYS,
  ComponentColorScope,
  getAllowedComponentSurfaces,
  type ComponentColorwayId,
  type ComponentSurfaceMode,
} from "@/components/content/ComponentColorScope";
import type { ComponentRegistryEntry, ComponentSpecimenState } from "./registry";

const widths = [
  { value: "full", label: "Available width" },
  { value: "320", label: "320px phone" },
  { value: "375", label: "375px phone" },
  { value: "768", label: "768px tablet" },
] as const;

const stateLabels: Record<ComponentSpecimenState, string> = {
  default: "Default",
  long: "Long content",
  missing: "Missing optional content",
  empty: "Empty state",
};

export function SpecimenCard({ entry, initialColorway, initialSurface }: { entry: ComponentRegistryEntry; initialColorway: ComponentColorwayId; initialSurface: ComponentSurfaceMode }) {
  const availableColorways = useMemo(() => COMPONENT_COLORWAYS.filter((item) => entry.surfaceModes.some((surface) => item.allowedSurfaces.includes(surface))), [entry.surfaceModes]);
  const initialCompatibleColorway = availableColorways.some(({ id }) => id === initialColorway) ? initialColorway : availableColorways[0]?.id ?? "neutral";
  const [colorway, setColorway] = useState<ComponentColorwayId>(initialCompatibleColorway);
  const [surface, setSurface] = useState<ComponentSurfaceMode>(initialSurface);
  const [state, setState] = useState<ComponentSpecimenState>("default");
  const [content, setContent] = useState(entry.sampleContent ?? entry.name);
  const [width, setWidth] = useState<(typeof widths)[number]["value"]>("full");
  const allowedSurfaces = useMemo(() => {
    const colorwaySurfaces = getAllowedComponentSurfaces(colorway);
    const intersection = entry.surfaceModes.filter((item) => colorwaySurfaces.includes(item));
    return intersection.length ? intersection : ["paper" as const];
  }, [colorway, entry.surfaceModes]);

  useEffect(() => {
    if (availableColorways.some(({ id }) => id === initialColorway)) setColorway(initialColorway);
    else setColorway(availableColorways[0]?.id ?? "neutral");
  }, [availableColorways, initialColorway]);
  useEffect(() => {
    if (allowedSurfaces.includes(initialSurface)) setSurface(initialSurface);
    else if (!allowedSurfaces.includes(surface)) setSurface(allowedSurfaces[0]);
  }, [allowedSurfaces, initialSurface, surface]);

  const previewStates = entry.previewStates ?? (["default", "long", "missing", "empty"] as const);
  const widthStyle = width === "full" ? undefined : { width: `${width}px`, maxWidth: "100%" };

  return (
    <article id={entry.id} className="library-specimen">
      <header><p className="text-label text-house-library-deep">{entry.name}</p><h3 className="text-subtitle mt-2 normal-case">{entry.componentName}</h3><p className="text-body mt-3 text-foreground-muted">{entry.purpose}</p></header>
      <dl className="library-guidance"><div><dt>Use when</dt><dd>{entry.useWhen}</dd></div><div><dt>Do not use when</dt><dd>{entry.doNotUseWhen}</dd></div><div><dt>Content fields</dt><dd>{entry.contentFields.join(" · ")}</dd></div><div><dt>Variants and states</dt><dd>{entry.variants.join(" · ")}</dd></div><div><dt>Accessibility</dt><dd>{entry.accessibility}</dd></div><div><dt>Responsive behavior</dt><dd>{entry.responsive}</dd></div></dl>
      {entry.render ? <>
        <fieldset className="library-specimen-controls"><legend>Try this component</legend>
          <label><span>Sample content</span><input value={content} onChange={(event) => setContent(event.target.value)} /></label>
          <label><span>State</span><select value={state} onChange={(event) => setState(event.target.value as ComponentSpecimenState)}>{previewStates.map((item) => <option key={item} value={item}>{stateLabels[item]}</option>)}</select></label>
          <label><span>Preview width</span><select value={width} onChange={(event) => setWidth(event.target.value as (typeof widths)[number]["value"])}>{widths.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          {entry.themeable && <label><span>Color pairing</span><select value={colorway} onChange={(event) => { const next = event.target.value as ComponentColorwayId; setColorway(next); const nextAllowed = entry.surfaceModes.filter((item) => getAllowedComponentSurfaces(next).includes(item)); setSurface(nextAllowed[0] ?? "paper"); }}>{availableColorways.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          {entry.themeable && <label><span>Surface</span><select value={surface} onChange={(event) => setSurface(event.target.value as ComponentSurfaceMode)}>{allowedSurfaces.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>}
        </fieldset>
        <div className="library-canvas" data-specimen-state={state} data-preview-width={width}><ComponentColorScope colorway={colorway} surface={surface} className="library-canvas-scope" style={widthStyle}>{entry.render({ colorway, surface, state, content })}</ComponentColorScope></div>
      </> : <div className="library-reference"><p className="text-label">Reference specimen</p><p className="text-body mt-2">{entry.referenceOnly}</p></div>}
      <footer className="library-specimen-footer"><div><p className="text-label">Ask an agent for this</p><p className="text-body mt-1">{entry.agentPhrase}</p></div><code>{entry.sourcePath}</code></footer>
    </article>
  );
}
