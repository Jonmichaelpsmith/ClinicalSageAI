import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/pages/home-page';
import SubmissionHome from '@/pages/SubmissionHome';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import IndDashboard from '@/pages/IndDashboard';
import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/auth-page';
import CMCPage from '@/pages/CMCPage';
import CoAuthor from '@/pages/CoAuthor';
import ClientPortalLanding from '@/pages/ClientPortalLanding';
// Import your existing CSR Analyzer pages
import CSRAnalyzer from '@/pages/CSRAnalyzer.jsx';
import CERV2Page from '@/pages/CERV2Page.jsx';
import ReportsPage from '@/pages/ReportsPage.jsx';
import CerProjectsDashboard from '@/pages/CerProjectsDashboard.jsx';
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from './hooks/use-auth';
import AppShell from '@/components/layout/AppShell';
import ToastCenter from '@/components/widgets/ToastCenter';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/client-portal" component={ClientPortalLanding} />
      <ProtectedRoute path="/ind" component={IndDashboard} />
      <ProtectedRoute path="/ind/:id" component={SubmissionHome} />
      <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/analytics/:submissionId" component={AnalyticsDashboard} />
      <ProtectedRoute path="/cmc" component={CMCPage} />
      <ProtectedRoute path="/coauthor" component={CoAuthor} />
      <ProtectedRoute path="/csr" component={CSRAnalyzer} />
      <ProtectedRoute path="/cerv2" component={CERV2Page} />
      <ProtectedRoute path="/cer-projects" component={CerProjectsDashboard} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell>
          <Router />
        </AppShell>
        <Toaster />
        <ToastCenter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;