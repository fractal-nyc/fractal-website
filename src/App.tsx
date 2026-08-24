import { useEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { Home } from "@/pages/Home";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { LibraryPage } from "@/pages/LibraryPage";
import { PeoplePage } from "@/pages/PeoplePage";
import { FractalUPage } from "@/pages/FractalUPage";

import NotFound from "@/pages/not-found";

const ACCELERATOR_URL = "https://go.fractalaccelerator.com/fractalnycwebsite";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/**
 * Sends the browser to an external site. Accelerator lives on its standalone
 * site, while FractalU is now internal at /fractalu.
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
      <Route path="/fractalu" component={FractalUPage} />

      {/* Accelerator remains external. FractalU's legacy routes resolve to the
          internal /fractalu page. */}
      <Route path="/accelerator">{() => <ExternalRedirect to={ACCELERATOR_URL} />}</Route>
      <Route path="/education">{() => <Redirect to="/fractalu" />}</Route>
      <Route path="/new-liberal-arts">{() => <Redirect to="/fractalu" />}</Route>

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
      <ScrollToTop />
      <Router />
    </WouterRouter>
  );
}

export default App;
