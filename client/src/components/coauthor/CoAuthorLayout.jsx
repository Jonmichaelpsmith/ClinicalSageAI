import React, { useState } from 'react';
import UnifiedTopNavV3 from '../navigation/UnifiedTopNavV3';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CoAuthorLayout
 * 
 * Main layout component for the Co-Author feature with two-pane workbench design.
 * Contains the header with breadcrumbs and the main content area split into
 * editor pane (left) and copilot pane (right).
 */
export default function CoAuthorLayout({ children, copilot }) {
  const [activeTab, setActiveTab] = useState('CoAuthor');
  const [moduleId, setModuleId] = useState('2');
  const [sectionId, setSectionId] = useState('2.7');
  
  // Breadcrumbs for navigation context
  const breadcrumbs = ['TrialSage™', 'eCTD Co-Author™', `Module ${moduleId}`, `Section ${sectionId}`];

  // Handle tab changes in the top navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Unified nav with breadcrumbs */}
      <UnifiedTopNavV3 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        breadcrumbs={breadcrumbs}
        className="unified-top-nav"
      />
      
      {/* Navigation path */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
          <button className="px-2 py-1 rounded hover:bg-gray-100 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </button>
          
          <span className="text-gray-400 mx-1">|</span>
          
          <button className="px-2 py-1 rounded hover:bg-gray-100 flex items-center">
            Forward <ChevronRight className="h-4 w-4 ml-1" />
          </button>
          
          <span className="text-gray-400 mx-1">|</span>
          
          <button className="px-2 py-1 bg-indigo-600 text-white rounded shadow-sm">
            Client Portal
          </button>
        </div>
      </div>
      
      {/* Module/Section breadcrumb path */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto text-sm text-gray-600">
          TrialSage™ &gt; eCTD Co-Author™ &gt; Module {moduleId} &gt; Section {sectionId}
        </div>
      </div>
      
      {/* Main content container */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Two-pane layout */}
        <div className="coauthor-content">
          {/* Editor pane (left) */}
          <div className="editor-pane">
            {children}
          </div>
          
          {/* Copilot pane (right) */}
          <div className="copilot-pane">
            {copilot}
          </div>
        </div>
        
        {/* Footer area */}
        <div className="coauthor-footer">
          <button className="px-3 py-1.5 bg-gray-100 text-sm font-medium rounded hover:bg-gray-200 transition-colors">
            Switch Module
          </button>
        </div>
      </div>
    </div>
  );
}