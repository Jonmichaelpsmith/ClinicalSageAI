import React from 'react';
import { useLocation } from 'wouter';
import UnifiedTopNavV5 from '../components/navigation/UnifiedTopNavV5';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import CanvasWorkbenchV2 from '../components/canvas/CanvasWorkbenchV2';
import './CanvasPage.css';

export default function CanvasPage() {
  const [location, navigate] = useLocation();

  // When a node is clicked, navigate to the Co-Author editor for that module/section
  const handleNodeClick = (node) => {
    // Assuming node.id is like "2.7"
    const [moduleId, sectionId] = node.id.split('.');
    navigate(`/coauthor?module=${moduleId}&section=${node.id}`);
  };

  return (
    <div className="canvas-page">
      <UnifiedTopNavV5
        tabs={[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/coauthor',  label: 'Co-Author' },
          { path: '/canvas',    label: 'Canvas'    },
          { path: '/coauthor/timeline',  label: 'Timeline'  },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: 'TrialSage™', to: '/dashboard' },
          { label: 'Canvas Workbench' }
        ]}
      />

      <main className="canvas-main">
        <CanvasWorkbenchV2
          onNodeClick={handleNodeClick}
        />
      </main>
    </div>
  );
}