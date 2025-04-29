import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Calendar, FileText, BarChart, Check, AlertCircle, Clock } from 'lucide-react';
import './TimelinePage.css';

/**
 * TimelinePage component - Visual regulatory timeline
 * Shows key milestones and deadlines in the submission process
 */
const TimelinePage = () => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState('planning');
  
  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    // const fetchTimeline = async () => {
    //   try {
    //     const response = await fetch('/api/timeline/milestones');
    //     const data = await response.json();
    //     setTimelineData(data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching timeline data:', error);
    //     setLoading(false);
    //   }
    // };
    // 
    // fetchTimeline();
    
    // For now, use mock data
    const mockTimelineData = [
      {
        id: 1,
        phase: 'planning',
        title: 'Project Initiation',
        date: '2025-03-01',
        status: 'complete',
        details: 'Initial project setup and team onboarding',
        subtasks: [
          { id: 101, title: 'Team onboarding', status: 'complete', date: '2025-03-01' },
          { id: 102, title: 'Initial planning meeting', status: 'complete', date: '2025-03-03' },
          { id: 103, title: 'Document templates setup', status: 'complete', date: '2025-03-05' }
        ]
      },
      {
        id: 2,
        phase: 'planning',
        title: 'Regulatory Assessment',
        date: '2025-03-15',
        status: 'complete',
        details: 'Assessment of regulatory requirements for IND submission',
        subtasks: [
          { id: 201, title: 'FDA guidance review', status: 'complete', date: '2025-03-10' },
          { id: 202, title: 'Regulatory gap analysis', status: 'complete', date: '2025-03-12' },
          { id: 203, title: 'Submission strategy finalization', status: 'complete', date: '2025-03-15' }
        ]
      },
      {
        id: 3,
        phase: 'development',
        title: 'CMC Documentation',
        date: '2025-04-01',
        status: 'complete',
        details: 'Chemistry, Manufacturing, and Controls documentation',
        subtasks: [
          { id: 301, title: 'Drug substance characterization', status: 'complete', date: '2025-03-20' },
          { id: 302, title: 'Manufacturing process documentation', status: 'complete', date: '2025-03-25' },
          { id: 303, title: 'Stability data compilation', status: 'complete', date: '2025-03-30' }
        ]
      },
      {
        id: 4,
        phase: 'development',
        title: 'Nonclinical Documentation',
        date: '2025-04-15',
        status: 'in-progress',
        details: 'Toxicology and pharmacology studies documentation',
        subtasks: [
          { id: 401, title: 'Toxicology studies compilation', status: 'complete', date: '2025-04-05' },
          { id: 402, title: 'Pharmacology data review', status: 'complete', date: '2025-04-10' },
          { id: 403, title: 'Safety assessment finalization', status: 'in-progress', date: '2025-04-15' }
        ]
      },
      {
        id: 5,
        phase: 'development',
        title: 'Clinical Protocol',
        date: '2025-04-30',
        status: 'at-risk',
        details: 'Phase 1 clinical trial protocol development',
        subtasks: [
          { id: 501, title: 'Protocol outline development', status: 'complete', date: '2025-04-15' },
          { id: 502, title: 'Study design finalization', status: 'in-progress', date: '2025-04-20' },
          { id: 503, title: 'Statistical analysis plan', status: 'at-risk', date: '2025-04-25' }
        ]
      },
      {
        id: 6,
        phase: 'review',
        title: 'Internal QC Review',
        date: '2025-05-15',
        status: 'pending',
        details: 'Quality control review of all IND components',
        subtasks: [
          { id: 601, title: 'CMC documentation review', status: 'pending', date: '2025-05-05' },
          { id: 602, title: 'Nonclinical data review', status: 'pending', date: '2025-05-10' },
          { id: 603, title: 'Clinical protocol review', status: 'pending', date: '2025-05-15' }
        ]
      },
      {
        id: 7,
        phase: 'review',
        title: 'Regulatory Review',
        date: '2025-05-30',
        status: 'pending',
        details: 'Regulatory affairs review and finalization',
        subtasks: [
          { id: 701, title: 'Regulatory consistency check', status: 'pending', date: '2025-05-20' },
          { id: 702, title: 'Cross-reference verification', status: 'pending', date: '2025-05-25' },
          { id: 703, title: 'Final regulatory assessment', status: 'pending', date: '2025-05-30' }
        ]
      },
      {
        id: 8,
        phase: 'submission',
        title: 'Finalize and Assemble IND',
        date: '2025-06-10',
        status: 'pending',
        details: 'Final assembly of all IND components',
        subtasks: [
          { id: 801, title: 'Document formatting finalization', status: 'pending', date: '2025-06-01' },
          { id: 802, title: 'eCTD assembly', status: 'pending', date: '2025-06-05' },
          { id: 803, title: 'Final submission package check', status: 'pending', date: '2025-06-10' }
        ]
      },
      {
        id: 9,
        phase: 'submission',
        title: 'Submit to FDA',
        date: '2025-06-15',
        status: 'pending',
        details: 'Electronic submission to FDA',
        subtasks: [
          { id: 901, title: 'Electronic submission preparation', status: 'pending', date: '2025-06-12' },
          { id: 902, title: 'FDA submission', status: 'pending', date: '2025-06-15' },
          { id: 903, title: 'Submission confirmation receipt', status: 'pending', date: '2025-06-15' }
        ]
      },
      {
        id: 10,
        phase: 'post-submission',
        title: 'FDA Review Period',
        date: '2025-07-15',
        status: 'pending',
        details: '30-day FDA review period',
        subtasks: [
          { id: 1001, title: 'Monitor FDA feedback', status: 'pending', date: '2025-06-30' },
          { id: 1002, title: 'Prepare for FDA questions', status: 'pending', date: '2025-07-10' },
          { id: 1003, title: 'Review completion', status: 'pending', date: '2025-07-15' }
        ]
      }
    ];
    
    setTimelineData(mockTimelineData);
    setLoading(false);
  }, []);
  
  // Filter timeline items based on active phase
  const filteredTimeline = activePhase === 'all' 
    ? timelineData 
    : timelineData.filter(item => item.phase === activePhase);
  
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <Check size={16} className="status-icon complete" />;
      case 'in-progress':
        return <Clock size={16} className="status-icon in-progress" />;
      case 'at-risk':
        return <AlertCircle size={16} className="status-icon at-risk" />;
      case 'pending':
      default:
        return <Clock size={16} className="status-icon pending" />;
    }
  };
  
  // Get phase names and counts
  const phases = [
    { id: 'all', name: 'All Phases', count: timelineData.length },
    { 
      id: 'planning', 
      name: 'Planning', 
      count: timelineData.filter(item => item.phase === 'planning').length 
    },
    { 
      id: 'development', 
      name: 'Development', 
      count: timelineData.filter(item => item.phase === 'development').length 
    },
    { 
      id: 'review', 
      name: 'Review', 
      count: timelineData.filter(item => item.phase === 'review').length 
    },
    { 
      id: 'submission', 
      name: 'Submission', 
      count: timelineData.filter(item => item.phase === 'submission').length 
    },
    { 
      id: 'post-submission', 
      name: 'Post-Submission', 
      count: timelineData.filter(item => item.phase === 'post-submission').length 
    }
  ];
  
  return (
    <div className="timeline-page">
      <div className="canvas-header">
        <h1>Submission Timeline</h1>
        <div className="canvas-tabs">
          <Link href="/canvas" className="canvas-tab">
            <FileText size={16} />
            <span>Section Canvas</span>
          </Link>
          <Link href="/timeline" className="canvas-tab active">
            <Calendar size={16} />
            <span>Timeline</span>
          </Link>
          <Link href="/analysis" className="canvas-tab">
            <BarChart size={16} />
            <span>Analysis</span>
          </Link>
        </div>
        <div className="canvas-meta">
          <span className="submission-type">IND Initial</span>
          <span className="submission-id">ID: TSG-IND-2025-0042</span>
        </div>
      </div>
      
      <div className="timeline-main">
        <div className="timeline-phases">
          {phases.map(phase => (
            <button
              key={phase.id}
              className={`phase-button ${activePhase === phase.id ? 'active' : ''}`}
              onClick={() => setActivePhase(phase.id)}
            >
              {phase.name}
              <span className="phase-count">{phase.count}</span>
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="timeline-loading">Loading timeline data...</div>
        ) : (
          <div className="timeline-content">
            {filteredTimeline.length > 0 ? (
              <div className="timeline-list">
                {filteredTimeline.map(item => (
                  <div key={item.id} className={`timeline-item ${item.status}`}>
                    <div className="timeline-marker">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="timeline-card">
                      <div className="timeline-header">
                        <h3>{item.title}</h3>
                        <span className="timeline-date">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="timeline-details">{item.details}</p>
                      
                      {item.subtasks && item.subtasks.length > 0 && (
                        <div className="timeline-subtasks">
                          <h4>Subtasks</h4>
                          <ul>
                            {item.subtasks.map(subtask => (
                              <li key={subtask.id} className={`subtask ${subtask.status}`}>
                                {getStatusIcon(subtask.status)}
                                <span>{subtask.title}</span>
                                <span className="subtask-date">
                                  {new Date(subtask.date).toLocaleDateString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="timeline-empty">
                No milestones found for the selected phase.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;