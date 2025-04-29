import React, { useState, useEffect } from 'react';
import './CanvasSidePanel.css';

/**
 * Canvas Side Panel component
 * Displays guidance, risk assessment, and contextual information
 * about the selected section.
 */
export const CanvasSidePanel = ({ section, onClose }) => {
  const [activeTab, setActiveTab] = useState('guidance');
  const [guidance, setGuidance] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!section) return;
    
    // In a real implementation, these would be API calls
    setLoading(true);
    
    // Simulate API call for guidance
    setTimeout(() => {
      setGuidance({
        title: `Guidance for ${section.title}`,
        content: `This section should describe the key aspects of ${section.title.toLowerCase()} in detail. Include all relevant information according to the ICH guidelines.`,
        examples: [
          'Example 1: Clinical overview showing efficacy across Phase 1-3 trials',
          'Example 2: Summary of safety findings with AE frequency tables'
        ]
      });
      setLoading(false);
    }, 500);
    
    // Simulate API call for risk assessment
    setTimeout(() => {
      setRisk({
        level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        factors: [
          'Completeness of data',
          'Consistency with other sections',
          'Alignment with regulatory expectations'
        ],
        delayImpact: Math.floor(Math.random() * 10) + 1 // 1-10 days
      });
    }, 700);
  }, [section]);

  if (!section) return null;

  return (
    <div className="canvas-side-panel">
      <div className="side-panel-header">
        <h2>Section {section.id}</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      
      <div className="side-panel-tabs">
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
      </div>
      
      <div className="side-panel-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'guidance' ? (
          <div className="guidance-content">
            {guidance && (
              <>
                <h3>{guidance.title}</h3>
                <p>{guidance.content}</p>
                {guidance.examples && guidance.examples.length > 0 && (
                  <div className="examples">
                    <h4>Examples</h4>
                    <ul>
                      {guidance.examples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="risk-content">
            {risk && (
              <>
                <div className="risk-level">
                  <span>Risk Level:</span>
                  <span className={`risk-badge ${risk.level}`}>
                    {risk.level.toUpperCase()}
                  </span>
                </div>
                
                <div className="risk-impact">
                  <span>Potential Delay:</span>
                  <span className="delay-days">{risk.delayImpact} days</span>
                </div>
                
                {risk.factors && risk.factors.length > 0 && (
                  <div className="risk-factors">
                    <h4>Risk Factors</h4>
                    <ul>
                      {risk.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="side-panel-actions">
        <button className="action-button primary">Edit in Document</button>
        <button className="action-button secondary">Get AI Assistance</button>
      </div>
    </div>
  );
};