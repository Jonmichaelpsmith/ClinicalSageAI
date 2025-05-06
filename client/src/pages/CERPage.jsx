import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CERPage() {
  const [location, setLocation] = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - exactly matching screenshot */}
      <header className="bg-blue-900 text-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button 
                className="text-white flex items-center" 
                onClick={() => setLocation('/client-portal')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="text-sm">Back</span>
              </button>
              
              <div className="grid grid-cols-4 gap-8">
                <div>
                  <div className="text-xs text-gray-300">Device Name</div>
                  <div className="text-sm font-medium">CardioStent XR</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Manufacturer</div>
                  <div className="text-sm font-medium">MedDevice Technologies Inc.</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Product Code</div>
                  <div className="text-sm font-medium">MDT-CS-221</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-300">Report Status</div>
                  <div className="flex items-center">
                    <Badge className="bg-green-500 text-xs font-normal hover:bg-green-600 rounded">Draft</Badge>
                    <Badge className="ml-2 bg-white text-blue-800 text-xs font-normal hover:bg-gray-100 rounded">v1.0</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800 text-xs h-7 rounded">
                Save
              </Button>
              
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800 text-xs h-7 rounded">
                <Share className="h-3.5 w-3.5 mr-1" />
                Share
              </Button>
              
              <div className="border-l border-blue-700 h-5 mx-2"></div>
              
              <span className="text-xs mr-1">Production</span>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-1">
            <a href="#" className="px-4 py-3 border-b-2 border-transparent text-sm font-medium">Overview</a>
            <a href="#" className="px-4 py-3 border-b-2 border-transparent text-sm font-medium">Report Builder</a>
            <a href="#" className="px-4 py-3 border-b-2 border-blue-600 text-sm font-medium text-blue-600 bg-white">Compliance Assessment</a>
            <a href="#" className="px-4 py-3 border-b-2 border-transparent text-sm font-medium">Export & Publish</a>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold mb-1">Clinical Evaluation Report: CardioStent XR</h1>
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center mr-3">
                  <span className="mr-1">Last updated:</span>
                  <span>2025-05-06</span>
                </div>
                <div className="flex items-center mr-3">
                  <span className="mr-1">Author:</span>
                  <span>Dr. Elizabeth Chen</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">MedDevice Technologies, Inc.</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <select className="border text-xs rounded px-2 py-1 pr-6 bg-white">
                <option>Version 1.0 (Current Draft)</option>
                <option>Version 0.9 (Review)</option>
                <option>Version 0.8 (Initial Draft)</option>
              </select>
              
              <Button size="sm" className="text-xs h-7 rounded">
                <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View Full Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Report Summary Card */}
            <div className="col-span-1">
              <div className="bg-white border rounded shadow-sm">
                <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium">
                  <div className="flex items-center">
                    <svg className="h-3.5 w-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Report Summary
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Device</div>
                      <div className="text-sm">CardioStent XR</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Product Code</div>
                      <div className="text-sm">MDT-CS-221</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Version</div>
                      <div className="text-sm">v1.0</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="text-sm">Draft</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Report Date</div>
                      <div className="text-sm">2025-05-06</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Last Updated</div>
                      <div className="text-sm">2025-05-06</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Key Statistics Card */}
            <div className="col-span-2">
              <div className="bg-white border rounded shadow-sm">
                <div className="border-b px-4 py-2 bg-gray-50 text-sm font-medium flex justify-between items-center">
                  <div className="flex items-center">
                    <svg className="h-3.5 w-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Key Statistics
                  </div>
                  <button className="px-2 py-1 text-xs border rounded">
                    <svg className="h-3.5 w-3.5 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-500">Sections</div>
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-xs text-gray-500">Total report sections</div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-500">Compliance</div>
                      <div className="text-2xl font-bold">N/A</div>
                      <div className="text-xs text-gray-500">Overall score</div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-500">Critical Gaps</div>
                      <div className="text-2xl font-bold">N/A</div>
                      <div className="text-xs text-gray-500">Issues to address</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Progress Tracker</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}