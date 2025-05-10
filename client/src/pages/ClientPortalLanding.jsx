import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useTenant } from '../contexts/TenantContext';
import { OrganizationSwitcher } from '../components/tenant/OrganizationSwitcher';
import { ClientWorkspaceSwitcher } from '../components/tenant/ClientWorkspaceSwitcher';
import { Building, Users, Settings, Info } from 'lucide-react';

// Import component placeholders
import ProjectManagerGrid from '../components/ProjectManagerGrid';
import VaultQuickAccess from '../components/VaultQuickAccess';
import AnalyticsQuickView from '../components/AnalyticsQuickView';

// Fallback loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4 h-full min-h-[100px]">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ClientPortalLanding = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();
  
  // Get tenant context with proper default handling
  const tenantContext = useTenant();
  const { 
    currentOrganization, 
    currentClientWorkspace, 
    currentModule,
    setCurrentModule 
  } = tenantContext || {}; // Provide empty object as fallback

  // Define projects data outside of useEffect for better performance
  const staticProjects = [
    { 
      id: 'proj-001', 
      name: 'Enzymax Forte IND', 
      status: 'active', 
      progress: 65, 
      lastUpdated: '2025-04-20',
      modules: ['IND Wizard', 'CMC Wizard', 'Regulatory Submissions Hub'] 
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
    },
    { 
      id: 'proj-004', 
      name: 'Respironix eCTD Submission', 
      status: 'active', 
      progress: 75, 
      lastUpdated: '2025-05-05',
      modules: ['Regulatory Submissions Hub', 'Vault'] 
    }
  ];
  
  useEffect(() => {
    // Use a small timeout to stagger the rendering and reduce UI freeze
    const timer = setTimeout(() => {
      console.log('Setting projects data with optimized performance');
      setProjects(staticProjects);
      setLoading(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Module cards for the dashboard - Exactly matching the screenshot
  const moduleCards = [
    { id: 'ind', title: 'IND Wizard™', description: 'FDA-compliant INDs with automated form generation', path: '/ind-wizard', highlight: false },
    { id: 'ectd', title: 'eCTD Module Builder™', description: 'Integrated common technical document module builder', path: '/ectd-planner', highlight: false },
    { id: 'regulatory-submissions', title: 'Regulatory Submissions Hub™', description: 'Unified platform for managing eCTD and IND submissions with comprehensive document management', path: '/regulatory-submissions', highlight: true },
    { id: 'cer', title: 'CER Generator™', description: 'Next-generation regulatory automation for medical device and combination product submissions', path: '/cerv2', highlight: false },
    { id: 'cmc', title: 'CMC Wizard™', description: 'Chemistry, Manufacturing, and Controls documentation', path: '/cmc', highlight: false },
    { id: 'vault', title: 'TrialSage Vault™', description: 'Secure document storage with intelligent retrieval', path: '/vault', highlight: false },
    { id: 'rih', title: 'Regulatory Intelligence Hub™', description: 'AI-powered strategy, timeline, and risk simulation', path: '/regulatory-intelligence-hub', highlight: true },
    { id: 'risk', title: 'Risk Heatmap™', description: 'Interactive visualization of CTD risk gaps & impacts', path: '/risk-heatmap', highlight: false },
    { id: 'study', title: 'Study Architect™', description: 'Protocol development with regulatory intelligence', path: '/study-architect', highlight: false },
    { id: 'coauthor', title: 'eCTD Co-Author™', description: 'AI-assisted co-authoring of CTD submission sections', path: '/ectd-coauthor', highlight: false },
    { id: 'analytics', title: 'Analytics Dashboard', description: 'Metrics and insights on regulatory performance', path: '/analytics', highlight: false }
  ];

  // Simplified module selection handler to reduce UI freezes
  const handleModuleSelect = (moduleId) => {
    // Find the module object from the module cards
    const selectedModule = moduleCards.find(m => m.id === moduleId);
    
    // Just navigate to the module path if found, skip the context setting to improve performance
    if (selectedModule) {
      setLocation(selectedModule.path);
    }
  };
  
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
          {/* Tenant Information Header */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-indigo-800">TrialSage™ Client Portal</h1>
                <p className="text-gray-600 mt-1">Manage regulatory documents and projects across the enterprise</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="text-xs text-gray-500">Organization</div>
                    <OrganizationSwitcher />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="text-xs text-gray-500">Client Workspace</div>
                    <ClientWorkspaceSwitcher />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLocation('/client-portal/client-management')}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-all duration-150"
                  >
                    <Users className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="text-xs text-gray-500">Manage</div>
                      <div className="text-sm font-medium">Clients</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => setLocation('/tenant-management')}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-all duration-150"
                  >
                    <Settings className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="text-xs text-gray-500">Manage</div>
                      <div className="text-sm font-medium">Settings</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Current Context Info */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="text-xs text-gray-500">Current Organization</div>
                  <div className="text-sm font-medium">{currentOrganization?.name || 'None Selected'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Current Client</div>
                  <div className="text-sm font-medium">{currentClientWorkspace?.name || 'None Selected'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Subscription Tier</div>
                  <div className="text-sm font-medium">{currentOrganization?.subscriptionTier || 'Standard'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Storage Usage</div>
                  <div className="text-sm font-medium">
                    {currentClientWorkspace?.storageUsedGB || '0'} GB / {currentClientWorkspace?.quotaStorageGB || '5'} GB
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Projects</div>
                  <div className="text-sm font-medium">
                    {currentClientWorkspace?.activeProjects || '3'} / {currentClientWorkspace?.quotaProjects || '10'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - 3/4 width on large screens */}
            <div className="lg:col-span-3 space-y-8">
              {/* Project Manager Grid Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-indigo-700">Project Manager</h2>
                  
                  {currentClientWorkspace && (
                    <div className="flex items-center gap-2 text-sm text-indigo-700">
                      <span className="text-gray-500">Client:</span>
                      <span className="font-medium">{currentClientWorkspace.name}</span>
                    </div>
                  )}
                </div>
                <Suspense fallback={<LoadingFallback />}>
                  <ProjectManagerGrid projects={projects} />
                </Suspense>
              </div>
              
              {/* Quick Insight Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vault Quick Access */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Vault Quick Access</h2>
                  <Suspense fallback={<LoadingFallback />}>
                    <VaultQuickAccess />
                  </Suspense>
                </div>
                
                {/* Analytics Quick View */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Analytics Snapshot</h2>
                  <Suspense fallback={<LoadingFallback />}>
                    <AnalyticsQuickView />
                  </Suspense>
                </div>
              </div>
              
              {/* Module Cards - Using a fixed set of official modules only */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-indigo-700">TrialSage™ Modules</h2>
                  
                  {currentOrganization && (
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4 text-indigo-500" />
                      <span className="text-gray-600">Showing modules available in your {currentOrganization?.subscriptionTier || 'Standard'} subscription</span>
                    </div>
                  )}
                </div>
                
                {/* Official modules - using a memoized render */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleCards.map(module => {
                    // Precompute the class string to avoid recalculations
                    const cardClass = `block ${
                      module.highlight ? 'bg-indigo-100 border border-indigo-200' : 'bg-indigo-50'
                    } hover:bg-indigo-100 rounded-lg p-4 transition duration-200 h-full cursor-pointer relative`;
                    
                    return (
                      <div 
                        key={module.id} 
                        onClick={() => handleModuleSelect(module.id)} 
                        className={cardClass}
                      >
                        {module.isNew && (
                          <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-indigo-700">{module.title}</h3>
                        <p className="text-gray-600 mt-2 text-sm">{module.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Sidebar - 1/4 width on large screens */}
            <div className="lg:col-span-1 space-y-6">
              {/* Organization & Client Info Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">Tenant Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-medium">Organization</h3>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 pl-6">
                      {currentOrganization ? (
                        <>
                          <p><span className="text-gray-500">Name:</span> {currentOrganization.name}</p>
                          <p><span className="text-gray-500">Tier:</span> {currentOrganization.subscriptionTier}</p>
                          <p><span className="text-gray-500">Max Users:</span> {currentOrganization.maxUsers}</p>
                        </>
                      ) : (
                        <p>No organization selected</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      <h3 className="font-medium">Client Workspace</h3>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 pl-6">
                      {currentClientWorkspace ? (
                        <>
                          <p><span className="text-gray-500">Name:</span> {currentClientWorkspace.name}</p>
                          <p><span className="text-gray-500">Projects:</span> {currentClientWorkspace.activeProjects || '3'} / {currentClientWorkspace.quotaProjects}</p>
                          <p><span className="text-gray-500">Last Activity:</span> {currentClientWorkspace.lastActivity || 'Today'}</p>
                        </>
                      ) : (
                        <p>No client workspace selected</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <Button
                    onClick={() => setLocation('/client-portal/client-management')}
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Button>
                  <Button
                    onClick={() => setLocation('/tenant-management')}
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Organizations
                  </Button>
                </div>
              </div>
            
              {/* Reports Quick Access Widget */}
              <ReportsQuickWidget />
              
              {/* Next Actions */}
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