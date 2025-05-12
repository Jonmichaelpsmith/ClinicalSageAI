import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

// Mock document structure data
const documentStructure = [
  {
    id: 'module1',
    name: 'Module 1: Administrative Information',
    isExpanded: true,
    sections: [
      { id: 'section1-1', name: 'Section 1.1: Cover Letter', status: '' },
      { id: 'section1-2', name: 'Section 1.2: Table of Contents', status: 'current' }
    ]
  },
  {
    id: 'module2',
    name: 'Module 2: Common Technical Document',
    isExpanded: true,
    sections: [
      { id: 'section2-1', name: 'Section 2.1: CTD Table of Contents', status: '' },
      { id: 'section2-2', name: 'Section 2.2: Introduction', status: '' },
      { id: 'section2-3', name: 'Section 2.3: Quality Overall Summary', status: '' },
      { id: 'section2-5', name: 'Section 2.5: Clinical Overview', status: 'in-review' }
    ]
  },
  {
    id: 'module3',
    name: 'Module 3: Quality',
    isExpanded: true,
    sections: [
      { id: 'section3-2p', name: 'Section 3.2.P: Drug Product', status: '' },
      { id: 'section3-2s', name: 'Section 3.2.S: Drug Substance', status: '' }
    ]
  },
  {
    id: 'module4',
    name: 'Module 4: Nonclinical Study Reports',
    isExpanded: false,
    sections: []
  },
  {
    id: 'module5',
    name: 'Module 5: Clinical Study Reports',
    isExpanded: false,
    sections: []
  }
];

// Mock recent documents
const recentDocuments = [
  { 
    id: 'doc1', 
    name: 'Module 2.5 Clinical Overview', 
    module: 'Module 2', 
    lastEdited: 'Last edited 2 hours ago', 
    status: 'in-progress' 
  },
  { 
    id: 'doc2', 
    name: 'CMC Section 3.2.P', 
    module: 'Module 3', 
    lastEdited: 'Last edited 1 day ago', 
    status: 'draft' 
  },
  { 
    id: 'doc3', 
    name: 'Clinical Overview', 
    module: 'Module 2', 
    lastEdited: 'Last edited 3 days ago', 
    status: 'final'
  }
];

// Mock document templates
const documentTemplates = [
  { 
    id: 'template1', 
    name: 'Clinical Overview Template', 
    module: 'Module 2', 
    lastUpdated: 'Updated 2 months ago',
    fda: true,
    ema: false
  },
  { 
    id: 'template2', 
    name: 'CTD Module 3 Quality Template', 
    module: 'Module 3', 
    lastUpdated: 'Updated 1 month ago',
    fda: true,
    ema: true
  },
  { 
    id: 'template3', 
    name: 'NDA Cover Letter Template', 
    module: 'Module 1', 
    lastUpdated: 'Updated 3 weeks ago',
    fda: true,
    ema: true
  }
];

// Component for status badge
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'final':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!status) return null;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusStyles()}`}>
      {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CoAuthor = () => {
  const [activeSection, setActiveSection] = useState('section2-5');
  
  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Left Sidebar: Document Structure */}
      <div className="w-64 border-r bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Document Structure</h2>
        
        <div className="space-y-4">
          {documentStructure.map(module => (
            <div key={module.id} className="border-b pb-2">
              <div className="font-medium text-sm mb-2">{module.name}</div>
              {module.isExpanded && (
                <div className="space-y-1.5 ml-2">
                  {module.sections.map(section => (
                    <div 
                      key={section.id}
                      className={`flex items-center py-1 text-sm ${activeSection === section.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <svg 
                        className="mr-2 h-4 w-4 text-gray-400"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{section.name}</span>
                      {section.status === 'current' && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Current</span>
                      )}
                      {section.status === 'in-review' && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">In Review</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2">Document Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completeness</span>
                <span>72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Consistency</span>
                <span>86%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Middle Section: Document Editor */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">eCTD Co-Author Module</h1>
            <div className="text-sm text-gray-500">Enterprise Edition | Powered by AI Document Intelligence</div>
          </div>
          <div className="flex space-x-4">
            <button className="text-gray-700 hover:text-gray-900">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hide Navigation
              </span>
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Team Collaboration
              </span>
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Assistant
              </span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* AI-Powered Document Editor */}
          <div className="border rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <h2 className="font-semibold">AI-Powered Document Editor</h2>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Enterprise</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Create and edit regulatory documents with intelligent assistance</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Sign in with Google</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded text-sm">Import</button>
            </div>
          </div>
          
          {/* Document Templates */}
          <div className="border rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="font-semibold">Document Templates</h2>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Enterprise</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Start with pre-approved templates for regulatory documents</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 bg-green-600 text-white rounded text-sm">Create New</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded text-sm">Upload Template</button>
            </div>
          </div>
          
          {/* Validation Dashboard */}
          <div className="border rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="font-semibold">Validation Dashboard</h2>
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Enterprise</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Ensure compliance with regulatory requirements</p>
          </div>
        </div>
        
        {/* Recent Documents */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
          <div className="space-y-3">
            {recentDocuments.map(doc => (
              <div key={doc.id} className="flex items-center p-3 bg-white border rounded-md shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {doc.module} • {doc.lastEdited}
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <button className="text-blue-600 text-sm hover:underline">View All Documents</button>
          </div>
        </div>
        
        {/* Featured Templates */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Featured Templates</h2>
          <div className="space-y-3">
            {documentTemplates.map(template => (
              <div key={template.id} className="flex items-center p-3 bg-white border rounded-md shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{template.name}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {template.module} • {template.lastUpdated}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {template.fda && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">US FDA</span>
                  )}
                  {template.ema && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">EU EMA</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Sidebar: Validation Dashboard */}
      <div className="w-80 border-l bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Validation Dashboard</h2>
        
        <div className="border-b pb-3 mb-4">
          <div className="text-sm font-medium">Module 2.5 Clinical Overview</div>
          <div className="text-xs text-gray-500 mt-1">In Progress</div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Content Completeness</span>
              <span>78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Regulatory Compliance</span>
              <span>92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Reference Validation</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">4 validation issues require attention:</h3>
              <p className="text-xs text-yellow-700 mt-1">
                Missing source citations in section 2.3.4 and incomplete benefit-risk assessment.
              </p>
              <button className="mt-2 text-xs text-purple-700 hover:underline">
                Open Validation Report
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall: 68% complete</span>
            <button className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">
              Export Document
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoAuthor;