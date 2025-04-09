import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import Upload from "@/pages/Upload";
import Analytics from "@/pages/Analytics";
import UseCaseLibrary from "@/pages/UseCaseLibrary";
import ProtocolGenerator from "./pages/ProtocolGenerator";
import StudyDesignAgent from "./pages/StudyDesignAgent";
import Translation from "./pages/Translation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        <TopNavbar 
          toggleSidebar={toggleSidebar} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  // Only use the app layout on pages that need it
  const needsLayout = !["/", "/login", "/register"].includes(location);

  const renderWithLayout = (Component: React.ComponentType) => {
    return needsLayout ? (
      <AppLayout>
        <Component />
      </AppLayout>
    ) : (
      <Component />
    );
  };

  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={Home} />

      {/* App pages with layout */}
      <Route path="/dashboard">{() => renderWithLayout(Dashboard)}</Route>
      <Route path="/reports">{() => renderWithLayout(Reports)}</Route>
      <Route path="/upload">{() => renderWithLayout(Upload)}</Route>
      <Route path="/analytics">{() => renderWithLayout(Analytics)}</Route>
      <Route path="/use-cases">{() => renderWithLayout(UseCaseLibrary)}</Route>
      <Route path="/protocol-generator">{() => renderWithLayout(ProtocolGenerator)}</Route>
      <Route path="/study-design-agent">{() => renderWithLayout(StudyDesignAgent)}</Route>
      <Route path="/translation">{() => renderWithLayout(Translation)}</Route>

      {/* Fallback to 404 */}
      <Route>{() => renderWithLayout(NotFound)}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;