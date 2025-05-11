/**
 * eCTD Validation Dashboard
 * 
 * Dedicated component for managing and tracking regulatory validation
 * requirements for eCTD documents in the Co-Author Module
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Check,
  RefreshCw,
  BookOpen
} from 'lucide-react';

// Sample validation data - this would be fetched from backend
const mockValidations = [
  {
    id: 1,
    document: "Module 2.5 Clinical Overview",
    status: "in-progress",
    progress: 35,
    messages: [
      {
        id: 1,
        type: "warning",
        text: "Critical words/phrases missing (acceptable, however)",
        priority: "medium"
      },
      {
        id: 2,
        type: "info",
        text: "Hyperlinks found",
        priority: "low"
      }
    ]
  },
  {
    id: 2,
    document: "Module 2.7 Clinical Summary",
    status: "validated",
    progress: 100,
    messages: []
  },
  {
    id: 3,
    document: "Module 3.2 Quality",
    status: "error",
    progress: 48,
    messages: [
      {
        id: 3,
        type: "error",
        text: "Missing required section: 3.2.P.8 Stability",
        priority: "high"
      },
      {
        id: 4,
        type: "warning",
        text: "Table formatting inconsistent",
        priority: "medium"
      }
    ]
  }
];

export default function ValidationDashboard() {
  const [validations, setValidations] = useState(mockValidations);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, fetch validation data from the API
    // fetchValidations();
  }, []);

  const runValidation = (documentId) => {
    setIsLoading(true);
    // Simulate validation check
    setTimeout(() => {
      setIsLoading(false);
      // In real implementation, update validation status from API response
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const renderMessageIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-semibold">Validation Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Track validation status of your regulatory documents</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {validations.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                        selectedDocument?.id === doc.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.document}</p>
                          <div className="flex items-center mt-1">
                            {getStatusIcon(doc.status)}
                            <Badge variant="outline" className={`text-xs ml-1 ${getStatusColor(doc.status)}`}>
                              {doc.status === 'validated' ? 'Validated' : doc.status === 'in-progress' ? 'In Progress' : 'Has Issues'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedDocument ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedDocument.document}</CardTitle>
                  <CardDescription>Validation details and requirements</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Export Report
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => runValidation(selectedDocument.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Run Validation
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Overall Completion</h3>
                    <div className="flex items-center space-x-4">
                      <Progress value={selectedDocument.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{selectedDocument.progress}%</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Validation Messages</h3>
                    {selectedDocument.messages.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDocument.messages.map((message) => (
                          <Alert key={message.id} variant={message.type === 'error' ? 'destructive' : 'default'} className={
                            message.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                            message.type === 'info' ? 'bg-blue-50 border-blue-200' : ''
                          }>
                            <div className="flex items-start">
                              {renderMessageIcon(message.type)}
                              <div className="ml-2">
                                <AlertTitle className={
                                  message.type === 'warning' ? 'text-amber-800' :
                                  message.type === 'info' ? 'text-blue-800' : ''
                                }>
                                  {message.type === 'error' ? 'Error' : message.type === 'warning' ? 'Warning' : 'Info'}
                                </AlertTitle>
                                <AlertDescription className="text-sm">
                                  {message.text}
                                </AlertDescription>
                              </div>
                            </div>
                            {message.type === 'error' && (
                              <Button size="sm" variant="outline" className="mt-2">
                                Fix Issue
                              </Button>
                            )}
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center bg-green-50 rounded-md">
                        <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                        <p className="font-medium text-green-800">Document fully validated</p>
                        <p className="text-sm text-green-600 mt-1">No validation issues found</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-500">Last validated: May 11, 2025, 10:23 AM</p>
                    <Button variant="link" size="sm" className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Open in Google Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-white rounded-lg border border-dashed border-slate-300">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No Document Selected</h3>
              <p className="text-sm text-slate-500 text-center mt-1">
                Select a document from the list to view its validation status and details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}