import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { EventsPage } from "@/pages/EventsPage";
import { CampusPage } from "@/pages/CampusPage";
import { LiberalArtsPage } from "@/pages/LiberalArtsPage";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { NeighborhoodPage } from "@/pages/NeighborhoodPage";
import { PoliticalClubPage } from "@/pages/PoliticalClubPage";
import { ResearchPage } from "@/pages/ResearchPage";
import { MissionPage } from "@/pages/MissionPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

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
      <Route path="/research-writing" component={ResearchPage} />
      <Route path="/mission" component={MissionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
