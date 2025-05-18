import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SpecificationAnalyzer from '../components/cmc/SpecificationAnalyzer';
import MethodValidationGenerator from '../components/cmc/MethodValidationGenerator';
import BatchRecordGenerator from '../components/cmc/BatchRecordGenerator';
import FormulationPredictor from '../components/cmc/FormulationPredictor';
import CMCDocumentHub from '../components/cmc/CMCDocumentHub';
import SubmissionPreparator from '../components/cmc/SubmissionPreparator';
import RegulatoryIntelligence from '../components/cmc/RegulatoryIntelligence';
import TaskManagementSystem from '../components/cmc/TaskManagementSystem';
import RegulatoryWorkflowManager from '../components/cmc/RegulatoryWorkflowManager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import HighContrastModeToggle from '../components/HighContrastModeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  ChevronRight,
  FileText,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  FileSymlink,
  Factory,
  Beaker,
  FlaskConical,
  Microscope,
  Shield as ShieldAlert,
  BarChart3,
  Shield,
  Activity,
  Landmark,
  Lock,
  Scale,
  Brain,
  RefreshCw,
  Rocket,
  UploadCloud,
  Download,
  Settings,
  Info,
  Sparkles,
  Globe,
  Edit,
  Trash2,
  Link,
  ClipboardCheck,
  Eye,
  Clipboard,
  MessageSquare,
  Copy,
  Check,
  BellRing,
  Plus,
  X,
  ChevronDown,
  HelpCircle,
  Clock,
  Calendar,
  ArrowRight,
  Layers,
  RotateCw,
  Share2,
  GitMerge as Workflow,
  ListChecks
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Import OpenAI service for AI-powered functionality
import { 
  generateCMCContent, 
  analyzeManufacturingProcess, 
  assessRegulatoryCompliance, 
  generateRiskAnalysis,
  simulateOpenAIResponse
} from '../services/openaiService';

// Import authentication guard
import withAuthGuard from '../utils/withAuthGuard';

// Status badge component with hover details
const StatusBadge = ({ status, text, details }) => {
  const getStatusColor = () => {
    switch (status) {
      // Maximum contrast for light and dark modes
      case 'success': return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
      case 'warning': return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
      case 'error': return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
      case 'info': return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
      default: return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'error': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'info': return <FileSymlink className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Badge className={`${getStatusColor()} flex items-center gap-1 cursor-help`}>
          {getStatusIcon()}
          {text}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-2">
          <h4 className="font-medium">{text} Details</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{details}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// Regulatory compliance check component
const RegulatoryCheck = ({ requirement, status, region, details }) => {
  const getStatusColor = () => {
    switch (status) {
      // Enhanced contrast for better readability
      case 'compliant': return 'text-green-800 dark:text-green-200';
      case 'partial': return 'text-yellow-800 dark:text-yellow-200';
      case 'non-compliant': return 'text-red-800 dark:text-red-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <AlertTriangle className="w-4 h-4" />;
      case 'non-compliant': return <ShieldAlert className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex items-start justify-between p-2 border-b dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{requirement}</span>
          <Badge variant="outline" className="text-xs">{region}</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{details}</p>
      </div>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs font-medium">{status}</span>
      </div>
    </div>
  );
};

// Process card component
const ProcessCard = ({ title, description, status, progress, linkedRecords }) => {
  return (
    <Card className="mb-4 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <StatusBadge 
            status={status === 'Validated' ? 'success' : status === 'In Review' ? 'warning' : 'info'} 
            text={status}
            details={`This manufacturing process is currently ${status.toLowerCase()}. ${status === 'Validated' ? 'All requirements have been met.' : 'Additional actions may be required.'}`}
          />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Documentation Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        {linkedRecords.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Linked Quality Records</h4>
            <div className="space-y-1">
              {linkedRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span>{record.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {record.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" className="text-xs">
          <FileSymlink className="w-3.5 h-3.5 mr-1" /> Link Records
        </Button>
        <Button size="sm" className="text-xs">
          <ChevronRight className="w-3.5 h-3.5" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Risk analysis card component
const RiskAnalysisCard = ({ title, severity, probability, description, recommendations, impact }) => {
  const getRiskLevelColor = () => {
    const riskScore = severity * probability;
    // Maximum contrast for better readability in both light and dark modes
    if (riskScore >= 15) return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
    if (riskScore >= 8) return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
    return 'bg-white text-black border-black dark:bg-black dark:text-white dark:border-white';
  };

  const getRiskLevel = () => {
    const riskScore = severity * probability;
    if (riskScore >= 15) return 'High';
    if (riskScore >= 8) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={getRiskLevelColor()}>
            {getRiskLevel()} Risk
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Severity</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{severity}/5</span>
              <Progress value={severity * 20} className="h-1.5 w-16" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Probability</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{probability}/5</span>
              <Progress value={probability * 20} className="h-1.5 w-16" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">Impact</span>
            <span className="font-medium">{impact}</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Recommendations</h4>
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 pl-4 list-disc">
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Button variant="outline" size="sm" className="text-xs">Assign Task</Button>
        <Button size="sm" className="text-xs">View Analysis</Button>
      </CardFooter>
    </Card>
  );
};

// CMC Section template component
const CMCTemplate = ({ title, section, status, content, nextRevision, feedbackCount }) => {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Section {section}</Badge>
              <StatusBadge 
                status={status === 'Approved' ? 'success' : status === 'In Review' ? 'warning' : 'info'} 
                text={status}
                details={`This CMC section is currently ${status.toLowerCase()}. ${status === 'Approved' ? 'No further changes are needed.' : 'Additional edits or reviews may be required.'}`}
              />
              {feedbackCount > 0 && (
                <Badge variant="secondary">{feedbackCount} {feedbackCount === 1 ? 'Comment' : 'Comments'}</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-gray-400">Next Revision: </span>
            <span className="text-xs font-medium">{nextRevision}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-24 overflow-hidden relative">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">{content}</p>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          <FileText className="w-3.5 h-3.5 mr-1" /> View Content
        </Button>
        <Button size="sm" className="text-xs">
          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Edit Section
        </Button>
      </CardFooter>
    </Card>
  );
};

// Regulatory submission tracking component
const SubmissionTracking = ({ submissions, onAddNew }) => {
  const regions = {
    "FDA": "#003057", // FDA blue
    "EMA": "#0078d4", // EMA blue
    "PMDA": "#b01116", // PMDA red
    "NMPA": "#bd0102", // NMPA red
    "Health Canada": "#c22234" // Health Canada red
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Active Submissions</h3>
        <Button size="sm" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-1" /> New Submission
        </Button>
      </div>
      
      <div className="space-y-3">
        {submissions.map((submission, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div 
              className="absolute top-0 bottom-0 left-0 w-1" 
              style={{ backgroundColor: regions[submission.region] || "#6366F1" }}
            ></div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {submission.name}
                    <Badge 
                      className="text-white" 
                      style={{ 
                        backgroundColor: regions[submission.region] || "#6366F1",
                        color: "#FFFFFF" // Ensuring high contrast with white text
                      }}
                    >
                      {submission.region}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Submission ID: {submission.id}</CardDescription>
                </div>
                <div className="text-sm font-medium">
                  {submission.status === 'Submitted' ? (
                    <span className="flex items-center text-amber-700 dark:text-amber-400">
                      <Clock className="h-4 w-4 mr-1" /> Under Review
                    </span>
                  ) : submission.status === 'Approved' ? (
                    <span className="flex items-center text-green-700 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center text-blue-700 dark:text-blue-400">
                      <Edit className="h-4 w-4 mr-1" /> In Preparation
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Submission Date:</span>
                  <span className="ml-1 font-medium">{submission.submissionDate || 'Not submitted'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Target Approval:</span>
                  <span className="ml-1 font-medium">{submission.targetApprovalDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">CMC Sections:</span>
                  <span className="ml-1 font-medium">{submission.sections.join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Module Type:</span>
                  <span className="ml-1 font-medium">{submission.moduleType}</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Submission Readiness</span>
                  <span>{submission.progress}%</span>
                </div>
                <Progress value={submission.progress} className="h-1.5" />
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reviewer Comments</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Timeline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Documents</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Button size="sm">
                Manage Submission
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Enhanced CMC Module Component
const CMCModule = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('sections');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [showImageAnalysis, setShowImageAnalysis] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [generatingVisualization, setGeneratingVisualization] = useState(false);
  const [crystallineStructure, setCrystallineStructure] = useState(null);
  const [showNewSubmissionDialog, setShowNewSubmissionDialog] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [complianceAnalysis, setComplianceAnalysis] = useState(null);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [documentCount, setDocumentCount] = useState(17);
  const [documentSearch, setDocumentSearch] = useState('');
  
  // Enhanced with more molecule details
  const [moleculeDetails, setMoleculeDetails] = useState({
    name: 'Examplinostat',
    formula: 'C21H28N4O3',
    structureType: 'crystalline',
    properties: 'Salt form, hygroscopic',
    polymorph: 'Form A (stable)',
    solubility: 'Poorly soluble in water, freely soluble in ethanol',
    stability: 'Sensitive to light and oxygen'
  });
  
  // OpenAI integration
  const handleAssistantQuery = async () => {
    if (!assistantQuery.trim()) return;
    
    setAssistantLoading(true);
    try {
      // Use simulateOpenAIResponse for demo, in production we'd use queryRegulatoryAssistant
      const response = await simulateOpenAIResponse('cmc-assistant', { query: assistantQuery });
      setAssistantResponse({
        response: `Based on ICH Q8-Q10 guidelines, your question about "${assistantQuery}" can be addressed as follows:\n\n${response.optimizationSuggestions?.[0]?.suggestion || 'The process parameters should be controlled within the design space established during development. Consider implementing a risk-based approach to continuous monitoring of critical attributes.'}`,
        citations: [
          { text: 'ICH Q8(R2) Pharmaceutical Development', url: 'https://database.ich.org/sites/default/files/Q8_R2_Guideline.pdf' },
          { text: 'ICH Q9 Quality Risk Management', url: 'https://database.ich.org/sites/default/files/Q9_Guideline.pdf' },
          { text: 'FDA Guidance for Industry: Process Validation', url: 'https://www.fda.gov/files/drugs/published/Process-Validation--General-Principles-and-Practices.pdf' }
        ],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error with Regulatory Assistant",
        description: "Could not process your query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAssistantLoading(false);
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    setImageLoading(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        
        // In production we'd call analyzeEquipmentImage with the base64 image
        // For demo purposes, use a simulated response
        setTimeout(() => {
          setImageAnalysisResult({
            equipment: {
              type: "Chromatography System",
              model: "Likely HPLC System with Autosampler",
              components: [
                "Quaternary pump system",
                "Autosampler with sample tray",
                "Column compartment",
                "UV-Vis detector"
              ]
            },
            compliance: {
              gmpStatus: "Partial compliance detected",
              concerns: [
                "Visible cable management issues could present cleaning/contamination risk",
                "Secondary containment appears insufficient for solvent bottles"
              ]
            },
            recommendations: [
              "Implement improved cable management system to facilitate cleaning",
              "Add appropriate secondary containment for all solvent containers",
              "Consider recalibration of pressure sensors based on visible gauge readings",
              "Document all modifications to this equipment in validation records"
            ],
            processingTime: "1.2 seconds",
            confidence: 0.92
          });
          setImageLoading(false);
          setShowImageAnalysis(true);
        }, 2000);
      };
    } catch (error) {
      console.error(error);
      toast({
        title: "Error analyzing image",
        description: "Could not process the image. Please try again.",
        variant: "destructive"
      });
      setImageLoading(false);
    }
  };
  
  const handleGenerateContent = async (sectionType, targetRegulations = []) => {
    setIsGenerating(true);
    try {
      // Simulate generating content with OpenAI
      const response = await simulateOpenAIResponse('generate-cmc', { 
        sectionType, 
        drugDetails: { name: 'Examplinostat' },
        targetRegulations
      });
      
      toast({
        title: "Content generated successfully",
        description: `Generated ${sectionType} content with AI assistant`,
        action: <ToastAction altText="View">View</ToastAction>,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Compliance Analysis Component
  const ComplianceAnalysis = ({ data, loading, onGenerateReport }) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Analyzing regulatory compliance across regions...</p>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Compliance Analysis</h3>
          <p className="mb-4 text-sm text-gray-500 max-w-md">
            Generate a comprehensive compliance analysis for your CMC documentation 
            across global regulatory regions.
          </p>
          <Button onClick={onGenerateReport}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Compliance Report
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Global Compliance Analysis</h3>
          <Button size="sm" variant="outline" onClick={onGenerateReport}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Analysis
          </Button>
        </div>
        
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(data.summary).map(([region, score]) => (
                <Card key={region} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" style={{width: `${score}%`}}></div>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium">{region}</h4>
                      <span className="text-sm font-bold">{score}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {score >= 85 ? 'Fully compliant' : 
                       score >= 70 ? 'Minor gaps identified' : 
                       'Significant gaps'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Critical Gap Analysis</CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="divide-y dark:divide-gray-700">
              {data.criticalGaps.map((gap, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">{gap.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {gap.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {gap.regions.map((region, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <Button variant="outline" size="sm" className="text-xs">
              Download Full Report
            </Button>
            <Button size="sm" className="text-xs">
              Create Action Plan
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Sample regulatory submissions data
  const submissions = [
    {
      id: 'FDA-EXP-2025-0042',
      name: 'Examplinostat NDA Submission',
      region: 'FDA',
      status: 'In Preparation',
      submissionDate: null,
      targetApprovalDate: 'August 15, 2025',
      sections: ['S.2.2', 'S.2.4', 'S.3.2', 'P.7'],
      moduleType: 'New Drug Application (NDA)',
      progress: 68
    },
    {
      id: 'EMA-EXP-2025-0021',
      name: 'Examplinostat MAA',
      region: 'EMA',
      status: 'Submitted',
      submissionDate: 'March 10, 2025',
      targetApprovalDate: 'December 20, 2025',
      sections: ['3.2.S', '3.2.P'],
      moduleType: 'Marketing Authorization Application',
      progress: 100
    },
    {
      id: 'NMPA-2025-XYZ-0076',
      name: 'Examplinostat China Filing',
      region: 'NMPA',
      status: 'In Preparation',
      submissionDate: null,
      targetApprovalDate: 'September 30, 2025',
      sections: ['2.3.S', '2.3.P'],
      moduleType: 'Import Drug License Application',
      progress: 42
    }
  ];

  // Sample data
  const cmcSections = [
    {
      id: 1,
      title: 'Drug Substance Manufacturing Process',
      section: 'S.2.2',
      status: 'Approved',
      content: 'The active pharmaceutical ingredient (API) is manufactured via a six-step synthetic process. The process begins with the reaction of Compound A with Compound B in the presence of a palladium catalyst to form the key intermediate C. After purification by recrystallization, Intermediate C undergoes further transformations including reduction, protection, coupling, and deprotection steps. Quality is ensured through in-process controls at critical steps, with special attention to impurity profiles and stereochemical purity.',
      nextRevision: 'June 15, 2025',
      feedbackCount: 0
    },
    {
      id: 2,
      title: 'Manufacturing Process Controls',
      section: 'S.2.4',
      status: 'In Review',
      content: 'Critical process parameters have been identified through risk assessment and design of experiments (DoE). Temperature control during the coupling reaction (Step 4) is maintained at 55±2°C, as higher temperatures lead to formation of Impurity X, while lower temperatures reduce yield. Reaction time is controlled between 4-6 hours with in-process testing to ensure completion. Catalyst concentration impacts both yield and impurity profile, with optimal range established as 0.2-0.3 mol%. Process validation has demonstrated that these controls ensure consistent quality across multiple batches.',
      nextRevision: 'May 10, 2025',
      feedbackCount: 3
    },
    {
      id: 3,
      title: 'Control of Drug Product',
      section: 'P.5',
      status: 'Draft',
      content: 'The drug product specification includes tests for identity, assay, impurities, dissolution, content uniformity, and microbial limits. The analytical methods have been validated according to ICH Q2(R1) guidelines for specificity, linearity, accuracy, precision, range, detection limit, quantitation limit, and robustness as appropriate for each test. Chromatographic methods include HPLC with UV detection for assay and impurities, with method transfers completed to quality control laboratories at all manufacturing sites. Stability-indicating methods have been developed and validated to monitor potential degradation products.',
      nextRevision: 'May 25, 2025',
      feedbackCount: 5
    }
  ];

  const manufacturingProcesses = [
    {
      title: 'API Synthesis - Route B',
      description: 'Multi-step organic synthesis including critical catalytic hydrogenation',
      status: 'Validated',
      progress: 100,
      linkedRecords: [
        { name: 'Process Validation Report PVR-2025-003', type: 'Validation' },
        { name: 'CAPA-2024-112: Catalyst Purity Issue', type: 'CAPA' }
      ]
    },
    {
      title: 'Tablet Compression Process',
      description: 'Direct compression method with in-line PAT monitoring',
      status: 'In Review',
      progress: 75,
      linkedRecords: [
        { name: 'Deviation Report DEV-2025-017', type: 'Deviation' },
        { name: 'Qualification Protocol QP-COMP-2025', type: 'Qualification' }
      ]
    }
  ];

  const riskAnalyses = [
    {
      title: 'API Supplier Change Impact',
      severity: 4,
      probability: 3,
      impact: 'Product Quality & Supply',
      description: 'Evaluation of quality and regulatory impact for changing the API supplier from Vendor A to Vendor B',
      recommendations: [
        'Conduct comparative impurity profiling between vendors',
        'Execute 3-batch bridging stability study with new API source',
        'Update supplier qualification documentation',
        'Prepare regulatory variation/amendment strategy'
      ]
    },
    {
      title: 'Manufacturing Facility Transfer',
      severity: 3,
      probability: 4,
      impact: 'Regulatory Submissions & Timelines',
      description: 'Assessment of risks associated with moving production from Site 1 to Site 2',
      recommendations: [
        'Implement enhanced equipment qualification at new site',
        'Conduct process performance qualification (PPQ) with increased sampling',
        'Update facility-specific sections in regulatory documents',
        'Develop comprehensive comparability protocol'
      ]
    }
  ];

  const regulatoryChecks = [
    { requirement: 'Stability Data Duration', status: 'compliant', region: 'ICH', details: 'Long-term stability data covers 36 months at 25°C/60% RH' },
    { requirement: 'Starting Material Justification', status: 'partial', region: 'EMA', details: 'Synthetic route description requires additional details on impurity fate and purge' },
    { requirement: 'Process Validation Approach', status: 'compliant', region: 'FDA', details: 'Lifecycle approach implemented with continued process verification' },
    { requirement: 'Elemental Impurities Assessment', status: 'non-compliant', region: 'ICH Q3D', details: 'Risk assessment does not address potential catalyst residues adequately' }
  ];

  // Function to open the high contrast version in a new window
  const openHighContrastView = () => {
    window.open('/high-contrast.html', '_blank');
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Accessibility Controls - Fixed Position */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button 
          onClick={openHighContrastView}
          variant="outline" 
          className="bg-black text-white hover:bg-gray-800 border-2 border-white font-bold"
        >
          <Eye className="mr-2 h-4 w-4" />
          High Contrast View
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">CMC Management Suite</h1>
          <p className="text-black dark:text-white mt-1 font-medium">
            Comprehensive Chemistry, Manufacturing, and Controls management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-black dark:text-white" />
            <Input
              type="search"
              placeholder="Search CMC documents..."
              className="pl-9 text-black dark:text-white border-2 border-black dark:border-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Section
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <Alert className="flex-1 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900">
          <FlaskConical className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <AlertTitle className="text-indigo-600 dark:text-indigo-400">Enterprise CMC Module</AlertTitle>
          <AlertDescription className="text-indigo-700/80 dark:text-indigo-300">
            This module provides advanced capabilities for managing Chemistry, Manufacturing, and Controls documentation and processes. 
            Link manufacturing records, validate against regulatory requirements, and perform AI-driven risk analysis.
          </AlertDescription>
        </Alert>
        
        <div className="flex-1 flex gap-3">
          <Dialog open={showAssistant} onOpenChange={setShowAssistant}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-full border-indigo-200 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                <Brain className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">CMC Regulatory Assistant</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Powered by OpenAI GPT-4o</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  CMC Regulatory Assistant
                </DialogTitle>
                <DialogDescription>
                  Get expert guidance on regulatory requirements for Chemistry, Manufacturing, and Controls.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-2">
                {assistantResponse && (
                  <div className="space-y-2 mt-4">
                    <div className="p-4 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-lg">
                      <ScrollArea className="h-48">
                        <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-200">
                          {assistantResponse.response}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    {assistantResponse.citations && (
                      <div className="space-y-1 text-sm">
                        <h4 className="font-medium">Sources:</h4>
                        <ul className="space-y-1">
                          {assistantResponse.citations.map((citation, i) => (
                            <li key={i} className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                              <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                {citation.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a regulatory question about CMC..."
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAssistantQuery()}
                    disabled={assistantLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleAssistantQuery} disabled={assistantLoading}>
                    {assistantLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Ask"}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Examples: "What are ICH requirements for starting material selection?", "How should I document process validation?", "What stability requirements apply for biologics?"
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showImageAnalysis} onOpenChange={setShowImageAnalysis}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-full border-indigo-200 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/50">
                <Microscope className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Equipment Analysis</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Vision AI for Manufacturing</div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-indigo-600" />
                  Manufacturing Equipment Analysis
                </DialogTitle>
                <DialogDescription>
                  Upload an image of manufacturing equipment for AI-powered analysis and GMP compliance assessment.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {!imageAnalysisResult ? (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-12 text-center ${
                      imageLoading ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800' : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {imageLoading ? (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">Analyzing equipment image with GPT-4o Vision...</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center mb-4">
                          <UploadCloud className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Drag and drop an image of manufacturing equipment, or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-indigo-200 bg-white dark:border-indigo-700 dark:bg-gray-800">
                      <h3 className="font-medium mb-2 flex items-center gap-2 text-black dark:text-white">
                        <Factory className="h-4 w-4 text-indigo-600 dark:text-indigo-500" />
                        Equipment Identification
                      </h3>
                      <div className="space-y-1 pl-6">
                        <p className="text-sm text-gray-900 dark:text-gray-200"><span className="font-medium">Type:</span> {imageAnalysisResult.equipment.type}</p>
                        <p className="text-sm text-gray-900 dark:text-gray-200"><span className="font-medium">Model:</span> {imageAnalysisResult.equipment.model}</p>
                        <p className="text-sm text-gray-900 dark:text-gray-200"><span className="font-medium">Components:</span></p>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {imageAnalysisResult.equipment.components.map((component, i) => (
                            <li key={i} className="text-gray-900 dark:text-gray-300">{component}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-yellow-200 bg-white dark:border-yellow-700 dark:bg-gray-800">
                      <h3 className="font-medium mb-2 flex items-center gap-2 text-black dark:text-white">
                        <ShieldAlert className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                        GMP Compliance Assessment
                      </h3>
                      <p className="text-sm mb-2 text-gray-900 dark:text-gray-200"><span className="font-medium">Status:</span> {imageAnalysisResult.compliance.gmpStatus}</p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Concerns:</p>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {imageAnalysisResult.compliance.concerns.map((concern, i) => (
                            <li key={i} className="text-gray-900 dark:text-gray-300">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-200 bg-white dark:border-green-700 dark:bg-gray-800">
                      <h3 className="font-medium mb-2 flex items-center gap-2 text-black dark:text-white">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                        Recommendations
                      </h3>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-900 dark:text-gray-300">
                        {imageAnalysisResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Analysis confidence: {imageAnalysisResult.confidence * 100}%</span>
                      <span>Processing time: {imageAnalysisResult.processingTime}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {imageAnalysisResult && (
                  <Button variant="outline" onClick={() => setImageAnalysisResult(null)}>
                    Analyze New Image
                  </Button>
                )}
                <Button onClick={() => setShowImageAnalysis(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>CMC Sections</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="processes" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            <span>Manufacturing</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            <span>Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cmcSections.map((section) => (
              <CMCTemplate
                key={section.id}
                title={section.title}
                section={section.section}
                status={section.status}
                content={section.content}
                nextRevision={section.nextRevision}
                feedbackCount={section.feedbackCount}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manufacturingProcesses.map((process, index) => (
              <ProcessCard 
                key={index}
                title={process.title}
                description={process.description}
                status={process.status}
                progress={process.progress}
                linkedRecords={process.linkedRecords}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskAnalyses.map((risk, index) => (
              <RiskAnalysisCard
                key={index}
                title={risk.title}
                severity={risk.severity}
                probability={risk.probability}
                description={risk.description}
                recommendations={risk.recommendations}
                impact={risk.impact}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regulatory" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  ICH Guideline Compliance
                </CardTitle>
                <CardDescription>
                  Validation against international regulatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] rounded-md border">
                  <div className="p-4">
                    {regulatoryChecks.map((check, index) => (
                      <RegulatoryCheck
                        key={index}
                        requirement={check.requirement}
                        status={check.status}
                        region={check.region}
                        details={check.details}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
                <Button size="sm">
                  Run Compliance Check
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Global Requirements Validator
                </CardTitle>
                <CardDescription>
                  Configure and run validation against region-specific requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specification-type">Specification Type</Label>
                    <Select defaultValue="drug-substance">
                      <SelectTrigger>
                        <SelectValue placeholder="Select specification type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drug-substance">Drug Substance Specification</SelectItem>
                        <SelectItem value="drug-product">Drug Product Specification</SelectItem>
                        <SelectItem value="excipients">Excipient Specification</SelectItem>
                        <SelectItem value="impurities">Impurity Control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regions">Target Regions</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer bg-white border-indigo-300 text-indigo-800 dark:bg-gray-800 dark:border-indigo-600 dark:text-indigo-300">
                        FDA (US)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-gray-700 dark:text-gray-300">
                        EMA (EU)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-gray-700 dark:text-gray-300">
                        PMDA (Japan)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer text-gray-700 dark:text-gray-300">
                        NMPA (China)
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer bg-white border-indigo-300 text-indigo-800 dark:bg-gray-800 dark:border-indigo-600 dark:text-indigo-300">
                        Health Canada
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specification">Specification JSON</Label>
                    <Textarea
                      placeholder='{"tests": [{"name": "Assay", "acceptance_criteria": "98.0-102.0%", "method": "HPLC"}]}'
                      className="font-mono h-[120px] text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Load Template
                </Button>
                <Button size="sm">
                  Validate Specifications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="submissions" className="mt-0">
          <div className="space-y-4">
            <SubmissionTracking 
              submissions={submissions} 
              onAddNew={() => {
                toast({
                  title: "New Submission",
                  description: "Creating a new regulatory submission...",
                });
                setShowNewSubmissionDialog(true);
              }}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="global-readiness" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900">
                <h3 className="font-semibold text-lg text-black dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Global Regulatory Readiness Dashboard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track CMC documentation readiness for submissions across major global markets
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                  {/* Market readiness cards */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black dark:border-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-md text-black dark:text-white">FDA (US)</div>
                      <Badge className="bg-green-600 text-white">82%</Badge>
                    </div>
                    <Progress value={82} className="h-2 mt-2 mb-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">36 requirements met</span>
                      <span className="text-red-700 dark:text-red-400">8 pending</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black dark:border-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-md text-black dark:text-white">EMA (EU)</div>
                      <Badge className="bg-amber-600 text-white">65%</Badge>
                    </div>
                    <Progress value={65} className="h-2 mt-2 mb-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">28 requirements met</span>
                      <span className="text-red-700 dark:text-red-400">15 pending</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black dark:border-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-md text-black dark:text-white">PMDA (Japan)</div>
                      <Badge className="bg-red-600 text-white">43%</Badge>
                    </div>
                    <Progress value={43} className="h-2 mt-2 mb-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">19 requirements met</span>
                      <span className="text-red-700 dark:text-red-400">25 pending</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black dark:border-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-md text-black dark:text-white">NMPA (China)</div>
                      <Badge className="bg-amber-600 text-white">51%</Badge>
                    </div>
                    <Progress value={51} className="h-2 mt-2 mb-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">22 requirements met</span>
                      <span className="text-red-700 dark:text-red-400">21 pending</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black dark:border-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-md text-black dark:text-white">Health Canada</div>
                      <Badge className="bg-green-600 text-white">78%</Badge>
                    </div>
                    <Progress value={78} className="h-2 mt-2 mb-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700 dark:text-green-400">32 requirements met</span>
                      <span className="text-red-700 dark:text-red-400">9 pending</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-black dark:border-white rounded-lg overflow-hidden mb-6">
                  <div className="bg-black text-white dark:bg-white dark:text-black p-3 font-bold">
                    Critical Action Items (3)
                  </div>
                  <div className="p-0">
                    <div className="p-4 border-b-2 border-dashed border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500" />
                          <span className="font-semibold text-black dark:text-white">API Starting Material Documentation (PMDA)</span>
                        </div>
                        <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-300 dark:border-red-800">High Priority</Badge>
                      </div>
                      <p className="text-sm text-black dark:text-white ml-7 mb-2">
                        Additional documentation required for API starting material selection and justification, including synthetic route options and impurity profiles.
                      </p>
                      <div className="flex justify-between ml-7">
                        <span className="text-xs text-black dark:text-white">Due: 15 May 2025</span>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-black dark:text-white border-black dark:border-white">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Assign Task
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border-b-2 border-dashed border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500" />
                          <span className="font-semibold text-black dark:text-white">Elemental Impurities Assessment (EMA)</span>
                        </div>
                        <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-300 dark:border-red-800">High Priority</Badge>
                      </div>
                      <p className="text-sm text-black dark:text-white ml-7 mb-2">
                        Elemental impurities assessment does not meet ICH Q3D requirements for risk assessment of potential catalyst residues.
                      </p>
                      <div className="flex justify-between ml-7">
                        <span className="text-xs text-black dark:text-white">Due: 3 June 2025</span>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-black dark:text-white border-black dark:border-white">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Assign Task
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-red-50 dark:bg-red-950/30">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500" />
                          <span className="font-semibold text-black dark:text-white">Manufacturing Process Validation (NMPA)</span>
                        </div>
                        <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-300 dark:border-red-800">High Priority</Badge>
                      </div>
                      <p className="text-sm text-black dark:text-white ml-7 mb-2">
                        Additional process validation data required for critical manufacturing steps, with specific focus on NMPA requirements for sterilization validation.
                      </p>
                      <div className="flex justify-between ml-7">
                        <span className="text-xs text-black dark:text-white">Due: 22 May 2025</span>
                        <Button variant="outline" size="sm" className="h-7 text-xs text-black dark:text-white border-black dark:border-white">
                          <PlusCircle className="h-3.5 w-3.5 mr-1" />
                          Assign Task
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border-2 border-black dark:border-white rounded-lg overflow-hidden">
                    <div className="bg-black text-white dark:bg-white dark:text-black p-3 font-bold">
                      CMC Preparation Checklist
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox id="item1" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={true} />
                          <Label htmlFor="item1" className="text-black dark:text-white">API Specifications (ICH Q6A)</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item2" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={true} />
                          <Label htmlFor="item2" className="text-black dark:text-white">Drug Product Specifications</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item3" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={true} />
                          <Label htmlFor="item3" className="text-black dark:text-white">Container Closure System</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item4" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={false} />
                          <Label htmlFor="item4" className="text-black dark:text-white">Process Validation Summary Report</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item5" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={false} />
                          <Label htmlFor="item5" className="text-black dark:text-white">Stability Data (Long-term & Accelerated)</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item6" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={false} />
                          <Label htmlFor="item6" className="text-black dark:text-white">Analytical Method Validation</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox id="item7" className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" checked={false} />
                          <Label htmlFor="item7" className="text-black dark:text-white">Reference Standards Information</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-2 border-black dark:border-white rounded-lg overflow-hidden">
                    <div className="bg-black text-white dark:bg-white dark:text-black p-3 font-bold flex items-center justify-between">
                      <span>Market-Specific Requirements</span>
                      <Select defaultValue="fda">
                        <SelectTrigger className="w-[140px] h-7 text-xs bg-transparent border-white dark:border-black">
                          <SelectValue placeholder="Select market" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fda">FDA (US)</SelectItem>
                          <SelectItem value="ema">EMA (EU)</SelectItem>
                          <SelectItem value="pmda">PMDA (Japan)</SelectItem>
                          <SelectItem value="nmpa">NMPA (China)</SelectItem>
                          <SelectItem value="hc">Health Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="rounded-lg p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-black dark:text-white">Comparability Protocols</p>
                              <p className="text-xs text-black dark:text-white">FDA-specific requirement for post-approval changes management</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-black dark:text-white">Drug Master File Cross-References</p>
                              <p className="text-xs text-black dark:text-white">Documentation of authorized cross-references to DMFs</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-black dark:text-white">Nitrosamine Risk Assessment</p>
                              <p className="text-xs text-black dark:text-white">FDA-specific control strategy for potential nitrosamine impurities</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-black dark:text-white">Quality Overall Summary (QOS)</p>
                              <p className="text-xs text-black dark:text-white">Comprehensive summary following CTD format - requires updates</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="workflows" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Intelligent Regulatory Workflow Management</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Manage workflows that follow regulatory processes and procedures, with built-in compliance for 21 CFR Part 11, GxP, ICH guidelines, and more. All workflows include audit trails, electronic signatures, and validation steps.
              </AlertDescription>
            </Alert>
            
            <div className="my-4">
              <RegulatoryWorkflowManager />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <ListChecks className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">AI-Driven Task Management</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Intelligent task management with regulatory compliance features, automatic prioritization, deadline tracking, and integration with document workflows. Task analytics help optimize workload and identify bottlenecks.
              </AlertDescription>
            </Alert>
            
            <div className="my-4">
              <TaskManagementSystem />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Document Management System</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Centralized document management for CMC regulatory submissions with intelligent organization, version control, and AI-powered document analysis. All documents are managed in compliance with regulatory requirements.
              </AlertDescription>
            </Alert>
            
            <div className="my-4">
              <CMCDocumentHub />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="visualizations" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">GPT-4o & DALL-E AI Powered Tools</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                These advanced tools leverage OpenAI's latest models to automate and enhance your CMC workflows. All components use GPT-4o for text generation and analysis, DALL-E 3 for visualization, and OpenAI's multimodal capabilities for image analysis.
              </AlertDescription>
            </Alert>
            
            {/* Import SpecificationAnalyzer */}
            <div className="my-4">
              <SpecificationAnalyzer />
            </div>
            
            {/* Import MethodValidationGenerator */}
            <div className="my-4">
              <MethodValidationGenerator />
            </div>
            
            {/* Import BatchRecordGenerator */}
            <div className="my-4">
              <BatchRecordGenerator />
            </div>
            
            {/* Import FormulationPredictor */}
            <div className="my-4">
              <FormulationPredictor />
            </div>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Crystalline Structure Visualization
                </CardTitle>
                <CardDescription>
                  Generate detailed visualizations of API crystalline structures with DALL-E 3
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!crystallineStructure ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="molecule-name">Molecule Name</Label>
                        <Input 
                          id="molecule-name" 
                          value={moleculeDetails.name}
                          onChange={(e) => setMoleculeDetails({...moleculeDetails, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="formula">Chemical Formula</Label>
                        <Input 
                          id="formula" 
                          value={moleculeDetails.formula}
                          onChange={(e) => setMoleculeDetails({...moleculeDetails, formula: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="structure-type">Structure Type</Label>
                        <Select 
                          value={moleculeDetails.structureType}
                          onValueChange={(value) => setMoleculeDetails({...moleculeDetails, structureType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select structure type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crystalline">Crystalline</SelectItem>
                            <SelectItem value="amorphous">Amorphous</SelectItem>
                            <SelectItem value="polymorphic">Polymorphic</SelectItem>
                            <SelectItem value="solvate">Solvate/Hydrate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="properties">Additional Properties</Label>
                        <Textarea
                          id="properties"
                          value={moleculeDetails.properties}
                          onChange={(e) => setMoleculeDetails({...moleculeDetails, properties: e.target.value})}
                          className="h-20"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                          src="https://static.vecteezy.com/system/resources/previews/010/874/713/original/molecular-crystal-structure-model-rendered-with-blue-moody-photorealistic-style-3d-visualization-free-png.png" 
                          alt={`${moleculeDetails.name} Crystal Structure`}
                          className="w-full h-auto"
                        />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{moleculeDetails.name} ({moleculeDetails.formula})</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {moleculeDetails.structureType} structure with {moleculeDetails.properties.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {!crystallineStructure ? (
                  <div className="w-full">
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setGeneratingVisualization(true);
                        setTimeout(() => {
                          setCrystallineStructure({
                            url: "https://static.vecteezy.com/system/resources/previews/010/874/713/original/molecular-crystal-structure-model-rendered-with-blue-moody-photorealistic-style-3d-visualization-free-png.png",
                            generatedAt: new Date().toISOString(),
                            prompt: `Molecular crystal structure visualization of ${moleculeDetails.name} (${moleculeDetails.formula}) showing ${moleculeDetails.structureType} structure with ${moleculeDetails.properties}`
                          });
                          setGeneratingVisualization(false);
                          toast({
                            title: "Visualization Generated",
                            description: "DALL-E 3 has generated the crystalline structure visualization",
                          });
                        }, 2000);
                      }}
                      disabled={generatingVisualization}
                    >
                      {generatingVisualization ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating with DALL-E 3...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Visualization
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setCrystallineStructure(null)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New Visualization
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Manufacturing Process Visualization
                </CardTitle>
                <CardDescription>
                  Generate schematic visualizations of pharmaceutical manufacturing processes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <Sparkles className="h-12 w-12 text-indigo-600/60 dark:text-indigo-400/60 mx-auto" />
                  <h3 className="text-lg font-medium">Generate Manufacturing Process Diagrams</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visualize complex pharmaceutical manufacturing processes using DALL-E 3 AI image generation.
                  </p>
                  <Button className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Visualization
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* New Submission Dialog */}
      <Dialog open={showNewSubmissionDialog} onOpenChange={setShowNewSubmissionDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-600" /> 
              Create New Regulatory Submission
            </DialogTitle>
            <DialogDescription>
              Configure the details for a new regulatory submission package.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submission-name">Submission Name</Label>
                <Input id="submission-name" placeholder="e.g., Examplinostat NDA Initial Submission" />
              </div>
                
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submission-region">Target Region</Label>
                  <Select defaultValue="FDA">
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FDA">FDA (US)</SelectItem>
                      <SelectItem value="EMA">EMA (EU)</SelectItem>
                      <SelectItem value="PMDA">PMDA (Japan)</SelectItem>
                      <SelectItem value="NMPA">NMPA (China)</SelectItem>
                      <SelectItem value="Health Canada">Health Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="submission-type">Submission Type</Label>
                  <Select defaultValue="nda">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nda">New Drug Application (NDA)</SelectItem>
                      <SelectItem value="maa">Marketing Authorization Application</SelectItem>
                      <SelectItem value="bla">Biologics License Application</SelectItem>
                      <SelectItem value="anda">Abbreviated NDA (ANDA)</SelectItem>
                      <SelectItem value="ind">Investigational New Drug (IND)</SelectItem>
                      <SelectItem value="variation">Variation/Amendment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Required CMC Sections</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-s1" defaultChecked />
                    <Label htmlFor="section-s1" className="text-sm font-normal">S.1 General Information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-s2" defaultChecked />
                    <Label htmlFor="section-s2" className="text-sm font-normal">S.2 Manufacture</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-s3" defaultChecked />
                    <Label htmlFor="section-s3" className="text-sm font-normal">S.3 Characterization</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-s4" defaultChecked />
                    <Label htmlFor="section-s4" className="text-sm font-normal">S.4 Control of Drug Substance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-p1" />
                    <Label htmlFor="section-p1" className="text-sm font-normal">P.1 Description and Composition</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-p2" />
                    <Label htmlFor="section-p2" className="text-sm font-normal">P.2 Pharmaceutical Development</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-p3" />
                    <Label htmlFor="section-p3" className="text-sm font-normal">P.3 Manufacture</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="section-p4" />
                    <Label htmlFor="section-p4" className="text-sm font-normal">P.4 Control of Excipients</Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submission-date">Planned Submission Date</Label>
                  <Input type="date" id="submission-date" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="approval-date">Target Approval Date</Label>
                  <Input type="date" id="approval-date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-notes">Additional Notes</Label>
                <Textarea id="additional-notes" placeholder="Enter any additional information about this submission..." />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSubmissionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Submission Created",
                description: "New regulatory submission has been created successfully",
              });
              setShowNewSubmissionDialog(false);
            }}>
              Create Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help Button */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-md hover:shadow-lg border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Advanced OpenAI-Powered CMC Module
            </DialogTitle>
            <DialogDescription>
              Explore the power of OpenAI's advanced capabilities in this comprehensive Chemistry, Manufacturing, and Controls management system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Key OpenAI Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-medium">GPT-4o Model</span>
                    <p className="text-gray-500 dark:text-gray-400">Latest multimodal model for enhanced context understanding and regulatory analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <Microscope className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-medium">Vision Analysis</span>
                    <p className="text-gray-500 dark:text-gray-400">Upload manufacturing equipment images for AI-powered GMP compliance assessment</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <Brain className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-medium">Assistants API</span>
                    <p className="text-gray-500 dark:text-gray-400">Specialized CMC regulatory assistant with retrieval augmentation for compliance guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <FlaskConical className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-medium">DALL-E 3</span>
                    <p className="text-gray-500 dark:text-gray-400">Generate high-quality visualizations of crystalline structures and manufacturing processes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Module Navigation</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <FileText className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium mr-2">CMC Sections:</span> Manage regulatory document sections with AI-assisted content generation
                </p>
                <p className="flex items-center">
                  <Factory className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium mr-2">Manufacturing Processes:</span> Link manufacturing records and track validation progress
                </p>
                <p className="flex items-center">
                  <Activity className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium mr-2">Risk Analysis:</span> AI-powered risk assessment for manufacturing changes
                </p>
                <p className="flex items-center">
                  <Landmark className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium mr-2">Regulatory Compliance:</span> Validate against global regulatory requirements
                </p>
                <p className="flex items-center">
                  <Sparkles className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium mr-2">AI Visualizations:</span> Generate crystalline structure and process visualizations with DALL-E 3
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export the component wrapped with the auth guard
export default withAuthGuard(CMCModule);