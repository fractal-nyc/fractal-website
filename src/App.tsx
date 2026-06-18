import { useEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { Home } from "@/pages/Home";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { VisitPage } from "@/pages/VisitPage";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { EducationPage } from "@/pages/EducationPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { PublicationsPage } from "@/pages/PublicationsPage";
import { StoryPage } from "@/pages/StoryPage";
import { PeoplePage } from "@/pages/PeoplePage";

import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/the-protocol" component={ProtocolPage} />
      <Route path="/visit" component={VisitPage} />
      <Route path="/education" component={EducationPage} />
      <Route path="/campus" component={CampusPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/political-club" component={PoliticalClubPage} />
      <Route path="/publications" component={PublicationsPage} />
      <Route path="/story" component={StoryPage} />
      <Route path="/people" component={PeoplePage} />

      {/* FRAC-228: redirects from the old URLs so existing bookmarks/links
          keep working after the rename to match the website labels. */}
      <Route path="/neighborhood">{() => <Redirect to="/visit" />}</Route>
      <Route path="/new-liberal-arts">{() => <Redirect to="/education" />}</Route>
      <Route path="/lab">{() => <Redirect to="/publications" />}</Route>

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
