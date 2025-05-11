import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Edit, Clock, CheckCircle, Upload, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import DocumentUploader from '../components/office/DocumentUploader';

/**
 * eCTD Co-Author Dashboard
 * 
 * Main dashboard for the eCTD Co-Author module, featuring document editing,
 * templates, and validation capabilities.
 */
const CoAuthorDashboard = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [validationResults, setValidationResults] = useState({
    contentCompleteness: 78,
    regulatoryCompliance: 92,
    referenceValidation: 65,
    issues: [
      {
        id: 1,
        severity: 'warning',
        message: '4 validation issues require attention',
        detail: 'Missing source citation in section 3.2.S and incomplete benefit-risk assessment',
      }
    ]
  });
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isValidationReportOpen, setIsValidationReportOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch documents, templates, and validation results on component mount
  useEffect(() => {
    // Mock data setup for demonstration
    setDocuments([
      {
        id: 'doc1',
        title: 'Module 2.5 Clinical Overview',
        module: 'Module 2',
        status: 'in-progress',
        lastEdited: '2 hours ago',
      },
      {
        id: 'doc2',
        title: 'CMC Section 3.2.P',
        module: 'Module 3',
        status: 'draft',
        lastEdited: '1 day ago',
      },
      {
        id: 'doc3',
        title: 'Clinical Overview',
        module: 'Module 2',
        status: 'final',
        lastEdited: '3 days ago',
      }
    ]);
    
    setTemplates([
      {
        id: 'templ1',
        title: 'Clinical Overview Template',
        module: 'Module 2',
        agency: ['US FDA'],
        lastUpdated: '2 months ago',
      },
      {
        id: 'templ2',
        title: 'CTD Module 3 Quality Template',
        module: 'Module 3',
        agency: ['US FDA', 'EU EMA'],
        lastUpdated: '1 month ago',
      },
      {
        id: 'templ3',
        title: 'NDA Cover Letter Template',
        module: 'Module 1',
        agency: ['US FDA', 'EU EMA'],
        lastUpdated: '3 weeks ago',
      }
    ]);
  }, []);
  
  // Handle document edit
  const handleEditDocument = (document) => {
    toast({
      title: "Opening document",
      description: `Opening ${document.title} for editing`
    });
    
    // In a full implementation, this would navigate to the document editor
    // with the specific document loaded
    window.location.href = `/co-author/edit/${document.id}`;
  };
  
  // Handle new document creation
  const handleCreateNew = () => {
    setIsUploaderOpen(true);
  };
  
  // Handle document upload
  const handleImport = () => {
    setIsUploaderOpen(true);
  };
  
  // Handle document selection from uploader
  const handleDocumentSelected = (documentInfo) => {
    setIsUploaderOpen(false);
    
    toast({
      title: "Document Ready",
      description: `${documentInfo.name} is ready for editing`
    });
    
    // In a full implementation, this would navigate to the document editor
    // with the selected document
  };
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    toast({
      title: "Template Selected",
      description: `Creating new document from ${template.title}`
    });
    
    // In a full implementation, this would navigate to the document editor
    // with the template loaded
  };
  
  // Handle template upload
  const handleUploadTemplate = () => {
    setIsUploaderOpen(true);
  };
  
  // Format badge for document status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Draft</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">In Progress</Badge>;
      case 'final':
        return <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Final</Badge>;
      default:
        return null;
    }
  };
  
  // Render document list
  const renderDocuments = () => {
    if (documents.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Create a new document or import an existing one to get started</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleCreateNew}>Create New</Button>
            <Button variant="outline" onClick={handleImport}>Import</Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <div className="flex">
              <div className="flex-1 p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-medium">{doc.title}</h3>
                  {getStatusBadge(doc.status)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{doc.module} • Last edited {doc.lastEdited}</p>
                </div>
              </div>
              <div className="bg-muted/20 p-4 flex items-center">
                <Button variant="ghost" size="sm" onClick={() => handleEditDocument(doc)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render template cards
  const renderTemplates = () => {
    if (templates.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates available</h3>
          <p className="text-muted-foreground mb-4">Upload a template to get started</p>
          <Button onClick={handleUploadTemplate}>Upload Template</Button>
        </div>
      );
    }
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Featured Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-500" />
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </div>
                <CardDescription>
                  {template.module} • Updated {template.lastUpdated}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2">
                  {template.agency.map((agency, index) => (
                    <Badge key={index} variant="secondary">{agency}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => handleSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  // Render validation dashboard
  const renderValidation = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Module 2.5 Clinical Overview</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Content Completeness</span>
              <span className="text-sm font-medium">{validationResults.contentCompleteness}%</span>
            </div>
            <Progress value={validationResults.contentCompleteness} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Regulatory Compliance</span>
              <span className="text-sm font-medium">{validationResults.regulatoryCompliance}%</span>
            </div>
            <Progress value={validationResults.regulatoryCompliance} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Reference Validation</span>
              <span className="text-sm font-medium">{validationResults.referenceValidation}%</span>
            </div>
            <Progress value={validationResults.referenceValidation} className="h-2" />
          </div>
        </div>
        
        {validationResults.issues.map((issue) => (
          <Card key={issue.id} className={issue.severity === 'warning' ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50'}>
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  <AlertTriangle className={issue.severity === 'warning' ? 'text-amber-600 h-5 w-5' : 'text-red-600 h-5 w-5'} />
                </div>
                <div>
                  <p className="font-medium mb-1">{issue.message}</p>
                  <p className="text-sm text-muted-foreground">{issue.detail}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm">Overall: <span className="font-medium">{validationResults.contentCompleteness}% complete</span></p>
            <Button variant="outline" onClick={() => setIsValidationReportOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Document
            </Button>
          </div>
          
          <Button className="w-full" onClick={() => setIsValidationReportOpen(true)}>
            Open Validation Report
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">eCTD Co-Author</h1>
        <p className="text-muted-foreground">Create, edit, and validate regulatory documents for eCTD submissions</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="editor" className="py-3">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-1.5 mr-3">
                <Edit className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">AI-Powered Document Editor</div>
                <div className="text-xs text-muted-foreground">Create and edit regulatory documents with intelligent assistance</div>
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="templates" className="py-3">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-1.5 mr-3">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Document Templates</div>
                <div className="text-xs text-muted-foreground">Start with pre-approved templates for regulatory documents</div>
              </div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="validation" className="py-3">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-1.5 mr-3">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Validation Dashboard</div>
                <div className="text-xs text-muted-foreground">Ensure compliance with regulatory requirements</div>
              </div>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <div className="border rounded-lg p-6 bg-card">
          <TabsContent value="editor" className="m-0">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Documents</h2>
              <div className="flex space-x-2">
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
                <Button variant="outline" onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            
            {renderDocuments()}
            
            {documents.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link">View All Documents</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="templates" className="m-0">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Document Templates</h2>
              <Button variant="outline" onClick={handleUploadTemplate}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </div>
            
            {renderTemplates()}
          </TabsContent>
          
          <TabsContent value="validation" className="m-0">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Validation Dashboard</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Standards Reference
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View regulatory standards and validation criteria</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {renderValidation()}
          </TabsContent>
        </div>
      </Tabs>
      
      <DocumentUploader
        isOpen={isUploaderOpen}
        onOpenChange={setIsUploaderOpen}
        onDocumentSelected={handleDocumentSelected}
      />
      
      <Dialog open={isValidationReportOpen} onOpenChange={setIsValidationReportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validation Report - Module 2.5 Clinical Overview</DialogTitle>
            <DialogDescription>
              Detailed validation results and compliance status for your document
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Content Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center">{validationResults.contentCompleteness}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Regulatory Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center">{validationResults.regulatoryCompliance}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reference Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-center">{validationResults.referenceValidation}%</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Issues Requiring Attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded bg-amber-50 border-amber-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Missing source citation in section 3.2.S</p>
                      <p className="text-sm text-muted-foreground">Add appropriate citations for all data presented in this section.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded bg-amber-50 border-amber-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Incomplete benefit-risk assessment</p>
                      <p className="text-sm text-muted-foreground">The benefit-risk assessment section is missing required elements according to FDA guidance.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded bg-amber-50 border-amber-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Inconsistent formatting of tables</p>
                      <p className="text-sm text-muted-foreground">Table formatting is inconsistent across the document. Standardize according to eCTD guidelines.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border rounded bg-amber-50 border-amber-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Missing cross-references</p>
                      <p className="text-sm text-muted-foreground">Section 2.5.6 contains references to data that should be cross-referenced to Module 5.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsValidationReportOpen(false)}>Close</Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoAuthorDashboard;