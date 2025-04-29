import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import './TimelinePage.css';

/**
 * TimelinePage - Timeline visualization and regulatory planning tool
 * This page provides an interactive timeline for regulatory submissions
 */
export default function TimelinePage() {
  const [submissionType, setSubmissionType] = useState('ind');
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulated milestones data
  useEffect(() => {
    // In a real implementation, this would be an API call
    setTimeout(() => {
      const milestones = [
        { id: 1, title: 'Project Kickoff', date: '2025-01-15', completed: true },
        { id: 2, title: 'Protocol Development', date: '2025-02-10', completed: true },
        { id: 3, title: 'IND Preparation', date: '2025-03-20', completed: true },
        { id: 4, title: 'CMC Documentation', date: '2025-04-15', completed: false },
        { id: 5, title: 'Nonclinical Review', date: '2025-05-05', completed: false },
        { id: 6, title: 'IND Submission', date: '2025-06-10', completed: false },
        { id: 7, title: 'FDA Feedback', date: '2025-07-10', completed: false },
        { id: 8, title: 'Trial Start', date: '2025-08-01', completed: false },
      ];
      
      setTimelineData(milestones);
      setLoading(false);
    }, 800);
  }, []);
  
  // Handle submission type change
  const handleTypeChange = (type) => {
    setSubmissionType(type);
    setLoading(true);
    
    // In a real implementation, this would fetch new data based on the type
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  return (
    <div className="timeline-page">
      {/* Header with navigation */}
      <div className="timeline-header">
        <h1>Regulatory Timeline</h1>
        
        <div className="submission-types">
          <button 
            className={`type-button ${submissionType === 'ind' ? 'active' : ''}`}
            onClick={() => handleTypeChange('ind')}
          >
            IND
          </button>
          <button 
            className={`type-button ${submissionType === 'nda' ? 'active' : ''}`}
            onClick={() => handleTypeChange('nda')}
          >
            NDA
          </button>
          <button 
            className={`type-button ${submissionType === 'bla' ? 'active' : ''}`}
            onClick={() => handleTypeChange('bla')}
          >
            BLA
          </button>
          <button 
            className={`type-button ${submissionType === 'maa' ? 'active' : ''}`}
            onClick={() => handleTypeChange('maa')}
          >
            MAA
          </button>
        </div>
        
        <div className="timeline-actions">
          <Link to="/canvas" className="nav-link">
            Canvas View
          </Link>
          <Link to="/module-dashboard" className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Timeline content */}
      <div className="timeline-content">
        {loading ? (
          <div className="loading-indicator">Loading timeline data...</div>
        ) : (
          <>
            <div className="timeline-container">
              <div className="timeline-line"></div>
              
              {timelineData.map((milestone, index) => (
                <div 
                  key={milestone.id} 
                  className={`timeline-milestone ${milestone.completed ? 'completed' : ''}`}
                  style={{ 
                    left: `${10 + (index * (100 / (timelineData.length - 1)))}%`,
                  }}
                >
                  <div className="milestone-dot"></div>
                  <div className="milestone-label">
                    <div className="milestone-title">{milestone.title}</div>
                    <div className="milestone-date">{milestone.date}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="timeline-details">
              <h2>Submission Timeline: {submissionType.toUpperCase()}</h2>
              
              <div className="timeline-stats">
                <div className="stat-card">
                  <div className="stat-value">42%</div>
                  <div className="stat-label">Timeline Progress</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">
                    {submissionType === 'ind' ? 'June 10, 2025' : 
                     submissionType === 'nda' ? 'November 15, 2025' :
                     submissionType === 'bla' ? 'December 20, 2025' : 'January 10, 2026'}
                  </div>
                  <div className="stat-label">Target Date</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">3 of 8</div>
                  <div className="stat-label">Milestones Completed</div>
                </div>
              </div>
              
              <div className="timeline-activities">
                <h3>Recent Activities</h3>
                
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-date">April 25, 2025</div>
                    <div className="activity-description">Updated IND Module 3 CMC documentation</div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-date">April 22, 2025</div>
                    <div className="activity-description">Completed toxicology report review</div>
                  </div>
                  
                  <div className="activity-item">
                    <div className="activity-date">April 20, 2025</div>
                    <div className="activity-description">Added clinical protocol to Module 5</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}