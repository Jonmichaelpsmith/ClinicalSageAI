import React from 'react';
import UnifiedTopNavV4 from '../components/navigation/UnifiedTopNavV4';
import SectionEditor from '../components/coauthor/SectionEditor';
import AICopilotPanel from '../components/coauthor/AICopilotPanel';
import './CoAuthor.css';

/**
 * eCTD Co-Author Page
 * 
 * This page provides AI-assisted co-authoring of CTD submission sections
 * with context retrieval and draft generation capabilities.
 */
export default function CoAuthor() {
  return (
    <>
      <UnifiedTopNavV4
        tabs={[
          { path: '/coauthor',          label: 'Risk Heatmap'       },
          { path: '/coauthor/timeline', label: 'Timeline Simulator' },
          { path: '/coauthor/ask-lumen', label: 'Ask Lumen AI'      },
        ]}
      />
      
      <div className="coauthor-content">
        <div className="editor-pane">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Section 2.7: Clinical Summary</h1>
          <SectionEditor />
        </div>
        <aside className="copilot-pane">
          <AICopilotPanel />
        </aside>
      </div>
    </>
  );
}