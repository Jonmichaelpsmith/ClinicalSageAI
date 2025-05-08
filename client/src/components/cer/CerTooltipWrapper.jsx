import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

/**
 * Enhanced tooltip wrapper specifically designed for CER module to provide context-sensitive help
 * with separate "Why this matters" section for regulatory relevance.
 */
const CerTooltipWrapper = ({ 
  children, 
  tooltipContent, 
  whyThisMatters = null,
  width = 'max-w-[350px]',
  side = 'right'
}) => {
  // Allow for handling complex children that might have their own onClick
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <div 
            className="inline-flex relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {children}
            {!tooltipContent.includes('infoIcon=false') && (
              <div className="inline-flex items-center absolute right-0 top-0 -mt-2 -mr-2">
                <HelpCircle className="h-4 w-4 text-[#0F6CBD]" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className={`bg-white border border-[#E1DFDD] text-[#323130] shadow-md p-3 ${width} text-sm`}
        >
          <div className="space-y-2">
            <div>{tooltipContent}</div>
            
            {whyThisMatters && (
              <>
                <div className="border-t border-[#E1DFDD] my-2 pt-2">
                  <span className="text-[#E3008C] font-medium">Why this matters:</span>
                </div>
                <div className="text-[#605E5C]">{whyThisMatters}</div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CerTooltipWrapper;