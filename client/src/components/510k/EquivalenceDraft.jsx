import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import FDA510kService from '../../services/FDA510kService';

/**
 * Substantial Equivalence Draft Component
 * 
 * This component provides AI-powered drafting functionality for the Substantial Equivalence
 * section of a 510(k) submission. It allows users to generate a draft, edit it, and add
 * it to their 510(k) report.
 * 
 * @param {Object} props Component properties
 * @param {string} props.projectId The ID of the current 510(k) project
 * @param {Function} props.onAddToReport Callback when draft is added to report, receives text as parameter
 */
const EquivalenceDraft = ({ projectId, onAddToReport }) => {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { tenantId } = useTenant();

  const handleDraft = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the service to generate the draft
      const response = await FDA510kService.draftEquivalence(projectId);
      setDraft(response.draftText);
      
      toast({
        title: "Draft generated",
        description: "Substantial Equivalence draft has been generated successfully.",
      });
    } catch (err) {
      console.error('Error generating Substantial Equivalence draft:', err);
      setError('Unable to generate draft. Please ensure your device profile and predicate device information are complete.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToReport = () => {
    if (draft && onAddToReport) {
      onAddToReport(draft);
      toast({
        title: "Added to report",
        description: "Substantial Equivalence section has been added to your 510(k) report.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Substantial Equivalence Draft</CardTitle>
        <CardDescription>
          Generate a first-draft Substantial Equivalence section comparing your device to its predicate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!draft ? (
          <div className="p-6 border rounded-lg bg-muted/50 flex flex-col items-center justify-center space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Generate an AI-powered Substantial Equivalence draft based on your device profile and predicate device information.
            </p>
            <Button 
              onClick={handleDraft} 
              disabled={loading}
              className="mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                'Generate SE Draft'
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg p-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[300px] resize-y"
                placeholder="Your draft will appear here..."
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleDraft}>
                Regenerate Draft
              </Button>
              <Button 
                onClick={handleAddToReport}
                className="flex items-center"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Add to 510(k) Report
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EquivalenceDraft;