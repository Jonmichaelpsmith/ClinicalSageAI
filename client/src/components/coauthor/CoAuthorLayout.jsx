import React from 'react';
import UnifiedTopNavV3 from '../navigation/UnifiedTopNavV3';
import Breadcrumbs from '../navigation/Breadcrumbs';

export default function CoAuthorLayout({ children, copilot }) {
  return (
    <div className="coauthor-page">
      {/* 1) Sticky top nav */}
      <UnifiedTopNavV3
        backPath="/client-portal"
        clientPortalLabel="Client Portal"
        switchModulePath="/switch-module"
        breadcrumbs={["TrialSage™", "eCTD Co-Author™", "Module 2"]}
      />

      {/* 2) Single breadcrumb row */}
      <Breadcrumbs
        items={[
          { label: 'TrialSage™', to: '/' },
          { label: 'eCTD Co-Author™', to: '/coauthor' },
          { label: 'Module 2', to: '/coauthor?module=2' },
          { label: 'Section 2.7', to: '' }
        ]}
      />

      {/* 3) Two-pane container */}
      <div className="coauthor-content">
        <div className="editor-pane">
          {children}
        </div>
        <div className="copilot-pane">
          {copilot}
        </div>
      </div>

      {/* 4) Footer status */}
      <footer className="coauthor-footer">
        Auto-save active — last saved: {new Date().toLocaleTimeString()}
      </footer>
    </div>
  );
}