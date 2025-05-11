import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileIcon, UploadIcon, FileTextIcon, FilesIcon, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * Document Uploader Component
 * 
 * This component provides interfaces for:
 * - Uploading MS Word documents from desktop
 * - Selecting from existing templates
 * - Choosing previously uploaded documents
 * 
 * @param {Object} props
 * @param {function} props.onDocumentSelected - Callback when document is selected
 * @param {boolean} props.isOpen - Whether the uploader dialog is open
 * @param {function} props.onOpenChange - Callback when dialog open state changes
 */
const DocumentUploader = ({ 
  onDocumentSelected, 
  isOpen = false,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedExistingDoc, setSelectedExistingDoc] = useState('');
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([
    { id: 'ind-template', name: 'IND Application Template', category: 'FDA' },
    { id: 'cmc-template', name: 'CMC Documentation Template', category: 'FDA' },
    { id: 'csr-template', name: 'Clinical Study Report Template', category: 'ICH' },
    { id: 'nda-template', name: 'New Drug Application Template', category: 'FDA' },
    { id: 'bla-template', name: 'Biologics License Application Template', category: 'FDA' },
    { id: 'pv-template', name: 'Pharmacovigilance Report Template', category: 'EMA' },
    { id: 'protocol-template', name: 'Clinical Protocol Template', category: 'FDA/ICH' },
    { id: 'ib-template', name: 'Investigator\'s Brochure Template', category: 'FDA/ICH' }
  ]);
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  
  // Load user's documents when tab is selected
  React.useEffect(() => {
    if (activeTab === 'existing') {
      loadUserDocuments();
    }
  }, [activeTab]);
  
  // Load user's documents from server
  const loadUserDocuments = async () => {
    try {
      // In a real implementation, we would fetch from the API
      // For now, just show some mock data
      setDocuments([
        { id: 'doc1', name: 'Draft IND Application.docx', lastModified: '2025-05-10', size: '1.2 MB' },
        { id: 'doc2', name: 'Clinical Protocol.docx', lastModified: '2025-05-08', size: '3.7 MB' },
        { id: 'doc3', name: 'Biocompatibility Report.docx', lastModified: '2025-05-05', size: '2.1 MB' },
        { id: 'doc4', name: 'Investigator's Brochure Draft.docx', lastModified: '2025-05-01', size: '5.3 MB' }
      ]);
    } catch (error) {
      console.error('Error loading user documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your documents',
        variant: 'destructive',
      });
    }
  };
  
  // Handle file selection 
  const handleFileSelected = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type (Word documents and PDFs)
    const validExtensions = ['.docx', '.doc', '.pdf', '.dotx', '.dotm', '.xlsx', '.xls', '.pptx', '.ppt'];
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidFile) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a Microsoft Office document (Word, Excel, PowerPoint) or PDF file',
        variant: 'destructive',
      });
      return;
    }
    
    // Start upload
    uploadFile(file);
  };
  
  // Upload file to server
  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload using axios with progress tracking
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });
      
      // In a real implementation, we would use the response
      // For now, we'll just mock a successful upload
      
      // Simulating upload delay
      setTimeout(() => {
        setIsUploading(false);
        
        toast({
          title: 'Upload Complete',
          description: `${file.name} has been uploaded successfully.`,
        });
        
        // Call callback with the uploaded document info
        if (onDocumentSelected) {
          onDocumentSelected({
            id: 'new-doc-' + Date.now(),
            name: file.name,
            type: 'upload',
            content: '' // In a real app, we would get content from the server
          });
        }
        
        // Close dialog
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      
      toast({
        title: 'Upload Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle template selection
  const handleTemplateSelected = () => {
    if (!selectedTemplate) {
      toast({
        title: 'Selection Required',
        description: 'Please select a template',
        variant: 'destructive',
      });
      return;
    }
    
    // Get selected template details
    const template = templates.find(t => t.id === selectedTemplate);
    
    // Call callback with the selected template info
    if (onDocumentSelected) {
      onDocumentSelected({
        id: template.id,
        name: template.name,
        type: 'template',
        category: template.category
      });
    }
    
    // Close dialog
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    toast({
      title: 'Template Selected',
      description: `${template.name} has been selected.`,
    });
  };
  
  // Handle existing document selection
  const handleExistingDocSelected = () => {
    if (!selectedExistingDoc) {
      toast({
        title: 'Selection Required',
        description: 'Please select a document',
        variant: 'destructive',
      });
      return;
    }
    
    // Get selected document details
    const document = documents.find(d => d.id === selectedExistingDoc);
    
    // Call callback with the selected document info
    if (onDocumentSelected) {
      onDocumentSelected({
        id: document.id,
        name: document.name,
        type: 'existing'
      });
    }
    
    // Close dialog
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    toast({
      title: 'Document Selected',
      description: `${document.name} has been selected.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Open Document</DialogTitle>
          <DialogDescription>
            Upload a new document, choose a template, or select an existing document.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload">
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="existing">
              <FilesIcon className="h-4 w-4 mr-2" />
              My Documents
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>
                  Upload a Microsoft Word document from your computer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <UploadIcon className="h-8 w-8 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Office Documents (Word, Excel, PowerPoint) & PDF Files
                  </p>
                  
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".docx,.doc,.pdf,.dotx,.dotm,.xlsx,.xls,.pptx,.ppt" 
                    onChange={handleFileSelected}
                  />
                  
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading {uploadProgress}%
                      </>
                    ) : (
                      <>Select File</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>
                  Choose from our library of regulatory document templates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Select a template --</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTemplate && (
                    <div className="border rounded-md p-4 mt-4">
                      <div className="flex items-start">
                        <FileIcon className="h-8 w-8 mr-4 text-blue-500" />
                        <div>
                          <h4 className="font-medium">
                            {templates.find(t => t.id === selectedTemplate)?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {templates.find(t => t.id === selectedTemplate)?.category} Compliant
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            This template includes all sections required for regulatory submission.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleTemplateSelected} disabled={!selectedTemplate}>
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Existing Documents Tab */}
          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>
                  Select from your previously uploaded documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FilesIcon className="h-8 w-8 mx-auto mb-2" />
                      <p>No documents found</p>
                    </div>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {documents.map(doc => (
                        <div 
                          key={doc.id}
                          className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${selectedExistingDoc === doc.id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedExistingDoc(doc.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <FileIcon className="h-5 w-5 mr-2 text-blue-500" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                            <div className="flex text-xs text-gray-500 mt-1">
                              <span className="mr-3">Modified: {doc.lastModified}</span>
                              <span>{doc.size}</span>
                            </div>
                          </div>
                          <input 
                            type="radio" 
                            checked={selectedExistingDoc === doc.id}
                            onChange={() => setSelectedExistingDoc(doc.id)}
                            className="ml-2"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleExistingDocSelected} disabled={!selectedExistingDoc}>
                  Open Document
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;