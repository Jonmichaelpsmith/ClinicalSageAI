/**
 * Protocol Builder Step
 * 
 * This component provides a comprehensive protocol builder interface for creating
 * clinical trial protocols compliant with FDA and ICH E6(R3) requirements.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ui/error-boundary';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useDatabaseStatus } from '@/components/providers/database-status-provider';
import { DatabaseAware } from '@/components/ui/database-aware';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  ListFilter,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Trash2,
  Users,
  Beaker,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  Mail,
  Microscope,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal
} from 'lucide-react';

// Protocol sections based on ICH E6(R3) guidelines
const PROTOCOL_SECTIONS = [
  {
    id: 'general-information',
    title: 'General Information',
    description: 'Basic protocol information and administrative details',
    icon: FileText,
    fields: [
      { id: 'protocol-title', label: 'Protocol Title', type: 'text', required: true },
      { id: 'protocol-id', label: 'Protocol ID', type: 'text', required: true },
      { id: 'protocol-version', label: 'Version', type: 'text', required: true },
      { id: 'protocol-date', label: 'Protocol Date', type: 'date', required: true },
      { id: 'sponsor-name', label: 'Sponsor Name', type: 'text', required: true },
      { id: 'sponsor-address', label: 'Sponsor Address', type: 'textarea', required: true },
      { id: 'medical-monitor', label: 'Medical Monitor', type: 'text', required: true },
      { id: 'emergency-contact', label: 'Emergency Contact Information', type: 'textarea', required: true }
    ]
  },
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Study background, rationale, and risk/benefit assessment',
    icon: BookOpen,
    fields: [
      { id: 'background', label: 'Background', type: 'markdown', required: true },
      { id: 'rationale', label: 'Study Rationale', type: 'markdown', required: true },
      { id: 'benefit-risk', label: 'Benefit-Risk Assessment', type: 'markdown', required: true }
    ]
  },
  {
    id: 'objectives',
    title: 'Objectives & Endpoints',
    description: 'Primary, secondary, and exploratory objectives and endpoints',
    icon: Check,
    fields: [
      { id: 'primary-objective', label: 'Primary Objective', type: 'textarea', required: true },
      { id: 'primary-endpoint', label: 'Primary Endpoint', type: 'textarea', required: true },
      { id: 'secondary-objectives', label: 'Secondary Objectives', type: 'textarea', required: false },
      { id: 'secondary-endpoints', label: 'Secondary Endpoints', type: 'textarea', required: false },
      { id: 'exploratory-objectives', label: 'Exploratory Objectives', type: 'textarea', required: false },
      { id: 'exploratory-endpoints', label: 'Exploratory Endpoints', type: 'textarea', required: false }
    ]
  },
  {
    id: 'study-design',
    title: 'Study Design',
    description: 'Overall design, randomization, blinding, and controls',
    icon: SlidersHorizontal,
    fields: [
      { id: 'overall-design', label: 'Overall Design', type: 'textarea', required: true },
      { id: 'study-type', label: 'Study Type', type: 'select', 
        options: ['Interventional', 'Observational', 'Expanded Access'], required: true },
      { id: 'phase', label: 'Phase', type: 'select', 
        options: ['Phase 1', 'Phase 1/2', 'Phase 2', 'Phase 2/3', 'Phase 3', 'Phase 4'], required: true },
      { id: 'randomization', label: 'Randomization', type: 'textarea', required: false },
      { id: 'blinding', label: 'Blinding', type: 'textarea', required: false },
      { id: 'controls', label: 'Controls', type: 'textarea', required: false },
      { id: 'study-duration', label: 'Study Duration', type: 'text', required: true },
      { id: 'study-schema', label: 'Study Schema', type: 'upload', required: false }
    ]
  },
  {
    id: 'population',
    title: 'Study Population',
    description: 'Inclusion and exclusion criteria, recruitment, and withdrawal',
    icon: Users,
    fields: [
      { id: 'inclusion-criteria', label: 'Inclusion Criteria', type: 'list', required: true },
      { id: 'exclusion-criteria', label: 'Exclusion Criteria', type: 'list', required: true },
      { id: 'recruitment', label: 'Recruitment Strategy', type: 'textarea', required: false },
      { id: 'withdrawal-criteria', label: 'Withdrawal Criteria', type: 'textarea', required: true },
      { id: 'replacement-strategy', label: 'Replacement Strategy', type: 'textarea', required: false },
      { id: 'screen-failures', label: 'Screen Failures', type: 'textarea', required: false }
    ]
  },
  {
    id: 'treatment',
    title: 'Study Treatment',
    description: 'Investigational product, dosing, preparation, and accountability',
    icon: Beaker,
    fields: [
      { id: 'study-treatment', label: 'Study Treatment', type: 'textarea', required: true },
      { id: 'dosage-form', label: 'Dosage Form', type: 'text', required: true },
      { id: 'route-of-administration', label: 'Route of Administration', type: 'select',
        options: ['Oral', 'Intravenous', 'Subcutaneous', 'Intramuscular', 'Topical', 'Other'], required: true },
      { id: 'packaging-labeling', label: 'Packaging and Labeling', type: 'textarea', required: true },
      { id: 'storage-conditions', label: 'Storage Conditions', type: 'textarea', required: true },
      { id: 'preparation-administration', label: 'Preparation and Administration', type: 'textarea', required: true },
      { id: 'accountability', label: 'Drug Accountability', type: 'textarea', required: true },
      { id: 'concomitant-therapy', label: 'Concomitant Therapy', type: 'textarea', required: true },
      { id: 'prohibited-medications', label: 'Prohibited Medications', type: 'textarea', required: true }
    ]
  },
  {
    id: 'procedures',
    title: 'Study Procedures',
    description: 'Assessments, visits, and evaluations',
    icon: ClipboardList,
    fields: [
      { id: 'screening', label: 'Screening Procedures', type: 'textarea', required: true },
      { id: 'schedule-of-assessments', label: 'Schedule of Assessments', type: 'textarea', required: true },
      { id: 'efficacy-assessments', label: 'Efficacy Assessments', type: 'textarea', required: true },
      { id: 'safety-assessments', label: 'Safety Assessments', type: 'textarea', required: true },
      { id: 'pharmacokinetics', label: 'Pharmacokinetic Assessments', type: 'textarea', required: false },
      { id: 'biomarkers', label: 'Biomarker Assessments', type: 'textarea', required: false },
      { id: 'long-term-followup', label: 'Long-term Follow-up', type: 'textarea', required: false }
    ]
  },
  {
    id: 'safety',
    title: 'Safety Monitoring',
    description: 'Adverse event reporting, monitoring, and risk management',
    icon: HeartPulse,
    fields: [
      { id: 'adverse-events', label: 'Adverse Event Definitions', type: 'textarea', required: true },
      { id: 'serious-adverse-events', label: 'Serious Adverse Event Reporting', type: 'textarea', required: true },
      { id: 'safety-monitoring-plan', label: 'Safety Monitoring Plan', type: 'textarea', required: true },
      { id: 'dose-modification', label: 'Dose Modification Guidelines', type: 'textarea', required: true },
      { id: 'safety-oversight', label: 'Safety Oversight Structure', type: 'textarea', required: true },
      { id: 'early-termination', label: 'Early Termination Criteria', type: 'textarea', required: true }
    ]
  },
  {
    id: 'statistics',
    title: 'Statistical Analysis',
    description: 'Analysis populations, methods, and sample size justification',
    icon: SlidersHorizontal,
    fields: [
      { id: 'statistical-hypothesis', label: 'Statistical Hypothesis', type: 'textarea', required: true },
      { id: 'sample-size', label: 'Sample Size Justification', type: 'textarea', required: true },
      { id: 'analysis-populations', label: 'Analysis Populations', type: 'textarea', required: true },
      { id: 'primary-analysis', label: 'Primary Analysis', type: 'textarea', required: true },
      { id: 'secondary-analysis', label: 'Secondary Analyses', type: 'textarea', required: false },
      { id: 'interim-analysis', label: 'Interim Analyses', type: 'textarea', required: false },
      { id: 'missing-data', label: 'Handling of Missing Data', type: 'textarea', required: true }
    ]
  },
  {
    id: 'ethics',
    title: 'Ethics',
    description: 'Ethical considerations, regulatory compliance, and informed consent',
    icon: FileText,
    fields: [
      { id: 'ethics-review', label: 'Ethics Committee Review', type: 'textarea', required: true },
      { id: 'regulatory-compliance', label: 'Regulatory Compliance', type: 'textarea', required: true },
      { id: 'informed-consent', label: 'Informed Consent Process', type: 'textarea', required: true },
      { id: 'participant-confidentiality', label: 'Participant Confidentiality', type: 'textarea', required: true },
      { id: 'protocol-amendments', label: 'Protocol Amendments', type: 'textarea', required: true },
      { id: 'protocol-deviations', label: 'Protocol Deviations', type: 'textarea', required: true }
    ]
  },
  {
    id: 'data-management',
    title: 'Data Management',
    description: 'Data collection, quality assurance, and source records',
    icon: FileText,
    fields: [
      { id: 'data-collection', label: 'Data Collection Methods', type: 'textarea', required: true },
      { id: 'data-handling', label: 'Data Handling and Record Keeping', type: 'textarea', required: true },
      { id: 'quality-assurance', label: 'Quality Assurance', type: 'textarea', required: true },
      { id: 'monitoring', label: 'Study Monitoring', type: 'textarea', required: true },
      { id: 'data-protection', label: 'Data Protection', type: 'textarea', required: true }
    ]
  },
  {
    id: 'publication',
    title: 'Publication Policy',
    description: 'Publication strategy and authorship guidelines',
    icon: FileText,
    fields: [
      { id: 'publication-strategy', label: 'Publication Strategy', type: 'textarea', required: true },
      { id: 'authorship-guidelines', label: 'Authorship Guidelines', type: 'textarea', required: true },
      { id: 'data-sharing', label: 'Data Sharing Plan', type: 'textarea', required: false }
    ]
  },
  {
    id: 'references',
    title: 'References',
    description: 'Citations and references used in the protocol',
    icon: FileText,
    fields: [
      { id: 'references', label: 'References', type: 'references', required: true }
    ]
  },
  {
    id: 'appendices',
    title: 'Appendices',
    description: 'Additional supporting information and documents',
    icon: FileText,
    fields: [
      { id: 'appendices', label: 'Appendices', type: 'upload-multiple', required: false }
    ]
  }
];

/**
 * Field Input Component
 * Renders the appropriate input field based on type
 */
function FieldInput({ field, value, onChange, disabled = false }) {
  const handleChange = (newValue) => {
    onChange(field.id, newValue);
  };
  
  switch (field.type) {
    case 'text':
      return (
        <Input
          id={field.id}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={field.required}
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          id={field.id}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          rows={5}
        />
      );
      
    case 'date':
      return (
        <Input
          id={field.id}
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={field.required}
        />
      );
      
    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={handleChange}
          disabled={disabled}
          required={field.required}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'list':
      const items = value ? (Array.isArray(value) ? value : value.split('\n')) : [''];
      
      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  handleChange(newItems.filter(Boolean).join('\n'));
                }}
                disabled={disabled}
                placeholder={`${index + 1}. ${field.label} item`}
              />
              
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    handleChange(newItems.filter(Boolean).join('\n'));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                const newItems = [...items, ''];
                handleChange(newItems.filter(Boolean).join('\n'));
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      );
      
    case 'markdown':
      // Simplified markdown editor for now
      return (
        <Textarea
          id={field.id}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={field.required}
          rows={10}
          placeholder="Enter markdown content..."
        />
      );
      
    default:
      return (
        <Input
          id={field.id}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          required={field.required}
        />
      );
  }
}

/**
 * Protocol Section Component
 * Renders an individual protocol section
 */
function ProtocolSection({ section, data, onChange, isEditing }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const completedFields = section.fields.reduce((acc, field) => {
    if (data?.[field.id] && data[field.id].trim() !== '') {
      return acc + 1;
    }
    return acc;
  }, 0);
  
  const requiredFields = section.fields.filter(f => f.required).length;
  const requiredCompleted = section.fields
    .filter(f => f.required)
    .reduce((acc, field) => {
      if (data?.[field.id] && data[field.id].trim() !== '') {
        return acc + 1;
      }
      return acc;
    }, 0);
  
  const isComplete = requiredCompleted === requiredFields;
  
  return (
    <Card className={cn(
      "mb-4 transition-all duration-200",
      isComplete && "border-green-200"
    )}>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <section.icon className="h-5 w-5 mr-3 text-primary" />
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">
              {completedFields}/{section.fields.length} fields {isComplete && '(complete)'}
            </div>
            
            <Badge variant={isComplete ? "success" : requiredCompleted > 0 ? "outline" : "secondary"}>
              {isComplete ? (
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </div>
              ) : (
                `${requiredCompleted}/${requiredFields} required`
              )}
            </Badge>
            
            <ChevronRight className={`h-5 w-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.id} className="font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {data?.[field.id] ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  ) : field.required ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Optional
                    </Badge>
                  )}
                </div>
                
                <FieldInput
                  field={field}
                  value={data?.[field.id] || ''}
                  onChange={onChange}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Protocol Builder Step Component
 */
function ProtocolBuilderStep({ projectId, onComplete, onPrevious }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [protocolData, setProtocolData] = useState({});
  const [isEditing, setIsEditing] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');
  
  // Get protocol data for this project
  const {
    data: protocolResponseData,
    isLoading: isLoadingProtocol,
    refetch: refetchProtocol
  } = useQuery({
    queryKey: ['protocol', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/protocol`);
        
        if (!response.ok) throw new Error('Failed to fetch protocol data');
        
        return response.json();
      } catch (error) {
        console.error('Error fetching protocol data:', error);
        return null;
      }
    },
    enabled: !!projectId && isConnected
  });
  
  // Set protocol data when loaded
  useEffect(() => {
    if (protocolResponseData) {
      setProtocolData(protocolResponseData);
    }
  }, [protocolResponseData]);
  
  // Save protocol mutation
  const saveProtocolMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('PUT', `/api/ind/${projectId}/protocol`, protocolData);
        
        if (!response.ok) throw new Error('Failed to save protocol data');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Protocol Saved',
        description: 'Your protocol has been saved successfully.',
        variant: 'default',
      });
      refetchProtocol();
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save protocol. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle field changes
  const handleFieldChange = (fieldId, value) => {
    setProtocolData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Check completion status
  const getCompletionStatus = () => {
    const totalRequiredFields = PROTOCOL_SECTIONS.reduce((acc, section) => {
      return acc + section.fields.filter(f => f.required).length;
    }, 0);
    
    const completedRequiredFields = PROTOCOL_SECTIONS.reduce((acc, section) => {
      return acc + section.fields
        .filter(f => f.required)
        .reduce((fieldAcc, field) => {
          if (protocolData?.[field.id] && protocolData[field.id].trim() !== '') {
            return fieldAcc + 1;
          }
          return fieldAcc;
        }, 0);
    }, 0);
    
    return {
      requiredCompleted: completedRequiredFields,
      totalRequired: totalRequiredFields,
      percentComplete: Math.round((completedRequiredFields / totalRequiredFields) * 100)
    };
  };
  
  const completionStatus = getCompletionStatus();
  
  // Generate protocol document
  const generateProtocolMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/protocol/generate`);
        
        if (!response.ok) throw new Error('Failed to generate protocol document');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Protocol Generated',
        description: 'Your protocol document has been generated successfully.',
        variant: 'default',
      });
      
      // Download protocol document
      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `Protocol_${projectId}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Unable to generate protocol document. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle save
  const handleSave = () => {
    saveProtocolMutation.mutate();
  };
  
  // Handle generate document
  const handleGenerateDocument = () => {
    generateProtocolMutation.mutate();
  };
  
  // AI-assisted content generation for a field
  const generateFieldContentMutation = useMutation({
    mutationFn: async (fieldId) => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/protocol/generate-content`, {
          fieldId,
          currentProtocolData: protocolData
        });
        
        if (!response.ok) throw new Error('Failed to generate content');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.content && data.fieldId) {
        setProtocolData(prev => ({
          ...prev,
          [data.fieldId]: data.content
        }));
        
        toast({
          title: 'Content Generated',
          description: 'AI-generated content has been added to the field.',
          variant: 'default',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Unable to generate content. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  if (isLoadingProtocol) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading protocol data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary title="Protocol Builder Error" description="An error occurred while loading the Protocol Builder.">
      <DatabaseAware
        title="Protocol Builder Unavailable"
        description="The Protocol Builder requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Protocol Builder</h2>
              <p className="text-muted-foreground">
                Create a comprehensive clinical trial protocol compliant with ICH E6(R3) guidelines
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    View Mode
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Mode
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveProtocolMutation.isPending || !isEditing}
              >
                {saveProtocolMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleGenerateDocument}
                disabled={generateProtocolMutation.isPending || completionStatus.percentComplete < 50}
              >
                {generateProtocolMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Document
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="sections">
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Protocol Sections
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="review">
                        <Check className="h-4 w-4 mr-2" />
                        Review
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="sections" className="m-0">
                    <div className="space-y-4">
                      {PROTOCOL_SECTIONS.map((section) => (
                        <ProtocolSection
                          key={section.id}
                          section={section}
                          data={protocolData}
                          onChange={handleFieldChange}
                          isEditing={isEditing}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="m-0">
                    <div className="prose max-w-none">
                      <h1>{protocolData['protocol-title'] || 'Protocol Title'}</h1>
                      <p>
                        <strong>Protocol ID:</strong> {protocolData['protocol-id'] || 'TBD'}<br />
                        <strong>Version:</strong> {protocolData['protocol-version'] || '1.0'}<br />
                        <strong>Date:</strong> {protocolData['protocol-date'] || new Date().toISOString().split('T')[0]}<br />
                      </p>
                      
                      <h2>Sponsor Information</h2>
                      <p>
                        <strong>Sponsor:</strong> {protocolData['sponsor-name'] || 'Sponsor Name'}<br />
                        <strong>Address:</strong> {protocolData['sponsor-address'] || 'Sponsor Address'}<br />
                      </p>
                      
                      {PROTOCOL_SECTIONS.slice(1).map((section) => (
                        <div key={section.id}>
                          <h2>{section.title}</h2>
                          {section.fields.map((field) => (
                            <div key={field.id} className="mb-4">
                              <h3>{field.label}</h3>
                              {protocolData[field.id] ? (
                                field.type === 'list' ? (
                                  <ul>
                                    {protocolData[field.id].split('\n').map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>{protocolData[field.id]}</p>
                                )
                              ) : (
                                <p className="text-muted-foreground italic">[Not completed]</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="review" className="m-0">
                    <div className="space-y-6">
                      <div className="bg-muted/30 rounded-md p-4 border">
                        <h3 className="font-medium mb-2">Protocol Completion Status</h3>
                        <div className="flex items-center mb-2">
                          <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${completionStatus.percentComplete}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {completionStatus.percentComplete}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {completionStatus.requiredCompleted} of {completionStatus.totalRequired} required fields completed
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Section Completion</h3>
                        <div className="space-y-1">
                          {PROTOCOL_SECTIONS.map((section) => {
                            const totalFields = section.fields.length;
                            const requiredFields = section.fields.filter(f => f.required).length;
                            
                            const completedFields = section.fields.reduce((acc, field) => {
                              if (protocolData?.[field.id] && protocolData[field.id].trim() !== '') {
                                return acc + 1;
                              }
                              return acc;
                            }, 0);
                            
                            const completedRequired = section.fields
                              .filter(f => f.required)
                              .reduce((acc, field) => {
                                if (protocolData?.[field.id] && protocolData[field.id].trim() !== '') {
                                  return acc + 1;
                                }
                                return acc;
                              }, 0);
                            
                            const isComplete = completedRequired === requiredFields;
                            const percentComplete = Math.round((completedFields / totalFields) * 100);
                            
                            return (
                              <div key={section.id} className="flex items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-primary/10">
                                  {isComplete ? (
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                  ) : (
                                    <span className="text-xs font-medium">{completedRequired}/{requiredFields}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{section.title}</span>
                                    <span className="text-xs text-muted-foreground">{percentComplete}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                    <div
                                      className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                                      style={{ width: `${percentComplete}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">Validation Results</h3>
                        
                        {completionStatus.requiredCompleted < completionStatus.totalRequired ? (
                          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium">Missing Required Information</h4>
                                <p className="text-sm mt-1">
                                  There are {completionStatus.totalRequired - completionStatus.requiredCompleted} required fields 
                                  that need to be completed before generating the final protocol document.
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-50 p-4 rounded-md border border-green-200">
                            <div className="flex items-start">
                              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium">Protocol Complete</h4>
                                <p className="text-sm mt-1">
                                  All required fields have been completed. Your protocol is ready for 
                                  document generation and review.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Protocol Title</Label>
                      <p className="font-medium truncate">
                        {protocolData['protocol-title'] || 'Not specified'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Protocol ID</Label>
                        <p className="font-medium truncate">
                          {protocolData['protocol-id'] || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Version</Label>
                        <p className="font-medium truncate">
                          {protocolData['protocol-version'] || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Phase</Label>
                        <p className="font-medium truncate">
                          {protocolData['phase'] || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <p className="font-medium truncate">
                          {protocolData['protocol-date'] || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI Protocol Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Let our AI assistant help you complete your protocol with
                      scientifically accurate and compliant content.
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ai-field">Generate content for field:</Label>
                      <Select
                        id="ai-field"
                        disabled={generateFieldContentMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PROTOCOL_SECTIONS.flatMap(section => 
                            section.fields.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        className="w-full mt-2"
                        disabled={generateFieldContentMutation.isPending}
                        onClick={() => {
                          const fieldId = document.getElementById('ai-field').value;
                          if (fieldId) {
                            generateFieldContentMutation.mutate(fieldId);
                          } else {
                            toast({
                              title: 'Selection Required',
                              description: 'Please select a field first.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        {generateFieldContentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat with Protocol Assistant
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>FDA & ICH Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">ICH E6(R3) Compliant</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          This protocol template follows ICH E6(R3) Good Clinical Practice guidelines
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">FDA Requirements</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Meets FDA requirements for protocols supporting IND applications
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Automatic Version Control</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Changes are tracked with full version history
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Regulatory Guidance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
            >
              Previous Step
            </Button>
            
            <Button
              onClick={onComplete}
              disabled={completionStatus.percentComplete < 50 && isConnected}
            >
              Next Step
            </Button>
          </div>
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}

export default ProtocolBuilderStep;