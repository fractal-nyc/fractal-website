import type { ComponentRegistryEntry } from "./registry";
import { ComponentPreview } from "./ComponentPreview";
import { CopyPromptButton } from "./CopyPromptButton";

export function VisualSpecimenCard({ entry, onOpen }: { entry: ComponentRegistryEntry; onOpen: (entry: ComponentRegistryEntry, trigger: HTMLButtonElement) => void }) {
  return <article id={entry.id} className="library-visual-card" data-preview-mode={entry.previewMode}>
    <ComponentPreview entry={entry} className="library-gallery-preview" />
    <div className="library-card-actions">
      <button type="button" className="library-component-name" aria-label={`View details for ${entry.name}`} onClick={(event) => onOpen(entry, event.currentTarget)}>{entry.name}</button>
      <CopyPromptButton componentName={entry.name} prompt={entry.agentPhrase} className="library-copy-prompt" />
    </div>
  </article>;
}
