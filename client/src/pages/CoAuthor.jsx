import React, { useState } from 'react';
import { useLocation } from 'wouter';
import UnifiedTopNavV4 from '../components/navigation/UnifiedTopNavV4';
import CoauthorModule from '../components/coauthor/CoauthorModule';
import DocumentSelector from '../components/coauthor/DocumentSelector';
import CanvasWorkbenchV2 from '../components/canvas/CanvasWorkbenchV2';
import './CoAuthor.css';
import '../styles/theme.css';

/**
 * eCTD Co-Author Page
 * 
 * This page provides AI-assisted co-authoring of CTD submission sections
 * with context retrieval and draft generation capabilities.
 * 
 * Features:
 * - AI-assisted document drafting with real-time updates
 * - Regulatory search and guidance integration
 * - Risk analysis for compliance assessment
 * - Interactive timeline simulation
 * - Lumen AI chat assistance
 */
export default function CoAuthor() {
  const [location] = useLocation();
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Determine which content to render based on the current path
  const isCanvasView = location === '/coauthor/canvas';
  const isEditing = location.includes('/coauthor/edit');
  const isHome = location === '/coauthor';
  
  const handleSelectDocument = (documentId) => {
    console.log('Selected document:', documentId);
    setSelectedDocument(documentId);
    // We don't change the URL, just track state internally
  };
  
  const handleBackToSelector = () => {
    console.log('Navigating back to document selector');
    setSelectedDocument(null);
  };
  
  return (
    <>
      <UnifiedTopNavV4
        tabs={[
          { path: '/coauthor',          label: 'eCTD Co-Author'    },
          { path: '/coauthor/timeline', label: 'Timeline Simulator' },
          { path: '/coauthor/ask-lumen', label: 'Ask Lumen AI'      },
          { path: '/coauthor/canvas',   label: 'Canvas Workbench'   },
        ]}
      />
      
      {isCanvasView ? (
        <div className="canvas-container" style={{ height: 'calc(100vh - 60px)' }}>
          <CanvasWorkbenchV2 />
        </div>
      ) : isHome ? (
        selectedDocument ? (
          <div className="coauthor-full-content">
            <CoauthorModule onBackToSelector={handleBackToSelector} />
          </div>
        ) : (
          <DocumentSelector onSelectDocument={handleSelectDocument} />
        )
      ) : (
        <div className="coauthor-full-content">
          <CoauthorModule onBackToSelector={handleBackToSelector} />
        </div>
      )}
    </>
  );
}