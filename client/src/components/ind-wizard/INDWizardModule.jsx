/**
 * IND Wizard Module
 * 
 * Main component for the IND Wizard module of the TrialSage platform.
 */

import React from 'react';
import { Folder, FileText, CheckCircle, Calendar, Users, Settings } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const INDWizardModule = () => {
  const { getSharedContext } = useModuleIntegration();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">IND Wizard</h1>
        <p className="text-gray-600">Streamlined IND preparation and submission</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature tiles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold">Form Templates</h2>
          </div>
          <p className="text-gray-600">Access and complete FDA-compliant IND forms with intelligent assistance.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-lg font-semibold">Submission Tracking</h2>
          </div>
          <p className="text-gray-600">Track submission status and respond to FDA queries efficiently.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <Calendar size={20} />
            </div>
            <h2 className="text-lg font-semibold">Timeline Management</h2>
          </div>
          <p className="text-gray-600">Plan and track key milestones in your IND application process.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <Folder size={20} />
            </div>
            <h2 className="text-lg font-semibold">Document Assembly</h2>
          </div>
          <p className="text-gray-600">Organize and assemble your IND documents with intelligent guidance.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-semibold">Collaboration</h2>
          </div>
          <p className="text-gray-600">Collaborate with team members on IND preparation and review.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
              <Settings size={20} />
            </div>
            <h2 className="text-lg font-semibold">CMC Builder</h2>
          </div>
          <p className="text-gray-600">Comprehensive tools for Chemistry, Manufacturing, and Controls documentation.</p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
        <h2 className="text-lg font-semibold mb-2">Ready to start your IND application?</h2>
        <p className="mb-4">Our AI-powered assistant will guide you through the entire process.</p>
        <button className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
          Start New IND Application
        </button>
      </div>
    </div>
  );
};

export default INDWizardModule;