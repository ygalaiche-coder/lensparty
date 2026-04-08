import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import MyEventsPage from "@/pages/my-events";
import CreateEventPage from "@/pages/create-event";
import EventDashboard from "@/pages/event-dashboard";
import UpgradePage from "@/pages/upgrade";
import PaymentSuccessPage from "@/pages/payment-success";
import GuestUploadPage from "@/pages/guest-upload";
import SlideshowPage from "@/pages/slideshow";
import QRTemplatesPage from "@/pages/qr-templates";
import DemoPage from "@/pages/demo";
import AdminPage from "@/pages/admin";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/my-events" component={MyEventsPage} />
      <Route path="/create" component={CreateEventPage} />
      <Route path="/demo" component={DemoPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/event/:id/print" component={QRTemplatesPage} />
      <Route path="/event/:id" component={EventDashboard} />
      <Route path="/upgrade/:eventId" component={UpgradePage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/g/:code" component={GuestUploadPage} />
      <Route path="/slideshow/:id" component={SlideshowPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
