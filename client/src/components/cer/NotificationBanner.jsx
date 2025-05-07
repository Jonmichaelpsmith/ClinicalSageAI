import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

/**
 * NotificationBanner Component
 * 
 * A Microsoft 365-style notification banner for displaying non-intrusive messages
 * with optional action buttons and automatic dismissal.
 */
export default function NotificationBanner({
  message,
  type = 'info', // 'info', 'warning', 'success', 'loading'
  action = null, // { label, onClick }
  secondaryAction = null,
  autoDismiss = false,
  autoDismissTime = 8000,
  onDismiss = () => {},
  visible = true,
}) {
  const [isVisible, setIsVisible] = useState(visible);

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        dismiss();
      }, autoDismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, isVisible, autoDismissTime]);

  // Reset visibility when parent changes visible prop
  React.useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const dismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  // Determine styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-[#FFF4CE]',
          border: 'border-[#F2C811]',
          icon: <AlertCircle className="w-4 h-4 text-[#986F0B]" />,
          text: 'text-[#986F0B]'
        };
      case 'success':
        return {
          bg: 'bg-[#DFF6DD]',
          border: 'border-[#107C10]',
          icon: <CheckCircle className="w-4 h-4 text-[#107C10]" />,
          text: 'text-[#107C10]'
        };
      case 'loading':
        return {
          bg: 'bg-[#E5F2FF]',
          border: 'border-[#0F6CBD]',
          icon: <Clock className="w-4 h-4 text-[#0F6CBD] animate-pulse" />,
          text: 'text-[#0F6CBD]'
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#E5F2FF]',
          border: 'border-[#0F6CBD]',
          icon: <Info className="w-4 h-4 text-[#0F6CBD]" />,
          text: 'text-[#0F6CBD]'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} border-l-4 ${styles.border} p-3 mb-4 rounded flex items-center justify-between shadow-sm`}>
      <div className="flex items-center">
        <div className="mr-3">{styles.icon}</div>
        <div className={`text-sm ${styles.text}`}>{message}</div>
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <Button 
            size="sm" 
            variant="ghost"
            className={`h-7 px-2 py-1 ${styles.text} hover:bg-white/50`} 
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            size="sm" 
            variant="ghost"
            className={`h-7 px-2 py-1 ${styles.text} hover:bg-white/50`}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 hover:bg-white/50"
          onClick={dismiss}
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}