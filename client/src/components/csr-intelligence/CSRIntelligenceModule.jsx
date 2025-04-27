/**
 * CSR Intelligence Module
 * 
 * Main component for the CSR Intelligence module of the TrialSage platform.
 */

import React from 'react';
import { BookOpen, FileText, BarChart2, CheckSquare, Zap, Layers } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const CSRIntelligenceModule = () => {
  const { getSharedContext } = useModuleIntegration();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">CSR Intelligence</h1>
        <p className="text-gray-600">AI-powered clinical study report generation and management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature tiles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <BookOpen size={20} />
            </div>
            <h2 className="text-lg font-semibold">CSR Templates</h2>
          </div>
          <p className="text-gray-600">Access ICH E3-compliant CSR templates with intelligent suggestions.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold">Content Generation</h2>
          </div>
          <p className="text-gray-600">Generate CSR content based on study data and protocols.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <BarChart2 size={20} />
            </div>
            <h2 className="text-lg font-semibold">Data Visualization</h2>
          </div>
          <p className="text-gray-600">Create tables, figures, and listings for CSR appendices.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <CheckSquare size={20} />
            </div>
            <h2 className="text-lg font-semibold">Quality Control</h2>
          </div>
          <p className="text-gray-600">Automated quality checks and compliance verification.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-semibold">AI Assistance</h2>
          </div>
          <p className="text-gray-600">Intelligent writing assistance and regulatory guidance.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
              <Layers size={20} />
            </div>
            <h2 className="text-lg font-semibold">CSR Repository</h2>
          </div>
          <p className="text-gray-600">Store and manage CSRs with version control and search.</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">CSR Projects</h2>
        </div>
        
        <div className="divide-y">
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">BTX-331 Phase I CSR</h3>
                <p className="text-sm text-gray-600 mt-1">Draft in progress</p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-6">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-medium">65%</div>
                </div>
                <button className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-opacity-90">
                  Continue
                </button>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">BX-107 Phase II CSR</h3>
                <p className="text-sm text-gray-600 mt-1">Quality review</p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-6">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-medium">90%</div>
                </div>
                <button className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-opacity-90">
                  Review
                </button>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">NRX-405 Phase I CSR</h3>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-6">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-medium">100%</div>
                </div>
                <button className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300">
                  View
                </button>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t text-center">
          <button className="text-primary text-sm">Create New CSR Project</button>
        </div>
      </div>
    </div>
  );
};

export default CSRIntelligenceModule;