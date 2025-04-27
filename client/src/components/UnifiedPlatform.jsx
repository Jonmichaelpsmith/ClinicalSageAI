/**
 * Unified Platform Component
 * 
 * This component serves as the main container for the TrialSage platform,
 * integrating all modules and providing shared context and navigation.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ModuleIntegrationProvider } from './integration/ModuleIntegrationLayer';
import AppHeader from './common/AppHeader';
import AppSidebar from './common/AppSidebar';
import AppFooter from './common/AppFooter';
import NotificationCenter from './common/NotificationCenter';
import AIAssistantButton from './AIAssistantButton';
import INDWizardModule from './ind-wizard/INDWizardModule';
import TrialVaultModule from './trial-vault/TrialVaultModule';
import CSRIntelligenceModule from './csr-intelligence/CSRIntelligenceModule';
import StudyArchitectModule from './study-architect/StudyArchitectModule';
import AnalyticsModule from './analytics/AnalyticsModule';
import AdminModule from './admin/AdminModule';
import { ClientContextBar } from './client-portal/ClientContextBar';
import { X } from 'lucide-react';
import securityService from '../services/SecurityService';

const UnifiedPlatform = () => {
  const [location] = useLocation();
  const [activeModule, setActiveModule] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCroUser, setIsCroUser] = useState(false);
  const [showRegulatoryUpdate, setShowRegulatoryUpdate] = useState(false);
  const [regulatoryUpdate, setRegulatoryUpdate] = useState(null);
  
  // Determine active module based on location
  useEffect(() => {
    const path = location.split('/')[1] || 'home';
    setActiveModule(path);
  }, [location]);
  
  // Check if current user is from the CRO organization
  useEffect(() => {
    const checkUserType = async () => {
      if (securityService.currentUser && securityService.currentOrganization) {
        setIsCroUser(securityService.currentOrganization.type === 'cro');
      }
    };
    
    checkUserType();
  }, []);
  
  // Subscribe to regulatory updates
  useEffect(() => {
    // Simulated regulatory update
    const simulateRegulatoryUpdate = () => {
      const update = {
        title: 'FDA Updates Guidance for Clinical Trial Endpoints',
        source: 'FDA',
        date: new Date().toLocaleDateString(),
        summary: 'The FDA has released updated guidance for industry regarding clinical trial endpoints for drug and biological product development.',
        url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents'
      };
      
      setRegulatoryUpdate(update);
      setShowRegulatoryUpdate(true);
      
      // Hide after 10 seconds
      setTimeout(() => {
        setShowRegulatoryUpdate(false);
      }, 10000);
    };
    
    // Simulate regulatory update after 3 seconds
    const timeout = setTimeout(simulateRegulatoryUpdate, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Render the active module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'ind-wizard':
        return <INDWizardModule />;
      case 'trial-vault':
        return <TrialVaultModule />;
      case 'csr-intelligence':
        return <CSRIntelligenceModule />;
      case 'study-architect':
        return <StudyArchitectModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'admin':
        return <AdminModule />;
      default:
        return <HomeModule />;
    }
  };
  
  return (
    <ModuleIntegrationProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <AppHeader toggleSidebar={toggleSidebar} />
        
        {/* Client context bar - shown only for CRO users */}
        {isCroUser && <ClientContextBar />}
        
        {/* Main content area with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AppSidebar isOpen={sidebarOpen} activeModule={activeModule} />
          
          {/* Main content */}
          <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
            {/* Regulatory update alert */}
            {showRegulatoryUpdate && regulatoryUpdate && (
              <div className="relative bg-blue-50 p-4 border-l-4 border-blue-500 mb-4 mx-4 mt-4 rounded shadow-sm">
                <button 
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowRegulatoryUpdate(false)}
                >
                  <X size={16} />
                </button>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-blue-800 uppercase bg-blue-100 px-2 py-0.5 rounded-full">{regulatoryUpdate.source}</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">{regulatoryUpdate.title}</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>{regulatoryUpdate.summary}</p>
                    </div>
                    <div className="mt-2">
                      <a 
                        href={regulatoryUpdate.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        View details →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Active module content */}
            <div className="p-4">
              {renderActiveModule()}
            </div>
          </main>
        </div>
        
        {/* Footer */}
        <AppFooter />
        
        {/* Floating components */}
        <AIAssistantButton />
        <NotificationCenter />
      </div>
    </ModuleIntegrationProvider>
  );
};

// Home module (dashboard)
const HomeModule = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8 bg-gradient-to-b from-white to-pink-50 rounded-lg border shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to TrialSage™</h1>
        <p className="mt-2 text-xl text-gray-600">AI-powered regulatory writing platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard 
          title="IND Wizard™" 
          description="Streamlined IND preparation and submission"
          icon="📝"
          path="/ind-wizard"
          color="bg-blue-500"
        />
        
        <ModuleCard 
          title="Trial Vault™" 
          description="Secure document management with blockchain verification"
          icon="🔒"
          path="/trial-vault"
          color="bg-green-500"
        />
        
        <ModuleCard 
          title="CSR Intelligence™" 
          description="AI-powered clinical study report generation"
          icon="📊"
          path="/csr-intelligence"
          color="bg-purple-500"
        />
        
        <ModuleCard 
          title="Study Architect™" 
          description="Comprehensive clinical study design and planning"
          icon="📋"
          path="/study-architect"
          color="bg-yellow-500"
        />
        
        <ModuleCard 
          title="Analytics Module" 
          description="Comprehensive data analytics and insights"
          icon="📈"
          path="/analytics"
          color="bg-red-500"
        />
        
        <ModuleCard 
          title="Administration" 
          description="User, organization, and system management"
          icon="⚙️"
          path="/admin"
          color="bg-gray-500"
        />
      </div>
      
      {/* AI and Blockchain highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-black text-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">🧠</span>
            AI-Powered Central Intelligence
          </h2>
          <p className="mt-2">
            Our central AI system acts as the "regulatory and scientific central nervous system" for the entire platform, providing intelligent insights and automation across all modules.
          </p>
          <div className="mt-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Real-time regulatory updates and guidance
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Intelligent document generation and analysis
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Automated compliance checking and recommendations
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="mr-2">🔗</span>
            Enhanced Blockchain Security
          </h2>
          <p className="mt-2">
            Our platform utilizes blockchain technology for enhanced security, document verification, and tamper-proof audit trails across all regulatory submissions.
          </p>
          <div className="mt-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Secure document verification and integrity
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Immutable audit trails for regulatory compliance
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Enhanced security for sensitive clinical data
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Recent activity section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <div className="mt-4 space-y-4">
          <ActivityItem 
            title="BTX-331 IND Submission Updated"
            description="Protocol section updated by John Smith"
            time="2 hours ago"
            module="ind-wizard"
          />
          
          <ActivityItem 
            title="New Document Added to Vault"
            description="Investigator Brochure v2.0 uploaded by Sarah Johnson"
            time="Yesterday"
            module="trial-vault"
          />
          
          <ActivityItem 
            title="BX-107 Phase II CSR In Review"
            description="Clinical Study Report ready for review"
            time="2 days ago"
            module="csr-intelligence"
          />
          
          <ActivityItem 
            title="Study Protocol Completed"
            description="NRX-405 Protocol finalized and approved"
            time="3 days ago"
            module="study-architect"
          />
        </div>
      </div>
    </div>
  );
};

// Module card component for homepage
const ModuleCard = ({ title, description, icon, path, color }) => {
  const [, setLocation] = useLocation();
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setLocation(path)}
    >
      <div className={`h-2 ${color}`}></div>
      <div className="p-6">
        <div className="text-3xl mb-4">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <button 
          className="mt-4 text-sm text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(path);
          }}
        >
          Access Module →
        </button>
      </div>
    </div>
  );
};

// Activity item component for recent activity
const ActivityItem = ({ title, description, time, module }) => {
  const [, setLocation] = useLocation();
  
  const getModuleColor = (moduleName) => {
    switch (moduleName) {
      case 'ind-wizard':
        return 'text-blue-600 bg-blue-50';
      case 'trial-vault':
        return 'text-green-600 bg-green-50';
      case 'csr-intelligence':
        return 'text-purple-600 bg-purple-50';
      case 'study-architect':
        return 'text-yellow-600 bg-yellow-50';
      case 'analytics':
        return 'text-red-600 bg-red-50';
      case 'admin':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-primary bg-primary bg-opacity-10';
    }
  };
  
  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <div className="mt-2 flex">
        <span 
          className={`text-xs px-2 py-0.5 rounded-full ${getModuleColor(module)}`}
          onClick={() => setLocation(`/${module}`)}
        >
          {module.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
        <button 
          className="ml-auto text-xs text-primary hover:underline"
          onClick={() => setLocation(`/${module}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default UnifiedPlatform;