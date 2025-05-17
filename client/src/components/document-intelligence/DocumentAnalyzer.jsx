import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, FileText, CheckCircle2, RotateCw, Microscope, Layers, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

/**
 * Document Analyzer Component
 * 
 * This component allows the user to analyze processed documents
 * and extract structured data from them.
 * 
 * @param {Object} props
 * @param {Array} props.processedDocuments - The processed documents to analyze
 * @param {Array} props.documentTypes - The identified document types
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onAnalysisComplete - Callback for when analysis is complete
 */
const DocumentAnalyzer = ({
  processedDocuments = [],
  documentTypes = [],
  regulatoryContext = '510k',
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionMode, setExtractionMode] = useState('basic');
  const [validateData, setValidateData] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const { toast } = useToast();

  // Start the analysis process
  const handleStartAnalysis = async () => {
    if (processedDocuments.length === 0) {
      toast({
        title: 'No Documents to Analyze',
        description: 'Please upload and process documents before starting analysis.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setExtractedData(null);

    try {
      // Call the document intelligence service to analyze the documents
      const data = await documentIntelligenceService.analyzeDocuments(
        processedDocuments,
        {
          regulatoryContext,
          extractionMode,
          validateData
        },
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      // Update state with the extracted data
      setExtractedData(data);

      // Switch to results tab
      setActiveTab('results');

      // Notify parent component that analysis is complete
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed ${processedDocuments.length} document(s).`,
        variant: 'success',
      });
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

  // Get document confidence level class
  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get extraction mode description
  const getExtractionModeDescription = (mode) => {
    const descriptions = {
      basic: 'Extract essential device information and basic details only.',
      enhanced: 'Extract device information with additional technical details and specifications.',
      regulatory: 'Focus on regulatory-specific information and compliance details.',
      comprehensive: 'Extract all available information including technical, regulatory, and clinical details.'
    };
    
    return descriptions[mode] || 'Custom extraction mode.';
  };

  // Render document cards
  const renderDocumentCards = () => {
    return processedDocuments.map((doc, index) => {
      // Find document type information
      const typeInfo = documentTypes.find(type => type.documentId === doc.id) || {
        type: 'Unknown',
        confidence: 0.5
      };
      
      return (
        <Card key={doc.id} className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center text-base font-medium">
              <FileText className="h-5 w-5 mr-2" />
              {doc.filename}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>{doc.fileType}, {doc.pages} pages</span>
              <Badge variant="outline" className={getConfidenceClass(typeInfo.confidence)}>
                {typeInfo.type}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto bg-muted/30 p-3 rounded-md">
              <p className="whitespace-pre-line">
                {doc.textContent ? doc.textContent.substring(0, 300) + '...' : 'No text content available.'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  // Render analysis settings
  const renderAnalysisSettings = () => {
    return (
      <div className="space-y-6">
        {/* Extraction Mode */}
        <div className="space-y-2">
          <Label htmlFor="extraction-mode">Extraction Mode</Label>
          <Select
            value={extractionMode}
            onValueChange={setExtractionMode}
            disabled={isAnalyzing}
          >
            <SelectTrigger id="extraction-mode">
              <SelectValue placeholder="Select extraction mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="enhanced">Enhanced</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getExtractionModeDescription(extractionMode)}
          </p>
        </div>

        {/* Validation Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="validate-data"
            checked={validateData}
            onCheckedChange={setValidateData}
            disabled={isAnalyzing}
          />
          <Label htmlFor="validate-data">Validate Extracted Data</Label>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Validation performs additional checks on extracted data to ensure completeness and consistency.
        </div>
      </div>
    );
  };

  // Render analysis results
  const renderAnalysisResults = () => {
    if (!extractedData) {
      return (
        <div className="text-center py-8">
          <div className="mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Analysis Results</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            No analysis results are available. Please complete the document analysis process first.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Confidence:</span>
          <Badge 
            variant="outline" 
            className={getConfidenceClass(extractedData.confidence)}
          >
            {Math.round(extractedData.confidence * 100)}%
          </Badge>
        </div>

        {/* Validation Issues */}
        {extractedData.validation && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Validation Results:</h3>
            
            {extractedData.validation.valid ? (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>All validation checks passed</span>
              </div>
            ) : (
              <div>
                {extractedData.validation.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-red-600">Issues:</span>
                    <ul className="text-xs space-y-1">
                      {extractedData.validation.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-3 w-3 text-red-600 mr-1 mt-0.5" />
                          <span>{issue.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {extractedData.validation.warnings.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <span className="text-xs font-medium text-yellow-600">Warnings:</span>
                    <ul className="text-xs space-y-1">
                      {extractedData.validation.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-3 w-3 text-yellow-600 mr-1 mt-0.5" />
                          <span>{warning.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Extracted Data */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Extracted Data:</h3>
          
          <div className="bg-muted/30 p-3 rounded-md max-h-60 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(extractedData).filter(([key]) => 
                    !key.endsWith('Confidence') && 
                    key !== 'validation' && 
                    key !== 'sourceDocuments'
                  )
                ), 
                null, 
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Microscope className="h-5 w-5 mr-2" />
            Document Analysis
          </CardTitle>
          <CardDescription>
            Analyze documents to extract structured data for your device profile.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!extractedData && !isAnalyzing}>
                <Layers className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Document List</h3>
                  {processedDocuments.length > 0 ? (
                    renderDocumentCards()
                  ) : (
                    <div className="text-center py-4 bg-muted/30 rounded-md">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No documents available for analysis.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Analysis Settings</h3>
                  {renderAnalysisSettings()}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="pt-4">
              {renderAnalysisResults()}
            </TabsContent>
          </Tabs>
          
          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Analyzing documents...</span>
                <span className="text-sm text-muted-foreground">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {analysisProgress < 25 ? 'Initializing analysis...' :
                 analysisProgress < 50 ? 'Processing document content...' :
                 analysisProgress < 75 ? 'Extracting structured data...' :
                 analysisProgress < 100 ? 'Validating and finalizing results...' :
                 'Complete!'}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-1" />
            {regulatoryContext === '510k' ? 'FDA 510(k) Context' : 'CER Context'}
          </div>
          
          <Button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || processedDocuments.length === 0}
          >
            {isAnalyzing ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Start Analysis</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentAnalyzer;