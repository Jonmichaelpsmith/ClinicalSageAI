import React from 'react';
import UnifiedTopNavV5 from '../components/navigation/UnifiedTopNavV5';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import ModuleCard from '../components/dashboard/ModuleCard';
import './ModuleDashboard.css';

export default function ModuleDashboard() {
  // Hard-coded for demo; replace with fetch from /api/modules
  const modules = [
    { id: '1', title: 'Module 1: Administrative',       to:'/coauthor?module=1', progress: 100, risk:'low'  },
    { id: '2', title: 'Module 2: CTD Summaries',        to:'/coauthor?module=2', progress:  75, risk:'med' },
    { id: '3', title: 'Module 3: Quality',              to:'/coauthor?module=3', progress:  50, risk:'high'},
    { id: '4', title: 'Module 4: Nonclinical',          to:'/coauthor?module=4', progress:  20, risk:'high'},
    { id: '5', title: 'Module 5: Clinical Study Reports',to:'/coauthor?module=5',progress:  0,  risk:'high'},
  ];

  return (
    <div className="dashboard-page">
      <UnifiedTopNavV5
        tabs={[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/coauthor',  label: 'Co-Author'  },
          { path: '/coauthor/canvas',    label: 'Canvas'    },
          { path: '/coauthor/timeline',  label: 'Timeline'  },
        ]}
      />

      <Breadcrumbs items={[
        { label:'TrialSage™',        to:'/'        },
        { label:'eCTD Co-Author™',   to:'/coauthor'},
        { label:'Dashboard' }
      ]}/>

      <h1 className="dashboard-title">CTD Module Dashboard</h1>

      <div className="dashboard-grid">
        {modules.map(mod => (
          <ModuleCard
            key={mod.id}
            title={mod.title}
            to={mod.to}
            progress={mod.progress}
            risk={mod.risk}
          />
        ))}
      </div>
    </div>
  );
}