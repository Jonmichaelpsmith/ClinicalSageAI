import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InvestigatorInfoForm({ formData = {}, updateFormData }) {
  const [investigator, setInvestigator] = useState({
    investigatorName: "",
    qualification: "",
    institution: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
    email: "",
    cvUploaded: false,
    experience: "",
    subInvestigators: [],
    ...formData
  });

  const [validation, setValidation] = useState({
    status: "idle", // idle, loading, success, error
    messages: []
  });

  // Update parent component when data changes
  useEffect(() => {
    updateFormData(investigator);
    
    // Validate the form when key fields change
    if (investigator.investigatorName && investigator.institution) {
      validateFields();
    }
  }, [investigator]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestigator({ ...investigator, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setInvestigator({ ...investigator, [name]: value });
  };

  const addSubInvestigator = () => {
    const subInvestigators = [...investigator.subInvestigators];
    subInvestigators.push({
      name: "",
      qualification: "",
      role: ""
    });
    setInvestigator({ ...investigator, subInvestigators });
  };

  const removeSubInvestigator = (index) => {
    const subInvestigators = [...investigator.subInvestigators];
    subInvestigators.splice(index, 1);
    setInvestigator({ ...investigator, subInvestigators });
  };

  const updateSubInvestigator = (index, field, value) => {
    const subInvestigators = [...investigator.subInvestigators];
    subInvestigators[index][field] = value;
    setInvestigator({ ...investigator, subInvestigators });
  };

  const handleCVUpload = () => {
    // In a real implementation, this would handle actual file upload
    // For now, just simulate setting the CV as uploaded
    setInvestigator({ ...investigator, cvUploaded: true });
  };

  const validateFields = async () => {
    setValidation({ status: "loading", messages: [] });
    
    try {
      // In a real implementation, this would call the validation API
      // For now, we'll simulate the validation process
      
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const messages = [];
      
      if (!investigator.investigatorName.trim()) {
        messages.push({
          severity: "error",
          message: "Principal investigator name is required per 21 CFR 312.23(a)(6)(iii)(b)",
          field: "investigatorName"
        });
      }
      
      if (!investigator.institution.trim()) {
        messages.push({
          severity: "warning",
          message: "Institution information should be included for the investigator",
          field: "institution"
        });
      }
      
      if (!investigator.qualification.trim()) {
        messages.push({
          severity: "warning",
          message: "Investigator qualifications help establish expertise for the study",
          field: "qualification"
        });
      }
      
      if (!investigator.cvUploaded) {
        messages.push({
          severity: "warning",
          message: "CV or resume for the investigator should be uploaded",
          field: "cvUploaded"
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
      <h2 className="text-2xl font-bold mb-6">Investigator Information</h2>
      
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
            Principal investigator information is complete.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Principal Investigator</CardTitle>
            <CardDescription>
              Information about the principal investigator for this clinical study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="investigatorName" className="text-base">
                    Investigator Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="investigatorName"
                    name="investigatorName"
                    value={investigator.investigatorName}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="institution" className="text-base">
                    Institution <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institution"
                    name="institution"
                    value={investigator.institution}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Research institution or facility"
                  />
                </div>
                
                <div>
                  <Label htmlFor="qualification" className="text-base">
                    Qualifications
                  </Label>
                  <Textarea
                    id="qualification"
                    name="qualification"
                    value={investigator.qualification}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Relevant qualifications, certifications, and experience"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-base">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={investigator.address}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-base">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={investigator.city}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state" className="text-base">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={investigator.state}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="State/Province"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode" className="text-base">
                      ZIP/Postal Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={investigator.zipCode}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="ZIP/Postal code"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country" className="text-base">
                      Country
                    </Label>
                    <Select
                      value={investigator.country}
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={investigator.email}
                  onChange={handleChange}
                  className="mt-1"
                  type="email"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-base">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={investigator.phone}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Label htmlFor="experience" className="text-base">
                Relevant Experience
              </Label>
              <Textarea
                id="experience"
                name="experience"
                value={investigator.experience}
                onChange={handleChange}
                className="mt-1"
                placeholder="Describe relevant experience with similar studies or therapeutics"
                rows={4}
              />
            </div>
            
            <div className="mt-6">
              <Label className="text-base">
                CV or Resume
              </Label>
              <div className="mt-1 flex items-center">
                <Button 
                  type="button" 
                  variant={investigator.cvUploaded ? "outline" : "default"}
                  onClick={handleCVUpload}
                  className="mr-4"
                >
                  {investigator.cvUploaded ? "CV Uploaded" : "Upload CV"}
                </Button>
                {investigator.cvUploaded && (
                  <span className="text-sm text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    CV successfully uploaded
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sub-Investigators</CardTitle>
            <CardDescription>
              Additional investigators who will be working on the study
            </CardDescription>
          </CardHeader>
          <CardContent>
            {investigator.subInvestigators.map((subInvestigator, index) => (
              <div key={index} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Sub-Investigator {index + 1}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeSubInvestigator(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`subInvestigator-${index}-name`} className="text-base">
                      Name
                    </Label>
                    <Input
                      id={`subInvestigator-${index}-name`}
                      value={subInvestigator.name}
                      onChange={(e) => updateSubInvestigator(index, "name", e.target.value)}
                      className="mt-1"
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`subInvestigator-${index}-role`} className="text-base">
                      Role
                    </Label>
                    <Input
                      id={`subInvestigator-${index}-role`}
                      value={subInvestigator.role}
                      onChange={(e) => updateSubInvestigator(index, "role", e.target.value)}
                      className="mt-1"
                      placeholder="Role in the study"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor={`subInvestigator-${index}-qualification`} className="text-base">
                    Qualifications
                  </Label>
                  <Textarea
                    id={`subInvestigator-${index}-qualification`}
                    value={subInvestigator.qualification}
                    onChange={(e) => updateSubInvestigator(index, "qualification", e.target.value)}
                    className="mt-1"
                    placeholder="Relevant qualifications and experience"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={addSubInvestigator}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sub-Investigator
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}