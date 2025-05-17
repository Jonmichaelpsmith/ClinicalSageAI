import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, FileCheck, AlertCircle, Clipboard, Check } from 'lucide-react';
import { documentIntelligenceService } from '@/services/DocumentIntelligenceService';

const DocumentIntakePanel = ({ processedDocuments, onExtractedData, onBack, regulatoryContext = '510k' }) => {
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState('device-001'); // Static placeholder device ID
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  // Documents categorized by type
  const documentsByType = processedDocuments.reduce((acc, doc) => {
    if (!acc[doc.recognizedType]) {
      acc[doc.recognizedType] = [];
    }
    acc[doc.recognizedType].push(doc);
    return acc;
  }, {});

  // Extract data from the processed documents
  const extractDocumentData = async () => {
    if (extracting) return;

    setExtracting(true);
    setExtractionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          const newProgress = prev + (100 - prev) * 0.1;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);

      // Extract data from documents
      const response = await documentIntelligenceService.extractDocumentData({
        documents: processedDocuments,
        regulatoryContext,
        extractionMode: 'comprehensive'
      });

      clearInterval(progressInterval);
      setExtractionProgress(100);

      // Set extracted data
      setExtractedData(response.extractedData);

      // Notify success
      toast({
        title: "Data Extracted Successfully",
        description: `Found ${Object.keys(response.extractedData).length} data points with ${(response.confidence * 100).toFixed(0)}% confidence.`,
      });

      // Pass the extracted data to parent component if needed
      if (onExtractedData) {
        onExtractedData(response.extractedData);
      }
    } catch (error) {
      console.error('Error extracting document data:', error);
      toast({
        title: "Extraction Failed",
        description: error.message || "Failed to extract data from documents. Please try again.",
        variant: "destructive",
      });
      setExtractionProgress(0);
    } finally {
      setExtracting(false);
    }
  };

  // Apply extracted data to a device profile
  const applyDataToDevice = async () => {
    if (applying || !extractedData) return;

    setApplying(true);

    try {
      const response = await documentIntelligenceService.applyDataToDeviceProfile(
        selectedDeviceId,
        extractedData
      );

      // Notify success
      toast({
        title: "Data Applied Successfully",
        description: `Updated ${response.updatedFields.length} fields in the device profile.`,
      });
    } catch (error) {
      console.error('Error applying data to device profile:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply data to device profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  // Copy extracted data to clipboard
  const copyToClipboard = () => {
    if (!extractedData) return;
    
    const dataStr = JSON.stringify(extractedData, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Extracted data copied to clipboard.",
      });
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy data to clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recognized Documents ({processedDocuments.length})</h3>
              
              {Object.entries(documentsByType).map(([type, docs]) => (
                <div key={type} className="space-y-2">
                  <h4 className="text-md font-medium flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    {type} ({docs.length})
                  </h4>
                  <div className="pl-6 space-y-1">
                    {docs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{doc.name}</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ({doc.pageCount} pages)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {extracting && (
              <div className="mt-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Extracting data...</span>
                  <span>{Math.round(extractionProgress)}%</span>
                </div>
                <Progress value={extractionProgress} max={100} />
              </div>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={onBack}
                disabled={extracting}
              >
                Back
              </Button>
              <Button 
                onClick={extractDocumentData} 
                disabled={extracting || processedDocuments.length === 0}
              >
                {extracting ? 'Extracting...' : 'Extract Data'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Extracted Data</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                <Clipboard className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="text-sm font-medium text-gray-500">{key}</div>
                    <div className="p-2 border rounded-md bg-gray-50">{value}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Apply to Device Profile</h3>
                <div className="flex justify-end gap-2">
                  <Button 
                    onClick={applyDataToDevice} 
                    disabled={applying || !extractedData}
                  >
                    {applying ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></span>
                        Applying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Apply Data to Device
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentIntakePanel;