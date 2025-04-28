import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProtocolSynopsisForm({ formData = {}, updateFormData }) {
  const [protocol, setProtocol] = useState({
    title: "",
    phase: "",
    indication: "",
    studyDesign: "",
    primaryObjective: "",
    secondaryObjectives: "",
    studyPopulation: "",
    inclusionCriteria: "",
    exclusionCriteria: "",
    treatmentRegimen: "",
    studyDuration: "",
    primaryEndpoint: "",
    secondaryEndpoints: "",
    safetyMonitoring: "",
    statisticalAnalysis: "",
    ethicsConsiderations: "",
    documentUploaded: false,
    ...formData
  });

  const [validation, setValidation] = useState({
    status: "idle", // idle, loading, success, error
    messages: []
  });

  // Update parent component when data changes
  useEffect(() => {
    updateFormData(protocol);
    
    // Validate the form when key fields change
    if (protocol.title && protocol.phase && protocol.indication) {
      validateFields();
    }
  }, [protocol]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProtocol({ ...protocol, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setProtocol({ ...protocol, [name]: value });
  };

  const handleDocumentUpload = () => {
    // In a real implementation, this would handle actual file upload
    // For now, just simulate setting the document as uploaded
    setProtocol({ ...protocol, documentUploaded: true });
  };

  const validateFields = async () => {
    setValidation({ status: "loading", messages: [] });
    
    try {
      // In a real implementation, this would call the validation API
      // For now, we'll simulate the validation process
      
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const messages = [];
      
      if (!protocol.title.trim()) {
        messages.push({
          severity: "error",
          message: "Protocol title is required per 21 CFR 312.23(a)(3)",
          field: "title"
        });
      }
      
      if (!protocol.phase) {
        messages.push({
          severity: "error",
          message: "Study phase must be specified per 21 CFR 312.23(a)(3)(iv)",
          field: "phase"
        });
      }
      
      if (!protocol.indication.trim()) {
        messages.push({
          severity: "error",
          message: "The indication or condition being studied must be specified",
          field: "indication"
        });
      }
      
      if (!protocol.studyDesign.trim()) {
        messages.push({
          severity: "warning",
          message: "Study design should be described to facilitate FDA review",
          field: "studyDesign"
        });
      }
      
      if (!protocol.primaryObjective.trim()) {
        messages.push({
          severity: "warning",
          message: "Primary objective should be clearly stated per ICH E6(R2)",
          field: "primaryObjective"
        });
      }
      
      if (!protocol.safetyMonitoring.trim()) {
        messages.push({
          severity: "warning",
          message: "Safety monitoring plans are essential for IND approval",
          field: "safetyMonitoring"
        });
      }
      
      setValidation({
        status: messages.length > 0 ? "error" : "success",
        messages
      });
      
    } catch (error) {
      console.error("Validation error:", error);
      setValidation({
        status: "error",
        messages: [{ severity: "error", message: "Failed to validate fields. Please try again." }]
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Protocol Synopsis</h2>
      
      {validation.status === "error" && validation.messages.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {validation.messages.map((msg, idx) => (
                <li key={idx}>{msg.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {validation.status === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-600">Validation Passed</AlertTitle>
          <AlertDescription className="text-green-600">
            All required protocol information is complete.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the clinical study protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-base">
                  Protocol Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={protocol.title}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Full protocol title"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phase" className="text-base">
                    Study Phase <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={protocol.phase}
                    onValueChange={(value) => handleSelectChange("phase", value)}
                  >
                    <SelectTrigger id="phase">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 1/2">Phase 1/2</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                      <SelectItem value="Phase 2/3">Phase 2/3</SelectItem>
                      <SelectItem value="Phase 3">Phase 3</SelectItem>
                      <SelectItem value="Phase 4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="indication" className="text-base">
                    Indication <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="indication"
                    name="indication"
                    value={protocol.indication}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Disease or condition being studied"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="studyDesign" className="text-base">
                  Study Design <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="studyDesign"
                  name="studyDesign"
                  value={protocol.studyDesign}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Describe the study design (e.g., randomized, open-label, etc.)"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Objectives and Endpoints</CardTitle>
            <CardDescription>
              Define the study objectives and endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryObjective" className="text-base">
                  Primary Objective <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="primaryObjective"
                  name="primaryObjective"
                  value={protocol.primaryObjective}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="State the primary objective of the study"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="secondaryObjectives" className="text-base">
                  Secondary Objectives
                </Label>
                <Textarea
                  id="secondaryObjectives"
                  name="secondaryObjectives"
                  value={protocol.secondaryObjectives}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="List any secondary objectives"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="primaryEndpoint" className="text-base">
                  Primary Endpoint <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="primaryEndpoint"
                  name="primaryEndpoint"
                  value={protocol.primaryEndpoint}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Define the primary endpoint(s)"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="secondaryEndpoints" className="text-base">
                  Secondary Endpoints
                </Label>
                <Textarea
                  id="secondaryEndpoints"
                  name="secondaryEndpoints"
                  value={protocol.secondaryEndpoints}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Define any secondary endpoints"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Study Population</CardTitle>
            <CardDescription>
              Define the patient population and eligibility criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studyPopulation" className="text-base">
                  Study Population Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="studyPopulation"
                  name="studyPopulation"
                  value={protocol.studyPopulation}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Describe the intended study population"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="inclusionCriteria" className="text-base">
                  Key Inclusion Criteria <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="inclusionCriteria"
                  name="inclusionCriteria"
                  value={protocol.inclusionCriteria}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="List the main inclusion criteria"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="exclusionCriteria" className="text-base">
                  Key Exclusion Criteria <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="exclusionCriteria"
                  name="exclusionCriteria"
                  value={protocol.exclusionCriteria}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="List the main exclusion criteria"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Treatment and Study Details</CardTitle>
            <CardDescription>
              Information about treatment regimen and study duration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="treatmentRegimen" className="text-base">
                  Treatment Regimen <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="treatmentRegimen"
                  name="treatmentRegimen"
                  value={protocol.treatmentRegimen}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Describe the dosing regimen, frequency, and duration"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="studyDuration" className="text-base">
                  Study Duration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="studyDuration"
                  name="studyDuration"
                  value={protocol.studyDuration}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="E.g., 12 weeks, 6 months, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="safetyMonitoring" className="text-base">
                  Safety Monitoring Plan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="safetyMonitoring"
                  name="safetyMonitoring"
                  value={protocol.safetyMonitoring}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Describe safety monitoring procedures and assessments"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Statistical analysis and ethics considerations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="statisticalAnalysis" className="text-base">
                  Statistical Analysis Plan
                </Label>
                <Textarea
                  id="statisticalAnalysis"
                  name="statisticalAnalysis"
                  value={protocol.statisticalAnalysis}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Outline the statistical analysis approach"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="ethicsConsiderations" className="text-base">
                  Ethics Considerations
                </Label>
                <Textarea
                  id="ethicsConsiderations"
                  name="ethicsConsiderations"
                  value={protocol.ethicsConsiderations}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Describe ethics considerations and IRB/IEC review plans"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-base">
                  Protocol Document
                </Label>
                <div className="mt-1 flex items-center">
                  <Button 
                    type="button" 
                    variant={protocol.documentUploaded ? "outline" : "default"}
                    onClick={handleDocumentUpload}
                    className="mr-4"
                  >
                    {protocol.documentUploaded ? "Document Uploaded" : "Upload Document"}
                  </Button>
                  {protocol.documentUploaded && (
                    <span className="text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Protocol document successfully uploaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}