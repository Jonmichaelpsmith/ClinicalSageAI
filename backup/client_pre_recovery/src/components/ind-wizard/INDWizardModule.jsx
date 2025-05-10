/**
 * IND Wizard Module Component
 * 
 * This component provides the IND Wizard interface for the TrialSage platform,
 * guiding users through the process of creating and submitting IND applications.
 */

import React, { useState } from 'react';
import { 
  FileInput, 
  CheckCircle, 
  ChevronRight,
  Plus,
  Clock,
  Search,
  FileText,
  FileCheck,
  ClipboardCheck,
  Beaker,
  Users,
  BookOpen,
  Server
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const INDWizardModule = () => {
  const { regulatoryIntelligenceCore } = useIntegration();
  const [activeIND, setActiveIND] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample IND applications (in a real app, would come from API)
  const applications = [
    {
      id: 'ind-001',
      name: 'IND-23456 - XYZ-123',
      drug: 'XYZ-123',
      stage: 'preparation',
      progress: 45,
      createdAt: '2025-03-15T10:00:00Z',
      updatedAt: '2025-04-20T14:30:00Z',
      status: 'in-progress',
      owner: 'John Smith',
      sections: [
        { id: 'cov', name: 'Cover Letter', status: 'completed' },
        { id: 'toc', name: 'Table of Contents', status: 'completed' },
        { id: '1571', name: 'Form FDA 1571', status: 'completed' },
        { id: '1572', name: 'Form FDA 1572', status: 'completed' },
        { id: 'cv', name: 'Investigator CV', status: 'completed' },
        { id: 'protocol', name: 'Protocol', status: 'in-progress' },
        { id: 'pharm-tox', name: 'Pharmacology/Toxicology', status: 'in-progress' },
        { id: 'chem-manuf', name: 'Chemistry, Manufacturing, and Control', status: 'not-started' },
        { id: 'prev-human', name: 'Previous Human Experience', status: 'not-started' },
        { id: 'add-info', name: 'Additional Information', status: 'not-started' }
      ]
    },
    {
      id: 'ind-002',
      name: 'IND-34567 - ABC-456',
      drug: 'ABC-456',
      stage: 'review',
      progress: 75,
      createdAt: '2025-01-10T09:15:00Z',
      updatedAt: '2025-04-18T11:45:00Z',
      status: 'in-progress',
      owner: 'Jane Doe',
      sections: [
        { id: 'cov', name: 'Cover Letter', status: 'completed' },
        { id: 'toc', name: 'Table of Contents', status: 'completed' },
        { id: '1571', name: 'Form FDA 1571', status: 'completed' },
        { id: '1572', name: 'Form FDA 1572', status: 'completed' },
        { id: 'cv', name: 'Investigator CV', status: 'completed' },
        { id: 'protocol', name: 'Protocol', status: 'completed' },
        { id: 'pharm-tox', name: 'Pharmacology/Toxicology', status: 'completed' },
        { id: 'chem-manuf', name: 'Chemistry, Manufacturing, and Control', status: 'in-progress' },
        { id: 'prev-human', name: 'Previous Human Experience', status: 'completed' },
        { id: 'add-info', name: 'Additional Information', status: 'in-progress' }
      ]
    },
    {
      id: 'ind-003',
      name: 'IND-45678 - DEF-789',
      drug: 'DEF-789',
      stage: 'submission',
      progress: 95,
      createdAt: '2024-11-05T13:30:00Z',
      updatedAt: '2025-04-15T16:20:00Z',
      status: 'ready-for-review',
      owner: 'Robert Chen',
      sections: [
        { id: 'cov', name: 'Cover Letter', status: 'completed' },
        { id: 'toc', name: 'Table of Contents', status: 'completed' },
        { id: '1571', name: 'Form FDA 1571', status: 'completed' },
        { id: '1572', name: 'Form FDA 1572', status: 'completed' },
        { id: 'cv', name: 'Investigator CV', status: 'completed' },
        { id: 'protocol', name: 'Protocol', status: 'completed' },
        { id: 'pharm-tox', name: 'Pharmacology/Toxicology', status: 'completed' },
        { id: 'chem-manuf', name: 'Chemistry, Manufacturing, and Control', status: 'completed' },
        { id: 'prev-human', name: 'Previous Human Experience', status: 'completed' },
        { id: 'add-info', name: 'Additional Information', status: 'in-progress' }
      ]
    }
  ];
  
  // Filter applications based on search query
  const filteredApplications = applications.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.drug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle application selection
  const handleSelectApplication = (appId) => {
    // In a real app, this would fetch the application details
    const app = applications.find(a => a.id === appId);
    setActiveIND(app);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'ready-for-review':
        return 'bg-purple-100 text-purple-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render dashboard (application list view)
  const renderDashboard = () => {
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your IND Applications</h2>
            <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New IND Application
            </button>
          </div>
          
          <div className="relative max-w-xs mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow border hover:shadow-md cursor-pointer"
                onClick={() => handleSelectApplication(app.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Owner: {app.owner}</p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(app.status)}`}>
                      {app.status === 'in-progress' ? 'In Progress' : 
                       app.status === 'ready-for-review' ? 'Ready for Review' : 
                       app.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{app.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${app.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(app.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-primary hover:text-primary-dark text-sm">
                      <span>View details</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileInput className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or create a new IND application</p>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Create IND Application
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent FDA Guidance */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent FDA Guidance</h2>
          <div className="bg-white rounded-lg shadow border">
            <div className="divide-y">
              <div className="p-4">
                <h3 className="font-medium text-gray-900">IND Safety Reporting Requirements</h3>
                <p className="text-sm text-gray-500 mt-1">Updated guidance on safety reporting for INDs</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">April 15, 2025</div>
                  <div className="flex items-center text-primary hover:text-primary-dark text-sm">
                    <span>Read more</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Clinical Hold Considerations</h3>
                <p className="text-sm text-gray-500 mt-1">Guidance on clinical hold processes and resolution</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">March 22, 2025</div>
                  <div className="flex items-center text-primary hover:text-primary-dark text-sm">
                    <span>Read more</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">Expanded Access Protocol Updates</h3>
                <p className="text-sm text-gray-500 mt-1">New templates for expanded access protocols</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">March 10, 2025</div>
                  <div className="flex items-center text-primary hover:text-primary-dark text-sm">
                    <span>Read more</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render application details
  const renderApplicationDetails = () => {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setActiveIND(null)}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
            <span>Back to Applications</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium text-gray-900">{activeIND.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(activeIND.createdAt).toLocaleDateString()} | 
                  Owner: {activeIND.owner}
                </p>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(activeIND.status)}`}>
                {activeIND.status === 'in-progress' ? 'In Progress' : 
                 activeIND.status === 'ready-for-review' ? 'Ready for Review' : 
                 activeIND.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overall Progress</span>
                <span>{activeIND.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${activeIND.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">IND Sections</h3>
            <div className="space-y-4">
              {activeIND.sections.map((section) => (
                <div key={section.id} className="border rounded-md overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{section.name}</h4>
                    <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(section.status)}`}>
                      {section.status === 'in-progress' ? 'In Progress' : 
                       section.status === 'not-started' ? 'Not Started' : 
                       section.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="p-4 flex justify-end space-x-2">
                    <button className="py-1 px-3 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                      View
                    </button>
                    <button className="py-1 px-3 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submission Timeline */}
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">Submission Timeline</h3>
          </div>
          <div className="p-4">
            <div className="border-l-2 border-gray-200 ml-4 space-y-6 py-2">
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">Initial Draft Completed</h4>
                  <p className="text-sm text-gray-500 mt-1">April 10, 2025</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">Internal Review</h4>
                  <p className="text-sm text-gray-500 mt-1">In Progress (Due: April 30, 2025)</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">QC Review</h4>
                  <p className="text-sm text-gray-500 mt-1">Scheduled for May 5, 2025</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">Final Submission</h4>
                  <p className="text-sm text-gray-500 mt-1">Target: May 15, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IND Wizard™</h1>
        <p className="text-gray-500 mt-1">
          Streamlined IND application preparation and submission
        </p>
      </div>
      
      {/* Quick Access Icons */}
      {!activeIND && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">New IND</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">Templates</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">Guidance</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <Beaker className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">CMC Tools</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">Investigators</span>
          </button>
          <button className="bg-white rounded-lg shadow p-4 border hover:shadow-md flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <Server className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-700 text-center">eCTD Export</span>
          </button>
        </div>
      )}
      
      {/* Main Content */}
      {activeIND ? renderApplicationDetails() : renderDashboard()}
    </div>
  );
};

export default INDWizardModule;