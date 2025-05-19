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
    // Clean up when unmounting
    return () => {
      cleanupModals();
    };
  }, []);
  
  useEffect(() => {
    // Load the landing page HTML
    fetch('/landing-page.html')
      .then(response => response.text())
      .then(html => {
        const container = document.getElementById('landing-page-container');
        if (container) {
          container.innerHTML = html;
          
          // Add event listeners to client portal buttons
          const clientPortalButtons = document.querySelectorAll('.client-portal-button');
          clientPortalButtons.forEach(button => {
            button.addEventListener('click', () => {
              navigate('/client-portal');
            });
          });
          
          // Override solution card links to go to client portal
          const solutionLinks = document.querySelectorAll('.solution-link');
          solutionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              navigate('/client-portal');
            });
          });
          
          // Override any onclick handlers in buttons
          const buttonsWithOnclick = document.querySelectorAll('button[onclick]');
          buttonsWithOnclick.forEach(button => {
            button.removeAttribute('onclick');
            button.addEventListener('click', () => {
              navigate('/client-portal');
            });
          });
          
          // Special handling for any "Access Module" buttons
          const accessModuleButtons = Array.from(document.querySelectorAll('button')).filter(
            button => button.textContent && button.textContent.includes('Access Module')
          );
          accessModuleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              navigate('/client-portal');
            });
          });
        }
      })
      .catch(error => {
        console.error('Error loading landing page:', error);
      });
      
    return () => {
      // Clean up event listeners when component unmounts
      cleanupModals();
    };
  }, [navigate]);
  
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
        
        // Add event listeners to module buttons to navigate to CERV2
        const moduleButtons = document.querySelectorAll('.module-btn');
        moduleButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            // Prevent default button action
            e.preventDefault();
            
            // Get the module name from the data attribute
            const moduleName = button.getAttribute('data-module');
            console.log(`Module selected: ${moduleName}`);
            
            // Navigate to CERV2 module (you can add other module routing here if needed)
            if (moduleName === "CERV2" || moduleName === "Clinical Evaluation Reports") {
              navigate('/cerv2');
            } else {
              // For demo purposes, all modules go to CERV2 for now
              navigate('/cerv2');
            }
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
