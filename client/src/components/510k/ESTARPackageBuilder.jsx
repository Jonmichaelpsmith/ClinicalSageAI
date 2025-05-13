import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  FileCheck,
  XCircle,
  AlertCircle,
  BookOpen,
  Code,
  File,
  PlusCircle,
  Trash2,
  CloudUpload
} from 'lucide-react';
import { isFeatureEnabled } from '../../flags/featureFlags';
import FDA510kService from '../../services/FDA510kService';
import ESTARPackageBuilder from '../../services/ESTARPackageBuilder';

/**
 * eSTAR Package Builder component
 * 
 * This component provides a comprehensive interface for building and managing
 * FDA eSTAR submission packages for 510(k) clearance applications.
 * 
 * @param {Object} props - Component props
 * @param {string} props.projectId - The ID of the 510(k) project
 * @returns {JSX.Element}
 */
const ESTARPackageBuilderComponent = ({ projectId }) => {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('files');
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [preview, setPreview] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState(null);
  const [packageValidation, setPackageValidation] = useState(null);
  const [xmlPreview, setXmlPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load initial preview data
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')) return;
    
    const loadPreview = async () => {
      try {
        setLoading(true);
        const result = await FDA510kService.previewESTARPackage(projectId);
        setPreview(result);
        
        // Generate XML Preview
        if (result?.files) {
          const xmlManifest = ESTARPackageBuilder.generateXMLManifest({
            submissionId: `510k-${projectId}`,
            manufacturerName: 'Example Medical Device Corp.',
            deviceName: 'GlucoTrack Continuous Glucose Monitor'
          }, result.files);
          
          setXmlPreview(xmlManifest);
          
          // Validate package
          const validation = ESTARPackageBuilder.validatePackage({
            files: result.files,
            manifest: xmlManifest
          });
          
          setPackageValidation(validation);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading package preview:', err);
        setError(err.message || 'Failed to load preview data');
        setLoading(false);
      }
    };
    
    loadPreview();
  }, [projectId]);
  
  // Build and download eSTAR package
  const handleBuildPackage = async () => {
    try {
      setBuilding(true);
      const result = await FDA510kService.buildESTARPackage(
        projectId, 
        { includeCoverLetter: true }
      );
      
      if (result.success) {
        toast({
          title: 'Package built successfully',
          description: 'Your eSTAR package is ready for download',
        });
        
        // Trigger download automatically
        window.location.href = result.downloadUrl;
      }
      
      setBuilding(false);
    } catch (err) {
      console.error('Error building package:', err);
      toast({
        title: 'Error building package',
        description: err.message || 'Failed to build eSTAR package',
        variant: 'destructive',
      });
      setBuilding(false);
    }
  };
  
  // Verify digital signature on the manifest
  const handleVerifySignature = async () => {
    try {
      setVerifying(true);
      const result = await FDA510kService.verifySignature(projectId);
      
      if (result.success) {
        setVerification(result.verification);
        toast({
          title: result.verification.valid ? 'Signature valid' : 'Signature invalid',
          description: result.verification.message,
          variant: result.verification.valid ? 'default' : 'destructive',
        });
      }
      
      setVerifying(false);
    } catch (err) {
      console.error('Error verifying signature:', err);
      toast({
        title: 'Error verifying signature',
        description: err.message || 'Failed to verify digital signature',
        variant: 'destructive',
      });
      setVerifying(false);
    }
  };
  
  // Submit package to FDA ESG
  const handleSubmitToESG = async () => {
    try {
      setIsUploading(true);
      
      // Simulate a file upload with progress
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      toast({
        title: 'Feature coming soon',
        description: 'Direct FDA ESG submission will be available in a future update',
      });
      
      setUploadProgress(0);
      setIsUploading(false);
    } catch (err) {
      console.error('Error uploading to FDA ESG:', err);
      toast({
        title: 'Upload error',
        description: err.message || 'Failed to upload to FDA ESG',
        variant: 'destructive',
      });
      setUploadProgress(0);
      setIsUploading(false);
    }
  };
  
  // Get status badge styling based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Complete
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Error
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
    }
  };
  
  // Get file size in human-readable format
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };
  
  // Get package readiness status
  const getPackageReadiness = () => {
    if (!packageValidation) return 0;
    
    if (packageValidation.criticalIssues === 0) {
      if (packageValidation.warnings === 0) {
        return 100; // Perfect
      } else {
        return 80; // Warnings only
      }
    } else {
      if (packageValidation.criticalIssues > 3) {
        return 20; // Many critical issues
      } else {
        return 40; // Some critical issues
      }
    }
  };
  
  if (!isFeatureEnabled('ENABLE_PACKAGE_ASSEMBLY')) {
    return (
      <Alert>
        <AlertTitle>Feature Disabled</AlertTitle>
        <AlertDescription>
          eSTAR Package Assembly feature is currently disabled
        </AlertDescription>
      </Alert>
    );
  }
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p>Loading eSTAR package data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="w-full border-t-4 border-t-blue-600">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">eSTAR Package Assembly</CardTitle>
            <CardDescription>
              Build and validate your FDA 510(k) eSTAR submission package
            </CardDescription>
          </div>
          <div className="space-x-2">
            <Button 
              variant="default" 
              className="gap-2"
              disabled={building || packageValidation?.criticalIssues > 0}
              onClick={handleBuildPackage}
            >
              {building ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Build & Download
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              disabled={isUploading || packageValidation?.criticalIssues > 0}
              onClick={handleSubmitToESG}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" />
                  Submit to FDA ESG
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isUploading && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Uploading to FDA ESG...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        <div className="flex flex-col gap-6">
          {/* Package Readiness Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="w-full md:w-3/4 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Package Readiness</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall readiness</span>
                    <span className="text-sm font-medium">{getPackageReadiness()}%</span>
                  </div>
                  <Progress value={getPackageReadiness()} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {preview?.files?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Files</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {packageValidation?.criticalIssues || 0}
                      </div>
                      <div className="text-xs text-gray-500">Critical Issues</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {packageValidation?.warnings || 0}
                      </div>
                      <div className="text-xs text-gray-500">Warnings</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="w-full md:w-1/4 shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Package Size</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatFileSize(preview?.totalSize || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total package size</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="files" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" />
                <span>Validation</span>
              </TabsTrigger>
              <TabsTrigger value="manifest" className="flex items-center gap-1.5">
                <Code className="h-4 w-4" />
                <span>Manifest</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>AI Report</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Files Tab */}
            <TabsContent value="files" className="m-0">
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Package Files</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add File</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">File Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview?.files?.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            {file.name}
                          </TableCell>
                          <TableCell>{file.section || 'General'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(file.type.split('/')[1] || file.type).toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatFileSize(file.size)}</TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge('complete')}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Validation Tab */}
            <TabsContent value="validation" className="m-0">
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Package Validation</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      disabled={verifying}
                      onClick={handleVerifySignature}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="h-3.5 w-3.5" />
                          <span>Verify Signature</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  {/* Signature verification result */}
                  {verification && (
                    <Alert className={verification.valid ? 'bg-green-50 border-green-200 mb-4' : 'bg-red-50 border-red-200 mb-4'}>
                      <div className="flex items-center">
                        {verification.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <AlertTitle>{verification.valid ? 'Valid Signature' : 'Invalid Signature'}</AlertTitle>
                      </div>
                      <AlertDescription className="pl-6">
                        {verification.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {packageValidation ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-md ${
                        packageValidation.criticalIssues > 0 
                          ? 'bg-red-50 border border-red-200' 
                          : packageValidation.warnings > 0
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          {packageValidation.criticalIssues > 0 ? (
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                          ) : packageValidation.warnings > 0 ? (
                            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          )}
                          <span className="font-semibold">
                            {packageValidation.criticalIssues > 0 
                              ? 'Package has critical issues' 
                              : packageValidation.warnings > 0
                                ? 'Package has warnings'
                                : 'Package is complete and valid'}
                          </span>
                        </div>
                        <p className="text-sm ml-7">
                          {packageValidation.criticalIssues > 0 
                            ? `Found ${packageValidation.criticalIssues} critical issues and ${packageValidation.warnings} warnings. These must be fixed before submission.` 
                            : packageValidation.warnings > 0
                              ? `Found ${packageValidation.warnings} warnings. Consider addressing them before submission.`
                              : 'All required elements are present and valid. The package is ready for submission.'}
                        </p>
                      </div>
                      
                      {packageValidation.issues.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="issues">
                            <AccordionTrigger className="text-base font-medium">
                              Issues ({packageValidation.issues.length})
                            </AccordionTrigger>
                            <AccordionContent>
                              <ScrollArea className="h-[300px]">
                                <div className="space-y-3 pr-4">
                                  {packageValidation.issues.map((issue, index) => (
                                    <div 
                                      key={index} 
                                      className={`p-3 rounded-md border ${
                                        issue.severity === 'critical' 
                                          ? 'bg-red-50 border-red-200' 
                                          : 'bg-amber-50 border-amber-200'
                                      }`}
                                    >
                                      <div className="flex items-center mb-1">
                                        {issue.severity === 'critical' ? (
                                          <XCircle className="h-4 w-4 text-red-600 mr-2 shrink-0" />
                                        ) : (
                                          <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 shrink-0" />
                                        )}
                                        <span className="font-medium text-sm">
                                          {issue.severity === 'critical' ? 'Critical: ' : 'Warning: '}
                                          {issue.message}
                                        </span>
                                      </div>
                                      {issue.recommendation && (
                                        <div className="ml-6 mt-1 text-sm">
                                          <span className="font-medium">Recommendation:</span> {issue.recommendation}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">Validation data not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Manifest Tab */}
            <TabsContent value="manifest" className="m-0">
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">eSTAR XML Manifest</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  {xmlPreview ? (
                    <ScrollArea className="h-[400px] w-full rounded-md border">
                      <pre className="p-4 text-xs font-mono">{xmlPreview}</pre>
                    </ScrollArea>
                  ) : (
                    <div className="text-center p-8">
                      <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No manifest data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Report Tab */}
            <TabsContent value="report" className="m-0">
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">AI Compliance Report</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  {preview?.aiComplianceReport ? (
                    <div className="p-4 text-sm bg-white rounded-md border">
                      <div className="whitespace-pre-line">{preview.aiComplianceReport}</div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">AI compliance report not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Save Draft</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// FAQ Component
const ESTARPackageBuilderFAQ = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <CardDescription>
          Common questions about the eSTAR package builder and submission process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is an eSTAR package?</AccordionTrigger>
            <AccordionContent>
              eSTAR (electronic Submission Template And Resource) is the FDA's electronic submission format for 510(k) applications. 
              It provides a standardized format that helps ensure your submission contains all required elements in a consistent structure.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>What documents are required for an eSTAR submission?</AccordionTrigger>
            <AccordionContent>
              <p>An eSTAR submission typically requires the following components:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Administrative Information (including contact details and device registration)</li>
                <li>Device Description (detailed information about your device)</li>
                <li>Substantial Equivalence Discussion (comparing your device to predicates)</li>
                <li>Performance Testing (data demonstrating device safety and effectiveness)</li>
                <li>Sterilization and Shelf-life Information (if applicable)</li>
                <li>Biocompatibility Data (for devices contacting the body)</li>
                <li>Software Documentation (for devices containing software)</li>
                <li>Declarations and Certifications (compliance statements)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>What file formats are accepted in an eSTAR package?</AccordionTrigger>
            <AccordionContent>
              The FDA accepts the following file formats in eSTAR submissions:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>PDF (.pdf) - For most documentation</li>
                <li>XML (.xml) - For structured data and the package manifest</li>
                <li>XLSX (.xlsx) - For tabular data</li>
                <li>JPEG/PNG (.jpg, .png) - For images</li>
                <li>MP4 (.mp4) - For video demonstrations</li>
              </ul>
              All files should be readable, searchable (for text documents), and properly labeled.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>How does the digital signature verification work?</AccordionTrigger>
            <AccordionContent>
              The digital signature process verifies the authenticity and integrity of your eSTAR package:
              <ol className="list-decimal pl-6 mt-2 space-y-1">
                <li>An XML Digital Signature is applied to the package manifest</li>
                <li>The signature uses cryptographic techniques to verify that the package hasn't been altered</li>
                <li>It includes a timestamp to prove when the package was signed</li>
                <li>The signature is verified using an FDA-recognized certificate authority</li>
              </ol>
              This ensures that the FDA receives exactly what you intended to submit.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>What are the size limitations for an eSTAR package?</AccordionTrigger>
            <AccordionContent>
              The FDA Electronic Submissions Gateway (ESG) has the following size limitations:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Individual files should not exceed 100 MB when possible</li>
                <li>The total package size should not exceed 1 GB</li>
                <li>For larger submissions, the package can be split into multiple parts</li>
              </ul>
              Our eSTAR builder automatically checks for these limits and warns you if they're exceeded.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Add the FAQ component to the main component
ESTARPackageBuilderComponent.FAQ = ESTARPackageBuilderFAQ;

export default ESTARPackageBuilderComponent;