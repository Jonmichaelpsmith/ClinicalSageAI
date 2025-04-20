import React, { useState } from 'react';
import { Link } from 'wouter';
import { FileText, ChevronRight, Package, Check, BookOpen, FilePlus, FileSymlink, AlertCircle } from 'lucide-react';

export default function INDFullSolution() {
  const [activeTab, setActiveTab] = useState('ind-templates');
  
  // Sample IND templates
  const indTemplates = [
    {
      id: 1,
      title: "Oncology IND Full Solution",
      description: "End-to-end templates for oncology INDs, including protocol templates, CMC documentation, and regulatory response examples.",
      modules: ["Protocol", "CMC", "IB", "FDA Forms", "Cover Letter"],
      specialization: "Oncology",
      lastUpdated: "March 15, 2024"
    },
    {
      id: 2,
      title: "Rare Disease IND Package",
      description: "Comprehensive package for rare disease indications with orphan drug designation elements and regulatory pathways.",
      modules: ["Protocol", "CMC", "IB", "FDA Forms", "Orphan Designation", "Cover Letter"],
      specialization: "Rare Disease",
      lastUpdated: "April 2, 2024"
    },
    {
      id: 3,
      title: "First-in-Human IND Template",
      description: "Templates designed specifically for Phase 1 first-in-human studies with robust safety monitoring provisions.",
      modules: ["Protocol", "CMC", "IB", "FDA Forms", "DSUR Template", "Safety Monitoring", "Cover Letter"],
      specialization: "Phase 1",
      lastUpdated: "February 28, 2024"
    },
    {
      id: 4,
      title: "Advanced Therapy IND (Cell/Gene)",
      description: "Specialized IND package for cell and gene therapies with comprehensive CMC and manufacturing documentation.",
      modules: ["Protocol", "Advanced CMC", "IB", "FDA Forms", "Manufacturing Controls", "Cover Letter"],
      specialization: "Cell/Gene Therapy",
      lastUpdated: "March 22, 2024"
    },
    {
      id: 5,
      title: "Infectious Disease IND Solution",
      description: "IND package with special considerations for infectious disease indications including accelerated pathway elements.",
      modules: ["Protocol", "CMC", "IB", "FDA Forms", "Accelerated Approval Sections", "Cover Letter"],
      specialization: "Infectious Disease",
      lastUpdated: "April 10, 2024"
    }
  ];
  
  // Sample IND modules
  const indModules = [
    {
      id: 1,
      name: "Protocol Template",
      description: "Comprehensive clinical protocol template with statistical sections, safety monitoring, and dosing schemas.",
      components: 18,
      pageCount: 85,
      lastUpdated: "April 12, 2024"
    },
    {
      id: 2,
      name: "CMC Documentation",
      description: "Chemistry, manufacturing, and controls documentation templates with compliant formatting and structure.",
      components: 24,
      pageCount: 120,
      lastUpdated: "March 30, 2024"
    },
    {
      id: 3,
      name: "Investigator's Brochure",
      description: "Standardized IB template with clinical and non-clinical data presentation frameworks.",
      components: 15,
      pageCount: 65,
      lastUpdated: "April 5, 2024"
    },
    {
      id: 4,
      name: "FDA Forms Package",
      description: "Complete set of FDA forms (1571, 1572, 3674, etc.) with guidance on proper completion.",
      components: 8,
      pageCount: 32,
      lastUpdated: "April 8, 2024"
    },
    {
      id: 5,
      name: "Cover Letter Templates",
      description: "Industry-standard cover letter templates for initial submissions, amendments, and responses to information requests.",
      components: 12,
      pageCount: 24,
      lastUpdated: "April 15, 2024"
    },
    {
      id: 6,
      name: "Response to Clinical Hold",
      description: "Templates and frameworks for responding to various types of clinical holds with example remediation plans.",
      components: 10,
      pageCount: 45,
      lastUpdated: "March 25, 2024"
    }
  ];
  
  // Sample IND requirements checklist
  const indRequirements = [
    { id: 1, name: "Form FDA 1571", category: "Administrative", completed: true },
    { id: 2, name: "Table of Contents", category: "Administrative", completed: true },
    { id: 3, name: "Introductory Statement", category: "Administrative", completed: false },
    { id: 4, name: "General Investigational Plan", category: "Administrative", completed: false },
    { id: 5, name: "Investigator's Brochure", category: "Clinical", completed: true },
    { id: 6, name: "Clinical Protocol", category: "Clinical", completed: true },
    { id: 7, name: "Chemistry, Manufacturing and Control Information", category: "CMC", completed: false },
    { id: 8, name: "Pharmacology and Toxicology Information", category: "Nonclinical", completed: true },
    { id: 9, name: "Previous Human Experience", category: "Clinical", completed: false },
    { id: 10, name: "Additional Information", category: "Supplementary", completed: false },
    { id: 11, name: "Biosimilarity Assessment (if applicable)", category: "Biosimilar", completed: false },
    { id: 12, name: "Environmental Assessment or Categorical Exclusion", category: "Administrative", completed: true }
  ];
  
  // Function to generate tag content based on module names
  const renderModuleTags = (modules) => {
    return modules.map((module, index) => (
      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
        {module}
      </span>
    ));
  };
  
  // Function to render a template card
  const TemplateCard = ({ template }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Specialization: {template.specialization}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Updated: {template.lastUpdated}</div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
        <div className="mb-4">
          {renderModuleTags(template.modules)}
        </div>
        <div className="flex justify-between items-center">
          <Link to={`/ind-full-solution/template/${template.id}`}>
            <button className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View Package Details
              <ChevronRight size={16} className="ml-1" />
            </button>
          </Link>
          <Link to={`/ind-full-solution/download/${template.id}`}>
            <button className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded text-sm">
              Download Package
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
  
  // Function to render a module card
  const ModuleCard = ({ module }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
          </div>
          <div className="text-xs text-gray-500">Updated: {module.lastUpdated}</div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 mb-4">{module.description}</p>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div>Components: {module.components}</div>
          <div>Pages: {module.pageCount}</div>
        </div>
        <div className="flex justify-between items-center">
          <Link to={`/ind-full-solution/module/${module.id}`}>
            <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
              View Module Details
              <ChevronRight size={16} className="ml-1" />
            </button>
          </Link>
          <Link to={`/ind-full-solution/download-module/${module.id}`}>
            <button className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm">
              Download Module
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-700 text-white mr-4">
              <FileSymlink size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">IND Full Solution Package</h1>
          </div>
          <p className="text-indigo-100 max-w-3xl">
            Comprehensive IND templates, modules, and checklists designed to streamline your regulatory submissions
            with industry-standard formatting and content structured for FDA compliance.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key features section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Check className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">FDA-Compliant Structure</h3>
              </div>
              <p className="text-gray-600">Pre-formatted templates following current FDA IND guidelines and expectations for seamless submission.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Indication-Specific Content</h3>
              </div>
              <p className="text-gray-600">Specialized packages tailored to different therapeutic areas with appropriate safety considerations and study designs.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <FilePlus className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Modular Flexibility</h3>
              </div>
              <p className="text-gray-600">Download complete packages or individual modules to suit your specific regulatory submission needs.</p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('ind-templates')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ind-templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } mr-8`}
            >
              <Package size={16} className="mr-2" />
              IND Full Packages
            </button>
            <button
              onClick={() => setActiveTab('ind-modules')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ind-modules'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } mr-8`}
            >
              <FileText size={16} className="mr-2" />
              Individual Modules
            </button>
            <button
              onClick={() => setActiveTab('ind-checklist')}
              className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ind-checklist'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle size={16} className="mr-2" />
              IND Requirements Checklist
            </button>
          </nav>
        </div>
        
        {/* Content Section */}
        <div className="mb-12">
          {activeTab === 'ind-templates' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Complete IND Solution Packages</h2>
                <div className="text-sm text-gray-500">Showing {indTemplates.length} packages</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {indTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </>
          )}
          
          {activeTab === 'ind-modules' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Individual IND Modules</h2>
                <div className="text-sm text-gray-500">Showing {indModules.length} modules</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {indModules.map(module => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </>
          )}
          
          {activeTab === 'ind-checklist' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">IND Requirements Checklist</h2>
                <div className="text-sm text-gray-500">Showing {indRequirements.length} requirements</div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indRequirements.map((requirement) => (
                      <tr key={requirement.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full ${
                            requirement.completed ? 'bg-green-100' : 'bg-amber-100'
                          }`}>
                            {requirement.completed ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {requirement.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {requirement.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-indigo-600 hover:text-indigo-900">View Template</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        
        {/* Action Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-gray-900 mb-1">Need Customized IND Support?</h3>
              <p className="text-gray-600">Our regulatory experts can help tailor an IND package specific to your indication and development program</p>
            </div>
            <Link to="/contact">
              <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center">
                Request Consultation
                <ChevronRight size={16} className="ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}