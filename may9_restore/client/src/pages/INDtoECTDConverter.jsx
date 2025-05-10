/**
 * IND to eCTD Converter
 * 
 * This component provides functionality to convert IND application data to eCTD format,
 * allowing users to seamlessly transition from IND preparation to eCTD submission.
 * 
 * It maps IND sections to their corresponding eCTD modules and allows the user to
 * customize the mapping before generating the eCTD structure.
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileCheck, 
  AlertCircle, 
  Loader2,
  Layers,
  Settings,
  FilePlus2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileQuestion,
  Folder
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useNavigate, useParams } from 'wouter';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Import our stability monitoring hooks
import { useNetworkResilience } from '@/hooks/useNetworkResilience';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';

// Mock data for an IND application - in a real app, this would come from an API
const getINDData = (projectId) => {
  return {
    id: 'prj-001',
    name: 'XYZ-123 Initial IND',
    type: 'ind',
    stage: 'preparation',
    progress: 68,
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-04-28T14:30:00Z',
    status: 'in-progress',
    owner: 'John Smith',
    dueDate: '2025-06-15',
    description: 'Initial IND submission for XYZ-123, a novel treatment for rheumatoid arthritis.',
    drugInfo: {
      name: 'XYZ-123',
      indication: 'Rheumatoid Arthritis',
      mechanism: 'JAK1/JAK2 inhibitor',
      formulation: 'Oral tablet, 10mg and 25mg',
      sponsor: 'XYZ Pharmaceuticals, Inc.'
    },
    sections: [
      { 
        id: 'forms',
        name: 'FDA Forms', 
        status: 'completed', 
        progress: 100,
        subsections: [
          { id: 'form-1571', name: 'Form FDA 1571', status: 'completed', progress: 100, documentIds: ['doc-001'] },
          { id: 'form-1572', name: 'Form FDA 1572', status: 'completed', progress: 100, documentIds: ['doc-005'] },
          { id: 'form-3674', name: 'Form FDA 3674', status: 'completed', progress: 100, documentIds: ['doc-006'] }
        ]
      },
      { 
        id: 'cover',
        name: 'Cover Letter and TOC', 
        status: 'completed', 
        progress: 100,
        subsections: [
          { id: 'cover-letter', name: 'Cover Letter', status: 'completed', progress: 100, documentIds: ['doc-002'] },
          { id: 'toc', name: 'Table of Contents', status: 'completed', progress: 100, documentIds: ['doc-007'] }
        ]
      },
      { 
        id: 'cmc',
        name: 'Chemistry, Manufacturing, and Controls', 
        status: 'in-progress', 
        progress: 45,
        subsections: [
          { id: 'cmc-substance', name: 'Drug Substance', status: 'completed', progress: 100, documentIds: ['doc-008'] },
          { id: 'cmc-product', name: 'Drug Product', status: 'in-progress', progress: 75, documentIds: ['doc-009'] },
          { id: 'cmc-manufacturing', name: 'Manufacturing Process', status: 'in-progress', progress: 30, documentIds: ['doc-010'] },
          { id: 'cmc-controls', name: 'Controls and Testing', status: 'not-started', progress: 0, documentIds: [] },
          { id: 'cmc-stability', name: 'Stability Data', status: 'not-started', progress: 0, documentIds: [] }
        ]
      },
      { 
        id: 'nonclinical',
        name: 'Nonclinical Pharmacology/Toxicology', 
        status: 'completed', 
        progress: 100,
        subsections: [
          { id: 'nonc-pharmacology', name: 'Pharmacology', status: 'completed', progress: 100, documentIds: ['doc-011'] },
          { id: 'nonc-pk', name: 'Pharmacokinetics', status: 'completed', progress: 100, documentIds: ['doc-012'] },
          { id: 'nonc-toxicology', name: 'Toxicology', status: 'completed', progress: 100, documentIds: ['doc-003'] }
        ]
      },
      { 
        id: 'clinical',
        name: 'Clinical Protocol', 
        status: 'in-progress', 
        progress: 75,
        subsections: [
          { id: 'protocol-synopsis', name: 'Protocol Synopsis', status: 'completed', progress: 100, documentIds: ['doc-013'] },
          { id: 'protocol-objectives', name: 'Objectives and Endpoints', status: 'completed', progress: 100, documentIds: ['doc-014'] },
          { id: 'protocol-eligibility', name: 'Eligibility Criteria', status: 'completed', progress: 100, documentIds: ['doc-015'] },
          { id: 'protocol-design', name: 'Study Design', status: 'completed', progress: 100, documentIds: ['doc-016'] },
          { id: 'protocol-procedures', name: 'Study Procedures', status: 'in-progress', progress: 80, documentIds: ['doc-017'] },
          { id: 'protocol-safety', name: 'Safety Assessments', status: 'in-progress', progress: 65, documentIds: ['doc-018'] },
          { id: 'protocol-stats', name: 'Statistical Analysis', status: 'not-started', progress: 0, documentIds: [] }
        ]
      },
      { 
        id: 'investigator',
        name: 'Investigator Information', 
        status: 'in-progress', 
        progress: 50,
        subsections: [
          { id: 'inv-cv', name: 'Investigator CVs', status: 'in-progress', progress: 50, documentIds: ['doc-019'] },
          { id: 'inv-facilities', name: 'Facility Information', status: 'in-progress', progress: 50, documentIds: ['doc-020'] }
        ]
      }
    ],
    documents: [
      { id: 'doc-001', name: 'Form FDA 1571.pdf', section: 'forms', sectionId: 'form-1571', uploadedAt: '2025-03-20T09:15:00Z', status: 'final' },
      { id: 'doc-002', name: 'Cover Letter.pdf', section: 'cover', sectionId: 'cover-letter', uploadedAt: '2025-03-21T10:30:00Z', status: 'final' },
      { id: 'doc-003', name: 'XYZ-123 Toxicology Report.pdf', section: 'nonclinical', sectionId: 'nonc-toxicology', uploadedAt: '2025-03-25T14:45:00Z', status: 'final' },
      { id: 'doc-004', name: 'Protocol v0.9.docx', section: 'clinical', sectionId: 'protocol-synopsis', uploadedAt: '2025-04-15T11:20:00Z', status: 'draft' },
      { id: 'doc-005', name: 'Form FDA 1572.pdf', section: 'forms', sectionId: 'form-1572', uploadedAt: '2025-03-20T09:30:00Z', status: 'final' },
      { id: 'doc-006', name: 'Form FDA 3674.pdf', section: 'forms', sectionId: 'form-3674', uploadedAt: '2025-03-20T09:45:00Z', status: 'final' },
      { id: 'doc-007', name: 'Table of Contents.pdf', section: 'cover', sectionId: 'toc', uploadedAt: '2025-03-21T11:00:00Z', status: 'final' },
      { id: 'doc-008', name: 'Drug Substance Report.pdf', section: 'cmc', sectionId: 'cmc-substance', uploadedAt: '2025-03-22T14:30:00Z', status: 'final' },
      { id: 'doc-009', name: 'Drug Product Description.pdf', section: 'cmc', sectionId: 'cmc-product', uploadedAt: '2025-03-22T15:00:00Z', status: 'draft' },
      { id: 'doc-010', name: 'Manufacturing Process.pdf', section: 'cmc', sectionId: 'cmc-manufacturing', uploadedAt: '2025-03-22T15:30:00Z', status: 'draft' },
      { id: 'doc-011', name: 'Pharmacology Study Report.pdf', section: 'nonclinical', sectionId: 'nonc-pharmacology', uploadedAt: '2025-03-25T14:00:00Z', status: 'final' },
      { id: 'doc-012', name: 'PK Study Report.pdf', section: 'nonclinical', sectionId: 'nonc-pk', uploadedAt: '2025-03-25T14:15:00Z', status: 'final' }
    ]
  };
};

// Default eCTD mapping for IND sections
const defaultECTDMapping = {
  'form-1571': { module: 'm1', section: '1.1-forms' },
  'form-1572': { module: 'm1', section: '1.1-forms' },
  'form-3674': { module: 'm1', section: '1.1-forms' },
  'cover-letter': { module: 'm1', section: '1.2-cover' },
  'toc': { module: 'm2', section: '2.1-table-of-contents' },
  'cmc-substance': { module: 'm3', section: '3.2-body-of-data/3.2.s-drug-substance' },
  'cmc-product': { module: 'm3', section: '3.2-body-of-data/3.2.p-drug-product' },
  'cmc-manufacturing': { module: 'm3', section: '3.2-body-of-data/3.2.p-drug-product' },
  'cmc-controls': { module: 'm3', section: '3.2-body-of-data/3.2.p-drug-product' },
  'cmc-stability': { module: 'm3', section: '3.2-body-of-data/3.2.p-drug-product' },
  'nonc-pharmacology': { module: 'm4', section: '4.2-study-reports/4.2.1-pharmacology' },
  'nonc-pk': { module: 'm4', section: '4.2-study-reports/4.2.2-pharmacokinetics' },
  'nonc-toxicology': { module: 'm4', section: '4.2-study-reports/4.2.3-toxicology' },
  'protocol-synopsis': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-objectives': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-eligibility': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-design': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-procedures': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-safety': { module: 'm5', section: '5.3-clinical-study-reports' },
  'protocol-stats': { module: 'm5', section: '5.3-clinical-study-reports' },
  'inv-cv': { module: 'm1', section: '1.3-administrative-information' },
  'inv-facilities': { module: 'm1', section: '1.3-administrative-information' }
};

// eCTD module descriptions
const ectdModuleInfo = {
  'm1': {
    name: 'Module 1 - Administrative Information',
    description: 'Regional administrative information such as forms, prescribing information, and labels',
    sections: [
      { id: '1.1-forms', name: '1.1 Forms' },
      { id: '1.2-cover', name: '1.2 Cover Letter' },
      { id: '1.3-administrative-information', name: '1.3 Administrative Information' }
    ]
  },
  'm2': {
    name: 'Module 2 - CTD Summaries',
    description: 'Overview and summaries of Modules 3, 4, and 5',
    sections: [
      { id: '2.1-table-of-contents', name: '2.1 Table of Contents' },
      { id: '2.2-introduction', name: '2.2 Introduction' },
      { id: '2.3-quality-overall-summary', name: '2.3 Quality Overall Summary' },
      { id: '2.4-nonclinical-overview', name: '2.4 Nonclinical Overview' },
      { id: '2.5-clinical-overview', name: '2.5 Clinical Overview' },
      { id: '2.6-nonclinical-written-and-tabulated-summaries', name: '2.6 Nonclinical Written and Tabulated Summaries' },
      { id: '2.7-clinical-summary', name: '2.7 Clinical Summary' }
    ]
  },
  'm3': {
    name: 'Module 3 - Quality',
    description: 'Chemical, pharmaceutical and biological information for both drug substance and drug product',
    sections: [
      { id: '3.1-table-of-contents', name: '3.1 Table of Contents' },
      { id: '3.2-body-of-data/3.2.s-drug-substance', name: '3.2.S Drug Substance' },
      { id: '3.2-body-of-data/3.2.p-drug-product', name: '3.2.P Drug Product' },
      { id: '3.2-body-of-data/3.2.a-appendices', name: '3.2.A Appendices' },
      { id: '3.2-body-of-data/3.2.r-regional-information', name: '3.2.R Regional Information' },
      { id: '3.3-literature-references', name: '3.3 Literature References' }
    ]
  },
  'm4': {
    name: 'Module 4 - Nonclinical Reports',
    description: 'Nonclinical study reports (pharmacology, pharmacokinetics, toxicology)',
    sections: [
      { id: '4.1-table-of-contents', name: '4.1 Table of Contents' },
      { id: '4.2-study-reports/4.2.1-pharmacology', name: '4.2.1 Pharmacology' },
      { id: '4.2-study-reports/4.2.2-pharmacokinetics', name: '4.2.2 Pharmacokinetics' },
      { id: '4.2-study-reports/4.2.3-toxicology', name: '4.2.3 Toxicology' },
      { id: '4.3-literature-references', name: '4.3 Literature References' }
    ]
  },
  'm5': {
    name: 'Module 5 - Clinical Reports',
    description: 'Clinical study reports and related information',
    sections: [
      { id: '5.1-table-of-contents', name: '5.1 Table of Contents' },
      { id: '5.2-tabular-listing-of-all-clinical-studies', name: '5.2 Tabular Listing of All Clinical Studies' },
      { id: '5.3-clinical-study-reports', name: '5.3 Clinical Study Reports' },
      { id: '5.4-literature-references', name: '5.4 Literature References' }
    ]
  }
};

const INDtoECTDConverter = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [indProject, setIndProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [mapping, setMapping] = useState({});
  const [includedDocs, setIncludedDocs] = useState({});
  const [conversionStatus, setConversionStatus] = useState('pending');
  const [newProjectId, setNewProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Use network resilience and health monitor hooks
  const { isOnline } = useNetworkResilience();
  const healthMonitor = useHealthMonitor();
  
  useEffect(() => {
    // In a real application, this would be an API call
    const loadProject = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        const data = getINDData(projectId);
        
        if (data) {
          setIndProject(data);
          setNewProjectName(`${data.name} - eCTD Submission`);
          
          // Initialize document inclusion state
          const initialIncludedDocs = {};
          data.documents.forEach(doc => {
            initialIncludedDocs[doc.id] = true;
          });
          setIncludedDocs(initialIncludedDocs);
          
          // Initialize mapping with defaults
          const initialMapping = {};
          data.sections.forEach(section => {
            if (section.subsections) {
              section.subsections.forEach(subsection => {
                initialMapping[subsection.id] = defaultECTDMapping[subsection.id] || { module: null, section: null };
              });
            }
          });
          setMapping(initialMapping);
        } else {
          console.error('Project not found:', projectId);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        
        // Report error to health monitor
        if (healthMonitor.isConnected) {
          healthMonitor.reportError({
            message: `Failed to load project ${projectId}`,
            stack: error.stack,
            severity: 'medium'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, healthMonitor]);
  
  // Report status to health monitor
  useEffect(() => {
    if (healthMonitor.isConnected) {
      healthMonitor.sendHeartbeat({
        page: 'ind-to-ectd-converter',
        projectId,
        status: 'active'
      });
    }
  }, [healthMonitor, projectId]);
  
  const handleMappingChange = (sectionId, moduleId, sectionPath) => {
    setMapping(prev => ({
      ...prev,
      [sectionId]: { module: moduleId, section: sectionPath }
    }));
  };
  
  const handleDocumentInclusionChange = (docId, included) => {
    setIncludedDocs(prev => ({
      ...prev,
      [docId]: included
    }));
  };
  
  const handleConvert = async () => {
    // In a real application, this would make an API call to start the conversion
    setConversionStatus('processing');
    
    // Simulate API call
    setTimeout(() => {
      setConversionStatus('complete');
      setNewProjectId('prj-ectd-001');
    }, 3000);
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Step {activeStep} of 3
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2 px-1">
          <div className={activeStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Setup
          </div>
          <div className={activeStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Map Content
          </div>
          <div className={activeStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Conversion
          </div>
        </div>
      </div>
    );
  };
  
  const renderStep1 = () => {
    if (!indProject) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Setup eCTD Conversion</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Source IND Project</CardTitle>
            <CardDescription>
              Review the IND project that will be converted to eCTD format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{indProject.name}</h3>
                  <p className="text-gray-500">{indProject.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={indProject.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                >
                  {indProject.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{indProject.progress}%</span>
                </div>
                <Progress value={indProject.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Drug Information</h4>
                  <ul className="text-sm space-y-1">
                    <li><span className="font-medium">Name:</span> {indProject.drugInfo.name}</li>
                    <li><span className="font-medium">Indication:</span> {indProject.drugInfo.indication}</li>
                    <li><span className="font-medium">Mechanism:</span> {indProject.drugInfo.mechanism}</li>
                    <li><span className="font-medium">Formulation:</span> {indProject.drugInfo.formulation}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Documents</h4>
                  <div className="text-sm">
                    <p><span className="font-medium">Total Documents:</span> {indProject.documents.length}</p>
                    <p><span className="font-medium">Ready for Conversion:</span> {indProject.documents.filter(d => d.status === 'final').length}</p>
                    <p><span className="font-medium">Draft Documents:</span> {indProject.documents.filter(d => d.status === 'draft').length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>eCTD Project Settings</CardTitle>
            <CardDescription>
              Configure the new eCTD project that will be created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ectdProjectName" className="text-sm font-medium">
                  eCTD Project Name
                </label>
                <Input 
                  id="ectdProjectName" 
                  placeholder="Enter project name" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="ectdSequence" className="text-sm font-medium">
                  Sequence Number
                </label>
                <Input 
                  id="ectdSequence" 
                  placeholder="0000" 
                  defaultValue="0000"
                />
                <p className="text-xs text-gray-500">
                  For initial submissions, this is typically "0000"
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="ectdRegion" className="text-sm font-medium">
                  Regulatory Region
                </label>
                <Select defaultValue="us">
                  <SelectTrigger id="ectdRegion">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States (FDA)</SelectItem>
                    <SelectItem value="eu">Europe (EMA)</SelectItem>
                    <SelectItem value="jp">Japan (PMDA)</SelectItem>
                    <SelectItem value="ca">Canada (Health Canada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="includeXml" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="includeXml"
                    className="text-sm font-medium leading-none"
                  >
                    Generate eCTD XML backbone
                  </label>
                  <p className="text-sm text-gray-500">
                    Create XML files required for eCTD submission structure
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderStep2 = () => {
    if (!indProject) return null;
    
    // Prepare document data by section
    const documentsBySection = {};
    indProject.sections.forEach(section => {
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          documentsBySection[subsection.id] = indProject.documents.filter(
            doc => doc.sectionId === subsection.id
          );
        });
      }
    });
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Map IND Content to eCTD Structure</h2>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <AlertTitle>How to Map Content</AlertTitle>
          <AlertDescription>
            For each IND section, select the appropriate eCTD module and section where the content should be placed.
            You can also choose which documents to include in the conversion.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Section Mapping</CardTitle>
            <CardDescription>
              Map IND sections to eCTD modules and sections
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">IND Section</TableHead>
                  <TableHead className="w-[200px]">eCTD Module</TableHead>
                  <TableHead>eCTD Section</TableHead>
                  <TableHead className="w-[100px]">Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indProject.sections.map(section => (
                  section.subsections.map(subsection => (
                    <TableRow key={subsection.id}>
                      <TableCell>
                        <div className="font-medium">{subsection.name}</div>
                        <div className="text-xs text-gray-500">
                          {section.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={mapping[subsection.id]?.module || ''}
                          onValueChange={(value) => handleMappingChange(
                            subsection.id, 
                            value, 
                            mapping[subsection.id]?.section || ''
                          )}
                        >
                          <SelectTrigger id={`module-${subsection.id}`}>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not Mapped</SelectItem>
                            <SelectItem value="m1">Module 1</SelectItem>
                            <SelectItem value="m2">Module 2</SelectItem>
                            <SelectItem value="m3">Module 3</SelectItem>
                            <SelectItem value="m4">Module 4</SelectItem>
                            <SelectItem value="m5">Module 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={mapping[subsection.id]?.section || ''}
                          onValueChange={(value) => handleMappingChange(
                            subsection.id, 
                            mapping[subsection.id]?.module || '', 
                            value
                          )}
                          disabled={!mapping[subsection.id]?.module}
                        >
                          <SelectTrigger id={`section-${subsection.id}`}>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not Mapped</SelectItem>
                            {mapping[subsection.id]?.module && ectdModuleInfo[mapping[subsection.id].module]?.sections.map(section => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {documentsBySection[subsection.id]?.length || 0}
                      </TableCell>
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Select which documents to include in the conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Include</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead className="w-[200px]">Section</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Target Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indProject.documents.map(doc => {
                  // Find section info
                  const sectionInfo = indProject.sections
                    .flatMap(s => s.subsections)
                    .find(s => s.id === doc.sectionId);
                  
                  // Find eCTD mapping
                  const ectdMap = mapping[doc.sectionId];
                  let targetLocation = 'Not mapped';
                  
                  if (ectdMap?.module && ectdMap?.section) {
                    const moduleInfo = ectdModuleInfo[ectdMap.module];
                    const sectionInfo = moduleInfo?.sections.find(s => s.id === ectdMap.section);
                    if (moduleInfo && sectionInfo) {
                      targetLocation = `${ectdMap.module.toUpperCase()}/${ectdMap.section}`;
                    }
                  }
                  
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Checkbox 
                          checked={includedDocs[doc.id] || false}
                          onCheckedChange={(checked) => handleDocumentInclusionChange(doc.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sectionInfo?.name || doc.sectionId}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={doc.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {targetLocation}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderStep3 = () => {
    if (!indProject) return null;
    
    // Calculate stats
    const totalDocuments = indProject.documents.length;
    const includedDocuments = Object.values(includedDocs).filter(Boolean).length;
    const mappedSections = Object.values(mapping).filter(m => m.module && m.section).length;
    const totalSections = indProject.sections.reduce((acc, section) => acc + section.subsections.length, 0);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Convert to eCTD Structure</h2>
        </div>
        
        {conversionStatus === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion Summary</CardTitle>
              <CardDescription>
                Review the details before starting the conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Source IND Project</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {indProject.name}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {indProject.status.replace('-', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span> {indProject.progress}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Target eCTD Project</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {newProjectName}
                    </div>
                    <div>
                      <span className="font-medium">Sequence:</span> 0000
                    </div>
                    <div>
                      <span className="font-medium">Region:</span> United States (FDA)
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Mapping Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Sections Mapped</span>
                        <span className="text-sm font-medium">{mappedSections} / {totalSections}</span>
                      </div>
                      <Progress value={(mappedSections / totalSections) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Documents Included</span>
                        <span className="text-sm font-medium">{includedDocuments} / {totalDocuments}</span>
                      </div>
                      <Progress value={(includedDocuments / totalDocuments) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <Alert 
                  className={
                    mappedSections === totalSections && includedDocuments === totalDocuments
                      ? "bg-green-50 border-green-200"
                      : (mappedSections < totalSections / 2 || includedDocuments < totalDocuments / 2)
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                  }
                >
                  {mappedSections === totalSections && includedDocuments === totalDocuments ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <AlertTitle>
                    {mappedSections === totalSections && includedDocuments === totalDocuments
                      ? "Ready for Conversion"
                      : (mappedSections < totalSections / 2 || includedDocuments < totalDocuments / 2)
                        ? "Warning: Incomplete Mapping"
                        : "Warning: Some Items Not Mapped"
                    }
                  </AlertTitle>
                  <AlertDescription>
                    {mappedSections === totalSections && includedDocuments === totalDocuments
                      ? "All sections and documents have been properly mapped. Ready to proceed with conversion."
                      : mappedSections < totalSections
                        ? `${totalSections - mappedSections} section(s) are not mapped to eCTD structure. `
                        : ""
                    }
                    {includedDocuments < totalDocuments
                      ? `${totalDocuments - includedDocuments} document(s) are not included in the conversion.`
                      : ""
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveStep(2)}
              >
                Go Back to Mapping
              </Button>
              <Button
                onClick={handleConvert}
                disabled={mappedSections === 0 || includedDocuments === 0}
              >
                Start Conversion
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {conversionStatus === 'processing' && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion in Progress</CardTitle>
              <CardDescription>
                Converting IND to eCTD structure...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-6" />
              <h3 className="text-lg font-medium mb-2">Processing Conversion</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Please wait while we create the eCTD structure and copy the documents.
                This may take a few minutes.
              </p>
              <Progress value={65} className="h-2 w-80 mb-2" />
              <p className="text-sm text-gray-500">Step 2 of 3: Copying documents...</p>
            </CardContent>
          </Card>
        )}
        
        {conversionStatus === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle>Conversion Complete</CardTitle>
              <CardDescription>
                The IND project has been successfully converted to eCTD format
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-6" />
              <h3 className="text-lg font-medium mb-2">eCTD Project Created</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                Your eCTD project "{newProjectName}" has been created successfully.
                You can now continue working on it in the eCTD Editor.
              </p>
              <Alert className="bg-blue-50 border-blue-200 mb-6">
                <FileCheck className="h-5 w-5 text-blue-600" />
                <AlertTitle>Conversion Summary</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>{includedDocuments} documents copied to eCTD structure</li>
                    <li>{mappedSections} IND sections mapped to eCTD modules</li>
                    <li>eCTD XML backbone generated</li>
                    <li>All validation checks passed</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/regulatory-submissions')}
              >
                Return to Hub
              </Button>
              <Button
                onClick={() => navigate(`/ectd-editor/${newProjectId}`)}
              >
                Open in eCTD Editor
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!indProject) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/regulatory-submissions')}>
              Back to Submissions
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate('/regulatory-submissions')}>
            Regulatory Submissions
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate(`/regulatory-submissions/dashboard/${projectId}`)}>
            {indProject.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>
            Convert to eCTD
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Convert IND to eCTD</h1>
        <p className="text-gray-500">
          Convert your IND application to eCTD format for regulatory submission
        </p>
      </div>
      
      {renderStepIndicator()}
      
      {activeStep === 1 && renderStep1()}
      {activeStep === 2 && renderStep2()}
      {activeStep === 3 && renderStep3()}
      
      {/* Navigation buttons */}
      {conversionStatus === 'pending' && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/regulatory-submissions/dashboard/${projectId}`)}
            disabled={activeStep === 3 && conversionStatus !== 'pending'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <div className="space-x-2">
            {activeStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={conversionStatus !== 'pending'}
              >
                Previous
              </Button>
            )}
            
            {activeStep < 3 && (
              <Button
                onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                disabled={activeStep === 1 && !newProjectName}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="mr-3 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">You're currently offline</h3>
              <p className="text-sm">Please reconnect to continue with the conversion</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default INDtoECTDConverter;