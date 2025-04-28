// /client/src/components/ind-wizard/SponsorInfoForm.jsx

import { useState } from 'react';
import { CheckCircle, AlertCircle, HelpCircle, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SponsorInfoForm({ setFormStatus }) {
  const [sponsorData, setSponsorData] = useState({
    organizationName: '',
    organizationType: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    contactName: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
    isForeignSponsor: false
  });
  
  const [showGuidance, setShowGuidance] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSponsorData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Set saved status to false when form is edited
    if (isSaved) {
      setIsSaved(false);
    }
  };

  // Handle radio button changes
  const handleRadioChange = (value) => {
    const isForeign = value === 'foreign';
    setSponsorData(prev => ({ ...prev, isForeignSponsor: isForeign }));
    
    // Update parent form status - if foreign sponsor, US Agent Info is required
    setFormStatus(prev => ({ ...prev, usAgentRequired: isForeign }));
    
    if (isSaved) {
      setIsSaved(false);
    }
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setSponsorData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (isSaved) {
      setIsSaved(false);
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'organizationName',
      'organizationType',
      'addressLine1',
      'city',
      'state',
      'zipCode',
      'country',
      'contactName',
      'contactPhone',
      'contactEmail'
    ];
    
    requiredFields.forEach(field => {
      if (!sponsorData[field]) {
        errors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (sponsorData.contactEmail && !/\S+@\S+\.\S+/.test(sponsorData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (sponsorData.contactPhone && !/^[0-9()\-\s+]+$/.test(sponsorData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save sponsor information
  const handleSave = () => {
    if (validateForm()) {
      // In a real app, save to backend here
      console.log('Saving sponsor information:', sponsorData);
      
      // Update parent component status
      setFormStatus(prev => ({ ...prev, sponsorInfo: true }));
      setIsSaved(true);
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Sponsor Information
            </CardTitle>
            <CardDescription className="mt-1">
              Enter the details of the sponsor submitting this IND application.
            </CardDescription>
          </div>
          
          <div className="flex items-center">
            {isSaved && (
              <div className="mr-3 flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Saved</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowGuidance(true)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4 mr-1" /> Guidance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name <span className="text-red-500">*</span></Label>
              <Input
                id="organizationName"
                name="organizationName"
                value={sponsorData.organizationName}
                onChange={handleChange}
                className={validationErrors.organizationName ? "border-red-500" : ""}
              />
              {validationErrors.organizationName && (
                <p className="text-red-500 text-sm">{validationErrors.organizationName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => handleSelectChange('organizationType', value)} 
                value={sponsorData.organizationType}
              >
                <SelectTrigger id="organizationType" className={validationErrors.organizationType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmaceutical">Pharmaceutical Company</SelectItem>
                  <SelectItem value="biotech">Biotechnology Company</SelectItem>
                  <SelectItem value="academic">Academic Institution</SelectItem>
                  <SelectItem value="medical">Medical Research Organization</SelectItem>
                  <SelectItem value="government">Government Agency</SelectItem>
                  <SelectItem value="individual">Individual Sponsor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.organizationType && (
                <p className="text-red-500 text-sm">{validationErrors.organizationType}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 <span className="text-red-500">*</span></Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={sponsorData.addressLine1}
              onChange={handleChange}
              className={validationErrors.addressLine1 ? "border-red-500" : ""}
            />
            {validationErrors.addressLine1 && (
              <p className="text-red-500 text-sm">{validationErrors.addressLine1}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              value={sponsorData.addressLine2}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                name="city"
                value={sponsorData.city}
                onChange={handleChange}
                className={validationErrors.city ? "border-red-500" : ""}
              />
              {validationErrors.city && (
                <p className="text-red-500 text-sm">{validationErrors.city}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State/Province <span className="text-red-500">*</span></Label>
              <Input
                id="state"
                name="state"
                value={sponsorData.state}
                onChange={handleChange}
                className={validationErrors.state ? "border-red-500" : ""}
              />
              {validationErrors.state && (
                <p className="text-red-500 text-sm">{validationErrors.state}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">Postal/Zip Code <span className="text-red-500">*</span></Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={sponsorData.zipCode}
                onChange={handleChange}
                className={validationErrors.zipCode ? "border-red-500" : ""}
              />
              {validationErrors.zipCode && (
                <p className="text-red-500 text-sm">{validationErrors.zipCode}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
            <Select 
              onValueChange={(value) => handleSelectChange('country', value)} 
              value={sponsorData.country}
            >
              <SelectTrigger id="country" className={validationErrors.country ? "border-red-500" : ""}>
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
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.country && (
              <p className="text-red-500 text-sm">{validationErrors.country}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Sponsor Location <span className="text-red-500">*</span></Label>
            <RadioGroup 
              defaultValue={sponsorData.isForeignSponsor ? "foreign" : "domestic"}
              onValueChange={handleRadioChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="domestic" id="domestic" />
                <Label htmlFor="domestic" className="font-normal">Domestic (US-based) Sponsor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="foreign" id="foreign" />
                <Label htmlFor="foreign" className="font-normal">Foreign Sponsor (will require US Agent information)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Primary Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name <span className="text-red-500">*</span></Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={sponsorData.contactName}
                  onChange={handleChange}
                  className={validationErrors.contactName ? "border-red-500" : ""}
                />
                {validationErrors.contactName && (
                  <p className="text-red-500 text-sm">{validationErrors.contactName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactTitle">Job Title</Label>
                <Input
                  id="contactTitle"
                  name="contactTitle"
                  value={sponsorData.contactTitle}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={sponsorData.contactPhone}
                  onChange={handleChange}
                  className={validationErrors.contactPhone ? "border-red-500" : ""}
                />
                {validationErrors.contactPhone && (
                  <p className="text-red-500 text-sm">{validationErrors.contactPhone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={sponsorData.contactEmail}
                  onChange={handleChange}
                  className={validationErrors.contactEmail ? "border-red-500" : ""}
                />
                {validationErrors.contactEmail && (
                  <p className="text-red-500 text-sm">{validationErrors.contactEmail}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between">
        <div>
          {Object.keys(validationErrors).length > 0 && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Please correct the errors above</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={Object.keys(validationErrors).length > 0 && isSaved}
        >
          Save Sponsor Information
        </Button>
      </CardFooter>

      {/* Guidance Dialog */}
      <AlertDialog open={showGuidance} onOpenChange={setShowGuidance}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sponsor Information Guidance</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left mt-2">
                <p>
                  <span className="font-semibold">Organization Name:</span> Enter the full legal name of the sponsor organization or individual responsible for the IND submission.
                </p>
                <p>
                  <span className="font-semibold">Foreign Sponsors:</span> If the sponsor is based outside the United States, you will need to designate a US Agent who will act as the point of contact with the FDA.
                </p>
                <p>
                  <span className="font-semibold">Contact Information:</span> Provide details for the primary contact person who will communicate with the FDA regarding this application.
                </p>
                <p className="text-blue-600 border-l-4 border-blue-600 pl-3 py-2 bg-blue-50">
                  <span className="font-semibold">Regulatory Note:</span> This information will appear on Form FDA 1571 and in all official correspondence with the FDA. Ensure all details are accurate and match your organizational records.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}