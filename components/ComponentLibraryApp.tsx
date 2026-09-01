import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryChooser } from "./catalog/CategoryChooser";
import { ComponentDetail } from "./catalog/ComponentDetail";
import { VisualSpecimenCard } from "./catalog/VisualSpecimenCard";
import { COMPONENT_REGISTRY, GALLERY_CATEGORIES, galleryEntries, searchableEntryText, type ComponentRegistryEntry, type GalleryCategoryId } from "./catalog/registry";
import { EducationContentWorkshop } from "./workshop/EducationContentWorkshop";

type CatalogRoute =
  | { view: "browse"; category: GalleryCategoryId; query: string }
  | { view: "detail"; id: string }
  | { view: "preview"; id: string }
  | { view: "education" };

const validCategories = new Set<string>(GALLERY_CATEGORIES.map(({ id }) => id));
const canonicalComponentId = (id: string) => id === "prominent-text-link" ? "outbound-text-link" : id;

export function readRoute(hash = window.location.hash): CatalogRoute {
  const raw = hash.replace(/^#/, "");
  const [path, search = ""] = raw.split("?");
  if (path === "education") return { view: "education" };
  if (path.startsWith("component/")) return { view: "detail", id: canonicalComponentId(decodeURIComponent(path.slice(10))) };
  if (path.startsWith("preview/")) return { view: "preview", id: canonicalComponentId(decodeURIComponent(path.slice(8))) };
  const requested = path.startsWith("browse/") ? path.slice(7) : "common";
  const category = validCategories.has(requested) ? requested as GalleryCategoryId : "common";
  return { view: "browse", category, query: new URLSearchParams(search).get("q") ?? "" };
}

function routeHash(route: CatalogRoute) {
  if (route.view === "education") return "#education";
  if (route.view === "detail") return `#component/${encodeURIComponent(route.id)}`;
  if (route.view === "preview") return `#preview/${encodeURIComponent(route.id)}`;
  return `#browse/${route.category}${route.query ? `?q=${encodeURIComponent(route.query)}` : ""}`;
}

function BrowseView({ route, navigate, rememberTrigger }: { route: Extract<CatalogRoute, { view: "browse" }>; navigate: (route: CatalogRoute, replace?: boolean) => void; rememberTrigger: (entry: ComponentRegistryEntry, trigger: HTMLAnchorElement) => void }) {
  const normalized = route.query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const matching = galleryEntries.filter((entry) => !normalized || searchableEntryText(entry).includes(normalized));
    if (normalized) return matching;
    if (route.category === "common") return matching.filter((entry) => entry.common);
    if (route.category === "all") return matching;
    return matching.filter((entry) => entry.galleryCategory === route.category);
  }, [normalized, route.category]);
  const counts = useMemo(() => Object.fromEntries(GALLERY_CATEGORIES.map(({ id }) => [id, id === "common" ? galleryEntries.filter(({ common }) => common).length : id === "all" ? galleryEntries.length : galleryEntries.filter(({ galleryCategory }) => galleryCategory === id).length])) as Record<GalleryCategoryId, number>, []);

  return <main className="library-page">
    <header className="library-header"><div className="library-header-inner">
      <h1 className="library-title text-title normal-case">Component Library</h1>
      <div className="library-utility-row">
        <label className="library-search"><span className="sr-only">Search components</span><input type="search" value={route.query} onChange={(event) => navigate({ ...route, query: event.target.value }, true)} placeholder="Search: note, course, link…" /></label>
        <div className="library-mode-switch" aria-label="Component library tools"><button type="button" aria-current="page">Browse components</button><button type="button" onClick={() => navigate({ view: "education" })}>Edit Education courses</button></div>
      </div>
      <CategoryChooser active={route.category} counts={counts} onChange={(category) => navigate({ view: "browse", category, query: route.query })} />
    </div></header>
    <section className="library-gallery-shell" aria-label="Components">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{normalized ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"}` : `${filtered.length} components shown`}</p>
      {filtered.length ? <div className="library-gallery-grid">{filtered.map((entry) => <VisualSpecimenCard key={entry.id} entry={entry} onOpen={rememberTrigger} />)}</div> : <div className="library-empty"><h2 className="text-subtitle normal-case">Nothing matches that search</h2><p className="text-body">Try “note,” “article,” “course,” “outsource link,” or a technical component name.</p></div>}
    </section>
  </main>;
}

export function ComponentLibraryApp() {
  const [route, setRoute] = useState<CatalogRoute>(() => readRoute());
  const previousBrowse = useRef("#browse/common");
  const restoreFocusId = useRef<string | null>(window.sessionStorage.getItem("component-gallery-focus"));
  const navigate = (next: CatalogRoute, replace = false) => {
    const hash = routeHash(next);
    if (replace) history.replaceState({ catalog: true }, "", hash);
    else history.pushState({ catalog: true }, "", hash);
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const canonical = routeHash(readRoute());
    if (window.location.hash !== canonical) history.replaceState({ catalog: true }, "", canonical);
    const sync = () => {
      const next = readRoute();
      const nextCanonical = routeHash(next);
      if (window.location.hash !== nextCanonical) history.replaceState({ catalog: true }, "", nextCanonical);
      setRoute(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (next.view === "browse" && restoreFocusId.current) {
        const id = restoreFocusId.current;
        requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#${CSS.escape(id)} .library-open-component`)?.focus());
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => { window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);

  if (route.view === "browse") {
    previousBrowse.current = routeHash(route);
    return <BrowseView route={route} navigate={navigate} rememberTrigger={(entry) => { restoreFocusId.current = entry.id; window.sessionStorage.setItem("component-gallery-focus", entry.id); navigate({ view: "detail", id: entry.id }); }} />;
  }
  if (route.view === "education") return <main className="library-page"><div className="library-tool-bar"><button className="library-back" type="button" onClick={() => navigate(readRoute(previousBrowse.current))}>← Back to components</button><p className="text-label">Education editing tool</p></div><EducationContentWorkshop /></main>;
  const entry = COMPONENT_REGISTRY.find(({ id }) => id === route.id);
  if (!entry) return <main className="library-page"><div className="library-detail-shell"><button className="library-back" onClick={() => navigate({ view: "browse", category: "common", query: "" })}>← Back to components</button><h1 className="text-title normal-case">Component not found</h1></div></main>;
  if (route.view === "preview") return <ComponentDetail key={`preview-${entry.id}`} entry={entry} onBack={() => navigate({ view: "browse", category: "common", query: "" })} onOpenLive={() => undefined} />;
  return <ComponentDetail key={`detail-${entry.id}`} entry={entry} onBack={() => navigate(readRoute(previousBrowse.current))} onOpenLive={() => navigate({ view: "preview", id: entry.id })} />;
}
