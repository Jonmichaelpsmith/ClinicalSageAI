// App.tsx – root router with improved toast and resilient WebSocket connection
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import SubmissionBuilder from './pages/SubmissionBuilder';
import IndSequenceDetail from './pages/IndSequenceDetail';
import IndSequenceManager from './pages/IndSequenceManager';
import HomeLanding from './pages/HomeLandingProtected';
import DebugInfo from './components/DebugInfo';
import ErrorBoundary from './ErrorBoundary';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
// Custom toast notifications (without external dependencies)
// import { ToastContainer, toast } from 'react-toastify';
// Temporarily commented out to fix import issues

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
    const toast: Toast = {
      id: Date.now(),
      message: isString ? options : options.message,
      type: isString ? 'success' : (options.type || 'success')
    };
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

// WebSocket listener inside component rendered *after* provider
import useQCWebSocket from './hooks/useQCWebSocket';

function QCSocket() {
  const toast = useToast();
  
  // Using our fallback implementation instead of real WebSocket
  useQCWebSocket('FDA', (data) => {
    // Handle messages by showing toasts
    if (data.id && data.status) {
      toast({
        message: `QC ${data.status} for document ${data.id}`,
        type: data.status === 'passed' ? 'success' : 'error'
      });
    } else if (data.type === 'connection_established') {
      // Show a message that we're using fallback mode
      console.log('[QC System] Using fallback mode (WebSocket disabled)', data);
      toast({
        message: 'QC system in fallback mode',
        type: 'info'
      });
    } else {
      console.log('[QC System] Received message:', data);
    }
  });
  
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QCSocket/>
        <Switch>
          <Route path="/">
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
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
          <Route>
            <ErrorBoundary>
              <HomeLanding />
            </ErrorBoundary>
          </Route>
        </Switch>
        <DebugInfo />
        
        {/* Temporarily removed ToastContainer */}
      </ToastProvider>
    </ErrorBoundary>
  );
}