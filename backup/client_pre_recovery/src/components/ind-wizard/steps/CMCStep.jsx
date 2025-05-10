/**
 * CMC (Chemistry, Manufacturing, and Controls) Step Component
 * 
 * This component provides a comprehensive CMC builder interface that guides users
 * through creating the Chemistry, Manufacturing, and Controls section of an IND submission,
 * which is a critical component required by FDA.
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  CircleCheck,
  CircleDashed,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Fingerprint,
  FlaskConical,
  Gauge,
  HardHat,
  Info,
  Layers,
  ListFilter,
  Loader2,
  MessageSquare,
  Microscope,
  PackageOpen,
  Plus,
  PlusCircle,
  Save,
  SearchCode,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Vial,
  Warehouse
} from 'lucide-react';

// CMC Section Types with metadata
const CMC_SECTIONS = [
  {
    id: 'drug-substance',
    title: 'Drug Substance',
    description: 'Information about the active pharmaceutical ingredient',
    icon: Vial,
    subsections: [
      { 
        id: 'general-information',
        title: 'General Information',
        fields: [
          { id: 'nomenclature', label: 'Nomenclature', type: 'text', required: true },
          { id: 'structure', label: 'Structure', type: 'textarea', required: true },
          { id: 'physicochemical-properties', label: 'Physicochemical Properties', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'manufacturer',
        title: 'Manufacturer',
        fields: [
          { id: 'manufacturer-name', label: 'Manufacturer Name', type: 'text', required: true },
          { id: 'manufacturer-address', label: 'Manufacturer Address', type: 'textarea', required: true },
          { id: 'manufacturing-responsibility', label: 'Manufacturing Responsibility', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'manufacturing-process',
        title: 'Manufacturing Process',
        fields: [
          { id: 'manufacturing-flowchart', label: 'Manufacturing Flowchart', type: 'file', required: false },
          { id: 'synthetic-route', label: 'Synthetic Route', type: 'textarea', required: true },
          { id: 'process-controls', label: 'Process Controls', type: 'textarea', required: true },
          { id: 'reagents-solvents', label: 'Reagents and Solvents', type: 'textarea', required: true },
          { id: 'critical-steps', label: 'Critical Steps', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'impurities',
        title: 'Impurities',
        fields: [
          { id: 'organic-impurities', label: 'Organic Impurities', type: 'textarea', required: true },
          { id: 'inorganic-impurities', label: 'Inorganic Impurities', type: 'textarea', required: true },
          { id: 'residual-solvents', label: 'Residual Solvents', type: 'textarea', required: true },
          { id: 'impurity-qualification', label: 'Impurity Qualification', type: 'textarea', required: false }
        ]
      },
      { 
        id: 'control-of-drug-substance',
        title: 'Control of Drug Substance',
        fields: [
          { id: 'specifications', label: 'Specifications', type: 'textarea', required: true },
          { id: 'analytical-procedures', label: 'Analytical Procedures', type: 'textarea', required: true },
          { id: 'validation-procedures', label: 'Validation of Analytical Procedures', type: 'textarea', required: true },
          { id: 'batch-analyses', label: 'Batch Analyses', type: 'textarea', required: true },
          { id: 'justification-specifications', label: 'Justification of Specifications', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'reference-standards',
        title: 'Reference Standards',
        fields: [
          { id: 'primary-reference', label: 'Primary Reference Standard', type: 'textarea', required: true },
          { id: 'working-reference', label: 'Working Reference Standard', type: 'textarea', required: false },
          { id: 'characterization', label: 'Characterization', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'container-closure',
        title: 'Container Closure System',
        fields: [
          { id: 'container-description', label: 'Container Description', type: 'textarea', required: true },
          { id: 'compatibility', label: 'Compatibility', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'substance-stability',
        title: 'Stability',
        fields: [
          { id: 'stability-summary', label: 'Stability Summary and Conclusions', type: 'textarea', required: true },
          { id: 'stability-protocol', label: 'Post-approval Stability Protocol', type: 'textarea', required: true },
          { id: 'stability-commitment', label: 'Stability Commitment', type: 'textarea', required: true },
          { id: 'storage-conditions', label: 'Storage Conditions', type: 'textarea', required: true },
          { id: 'retest-period', label: 'Retest Period', type: 'text', required: true }
        ]
      }
    ]
  },
  {
    id: 'drug-product',
    title: 'Drug Product',
    description: 'Information about the final formulated product',
    icon: PackageOpen,
    subsections: [
      { 
        id: 'product-description',
        title: 'Description and Composition',
        fields: [
          { id: 'product-description', label: 'Product Description', type: 'textarea', required: true },
          { id: 'composition', label: 'Composition', type: 'textarea', required: true },
          { id: 'overage', label: 'Overage', type: 'textarea', required: false },
          { id: 'formulation-development', label: 'Formulation Development', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'pharmaceutical-development',
        title: 'Pharmaceutical Development',
        fields: [
          { id: 'components-compatibility', label: 'Components Compatibility', type: 'textarea', required: true },
          { id: 'formulation-optimization', label: 'Formulation Optimization', type: 'textarea', required: true },
          { id: 'excipients-properties', label: 'Excipients Properties', type: 'textarea', required: true },
          { id: 'manufacturing-process-development', label: 'Manufacturing Process Development', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'product-manufacturer',
        title: 'Manufacturer',
        fields: [
          { id: 'product-manufacturer-name', label: 'Manufacturer Name', type: 'text', required: true },
          { id: 'product-manufacturer-address', label: 'Manufacturer Address', type: 'textarea', required: true },
          { id: 'product-manufacturing-responsibility', label: 'Manufacturing Responsibility', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'product-manufacturing-process',
        title: 'Manufacturing Process',
        fields: [
          { id: 'product-manufacturing-flowchart', label: 'Manufacturing Flowchart', type: 'file', required: false },
          { id: 'process-description', label: 'Process Description', type: 'textarea', required: true },
          { id: 'in-process-controls', label: 'In-Process Controls', type: 'textarea', required: true },
          { id: 'critical-process-parameters', label: 'Critical Process Parameters', type: 'textarea', required: true },
          { id: 'process-validation', label: 'Process Validation', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'excipient-control',
        title: 'Control of Excipients',
        fields: [
          { id: 'excipient-specifications', label: 'Specifications', type: 'textarea', required: true },
          { id: 'excipient-test-methods', label: 'Test Methods', type: 'textarea', required: true },
          { id: 'excipient-justification', label: 'Justification of Specifications', type: 'textarea', required: true },
          { id: 'novel-excipients', label: 'Novel Excipients', type: 'textarea', required: false },
        ]
      },
      { 
        id: 'product-control',
        title: 'Control of Drug Product',
        fields: [
          { id: 'product-specifications', label: 'Specifications', type: 'textarea', required: true },
          { id: 'product-analytical-procedures', label: 'Analytical Procedures', type: 'textarea', required: true },
          { id: 'product-validation-procedures', label: 'Validation of Analytical Procedures', type: 'textarea', required: true },
          { id: 'product-batch-analyses', label: 'Batch Analyses', type: 'textarea', required: true },
          { id: 'product-impurities', label: 'Characterization of Impurities', type: 'textarea', required: true },
          { id: 'product-justification-specifications', label: 'Justification of Specifications', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'product-reference-standards',
        title: 'Reference Standards',
        fields: [
          { id: 'product-reference-standard', label: 'Reference Standard', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'product-container-closure',
        title: 'Container Closure System',
        fields: [
          { id: 'container-components', label: 'Container Components', type: 'textarea', required: true },
          { id: 'suitability', label: 'Suitability', type: 'textarea', required: true },
          { id: 'compatibility-assessment', label: 'Compatibility Assessment', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'product-stability',
        title: 'Stability',
        fields: [
          { id: 'product-stability-summary', label: 'Stability Summary and Conclusions', type: 'textarea', required: true },
          { id: 'product-stability-protocol', label: 'Post-approval Stability Protocol', type: 'textarea', required: true },
          { id: 'product-stability-commitment', label: 'Stability Commitment', type: 'textarea', required: true },
          { id: 'product-storage-conditions', label: 'Storage Conditions', type: 'textarea', required: true },
          { id: 'shelf-life', label: 'Shelf Life', type: 'text', required: true }
        ]
      }
    ]
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    description: 'Facilities, equipment, and manufacturing processes',
    icon: Warehouse,
    subsections: [
      { 
        id: 'manufacturers',
        title: 'Manufacturers',
        fields: [
          { id: 'manufacturing-sites', label: 'Manufacturing Sites', type: 'textarea', required: true },
          { id: 'quality-agreements', label: 'Quality Agreements', type: 'textarea', required: true },
          { id: 'manufacturing-responsibilities', label: 'Manufacturing Responsibilities', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'batch-formula',
        title: 'Batch Formula',
        fields: [
          { id: 'master-batch-record', label: 'Master Batch Record', type: 'file', required: false },
          { id: 'batch-size', label: 'Batch Size', type: 'text', required: true },
          { id: 'batch-formula-details', label: 'Batch Formula Details', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'facilities-equipment',
        title: 'Facilities and Equipment',
        fields: [
          { id: 'facilities-description', label: 'Facilities Description', type: 'textarea', required: true },
          { id: 'equipment-list', label: 'Equipment List', type: 'textarea', required: true },
          { id: 'cleaning-procedures', label: 'Cleaning Procedures', type: 'textarea', required: true },
          { id: 'environmental-controls', label: 'Environmental Controls', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'process-validation',
        title: 'Process Validation',
        fields: [
          { id: 'validation-approach', label: 'Validation Approach', type: 'textarea', required: true },
          { id: 'validation-parameters', label: 'Validation Parameters', type: 'textarea', required: true },
          { id: 'validation-acceptance-criteria', label: 'Validation Acceptance Criteria', type: 'textarea', required: true },
          { id: 'validation-timeline', label: 'Validation Timeline', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'reprocessing',
        title: 'Reprocessing',
        fields: [
          { id: 'reprocessing-procedures', label: 'Reprocessing Procedures', type: 'textarea', required: false },
          { id: 'reprocessing-justification', label: 'Reprocessing Justification', type: 'textarea', required: false }
        ]
      }
    ]
  },
  {
    id: 'controls',
    title: 'Controls',
    description: 'Quality control, testing, and release procedures',
    icon: ShieldCheck,
    subsections: [
      { 
        id: 'acceptance-criteria',
        title: 'Acceptance Criteria',
        fields: [
          { id: 'release-specifications', label: 'Release Specifications', type: 'textarea', required: true },
          { id: 'justification-of-limits', label: 'Justification of Limits', type: 'textarea', required: true },
          { id: 'test-methods-summary', label: 'Test Methods Summary', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'analytical-methods',
        title: 'Analytical Methods',
        fields: [
          { id: 'analytical-method-descriptions', label: 'Analytical Method Descriptions', type: 'textarea', required: true },
          { id: 'method-validation', label: 'Method Validation', type: 'textarea', required: true },
          { id: 'method-transfer', label: 'Method Transfer', type: 'textarea', required: false }
        ]
      },
      { 
        id: 'reference-standards-materials',
        title: 'Reference Standards and Materials',
        fields: [
          { id: 'primary-standards', label: 'Primary Standards', type: 'textarea', required: true },
          { id: 'working-standards', label: 'Working Standards', type: 'textarea', required: true },
          { id: 'reference-material-qualification', label: 'Reference Material Qualification', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'container-closure-system-controls',
        title: 'Container Closure System Controls',
        fields: [
          { id: 'container-specifications', label: 'Container Specifications', type: 'textarea', required: true },
          { id: 'closure-specifications', label: 'Closure Specifications', type: 'textarea', required: true },
          { id: 'functional-tests', label: 'Functional Tests', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'microbiological-attributes',
        title: 'Microbiological Attributes',
        fields: [
          { id: 'bioburden-testing', label: 'Bioburden Testing', type: 'textarea', required: false },
          { id: 'sterility-testing', label: 'Sterility Testing', type: 'textarea', required: false },
          { id: 'endotoxin-testing', label: 'Endotoxin Testing', type: 'textarea', required: false },
          { id: 'antimicrobial-effectiveness', label: 'Antimicrobial Effectiveness', type: 'textarea', required: false }
        ]
      }
    ]
  },
  {
    id: 'stability',
    title: 'Stability',
    description: 'Stability data, testing, and shelf-life determination',
    icon: Clock,
    subsections: [
      { 
        id: 'stability-protocol',
        title: 'Stability Protocol',
        fields: [
          { id: 'stability-protocol-summary', label: 'Stability Protocol Summary', type: 'textarea', required: true },
          { id: 'storage-conditions-protocols', label: 'Storage Conditions in Protocols', type: 'textarea', required: true },
          { id: 'testing-frequency', label: 'Testing Frequency', type: 'textarea', required: true },
          { id: 'stability-indicating-methods', label: 'Stability Indicating Methods', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'stability-data',
        title: 'Stability Data',
        fields: [
          { id: 'long-term-data', label: 'Long-term Data', type: 'textarea', required: true },
          { id: 'accelerated-data', label: 'Accelerated Data', type: 'textarea', required: true },
          { id: 'stress-studies', label: 'Stress Studies', type: 'textarea', required: true },
          { id: 'photostability-studies', label: 'Photostability Studies', type: 'textarea', required: false },
          { id: 'in-use-stability', label: 'In-Use Stability', type: 'textarea', required: false }
        ]
      },
      { 
        id: 'stability-conclusions',
        title: 'Stability Conclusions',
        fields: [
          { id: 'proposed-shelf-life', label: 'Proposed Shelf-Life', type: 'text', required: true },
          { id: 'storage-statement', label: 'Storage Statement', type: 'textarea', required: true },
          { id: 'stability-trends', label: 'Stability Trends', type: 'textarea', required: true },
          { id: 'post-approval-commitments', label: 'Post-Approval Commitments', type: 'textarea', required: true }
        ]
      },
      { 
        id: 'ongoing-stability',
        title: 'Ongoing Stability',
        fields: [
          { id: 'annual-batch-commitment', label: 'Annual Batch Commitment', type: 'textarea', required: true },
          { id: 'stability-program-summary', label: 'Stability Program Summary', type: 'textarea', required: true }
        ]
      }
    ]
  }
];

/**
 * Field Input Component
 * Renders the appropriate input component based on field type
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
          rows={4}
        />
      );
      
    case 'file':
      return (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor={field.id}>
            {value ? 'Replace file' : 'Upload file'}
          </Label>
          <Input
            id={field.id}
            type="file"
            disabled={disabled}
            onChange={(e) => {
              // In a real implementation, you would handle file uploads
              // Here we just store the file name for demo purposes
              if (e.target.files && e.target.files[0]) {
                handleChange(e.target.files[0].name);
              }
            }}
          />
          {value && (
            <p className="text-xs text-muted-foreground">
              Current file: {value}
            </p>
          )}
        </div>
      );
      
    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={handleChange}
          disabled={disabled}
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
 * Section Card Component
 * Display an individual CMC section or subsection
 */
function SectionCard({ section, isSubsection = false, onSelect, completionStatus }) {
  // Calculate completion status for this section
  const status = completionStatus?.[section.id] || { 
    completedRequired: 0, 
    totalRequired: 0, 
    completedTotal: 0, 
    totalFields: 0,
    isComplete: false,
    percentage: 0
  };
  
  return (
    <Card 
      className={cn(
        "transition-all hover:border-primary/50 cursor-pointer",
        status.isComplete && "border-green-200"
      )}
      onClick={() => onSelect(section.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {!isSubsection && <section.icon className="mr-3 h-5 w-5 text-primary" />}
            <CardTitle className={cn(
              "flex items-center",
              isSubsection ? "text-base" : "text-lg"
            )}>
              {section.title}
              {status.isComplete && (
                <CircleCheck className="ml-2 h-4 w-4 text-green-600" />
              )}
            </CardTitle>
          </div>
          
          <Badge variant={status.isComplete ? "outline" : "secondary"} className={status.isComplete ? "bg-green-50 text-green-700 border-green-200" : ""}>
            {status.percentage}%
          </Badge>
        </div>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full",
              status.isComplete ? "bg-green-500" : "bg-primary"
            )}
            style={{ width: `${status.percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <div>{status.completedRequired}/{status.totalRequired} required fields</div>
          <div>{status.completedTotal}/{status.totalFields} total fields</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Subsection Editor Component
 * Displays and allows editing of all fields in a subsection
 */
function SubsectionEditor({ 
  mainSectionId, 
  subsection, 
  data, 
  onChange,
  isEditing = true,
  onBack
}) {
  // Find the parent section to get the icon
  const parentSection = CMC_SECTIONS.find(section => section.id === mainSectionId);
  const SectionIcon = parentSection?.icon || FileText;
  
  // Calculate completion status
  const requiredFields = subsection.fields.filter(f => f.required).length;
  const completedRequired = subsection.fields
    .filter(f => f.required)
    .reduce((count, field) => {
      return (data?.[field.id] && data[field.id].trim() !== '') ? count + 1 : count;
    }, 0);
  
  const isComplete = requiredFields > 0 && completedRequired === requiredFields;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
          Back
        </Button>
        
        <div className="flex items-center">
          <SectionIcon className="h-5 w-5 mr-2 text-primary" />
          <h3 className="font-semibold">{parentSection?.title} / {subsection.title}</h3>
        </div>
        
        <div className="ml-auto flex items-center">
          <Badge variant={isComplete ? "outline" : "secondary"} className={isComplete ? "bg-green-50 text-green-700 border-green-200" : ""}>
            {isComplete ? 'Complete' : `${completedRequired}/${requiredFields} required`}
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{subsection.title}</CardTitle>
          <CardDescription>
            Complete all required fields in this section
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {subsection.fields.map((field) => (
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
      </Card>
    </div>
  );
}

/**
 * CMC Preview Component 
 * Shows a preview of all CMC data in a document-like format
 */
function CMCPreview({ cmcData }) {
  if (!cmcData) return null;
  
  return (
    <div className="prose max-w-none">
      <h1>Chemistry, Manufacturing, and Controls</h1>
      
      {CMC_SECTIONS.map((section) => (
        <div key={section.id} className="mb-8">
          <h2>{section.title}</h2>
          {section.subsections.map((subsection) => (
            <div key={subsection.id} className="mb-6">
              <h3>{subsection.title}</h3>
              {subsection.fields.map((field) => (
                <div key={field.id} className="mb-4">
                  <h4>{field.label}</h4>
                  {cmcData[field.id] ? (
                    <p>{cmcData[field.id]}</p>
                  ) : (
                    <p className="text-muted-foreground italic">[Not provided]</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * CMC Status Component
 * Shows an overview of completion status for the CMC section
 */
function CMCStatus({ completionStatus }) {
  const sectionOrder = ['drug-substance', 'drug-product', 'manufacturing', 'controls', 'stability'];
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-4 border">
        <div className="flex justify-between mb-2">
          <h3 className="font-medium">Overall CMC Completion</h3>
          <span className="text-sm font-medium">
            {completionStatus.overall.percentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${completionStatus.overall.percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {completionStatus.overall.completedRequired} of {completionStatus.overall.totalRequired} required fields completed
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Section Completion</h3>
        
        {sectionOrder.map((sectionId) => {
          const section = CMC_SECTIONS.find(s => s.id === sectionId);
          const status = completionStatus[sectionId] || {
            percentage: 0,
            isComplete: false,
            completedRequired: 0,
            totalRequired: 0
          };
          
          return (
            <div key={sectionId} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                status.isComplete ? "bg-green-100" : "bg-muted"
              )}>
                {status.isComplete ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-xs font-medium">{status.percentage}%</span>
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {status.completedRequired}/{status.totalRequired} required
                  </span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      status.isComplete ? "bg-green-500" : "bg-primary"
                    )}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main CMC Step Component
 */
function CMCStep({ projectId, onComplete, onPrevious }) {
  const { toast } = useToast();
  const { isConnected } = useDatabaseStatus();
  const [cmcData, setCmcData] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [activeSubsection, setActiveSubsection] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [isEditing, setIsEditing] = useState(true);
  
  // Load CMC data
  const {
    data: cmcResponseData,
    isLoading: isLoadingCmc,
    refetch: refetchCmc
  } = useQuery({
    queryKey: ['cmc', projectId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ind/${projectId}/cmc`);
        
        if (!response.ok) throw new Error('Failed to fetch CMC data');
        
        return response.json();
      } catch (error) {
        console.error('Error fetching CMC data:', error);
        return {};
      }
    },
    enabled: !!projectId && isConnected
  });
  
  // Set CMC data when loaded
  useEffect(() => {
    if (cmcResponseData) {
      setCmcData(cmcResponseData);
    }
  }, [cmcResponseData]);
  
  // Save CMC data mutation
  const saveCmcMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('PUT', `/api/ind/${projectId}/cmc`, cmcData);
        
        if (!response.ok) throw new Error('Failed to save CMC data');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'CMC Data Saved',
        description: 'Your CMC data has been saved successfully.',
        variant: 'default',
      });
      refetchCmc();
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Unable to save CMC data. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle field change
  const handleFieldChange = (fieldId, value) => {
    setCmcData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Calculate completion status for all sections and subsections
  const calculateCompletionStatus = () => {
    // Initialize overall counters
    let totalRequiredFields = 0;
    let totalCompletedRequired = 0;
    let totalFields = 0;
    let totalCompleted = 0;
    
    // Process each section
    const status = CMC_SECTIONS.reduce((acc, section) => {
      // Initialize section counters
      let sectionRequiredFields = 0;
      let sectionCompletedRequired = 0;
      let sectionTotalFields = 0;
      let sectionTotalCompleted = 0;
      
      // Process each subsection in this section
      const subsectionStatus = section.subsections.reduce((subAcc, subsection) => {
        // Count required and total fields
        const requiredFields = subsection.fields.filter(f => f.required).length;
        const totalSubFields = subsection.fields.length;
        
        // Count completed fields
        const completedRequired = subsection.fields
          .filter(f => f.required)
          .reduce((count, field) => {
            return (cmcData?.[field.id] && cmcData[field.id].trim() !== '') ? count + 1 : count;
          }, 0);
          
        const completedTotal = subsection.fields
          .reduce((count, field) => {
            return (cmcData?.[field.id] && cmcData[field.id].trim() !== '') ? count + 1 : count;
          }, 0);
        
        // Update section totals
        sectionRequiredFields += requiredFields;
        sectionCompletedRequired += completedRequired;
        sectionTotalFields += totalSubFields;
        sectionTotalCompleted += completedTotal;
        
        // Calculate completion percentage
        const percentage = requiredFields > 0 
          ? Math.round((completedRequired / requiredFields) * 100) 
          : 0;
          
        // Is this subsection complete?
        const isComplete = requiredFields > 0 && completedRequired === requiredFields;
        
        // Save subsection status
        subAcc[subsection.id] = {
          completedRequired,
          totalRequired: requiredFields,
          completedTotal,
          totalFields: totalSubFields,
          percentage,
          isComplete
        };
        
        return subAcc;
      }, {});
      
      // Update overall totals
      totalRequiredFields += sectionRequiredFields;
      totalCompletedRequired += sectionCompletedRequired;
      totalFields += sectionTotalFields;
      totalCompleted += sectionTotalCompleted;
      
      // Calculate section completion percentage
      const percentage = sectionRequiredFields > 0 
        ? Math.round((sectionCompletedRequired / sectionRequiredFields) * 100)
        : 0;
        
      // Is this section complete?
      const isComplete = sectionRequiredFields > 0 && sectionCompletedRequired === sectionRequiredFields;
      
      // Save section status
      acc[section.id] = {
        completedRequired: sectionCompletedRequired,
        totalRequired: sectionRequiredFields,
        completedTotal: sectionTotalCompleted,
        totalFields: sectionTotalFields,
        percentage,
        isComplete,
        subsections: subsectionStatus
      };
      
      return acc;
    }, {});
    
    // Calculate overall completion percentage
    const overallPercentage = totalRequiredFields > 0
      ? Math.round((totalCompletedRequired / totalRequiredFields) * 100)
      : 0;
      
    // Is everything complete?
    const isComplete = totalRequiredFields > 0 && totalCompletedRequired === totalRequiredFields;
    
    // Add overall status
    status.overall = {
      completedRequired: totalCompletedRequired,
      totalRequired: totalRequiredFields,
      completedTotal: totalCompleted,
      totalFields,
      percentage: overallPercentage,
      isComplete
    };
    
    return status;
  };
  
  const completionStatus = calculateCompletionStatus();
  
  // Handle section selection
  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId);
    setActiveSubsection(null);
  };
  
  // Handle subsection selection
  const handleSubsectionSelect = (subsectionId) => {
    setActiveSubsection(subsectionId);
  };
  
  // Handle back button in subsection view
  const handleSubsectionBack = () => {
    setActiveSubsection(null);
  };
  
  // Handle back button in section view
  const handleSectionBack = () => {
    setActiveSection(null);
  };
  
  // Handle save button
  const handleSave = () => {
    saveCmcMutation.mutate();
  };
  
  // Generate document mutation
  const generateDocumentMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/cmc/generate`);
        
        if (!response.ok) throw new Error('Failed to generate CMC document');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'CMC Document Generated',
        description: 'Your CMC document has been generated successfully.',
        variant: 'default',
      });
      
      // Download document
      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `CMC_${projectId}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Unable to generate CMC document. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // AI-assisted content generation mutation
  const generateContentMutation = useMutation({
    mutationFn: async (fieldId) => {
      try {
        const response = await apiRequest('POST', `/api/ind/${projectId}/cmc/generate-content`, {
          fieldId,
          currentData: cmcData
        });
        
        if (!response.ok) throw new Error('Failed to generate content');
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.content && data.fieldId) {
        setCmcData(prev => ({
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
  
  // Handle generate document
  const handleGenerateDocument = () => {
    generateDocumentMutation.mutate();
  };
  
  if (isLoadingCmc) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading CMC data...</p>
        </div>
      </div>
    );
  }
  
  // If we're viewing a specific subsection
  if (activeSection && activeSubsection) {
    const section = CMC_SECTIONS.find(s => s.id === activeSection);
    const subsection = section?.subsections.find(sub => sub.id === activeSubsection);
    
    if (!subsection) return null;
    
    return (
      <SubsectionEditor
        mainSectionId={activeSection}
        subsection={subsection}
        data={cmcData}
        onChange={handleFieldChange}
        isEditing={isEditing}
        onBack={handleSubsectionBack}
      />
    );
  }
  
  // If we're viewing a specific section
  if (activeSection) {
    const section = CMC_SECTIONS.find(s => s.id === activeSection);
    
    if (!section) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSectionBack}>
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Back
          </Button>
          
          <div className="flex items-center">
            <section.icon className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-semibold">{section.title}</h3>
          </div>
          
          <div className="ml-auto">
            <Badge variant="outline">
              {completionStatus[section.id]?.percentage || 0}% Complete
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.subsections.map((subsection) => {
            // Get completion status for this subsection
            const subStatus = completionStatus[section.id]?.subsections?.[subsection.id] || {
              completedRequired: 0,
              totalRequired: 0,
              completedTotal: 0,
              totalFields: 0,
              percentage: 0,
              isComplete: false
            };
            
            return (
              <Card 
                key={subsection.id} 
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  subStatus.isComplete && "border-green-200"
                )}
                onClick={() => handleSubsectionSelect(subsection.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {subsection.title}
                      {subStatus.isComplete && (
                        <CircleCheck className="ml-2 h-4 w-4 text-green-600 inline" />
                      )}
                    </CardTitle>
                    
                    <Badge variant="outline" className={subStatus.isComplete ? "bg-green-50 text-green-700 border-green-200" : ""}>
                      {subStatus.percentage}%
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        subStatus.isComplete ? "bg-green-500" : "bg-primary"
                      )}
                      style={{ width: `${subStatus.percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <div>{subStatus.completedRequired}/{subStatus.totalRequired} required</div>
                    <div>{subStatus.completedTotal}/{subStatus.totalFields} total</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Main view - showing all sections
  return (
    <ErrorBoundary title="CMC Step Error" description="An error occurred while loading the CMC Step.">
      <DatabaseAware
        title="CMC Step Unavailable"
        description="The CMC Step requires a database connection which is currently unavailable."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Chemistry, Manufacturing, and Controls</h2>
              <p className="text-muted-foreground">
                Create a comprehensive CMC section for your IND application
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
                disabled={saveCmcMutation.isPending || !isEditing}
              >
                {saveCmcMutation.isPending ? (
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
                disabled={generateDocumentMutation.isPending || completionStatus.overall.percentage < 50}
              >
                {generateDocumentMutation.isPending ? (
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
                        CMC Sections
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="review">
                        <Check className="h-4 w-4 mr-2" />
                        Review Status
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                
                <CardContent>
                  <TabsContent value="sections" className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CMC_SECTIONS.map((section) => (
                        <SectionCard
                          key={section.id}
                          section={section}
                          onSelect={handleSectionSelect}
                          completionStatus={completionStatus}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="m-0">
                    <CMCPreview cmcData={cmcData} />
                  </TabsContent>
                  
                  <TabsContent value="review" className="m-0">
                    <CMCStatus completionStatus={completionStatus} />
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CMC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Completion</span>
                        <span className="text-sm">{completionStatus.overall.percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${completionStatus.overall.percentage || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {completionStatus.overall.completedRequired} of {completionStatus.overall.totalRequired} required fields
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Section Status</h4>
                      
                      {CMC_SECTIONS.map((section) => {
                        const status = completionStatus[section.id] || { percentage: 0, isComplete: false };
                        return (
                          <div key={section.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              {status.isComplete ? (
                                <CircleCheck className="h-4 w-4 mr-2 text-green-600" />
                              ) : (
                                <CircleDashed className="h-4 w-4 mr-2 text-muted-foreground" />
                              )}
                              {section.title}
                            </div>
                            <Badge variant="outline">{status.percentage}%</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI CMC Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Let our AI assistant help you complete your CMC section with
                      scientifically accurate and compliant content.
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ai-field">Generate content for field:</Label>
                      <Select
                        id="ai-field"
                        disabled={generateContentMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CMC_SECTIONS.flatMap(section => 
                            section.subsections.flatMap(subsection =>
                              subsection.fields.map(field => (
                                <SelectItem key={field.id} value={field.id}>
                                  {section.title} / {subsection.title} / {field.label}
                                </SelectItem>
                              ))
                            )
                          )}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        className="w-full mt-2"
                        disabled={generateContentMutation.isPending}
                        onClick={() => {
                          const fieldId = document.getElementById('ai-field').value;
                          if (fieldId) {
                            generateContentMutation.mutate(fieldId);
                          } else {
                            toast({
                              title: 'Selection Required',
                              description: 'Please select a field first.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        {generateContentMutation.isPending ? (
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
                      Chat with CMC Assistant
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>FDA Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-primary mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium">Chemistry, Manufacturing, and Controls Information</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sufficient information must be provided to demonstrate that the manufacturer can produce a consistent product
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-primary mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium">Required CMC Elements</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drug substance information, drug product components, manufacturing procedures, and stability data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <SearchCode className="h-5 w-5 text-primary mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium">Applicable Regulations</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          21 CFR 312.23(a)(7) - Chemistry, manufacturing, and control information
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      View FDA Guidance
                    </Button>
                  </div>
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
              disabled={completionStatus.overall.percentage < 30 && isConnected}
            >
              Next Step
            </Button>
          </div>
        </div>
      </DatabaseAware>
    </ErrorBoundary>
  );
}

export default CMCStep;