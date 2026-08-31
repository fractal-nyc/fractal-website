import { useEffect, useMemo, useState } from "react";
import {
  COMPONENT_COLORWAYS,
  ComponentColorScope,
  getAllowedComponentSurfaces,
  type ComponentColorwayId,
  type ComponentSurfaceMode,
} from "@/components/content/ComponentColorScope";
import type { ComponentRegistryEntry, SpecimenControlValues } from "./registry";

export function SpecimenCard({ entry, initialColorway, initialSurface }: { entry: ComponentRegistryEntry; initialColorway: ComponentColorwayId; initialSurface: ComponentSurfaceMode }) {
  const availableColorways = useMemo(() => COMPONENT_COLORWAYS.filter((item) => entry.surfaceModes.some((surface) => item.allowedSurfaces.includes(surface))), [entry.surfaceModes]);
  const initialCompatibleColorway = availableColorways.some(({ id }) => id === initialColorway) ? initialColorway : availableColorways[0]?.id ?? "neutral";
  const [colorway, setColorway] = useState<ComponentColorwayId>(initialCompatibleColorway);
  const [surface, setSurface] = useState<ComponentSurfaceMode>(initialSurface);
  const [values, setValues] = useState<SpecimenControlValues>(() => Object.fromEntries(entry.controls.map((control) => [control.id, control.defaultValue])));
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
    else setSurface(allowedSurfaces[0]);
  }, [allowedSurfaces, initialSurface]);

  const width = entry.controls.find((control) => control.kind === "preview-width")
    ? values.previewWidth ?? "full"
    : "full";
  const widthStyle = width === "full" ? undefined : { width: `${width}px`, maxWidth: "100%" };

  const updateValue = (id: string, value: string) => setValues((current) => ({ ...current, [id]: value }));

  return (
    <article id={entry.id} className="library-specimen">
      <header><p className="text-label text-foreground">{entry.name}</p><h3 className="text-subtitle mt-2 normal-case">{entry.componentName}</h3><p className="text-body mt-3 text-foreground-muted">{entry.purpose}</p></header>
      <dl className="library-guidance"><div><dt>Use when</dt><dd>{entry.useWhen}</dd></div><div><dt>Do not use when</dt><dd>{entry.doNotUseWhen}</dd></div><div><dt>Content fields</dt><dd>{entry.contentFields.join(" · ")}</dd></div><div><dt>Variants and states</dt><dd>{entry.variants.join(" · ")}</dd></div><div><dt>Accessibility</dt><dd>{entry.accessibility}</dd></div><div><dt>Responsive behavior</dt><dd>{entry.responsive}</dd></div></dl>
      {entry.render ? <>
        {entry.controls.length > 0 && <fieldset className="library-specimen-controls"><legend>Try this component</legend>
          {entry.controls.map((control) => {
            if (control.kind === "colorway") return <label key={control.id}><span>{control.label}</span><select aria-label={control.label} value={colorway} onChange={(event) => { const next = event.target.value as ComponentColorwayId; setColorway(next); const nextAllowed = entry.surfaceModes.filter((item) => getAllowedComponentSurfaces(next).includes(item)); setSurface(nextAllowed[0] ?? "paper"); }}>{availableColorways.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
            if (control.kind === "surface") return <label key={control.id}><span>{control.label}</span><select aria-label={control.label} value={surface} onChange={(event) => setSurface(event.target.value as ComponentSurfaceMode)}>{allowedSurfaces.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>;
            if (control.kind === "text") return <label key={control.id}><span>{control.label}</span><input aria-label={control.label} value={values[control.id] ?? control.defaultValue} onChange={(event) => updateValue(control.id, event.target.value)} /></label>;
            return <label key={control.id}><span>{control.label}</span><select aria-label={control.label} value={values[control.id] ?? control.defaultValue} onChange={(event) => updateValue(control.id, event.target.value)}>{control.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
          })}
        </fieldset>}
        <div className="library-canvas" data-preview-width={width}><ComponentColorScope colorway={colorway} surface={surface} className="library-canvas-scope" style={widthStyle}>{entry.render({ colorway, surface, values })}</ComponentColorScope></div>
      </> : <div className="library-reference"><p className="text-label">Supporting implementation</p><p className="text-body mt-2">{entry.internalReason}</p></div>}
      <footer className="library-specimen-footer"><div><p className="text-label">Ask an agent for this</p><p className="text-body mt-1">{entry.agentPhrase}</p></div><code>{entry.sourcePath}</code></footer>
    </article>
  );
}
