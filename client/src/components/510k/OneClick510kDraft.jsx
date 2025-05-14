import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Check, AlertTriangle, Loader2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import SimpleTooltip from '@/components/cer/SimpleTooltip';

/**
 * OneClick510kDraft Component
 * 
 * This component provides a streamlined interface for generating a complete 510(k) draft
 * based on the current device profile and predicate comparison data.
 */
const OneClick510kDraft = ({ 
  deviceProfile,
  predicateDevices = [],
  onDownloadComplete = () => {}
}) => {
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, complete, error
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('docx');
  
  // Check if we have enough data to generate a draft
  const canGenerateDraft = deviceProfile && 
    deviceProfile.deviceName && 
    deviceProfile.manufacturer && 
    deviceProfile.deviceClass &&
    predicateDevices && 
    predicateDevices.length > 0;
  
  // Generate draft document
  const handleGenerateDraft = async (format = 'docx') => {
    setGenerationStatus('generating');
    setDownloadFormat(format);
    
    try {
      // Prepare request payload
      const payload = {
        deviceProfile,
        predicateDevices: predicateDevices.slice(0, 3), // Use top 3 predicates
        format
      };
      
      // Call API to generate document
      const response = await fetch('/api/510k/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate draft: ${response.statusText}`);
      }
      
      // For PDF/Word document
      if (format === 'pdf' || format === 'docx') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        // For JSON or other formats
        const data = await response.json();
        setDownloadUrl(data.downloadUrl);
      }
      
      setGenerationStatus('complete');
      toast({
        title: "510(k) Draft Generated",
        description: `Your ${format.toUpperCase()} draft is ready for download.`,
        variant: "success"
      });
      
      // Notify parent component
      onDownloadComplete({
        format,
        downloadUrl: downloadUrl,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error generating 510(k) draft:", error);
      setGenerationStatus('error');
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate 510(k) draft. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle direct download
  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `510k-draft-${deviceProfile.deviceName.replace(/\s+/g, '-').toLowerCase()}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Fetch FDA 510(k) requirements for the device class
  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ['fda510k', 'requirements', deviceProfile?.deviceClass],
    enabled: !!deviceProfile?.deviceClass,
    queryFn: async () => {
      const response = await fetch(`/api/fda510k/requirements/${deviceProfile.deviceClass}`);
      if (!response.ok) throw new Error('Failed to fetch requirements');
      return response.json();
    }
  });
  
  // Render status indicator
  const renderStatusIndicator = () => {
    switch (generationStatus) {
      case 'generating':
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating your draft...</span>
          </div>
        );
      case 'complete':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>Draft ready for download</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Generation failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Ready to generate</span>
          </div>
        );
    }
  };
  
  // When we don't have enough data to generate
  if (!canGenerateDraft) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            510(k) Draft Generation
          </CardTitle>
          <CardDescription>
            Additional information needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>To generate a complete 510(k) draft, please ensure you have:</p>
            <ul className="list-disc pl-5 space-y-1">
              {!deviceProfile?.deviceName && <li>Device name</li>}
              {!deviceProfile?.manufacturer && <li>Manufacturer information</li>}
              {!deviceProfile?.deviceClass && <li>Device classification</li>}
              {(!predicateDevices || predicateDevices.length === 0) && <li>At least one predicate device</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          One-Click 510(k) Draft
          <SimpleTooltip
            title="FDA-Compliant Documents" 
            content="This tool generates a complete 510(k) draft document that follows all FDA formatting and content requirements. The generated document includes predicate device comparisons and all required sections for submission."
            width="lg"
          />
        </CardTitle>
        <CardDescription>
          Generate a complete 510(k) submission draft with predicate comparisons
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-md border text-sm">
          <div className="font-medium mb-1">Draft will include:</div>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Device description and intended use</li>
            <li>Substantial equivalence comparison</li>
            <li>Performance data and testing summary</li>
            <li>Regulatory requirements compliance</li>
            {requirements && requirements.sections && (
              <li>
                {requirements.sections.slice(0, 3).map(section => section.title).join(', ')}
                {requirements.sections.length > 3 && `, and ${requirements.sections.length - 3} more...`}
              </li>
            )}
          </ul>
          
          <div className="text-xs text-slate-500 mt-2">
            Using {predicateDevices.length} predicate device{predicateDevices.length !== 1 ? 's' : ''} for comparison
          </div>
        </div>
        
        {renderStatusIndicator()}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={generationStatus === 'generating'}
            onClick={() => handleGenerateDraft('docx')}
          >
            Word Format
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            disabled={generationStatus === 'generating'}
            onClick={() => handleGenerateDraft('pdf')}
          >
            PDF Format
          </Button>
        </div>
        
        {generationStatus === 'complete' && (
          <Button 
            variant="default" 
            className="gap-1" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OneClick510kDraft;