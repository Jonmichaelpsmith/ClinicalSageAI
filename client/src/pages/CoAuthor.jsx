import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

import { 
  Book, 
  Upload, 
  FileText, 
  Save, 
  RefreshCw, 
  ExternalLink, 
  PlusCircle,
  Building,
  BookOpen,
  FileCheck,
  // Remove ParagraphIcon which doesn't exist
} from 'lucide-react';

// Import our custom components
import DocumentUploader from '../components/office/DocumentUploader';
import AiPoweredWordEditor from '../components/office/AiPoweredWordEditor';

// Import Microsoft service integrations
import * as MicrosoftAuthService from '../services/microsoftAuthService';

/**
 * eCTD Co-Author Page Component
 * 
 * This is the main page for the eCTD Co-Author module that integrates Microsoft Word
 * with AI-powered compliance capabilities for regulatory document authoring.
 */
const CoAuthor = () => {
  // State for active document
  const [activeDocument, setActiveDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTenant, setActiveTenant] = useState('Pharma Company A');
  
  // State for Microsoft authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  
  // State for UI
  const [activeTab, setActiveTab] = useState('documents');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Get document ID from URL if available
  const [location] = useLocation();
  const { id } = useParams('/coauthor/:id') || {};
  
  // Load recent documents on component mount
  useEffect(() => {
    // Fetch recent documents when component mounts
    fetchRecentDocuments();
    
    // Fetch templates
    fetchTemplates();
    
    // Check Microsoft authentication status
    checkAuthentication();
    
    // If document ID is provided in URL, load it
    if (id) {
      loadDocument(id);
    }
  }, [id]);
  
  /**
   * Check Microsoft authentication status
   */
  const checkAuthentication = async () => {
    try {
      const auth = await MicrosoftAuthService.isAuthenticated();
      setIsAuthenticated(auth);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };
  
  /**
   * Authenticate with Microsoft
   */
  const handleAuthenticate = async () => {
    try {
      setAuthenticating(true);
      
      const authResult = await MicrosoftAuthService.signInWithMicrosoft();
      
      if (authResult.success) {
        setIsAuthenticated(true);
        toast({
          title: 'Authentication Successful',
          description: 'Successfully authenticated with Microsoft Office 365',
          variant: 'default'
        });
      } else {
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to authenticate with Microsoft',
        variant: 'destructive'
      });
    } finally {
      setAuthenticating(false);
    }
  };
  
  /**
   * Fetch recent documents
   */
  const fetchRecentDocuments = async () => {
    // In a real implementation, this would call your API to get recent documents
    // For now, use placeholder data
    
    setRecentDocuments([
      {
        id: 'doc-1',
        name: '2.5 Clinical Overview - Study XYZ-123',
        ectdSection: 'm2.5',
        lastModified: '2025-05-10T15:30:00Z',
        modifiedBy: 'John Smith',
        status: 'draft',
        url: 'https://tenant.sharepoint.com/sites/ClinicalSageAI/Shared%20Documents/Regulatory/2.5%20Clinical%20Overview.docx'
      },
      {
        id: 'doc-2',
        name: '2.7.3 Summary of Clinical Efficacy',
        ectdSection: 'm2.7.3',
        lastModified: '2025-05-09T12:15:00Z',
        modifiedBy: 'Jane Doe',
        status: 'in-review',
        url: 'https://tenant.sharepoint.com/sites/ClinicalSageAI/Shared%20Documents/Regulatory/2.7.3%20Summary%20of%20Clinical%20Efficacy.docx'
      },
      {
        id: 'doc-3',
        name: '2.4 Nonclinical Overview',
        ectdSection: 'm2.4',
        lastModified: '2025-05-08T10:45:00Z',
        modifiedBy: 'Alice Johnson',
        status: 'approved',
        url: 'https://tenant.sharepoint.com/sites/ClinicalSageAI/Shared%20Documents/Regulatory/2.4%20Nonclinical%20Overview.docx'
      }
    ]);
  };
  
  /**
   * Fetch document templates
   */
  const fetchTemplates = async () => {
    // In a real implementation, this would call your API to get templates
    // For now, use placeholder data
    
    setTemplates([
      {
        id: 'template-1',
        name: 'Clinical Overview Template',
        ectdSection: 'm2.5',
        description: 'Standard template for Module 2.5 Clinical Overview'
      },
      {
        id: 'template-2',
        name: 'Summary of Clinical Efficacy Template',
        ectdSection: 'm2.7.3',
        description: 'Template for Module 2.7.3 Summary of Clinical Efficacy'
      },
      {
        id: 'template-3',
        name: 'Nonclinical Overview Template',
        ectdSection: 'm2.4',
        description: 'Template for Module 2.4 Nonclinical Overview'
      }
    ]);
  };
  
  /**
   * Load a document
   */
  const loadDocument = async (documentId) => {
    try {
      // In a real implementation, this would call your API to get document details
      // For now, find the document in our recent documents list
      
      const document = recentDocuments.find(doc => doc.id === documentId);
      
      if (document) {
        setActiveDocument(document);
        setActiveTab('editor');
      } else {
        // Simulate API call to get document
        // This would be an actual API call in a real implementation
        setTimeout(() => {
          const mockDocument = {
            id: documentId,
            name: `Document ${documentId}`,
            ectdSection: 'm2.5',
            lastModified: new Date().toISOString(),
            modifiedBy: 'Current User',
            status: 'draft',
            url: `https://tenant.sharepoint.com/sites/ClinicalSageAI/Shared%20Documents/Regulatory/Document_${documentId}.docx`
          };
          
          setActiveDocument(mockDocument);
          setActiveTab('editor');
        }, 500);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: 'Document Error',
        description: 'Failed to load the document',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Create a new document from template
   */
  const createNewDocument = async (templateId) => {
    try {
      // Find the template
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      // In a real implementation, this would call your API to create a new document
      // based on the selected template
      
      // For now, simulate document creation
      setTimeout(() => {
        const newDocument = {
          id: `doc-${Date.now()}`,
          name: `New ${template.name.replace(' Template', '')}`,
          ectdSection: template.ectdSection,
          lastModified: new Date().toISOString(),
          modifiedBy: 'Current User',
          status: 'draft',
          url: `https://tenant.sharepoint.com/sites/ClinicalSageAI/Shared%20Documents/Regulatory/New_Document_${Date.now()}.docx`
        };
        
        // Add to recent documents
        setRecentDocuments(prevDocs => [newDocument, ...prevDocs]);
        
        // Set as active document
        setActiveDocument(newDocument);
        setActiveTab('editor');
        
        toast({
          title: 'Document Created',
          description: `Created new document from ${template.name}`,
          variant: 'default'
        });
      }, 800);
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: 'Document Creation Error',
        description: error.message || 'Failed to create document',
        variant: 'destructive'
      });
    }
  };
  
  /**
   * Handle document upload complete
   */
  const handleUploadComplete = (uploadedDocuments) => {
    if (uploadedDocuments.length > 0) {
      // Add uploaded documents to recent documents
      const newDocs = uploadedDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        ectdSection: doc.ectdSection,
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current User',
        status: 'draft',
        url: doc.url
      }));
      
      setRecentDocuments(prevDocs => [...newDocs, ...prevDocs]);
      
      // Set the first uploaded document as active
      setActiveDocument(newDocs[0]);
      setActiveTab('editor');
    }
  };
  
  /**
   * Handle document save
   */
  const handleDocumentSave = (saveResult) => {
    // Update the active document with the new version info
    if (activeDocument && saveResult) {
      setActiveDocument(prev => ({
        ...prev,
        lastModified: new Date().toISOString(),
        versionId: saveResult.versionId
      }));
      
      // Also update in recent documents list
      setRecentDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === activeDocument.id 
            ? {
                ...doc,
                lastModified: new Date().toISOString(),
                versionId: saveResult.versionId
              }
            : doc
        )
      );
    }
  };
  
  /**
   * Render status badge for a document
   */
  const renderStatusBadge = (status) => {
    const statusClasses = {
      'draft': 'bg-blue-100 text-blue-800',
      'in-review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Book className="h-8 w-8 mr-2 text-primary" />
            eCTD Co-Author
          </h1>
          <p className="text-muted-foreground">
            Create and edit regulatory documents with AI-powered compliance assistance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            <span className="font-medium">Tenant:</span> {activeTenant}
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <FileCheck className="h-4 w-4" />
              Microsoft Authenticated
            </div>
          ) : (
            <Button 
              size="sm" 
              onClick={handleAuthenticate}
              disabled={authenticating}
            >
              {authenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Building className="h-4 w-4 mr-2" />
                  Connect Microsoft 365
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="editor" 
            className="flex items-center"
            disabled={!activeDocument}
          >
            <FileText className="h-4 w-4 mr-2" />
            {activeDocument ? `Editing: ${activeDocument.name}` : 'Editor'}
          </TabsTrigger>
        </TabsList>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Documents
                </span>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fetchRecentDocuments()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Recently edited regulatory documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDocuments.length > 0 ? (
                <div className="space-y-2">
                  {recentDocuments.map(doc => (
                    <div 
                      key={doc.id} 
                      className="p-3 border rounded-md hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => loadDocument(doc.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 mr-3 mt-1 text-primary" />
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <div className="text-sm text-muted-foreground">
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs mr-2">
                                {doc.ectdSection}
                              </span>
                              Last modified: {new Date(doc.lastModified).toLocaleString()} by {doc.modifiedBy}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(doc.status)}
                          
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(doc.url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent documents found
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Document Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Document Templates
              </CardTitle>
              <CardDescription>
                Create a new document from a regulatory template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div 
                    key={template.id}
                    className="border rounded-md p-4 hover:bg-muted transition-colors"
                  >
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <div className="text-sm text-muted-foreground mb-3">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                        {template.ectdSection}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => createNewDocument(template.id)}
                      className="w-full"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Document
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload">
          <DocumentUploader onUploadComplete={handleUploadComplete} />
        </TabsContent>
        
        {/* Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          {activeDocument ? (
            <AiPoweredWordEditor
              documentId={activeDocument.id}
              documentUrl={activeDocument.url}
              documentName={activeDocument.name}
              ectdSection={activeDocument.ectdSection}
              readOnly={false}
              onSave={handleDocumentSave}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium mt-4">No Document Selected</h3>
                <p className="text-muted-foreground mt-2">
                  Please select a document from the Documents tab or upload a new document
                </p>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => setActiveTab('documents')}>
                    Browse Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoAuthor;