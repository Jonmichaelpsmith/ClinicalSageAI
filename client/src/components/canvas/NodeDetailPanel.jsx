import React, { useState, useEffect } from 'react';
import './NodeDetailPanel.css';

/**
 * NodeDetailPanel - Displays detailed information about a selected node
 * This component shows guidance, risk assessment, and actions for a section
 */
export default function NodeDetailPanel({ 
  section, 
  onClose,
  onOpenChat
}) {
  const [activeTab, setActiveTab] = useState('guidance');
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState('');
  const [risks, setRisks] = useState(null);
  
  // Fetch guidance when section changes
  useEffect(() => {
    const fetchGuidance = async () => {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      setTimeout(() => {
        const mockGuidance = `
This section (${section.title}) requires careful documentation of the following elements:

1. Comprehensive overview of the submission structure
2. Clear delineation of dependencies and relationships
3. Proper formatting according to regulatory standards
4. Cross-references to supporting documentation

Ensure all content adheres to ICH guidelines for ${section.id} sections.
        `;
        
        const mockRisks = {
          level: section.status === 'critical' ? 'high' : 
                 section.status === 'complete' ? 'low' : 'medium',
          impact: section.status === 'critical' ? '45-60 days' :
                  section.status === 'complete' ? '0 days' : '15-30 days',
          factors: [
            'Missing required documentation',
            'Inconsistent formatting across sections',
            'Inadequate cross-referencing',
            'Outdated regulatory citations'
          ]
        };
        
        setGuidance(mockGuidance);
        setRisks(mockRisks);
        setLoading(false);
      }, 800);
    };
    
    fetchGuidance();
  }, [section]);
  
  return (
    <div className="node-detail-panel">
      <div className="panel-header">
        <h2>Section {section.id}: {section.title}</h2>
        <button 
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'guidance' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidance')}
        >
          Guidance
        </button>
        <button 
          className={`tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Assessment
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
      </div>
      
      <div className="panel-content">
        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <>
            {/* Guidance Tab */}
            {activeTab === 'guidance' && (
              <div className="guidance-content">
                <h3>Regulatory Guidance for {section.title}</h3>
                <p>{guidance}</p>
                
                <div className="examples">
                  <h4>Common Examples</h4>
                  <ul>
                    <li>See example in Section 2.3.1 of the IND template</li>
                    <li>Reference FDA Guidance Document SC-2022-03</li>
                    <li>Follow ICH M4E(R2) formatting guidelines</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Risk Assessment Tab */}
            {activeTab === 'risk' && risks && (
              <div className="risk-content">
                <div className="risk-level">
                  <div>Risk Level:</div>
                  <div className={`risk-badge ${risks.level}`}>
                    {risks.level.toUpperCase()}
                  </div>
                </div>
                
                <div className="risk-impact">
                  <div>Potential Delay:</div>
                  <div className="delay-days">{risks.impact}</div>
                </div>
                
                <div className="risk-factors">
                  <h4>Risk Factors</h4>
                  <ul>
                    {risks.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <div className="actions-content">
                <button 
                  className="action-button"
                  onClick={onOpenChat}
                >
                  Ask Lumen AI
                </button>
                
                <button className="action-button">
                  Generate Content
                </button>
                
                <button className="action-button">
                  Check Completeness
                </button>
                
                <button className="action-button">
                  View Related Documents
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}