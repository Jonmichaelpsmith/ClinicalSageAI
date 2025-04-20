// App.tsx – root router with improved toast and resilient WebSocket connection
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import SubmissionBuilder from './pages/SubmissionBuilder';
import IndSequenceDetail from './pages/IndSequenceDetail';
import IndSequenceManager from './pages/IndSequenceManager';
import HomeLanding from './pages/HomeLandingProtected';
import DebugInfo from './components/DebugInfo';
import ErrorBoundary from './ErrorBoundary';
import ProductFeatures from './pages/ProductFeatures';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
// React Toastify for production-ready notifications
import { ToastContainer, toast as toastify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ------------ Improved Toast Provider ------------- */
export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  type?: ToastType;
  message: string;
}

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type ToastContextValue = (options: ToastOptions | string) => void;

const ToastCtx = createContext<ToastContextValue>(() => {});

const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const add = useCallback((options: ToastOptions | string) => {
    const isString = typeof options === 'string';
    // Use a more unique ID with random component to prevent duplicates
    const toast: Toast = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      message: isString ? options : options.message,
      type: isString ? 'success' : (options.type || 'success')
    };
    
    // Also use react-toastify to ensure reliable notifications
    const toastType = isString ? 'success' : (options.type || 'success');
    const message = isString ? options : options.message;
    
    // Display using react-toastify
    switch(toastType) {
      case 'success':
        toastify.success(message);
        break;
      case 'error':
        toastify.error(message);
        break;
      default:
        toastify.info(message);
    }
    
    // Still update internal state for backward compatibility
    setToasts(t => [...t, toast]);
  }, []);
  
  const remove = (id: number) => setToasts(t => t.filter(x => x.id !== id));
  
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {toasts.map(t => {
          // Determine background color based on type
          const bgColor = t.type === 'success' ? '#16a34a' : 
                         t.type === 'error' ? '#dc2626' : 
                         '#0891b2'; // info color
          
          // Determine icon based on type
          const Icon = t.type === 'success' ? CheckCircle : 
                     t.type === 'error' ? AlertTriangle : 
                     Info;
                    
          return (
            <div 
              key={t.id} 
              onAnimationEnd={() => remove(t.id)}
              style={{
                minWidth: 250,
                padding: '8px 12px',
                borderRadius: 4,
                color: '#fff',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                animation: 'fadeout 4s forwards'
              }}
            >
              <Icon size={16} />
              <span>{t.message}</span>
              <style>{`@keyframes fadeout{0%{opacity:1}80%{opacity:1}100%{opacity:0}}`}</style>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);
/* ------------------------------------------------------------------ */

// Import for useQCWebSocket now moved to SubmissionBuilder component
// Each page that needs WebSocket will initialize its own connection

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Switch>
          <Route path="/builder">
            <ErrorBoundary>
              <SubmissionBuilder />
            </ErrorBoundary>
          </Route>
          <Route path="/portal/ind/:sequenceId">
            <ErrorBoundary>
              <IndSequenceDetail />
            </ErrorBoundary>
          </Route>
          <Route path="/ind/planner">
            <ErrorBoundary>
              <IndSequenceManager />
            </ErrorBoundary>
          </Route>
          <Route path="/solutions">
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
          <Route path="/products">
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
          <Route path="/">
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
          <Route>
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
        </Switch>
        <DebugInfo />
        
        {/* React-Toastify container for production-ready notifications */}
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ToastProvider>
    </ErrorBoundary>
  );
}