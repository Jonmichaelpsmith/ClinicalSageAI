/**
 * AI Assistant Button
 * 
 * This component provides a floating action button to access the AI assistant.
 * It adapts to the current module context to provide contextual help and recommendations.
 */

import React, { useState, useEffect } from 'react';
import { useModuleIntegration, MODULE_NAMES } from './integration/ModuleIntegrationLayer';

// UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lightbulb 
} from 'lucide-react';

/**
 * AI Assistant Button Component
 */
export const AIAssistantButton = ({ open, onClick, activeModule }) => {
  // State
  const [hasInsights, setHasInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  
  // Integration hooks
  const { services } = useModuleIntegration();
  
  // Check for new insights periodically
  useEffect(() => {
    const checkForInsights = async () => {
      try {
        // In a real implementation, this would call something like:
        // const insights = await services.intelligence.getNewInsights();
        // setHasInsights(insights.length > 0);
        // setInsightCount(insights.length);
        
        // For now, simulate with random insights
        const hasNewInsights = Math.random() > 0.5;
        setHasInsights(hasNewInsights);
        
        if (hasNewInsights) {
          setInsightCount(Math.floor(Math.random() * 3) + 1);
        }
      } catch (error) {
        console.error('Error checking for insights:', error);
      }
    };
    
    // Initial check
    checkForInsights();
    
    // Check every minute
    const interval = setInterval(checkForInsights, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Button
      className="relative"
      size="lg"
      onClick={onClick}
      variant={open ? "secondary" : "default"}
    >
      {open ? (
        <Sparkles className="h-5 w-5 mr-2" />
      ) : (
        <Lightbulb className="h-5 w-5 mr-2" />
      )}
      
      <span>AI Assistant</span>
      
      {/* Contextual label if in module */}
      {activeModule && !open && (
        <span className="ml-1 text-xs">
          ({MODULE_NAMES[activeModule]})
        </span>
      )}
      
      {/* Insight indicator */}
      {hasInsights && !open && (
        <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] bg-primary text-primary-foreground">
          {insightCount}
        </Badge>
      )}
    </Button>
  );
};

export default AIAssistantButton;