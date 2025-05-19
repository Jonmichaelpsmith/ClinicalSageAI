import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cleanupModals } from '../lib/modalHelpers';

const CERV2ModulePage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Cleanup any lingering modal elements when navigating away
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  // Additional useEffect to handle tab changes
  useEffect(() => {
    // This will ensure modals are cleaned up on tab changes as well
    cleanupModals();
    console.log("Cleaning up modals on tab change to:", activeTab);
  }, [activeTab]);

  return (
    <div className="cerv2-module">
      {/* Header with TrialSage logo and navigation */}
      <header className="module-header">
        <div className="header-left">
          <img src="/trialsage-logo.svg" alt="TrialSage" className="logo" />
          <span className="module-title">eCTD Co-Author Module</span>
        </div>
        <div className="header-right">
          <button className="btn btn-sm">Hide Navigation</button>
          <button className="btn btn-sm">Team Collaboration</button>
          <button className="btn btn-sm">AI Assistant</button>
        </div>
      </header>

      <div className="module-content">
        <div className="document-structure-sidebar">
          <h3 className="sidebar-title">Document Structure</h3>
          <ul className="document-tree">
            <li className="module-section">
              <span className="section-label">Module 1: Administrative Information</span>
              <ul className="section-items">
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 1.1: Cover Letter</span>
                </li>
                <li className="section-item active">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 1.2: Table of Contents</span>
                  <span className="item-status">Current</span>
                </li>
              </ul>
            </li>
            <li className="module-section">
              <span className="section-label">Module 2: Common Technical Document</span>
              <ul className="section-items">
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 2.1: CTD Table of Contents</span>
                </li>
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 2.2: Introduction</span>
                </li>
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 2.3: Quality Overall Summary</span>
                </li>
                <li className="section-item in-review">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 2.5: Clinical Overview</span>
                  <span className="item-status">In Review</span>
                </li>
              </ul>
            </li>
            <li className="module-section">
              <span className="section-label">Module 3: Quality</span>
              <ul className="section-items">
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 3.2.P: Drug Product</span>
                </li>
                <li className="section-item">
                  <span className="item-icon">📄</span>
                  <span className="item-label">Section 3.2.S: Drug Substance</span>
                </li>
              </ul>
            </li>
            <li className="module-section">
              <span className="section-label">Module 4: Nonclinical Study Reports</span>
            </li>
            <li className="module-section">
              <span className="section-label">Module 5: Clinical Study Reports</span>
            </li>
          </ul>

          <div className="document-health">
            <h3 className="health-title">Document Health</h3>
            <div className="health-metric">
              <span className="metric-label">Completeness</span>
              <div className="progress-bar">
                <div className="progress" style={{width: "72%"}}></div>
              </div>
              <span className="metric-value">72%</span>
            </div>
            <div className="health-metric">
              <span className="metric-label">Consistency</span>
              <div className="progress-bar">
                <div className="progress" style={{width: "86%"}}></div>
              </div>
              <span className="metric-value">86%</span>
            </div>
          </div>
        </div>

        <div className="main-content-area">
          <div className="content-section">
            <div className="section-box">
              <div className="box-header">
                <h3 className="box-title">AI-Powered Document Editor</h3>
                <span className="enterprise-tag">Enterprise</span>
              </div>
              <div className="box-content">
                <p className="box-description">Create and edit regulatory documents with intelligent assistance</p>
                <div className="actions">
                  <button className="btn btn-primary">Edit in Rich Text</button>
                  <button className="btn btn-secondary">Save as Word Doc</button>
                  <button className="btn btn-secondary">Import</button>
                </div>
              </div>
            </div>

            <div className="section-box">
              <div className="box-header">
                <h3 className="box-title">Recent Documents</h3>
              </div>
              <div className="box-content">
                <ul className="document-list">
                  <li className="document-item">
                    <span className="document-icon">📄</span>
                    <div className="document-info">
                      <span className="document-title">Module 2.5 Clinical Overview</span>
                      <span className="document-meta">Module 2 • Last edited 2 hours ago</span>
                    </div>
                    <span className="document-status in-progress">In Progress</span>
                  </li>
                  <li className="document-item">
                    <span className="document-icon">📄</span>
                    <div className="document-info">
                      <span className="document-title">CMC Section 3.2.P</span>
                      <span className="document-meta">Module 3 • Last edited 1 day ago</span>
                    </div>
                    <span className="document-status draft">Draft</span>
                  </li>
                  <li className="document-item">
                    <span className="document-icon">📄</span>
                    <div className="document-info">
                      <span className="document-title">Clinical Overview</span>
                      <span className="document-meta">Module 2 • Last edited 3 days ago</span>
                    </div>
                    <span className="document-status final">Final</span>
                  </li>
                </ul>
                <a href="#" className="view-all-link">View All Documents</a>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-box">
              <div className="box-header">
                <h3 className="box-title">Document Templates</h3>
                <span className="enterprise-tag">Enterprise</span>
              </div>
              <div className="box-content">
                <p className="box-description">Start with pre-approved templates for regulatory documents</p>
                <div className="actions">
                  <button className="btn btn-primary">Create from Template</button>
                  <button className="btn btn-secondary">Upload Template</button>
                </div>
                
                <h4 className="subsection-title">Featured Templates</h4>
                <ul className="template-list">
                  <li className="template-item">
                    <span className="template-icon">📄</span>
                    <div className="template-info">
                      <span className="template-title">Clinical Overview Template</span>
                      <span className="template-meta">Module 2 • Updated 2 months ago</span>
                      <div className="template-tags">
                        <span className="tag">US FDA</span>
                        <span className="tag">EU EMA</span>
                      </div>
                    </div>
                    <span className="template-status validated">✓ Validated</span>
                  </li>
                  <li className="template-item">
                    <span className="template-icon">📄</span>
                    <div className="template-info">
                      <span className="template-title">CTD Module 3 Quality Template</span>
                      <span className="template-meta">Module 3 • Updated 1 month ago</span>
                      <div className="template-tags">
                        <span className="tag">US FDA</span>
                        <span className="tag">EU EMA</span>
                      </div>
                    </div>
                    <span className="template-status validated">✓ Validated</span>
                  </li>
                  <li className="template-item">
                    <span className="template-icon">📄</span>
                    <div className="template-info">
                      <span className="template-title">NDA Cover Letter Template</span>
                      <span className="template-meta">Module 1 • Updated 3 weeks ago</span>
                      <div className="template-tags">
                        <span className="tag">US FDA</span>
                        <span className="tag">EU EMA</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-box">
              <div className="box-header">
                <h3 className="box-title">Validation Dashboard</h3>
                <span className="enterprise-tag">Enterprise</span>
              </div>
              <div className="box-content">
                <p className="box-description">Ensure compliance with regulatory requirements</p>
                
                <h4 className="subsection-title">Module 2.5 Clinical Overview</h4>
                <div className="validation-metrics">
                  <div className="metric">
                    <span className="metric-label">Content Completeness</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: "78%"}}></div>
                    </div>
                    <span className="metric-value">78%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Regulatory Compliance</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: "92%"}}></div>
                    </div>
                    <span className="metric-value">92%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Reference Validation</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: "65%"}}></div>
                    </div>
                    <span className="metric-value">65%</span>
                  </div>
                </div>
                
                <div className="validation-issues">
                  <div className="issue">
                    <span className="issue-icon">⚠️</span>
                    <span className="issue-message">4 validation issues require attention</span>
                  </div>
                  <p className="issue-detail">Missing source citations in section 2.5.4 and incomplete benefit-risk assessment.</p>
                </div>
                
                <button className="btn btn-primary">Open Validation Report</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="module-footer">
        <div className="document-stats">
          <span className="stat">Overall: <strong>68% complete</strong></span>
        </div>
        <button className="btn btn-primary">Export Document</button>
      </div>

      {/* Status indicator */}
      <div className="status-indicator">
        <span className="online-status">✅ Online</span>
      </div>
    </div>
  );
};

export default CERV2ModulePage;