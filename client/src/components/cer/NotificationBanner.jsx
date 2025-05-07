import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, AlertCircle, Info, CheckCircle, Clock, Database, BookOpen } from 'lucide-react';

/**
 * NotificationBanner Component
 * 
 * A Microsoft 365-style notification banner for displaying non-intrusive messages
 * with optional action buttons, progress indicators, and automatic dismissal.
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
  progress = null, // { faers: 0-100, literature: 0-100 }
  evidenceSnapshot = null, // { faersCount: number, literatureCount: number }
  showInfoIcon = false, // Show info icon with tooltip
  infoTooltip = '',
  additionalContent = null, // Any additional content to display below main message
}) {
  const [isVisible, setIsVisible] = useState(visible);
  const [showTooltip, setShowTooltip] = useState(false);

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
    <div className={`${styles.bg} border-l-4 ${styles.border} p-3 mb-4 rounded shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">{styles.icon}</div>
          <div>
            <div className="flex items-center">
              <div className={`text-sm ${styles.text} font-medium`}>
                {message}
              </div>
              
              {showInfoIcon && (
                <div 
                  className="relative ml-1.5 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info className="w-3.5 h-3.5 text-[#0F6CBD]" />
                  
                  {showTooltip && (
                    <div className="absolute z-50 w-64 p-2 bg-white rounded shadow-lg border border-gray-200 text-xs text-gray-700 left-0 top-full mt-1">
                      {infoTooltip}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Additional content */}
            {additionalContent && (
              <div className={`text-xs ${styles.text} mt-1 opacity-80`}>
                {additionalContent}
              </div>
            )}
            
            {/* Progress indicators */}
            {progress && (
              <div className="mt-2 space-y-2 w-full max-w-md">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center">
                      <Database className="w-3 h-3 mr-1 text-[#0F6CBD]" />
                      <span className={styles.text}>FAERS</span>
                    </div>
                    <span className={styles.text}>{progress.faers}%</span>
                  </div>
                  <Progress value={progress.faers} className="h-1.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1 text-[#0F6CBD]" />
                      <span className={styles.text}>Literature</span>
                    </div>
                    <span className={styles.text}>{progress.literature}%</span>
                  </div>
                  <Progress value={progress.literature} className="h-1.5" />
                </div>
              </div>
            )}
            
            {/* Evidence snapshot */}
            {evidenceSnapshot && (
              <div className="mt-2 flex space-x-4 text-xs">
                <div className="flex items-center">
                  <Database className="w-3.5 h-3.5 mr-1 text-[#0F6CBD]" />
                  <span className={`${styles.text} font-medium`}>
                    📊 {evidenceSnapshot.faersCount} FAERS reports retrieved
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-[#0F6CBD]" />
                  <span className={`${styles.text} font-medium`}>
                    📚 {evidenceSnapshot.literatureCount} studies fetched
                  </span>
                </div>
              </div>
            )}
          </div>
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
    </div>
  );
}