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
import { EducationPage } from "@/pages/EducationPage";
import { MembersPage } from "@/pages/MembersPage";
import { membersHomePathForHost } from "@/data/member-links";

import NotFound from "@/pages/not-found";

const DEFAULT_PAGE_BACKGROUND = "var(--color-background)";

const PAGE_BACKGROUND_BY_ROUTE: Record<string, string> = {
  "/": DEFAULT_PAGE_BACKGROUND,
  "/the-protocol": DEFAULT_PAGE_BACKGROUND,
  "/people": DEFAULT_PAGE_BACKGROUND,
  "/accelerator": "var(--color-house-education-deep)",
  "/education": "var(--color-house-education-deep)",
  "/new-liberal-arts": "var(--color-house-education-deep)",
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
  "/members": DEFAULT_PAGE_BACKGROUND,
  "/members/guide": DEFAULT_PAGE_BACKGROUND,
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

function MembersSubdomainRedirect() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    const destination = membersHomePathForHost(
      window.location.hostname,
      location,
    );
    if (destination) {
      setLocation(destination);
    }
  }, [location, setLocation]);
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
      <Route path="/education" component={EducationPage} />
      <Route path="/members" component={MembersPage} />

      {/* Legacy Education paths now lead to the first-party destination hub. */}
      <Route path="/accelerator">{() => <Redirect to="/education" />}</Route>
      <Route path="/new-liberal-arts">{() => <Redirect to="/education" />}</Route>

      {/* Internal redirects from old URLs after the content-port renames:
          Visit → Co-Living, Publications → Library, Story folded into Home.
          /members/guide folded into the combined Member Guide. */}
      <Route path="/story">{() => <Redirect to="/" />}</Route>
      <Route path="/visit">{() => <Redirect to="/co-living" />}</Route>
      <Route path="/publications">{() => <Redirect to="/library" />}</Route>
      <Route path="/neighborhood">{() => <Redirect to="/co-living" />}</Route>
      <Route path="/lab">{() => <Redirect to="/library" />}</Route>
      <Route path="/members/guide">{() => <Redirect to="/members" />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <PageBackground />
      <ScrollToTop />
      <MembersSubdomainRedirect />
      <Router />
    </WouterRouter>
  );
}

export default App;
