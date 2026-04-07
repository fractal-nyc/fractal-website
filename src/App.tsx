import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { NeighborhoodPage } from "@/pages/NeighborhoodPage";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { LiberalArtsPage } from "@/pages/LiberalArtsPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { LabPage } from "@/pages/LabPage";
import { StoryPage } from "@/pages/StoryPage";
import { PeoplePage } from "@/pages/PeoplePage";

import { BadgePlayground } from "@/pages/BadgePlayground";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

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
      <Route path="/neighborhood" component={NeighborhoodPage} />
      <Route path="/new-liberal-arts" component={LiberalArtsPage} />
      <Route path="/campus" component={CampusPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/political-club" component={PoliticalClubPage} />
      <Route path="/lab" component={LabPage} />
      <Route path="/story" component={StoryPage} />
      <Route path="/people" component={PeoplePage} />

      <Route path="/playground/badge" component={BadgePlayground} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
