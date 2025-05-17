/**
 * DocumentIntakePanel.jsx
 * 
 * This component integrates with CERV2Page.jsx's existing OCR capabilities to provide
 * advanced document intelligence features. It doesn't handle the initial file upload
 * and OCR (which CERV2Page already does), but focuses on AI-based extraction configuration
 * and review of extracted data.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

/**
 * DocumentIntakePanel component
 * 
 * @param {Object} props Component properties
 * @param {Array} props.processedDocuments - Array of documents already OCR'd by CERV2Page
 * @param {Function} props.onStartAiExtraction - Callback for starting AI extraction
 * @param {Function} props.onExtractedDataApplied - Callback when extracted data is applied to the device profile
 * @param {Object} props.deviceProfile - Current device profile data (for context)
 */
const DocumentIntakePanel = ({
  processedDocuments = [],
  onStartAiExtraction,
  onExtractedDataApplied,
  deviceProfile
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('extract_config');
  const [documentSettings, setDocumentSettings] = useState({});
  
  const [selectedRegulatoryContext, setSelectedRegulatoryContext] = useState('fda_510k');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [extractionMode, setExtractionMode] = useState('full');
  
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isApplyingData, setIsApplyingData] = useState(false);
  const [hasAppliedData, setHasAppliedData] = useState(false);
  const [extractionHistory, setExtractionHistory] = useState([]);

  // Initialize document settings when processed documents change
  useEffect(() => {
    const initialSettings = {};
    processedDocuments.forEach(doc => {
      initialSettings[doc.id] = ''; // Default to no specific type selected
    });
    setDocumentSettings(initialSettings);
  }, [processedDocuments]);

  // Handle regulatory context change
  const handleRegulatoryContextChange = (value) => {
    setSelectedRegulatoryContext(value);
    // Reset individual document types when global context changes
    const newSettings = {};
    processedDocuments.forEach(doc => {
      newSettings[doc.id] = '';
    });
    setDocumentSettings(newSettings);
  };

  // Handle document type change for a specific document
  const handleDocumentTypeChange = (docId, type) => {
    setDocumentSettings(prev => ({ ...prev, [docId]: type }));
  };

  // Initiate AI extraction
  const handleInitiateExtraction = async () => {
    if (processedDocuments.length === 0) {
      toast({
        title: "No Documents Available",
        description: "No documents have been processed for AI extraction.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExtracting(true);
      
      // Prepare documents for extraction
      const documentsToExtract = processedDocuments.map(doc => ({
        ...doc,
        selectedDocumentType: documentSettings[doc.id] || 'auto_detect',
      }));

      // Create extraction config
      const extractionConfig = {
        regulatoryContext: selectedRegulatoryContext,
        confidenceThreshold: confidenceThreshold / 100, // Convert to 0-1 range
        extractionMode,
        documents: documentsToExtract,
      };
      
      console.log('Starting AI Extraction with config:', extractionConfig);
      
      // Call the extraction service
      if (onStartAiExtraction) {
        const extractedData = await onStartAiExtraction(extractionConfig);
        setExtractedData(extractedData);
        setHasAppliedData(false);
        
        // Add to extraction history
        const historyEntry = {
          id: `extraction-${Date.now()}`,
          timestamp: new Date().toISOString(),
          documentTypes: extractionConfig.documents.map(d => d.selectedDocumentType),
          confidence: extractedData.overallConfidence || 0,
          fieldCount: extractedData.extractedFields?.length || 0
        };
        
        setExtractionHistory(prev => [historyEntry, ...prev]);
        
        // Switch to review tab
        setActiveTab('review');
        
        toast({
          title: "AI Extraction Complete",
          description: `Successfully extracted ${extractedData.extractedFields?.length || 0} fields from document(s)`,
          variant: "default",
        });
      } else {
        console.warn('onStartAiExtraction prop not provided.');
        toast({
          title: "Configuration Error",
          description: "Unable to start extraction due to missing configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during AI extraction:', error);
      toast({
        title: "Extraction Failed",
        description: error.message || "An error occurred during document extraction.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply extracted data to device profile
  const handleApplyData = async () => {
    if (!extractedData || !extractedData.extractedFields) {
      toast({
        title: "No Data to Apply",
        description: "There is no extracted data available to apply.",
        variant: "warning",
      });
      return;
    }

    try {
      setIsApplyingData(true);
      
      // Map extracted fields to device profile format
      const mappedData = documentIntelligenceService.mapExtractedFieldsToFormData(
        extractedData.extractedFields
      );
      
      // Call the callback to update the device profile
      if (onExtractedDataApplied) {
        await onExtractedDataApplied(mappedData);
      }
      
      setHasAppliedData(true);
      
      toast({
        title: "Data Applied",
        description: "Successfully applied extracted data to device profile.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error applying extracted data:", error);
      toast({
        title: "Application Error",
        description: "Failed to apply extracted data to device profile.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingData(false);
    }
  };

  // Document types for different regulatory contexts
  const getDocumentTypesForContext = (context) => {
    switch (context) {
      case 'fda_510k':
        return [
          { value: 'prev_510k', label: 'Previous 510(k) Submission' },
          { value: 'device_description', label: 'Device Description' },
          { value: 'test_report_bench', label: 'Test Report (Bench)' },
          { value: 'test_report_animal', label: 'Test Report (Animal)' },
          { value: 'test_report_clinical', label: 'Test Report (Clinical)' },
          { value: 'labeling', label: 'Labeling/IFU (FDA)' },
        ];
      case 'eu_mdr_td':
        return [
          { value: 'cep', label: 'Clinical Evaluation Plan (CEP)' },
          { value: 'cer', label: 'Clinical Evaluation Report (CER)' },
          { value: 'sscp', label: 'Summary of Safety and Clinical Performance' },
          { value: 'pms', label: 'Post-Market Surveillance Plan/Report' },
          { value: 'pmcf', label: 'Post-Market Clinical Follow-up' },
          { value: 'psur', label: 'Periodic Safety Update Report' },
          { value: 'tech_doc', label: 'Technical Documentation (MDR/IVDR)' },
          { value: 'doc', label: 'Declaration of Conformity' },
          { value: 'ifu', label: 'Instructions for Use (EU)' },
          { value: 'risk', label: 'Risk Management File' },
        ];
      case 'general_reg':
      default:
        return [
          { value: 'qms_doc', label: 'QMS Document' },
          { value: 'dhf', label: 'Design History File Excerpt' },
          { value: 'tech_data', label: 'Technical Data Sheet' },
          { value: 'literature', label: 'Published Literature' },
          { value: 'other', label: 'Other Regulatory Document'}
        ];
    }
  };

  // Regulatory context options
  const regulatoryContextOptions = [
    { value: 'fda_510k', label: 'FDA 510(k) Related' },
    { value: 'eu_mdr_td', label: 'EU MDR Technical Documentation' },
    { value: 'eu_ivdr', label: 'EU IVDR Performance Evaluation' },
    { value: 'health_canada', label: 'Health Canada Submission' },
    { value: 'general_reg', label: 'General Regulatory Document' }
  ];

  // Render extraction history
  const renderExtractionHistory = () => {
    if (extractionHistory.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No document extraction history available</p>
          <p className="text-sm mt-1">Complete an extraction to see history</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {extractionHistory.map(entry => (
          <Card key={entry.id} className="overflow-hidden border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  Document Extraction
                </CardTitle>
                <div className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.documentTypes.map((type, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <div className="flex justify-between text-sm">
                <div>Fields Extracted: <span className="font-medium">{entry.fieldCount}</span></div>
                <div>
                  Confidence: 
                  <span className={`ml-1 font-medium ${
                    entry.confidence >= 0.8 ? 'text-green-600' : 
                    entry.confidence >= 0.6 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {Math.round(entry.confidence * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render extracted data review
  const renderDataReview = () => {
    if (!extractedData || !extractedData.extractedFields) {
      return (
        <div className="text-center p-8 text-gray-500 border border-dashed rounded-md">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No extracted data available for review</p>
          <p className="text-sm mt-1">Complete an extraction to see results</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setActiveTab('extract_config')}
          >
            Go to Extraction Configuration
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Extracted Data Review</h3>
            <p className="text-sm text-gray-600">
              Review and apply extracted data to your device profile
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={hasAppliedData ? "outline" : "default"}
              onClick={handleApplyData}
              disabled={isApplyingData || !extractedData}
              className={hasAppliedData ? "border-green-200 text-green-700" : ""}
            >
              {isApplyingData ? (
                <>
                  <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : hasAppliedData ? (
                <>
                  <CheckCircle className="mr-1.5 h-4 w-4" />
                  Applied
                </>
              ) : (
                "Apply to Device Profile"
              )}
            </Button>
          </div>
        </div>
        
        <Card className="border border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md">Document Analysis Summary</CardTitle>
              <Badge variant="outline" className={`
                px-2 py-1 ${
                  extractedData.overallConfidence >= 0.8 ? 'border-green-200 text-green-700 bg-green-50' : 
                  extractedData.overallConfidence >= 0.6 ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                  'border-red-200 text-red-700 bg-red-50'
                }
              `}>
                {extractedData.overallConfidence >= 0.8 ? (
                  <>
                    <CheckCircle className="inline mr-1 h-3 w-3" />
                    High Confidence
                  </>
                ) : extractedData.overallConfidence >= 0.6 ? (
                  'Medium Confidence'
                ) : (
                  <>
                    <AlertCircle className="inline mr-1 h-3 w-3" />
                    Low Confidence
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-700">Document Type</div>
                <div className="font-medium">
                  {extractedData.documentTypes?.map((type, i) => (
                    <Badge key={i} variant="outline" className="mr-1 mt-1">
                      {type}
                    </Badge>
                  )) || 'Unknown'}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-700">Detected Fields</div>
                <div className="font-medium">{extractedData.extractedFields?.length || 0} fields</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-700">Overall Confidence</div>
                <div className="font-medium">
                  {Math.round((extractedData.overallConfidence || 0) * 100)}%
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Extracted Fields</h4>
              <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                {!extractedData.extractedFields || extractedData.extractedFields.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No fields were extracted from the document
                  </div>
                ) : (
                  extractedData.extractedFields.map((field, index) => (
                    <div key={index} className="p-3 flex justify-between hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-sm text-gray-600 truncate max-w-[300px]">
                          {field.value}
                        </div>
                      </div>
                      <Badge variant="outline" className={`
                        h-fit ${
                          field.confidence >= 0.8 ? 'border-green-200 text-green-700 bg-green-50' : 
                          field.confidence >= 0.6 ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                          'border-red-200 text-red-700 bg-red-50'
                        }
                      `}>
                        {Math.round(field.confidence * 100)}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="document-intake-panel">
      <Card className="border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-blue-800 flex items-center">
            <Layers className="mr-2 h-5 w-5 text-blue-700" />
            Document Intelligence
          </CardTitle>
          <CardDescription>
            Analyze device documentation and extract structured data to accelerate your regulatory submission
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="extract_config" className="flex items-center">
                <Upload className="mr-1.5 h-4 w-4" />
                Configure Extraction
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center">
                <FileText className="mr-1.5 h-4 w-4" />
                Data Review
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4" />
                Extraction History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="extract_config" className="mt-0 p-0">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="regulatoryContext" className="mb-1 block">
                    Primary Regulatory Context for Extraction
                  </Label>
                  <Select 
                    value={selectedRegulatoryContext} 
                    onValueChange={handleRegulatoryContextChange}
                  >
                    <SelectTrigger id="regulatoryContext">
                      <SelectValue placeholder="Select regulatory context" />
                    </SelectTrigger>
                    <SelectContent>
                      {regulatoryContextOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {processedDocuments.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Processed Documents:</h4>
                    {processedDocuments.map(doc => (
                      <Card key={doc.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{doc.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Size: {(doc.size / 1024 / 1024).toFixed(2)} MB | Type: {doc.type}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3">
                          <div className="mb-3">
                            <Label htmlFor={`docType-${doc.id}`} className="mb-1 block text-xs">
                              Document Type (Optional)
                            </Label>
                            <Select 
                              value={documentSettings[doc.id] || ''} 
                              onValueChange={(value) => handleDocumentTypeChange(doc.id, value)}
                            >
                              <SelectTrigger id={`docType-${doc.id}`}>
                                <SelectValue placeholder="Auto-detect or General" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Auto-detect or General</SelectItem>
                                {getDocumentTypesForContext(selectedRegulatoryContext).map(docType => (
                                  <SelectItem key={docType.value} value={docType.value}>
                                    {docType.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {doc.ocrTextContent && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-16 overflow-y-auto">
                              <p className="font-semibold mb-1">OCR Preview:</p>
                              {doc.ocrTextContent.substring(0, 100)}...
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-600">No documents have been processed yet</p>
                    <p className="text-sm text-gray-500 mt-1">Upload documents in CERV2 document upload section</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 mb-2">Extraction Settings</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="confidenceThreshold">
                        Confidence Threshold
                      </Label>
                      <span className="text-sm font-medium">
                        {confidenceThreshold}%
                      </span>
                    </div>
                    <Slider
                      id="confidenceThreshold"
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[confidenceThreshold]}
                      onValueChange={(values) => setConfidenceThreshold(values[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher threshold requires more confident extractions
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="extractionMode" className="mb-1 block">
                      Extraction Mode
                    </Label>
                    <Select 
                      value={extractionMode} 
                      onValueChange={setExtractionMode}
                    >
                      <SelectTrigger id="extractionMode">
                        <SelectValue placeholder="Select extraction mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Document Scan</SelectItem>
                        <SelectItem value="targeted">Targeted Section Extraction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleInitiateExtraction}
                    disabled={processedDocuments.length === 0 || isExtracting}
                    className="w-full"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      "Start AI Extraction"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="review" className="mt-0 p-0">
              {renderDataReview()}
            </TabsContent>
            
            <TabsContent value="history" className="mt-0 p-0">
              {renderExtractionHistory()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentIntakePanel;