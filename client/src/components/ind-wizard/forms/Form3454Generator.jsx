import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, FileDown, Save } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const Form3454Generator = ({ projectId }) => {
  const [formData, setFormData] = useState({
    sponsor_name: '',
    application_number: '',
    drug_name: '',
    certification_option: 'no_financial_arrangements',
    certification_date: new Date().toISOString().split('T')[0],
    disclosed_arrangements: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedPdf, setGeneratedPdf] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Load form data when component mounts
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`/api/ind/${projectId}/forms/3454/data`);
        if (response.data && response.data.data) {
          setFormData(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Failed to load form data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [projectId]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle financial disclosure arrangement changes
  const handleArrangementChange = (index, field, value) => {
    const newArrangements = [...formData.disclosed_arrangements];
    
    if (!newArrangements[index]) {
      newArrangements[index] = {};
    }
    
    newArrangements[index][field] = value;
    
    setFormData((prevData) => ({
      ...prevData,
      disclosed_arrangements: newArrangements
    }));
  };
  
  // Add a new arrangement
  const addArrangement = () => {
    setFormData((prevData) => ({
      ...prevData,
      disclosed_arrangements: [
        ...prevData.disclosed_arrangements,
        { investigator_name: '', institution: '', arrangements: '' }
      ]
    }));
  };
  
  // Remove an arrangement
  const removeArrangement = (index) => {
    const newArrangements = [...formData.disclosed_arrangements];
    newArrangements.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      disclosed_arrangements: newArrangements
    }));
  };
  
  // Save form data
  const saveForm = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.put(`/api/ind/${projectId}/forms/3454/data`, formData);
      setSuccess('Form data saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving form data:', error);
      setError('Failed to save form data. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Generate PDF form
  const generatePdf = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/ind/${projectId}/forms/3454/generate`, formData);
      setGeneratedPdf(response.data);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  
  // Download the generated PDF
  const downloadPdf = () => {
    if (generatedPdf && generatedPdf.downloadUrl) {
      window.open(generatedPdf.downloadUrl, '_blank');
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24 mr-2" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">FDA Form 3454 - Financial Disclosure</CardTitle>
        <CardDescription>
          Certification: Financial Interests and Arrangements of Clinical Investigators
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="sponsor_name">Sponsor/Applicant Name</Label>
              <Input
                id="sponsor_name"
                name="sponsor_name"
                value={formData.sponsor_name}
                onChange={handleInputChange}
                placeholder="Enter sponsor name"
              />
            </div>
            
            <div>
              <Label htmlFor="application_number">IND Application Number (if known)</Label>
              <Input
                id="application_number"
                name="application_number"
                value={formData.application_number}
                onChange={handleInputChange}
                placeholder="Enter IND number if assigned"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="drug_name">Drug Product Name</Label>
            <Input
              id="drug_name"
              name="drug_name"
              value={formData.drug_name}
              onChange={handleInputChange}
              placeholder="Enter drug product name"
            />
          </div>
          
          <div className="mt-6">
            <Label className="text-base font-medium">Certification Option</Label>
            <RadioGroup
              name="certification_option"
              value={formData.certification_option}
              onValueChange={(value) => handleSelectChange('certification_option', value)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="no_financial_arrangements" id="no_financial_arrangements" />
                <div className="grid gap-1">
                  <Label htmlFor="no_financial_arrangements" className="font-normal">
                    I certify that no financial arrangements with an investigator have been made.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="disclosed_arrangements" id="disclosed_arrangements" />
                <div className="grid gap-1">
                  <Label htmlFor="disclosed_arrangements" className="font-normal">
                    Financial arrangements have been made and are being disclosed.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="certification_attached" id="certification_attached" />
                <div className="grid gap-1">
                  <Label htmlFor="certification_attached" className="font-normal">
                    Certification cannot be obtained because the investigator is no longer available.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="due_diligence_failed" id="due_diligence_failed" />
                <div className="grid gap-1">
                  <Label htmlFor="due_diligence_failed" className="font-normal">
                    Despite due diligence, certification information could not be obtained.
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {formData.certification_option === 'disclosed_arrangements' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Disclosed Financial Arrangements</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addArrangement}
                >
                  Add Investigator
                </Button>
              </div>
              
              {formData.disclosed_arrangements.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                  No financial arrangements added. Click "Add Investigator" to disclose arrangements.
                </div>
              )}
              
              {formData.disclosed_arrangements.map((arrangement, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Investigator #{index + 1}</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeArrangement(index)}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor={`investigator_name_${index}`}>Investigator Name</Label>
                    <Input
                      id={`investigator_name_${index}`}
                      value={arrangement.investigator_name || ''}
                      onChange={(e) => handleArrangementChange(index, 'investigator_name', e.target.value)}
                      placeholder="Enter investigator name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`institution_${index}`}>Institution</Label>
                    <Input
                      id={`institution_${index}`}
                      value={arrangement.institution || ''}
                      onChange={(e) => handleArrangementChange(index, 'institution', e.target.value)}
                      placeholder="Enter institution name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`arrangements_${index}`}>Financial Arrangements</Label>
                    <Textarea
                      id={`arrangements_${index}`}
                      value={arrangement.arrangements || ''}
                      onChange={(e) => handleArrangementChange(index, 'arrangements', e.target.value)}
                      placeholder="Describe financial arrangements"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4">
            <Label htmlFor="certification_date">Certification Date</Label>
            <Input
              id="certification_date"
              name="certification_date"
              type="date"
              value={formData.certification_date}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={saveForm}
            disabled={saving}
            className={cn(saving && "opacity-70")}
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          
          {generatedPdf && (
            <Button
              variant="outline"
              onClick={downloadPdf}
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
        
        <Button
          onClick={generatePdf}
          disabled={generating}
          className={cn(generating && "opacity-70")}
        >
          {generating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating...
            </>
          ) : (
            <>Generate PDF</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Form3454Generator;