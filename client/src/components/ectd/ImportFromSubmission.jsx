/**
 * Import from Submission Component for eCTD Module
 * 
 * This component allows clients to import existing documents from their
 * past submissions as templates for future use.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '../../contexts/TenantContext';
import { FileText, FilePlus, ChevronRight, Clock, Check } from 'lucide-react';

export default function ImportFromSubmission({ onImportComplete }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const { toast } = useToast();
  const { currentClientWorkspace } = useTenant();
  
  // Fetch client's previous submissions
  useEffect(() => {
    if (!currentClientWorkspace?.id) return;
    
    async function fetchSubmissions() {
      try {
        setLoading(true);
        
        // In a real implementation, call an API
        // For demo purposes, use mock data
        setTimeout(() => {
          setSubmissions(getMockSubmissions());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "Failed to load submissions",
          description: "Please try again later",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    fetchSubmissions();
  }, [currentClientWorkspace?.id, toast]);
  
  // When a submission is selected, fetch its documents
  useEffect(() => {
    if (!selectedSubmission) {
      setDocuments([]);
      return;
    }
    
    async function fetchSubmissionDocuments() {
      try {
        setLoading(true);
        
        // In a real implementation, call an API
        // For demo purposes, use mock data
        setTimeout(() => {
          setDocuments(getMockDocuments(selectedSubmission));
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching submission documents:', error);
        toast({
          title: "Failed to load documents",
          description: "Please try again or select a different submission",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    fetchSubmissionDocuments();
  }, [selectedSubmission, toast]);
  
  const handleDocumentSelection = (documentId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };
  
  const handlePreviewDocument = (document) => {
    setPreviewDocument(document);
    setShowPreview(true);
  };
  
  const handleImportAsTemplates = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to import",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, call an API
      // For demo purposes, simulate processing
      setTimeout(() => {
        const importedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
        
        // Convert documents to templates
        const newTemplates = importedDocs.map(doc => ({
          id: `t${Date.now()}-${doc.id}`,
          name: `${doc.name} Template`,
          description: `Template created from ${doc.name} in ${getSubmissionName(selectedSubmission)}`,
          category: getModuleCategory(doc.module),
          tags: [doc.documentType, 'Imported', getSubmissionName(selectedSubmission)],
          content: doc.content || getMockContent(getModuleCategory(doc.module)),
          lastModified: new Date().toISOString(),
          useCount: 0,
          versions: 1
        }));
        
        if (onImportComplete) {
          onImportComplete(newTemplates);
        }
        
        toast({
          title: "Templates imported successfully",
          description: `Imported ${newTemplates.length} templates from your submission`,
        });
        
        // Reset selections
        setSelectedDocuments([]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error importing templates:', error);
      toast({
        title: "Import failed",
        description: "There was an error importing the selected documents",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  // Helper function to get submission name
  const getSubmissionName = (submissionId) => {
    const submission = submissions.find(s => s.id === submissionId);
    return submission ? submission.name : '';
  };
  
  // Mock data for submissions
  const getMockSubmissions = () => {
    return [
      { 
        id: 'sub-001', 
        name: 'CardioTech IND Submission', 
        submittedDate: '2025-03-15T10:30:00Z',
        status: 'approved', 
        submissionType: 'IND'
      },
      { 
        id: 'sub-002', 
        name: 'NeuroClear 510(k) Submission', 
        submittedDate: '2025-02-10T14:22:00Z',
        status: 'under-review', 
        submissionType: '510(k)'
      },
      { 
        id: 'sub-003', 
        name: 'Enzymax Forte NDA Submission', 
        submittedDate: '2025-01-28T09:15:00Z',
        status: 'approved', 
        submissionType: 'NDA'
      }
    ];
  };
  
  // Mock data for documents
  const getMockDocuments = (submissionId) => {
    switch(submissionId) {
      case 'sub-001':
        return [
          { 
            id: 'doc-101', 
            name: 'Cover Letter', 
            module: 'Module 1',
            documentType: 'Cover Letter',
            fileSize: '210 KB',
            lastModified: '2025-03-10T15:30:00Z',
            content: getMockContent('m1')
          },
          { 
            id: 'doc-102', 
            name: 'Clinical Overview', 
            module: 'Module 2',
            documentType: 'Clinical Overview',
            fileSize: '1.2 MB',
            lastModified: '2025-03-08T11:45:00Z',
            content: getMockContent('m2')
          },
          { 
            id: 'doc-103', 
            name: 'Quality Control Protocol', 
            module: 'Module 3',
            documentType: 'Quality Control',
            fileSize: '820 KB',
            lastModified: '2025-03-05T09:15:00Z',
            content: getMockContent('m3')
          }
        ];
      case 'sub-002':
        return [
          { 
            id: 'doc-201', 
            name: '510(k) Summary', 
            module: 'Module 1',
            documentType: '510(k) Summary',
            fileSize: '350 KB',
            lastModified: '2025-02-08T14:30:00Z',
            content: getMockContent('m1')
          },
          { 
            id: 'doc-202', 
            name: 'Substantial Equivalence Comparison', 
            module: 'Module 2',
            documentType: 'Comparison',
            fileSize: '620 KB',
            lastModified: '2025-02-05T16:45:00Z',
            content: getMockContent('m2')
          }
        ];
      case 'sub-003':
        return [
          { 
            id: 'doc-301', 
            name: 'NDA Form FDA 356h', 
            module: 'Module 1',
            documentType: 'Application Form',
            fileSize: '180 KB',
            lastModified: '2025-01-20T10:15:00Z',
            content: getMockContent('m1')
          },
          { 
            id: 'doc-302', 
            name: 'Nonclinical Overview', 
            module: 'Module 2',
            documentType: 'Nonclinical Overview',
            fileSize: '1.5 MB',
            lastModified: '2025-01-18T11:30:00Z',
            content: getMockContent('m2')
          },
          { 
            id: 'doc-303', 
            name: 'Drug Substance Specifications', 
            module: 'Module 3',
            documentType: 'Specifications',
            fileSize: '950 KB',
            lastModified: '2025-01-15T14:45:00Z',
            content: getMockContent('m3')
          },
          { 
            id: 'doc-304', 
            name: 'Toxicology Study Report', 
            module: 'Module 4',
            documentType: 'Toxicology',
            fileSize: '2.3 MB',
            lastModified: '2025-01-12T09:30:00Z',
            content: getMockContent('m4')
          }
        ];
      default:
        return [];
    }
  };
  
  // Helper function to get module category from module name
  const getModuleCategory = (moduleName) => {
    switch(moduleName) {
      case 'Module 1': return 'm1';
      case 'Module 2': return 'm2';
      case 'Module 3': return 'm3';
      case 'Module 4': return 'm4';
      case 'Module 5': return 'm5';
      default: return 'm1';
    }
  };
  
  // Mock content for preview
  const getMockContent = (category) => {
    switch(category) {
      case 'm1':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Cover Letter Template</h1>
          <p style="margin-bottom: 10px;">[Company Letterhead]</p>
          <p style="margin-bottom: 10px;">[Date]</p>
          <p style="margin-bottom: 10px;">Food and Drug Administration<br>
          Center for Drug Evaluation and Research<br>
          Central Document Room<br>
          5901-B Ammendale Road<br>
          Beltsville, MD 20705-1266</p>
          <p style="margin-bottom: 10px;"><strong>Subject:</strong> [Application Type] [Application Number]<br>
          [Product Name] ([Generic Name])<br>
          [Submission Type]</p>
        `;
      case 'm2':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Quality Overall Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">2.3.S Drug Substance</h2>
          <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 10px;">2.3.S.1 General Information</h3>
          <p style="margin-bottom: 10px;">[Provide the nomenclature, molecular structure, and general properties of the drug substance]</p>
        `;
      case 'm3':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Drug Substance Specifications</h1>
          <p style="margin-bottom: 10px;"><strong>3.2.S.4.1 Specification</strong></p>
          <p style="margin-bottom: 10px;">The drug substance specification is provided in Table 1.</p>
          <p style="margin-bottom: 10px;"><strong>Table 1: Drug Substance Specification</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Test</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Method</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Acceptance Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Description</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Visual</td>
                <td style="border: 1px solid #ddd; padding: 8px;">[Description]</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Identification</td>
                <td style="border: 1px solid #ddd; padding: 8px;">IR</td>
                <td style="border: 1px solid #ddd; padding: 8px;">Conforms to reference spectrum</td>
              </tr>
            </tbody>
          </table>
        `;
      case 'm4':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Toxicology Summary</h1>
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">4.2.3.2 Repeat-Dose Toxicity</h2>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Title of Study]</p>
          <p style="margin-bottom: 10px;"><strong>Study No.:</strong> [Study Number]</p>
          <p style="margin-bottom: 10px;"><strong>Testing Facility:</strong> [Name of Testing Facility]</p>
          <p style="margin-bottom: 10px;"><strong>GLP Compliance:</strong> This study was conducted in compliance with Good Laboratory Practice Regulations.</p>
        `;
      case 'm5':
        return `
          <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Clinical Study Report Synopsis</h1>
          <p style="margin-bottom: 10px;"><strong>Protocol Number:</strong> [Protocol Number]</p>
          <p style="margin-bottom: 10px;"><strong>Study Title:</strong> [Study Title]</p>
          <p style="margin-bottom: 10px;"><strong>Phase:</strong> [Phase]</p>
          <p style="margin-bottom: 10px;"><strong>Study Design:</strong> [Study Design]</p>
          <p style="margin-bottom: 10px;"><strong>Study Centers:</strong> [Number and Location of Study Centers]</p>
        `;
      default:
        return '<p>Document content preview not available.</p>';
    }
  };
  
  // Helper function to get module badge color
  const getModuleBadgeColor = (moduleName) => {
    switch(moduleName) {
      case 'Module 1': return 'blue';
      case 'Module 2': return 'green';
      case 'Module 3': return 'orange';
      case 'Module 4': return 'purple';
      case 'Module 5': return 'red';
      default: return 'default';
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import from Previous Submissions</CardTitle>
        <CardDescription>
          Convert documents from your past submissions into reusable templates
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Select 
            value={selectedSubmission} 
            onValueChange={setSelectedSubmission}
            disabled={submissions.length === 0 || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a submission" />
            </SelectTrigger>
            <SelectContent>
              {submissions.map(submission => (
                <SelectItem key={submission.id} value={submission.id}>
                  {submission.name} - {formatDate(submission.submittedDate)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {loading && (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading documents...</p>
            </div>
          )}
          
          {!loading && selectedSubmission && documents.length === 0 && (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600">No documents found</h3>
              <p className="text-gray-500 mt-1">
                No documents found in this submission
              </p>
            </div>
          )}
          
          {!loading && documents.length > 0 && (
            <div className="border rounded-md">
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-medium">Available Documents</span>
                <span className="text-sm text-gray-500">{selectedDocuments.length} selected</span>
              </div>
              
              <div className="divide-y">
                {documents.map(document => (
                  <div key={document.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`doc-${document.id}`}
                        checked={selectedDocuments.includes(document.id)}
                        onCheckedChange={() => handleDocumentSelection(document.id)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <label 
                            htmlFor={`doc-${document.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {document.name}
                          </label>
                          <Badge variant={getModuleBadgeColor(document.module)}>
                            {document.module}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            {document.documentType} • {document.fileSize}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock size={12} className="mr-1" />
                            <span>Modified: {formatDate(document.lastModified)}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => handlePreviewDocument(document)}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end pt-4">
        <Button
          onClick={handleImportAsTemplates}
          disabled={loading || selectedDocuments.length === 0}
          className="flex items-center"
        >
          <FilePlus className="mr-2" size={16} />
          Import Selected as Templates
          <ChevronRight className="ml-1" size={16} />
        </Button>
      </CardFooter>
      
      {/* Document Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{previewDocument?.name}</span>
              {previewDocument && (
                <Badge variant={getModuleBadgeColor(previewDocument.module)}>
                  {previewDocument.module}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-md p-4 bg-white">
            <ScrollArea className="h-[400px]">
              {previewDocument && (
                <div dangerouslySetInnerHTML={{ __html: previewDocument.content || getMockContent(getModuleCategory(previewDocument.module)) }} />
              )}
            </ScrollArea>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Last modified: {previewDocument ? formatDate(previewDocument.lastModified) : ''}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (previewDocument) {
                    handleDocumentSelection(previewDocument.id);
                    if (!selectedDocuments.includes(previewDocument.id)) {
                      toast({
                        title: "Document Added",
                        description: "Document added to the selection",
                      });
                    }
                  }
                  setShowPreview(false);
                }}
              >
                <Check size={16} className="mr-1" />
                Add to Selection
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}