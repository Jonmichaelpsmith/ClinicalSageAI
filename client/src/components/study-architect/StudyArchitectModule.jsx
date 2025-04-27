/**
 * Study Architect Module Component
 * 
 * This component provides the Study Architect interface for the TrialSage platform,
 * helping users create and optimize clinical trial protocols.
 */

import React, { useState } from 'react';
import { 
  FileSymlink, 
  Search, 
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  FlaskConical,
  LineChart,
  Calendar,
  Layers,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Pencil
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const StudyArchitectModule = () => {
  const { regulatoryIntelligenceCore } = useIntegration();
  const [activeView, setActiveView] = useState('dashboard');
  const [activeProtocol, setActiveProtocol] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample protocols (in a real app, would come from API)
  const protocols = [
    {
      id: 'protocol-001',
      name: 'Study Protocol XYZ-123-P1',
      studyId: 'XYZ-123-P1',
      therapeutic: 'Oncology',
      phase: 'Phase 1',
      status: 'in-progress',
      progress: 65,
      createdAt: '2025-03-15T10:00:00Z',
      updatedAt: '2025-04-21T14:30:00Z',
      dueDate: '2025-05-30T00:00:00Z',
      author: 'John Smith',
      aiOptimized: true
    },
    {
      id: 'protocol-002',
      name: 'Study Protocol ABC-456-P2',
      studyId: 'ABC-456-P2',
      therapeutic: 'Neurology',
      phase: 'Phase 2',
      status: 'review',
      progress: 90,
      createdAt: '2025-02-10T09:15:00Z',
      updatedAt: '2025-04-18T11:45:00Z',
      dueDate: '2025-05-10T00:00:00Z',
      author: 'Jane Doe',
      aiOptimized: true
    },
    {
      id: 'protocol-003',
      name: 'Study Protocol DEF-789-P3',
      studyId: 'DEF-789-P3',
      therapeutic: 'Cardiology',
      phase: 'Phase 3',
      status: 'completed',
      progress: 100,
      createdAt: '2025-01-05T13:30:00Z',
      updatedAt: '2025-03-30T16:45:00Z',
      dueDate: '2025-03-31T00:00:00Z',
      author: 'Robert Chen',
      aiOptimized: false
    }
  ];
  
  // Protocol templates
  const protocolTemplates = [
    {
      id: 'template-001',
      name: 'Phase 1 Oncology',
      description: 'Standard template for Phase 1 oncology trials',
      therapeutic: 'Oncology',
      phase: 'Phase 1',
      lastUpdated: '2025-04-01T10:00:00Z',
      sections: 15,
      icon: 'oncology'
    },
    {
      id: 'template-002',
      name: 'Phase 2 Neurology',
      description: 'Comprehensive protocol for Phase 2 neurology studies',
      therapeutic: 'Neurology',
      phase: 'Phase 2',
      lastUpdated: '2025-03-15T10:00:00Z',
      sections: 18,
      icon: 'neurology'
    },
    {
      id: 'template-003',
      name: 'Phase 3 Cardiology',
      description: 'Pivotal trial template for Phase 3 cardiology studies',
      therapeutic: 'Cardiology',
      phase: 'Phase 3',
      lastUpdated: '2025-02-20T10:00:00Z',
      sections: 22,
      icon: 'cardiology'
    }
  ];
  
  // Protocol recommendations
  const protocolRecommendations = [
    {
      id: 'rec-001',
      protocolId: 'protocol-001',
      title: 'Inclusion Criteria Optimization',
      description: 'AI analysis suggests broadening inclusion criteria to improve enrollment rates',
      category: 'enrollment',
      impact: 'high',
      source: 'ai'
    },
    {
      id: 'rec-002',
      protocolId: 'protocol-001',
      title: 'Statistical Power Adjustment',
      description: 'Based on latest research, sample size can be reduced while maintaining statistical power',
      category: 'statistics',
      impact: 'medium',
      source: 'ai'
    },
    {
      id: 'rec-003',
      protocolId: 'protocol-002',
      title: 'Endpoint Alignment with FDA Guidance',
      description: 'Recent FDA guidance suggests adjusting secondary endpoints for improved regulatory acceptance',
      category: 'regulatory',
      impact: 'high',
      source: 'regulatory'
    }
  ];
  
  // Filter protocols based on search query
  const filteredProtocols = protocols.filter(protocol => 
    protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    protocol.studyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    protocol.therapeutic.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Get protocol's relevant recommendations
  const getProtocolRecommendations = (protocolId) => {
    return protocolRecommendations.filter(rec => rec.protocolId === protocolId);
  };
  
  // Handle protocol selection
  const handleSelectProtocol = (protocol) => {
    setActiveProtocol(protocol);
    setActiveView('protocol');
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get impact badge color
  const getImpactBadgeClass = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render dashboard view
  const renderDashboard = () => {
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Protocol Projects</h2>
            <button className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New Protocol
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
                placeholder="Search protocols..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((protocol) => (
              <div
                key={protocol.id}
                className="bg-white rounded-lg shadow border hover:shadow-md cursor-pointer"
                onClick={() => handleSelectProtocol(protocol)}
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{protocol.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {protocol.therapeutic}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {protocol.phase}
                        </span>
                        {protocol.aiOptimized && (
                          <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Optimized
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(protocol.status)}`}>
                      {protocol.status === 'in-progress' ? 'In Progress' : 
                       protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1)}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{protocol.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${protocol.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {protocol.status !== 'completed' && (
                    <div className="mb-3 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Due in <span className={`font-medium ${
                          getDaysRemaining(protocol.dueDate) < 14 ? 'text-red-600' : 'text-gray-700'
                        }`}>{getDaysRemaining(protocol.dueDate)}</span> days
                      </span>
                    </div>
                  )}
                  
                  {getProtocolRecommendations(protocol.id).length > 0 && (
                    <div className="mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 text-indigo-500 mr-1" />
                      <span className="text-xs text-gray-500">
                        <span className="font-medium text-indigo-600">
                          {getProtocolRecommendations(protocol.id).length}
                        </span> optimization suggestions
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(protocol.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-primary hover:text-primary-dark text-sm">
                      <span>View protocol</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Create new protocol card */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">New Protocol</h3>
              <p className="text-sm text-gray-500 text-center">
                Create a new study protocol from scratch or from a template
              </p>
            </div>
          </div>
        </div>
        
        {/* Protocol Templates */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Protocol Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {protocolTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow border p-4 hover:shadow-md cursor-pointer">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-md bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {template.therapeutic}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {template.phase}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Regulatory Intelligence */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Regulatory Intelligence</h2>
            <div className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </div>
          </div>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h3 className="font-medium">Recent Regulatory Updates</h3>
            </div>
            <div className="divide-y">
              <div className="p-4 flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">FDA Guidance Updates</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    New guidance on adaptive trial designs published April 15, 2025
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      Review Impact Analysis
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
                  <h4 className="font-medium text-gray-900">EMA Protocol Requirements</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Updated requirements for safety monitoring in Phase 2 trials
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View Details
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
                  <h4 className="font-medium text-gray-900">ICH Guidelines Update</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    ICH E6(R3) implementation timeline and transition period announced
                  </p>
                  <div className="mt-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      Read Summary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render protocol view
  const renderProtocolView = () => {
    if (!activeProtocol) return null;
    
    const recommendations = getProtocolRecommendations(activeProtocol.id);
    
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => { setActiveView('dashboard'); setActiveProtocol(null); }}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <ChevronRight className="h-4 w-4 mr-1 transform rotate-180" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-medium text-gray-900">{activeProtocol.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {activeProtocol.therapeutic}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {activeProtocol.phase}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {activeProtocol.studyId}
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(activeProtocol.status)}`}>
                {activeProtocol.status === 'in-progress' ? 'In Progress' : 
                 activeProtocol.status.charAt(0).toUpperCase() + activeProtocol.status.slice(1)}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{activeProtocol.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${activeProtocol.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500">Created: </span>
                  <span className="font-medium text-gray-700">
                    {new Date(activeProtocol.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Author: </span>
                  <span className="font-medium text-gray-700">{activeProtocol.author}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Due: </span>
                  <span className={`font-medium ${
                    getDaysRemaining(activeProtocol.dueDate) < 14 ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {new Date(activeProtocol.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  View History
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm rounded-md text-white bg-primary hover:bg-primary-dark">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit Protocol
                </button>
              </div>
            </div>
            
            {/* Protocol Sections Placeholder */}
            <div className="rounded-lg border border-gray-200 mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium">Protocol Sections</h3>
              </div>
              <div className="p-6 text-center">
                <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">This view would display the protocol section editor interface.</p>
                <p className="text-sm text-gray-500 mt-2">Coming soon in the next development iteration.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Optimization Suggestions</h2>
              <div className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border">
              <div className="divide-y">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 flex">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-8 h-8 rounded-full ${
                        rec.category === 'enrollment' ? 'bg-blue-100' : 
                        rec.category === 'statistics' ? 'bg-purple-100' : 
                        rec.category === 'regulatory' ? 'bg-amber-100' : 'bg-gray-100'
                      } flex items-center justify-center`}>
                        {rec.category === 'enrollment' ? 
                          <Users className={`h-4 w-4 text-blue-600`} /> : 
                         rec.category === 'statistics' ? 
                          <LineChart className={`h-4 w-4 text-purple-600`} /> : 
                         rec.category === 'regulatory' ? 
                          <FileText className={`h-4 w-4 text-amber-600`} /> : 
                          <FlaskConical className={`h-4 w-4 text-gray-600`} />
                        }
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getImpactBadgeClass(rec.impact)}`}>
                          {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {rec.description}
                      </p>
                      <div className="mt-2">
                        <button className="text-primary hover:text-primary-dark text-sm font-medium">
                          Apply Suggestion
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Protocol Timeline */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Protocol Timeline</h2>
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="border-l-2 border-gray-200 ml-4 space-y-6 py-2">
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">Protocol Draft Initiated</h4>
                  <p className="text-sm text-gray-500 mt-1">March 15, 2025</p>
                </div>
              </div>
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
                  <h4 className="font-medium text-gray-900">Review Phase</h4>
                  <p className="text-sm text-gray-500 mt-1">In Progress (Due: May 15, 2025)</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-8">
                  <h4 className="font-medium text-gray-900">Final Approval</h4>
                  <p className="text-sm text-gray-500 mt-1">Scheduled for May 30, 2025</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Study Architect™</h1>
        <p className="text-gray-500 mt-1">
          Intelligent protocol development and optimization
        </p>
      </div>
      
      {/* Quick Stats */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Protocols</p>
                <p className="text-xl font-semibold mt-1">8</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <FileSymlink className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Review</p>
                <p className="text-xl font-semibold mt-1">3</p>
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
                <p className="text-xl font-semibold mt-1">24</p>
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
                <p className="text-xl font-semibold mt-1">12</p>
              </div>
              <div className="bg-indigo-100 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {activeView === 'dashboard' ? renderDashboard() : renderProtocolView()}
    </div>
  );
};

export default StudyArchitectModule;