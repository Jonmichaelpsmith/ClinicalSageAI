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
import StatisticalModeling from "@/pages/StatisticalModeling";
import UseCaseLibrary from "@/pages/UseCaseLibrary";
import ProtocolGenerator from "@/pages/ProtocolGenerator";
import StudyDesignAgent from "./pages/StudyDesignAgent";
import Translation from "@/pages/Translation";
import CsrExtractionGuide from "@/pages/CsrExtractionGuide";
import { Sidebar } from "@/components/layout/NewSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import ProductFeatures from "./pages/ProductFeatures";
import PricingPage from "@/pages/PricingPage";
import ApiDocumentation from "@/pages/ApiDocumentation";
import LumenBioDashboard from "@/pages/LumenBioDashboard";
import LumenBioReport from "@/pages/LumenBioReport";
import ClientIntelligence from "@/pages/ClientIntelligence";
import DossierUploader from "@/pages/DossierUploader";
import PremiumDossierLanding from "@/pages/PremiumDossierLanding";
import FailMap from "@/pages/FailMap";
import CSRSearch from "@/pages/CSRSearch";
import CSRDetail from "@/pages/CSRDetail";
import ProtocolOptimizer from "@/pages/ProtocolOptimizer";
import AgentLogDashboard from "@/pages/AgentLogDashboard";
import SimpleEndpointRecommender from "@/pages/SimpleEndpointRecommender";
import EndpointDesigner from "@/pages/EndpointDesigner.jsx";
import AcademicKnowledgeDemo from "@/pages/AcademicKnowledgeDemo";
import CompetitiveIntelligence from "@/pages/CompetitiveIntelligence";
import AdminNotifications from "@/pages/AdminNotifications";
import StrategicIntelligenceTest from "@/pages/StrategicIntelligenceTest";
import SmartProtocolPage from "@/pages/SmartProtocolPage";
import TrialPredictorPage from "@/pages/TrialPredictorPage";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <TopNavbar 
          toggleSidebar={toggleSidebar} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} TrialSage. All rights reserved.
              </div>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">Terms</a>
                <a href="#" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">Privacy</a>
                <a href="#" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">Support</a>
                <a href="/product-features" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">Product Features</a>
                <a href="/use-case-library" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">Use Cases</a>
                <a href="/api-documentation" className="text-sm text-slate-500 hover:text-primary dark:text-slate-400">API</a>
              </div>
            </div>
          </div>
        </footer>
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
      <Route path="/statistical-modeling">{() => renderWithLayout(StatisticalModeling)}</Route>
      <Route path="/use-cases">{() => renderWithLayout(UseCaseLibrary)}</Route>
      <Route path="/protocol-generator">{() => renderWithLayout(ProtocolGenerator)}</Route>
      <Route path="/protocol-designer">{() => renderWithLayout(ProtocolGenerator)}</Route>
      <Route path="/study-design-agent">{() => renderWithLayout(StudyDesignAgent)}</Route>
      <Route path="/translation">{() => renderWithLayout(Translation)}</Route>
      <Route path="/csr-extraction-guide">{() => renderWithLayout(CsrExtractionGuide)}</Route>
      <Route path="/features" component={ProductFeatures} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/api" component={ApiDocumentation} />
      <Route path="/product-features" component={ProductFeatures} />
      <Route path="/use-case-library" component={UseCaseLibrary} />
      <Route path="/api-documentation" component={ApiDocumentation} />
      <Route path="/lumen-bio/dashboard">{() => renderWithLayout(LumenBioDashboard)}</Route>
      <Route path="/reports/lumen-bio">{() => renderWithLayout(LumenBioReport)}</Route>
      <Route path="/analytics/lumen-bio">{() => renderWithLayout(CompetitiveIntelligence)}</Route>
      <Route path="/client-intelligence" component={ClientIntelligence} />
      <Route path="/dossier-request">{() => renderWithLayout(DossierUploader)}</Route>
      <Route path="/premium-dossier">{() => renderWithLayout(PremiumDossierLanding)}</Route>
      <Route path="/fail-map">{() => renderWithLayout(FailMap)}</Route>
      <Route path="/csr-search">{() => renderWithLayout(CSRSearch)}</Route>
      <Route path="/reports/:csrId">{() => renderWithLayout(CSRDetail)}</Route>
      <Route path="/protocol-optimizer">{() => renderWithLayout(ProtocolOptimizer)}</Route>
      <Route path="/agent-logs">{() => renderWithLayout(AgentLogDashboard)}</Route>
      <Route path="/endpoint-recommender">{() => renderWithLayout(SimpleEndpointRecommender)}</Route>
      <Route path="/endpoint-designer">{() => renderWithLayout(EndpointDesigner)}</Route>
      <Route path="/academic-knowledge-demo">{() => renderWithLayout(AcademicKnowledgeDemo)}</Route>
      <Route path="/competitive-intelligence">{() => renderWithLayout(CompetitiveIntelligence)}</Route>
      <Route path="/admin/notifications">{() => renderWithLayout(AdminNotifications)}</Route>
      <Route path="/strategic-intelligence">{() => renderWithLayout(StrategicIntelligenceTest)}</Route>
      <Route path="/smart-protocol">{() => renderWithLayout(SmartProtocolPage)}</Route>
      <Route path="/trial-predictor">{() => renderWithLayout(TrialPredictorPage)}</Route>

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