import React, { useState } from 'react';
import { useWizard } from '../IndWizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, FileCheck, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Basic simulation of submission API
const simulateSubmission = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  return { success: true, message: "Submission prepared successfully", submissionId: "IND-" + Date.now() };
};

export default function FinalAssemblyStep() {
  const { indData } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await simulateSubmission();
      setSubmissionResult(result);
      toast({
        title: "Submission Ready",
        description: result.message
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred during submission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate section completion status based on indData
  const getSectionStatus = (section) => {
    if (!indData || !indData[section]) return 'incomplete';
    return 'complete';
  };

  const renderSectionStatus = (status) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'incomplete':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><AlertCircle className="h-3 w-3 mr-1" />Incomplete</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Unknown</Badge>;
    }
  };

  // Calculate overall progress
  const overallProgress = 80; // Sample value, replace with actual calculation

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Final Assembly & Submission</CardTitle>
          <CardDescription>Review your IND package before submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Overall Submission Progress</h3>
              <Progress value={overallProgress} className="h-2 mt-2" />
              <p className="text-sm text-muted-foreground mt-1">{overallProgress}% complete</p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Section Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Pre-IND Planning</span>
                  {renderSectionStatus(getSectionStatus('preIndData'))}
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Nonclinical Studies</span>
                  {renderSectionStatus(getSectionStatus('nonclinicalData'))}
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">CMC Data</span>
                  {renderSectionStatus(getSectionStatus('cmcData'))}
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Clinical Protocol</span>
                  {renderSectionStatus(getSectionStatus('clinicalProtocolData'))}
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">Investigator Brochure</span>
                  {renderSectionStatus(getSectionStatus('investigatorBrochureData'))}
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <span className="font-medium">FDA Forms</span>
                  {renderSectionStatus(getSectionStatus('fdaFormsData'))}
                </div>
              </div>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Submit IND Package</CardTitle>
                <CardDescription>Generate and prepare your IND for submission to the FDA</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Before submission, ensure all required sections are complete and have been reviewed for accuracy.</p>
                {submissionResult && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center text-green-700">
                      <FileCheck className="h-5 w-5 mr-2" />
                      <span className="font-medium">Submission ID: {submissionResult.submissionId}</span>
                    </div>
                    <p className="text-green-600 mt-1 text-sm">{submissionResult.message}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || submissionResult} 
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Preparing Submission...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {submissionResult ? 'Submission Ready' : 'Prepare IND Submission'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}