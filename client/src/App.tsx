import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
// Import Admin pages
import AdminDashboard from '@/pages/Admin/Dashboard';
import OrganizationsPage from '@/pages/Admin/OrganizationsPage';
import { TenantProvider } from './contexts/TenantContext';

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
      <Route path="/" component={() => <div>Home Page</div>} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/organizations" component={OrganizationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <Router />
        <Toaster />
      </TenantProvider>
    </QueryClientProvider>
  );
}

export default App;