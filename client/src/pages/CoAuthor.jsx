import React from 'react';
import { useLocation } from 'wouter';
import UnifiedTopNavV4 from '../components/navigation/UnifiedTopNavV4';
import SectionEditor from '../components/coauthor/SectionEditor';
import AICopilotPanel from '../components/coauthor/AICopilotPanel';
import CanvasWorkbench from '../components/canvas/CanvasWorkbench';
import CanvasWorkbenchV2 from '../components/canvas/CanvasWorkbenchV2';
import './CoAuthor.css';
import '../styles/theme.css';

/**
 * eCTD Co-Author Page
 * 
 * This page provides AI-assisted co-authoring of CTD submission sections
 * with context retrieval and draft generation capabilities.
 */
export default function CoAuthor() {
  const [location] = useLocation();
  
  // Determine which content to render based on the current path
  const isCanvasView = location === '/coauthor/canvas';
  
  return (
    <>
      <UnifiedTopNavV4
        tabs={[
          { path: '/coauthor',          label: 'Risk Heatmap'       },
          { path: '/coauthor/timeline', label: 'Timeline Simulator' },
          { path: '/coauthor/ask-lumen', label: 'Ask Lumen AI'      },
          { path: '/coauthor/canvas',   label: 'Canvas Workbench'   },
        ]}
      />
      
      {isCanvasView ? (
        <div className="canvas-container" style={{ height: 'calc(100vh - 60px)' }}>
          <CanvasWorkbenchV2 />
        </div>
      ) : (
        <div className="coauthor-content">
          <div className="editor-pane">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">Section 2.7: Clinical Summary</h1>
            <SectionEditor />
          </div>
          <aside className="copilot-pane">
            <AICopilotPanel />
          </aside>
        </div>
      )}
    </>
  );
}