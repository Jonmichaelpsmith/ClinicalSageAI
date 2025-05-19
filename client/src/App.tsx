import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";
import CERV2Page from "./pages/CERV2Page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <Layout>
          <LandingPage />
        </Layout>
      )} />
      <Route path="/client-portal" component={() => (
        <Layout>
          <ClientPortal />
        </Layout>
      )} />
      <Route path="/cerv2" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
