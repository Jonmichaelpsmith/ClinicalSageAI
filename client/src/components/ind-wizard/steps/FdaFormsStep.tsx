import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  FileUp, 
  History, 
  Sparkles,
  Info,
  ChevronRight,
  RotateCw,
  Clock,
  ClipboardEdit,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useWizard } from '../IndWizardLayout';

// Define form types with detailed metadata
const FDA_FORMS = [
  {
    id: '1571',
    name: 'Form FDA 1571',
    title: 'Investigational New Drug Application',
    description: 'The primary application form that initiates the IND process',
    required: true,
    difficulty: 'High',
    estimatedTime: '45-60 min',
    icon: FileText
  },
  {
    id: '1572',
    name: 'Form FDA 1572',
    title: 'Statement of Investigator',
    description: 'Completed by each principal investigator participating in the clinical investigation',
    required: true,
    difficulty: 'Medium',
    estimatedTime: '30-45 min',
    icon: FileText
  },
  {
    id: '3674',
    name: 'Form FDA 3674',
    title: 'Certification of Compliance',
    description: 'Certifies compliance with ClinicalTrials.gov requirements',
    required: true,
    difficulty: 'Low',
    estimatedTime: '15-20 min',
    icon: FileText
  },
  {
    id: '3454',
    name: 'Form FDA 3454',
    title: 'Financial Disclosure',
    description: 'Certification of financial arrangements with clinical investigators',
    required: true,
    difficulty: 'Medium',
    estimatedTime: '25-35 min',
    icon: FileText
  }
];

// Import DocuShare service functions
import { 
  uploadDocument, 
  downloadDocument, 
  searchDocuments, 
  listDocumentVersions
} from '@/services/DocuShareService';

export default function FdaFormsStep() {
  const { indData, updateIndData } = useWizard();
  const { toast } = useToast();
  const [selectedFormId, setSelectedFormId] = useState<string>('1571');
  const [formView, setFormView] = useState<'generate' | 'upload' | 'history' | 'guidance'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);
  const projectId = indData?.projectId || '';

  // Use TanStack Query to fetch form data
  const { data: formStatus, isLoading: isLoadingFormStatus, refetch: refetchFormStatus } = 
    useQuery({
      queryKey: ['formStatus', projectId, selectedFormId],
      queryFn: async () => {
        try {
          const response = await apiRequest('GET', `/api/ind/${projectId}/forms/${selectedFormId}/status`);
          if (!response.ok) throw new Error('Failed to fetch form status');
          return response.json();
        } catch (error) {
          // Fallback for demo purposes
          const mockStatus = {
            status: 'not_started',
            lastUpdated: null,
            version: null,
            aiRecommendations: [
              'Complete all sections with accurate drug substance information',
              'Ensure consistency between the IND forms and supporting documents',
              'Double-check all contact information for accuracy'
            ]
          };
          return mockStatus;
        }
      },
      enabled: !!projectId && !!selectedFormId
    });

  // Use TanStack Query to fetch AI guidance
  const { data: aiGuidance, isLoading: isLoadingGuidance } =
    useQuery({
      queryKey: ['formGuidance', projectId, selectedFormId],
      queryFn: async () => {
        try {
          const response = await apiRequest('GET', `/api/ind/${projectId}/forms/${selectedFormId}/guidance`);
          if (!response.ok) throw new Error('Failed to fetch AI guidance');
          return response.json();
        } catch (error) {
          // Fallback guidance data
          const selectedForm = FDA_FORMS.find(form => form.id === selectedFormId);
          return {
            description: `${selectedForm?.name} (${selectedForm?.title}) is a required FDA form for IND applications.`,
            tips: [
              'Complete all sections thoroughly and accurately',
              'Ensure consistency with other submission documents',
              'Review all fields carefully before submission'
            ],
            common_issues: [
              'Missing or incomplete information',
              'Inconsistencies with protocol or investigator details',
              'Improper certification statements'
            ]
          };
        }
      },
      enabled: formView === 'guidance' && !!projectId && !!selectedFormId
    });

  // Form generation mutation
  const generateFormMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/forms/${selectedFormId}/generate`);
        if (!response.ok) throw new Error('Failed to generate form');
        
        const responseData = await response.json();
        
        // For download functionality
        const downloadUrl = responseData.downloadUrl || `/api/ind/${projectId}/forms/${selectedFormId}/download`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Form_FDA_${selectedFormId}_${projectId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return responseData;
      } catch (error) {
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Form Generated Successfully',
        description: `Form FDA ${selectedFormId} has been generated and downloaded.`,
        variant: 'default',
      });
      refetchFormStatus();
    },
    onError: (error: Error) => {
      toast({
        title: 'Form Generation Failed',
        description: error.message || 'Unable to generate the requested form. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Use TanStack Query to fetch document history for the selected form
  const { data: documentHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = 
    useQuery({
      queryKey: ['documentHistory', projectId, selectedFormId],
      queryFn: async () => {
        try {
          // Use existing DocuShare service to search for documents with form metadata
          const searchParams = {
            metadata: {
              formId: selectedFormId,
              projectId: projectId,
              documentType: 'FDA_FORM'
            },
            limit: 10
          };
          
          const documents = await searchDocuments(searchParams);
          
          if (documents && documents.length > 0) {
            // For each document, get its version history
            const documentsWithVersions = await Promise.all(documents.map(async (doc: any) => {
              const versions = await listDocumentVersions(doc.objectId);
              return {
                ...doc,
                versions: versions || []
              };
            }));
            
            return documentsWithVersions;
          }
          
          return [];
        } catch (error) {
          console.error('Error fetching document history:', error);
          return [];
        }
      },
      enabled: formView === 'history' && !!projectId && !!selectedFormId
    });

  // File upload handler
  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingFile(true);
    
    try {
      // Create folder path for IND forms organization
      const folderPath = `/IND/${projectId}/Forms/${selectedFormId}`;
      
      // Use existing DocuShare service to upload the document
      const uploadResult = await uploadDocument(uploadFile, folderPath, {
        formId: selectedFormId, 
        projectId: projectId,
        formName: `Form FDA ${selectedFormId}`,
        documentType: 'FDA_FORM',
        uploadDate: new Date().toISOString()
      });
      
      toast({
        title: 'File Uploaded Successfully',
        description: `${uploadFile.name} has been uploaded to TrialSage Vault.`,
        variant: 'default',
      });
      
      setUploadFile(null);
      refetchFormStatus();
      if (formView === 'history') {
        refetchHistory();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Unable to upload the file to TrialSage Vault. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingFile(false);
    }
  };

  // Get the selected form information
  const selectedForm = FDA_FORMS.find(form => form.id === selectedFormId) || FDA_FORMS[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>FDA Forms</CardTitle>
              <CardDescription>Required forms for your IND submission</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {FDA_FORMS.map((form) => (
                  <Button
                    key={form.id}
                    variant={selectedFormId === form.id ? "default" : "ghost"}
                    className="w-full justify-start px-4 py-2 h-auto"
                    onClick={() => setSelectedFormId(form.id)}
                  >
                    <form.icon className="h-5 w-5 mr-2" />
                    <div className="flex flex-col items-start text-left">
                      <span>{form.name}</span>
                      <span className="text-xs text-muted-foreground">{form.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedForm.name}</CardTitle>
                  <CardDescription>{selectedForm.title}</CardDescription>
                </div>
                <div>
                  {formStatus?.status === 'completed' && (
                    <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {formStatus?.status === 'in_progress' && (
                    <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                  {formStatus?.status === 'not_started' && (
                    <Badge variant="outline" className="ml-auto">
                      Not Started
                    </Badge>
                  )}
                </div>
              </div>
              <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger 
                    value="generate" 
                    onClick={() => setFormView('generate')}
                  >
                    Generate
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    onClick={() => setFormView('upload')}
                  >
                    Upload
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    onClick={() => setFormView('history')}
                  >
                    History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="guidance" 
                    onClick={() => setFormView('guidance')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Guidance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{selectedForm.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedForm.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Difficulty: {selectedForm.difficulty}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Est. Time: {selectedForm.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Form Information</AlertTitle>
                      <AlertDescription>
                        This form will be pre-filled with information from your project data.
                        You may need to review and complete additional fields after generation.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        {formStatus?.lastUpdated && (
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(formStatus.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={() => generateFormMutation.mutate()}
                        disabled={isGenerating || !projectId}
                        className="ml-auto"
                      >
                        {isGenerating ? (
                          <>
                            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Generate {selectedForm.name}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Upload Existing Form</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      If you already have a completed {selectedForm.name}, you can upload it here to store in TrialSage Vault.
                    </p>
                    
                    <div className="border-2 border-dashed rounded-md p-6 bg-muted/50 text-center cursor-pointer hover:bg-muted transition-colors">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {uploadFile ? uploadFile.name : "Click to select a file or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, or Excel files up to 10MB
                        </p>
                      </label>
                    </div>
                    
                    <Button 
                      onClick={handleFileUpload}
                      disabled={isSubmittingFile || !uploadFile || !projectId}
                      className="w-full"
                    >
                      {isSubmittingFile ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload to TrialSage Vault
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <History className="h-5 w-5 mr-2" />
                        <h3 className="text-lg font-medium">Form History</h3>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchHistory()}
                        disabled={isLoadingHistory}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      View the history of this form, including all versions and changes stored in TrialSage Vault.
                    </p>
                    
                    {isLoadingHistory ? (
                      <div className="flex justify-center p-8">
                        <RotateCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !documentHistory || documentHistory.length === 0 ? (
                      <div className="rounded-md border bg-card text-card-foreground">
                        <div className="p-8 text-center text-muted-foreground">
                          <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p>No form history available yet.</p>
                          <p className="text-sm mt-1">
                            History will appear here after you generate or upload the form to TrialSage Vault.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium">Filename</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Version</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {documentHistory.map((doc: any, index: number) => (
                              <tr key={doc.objectId} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/10'}>
                                <td className="px-4 py-3 text-sm">{doc.displayName}</td>
                                <td className="px-4 py-3 text-sm">
                                  {new Date(doc.modifiedDate || doc.createdDate).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {doc.version || '1.0'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => downloadDocument(doc.objectId)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    {doc.versions && doc.versions.length > 0 && (
                                      <Button variant="outline" size="sm">
                                        <History className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="guidance" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-medium">AI Regulatory Guidance</h3>
                    </div>
                    
                    {isLoadingGuidance ? (
                      <div className="flex justify-center py-4">
                        <RotateCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm">{aiGuidance?.description}</p>
                        
                        <Accordion type="single" collapsible defaultValue="tips">
                          <AccordionItem value="tips">
                            <AccordionTrigger>
                              <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                                <span>Form Tips & Best Practices</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 my-2">
                                {aiGuidance?.tips.map((tip: string, i: number) => (
                                  <li key={i} className="flex">
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-success shrink-0 mt-0.5" />
                                    <span className="text-sm">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="issues">
                            <AccordionTrigger>
                              <div className="flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-warning" />
                                <span>Common Issues to Avoid</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 my-2">
                                {aiGuidance?.common_issues.map((issue: string, i: number) => (
                                  <li key={i} className="flex">
                                    <AlertCircle className="h-4 w-4 mr-2 text-warning shrink-0 mt-0.5" />
                                    <span className="text-sm">{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {formStatus?.aiRecommendations && (
                            <AccordionItem value="recommendations">
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <ClipboardEdit className="h-4 w-4 mr-2 text-primary" />
                                  <span>Form-Specific Recommendations</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2 my-2">
                                  {formStatus.aiRecommendations.map((rec: string, i: number) => (
                                    <li key={i} className="flex">
                                      <ChevronRight className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                      <span className="text-sm">{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}