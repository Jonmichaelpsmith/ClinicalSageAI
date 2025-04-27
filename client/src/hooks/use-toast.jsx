import { useState, useCallback } from 'react';

// A simple toast notification system
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Date.now().toString();
    
    setToasts(prev => [...prev, { id, title, description, variant, duration }]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toast, dismissToast, toasts };
};

// Component to render toasts
export const ToastContainer = ({ toasts, dismissToast }) => {
  if (!toasts.length) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          className={`rounded-md shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex-1">
            {toast.title && <h4 className="font-medium">{toast.title}</h4>}
            {toast.description && <p className="text-sm mt-1 text-gray-600">{toast.description}</p>}
          </div>
          <button 
            onClick={() => dismissToast(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};