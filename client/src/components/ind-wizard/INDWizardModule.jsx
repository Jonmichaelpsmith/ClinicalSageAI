/**
 * IND Wizard Module
 * 
 * This component provides the main interface for the IND Wizard module,
 * which helps users prepare FDA Investigational New Drug (IND) applications.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, List, Settings, Download, Upload, Database, Clock } from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const INDWizardModule = () => {
  const { registerModule, regulatoryCore } = useIntegration();
  const [section, setSection] = useState('dashboard');
  const [indGuidance, setIndGuidance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Register this module with the integration layer
  useEffect(() => {
    registerModule('ind-wizard', { 
      name: 'IND Wizard™',
      version: '1.0.0',
      capabilities: ['ind-submission', 'form-filling', 'document-generation']
    });
    
    // Load IND guidance from regulatory core
    const loadIndGuidance = async () => {
      try {
        setIsLoading(true);
        
        // Get IND guidance from regulatory core
        if (regulatoryCore) {
          const guidance = await regulatoryCore.getRegulatoryGuidance('IND', 'FDA');
          setIndGuidance(guidance.guidance || []);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading IND guidance:', error);
        setIsLoading(false);
      }
    };
    
    loadIndGuidance();
  }, [registerModule, regulatoryCore]);
  
  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  // Render different sections based on state
  const renderSection = () => {
    switch (section) {
      case 'dashboard':
        return <INDDashboard />;
      case 'forms':
        return <INDForms />;
      case 'library':
        return <INDLibrary guidance={indGuidance} isLoading={isLoading} />;
      case 'settings':
        return <INDSettings />;
      default:
        return <INDDashboard />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Module header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">IND Wizard™</h1>
          
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
              onClick={() => setSection('forms')}
            >
              Create New IND
            </button>
            
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setSection('library')}
            >
              Resource Library
            </button>
          </div>
        </div>
        
        {/* Module navigation */}
        <nav className="flex mt-4 space-x-1">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'dashboard' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('dashboard')}
          >
            Dashboard
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'forms' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('forms')}
          >
            Forms & Templates
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'library' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('library')}
          >
            Regulatory Library
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'settings' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('settings')}
          >
            Settings
          </button>
        </nav>
      </header>
      
      {/* Module content with animation */}
      <motion.div 
        className="flex-1 overflow-auto bg-gray-50 p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        {renderSection()}
      </motion.div>
    </div>
  );
};

// Dashboard component
const INDDashboard = () => {
  // Mock data for dashboard
  const recentSubmissions = [
    { id: 'IND-2023-001', title: 'Phase 1 Oncology Study', status: 'Draft', updated: '2023-12-15' },
    { id: 'IND-2023-002', title: 'Phase 2 Cardiology Study', status: 'In Review', updated: '2023-11-30' },
    { id: 'IND-2023-003', title: 'Phase 1 Neurology Study', status: 'Submitted', updated: '2023-10-22' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active INDs"
          value="5"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        
        <DashboardCard
          title="Completed"
          value="12"
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
        />
        
        <DashboardCard
          title="In Progress"
          value="3"
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
        />
        
        <DashboardCard
          title="FDA Templates"
          value="24"
          icon={<List className="h-6 w-6" />}
          color="purple"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Recent IND Submissions</h2>
        </div>
        
        <div className="divide-y">
          {recentSubmissions.map((submission) => (
            <div key={submission.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{submission.title}</div>
                <div className="text-sm text-gray-500">{submission.id} • Updated {submission.updated}</div>
              </div>
              
              <div className="flex items-center">
                <StatusBadge status={submission.status} />
                <button className="ml-4 text-gray-400 hover:text-gray-500">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-center">
          <button className="text-primary hover:text-primary-dark font-medium">
            View All Submissions
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Quick Actions</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton 
            icon={<FileText />} 
            text="Create New IND"
            onClick={() => console.log('Create new IND')}
          />
          
          <ActionButton 
            icon={<Upload />} 
            text="Import Documents"
            onClick={() => console.log('Import documents')}
          />
          
          <ActionButton 
            icon={<Database />} 
            text="Form Library"
            onClick={() => console.log('Form library')}
          />
          
          <ActionButton 
            icon={<Settings />} 
            text="Configure Workflows"
            onClick={() => console.log('Configure workflows')}
          />
        </div>
      </div>
    </div>
  );
};

// Forms component (placeholder)
const INDForms = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">IND Forms & Templates</h2>
      <p className="text-gray-500">
        This section provides access to all FDA IND application forms and templates.
        Use the AI-assisted form filling features to streamline your IND submission process.
      </p>
      
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Available Forms</h3>
        
        <div className="space-y-4">
          <FormItem 
            id="form-1572"
            title="Form FDA 1572: Statement of Investigator"
            description="For investigators participating in clinical studies of investigational drugs or biologics."
          />
          
          <FormItem 
            id="form-3500"
            title="Form FDA 3500: MedWatch Voluntary Reporting"
            description="For voluntary reporting of adverse events, product problems, or other safety issues."
          />
          
          <FormItem 
            id="form-3674"
            title="Form FDA 3674: Certification of Compliance"
            description="Certifies compliance with requirements of ClinicalTrials.gov."
          />
          
          <FormItem 
            id="form-3926"
            title="Form FDA 3926: Individual Patient Expanded Access"
            description="For individual patient expanded access IND applications."
          />
        </div>
      </div>
    </div>
  );
};

// Library component (placeholder)
const INDLibrary = ({ guidance, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">FDA Regulatory Library</h2>
      <p className="text-gray-500">
        Access the latest FDA guidance documents, regulations, and reference materials 
        related to Investigational New Drug applications.
      </p>
      
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">FDA Guidance Documents</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : guidance.length > 0 ? (
          <div className="space-y-4">
            {guidance.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <h4 className="font-medium text-primary">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">Last updated: {item.lastUpdated}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No guidance documents available
          </div>
        )}
      </div>
    </div>
  );
};

// Settings component (placeholder)
const INDSettings = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">IND Wizard Settings</h2>
      <p className="text-gray-500">
        Configure your IND Wizard preferences, workflows, and integration settings.
      </p>
      
      <div className="mt-6 space-y-6">
        {/* Settings sections would go here */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">General Settings</h3>
          <p className="text-sm text-gray-500">Configure general module settings</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Default Templates</h3>
          <p className="text-sm text-gray-500">Set default templates for new IND applications</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">FDA Submission Settings</h3>
          <p className="text-sm text-gray-500">Configure FDA Electronic Submissions Gateway (ESG) settings</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">User Permissions</h3>
          <p className="text-sm text-gray-500">Manage user roles and permissions for IND Wizard</p>
        </div>
      </div>
    </div>
  );
};

// Helper components
const DashboardCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusClasses = {
    Draft: 'bg-gray-100 text-gray-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    Submitted: 'bg-green-100 text-green-800',
    Approved: 'bg-blue-100 text-blue-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

const ActionButton = ({ icon, text, onClick }) => {
  return (
    <button
      className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="p-2 bg-primary bg-opacity-10 rounded-full text-primary">
        {icon}
      </div>
      <span className="mt-2 text-sm font-medium">{text}</span>
    </button>
  );
};

const FormItem = ({ id, title, description }) => {
  return (
    <div className="border rounded-lg hover:bg-gray-50 transition-colors p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <button className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors">
          Access Form
        </button>
      </div>
    </div>
  );
};

export default INDWizardModule;