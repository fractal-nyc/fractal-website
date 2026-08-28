import { useMemo, useState } from "react";
import { COMPONENT_COLORWAYS, type ComponentColorwayId, type ComponentSurfaceMode, ComponentColorScope } from "@/components/content/ComponentColorScope";
import { COMPONENT_CATEGORIES, COMPONENT_REGISTRY, searchableEntryText } from "./catalog/registry";
import { EducationContentWorkshop } from "./workshop/EducationContentWorkshop";

export function ComponentLibraryApp() {
  const [query, setQuery] = useState("");
  const [colorway, setColorway] = useState<ComponentColorwayId>("neutral");
  const [surface, setSurface] = useState<ComponentSurfaceMode>("paper");
  const normalized = query.trim().toLowerCase();
  const entries = useMemo(() => COMPONENT_REGISTRY.filter((entry) => !normalized || searchableEntryText(entry).includes(normalized)), [normalized]);

  return (
    <main className="library-page">
      <header className="library-header">
        <div className="library-header-inner">
          <div><p className="text-label text-house-library-deep">Team-only local document</p><h1 className="text-display mt-2">Fractal NYC Component Library</h1><p className="text-body-lead mt-4 max-w-3xl text-foreground-muted">Find a plain-English component name, inspect the real production implementation, then use its “Ask an agent” phrase to keep new work consistent.</p></div>
          <div className="library-global-controls">
            <label className="library-control"><span>Search components</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="note, class, article, external link…" /></label>
            <label className="library-control"><span>Color pairing</span><select value={colorway} onChange={(event) => setColorway(event.target.value as ComponentColorwayId)}>{COMPONENT_COLORWAYS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="library-control"><span>Surface</span><select value={surface} onChange={(event) => setSurface(event.target.value as ComponentSurfaceMode)}><option value="paper">Paper</option><option value="light">Light</option><option value="deep">Deep</option></select></label>
          </div>
        </div>
      </header>

      <div className="library-workspace">
        <nav className="library-nav" aria-label="Component categories"><p className="text-label">Browse</p>{COMPONENT_CATEGORIES.map((category) => <a key={category} href={`#category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{category}</a>)}<a href="#education-workshop">Education workshop</a></nav>
        <div className="library-catalog" aria-live="polite">
          {entries.length === 0 && <div className="library-empty"><h2 className="text-title normal-case">No components found</h2><p className="text-body mt-2">Try “note,” “article,” “class,” “outsource link,” or a technical component name.</p></div>}
          {COMPONENT_CATEGORIES.map((category) => {
            const categoryEntries = entries.filter((entry) => entry.category === category);
            if (!categoryEntries.length) return null;
            return <section key={category} id={`category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="library-category"><h2 className="text-title normal-case">{category}</h2><div className="library-specimen-grid">{categoryEntries.map((entry) => <article key={entry.id} id={entry.id} className="library-specimen"><header><p className="text-label text-house-library-deep">{entry.name}</p><h3 className="text-subtitle mt-2 normal-case">{entry.componentName}</h3><p className="text-body mt-3 text-foreground-muted">{entry.purpose}</p></header><dl className="library-guidance"><div><dt>Use when</dt><dd>{entry.useWhen}</dd></div><div><dt>Do not use when</dt><dd>{entry.doNotUseWhen}</dd></div><div><dt>Content fields</dt><dd>{entry.contentFields.join(" · ")}</dd></div><div><dt>Variants and states</dt><dd>{entry.variants.join(" · ")}</dd></div><div><dt>Accessibility</dt><dd>{entry.accessibility}</dd></div><div><dt>Responsive behavior</dt><dd>{entry.responsive}</dd></div></dl>{entry.render ? <div className="library-canvas"><ComponentColorScope colorway={colorway} surface={surface} className="library-canvas-scope">{entry.render({ colorway, surface })}</ComponentColorScope></div> : <div className="library-reference"><p className="text-label">Reference specimen</p><p className="text-body mt-2">{entry.referenceOnly}</p></div>}<footer className="library-specimen-footer"><div><p className="text-label">Ask an agent for this</p><p className="text-body mt-1">{entry.agentPhrase}</p></div><code>{entry.sourcePath}</code></footer></article>)}</div></section>;
          })}
        </div>
      </div>
      <EducationContentWorkshop />
    </main>
  );
}
