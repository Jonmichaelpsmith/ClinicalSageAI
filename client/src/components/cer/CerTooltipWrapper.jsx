import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

/**
 * CER Tooltip Wrapper Component
 * 
 * A reusable wrapper for adding tooltips to CER components with consistent styling
 * and placement. Designed to provide contextual guidance throughout the CER workflow.
 */
const CerTooltipWrapper = ({ 
  children, 
  content, 
  side = "right", 
  showIcon = true,
  delay = 0,
  className = "" 
}) => {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center ${className}`}>
            {children}
            {showIcon && (
              <HelpCircle className="ml-1 h-4 w-4 text-[#0F6CBD] opacity-70" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="bg-white border border-[#E1DFDD] shadow-md p-3 max-w-sm text-sm text-[#323130] rounded"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CerTooltipWrapper;