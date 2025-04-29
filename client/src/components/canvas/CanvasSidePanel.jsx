import React, { useState } from 'react';
import './CanvasSidePanel.css';

export function CanvasSidePanel({ section, guidance, snippets = [], onClose, onChatOpen }) {
  const tabs = ["Guidance", "Snippets", "Chat"];
  const [active, setActive] = useState(tabs[0]);

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Display risk level based on status
  const getRiskLevel = (status) => {
    if (status === 'critical') return 'High';
    if (status === 'pending') return 'Medium';
    return 'Low';
  };

  // Calculate delay impact (days) based on status
  const getDelayImpact = (status) => {
    if (status === 'critical') return 45;
    if (status === 'pending') return 14;
    return 0;
  };

  return (
    <div className="canvas-panel">
      <div className="panel-header">
        <h3>{section ? `Section ${section.id}` : 'Select a Section'}</h3>
        <button className="close-button" onClick={onClose} aria-label="Close">✕</button>
      </div>
      
      {section && (
        <>
          <div className="panel-tabs">
            {tabs.map(t => (
              <button
                key={t}
                className={`tab-button ${active === t ? "active" : ""}`}
                onClick={() => setActive(t)}
              >{t}</button>
            ))}
          </div>
          <div className="panel-content">
            {active === "Guidance" && (
              <div className="guidance">
                <div className="section-meta">
                  <p><strong>Status:</strong> {formatStatus(section.status)}</p>
                  <p><strong>Risk Level:</strong> {getRiskLevel(section.status)}</p>
                  <p><strong>Delay Impact:</strong> {getDelayImpact(section.status)} days</p>
                </div>
                <hr />
                <h4>AI Guidance</h4>
                {guidance ? (
                  <p>{guidance}</p>
                ) : (
                  <p>Loading suggestions...</p>
                )}
              </div>
            )}
            {active === "Snippets" && (
              <ul className="snippets">
                {snippets.length > 0 ? (
                  snippets.map(s => <li key={s.id}>{s.text}</li>)
                ) : (
                  <li>No reference snippets available for this section.</li>
                )}
              </ul>
            )}
            {active === "Chat" && (
              <div className="chat-option">
                <button className="open-chat" onClick={onChatOpen}>
                  Open Ask Lumen AI
                </button>
                <p className="chat-description">
                  Get interactive help with writing and structuring this section
                </p>
              </div>
            )}
          </div>
        </>
      )}
      
      {!section && (
        <div className="panel-empty">
          <p>Click on a document section to view details and get AI guidance</p>
        </div>
      )}
    </div>
  );
}