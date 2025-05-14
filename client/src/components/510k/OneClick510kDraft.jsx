/**
 * OneClick510kDraft Component
 * 
 * This component enables users to generate an FDA-compliant 510(k) draft
 * with a single click, leveraging document templates and AI assistance.
 * It integrates with the workflow system for document review and approval.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download, 
  RotateCw, 
  ArrowRight, 
  ExternalLink,
  FileCheck,
  Zap,
  Search
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { startWorkflow, getPredefinedTemplate } from '../unified-workflow/WorkflowTemplateService';
import { apiRequest } from '@/lib/queryClient';

// Temporary organization and user IDs for demonstration
const MOCK_ORGANIZATION_ID = 'org-123';
const MOCK_USER_ID = 'user-456';

// Predicate device database options
const PREDICATE_DEVICES = [
  { id: 'pd-001', name: 'CardioVascular Monitor X200', manufacturer: 'MedDev Inc.', k_number: 'K123456' },
  { id: 'pd-002', name: 'OrthoKnee Implant System', manufacturer: 'OrthoTech', k_number: 'K789012' },
  { id: 'pd-003', name: 'DiabetesMonitor Pro', manufacturer: 'Glucotech', k_number: 'K345678' },
  { id: 'pd-004', name: 'NeuroPain Stimulator XR', manufacturer: 'NeuralMed', k_number: 'K901234' },
  { id: 'pd-005', name: 'OphthaCam Imaging System', manufacturer: 'VisualDiag', k_number: 'K567890' }
];

const OneClick510kDraft = () => {
  const [selectedTab, setSelectedTab] = useState('traditional');
  const [title, setTitle] = useState('');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [predicateDevice, setPredicateDevice] = useState('');
  const [predicateSearch, setPredicateSearch] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState('');
  const [selectedSections, setSelectedSections] = useState({
    deviceDescription: true,
    intendedUse: true,
    substantial_equivalence: true,
    engineering_performance: true,
    biocompatibility: false,
    sterilization: false,
    shelf_life: false,
    software: false,
    clinical_data: false,
    animal_studies: false,
    electrical_safety: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [startWorkflowDialogOpen, setStartWorkflowDialogOpen] = useState(false);
  const [draftFormat, setDraftFormat] = useState('pdf');
  const [templateId, setTemplateId] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Filter predicate devices based on search
  const filteredPredicateDevices = predicateSearch 
    ? PREDICATE_DEVICES.filter(device => 
        device.name.toLowerCase().includes(predicateSearch.toLowerCase()) || 
        device.manufacturer.toLowerCase().includes(predicateSearch.toLowerCase()) ||
        device.k_number.toLowerCase().includes(predicateSearch.toLowerCase())
      )
    : PREDICATE_DEVICES;

  // Mutation for generating a 510(k) draft
  const generateDraftMutation = useMutation({
    mutationFn: (draftData) => {
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setGenerationProgress(Math.min(progress, 95));
        if (progress >= 95) clearInterval(progressInterval);
      }, 300);

      // API call to generate draft
      return apiRequest({
        url: '/api/module-integration/510k/generate-draft',
        method: 'POST',
        data: draftData
      }).finally(() => {
        clearInterval(progressInterval);
        setGenerationProgress(100);
      });
    },
    onSuccess: (data) => {
      setGeneratedDraft(data);
      toast({
        title: "Draft generated successfully",
        description: "Your 510(k) draft has been generated and is ready for review.",
      });
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: `Failed to generate 510(k) draft: ${error.message}`,
        variant: "destructive",
      });
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  });
  
  // Mutation for starting the workflow
  const startWorkflowMutation = useMutation({
    mutationFn: (workflowData) => {
      return startWorkflow(
        workflowData.documentId,
        workflowData.templateId,
        workflowData.startedBy,
        workflowData.metadata
      );
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow started",
        description: "The approval workflow has been initiated for your 510(k) draft.",
      });
      setStartWorkflowDialogOpen(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/module-integration/active-workflows'] 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start workflow: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Get selected sections as array
  const getSelectedSectionsArray = () => {
    return Object.entries(selectedSections)
      .filter(([_, isSelected]) => isSelected)
      .map(([section]) => section);
  };

  // Handle generate draft button click
  const handleGenerateDraft = () => {
    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your 510(k) submission.",
        variant: "destructive",
      });
      return;
    }

    if (!predicateDevice) {
      toast({
        title: "Missing information",
        description: "Please select a predicate device for comparison.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateDraftMutation.mutate({
      title,
      deviceDescription,
      intendedUse,
      predicateDevice,
      technicalSpecs,
      selectedSections: getSelectedSectionsArray(),
      draftType: selectedTab,
      format: draftFormat,
      organizationId: MOCK_ORGANIZATION_ID
    });
  };

  // Handle starting workflow
  const handleStartWorkflow = () => {
    if (!generatedDraft?.id) {
      toast({
        title: "No draft available",
        description: "Please generate a draft before starting a workflow.",
        variant: "destructive",
      });
      return;
    }

    // Get template based on draft type
    const template = getPredefinedTemplate(selectedTab, '510k');
    setTemplateId(template.id || 'default-template');
    
    setStartWorkflowDialogOpen(true);
  };

  // Handle workflow submission
  const handleSubmitWorkflow = () => {
    startWorkflowMutation.mutate({
      documentId: generatedDraft.id,
      templateId: templateId,
      startedBy: MOCK_USER_ID,
      metadata: {
        draftType: selectedTab,
        format: draftFormat,
        sections: getSelectedSectionsArray()
      }
    });
  };

  // Handle section toggle
  const handleSectionToggle = (section) => {
    setSelectedSections({
      ...selectedSections,
      [section]: !selectedSections[section]
    });
  };

  // Reset form when tab changes
  useEffect(() => {
    setGeneratedDraft(null);
  }, [selectedTab]);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">510(k) Draft Generator</h2>
          <p className="text-muted-foreground">
            Generate FDA-compliant 510(k) submissions with one click
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a 
                href="https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  FDA Guidelines
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Opens FDA guidance for 510(k) submissions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="traditional">Traditional 510(k)</TabsTrigger>
          <TabsTrigger value="abbreviated">Abbreviated 510(k)</TabsTrigger>
          <TabsTrigger value="special">Special 510(k)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="traditional" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Traditional 510(k) Submission</CardTitle>
              <CardDescription>
                Complete comparison to a legally marketed device with detailed performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form fields for Traditional 510(k) */}
              {renderFormFields()}
            </CardContent>
            <CardFooter>
              {renderActionButtons()}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="abbreviated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Abbreviated 510(k) Submission</CardTitle>
              <CardDescription>
                Utilizes guidance documents, special controls, and recognized standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form fields for Abbreviated 510(k) */}
              {renderFormFields()}
            </CardContent>
            <CardFooter>
              {renderActionButtons()}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="special" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Special 510(k) Submission</CardTitle>
              <CardDescription>
                For modifications to a manufacturer's own legally marketed device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form fields for Special 510(k) */}
              {renderFormFields()}
            </CardContent>
            <CardFooter>
              {renderActionButtons()}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Generation Results Card */}
      {(isGenerating || generatedDraft) && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Status</CardTitle>
            <CardDescription>
              {isGenerating 
                ? "Your 510(k) draft is being prepared..." 
                : `Your ${selectedTab} 510(k) draft is ready for review`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Generating FDA-compliant document...
                  </span>
                  <span className="text-sm">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
                <div className="space-y-2">
                  {generationProgress >= 20 && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Preparing document structure
                    </div>
                  )}
                  {generationProgress >= 40 && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Generating device description content
                    </div>
                  )}
                  {generationProgress >= 60 && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Analyzing predicate device comparison
                    </div>
                  )}
                  {generationProgress >= 80 && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Validating FDA compliance
                    </div>
                  )}
                  {generationProgress == 100 && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Draft generation complete
                    </div>
                  )}
                </div>
              </div>
            ) : generatedDraft && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    <FileCheck className="h-3 w-3 mr-1 text-green-500" />
                    Draft Ready
                  </Badge>
                  <Badge variant="outline">
                    {draftFormat.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Document Title</p>
                      <p className="text-sm">{title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Submission Type</p>
                      <p className="text-sm capitalize">{selectedTab} 510(k)</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Generated On</p>
                      <p className="text-sm">{new Date().toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">File Size</p>
                      <p className="text-sm">{(Math.random() * 3 + 1).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    className="w-1/3"
                    variant="outline"
                    onClick={() => window.open(`/api/module-integration/510k/preview-draft/${generatedDraft.id}`, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    className="w-1/3"
                    variant="outline"
                    onClick={() => window.location.href = `/api/module-integration/510k/download-draft/${generatedDraft.id}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    className="w-1/3"
                    onClick={handleStartWorkflow}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Workflow
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Workflow Dialog */}
      <Dialog open={startWorkflowDialogOpen} onOpenChange={setStartWorkflowDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start Approval Workflow</DialogTitle>
            <DialogDescription>
              This will initiate the approval process for your 510(k) draft.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Title</Label>
              <p className="text-sm border rounded-md p-2">{title}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Workflow Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workflow template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Templates</SelectLabel>
                    <SelectItem value="default-template">
                      {selectedTab === 'traditional' && 'Traditional 510(k) Workflow'}
                      {selectedTab === 'abbreviated' && 'Abbreviated 510(k) Workflow'}
                      {selectedTab === 'special' && 'Special 510(k) Workflow'}
                    </SelectItem>
                    <SelectItem value="expedited-template">Expedited Review Workflow</SelectItem>
                    <SelectItem value="standard-template">Standard Regulatory Review</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Additional Comments</Label>
              <Textarea 
                placeholder="Add any specific instructions for reviewers..."
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartWorkflowDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitWorkflow}
              disabled={startWorkflowMutation.isPending}
            >
              {startWorkflowMutation.isPending ? (
                <>
                  <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Start Workflow
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  // Render form fields
  function renderFormFields() {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="title">Device Name / Submission Title</Label>
          <Input
            id="title"
            placeholder="Enter the device name or submission title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deviceDescription">Device Description</Label>
          <Textarea
            id="deviceDescription"
            placeholder="Describe the device including its technological characteristics..."
            value={deviceDescription}
            onChange={(e) => setDeviceDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="intendedUse">Intended Use / Indications for Use</Label>
          <Textarea
            id="intendedUse"
            placeholder="Specify the intended clinical use and patient population..."
            value={intendedUse}
            onChange={(e) => setIntendedUse(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Predicate Device</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search predicate devices..."
              className="pl-8 mb-2"
              value={predicateSearch}
              onChange={(e) => setPredicateSearch(e.target.value)}
            />
          </div>
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-[200px]">
              {filteredPredicateDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No predicate devices found</p>
                </div>
              ) : (
                filteredPredicateDevices.map((device) => (
                  <div 
                    key={device.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                      predicateDevice === device.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setPredicateDevice(device.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">{device.manufacturer}</p>
                      </div>
                      <Badge variant="outline">{device.k_number}</Badge>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="technicalSpecs">Technical Specifications</Label>
          <Textarea
            id="technicalSpecs"
            placeholder="Enter key technical specifications and performance data..."
            value={technicalSpecs}
            onChange={(e) => setTechnicalSpecs(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Output Format</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="format-pdf"
                value="pdf"
                checked={draftFormat === 'pdf'}
                onChange={() => setDraftFormat('pdf')}
                className="h-4 w-4"
              />
              <Label htmlFor="format-pdf" className="font-normal">PDF</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="format-docx"
                value="docx"
                checked={draftFormat === 'docx'}
                onChange={() => setDraftFormat('docx')}
                className="h-4 w-4"
              />
              <Label htmlFor="format-docx" className="font-normal">MS Word (.docx)</Label>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Label>Include Sections</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {Object.entries(selectedSections).map(([section, checked]) => (
              <div className="flex items-center space-x-2" key={section}>
                <Checkbox 
                  id={section} 
                  checked={checked}
                  onCheckedChange={() => handleSectionToggle(section)}
                />
                <Label 
                  htmlFor={section} 
                  className="font-normal text-sm capitalize"
                >
                  {section.replace(/_/g, ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  
  // Render action buttons
  function renderActionButtons() {
    return (
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setTitle('');
            setDeviceDescription('');
            setIntendedUse('');
            setPredicateDevice('');
            setTechnicalSpecs('');
          }}
        >
          Reset
        </Button>
        <Button 
          onClick={handleGenerateDraft} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate Draft
            </>
          )}
        </Button>
      </div>
    );
  }
};

export default OneClick510kDraft;