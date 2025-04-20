// App.tsx – root router with custom toast + resilient WS connection
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import SubmissionBuilder from './pages/SubmissionBuilder';
import IndSequenceDetail from './pages/IndSequenceDetail';
import IndSequenceManager from './pages/IndSequenceManager';
import HomeLanding from './pages/HomeLanding';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

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
function QCSocket() {
  const toast = useToast();
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;
    
    const connectWebSocket = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      // Use Express server as proxy to FastAPI WebSocket
      const wsUrl = `${proto}://${location.host}/ws/qc`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('QC WebSocket connected');
        reconnectAttempts = 0;
      };
      
      ws.onmessage = evt => {
        try {
          const data = JSON.parse(evt.data);
          if (data.id && data.status) {
            toast({
              message: `QC ${data.status} for document ${data.id}`,
              type: data.status === 'passed' ? 'success' : 'error'
            });
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          message: 'QC WebSocket connection error',
          type: 'error'
        });
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        
        // Implement exponential backoff for reconnection
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        if (reconnectTimeout) {
          window.clearTimeout(reconnectTimeout);
        }
        
        // @ts-ignore - setTimeout returns a number in browser environments
        reconnectTimeout = window.setTimeout(connectWebSocket, delay);
      };
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
    };
  }, [toast]);
  
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <QCSocket/>
      <Switch>
        <Route path="/" component={HomeLanding} />
        <Route path="/builder" component={SubmissionBuilder} />
        <Route path="/portal/ind/:sequenceId" component={IndSequenceDetail} />
        <Route path="/ind/planner" component={IndSequenceManager} />
        <Route component={IndSequenceManager} />
      </Switch>
    </ToastProvider>
  );
}