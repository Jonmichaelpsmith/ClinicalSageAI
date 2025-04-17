import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import Upload from "@/pages/Upload";
import Analytics from "@/pages/Analytics";
import ReportsAnalytics from "@/pages/ReportsAnalytics";
import StatisticalModeling from "@/pages/StatisticalModeling";
import UseCaseLibrary from "@/pages/UseCaseLibrary";
import UseCasesPage from "@/pages/UseCasesPage";
import ProtocolGenerator from "@/pages/ProtocolGenerator";
import ProtocolIntelligenceBuilder from "@/pages/ProtocolIntelligenceBuilder";
import StudyDesignAgent from "./pages/StudyDesignAgent";
import Translation from "@/pages/Translation";
import CsrExtractionGuide from "@/pages/CsrExtractionGuide";
import { Sidebar } from "@/components/layout/MergedSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import ProductFeatures from "./pages/ProductFeatures";
import DesignOraclePage from "@/pages/DesignOraclePage";
import PricingPage from "@/pages/PricingPage";
import { ResearchCompanionProvider } from "@/hooks/use-research-companion";
import ResearchCompanion from "@/components/ResearchCompanion";
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
import ProtocolUploadPage from "@/pages/ProtocolUploadPage";
import ProtocolAnalysisPage from "@/pages/ProtocolAnalysisPage";
import AgentLogDashboard from "@/pages/AgentLogDashboard";
import SimpleEndpointRecommender from "@/pages/SimpleEndpointRecommender";
import EndpointDesigner from "@/pages/EndpointDesigner.jsx";
import AcademicKnowledgeDemo from "@/pages/AcademicKnowledgeDemo";
import CompetitiveIntelligence from "@/pages/CompetitiveIntelligence";
import AdminNotifications from "@/pages/AdminNotifications";
import AdminPage from "@/pages/AdminPage";
import StrategicIntelligenceTest from "@/pages/StrategicIntelligenceTest";
import SmartProtocolPage from "@/pages/SmartProtocolPage";
import TrialPredictorPage from "@/pages/TrialPredictorPage";
import DossierViewerPage from "@/pages/DossierViewerPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ExportLogPage from "@/pages/ExportLogPage";
import AcademicRegulatoryPage from "@/pages/AcademicRegulatoryPage";
import AdvancedBiostatistics from "@/pages/AdvancedBiostatistics";
import CSRInsightPage from "@/pages/CSRInsightPage";
import CSRExtractorPage from "@/pages/CSRExtractorPage";
import PlanningPage from "@/pages/PlanningPage";
import InsightMemoryEngine from "@/pages/InsightMemoryEngine";
import WisdomTrace from "@/pages/WisdomTrace";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import ExampleReportsPage from "@/pages/ExampleReportsPage";
import CERGeneratorPage from "@/pages/CERGeneratorPage";
import EnhancedCERDashboardPage from "@/pages/EnhancedCERDashboardPage";
import CERDashboardPage from "@/pages/CERDashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import ChatAssistant from "@/pages/ChatAssistant";
import { applyCompactStyling } from "./lib/ui-utils"; // Added import


function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    applyCompactStyling(); // Apply compact styling on mount
    
    // Apply gradient headings for a more modern look
    try {
      const { applyGradientHeadings } = require('./lib/ui-utils');
      applyGradientHeadings();
    } catch (e) {
      console.log('Gradient headings utility not available');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <TopNavbar 
          toggleSidebar={toggleSidebar} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="flex-1 py-4 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>

        <footer className="py-4 px-3 sm:px-4 lg:px-6 border-t border-gray-200/70 dark:border-gray-800/50 mt-auto backdrop-blur-sm bg-white/60 dark:bg-slate-900/60">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} LumenTrialGuide.AI. All rights reserved.
              </div>
              <div className="mt-2 md:mt-0 flex space-x-5 flex-wrap justify-center">
                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">Terms</a>
                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">Privacy</a>
                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">Support</a>
                <a href="/product-features" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">Product Features</a>
                <a href="/use-case-library" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">Use Cases</a>
                <a href="/api-documentation" className="text-sm text-slate-500 hover:text-primary transition-colors dark:text-slate-400">API</a>
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
  const needsLayout = !["/", "/login", "/signup"].includes(location);

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

      {/* Auth pages */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />

      {/* App pages with layout */}
      <Route path="/dashboard">{() => renderWithLayout(Dashboard)}</Route>
      <Route path="/reports-analytics">{() => renderWithLayout(ReportsAnalytics)}</Route>
      <Route path="/upload">{() => renderWithLayout(Upload)}</Route>
      {/* Keeping original routes for backward compatibility */}
      <Route path="/reports">{() => renderWithLayout(ReportsAnalytics)}</Route>
      <Route path="/analytics">{() => renderWithLayout(ReportsAnalytics)}</Route>
      <Route path="/statistical-modeling">{() => renderWithLayout(StatisticalModeling)}</Route>
      <Route path="/use-cases">{() => renderWithLayout(UseCaseLibrary)}</Route>
      <Route path="/use-case-gallery">{() => renderWithLayout(UseCasesPage)}</Route>
      <Route path="/protocol-generator">{() => renderWithLayout(ProtocolGenerator)}</Route>
      <Route path="/protocol-designer">{() => renderWithLayout(ProtocolGenerator)}</Route>
      <Route path="/protocol-intelligence">{() => renderWithLayout(ProtocolIntelligenceBuilder)}</Route>
      <Route path="/study-design-agent">{() => renderWithLayout(StudyDesignAgent)}</Route>
      <Route path="/translation">{() => renderWithLayout(Translation)}</Route>
      <Route path="/csr-extraction-guide">{() => renderWithLayout(CsrExtractionGuide)}</Route>
      <Route path="/subscriptions">{() => renderWithLayout(SubscriptionsPage)}</Route>
      <Route path="/example-reports">{() => renderWithLayout(ExampleReportsPage)}</Route>
      <Route path="/features" component={ProductFeatures} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/api" component={ApiDocumentation} />
      <Route path="/product-features" component={ProductFeatures} />
      <Route path="/use-case-library" component={UseCaseLibrary} />
      <Route path="/api-documentation" component={ApiDocumentation} />
      <Route path="/lumen-bio/dashboard">{() => renderWithLayout(LumenBioDashboard)}</Route>
      <Route path="/lumen-bio/dashboard/wt02/recommendations">{() => renderWithLayout(ProtocolOptimizer)}</Route>
      <Route path="/lumen-bio/dashboard/wt02/endpoint-recommendations">{() => renderWithLayout(SimpleEndpointRecommender)}</Route>
      <Route path="/lumen-bio/dashboard/wt02/similar-trials">{() => renderWithLayout(CompetitiveIntelligence)}</Route>
      <Route path="/reports/lumen-bio">{() => renderWithLayout(LumenBioReport)}</Route>
      <Route path="/analytics/lumen-bio">{() => renderWithLayout(CompetitiveIntelligence)}</Route>
      <Route path="/client-intelligence" component={ClientIntelligence} />
      <Route path="/dossier-request">{() => renderWithLayout(DossierUploader)}</Route>
      <Route path="/premium-dossier">{() => renderWithLayout(PremiumDossierLanding)}</Route>
      <Route path="/fail-map">{() => renderWithLayout(FailMap)}</Route>
      <Route path="/csr-search">{() => renderWithLayout(CSRSearch)}</Route>
      <Route path="/reports/:csrId">{() => renderWithLayout(CSRDetail)}</Route>
      <Route path="/protocol-optimizer">{() => renderWithLayout(ProtocolOptimizer)}</Route>
      <Route path="/protocol/upload">{() => renderWithLayout(ProtocolUploadPage)}</Route>
      <Route path="/protocol/analysis/:protocolId">{() => renderWithLayout(ProtocolAnalysisPage)}</Route>
      <Route path="/agent-logs">{() => renderWithLayout(AgentLogDashboard)}</Route>
      <Route path="/endpoint-recommender">{() => renderWithLayout(SimpleEndpointRecommender)}</Route>
      <Route path="/endpoint-designer">{() => renderWithLayout(EndpointDesigner)}</Route>
      <Route path="/academic-knowledge-demo">{() => renderWithLayout(AcademicKnowledgeDemo)}</Route>
      <Route path="/competitive-intelligence">{() => renderWithLayout(CompetitiveIntelligence)}</Route>
      <Route path="/admin/notifications">{() => renderWithLayout(AdminNotifications)}</Route>
      <Route path="/strategic-intelligence">{() => renderWithLayout(StrategicIntelligenceTest)}</Route>
      <Route path="/smart-protocol">{() => renderWithLayout(SmartProtocolPage)}</Route>
      <Route path="/trial-predictor">{() => renderWithLayout(TrialPredictorPage)}</Route>
      <Route path="/dossier">{() => renderWithLayout(DossierViewerPage)}</Route>
      <Route path="/my-dossiers">{() => renderWithLayout(DossierViewerPage)}</Route>
      <Route path="/export-log">{() => renderWithLayout(ExportLogPage)}</Route>
      <Route path="/academic-regulatory">{() => renderWithLayout(AcademicRegulatoryPage)}</Route>
      <Route path="/advanced-biostatistics">{() => renderWithLayout(AdvancedBiostatistics)}</Route>
      <Route path="/csr-insights">{() => renderWithLayout(CSRInsightPage)}</Route>
      <Route path="/csr-extractor">{() => renderWithLayout(CSRExtractorPage)}</Route>
      <Route path="/planning">{() => renderWithLayout(PlanningPage)}</Route>
      <Route path="/insight-engine">{() => renderWithLayout(InsightMemoryEngine)}</Route>
      <Route path="/wisdom-trace">{() => renderWithLayout(WisdomTrace)}</Route>
      <Route path="/design-oracle">{() => renderWithLayout(DesignOraclePage)}</Route>
      <Route path="/admin">{() => renderWithLayout(AdminPage)}</Route>
      <Route path="/cer-generator">{() => renderWithLayout(CERGeneratorPage)}</Route>
      <Route path="/enhanced-cer-dashboard">{() => renderWithLayout(EnhancedCERDashboardPage)}</Route>
      <Route path="/cer-dashboard">{() => renderWithLayout(CERDashboardPage)}</Route>
      <Route path="/settings">{() => renderWithLayout(SettingsPage)}</Route>
      <Route path="/csr-chat">{() => renderWithLayout(ChatAssistant)}</Route>
      <Route path="/chat">{() => renderWithLayout(ChatAssistant)}</Route>

      {/* Fallback to 404 */}
      <Route>{() => renderWithLayout(NotFound)}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResearchCompanionProvider>
          <Router />
          <ResearchCompanion />
          {/* Add conditional rendering for CER Dashboard Access Buttons */}
          {window.location.pathname !== '/enhanced-cer-dashboard' && 
           window.location.pathname !== '/cer-dashboard' && (
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
              <a href="/cer-dashboard" className="transition-transform hover:scale-105">
                <button 
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  New CER Dashboard
                </button>
              </a>
              <a href="/enhanced-cer-dashboard" className="transition-transform hover:scale-105">
                <button 
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Enhanced Dashboard
                </button>
              </a>
            </div>
          )}
          <Toaster />
        </ResearchCompanionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;