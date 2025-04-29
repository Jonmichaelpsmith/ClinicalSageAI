import React, { useState, useEffect } from 'react';
import { fetchSectionGuidance, fetchSectionRisk } from '../../api/coauthor';
import './NodeDetailPanel.css';

export default function NodeDetailPanel({ sectionId, onClose }) {
  const [guidance, setGuidance] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('guidance');

  useEffect(() => {
    if (!sectionId) {
      // Reset data when panel closes
      setGuidance(null);
      setRisk(null);
      return;
    }

    setLoading(true);
    
    // Load guidance data
    fetchSectionGuidance(sectionId)
      .then(data => setGuidance(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    
    // Load risk data  
    fetchSectionRisk(sectionId)
      .then(data => setRisk(data))
      .catch(console.error);
  }, [sectionId]);

  if (!sectionId) return null;

  return (
    <div className="node-detail-panel">
      <div className="ndp-header">
        <h2>Section {sectionId}</h2>
        <button className="ndp-close-btn" onClick={onClose}>&times;</button>
      </div>
      
      <div className="ndp-tabs">
        <button 
          className={`ndp-tab ${activeTab === 'guidance' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidance')}
        >
          Guidance
        </button>
        <button 
          className={`ndp-tab ${activeTab === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk
        </button>
      </div>
      
      <div className="ndp-content">
        {loading ? (
          <div className="ndp-loading">Loading...</div>
        ) : activeTab === 'guidance' ? (
          <div className="ndp-guidance">
            {guidance ? (
              <>
                <h3>{guidance.title}</h3>
                <p>{guidance.content}</p>
                {guidance.examples && guidance.examples.length > 0 && (
                  <div className="ndp-examples">
                    <h4>Examples</h4>
                    <ul>
                      {guidance.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p>No guidance available for this section.</p>
            )}
          </div>
        ) : (
          <div className="ndp-risk">
            {risk ? (
              <>
                <div className="ndp-risk-level">
                  <span>Risk Level:</span>
                  <span className={`risk-badge risk-${risk.level}`}>
                    {risk.level.toUpperCase()}
                  </span>
                </div>
                
                <div className="ndp-risk-impact">
                  <span>Delay Impact:</span>
                  <span className="risk-impact">{risk.delayImpact} days</span>
                </div>
                
                {risk.factors && risk.factors.length > 0 && (
                  <div className="ndp-risk-factors">
                    <h4>Risk Factors</h4>
                    <ul>
                      {risk.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p>No risk assessment available for this section.</p>
            )}
          </div>
        )}
      </div>
      
      <div className="ndp-actions">
        <button 
          className="ndp-action-btn"
          onClick={() => alert('Opening section in editor...')}
        >
          Edit Section
        </button>
        <button
          className="ndp-action-btn secondary"
          onClick={() => alert('AI suggesting next section to work on...')}
        >
          Suggest Next Section
        </button>
      </div>
    </div>
  );
}