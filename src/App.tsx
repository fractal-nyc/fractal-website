import { useEffect, useLayoutEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { Home } from "@/pages/Home";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { PeoplePage } from "@/pages/PeoplePage";

import NotFound from "@/pages/not-found";

const FRACTALU_URL = "https://www.fractalu.nyc/";
const ACCELERATOR_URL = "https://www.fractalaccelerator.com/";

const DEFAULT_PAGE_BACKGROUND = "var(--color-background)";

const PAGE_BACKGROUND_BY_ROUTE: Record<string, string> = {
  "/": DEFAULT_PAGE_BACKGROUND,
  "/the-protocol": DEFAULT_PAGE_BACKGROUND,
  "/people": DEFAULT_PAGE_BACKGROUND,
  "/accelerator": DEFAULT_PAGE_BACKGROUND,
  "/education": DEFAULT_PAGE_BACKGROUND,
  "/new-liberal-arts": DEFAULT_PAGE_BACKGROUND,
  "/story": DEFAULT_PAGE_BACKGROUND,
  "/co-living": "var(--color-house-co-living-light)",
  "/visit": "var(--color-house-co-living-light)",
  "/neighborhood": "var(--color-house-co-living-light)",
  "/campus": "var(--color-house-campus-light)",
  "/events": "var(--color-house-events-light)",
  "/political-club": "var(--color-house-political-club-deep)",
  "/library": "var(--color-house-library-light)",
  "/publications": "var(--color-house-library-light)",
  "/lab": "var(--color-house-library-light)",
};

function PageBackground() {
  const [location] = useLocation();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const pathname = location.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";

    root.style.setProperty(
      "--page-background",
      PAGE_BACKGROUND_BY_ROUTE[pathname] ?? DEFAULT_PAGE_BACKGROUND,
    );

    return () => {
      root.style.removeProperty("--page-background");
    };
  }, [location]);

  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/**
 * Sends the browser to an external site. The Accelerator and FractalU (formerly
 * Education) pages were removed — those sectors now live on their own standalone
 * sites — but old internal paths still redirect there so bookmarks resolve.
 */
function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/the-protocol" component={ProtocolPage} />
      <Route path="/co-living" component={CoLivingPage} />
      <Route path="/campus" component={CampusPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/political-club" component={PoliticalClubPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/people" component={PeoplePage} />

      {/* Accelerator and FractalU (Education) have no internal page — the nav and
          octahedron link straight to their standalone sites. These routes exist
          only so old/direct URLs bounce out to the same place. */}
      <Route path="/accelerator">{() => <ExternalRedirect to={ACCELERATOR_URL} />}</Route>
      <Route path="/education">{() => <ExternalRedirect to={FRACTALU_URL} />}</Route>
      <Route path="/new-liberal-arts">{() => <ExternalRedirect to={FRACTALU_URL} />}</Route>

      {/* Internal redirects from old URLs after the content-port renames:
          Visit → Co-Living, Publications → Library, Story folded into Home. */}
      <Route path="/story">{() => <Redirect to="/" />}</Route>
      <Route path="/visit">{() => <Redirect to="/co-living" />}</Route>
      <Route path="/publications">{() => <Redirect to="/library" />}</Route>
      <Route path="/neighborhood">{() => <Redirect to="/co-living" />}</Route>
      <Route path="/lab">{() => <Redirect to="/library" />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <PageBackground />
      <ScrollToTop />
      <Router />
    </WouterRouter>
  );
}

export default App;
