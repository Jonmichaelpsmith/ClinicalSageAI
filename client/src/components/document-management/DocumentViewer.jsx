import React, { useState, useEffect } from 'react';
import { useDocuShare } from '@/hooks/useDocuShareComponents';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Download, FileUp, Clipboard, ClipboardCheck, History, 
  CheckCircle, AlertCircle, Clock, Shield, User, Edit, Lock, 
  ExternalLink, CheckSquare, ArrowDownCircle
} from 'lucide-react';

/**
 * Document Viewer Component
 * 
 * Displays detailed information about a selected document,
 * with metadata, version history, audit trail, and document preview.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.document - The document to display
 * @param {boolean} props.allowEdit - Whether to allow document editing
 */
export default function DocumentViewer({ 
  document = null,
  allowEdit = false
}) {
  const { downloadDocument, getDocumentVersionHistory, getDocumentAuditTrail } = useDocuShare();
  const [activeTab, setActiveTab] = useState('preview');
  const [versionHistory, setVersionHistory] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  
  // Get document details when document changes
  useEffect(() => {
    if (document) {
      // Get version history
      getDocumentVersionHistory(document.id)
        .then(history => setVersionHistory(history))
        .catch(() => setVersionHistory([]));
      
      // Get audit trail
      getDocumentAuditTrail(document.id)
        .then(audit => setAuditTrail(audit))
        .catch(() => setAuditTrail([]));
    } else {
      setVersionHistory([]);
      setAuditTrail([]);
    }
  }, [document, getDocumentVersionHistory, getDocumentAuditTrail]);
  
  // Handle download
  const handleDownload = () => {
    if (document) {
      downloadDocument(document.id);
    }
  };
  
  if (!document) {
    return (
      <Card className="h-full flex items-center justify-center text-center p-6">
        <div className="flex flex-col items-center">
          <FileText className="h-10 w-10 text-gray-300 mb-3" />
          <CardTitle className="text-lg mb-2">No Document Selected</CardTitle>
          <CardDescription>
            Select a document from the browser to view details
          </CardDescription>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              <CardTitle className="text-lg">{document.name}</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {document.documentType.charAt(0).toUpperCase() + document.documentType.slice(1)} • Version {document.version}
            </CardDescription>
          </div>
          
          <Badge 
            className={`
              ${document.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                document.status === 'in-review' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                'bg-blue-100 text-blue-800 hover:bg-blue-200'}
            `}
          >
            {document.status === 'approved' ? 
              <CheckCircle className="h-3 w-3 mr-1" /> : 
              document.status === 'in-review' ? 
                <AlertCircle className="h-3 w-3 mr-1" /> : 
                <Clock className="h-3 w-3 mr-1" />
            }
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <div className="px-6 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="min-h-[300px]">
            <div className="border rounded-md h-[400px] flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <FileText className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 mb-3">Document preview not available in this demo</p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <ArrowDownCircle className="h-4 w-4 mr-1.5" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metadata">
            <div className="border rounded-md p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Document Properties</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Module:</span>
                      <span className="font-medium">{document.moduleContext}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Section:</span>
                      <span className="font-medium">{document.sectionContext || 'General'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{document.documentType}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">{document.version}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">{document.status}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Timeline</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">
                        {new Date(document.lastModified).toLocaleDateString()} 
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Last Modified:</span>
                      <span className="font-medium">
                        {new Date(document.lastModified).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Author:</span>
                      <span className="font-medium">{document.author}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">File Size:</span>
                      <span className="font-medium">
                        {document.size 
                          ? (document.size / (1024 * 1024)).toFixed(2) + ' MB' 
                          : 'N/A'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">21 CFR Part 11 Compliance</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-gray-200 flex items-center">
                    <CheckSquare className="h-3 w-3 text-green-600 mr-1.5" />
                    <span>Electronic Signatures</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200 flex items-center">
                    <CheckSquare className="h-3 w-3 text-green-600 mr-1.5" />
                    <span>Audit Trail</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200 flex items-center">
                    <CheckSquare className="h-3 w-3 text-green-600 mr-1.5" />
                    <span>Version Control</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200 flex items-center">
                    <CheckSquare className="h-3 w-3 text-green-600 mr-1.5" />
                    <span>Access Controls</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="versions">
            <div className="border rounded-md overflow-hidden">
              <ScrollArea className="h-[400px]">
                {versionHistory.length > 0 ? (
                  <div className="divide-y">
                    {versionHistory.map((version, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <History className="h-4 w-4 text-blue-600 mr-1.5" />
                            <span className="font-medium">Version {version.version}</span>
                            {version.status === 'current' && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Current</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mb-1.5 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(version.timestamp).toLocaleString()}
                          <span className="mx-2">•</span>
                          <User className="h-3 w-3 mr-1" />
                          {version.user}
                        </div>
                        <p className="text-sm text-gray-600">{version.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 text-center h-full">
                    <div>
                      <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No version history available</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="audit">
            <div className="border rounded-md overflow-hidden">
              <ScrollArea className="h-[400px]">
                {auditTrail.length > 0 ? (
                  <div className="divide-y">
                    {auditTrail.map((event, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            {event.action === 'View' ? (
                              <Eye className="h-4 w-4 text-blue-600 mr-1.5" />
                            ) : event.action === 'Approve' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mr-1.5" />
                            ) : event.action === 'Modify' ? (
                              <Edit className="h-4 w-4 text-yellow-600 mr-1.5" />
                            ) : event.action === 'Comment' ? (
                              <Clipboard className="h-4 w-4 text-purple-600 mr-1.5" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600 mr-1.5" />
                            )}
                            <span className="font-medium">{event.action}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {event.ipAddress}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-1.5 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.timestamp).toLocaleString()}
                          <span className="mx-2">•</span>
                          <User className="h-3 w-3 mr-1" />
                          {event.user}
                        </div>
                        <p className="text-sm text-gray-600">{event.details}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 text-center h-full">
                    <div>
                      <ClipboardCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No audit trail available</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <CardFooter className="flex justify-between border-t pt-4 mt-auto">
        <div className="flex items-center text-xs text-gray-500">
          <Lock className="h-3 w-3 mr-1 text-teal-600" />
          21 CFR Part 11 Compliant
        </div>
        <div className="flex space-x-2">
          {allowEdit && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}