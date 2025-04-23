import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowRight, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  Shield, 
  Check, 
  Plus, 
  Trash2,
  Sparkles,
  FileCheck,
  Database,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function TeamSignup() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('enterprise');
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    taxId: '',
    phone: ''
  });
  const [primaryContact, setPrimaryContact] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [teamMembers, setTeamMembers] = useState([
    { firstName: '', lastName: '', email: '', role: 'user', access: ['ind-wizard', 'csr-intelligence'] }
  ]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedModules, setSelectedModules] = useState({
    'ind-wizard': true,
    'csr-intelligence': true,
    'document-vault': true,
    'cmc-blueprint': false,
    'ask-lumen': true,
    'analytics-dashboard': false
  });
  
  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePrimaryContactChange = (e) => {
    const { name, value } = e.target;
    setPrimaryContact(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTeamMemberChange = (index, field, value) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index][field] = value;
    setTeamMembers(newTeamMembers);
  };
  
  const handleTeamMemberAccessChange = (index, module) => {
    const newTeamMembers = [...teamMembers];
    const currentAccess = newTeamMembers[index].access;
    
    if (currentAccess.includes(module)) {
      newTeamMembers[index].access = currentAccess.filter(item => item !== module);
    } else {
      newTeamMembers[index].access = [...currentAccess, module];
    }
    
    setTeamMembers(newTeamMembers);
  };
  
  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { firstName: '', lastName: '', email: '', role: 'user', access: [] }]);
  };
  
  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };
  
  const handleModuleChange = (module) => {
    setSelectedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };
  
  const handleNextStep = () => {
    // Validation for different steps
    if (activeStep === 1) {
      if (!companyInfo.companyName || !companyInfo.industry || !companyInfo.companySize) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required company information fields.",
          variant: "destructive"
        });
        return;
      }
    } else if (activeStep === 2) {
      if (!primaryContact.firstName || !primaryContact.lastName || !primaryContact.email || !primaryContact.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required contact information.",
          variant: "destructive"
        });
        return;
      }
      
      if (primaryContact.password !== primaryContact.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Your passwords do not match. Please try again.",
          variant: "destructive"
        });
        return;
      }
    } else if (activeStep === 3) {
      // Validate team members
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].firstName || !teamMembers[i].lastName || !teamMembers[i].email) {
          toast({
            title: "Missing Information",
            description: `Please fill in all required fields for team member ${i + 1}.`,
            variant: "destructive"
          });
          return;
        }
      }
    } else if (activeStep === 4) {
      // Validate module selection
      const hasModules = Object.values(selectedModules).some(Boolean);
      if (!hasModules) {
        toast({
          title: "Module Selection Required",
          description: "Please select at least one module for your subscription.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setActiveStep(prev => Math.min(prev + 1, 5));
  };
  
  const handleSubmit = () => {
    if (!acceptedTerms) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions to complete your signup.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would send the data to your API
    console.log({
      companyInfo,
      primaryContact,
      teamMembers,
      selectedPlan,
      selectedModules
    });
    
    toast({
      title: "Registration Complete!",
      description: "Your account has been created successfully. You'll receive a confirmation email shortly.",
      variant: "default"
    });
    
    // Redirect to success page or dashboard
    setTimeout(() => {
      setLocation('/admin-profile');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e5e5e7] py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-[#0071e3] to-[#2b8fff] rounded p-1.5 mr-2">
                <div className="text-white font-bold text-xs tracking-wide">C2C.AI</div>
              </div>
              <span className="text-lg font-semibold text-[#1d1d1f] tracking-tight">CONCEPT2CURE.AI</span>
            </div>
            <span className="ml-7 text-sm text-[#86868b] mt-0.5">TrialSage™ Platform</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#86868b]">Already have an account?</span>
            <Button variant="outline" onClick={() => setLocation('/auth')}>
              Login
            </Button>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Create Your TrialSage™ Account</h1>
          <p className="text-[#424245]">
            Set up your organization profile, add your team members, and choose the modules that best fit your workflow.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${activeStep >= 1 ? 'text-[#06c]' : 'text-[#86868b]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-[#06c] text-white' : 'bg-[#f2f2f7] text-[#86868b]'}`}>
                {activeStep > 1 ? <Check className="h-5 w-5" /> : 1}
              </div>
              <span className="text-sm mt-2">Company</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-0.5 w-full ${activeStep > 1 ? 'bg-[#06c]' : 'bg-[#e5e5e7]'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${activeStep >= 2 ? 'text-[#06c]' : 'text-[#86868b]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-[#06c] text-white' : 'bg-[#f2f2f7] text-[#86868b]'}`}>
                {activeStep > 2 ? <Check className="h-5 w-5" /> : 2}
              </div>
              <span className="text-sm mt-2">Contact</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-0.5 w-full ${activeStep > 2 ? 'bg-[#06c]' : 'bg-[#e5e5e7]'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${activeStep >= 3 ? 'text-[#06c]' : 'text-[#86868b]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-[#06c] text-white' : 'bg-[#f2f2f7] text-[#86868b]'}`}>
                {activeStep > 3 ? <Check className="h-5 w-5" /> : 3}
              </div>
              <span className="text-sm mt-2">Team</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-0.5 w-full ${activeStep > 3 ? 'bg-[#06c]' : 'bg-[#e5e5e7]'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${activeStep >= 4 ? 'text-[#06c]' : 'text-[#86868b]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 4 ? 'bg-[#06c] text-white' : 'bg-[#f2f2f7] text-[#86868b]'}`}>
                {activeStep > 4 ? <Check className="h-5 w-5" /> : 4}
              </div>
              <span className="text-sm mt-2">Modules</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-0.5 w-full ${activeStep > 4 ? 'bg-[#06c]' : 'bg-[#e5e5e7]'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${activeStep >= 5 ? 'text-[#06c]' : 'text-[#86868b]'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 5 ? 'bg-[#06c] text-white' : 'bg-[#f2f2f7] text-[#86868b]'}`}>
                {activeStep > 5 ? <Check className="h-5 w-5" /> : 5}
              </div>
              <span className="text-sm mt-2">Review</span>
            </div>
          </div>
        </div>
        
        {/* Form Steps */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            {/* Step 1: Company Information */}
            {activeStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Company Information</CardTitle>
                  <CardDescription>Tell us about your organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="companyName" 
                        name="companyName" 
                        value={companyInfo.companyName} 
                        onChange={handleCompanyInfoChange} 
                        placeholder="Acme Pharmaceuticals Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
                      <Select 
                        value={companyInfo.industry} 
                        onValueChange={(value) => setCompanyInfo({...companyInfo, industry: value})}
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biotech">Biotech</SelectItem>
                          <SelectItem value="pharma">Pharmaceutical</SelectItem>
                          <SelectItem value="meddevice">Medical Device</SelectItem>
                          <SelectItem value="cro">Contract Research Organization</SelectItem>
                          <SelectItem value="nonprofit">Non-profit/Academic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size <span className="text-red-500">*</span></Label>
                      <Select 
                        value={companyInfo.companySize} 
                        onValueChange={(value) => setCompanyInfo({...companyInfo, companySize: value})}
                      >
                        <SelectTrigger id="companySize">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Company Website</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                          <Globe className="h-4 w-4" />
                        </span>
                        <Input 
                          id="website" 
                          name="website" 
                          className="rounded-l-none" 
                          value={companyInfo.website} 
                          onChange={handleCompanyInfoChange} 
                          placeholder="www.example.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={companyInfo.address} 
                      onChange={handleCompanyInfoChange} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={companyInfo.city} 
                        onChange={handleCompanyInfoChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={companyInfo.state} 
                        onChange={handleCompanyInfoChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={companyInfo.country} 
                        onValueChange={(value) => setCompanyInfo({...companyInfo, country: value})}
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="jp">Japan</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Postal/Zip Code</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={companyInfo.zipCode} 
                        onChange={handleCompanyInfoChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / EIN</Label>
                      <Input 
                        id="taxId" 
                        name="taxId" 
                        value={companyInfo.taxId} 
                        onChange={handleCompanyInfoChange} 
                        placeholder="XX-XXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Company Phone</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                          <Phone className="h-4 w-4" />
                        </span>
                        <Input 
                          id="phone" 
                          name="phone" 
                          className="rounded-l-none" 
                          value={companyInfo.phone} 
                          onChange={handleCompanyInfoChange} 
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => setLocation('/')}>
                    Cancel
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 2: Primary Contact */}
            {activeStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Primary Contact</CardTitle>
                  <CardDescription>Please provide details for the main account administrator</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={primaryContact.firstName} 
                        onChange={handlePrimaryContactChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={primaryContact.lastName} 
                        onChange={handlePrimaryContactChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={primaryContact.title} 
                      onChange={handlePrimaryContactChange} 
                      placeholder="VP of Regulatory Affairs"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          className="rounded-l-none" 
                          value={primaryContact.email} 
                          onChange={handlePrimaryContactChange} 
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number <span className="text-red-500">*</span></Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                          <Phone className="h-4 w-4" />
                        </span>
                        <Input 
                          id="contactPhone" 
                          name="phone" 
                          className="rounded-l-none" 
                          value={primaryContact.phone} 
                          onChange={handlePrimaryContactChange} 
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Create Password <span className="text-red-500">*</span></Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={primaryContact.password} 
                      onChange={handlePrimaryContactChange} 
                    />
                    <p className="text-xs text-[#86868b]">
                      Password must be at least 8 characters and include a mix of letters, numbers, and special characters.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={primaryContact.confirmPassword} 
                      onChange={handlePrimaryContactChange} 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => setActiveStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 3: Team Members */}
            {activeStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Team Members</CardTitle>
                  <CardDescription>Add the members of your team who need access to TrialSage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-[#f8f9ff] p-4 rounded-lg border border-[#e5e5e7] flex items-start">
                    <div className="mr-4 mt-1 text-[#06c]">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1d1d1f]">Why add team members now?</h4>
                      <p className="text-sm text-[#424245]">
                        Adding your team members during setup allows each person to receive personalized 
                        onboarding and training. You can always add or remove team members later through 
                        your account settings.
                      </p>
                    </div>
                  </div>
                  
                  {teamMembers.map((member, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Team Member {index + 1}</CardTitle>
                          {index > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeTeamMember(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`firstName-${index}`}>First Name <span className="text-red-500">*</span></Label>
                            <Input 
                              id={`firstName-${index}`} 
                              value={member.firstName} 
                              onChange={(e) => handleTeamMemberChange(index, 'firstName', e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`lastName-${index}`}>Last Name <span className="text-red-500">*</span></Label>
                            <Input 
                              id={`lastName-${index}`} 
                              value={member.lastName} 
                              onChange={(e) => handleTeamMemberChange(index, 'lastName', e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`email-${index}`}>Email <span className="text-red-500">*</span></Label>
                            <Input 
                              id={`email-${index}`} 
                              type="email" 
                              value={member.email} 
                              onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)} 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <RadioGroup 
                            value={member.role} 
                            onValueChange={(value) => handleTeamMemberChange(index, 'role', value)}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="admin" id={`admin-${index}`} />
                              <Label htmlFor={`admin-${index}`} className="font-normal">
                                <span className="font-medium">Administrator</span> - Full access to all modules and settings
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="manager" id={`manager-${index}`} />
                              <Label htmlFor={`manager-${index}`} className="font-normal">
                                <span className="font-medium">Manager</span> - Can manage projects and view analytics
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="user" id={`user-${index}`} />
                              <Label htmlFor={`user-${index}`} className="font-normal">
                                <span className="font-medium">Standard User</span> - Access to assigned modules only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="viewer" id={`viewer-${index}`} />
                              <Label htmlFor={`viewer-${index}`} className="font-normal">
                                <span className="font-medium">Viewer</span> - Read-only access to assigned modules
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {(member.role === 'user' || member.role === 'viewer') && (
                          <div className="space-y-2">
                            <Label>Module Access</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`ind-wizard-${index}`} 
                                  checked={member.access.includes('ind-wizard')}
                                  onCheckedChange={() => handleTeamMemberAccessChange(index, 'ind-wizard')}
                                />
                                <Label htmlFor={`ind-wizard-${index}`} className="font-normal flex items-center">
                                  <FileCheck className="h-4 w-4 mr-1 text-[#06c]" /> IND Wizard
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`csr-intelligence-${index}`} 
                                  checked={member.access.includes('csr-intelligence')}
                                  onCheckedChange={() => handleTeamMemberAccessChange(index, 'csr-intelligence')}
                                />
                                <Label htmlFor={`csr-intelligence-${index}`} className="font-normal flex items-center">
                                  <LayoutDashboard className="h-4 w-4 mr-1 text-[#06c]" /> CSR Intelligence
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`document-vault-${index}`} 
                                  checked={member.access.includes('document-vault')}
                                  onCheckedChange={() => handleTeamMemberAccessChange(index, 'document-vault')}
                                />
                                <Label htmlFor={`document-vault-${index}`} className="font-normal flex items-center">
                                  <Database className="h-4 w-4 mr-1 text-[#06c]" /> Document Vault
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`ask-lumen-${index}`} 
                                  checked={member.access.includes('ask-lumen')}
                                  onCheckedChange={() => handleTeamMemberAccessChange(index, 'ask-lumen')}
                                />
                                <Label htmlFor={`ask-lumen-${index}`} className="font-normal flex items-center">
                                  <Sparkles className="h-4 w-4 mr-1 text-[#06c]" /> Ask Lumen
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addTeamMember}
                    className="w-full flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Team Member
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => setActiveStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 4: Subscription Plan */}
            {activeStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Select Your Modules</CardTitle>
                  <CardDescription>Choose the modules and features that best suit your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base">Select Your Plan</Label>
                      <RadioGroup 
                        value={selectedPlan} 
                        onValueChange={setSelectedPlan}
                        className="space-y-3"
                      >
                        <div className={`border rounded-lg p-4 ${selectedPlan === 'standard' ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <RadioGroupItem value="standard" id="standard" className="sr-only" />
                          <Label htmlFor="standard" className="flex justify-between cursor-pointer">
                            <div>
                              <h3 className="font-semibold text-[#1d1d1f]">Standard</h3>
                              <p className="text-sm text-[#424245]">Best for small teams starting their regulatory journey</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-[#1d1d1f]">$1,999/month</div>
                              <div className="text-sm text-[#424245]">Up to 5 users</div>
                            </div>
                          </Label>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedPlan === 'pro' ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <RadioGroupItem value="pro" id="pro" className="sr-only" />
                          <div className="absolute right-4 top-4">
                            <Badge className="bg-[#06c]">Popular</Badge>
                          </div>
                          <Label htmlFor="pro" className="flex justify-between cursor-pointer">
                            <div>
                              <h3 className="font-semibold text-[#1d1d1f]">Professional</h3>
                              <p className="text-sm text-[#424245]">For growing regulatory teams with advanced needs</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-[#1d1d1f]">$4,999/month</div>
                              <div className="text-sm text-[#424245]">Up to 15 users</div>
                            </div>
                          </Label>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedPlan === 'enterprise' ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <RadioGroupItem value="enterprise" id="enterprise" className="sr-only" />
                          <Label htmlFor="enterprise" className="flex justify-between cursor-pointer">
                            <div>
                              <h3 className="font-semibold text-[#1d1d1f]">Enterprise</h3>
                              <p className="text-sm text-[#424245]">For large organizations with complex regulatory workflows</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-[#1d1d1f]">Custom Pricing</div>
                              <div className="text-sm text-[#424245]">Unlimited users</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base">Select Modules</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`border rounded-lg p-4 ${selectedModules['ind-wizard'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="ind-wizard-module" 
                              checked={selectedModules['ind-wizard']}
                              onCheckedChange={() => handleModuleChange('ind-wizard')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="ind-wizard-module" className="flex items-center font-semibold">
                                <FileCheck className="h-5 w-5 mr-2 text-[#06c]" /> IND Wizard™
                              </Label>
                              <p className="text-sm text-[#424245]">
                                Fully automated IND submissions with AI-generated regulatory documents
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedModules['csr-intelligence'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="csr-intelligence-module" 
                              checked={selectedModules['csr-intelligence']}
                              onCheckedChange={() => handleModuleChange('csr-intelligence')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="csr-intelligence-module" className="flex items-center font-semibold">
                                <LayoutDashboard className="h-5 w-5 mr-2 text-[#06c]" /> CSR Intelligence™
                              </Label>
                              <p className="text-sm text-[#424245]">
                                Transform static CSRs into interactive dashboards with structured data extraction
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedModules['document-vault'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="document-vault-module" 
                              checked={selectedModules['document-vault']}
                              onCheckedChange={() => handleModuleChange('document-vault')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="document-vault-module" className="flex items-center font-semibold">
                                <Database className="h-5 w-5 mr-2 text-[#06c]" /> Document Vault™
                              </Label>
                              <p className="text-sm text-[#424245]">
                                Secure, regulated document storage with intuitive version control
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedModules['cmc-blueprint'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="cmc-blueprint-module" 
                              checked={selectedModules['cmc-blueprint']}
                              onCheckedChange={() => handleModuleChange('cmc-blueprint')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="cmc-blueprint-module" className="flex items-center font-semibold">
                                <Microscope className="h-5 w-5 mr-2 text-[#06c]" /> CMC Blueprint™
                              </Label>
                              <p className="text-sm text-[#424245]">
                                AI-powered Chemistry, Manufacturing, and Controls documentation
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedModules['ask-lumen'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="ask-lumen-module" 
                              checked={selectedModules['ask-lumen']}
                              onCheckedChange={() => handleModuleChange('ask-lumen')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="ask-lumen-module" className="flex items-center font-semibold">
                                <Sparkles className="h-5 w-5 mr-2 text-[#06c]" /> Ask Lumen™ AI Assistant
                              </Label>
                              <p className="text-sm text-[#424245]">
                                AI regulatory assistant with document upload and analysis capabilities
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`border rounded-lg p-4 ${selectedModules['analytics-dashboard'] ? 'border-[#06c] bg-[#f8f9ff]' : 'border-[#e5e5e7]'}`}>
                          <div className="flex items-start">
                            <Checkbox 
                              id="analytics-dashboard-module" 
                              checked={selectedModules['analytics-dashboard']}
                              onCheckedChange={() => handleModuleChange('analytics-dashboard')}
                              className="mt-1"
                            />
                            <div className="ml-3">
                              <Label htmlFor="analytics-dashboard-module" className="flex items-center font-semibold">
                                <BarChart3 className="h-5 w-5 mr-2 text-[#06c]" /> Analytics Dashboard
                              </Label>
                              <p className="text-sm text-[#424245]">
                                25+ interactive dashboards with AI copilot for regulatory metrics
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border border-[#e5e5e7] overflow-hidden mt-6">
                      <div className="bg-[#f5f5f7] px-4 py-3 border-b border-[#e5e5e7]">
                        <h3 className="font-semibold text-[#1d1d1f]">Additional Services</h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <Checkbox id="onboarding" className="mt-1" />
                            <div className="ml-3">
                              <Label htmlFor="onboarding" className="font-semibold">White-Glove Onboarding & Training</Label>
                              <p className="text-sm text-[#424245]">
                                Personalized onboarding sessions and training for your team
                              </p>
                              <div className="text-sm font-medium text-[#06c]">$4,999 one-time fee</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Checkbox id="import-service" className="mt-1" />
                            <div className="ml-3">
                              <Label htmlFor="import-service" className="font-semibold">Legacy Data Import Service</Label>
                              <p className="text-sm text-[#424245]">
                                Let our experts migrate your existing regulatory documents
                              </p>
                              <div className="text-sm font-medium text-[#06c]">Starting at $9,999</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <Checkbox id="custom-api" className="mt-1" />
                            <div className="ml-3">
                              <Label htmlFor="custom-api" className="font-semibold">Custom API Development</Label>
                              <p className="text-sm text-[#424245]">
                                Custom API development for integration with your existing systems
                              </p>
                              <div className="text-sm font-medium text-[#06c]">Starting at $19,999</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => setActiveStep(3)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
            
            {/* Step 5: Review and Submit */}
            {activeStep === 5 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Review Your Information</CardTitle>
                  <CardDescription>Please review all details before finalizing your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="company" className="mt-2">
                    <TabsList>
                      <TabsTrigger value="company">Company</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="company" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Company Name</Label>
                            <div className="font-medium">{companyInfo.companyName || 'Not provided'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Industry</Label>
                            <div className="font-medium">
                              {companyInfo.industry === 'biotech' && 'Biotech'}
                              {companyInfo.industry === 'pharma' && 'Pharmaceutical'}
                              {companyInfo.industry === 'meddevice' && 'Medical Device'}
                              {companyInfo.industry === 'cro' && 'Contract Research Organization'}
                              {companyInfo.industry === 'nonprofit' && 'Non-profit/Academic'}
                              {companyInfo.industry === 'other' && 'Other'}
                              {!companyInfo.industry && 'Not provided'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Company Size</Label>
                            <div className="font-medium">{companyInfo.companySize || 'Not provided'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Website</Label>
                            <div className="font-medium">{companyInfo.website || 'Not provided'}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-[#86868b]">Address</Label>
                          <div className="font-medium">
                            {companyInfo.address && `${companyInfo.address}, `}
                            {companyInfo.city && `${companyInfo.city}, `}
                            {companyInfo.state && `${companyInfo.state}, `}
                            {companyInfo.country && `${companyInfo.country}, `}
                            {companyInfo.zipCode && companyInfo.zipCode}
                            {!companyInfo.address && !companyInfo.city && !companyInfo.state && !companyInfo.country && 'Not provided'}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="contact" className="mt-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Name</Label>
                            <div className="font-medium">
                              {primaryContact.firstName && primaryContact.lastName 
                                ? `${primaryContact.firstName} ${primaryContact.lastName}`
                                : 'Not provided'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Job Title</Label>
                            <div className="font-medium">{primaryContact.title || 'Not provided'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Email</Label>
                            <div className="font-medium">{primaryContact.email || 'Not provided'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-[#86868b]">Phone</Label>
                            <div className="font-medium">{primaryContact.phone || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="team" className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Access</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((member, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {member.firstName && member.lastName
                                  ? `${member.firstName} ${member.lastName}`
                                  : 'Not provided'}
                              </TableCell>
                              <TableCell>{member.email || 'Not provided'}</TableCell>
                              <TableCell>
                                {member.role === 'admin' && 'Administrator'}
                                {member.role === 'manager' && 'Manager'}
                                {member.role === 'user' && 'Standard User'}
                                {member.role === 'viewer' && 'Viewer'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {member.role === 'admin' && (
                                    <Badge variant="outline" className="bg-[#f8f9ff] border-[#e5e5e7]">All Modules</Badge>
                                  )}
                                  {member.role === 'manager' && (
                                    <Badge variant="outline" className="bg-[#f8f9ff] border-[#e5e5e7]">Management Access</Badge>
                                  )}
                                  {(member.role === 'user' || member.role === 'viewer') && member.access.map((mod, i) => (
                                    <Badge key={i} variant="outline" className="bg-[#f8f9ff] border-[#e5e5e7]">
                                      {mod === 'ind-wizard' && 'IND Wizard'}
                                      {mod === 'csr-intelligence' && 'CSR Intelligence'}
                                      {mod === 'document-vault' && 'Document Vault'}
                                      {mod === 'ask-lumen' && 'Ask Lumen'}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    <TabsContent value="subscription" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-[#86868b]">Selected Plan</Label>
                          <div className="font-medium">
                            {selectedPlan === 'standard' && 'Standard Plan - $1,999/month (up to 5 users)'}
                            {selectedPlan === 'pro' && 'Professional Plan - $4,999/month (up to 15 users)'}
                            {selectedPlan === 'enterprise' && 'Enterprise Plan - Custom Pricing (unlimited users)'}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-[#86868b]">Selected Modules</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedModules['ind-wizard'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <FileCheck className="h-3 w-3 mr-1" /> IND Wizard
                              </Badge>
                            )}
                            {selectedModules['csr-intelligence'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <LayoutDashboard className="h-3 w-3 mr-1" /> CSR Intelligence
                              </Badge>
                            )}
                            {selectedModules['document-vault'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <Database className="h-3 w-3 mr-1" /> Document Vault
                              </Badge>
                            )}
                            {selectedModules['cmc-blueprint'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <Microscope className="h-3 w-3 mr-1" /> CMC Blueprint
                              </Badge>
                            )}
                            {selectedModules['ask-lumen'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <Sparkles className="h-3 w-3 mr-1" /> Ask Lumen
                              </Badge>
                            )}
                            {selectedModules['analytics-dashboard'] && (
                              <Badge className="bg-[#f8f9ff] text-[#06c] border-[#e5e5e7]">
                                <BarChart3 className="h-3 w-3 mr-1" /> Analytics Dashboard
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 border border-[#e5e5e7] rounded-lg bg-[#f9f9fb]">
                          <div className="flex justify-between mb-2">
                            <span>Subscription Total</span>
                            <span className="font-semibold">
                              {selectedPlan === 'standard' && '$1,999/month'}
                              {selectedPlan === 'pro' && '$4,999/month'}
                              {selectedPlan === 'enterprise' && 'Custom Pricing'}
                            </span>
                          </div>
                          <div className="text-sm text-[#86868b]">
                            You'll receive an invoice once your account is approved. Enterprise plans require a consultation with our team.
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex items-start space-x-2 mt-6 p-4 border border-[#e5e5e7] rounded-lg bg-[#f9f9fb]">
                    <Checkbox 
                      id="terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal leading-snug text-[#424245]"
                      >
                        By checking this box, I agree to the <a href="#" className="text-[#06c] hover:underline">Terms of Service</a>, <a href="#" className="text-[#06c] hover:underline">Privacy Policy</a>, and <a href="#" className="text-[#06c] hover:underline">Acceptable Use Policy</a>. I understand that my information will be used as described in the Privacy Policy.
                      </Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                  <Button variant="outline" onClick={() => setActiveStep(4)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit}>
                    Complete Registration
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}