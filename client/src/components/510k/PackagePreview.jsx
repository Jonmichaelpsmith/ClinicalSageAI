import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, AlertCircle, CheckCircle2, Package, Send } from 'lucide-react';
import FDA510kService from '../../services/FDA510kService';

/**
 * PackagePreview component for visualizing and building eSTAR packages
 * 
 * This component allows users to:
 * 1. Preview the contents of their eSTAR package
 * 2. Build and download the complete package
 * 3. View AI-powered compliance report
 * 4. Verify digital signature
 */
const PackagePreview = ({ projectId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [buildInProgress, setBuildInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadPackagePreview();
    }
  }, [projectId]);

  const loadPackagePreview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await FDA510kService.buildAndPreview(projectId);
      setPackageData(data);
    } catch (err) {
      console.error('Error loading package preview:', err);
      setError('Failed to load package preview. Please ensure your submission is complete.');
      toast({
        variant: 'destructive',
        title: 'Error loading package preview',
        description: 'There was a problem loading the eSTAR package preview.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buildAndDownload = async (autoUpload = false) => {
    try {
      setBuildInProgress(true);
      
      toast({
        title: 'Building eSTAR package',
        description: 'Please wait while we assemble your submission package.'
      });
      
      const result = await FDA510kService.buildAndDownload(projectId, {
        includeCoverLetter: true,
        autoUpload
      });
      
      if (result.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `eSTAR-${projectId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'eSTAR package ready',
          description: 'Your package has been built and downloaded successfully.'
        });
      } else if (result.esgStatus) {
        toast({
          title: 'eSTAR package submitted',
          description: `Your package has been uploaded to FDA ESG. Status: ${result.esgStatus.status}`
        });
      }
    } catch (err) {
      console.error('Error building package:', err);
      toast({
        variant: 'destructive',
        title: 'Error building package',
        description: 'There was a problem building the eSTAR package.'
      });
    } finally {
      setBuildInProgress(false);
    }
  };

  const verifySignature = async () => {
    try {
      setIsLoading(true);
      const result = await FDA510kService.verifyDigitalSignature(projectId);
      setVerificationStatus(result);
      
      toast({
        title: result.valid ? 'Signature valid' : 'Signature invalid',
        description: result.message,
        variant: result.valid ? 'default' : 'destructive'
      });
    } catch (err) {
      console.error('Error verifying signature:', err);
      toast({
        variant: 'destructive',
        title: 'Verification error',
        description: 'Failed to verify digital signature'
      });
      setVerificationStatus({
        valid: false,
        message: 'Failed to verify digital signature'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreview = () => {
    loadPackagePreview();
  };

  // Render loading state
  if (isLoading && !packageData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>eSTAR Package Preview</CardTitle>
          <CardDescription>Preparing your eSTAR package preview...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>eSTAR Package Preview</CardTitle>
          <CardDescription>There was a problem preparing your eSTAR package</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={refreshPreview}>Try Again</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>eSTAR Package Assembly</CardTitle>
              <CardDescription>
                Preview and build your 510(k) submission eSTAR package
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={refreshPreview}
                disabled={isLoading}
              >
                Refresh
              </Button>
              <Button
                onClick={verifySignature}
                variant="outline"
                disabled={isLoading || !packageData}
              >
                Verify Signature
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {packageData ? (
            <div className="space-y-6">
              {/* Package overview */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Package Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{packageData.fileCount || packageData.files?.length || 0}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                    <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Compliance status */}
              {packageData.complianceReport && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Compliance Status</h3>
                  </div>
                  <Alert variant={packageData.complianceReport.status === 'PASS' ? 'default' : 'destructive'}>
                    <AlertTitle>
                      {packageData.complianceReport.status === 'PASS' 
                        ? 'Package Ready for Submission' 
                        : 'Package Requires Attention'}
                    </AlertTitle>
                    <AlertDescription>
                      {packageData.complianceReport.message}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Verification status */}
              {verificationStatus && (
                <Alert variant={verificationStatus.valid ? 'default' : 'destructive'}>
                  <AlertTitle>
                    {verificationStatus.valid 
                      ? 'Digital Signature Verified' 
                      : 'Digital Signature Invalid'}
                  </AlertTitle>
                  <AlertDescription>
                    {verificationStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Package contents */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Package Contents</h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {packageData.files?.map((file, index) => (
                    <AccordionItem value={`file-${index}`} key={`file-${index}`}>
                      <AccordionTrigger className="hover:bg-muted/50 px-3 rounded-md">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{file.name || file.path.split('/').pop()}</span>
                          {file.section && (
                            <Badge variant="outline" className="ml-2">
                              {file.section}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3">
                        <div className="space-y-2 py-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Path:</span> {file.path}
                          </p>
                          {file.size && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Size:</span> {file.size}
                            </p>
                          )}
                          {file.description && (
                            <p className="text-sm mt-2">{file.description}</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No package preview available</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => buildAndDownload(false)}
            disabled={buildInProgress || isLoading || !packageData}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Package
          </Button>
          <Button 
            onClick={() => buildAndDownload(true)}
            disabled={buildInProgress || isLoading || !packageData}
          >
            <Send className="h-4 w-4 mr-2" />
            Build & Submit to FDA
          </Button>
        </CardFooter>
      </Card>

      {packageData?.complianceReport && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>AI Compliance Report</CardTitle>
            <CardDescription>
              Automated validation of your submission package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>AI-Generated Report</AlertTitle>
                <AlertDescription>
                  This report was generated using AI to analyze your submission package.
                  It is provided as guidance and does not guarantee FDA acceptance.
                </AlertDescription>
              </Alert>
              
              <div className="rounded-lg border p-4 whitespace-pre-wrap text-sm">
                {packageData.complianceReport.details}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackagePreview;