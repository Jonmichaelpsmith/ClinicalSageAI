import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import axios from 'axios';

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
    
    // Fetch project data from API
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Try all possible endpoints to find our API
        const response = await axios.get('/api/projects/status').catch(async err => {
          console.log('Trying port 3000...');
          return await axios.get('http://localhost:3000/api/projects/status').catch(async err => {
            console.log('Trying port 5000...');
            return await axios.get('http://localhost:5000/api/projects/status');
          });
        });
        if (response.data && response.data.success && response.data.projects) {
          console.log('Received projects data:', response.data);
          setProjects(response.data.projects);
        } else {
          console.error('Invalid project data format:', response.data);
          setError('Invalid project data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load project data');
        setLoading(false);
      }
    };

    fetchProjects();
    
    // Update console log for tracking
    console.log('All module access links updated to point to /client-portal');
  }, []);

  // Module cards for the dashboard
  const moduleCards = [
    { id: 'ind', title: 'IND Wizard™', description: 'FDA-compliant INDs with automated form generation', path: '/client-portal/ind-wizard' },
    { id: 'cer', title: 'CER Generator™', description: 'EU MDR 2017/745 Clinical Evaluation Reports', path: '/client-portal/cer-generator' },
    { id: 'cmc', title: 'CMC Wizard™', description: 'Chemistry, Manufacturing, and Controls documentation', path: '/client-portal/cmc-wizard' },
    { id: 'csr', title: 'CSR Analyzer™', description: 'AI-powered Clinical Study Report analysis', path: '/client-portal/csr-analyzer' },
    { id: 'vault', title: 'TrialSage Vault™', description: 'Secure document storage with intelligent retrieval', path: '/client-portal/vault' },
    { id: 'study', title: 'Study Architect™', description: 'Protocol development with regulatory intelligence', path: '/client-portal/study-architect' },
    { id: 'analytics', title: 'Analytics Dashboard', description: 'Metrics and insights on regulatory performance', path: '/client-portal/analytics' }
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
                <h2 className="text-2xl font-semibold text-indigo-700 mb-4">TrialSage™ Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleCards.map(module => (
                    <Link key={module.id} href={module.path}>
                      <a className="block bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 transition duration-200 h-full">
                        <h3 className="text-lg font-semibold text-indigo-700">{module.title}</h3>
                        <p className="text-gray-600 mt-2 text-sm">{module.description}</p>
                      </a>
                    </Link>
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