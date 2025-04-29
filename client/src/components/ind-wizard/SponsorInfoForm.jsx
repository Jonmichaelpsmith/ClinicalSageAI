import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SponsorInfoForm({ formData = {}, onFormUpdate }) {
  // Create a safety wrapper for the update function to prevent errors
  const updateFormData = onFormUpdate || (() => {});
  const [sponsor, setSponsor] = useState({
    sponsorName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    contactName: "",
    contactTitle: "",
    contactPhone: "",
    contactEmail: "",
    usDAgent: false,
    docketNumber: "",
    ...formData
  });

  const [validation, setValidation] = useState({
    status: "idle", // idle, loading, success, error
    messages: []
  });

  useEffect(() => {
    // Pass the updated data back to parent component
    updateFormData(sponsor);
    
    // Validate the form when key fields change
    if (sponsor.sponsorName && sponsor.address && sponsor.contactName) {
      validateFields();
    }
  }, [sponsor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSponsor({ ...sponsor, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setSponsor({ ...sponsor, [name]: value });
  };

  const validateFields = async () => {
    setValidation({ status: "loading", messages: [] });
    
    try {
      // In a real implementation, this would call the validation API
      // For now, we'll simulate the validation process
      
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const messages = [];
      
      if (!sponsor.sponsorName.trim()) {
        messages.push({
          severity: "error",
          message: "Sponsor name is required per 21 CFR 312.23(a)(1)",
          field: "sponsorName"
        });
      }
      
      if (!sponsor.address.trim()) {
        messages.push({
          severity: "error",
          message: "Sponsor address is required per 21 CFR 312.23(a)(1)",
          field: "address"
        });
      }
      
      if (!sponsor.contactName.trim()) {
        messages.push({
          severity: "error",
          message: "Contact person is required per 21 CFR 312.23(a)(1)",
          field: "contactName"
        });
      }
      
      if (!sponsor.contactEmail.includes('@')) {
        messages.push({
          severity: "warning",
          message: "Contact email appears to be invalid",
          field: "contactEmail"
        });
      }
      
      if (sponsor.country !== "United States" && !sponsor.usDAgent) {
        messages.push({
          severity: "warning",
          message: "Non-U.S. sponsors should designate a U.S. agent per FDA guidance",
          field: "usDAgent"
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
      <h2 className="text-2xl font-bold mb-6">Sponsor Information</h2>
      
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
            All required sponsor information is complete.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="sponsorName" className="text-base">
              Sponsor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sponsorName"
              name="sponsorName"
              value={sponsor.sponsorName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter company or sponsor name"
            />
          </div>
          
          <div>
            <Label htmlFor="address" className="text-base">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              value={sponsor.address}
              onChange={handleChange}
              className="mt-1"
              placeholder="Street address"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-base">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={sponsor.city}
                onChange={handleChange}
                className="mt-1"
                placeholder="City"
              />
            </div>
            
            <div>
              <Label htmlFor="state" className="text-base">
                State/Province <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                value={sponsor.state}
                onChange={handleChange}
                className="mt-1"
                placeholder="State/Province"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode" className="text-base">
                ZIP/Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={sponsor.zipCode}
                onChange={handleChange}
                className="mt-1"
                placeholder="ZIP/Postal code"
              />
            </div>
            
            <div>
              <Label htmlFor="country" className="text-base">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select
                value={sponsor.country}
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
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="contactName" className="text-base">
              Contact Person <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactName"
              name="contactName"
              value={sponsor.contactName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Full name"
            />
          </div>
          
          <div>
            <Label htmlFor="contactTitle" className="text-base">
              Title/Position
            </Label>
            <Input
              id="contactTitle"
              name="contactTitle"
              value={sponsor.contactTitle}
              onChange={handleChange}
              className="mt-1"
              placeholder="Title/Position"
            />
          </div>
          
          <div>
            <Label htmlFor="contactPhone" className="text-base">
              Phone Number
            </Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={sponsor.contactPhone}
              onChange={handleChange}
              className="mt-1"
              placeholder="Phone number"
            />
          </div>
          
          <div>
            <Label htmlFor="contactEmail" className="text-base">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              value={sponsor.contactEmail}
              onChange={handleChange}
              className="mt-1"
              type="email"
              placeholder="Email address"
            />
          </div>
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>U.S. Agent Information</CardTitle>
          <CardDescription>
            Required for non-U.S. sponsors without an office in the United States
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="usDAgent" className="text-base">
                Do you have a U.S. Agent?
              </Label>
              <Select
                value={sponsor.usDAgent}
                onValueChange={(value) => handleSelectChange("usDAgent", value)}
              >
                <SelectTrigger id="usDAgent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={true}>Yes</SelectItem>
                  <SelectItem value={false}>No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="docketNumber" className="text-base">
                FDA Docket Number (if known)
              </Label>
              <Input
                id="docketNumber"
                name="docketNumber"
                value={sponsor.docketNumber}
                onChange={handleChange}
                className="mt-1"
                placeholder="FDA docket number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}