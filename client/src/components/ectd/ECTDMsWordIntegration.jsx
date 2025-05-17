import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import {
  FileText,
  FileEdit,
  ExternalLink,
  Cloud,
  AlertCircle,
  CheckCircle,
  Lock,
  RefreshCw,
  History,
  Save
} from 'lucide-react';

/**
 * eCTD Microsoft Word Integration Component
 * 
 * This component provides an enhanced Microsoft Word integration experience for editing 
 * eCTD documents, with support for Microsoft Copilot, version history, and automated
 * document validation.
 * 
 * Features:
 * - Microsoft Word Online editor embedded in the application
 * - Seamless document retrieval from VAULT
 * - Automatic synchronization back to VAULT
 * - Microsoft Copilot integration for AI-assisted authoring
 * - Version history tracking
 * - Real-time validation against eCTD specifications
 */
const ECTDMsWordIntegration = ({ documentId, documentType = 'Clinical Overview', readOnly = false }) => {
  const [editorState, setEditorState] = useState('ready'); // 'ready', 'loading', 'active', 'saving', 'error'
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [wordError, setWordError] = useState(null);
  const [activeTab, setActiveTab] = useState('document');
  const { toast } = useToast();
  
  // Mock document data
  const document = {
    id: documentId || 'DOC-12345',
    title: 'Clinical Overview for NDA 123456',
    type: documentType,
    module: 'Module 2.5',
    lastModified: '2025-05-17 09:23 AM',
    modifiedBy: 'Sarah Johnson',
    status: 'Draft',
    wordAvailable: true,
    vaultStatus: 'Synced',
    wordUrl: '#'
  };
  
  // Mock version history
  const versionHistory = [
    {
      version: '1.3',
      date: '2025-05-17 09:23 AM',
      user: 'Sarah Johnson',
      changes: 'Updated efficacy section based on new clinical data',
      commitMessage: 'Added recent Phase 3 results'
    },
    {
      version: '1.2',
      date: '2025-05-15 03:42 PM',
      user: 'Michael Chen',
      changes: 'Incorporated reviewer comments on safety section',
      commitMessage: 'Addressed FDA feedback on safety'
    },
    {
      version: '1.1',
      date: '2025-05-10 11:17 AM',
      user: 'Sarah Johnson',
      changes: 'Initial draft of clinical overview document',
      commitMessage: 'Initial draft for internal review'
    }
  ];
  
  const handleOpenDocument = () => {
    setEditorState('loading');
    
    // Simulate document loading
    setTimeout(() => {
      setEditorState('active');
      
      toast({
        title: "Document Opened",
        description: "The document is now ready for editing in Microsoft Word.",
      });
    }, 2000);
  };
  
  const handleSaveDocument = () => {
    setEditorState('saving');
    
    // Simulate document saving
    setTimeout(() => {
      setEditorState('active');
      
      toast({
        title: "Document Saved",
        description: "All changes have been saved to VAULT.",
      });
    }, 1500);
  };
  
  const handleCloseDocument = () => {
    // Simulate document closing
    setEditorState('ready');
    
    toast({
      title: "Document Closed",
      description: "The document has been closed. All changes are saved.",
    });
  };
  
  const handleCheckCompatibility = () => {
    // Simulate compatibility check
    toast({
      title: "Compatibility Check",
      description: "Your document is compatible with eCTD requirements.",
    });
  };
  
  const handleMicrosoftLogin = () => {
    // In a real implementation, this would initiate Microsoft login
    toast({
      title: "Microsoft Sign In",
      description: "Authenticating with Microsoft 365...",
    });
    
    // Simulate successful login
    setTimeout(() => {
      handleOpenDocument();
    }, 1500);
  };
  
  const renderEditorState = () => {
    if (editorState === 'ready') {
      return (
        <div className="text-center py-8">
          <FileText className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">{document.title}</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            This document is stored in VAULT and can be edited using Microsoft Word Online.
            All changes will be automatically synchronized with VAULT.
          </p>
          {document.wordAvailable ? (
            <div className="flex flex-col items-center">
              <Button className="mb-3" onClick={handleOpenDocument}>
                <FileEdit className="h-4 w-4 mr-2" />
                Open in Microsoft Word
              </Button>
              <p className="text-xs text-slate-500">
                Last modified {document.lastModified} by {document.modifiedBy}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Button className="mb-3" onClick={handleMicrosoftLogin}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Sign in to Microsoft 365
              </Button>
              <p className="text-xs text-slate-500">
                Authentication with Microsoft 365 is required to edit this document
              </p>
            </div>
          )}
        </div>
      );
    }
    
    if (editorState === 'loading') {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Loading Document</h3>
          <p className="text-slate-500">
            Retrieving the document from VAULT...
          </p>
        </div>
      );
    }
    
    if (editorState === 'saving') {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Saving Document</h3>
          <p className="text-slate-500">
            Synchronizing changes with VAULT...
          </p>
        </div>
      );
    }
    
    if (editorState === 'error') {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Document</h3>
          <p className="text-slate-500 mb-6">
            {wordError || "There was an error loading the document from Microsoft Word Online."}
          </p>
          <Button variant="outline" onClick={handleOpenDocument}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  const renderMsWordEditor = () => {
    if (editorState !== 'active') {
      return renderEditorState();
    }
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md mr-3">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-medium">{document.title}</h3>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <span>{document.module}</span>
                <span className="mx-1">•</span>
                <span>Last saved: {document.lastModified}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handleCheckCompatibility}>
              Check Compatibility
            </Button>
            <Button size="sm" variant="outline" onClick={handleSaveDocument}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
            <Button size="sm" onClick={handleCloseDocument}>
              Close
            </Button>
          </div>
        </div>
        
        <div className="relative flex-1 border rounded-md overflow-hidden">
          {/* This would be the actual Microsoft Word iframe in a real implementation */}
          <div className="absolute inset-0 bg-white p-6">
            <div className="border-b border-slate-200 pb-3 mb-3">
              <div className="h-4 w-3/4 bg-slate-200 rounded mb-3"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
            </div>
            
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
            
            <div className="space-y-3 mb-6">
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-3/4"></div>
            </div>
            
            <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
            
            <div className="space-y-3">
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-5/6"></div>
            </div>
            
            <div className="absolute bottom-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
              Microsoft Copilot Available
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderVersionHistory = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Version History</h3>
          <Button variant="outline" size="sm">
            <History className="h-3.5 w-3.5 mr-1" />
            View All Versions
          </Button>
        </div>
        
        {versionHistory.map((version, index) => (
          <Card key={index} className={index === 0 ? 'border-blue-200 bg-blue-50' : ''}>
            <CardHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant={index === 0 ? 'default' : 'outline'} className="mr-2">v{version.version}</Badge>
                  <CardTitle className="text-base">
                    {version.commitMessage}
                  </CardTitle>
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">Current</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex justify-between items-start text-sm text-slate-600">
                <div>
                  <p className="mb-1">
                    {version.changes}
                  </p>
                  <div className="text-xs text-slate-500">
                    {version.user} • {version.date}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  {index > 0 && (
                    <Button variant="ghost" size="sm">
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderSyncStatus = () => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">VAULT Synchronization Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">Document Synchronized</p>
                <span className="text-sm text-green-600">✓ Synced</span>
              </div>
              <p className="text-sm text-slate-500">
                Last synchronized on {document.lastModified}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Lock className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">Permissions</p>
                <span className="text-sm text-green-600">✓ Read & Write</span>
              </div>
              <p className="text-sm text-slate-500">
                You have full edit access to this document
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Cloud className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">Version Control</p>
                <span className="text-sm text-green-600">✓ Enabled</span>
              </div>
              <p className="text-sm text-slate-500">
                All changes are tracked and versioned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderMicrosoftCoAuthoring = () => {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Microsoft Co-Authoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Real-time collaboration active</AlertTitle>
            <AlertDescription>
              All changes are visible to collaborators in real-time.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-2">
                SJ
              </div>
              <div>
                <p className="font-medium">Sarah Johnson</p>
                <p className="text-xs text-slate-500">Editing now</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium mr-2">
                MC
              </div>
              <div>
                <p className="font-medium">Michael Chen</p>
                <p className="text-xs text-slate-500">Viewed 35 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-medium mr-2">
                JL
              </div>
              <div>
                <p className="font-medium">Jennifer Lopez</p>
                <p className="text-xs text-slate-500">Viewed 2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <div className="md:col-span-2 h-full">
        {renderMsWordEditor()}
      </div>
      
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          </TabsList>
          
          <TabsContent value="document">
            {renderSyncStatus()}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Document Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Document Type</p>
                    <p className="font-medium">{document.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Module</p>
                    <p className="font-medium">{document.module}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="font-medium">
                      <Badge variant={
                        document.status === 'Approved' ? 'default' :
                        document.status === 'In Review' ? 'secondary' :
                        'outline'
                      }>
                        {document.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Document ID</p>
                    <p className="font-medium">{document.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Last Modified</p>
                    <p className="font-medium">{document.lastModified}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Modified By</p>
                    <p className="font-medium">{document.modifiedBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <ScrollArea className="h-[calc(100vh-220px)]">
              {renderVersionHistory()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="collaborators">
            {renderMicrosoftCoAuthoring()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ECTDMsWordIntegration;