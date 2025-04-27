/**
 * Trial Vault Module
 * 
 * Main component for the Trial Vault module of the TrialSage platform.
 */

import React from 'react';
import { FileText, Search, FolderOpen, Shield, History, Share2 } from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const TrialVaultModule = () => {
  const { getSharedContext } = useModuleIntegration();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trial Vault</h1>
        <p className="text-gray-600">Secure document management with blockchain verification</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature tiles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-semibold">Document Management</h2>
          </div>
          <p className="text-gray-600">Store, organize, and manage all your clinical and regulatory documents.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <Search size={20} />
            </div>
            <h2 className="text-lg font-semibold">Advanced Search</h2>
          </div>
          <p className="text-gray-600">Find documents and content quickly with powerful search capabilities.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <FolderOpen size={20} />
            </div>
            <h2 className="text-lg font-semibold">Study Organization</h2>
          </div>
          <p className="text-gray-600">Organize documents by study, indication, or custom collections.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-semibold">Blockchain Security</h2>
          </div>
          <p className="text-gray-600">Ensure document authenticity and maintain a secure audit trail.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <History size={20} />
            </div>
            <h2 className="text-lg font-semibold">Version Control</h2>
          </div>
          <p className="text-gray-600">Track document versions with detailed change history.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-3">
              <Share2 size={20} />
            </div>
            <h2 className="text-lg font-semibold">Cross-Module Sharing</h2>
          </div>
          <p className="text-gray-600">Share documents seamlessly with other TrialSage modules.</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="text-gray-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="font-medium">Protocol v2.1.docx</div>
                <div className="text-sm text-gray-500">Updated 2 hours ago</div>
              </div>
              <button className="text-primary text-sm">View</button>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="text-gray-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="font-medium">Investigator Brochure.pdf</div>
                <div className="text-sm text-gray-500">Updated yesterday</div>
              </div>
              <button className="text-primary text-sm">View</button>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="text-gray-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="font-medium">Statistical Analysis Plan.docx</div>
                <div className="text-sm text-gray-500">Updated 3 days ago</div>
              </div>
              <button className="text-primary text-sm">View</button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-primary text-sm">View All Documents</button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 bg-primary bg-opacity-5 rounded-lg text-primary hover:bg-opacity-10">
              <FileText size={18} className="mr-2" /> Upload Document
            </button>
            
            <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100">
              <FolderOpen size={18} className="mr-2" /> Create Collection
            </button>
            
            <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100">
              <Search size={18} className="mr-2" /> Advanced Search
            </button>
            
            <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100">
              <Share2 size={18} className="mr-2" /> Share Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialVaultModule;