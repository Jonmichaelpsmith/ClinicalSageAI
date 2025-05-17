import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FileSearch, AlertTriangle, Info, CheckCircle, Database, Search } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';
import { useToast } from '@/hooks/use-toast';

/**
 * Document Analyzer Component
 * 
 * This component analyzes processed documents and extracts structured data
 * from them based on the selected regulatory context.
 * 
 * @param {Object} props
 * @param {Array} props.processedDocuments - The array of processed documents
 * @param {string} props.regulatoryContext - The regulatory context (510k, cer, etc.)
 * @param {Function} props.onDataExtracted - Callback for when data is extracted
 * @param {string} props.extractionMode - The extraction mode to use
 */
const DocumentAnalyzer = ({
  processedDocuments = [],
  regulatoryContext = '510k',
  onDataExtracted,
  extractionMode = 'comprehensive'
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [processingStages, setProcessingStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(0);
  const { toast } = useToast();

  // Fetch processing stages on mount
  useEffect(() => {
    const fetchProcessingStages = async () => {
      try {
        const stages = await documentIntelligenceService.getProcessingStages();
        setProcessingStages(stages);
      } catch (error) {
        console.error('Error fetching processing stages:', error);
      }
    };

    fetchProcessingStages();
  }, []);

  // Start document analysis
  const handleAnalyzeDocuments = async () => {
    if (processedDocuments.length === 0) {
      setAnalyzeError('No documents available for analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    setAnalyzeError(null);
    setCurrentStage(0);

    try {
      // Simulate the progress of each stage (in a real implementation, this would come from the backend)
      const timer = setInterval(() => {
        setAnalyzeProgress((prevProgress) => {
          const newProgress = prevProgress + 1;
          
          // Update current stage based on progress
          if (processingStages.length > 0) {
            const stageSize = 100 / processingStages.length;
            const newStage = Math.min(
              Math.floor(newProgress / stageSize),
              processingStages.length - 1
            );
            
            if (newStage !== currentStage) {
              setCurrentStage(newStage);
              
              // Show toast for stage transition
              toast({
                title: `Stage ${newStage + 1}: ${processingStages[newStage].name}`,
                description: processingStages[newStage].description,
                variant: 'default',
              });
            }
          }
          
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);

      // Extract data from documents
      const data = await documentIntelligenceService.extractData(
        processedDocuments,
        regulatoryContext,
        extractionMode
      );

      clearInterval(timer);
      setAnalyzeProgress(100);
      setExtractedData(data);

      // Call the callback with extracted data
      if (onDataExtracted) {
        onDataExtracted(data);
      }

      // Show success toast
      toast({
        title: 'Analysis Complete',
        description: 'Successfully extracted and structured document data.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error analyzing documents:', error);
      setAnalyzeError(error.message || 'An error occurred during document analysis.');
      
      // Show error toast
      toast({
        title: 'Analysis Failed',
        description: error.message || 'An error occurred during document analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select a document to view details
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };

  // Calculate document confidence score (0-100)
  const getDocumentConfidence = (document) => {
    if (!document || !document.confidenceScore) return 0;
    return Math.round(document.confidenceScore * 100);
  };

  // Get badge variant based on confidence score
  const getConfidenceBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'default';
    if (score >= 40) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis</CardTitle>
          <CardDescription>
            Analyze and extract structured data from your regulatory documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document List */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Documents to Analyze ({processedDocuments.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {processedDocuments.map((doc, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer hover:bg-accent/20 transition-colors ${
                    selectedDocument === doc ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectDocument(doc)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-medium truncate">{doc.filename || `Document ${index + 1}`}</h4>
                        <p className="text-xs text-muted-foreground">
                          {doc.documentType || 'Unknown document type'}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge variant={getConfidenceBadgeVariant(getDocumentConfidence(doc))}>
                            {getDocumentConfidence(doc)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Document Details */}
          {selectedDocument && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{selectedDocument.filename || 'Document Details'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="metadata">
                  <TabsList className="mb-4">
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="content">Content Summary</TabsTrigger>
                    <TabsTrigger value="sections">Detected Sections</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metadata" className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Document Type</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDocument.documentType || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Page Count</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDocument.pageCount || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">File Size</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDocument.fileSize
                            ? `${(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence Score</p>
                        <p className="text-xs text-muted-foreground">
                          {getDocumentConfidence(selectedDocument)}%
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content">
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedDocument.summary || 'No summary available for this document.'}
                    </p>
                    
                    {selectedDocument.keywords && selectedDocument.keywords.length > 0 && (
                      <>
                        <p className="text-sm font-medium mt-4 mb-2">Key Terms</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedDocument.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sections">
                    {selectedDocument.sections && selectedDocument.sections.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedDocument.sections.map((section, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{section.title || `Section ${idx + 1}`}</span>
                            {section.confidence && (
                              <Badge variant="outline" className="ml-2">
                                {Math.round(section.confidence * 100)}%
                              </Badge>
                            )}
                            {section.summary && (
                              <p className="text-xs text-muted-foreground mt-1">{section.summary}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No sections detected in this document.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentStage < processingStages.length
                    ? `Stage ${currentStage + 1}: ${processingStages[currentStage]?.name || 'Processing'}`
                    : 'Finalizing'}
                </span>
                <span className="text-sm">{analyzeProgress}%</span>
              </div>
              <Progress value={analyzeProgress} />
              {currentStage < processingStages.length && (
                <p className="text-xs text-muted-foreground">
                  {processingStages[currentStage]?.description || 'Processing documents...'}
                </p>
              )}
            </div>
          )}

          {/* Analysis Error */}
          {analyzeError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{analyzeError}</AlertDescription>
            </Alert>
          )}

          {/* Analysis Success */}
          {extractedData && !isAnalyzing && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Analysis Complete</AlertTitle>
              <AlertDescription className="text-green-700">
                Successfully extracted data from {processedDocuments.length} document(s).
                Proceed to the next step to review the extracted data.
              </AlertDescription>
            </Alert>
          )}

          {/* Extract Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAnalyzeDocuments}
              disabled={isAnalyzing || processedDocuments.length === 0 || !!extractedData}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? 'Analyzing...' : extractedData ? 'Analysis Complete' : 'Start Analysis'}
              {!isAnalyzing && !extractedData && <Search className="h-4 w-4" />}
              {!isAnalyzing && extractedData && <CheckCircle className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalyzer;