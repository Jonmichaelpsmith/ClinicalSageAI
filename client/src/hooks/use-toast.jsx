// Simple toast hook for notifications
import { useState, useCallback } from 'react';

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = DEFAULT_TOAST_DURATION }) => {
    const id = Date.now().toString();
    
    setToasts(prev => [...prev, { id, title, description, variant, duration }]);
    
    // Auto-dismiss toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  const dismiss = useCallback((toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  return { toast, dismiss, toasts };
};

// For backwards compatibility with the API from shadcn/ui
const toastService = {
  toast: ({ title, description, variant, duration }) => {
    const toastHook = useToast();
    return toastHook.toast({ title, description, variant, duration });
  },
};

export default toastService;