import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Download,
  Share2,
  FileCheck,
  FilePlus,
  FileX,
  Shield,
  BookOpen,
  Folders,
  PlusCircle,
  Check,
  ArrowRight,
  UploadCloud,
  ExternalLink,
  Cog,
  Rocket,
  Sparkles,
  Landmark,
  Globe,
  Archive,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * SubmissionPreparator
 * 
 * Component for preparing regulatory submissions by integrating with the document hub
 * and providing AI-powered document validation, organization and assembly.
 */
const SubmissionPreparator = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [regions, setRegions] = useState(['FDA', 'EMA']);
  const [submissionType, setSubmissionType] = useState('NDA');
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionNumber, setSubmissionNumber] = useState('');
  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [showDocumentBrowser, setShowDocumentBrowser] = useState(false);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Sample CMC Required Document Templates based on submission type and region
  const cmcRequiredDocumentTemplates = {
    FDA: {
      NDA: [
        { id: '1', section: '3.2.S.1.1', title: 'Nomenclature', status: 'missing', required: true },
        { id: '2', section: '3.2.S.1.2', title: 'Structure', status: 'missing', required: true },
        { id: '3', section: '3.2.S.1.3', title: 'General Properties', status: 'missing', required: true },
        { id: '4', section: '3.2.S.2.1', title: 'Manufacturer(s)', status: 'missing', required: true },
        { id: '5', section: '3.2.S.2.2', title: 'Description of Manufacturing Process and Process Controls', status: 'missing', required: true },
        { id: '6', section: '3.2.S.2.3', title: 'Control of Materials', status: 'missing', required: true },
        { id: '7', section: '3.2.S.2.4', title: 'Controls of Critical Steps and Intermediates', status: 'missing', required: true },
        { id: '8', section: '3.2.S.2.5', title: 'Process Validation and/or Evaluation', status: 'missing', required: true },
        { id: '9', section: '3.2.S.2.6', title: 'Manufacturing Process Development', status: 'missing', required: true },
        { id: '10', section: '3.2.S.3.1', title: 'Elucidation of Structure and other Characteristics', status: 'missing', required: true },
        { id: '11', section: '3.2.S.3.2', title: 'Impurities', status: 'missing', required: true },
        { id: '12', section: '3.2.S.4.1', title: 'Specification', status: 'missing', required: true },
        { id: '13', section: '3.2.S.4.2', title: 'Analytical Procedures', status: 'missing', required: true },
        { id: '14', section: '3.2.S.4.3', title: 'Validation of Analytical Procedures', status: 'missing', required: true },
        { id: '15', section: '3.2.S.4.4', title: 'Batch Analyses', status: 'missing', required: true },
        { id: '16', section: '3.2.S.4.5', title: 'Justification of Specification', status: 'missing', required: true },
        { id: '17', section: '3.2.S.5', title: 'Reference Standards or Materials', status: 'missing', required: true },
        { id: '18', section: '3.2.S.6', title: 'Container Closure System', status: 'missing', required: true },
        { id: '19', section: '3.2.S.7.1', title: 'Stability Summary and Conclusions', status: 'missing', required: true },
        { id: '20', section: '3.2.S.7.2', title: 'Post-approval Stability Protocol and Stability Commitment', status: 'missing', required: true },
        { id: '21', section: '3.2.S.7.3', title: 'Stability Data', status: 'missing', required: true },
        { id: '22', section: '3.2.P.1', title: 'Description and Composition of the Drug Product', status: 'missing', required: true },
        { id: '23', section: '3.2.P.2', title: 'Pharmaceutical Development', status: 'missing', required: true },
        { id: '24', section: '3.2.P.3', title: 'Manufacture', status: 'missing', required: true },
        { id: '25', section: '3.2.P.4', title: 'Control of Excipients', status: 'missing', required: true },
        { id: '26', section: '3.2.P.5', title: 'Control of Drug Product', status: 'missing', required: true },
        { id: '27', section: '3.2.P.6', title: 'Reference Standards or Materials', status: 'missing', required: true },
        { id: '28', section: '3.2.P.7', title: 'Container Closure System', status: 'missing', required: true },
        { id: '29', section: '3.2.P.8', title: 'Stability', status: 'missing', required: true },
        { id: '30', section: '3.2.R', title: 'Regional Information', status: 'missing', required: false }
      ]
    },
    EMA: {
      MAA: [
        { id: '1', section: '3.2.S.1.1', title: 'Nomenclature', status: 'missing', required: true },
        { id: '2', section: '3.2.S.1.2', title: 'Structure', status: 'missing', required: true },
        { id: '3', section: '3.2.S.1.3', title: 'General Properties', status: 'missing', required: true },
        // ... other EMA-specific CMC documents
      ]
    }
  };
  
  // Sample document data from the document hub
  const sampleDocuments = [
    {
      id: '101',
      title: 'API Specification',
      section: '3.2.S.4.1',
      author: 'Sarah Johnson',
      modified: '2025-04-10T10:30:00Z',
      aiScore: 92,
      status: 'Approved',
      format: 'pdf',
      size: '2.4 MB'
    },
    {
      id: '102',
      title: 'Drug Product Analytical Method Validation',
      section: '3.2.P.5.3',
      author: 'Michael Chen',
      modified: '2025-04-05T14:45:00Z',
      aiScore: 87,
      status: 'Approved',
      format: 'docx',
      size: '3.8 MB'
    },
    {
      id: '103',
      title: 'Stability Summary and Conclusions',
      section: '3.2.P.8.1',
      author: 'Jennifer Williams',
      modified: '2025-04-12T09:20:00Z',
      aiScore: 94,
      status: 'Approved',
      format: 'pdf',
      size: '5.1 MB'
    },
    {
      id: '104',
      title: 'Drug Product Manufacturing Process Description',
      section: '3.2.P.3.3',
      author: 'Robert Miller',
      modified: '2025-04-08T11:15:00Z',
      aiScore: 91,
      status: 'Pending Review',
      format: 'docx',
      size: '7.2 MB'
    },
    {
      id: '105',
      title: 'Excipient Specifications',
      section: '3.2.P.4.1',
      author: 'Emily Davis',
      modified: '2025-04-02T15:30:00Z',
      aiScore: 89,
      status: 'Approved',
      format: 'pdf',
      size: '1.9 MB'
    }
  ];
  
  // Initialize required documents based on submission type and region
  useEffect(() => {
    if (regions.length > 0 && submissionType) {
      // For demo purposes, just use FDA NDA requirements
      const requiredDocs = cmcRequiredDocumentTemplates.FDA.NDA;
      setRequiredDocuments(requiredDocs);
    }
  }, [regions, submissionType]);
  
  // Function to add a document from the document hub to the submission
  const addDocumentToSubmission = (document) => {
    // Check if document is already linked
    if (linkedDocuments.some(doc => doc.id === document.id)) {
      toast({
        title: "Document Already Added",
        description: "This document is already linked to the submission.",
        variant: "destructive"
      });
      return;
    }
    
    // Add document to linked documents
    setLinkedDocuments([...linkedDocuments, document]);
    
    // Update the required documents status
    setRequiredDocuments(requiredDocuments.map(req => {
      if (req.section === document.section) {
        return { ...req, status: 'available' };
      }
      return req;
    }));
    
    toast({
      title: "Document Added",
      description: `"${document.title}" has been added to the submission.`
    });
  };
  
  // Function to remove a document from the submission
  const removeDocumentFromSubmission = (documentId) => {
    const documentToRemove = linkedDocuments.find(doc => doc.id === documentId);
    
    // Remove document from linked documents
    setLinkedDocuments(linkedDocuments.filter(doc => doc.id !== documentId));
    
    // Update the required documents status
    if (documentToRemove) {
      setRequiredDocuments(requiredDocuments.map(req => {
        if (req.section === documentToRemove.section) {
          return { ...req, status: 'missing' };
        }
        return req;
      }));
    }
    
    toast({
      title: "Document Removed",
      description: "The document has been removed from the submission."
    });
  };
  
  // Function to validate submission contents with OpenAI
  const validateSubmission = () => {
    if (linkedDocuments.length === 0) {
      toast({
        title: "No Documents Linked",
        description: "Please add documents to the submission before validating.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to OpenAI service for validation
    setTimeout(() => {
      // Calculate completeness metrics
      const totalRequired = requiredDocuments.filter(doc => doc.required).length;
      const availableRequired = requiredDocuments.filter(doc => doc.required && doc.status === 'available').length;
      const completenessPercentage = Math.round((availableRequired / totalRequired) * 100);
      
      // Generate simulated validation results
      const validationResult = {
        completeness: {
          percentage: completenessPercentage,
          missingRequired: totalRequired - availableRequired,
          totalRequired: totalRequired
        },
        contentQuality: {
          percentage: 92,
          issues: [
            {
              section: '3.2.S.4.1',
              title: 'API Specification',
              issue: 'Acceptance criteria for organic impurities may need justification',
              severity: 'medium'
            },
            {
              section: '3.2.P.3.3',
              title: 'Drug Product Manufacturing Process Description',
              issue: 'Additional in-process controls recommended for critical step',
              severity: 'high'
            }
          ]
        },
        regulatoryAlignment: {
          percentage: 89,
          issues: [
            {
              section: '3.2.P.8.1',
              title: 'Stability Summary and Conclusions',
              issue: 'ICH recommended storage conditions not fully addressed',
              severity: 'medium'
            }
          ]
        },
        overallReadiness: {
          percentage: Math.round((completenessPercentage + 92 + 89) / 3),
          recommendation: completenessPercentage < 80 ? 
            'Address missing required documents before submission' : 
            'Submission package is generally ready with minor improvements needed'
        }
      };
      
      setValidationStatus(validationResult);
      setLoading(false);
      
      toast({
        title: "Validation Complete",
        description: `Submission readiness: ${validationResult.overallReadiness.percentage}%`
      });
    }, 3000);
  };
  
  // Function to generate the submission package with OpenAI
  const generateSubmissionPackage = () => {
    if (!validationStatus || validationStatus.overallReadiness.percentage < 60) {
      toast({
        title: "Submission Not Ready",
        description: "Please validate and address critical issues before generating the submission package.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setPreviewOpen(true);
      
      toast({
        title: "Submission Package Generated",
        description: "The submission package has been successfully generated."
      });
    }, 3000);
  };
  
  // Calculated metrics
  const submissionProgress = linkedDocuments.length > 0 
    ? Math.round((linkedDocuments.length / requiredDocuments.length) * 100) 
    : 0;
  
  const documentsReadyCount = requiredDocuments.filter(doc => doc.status === 'available').length;
  const documentsMissingCount = requiredDocuments.filter(doc => doc.status === 'missing' && doc.required).length;
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Approved</Badge>;
      case 'Pending Review':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Pending Review</Badge>;
      case 'available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Available</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Missing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">{status}</Badge>;
    }
  };
  
  return (
    <Card className="w-full shadow-md border-2 border-black dark:border-white">
      <CardHeader className="bg-black text-white dark:bg-white dark:text-black">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Submission Preparator
            </CardTitle>
            <CardDescription className="text-gray-300 dark:text-gray-700">
              Prepare regulatory submissions with AI-powered document validation and assembly
            </CardDescription>
          </div>
          <div>
            <Button 
              onClick={generateSubmissionPackage}
              disabled={!validationStatus || validationStatus?.overallReadiness.percentage < 60 || loading}
              className="bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Generate Submission
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="overview" className="flex-1">Submission Overview</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
            <TabsTrigger value="validation" className="flex-1">Validation Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="submission-title">Submission Title</Label>
                  <Input 
                    id="submission-title" 
                    placeholder="Enter a title for this submission"
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="submission-number">Submission Number (Optional)</Label>
                  <Input 
                    id="submission-number" 
                    placeholder="Enter submission tracking number if available"
                    value={submissionNumber}
                    onChange={(e) => setSubmissionNumber(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="submission-type">Submission Type</Label>
                  <Select 
                    value={submissionType}
                    onValueChange={setSubmissionType}
                  >
                    <SelectTrigger id="submission-type">
                      <SelectValue placeholder="Select submission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NDA">New Drug Application (NDA)</SelectItem>
                      <SelectItem value="MAA">Marketing Authorization Application (MAA)</SelectItem>
                      <SelectItem value="BLA">Biologics License Application (BLA)</SelectItem>
                      <SelectItem value="ANDA">Abbreviated New Drug Application (ANDA)</SelectItem>
                      <SelectItem value="IND">Investigational New Drug (IND)</SelectItem>
                      <SelectItem value="DMF">Drug Master File (DMF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Regulatory Authorities</Label>
                  <div className="flex flex-wrap gap-2">
                    {['FDA', 'EMA', 'PMDA', 'Health Canada', 'NMPA', 'TGA', 'ANVISA'].map(region => (
                      <Badge 
                        key={region}
                        variant={regions.includes(region) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (regions.includes(region)) {
                            setRegions(regions.filter(r => r !== region));
                          } else {
                            setRegions([...regions, region]);
                          }
                        }}
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="submission-notes">Notes</Label>
                  <Textarea
                    id="submission-notes"
                    placeholder="Add any relevant notes about this submission..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b">
                <h3 className="text-lg font-medium">Submission Progress</h3>
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Documents Ready</span>
                      <span>{documentsReadyCount} of {requiredDocuments.length}</span>
                    </div>
                    <Progress value={submissionProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-green-600" />
                          Documents Ready
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="text-2xl font-bold">{documentsReadyCount}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileX className="h-4 w-4 text-red-600" />
                          Required Documents Missing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="text-2xl font-bold">{documentsMissingCount}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Submission Readiness
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="text-2xl font-bold">
                          {validationStatus ? `${validationStatus.overallReadiness.percentage}%` : 'N/A'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-between gap-4">
                    <Button
                      onClick={() => setShowDocumentBrowser(true)}
                      className="flex-1"
                    >
                      <Folders className="h-4 w-4 mr-2" />
                      Browse Document Hub
                    </Button>
                    
                    <Button 
                      onClick={validateSubmission}
                      disabled={linkedDocuments.length === 0 || loading}
                      variant="outline"
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Validate with GPT-4o
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Required Documents</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDocumentBrowser(true)}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Documents
                </Button>
                
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="missing">Missing Documents</SelectItem>
                    <SelectItem value="available">Available Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Section</TableHead>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requiredDocuments.map((doc) => {
                    const linkedDocument = linkedDocuments.find(
                      d => d.section === doc.section
                    );
                    
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.section}</TableCell>
                        <TableCell>
                          <div className="font-medium">{doc.title}</div>
                          {linkedDocument && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {linkedDocument.title}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(doc.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.status === 'available' ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeDocumentFromSubmission(linkedDocument.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowDocumentBrowser(true)}
                            >
                              <FilePlus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {linkedDocuments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Linked Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedDocuments.map(doc => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{doc.title}</CardTitle>
                            <CardDescription>Section: {doc.section}</CardDescription>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>Last modified: {new Date(doc.modified).toLocaleDateString()}</span>
                          <span>{doc.format.toUpperCase()} • {doc.size}</span>
                        </div>
                        {doc.aiScore && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span>AI Quality Score</span>
                              <span className={
                                doc.aiScore >= 90 ? "text-green-600 dark:text-green-400" :
                                doc.aiScore >= 80 ? "text-blue-600 dark:text-blue-400" :
                                "text-amber-600 dark:text-amber-400"
                              }>
                                {doc.aiScore}%
                              </span>
                            </div>
                            <Progress 
                              value={doc.aiScore} 
                              className={`h-1 ${
                                doc.aiScore >= 90 ? "bg-green-600" :
                                doc.aiScore >= 80 ? "bg-blue-600" :
                                "bg-amber-600"
                              }`} 
                            />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => removeDocumentFromSubmission(doc.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="validation" className="p-6 space-y-6">
            {!validationStatus ? (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No Validation Results Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  Add documents to your submission and run validation to see AI-powered analysis of your submission package.
                </p>
                <Button 
                  onClick={validateSubmission}
                  disabled={linkedDocuments.length === 0 || loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Validate with GPT-4o
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-black text-white dark:bg-white dark:text-black rounded-lg p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-medium mb-2">Submission Readiness Analysis</h3>
                      <p className="text-gray-300 dark:text-gray-700 max-w-2xl">
                        {validationStatus.overallReadiness.recommendation}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-4xl font-bold mr-2">{validationStatus.overallReadiness.percentage}%</div>
                      <div className="text-xl">Ready</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Completeness</CardTitle>
                        <span className="text-2xl font-bold">{validationStatus.completeness.percentage}%</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={validationStatus.completeness.percentage} className="h-2" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Missing Required Documents:</span>
                            <span className="font-medium">{validationStatus.completeness.missingRequired}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Required Documents:</span>
                            <span className="font-medium">{validationStatus.completeness.totalRequired}</span>
                          </div>
                        </div>
                        
                        {validationStatus.completeness.missingRequired > 0 && (
                          <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                              {validationStatus.completeness.missingRequired} required documents are missing
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Content Quality</CardTitle>
                        <span className="text-2xl font-bold">{validationStatus.contentQuality.percentage}%</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={validationStatus.contentQuality.percentage} className="h-2" />
                        
                        <div className="space-y-2">
                          {validationStatus.contentQuality.issues.map((issue, index) => (
                            <Alert 
                              key={index} 
                              className={
                                issue.severity === 'high' 
                                  ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                              }
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>{issue.section}: {issue.title}</AlertTitle>
                              <AlertDescription>
                                {issue.issue}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Regulatory Alignment</CardTitle>
                        <span className="text-2xl font-bold">{validationStatus.regulatoryAlignment.percentage}%</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Progress value={validationStatus.regulatoryAlignment.percentage} className="h-2" />
                        
                        <div className="space-y-2">
                          {validationStatus.regulatoryAlignment.issues.map((issue, index) => (
                            <Alert 
                              key={index}
                              className={
                                issue.severity === 'high' 
                                  ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                              }
                            >
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>{issue.section}: {issue.title}</AlertTitle>
                              <AlertDescription>
                                {issue.issue}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between gap-4">
                  <Button variant="outline" onClick={validateSubmission} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Revalidating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Revalidate
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={generateSubmissionPackage}
                    disabled={validationStatus.overallReadiness.percentage < 60 || loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Generate Submission Package
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Document Browser Dialog */}
      <Dialog open={showDocumentBrowser} onOpenChange={setShowDocumentBrowser}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Document Hub</DialogTitle>
            <DialogDescription>
              Browse and select documents from the Document Hub to include in your submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Search documents..."
                className="max-w-sm"
                prefix={<Search className="h-4 w-4 text-gray-500" />}
              />
              
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="specification">Specifications</SelectItem>
                    <SelectItem value="validation">Validation</SelectItem>
                    <SelectItem value="stability">Stability</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <UploadCloud className="h-4 w-4 mr-1" />
                  Upload New Document
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <div>{doc.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.format.toUpperCase()} • {doc.size}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{doc.section}</TableCell>
                      <TableCell>
                        {getStatusBadge(doc.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(doc.modified).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          by {doc.author}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${doc.aiScore >= 90 ? 'text-green-600 dark:text-green-400' : 
                              doc.aiScore >= 80 ? 'text-blue-600 dark:text-blue-400' : 
                              'text-amber-600 dark:text-amber-400'}
                          `}
                        >
                          {doc.aiScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => addDocumentToSubmission(doc)}
                            disabled={linkedDocuments.some(d => d.id === doc.id)}
                          >
                            {linkedDocuments.some(d => d.id === doc.id) ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Added
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentBrowser(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Submission Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Submission Package Preview</DialogTitle>
            <DialogDescription>
              Your submission package has been generated and is ready for download
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Submission Package Ready</AlertTitle>
              <AlertDescription>
                Your submission package has been successfully generated and is ready for final review and submission.
              </AlertDescription>
            </Alert>
            
            <div className="border p-4 rounded-lg">
              <h4 className="font-medium mb-2">Package Contents</h4>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {[...requiredDocuments]
                    .filter(doc => doc.status === 'available')
                    .sort((a, b) => a.section.localeCompare(b.section))
                    .map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.section} - {doc.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {linkedDocuments.find(d => d.section === doc.section)?.title || doc.title}
                          </div>
                        </div>
                        <Badge className="shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Included
                        </Badge>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Submission Format</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 border rounded">
                  <Archive className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium">eCTD Format (FDA/EMA)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Electronic Common Technical Document</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="font-medium">ICH M4 Compliant</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">International Council for Harmonisation</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Final Review</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Submission Format:</span>
                  <span className="font-medium">eCTD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Document Count:</span>
                  <span className="font-medium">{documentsReadyCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Submission Size:</span>
                  <span className="font-medium">24.6 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Generated On:</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <div className="flex gap-2">
                <Button variant="outline">
                  <Cog className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View in Gateway
                </Button>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-1" />
                Download Package
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubmissionPreparator;