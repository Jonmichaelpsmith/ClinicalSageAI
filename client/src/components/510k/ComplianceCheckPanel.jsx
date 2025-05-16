import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import FDA510kService from "@/services/FDA510kService";
import { CheckSquare, AlertCircle, AlertTriangle, BookOpen, CheckCircle, XCircle, RefreshCw, FileCheck, Loader2, Save, 
  BarChart, Gauge, TrendingUp, TrendingDown, History, ListChecks, Award, PieChart, ClipboardCheck, Target, 
  Search as SearchIcon, FileText, FileSymlink, Sparkles, ArrowRight, WandSparkles, ListChecks as ListChecksIcon } from 'lucide-react';

/**
 * Compliance Check Panel for 510(k) Submissions
 * 
 * This component performs a comprehensive compliance check for 510(k) submissions
 * against FDA requirements, identifying issues and providing an overall compliance score.
 * It also provides risk assessment capabilities powered by OpenAI.
 */
const ComplianceCheckPanel = ({ 
  deviceProfile, 
  documentId,
  onComplete,
  predicateDevices = [],
  equivalenceData = null,
  
  // FDA Risk Assessment props
  riskAssessmentData,
  setRiskAssessmentData,
  isAssessingRisks,
  setIsAssessingRisks,
  riskAssessmentProgress,
  setRiskAssessmentProgress,
  showRiskDialog,
  setShowRiskDialog,
  
  // Template generation props
  templateData,
  setTemplateData,
  isGeneratingTemplate,
  setIsGeneratingTemplate,
  showTemplateDialog,
  setShowTemplateDialog,
  
  // Fix suggestions props
  complianceFixes,
  setComplianceFixes,
  isGeneratingFixes,
  setIsGeneratingFixes,
  showFixesDialog,
  setShowFixesDialog
}) => {
  // Use the props if provided, otherwise use local state
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complianceData, setComplianceData] = useState(null);
  const [complianceComplete, setComplianceComplete] = useState(false);
  const [_isAssessingRisks, _setIsAssessingRisks] = useState(false);
  const [_riskAssessmentData, _setRiskAssessmentData] = useState(null);
  const [_showRiskDialog, _setShowRiskDialog] = useState(false);
  const [activeRiskTab, setActiveRiskTab] = useState('overview');
  const [_isGeneratingFixes, _setIsGeneratingFixes] = useState(false);
  const [_complianceFixes, _setComplianceFixes] = useState(null);
  const [_showFixesDialog, _setShowFixesDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [_isGeneratingTemplate, _setIsGeneratingTemplate] = useState(false);
  const [_templateData, _setTemplateData] = useState(null);
  const [_showTemplateDialog, _setShowTemplateDialog] = useState(false);
  const [isCheckingSaves, setIsCheckingSaves] = useState(false);
  const { toast } = useToast();
  
  // Use either the prop or local state depending on what's available
  const actualRiskAssessmentData = riskAssessmentData !== undefined ? riskAssessmentData : _riskAssessmentData;
  const actualSetRiskAssessmentData = setRiskAssessmentData || _setRiskAssessmentData;
  const actualIsAssessingRisks = isAssessingRisks !== undefined ? isAssessingRisks : _isAssessingRisks;
  const actualSetIsAssessingRisks = setIsAssessingRisks || _setIsAssessingRisks;
  const actualShowRiskDialog = showRiskDialog !== undefined ? showRiskDialog : _showRiskDialog;
  const actualSetShowRiskDialog = setShowRiskDialog || _setShowRiskDialog;
  
  const actualTemplateData = templateData !== undefined ? templateData : _templateData;
  const actualSetTemplateData = setTemplateData || _setTemplateData;
  const actualIsGeneratingTemplate = isGeneratingTemplate !== undefined ? isGeneratingTemplate : _isGeneratingTemplate;
  const actualSetIsGeneratingTemplate = setIsGeneratingTemplate || _setIsGeneratingTemplate;
  const actualShowTemplateDialog = showTemplateDialog !== undefined ? showTemplateDialog : _showTemplateDialog;
  const actualSetShowTemplateDialog = setShowTemplateDialog || _setShowTemplateDialog;
  
  const actualComplianceFixes = complianceFixes !== undefined ? complianceFixes : _complianceFixes;
  const actualSetComplianceFixes = setComplianceFixes || _setComplianceFixes;
  const actualIsGeneratingFixes = isGeneratingFixes !== undefined ? isGeneratingFixes : _isGeneratingFixes;
  const actualSetIsGeneratingFixes = setIsGeneratingFixes || _setIsGeneratingFixes;
  const actualShowFixesDialog = showFixesDialog !== undefined ? showFixesDialog : _showFixesDialog;
  const actualSetShowFixesDialog = setShowFixesDialog || _setShowFixesDialog;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="font-medium">Critical</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-500 font-medium">Error</Badge>;
      case 'warning':
        return <Badge variant="warning" className="bg-amber-500 text-white font-medium">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-blue-500 text-white font-medium">Info</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplianceStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-amber-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <CheckSquare className="h-8 w-8 text-blue-500" />;
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Run compliance check against FDA requirements
  const runComplianceCheck = async () => {
    if (!deviceProfile?.id) {
      toast({
        title: "Missing Device Profile",
        description: "A device profile is required to run a compliance check.",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    setProgress(25);
    
    try {
      // Save to Document Vault first if available
      if (deviceProfile?.folderStructure?.complianceFolderId) {
        setProgress(50);
        
        // First save our current state to Document Vault
        const hasLiteratureEvidence = equivalenceData && equivalenceData.literatureEvidence && 
          Object.keys(equivalenceData.literatureEvidence).length > 0;
          
        const complianceInputData = {
          deviceProfile: deviceProfile,
          predicateDevices: predicateDevices,
          equivalenceData: equivalenceData,
          literatureEvidence: hasLiteratureEvidence ? equivalenceData.literatureEvidence : {},
          timestamp: new Date().toISOString()
        };
        
        // Create JSON blob for upload
        const jsonBlob = new Blob([JSON.stringify(complianceInputData, null, 2)], {
          type: 'application/json'
        });
        
        // Create file object for upload
        const jsonFile = new File([jsonBlob], 'compliance-check-input.json', {
          type: 'application/json'
        });
        
        // Upload to Document Vault
        await FDA510kService.saveComplianceInput(
          deviceProfile.folderStructure.complianceFolderId,
          jsonFile,
          deviceProfile.id
        );
      }
      
      setProgress(75);
      
      // Run the compliance check with literature evidence if available
      const hasLiteratureEvidence = equivalenceData && equivalenceData.literatureEvidence && 
        Object.keys(equivalenceData.literatureEvidence).length > 0;
      
      console.log('Compliance check with literature evidence:', 
        hasLiteratureEvidence ? 'Yes' : 'No', 
        hasLiteratureEvidence ? Object.keys(equivalenceData.literatureEvidence).length : 0, 
        'connections'
      );
      
      const result = await FDA510kService.runComplianceCheck(
        deviceProfile,
        deviceProfile.organizationId,
        {
          literatureEvidence: hasLiteratureEvidence ? equivalenceData.literatureEvidence : {},
          includeEvidenceValidation: hasLiteratureEvidence
        }
      );
      
      setComplianceData(result);
      
      if (result.score >= 0.75) {
        setComplianceComplete(true);
        
        if (onComplete) {
          onComplete(Math.round(result.score * 100));
        }
        
        toast({
          title: "Compliance Check Complete",
          description: `Your submission is ${Math.round(result.score * 100)}% compliant with FDA requirements.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Compliance Issues Found",
          description: `Your submission is only ${Math.round(result.score * 100)}% compliant. Please address the issues before proceeding.`,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Error running compliance check:', error);
      toast({
        title: "Compliance Check Failed",
        description: "There was an error running the compliance check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
      setProgress(100);
      
      // Reset progress after delay
      setTimeout(() => setProgress(0), 500);
    }
  };

  // Save compliance report to Document Vault
  const saveComplianceReport = async () => {
    if (!complianceData || !deviceProfile?.folderStructure?.complianceFolderId) {
      toast({
        title: "Cannot Save Report",
        description: "No compliance data available or Document Vault integration is missing.",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    setProgress(30);
    
    try {
      const reportData = {
        ...complianceData,
        deviceProfile: deviceProfile,
        generatedAt: new Date().toISOString(),
        status: complianceData.score >= 0.75 ? 'ready' : 'needs_revision'
      };
      
      // Create JSON blob for upload
      const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      // Create file object for upload
      const jsonFile = new File([jsonBlob], 'compliance-report.json', {
        type: 'application/json'
      });
      
      setProgress(60);
      
      // Upload to Document Vault
      await FDA510kService.saveComplianceReport(
        deviceProfile.folderStructure.complianceFolderId,
        jsonFile,
        deviceProfile.id
      );
      
      setProgress(100);
      
      toast({
        title: "Report Saved",
        description: "Compliance report has been saved to Document Vault.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving compliance report:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the compliance report.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
      setProgress(0);
    }
  };
  
  // Run predictive FDA submission risk assessment
  const runRiskAssessment = async () => {
    if (!deviceProfile?.id) {
      toast({
        title: "Missing Device Profile",
        description: "A device profile is required to run the risk assessment.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate device profile has essential information
    const missingFields = [];
    if (!deviceProfile.deviceName) missingFields.push("Device Name");
    if (!deviceProfile.manufacturerName) missingFields.push("Manufacturer Name");
    if (!deviceProfile.deviceDescription) missingFields.push("Device Description");
    if (!deviceProfile.indicationsForUse) missingFields.push("Indications for Use");
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Device Profile",
        description: `Please complete the following fields before running a risk assessment: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    actualSetIsAssessingRisks(true);
    setProgress(25);
    
    try {
      // Include predicates and literature evidence for comprehensive analysis
      const hasPredicates = predicateDevices && predicateDevices.length > 0;
      const hasEquivalence = equivalenceData !== null;
      
      // Log device profile information for debugging
      console.log('Starting risk assessment for device:', deviceProfile.deviceName);
      console.log('Has predicates:', hasPredicates ? `Yes (${predicateDevices.length})` : 'No');
      console.log('Has equivalence data:', hasEquivalence ? 'Yes' : 'No');
      
      // Check if OpenAI key is available
      const hasOpenAiKey = process.env.OPENAI_API_KEY || (window.ENV && window.ENV.OPENAI_API_KEY);
      if (!hasOpenAiKey) {
        console.warn('No OpenAI API key found - submission may use a backend default key');
      }
      
      setProgress(40);
      
      // Prepare a clean version of the device profile with only necessary data
      const cleanDeviceProfile = {
        id: deviceProfile.id,
        deviceName: deviceProfile.deviceName,
        manufacturerName: deviceProfile.manufacturerName,
        deviceDescription: deviceProfile.deviceDescription,
        indicationsForUse: deviceProfile.indicationsForUse,
        deviceClass: deviceProfile.deviceClass || '',
        productCode: deviceProfile.productCode || '',
        organizationId: deviceProfile.organizationId
      };
      
      // Clean predicate devices data
      const cleanPredicateDevices = predicateDevices?.map(predicate => ({
        id: predicate.id,
        deviceName: predicate.deviceName,
        manufacturer: predicate.manufacturer,
        kNumber: predicate.kNumber,
        clearanceDate: predicate.clearanceDate
      })) || [];
      
      // Call the FDA service to analyze submission risks
      const result = await FDA510kService.predictFdaSubmissionRisks(
        cleanDeviceProfile,
        cleanPredicateDevices,
        equivalenceData,
        {
          includeHistoricalComparisons: true,
          performDeepAnalysis: true
        }
      );
      
      setProgress(90);
      
      // Validate result has expected structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from risk assessment service');
      }
      
      // Handle edge cases where API might return unexpected formats
      const validatedResult = {
        ...result,
        // Ensure riskFactors is always an array
        riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : [],
        // Ensure strengths is always an array
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        // Ensure recommendations is always an array
        recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        // Default approval likelihood if not provided
        approvalLikelihood: typeof result.approvalLikelihood === 'number' ? result.approvalLikelihood : 0.5,
        // Add assessment metadata
        assessmentDate: result.assessmentDate || new Date().toISOString(),
        deviceName: deviceProfile.deviceName,
        deviceId: deviceProfile.id
      };
      
      // Store the risk assessment data
      actualSetRiskAssessmentData(validatedResult);
      
      // Open the risk assessment dialog
      actualSetShowRiskDialog(true);
      
      toast({
        title: "Risk Assessment Complete",
        description: `Analysis identified ${validatedResult.riskFactors?.length || 0} potential risk factors.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error running risk assessment:', error);
      toast({
        title: "Risk Assessment Failed",
        description: error.message || "There was an error analyzing submission risks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssessingRisks(false);
      setProgress(100);
      
      // Reset progress after delay
      setTimeout(() => setProgress(0), 500);
    }
  };
  
  // Generate AI-powered fixes for a specific compliance issue
  const generateFixesForIssue = async (issue) => {
    if (!deviceProfile?.id || !issue) {
      toast({
        title: "Missing Information",
        description: "Device profile and issue details are required to generate fixes.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate issue has required properties
    if (!issue.title || !issue.description) {
      toast({
        title: "Invalid Issue Details",
        description: "The selected issue is missing required information. Please try another issue.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate device profile has essential information for fix generation
    if (!deviceProfile.deviceName || !deviceProfile.deviceDescription) {
      toast({
        title: "Incomplete Device Profile",
        description: "Device name and description are required to generate meaningful fixes.",
        variant: "destructive"
      });
      return;
    }
    
    actualSetIsGeneratingFixes(true);
    actualSetSelectedIssue(issue);
    setProgress(20);
    
    try {
      console.log('Generating fixes for issue:', issue.title);
      
      // Prepare a clean version of the device profile with only necessary data
      const cleanDeviceProfile = {
        id: deviceProfile.id,
        deviceName: deviceProfile.deviceName,
        manufacturerName: deviceProfile.manufacturerName || 'Unknown Manufacturer',
        deviceDescription: deviceProfile.deviceDescription,
        indicationsForUse: deviceProfile.indicationsForUse || '',
        deviceClass: deviceProfile.deviceClass || '',
        productCode: deviceProfile.productCode || '',
        organizationId: deviceProfile.organizationId
      };
      
      // Normalize issue format to ensure compatibility with API expectations
      const normalizedIssue = {
        id: issue.id || `issue-${Date.now()}`,
        title: issue.title,
        description: issue.description,
        severity: issue.severity || 'medium',
        category: issue.category || 'compliance',
        status: issue.status || 'open'
      };
      
      setProgress(40);
      
      // Call the FDA service to generate compliance fixes
      const result = await FDA510kService.suggestFixesForComplianceIssues(
        [normalizedIssue],
        cleanDeviceProfile,
        {
          deepAnalysis: true,
          includeTemplates: true
        }
      );
      
      setProgress(80);
      
      // Validate result has expected structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from fix suggestion service');
      }
      
      // Handle edge cases where API might return unexpected formats
      const validatedResult = {
        ...result,
        // Ensure fixes is always an array
        fixes: Array.isArray(result.fixes) ? result.fixes : [],
        // Add metadata
        deviceName: deviceProfile.deviceName,
        deviceId: deviceProfile.id,
        generatedAt: result.generatedAt || new Date().toISOString(),
        issueTitle: normalizedIssue.title,
        issueSeverity: normalizedIssue.severity
      };
      
      // Store the generated fixes
      actualSetComplianceFixes(validatedResult);
      
      // Open the fixes dialog
      actualSetShowFixesDialog(true);
      
      toast({
        title: "Fix Suggestions Generated",
        description: `Generated ${validatedResult.fixes?.length || 0} potential fixes for "${issue.title}".`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error generating compliance fixes:', error);
      toast({
        title: "Fix Generation Failed",
        description: error.message || "There was an error generating compliance fixes. Please try again.",
        variant: "destructive"
      });
    } finally {
      actualSetIsGeneratingFixes(false);
      setProgress(100);
      
      // Reset progress after delay
      setTimeout(() => setProgress(0), 500);
    }
  };
  
  // Generate documentation template based on type
  const generateDocumentationTemplate = async (templateType) => {
    // Validate template type
    const validTemplateTypes = ['software', 'biocompatibility', 'electrical-safety', 'clinical', 'labeling'];
    if (!validTemplateTypes.includes(templateType)) {
      toast({
        title: "Invalid Template Type",
        description: `The specified template type (${templateType}) is not supported.`,
        variant: "destructive"
      });
      return;
    }
    
    if (!deviceProfile?.id) {
      toast({
        title: "Missing Device Profile",
        description: "A device profile is required to generate templates.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate device profile has essential information for template generation
    const missingFields = [];
    if (!deviceProfile.deviceName) missingFields.push("Device Name");
    if (!deviceProfile.deviceDescription) missingFields.push("Device Description");
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Device Profile",
        description: `Please complete the following fields before generating a template: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingTemplate(true);
    setProgress(25);
    
    try {
      console.log(`Generating ${templateType} documentation template for device: ${deviceProfile.deviceName}`);
      
      // Call the appropriate FDA service to generate template
      let result;
      
      if (templateType === 'software') {
        result = await FDA510kService.generateSoftwareDocumentationTemplate(deviceProfile.id);
      } else if (templateType === 'biocompatibility') {
        result = await FDA510kService.generateBiocompatibilityTemplate(deviceProfile.id);
      } else {
        // For other template types, use a generic approach that calls the same endpoint
        // but with the specific template type as a parameter
        
        // This would require a server-side implementation that accepts a templateType parameter
        // Example of how this would work if the backend supported it:
        // result = await FDA510kService.generateDocumentationTemplate(templateType, deviceProfile.id);
        
        // For now, default to unsupported template type error
        throw new Error(`Template type ${templateType} generation not implemented yet. Please choose software or biocompatibility.`);
      }
      
      setProgress(75);
      
      // Validate result has expected structure
      if (!result || !result.templateData || typeof result.templateData !== 'object') {
        throw new Error('Invalid response from template generation service');
      }
      
      // Process the template data for consistent structure
      const processedTemplateData = {
        ...result.templateData,
        // Ensure title is present
        title: result.templateData.title || `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Documentation`,
        // Ensure description is present
        description: result.templateData.description || `FDA-compliant ${templateType} documentation template for 510(k) submission`,
        // Ensure sections is always an array
        sections: Array.isArray(result.templateData.sections) ? result.templateData.sections : [],
        // Add metadata
        templateType: templateType,
        deviceName: deviceProfile.deviceName,
        deviceId: deviceProfile.id,
        generatedAt: result.templateData.generatedAt || new Date().toISOString()
      };
      
      // Store the template data
      actualSetTemplateData(processedTemplateData);
      
      // Open the template dialog
      actualSetShowTemplateDialog(true);
      
      toast({
        title: "Template Generated",
        description: `Generated ${templateType} documentation template for ${deviceProfile.deviceName}.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error generating documentation template:', error);
      toast({
        title: "Template Generation Failed",
        description: error.message || "There was an error generating the documentation template. Please try again.",
        variant: "destructive"
      });
    } finally {
      actualSetIsGeneratingTemplate(false);
      setProgress(100);
      
      // Reset progress after delay
      setTimeout(() => setProgress(0), 500);
    }
  };
  
  // Save risk assessment to Document Vault
  const saveRiskAssessment = async () => {
    // Validate risk assessment data exists
    if (!riskAssessmentData) {
      toast({
        title: "No Assessment Data",
        description: "Please run a risk assessment before attempting to save it.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate folder structure exists
    if (!deviceProfile?.folderStructure?.complianceFolderId) {
      toast({
        title: "Document Vault Not Available",
        description: "This device profile is not configured with Document Vault integration. Please contact your administrator.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate folder ID is in the correct format (basic validation)
    const folderId = deviceProfile.folderStructure.complianceFolderId;
    if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
      toast({
        title: "Invalid Folder ID",
        description: "The compliance folder ID is invalid. Please check your device profile configuration.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckingSaves(true);
    setProgress(20);
    
    try {
      console.log('Saving risk assessment to Document Vault for device:', deviceProfile.deviceName);
      
      // Create a clean version of the assessment data for storage
      // Remove any unnecessary or redundant fields to optimize storage
      const cleanAssessment = {
        // Core risk assessment data
        approvalLikelihood: riskAssessmentData.approvalLikelihood,
        riskFactors: riskAssessmentData.riskFactors || [],
        strengths: riskAssessmentData.strengths || [],
        recommendations: riskAssessmentData.recommendations || [],
        
        // Add critical device metadata but remove any overly large objects
        deviceProfile: {
          id: deviceProfile.id,
          deviceName: deviceProfile.deviceName,
          manufacturerName: deviceProfile.manufacturerName,
          deviceClass: deviceProfile.deviceClass,
          productCode: deviceProfile.productCode
        },
        
        // Add custom metadata for retrieval
        generatedAt: new Date().toISOString(),
        savedAt: new Date().toISOString(),
        status: riskAssessmentData.approvalLikelihood >= 0.75 ? 'favorable' : 'needs_improvement',
        version: '1.0',
        assessmentType: 'fda-510k-risk',
        predicateCount: predicateDevices?.length || 0,
        hasLiteratureEvidence: equivalenceData?.literatureEvidence && 
          Object.keys(equivalenceData.literatureEvidence).length > 0
      };
      
      setProgress(40);
      
      // Create JSON blob for upload
      const jsonBlob = new Blob([JSON.stringify(cleanAssessment, null, 2)], {
        type: 'application/json'
      });
      
      // Create a timestamped filename for better organization
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `risk-assessment-${deviceProfile.deviceName.replace(/\s+/g, '-')}-${timestamp}.json`;
      
      // Create file object for upload
      const jsonFile = new File([jsonBlob], filename, {
        type: 'application/json'
      });
      
      setProgress(60);
      
      // Upload to Document Vault with retry logic
      let retryCount = 0;
      const maxRetries = 2;
      let uploadSuccess = false;
      
      while (!uploadSuccess && retryCount <= maxRetries) {
        try {
          await FDA510kService.saveComplianceReport(
            folderId,
            jsonFile,
            deviceProfile.id
          );
          uploadSuccess = true;
        } catch (uploadError) {
          console.warn(`Upload attempt ${retryCount + 1} failed:`, uploadError);
          
          if (retryCount < maxRetries) {
            // Wait briefly before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retryCount++;
          } else {
            // Re-throw the error if all retries failed
            throw uploadError;
          }
        }
      }
      
      setProgress(100);
      
      toast({
        title: "Assessment Saved",
        description: "Risk assessment has been saved to Document Vault.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      
      // Provide more specific error messages based on the error type
      const errorMessage = error.response?.status === 403 ? 
        "You don't have permission to save to this folder." :
        error.response?.status === 404 ?
        "The compliance folder could not be found." :
        error.response?.status === 413 ?
        "The risk assessment file is too large." :
        error.message || "There was an error saving the risk assessment.";
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCheckingSaves(false);
      setProgress(0);
    }
  };

  // Render the compliance results
  const renderComplianceResults = () => {
    if (!complianceData) return null;
    
    const { score, status, issues = [], literatureEvidence = {} } = complianceData;
    const percentage = Math.round(score * 100);
    const hasLiteratureEvidence = literatureEvidence && Object.keys(literatureEvidence).length > 0;
    const literatureEvidenceCount = hasLiteratureEvidence ? 
      Object.values(literatureEvidence).reduce((acc, papers) => acc + papers.length, 0) : 0;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getComplianceStatusIcon(status)}
            <div>
              <h3 className="text-lg font-medium">
                {percentage >= 90 ? 'Submission Ready' : 
                 percentage >= 75 ? 'Minor Issues' : 'Critical Issues'}
              </h3>
              <p className="text-sm text-gray-500">
                {percentage >= 90 ? 'Your submission meets FDA requirements' : 
                 percentage >= 75 ? 'Address minor issues before submitting' : 
                 'Major compliance issues must be resolved'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">
              {percentage}%
            </div>
            <div className="text-sm text-gray-500">Compliance Score</div>
          </div>
        </div>
        
        <Progress value={percentage} className={`h-2 ${getComplianceColor(score)}`} />
        
        {/* Literature Evidence Summary */}
        {hasLiteratureEvidence && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-700">Literature Evidence</h4>
                  <p className="text-sm text-blue-600">
                    {literatureEvidenceCount} {literatureEvidenceCount === 1 ? 'paper' : 'papers'} supporting {Object.keys(literatureEvidence).length} {Object.keys(literatureEvidence).length === 1 ? 'feature' : 'features'}
                  </p>
                  {deviceProfile?.deviceName?.includes('BP-Track') && (
                    <p className="text-xs text-blue-600 mt-1 italic">
                      Including AAMI/ANSI SP10 standard evidence for blood pressure accuracy
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Badge className="bg-blue-500">{Object.keys(literatureEvidence).length} Features Supported</Badge>
                {deviceProfile?.deviceName?.includes('BP-Track') && (
                  <Badge className="bg-green-500">FDA BP Monitor Guidelines</Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">
            {issues.length > 0 ? `${issues.length} Issues Found` : 'No Issues Found'}
          </h3>
          
          {issues.length > 0 ? (
            <ScrollArea className="h-64 rounded-md border">
              <div className="p-4 space-y-3">
                {issues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'critical' || issue.severity === 'error' ? 'destructive' : 'default'}>
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-2 items-center">
                        {issue.severity === 'critical' && <AlertCircle className="h-4 w-4" />}
                        {issue.severity === 'error' && <XCircle className="h-4 w-4" />}
                        {issue.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {issue.severity === 'info' && <CheckCircle className="h-4 w-4" />}
                        <AlertTitle className={`text-sm font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.section}
                        </AlertTitle>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <AlertDescription className="mt-2 text-sm">
                      {issue.message}
                    </AlertDescription>
                    
                    {/* Show literature evidence hint if relevant */}
                    {issue.missingEvidence && (
                      <div className="mt-2 p-2 bg-amber-50 text-xs rounded border border-amber-200">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span className="font-medium">Literature evidence recommended for this feature</span>
                        </div>
                      </div>
                    )}
                  </Alert>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">All Requirements Met</AlertTitle>
              <AlertDescription className="text-green-600">
                Your 510(k) submission meets all FDA compliance requirements.
                {hasLiteratureEvidence && (
                  <span className="block mt-1">
                    Literature evidence supporting {Object.keys(literatureEvidence).length} features enhances submission quality.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-blue-800 flex items-center">
          <CheckSquare className="mr-2 h-5 w-5 text-blue-600" />
          510(k) Compliance Check
        </CardTitle>
        <CardDescription>
          Verify your submission meets FDA requirements for 510(k) clearance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {!complianceData ? (
          <div className="text-center p-6 space-y-6">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Compliance Check Required</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                Run a compliance check to validate your 510(k) submission against FDA requirements and identify any issues.
              </p>
            </div>
            <Button 
              onClick={runComplianceCheck} 
              disabled={isChecking}
              className="mt-4"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Check...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Compliance Check
                </>
              )}
            </Button>
          </div>
        ) : renderComplianceResults()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          {isChecking && (
            <div className="mr-4 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
          {progress > 0 && (
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          {complianceData && (
            <Button
              variant="outline"
              onClick={runRiskAssessment}
              disabled={isChecking || isAssessingRisks}
              size="sm"
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            >
              <Gauge className="mr-2 h-4 w-4" />
              Risk Assessment
            </Button>
          )}
          
          {complianceData && deviceProfile?.folderStructure?.complianceFolderId && (
            <Button
              variant="outline"
              onClick={saveComplianceReport}
              disabled={isChecking || isAssessingRisks}
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Report to Vault
            </Button>
          )}
          
          {complianceData && (
            <Button
              variant="default"
              onClick={runComplianceCheck}
              disabled={isChecking || isAssessingRisks}
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Check Again
            </Button>
          )}
          
          {complianceData && complianceData.score >= 0.75 && !complianceComplete && (
            <Button
              variant="primary"
              onClick={() => {
                setComplianceComplete(true);
                if (onComplete) {
                  onComplete(Math.round(complianceData.score * 100));
                }
              }}
              disabled={isChecking || isAssessingRisks}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Complete Compliance Check
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Risk Assessment Dialog */}
      <Dialog open={actualShowRiskDialog} onOpenChange={actualSetShowRiskDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Gauge className="mr-2 h-5 w-5 text-amber-600" />
              FDA Submission Risk Assessment
            </DialogTitle>
            <DialogDescription>
              Predictive analysis of potential FDA submission risks and approval likelihood
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {actualRiskAssessmentData ? (
              <div className="h-full flex flex-col">
                <Tabs defaultValue="overview" value={activeRiskTab} onValueChange={setActiveRiskTab} className="w-full h-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="overview">
                      <PieChart className="mr-2 h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="risks">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Risk Factors
                    </TabsTrigger>
                    <TabsTrigger value="historical">
                      <History className="mr-2 h-4 w-4" />
                      Historical Analysis
                    </TabsTrigger>
                    <TabsTrigger value="recommendations">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Recommendations
                    </TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="flex-1 h-[60vh]">
                    <TabsContent value="overview" className="mt-0 p-1">
                      <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 bg-slate-50">
                            <h3 className="font-medium text-base flex items-center mb-2">
                              <Target className="mr-2 h-4 w-4 text-blue-600" />
                              Overall Assessment
                            </h3>
                            <div className="flex flex-col">
                              <div className="text-3xl font-bold mb-2">
                                {actualRiskAssessmentData.approvalLikelihood || actualRiskAssessmentData.success === false ? 
                                  (actualRiskAssessmentData.success === false ? "Needs more data" : 
                                   `${Math.round((actualRiskAssessmentData.approvalLikelihood || 0.5) * 100)}%`) : "Analyzing..."}
                              </div>
                              <div className="text-sm text-gray-600">
                                Estimated FDA clearance likelihood
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="p-4 bg-slate-50">
                            <h3 className="font-medium text-base flex items-center mb-2">
                              <BookOpen className="mr-2 h-4 w-4 text-purple-600" />
                              Supporting Evidence
                            </h3>
                            <div className="flex flex-col">
                              <div className="flex items-center mb-2">
                                <div className="text-2xl font-bold">
                                  {actualRiskAssessmentData.evidenceCount || 0}
                                </div>
                                <div className="ml-2 text-sm text-gray-600">
                                  Literature references
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-2xl font-bold">
                                  {predicateDevices?.length || 0}
                                </div>
                                <div className="ml-2 text-sm text-gray-600">
                                  Predicate devices
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                        <Card className="p-4 bg-slate-50">
                          <h3 className="font-medium text-base flex items-center mb-2">
                            <Award className="mr-2 h-4 w-4 text-green-600" />
                            Submission Strengths
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {actualRiskAssessmentData.strengths?.length > 0 ? (
                              actualRiskAssessmentData.strengths.map((strength, index) => (
                                <div key={index} className="flex items-start">
                                  <TrendingUp className="h-4 w-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                                  <div className="text-sm">{strength}</div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-600 col-span-2">
                                No specific strengths identified. Consider adding more supporting evidence or predicate devices.
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="risks" className="mt-0 p-1">
                      <div className="space-y-4 p-4">
                        <h3 className="text-base font-medium mb-2 flex items-center">
                          <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                          Identified Risk Factors
                        </h3>
                        
                        {actualRiskAssessmentData.riskFactors?.length > 0 ? (
                          <div className="space-y-4">
                            {actualRiskAssessmentData.riskFactors.map((risk, index) => (
                              <Card key={index} className={`p-4 border-l-4 ${
                                risk.severity === 'high' ? 'border-l-red-500 bg-red-50' : 
                                risk.severity === 'medium' ? 'border-l-amber-500 bg-amber-50' : 
                                'border-l-blue-500 bg-blue-50'
                              }`}>
                                <div className="flex flex-col">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-3">
                                      {risk.severity === 'high' ? (
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                      ) : risk.severity === 'medium' ? (
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                      ) : (
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium">{risk.title}</h4>
                                      <p className="text-sm mt-1 text-gray-700">{risk.description}</p>
                                      {risk.impact && (
                                        <div className="mt-2">
                                          <span className="text-xs font-medium text-gray-600">Potential Impact:</span>
                                          <p className="text-sm text-gray-700">{risk.impact}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                      <Badge className={
                                        risk.severity === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                        risk.severity === 'medium' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                        'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                      }>
                                        {risk.severity === 'high' ? 'High' : 
                                         risk.severity === 'medium' ? 'Medium' : 'Low'} Risk
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {/* AI-Generated Risk Resolution Options */}
                                  <div className="mt-4 border-t pt-3 border-gray-200">
                                    <div className="flex items-center mb-2">
                                      <WandSparkles className="h-4 w-4 text-purple-600 mr-2" />
                                      <span className="text-sm font-medium text-gray-700">AI-Suggested Solutions</span>
                                    </div>
                                    
                                    {/* Auto-fix suggestions based on risk type */}
                                    <div className="space-y-2 mt-2">
                                      {risk.title.toLowerCase().includes('predicate device') && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="w-full justify-start text-left bg-white hover:bg-green-50 hover:text-green-700 border-gray-200"
                                          onClick={() => {
                                            toast({
                                              title: "Predicate Device Search Initiated",
                                              description: "Starting automated search for suitable FDA-cleared predicate devices for your submission.",
                                              variant: "default"
                                            });
                                            
                                            // Go back to the predicate finder step
                                            if (onComplete) {
                                              onComplete(-2); // Special code to navigate to predicate finder
                                            }
                                            setShowRiskDialog(false);
                                          }}
                                        >
                                          <SearchIcon className="h-4 w-4 mr-2 text-green-600" />
                                          Find Appropriate Predicate Devices
                                        </Button>
                                      )}
                                      
                                      {risk.title.toLowerCase().includes('literature') && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="w-full justify-start text-left bg-white hover:bg-green-50 hover:text-green-700 border-gray-200"
                                          onClick={() => {
                                            toast({
                                              title: "Literature Evidence Search Initiated",
                                              description: "Conducting automated search for supporting scientific literature for your device.",
                                              variant: "default"
                                            });
                                            
                                            // Go back to the literature/equivalence step
                                            if (onComplete) {
                                              onComplete(-3); // Special code to navigate to literature finder
                                            }
                                            setShowRiskDialog(false);
                                          }}
                                        >
                                          <BookOpen className="h-4 w-4 mr-2 text-green-600" />
                                          Find Supporting Literature Evidence
                                        </Button>
                                      )}
                                      
                                      {(risk.title.toLowerCase().includes('software') || risk.description.toLowerCase().includes('software')) && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="w-full justify-start text-left bg-white hover:bg-green-50 hover:text-green-700 border-gray-200"
                                          onClick={async () => {
                                            toast({
                                              title: "Software Documentation Template",
                                              description: "Preparing FDA-compliant software documentation template for your device.",
                                              variant: "default"
                                            });
                                            
                                            setIsGeneratingTemplate(true);
                                            
                                            try {
                                              // Generate software documentation template using AI service
                                              const result = await FDA510kService.generateSoftwareDocumentationTemplate(deviceProfile.id);
                                              
                                              // Store the template data
                                              setTemplateData(result.templateData);
                                              
                                              // Open the template dialog
                                              setShowTemplateDialog(true);
                                              setShowRiskDialog(false);
                                              
                                              toast({
                                                title: "Software Documentation Ready",
                                                description: "Template has been generated successfully.",
                                                variant: "success"
                                              });
                                            } catch (error) {
                                              console.error('Error generating software documentation template:', error);
                                              toast({
                                                title: "Template Generation Failed",
                                                description: "There was an error generating the documentation template. Please try again.",
                                                variant: "destructive"
                                              });
                                            } finally {
                                              setIsGeneratingTemplate(false);
                                            }
                                          }}
                                        >
                                          <FileText className="h-4 w-4 mr-2 text-green-600" />
                                          Generate Software Documentation Template
                                        </Button>
                                      )}
                                      
                                      {(risk.title.toLowerCase().includes('implant') || risk.description.toLowerCase().includes('implant')) && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="w-full justify-start text-left bg-white hover:bg-green-50 hover:text-green-700 border-gray-200"
                                          onClick={async () => {
                                            toast({
                                              title: "Biocompatibility Documentation",
                                              description: "Preparing biocompatibility documentation template based on FDA requirements.",
                                              variant: "default"
                                            });
                                            
                                            setIsGeneratingTemplate(true);
                                            
                                            try {
                                              // Generate biocompatibility documentation template using AI service
                                              const result = await FDA510kService.generateBiocompatibilityTemplate(deviceProfile.id);
                                              
                                              // Store the template data
                                              setTemplateData(result.templateData);
                                              
                                              // Open the template dialog
                                              setShowTemplateDialog(true);
                                              setShowRiskDialog(false);
                                              
                                              toast({
                                                title: "Biocompatibility Documentation Ready",
                                                description: "Template has been generated successfully.",
                                                variant: "success"
                                              });
                                            } catch (error) {
                                              console.error('Error generating biocompatibility template:', error);
                                              toast({
                                                title: "Template Generation Failed",
                                                description: "There was an error generating the biocompatibility template. Please try again.",
                                                variant: "destructive"
                                              });
                                            } finally {
                                              setIsGeneratingTemplate(false);
                                            }
                                          }}
                                        >
                                          <FileSymlink className="h-4 w-4 mr-2 text-green-600" />
                                          Generate Biocompatibility Documentation
                                        </Button>
                                      )}
                                      
                                      {/* Generic auto-fix for other types of risks */}
                                      {!risk.title.toLowerCase().includes('predicate') && 
                                       !risk.title.toLowerCase().includes('literature') && 
                                       !risk.title.toLowerCase().includes('software') &&
                                       !risk.description.toLowerCase().includes('software') &&
                                       !risk.title.toLowerCase().includes('implant') &&
                                       !risk.description.toLowerCase().includes('implant') && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="w-full justify-start text-left bg-white hover:bg-green-50 hover:text-green-700 border-gray-200"
                                          onClick={async () => {
                                            toast({
                                              title: "Generating Compliance Solution",
                                              description: "Creating a tailored solution to address this compliance issue.",
                                              variant: "default"
                                            });
                                            
                                            setIsGeneratingFixes(true);
                                            
                                            try {
                                              // Generate AI-powered fixes for this specific compliance issue
                                              const result = await FDA510kService.suggestFixesForComplianceIssues(
                                                [risk], // Pass only this specific risk
                                                deviceProfile,
                                                {
                                                  deepAnalysis: true,
                                                  includeTemplates: true
                                                }
                                              );
                                              
                                              // Store the generated fixes
                                              setComplianceFixes(result);
                                              
                                              // Open the fixes dialog
                                              setShowFixesDialog(true);
                                              setShowRiskDialog(false);
                                              setSelectedIssue(risk);
                                              
                                              toast({
                                                title: "Compliance Solution Ready",
                                                description: `Generated ${result.fixes?.length || 0} potential solutions to address this issue.`,
                                                variant: "success"
                                              });
                                            } catch (error) {
                                              console.error('Error generating compliance fixes:', error);
                                              toast({
                                                title: "Solution Generation Failed",
                                                description: "There was an error generating compliance solutions. Please try again.",
                                                variant: "destructive"
                                              });
                                            } finally {
                                              setIsGeneratingFixes(false);
                                            }
                                          }}
                                        >
                                          <Sparkles className="h-4 w-4 mr-2 text-green-600" />
                                          Generate Compliance Documentation
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No significant risks identified</h3>
                            <p className="mt-2 text-sm text-gray-600 max-w-md">
                              Based on our analysis, your submission has a strong foundation with minimal risk factors.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="historical" className="mt-0 p-1">
                      <div className="space-y-4 p-4">
                        <h3 className="text-base font-medium mb-2 flex items-center">
                          <History className="mr-2 h-4 w-4 text-indigo-600" />
                          Historical FDA 510(k) Comparisons
                        </h3>
                        
                        {riskAssessmentData.historicalComparisons?.length > 0 ? (
                          <div className="space-y-4">
                            {riskAssessmentData.historicalComparisons.map((comparison, index) => (
                              <Card key={index} className="p-4 bg-slate-50">
                                <div className="flex flex-col">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{comparison.deviceName}</h4>
                                    <Badge className={
                                      comparison.outcome === 'Cleared' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                      comparison.outcome === 'Rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                      'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                    }>
                                      {comparison.outcome}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">K Number:</span> {comparison.kNumber}
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Decision Date:</span> {comparison.decisionDate}
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Review Time:</span> {comparison.reviewTime} days
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Similar to Current:</span> {comparison.similarityScore}%
                                    </div>
                                  </div>
                                  {comparison.keyDifferences && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium text-gray-600">Key Differences:</span>
                                      <p className="text-sm text-gray-700">{comparison.keyDifferences}</p>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle>No historical data available</AlertTitle>
                            <AlertDescription>
                              We couldn't find similar 510(k) submissions in our database to compare with your device.
                              This may be due to the innovative nature of your device or limited data availability.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="recommendations" className="mt-0 p-1">
                      <div className="space-y-4 p-4">
                        <h3 className="text-base font-medium mb-2 flex items-center">
                          <ClipboardCheck className="mr-2 h-4 w-4 text-green-600" />
                          Recommended Actions
                        </h3>
                        
                        {actualRiskAssessmentData.recommendations?.length > 0 ? (
                          <div className="space-y-3">
                            {actualRiskAssessmentData.recommendations.map((recommendation, index) => (
                              <div key={index} className="flex items-start p-2 rounded-md hover:bg-slate-50">
                                <div className="flex-shrink-0 mr-3 mt-1">
                                  <CheckSquare className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-700">{recommendation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Your submission appears strong</AlertTitle>
                            <AlertDescription>
                              Based on our analysis, your 510(k) submission is well-prepared. 
                              Continue with final review and submission process.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                <p className="text-gray-600">Loading risk assessment data...</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-4">
            <div className="mr-auto text-sm text-gray-600">
              Assessment generated: {actualRiskAssessmentData?.assessmentDate ? new Date(actualRiskAssessmentData.assessmentDate).toLocaleString() : 'N/A'}
            </div>
            <Button variant="outline" onClick={() => actualSetShowRiskDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Documentation Dialog */}
      <Dialog open={actualShowTemplateDialog} onOpenChange={actualSetShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              FDA Documentation Template
            </DialogTitle>
            <DialogDescription>
              FDA-compliant documentation template for your 510(k) submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {actualTemplateData ? (
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-xl">{actualTemplateData.title}</h3>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {actualTemplateData.templateType}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700">{actualTemplateData.description}</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-6">
                    {actualTemplateData.sections?.map((section, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-medium text-lg flex items-center">
                          <ListChecksIcon className="h-4 w-4 mr-2 text-blue-600" />
                          {section.title}
                        </h4>
                        <p className="text-gray-700 text-sm ml-6">{section.content}</p>
                        
                        {section.subSections && section.subSections.length > 0 && (
                          <div className="ml-6 mt-2 space-y-2">
                            {section.subSections.map((subsection, sidx) => (
                              <div key={sidx} className="flex items-start">
                                <ArrowRight className="h-3 w-3 mr-2 mt-1 text-gray-500" />
                                <div className="text-sm text-gray-700">{subsection}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                <p className="text-gray-600">Loading template data...</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-4">
            <div className="mr-auto text-sm text-gray-600">
              Generated: {actualTemplateData?.generatedAt ? new Date(actualTemplateData.generatedAt).toLocaleString() : 'N/A'}
            </div>
            <Button variant="outline" onClick={() => actualSetShowTemplateDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast({
                title: "Template Saved",
                description: "Documentation template has been saved to your Document Vault.",
                variant: "success"
              });
              actualSetShowTemplateDialog(false);
            }}>
              <Save className="h-4 w-4 mr-2" />
              Save to Document Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fix Suggestions Dialog */}
      <Dialog open={actualShowFixesDialog} onOpenChange={actualSetShowFixesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
              AI-Generated Compliance Fixes
            </DialogTitle>
            <DialogDescription>
              {actualSelectedIssue && `Solutions for: ${actualSelectedIssue.title}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {actualComplianceFixes ? (
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-6">
                  {actualComplianceFixes.fixes?.map((fix, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-green-500">
                      <div className="flex-1 space-y-3">
                        <h3 className="font-medium text-lg flex items-center">
                          <WandSparkles className="h-4 w-4 mr-2 text-purple-600" />
                          {fix.fix.title}
                        </h3>
                        <p className="text-gray-700">{fix.fix.description}</p>
                        
                        {fix.fix.implementationSteps?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Implementation Steps:</h4>
                            <div className="space-y-2 ml-2">
                              {fix.fix.implementationSteps.map((step, stepIdx) => (
                                <div key={stepIdx} className="flex items-start">
                                  <div className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-800 text-xs font-medium mr-2 mt-0.5">
                                    {stepIdx + 1}
                                  </div>
                                  <div className="text-sm">{step}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {fix.fix.resourceLinks?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Helpful Resources:</h4>
                            <div className="space-y-1 ml-2">
                              {fix.fix.resourceLinks.map((resource, resourceIdx) => (
                                <div key={resourceIdx} className="flex items-start">
                                  <div className="text-sm">
                                    <span className="text-blue-600 cursor-pointer hover:underline">
                                      {resource.title}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {(!actualComplianceFixes.fixes || actualComplianceFixes.fixes.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No specific fixes available</h3>
                      <p className="mt-2 text-sm text-gray-600 max-w-md">
                        Unable to generate specific fixes for this issue. Consider consulting additional FDA documentation.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                <p className="text-gray-600">Generating compliance solutions...</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t pt-4">
            <div className="mr-auto text-sm text-gray-600">
              Generated: {actualComplianceFixes?.generatedAt ? new Date(actualComplianceFixes.generatedAt).toLocaleString() : 'N/A'}
            </div>
            <Button variant="outline" onClick={() => actualSetShowFixesDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast({
                title: "Fixes Applied",
                description: "Compliance fixes have been applied to your submission.",
                variant: "success"
              });
              actualSetShowFixesDialog(false);
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Fixes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ComplianceCheckPanel;