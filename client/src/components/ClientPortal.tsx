import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cleanupModals } from '../lib/modalHelpers';

// Client Portal component for TrialSage
export default function ClientPortal() {
  const [, navigate] = useLocation();
  
  // Clean up modals when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  return (
    <div className="client-portal min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-100 rounded">← Back</button>
          <button className="px-3 py-1 bg-gray-100 rounded">→ Forward</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md flex items-center">
            <span className="mr-1">🏠</span> Client Portal
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-gray-100 rounded">
            <span className="mr-1">⚙️</span> Settings
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded">
            <span className="mr-1">👥</span> Client Management
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded">
            <span className="mr-1">🏢</span> Organization Settings
          </button>
          <button className="px-3 py-1 bg-gray-100 rounded">
            <span className="mr-1">🔄</span> Switch Module
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold text-indigo-700 mb-6">TrialSage™ Modules</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Module Cards */}
          <ModuleCard 
            title="IND Wizard™" 
            description="FDA-compliant INDs with automated form generation"
            onClick={() => navigate('/cerv2#ind')}
          />
          
          <ModuleCard 
            title="CER Generator™" 
            description="EU MDR 2017/745 Clinical Evaluation Reports"
            onClick={() => navigate('/cerv2')}
          />
          
          <ModuleCard 
            title="CMC Wizard™" 
            description="Chemistry, Manufacturing, and Controls documentation"
            onClick={() => navigate('/cerv2#cmc')}
          />
          
          <ModuleCard 
            title="CSR Analyzer™" 
            description="AI-powered Clinical Study Report analysis"
            onClick={() => navigate('/cerv2#csr')}
          />
          
          <ModuleCard 
            title="TrialSage Vault™" 
            description="Secure document storage with intelligent retrieval"
            onClick={() => navigate('/cerv2#vault')}
          />
          
          <ModuleCard 
            title="Regulatory Intelligence Hub™" 
            description="AI-powered strategy, timeline, and risk simulation"
            onClick={() => navigate('/cerv2#hub')}
          />
          
          <ModuleCard 
            title="Risk Heatmap™" 
            description="Interactive visualization of CTD risk gaps & impacts"
            onClick={() => navigate('/cerv2#risk')}
          />
          
          <ModuleCard 
            title="Study Architect™" 
            description="Protocol development with regulatory intelligence"
            onClick={() => navigate('/cerv2#study')}
          />
          
          <ModuleCard 
            title="Analytics Dashboard" 
            description="Metrics and insights on regulatory performance"
            onClick={() => navigate('/cerv2#analytics')}
          />
        </div>
      </main>
    </div>
  );
}

// Module card component
function ModuleCard({ title, description, onClick }) {
  return (
    <div 
      className="bg-blue-50 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h2 className="text-xl font-medium text-indigo-700 mb-2">{title}</h2>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}