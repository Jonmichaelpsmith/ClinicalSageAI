import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { cleanupModals } from "./lib/modalHelpers";
import Layout from "./components/Layout";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Add main route for the SimpleModalPage component */}
      <Route path="/" component={() => (
        <Layout>
          <SimpleDemoPage />
        </Layout>
      )} />
      <Route path="/client-portal" component={() => (
        <Layout>
          <SimpleDemoPage />
        </Layout>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple demo page with modal cleanup functionality
function SimpleDemoPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Cleanup modals when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);
  
  // Clean up modals when tab changes
  useEffect(() => {
    cleanupModals();
  }, [activeTab]);
  
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6">Regulatory Compliance Portal</h1>
      
      <div className="mb-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6 flex justify-between">
          <div>
            <h2 className="font-medium">Modal Cleanup Demo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The cleanupModals function removes floating elements when navigating between tabs
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'submissions' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            onClick={() => setActiveTab('submissions')}
          >
            FDA Submissions
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'quality' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            onClick={() => setActiveTab('quality')}
          >
            Quality Management
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Compliance Overview</h3>
              <p>This tab demonstrates the modal cleanup functionality when switching tabs.</p>
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <div>
              <h3 className="text-lg font-medium mb-4">FDA Submissions</h3>
              <p>All lingering modal elements are cleaned up when switching to this tab.</p>
            </div>
          )}
          
          {activeTab === 'quality' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Quality Management</h3>
              <p>The cleanupModals function is called when this tab is activated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
