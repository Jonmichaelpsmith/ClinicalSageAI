import React, { useState } from 'react';
import { Link } from 'wouter';
import CanvasWorkbenchV2 from '../components/canvas/CanvasWorkbenchV2';
import './CanvasPage.css';

/**
 * CanvasPage - Visual submission planning with interactive node editor
 * This page provides the Canvas Workbench for visualizing submission components
 */
export default function CanvasPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Handle when a node is clicked in the canvas
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSidebarOpen(true);
  };
  
  return (
    <div className="canvas-page">
      {/* Header with navigation */}
      <div className="canvas-header">
        <h1>Submission Canvas</h1>
        
        <div className="canvas-tools">
          <button className="tool-button">
            <span className="tool-icon">+</span>
            Add Section
          </button>
          
          <button className="tool-button export">
            <span className="tool-icon">↓</span>
            Export SVG
          </button>
          
          <select className="submission-type-select">
            <option value="ind">IND</option>
            <option value="nda">NDA</option>
            <option value="bla">BLA</option>
            <option value="maa">MAA</option>
          </select>
        </div>
        
        <div className="canvas-actions">
          <Link to="/timeline" className="nav-link">
            Timeline View
          </Link>
          <Link to="/module-dashboard" className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="canvas-content">
        {/* The main canvas workbench */}
        <CanvasWorkbenchV2
          onNodeClick={handleNodeClick}
        />
        
        {/* Sidebar - conditionally rendered when a node is selected */}
        {selectedNode && sidebarOpen && (
          <div className="canvas-sidebar">
            <div className="sidebar-header">
              <h2>Section Details</h2>
              <button 
                className="close-button"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="sidebar-content">
              <div className="section-info">
                <div className="info-row">
                  <div className="info-label">ID:</div>
                  <div className="info-value">{selectedNode.id}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Title:</div>
                  <div className="info-value">{selectedNode.title}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Status:</div>
                  <div className={`info-value status ${selectedNode.status}`}>
                    {selectedNode.status === 'complete' ? 'Complete' :
                     selectedNode.status === 'critical' ? 'Critical' : 'Pending'}
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Deadline:</div>
                  <div className="info-value">{selectedNode.deadline || 'Not set'}</div>
                </div>
              </div>
              
              <div className="section-description">
                <h3>Description</h3>
                <p>
                  {selectedNode.description || 
                   `This section represents ${selectedNode.title} within the submission structure. 
                   It is currently ${selectedNode.status} with connections to other sections as shown in the canvas.`}
                </p>
              </div>
              
              <div className="section-connections">
                <h3>Connected Sections</h3>
                {selectedNode.connections && selectedNode.connections.length > 0 ? (
                  <ul className="connections-list">
                    {selectedNode.connections.map((connId) => (
                      <li key={connId} className="connection-item">
                        Section {connId}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-connections">No connections to other sections</p>
                )}
              </div>
              
              <div className="section-actions">
                <button className="action-button primary">
                  Edit Section
                </button>
                
                <button className="action-button secondary">
                  View Documents
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}