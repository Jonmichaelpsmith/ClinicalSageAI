/**
 * Analytics Module
 * 
 * Main component for the Analytics module of the TrialSage platform.
 */

import React from 'react';
import { BarChart2, PieChart, TrendingUp, Clock, Filter, Download } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const AnalyticsModule = () => {
  const { getSharedContext } = useModuleIntegration();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-600">Comprehensive data analytics and insights across modules</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Summary cards */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-600">Active Studies</h2>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold">15</div>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-green-500">+2</span> from last month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-600">Regulatory Submissions</h2>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold">8</div>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-green-500">+3</span> from last month
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-600">Documents Generated</h2>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold">128</div>
          <div className="text-sm text-gray-500 mt-1">
            <span className="text-green-500">+45</span> from last month
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Charts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Study Status Distribution</h2>
            <div className="flex items-center">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Filter size={16} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 ml-2">
                <Download size={16} />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <PieChart size={40} className="text-gray-300" />
            <span className="ml-3 text-gray-500">Study distribution chart</span>
          </div>
          <div className="flex justify-around mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Active (7)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Planning (4)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Completed (3)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
              <span>On Hold (1)</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Document Creation Trends</h2>
            <div className="flex items-center">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Filter size={16} />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600 ml-2">
                <Download size={16} />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <BarChart2 size={40} className="text-gray-300" />
            <span className="ml-3 text-gray-500">Documents creation trend chart</span>
          </div>
          <div className="flex justify-around mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Protocols</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>CSRs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>INDs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Recent activities */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold">Recent Activities</h2>
          </div>
          
          <div className="divide-y">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FileIcon />
                  </div>
                </div>
                <div>
                  <div className="font-medium">Protocol BTX-331-001 Created</div>
                  <div className="text-sm text-gray-600 mt-1">John Davis created a new protocol document</div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>2 hours ago</span>
                    <span className="mx-2">•</span>
                    <span className="text-primary">View Details</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 hover:bg-gray-50">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <SubmitIcon />
                  </div>
                </div>
                <div>
                  <div className="font-medium">IND Submission Completed</div>
                  <div className="text-sm text-gray-600 mt-1">Sarah Johnson completed the IND submission for BX-107</div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>Yesterday</span>
                    <span className="mx-2">•</span>
                    <span className="text-primary">View Details</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 hover:bg-gray-50">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <UpdateIcon />
                  </div>
                </div>
                <div>
                  <div className="font-medium">CSR Draft Updated</div>
                  <div className="text-sm text-gray-600 mt-1">Mark Wilson updated the CSR draft for BTX-331 Phase I study</div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>2 days ago</span>
                    <span className="mx-2">•</span>
                    <span className="text-primary">View Details</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 hover:bg-gray-50">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <SiteIcon />
                  </div>
                </div>
                <div>
                  <div className="font-medium">New Site Added</div>
                  <div className="text-sm text-gray-600 mt-1">Emily Chen added a new clinical site for BX-107-002 study</div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>3 days ago</span>
                    <span className="mx-2">•</span>
                    <span className="text-primary">View Details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50 text-center">
            <button className="text-primary text-sm">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon components
const FileIcon = () => <FileText size={20} />;
const SubmitIcon = () => <TrendingUp size={20} />;
const UpdateIcon = () => <PieChart size={20} />;
const SiteIcon = () => <BarChart2 size={20} />;

export default AnalyticsModule;