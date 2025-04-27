/**
 * Study Architect Module
 * 
 * Main component for the Study Architect module of the TrialSage platform.
 */

import React from 'react';
import { Compass, FileText, Users, BarChart2, ClipboardList, Clock } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const StudyArchitectModule = () => {
  const { getSharedContext } = useModuleIntegration();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Study Architect</h1>
        <p className="text-gray-600">Comprehensive clinical study design and planning</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature tiles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <Compass size={20} />
            </div>
            <h2 className="text-lg font-semibold">Study Design</h2>
          </div>
          <p className="text-gray-600">Design optimal clinical trials with AI-powered recommendations.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold">Protocol Builder</h2>
          </div>
          <p className="text-gray-600">Create and manage study protocols with intelligent templates.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-semibold">Site Management</h2>
          </div>
          <p className="text-gray-600">Manage clinical sites and investigator communications.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <BarChart2 size={20} />
            </div>
            <h2 className="text-lg font-semibold">Statistical Planning</h2>
          </div>
          <p className="text-gray-600">Design statistical analysis plans and sample size calculations.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-lg font-semibold">CRF Designer</h2>
          </div>
          <p className="text-gray-600">Design and manage case report forms and data collection.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
              <Clock size={20} />
            </div>
            <h2 className="text-lg font-semibold">Timeline Planning</h2>
          </div>
          <p className="text-gray-600">Plan and track study timelines and milestones.</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Studies */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Active Studies</h2>
          </div>
          
          <div className="divide-y">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <h3 className="font-semibold">BTX-331-001</h3>
                <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Phase I</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">First-in-human study of BTX-331 in healthy volunteers</p>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">10 sites • 45 subjects</div>
                <button className="text-primary text-sm">View Details</button>
              </div>
            </div>
            
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <h3 className="font-semibold">BX-107-002</h3>
                <span className="ml-3 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Phase II</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Efficacy study of BX-107 in patients with rheumatoid arthritis</p>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">23 sites • 120 subjects</div>
                <button className="text-primary text-sm">View Details</button>
              </div>
            </div>
            
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                <h3 className="font-semibold">NRX-405-003</h3>
                <span className="ml-3 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Planning</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Long-term follow-up study of NRX-405 in pediatric patients</p>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">Protocol in development</div>
                <button className="text-primary text-sm">View Details</button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t text-center">
            <button className="text-primary text-sm">Create New Study</button>
          </div>
        </div>
        
        {/* Protocol Templates */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Protocol Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
            <div className="border rounded-lg p-4 hover:shadow-sm">
              <div className="flex items-center mb-2">
                <FileText className="text-primary mr-2" size={18} />
                <h3 className="font-medium">Phase I Template</h3>
              </div>
              <p className="text-sm text-gray-600">First-in-human and safety studies</p>
              <button className="mt-3 text-xs text-primary">Use Template</button>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-sm">
              <div className="flex items-center mb-2">
                <FileText className="text-primary mr-2" size={18} />
                <h3 className="font-medium">Phase II Template</h3>
              </div>
              <p className="text-sm text-gray-600">Efficacy and dose-finding studies</p>
              <button className="mt-3 text-xs text-primary">Use Template</button>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-sm">
              <div className="flex items-center mb-2">
                <FileText className="text-primary mr-2" size={18} />
                <h3 className="font-medium">Phase III Template</h3>
              </div>
              <p className="text-sm text-gray-600">Confirmatory and pivotal studies</p>
              <button className="mt-3 text-xs text-primary">Use Template</button>
            </div>
            
            <div className="border rounded-lg p-4 hover:shadow-sm">
              <div className="flex items-center mb-2">
                <FileText className="text-primary mr-2" size={18} />
                <h3 className="font-medium">Pediatric Template</h3>
              </div>
              <p className="text-sm text-gray-600">Studies in pediatric populations</p>
              <button className="mt-3 text-xs text-primary">Use Template</button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-t text-center">
            <button className="text-primary text-sm">View All Templates</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyArchitectModule;