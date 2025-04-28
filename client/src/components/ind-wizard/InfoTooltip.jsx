// /client/src/components/ind-wizard/InfoTooltip.jsx

import { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function InfoTooltip({ 
  title, 
  content, 
  text, // Added text parameter
  icgGuidanceLink = null,
  regulatoryRef = null,
  expanded = false 
}) {
  const [isOpen, setIsOpen] = useState(expanded);

  const toggleTooltip = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            onClick={toggleTooltip} 
            className="inline-flex items-center justify-center p-1 rounded-full text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start" 
          className="max-w-md p-0 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden"
        >
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-white border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-indigo-700">{title || "Module Information"}</h3>
              <button 
                type="button" 
                onClick={toggleTooltip}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-700">{text || content}</p>
            {(icgGuidanceLink || regulatoryRef) && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                {icgGuidanceLink && (
                  <a 
                    href={icgGuidanceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    ICH Guidance
                  </a>
                )}
                {regulatoryRef && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Ref:</span> {regulatoryRef}
                  </p>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}