import { useRef } from "react";
import type { ComponentRegistryEntry } from "./registry";
import { ComponentPreview } from "./ComponentPreview";
import { CopyPromptButton } from "./CopyPromptButton";

const interactiveTargetSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])",
  "[role='button']",
  "[role='link']",
  "[role='checkbox']",
  "[role='combobox']",
  "[role='listbox']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[role='radio']",
  "[role='slider']",
  "[role='spinbutton']",
  "[role='switch']",
  "[role='tab']",
  "[role='textbox']",
].join(",");

export function VisualSpecimenCard({ entry, onOpen }: { entry: ComponentRegistryEntry; onOpen: (entry: ComponentRegistryEntry, trigger: HTMLAnchorElement) => void }) {
  const openLink = useRef<HTMLAnchorElement>(null);
  const open = () => {
    if (openLink.current) onOpen(entry, openLink.current);
  };

  return <article
    id={entry.id}
    className="library-visual-card"
    data-preview-mode={entry.previewMode}
    onClick={(event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof Element && target.closest(interactiveTargetSelector)) return;
      open();
    }}
  >
    <ComponentPreview entry={entry} className="library-gallery-preview" />
    <div className="library-card-actions">
      <a
        ref={openLink}
        className="library-open-component"
        href={`#component/${encodeURIComponent(entry.id)}`}
        aria-label={`View options for ${entry.name}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpen(entry, event.currentTarget);
        }}
      >
        <span className="library-component-name">{entry.name}</span>
        <span className="library-view-options">View options <span aria-hidden="true">→</span></span>
      </a>
      <CopyPromptButton componentName={entry.name} prompt={entry.agentPhrase} className="library-copy-prompt" />
    </div>
  </article>;
}
