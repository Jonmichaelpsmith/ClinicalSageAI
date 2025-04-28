import React, { useState, useEffect } from "react";
import SponsorInfoForm from "./SponsorInfoForm";
import InvestigatorInfoForm from "./InvestigatorInfoForm";
import ProtocolSynopsisForm from "./ProtocolSynopsisForm";
import FormsUploader from "./FormsUploader";
import SupportingDocsUploader from "./SupportingDocsUploader";
import RiskPredictorPanel from "./RiskPredictorPanel";
import RegulatoryAdvisorPanel from "./RegulatoryAdvisorPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function IndWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sponsor: {},
    investigator: {},
    protocol: {},
    forms: [],
    supportingDocs: []
  });
  const [progress, setProgress] = useState(0);
  const [riskData, setRiskData] = useState(null);
  const { toast } = useToast();

  const totalSteps = 5;

  useEffect(() => {
    // Calculate progress percentage
    setProgress((step / totalSteps) * 100);
    
    // Attempt to predict risk when we have enough data
    if (step > 2 && (formData.sponsor.sponsorName || formData.investigator.investigatorName)) {
      predictSubmissionRisk();
    }
  }, [step, formData]);

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const updateFormData = (section, data) => {
    setFormData({
      ...formData,
      [section]: data
    });
  };

  const saveSubmissionDraft = async () => {
    try {
      toast({
        title: "Draft Saved",
        description: "Your IND submission draft has been saved successfully.",
      });
      // In a real implementation, this would save to backend
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your submission draft.",
        variant: "destructive",
      });
    }
  };

  const predictSubmissionRisk = async () => {
    try {
      // In production, this would call the risk prediction API
      // For now, we'll simulate it
      const mockRiskData = {
        clinical_hold_risk: 65,
        refusal_to_file_risk: 28,
        information_request_risk: 82,
        key_factors: [
          "Missing Investigator Brochure",
          "Incomplete protocol safety monitoring section",
          "No prior human experience data"
        ]
      };
      
      setRiskData(mockRiskData);
    } catch (error) {
      console.error("Error predicting risk:", error);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <SponsorInfoForm formData={formData.sponsor} updateFormData={(data) => updateFormData('sponsor', data)} />;
      case 2:
        return <InvestigatorInfoForm formData={formData.investigator} updateFormData={(data) => updateFormData('investigator', data)} />;
      case 3:
        return <ProtocolSynopsisForm formData={formData.protocol} updateFormData={(data) => updateFormData('protocol', data)} />;
      case 4:
        return <FormsUploader formData={formData.forms} updateFormData={(data) => updateFormData('forms', data)} />;
      case 5:
        return <SupportingDocsUploader formData={formData.supportingDocs} updateFormData={(data) => updateFormData('supportingDocs', data)} />;
      default:
        return <SponsorInfoForm formData={formData.sponsor} updateFormData={(data) => updateFormData('sponsor', data)} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">IND Submission Wizard</h1>
      
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="form" className="p-0">
              <Card>
                <CardContent className="p-6">
                  {renderStepContent()}
                  
                  <div className="flex justify-between mt-6">
                    {step > 1 && (
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                    )}
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={saveSubmissionDraft}>
                        Save Draft
                      </Button>
                      
                      {step < totalSteps ? (
                        <Button onClick={nextStep}>
                          Next
                        </Button>
                      ) : (
                        <Button onClick={() => toast({ title: "Success", description: "Ready to generate eCTD package!" })}>
                          Generate eCTD
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-medium mb-4">Submission Preview</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:w-96">
          <div className="space-y-6">
            <RiskPredictorPanel riskData={riskData} />
            <RegulatoryAdvisorPanel formData={formData} currentStep={step} />
          </div>
        </div>
      </div>
    </div>
  );
}