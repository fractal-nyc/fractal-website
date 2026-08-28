import { useMemo, useState } from "react";
import {
  COMPONENT_COLORWAYS,
  getAllowedComponentSurfaces,
  type ComponentColorwayId,
  type ComponentSurfaceMode,
} from "@/components/content/ComponentColorScope";
import type { ComponentRegistryEntry, SpecimenControlValues } from "./registry";
import { compatibleTheme, ComponentPreview, defaultValuesFor } from "./ComponentPreview";
import { CopyPromptButton, plainAgentPrompt } from "./CopyPromptButton";

export function ComponentDetail({ entry, onBack, onOpenLive }: { entry: ComponentRegistryEntry; onBack: () => void; onOpenLive: () => void }) {
  const initial = compatibleTheme(entry);
  const [colorway, setColorway] = useState<ComponentColorwayId>(initial.colorway);
  const [surface, setSurface] = useState<ComponentSurfaceMode>(initial.surface);
  const [values, setValues] = useState<SpecimenControlValues>(() => defaultValuesFor(entry));
  const availableColorways = useMemo(() => COMPONENT_COLORWAYS.filter((item) => entry.surfaceModes.some((candidate) => item.allowedSurfaces.includes(candidate))), [entry]);
  const allowedSurfaces = useMemo(() => entry.surfaceModes.filter((candidate) => getAllowedComponentSurfaces(colorway).includes(candidate)), [colorway, entry]);
  const width = entry.controls.some((control) => control.kind === "preview-width") ? values.previewWidth ?? "full" : "full";

  return <main className="library-page library-detail-page">
    <div className="library-detail-shell">
      <button type="button" className="library-back" onClick={onBack}>← Back to components</button>
      <header className="library-detail-header"><p className="text-label">Component</p><h1 className="text-title normal-case">{entry.name}</h1><p className="text-body-lead">{entry.purpose}</p></header>
      <ComponentPreview entry={entry} colorway={colorway} surface={surface} values={values} width={width} className="library-detail-preview" />
      {entry.previewMode === "full-context" && <button className="library-live-button" type="button" onClick={onOpenLive}>Open live preview <span aria-hidden="true">↗</span></button>}
      {entry.controls.length > 0 && <fieldset className="library-specimen-controls library-detail-controls"><legend>Try different options</legend>
        {entry.controls.map((control) => {
          const label = control.kind === "colorway" ? "Site color" : control.kind === "surface" ? "Background" : control.label;
          if (control.kind === "colorway") return <label key={control.id}><span>{label}</span><select aria-label={label} value={colorway} onChange={(event) => { const next = event.target.value as ComponentColorwayId; setColorway(next); const nextAllowed = entry.surfaceModes.filter((item) => getAllowedComponentSurfaces(next).includes(item)); setSurface(nextAllowed[0] ?? "paper"); }}>{availableColorways.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
          if (control.kind === "surface") return <label key={control.id}><span>{label}</span><select aria-label={label} value={surface} onChange={(event) => setSurface(event.target.value as ComponentSurfaceMode)}>{allowedSurfaces.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>;
          if (control.kind === "text") return <label key={control.id}><span>{label}</span><input aria-label={label} value={values[control.id] ?? control.defaultValue} onChange={(event) => setValues((current) => ({ ...current, [control.id]: event.target.value }))} /></label>;
          return <label key={control.id}><span>{label}</span><select aria-label={label} value={values[control.id] ?? control.defaultValue} onChange={(event) => setValues((current) => ({ ...current, [control.id]: event.target.value }))}>{control.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
        })}
      </fieldset>}
      <details className="library-usage-details">
        <summary>Usage details</summary>
        <div className="library-usage-body">
          <dl className="library-guidance"><div><dt>Use when</dt><dd>{entry.useWhen}</dd></div><div><dt>Do not use when</dt><dd>{entry.doNotUseWhen}</dd></div><div><dt>Content to provide</dt><dd>{entry.contentFields.join(" · ")}</dd></div><div><dt>Options and states</dt><dd>{entry.variants.join(" · ")}</dd></div>{entry.usedOn && <div><dt>Used on the site</dt><dd>{entry.usedOn}</dd></div>}<div><dt>Accessibility</dt><dd>{entry.accessibility}</dd></div><div><dt>Responsive behavior</dt><dd>{entry.responsive}</dd></div><div><dt>Technical name</dt><dd>{entry.componentName}</dd></div><div><dt>Source</dt><dd><code>{entry.sourcePath}</code></dd></div></dl>
          <section className="library-agent-prompt"><p className="text-label">Tell an agent</p><p className="text-body">{plainAgentPrompt(entry.agentPhrase)}</p><CopyPromptButton componentName={entry.name} prompt={entry.agentPhrase} /></section>
        </div>
      </details>
    </div>
  </main>;
}
