// ClientPortal.jsx - Secure client access portal for demo and example management
import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Shield, 
  User, 
  FileText, 
  BarChart2, 
  Clock, 
  Check, 
  Settings,
  Search,
  Download,
  Filter,
  ChevronRight,
  FileSymlink,
  Sparkles,
  Bot,
  Eye,
  Bell,
  Calendar,
  Clipboard,
  FileSearch
} from 'lucide-react';
import SemanticSearchBar from '@/components/search/SemanticSearchBar';
import SemanticSearchResults from '@/components/search/SemanticSearchResults';
import { semanticSearch } from '@/services/SemanticSearchService';

const ClientPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Handle semantic search
  const handleSearch = async (searchParams) => {
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const results = await semanticSearch(
        searchParams.query, 
        searchParams.filters, 
        searchParams.searchMode
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing semantic search:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle document selection
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    console.log('Selected document:', document);
  };
  
  // Mock client projects
  const clientProjects = [
    {
      id: 'lum-1024',
      name: 'Lumentrial Phase 2 Oncology',
      status: 'Active',
      progress: 78,
      lastUpdate: '2h ago',
      documents: 24,
      reviewStatus: 'In Review',
      priority: 'High',
      dueDate: 'Apr 25, 2025'
    },
    {
      id: 'bio-9872',
      name: 'BioGenesis IND Submission',
      status: 'Active',
      progress: 92,
      lastUpdate: '6h ago',
      documents: 46,
      reviewStatus: 'Approved',
      priority: 'Urgent',
      dueDate: 'Apr 29, 2025'
    },
    {
      id: 'phx-534',
      name: 'Phoenix Therapeutics NDA',
      status: 'Pending',
      progress: 64,
      lastUpdate: '1d ago',
      documents: 78,
      reviewStatus: 'Needs Changes',
      priority: 'Medium',
      dueDate: 'May 12, 2025'
    },
    {
      id: 'cel-4523',
      name: 'Celeste Bio Device Approval',
      status: 'Active',
      progress: 45,
      lastUpdate: '4h ago',
      documents: 32,
      reviewStatus: 'In Review',
      priority: 'Medium',
      dueDate: 'May 8, 2025'
    }
  ];
  
  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Document Updated',
      project: 'Lumentrial Phase 2',
      user: 'Sarah Johnson',
      time: '2 hours ago',
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    {
      id: 2,
      action: 'Comment Added',
      project: 'BioGenesis IND',
      user: 'Michael Chen',
      time: '5 hours ago',
      icon: <Clipboard className="h-4 w-4 text-indigo-500" />
    },
    {
      id: 3,
      action: 'Meeting Scheduled',
      project: 'Phoenix Therapeutics',
      user: 'Jessica Rodriguez',
      time: '1 day ago',
      icon: <Calendar className="h-4 w-4 text-emerald-500" />
    },
    {
      id: 4,
      action: 'Review Complete',
      project: 'Celeste Bio',
      user: 'David Wilson',
      time: '2 days ago',
      icon: <Check className="h-4 w-4 text-green-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/ind/wizard">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xl">TS</div>
                  </div>
                  <div className="hidden md:block ml-3">
                    <div className="flex items-baseline">
                      <span className="text-gray-900 font-bold text-xl">TrialSage</span>
                      <span className="text-gray-500 ml-2 text-sm">IND Wizard</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                <Bell size={20} />
              </button>
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                <Settings size={20} />
              </button>
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 cursor-pointer">
                  <User size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Demo Client</h2>
                  <p className="text-sm text-gray-500">Enterprise Tier</p>
                </div>
                <nav className="px-3 py-4">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('dashboard')} 
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'dashboard' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart2 className="mr-3 h-5 w-5" />
                      Dashboard
                    </button>
                    <button 
                      onClick={() => setActiveTab('projects')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'projects' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileSymlink className="mr-3 h-5 w-5" />
                      Projects
                    </button>
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'documents' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      Documents
                    </button>
                    <button 
                      onClick={() => setActiveTab('ai')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'ai' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bot className="mr-3 h-5 w-5" />
                      AI Assistant
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                        activeTab === 'analytics' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <BarChart2 className="mr-3 h-5 w-5" />
                      Analytics
                    </button>
                  </div>
                </nav>
                <div className="px-6 py-4 border-t border-gray-200">
                  <Link to="/ind/wizard">
                    <button className="flex items-center w-full px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-md text-indigo-700 text-sm font-medium transition-colors">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Open IND Wizard
                    </button>
                  </Link>
                  <div className="mt-4 text-xs text-gray-500">Need help? Contact support@concept2cures.ai</div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="flex-1">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Overview</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-700">Active Projects</p>
                              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                              <FileSymlink className="h-6 w-6 text-blue-700" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-700">Completed Reviews</p>
                              <p className="text-2xl font-bold text-gray-900 mt-1">14</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                              <Check className="h-6 w-6 text-green-700" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-700">Documents</p>
                              <p className="text-2xl font-bold text-gray-900 mt-1">182</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                              <FileText className="h-6 w-6 text-purple-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Projects</h2>
                        <div className="flex space-x-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search projects..."
                              className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">View</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clientProjects.map((project) => (
                            <tr key={project.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                    <div className="text-sm text-gray-500">{project.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  project.status === 'Active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{project.progress}% complete</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.dueDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {project.documents}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {activity.icon}
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                                <div className="text-xs text-gray-500">{activity.time}</div>
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">{activity.user}</span> on {activity.project}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                        View all activity
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'projects' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">All Projects</h2>
                  <p className="text-gray-600 mb-4">This is the projects tab content. You can expand this with more detailed project management functionality.</p>
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-baseline mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Document Library</h2>
                        <div className="flex items-center text-sm text-blue-600">
                          <FileSearch className="w-4 h-4 mr-1" />
                          <span>Semantic search enabled</span>
                        </div>
                      </div>
                      
                      {/* Semantic Search Component */}
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                          <SemanticSearchBar 
                            onSearch={handleSearch}
                            placeholder="Search across all documents with natural language..."
                          />
                          <div className="text-xs text-blue-600 mt-2">
                            Try searching for concepts like "efficacy endpoints in oncology" or "adverse events in phase 2 trials"
                          </div>
                        </div>
                        
                        {/* Search Results Section */}
                        {showSearchResults && (
                          <div className="border border-gray-200 rounded-md mb-6">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                              <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                              <button 
                                onClick={() => setShowSearchResults(false)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Back to all documents
                              </button>
                            </div>
                            <div className="p-4">
                              <SemanticSearchResults 
                                results={searchResults}
                                isLoading={isSearching}
                                onSelectDocument={handleSelectDocument}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Document Table - Only shown when not viewing search results */}
                      {!showSearchResults && (
                        <div className="overflow-x-auto">
                          <div className="flex justify-between items-center mb-4">
                            <div className="relative w-64">
                              <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                              <input 
                                type="search" 
                                className="block w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Filter documents..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded text-gray-700 flex items-center">
                                <Filter className="h-3 w-3 mr-1" />
                                Filter
                              </button>
                              <button className="px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 rounded text-blue-700 flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </button>
                            </div>
                          </div>
                          
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-700">
                                      <FileText size={16} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">Clinical Study Protocol v2.1</div>
                                      <div className="text-sm text-gray-500">12MB</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Protocol</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Lumentrial Phase 2</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Apr 19, 2025</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Approved
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 space-x-2">
                                  <button className="hover:text-indigo-700">View</button>
                                  <button className="hover:text-indigo-700">Download</button>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-700">
                                      <FileText size={16} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">Statistical Analysis Plan</div>
                                      <div className="text-sm text-gray-500">8MB</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Report</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Lumentrial Phase 2</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Apr 10, 2025</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    In Review
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 space-x-2">
                                  <button className="hover:text-indigo-700">View</button>
                                  <button className="hover:text-indigo-700">Download</button>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-700">
                                      <FileText size={16} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">Interim Results Report</div>
                                      <div className="text-sm text-gray-500">15MB</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Results</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">BioGenesis IND</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Apr 15, 2025</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Draft
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 space-x-2">
                                  <button className="hover:text-indigo-700">View</button>
                                  <button className="hover:text-indigo-700">Download</button>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 bg-rose-100 rounded-md flex items-center justify-center text-rose-700">
                                      <FileText size={16} />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">FDA Response Letter</div>
                                      <div className="text-sm text-gray-500">2MB</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Correspondence</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Phoenix Therapeutics</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">Apr 5, 2025</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Urgent
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 space-x-2">
                                  <button className="hover:text-indigo-700">View</button>
                                  <button className="hover:text-indigo-700">Download</button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'ai' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">AI Assistant</h2>
                  <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Bot size={48} className="mx-auto text-indigo-500 mb-4" />
                      <p className="text-gray-700 mb-4">Launch our AI Co-pilot for intelligent assistance with your regulatory documents.</p>
                      <Link to="/ind/wizard">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                          Open IND Wizard
                          <ChevronRight size={16} className="ml-2" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h2>
                  <p className="text-gray-600 mb-4">This is the analytics tab content. You can expand this with charts and data visualization.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-sm">TS</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">&copy; 2025 Concept2Cures.AI. All rights reserved.</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;