import { COMPONENT_COLORWAYS } from "@/components/content/ComponentColorScope";
import type { ComponentRegistryEntry } from "./registry";
import { ComponentPreview } from "./ComponentPreview";

export function VisualSpecimenCard({ entry, onLearnMore }: { entry: ComponentRegistryEntry; onLearnMore: (entry: ComponentRegistryEntry, trigger: HTMLButtonElement) => void }) {
  return <article id={entry.id} className="library-visual-card" data-preview-mode={entry.previewMode}>
    <header className="library-card-copy">
      <h2 className="text-subtitle normal-case">{entry.name}</h2>
      <p className="text-body">{entry.purpose}</p>
    </header>
    <ComponentPreview entry={entry} className="library-gallery-preview" />
    <footer className="library-card-footer">
      {entry.themeable ? <div className="library-mini-swatches" role="img" aria-label={`Available in ${COMPONENT_COLORWAYS.length} approved site colors`}>
        {COMPONENT_COLORWAYS.map((colorway) => <span key={colorway.id} style={{ background: colorway.accent }} />)}
      </div> : <span className="library-fixed-style text-label">One approved style</span>}
      <button type="button" className="library-learn-more" aria-label={`Learn more about ${entry.name}`} onClick={(event) => onLearnMore(entry, event.currentTarget)}>Learn more <span aria-hidden="true">→</span></button>
    </footer>
  </article>;
}
