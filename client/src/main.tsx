import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
// Use our security components
import { SecurityProvider } from './components/security/SecurityProvider';
import { setupCSP } from './lib/security';

// Initialize Content Security Policy before rendering
if (typeof document !== 'undefined') {
  setupCSP();
}

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <App />
      </SecurityProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);