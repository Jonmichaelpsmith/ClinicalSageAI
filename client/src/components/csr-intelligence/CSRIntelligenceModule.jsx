/**
 * CSR Intelligence Module Component
 * 
 * This component provides the Clinical Study Report Intelligence interface
 * for the TrialSage platform, helping users automate and optimize CSR creation.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter,
  Upload,
  Download,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Plus,
  Sparkles
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const CSRIntelligenceModule = () => {
  const { regulatoryIntelligenceCore } = useIntegration();
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample CSR projects (in a real app, would come from API)
  const csrProjects = [
    {
      id: 'csr-001',
      name: 'CSR-XYZ-Phase1',
      studyId: 'ABC-123-P1',
      drug: 'XYZ-123',
      status: 'in-progress',
      progress: 65,
      createdAt: '2025-03-10T09:30:00Z',
      updatedAt: '2025-04-22T15:45:00Z',
      dueDate: '2025-05-15T00:00:00Z',
      author: 'Jane Doe',
      sections: [
        { id: 'title', name: 'Title Page', status: 'completed' },
        { id: 'synopsis', name: 'Synopsis', status: 'completed' },
        { id: 'ethics', name: 'Ethics', status: 'completed' },
        { id: 'investigators', name: 'Investigators', status: 'completed' },
        { id: 'intro', name: 'Introduction', status: 'in-progress' },
        { id: 'objectives', name: 'Study Objectives', status: 'completed' },
        { id: 'methods', name: 'Methods', status: 'in-progress' },
        { id: 'results', name: 'Results', status: 'not-started' },
        { id: 'discussion', name: 'Discussion', status: 'not-started' },
        { id: 'conclusion', name: 'Conclusion', status: 'not-started' },
        { id: 'references', name: 'References', status: 'in-progress' },
        { id: 'appendices', name: 'Appendices', status: 'not-started' }
      ]
    },
    {
      id: 'csr-002',
      name: 'CSR-ABC-Phase2',
      studyId: 'ABC-456-P2',
      drug: 'ABC-456',
      status: 'review',
      progress: 90,
      createdAt: '2025-02-05T11:15:00Z',
      updatedAt: '2025-04-20T10:30:00Z',
      dueDate: '2025-04-30T00:00:00Z',
      author: 'John Smith',
      sections: []
    },
    {
      id: 'csr-003',
      name: 'CSR-DEF-Pivotal',
      studyId: 'DEF-789-P3',
      drug: 'DEF-789',
      status: 'completed',
      progress: 100,
      createdAt: '2025-01-15T14:00:00Z',
      updatedAt: '2025-03-25T16:45:00Z',
      dueDate: '2025-03-31T00:00:00Z',
      author: 'Robert Chen',
      sections: []
    }
  ];
  
  // Filter CSR projects based on search query
  const filteredProjects = csrProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.studyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.drug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-amber-100 text-amber-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Render dashboard view
  const renderDashboard = () => {
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">CSR Projects</h2>
            <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New CSR Project
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow border hover:shadow-md cursor-pointer"
                onClick={() => setActiveView('project')}
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Study ID: {project.studyId}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(project.status)}`}>
                      {project.status === 'in-progress' ? 'In Progress' : 
                       project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Drug: </span>
                      <span className="font-medium text-gray-700">{project.drug}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Author: </span>
                      <span className="font-medium text-gray-700">{project.author}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {project.status !== 'completed' && (
                    <div className="mb-3 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Due in <span className={`font-medium ${
                          getDaysRemaining(project.dueDate) < 7 ? 'text-red-600' : 'text-gray-700'
                        }`}>{getDaysRemaining(project.dueDate)}</span> days
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </button>
                      {project.status !== 'completed' && (
                        <button className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                          <Play className="h-3 w-3 mr-1" />
                          {project.status === 'in-progress' ? 'Continue' : 'Start'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add new CSR project card */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">New CSR Project</h3>
              <p className="text-sm text-gray-500 text-center">
                Create a new Clinical Study Report project
              </p>
            </div>
          </div>
        </div>
        
        {/* AI Assistant Suggestions */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">AI Suggestions</h2>
            <div className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </div>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h3 className="font-medium">CSR Enhancement Recommendations</h3>
            </div>
            <div className="divide-y">
              <div className="p-4 flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Results Section Optimization</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    AI analysis suggests adding additional statistical context to the CSR-XYZ-Phase1 results section.
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      Apply Suggestion
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ICH E3 Compliance Check</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Automated compliance check completed for CSR-ABC-Phase2 with 97% adherence to ICH E3 guidelines.
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View Report
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Data Inconsistency Alert</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Potential data inconsistency detected between tables 4.2 and 6.3 in CSR-XYZ-Phase1.
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      Review Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent CSR Templates */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">CSR Templates & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">ICH E3 Template</h3>
                  <p className="text-sm text-gray-500 mt-1">Standard CSR template following ICH E3 guidelines</p>
                  <button className="mt-2 text-primary hover:text-primary-dark text-sm font-medium">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">FDA Submission Template</h3>
                  <p className="text-sm text-gray-500 mt-1">Optimized for FDA regulatory submissions</p>
                  <button className="mt-2 text-primary hover:text-primary-dark text-sm font-medium">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">EMA Format Template</h3>
                  <p className="text-sm text-gray-500 mt-1">Compliant with European Medicines Agency requirements</p>
                  <button className="mt-2 text-primary hover:text-primary-dark text-sm font-medium">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render project view (placeholder)
  const renderProject = () => {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <Play className="h-4 w-4 mr-1 transform rotate-180" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium text-gray-900">CSR-XYZ-Phase1</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Study ID: ABC-123-P1 | Drug: XYZ-123
                </p>
              </div>
              <div className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                In Progress
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              This view would display the CSR editor and section management interface.
            </p>
            <p className="text-sm text-gray-500">
              Coming soon in the next development iteration.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CSR Intelligence™</h1>
        <p className="text-gray-500 mt-1">
          AI-powered Clinical Study Report automation and optimization
        </p>
      </div>
      
      {/* Quick Stats */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active CSRs</p>
                <p className="text-xl font-semibold mt-1">5</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Due This Month</p>
                <p className="text-xl font-semibold mt-1">2</p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-xl font-semibold mt-1">12</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI Suggestions</p>
                <p className="text-xl font-semibold mt-1">8</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {activeView === 'dashboard' ? renderDashboard() : renderProject()}
    </div>
  );
};

export default CSRIntelligenceModule;