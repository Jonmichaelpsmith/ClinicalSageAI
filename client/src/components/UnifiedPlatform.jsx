import React from 'react';
import { Link } from 'wouter';
import { Database, FileText, FlaskConical, BarChartBig, ShieldCheck, BookText } from 'lucide-react';
import { useModuleIntegration } from './integration/ModuleIntegrationLayer';

const UnifiedPlatform = () => {
  const { addAuditEntry } = useModuleIntegration();

  const handleModuleClick = (moduleName) => {
    addAuditEntry('module_selected', { module: moduleName });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-section mb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to TrialSage™
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            The comprehensive AI-powered platform for regulatory and clinical documentation across the drug development lifecycle
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="hot-pink-btn">
              Get Started
            </button>
            <button className="bg-white text-gray-900 py-2.5 px-5 rounded-md hover:bg-gray-100 font-medium">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="mb-12 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Integrated Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* TrialSage Vault */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('vault');
              navigate('/vault');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <Database size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">TrialSage Vault</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Secure document storage with blockchain verification for regulatory submissions
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Document Management</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Blockchain</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Audit Trail</span>
            </div>
          </div>

          {/* CSR Intelligence */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('csr-intelligence');
              navigate('/csr-intelligence');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <FileText size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">CSR Intelligence</h3>
            </div>
            <p className="text-gray-600 mb-4">
              AI-powered creation and analysis of clinical study reports for global submissions
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">AI Analysis</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Templates</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Compliance</span>
            </div>
          </div>

          {/* Study Architect */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('study-architect');
              navigate('/study-architect');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <FlaskConical size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">Study Architect</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Design clinical trials and create protocols with intelligent templates
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Protocol Design</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Workflow</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Templates</span>
            </div>
          </div>

          {/* Analytics */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('analytics');
              navigate('/analytics');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <BarChartBig size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">Analytics Module</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Comprehensive data visualization and insights across your regulatory portfolio
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Dashboards</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Reporting</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Metrics</span>
            </div>
          </div>

          {/* ICH Wiz */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('regulatory-intelligence');
              navigate('/regulatory-intelligence');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <BookText size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">ICH Wiz™</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Digital compliance coach for ICH guidelines and global regulatory standards
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Guidance</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Regulations</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">AI Assistant</span>
            </div>
          </div>

          {/* IND Wizard */}
          <div 
            className="module-card cursor-pointer"
            onClick={() => {
              handleModuleClick('ind-wizard');
              navigate('/ind-wizard');
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <ShieldCheck size={20} className="text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold">IND Wizard™</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Streamlined creation and management of Investigational New Drug applications
            </p>
            <div className="flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">FDA Submissions</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Forms</span>
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Platform Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">AI-Powered Intelligence</h3>
              <p className="text-gray-600">
                Leverage the latest generative AI technology to automate document creation, extract insights, and ensure compliance.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Blockchain Security</h3>
              <p className="text-gray-600">
                Enhanced security with blockchain verification providing tamper-proof audit trails for all regulatory documents.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Multi-Tenant Architecture</h3>
              <p className="text-gray-600">
                Secure CRO master accounts managing multiple biotech clients with hierarchical permissions structure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedPlatform;