import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Home } from "@/pages/Home";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { AcceleratorPage } from "@/pages/AcceleratorPage";
import { CoLivingPage } from "@/pages/CoLivingPage";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { LibraryPage } from "@/pages/LibraryPage";

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
      <Route path="/accelerator" component={AcceleratorPage} />
      <Route path="/co-living" component={CoLivingPage} />
      <Route path="/campus" component={CampusPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/library" component={LibraryPage} />

      {/* No legacy redirects. The site has never been deployed publicly, so
          there are no bookmarks or inbound links to preserve: Story folded into
          Home, Visit became Co-Living, and Publications became the Library —
          each simply takes its new name.

          Retired pages (deleted, NOT redirected): /education, /people and
          /political-club. Their houses/sections and color tokens deliberately
          survive in src/data/houses.ts + src/index.css so the pages are
          trivial to reinstate; only the routes and page components are gone.
          The octahedron's Education vertex now points at /accelerator. */}

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
