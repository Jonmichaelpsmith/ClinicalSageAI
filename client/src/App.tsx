import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";
import CERV2Page from "./pages/CERV2Page";
import ClientPortalLanding from "./pages/ClientPortalLanding";
import HomeLanding from "./pages/HomeLanding";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <Layout>
          <HomeLanding />
        </Layout>
      )} />
      <Route path="/client-portal" component={() => (
        <Layout>
          <ClientPortalLanding />
        </Layout>
      )} />
      <Route path="/cerv2" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/ind-wizard" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/coauthor" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/cmc" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/vault" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/regulatory-intelligence-hub" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/regulatory-risk-dashboard" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/study-architect" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/analytics" component={() => (
        <Layout>
          <CERV2Page />
        </Layout>
      )} />
      <Route path="/regulatory-ai-test" component={() => (
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
