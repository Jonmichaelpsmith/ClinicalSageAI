import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ban, CheckCircle2, Loader2, FileDown } from 'lucide-react';

/**
 * INDAutomationPanel Component
 * 
 * This component provides an interface for interacting with the IND Automation API
 * to generate Module 3 (Chemistry, Manufacturing, and Controls) documents
 */
export function INDAutomationPanel() {
  const [projectId, setProjectId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  // Function to check if the IND service is available
  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/ind-automation/status');
      const data = await response.json();
      
      if (response.ok) {
        setStatusMessage({
          type: 'success',
          message: 'IND Automation service is connected and ready'
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: 'IND Automation service is not available'
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to connect to the IND Automation service'
      });
    }
  };

  // Function to generate Module 3 document
  const generateModule3 = async () => {
    if (!projectId.trim()) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter a Project ID'
      });
      return;
    }

    setIsGenerating(true);
    setDocumentUrl(null);
    setStatusMessage({
      type: 'info',
      message: 'Generating Module 3 document...'
    });

    try {
      // Using window.open to trigger file download
      const downloadUrl = `/api/ind-automation/${projectId}/module3`;
      window.open(downloadUrl, '_blank');
      
      setDocumentUrl(downloadUrl);
      setStatusMessage({
        type: 'success',
        message: 'Module 3 document generated successfully!'
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to generate Module 3 document: ' + 
          (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>IND Automation System</CardTitle>
        <CardDescription>
          Generate FDA Investigational New Drug (IND) application documents
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {statusMessage.type && (
            <Alert variant={statusMessage.type === 'error' ? 'destructive' : 'default'}>
              {statusMessage.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {statusMessage.type === 'error' && <Ban className="h-4 w-4" />}
              {statusMessage.type === 'info' && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertTitle>
                {statusMessage.type === 'success' && 'Success'}
                {statusMessage.type === 'error' && 'Error'}
                {statusMessage.type === 'info' && 'Processing'}
              </AlertTitle>
              <AlertDescription>{statusMessage.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-id">Project ID</Label>
            <Input
              id="project-id"
              placeholder="Enter project identifier"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Module 3: Chemistry, Manufacturing, and Controls</h3>
            <p className="text-sm text-muted-foreground">
              Generate a Module 3 document containing CMC information for your IND application.
            </p>
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={generateModule3}
                disabled={isGenerating || !projectId.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Module 3</>
                )}
              </Button>
              
              {documentUrl && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkServiceStatus} disabled={isGenerating}>
          Check Service Status
        </Button>
      </CardFooter>
    </Card>
  );
}

export default INDAutomationPanel;