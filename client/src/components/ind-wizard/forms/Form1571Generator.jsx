/**
 * Form FDA 1571 Generator Component
 * 
 * This component handles the generation, preview, and editing of Form FDA 1571
 * (Investigational New Drug Application) for IND submissions.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Edit, 
  Eye, 
  Printer,
  RotateCw,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware, DataAware } from '@/components/ui/database-aware';
import { retryOperation } from '@/utils/databaseUtils';

function Form1571Generator({ projectId, onSuccess }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);
  const [formView, setFormView] = useState('preview'); // preview, edit
  const [isEditing, setIsEditing] = useState(false);
  const [editableFormData, setEditableFormData] = useState(null);

  // Fetch existing form data
  const { 
    data: existingFormData, 
    isLoading: isLoadingFormData, 
    refetch: refetchFormData 
  } = useQuery({
    queryKey: ['ind-form-1571', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/forms/1571/data`);
        if (!response.ok) throw new Error('Failed to fetch form data');
        return response.json();
      } catch (error) {
        console.error('Error fetching form data:', error);
        return null;
      }
    },
    enabled: !!projectId
  });

  // Initialize editable form data when existing data loads
  useEffect(() => {
    if (existingFormData) {
      setFormData(existingFormData);
      setEditableFormData(existingFormData);
    }
  }, [existingFormData]);

  // Form generation mutation
  const generateFormMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/forms/1571/generate`, 
          editableFormData || formData
        );
        
        if (!response.ok) throw new Error('Failed to generate form');
        
        const responseData = await response.json();
        
        // For download functionality
        const downloadUrl = responseData.downloadUrl || `/api/ind/${projectId}/forms/1571/download`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Form_FDA_1571_${projectId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return responseData;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Form 1571 Generated Successfully',
        description: 'The FDA Form 1571 has been generated and downloaded.',
        variant: 'default',
      });
      if (onSuccess) {
        onSuccess(data);
      }
      refetchFormData();
    },
    onError: (error) => {
      toast({
        title: 'Form Generation Failed',
        description: error.message || 'Unable to generate Form 1571. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Save form data mutation
  const saveFormDataMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await apiRequest('PUT', `/api/ind/${projectId}/forms/1571/data`, formData);
        
        if (!response.ok) throw new Error('Failed to save form data');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Form Data Saved',
        description: 'Your changes to Form 1571 have been saved.',
        variant: 'default',
      });
      setIsEditing(false);
      refetchFormData();
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save form data. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Handle form edit
  const handleEdit = () => {
    setIsEditing(true);
    setFormView('edit');
  };

  // Handle form data change
  const handleFieldChange = (field, value) => {
    setEditableFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save form data
  const handleSaveForm = () => {
    saveFormDataMutation.mutate(editableFormData);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditableFormData(formData);
    setIsEditing(false);
    setFormView('preview');
  };

  // Form sections for structured editing
  const formSections = [
    {
      id: 'sponsor',
      title: 'Sponsor Information',
      fields: [
        { name: 'sponsor_name', label: 'Name of Sponsor', type: 'text' },
        { name: 'sponsor_address', label: 'Address', type: 'textarea' },
        { name: 'sponsor_phone', label: 'Telephone Number', type: 'text' },
        { name: 'ind_number', label: 'IND Number (if known)', type: 'text' }
      ]
    },
    {
      id: 'drug',
      title: 'Drug Information',
      fields: [
        { name: 'drug_name', label: 'Name of Drug', type: 'text' },
        { name: 'indication', label: 'Indication', type: 'text' },
        { name: 'phase', label: 'Phase of Clinical Investigation', type: 'select', 
          options: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] }
      ]
    },
    {
      id: 'protocol',
      title: 'Protocol Information',
      fields: [
        { name: 'protocol_number', label: 'Protocol Number', type: 'text' },
        { name: 'protocol_title', label: 'Protocol Title', type: 'textarea' },
        { name: 'principal_investigator', label: 'Principal Investigator', type: 'text' }
      ]
    },
    {
      id: 'contact',
      title: 'Contact Information',
      fields: [
        { name: 'contact_name', label: 'Name of Contact', type: 'text' },
        { name: 'contact_phone', label: 'Telephone Number', type: 'text' },
        { name: 'contact_email', label: 'Email Address', type: 'email' }
      ]
    },
    {
      id: 'certification',
      title: 'Certification',
      fields: [
        { name: 'authorized_representative', label: 'Name of Authorized Representative', type: 'text' },
        { name: 'representative_title', label: 'Title', type: 'text' },
        { name: 'certification_date', label: 'Date', type: 'date' }
      ]
    }
  ];

  // Render loading state
  if (isLoadingFormData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Get database connection status
  const { isConnected } = useDatabaseStatus();

  return (
    <ErrorBoundary title="Form 1571 Error" description="An error occurred while loading the Form FDA 1571 component.">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Form FDA 1571</CardTitle>
                <CardDescription>Investigational New Drug Application</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="font-normal">
                  Required
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Primary Form
                </Badge>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <Tabs defaultValue={formView} value={formView} onValueChange={setFormView}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={isLoadingFormData}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="bg-muted/50 rounded-md p-4 border">
                {!formData ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">No form data available. Click 'Edit' to start filling in Form 1571.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Preview form in clean format */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">DEPARTMENT OF HEALTH AND HUMAN SERVICES</h3>
                      <h3 className="text-lg font-semibold">FOOD AND DRUG ADMINISTRATION</h3>
                      <h2 className="text-xl font-bold text-center my-2">INVESTIGATIONAL NEW DRUG APPLICATION (IND)</h2>
                    </div>
                    
                    <Separator />
                    
                    {/* Sponsor Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">1. Name of Sponsor</h3>
                      <p>{formData?.sponsor_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">2. Address</h3>
                      <p className="whitespace-pre-wrap">{formData?.sponsor_address || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">3. Telephone Number</h3>
                      <p>{formData?.sponsor_phone || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">4. IND Number (if previously assigned)</h3>
                      <p>{formData?.ind_number || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Drug Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">5. Name of Drug</h3>
                      <p>{formData?.drug_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">6. Indication</h3>
                      <p>{formData?.indication || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">7. Phase of Clinical Investigation</h3>
                      <p>{formData?.phase || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Protocol Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">8. Protocol Number</h3>
                      <p>{formData?.protocol_number || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">9. Protocol Title</h3>
                      <p className="whitespace-pre-wrap">{formData?.protocol_title || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">10. Principal Investigator</h3>
                      <p>{formData?.principal_investigator || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">11. Name of Contact Person</h3>
                      <p>{formData?.contact_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">12. Telephone Number</h3>
                      <p>{formData?.contact_phone || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">13. Email Address</h3>
                      <p>{formData?.contact_email || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Certification */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">14. Certification</h3>
                      <p>I agree to not begin clinical investigations until 30 days after FDA's receipt of the IND unless I receive earlier notification by FDA that the studies may begin. I agree not to begin or continue clinical investigations covered by the IND if those studies are placed on clinical hold. I certify that I will comply with all other requirements regarding the obligations of clinical investigators in accordance with 21 CFR Part 312.</p>
                      
                      <div className="mt-4">
                        <p><strong>Name of Authorized Representative:</strong> {formData?.authorized_representative || "Not provided"}</p>
                        <p><strong>Title:</strong> {formData?.representative_title || "Not provided"}</p>
                        <p><strong>Date:</strong> {formData?.certification_date ? new Date(formData.certification_date).toLocaleDateString() : "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Form
                </Button>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  
                  <Button 
                    onClick={() => generateFormMutation.mutate()}
                    disabled={generateFormMutation.isPending || !formData}
                  >
                    {generateFormMutation.isPending ? (
                      <>
                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Form Information</AlertTitle>
                <AlertDescription>
                  Form FDA 1571 is the primary application form required for all Investigational New Drug (IND) submissions.
                  <a 
                    href="https://www.fda.gov/media/72335/download" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-primary mt-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Official FDA Form 1571
                  </a>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="edit" className="space-y-4">
              {!editableFormData ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Loading form data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formSections.map((section) => (
                    <div key={section.id} className="space-y-4">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {section.fields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            
                            {field.type === 'textarea' ? (
                              <Textarea
                                id={field.name}
                                value={editableFormData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                rows={3}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                id={field.name}
                                className="w-full p-2 rounded-md border"
                                value={editableFormData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              >
                                <option value="">Select...</option>
                                {field.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'date' ? (
                              <Input
                                id={field.name}
                                type="date"
                                value={editableFormData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              />
                            ) : (
                              <Input
                                id={field.name}
                                type={field.type || 'text'}
                                value={editableFormData[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                    </div>
                  ))}
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    
                    <Button 
                      onClick={handleSaveForm}
                      disabled={saveFormDataMutation.isPending}
                    >
                      {saveFormDataMutation.isPending ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Save Form
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  </ErrorBoundary>
  );
}

export default Form1571Generator;