import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SimpleValidationDashboard = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 mr-2 rounded-full bg-purple-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-purple-600"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">Validation Dashboard</h1>
          <p className="text-sm text-gray-600">Ensure compliance with regulatory requirements</p>
        </div>
        <Badge className="ml-auto bg-purple-100 text-purple-700">Enterprise</Badge>
      </div>
      
      <Card className="mb-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-medium">Module 2.5 Clinical Overview</h2>
            <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
          </div>
          
          <div className="border-b">
            <div className="flex justify-between p-4">
              <span>Content Completeness</span>
              <span className="font-medium">78%</span>
            </div>
          </div>
          
          <div className="border-b">
            <div className="flex justify-between p-4">
              <span>Regulatory Compliance</span>
              <span className="font-medium">92%</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between p-4">
              <span>Reference Validation</span>
              <span className="font-medium">65%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert className="mb-4 bg-amber-50 border-amber-200">
        <div className="flex items-start">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="text-amber-700 mr-2 mt-0.5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <AlertDescription className="text-amber-800">
            <span className="font-medium">4 validation issues require attention</span>
            <p className="text-sm mt-1">Missing source citations in section 2.5.4 and incomplete benefit-risk assessment.</p>
          </AlertDescription>
        </div>
      </Alert>
      
      <Button className="w-full mb-4 bg-purple-600 hover:bg-purple-700">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="mr-2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Open Validation Report
      </Button>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Overall:</p>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">68%</span>
            <span className="text-gray-600">complete</span>
          </div>
        </div>
        
        <Button variant="outline" className="flex items-center text-blue-600 border-blue-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Document
        </Button>
      </div>
      
      <div className="mt-4 text-right">
        <Badge className="bg-green-100 text-green-700">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          Online
        </Badge>
      </div>
    </div>
  );
};

export default SimpleValidationDashboard;