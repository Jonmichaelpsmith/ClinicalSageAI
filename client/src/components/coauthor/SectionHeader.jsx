import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export default function SectionHeader({ sectionId, title, onGenerate }) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-blue-600">Section {sectionId}:</span> {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Info className="h-5 w-5 text-gray-400 hover:text-gray-700 cursor-pointer" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This section contains the clinical study summary information required for regulatory submission.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h1>
        <p className="text-gray-600 mt-1">
          AI-assisted authoring for regulatory submission document
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Keyboard shortcut: Ctrl+G</span>
        <Button 
          onClick={onGenerate}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Draft
        </Button>
      </div>
    </div>
  );
}