import React, { useEffect, useState } from 'react';
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
import { AppAlarm } from '@/components/ui/alarm';
import { useToast } from '@/hooks/use-toast';

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
      <ProtectedRoute path="/vault" component={ClientPortalLanding} />
      <ProtectedRoute path="/ind-wizard" component={IndDashboard} />
      <ProtectedRoute path="/regulatory-intelligence-hub" component={ClientPortalLanding} />
      <ProtectedRoute path="/regulatory-risk-dashboard" component={ClientPortalLanding} />
      <ProtectedRoute path="/study-architect" component={ClientPortalLanding} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize the health monitor
  const [alarmActive, setAlarmActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  
  // Initialize health monitor worker
  useEffect(() => {
    try {
      // Create a new worker
      const worker = new Worker('/src/workers/healthMonitor.worker.js', { type: 'module' });
      
      // Set up message handler
      const handleWorkerMessage = (event) => {
        const { type, message } = event.data;
        
        if (type === 'ALARM_ACTIVATED') {
          console.error(`🚨 APPLICATION ALARM ACTIVATED: ${message}`);
          setAlarmActive(true);
          setErrorMessage(message || 'The application is experiencing technical difficulties.');
          
          // Show toast
          toast({
            variant: "destructive", 
            title: "🚨 APPLICATION STABILITY ALERT",
            description: "The application is experiencing stability issues. Development should stop immediately.",
            duration: 0, // Don't auto-dismiss
          });
        } else if (type === 'ALARM_DEACTIVATED') {
          setAlarmActive(false);
          setErrorMessage('');
        }
      };
      
      worker.addEventListener('message', handleWorkerMessage);
      console.log('Health monitor initialized');
      
      // Clean up on unmount
      return () => {
        worker.removeEventListener('message', handleWorkerMessage);
        worker.terminate();
      };
    } catch (error) {
      console.error('Failed to initialize health monitor worker:', error);
    }
  }, [toast]);
  
  // Restart the server
  const restartServer = () => {
    setErrorMessage('Attempting to restart the server...');
    window.location.reload();
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell>
          <Router />
        </AppShell>
        <Toaster />
        <ToastCenter />
        
        {/* Application Alarm */}
        <AppAlarm 
          isActive={alarmActive}
          message={errorMessage}
          title="APPLICATION STABILITY ALARM"
          onRestart={restartServer}
          onFix={() => {
            // Force a hard page reload
            window.location.reload();
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;