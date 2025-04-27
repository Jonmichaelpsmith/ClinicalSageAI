import React from 'react';
import { Link } from 'wouter';
import { 
  Clock, 
  BarChart3, 
  FileText, 
  Database, 
  Layers, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg p-5 shadow-sm border border-gray-100 ${className}`}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const DashboardModule = () => {
  const { user } = useAuth();
  
  // Mock recent activity data
  const recentActivity = [
    { id: 1, description: 'CSR uploaded for Study XYZ-123', time: '2 hours ago', module: 'Vault', icon: FileText },
    { id: 2, description: 'IND application draft completed', time: '5 hours ago', module: 'IND Wizard', icon: CheckCircle },
    { id: 3, description: 'Protocol amendment submitted', time: '1 day ago', module: 'Study Architect', icon: Layers },
    { id: 4, description: 'New trial data imported', time: '2 days ago', module: 'Vault', icon: Database }
  ];
  
  // Mock tasks data
  const tasks = [
    { id: 1, title: 'Review CSR draft for Study ABC-789', dueDate: 'Today', priority: 'high' },
    { id: 2, title: 'Update regulatory contacts in CMDR', dueDate: 'Tomorrow', priority: 'medium' },
    { id: 3, title: 'Complete ICH Q10 compliance check', dueDate: 'Oct 30, 2025', priority: 'medium' },
    { id: 4, title: 'Review protocol amendments', dueDate: 'Nov 5, 2025', priority: 'low' }
  ];

  // Mock notifications
  const notifications = [
    { id: 1, message: 'CSR review requested by John Smith', time: '1 hour ago', type: 'request' },
    { id: 2, message: 'IND submission deadline approaching', time: '3 hours ago', type: 'warning' },
    { id: 3, message: 'New ICH guidance published', time: '1 day ago', type: 'info' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Quick Stats" className="col-span-full md:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <div className="flex items-center">
                <Database className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm">Documents in Vault</span>
              </div>
              <span className="font-semibold">458</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-md">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-pink-600 mr-2" />
                <span className="text-sm">CSRs Analyzed</span>
              </div>
              <span className="font-semibold">32</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm">Submissions Complete</span>
              </div>
              <span className="font-semibold">15</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm">Pending Tasks</span>
              </div>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Recent Activity" className="col-span-full md:col-span-2">
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div className="rounded-full bg-gray-100 p-2 mr-3">
                  <activity.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 mr-2">{activity.time}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{activity.module}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/activity">
              <a className="text-sm text-pink-600 hover:text-pink-800 font-medium flex items-center">
                <span>View all activity</span>
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          </div>
        </DashboardCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Upcoming Tasks" className="col-span-full md:col-span-2">
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="p-3 border rounded-md border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-4 w-full border border-dashed border-gray-300 p-3 rounded-md flex items-center justify-center text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>Add New Task</span>
          </button>
        </DashboardCard>
        
        <DashboardCard title="Notifications" className="col-span-full md:col-span-1">
          <div className="space-y-3">
            {notifications.map(notification => (
              <div key={notification.id} className="p-3 border-b border-gray-100 last:border-0">
                <div className="flex items-start space-x-3">
                  <div className={`rounded-full p-2 ${
                    notification.type === 'warning' 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : notification.type === 'info'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-pink-100 text-pink-600'
                  }`}>
                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {notification.type === 'info' && <Bell className="w-4 h-4" />}
                    {notification.type === 'request' && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link href="/notifications">
              <a className="text-sm text-pink-600 hover:text-pink-800 font-medium flex items-center justify-center">
                <span>View all notifications</span>
              </a>
            </Link>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default DashboardModule;