import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cleanupModals } from '../lib/modalHelpers';

const ClientPortal = () => {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Clean up modals when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  // Clean up modals when section changes
  useEffect(() => {
    cleanupModals();
    console.log("Cleaning up modals on section change to:", activeSection);
  }, [activeSection]);

  return (
    <div className="client-portal">
      {/* Header with navigation */}
      <header className="portal-header">
        <div className="header-nav">
          <button className="btn btn-nav" onClick={() => window.history.back()}>← Back</button>
          <button className="btn btn-nav">→ Forward</button>
          <button className="btn btn-primary-nav">
            <span className="icon">🏠</span> Client Portal
          </button>
        </div>
        
        <div className="header-controls">
          <button className="btn btn-control">
            <span className="icon">⚙️</span> Settings
          </button>
          <button className="btn btn-control">
            <span className="icon">👥</span> Client Management
          </button>
          <button className="btn btn-control">
            <span className="icon">🏢</span> Organization Settings
          </button>
          <button className="btn btn-control">
            <span className="icon">🔄</span> Switch Module
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="portal-tabs">
        <button 
          className={`tab-button ${activeSection === 'risk-heatmap' ? 'active' : ''}`}
          onClick={() => setActiveSection('risk-heatmap')}
        >
          Risk Heatmap
        </button>
        <button 
          className={`tab-button ${activeSection === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSection('timeline')}
        >
          Timeline Simulator
        </button>
        <button 
          className={`tab-button ${activeSection === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveSection('ai')}
        >
          <span className="icon">✨</span> Ask Lumen AI
        </button>
      </div>

      {/* Main Content */}
      <main className="portal-content">
        {activeSection === 'risk-heatmap' && (
          <div className="module-section">
            <h2 className="section-title">FDA 510(k) Submission Pipeline</h2>
            <div className="pipeline-alert">
              <span className="info-icon">ℹ️</span> You are currently working on a FDA 510(k) Submission. 
              <button className="link-button">Switch to Clinical Evaluation Report?</button>
              <button className="switch-button">Switch to CER</button>
            </div>

            <div className="device-list">
              <h3>Available Devices</h3>
              
              <div className="device-item">
                <div className="device-info">
                  <h4>Bard-Parker® Sterile Scalpel with Handle</h4>
                  <span className="device-class">Class I</span>
                  <span className="device-code">GES</span>
                </div>
                <button className="btn btn-select">Select</button>
              </div>

              <div className="device-item">
                <div className="device-info">
                  <h4>Welch Allyn Green Series 600 Examination Light</h4>
                  <span className="device-class">Class I</span>
                  <span className="device-code">FQP</span>
                </div>
                <button className="btn btn-select">Select</button>
              </div>

              <div className="device-item">
                <div className="device-info">
                  <h4>Dentsply Sirona Midwest Stylus ATC High-Speed Handpiece</h4>
                  <span className="device-class">Class I</span>
                  <span className="device-code">EFB</span>
                </div>
                <button className="btn btn-select">Select</button>
              </div>

              <div className="device-item">
                <div className="device-info">
                  <h4>Philips IntelliVue MX750 Patient Monitor</h4>
                  <span className="device-class">Class II</span>
                  <span className="device-code">DRT</span>
                </div>
                <button className="btn btn-select">Select</button>
              </div>

              <div className="device-item">
                <div className="device-info">
                  <h4>Medtronic MiniMed 780G Insulin Pump System</h4>
                  <span className="device-class">Class II</span>
                  <span className="device-code">LZG</span>
                </div>
                <button className="btn btn-select">Select</button>
              </div>
            </div>

            <div className="document-import">
              <h3>Intelligent Document Import</h3>
              <p>Upload existing documentation to automatically extract device data and populate the form. Our AI will analyze your documents and extract relevant regulatory information.</p>
              <button className="btn btn-primary">Upload Device Documentation</button>
            </div>
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="timeline-section">
            <h2 className="section-title">Timeline Simulator</h2>
            <p>Predict and visualize your regulatory approval timeline.</p>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="ai-section">
            <h2 className="section-title">Ask Lumen AI</h2>
            <p>Get intelligent assistance for your regulatory questions.</p>
          </div>
        )}
      </main>

      {/* Module Cards */}
      <section className="module-cards">
        <h2 className="section-title">TrialSage™ Modules</h2>
        
        <div className="modules-grid">
          <div className="module-card">
            <h3>CER Generator™</h3>
            <div className="progress-bar">
              <div className="progress" style={{width: "80%"}}></div>
            </div>
            <div className="module-status">80% Complete</div>
            <button className="btn btn-module" onClick={() => setLocation('/cerv2')}>Go to CER Generator</button>
          </div>
          
          <div className="module-card">
            <h3>IND Wizard™</h3>
            <div className="progress-bar">
              <div className="progress" style={{width: "65%"}}></div>
            </div>
            <div className="module-status">
              <span className="status-tag low">LOW</span> 65% Complete
            </div>
          </div>
          
          <div className="module-card">
            <h3>TrialSage Vault™</h3>
            <div className="progress-bar">
              <div className="progress" style={{width: "90%"}}></div>
            </div>
            <div className="module-status">
              <span className="status-tag low">LOW</span> 90% Complete
            </div>
          </div>
        </div>
      </section>

      {/* Status indicator */}
      <div className="status-indicator">
        <span className="online-status">✅ Online</span>
      </div>
    </div>
  );
};

export default ClientPortal;