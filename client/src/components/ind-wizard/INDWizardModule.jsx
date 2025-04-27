/**
 * IND Wizard Module Component
 * 
 * This component provides the IND Wizard interface for the TrialSage platform.
 */

import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Filter, 
  Search, 
  Copy, 
  ArrowRight, 
  BarChart4,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const INDWizardModule = () => {
  const { workflowService } = useIntegration();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get active workflows
  const indWorkflows = workflowService.getActiveWorkflows();
  
  // Get IND template
  const indTemplate = workflowService.getWorkflowTemplates().find(
    template => template.name === 'IND Submission Workflow'
  );
  
  // Get tasks for active workflows
  const indTasks = workflowService.getTasks();
  
  // Filter tasks by status
  const pendingTasks = indTasks.filter(task => ['Not Started', 'Pending', 'In Progress'].includes(task.status));
  const completedTasks = indTasks.filter(task => task.status === 'Completed');
  
  // Tabs configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'submissions', label: 'My Submissions' },
    { id: 'forms', label: 'FDA Forms' },
    { id: 'templates', label: 'Templates' },
    { id: 'guidance', label: 'Guidance' }
  ];
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'submissions':
        return renderSubmissions();
      case 'forms':
        return renderForms();
      case 'templates':
        return renderTemplates();
      case 'guidance':
        return renderGuidance();
      default:
        return renderDashboard();
    }
  };
  
  // Dashboard tab content
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Active IND Applications</p>
                <p className="text-2xl font-semibold mt-1">{indWorkflows.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <ArrowRight className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">2 submissions</span>
                <span className="mx-1">planned in the next 30 days</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-semibold mt-1">{pendingTasks.length}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                <span className="text-amber-500 font-medium">1 task</span>
                <span className="mx-1">due in the next 48 hours</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-2xl font-semibold mt-1">{completedTasks.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <BarChart4 className="h-3 w-3 mr-1 text-blue-500" />
                <span>Completion rate: </span>
                <span className="ml-1 text-blue-500 font-medium">
                  {Math.round((completedTasks.length / (pendingTasks.length + completedTasks.length)) * 100) || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active IND submissions */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Active IND Submissions</h3>
            <button className="text-sm text-primary flex items-center">
              <PlusCircle className="h-4 w-4 mr-1" />
              New Submission
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between mb-4">
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <button className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IND Application
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {indWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{workflow.name}</div>
                            <div className="text-xs text-gray-500">Started: {new Date(workflow.startedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workflow.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : workflow.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : workflow.status === 'Not Started'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}>
                          {workflow.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${workflow.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{workflow.progress}% Complete</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(workflow.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {workflow.assignedTo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary-dark mr-3">View</button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Copy className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {indWorkflows.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No active submissions</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first IND submission</p>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Create IND Submission
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent tasks */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-medium">Recent Tasks</h3>
          </div>
          
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {indTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="py-4 flex items-start">
                  <div className={`flex-shrink-0 rounded-full p-2 mr-3 ${
                    task.status === 'Completed'
                      ? 'bg-green-100 text-green-600'
                      : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-amber-100 text-amber-600'
                  }`}>
                    {task.status === 'Completed' 
                      ? <CheckCircle className="h-5 w-5" /> 
                      : <Clock className="h-5 w-5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{task.name}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    <div className="mt-2 flex items-center text-xs">
                      <span className="text-gray-500 mr-2">Assigned to:</span>
                      <span className="font-medium">{task.assignedTo}</span>
                      <span className={`ml-3 px-2 py-0.5 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`ml-3 px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {indTasks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks available</p>
              </div>
            )}
            
            {indTasks.length > 0 && (
              <div className="mt-4 text-center">
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  View All Tasks
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Submissions tab content
  const renderSubmissions = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">My IND Submissions</h3>
        <p className="text-gray-500">This tab will list all your IND submissions.</p>
      </div>
    );
  };
  
  // FDA Forms tab content
  const renderForms = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">FDA Forms Library</h3>
        <p className="text-gray-500">This tab will provide access to FDA forms like 1571, 1572, etc.</p>
      </div>
    );
  };
  
  // Templates tab content
  const renderTemplates = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">IND Templates</h3>
        <p className="text-gray-500">This tab will provide IND application templates.</p>
      </div>
    );
  };
  
  // Guidance tab content
  const renderGuidance = () => {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium mb-4">Regulatory Guidance</h3>
        <p className="text-gray-500">This tab will provide FDA guidance documents related to INDs.</p>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IND Wizard™</h1>
        <p className="text-gray-500 mt-1">
          Streamline your Investigational New Drug application process
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default INDWizardModule;