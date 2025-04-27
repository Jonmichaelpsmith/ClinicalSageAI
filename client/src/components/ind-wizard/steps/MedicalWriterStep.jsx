/**
 * Medical Writer Step
 * 
 * This component provides an AI-powered medical writing assistant to help generate
 * high-quality regulatory documents for IND submissions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware, DataAware } from '@/components/ui/database-aware';
import ErrorBoundary from '@/components/ui/error-boundary';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  BookOpen,
  Clock,
  ClipboardCheck,
  Download,
  FileEdit,
  FileText,
  Folder,
  History,
  Lightbulb,
  MessageSquare,
  Pen,
  PencilRuler,
  RotateCw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  SquareTerminal,
  BookCheck,
  FileCheck,
  Files,
  FileX,
  FilePlus2,
  InfoIcon,
  Bookmark,
  Layers,
  Loader2,
  Zap,
  Columns,
  Workflow,
  Repeat
} from 'lucide-react';

// Document types with metadata
const DOCUMENT_TYPES = [
  {
    id: 'protocol',
    name: 'Clinical Protocol',
    description: 'Comprehensive study protocol document',
    icon: BookCheck,
    templates: [
      { id: 'p1-fih', name: 'Phase 1 - First in Human' },
      { id: 'p1-sad-mad', name: 'Phase 1 - SAD/MAD' },
      { id: 'p2-poc', name: 'Phase 2 - Proof of Concept' },
      { id: 'p3-pivotal', name: 'Phase 3 - Pivotal' }
    ]
  },
  {
    id: 'investigator-brochure',
    name: 'Investigator Brochure',
    description: 'Summary of relevant information for clinical investigators',
    icon: FileText,
    templates: [
      { id: 'ib-standard', name: 'Standard IB Template' },
      { id: 'ib-abbreviated', name: 'Abbreviated IB Template' }
    ]
  },
  {
    id: 'csr',
    name: 'Clinical Study Report',
    description: 'Detailed report of study methods and results',
    icon: ClipboardCheck,
    templates: [
      { id: 'csr-phase1', name: 'Phase 1 CSR' },
      { id: 'csr-phase2', name: 'Phase 2 CSR' },
      { id: 'csr-phase3', name: 'Phase 3 CSR' }
    ]
  },
  {
    id: 'summary',
    name: 'Clinical Summary',
    description: 'Overview of clinical data for IND submission',
    icon: Files,
    templates: [
      { id: 'clinical-summary', name: 'Clinical Summary' },
      { id: 'integrated-summary', name: 'Integrated Summary of Safety' }
    ]
  },
  {
    id: 'synopsis',
    name: 'Protocol Synopsis',
    description: 'Brief overview of study design and methodology',
    icon: FileCheck,
    templates: [
      { id: 'synopsis-standard', name: 'Standard Synopsis' },
      { id: 'synopsis-abbreviated', name: 'Abbreviated Synopsis' }
    ]
  },
  {
    id: 'informed-consent',
    name: 'Informed Consent Form',
    description: 'Document for obtaining participant consent',
    icon: FileText,
    templates: [
      { id: 'icf-standard', name: 'Standard ICF' },
      { id: 'icf-simplified', name: 'Simplified ICF' }
    ]
  },
  {
    id: 'nonclinical-summary',
    name: 'Nonclinical Summary',
    description: 'Summary of nonclinical data for IND submission',
    icon: Files,
    templates: [
      { id: 'nonclinical-standard', name: 'Standard Summary' }
    ]
  },
  {
    id: 'quality-summary',
    name: 'Quality Summary',
    description: 'Summary of CMC information for IND submission',
    icon: Files,
    templates: [
      { id: 'quality-standard', name: 'Standard Summary' }
    ]
  }
];

// AI models available for document generation
const AI_MODELS = [
  {
    id: 'reg-writer-pro',
    name: 'RegulatoryWriter Pro',
    description: 'Specialized for regulatory documents with ICH compliance',
    capabilities: ['High regulatory accuracy', 'ICH guideline awareness', 'Reference management'],
    default: true
  },
  {
    id: 'clinical-expert',
    name: 'Clinical Expert',
    description: 'Expert in clinical trial design and methodology',
    capabilities: ['Protocol optimization', 'Statistical methods', 'Clinical relevance']
  },
  {
    id: 'precision-editor',
    name: 'Precision Editor',
    description: 'Focuses on language quality and consistency',
    capabilities: ['Grammar perfection', 'Terminology consistency', 'Clear communication']
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'Combines all models for optimal results',
    capabilities: ['Regulatory accuracy', 'Clinical relevance', 'Language quality']
  }
];

// Document formats for export
const EXPORT_FORMATS = [
  { id: 'docx', name: 'Microsoft Word (.docx)', icon: FileText },
  { id: 'pdf', name: 'PDF Document (.pdf)', icon: FileText },
  { id: 'html', name: 'HTML Document (.html)', icon: FileText },
  { id: 'markdown', name: 'Markdown (.md)', icon: FileText }
];

/**
 * Document Type Selector Component
 */
function DocumentTypeSelector({ onSelectDocType }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select Document Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => (
          <Card 
            key={docType.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectDocType(docType)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <docType.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{docType.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{docType.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Document Template Selector Component
 */
function TemplateSelector({ docType, onBack, onSelectTemplate }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">{docType.name} Templates</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docType.templates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professionally designed template for {docType.name.toLowerCase()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Check className="h-4 w-4 mr-1" />
                Select
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Custom Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start from scratch with a custom template
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => onSelectTemplate({ id: 'custom', name: 'Custom Template' })}>
              <Plus className="h-4 w-4 mr-1" />
              Create Custom
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Arrow icons for the interface
const ArrowLeft = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-arrow-left", className)}
    {...props}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const Plus = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-plus", className)}
    {...props}
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const Eye = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-eye", className)}
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Check = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-check", className)}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * AI Configuration Component
 */
function AIConfiguration({ aiModel, setAiModel, aiSettings, setAiSettings }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">AI Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure the AI model and parameters for document generation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Model Selection</CardTitle>
            <CardDescription>
              Choose the AI model best suited for your document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {AI_MODELS.map((model) => (
              <div 
                key={model.id}
                className={cn(
                  "flex items-start p-3 rounded-md border hover:border-primary cursor-pointer transition-colors",
                  aiModel === model.id && "border-primary bg-primary/5"
                )}
                onClick={() => setAiModel(model.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                    {aiModel === model.id && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium">{model.name}</h4>
                    {model.default && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {model.capabilities.map((capability, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generation Parameters</CardTitle>
            <CardDescription>
              Fine-tune how the AI generates your document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="creativity">Creativity</Label>
                <span className="text-xs text-muted-foreground">
                  {aiSettings.creativity === 0 ? 'Low' : 
                   aiSettings.creativity === 50 ? 'Balanced' : 'High'}
                </span>
              </div>
              <Slider
                id="creativity"
                min={0}
                max={100}
                step={1}
                value={[aiSettings.creativity]}
                onValueChange={(value) => setAiSettings({ ...aiSettings, creativity: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                Lower values generate more conservative, standard regulatory language.
                Higher values allow more flexibility and creativity.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="detail">Level of Detail</Label>
                <span className="text-xs text-muted-foreground">
                  {aiSettings.detail === 0 ? 'Concise' : 
                   aiSettings.detail === 50 ? 'Balanced' : 'Comprehensive'}
                </span>
              </div>
              <Slider
                id="detail"
                min={0}
                max={100}
                step={1}
                value={[aiSettings.detail]}
                onValueChange={(value) => setAiSettings({ ...aiSettings, detail: value[0] })}
              />
              <p className="text-xs text-muted-foreground">
                Controls the level of detail in the generated content.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="references">Include References</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically generate and include relevant references
                  </p>
                </div>
                <Switch
                  id="references"
                  checked={aiSettings.includeReferences}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, includeReferences: checked })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ich-compliance">ICH Compliance Check</Label>
                  <p className="text-xs text-muted-foreground">
                    Ensure content complies with ICH guidelines
                  </p>
                </div>
                <Switch
                  id="ich-compliance"
                  checked={aiSettings.ichCompliance}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, ichCompliance: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Document Input Form Component
 */
function DocumentInputForm({ docType, template, onBack, onGenerate }) {
  const [formData, setFormData] = useState({
    title: '',
    drugName: '',
    indication: '',
    sponsorName: '',
    phase: '',
    studyObjectives: '',
    additionalInfo: ''
  });
  
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="text-lg font-semibold">Document Information</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {docType.name} - {template.name}
          </CardTitle>
          <CardDescription>
            Enter the information needed to generate your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder={`Enter ${docType.name} title`}
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drugName">Drug Name / Identifier</Label>
                <Input
                  id="drugName"
                  placeholder="e.g., ABC-123"
                  value={formData.drugName}
                  onChange={(e) => handleChange('drugName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="indication">Indication</Label>
                <Input
                  id="indication"
                  placeholder="e.g., Type 2 Diabetes"
                  value={formData.indication}
                  onChange={(e) => handleChange('indication', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sponsorName">Sponsor Name</Label>
                <Input
                  id="sponsorName"
                  placeholder="e.g., Acme Pharmaceuticals"
                  value={formData.sponsorName}
                  onChange={(e) => handleChange('sponsorName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phase">Clinical Phase</Label>
                <Select 
                  value={formData.phase} 
                  onValueChange={(value) => handleChange('phase', value)}
                >
                  <SelectTrigger id="phase">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Phase 1</SelectItem>
                    <SelectItem value="1b">Phase 1b</SelectItem>
                    <SelectItem value="2a">Phase 2a</SelectItem>
                    <SelectItem value="2b">Phase 2b</SelectItem>
                    <SelectItem value="3">Phase 3</SelectItem>
                    <SelectItem value="4">Phase 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studyObjectives">Study Objectives</Label>
              <Textarea
                id="studyObjectives"
                placeholder="Describe the primary and secondary objectives of the study"
                value={formData.studyObjectives}
                onChange={(e) => handleChange('studyObjectives', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Enter any additional information that should be included in the document"
                value={formData.additionalInfo}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                rows={5}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onBack}>
                Back
              </Button>
              <Button type="submit">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Document Generation Progress Component
 */
function GenerationProgress({ progress, status, onStop }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Generating Document</CardTitle>
        <CardDescription>
          AI is creating your document based on the provided information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-full bg-muted rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          
          <h3 className="text-lg font-medium mb-2">Processing your request</h3>
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Our AI system is generating a high-quality document based on your input.
            This may take a few minutes depending on complexity.
          </p>
          
          <div className="text-sm text-muted-foreground border rounded-md p-4 bg-muted/50 mb-6 w-full">
            <p className="font-medium mb-2">Current Stage: {status.stage}</p>
            <p>{status.message}</p>
          </div>
          
          <Button variant="outline" onClick={onStop}>
            Cancel Generation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Document Editor Component
 */
function DocumentEditor({ document, onSave, onExport }) {
  const [editedContent, setEditedContent] = useState(document.content);
  const [activeTab, setActiveTab] = useState('edit');
  
  const handleSave = () => {
    onSave({ ...document, content: editedContent });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={() => onExport(document)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="edit">
                <FileEdit className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <TabsContent value="edit" className="m-0">
            {/* This would use a rich text editor in real implementation */}
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[600px] p-4 border-0 rounded-none focus-visible:ring-0 resize-none font-mono"
            />
          </TabsContent>
          
          <TabsContent value="preview" className="m-0">
            <div className="min-h-[600px] p-8 prose prose-sm max-w-none">
              {/* This would render formatted document in real implementation */}
              <div dangerouslySetInnerHTML={{ __html: editedContent }} />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="m-0 p-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Document Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docTitle">Document Title</Label>
                  <Input id="docTitle" value={document.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Input id="docType" value={document.type} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" value={document.version || "1.0"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={document.date || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              
              <h4 className="text-sm font-medium mt-6">Export Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="exportWithComments" />
                  <Label htmlFor="exportWithComments">Include AI comments in export</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="exportWithVersion" />
                  <Label htmlFor="exportWithVersion">Include version history</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Export Dialog Component
 */
function ExportOptions({ document, onExport, onCancel }) {
  const [selectedFormat, setSelectedFormat] = useState('docx');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Document</CardTitle>
        <CardDescription>
          Choose the format for exporting your document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Export Format</Label>
          <div className="grid grid-cols-1 gap-2">
            {EXPORT_FORMATS.map((format) => (
              <div 
                key={format.id}
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-md border cursor-pointer",
                  selectedFormat === format.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedFormat(format.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                    {selectedFormat === format.id && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
                <format.icon className="h-4 w-4 text-muted-foreground" />
                <span>{format.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Export Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="includeMetadata" />
              <Label htmlFor="includeMetadata">Include document metadata</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="includeReferences" />
              <Label htmlFor="includeReferences">Include references</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="optimizeFormatting" defaultChecked />
              <Label htmlFor="optimizeFormatting">Optimize formatting</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onExport(document, selectedFormat)}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Medical Writer Dashboard
 */
function WriterDashboard({ projectId, onNewDocument, recentDocuments = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Medical Writer Dashboard</h3>
        <Button onClick={onNewDocument}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">No documents created yet</p>
                <Button variant="outline" className="mt-4" onClick={onNewDocument}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {recentDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <doc.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • Last edited {doc.lastEdited}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-full">
              <div className="bg-muted/40 rounded-md p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm">
                      I can help you create regulatory documents. What would you like to work on today?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Help me draft a protocol synopsis
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate inclusion/exclusion criteria
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Review my statistical analysis plan
                </Button>
              </div>
              
              <div className="mt-auto pt-4">
                <Button variant="default" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open AI Assistant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {DOCUMENT_TYPES.slice(0, 4).map((docType) => (
              <Button
                key={docType.id}
                variant="outline"
                className="h-auto py-6 px-4 flex flex-col items-center justify-center text-center"
                onClick={() => onNewDocument(docType)}
              >
                <docType.icon className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">{docType.name}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {docType.templates.length} templates
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-muted rounded-full p-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm">Protocol synopsis created</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-muted rounded-full p-1.5">
                <Repeat className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm">Investigator brochure revised</p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-muted rounded-full p-1.5">
                <Download className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm">Clinical summary exported</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Medical Writer Component
 */
export default function MedicalWriterStep({ projectId }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [view, setView] = useState('dashboard');
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [aiModel, setAiModel] = useState('reg-writer-pro');
  const [aiSettings, setAiSettings] = useState({
    creativity: 20,
    detail: 70,
    includeReferences: true,
    ichCompliance: true
  });
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState({
    stage: 'Initializing',
    message: 'Setting up document generation...'
  });
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Get recent documents
  const { 
    data: recentDocuments, 
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments 
  } = useQuery({
    queryKey: ['medical-writer-documents', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/medical-writer/documents`);
        if (!response.ok) throw new Error('Failed to fetch documents');
        return response.json();
      } catch (error) {
        console.error('Error fetching documents:', error);
        
        // Return placeholder data for demonstration
        return [
          {
            id: '1',
            title: 'Protocol Synopsis for IMD-2023',
            type: 'Protocol Synopsis',
            icon: FileText,
            lastEdited: '2 hours ago'
          },
          {
            id: '2',
            title: 'Investigator Brochure v1.0',
            type: 'Investigator Brochure',
            icon: BookOpen,
            lastEdited: 'Yesterday'
          },
          {
            id: '3',
            title: 'Phase 1 Clinical Study Report',
            type: 'Clinical Study Report',
            icon: ClipboardCheck,
            lastEdited: '1 week ago'
          }
        ];
      }
    },
    enabled: !!projectId && view === 'dashboard'
  });
  
  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate document generation with progress updates
      return new Promise((resolve) => {
        let progress = 0;
        
        // Update progress every 500ms
        const interval = setInterval(() => {
          progress += 5;
          setGenerationProgress(progress);
          
          // Update status messages at specific points
          if (progress === 10) {
            setGenerationStatus({
              stage: 'Analyzing Input',
              message: 'Processing your document specifications...'
            });
          } else if (progress === 30) {
            setGenerationStatus({
              stage: 'Drafting Content',
              message: 'Creating document structure and initial content...'
            });
          } else if (progress === 50) {
            setGenerationStatus({
              stage: 'Refining',
              message: 'Enhancing content quality and regulatory compliance...'
            });
          } else if (progress === 70) {
            setGenerationStatus({
              stage: 'Formatting',
              message: 'Applying proper formatting and styling...'
            });
          } else if (progress === 90) {
            setGenerationStatus({
              stage: 'Finalizing',
              message: 'Performing final quality checks...'
            });
          }
          
          // Complete the generation
          if (progress >= 100) {
            clearInterval(interval);
            
            // Generate a placeholder document
            const document = {
              id: Date.now().toString(),
              title: data.title,
              type: selectedDocType.name,
              template: selectedTemplate.name,
              version: '1.0',
              date: new Date().toISOString().split('T')[0],
              content: `
                <h1>${data.title}</h1>
                
                <h2>1. Overview</h2>
                <p>This document provides information about ${data.drugName} for the treatment of ${data.indication}.</p>
                
                <h2>2. Study Objectives</h2>
                <p>${data.studyObjectives}</p>
                
                <h2>3. Additional Information</h2>
                <p>${data.additionalInfo}</p>
              `
            };
            
            resolve(document);
          }
        }, 200);
      });
    },
    onSuccess: (document) => {
      toast({
        title: 'Document Generated',
        description: 'Your document has been successfully created',
        variant: 'default',
      });
      
      setGeneratedDocument(document);
      setView('editor');
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
      
      setView('input');
    }
  });
  
  // Save document mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async (document) => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/medical-writer/documents`, document);
        if (!response.ok) throw new Error('Failed to save document');
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (savedDocument) => {
      toast({
        title: 'Document Saved',
        description: 'Your document has been saved successfully',
        variant: 'default',
      });
      
      setGeneratedDocument(savedDocument);
      refetchDocuments();
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Export document mutation
  const exportDocumentMutation = useMutation({
    mutationFn: async ({ document, format }) => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/medical-writer/documents/${document.id}/export`, { format });
        if (!response.ok) throw new Error('Failed to export document');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${document.title}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Document Exported',
        description: 'Your document has been exported successfully',
        variant: 'default',
      });
      
      setShowExportOptions(false);
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle new document creation workflow
  const handleNewDocument = (docType) => {
    setSelectedDocType(docType || null);
    setView(docType ? 'template' : 'type');
  };
  
  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setView('config');
  };
  
  // Handle document generation
  const handleGenerateDocument = (formData) => {
    setView('generating');
    generateDocumentMutation.mutate(formData);
  };
  
  // Handle document save
  const handleSaveDocument = (document) => {
    saveDocumentMutation.mutate(document);
  };
  
  // Handle document export
  const handleExportDocument = (document, format) => {
    exportDocumentMutation.mutate({ document, format });
  };
  
  // Handle cancellation of generation
  const handleCancelGeneration = () => {
    generateDocumentMutation.cancel();
    setView('input');
  };
  
  // Handle views
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <WriterDashboard 
            projectId={projectId}
            onNewDocument={handleNewDocument}
            recentDocuments={recentDocuments}
          />
        );
        
      case 'type':
        return (
          <DocumentTypeSelector onSelectDocType={setSelectedDocType} />
        );
        
      case 'template':
        return (
          <TemplateSelector 
            docType={selectedDocType}
            onBack={() => setView('type')}
            onSelectTemplate={handleSelectTemplate}
          />
        );
        
      case 'config':
        return (
          <AIConfiguration 
            aiModel={aiModel}
            setAiModel={setAiModel}
            aiSettings={aiSettings}
            setAiSettings={setAiSettings}
            onBack={() => setView('template')}
            onNext={() => setView('input')}
          />
        );
        
      case 'input':
        return (
          <DocumentInputForm 
            docType={selectedDocType}
            template={selectedTemplate}
            onBack={() => setView('config')}
            onGenerate={handleGenerateDocument}
          />
        );
        
      case 'generating':
        return (
          <GenerationProgress 
            progress={generationProgress}
            status={generationStatus}
            onStop={handleCancelGeneration}
          />
        );
        
      case 'editor':
        return (
          <DocumentEditor 
            document={generatedDocument}
            onSave={handleSaveDocument}
            onExport={() => setShowExportOptions(true)}
          />
        );
        
      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">Invalid view state</p>
            <Button onClick={() => setView('dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        );
    }
  };
  
  return (
    <ErrorBoundary>
      <DatabaseAware
        title="Medical Writer Unavailable"
        description="The medical writer requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Medical Writer</h2>
              <p className="text-muted-foreground">
                Intelligent document generation for regulatory submissions
              </p>
            </div>
            
            {view !== 'dashboard' && view !== 'generating' && view !== 'editor' && (
              <Button variant="outline" onClick={() => setView('dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </div>
          
          {isLoadingDocuments && view === 'dashboard' ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <RotateCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading documents...</p>
              </div>
            </div>
          ) : (
            renderView()
          )}
          
          {showExportOptions && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
              <div className="max-w-md w-full">
                <ExportOptions 
                  document={generatedDocument}
                  onExport={(doc, format) => handleExportDocument(doc, format)}
                  onCancel={() => setShowExportOptions(false)}
                />
              </div>
            </div>
          )}
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}