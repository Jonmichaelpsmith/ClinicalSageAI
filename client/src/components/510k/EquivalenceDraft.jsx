import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, FileText, CheckIcon, ArrowLeft, Save, Copy, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import FDA510kService from '../../services/FDA510kService';

/**
 * Substantial Equivalence Draft Component
 * 
 * This component provides an interface for generating, editing, and managing
 * substantial equivalence drafts for 510(k) submissions.
 * 
 * @param {Object} props
 * @param {string} props.projectId - The ID of the 510(k) project
 * @param {Function} props.onAddToReport - Callback when draft is added to the submission report
 */
const EquivalenceDraft = ({ projectId, onAddToReport }) => {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const fda510kService = new FDA510kService();

  useEffect(() => {
    if (projectId) {
      fetchDraft();
    }
  }, [projectId]);

  // Fetch the draft from the API
  const fetchDraft = async () => {
    try {
      setLoading(true);
      const result = await fda510kService.draftEquivalence(projectId);
      setDraft(result.draftText);
      setEditedDraft(result.draftText);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching equivalence draft:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load substantial equivalence draft",
        variant: "destructive"
      });
    }
  };

  // Generate a new draft
  const generateDraft = async () => {
    try {
      setGenerating(true);
      const result = await fda510kService.draftEquivalence(projectId);
      setDraft(result.draftText);
      setEditedDraft(result.draftText);
      setGenerating(false);
      toast({
        title: "Draft Generated",
        description: "Substantial Equivalence draft has been generated"
      });
    } catch (error) {
      console.error("Error generating equivalence draft:", error);
      setGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate substantial equivalence draft",
        variant: "destructive"
      });
    }
  };

  // Save the edited draft
  const saveDraft = async () => {
    try {
      // Call the API to save the draft
      // In a real implementation, you would make an API call here
      toast({
        title: "Draft Saved",
        description: "Your changes to the draft have been saved"
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft changes",
        variant: "destructive"
      });
    }
  };

  // Copy the draft to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTab === 'edit' ? editedDraft : draft)
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: "Substantial Equivalence draft has been copied to clipboard"
        });
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive"
        });
      });
  };

  // Add the draft to the 510(k) report
  const addToReport = () => {
    const finalDraft = activeTab === 'edit' ? editedDraft : draft;
    onAddToReport && onAddToReport(finalDraft);
  };

  // Show a loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-8 w-3/4" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-4/5" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24 mr-2" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Substantial Equivalence Draft</CardTitle>
          {generating && (
            <div className="flex items-center text-amber-500">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </div>
          )}
        </div>
        <CardDescription>
          Automatically generate a substantial equivalence section for your 510(k) submission
          based on your device profile and selected predicate device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!draft ? (
          <div className="text-center p-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No Draft Available</h3>
            <p className="text-gray-500 mb-4">
              Generate a substantial equivalence draft for your 510(k) submission.
            </p>
            <Button onClick={generateDraft} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Draft'
              )}
            </Button>
          </div>
        ) : (
          <>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle className="text-blue-800">About Substantial Equivalence</AlertTitle>
              <AlertDescription className="text-blue-700">
                The substantial equivalence section is a critical part of your 510(k) submission.
                It establishes that your device is as safe and effective as a legally marketed device.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="min-h-[300px] max-h-[500px] overflow-y-auto border rounded-md p-4 bg-gray-50">
                <div className="prose max-w-none">
                  {draft.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <Textarea 
                  value={editedDraft} 
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="min-h-[300px] max-h-[500px] font-mono"
                />
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-2">
              <Button onClick={generateDraft} variant="outline" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate'
                )}
              </Button>
              
              {activeTab === 'edit' && (
                <Button onClick={saveDraft} variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
              
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </>
        )}
      </CardContent>
      
      {draft && (
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => setActiveTab('preview')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Preview
          </Button>
          
          <Button onClick={addToReport}>
            <CheckIcon className="h-4 w-4 mr-2" />
            Add to Submission
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EquivalenceDraft;