import React from 'react';
import { ArrowLeft, Sparkles, ExternalLink, Calendar, BookOpen, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SectionHeader({ sectionId, title, onGenerate }) {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-gray-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Document
        </Button>
        <span className="text-gray-400 px-1">|</span>
        <div className="text-sm text-gray-500">
          Module 2 / Section {sectionId} / {title}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Section {sectionId}: {title}
          </h1>
          <p className="text-gray-500 mt-1">
            Provide a comprehensive clinical summary with detailed analysis of benefits and risks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="h-4 w-4" />
            <span>Version History</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>Guidance</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Timeline</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-1.5"
            onClick={onGenerate}
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Draft</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center text-xs bg-blue-50 text-blue-700 p-2 rounded-md border border-blue-100">
        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
        <span>
          <span className="font-medium">Guidance Note:</span> This section should follow ICH E3 guidelines. Use Ctrl+Enter or Cmd+Enter to generate section content with AI assistance.
        </span>
      </div>
    </div>
  );
}