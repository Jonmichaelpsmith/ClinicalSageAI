/**
 * Dashboard Module Component
 * 
 * This component provides the main dashboard interface for the TrialSage platform,
 * showing an overview of all modules and recent activities.
 */

import React from 'react';
import { Link } from 'wouter';
import { 
  FileInput, 
  FileText, 
  Database, 
  FileSymlink,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useIntegration } from '../integration/ModuleIntegrationLayer';

const DashboardModule = () => {
  const { regulatoryIntelligenceCore } = useIntegration();
  
  // Module cards configuration
  const moduleCards = [
    {
      id: 'ind-wizard',
      name: 'IND Wizard™',
      description: 'Streamlined IND application preparation',
      icon: FileInput,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      path: '/ind-wizard',
      stats: { active: 3, completed: 7 }
    },
    {
      id: 'csr-intelligence',
      name: 'CSR Intelligence™',
      description: 'Automated clinical study report generation',
      icon: FileText,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      path: '/csr-intelligence',
      stats: { active: 5, completed: 12 }
    },
    {
      id: 'trial-vault',
      name: 'TrialSage Vault™',
      description: 'Secure document management with blockchain verification',
      icon: Database,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      path: '/trial-vault',
      stats: { documents: 342, verified: 286 }
    },
    {
      id: 'study-architect',
      name: 'Study Architect™',
      description: 'Intelligent protocol development & optimization',
      icon: FileSymlink,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      path: '/study-architect',
      stats: { active: 4, completed: 9 }
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Regulatory insights & reporting',
      icon: BarChart3,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      path: '/analytics',
      stats: { reports: 18, insights: 45 }
    }
  ];
  
  // Recent activities
  const recentActivities = [
    {
      id: 'activity-1',
      title: 'Protocol XYZ-123 updated',
      timestamp: '2025-04-27T10:23:00Z',
      module: 'study-architect',
      user: 'John Smith',
      status: 'completed',
      icon: CheckCircle
    },
    {
      id: 'activity-2',
      title: 'CSR for Study ABC-456 requires review',
      timestamp: '2025-04-27T09:15:00Z',
      module: 'csr-intelligence',
      user: 'Jane Doe',
      status: 'pending',
      icon: AlertCircle
    },
    {
      id: 'activity-3',
      title: 'Document verification in progress',
      timestamp: '2025-04-27T08:45:00Z',
      module: 'trial-vault',
      user: 'Robert Chen',
      status: 'in-progress',
      icon: Clock
    },
    {
      id: 'activity-4',
      title: 'New FDA guidance detected',
      timestamp: '2025-04-26T17:30:00Z',
      module: 'regulatory-intelligence',
      user: 'AI System',
      status: 'notification',
      icon: AlertCircle
    }
  ];
  
  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'notification':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome to TrialSage™ - Your regulatory compliance platform
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Documents</p>
              <p className="text-xl font-semibold mt-1">152</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-xl font-semibold mt-1">8</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recent Updates</p>
              <p className="text-xl font-semibold mt-1">24</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Regulatory Alerts</p>
              <p className="text-xl font-semibold mt-1">3</p>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleCards.map((module) => (
              <Link key={module.id} href={module.path}>
                <a className="bg-white rounded-lg shadow p-5 border hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full ${module.iconBg} mr-4`}>
                      <module.icon className={`h-6 w-6 ${module.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                      
                      {/* Module-specific stats */}
                      <div className="mt-3">
                        {module.id === 'trial-vault' ? (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="font-medium">{module.stats.documents}</span>
                            <span className="mx-1">documents,</span>
                            <span className="font-medium">{module.stats.verified}</span>
                            <span className="ml-1">verified</span>
                          </div>
                        ) : module.id === 'analytics' ? (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="font-medium">{module.stats.reports}</span>
                            <span className="mx-1">reports,</span>
                            <span className="font-medium">{module.stats.insights}</span>
                            <span className="ml-1">insights</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="font-medium">{module.stats.active}</span>
                            <span className="mx-1">active,</span>
                            <span className="font-medium">{module.stats.completed}</span>
                            <span className="ml-1">completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h3 className="font-medium">Activity Feed</h3>
            </div>
            <div className="divide-y">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full ${getStatusColorClass(activity.status)} mr-3`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {activity.user} &middot; {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Link href="/activities">
                <a className="text-sm text-primary hover:text-primary-dark flex items-center justify-center">
                  <span>View all activity</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>
          
          {/* Regulatory Updates */}
          <h2 className="text-lg font-medium text-gray-900 mt-6 mb-4">Regulatory Updates</h2>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <p className="text-sm font-medium text-gray-900">FDA Guidance Update</p>
                  <p className="text-xs text-gray-500 mt-1">New guidance for Oncology trials published</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-3 py-1">
                  <p className="text-sm font-medium text-gray-900">EMA Protocol Requirements</p>
                  <p className="text-xs text-gray-500 mt-1">Updated pediatric study requirements</p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-3 py-1">
                  <p className="text-sm font-medium text-gray-900">ICH E6(R3) Update</p>
                  <p className="text-xs text-gray-500 mt-1">Implementation timeline extended</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <Link href="/regulatory-updates">
                <a className="text-sm text-primary hover:text-primary-dark flex items-center justify-center">
                  <span>View all updates</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;