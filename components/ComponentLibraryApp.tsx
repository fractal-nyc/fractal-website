import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryChooser } from "./catalog/CategoryChooser";
import { ComponentDetail } from "./catalog/ComponentDetail";
import { FullContextPreview } from "./catalog/FullContextPreview";
import { VisualSpecimenCard } from "./catalog/VisualSpecimenCard";
import { COMPONENT_REGISTRY, GALLERY_CATEGORIES, galleryEntries, searchableEntryText, type ComponentRegistryEntry, type GalleryCategoryId } from "./catalog/registry";
import { EducationContentWorkshop } from "./workshop/EducationContentWorkshop";

type CatalogRoute =
  | { view: "browse"; category: GalleryCategoryId; query: string }
  | { view: "detail"; id: string }
  | { view: "preview"; id: string }
  | { view: "education" };

const validCategories = new Set<string>(GALLERY_CATEGORIES.map(({ id }) => id));

function readRoute(hash = window.location.hash): CatalogRoute {
  const raw = hash.replace(/^#/, "");
  const [path, search = ""] = raw.split("?");
  if (path === "education") return { view: "education" };
  if (path.startsWith("component/")) return { view: "detail", id: decodeURIComponent(path.slice(10)) };
  if (path.startsWith("preview/")) return { view: "preview", id: decodeURIComponent(path.slice(8)) };
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

function BrowseView({ route, navigate, rememberTrigger }: { route: Extract<CatalogRoute, { view: "browse" }>; navigate: (route: CatalogRoute, replace?: boolean) => void; rememberTrigger: (entry: ComponentRegistryEntry) => void }) {
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
      <div className="library-title-block"><p className="text-label text-house-library-deep">Team component gallery</p><h1 className="text-title normal-case">Choose by looking</h1><p className="text-body">See the real component first. Open Learn more only when you need instructions.</p></div>
      <div className="library-mode-switch" aria-label="Component library tools"><button type="button" aria-current="page">Browse components</button><button type="button" onClick={() => navigate({ view: "education" })}>Edit Education courses</button></div>
      <label className="library-search"><span className="sr-only">Search components</span><input type="search" value={route.query} onChange={(event) => navigate({ ...route, query: event.target.value }, true)} placeholder="Search: note, course, link…" /></label>
      <CategoryChooser active={route.category} counts={counts} onChange={(category) => navigate({ view: "browse", category, query: route.query })} />
    </div></header>
    <section className="library-gallery-shell" aria-labelledby="gallery-title" aria-live="polite">
      <div className="library-gallery-heading"><div><p className="text-label">{normalized ? "Search results" : GALLERY_CATEGORIES.find(({ id }) => id === route.category)?.label}</p><h2 id="gallery-title" className="text-title normal-case">{normalized ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"}` : "Pick the one that looks right"}</h2></div>{!normalized && route.category === "common" && <p className="text-body">The patterns editors use most often.</p>}</div>
      {filtered.length ? <div className="library-gallery-grid">{filtered.map((entry) => <VisualSpecimenCard key={entry.id} entry={entry} onLearnMore={(selected) => rememberTrigger(selected)} />)}</div> : <div className="library-empty"><h2 className="text-subtitle normal-case">Nothing matches that search</h2><p className="text-body">Try “note,” “article,” “course,” “outsource link,” or a technical component name.</p></div>}
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
    if (!window.location.hash) history.replaceState({ catalog: true }, "", routeHash(route));
    const sync = () => {
      const next = readRoute();
      setRoute(next);
      window.scrollTo({ top: 0, behavior: "instant" });
      if (next.view === "browse" && restoreFocusId.current) {
        const id = restoreFocusId.current;
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`#${CSS.escape(id)} .library-learn-more`)?.focus());
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
  if (route.view === "preview") return <FullContextPreview entry={entry} onBack={() => navigate({ view: "detail", id: entry.id })} />;
  return <ComponentDetail entry={entry} onBack={() => navigate(readRoute(previousBrowse.current))} onOpenLive={() => navigate({ view: "preview", id: entry.id })} />;
}
