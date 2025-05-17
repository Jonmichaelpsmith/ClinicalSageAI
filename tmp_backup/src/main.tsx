import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
// Custom SecureToast is used instead of React Toastify
import { SecurityProvider } from '../client/src/components/security/SecurityProvider';
import { setupCSP } from './lib/security';

// Initialize Content Security Policy before rendering
if (typeof document !== 'undefined') {
  setupCSP();
}

// Remove problematic CSS imports that are causing 502 errors

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
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);