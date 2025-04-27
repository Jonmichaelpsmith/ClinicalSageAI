/**
 * CSR Intelligence Module
 * 
 * This component provides the main interface for the CSR Intelligence module,
 * which helps users prepare and manage Clinical Study Reports (CSRs).
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlignLeft, 
  Settings, 
  Download, 
  Upload, 
  Edit,
  Plus,
  Book,
  Search,
  List,
  Copy,
  ExternalLink,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const CSRIntelligenceModule = () => {
  const { registerModule, regulatoryCore } = useIntegration();
  const [section, setSection] = useState('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regulatoryGuidance, setRegulatoryGuidance] = useState([]);
  
  // Register this module with the integration layer
  useEffect(() => {
    registerModule('csr-intelligence', { 
      name: 'CSR Intelligence™',
      version: '1.0.0',
      capabilities: ['csr-generation', 'ich-compliance', 'ai-writing-assistance']
    });
    
    // Load regulatory guidance
    const loadGuidance = async () => {
      try {
        setIsLoading(true);
        
        // Get CSR guidance from regulatory core
        if (regulatoryCore) {
          const guidance = await regulatoryCore.getRegulatoryGuidance('CSR', 'ICH');
          setRegulatoryGuidance(guidance.guidance || []);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading CSR guidance:', error);
        setIsLoading(false);
      }
    };
    
    loadGuidance();
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
        return <CSRDashboard />;
      case 'templates':
        return <CSRTemplates 
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />;
      case 'editor':
        return <CSREditor />;
      case 'guidance':
        return <CSRGuidance guidance={regulatoryGuidance} isLoading={isLoading} />;
      case 'settings':
        return <CSRSettings />;
      default:
        return <CSRDashboard />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Module header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CSR Intelligence™</h1>
          
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center"
              onClick={() => setSection('templates')}
            >
              <Plus size={16} className="mr-2" />
              New CSR
            </button>
            
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              onClick={() => setSection('guidance')}
            >
              <Book size={16} className="mr-2" />
              ICH Guidance
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
              section === 'templates' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('templates')}
          >
            Templates
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'editor' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('editor')}
          >
            Editor
          </button>
          
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              section === 'guidance' 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSection('guidance')}
          >
            ICH Guidance
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
const CSRDashboard = () => {
  // Mock data for dashboard
  const recentCSRs = [
    { id: 'CSR-2023-001', title: 'Phase 2 Oncology Study CSR', status: 'Draft', progress: 65, updated: '2024-03-15' },
    { id: 'CSR-2023-002', title: 'Phase 3 Cardiology Study CSR', status: 'In Review', progress: 90, updated: '2024-02-28' },
    { id: 'CSR-2023-003', title: 'Phase 1 Neurology Study CSR', status: 'Completed', progress: 100, updated: '2024-01-20' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active CSRs"
          value="6"
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
          title="ICH Templates"
          value="8"
          icon={<Copy className="h-6 w-6" />}
          color="purple"
        />
        
        <DashboardCard
          title="AI Assists"
          value="43"
          icon={<Sparkles className="h-6 w-6" />}
          color="pink"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Recent CSRs</h2>
        </div>
        
        <div className="divide-y">
          {recentCSRs.map((csr) => (
            <div key={csr.id} className="px-6 py-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{csr.title}</div>
                  <div className="text-sm text-gray-500">{csr.id} • Updated {csr.updated}</div>
                </div>
                
                <div className="flex items-center">
                  <StatusBadge status={csr.status} />
                  <button className="ml-4 text-gray-400 hover:text-gray-500">
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${csr.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {csr.progress}% Complete
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-center">
          <button className="text-primary hover:text-primary-dark font-medium">
            View All CSRs
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Quick Actions</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton 
            icon={<Plus />} 
            text="Create New CSR"
            onClick={() => console.log('Create new CSR')}
          />
          
          <ActionButton 
            icon={<Upload />} 
            text="Import Data"
            onClick={() => console.log('Import data')}
          />
          
          <ActionButton 
            icon={<AlignLeft />} 
            text="Template Library"
            onClick={() => console.log('Template library')}
          />
          
          <ActionButton 
            icon={<FileCheck />} 
            text="Quality Check"
            onClick={() => console.log('Quality check')}
          />
        </div>
      </div>
    </div>
  );
};

// Templates component
const CSRTemplates = ({ selectedTemplate, setSelectedTemplate }) => {
  // Mock template data
  const templates = [
    { 
      id: 'template-001', 
      title: 'ICH E3 Standard CSR', 
      category: 'phase-3',
      description: 'Standard Clinical Study Report template following ICH E3 guidelines. Suitable for Phase 3 studies.'
    },
    { 
      id: 'template-002', 
      title: 'ICH E3 Phase 1 CSR', 
      category: 'phase-1',
      description: 'Streamlined Clinical Study Report template for Phase 1 studies following ICH E3 guidelines.'
    },
    { 
      id: 'template-003', 
      title: 'ICH E3 Phase 2 CSR', 
      category: 'phase-2',
      description: 'Clinical Study Report template for Phase 2 studies following ICH E3 guidelines.'
    },
    { 
      id: 'template-004', 
      title: 'Non-Interventional Study CSR', 
      category: 'non-interventional',
      description: 'CSR template adapted for non-interventional/observational studies.'
    },
    { 
      id: 'template-005', 
      title: 'Medical Device Clinical Investigation Report', 
      category: 'device',
      description: 'Template adapted for medical device clinical investigations.'
    },
    { 
      id: 'template-006', 
      title: 'Custom CSR Template', 
      category: 'custom',
      description: 'Customizable CSR template that can be adapted to specific study needs.'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">CSR Templates</h2>
        <p className="text-gray-500 mb-6">
          Select a template to create a new Clinical Study Report. All templates are compliant with ICH E3 guidelines
          and can be customized to meet your specific needs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div 
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'border-primary ring-1 ring-primary'
                  : 'hover:border-gray-300 hover:shadow'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{template.title}</h3>
                {selectedTemplate === template.id && (
                  <div className="bg-primary text-white p-1 rounded-full">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {template.description}
              </p>
              <div className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-1 inline-block">
                {template.category}
              </div>
            </div>
          ))}
        </div>
        
        {selectedTemplate && (
          <div className="mt-6 pt-6 border-t flex justify-between items-center">
            <div>
              <span className="font-medium">
                Selected: {templates.find(t => t.id === selectedTemplate)?.title}
              </span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Preview Template
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
                Create CSR with this Template
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Import CSR Structure</h2>
        <p className="text-gray-500 mb-4">
          Already have a CSR structure? Import it to create a new CSR based on your existing work.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="mb-4">
            <Upload className="h-10 w-10 text-gray-400 mx-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your existing CSR file here, or click to browse
          </p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Select File
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Supported file types: DOCX, PDF, XML
          </p>
        </div>
      </div>
    </div>
  );
};

// Editor component
const CSREditor = () => {
  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full min-h-[60vh]">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">CSR Editor</h2>
          <span className="ml-3 text-sm text-gray-500">Phase 2 Oncology Study CSR</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50 flex items-center">
            <Download size={14} className="mr-1.5" />
            Export
          </button>
          <button className="px-4 py-1.5 bg-primary text-white text-sm rounded hover:bg-opacity-90 flex items-center">
            <Sparkles size={14} className="mr-1.5" />
            AI Assist
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Document navigator */}
        <div className="w-64 border-r overflow-y-auto p-3">
          <div className="mb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Find section..."
              />
            </div>
          </div>
          
          <div className="space-y-0.5">
            <SectionItem 
              title="1. Title Page" 
              isCompleted={true} 
              isActive={false}
            />
            <SectionItem 
              title="2. Synopsis" 
              isCompleted={true} 
              isActive={false}
            />
            <SectionItem 
              title="3. Table of Contents" 
              isCompleted={true} 
              isActive={false}
            />
            <SectionItem 
              title="4. List of Abbreviations" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="5. Ethics" 
              isCompleted={false} 
              isActive={true}
            />
            <SectionItem 
              title="6. Investigators" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="7. Study Objectives" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="8. Investigational Plan" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="9. Study Patients" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="10. Efficacy Evaluation" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="11. Safety Evaluation" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="12. Discussion" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="13. Conclusion" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="14. References" 
              isCompleted={false} 
              isActive={false}
            />
            <SectionItem 
              title="15. Appendices" 
              isCompleted={false} 
              isActive={false}
            />
          </div>
        </div>
        
        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <h1 className="text-2xl font-bold mb-4">5. Ethics</h1>
            
            <div className="prose prose-sm max-w-none">
              <h2>5.1 Independent Ethics Committee (IEC) or Institutional Review Board (IRB)</h2>
              <p>
                The study protocol, informed consent form, and other relevant study documents were reviewed and approved by the Independent Ethics Committee (IEC) or Institutional Review Board (IRB) at each participating center prior to study initiation. The study was conducted in accordance with the ethical principles that have their origin in the Declaration of Helsinki, Good Clinical Practice (GCP) guidelines, and applicable regulatory requirements.
              </p>
              <p>
                A list of all IECs/IRBs that approved the study, along with the name of the committee chair and the date of approval, is provided in Appendix 16.1.3.
              </p>
              
              <h2>5.2 Ethical Conduct of the Study</h2>
              <p>
                The study was conducted in compliance with the protocol, GCP, and applicable regulatory requirements. Compliance was ensured through regular monitoring visits, training of study personnel, and review of study documentation.
              </p>
              <p>
                No significant deviations from GCP were identified during the conduct of the study. Minor protocol deviations are summarized in Section 10.2 and detailed in Appendix 16.2.2.
              </p>
              
              <h2>5.3 Patient Information and Consent</h2>
              <p>
                Prior to any study-related procedures, written informed consent was obtained from each patient using an IEC/IRB-approved informed consent form. The process of obtaining informed consent was documented in each patient's source records.
              </p>
              <p>
                The informed consent form explained the nature, purpose, possible risks and benefits of the study in language understandable to the patients. Patients were given adequate time to read the information, ask questions, and decide whether to participate. A copy of the signed informed consent form was provided to each patient.
              </p>
              <p>
                <span className="text-primary">[ Draft - Revise with study-specific details ]</span>
              </p>
            </div>
          </div>
          
          <div className="border-t p-3 flex items-center justify-between bg-gray-50">
            <div className="flex space-x-3">
              <button className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-100 flex items-center">
                <List size={14} className="mr-1.5" />
                Comments
              </button>
              <button className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-100 flex items-center">
                <FileCheck size={14} className="mr-1.5" />
                Quality Check
              </button>
            </div>
            
            <div>
              <button className="px-4 py-1.5 bg-primary text-white text-sm rounded hover:bg-opacity-90">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Guidance component
const CSRGuidance = ({ guidance, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Book size={24} className="text-primary mr-3" />
          <h2 className="text-xl font-semibold">ICH E3 Guidance</h2>
        </div>
        
        <p className="text-gray-500 mb-6">
          The International Council for Harmonisation (ICH) E3 guideline provides guidance on the structure and content
          of Clinical Study Reports (CSRs). Below are key resources to help ensure compliance with ICH E3 requirements.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4 hover:shadow-sm">
            <h3 className="font-medium mb-2">ICH E3 Structure and Content of Clinical Study Reports</h3>
            <p className="text-sm text-gray-500 mb-3">
              Official ICH E3 guideline defining the standard structure and content requirements for CSRs.
            </p>
            <a 
              href="https://ich.org/page/efficacy-guidelines" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center"
            >
              <ExternalLink size={14} className="mr-1" />
              View Official Guideline
            </a>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-sm">
            <h3 className="font-medium mb-2">ICH E3 Q&A Document (R1)</h3>
            <p className="text-sm text-gray-500 mb-3">
              Questions and answers that clarify key aspects of the ICH E3 guideline implementation.
            </p>
            <a 
              href="https://ich.org/page/efficacy-guidelines" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm flex items-center"
            >
              <ExternalLink size={14} className="mr-1" />
              View Q&A Document
            </a>
          </div>
        </div>
        
        <h3 className="font-medium mb-3">ICH E3 Section Guidelines</h3>
        
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
          <div className="border rounded-lg p-6 text-center text-gray-500">
            No guidance documents available
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Guidance</h2>
        <p className="text-gray-500 mb-6">
          Get instant guidance on specific CSR sections using our AI-assisted regulatory intelligence system.
        </p>
        
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Ask about a specific CSR section or requirement..."
            />
          </div>
          <button className="ml-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center">
            <Sparkles size={16} className="mr-2" />
            Get AI Guidance
          </button>
        </div>
        
        <div className="text-sm text-gray-500 flex items-center">
          <Sparkles size={14} className="text-primary mr-2" />
          Example: "What should be included in the Safety Evaluation section?" or "ICH E3 synopsis requirements"
        </div>
      </div>
    </div>
  );
};

// Settings component
const CSRSettings = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">CSR Intelligence Settings</h2>
      <p className="text-gray-500 mb-6">
        Configure your CSR Intelligence settings, templates, and AI capabilities.
      </p>
      
      <div className="space-y-6">
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-3">Template Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Default Template</div>
                <div className="text-sm text-gray-500">Set the default template used when creating new CSRs</div>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="ich-e3-standard">ICH E3 Standard CSR</option>
                <option value="ich-e3-phase1">ICH E3 Phase 1 CSR</option>
                <option value="ich-e3-phase2">ICH E3 Phase 2 CSR</option>
                <option value="nis">Non-Interventional Study CSR</option>
                <option value="medical-device">Medical Device Clinical Investigation Report</option>
                <option value="custom">Custom CSR Template</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Custom Headers & Footers</div>
                <div className="text-sm text-gray-500">Enable custom headers and footers for CSR documents</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Section Numbering Style</div>
                <div className="text-sm text-gray-500">Configure the section numbering style for CSRs</div>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="numeric">Numeric (1, 1.1, 1.1.1)</option>
                <option value="alphanumeric">Alphanumeric (A, A.1, A.1.1)</option>
                <option value="outline">Outline (I, I.A, I.A.1)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-3">AI Writing Assistant</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">AI Writing Assistant</div>
                <div className="text-sm text-gray-500">Enable AI suggestions for CSR content generation</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Content Enhancement Level</div>
                <div className="text-sm text-gray-500">Set the level of AI assistance for content enhancement</div>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="minimal">Minimal (Grammar & Typos Only)</option>
                <option value="moderate">Moderate (Style & Structure)</option>
                <option value="substantial">Substantial (Content Generation)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Regulatory Compliance Check</div>
                <div className="text-sm text-gray-500">Automatically check content against ICH guidelines</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-3">Export Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Default Export Format</div>
                <div className="text-sm text-gray-500">Set the default format for CSR exports</div>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="docx">Microsoft Word (DOCX)</option>
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Include Change Tracking</div>
                <div className="text-sm text-gray-500">Include change tracking information in exports</div>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t mt-8 pt-6 flex justify-end space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
};

// Helper components
const DashboardCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
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
    Completed: 'bg-green-100 text-green-800',
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

const SectionItem = ({ title, isCompleted, isActive }) => {
  return (
    <div 
      className={`flex items-center p-2 rounded text-sm cursor-pointer ${
        isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'
      }`}
    >
      <div className="w-5 h-5 mr-2 flex-shrink-0">
        {isCompleted ? (
          <div className={`rounded-full flex items-center justify-center ${isActive ? 'bg-white text-primary' : 'bg-green-100 text-green-600'}`}>
            <CheckCircle size={16} />
          </div>
        ) : (
          <div className={`rounded-full border ${isActive ? 'border-white' : 'border-gray-300'}`}></div>
        )}
      </div>
      <span className="truncate">{title}</span>
    </div>
  );
};

export default CSRIntelligenceModule;