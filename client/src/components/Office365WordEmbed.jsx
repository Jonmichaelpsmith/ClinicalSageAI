import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock,
  History,
  Users
} from 'lucide-react';

import MicrosoftWordEmbed from './office/MicrosoftWordEmbed';
import { getDocumentForEditing, saveDocumentToVault } from '../services/msOfficeVaultBridge';

/**
 * Office 365 Word Embed Component
 * 
 * This component integrates Microsoft Word 365 directly into the TrialSage platform
 * with regulatory document formatting and compliance features.
 */
const Office365WordEmbed = ({
  isOpen,
  onOpenChange,
  documentId,
  documentName = "Untitled Document",
  documentType = "ind",
  ctdSection = "",
  isTemplate = false,
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [documentStatus, setDocumentStatus] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sharepointId, setSharepointId] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  
  const { toast } = useToast();
  
  // Load document on component mount
  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);
  
  // Load document from Vault and prepare for editing in SharePoint
  const loadDocument = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const documentInfo = await getDocumentForEditing(documentId);
      setSharepointId(documentInfo.sharepointId);
      setDocumentStatus('loaded');
      setIsLoading(false);
      
      // Fetch version history
      fetchVersionHistory();
      
      // Mock collaborators data (would be fetched from API in real implementation)
      setCollaborators([
        { id: 1, name: 'John Doe', role: 'Author', status: 'active' },
        { id: 2, name: 'Jane Smith', role: 'Reviewer', status: 'idle' }
      ]);
    } catch (err) {
      console.error('Failed to load document:', err);
      setError(err.message || 'Failed to load document');
      setIsLoading(false);
    }
  };
  
  // Fetch document version history
  const fetchVersionHistory = async () => {
    try {
      // This would be an API call in a real implementation
      // Mock version history data
      const history = [
        { id: 'v3', version: '0.3', modifiedBy: 'John Doe', modifiedDate: '2025-05-10T15:30:00Z', comment: 'Added safety data section' },
        { id: 'v2', version: '0.2', modifiedBy: 'Jane Smith', modifiedDate: '2025-05-08T11:20:00Z', comment: 'Updated protocol design' },
        { id: 'v1', version: '0.1', modifiedBy: 'John Doe', modifiedDate: '2025-05-05T09:45:00Z', comment: 'Initial draft' }
      ];
      
      setVersionHistory(history);
    } catch (err) {
      console.error('Failed to fetch version history:', err);
      // Don't set error state here to avoid blocking the main functionality
    }
  };
  
  // Handle document status change
  const handleDocumentStatusChange = (status) => {
    setDocumentStatus(status);
  };
  
  // Handle document save
  const handleSaveDocument = async (documentInfo) => {
    setIsSaving(true);
    
    try {
      await saveDocumentToVault(documentId, documentInfo.sharepointId);
      
      toast({
        title: "Document Saved",
        description: `Successfully saved: ${documentName}`
      });
      
      // Refresh version history after save
      fetchVersionHistory();
      
      setIsSaving(false);
    } catch (err) {
      console.error('Failed to save document:', err);
      
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save document"
      });
      
      setIsSaving(false);
    }
  };
  
  // Handle document version selection
  const handleVersionSelect = (version) => {
    toast({
      title: "Version Selected",
      description: `Loading version ${version.version} from ${new Date(version.modifiedDate).toLocaleDateString()}`
    });
    
    // In a real implementation, this would load the selected version
  };
  
  // Render version history
  const renderVersionHistory = () => {
    if (versionHistory.length === 0) {
      return (
        <div className="text-center py-6">
          <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">No version history available</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {versionHistory.map((version) => (
          <Card key={version.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleVersionSelect(version)}>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium flex items-center">
                    <span>Version {version.version}</span>
                    {version.id === 'v3' && 
                      <Badge className="ml-2 bg-green-100 text-green-800">Current</Badge>
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">{version.comment}</div>
                </div>
                <div className="text-right text-sm">
                  <div>{version.modifiedBy}</div>
                  <div className="text-muted-foreground">
                    {new Date(version.modifiedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render collaborators
  const renderCollaborators = () => {
    if (collaborators.length === 0) {
      return (
        <div className="text-center py-6">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">No active collaborators</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {collaborators.map((user) => (
          <div key={user.id} className="flex items-center p-3 border rounded-md">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.role}</div>
            </div>
            <div>
              {user.status === 'active' ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">Idle</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} className="max-w-6xl">
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {documentName}
              {documentType && ctdSection && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {documentType.toUpperCase()} - {ctdSection}
                </Badge>
              )}
              {isTemplate && (
                <Badge className="ml-2 bg-purple-100 text-purple-800">Template</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-3.5rem)]">
          {/* Word Editor (main content) */}
          <div className="flex-1 relative">
            <MicrosoftWordEmbed
              documentId={sharepointId}
              documentName={documentName}
              onStatusChange={handleDocumentStatusChange}
              onSave={handleSaveDocument}
              onClose={() => onOpenChange(false)}
              readOnly={readOnly}
            />
          </div>
          
          {/* Side panel for version history and collaborators */}
          <div className="w-72 border-l">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 mx-2 mt-2">
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="collaborate">
                  <Users className="h-4 w-4 mr-2" />
                  Collaborate
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto p-3">
                <TabsContent value="history" className="mt-0 h-full">
                  <h3 className="font-medium mb-3">Version History</h3>
                  {renderVersionHistory()}
                </TabsContent>
                
                <TabsContent value="collaborate" className="mt-0 h-full">
                  <h3 className="font-medium mb-3">Collaborators</h3>
                  {renderCollaborators()}
                </TabsContent>
              </div>
              
              <div className="p-3 border-t">
                <Button 
                  className="w-full" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Office365WordEmbed;