import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import Layout from '../components/Layout';
import { 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  PieChart, 
  Layers, 
  Flask, 
  Brain, 
  LineChart, 
  BarChart2, 
  HelpCircle
} from 'lucide-react';

const ClientPortal = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Hardcoded solutions for demo purposes
  const subscribedSolutions = [
    {
      id: 1,
      name: "IND Wizard",
      description: "Automate IND application creation",
      icon: <Flask className="h-6 w-6" />,
      status: "active",
      route: "/solutions/ind-wizard",
      stats: { completedDocs: 12, inProgress: 3 }
    },
    {
      id: 2,
      name: "CSR Deep Intelligence",
      description: "Advanced clinical study report analytics",
      icon: <Brain className="h-6 w-6" />,
      status: "active",
      route: "/solutions/csr-intelligence",
      stats: { analyzedReports: 28, insights: 142 }
    },
    {
      id: 3,
      name: "CMC Insights",
      description: "Chemistry, Manufacturing & Controls management",
      icon: <Flask className="h-6 w-6" />,
      status: "active",
      route: "/solutions/cmc-insights",
      stats: { activePlans: 5, validations: 17 }
    },
    {
      id: 4,
      name: "Ask Lumen",
      description: "AI regulatory compliance assistant",
      icon: <HelpCircle className="h-6 w-6" />,
      status: "active",
      route: "/solutions/ask-lumen",
      stats: { queries: 64, avgResponseTime: "1.2s" }
    },
    {
      id: 5,
      name: "Protocol Optimization",
      description: "Clinical protocol design and optimization",
      icon: <LineChart className="h-6 w-6" />,
      status: "active",
      route: "/solutions/protocol-optimization",
      stats: { optimizedProtocols: 8, improvements: 32 }
    },
    {
      id: 6,
      name: "Validation Hub",
      description: "21 CFR Part 11 compliance validation",
      icon: <CheckCircle className="h-6 w-6" />,
      status: "active",
      route: "/validation-hub-enhanced",
      stats: { validations: 23, compliance: "98%" }
    }
  ];

  // Recent activities for the activity feed
  const recentActivities = [
    { id: 1, type: 'document', title: 'IND Application 2025-04R', action: 'modified', time: '2 hours ago' },
    { id: 2, type: 'validation', title: 'Protocol 23B Validation', action: 'completed', time: '3 hours ago' },
    { id: 3, type: 'analytics', title: 'CSR Performance Report', action: 'generated', time: '5 hours ago' },
    { id: 4, type: 'document', title: 'CMC Strategy Document', action: 'created', time: '1 day ago' },
    { id: 5, type: 'validation', title: 'Regulatory Compliance Check', action: 'passed', time: '2 days ago' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'validation': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'analytics': return <PieChart className="h-5 w-5 text-purple-500" />;
      default: return <Layers className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatDisplay = (solution) => {
    const stats = solution.stats;
    
    if (stats.completedDocs !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Completed:</span> 
            <span className="ml-1 font-medium">{stats.completedDocs}</span>
          </div>
          <div>
            <span className="text-gray-500">In Progress:</span> 
            <span className="ml-1 font-medium">{stats.inProgress}</span>
          </div>
        </div>
      );
    }
    
    if (stats.analyzedReports !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Reports:</span> 
            <span className="ml-1 font-medium">{stats.analyzedReports}</span>
          </div>
          <div>
            <span className="text-gray-500">Insights:</span> 
            <span className="ml-1 font-medium">{stats.insights}</span>
          </div>
        </div>
      );
    }
    
    if (stats.activePlans !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Active Plans:</span> 
            <span className="ml-1 font-medium">{stats.activePlans}</span>
          </div>
          <div>
            <span className="text-gray-500">Validations:</span> 
            <span className="ml-1 font-medium">{stats.validations}</span>
          </div>
        </div>
      );
    }
    
    if (stats.queries !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Queries:</span> 
            <span className="ml-1 font-medium">{stats.queries}</span>
          </div>
          <div>
            <span className="text-gray-500">Response Time:</span> 
            <span className="ml-1 font-medium">{stats.avgResponseTime}</span>
          </div>
        </div>
      );
    }
    
    if (stats.optimizedProtocols !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Protocols:</span> 
            <span className="ml-1 font-medium">{stats.optimizedProtocols}</span>
          </div>
          <div>
            <span className="text-gray-500">Improvements:</span> 
            <span className="ml-1 font-medium">{stats.improvements}</span>
          </div>
        </div>
      );
    }
    
    if (stats.validations !== undefined) {
      return (
        <div className="flex items-center text-sm">
          <div className="mr-4">
            <span className="text-gray-500">Validations:</span> 
            <span className="ml-1 font-medium">{stats.validations}</span>
          </div>
          <div>
            <span className="text-gray-500">Compliance:</span> 
            <span className="ml-1 font-medium">{stats.compliance}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || 'Valued Customer'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your TrialSage Solutions</h2>
                <button 
                  onClick={() => setLocation('/account/subscribed-solutions')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscribedSolutions.slice(0, 4).map(solution => (
                  <div 
                    key={solution.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => setLocation(solution.route)}
                  >
                    <div className="flex items-start">
                      <div className="p-2 rounded-full bg-blue-50 mr-4">
                        {solution.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-md font-semibold text-gray-900">{solution.name}</h3>
                          <div className="flex items-center text-sm font-medium text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Active
                          </div>
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600 mb-2">
                          {solution.description}
                        </p>
                        
                        {getStatDisplay(solution)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={() => setLocation('/account/subscribed-solutions')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800 mt-2"
                >
                  See More Solutions
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Quick Analytics</h2>
                <button 
                  onClick={() => setLocation('/analytics-dashboard')}
                  className="text-blue-600 text-sm flex items-center hover:text-blue-800"
                >
                  View Complete Analytics
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Documents</p>
                      <p className="text-2xl font-bold text-gray-900">127</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mt-2 text-sm text-blue-600">+12% from last month</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Validations</p>
                      <p className="text-2xl font-bold text-gray-900">48</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2 text-sm text-green-600">98% compliance rate</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">AI Insights</p>
                      <p className="text-2xl font-bold text-gray-900">256</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-2 text-sm text-purple-600">42 critical findings</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Feed</h2>
              
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="mt-1 mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        <span className="capitalize">{activity.action}</span> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setLocation('/activity-history')}
                className="mt-4 w-full py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex justify-center items-center"
              >
                View All Activity
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Support Resources</h2>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setLocation('/ask-lumen')}
                  className="w-full py-2 px-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex justify-between items-center"
                >
                  <span className="font-medium">Ask Lumen AI Assistant</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/documentation')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Documentation</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/training')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Training Videos</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => setLocation('/contact-support')}
                  className="w-full py-2 px-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <span>Contact Support</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientPortal;