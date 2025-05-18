/**
 * Form FDA 1572 Generator Component
 * 
 * This component handles the generation, preview, and editing of Form FDA 1572
 * (Statement of Investigator) for IND submissions.
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
  ExternalLink,
  Info,
  Plus,
  Trash
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Form1572Generator({ projectId, onSuccess }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(null);
  const [formView, setFormView] = useState('preview'); // preview, edit
  const [isEditing, setIsEditing] = useState(false);
  const [editableFormData, setEditableFormData] = useState(null);
  const [subInvestigators, setSubInvestigators] = useState([{ name: '', role: '' }]);

  // Fetch existing form data
  const { 
    data: existingFormData, 
    isLoading: isLoadingFormData, 
    refetch: refetchFormData 
  } = useQuery({
    queryKey: ['ind-form-1572', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/forms/1572/data`);
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
      
      // Parse sub-investigators if they exist
      if (existingFormData.subinvestigators) {
        try {
          // Check if it's already an array
          if (Array.isArray(existingFormData.subinvestigators)) {
            setSubInvestigators(existingFormData.subinvestigators);
          } else {
            // Try to parse as JSON string
            const parsed = JSON.parse(existingFormData.subinvestigators);
            if (Array.isArray(parsed)) {
              setSubInvestigators(parsed);
            } else {
              // Fall back to parsing as text
              const subInvList = existingFormData.subinvestigators
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                  const parts = line.split(',');
                  return {
                    name: parts[0]?.trim() || '',
                    role: parts[1]?.trim() || ''
                  };
                });
              
              if (subInvList.length > 0) {
                setSubInvestigators(subInvList);
              }
            }
          }
        } catch (e) {
          // If parsing fails, keep the default
          console.log('Failed to parse sub-investigators:', e);
        }
      }
    }
  }, [existingFormData]);

  // Form generation mutation
  const generateFormMutation = useMutation({
    mutationFn: async () => {
      try {
        // Prepare form data with sub-investigators
        let formDataToSubmit = { ...editableFormData };
        if (subInvestigators.length > 0) {
          formDataToSubmit.subinvestigators = JSON.stringify(subInvestigators);
        }
        
        const response = await apiRequest(
          'POST', 
          `/api/ind/${projectId}/forms/1572/generate`, 
          formDataToSubmit
        );
        
        if (!response.ok) throw new Error('Failed to generate form');
        
        const responseData = await response.json();
        
        // For download functionality
        const downloadUrl = responseData.downloadUrl || `/api/ind/${projectId}/forms/1572/download`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Form_FDA_1572_${projectId}.pdf`;
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
        title: 'Form 1572 Generated Successfully',
        description: 'The FDA Form 1572 has been generated and downloaded.',
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
        description: error.message || 'Unable to generate Form 1572. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Save form data mutation
  const saveFormDataMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        // Prepare form data with sub-investigators
        let formDataToSubmit = { ...formData };
        if (subInvestigators.length > 0) {
          formDataToSubmit.subinvestigators = JSON.stringify(subInvestigators);
        }
        
        const response = await apiRequest(
          'PUT', 
          `/api/ind/${projectId}/forms/1572/data`, 
          formDataToSubmit
        );
        
        if (!response.ok) throw new Error('Failed to save form data');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Form Data Saved',
        description: 'Your changes to Form 1572 have been saved.',
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

  // Handle sub-investigator changes
  const handleSubInvestigatorChange = (index, field, value) => {
    const updatedSubInvestigators = [...subInvestigators];
    updatedSubInvestigators[index][field] = value;
    setSubInvestigators(updatedSubInvestigators);
  };

  // Add a new sub-investigator
  const addSubInvestigator = () => {
    setSubInvestigators([...subInvestigators, { name: '', role: '' }]);
  };

  // Remove a sub-investigator
  const removeSubInvestigator = (index) => {
    if (subInvestigators.length <= 1) {
      setSubInvestigators([{ name: '', role: '' }]);
    } else {
      const updated = [...subInvestigators];
      updated.splice(index, 1);
      setSubInvestigators(updated);
    }
  };

  // Form sections for structured editing
  const formSections = [
    {
      id: 'investigator',
      title: 'Investigator Information',
      fields: [
        { name: 'investigator_name', label: 'Name of Investigator', type: 'text' },
        { name: 'investigator_address', label: 'Address', type: 'textarea' },
        { name: 'investigator_phone', label: 'Telephone Number', type: 'text' },
        { name: 'investigator_email', label: 'Email Address', type: 'email' }
      ]
    },
    {
      id: 'education',
      title: 'Education, Training & Experience',
      fields: [
        { name: 'education', label: 'Education & Professional Experience', type: 'textarea', 
          placeholder: 'M.D., University Name, Year\nResidency in Specialty, Institution, Year' }
      ]
    },
    {
      id: 'facility',
      title: 'Facility Information',
      fields: [
        { name: 'facility_name', label: 'Name of Research Facility', type: 'text' },
        { name: 'facility_address', label: 'Facility Address', type: 'textarea' },
        { name: 'irb_name', label: 'Name of IRB', type: 'text' },
        { name: 'irb_address', label: 'IRB Address', type: 'textarea' }
      ]
    },
    {
      id: 'study',
      title: 'Study Information',
      fields: [
        { name: 'phase', label: 'Phase of Clinical Investigation', type: 'select', 
          options: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] }
      ]
    },
    {
      id: 'certification',
      title: 'Certification',
      fields: [
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Form FDA 1572</CardTitle>
              <CardDescription>Statement of Investigator</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="font-normal">
                Required
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
                    <p className="text-muted-foreground">No form data available. Click 'Edit' to start filling in Form 1572.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Preview form in clean format */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">DEPARTMENT OF HEALTH AND HUMAN SERVICES</h3>
                      <h3 className="text-lg font-semibold">FOOD AND DRUG ADMINISTRATION</h3>
                      <h2 className="text-xl font-bold text-center my-2">STATEMENT OF INVESTIGATOR (Form FDA 1572)</h2>
                    </div>
                    
                    <Separator />
                    
                    {/* Investigator Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">1. Name of Investigator</h3>
                      <p>{formData?.investigator_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">2. Address</h3>
                      <p className="whitespace-pre-wrap">{formData?.investigator_address || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">3. Telephone Number</h3>
                      <p>{formData?.investigator_phone || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">4. Email Address</h3>
                      <p>{formData?.investigator_email || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Education & Training */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">5. Education, Training, and Experience</h3>
                      <p className="whitespace-pre-wrap">{formData?.education || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Facility Information */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">6. Name of Research Facility</h3>
                      <p>{formData?.facility_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">7. Facility Address</h3>
                      <p className="whitespace-pre-wrap">{formData?.facility_address || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">8. Name of IRB</h3>
                      <p>{formData?.irb_name || "Not provided"}</p>
                      
                      <h3 className="font-semibold mt-4">9. IRB Address</h3>
                      <p className="whitespace-pre-wrap">{formData?.irb_address || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Phase of Study */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">10. Phase of Clinical Investigation</h3>
                      <p>{formData?.phase || "Not provided"}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Sub-investigators */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">11. Sub-investigators</h3>
                      {subInvestigators.length > 0 && subInvestigators[0].name ? (
                        <div className="space-y-1">
                          {subInvestigators.map((subInv, idx) => (
                            <div key={idx} className="flex">
                              <p className="font-medium">{subInv.name}</p>
                              {subInv.role && <p className="ml-2 text-muted-foreground">({subInv.role})</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No sub-investigators listed</p>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Certification */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">12. Certification</h3>
                      <p>I agree to conduct the study(ies) in accordance with the relevant, current protocol(s) and will only make changes in a protocol after notifying the sponsor, except when necessary to protect the safety, rights, or welfare of subjects. I agree to personally conduct or supervise the described investigation(s). I agree to inform any patients, or any persons used as controls, that the drugs are being used for investigational purposes and I will ensure that the requirements relating to obtaining informed consent in 21 CFR Part 50 and institutional review board (IRB) review and approval in 21 CFR Part 56 are met.</p>
                      
                      <div className="mt-4">
                        <p><strong>Signature of Investigator:</strong> _______________________</p>
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
                  Form FDA 1572 must be completed by each principal investigator who will conduct a clinical investigation of an investigational drug.
                  <a 
                    href="https://www.fda.gov/media/72981/download" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-primary mt-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Official FDA Form 1572
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
                                placeholder={field.placeholder}
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
                  
                  {/* Special section for Sub-investigators */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sub-investigators</h3>
                    
                    {subInvestigators.map((subInv, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <div>
                            <Label htmlFor={`subinv-name-${index}`}>Name</Label>
                            <Input
                              id={`subinv-name-${index}`}
                              value={subInv.name}
                              onChange={(e) => handleSubInvestigatorChange(index, 'name', e.target.value)}
                              placeholder="Sub-investigator name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`subinv-role-${index}`}>Role</Label>
                            <Input
                              id={`subinv-role-${index}`}
                              value={subInv.role}
                              onChange={(e) => handleSubInvestigatorChange(index, 'role', e.target.value)}
                              placeholder="e.g., Research Coordinator"
                            />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="mt-6"
                          onClick={() => removeSubInvestigator(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={addSubInvestigator}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sub-investigator
                    </Button>
                    
                    <Separator />
                  </div>
                  
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
  );
}