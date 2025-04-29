import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import CanvasWorkbenchV2 from '../components/canvas/CanvasWorkbenchV2';
import './CanvasPage.css';

/**
 * CanvasPage - Visual editor for CoAuthor module with CTD sections
 * This page provides a drag-and-drop interface for visualizing 
 * and organizing the relationships between sections
 */
export default function CanvasPage() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [currentSection, setCurrentSection] = useState(null);
  
  // Handle node click from the canvas
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
    setCurrentSection(node);
    
    // If you want to open editor tab on click:
    // setActiveTab('editor');
  };

  // Handle section editing
  const handleOpenEditor = () => {
    if (!currentSection) return;
    setActiveTab('editor');
  };

  return (
    <div className="canvas-page">
      {/* Header with navigation tabs */}
      <div className="canvas-header">
        <h1>CoAuthor Workbench</h1>
        
        <div className="canvas-tabs">
          <button 
            className={`tab-button ${activeTab === 'canvas' ? 'active' : ''}`} 
            onClick={() => setActiveTab('canvas')}
          >
            Visual Canvas
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`} 
            onClick={() => setActiveTab('editor')}
            disabled={!currentSection}
          >
            Section Editor
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ai')}
          >
            AI Assistant
          </button>
        </div>
        
        <div className="canvas-actions">
          <Link to="/module-dashboard" className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main content area */}
      <div className="canvas-content">
        {activeTab === 'canvas' && (
          <div className="canvas-workbench-container">
            <CanvasWorkbenchV2 onNodeClick={handleNodeClick} />
          </div>
        )}
        
        {activeTab === 'editor' && currentSection && (
          <div className="editor-container">
            <div className="editor-header">
              <h2>Editing: {currentSection.title}</h2>
              <div className="section-meta">
                <span className={`section-status status-${currentSection.status}`}>
                  {currentSection.status}
                </span>
                <span className="section-id">ID: {currentSection.id}</span>
              </div>
            </div>
            
            <div className="editor-content">
              {/* In a real implementation, this would be a rich text editor */}
              <textarea 
                className="section-textarea"
                placeholder={`Start writing your content for ${currentSection.title}...`}
              />
              
              <div className="editor-sidebar">
                <div className="sidebar-section">
                  <h3>Section Guidance</h3>
                  <p>
                    This section should include detailed information about {currentSection.title.toLowerCase()}.
                    Reference other documents where applicable.
                  </p>
                </div>
                
                <div className="sidebar-section">
                  <h3>Related Sections</h3>
                  <ul className="related-sections">
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Section 3.2.1</a></li>
                    <li><a href="#" onClick={(e) => e.preventDefault()}>Section 5.4</a></li>
                  </ul>
                </div>
                
                <div className="sidebar-section">
                  <h3>Templates</h3>
                  <button className="template-button">Load Template</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'ai' && (
          <div className="ai-assistant-container">
            <div className="ai-header">
              <h2>AI Regulatory Assistant</h2>
            </div>
            
            <div className="ai-chat">
              <div className="chat-messages">
                <div className="message ai">
                  <div className="message-content">
                    <p>Hello! I'm your AI regulatory assistant. How can I help you with your document preparation today?</p>
                  </div>
                </div>
                
                {currentSection && (
                  <div className="message ai">
                    <div className="message-content">
                      <p>I see you're working on section {currentSection.id}: {currentSection.title}. Would you like guidance on this section?</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="chat-input">
                <textarea 
                  placeholder="Ask the AI assistant for help..."
                  rows={3}
                />
                <button className="send-button">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}