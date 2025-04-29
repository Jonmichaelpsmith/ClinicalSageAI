import React from 'react';
import UnifiedTopNavV5 from '../components/navigation/UnifiedTopNavV5';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import TimelineSimulator from '../components/timeline/TimelineSimulator';
import './TimelinePage.css';

export default function TimelinePage() {
  return (
    <div className="timeline-page">
      <UnifiedTopNavV5
        tabs={[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/coauthor',  label: 'Co-Author' },
          { path: '/canvas',    label: 'Canvas' },
          { path: '/timeline',  label: 'Timeline' },
        ]}
      />

      <Breadcrumbs items={[
        { label: 'TrialSage™', to: '/dashboard' },
        { label: 'Timeline Simulator' }
      ]}/>

      <main className="timeline-main">
        <TimelineSimulator />
      </main>
    </div>
  );
}