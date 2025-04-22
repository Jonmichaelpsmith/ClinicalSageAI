import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Download,
  Printer,
  History,
  Edit,
  Lock,
  CheckCircle,
  User,
  Calendar,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react';

/**
 * DocumentViewer Component
 * 
 * This component displays the contents and metadata of a selected document
 * from the DocuShare system with controls for viewing and managing it.
 */
export default function DocumentViewer({ document, onClose, allowEdit = false }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [loading, setLoading] = useState(true);
  const [versionHistory, setVersionHistory] = useState([]);
  
  // Simulate loading document content and metadata
  useEffect(() => {
    if (document) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        
        // Generate sample version history if we're viewing a real document
        if (document.id) {
          const currentVersion = parseFloat(document.version);
          const history = [];
          
          for (let i = 1; i <= currentVersion * 10; i++) {
            const version = (i / 10).toFixed(1);
            const date = new Date();
            date.setDate(date.getDate() - (currentVersion * 10 - i) * 3);
            
            history.push({
              version,
              date: date.toISOString(),
              author: i === currentVersion * 10 ? 'Current User' : document.author,
              notes: i === currentVersion * 10 ? 'Current version' : `Version ${version} changes`
            });
          }
          
          setVersionHistory(history.reverse());
        }
      }, 1200);
      
      return () => clearTimeout(timer);
    }
  }, [document]);
  
  // If no document is selected, show a placeholder
  if (!document) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-muted-foreground">No Document Selected</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Select a document from the list to view its contents
          </p>
        </div>
      </Card>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Get status badge styling based on document status
  const getStatusBadge = (status) => {
    const styles = {
      'Approved': 'bg-green-100 text-green-800 hover:bg-green-200',
      'In-Review': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'Draft': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      'Submitted': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      'Active': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    };
    
    return styles[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };
  
  return (
    <Card className="w-full h-full flex flex-col border-teal-200">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-teal-600 mr-2" />
              <CardTitle className="text-lg">{document.title}</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {document.documentId} • Version {document.version} • {formatDate(document.modifiedDate)}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusBadge(document.controlStatus)}>
              {document.controlStatus}
            </Badge>
            <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">
              <Shield className="h-3 w-3 mr-1" /> 21 CFR Part 11
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-grow flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <div className="border-b px-6">
            <TabsList className="mb-px">
              <TabsTrigger value="preview" className="px-4">
                Preview
              </TabsTrigger>
              <TabsTrigger value="metadata" className="px-4">
                Metadata
              </TabsTrigger>
              <TabsTrigger value="history" className="px-4">
                Version History
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-grow">
            <TabsContent value="preview" className="mt-0 h-full">
              {loading ? (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full inline-block mb-3"></div>
                    <p className="text-muted-foreground">Loading document...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{document.documentType}</span> • 
                      <span className="ml-1">Last modified: {formatDate(document.modifiedDate)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-grow p-6">
                    <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-md p-8 border">
                      <div className="text-center mb-8 pb-6 border-b">
                        <h1 className="text-xl font-bold mb-2">{document.title}</h1>
                        <p className="text-sm text-muted-foreground">
                          Document ID: {document.documentId} • Version: {document.version}
                        </p>
                      </div>
                      
                      {/* This would be replaced with the actual document content */}
                      <div className="space-y-4 text-sm">
                        <p>This is a preview of the document content. In a production environment, this would display the actual document content or an embedded PDF viewer.</p>
                        
                        <p>The document is being served from the DocuShare document management system, which provides 21 CFR Part 11 compliance for electronic records and signatures.</p>
                        
                        <div className="py-2 px-3 bg-amber-50 border border-amber-200 rounded-md flex items-start mt-4">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-amber-800">Controlled Document Notice</p>
                            <p className="text-amber-700 mt-1">This is a controlled document under 21 CFR Part 11 compliance. All access and modifications are being logged and require appropriate authorization.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-0 h-full">
              <ScrollArea className="h-full p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Info className="h-4 w-4 mr-2 text-teal-600" />
                          Document Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Document ID:</dt>
                            <dd className="font-medium">{document.documentId}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Type:</dt>
                            <dd className="font-medium">{document.documentType}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Version:</dt>
                            <dd className="font-medium">{document.version}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Status:</dt>
                            <dd>
                              <Badge className={getStatusBadge(document.controlStatus)}>
                                {document.controlStatus}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">File Size:</dt>
                            <dd className="font-medium">
                              {(document.size / 1024 / 1024).toFixed(2)} MB
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                          Dates & Timestamps
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Created:</dt>
                            <dd className="font-medium">{formatDate(document.uploadDate)}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Last Modified:</dt>
                            <dd className="font-medium">{formatDate(document.modifiedDate)}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Last Reviewed:</dt>
                            <dd className="font-medium">
                              {formatDate(document.modifiedDate)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Effective Date:</dt>
                            <dd className="font-medium">
                              {document.controlStatus === 'Approved' ? formatDate(document.modifiedDate) : 'Not yet effective'}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <User className="h-4 w-4 mr-2 text-teal-600" />
                          Ownership & Responsibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Author:</dt>
                            <dd className="font-medium">{document.author}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Owner:</dt>
                            <dd className="font-medium">{document.author}</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Department:</dt>
                            <dd className="font-medium">
                              {document.module === 'regulatory' ? 'Regulatory Affairs' : 
                                document.module === 'csr' ? 'Clinical Operations' :
                                document.module === 'cer' ? 'Medical Affairs' :
                                document.module === 'quality' ? 'Quality Assurance' :
                                'Regulatory Affairs'}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-teal-600" />
                          Compliance & Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Compliance:</dt>
                            <dd className="font-medium">21 CFR Part 11</dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Electronic Signature:</dt>
                            <dd className="font-medium flex items-center">
                              {document.controlStatus === 'Approved' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                                  Validated
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 text-amber-600 mr-1" />
                                  Pending
                                </>
                              )}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Audit Trail:</dt>
                            <dd className="font-medium flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                              Active
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Server ID:</dt>
                            <dd className="font-medium font-mono text-xs">TrialSAGE-DS7</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0 h-full">
              <ScrollArea className="h-full p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-teal-100"></div>
                    
                    <div className="space-y-4">
                      {versionHistory.map((version, index) => (
                        <div key={index} className="relative pl-10">
                          <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-teal-800">{version.version}</span>
                          </div>
                          
                          <Card>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-sm flex items-center">
                                  Version {version.version}
                                  {parseFloat(version.version) === parseFloat(document.version) && (
                                    <Badge className="ml-2 bg-teal-100 text-teal-800 hover:bg-teal-200">
                                      Current
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  {formatDate(version.date)}
                                </CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent className="py-0">
                              <div className="text-sm">
                                <div className="mb-1 text-muted-foreground">Modified by: {version.author}</div>
                                <div>{version.notes}</div>
                              </div>
                            </CardContent>
                            <CardFooter className="py-2">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                                {parseFloat(version.version) === parseFloat(document.version) && allowEdit && (
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </CardFooter>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <CardFooter className="border-t py-3 flex justify-between bg-muted/10">
        <div className="text-xs text-muted-foreground flex items-center">
          <Lock className="h-3 w-3 mr-1 text-teal-600" />
          21 CFR Part 11 Compliant Document Management
        </div>
        
        <div className="flex space-x-2">
          {allowEdit && document.controlStatus !== 'Approved' && (
            <Button variant="outline" size="sm" className="h-8">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8">
            <History className="h-3 w-3 mr-1" />
            Audit Log
          </Button>
          <Button variant="default" size="sm" className="h-8 bg-teal-600 hover:bg-teal-700">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}