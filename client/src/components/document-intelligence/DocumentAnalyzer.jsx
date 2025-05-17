import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, AlertTriangle, CheckCircle, RotateCw, Zap, BookOpen, Layers, Microscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Analyzer Component
 * 
 * This component handles document analysis and data extraction
 * after documents have been processed by the DocumentUploader.
 * 
 * @param {Object} props
 * @param {Array} props.processedDocuments - Array of processed document objects
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onAnalysisComplete - Callback when analysis is complete
 * @param {Function} props.onReset - Callback to reset the analysis process
 */
const DocumentAnalyzer = ({
  processedDocuments = [],
  regulatoryContext = '510k',
  onAnalysisComplete,
  onReset
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [extractionMode, setExtractionMode] = useState('comprehensive');
  const [extractedData, setExtractedData] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [selectedTab, setSelectedTab] = useState('content');
  const { toast } = useToast();

  // Select the first document when documents are loaded
  useEffect(() => {
    if (processedDocuments && processedDocuments.length > 0 && !activeDocument) {
      setActiveDocument(processedDocuments[0]);
    }
  }, [processedDocuments, activeDocument]);

  // Identify document types on component mount
  useEffect(() => {
    if (processedDocuments && processedDocuments.length > 0) {
      identifyDocumentTypes();
    }
  }, [processedDocuments]);

  // Identify the types of documents that have been uploaded
  const identifyDocumentTypes = async () => {
    try {
      setIsAnalyzing(true);
      const types = await documentIntelligenceService.identifyDocumentTypes(
        processedDocuments,
        regulatoryContext
      );
      setDocumentTypes(types);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error identifying document types:', error);
      toast({
        title: 'Error',
        description: 'Failed to identify document types.',
        variant: 'destructive',
      });
      setIsAnalyzing(false);
    }
  };

  // Start the analysis process
  const startAnalysis = async () => {
    if (processedDocuments.length === 0) {
      toast({
        title: 'No Documents',
        description: 'There are no documents to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate gradual progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);
      
      // Perform the actual analysis
      const data = await documentIntelligenceService.analyzeDocuments(
        processedDocuments,
        {
          regulatoryContext,
          extractionMode,
          validateData: true,
        },
        (progress) => {
          if (progress >= 0 && progress <= 100) {
            setAnalysisProgress(progress);
          }
        }
      );
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Set the extracted data and validation results
      setExtractedData(data);
      setValidationResults(data.validation || {
        valid: true,
        issues: [],
        warnings: []
      });
      
      // Show success message
      toast({
        title: 'Analysis Complete',
        description: 'Successfully extracted data from the documents.',
        variant: 'success',
      });
      
      // Call callback with extracted data
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (error) {
      console.error('Error analyzing documents:', error);
      
      toast({
        title: 'Analysis Failed',
        description: error.message || 'An error occurred during document analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get document type badge color based on confidence
  const getDocumentTypeBadgeColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Reset the analysis
  const handleReset = () => {
    setExtractedData(null);
    setValidationResults(null);
    setAnalysisProgress(0);
    if (onReset) {
      onReset();
    }
  };

  // Render document type identification results
  const renderDocumentTypes = () => {
    if (!documentTypes || documentTypes.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No document types identified yet.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {documentTypes.map((docType, index) => (
          <div key={index} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">{docType.filename}</h4>
                <div className="flex mt-1">
                  <Badge variant="outline" className={getDocumentTypeBadgeColor(docType.confidence)}>
                    {docType.type} ({Math.round(docType.confidence * 100)}% confidence)
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveDocument(processedDocuments.find(doc => doc.id === docType.documentId))}
              >
                View
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{docType.description}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render extracted data preview
  const renderExtractedData = () => {
    if (!extractedData) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No data extracted yet. Click the "Start Analysis" button to begin.
        </div>
      );
    }

    // Group the data for better display
    const groups = {
      'Device Information': ['deviceName', 'manufacturer', 'productCode', 'deviceClass', 'intendedUse', 'description'],
      'Regulatory Information': ['regulatoryClass', 'status', 'classification', 'riskLevel'],
      'Technical Specifications': ['technicalSpecifications', 'performance', 'standards'],
      'Clinical Data': ['clinicalEvaluation', 'clinicalStudies', 'adverseEvents'],
      'Other Information': []
    };

    // Put any fields not explicitly categorized into "Other Information"
    Object.keys(extractedData).forEach(key => {
      if (!Object.values(groups).flat().includes(key) && 
          !['validation', 'confidence', 'sourceDocuments'].includes(key)) {
        groups['Other Information'].push(key);
      }
    });

    return (
      <div className="space-y-4">
        {/* Overall confidence score */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Overall Confidence</span>
            <span className="text-sm font-medium">
              {Math.round((extractedData.confidence || 0) * 100)}%
            </span>
          </div>
          <Progress 
            value={(extractedData.confidence || 0) * 100} 
            className="h-2" 
            indicatorClassName={
              extractedData.confidence > 0.75 ? "bg-green-500" : 
              extractedData.confidence > 0.5 ? "bg-yellow-500" : 
              "bg-red-500"
            }
          />
        </div>
        
        <Separator />
        
        {/* Extracted fields by group */}
        {Object.entries(groups).map(([groupName, fields]) => {
          if (fields.length === 0) return null;
          
          return (
            <div key={groupName} className="space-y-3">
              <h3 className="text-base font-medium">{groupName}</h3>
              
              {fields.map(field => {
                if (!extractedData[field]) return null;
                
                return (
                  <div key={field} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {extractedData[`${field}Confidence`] && (
                        <Badge variant="outline" className={
                          extractedData[`${field}Confidence`] > 0.75 ? "bg-green-50 text-green-700" : 
                          extractedData[`${field}Confidence`] > 0.5 ? "bg-yellow-50 text-yellow-700" : 
                          "bg-red-50 text-red-700"
                        }>
                          {Math.round(extractedData[`${field}Confidence`] * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm p-2 bg-muted rounded-md max-h-28 overflow-auto">
                      {typeof extractedData[field] === 'object' 
                        ? JSON.stringify(extractedData[field], null, 2) 
                        : extractedData[field]}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Render validation results
  const renderValidation = () => {
    if (!validationResults) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No validation results available. Complete the analysis first.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className={`flex items-center p-3 rounded-md ${
          validationResults.valid ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          {validationResults.valid 
            ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            : <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          }
          <span className={`font-medium ${
            validationResults.valid ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {validationResults.valid 
              ? 'Data validation passed' 
              : 'Data validation found issues'
            }
          </span>
        </div>
        
        {/* Issues */}
        {validationResults.issues && validationResults.issues.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Issues</h3>
            <div className="space-y-2">
              {validationResults.issues.map((issue, index) => (
                <div key={index} className="flex p-2 bg-red-50 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-700">{issue.field}</div>
                    <div className="text-xs text-red-600">{issue.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Warnings */}
        {validationResults.warnings && validationResults.warnings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Warnings</h3>
            <div className="space-y-2">
              {validationResults.warnings.map((warning, index) => (
                <div key={index} className="flex p-2 bg-yellow-50 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-700">{warning.field}</div>
                    <div className="text-xs text-yellow-600">{warning.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* If no issues or warnings */}
        {(!validationResults.issues || validationResults.issues.length === 0) && 
         (!validationResults.warnings || validationResults.warnings.length === 0) && (
          <div className="text-center py-2 text-green-600">
            No issues or warnings detected.
          </div>
        )}
      </div>
    );
  };

  // Render document content preview
  const renderDocumentContent = () => {
    if (!activeDocument) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No document selected.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium">{activeDocument.filename}</h3>
          <Badge variant="outline">
            {activeDocument.fileType || 'Unknown type'}
          </Badge>
        </div>
        
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="text-sm font-mono whitespace-pre-wrap">
            {activeDocument.textContent || 'No text content available.'}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis</CardTitle>
          <CardDescription>
            Analyze documents to extract structured data for your regulatory submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Extraction Mode Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Extraction Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  extractionMode === 'basic' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setExtractionMode('basic')}
              >
                <FileText className="h-5 w-5 mb-1 text-blue-500" />
                <div className="font-medium text-sm">Basic</div>
                <div className="text-xs text-muted-foreground text-center">Simple extraction of key fields</div>
              </div>
              
              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  extractionMode === 'enhanced' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setExtractionMode('enhanced')}
              >
                <Zap className="h-5 w-5 mb-1 text-yellow-500" />
                <div className="font-medium text-sm">Enhanced</div>
                <div className="text-xs text-muted-foreground text-center">Deeper extraction with confidence scores</div>
              </div>
              
              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  extractionMode === 'regulatory' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setExtractionMode('regulatory')}
              >
                <BookOpen className="h-5 w-5 mb-1 text-green-500" />
                <div className="font-medium text-sm">Regulatory</div>
                <div className="text-xs text-muted-foreground text-center">Focus on regulatory compliance fields</div>
              </div>
              
              <div
                className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  extractionMode === 'comprehensive' ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setExtractionMode('comprehensive')}
              >
                <Layers className="h-5 w-5 mb-1 text-purple-500" />
                <div className="font-medium text-sm">Comprehensive</div>
                <div className="text-xs text-muted-foreground text-center">Full extraction with validation</div>
              </div>
            </div>
          </div>
          
          {/* Document Type Identification */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Document Types</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={identifyDocumentTypes}
                disabled={isAnalyzing || processedDocuments.length === 0}
              >
                <RotateCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
            </div>
            
            {renderDocumentTypes()}
          </div>
          
          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Analyzing Documents...</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
          
          {/* Document Content and Extracted Data Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Document Content
              </TabsTrigger>
              <TabsTrigger value="data" disabled={!extractedData}>
                <Microscope className="h-4 w-4 mr-2" />
                Extracted Data
              </TabsTrigger>
              <TabsTrigger value="validation" disabled={!validationResults}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              {renderDocumentContent()}
            </TabsContent>
            
            <TabsContent value="data" className="mt-4 space-y-4">
              {renderExtractedData()}
            </TabsContent>
            
            <TabsContent value="validation" className="mt-4 space-y-4">
              {renderValidation()}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isAnalyzing}
          >
            Reset
          </Button>
          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing || processedDocuments.length === 0}
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentAnalyzer;