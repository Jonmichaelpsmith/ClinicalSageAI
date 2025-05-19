import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { cleanupModals } from "./lib/modalHelpers";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";
import CERV2Page from "./pages/CERV2Page";

// Landing page component - renders the clean_landing_page.html content
function LandingPage() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Redirect to client portal when "Client Login" button is clicked
    const handleClientLogin = () => {
      navigate('/client-portal');
    };
    
    // Find and attach event listeners to client login buttons
    const clientLoginButtons = document.querySelectorAll('.client-login-btn');
    clientLoginButtons.forEach(button => {
      button.addEventListener('click', handleClientLogin);
    });
    
    return () => {
      // Clean up event listeners
      clientLoginButtons.forEach(button => {
        button.removeEventListener('click', handleClientLogin);
      });
    };
  }, [navigate]);
  
  useEffect(() => {
    // Load the landing page HTML
    fetch('/landing-page.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('landing-page-container').innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading landing page:', error);
      });
  }, []);
  
  return <div id="landing-page-container"></div>;
}

// Client Portal component
function ClientPortal() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Clean up when unmounting
    return () => {
      cleanupModals();
    };
  }, []);
  
  useEffect(() => {
    // Load the client portal HTML
    fetch('/client-portal.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('client-portal-container').innerHTML = html;
        
        // Add event listeners to module cards to navigate to CERV2
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach(card => {
          card.addEventListener('click', () => {
            navigate('/cerv2');
          });
        });
      })
      .catch(error => {
        console.error('Error loading client portal:', error);
      });
  }, [navigate]);
  
  return <div id="client-portal-container"></div>;
}

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
