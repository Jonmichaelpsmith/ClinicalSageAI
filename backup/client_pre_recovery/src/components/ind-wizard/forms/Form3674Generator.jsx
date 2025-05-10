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
import { AlertCircle, CheckCircle2, FileDown, Save } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const Form3674Generator = ({ projectId }) => {
  const [formData, setFormData] = useState({
    sponsor_name: '',
    submission_type: 'Initial IND',
    certify_option: 'requirements_not_applicable',
    nct_number: '',
    certification_date: new Date().toISOString().split('T')[0]
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
        const response = await axios.get(`/api/ind/${projectId}/forms/3674/data`);
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
  
  // Save form data
  const saveForm = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.put(`/api/ind/${projectId}/forms/3674/data`, formData);
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
      const response = await axios.post(`/api/ind/${projectId}/forms/3674/generate`, formData);
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
        <CardTitle className="text-2xl text-primary">FDA Form 3674 - Certification of Compliance</CardTitle>
        <CardDescription>
          Certification of Compliance, under 42 U.S.C. § 282(j)(5)(B), with Requirements of ClinicalTrials.gov Data Bank
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
        
        <div className="space-y-4">
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
            <Label htmlFor="submission_type">Submission Type</Label>
            <Input
              id="submission_type"
              name="submission_type"
              value={formData.submission_type}
              onChange={handleInputChange}
              placeholder="Enter submission type (e.g., Initial IND)"
            />
          </div>
          
          <div className="mt-6">
            <Label className="text-base font-medium">Certification Option</Label>
            <RadioGroup
              name="certify_option"
              value={formData.certify_option}
              onValueChange={(value) => handleSelectChange('certify_option', value)}
              className="mt-2 space-y-3"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="requirements_not_applicable" id="requirements_not_applicable" />
                <div className="grid gap-1">
                  <Label htmlFor="requirements_not_applicable" className="font-normal">
                    The requirements of Section 402(j) of the Public Health Service Act do not apply to any clinical trial referenced in this application or submission.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="requirements_met" id="requirements_met" />
                <div className="grid gap-1">
                  <Label htmlFor="requirements_met" className="font-normal">
                    The requirements of Section 402(j) of the Public Health Service Act apply to one or more clinical trials referenced in this application or submission, and those requirements have been met.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="submitted_not_yet_required" id="submitted_not_yet_required" />
                <div className="grid gap-1">
                  <Label htmlFor="submitted_not_yet_required" className="font-normal">
                    The trial is registered, but 42 U.S.C. § 282(j) does not yet require submission of clinical trial results.
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="delayed_submission" id="delayed_submission" />
                <div className="grid gap-1">
                  <Label htmlFor="delayed_submission" className="font-normal">
                    The sponsor has submitted a certification of delayed submission as permitted under 42 U.S.C. § 282(j)(3)(E)(iii).
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {(formData.certify_option === 'requirements_met' || formData.certify_option === 'submitted_not_yet_required') && (
            <div className="mt-4">
              <Label htmlFor="nct_number">NCT Number</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                  NCT
                </span>
                <Input
                  id="nct_number"
                  name="nct_number"
                  value={formData.nct_number}
                  onChange={handleInputChange}
                  placeholder="Enter the number portion without NCT prefix"
                  className="rounded-l-none"
                />
              </div>
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

export default Form3674Generator;