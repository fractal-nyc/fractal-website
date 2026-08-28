import type { ComponentRegistryEntry } from "./registry";

export function FullContextPreview({ entry, onBack }: { entry: ComponentRegistryEntry; onBack: () => void }) {
  return <main className="library-full-preview">
    <div className="library-full-preview-bar"><button type="button" onClick={onBack}>← Back to {entry.name}</button><p className="text-label">Live preview · {entry.name}</p></div>
    <div className="library-preview-loading" role="status">This page-owned preview is no longer part of the reusable component chooser.</div>
  </main>;
}
