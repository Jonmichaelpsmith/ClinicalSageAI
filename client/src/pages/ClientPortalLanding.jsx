import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import axios from 'axios';
import { Button } from '@/components/ui/button';

// Import component placeholders (these would be real components in production)
import ProjectManagerGrid from '../components/ProjectManagerGrid';
import NextActionsSidebar from '../components/NextActionsSidebar';
import VaultQuickAccess from '../components/VaultQuickAccess';
import AnalyticsQuickView from '../components/AnalyticsQuickView';

const ClientPortalLanding = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Log that the ClientPortalLanding component has mounted
    console.log('ClientPortalLanding component mounted');
    
    // Use mock data instead of fetching from API
    const mockProjects = [
      { 
        id: 'proj-001', 
        name: 'Enzymax Forte IND', 
        status: 'active', 
        progress: 65, 
        lastUpdated: '2025-04-20',
        modules: ['IND Wizard', 'CMC Wizard'] 
      },
      { 
        id: 'proj-002', 
        name: 'Cardiozen Phase 2 Study', 
        status: 'active', 
        progress: 42, 
        lastUpdated: '2025-04-22',
        modules: ['Study Architect', 'Protocol Designer'] 
      },
      { 
        id: 'proj-003', 
        name: 'Neuroclear Medical Device', 
        status: 'pending', 
        progress: 28, 
        lastUpdated: '2025-04-18',
        modules: ['CER Generator'] 
      }
    ];
    
    // Set mock projects data
    setProjects(mockProjects);
    setLoading(false);
    
    // Update console log for tracking
    console.log('All module access links updated to point to /client-portal');
  }, []);

  // Module cards for the dashboard
  const moduleCards = [
    { id: 'ind', title: 'IND Wizard™', description: 'FDA-compliant INDs with automated form generation', path: '/ind-wizard' },
    { id: 'coauthor', title: 'eCTD Co-Author™', description: 'AI-assisted co-authoring of CTD submission sections', path: '/coauthor' },
    { id: 'cer', title: 'CER Generator™', description: 'The TrialSage CER Generator is a next-generation regulatory automation module designed to eliminate bottlenecks in medical device and combination product submissions. Built for compliance with EU MDR 2017/745, FDA post-market expectations, and ISO 14155 guidance, it fuses real-world adverse event data with literature review automation, GPT-4o reasoning, and structured risk modeling. This module is not a template engine—it is a true clinical intelligence system that analyzes, compares, and generates highly defensible CERs in minutes, not months.', path: '/cerv2' },
    { id: 'cmc', title: 'CMC Wizard™', description: 'Chemistry, Manufacturing, and Controls documentation', path: '/cmc' },
    { id: 'vault', title: 'TrialSage Vault™', description: 'Secure document storage with intelligent retrieval', path: '/vault' },
    { id: 'rih', title: 'Regulatory Intelligence Hub™', description: 'AI-powered strategy, timeline, and risk simulation', path: '/regulatory-intelligence-hub', highlight: true },
    { id: 'risk', title: 'Risk Heatmap™', description: 'Interactive visualization of CTD risk gaps & impacts', path: '/regulatory-risk-dashboard' },
    { id: 'study', title: 'Study Architect™', description: 'Protocol development with regulatory intelligence', path: '/study-architect' },
    { id: 'analytics', title: 'Analytics Dashboard', description: 'Metrics and insights on regulatory performance', path: '/analytics' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-indigo-800 mb-8">TrialSage™ Client Portal</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - 3/4 width on large screens */}
            <div className="lg:col-span-3 space-y-8">
              {/* Project Manager Grid Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Project Manager</h2>
                <ProjectManagerGrid projects={projects} />
              </div>
              
              {/* Quick Insight Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vault Quick Access */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Vault Quick Access</h2>
                  <VaultQuickAccess />
                </div>
                
                {/* Analytics Quick View */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Analytics Snapshot</h2>
                  <AnalyticsQuickView />
                </div>
              </div>
              
              {/* Module Cards */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-indigo-700">TrialSage™ Modules</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleCards.map(module => (
                    <div 
                      key={module.id} 
                      onClick={() => {
                        console.log('Navigating to:', module.path);
                        // Use complete URL with origin
                        const fullUrl = window.location.origin + module.path;
                        console.log('Full URL:', fullUrl);
                        window.location.href = fullUrl;
                      }} 
                      className="block bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 transition duration-200 h-full cursor-pointer"
                    >
                      <h3 className="text-lg font-semibold text-indigo-700">{module.title}</h3>
                      <p className="text-gray-600 mt-2 text-sm">{module.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar - 1/4 width on large screens */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">Next Actions</h2>
                <NextActionsSidebar />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalLanding;