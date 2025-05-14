/**
 * OneClick510kDraft Component
 * 
 * This component provides a simplified "one-click" interface for generating 
 * predefined 510(k) document templates with default settings. It's designed
 * for users who need standardized reports without extensive customization.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Predefined template options for 510(k) submissions
const TEMPLATE_OPTIONS = [
  {
    id: 'standard_510k',
    name: 'Standard 510(k) Template',
    description: 'Complete template for Standard 510(k) submissions with all required sections',
    sections: [
      'Administrative',
      'Device Description',
      'Substantial Equivalence',
      'Performance Testing',
      'Biocompatibility',
      'Sterilization',
      'Shelf Life',
      'Clinical Data',
      'Software Validation',
      'Risk Analysis'
    ]
  },
  {
    id: 'abbreviated_510k',
    name: 'Abbreviated 510(k) Template',
    description: 'Streamlined template for Abbreviated 510(k) submissions based on guidance documents',
    sections: [
      'Administrative',
      'Device Description',
      'Declaration of Conformity',
      'Summary of Performance Testing',
      'Risk Analysis'
    ]
  },
  {
    id: 'special_510k',
    name: 'Special 510(k) Template',
    description: 'Template for device modifications where design controls were utilized',
    sections: [
      'Administrative',
      'Device Description',
      'Modification Description',
      'Design Control Activities',
      'Risk Analysis',
      'Declaration of Conformity'
    ]
  }
];

// Predefined device types for quicker selection
const DEVICE_TYPES = [
  { id: 'diagnostic', name: 'Diagnostic Device' },
  { id: 'therapeutic', name: 'Therapeutic Device' },
  { id: 'implantable', name: 'Implantable Device' },
  { id: 'monitoring', name: 'Monitoring Device' },
  { id: 'imaging', name: 'Imaging Device' },
  { id: 'surgical', name: 'Surgical Device' },
  { id: 'software', name: 'Software as a Medical Device (SaMD)' },
  { id: 'combination_product', name: 'Combination Product' },
  { id: 'other', name: 'Other Medical Device' }
];

const OneClick510kDraft = ({ organizationId, userId, onDraftCreated }) => {
  const [templateId, setTemplateId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [predicateDevice, setPredicateDevice] = useState('');
  const [includePredicateSearch, setIncludePredicateSearch] = useState(true);
  const [includeAIRecommendations, setIncludeAIRecommendations] = useState(true);
  const { toast } = useToast();
  
  // Selected template details
  const selectedTemplate = TEMPLATE_OPTIONS.find(t => t.id === templateId);
  
  // Create a new 510(k) draft document
  const createDraftMutation = useMutation({
    mutationFn: (documentData) => apiRequest('/api/module-integration/register-document', {
      method: 'POST',
      body: JSON.stringify(documentData)
    }),
    onSuccess: (data) => {
      toast({
        title: 'Draft Created',
        description: 'Your 510(k) draft has been created successfully.',
      });
      
      // If there's a callback, pass the created document data
      if (onDraftCreated) {
        onDraftCreated(data);
      }
      
      // Reset form
      setDeviceName('');
      setPredicateDevice('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create draft: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!templateId || !deviceName || !deviceType) {
      toast({
        title: 'Missing Information',
        description: 'Please select a template and provide device information.',
        variant: 'destructive'
      });
      return;
    }
    
    // Create the draft document
    createDraftMutation.mutate({
      title: `${deviceName} - ${selectedTemplate.name}`,
      documentType: '510k_submission',
      organizationId,
      createdBy: userId,
      status: 'draft',
      latestVersion: 1,
      moduleType: '510k',
      originalId: `510K-${Date.now()}`, // Generate a temporary ID
      metadata: {
        templateId,
        deviceName,
        deviceType,
        predicateDevice: predicateDevice || null,
        includePredicateSearch,
        includeAIRecommendations,
        createdVia: 'one_click_510k',
        sections: selectedTemplate.sections,
        creationDate: new Date().toISOString()
      }
    });
  };
  
  // Render section list
  const renderSections = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium">Included Sections:</h4>
        <ul className="grid grid-cols-2 gap-2">
          {selectedTemplate.sections.map((section, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{section}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          One-Click 510(k) Draft Generator
        </CardTitle>
        <CardDescription>
          Quickly generate a 510(k) document draft with predefined FDA-compliant templates
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="template">510(k) Template Type</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_OPTIONS.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <CardDescription className="mt-2">
                {selectedTemplate.description}
              </CardDescription>
            )}
            
            {renderSections()}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input 
                id="device-name" 
                placeholder="Enter the name of your medical device"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device-type">Device Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger id="device-type">
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="predicate-device">Predicate Device (optional)</Label>
              <Input 
                id="predicate-device" 
                placeholder="Enter a known predicate device name or 510(k) number"
                value={predicateDevice}
                onChange={(e) => setPredicateDevice(e.target.value)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="predicate-search" 
                checked={includePredicateSearch}
                onCheckedChange={setIncludePredicateSearch}
              />
              <label
                htmlFor="predicate-search"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include automatic predicate device search
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ai-recommendations" 
                checked={includeAIRecommendations}
                onCheckedChange={setIncludeAIRecommendations}
              />
              <label
                htmlFor="ai-recommendations"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include AI-driven content recommendations
              </label>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>FDA Compliance Notice</AlertTitle>
            <AlertDescription>
              This tool generates a draft that follows FDA 510(k) submission guidelines.
              All content should be reviewed by regulatory experts before final submission.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={createDraftMutation.isPending}
          >
            {createDraftMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate 510(k) Draft
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OneClick510kDraft;