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
// Import your existing CSR Analyzer pages
import CSRAnalyzer from '@/pages/CSRAnalyzer.jsx';
import CERV2Page from '@/pages/CERV2Page.jsx';
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
      <ProtectedRoute path="/ind" component={IndDashboard} />
      <ProtectedRoute path="/ind/:id" component={SubmissionHome} />
      <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
      <ProtectedRoute path="/analytics/:submissionId" component={AnalyticsDashboard} />
      <ProtectedRoute path="/cmc" component={CMCPage} />
      <ProtectedRoute path="/coauthor" component={CoAuthor} />
      <ProtectedRoute path="/CSRAnalyzer" component={CSRAnalyzer} />
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